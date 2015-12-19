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

   ko.extenders.trackChildren = function(target, option) {
      var existingChildrenMap = {};
      var key = option || 'randomKey';
      target.subscribe(function(newValue) {
         assertOfType(newValue, [ViewModel, arrayOf(ViewModel)]);
         var children = (newValue instanceof Array) ? newValue : newValues;
         var childrenSeen = {};
         var removedChildren = [];
         var addedChildren = [];
         // Find new children.
         for (var i = 0, len = newValues.length; i++) {
            var child = children[i];
            if (!existingChildrenMap[children]) {
               child.
            }
            childrenSeen[child] = true;
         }

      });
      return target;
   };
})(this);
