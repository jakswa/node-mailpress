node-mailpress
==============

Wiring up of [node-mailer](https://github.com/andris9/Nodemailer) to templates. Plop in the module, insert configs, and some template files, and you're ready to churn out some emails! Comes packaged with default naming expectations for quickly making mailers. For example, a `welcome.js` mailer will have template files named `mailer.html` and `mailer.txt` in the `templateDir`. You can override such expectations when creating a mailer.

## Requirements

 - [`node-config`](https://github.com/lorenwest/node-config): All our projects currently use this to configure our apps. Apologies if it doesn't fit in with your project. Easy enough to remove, if there's need.
 - [`mustache`](http://mustache.github.io/): Currently, this only supports mustache templates. 

## Usage:

- `npm install --save mailpress`
- add `mailer` config section to your `node-config`—an example for Amazon SES is below.
- create your first mailer module
- create corresponding templates in the templateDir you have set (or in `../views/mail` relative to your mailer module, if you're going by the default assumptions)
- require in your mailer and call `mailer.sendMail(templateLocals, [configs])` on it

## Config Example

```javascript
mailer: {
        templateDir: "relative/to/project/root",
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

## Mailer Example

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
// welcome.js
var myMailer = require('./mailer');
myMailer.sendMail({
  name: 'Jake Swanson', 
  welcomeText: 'Hello Mr. Swanson'
},{
  to: 'jakeswanson@fakemail.com',
  subject: 'Setting subject line for this email!'
});
```

and here's a set of corresponding [mustache](http://mustache.github.io/) template examples:

**NOTE**: The base name of template files must be same as the mailer base name, unless you override
it in the mailer defaults. So, for `welcome.js`, you would name them `welcome.html` and `welcome.js`
```html
<!-- these two are placed in 'templateDir' directory specified in the config
  -- e.g. relative/to/root/welcome.html
     and  relative/to/root/welcome.txt
  -->
<h1>{{welcomeText}}</h1>
<p>Hey there {{name}}, this email is crafted for you.</p>
```

```
<!-- placed in 'templateDir' directory specified in the config
  -- e.g. relative/to/root/welcome.html
  -->
<h1>{{welcomeText}}</h1>
<p>Hey there {{name}}, this email is crafted for you.</p>
```
