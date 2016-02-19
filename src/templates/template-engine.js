//= require base.js
//= require templates/template.js

(function () {
   var Template = cm.require('templates.Template');


   function TemplateEngine() {
      ko.nativeTemplateEngine.call(this);
   };
   TemplateEngine.prototype = Object.create(ko.nativeTemplateEngine.prototype);
   TemplateEngine.prototype.constructor = TemplateEngine;
   TemplateEngine.prototype.makeTemplateSource = function(template) {
      return new Template(template);
   };

   cm.define('viewmodels.ControlViewModel', ControlViewModel);
})();
