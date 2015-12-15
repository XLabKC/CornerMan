//= router/router.js
//= view-models/content-view-model.js
//= view-models/control-view-model.js
//= view-models/view-model.js

(function(scope) {
   scope.co = {
      'Router': coRequire('router/router'),
      'ContentViewModel': coRequire('view-models/content-view-model'),
      'ControlViewModel': coRequire('view-models/control-view-model'),
      'ViewModel': coRequire('view-models/view-model')
   };
})(this);
