//= require base.js
//= require view-models/view-model.js

(function () {
   var ViewModel = coRequire('viewmodels.ViewModel')

   function ControlViewModel(template) {
      assertArgs(arguments, optional(String), Number);
      ViewModel.call(this, template);
      this.order = ko.observable(order);
   };
   ControlViewModel.prototype = Object.create(ViewModel.prototype);
   ControlViewModel.prototype.constructor = ControlViewModel;

   coDefine('viewmodels.ControlViewModel', ControlViewModel);
})();
