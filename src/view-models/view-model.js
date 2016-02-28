//= require base.js

(function() {
   var AVAILABLE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var RANDOM_KEY_LENGTH = 10;
   var ID_KEY_LENGTH = 16;

   function ViewModel(template) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, cm.optional(String))
      this.id_ = ViewModel.generateKey(ID_KEY_LENGTH);
      this.template_ = ko.observable(template || null);
      this.hasTemplate = ko.pureComputed(this.computeHasTemplate_.bind(this));
      this.parent_ = ko.observable(null);
      this.parent_.subscribe(this.onParentWillChange_, this, 'beforeChange');
      this.parent_.subscribe(this.onParentChanged_, this, 'change');
      this.keys_ = ko.observableArray();
      this.keysToChildrenObservables_ = {};
      this.childrenObservable_ = ko.pureComputed(this.computeChildrenObservable_.bind(this));
      this.eventsToListeners_ = {};
      this.childrenIdsToKeys_ = {};
   };

   ViewModel.Events = {
      CHILD_ADDED: 'child-added',
      CHILD_MOVED: 'child-moved',
      CHILD_REMOVED: 'child-removed',
      MOVED_KEYS: 'self-moved-keys',
      ADDED_TO_PARENT: 'self-added-to-parent',
      REMOVED_FROM_PARENT: 'self-removed-from-parent'
   };

   /** Generates a key. */
   ViewModel.generateKey = function(/* [length] [, availableCharacters] */) {
      var length = RANDOM_KEY_LENGTH;
      var characters = AVAILABLE_CHARACTERS;
      if (arguments.length === 1 && typeof arguments[0] === "number") {
         length = arguments[0];
      } else if (arguments.length === 1 && typeof arguments[0] === "string") {
         characters = arguments[0];
      } else if (arguments.length === 2) {
         length = arguments[0];
         characters = arguments[1];
      }
      if (CM_ASSERT_TYPES) {
         cm.assertOfType(length, Number);
         cm.assertOfType(characters, String);
      }
      keySegments = [];
      for (var i = 0; i < length; i++) {
         keySegments.push(characters.charAt(Math.floor(Math.random() * characters.length)));
      }
      return keySegments.join('');
   };

   /**
    * Creates an observable that can have a value of a view model or null. The value is set a child
    * of the given view model, at the given key.
    */
   ViewModel.createChildObservable = function(viewModel, key, initialValue) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, ViewModel, String, cm.optional(ViewModel));
      key = key || ViewModel.generateKey();
      var observable = ko.pureComputed({
         read: function() {
            return viewModel.getChildrenForKey(key)[0] || null;
         },
         write: function(child) {
            if (CM_ASSERT_TYPES) cm.assertArgs(arguments, cm.optional(ViewModel));
            if (viewModel.getChildrenForKey(key)[0] !== child) {
               viewModel.replaceChildrenAtKey(key, child ? [child] : []);
            }
         },
         owner: viewModel
      });
      observable.key_ = key;
      observable.viewModel_ = viewModel;
      observable['getKey'] = function() { return observable.key_; };
      observable['getViewModel'] = function() { return observable.viewModel_; };
      observable(initialValue);
      return observable;
   };

   /**
    * Creates an observable that can have a value of an array of view models. The values
    * (view models) are set as children of the given view model, at the given key.
    */
   ViewModel.createChildrenObservable = function(viewModel, key, initialValue) {
      if (CM_ASSERT_TYPES) {
         cm.assertArgs(arguments, ViewModel, String, cm.optional(cm.arrayOf(ViewModel)));
      }
      var observable = ko.observableArray();
      observable.subscribe(
            handleChildrenObservableChanged.bind(viewModel, viewModel, key), null, 'arrayChange');
      observable.key_ = key;
      observable.viewModel_ = viewModel;
      observable['getKey'] = function() { return observable.key_; };
      observable['getViewModel'] = function() { return observable.viewModel_; };
      if (initialValue) {
         observable(initialValue);
      }
      return observable;
   };

   /** Shortcut for {@code ViewModel.createChildObservable}. */
   ViewModel.prototype.childObservable = function(initialValue, options) {
      options = options || {};
      var key = options['key'] || ViewModel.generateKey();
      var viewModel = options['viewModel'] || this;
      return ViewModel.createChildObservable(viewModel, key, initialValue);
   }

   /** Shortcut for {@code ViewModel.createChildrenObservable}. */
   ViewModel.prototype.childrenObservable = function(initialValue, options) {
      options = options || {};
      var key = options['key'] || ViewModel.generateKey();
      var viewModel = options['viewModel'] || this;
      return ViewModel.createChildrenObservable(viewModel, key, initialValue);
   }

   /** Adds a listener for the given event. */
   ViewModel.prototype.addListener = function(event, callback) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, cm.ofEnum(ViewModel.Events), Function);
      if (!this.eventsToListeners_[event]) {
         this.eventsToListeners_[event] = [];
      }
      this.eventsToListeners_[event].push(callback);
   };

   /** Removes the listener. */
   ViewModel.prototype.removeListener = function(listener) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, Function);
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

   /** Returns the parent for this view model or null. */
   ViewModel.prototype.getParent = function() {
      return this.parent_();
   };

   /** Returns the template for this view model or null. */
   ViewModel.prototype.getTemplate = function() {
      return this.template_();
   };

   /** Returns the keys for this view model or an empty array. */
   ViewModel.prototype.getKeys = function() {
      return this.keys_();
   };

   /** Returns the observable containing the keys for this view model. */
   ViewModel.prototype.getKeysObservable = function() {
      return this.keys_;
   };

   /** Returns all of the children view models for this view model. */
   ViewModel.prototype.getChildren = function() {
      return this.childrenObservable_();
   };

   /** Returns an observable containing all of the children view models for this view model. */
   ViewModel.prototype.getChildrenObservable = function() {
      return this.childrenObservable_;
   };

   /** Returns the children of this view model for the given key. */
   ViewModel.prototype.getChildrenForKey = function(key) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, String);
      return this.getChildrenObservableForKey(key)();
   };

   /** Returns an observable containing the children of this view model for the given key. */
   ViewModel.prototype.getChildrenObservableForKey = function(key) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, String);
      if (!this.keysToChildrenObservables_[key]) {
         this.keysToChildrenObservables_[key] = ko.observableArray([]);
         this.keys_.push(key);
      }
      return this.keysToChildrenObservables_[key];
   };

   /** Returns the key for the given child view model or null. */
   ViewModel.prototype.getKeyForChild = function(viewModel) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, ViewModel);
      if (viewModel.getParent() != this) {
         return null;
      }
      return this.childrenIdsToKeys_[viewModel.id_] || null;
   };

   /** Adds the given view model as a child of this view model at the given key. */
   ViewModel.prototype.addChildAtKey = function(key, viewModel) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, String, ViewModel);
      var currentParent = viewModel.getParent();
      if (currentParent === this) {
         // Handle when a child is moving from one key to another within the same parent.
         var currentKey = currentParent.getKeyForChild(viewModel);
         if (currentKey === key) {
            return false;
         }
         this.removeChildAtKeySilently_(currentKey, viewModel, false /* storeRemovedChild */);
         
         // We can't use #getChildrenObservableForKey because we need to add the view model to the
         // new observable array before adding the key so that any subscribes will be able to access
         // the children immediately.
         if (!this.keysToChildrenObservables_[key]) {
            this.keysToChildrenObservables_[key] = ko.observableArray([viewModel]);
            this.keys_.push(key);
         } else {
            this.keysToChildrenObservables_[key].push([viewModel]);
         }
         this.childrenIdsToKeys_[viewModel.id_] = key;
         viewModel.dispatchEvent_(ViewModel.Events.MOVED_KEYS, this, currentKey, key);
         this.dispatchEvent_(ViewModel.Events.CHILD_MOVED, viewModel, currentKey, key);
         return true;
      }

      // Silently update the observables values so that the parents are properly set before an
      // update occurs.
      var isNewKey = !this.keysToChildrenObservables_[key];
      if (isNewKey) {
         this.keysToChildrenObservables_[key] = ko.observableArray([viewModel]);
         this.keys_.peek().push(key);
      } else {
         this.keysToChildrenObservables_[key].peek().push(viewModel);
      }
      this.childrenIdsToKeys_[viewModel.id_] = key;

      // Remove from the existing parent, if any.
      if (currentParent) {
         var currentKey = currentParent.getKeyForChild(viewModel);
         currentParent.removeChildAtKeySilently_(currentKey, viewModel,
            true /* storeRemovedChild */);
      }
      viewModel.parent_(this);

      // Now that everything is setup properly, let subscribers know about the updates.
      if (isNewKey) {
         this.keys_.valueHasMutated();
      } else {
         this.keysToChildrenObservables_[key].valueHasMutated();
      }
      return true;
   };

   /** Adds the given view models as children of this view model at the given key. */
   ViewModel.prototype.addChildrenAtKey = function(key, viewModels) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, String, cm.arrayOf(ViewModel));
      for (var i = 0, len = viewModels.length; i < len; i++) {
         this.addChildAtKey(key, viewModels[i]);
      };
   };

   /**
    * Adds the given view model as a child of this view model at a random key and returns the key.
    */
   ViewModel.prototype.addChild = function(viewModel) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, ViewModel);
      var key = ViewModel.generateKey();
      this.addChildAtKey(key, viewModel);
      return key;
   };

   /**
    * Adds the given view models as children of this view model at a random key and returns the key.
    */
   ViewModel.prototype.addChildren = function(viewModel) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, cm.arrayOf(ViewModel));
      var key = ViewModel.generateKey();
      this.addChildrenAtKey(key, viewModel);
      return key;
   };

   /**
    * Attempts to remove the child view model at the given key and returns whether or not it was
    * successful.
    */
   ViewModel.prototype.removeChildAtKey = function(key, viewModel) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, String, ViewModel);
      var wasRemoved = this.removeChildAtKeySilently_(key, viewModel, true /* storeRemovedChild */);
      if (wasRemoved) {
         viewModel.parent_(null);   
      } 
      return wasRemoved;
   };

   /**
    * Attempts to remove the child view model at the given key and returns whether or not it was
    * successful.
    */
   ViewModel.prototype.removeChild = function(viewModel) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, ViewModel);
      var key = this.getKeyForChild(viewModel);
      if (key) {
         return this.removeChildAtKey(key, viewModel);
      }
      return false;
   };

   /**
    * Removes any existing children at the given key and adds the given view models as children of
    * this view model.
    */
   ViewModel.prototype.replaceChildrenAtKey = function(key, viewModels) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, String, cm.arrayOf(ViewModel));
      var children = this.getChildrenForKey(key);
      for (var i = 0, len = children.length; i < len; i++) {
         this.removeChildAtKey(key, children[i]);
      }
      this.addChildrenAtKey(key, viewModels);
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
      return this.template_() != null;
   };

   ViewModel.prototype.removeChildAtKeySilently_ = function(key, viewModel, storeRemovedChild) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, String, ViewModel, cm.optional(Boolean));
      if (!this.keysToChildrenObservables_[key]) {
         return false;
      }
      var result = this.keysToChildrenObservables_[key].remove(viewModel);
      if (!result || !result.length) {
         return false;
      }
      if (!storeRemovedChild) {
         delete this.childrenIdsToKeys_[viewModel.id_];
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
         var key = oldParent.childrenIdsToKeys_[this.id_];
         if (key) {
            delete oldParent.childrenIdsToKeys_[this.id_];
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

   var handleChildrenObservableChanged = function(viewModel, key, changes) {
      // Determine the change status of each child, ignore any moves.
      for (var i = 0, len = changes.length; i < len; i++) {
         var change = changes[i];
         var skip = false;
         // Check if there is a complementary action and skip if there is.
         for (var j = 0, jLen = changes.length; j < jLen; j++) {
            var other = changes[j];
            if ((other.status === 'added' && change.status === 'deleted') ||
                  (other.status === 'deleted' && change.status === 'added')) {
               skip = true;
               break;
            }
         }
         if (skip) {
            continue;
         }
         if (change.status === 'added') {
            viewModel.addChildAtKey(key, change.value);
         } else if (change.status === 'deleted') {
            viewModel.removeChildAtKey(key, change.value);
         }
      }
   };

   cm.define('viewmodels.ViewModel', ViewModel);
})();
