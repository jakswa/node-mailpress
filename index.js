var nodemailer = require("nodemailer");
var config = require("config");
var mustache = require("mustache");
var _ = require('underscore');
var q = require('q');

var fs = require('fs');
var path = require('path');

module.exports = function (opts) {
  "use strict";

  var conf = config.mailer;
  var transport = nodemailer.createTransport(conf.transport, conf.transportOpts);

  // assuming by default you'll name your templates the same as the mailer,
  // just with different extensions (".html.blah.blah") (mustache only atm)
  var parentFile = path.basename(module.parent.filename);
  var rootDir = path.dirname(require.main && require.main.filename);
  var defaults = this.defaults = {
    // can be overridden in node-config, or mailer creation options
    templateDir: path.join('server', 'views', 'mail'),
    templateBaseName: parentFile.split('.')[0],
    templateExtensions: {html: '.html', text: '.txt'},
    templates: {html: null, text: null}
  };
  _.extend(defaults, conf, opts); // user can override all the above

  // populate templates if not provided inline
  var templatesLoaded = q.all(_.map(defaults.templateExtensions, function(fileExt, version) {
    if (defaults.templates[version] || defaults[version]) {
      return q.when(); // assume user provided their own template to render
    }
    var templatePromise = q.defer();
    var fileName = defaults.templateBaseName + fileExt;
    var filePath = path.resolve(rootDir, defaults.templateDir, fileName);
    fs.readFile(filePath, function(err, data) {
      if (err) {
        // they need to provide a text/html template! or else! (...or do they?)
        templatePromise.reject(new Error("Error loading " + version + " template: " + err));
        return;
      }
      defaults.templates[version] = data.toString();
      templatePromise.resolve();
    });
    return templatePromise.promise;
  }));

  this.sendMail = function(locals, mailOpts) {
    templatesLoaded.then(function() {
      var conf = _.extend({}, defaults, mailOpts);

      // for each of the templates defined above (html, text, or both),
      // render the template using the locals provided
      _.each(defaults.templateExtensions, function(fileExt, version) {
        if (defaults.templates[version] && !conf[version]) {
          conf[version] = mustache.render(defaults.templates[version], locals);
        } else if (!conf[version]) {
          // throw error because they have a templateExtension but no data for it
          throw new Error("Attempted to send email without {" + version + "} content.");
        }
      });

      mailOpts = _.pick(conf, 'to', 'from', 'subject', 'replyTo', 'html', 'text');
      transport.sendMail(mailOpts, function(err) {
        if (err) {
          console.log('Mail error: ', err);
        }
      });
    }).done();
  };
};
