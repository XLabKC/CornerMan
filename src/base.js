(function(scope) {
   var root = {};
   scope.cm = {
      inherit: function(subClass, superClass) {
         subClass.prototype = Object.create(superClass.prototype);
         subClass.prototype.constructor = subClass;
      },
      define: function(namespace, obj) {
         var namespace = namespace.replace(/\./g, '$');
         if (root[namespace]) {
            throw Error('Namespace already exists: ' + namespace);
         }
         root[namespace] = obj;
      },
      require: function(namespace) {
         var namespace = namespace.replace(/\./g, '$');
         if (!root[namespace]) {
            throw Error('Unknown namespace: ' + namespace); 
         }
         return root[namespace];
      }
   };

   var noop = function() {};
   var insist = scope.insist || {};
   scope.cm.assertArgs = scope.assertArgs || insist.args || noop;
   scope.cm.assertOfType = scope.assertOfType || insist.ofType || noop;
   scope.cm.assertType = scope.assertType || insist.isType || noop;
   scope.cm.getNameForValue = scope.getNameForValue || insist.getNameForValue || noop;
   scope.cm.getNameForType = scope.getNameForType || insist.getNameForType || noop;
   scope.cm.arrayOf = scope.arrayOf || insist.arrayOf || noop;
   scope.cm.nullable = scope.nullable || insist.nullable || noop;
   scope.cm.anything = scope.anything || insist.anything || noop;
   scope.cm.optional = scope.optional || insist.optional || noop;
   scope.cm.ofEnum = scope.ofEnum || insist['enum'] || noop;

})(this);
