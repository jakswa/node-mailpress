var nodemailer = require("nodemailer");
var config = require("config");
var mustache = require("mustache");
var _ = require('underscore');
var Promise = require('bluebird');
var fs = require('fs');
var stackTrace = require('stack-trace');
var path = require('path');

var nodeMailerOpts = [
  'to', 'from', 'subject', 'replyTo', 'html', 'text', 'dsn',
  'cc', 'bcc', 'inReplyTo', 'references', 'headers', 'attachments',
  'alternatives', 'envelope', 'messageId', 'date', 'encoding', 'charset'
];

module.exports = function (opts) {
  "use strict";

  var conf = config.mailer || {};
  var transport = nodemailer.createTransport(conf.transport, conf.transportOpts);

  // assuming by default you'll give your templates the same base name as the mailer
  this.parentFilePath = stackTrace.get()[1].getFileName();
  var parentFile = path.basename(this.parentFilePath);
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
  var templatesLoaded = Promise.all(_.map(defaults.templateExtensions, function(fileExt, version) {
    if (defaults.templates[version] || defaults[version]) {
      return true; // assume user provided their own template to render
    }
    var fileName = defaults.templateBaseName + fileExt;
    var filePath = path.resolve(rootDir, defaults.templateDir, fileName);
    return Promise.promisify(fs.readFile)(filePath)
    .then(function(data){
      defaults.templates[version] = data.toString();
    }, function(err){
      // they need to provide a text/html template! or else! (...or do they?)
      templatePromise.reject("Error loading " + version + " template: " + err);
    });
  }));

  this.sendMail = function(locals, mailOpts) {
    return templatesLoaded.then(function() {
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

      mailOpts = _.pick(conf, nodeMailerOpts);
      return Promise.promisify(transport.sendMail)(mailOpts);
    });
  };
};
