//= require base.js

(function() {
   function ViewModel(template) {
      assertArgs(arguments, optional(String))
      this.template = ko.observable(template || null);
      this.hasTemplate = ko.pureComputed(this.computeHasTemplate_.bind(this));
      this.parent_ = ko.observable(null);
      this.parent_.subscribe(this.onParentWillChange_, this, 'beforeChange');
      this.parent_.subscribe(this.onParentChanged_, this, 'change');
      this.keys_ = ko.observableArray();
      this.keysToChildrenObservables_ = {};
      this.childrenObservable_ = ko.pureComputed(this.computeChildrenObservable_.bind(this));
      this.eventsToListeners_ = {};

      // Map from children to keys at which they used to reside.
      this.recentlyRemovedChildrenToKeys_ = {};
   };

   ViewModel.Events = {
      CHILD_ADDED: 'child-added',
      CHILD_MOVED: 'child-moved',
      CHILD_REMOVED: 'child-removed',
      MOVED_KEYS: 'self-moved-keys',
      ADDED_TO_PARENT: 'self-added-to-parent',
      REMOVED_FROM_PARENT: 'self-removed-from-parent',
      BOUND_TO_ELEMENT: 'self-bound-to-element',
      UNBOUND_FROM_ELEMENT: 'self-unbound-from-element'
   };

   ViewModel.prototype.addListener = function(eventType, callback) {
      assertArgs(arguments, ofEnum(ViewModel.Events), Function);
      if (!this.eventsToListeners_[eventType]) {
         this.eventsToListeners_[eventType] = [];
      }
      this.eventsToListeners_[eventType].push(callback);
   };

   ViewModel.prototype.removeListener = function(listener) {
      assertArgs(arguments, Function);
      var found = false;
      for (var type in this.eventsToListeners_) {
         var listeners = this.eventsToListeners_[type];
         for (var i = 0; i < listeners.length; i++) {
            if (listener === listeners[i]) {
               found = true;
               listeners.splice(i, 1);
               i--;
            }
         }
      }
      return found;
   }

   ViewModel.prototype.getParent = function() {
      return this.parent_();
   };

   ViewModel.prototype.getChildren = function() {
      return this.childrenObservable_();
   };

   ViewModel.prototype.getChildrenObservable = function() {
      return this.childrenObservable_;
   };

   ViewModel.prototype.getChildrenForKey = function(key) {
      assertArgs(arguments, String);
      return this.getChildrenObservableForKey(key)();
   };

   ViewModel.prototype.getChildrenObservableForKey = function(key) {
      assertArgs(arguments, String);
      if (!this.keysToChildrenObservables_[key]) {
         this.keysToChildrenObservables_[key] = ko.observableArray([]);
         this.keys_.push(key);
      }
      return this.keysToChildrenObservables_[key];
   };

   ViewModel.prototype.getKeyForChild = function(viewModel) {
      assertArgs(arguments, ViewModel);
      var keys = this.keys_();
      if (viewModel.getParent() != this) {
         return null;
      }
      for (var i = 0, len = keys.length; i < len; i++) {
         var childrenObservable = this.getChildrenObservableForKey(keys[i]);
         if (childrenObservable.indexOf(viewModel) != -1) {
            return keys[i];
         }
      }
      return null;
   };

   ViewModel.prototype.addChildForKey = function(key, viewModel) {
      assertArgs(arguments, String, ViewModel);
      var currentParent = viewModel.getParent();
      if (currentParent === this) {
         // Handle when a child is moving from one key to another within the same parent.
         var currentKey = currentParent.getKeyForChild(viewModel);
         if (currentKey === key) {
            return false;
         }
         this.removeChildAtKeySilently_(currentKey, viewModel);
         this.getChildrenObservableForKey(key).push(viewModel);
         viewModel.dispatchEvent_(ViewModel.Events.MOVED_KEYS, this, currentKey, key);
         this.dispatchEvent_(ViewModel.Events.CHILD_MOVED, viewModel, currentKey, key);
         return true;
      }
      var childrenObservable = this.getChildrenObservableForKey(key);
      
      // Silently update the observables value so that the parents are properly set before an update
      // occurs.
      childrenObservable.peek().push(viewModel);

      if (currentParent) {
         var currentKey = currentParent.getKeyForChild(viewModel);
         currentParent.removeChildAtKeySilently_(currentKey, viewModel,
            true /* storeRemovedChild */);
      }
      viewModel.parent_(this);
      childrenObservable.valueHasMutated();
      return true;
   };

   ViewModel.prototype.addChildrenForKey = function(key, viewModels) {
      assertArgs(arguments, String, arrayOf(ViewModel));
      for (var i = 0, len = viewModels.length; i < len; i++) {
         this.addChildForKey(key, viewModels[i]);
      };
   };

   ViewModel.prototype.removeChildAtKey = function(key, viewModel) {
      assertArgs(arguments, String, ViewModel);
      var wasRemoved = this.removeChildAtKeySilently_(key, viewModel);
      if (wasRemoved) {
         viewModel.parent_(null);   
      } 
      return wasRemoved;
   };

   ViewModel.prototype.removeChild = function(viewModel) {
      assertArgs(arguments, ViewModel);
      var key = this.getKeyForChild(viewModel);
      if (key) {
         return this.removeChildAtKey(key, viewModel);
      }
      return false;
   };

   ViewModel.prototype.replaceChildrenAtKey = function(key, viewModels) {
      assertArgs(arguments, String, arrayOf(ViewModel));
      var children = this.getChildrenForKey(key);
      for (var i = 0, len = children.length; i < len; i++) {
         this.removeChildAtKey(key, children[i]);
      }
      this.addChildrenForKey(key, viewModels);
   };

   ViewModel.prototype.computeChildrenObservable_ = function() {
      var keys = this.keys_();
      keys.sort();
      var children = [];
      for (var i = 0, len = keys.length; i < len; i++) {
         children = children.concat(this.getChildrenForKey(keys[i]));
      }
      return children;
   };

   ViewModel.prototype.computeHasTemplate_ = function() {
      return this.template() != null;
   };

   ViewModel.prototype.removeChildAtKeySilently_ = function(key, viewModel, storeRemovedChild) {
      assertArgs(arguments, String, ViewModel, optional(Boolean));
      if (!this.keysToChildrenObservables_[key]) {
         return false;
      }
      var result = this.keysToChildrenObservables_[key].remove(viewModel);
      if (!result || !result.length) {
         return false;
      }
      if (storeRemovedChild) {
         this.recentlyRemovedChildrenToKeys_[viewModel] = key;
      }
      return true;
   }

   ViewModel.prototype.dispatchEvent_ = function(/* eventType [, args... ] */) {
      var eventType = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);
      var listeners = this.eventsToListeners_[eventType];
      if (listeners) {
         for (var i = 0, len = listeners.length; i < len; i++) {
            listeners[i].apply(this, args);
         };
      }
   };

   ViewModel.prototype.onParentWillChange_ = function(oldParent) {
      if (oldParent) {
         var key = oldParent.recentlyRemovedChildrenToKeys_[this];
         if (key) {
            delete oldParent.recentlyRemovedChildrenToKeys_[this];
            this.dispatchEvent_(ViewModel.Events.REMOVED_FROM_PARENT, oldParent, key);
            oldParent.dispatchEvent_(ViewModel.Events.CHILD_REMOVED, this, key);
         }
      }
   }

   ViewModel.prototype.onParentChanged_ = function(newParent) {
      if (newParent) {
         var key = newParent.getKeyForChild(this);
         this.dispatchEvent_(ViewModel.Events.ADDED_TO_PARENT, newParent, key);
         newParent.dispatchEvent_(ViewModel.Events.CHILD_ADDED, this, key);
      }
   }

   // Called every time a view model is bound to a view.
   ViewModel.prototype.boundToElement_ = function(element) {
      assertArgs(arguments, Element);
      this.dispatchEvent_(ViewModel.Events.BOUND_TO_ELEMENT, element);
   };

   // Called every time a view model is unbound from a view.
   ViewModel.prototype.unboundFromElement_ = function(element) {
      assertArgs(arguments, Element);
      this.dispatchEvent_(ViewModel.Events.UNBOUND_FROM_ELEMENT, element);
   };

   cmDefine('viewmodels.ViewModel', ViewModel);
})();
