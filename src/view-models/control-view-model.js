//= require base.js
//= require view-models/view-model.js

(function () {
   var ViewModel = cm.require('viewmodels.ViewModel');

   function ControlViewModel(template, order) {
      if ((typeof template) === 'number') {
         order = arguments[0];
         template = '';
      }
      ViewModel.call(this, template);
      this.order_ = ko.observable(order);
   };
   cm.inherit(ControlViewModel, ViewModel);

   ControlViewModel.prototype.getOrder = function() {
      return this.order_();
   }

   ControlViewModel.prototype.setOrder = function(order) {
      return this.order_(order);
   }

   cm.define('viewmodels.ControlViewModel', ControlViewModel);
})();
