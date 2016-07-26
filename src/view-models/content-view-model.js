//= require base.js
//= require view-models/view-model.js
//= require view-models/control-view-model.js

(function() {
   var ViewModel = cm.require('viewmodels.ViewModel');
   var ControlViewModel = cm.require('viewmodels.ControlViewModel');
   var CONTROL_KEY_PREFIX = 'control_key:';

   function ContentViewModel(template) {
      cm.assertArgs(arguments, cm.optional(String));
      ViewModel.call(this, template);
      this.keysToControlsObservables_ = {};
   };
   cm.inherit(ContentViewModel, ViewModel);

   ContentViewModel.prototype.getControlsForKey = function(key) {
      cm.assertArgs(arguments, String);
      return this.getControlsObservableForKey(key)();
   };

   ContentViewModel.prototype.getControlsObservableForKey = function(key) {
      cm.assertArgs(arguments, String);
      return this.getControlsObservableForKeyInternal_(CONTROL_KEY_PREFIX + key);
   };

   ContentViewModel.prototype.addControlAtKey = function(key, control) {
      cm.assertArgs(arguments, String, ControlViewModel);
      this.addChildAtKey(CONTROL_KEY_PREFIX + key, control);
   };

   ContentViewModel.prototype.removeControlAtKey = function(key, control) {
      cm.assertArgs(arguments, String, ControlViewModel);
      return this.removeChildAtKey(CONTROL_KEY_PREFIX + key, control);
   };

   ContentViewModel.prototype.getControlsObservableForKeyInternal_ = function(controlKey) {
      cm.assertArgs(arguments, String);
      if (!this.keysToControlsObservables_[controlKey]) {
         this.keysToControlsObservables_[controlKey] =
               ko.pureComputed(this.computeControls_.bind(this, controlKey));
      }
      return this.keysToControlsObservables_[controlKey];
   };

   ContentViewModel.prototype.computeControls_ = function(controlKey) {
      var controls = this.getChildrenForKey(controlKey);
      var keys = this.getKeys();
      for (var i = 0, len = keys.length; i < len; i++) {
         var key = keys[i];
         if (key.indexOf(CONTROL_KEY_PREFIX) == 0) {
            continue;
         }
         var children = this.getChildrenForKey(key);
         for (var j = 0, childrenLength = children.length; j < childrenLength; j++) {
            var child = children[j];
            if (child instanceof ContentViewModel) {
               var observable = child.getControlsObservableForKeyInternal_(controlKey);
               controls = controls.concat(observable());
            }
         }
      }
      controls.sort(controlComparator);
      return controls;
   };

   var controlComparator = function (a, b) {
      cm.assertArgs(arguments, ControlViewModel, ControlViewModel);
      var orderA = a.getOrder();
      var orderB = b.getOrder();
      if (orderA < orderB) return -1;
      if (orderA == orderB) return 0;
      return 1;
   };

   cm.define('viewmodels.ContentViewModel', ContentViewModel);
})();
