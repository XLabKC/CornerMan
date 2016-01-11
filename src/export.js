//= require corner-man.js
//= require router/router.js
//= require view-models/content-view-model.js
//= require view-models/control-view-model.js
//= require view-models/view-model.js

(function(scope) {
   var ViewModel = cmRequire('viewmodels.ViewModel');
   var CornerMan = cmRequire('CornerMan');

   // Export classes.
   scope.CornerMan = {
      'CornerMan': CornerMan,
      'Router': cmRequire('router.Router'),
      'ContentViewModel': cmRequire('viewmodels.ContentViewModel'),
      'ControlViewModel': cmRequire('viewmodels.ControlViewModel'),
      'ViewModel': ViewModel,
      'Events': ViewModel.Events
   };

   // Export methods.
   scope.CornerMan['createChildObservable'] = ViewModel.createChildObservable;
   scope.CornerMan['createChildrenObservable'] = ViewModel.createChildrenObservable;
   scope.CornerMan['create'] = function(rootViewModel) {
      return new CornerMan(rootViewModel);
   };
   scope.CornerMan['inherit'] = scope.cmInherit;
})(this);
