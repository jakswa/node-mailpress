node-mailpress
==============

Wiring up of node-mailer to templates. By default, this package assumes you have a certain directory structure, but such assumptions can be overridden, since node projects vary widely on such things.

Expected structure:
- parent directory (whatever name)
 - mailer directory (whatever name)
   - welcomeMail.js
 - views
   - mail
     - welcomeMail.html
     - welcomeMail.txt

This can be overriden in either the application config or in the individual mailer's config, but I admit not much testing has been done with custom mailer options at this time.

Requirements
============

 - `node-config`: All our projects currently use this to configure our apps. Apologies if it doesn't fit in with your project. Easy enough to remove, if there's need.

Usage:
======

- `npm install --save mailpress`
- add `mailer` config section to your `node-config`—an example for Amazon SES is below.
- create your first mailer module
- create corresponding templates in the templateDir you have set (or in `../views/mail` relative to your mailer module, if you're going by the default assumptions)
- require in your mailer and call `mailer.sendMail(templateLocals, [configs])` on it

Config Example
============

```javascript
mailer: {
        transport: "SMTP",
        transportOpts: {
            service: "SES",
            auth: {
                user: "<your user>",
                pass: "<your pass>"
            }
        }
    }
}
```

Mailer Example
============
```javascript
// mailer.js
var Mailpress = require('mailpress');

var defaults = {
  // to test the text-only version, for example:
  // templateExtensions: {text: '.txt'},
  subject: 'Default subject line',
  from: 'noreply@someemail.com'
};

module.exports = new Mailpress(defaults);
```
and to use it:
```javascript
// in another file, and assuming you have html and text templates created
var myMailer = require('./mailer');
myMailer.sendMail({
  name: 'Jake Swanson', 
  welcomeText: 'Hello Mr. Swanson'
},{
  to: 'jakeswanson@fakemail.com',
  subject: 'Setting subject line for this email!'
});
```

and corresponding example [mustache](http://mustache.github.io/) html template (by default it expects `.txt` and `.html` templates):
```html
<h1>{{welcomeText}}</h1>
<p>Hey there {{name}}, this email is crafted for you.</p>
```
