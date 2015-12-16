//= require base.js

(function() {
   function ViewModel(template) {
      assertArgs(arguments, optional(String))
      this.template = ko.observable(template || null);
      this.hasTemplate = ko.pureComputed(this.computeHasTemplate_.bind(this));
      this.parent_ = ko.observable();
      this.children_ = {};
      this.childrenObservable_ = ko.observableArray();
   };

   ViewModel.prototype.getParent = function() {
      return this.parent_();
   };

   ViewModel.prototype.getChildren = function() {
      return this.childrenObservable_();
   };

   ViewModel.prototype.getChildForKey = function(key) {
      assertArgs(arguments, String);
      return this.getChildObservable(key)();
   };

   ViewModel.prototype.getChildObservable = function(key) {
      assertArgs(arguments, String);
      if (!this.children_[key]) {
         this.children_[key] = ko.observable(null);
      }
      return this.children_[key];
   };

   ViewModel.prototype.getKeyForChild = function(child) {
      assertArgs(arguments, ViewModel);
      for (var key in this.children_) {
         if (this.children_[key]() == child) {
            return key;
         }
      }
      return null;
   };

   ViewModel.prototype.setChild = function(key, viewModel) {
      assertArgs(arguments, String, [null, ViewModel]);
      if (this.children_[key]) {
         var old = this.children_[key]();
         // Set the existing observable to have the new child.
         this.children_[key](viewModel);

         if (old) {
            // Notify old child view model and parent view model.
            old.removedFromParent(this, key);
            this.childRemoved(old, key);
            this.childrenObservable_.remove(old);
         }
      } else {
         this.children_[key] = ko.observable(viewModel)
      }
      if (viewModel) {
         this.childrenObservable_.push(viewModel);
      }
      // Notify new child view model and parent view model.
      if (viewModel) {
         viewModel.addedToParent(this, key);
         this.childAdded(viewModel, key);
      }
   };

   ViewModel.prototype.computeHasTemplate_ = function() {
      return this.template() != null;
   }

   // Called every time a child is added to the parent.
   ViewModel.prototype.childAdded = function(child, key) {
      assertArgs(arguments, ViewModel, String);
   };

   // Called every time a child is removed.
   ViewModel.prototype.childRemoved = function(child, key) {
      assertArgs(arguments, ViewModel, String);
   };

   // Called every time a view model is removed from its parent.
   ViewModel.prototype.removedFromParent = function(parent, key) {
      assertArgs(arguments, ViewModel, String);
      if (this.parent_() == parent) {
         this.parent_(null);
      }
   };

   // Called every time a view model is added to a parent.
   ViewModel.prototype.addedToParent = function(parent, key) {
      assertArgs(arguments, ViewModel, String);
      // If the child already has a parent, remove the child from that parent.
      var oldParent = this.parent_();
      if (oldParent && oldParent.getKeyForChild(this) == key) {
         oldParent.setChild(key, null);
      }
      this.parent_(parent);
   };

   // Called every time a view model is bound to a view.
   ViewModel.prototype.boundToElement = function(element) {
      assertArgs(arguments, Element);
   };

   // Called every time a view model is unbound from a view.
   ViewModel.prototype.unboundFromElement = function(element) {
      assertArgs(arguments, Element);
   };

   cmDefine('viewmodels.ViewModel', ViewModel);
})();
