//= require base.js
//= require view-models/view-model.js

(function () {
   function Template(template) {
      this.data_ = {};
      this.template_ = template;
   };
   Template.prototype.data = function(key, value) {
      if (arguments.length === 1) {
         return this.data_[key];
      }
      this.data_[key] = value;
   };
   Template.prototype.text = function(value) {
      // Don't allow settings the template.
      if (arguments.length == 1) return;
      return this.template_;
   };

   cm.define('templates.Template', Template);
})();
