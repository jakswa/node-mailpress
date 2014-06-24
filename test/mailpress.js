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
      it('should have no templates', function() {
        assert(typeof badmailer.templates === 'undefined');
      });
    });
    describe('With two example mailers', function() {
      var test1, test2;
      before(function(done) {
        test1 = require('./mailers/test1');
        test2 = require('./mailers/test2');
        done();
      });
      it('should show them having correct base names', function() {
        assert(test1.defaults.templateBaseName === 'test1');
        assert(test2.defaults.templateBaseName === 'test2');
      });
      it('should show them having different base names', function() {
        assert(test1.defaults.templateBaseName !== test2.defaults.templateBaseName);
      });
    });
});
