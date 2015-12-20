//= router/router.js
//= view-models/content-view-model.js
//= view-models/control-view-model.js
//= view-models/view-model.js

(function(scope) {
   var ViewModel = cmRequire('view-models/view-model');
   scope.cm = {
      'Router': cmRequire('router/router'),
      'ContentViewModel': cmRequire('view-models/content-view-model'),
      'ControlViewModel': cmRequire('view-models/control-view-model'),
      'ViewModel': ViewModel,
      'Events': ViewModel.Events,
      'createChildObservable': ViewModel.createChildObservable,
      'createChildrenObservable': ViewModel.createChildrenObservable
   };
})(this);
