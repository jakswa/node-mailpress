var assert = require('assert');
var sinon = require('sinon');
var path = require('path');
var Mailpress = require('./../index');

describe('Mailpress', function() {
    describe('with no base configs', function() {
      var badmailer;
      before(function(done) {
        badmailer = new Mailpress({templateExtensions: {}});
        done();
      });
      it('should not work', function(done) {
        var spy = sinon.spy();
        badmailer.sendMail().catch(spy).lastly(function() {
          assert(spy.called);
          done();
        });
      });
      it('should have basename of current file', function(done) {
        var basename = path.basename(__filename).split('.')[0];
        var config = badmailer.defaults.templateBaseName;
        assert(config === basename, config);
        done();
      });
    });
});
