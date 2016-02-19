//= require base.js
//= require bindings/child.js
//= require view-models/view-model.js

describe('viewmodels.ViewModel', function() {
   
   var ViewModel = cm.require('viewmodels.ViewModel');

   describe('constructor', function() {

      it('should set template if supplied to constructor', function() {
         var vm = new ViewModel('foobar');
         expect(vm.getTemplate()).to.equal('foobar');
      });
   });

   describe('childObservable', function() {

      it('should return an observable', function() {
         var vm = new ViewModel();
         expect(ko.isObservable(vm.childObservable())).to.be.true();
      });

      it('should add the new child to the view model when the value is updated', function() {
         var vm = new ViewModel();
         var child = new ViewModel();
         var observable = vm.childObservable();
         observable(child);
         expect(observable()).to.equal(child);
         expect(vm.getChildrenForKey(observable.getKey())).to.include(child);
      });

      it('should remove the old child from the view model when the value is updated', function() {
         var vm = new ViewModel();
         var child1 = new ViewModel();
         var child2 = new ViewModel();
         var observable = vm.childObservable();
         observable(child1);
         observable(child2);
         expect(observable()).to.equal(child2);
         expect(vm.getChildrenForKey(observable.getKey())).to.not.include(child1);
         expect(vm.getChildrenForKey(observable.getKey())).to.include(child2);
      });
   });

   describe('childrenObservable', function() {
      it('should return an observable', function() {
         var vm = new ViewModel();
         expect(ko.isObservable(vm.childrenObservable())).to.be.true();
      });

      it('should add the new child to the view model when a child is added', function() {
         var vm = new ViewModel();
         var child = new ViewModel();
         var observableArray = vm.childrenObservable();
         observableArray.push(child);
         expect(observableArray()).to.include(child);
         expect(vm.getChildrenForKey(observableArray.getKey())).to.include(child);
      });

      it('should remove the child from the view model when a child is removed', function() {
         var vm = new ViewModel();
         var child = new ViewModel();
         var observableArray = vm.childrenObservable();
         observableArray.push(child);
         observableArray.pop();
         expect(observableArray()).to.not.include(child);
         expect(vm.getChildrenForKey(observableArray.getKey())).to.not.include(child);
      });

      it('should do nothing when a child is moved within the underlying array', function() {
         var vm = new ViewModel();
         var child1 = new ViewModel();
         var child2 = new ViewModel();
         var observableArray = vm.childrenObservable([child1, child2]);
         var addedSpy = sinon.spy();
         var removedSpy = sinon.spy();
         vm.addListener(ViewModel.Events.CHILD_REMOVED, addedSpy);
         vm.addListener(ViewModel.Events.CHILD_REMOVED, removedSpy);
         observableArray([child2, child1]);
         expect(addedSpy.called).to.be.false();
         expect(removedSpy.called).to.be.false();
      });
   });

   describe('addListener', function() {

      it('should add the listener for the given event', function() {
         var vm = new ViewModel();
         var listener = function() {};
         vm.addListener(ViewModel.Events.CHILD_ADDED, listener);
         expect(vm.eventsToListeners_).to.include.keys(ViewModel.Events.CHILD_ADDED);
         expect(vm.eventsToListeners_[ViewModel.Events.CHILD_ADDED]).to.contain(listener);
      });
   });

   describe('removeListener', function() {

      it('should return false if the listener was not removed', function() {
         var vm = new ViewModel();
         expect(vm.removeListener(function() {})).to.be.false();
      });

      it('should return true if the listener was removed', function() {
         var vm = new ViewModel();
         var listener = function() {};
         vm.addListener(ViewModel.Events.CHILD_ADDED, listener);
         expect(vm.removeListener(listener)).to.be.true();
      });
   });

   describe('addChildAtKey', function() {

      it('should add the view model as a child', function() {
         var vm = new ViewModel();
         var child = new ViewModel();
         vm.addChildAtKey('foo', child);
         expect(vm.getChildrenForKey('foo')).to.include(child);
      });

      it('should remove the view model from existing parent if not the same', function() {
         var oldParent = new ViewModel();
         var child = new ViewModel();
         var newParent = new ViewModel();
         oldParent.addChildAtKey('foo', child);
         newParent.addChildAtKey('bar', child);
         expect(oldParent.getChildrenForKey('foo')).to.not.include(child);
      });
      
      it('should dispatch CHILD_ADDED event from parent when child is new', function() {
         var vm = new ViewModel();
         var child = new ViewModel();
         var spy = sinon.spy();
         vm.addListener(ViewModel.Events.CHILD_ADDED, spy);
         vm.addChildAtKey('foo', child);
         expect(spy.calledOnce).to.be.true();
         expect(spy.calledWith(child, 'foo')).to.be.true();
      });

      it('should dispatch ADDED_TO_PARENT event from child when child is new', function() {
         var vm = new ViewModel();
         var child = new ViewModel();
         var spy = sinon.spy();
         child.addListener(ViewModel.Events.ADDED_TO_PARENT, spy);
         vm.addChildAtKey('foo', child);
         expect(spy.calledOnce).to.be.true();
         expect(spy.calledWith(vm, 'foo')).to.be.true();
      });

      it('should dispatch CHILD_ADDED event only once when child had different parent', function() {
         var oldParent = new ViewModel();
         var child = new ViewModel();
         var newParent = new ViewModel();
         var spy = sinon.spy();
         oldParent.addChildAtKey('foo', child);
         newParent.addListener(ViewModel.Events.CHILD_ADDED, spy);
         
         newParent.addChildAtKey('foo', child);
         expect(spy.calledOnce).to.be.true();
         expect(spy.calledWith(child, 'foo')).to.be.true();
      });

      it('should dispatch ADDED_TO_PARENT event only once when child had different parent', function() {
         var oldParent = new ViewModel();
         var child = new ViewModel();
         var newParent = new ViewModel();
         var spy = sinon.spy();
         oldParent.addChildAtKey('foo', child);
         child.addListener(ViewModel.Events.ADDED_TO_PARENT, spy);
         
         newParent.addChildAtKey('foo', child);
         expect(spy.calledOnce).to.be.true();
         expect(spy.calledWith(newParent, 'foo')).to.be.true();
      });

      it('should dispatch CHILD_REMOVED event from old parent when child had different parent', function() {
         var oldParent = new ViewModel();
         var child = new ViewModel();
         var newParent = new ViewModel();
         var spy = sinon.spy();
         oldParent.addChildAtKey('foo', child);
         oldParent.addListener(ViewModel.Events.CHILD_REMOVED, spy);
         
         newParent.addChildAtKey('bar', child);
         expect(spy.calledOnce).to.be.true();
         expect(spy.calledWith(child, 'foo')).to.be.true();
      });

      it('should dispatch REMOVED_FROM_PARENT event from child when child had different parent', function() {
         var oldParent = new ViewModel();
         var child = new ViewModel();
         var newParent = new ViewModel();
         var spy = sinon.spy();
         oldParent.addChildAtKey('foo', child);
         child.addListener(ViewModel.Events.REMOVED_FROM_PARENT, spy);
         
         newParent.addChildAtKey('bar', child);
         expect(spy.calledOnce).to.be.true();
         expect(spy.calledWith(oldParent, 'foo')).to.be.true();
      });

      it('should dispatch CHILD_MOVED event from parent when parent is the same', function() {
         var parent = new ViewModel();
         var child = new ViewModel();
         var spy = sinon.spy();
         parent.addChildAtKey('foo', child);
         parent.addListener(ViewModel.Events.CHILD_MOVED, spy);
         
         parent.addChildAtKey('bar', child);
         expect(spy.calledOnce).to.be.true();
         expect(spy.calledWith(child, 'foo', 'bar')).to.be.true();
      });

      it('should dispatch MOVED_KEYS event from child when parent is the same', function() {
         var parent = new ViewModel();
         var child = new ViewModel();
         var spy = sinon.spy();
         parent.addChildAtKey('foo', child);
         child.addListener(ViewModel.Events.MOVED_KEYS, spy);
         
         parent.addChildAtKey('bar', child);
         expect(spy.calledOnce).to.be.true();
         expect(spy.calledWith(parent, 'foo', 'bar')).to.be.true();
      });
   });

   describe('addChildrenAtKey', function() {

      it('should add the view models as a children', function() {
         var vm = new ViewModel();
         var child1 = new ViewModel();
         var child2 = new ViewModel();
         vm.addChildrenAtKey('foo', [child1, child2]);
         expect(vm.getChildrenForKey('foo')).to.include.members([child1, child2]);
      });

      it('should remove the view models from their existing parents', function() {
         var oldParent1 = new ViewModel();
         var oldParent2 = new ViewModel();
         var vm = new ViewModel();
         var child1 = new ViewModel();
         var child2 = new ViewModel();
         oldParent1.addChildAtKey('foo', child1);
         oldParent2.addChildAtKey('foo', child2);
         vm.addChildrenAtKey('foo', [child1, child2]);
         expect(oldParent1.getChildrenForKey('foo')).to.not.include(child1);
         expect(oldParent2.getChildrenForKey('foo')).to.not.include(child2);
      });
   });

   describe('addChild', function() {

      it('should add the view model as a child', function() {
         var vm = new ViewModel();
         var child = new ViewModel();
         vm.addChild(child);
         expect(vm.getChildren()).to.include(child);
      });

      it('should return the key at which the child was added', function() {
         var vm = new ViewModel();
         var child = new ViewModel();
         var key = vm.addChild(child);
         expect(key).to.exist();
         expect(vm.getChildrenForKey(key)).to.include(child);
      });
   });

   describe('addChildren', function() {

      it('should add the view models as a children', function() {
         var vm = new ViewModel();
         var child1 = new ViewModel();
         var child2 = new ViewModel();
         vm.addChildren([child1, child2]);
         expect(vm.getChildren()).to.include.members([child1, child2]);
      });

      it('should return the key at which the child was added', function() {
         var vm = new ViewModel();
         var child1 = new ViewModel();
         var child2 = new ViewModel();
         var key = vm.addChildren([child1, child2]);
         expect(key).to.exist();
         expect(vm.getChildrenForKey(key)).to.include.members([child1, child2]);
      });
   });

   describe('getKeys', function() {

      it('should return an empty array when there are no children', function() {
         var vm = new ViewModel();
         expect(vm.getKeys()).to.have.length(0);
      });

      it('should return all keys', function() {
         var vm = new ViewModel();
         var child1 = new ViewModel();
         var child2 = new ViewModel();
         vm.addChildAtKey('foo', child1);
         vm.addChildAtKey('bar', child2);
         expect(vm.getKeys()).to.include.members(['foo', 'bar']);
      });
   });

   describe('getKeysObservable', function() {

      it('should return an observable containing an empty array when there are no children', function() {
         var vm = new ViewModel();
         expect(vm.getKeysObservable()()).to.have.length(0);
      });

      it('should return an observable containing all keys', function() {
         var vm = new ViewModel();
         var child1 = new ViewModel();
         var child2 = new ViewModel();
         vm.addChildAtKey('foo', child1);
         vm.addChildAtKey('bar', child2);
         expect(vm.getKeysObservable()()).to.include.members(['foo', 'bar']);
      });
   });

   describe('getChildren', function() {

      it('should return an empty array when there are no children', function() {
         var vm = new ViewModel();
         expect(vm.getChildren()).to.have.length(0);
      });

      it('should return all children from all keys', function() {
         var vm = new ViewModel();
         var child1 = new ViewModel();
         var child2 = new ViewModel();
         vm.addChildAtKey('foo', child1);
         vm.addChildAtKey('bar', child2);
         expect(vm.getChildren()).to.include.members([child1, child2]);
      });
   });

   describe('getChildrenObservable', function() {

      it('should return an observable that contains an empty when there are no children', function() {
         var vm = new ViewModel();
         expect(vm.getChildrenObservable()()).to.have.length(0);
      });

      it('should return an observable that contains all children from all keys', function() {
         var vm = new ViewModel();
         var child1 = new ViewModel();
         var child2 = new ViewModel();
         vm.addChildAtKey('foo', child1);
         vm.addChildAtKey('bar', child2);
         expect(vm.getChildrenObservable()()).to.include.members([child1, child2]);
      });
   });

   describe('getChildrenForKey', function() {

      it('should return an empty array when there are no children for given key', function() {
         var vm = new ViewModel();
         expect(vm.getChildrenForKey('foo')).to.have.length(0);
      });

      it('should return all children for given key', function() {
         var vm = new ViewModel();
         var child1 = new ViewModel();
         var child2 = new ViewModel();
         vm.addChildAtKey('foo', child1);
         vm.addChildAtKey('bar', child2);
         expect(vm.getChildrenForKey('foo')).to.include(child1);
         expect(vm.getChildrenForKey('foo')).to.not.include(child2);
      });
   });

   describe('getChildrenObservableForKey', function() {

      it('should return an observable that contains an empty array when there are no children for given key', function() {
         var vm = new ViewModel();
         expect(vm.getChildrenObservableForKey('foo')()).to.have.length(0);
      });

      it('should return all children for given key', function() {
         var vm = new ViewModel();
         var child1 = new ViewModel();
         var child2 = new ViewModel();
         vm.addChildAtKey('foo', child1);
         vm.addChildAtKey('bar', child2);
         expect(vm.getChildrenObservableForKey('foo')()).to.include(child1);
         expect(vm.getChildrenObservableForKey('foo')()).to.not.include(child2);
      });
   });
   
   describe('getKeyForChild', function() {

      it('should return null when child\'s parent isn\'t the view model', function() {
         var vm = new ViewModel();
         var other = new ViewModel();
         expect(vm.getKeyForChild(other)).to.be.null();
      });

      it('should return key of child when child of the view model', function() {
         var vm = new ViewModel();
         var child = new ViewModel();
         vm.addChildAtKey('foo', child);
         expect(vm.getKeyForChild(child)).to.equal('foo');
      });
   });

   describe('removeChildAtKey', function() {

      it('should return false when child\'s parent isn\'t the view model', function() {
         var vm = new ViewModel();
         var other = new ViewModel();
         expect(vm.removeChildAtKey('foo', other)).to.be.false();
      });

      it('should return false when the child isn\'t at the given key', function() {
         var vm = new ViewModel();
         var child = new ViewModel();
         vm.addChildAtKey('foo', child);
         expect(vm.removeChildAtKey('bar', child)).to.be.false();
      });

      it('should return true when the child is at given key', function() {
         var vm = new ViewModel();
         var child = new ViewModel();
         vm.addChildAtKey('foo', child);
         expect(vm.removeChildAtKey('foo', child)).to.be.true();
      });

      it('should remove the child when the child is at given key', function() {
         var vm = new ViewModel();
         var child = new ViewModel();
         vm.addChildAtKey('foo', child);
         vm.removeChildAtKey('foo', child);
         expect(vm.getChildrenForKey('foo')).to.not.include(child);
      });

      it('should set the child\'s parent to null when the child is at given key', function() {
         var vm = new ViewModel();
         var child = new ViewModel();
         vm.addChildAtKey('foo', child);
         vm.removeChildAtKey('foo', child);
         expect(child.getParent()).to.be.null();
      });

      it('should dispatch CHILD_REMOVED event from parent when child is at given key', function() {
         var vm = new ViewModel();
         var child = new ViewModel();
         vm.addChildAtKey('foo', child);
         var spy = sinon.spy();
         vm.addListener(ViewModel.Events.CHILD_REMOVED, spy);
         
         vm.removeChildAtKey('foo', child);
         expect(spy.calledOnce).to.be.true();
         expect(spy.calledWith(child, 'foo')).to.be.true();
      });

      it('should dispatch REMOVED_FROM_PARENT event from child when child is at given key', function() {
         var vm = new ViewModel();
         var child = new ViewModel();
         vm.addChildAtKey('foo', child);
         var spy = sinon.spy();
         child.addListener(ViewModel.Events.REMOVED_FROM_PARENT, spy);
         
         vm.removeChildAtKey('foo', child);
         expect(spy.calledOnce).to.be.true();
         expect(spy.calledWith(vm, 'foo')).to.be.true();
      });
   });

   describe('removeChild', function() {
      it('should return false when child\'s parent isn\'t the view model', function() {
         var vm = new ViewModel();
         var other = new ViewModel();
         expect(vm.removeChild(other)).to.be.false();
      });
      
      it('should remove the child when the child is at given key', function() {
         var vm = new ViewModel();
         var child = new ViewModel();
         vm.addChildAtKey('foo', child);
         vm.removeChild(child);
         expect(vm.getChildrenForKey('foo')).to.not.include(child);
      });
   });

   describe('replaceChildrenAtKey', function() {

      it('should remove all existing children at the key', function() {
         var vm = new ViewModel();
         var child1 = new ViewModel();
         var child2 = new ViewModel();
         vm.addChildAtKey('foo', child1);
         vm.replaceChildrenAtKey('foo', [child2]);
         expect(vm.getChildrenForKey('foo')).to.not.include(child1);
      });

      it('should add given child to the key', function() {
         var vm = new ViewModel();
         var child1 = new ViewModel();
         var child2 = new ViewModel();
         vm.addChildAtKey('foo', child1);
         vm.replaceChildrenAtKey('foo', [child2]);
         expect(vm.getChildrenForKey('foo')).to.include(child2);
      });
   });

   // Possibly remove from framework. Somewhat against the design of MVVM.
   describe.skip('bound/unbound', function() {

      function FooViewModel(child) {
         ViewModel.call(this);
         this.child = ko.observable(child);         
      };
      FooViewModel.prototype = Object.create(ViewModel.prototype);
      FooViewModel.prototype.constructor = ViewModel;

      beforeEach(function() {
         this.fooViewModel = new FooViewModel(this.parent);
      })

      it('should call BOUND_TO_ELEMENT on child when child is bound', function(done) {
         var element = $('<div data-bind="child: child"></div>')[0];
         var spy = sinon.spy();
         this.parent.addListener(ViewModel.Events.BOUND_TO_ELEMENT, spy);
         ko.applyBindings(this.fooViewModel, element);
         setTimeout((function() {
            expect(spy.calledOnce).to.be.true();
            expect(spy.calledWith(element)).to.be.true();
            done();
         }).bind(this), 0);
      });

      it('should call UNBOUND_FROM_ELEMENT on child when element is deleted', function(done) {
         var element = $('<div data-bind="child: child"></div>')[0];
         var spy = sinon.spy();
         this.parent.addListener(ViewModel.Events.UNBOUND_FROM_ELEMENT, spy);
         ko.applyBindings(this.fooViewModel, element);
         ko.removeNode(element);
         setTimeout((function() {
            expect(spy.calledOnce).to.be.true();
            expect(spy.calledWith(element)).to.be.true();
            done();
         }).bind(this), 0);
      });

      it('should call boundToElement/unboundFromElement when child is changed out', function(done) {
         var element = $('<div data-bind="child: child"></div>')[0];
         ko.applyBindings(this.fooViewModel, element);

         var parentUnbound = sinon.spy();
         this.parent.addListener(ViewModel.Events.UNBOUND_FROM_ELEMENT, parentUnbound);

         var newChild = new ViewModel();
         var childBound = sinon.spy();
         newChild.addListener(ViewModel.Events.BOUND_TO_ELEMENT, childBound);
         this.fooViewModel.child(newChild);

         setTimeout((function() {
            expect(parentUnbound.calledOnce).to.be.true();
            expect(parentUnbound.calledWith(element)).to.be.true();
            expect(childBound.calledOnce).to.be.true();
            expect(childBound.calledWith(element)).to.be.true();
            done();
         }).bind(this), 0);
      });
   });
});
