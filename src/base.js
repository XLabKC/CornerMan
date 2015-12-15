(function(scope) {
   var root = {};

   scope.coDefine = function(namespace, obj) {
      var namespace = namespace.replace(/\./g, '$');
      if (root[namespace]) {
         throw Error('Namespace already exists: ' + namespace);
      }
      root[namespace] = obj;
   };

   scope.coRequire = function(namespace) {
      var namespace = namespace.replace(/\./g, '$');
      if (!root[namespace]) {
         throw Error('Unknown namespace: ' + namespace); 
      }
      return root[namespace];
   };

   scope.assertArgs = insist.args;
   scope.assertOfType = insist.ofType;
   scope.assertType = insist.isType;
   scope.isValidType = insist.isValidType;
   scope.isOptionalType = insist.isOptionalType;
   scope.getNameForValue = insist.getNameForValue;
   scope.getNameForType = insist.getNameForType;
   scope.isOfType = insist.isOfType;
   scope.arrayOf = insist.arrayOf;
   scope.nullable = insist.nullable;
   scope.anything = insist.anything;
   scope.optional = insist.optional;

})(this);
