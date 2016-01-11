//= require base.js
// = require bindings/child.js
//= require router/router.js
//= require view-models/content-view-model.js
//= require view-models/control-view-model.js
//= require view-models/view-model.js

(function() {
   var ViewModel = cmRequire('viewmodels.ViewModel');
   var Router = cmRequire('router.Router');
   var ChildBinding = cmRequire('bindings.Child');

   function CornerMan(rootViewModel) {
      assertArgs(arguments, ViewModel);
      this.router = new Router();
      this.rootViewModel_ = ko.observable(rootViewModel);
   }

   CornerMan.prototype.getRootViewModel = function(rootViewModel) {
      assertArgs(arguments, ViewModel);
      return this.rootViewModel_();
   }
   
   CornerMan.prototype.setRootViewModel = function(rootViewModel) {
      assertArgs(arguments, ViewModel);
      this.rootViewModel_(rootViewModel);
   }

   CornerMan.prototype.get = function(/* route [, callbacks...] */) {
      var route = arguments[0];
      var callbacks = Array.prototype.slice.call(arguments, 1);
      assertOfType(route, String);
      assertOfType(callbacks, arrayOf(Function));

      // Bind each callback to this.
      for (var i = 0, len = callbacks.length; i < len; i++) {
         callbacks[i] = callbacks[i].bind(this);  
      }
      this.router.get.apply(this.router, arguments);
   }

   /** Add alias for {@code get}. */
   CornerMan.prototype.addRouter = CornerMan.prototype.get;

   CornerMan.prototype.listen = function() {
      this.router.listen();
   };

   CornerMan.prototype.bindRootViewModel = function(element) {
      assertArgs(arguments, optional(Node));
      ChildBinding.attachToKnockout();
      element = element || document.body;
      element.setAttribute('data-bind', 'child: rootViewModel_');
      ko.applyBindings(this);
   };

   cmDefine('CornerMan', CornerMan);
})(this);
