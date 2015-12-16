//= router/router.js
//= view-models/content-view-model.js
//= view-models/control-view-model.js
//= view-models/view-model.js

(function(scope) {
   scope.co = {
      'Router': cmRequire('router/router'),
      'ContentViewModel': cmRequire('view-models/content-view-model'),
      'ControlViewModel': cmRequire('view-models/control-view-model'),
      'ViewModel': cmRequire('view-models/view-model')
   };
})(this);
