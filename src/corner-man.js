//= require base.js
// = require bindings/child.js
//= require router/router.js
//= require view-models/content-view-model.js
//= require view-models/control-view-model.js
//= require view-models/view-model.js

(function() {
   var ViewModel = cm.require('viewmodels.ViewModel');
   var Router = cm.require('router.Router');
   var ChildBinding = cm.require('bindings.Child');

   function CornerMan(rootViewModel) {
      if (CM_ASSERT_TYPES) if (CM_ASSERT_TYPES) cm.assertArgs(arguments, ViewModel);
      this.router = new Router();
      this.rootViewModel_ = ko.observable(rootViewModel);
   }

   CornerMan.prototype.getRootViewModel = function() {
      return this.rootViewModel_();
   }
   
   CornerMan.prototype.setRootViewModel = function(rootViewModel) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, ViewModel);
      this.rootViewModel_(rootViewModel);
   }

   CornerMan.prototype.get = function(/* route [, callbacks...] */) {
      var callbacks = Array.prototype.slice.call(arguments, 1);
      if (CM_ASSERT_TYPES) cm.assertOfType(arguments[0], String);
      if (CM_ASSERT_TYPES) cm.assertOfType(callbacks, cm.arrayOf(Function));

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
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, cm.optional(Node));
      ChildBinding.attachToKnockout();
      element = element || document.body;
      element.setAttribute('data-bind', 'child: rootViewModel_');
      ko.applyBindings(this);
   };

   cm.define('CornerMan', CornerMan);
})(this);
