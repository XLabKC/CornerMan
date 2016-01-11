//= require base.js
//= require templates/template.js

(function () {
   var Template = cmRequire('templates.Template');


   function TemplateEngine() {
      ko.nativeTemplateEngine.call(this);
   };
   TemplateEngine.prototype = Object.create(ko.nativeTemplateEngine.prototype);
   TemplateEngine.prototype.constructor = TemplateEngine;
   TemplateEngine.prototype.makeTemplateSource = function(template) {
      return new Template(template);
   };

   cmDefine('viewmodels.ControlViewModel', ControlViewModel);
})();
