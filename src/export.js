//= require corner-man.js
//= require router/router.js
//= require view-models/content-view-model.js
//= require view-models/control-view-model.js
//= require view-models/view-model.js

(function(scope) {
   var ViewModel = cm.require('viewmodels.ViewModel');
   var CornerMan = cm.require('CornerMan');

   // Export classes.
   scope.CornerMan = {
      'CornerMan': CornerMan,
      'Router': cm.require('router.Router'),
      'ContentViewModel': cm.require('viewmodels.ContentViewModel'),
      'ControlViewModel': cm.require('viewmodels.ControlViewModel'),
      'ViewModel': ViewModel,
      'Events': ViewModel.Events
   };

   // Export methods.
   scope.CornerMan['createChildObservable'] = ViewModel.createChildObservable;
   scope.CornerMan['createChildrenObservable'] = ViewModel.createChildrenObservable;
   scope.CornerMan['create'] = function(rootViewModel) {
      return new CornerMan(rootViewModel);
   };
   scope.CornerMan['inherit'] = cm.inherit;
})(this);
