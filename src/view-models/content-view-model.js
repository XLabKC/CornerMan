//= require base.js
//= require view-models/view-model.js
//= require view-models/control-view-model.js

(function() {
   var ViewModel = coRequire('viewmodels.ViewModel');
   var ControlViewModel = coRequire('viewmodels.ControlViewModel');

   function ContentViewModel(template) {
      assertArgs(arguments, optional(String));
      ViewModel.call(this, template);
      this.controlSetsInternal_ = {}
      this.controlSets_ = {} 
   };
   ContentViewModel.prototype = Object.create(ViewModel.prototype);
   ContentViewModel.prototype.constructor = ContentViewModel;

   ContentViewModel.prototype.getControlSetObservable = function(key) {
      assertArgs(arguments, String);
      if (!this.controlSet_[key]) {
         this.controlSet_[key] = ko.pureComputed(this.computeControlSet_.bind(this));
      }
   };

   ContentViewModel.prototype.addControl = function(key, control) {
      assertArgs(arguments, String, ControlViewModel);
      var set = this.controlSetsInternal_[key];
      if (set) {
         set.push(control);
      } else{
         this.controlSetsInternal_[key] = ko.observableArray([control]);
      }
   };

   ContentViewModel.prototype.removeControl = function(key, control) {
      assertArgs(arguments, String, ControlViewModel);
      if (this.controlSetsInternal_[key]) {
         this.controlSetsInternal_[key].remove(control);
      }
   };

   ContentViewModel.prototype.computeControlSet_ = function(key) {
      var set = this.getControlSetInternalObservable_(key)();
      var children = this.getChildren();
      for (var i = 0, len = children.length; i < len; i++) {
         if (child instanceof ContentViewModel) {
            var observable = child.getControlSetObservable(key);
            set = set.concat(observable());
         }
      }
      set.sort(controlComparator);
      return set;
   };

   ContentViewModel.prototype.getControlSetInternalObservable_ = function(key) {
      assertArgs(arguments, String);
      if (!controlSetsInternal_[key]) {
         this.controlSetsInternal_[key] = ko.observableArray();
      }
      return this.controlSetsInternal_[key];
   };

   var controlComparator = function (a, b) {
      assertArgs(arguments, ControlViewModel, ControlViewModel);
      var orderA = a.order();
      var orderB = b.order();
      if (orderA < orderB) return -1;
      if (orderA == orderB) return 0;
      return 1;
   };

   coDefine('viewmodels.ContentViewModel', ContentViewModel);
})();
