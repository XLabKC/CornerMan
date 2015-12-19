//= require base.js
//= require view-models/view-model.js

(function () {
   var ViewModel = cmRequire('viewmodels.ViewModel')

   function ControlViewModel(template, order) {
      // TODO(blakevanlan): fix insist here, it breaks for some unknown reason.
      // var args = assertArgs(arguments, optional(String), Number);
      if ((typeof template) === 'number') {
         order = arguments[0];
         template = '';
      }
      ViewModel.call(this, template);
      this.order_ = ko.observable(order);
   };
   ControlViewModel.prototype = Object.create(ViewModel.prototype);
   ControlViewModel.prototype.constructor = ControlViewModel;

   ControlViewModel.prototype.getOrder = function() {
      return this.order_();
   }

   ControlViewModel.prototype.setOrder = function(order) {
      return this.order_(order);
   }

   cmDefine('viewmodels.ControlViewModel', ControlViewModel);
})();
