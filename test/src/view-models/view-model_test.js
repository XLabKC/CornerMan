//= require base.js
//= require bindings/child.js
//= require view-models/view-model.js

describe('viewmodels.ViewModel', function() {
   
   var ViewModel = cmRequire('viewmodels.ViewModel');

   beforeEach(function() {
      this.parent = new ViewModel();
      this.child = new ViewModel();
      this.parent.children_['foo'] = ko.observable(this.child);
      this.parent.childrenObservable_.push(this.child);
      this.child.parent_(this.parent);
      this.parentChildAdded = sinon.spy(this.parent, 'childAdded');
      this.parentChildRemoved = sinon.spy(this.parent, 'childRemoved');
      this.parentBoundToElement = sinon.spy(this.parent, 'boundToElement');
      this.parentUnboundFromElement = sinon.spy(this.parent, 'unboundFromElement');
      this.childAddedToParent = sinon.spy(this.child, 'addedToParent');
      this.childRemovedFromParent = sinon.spy(this.child, 'removedFromParent');
      this.childBoundToElement = sinon.spy(this.child, 'boundToElement');
      this.childUnboundFromElement = sinon.spy(this.child, 'unboundFromElement');
   });

   describe('constructor', function() {

      it('should set template if supplied to constructor', function() {
         var vm = new ViewModel('foobar');
         expect(vm.template()).to.equal('foobar');
      });
   });

   describe('getChildren', function() {

      it('should return an empty array if the viewmodel has no children', function() {
         var vm = new ViewModel();
         expect(vm.getChildren()).to.have.length(0);
      });

      it('should return an array of the children', function() {
         var children = this.parent.getChildren();
         expect(children).to.have.length(1);
         expect(children).to.contain(this.child);
      });
   });

   describe('getChildForKey', function() {

      it('should return null if the child does not exist', function() {
         expect(this.parent.getChildForKey('key')).to.be.null();
      });

      it('should return the child if it exists', function() {
         expect(this.parent.getChildForKey('foo')).to.equal(this.child);
      });
   });

   describe('getChildObservable', function() {

      it('should return new observable if the child does not exist', function() {
         var result = this.parent.getChildObservable('key');
         expect(result).to.be.an.instanceof(Function);
         expect(result()).to.be.null();
      });

      it('should return the observable containing child if child exists', function() {
         var result = this.parent.getChildObservable('foo');
         expect(result).to.be.an.instanceof(Function);
         expect(result()).to.equal(this.child);
      });
   });

   describe('getKeyForChild', function() {

      it('should return null if the child does not exist', function() {
         var other = new ViewModel();
         expect(this.parent.getKeyForChild(other)).to.be.null();
      });

      it('should return the key for the supplied child if it exists', function() {
         expect(this.parent.getKeyForChild(this.child)).to.equal('foo');
      });
   });

   describe('setChild', function() {

      beforeEach(function() {
         this.newChild = new ViewModel() ;
         this.newChildAddedToParent = sinon.spy(this.newChild, 'addedToParent');
         this.newChildRemovedFromParent = sinon.spy(this.newChild, 'removedFromParent');
      });

      it('should set the child for the supplied key', function() {
         this.parent.setChild('new', this.newChild);
         expect(this.parent.children_['new']).to.be.an.instanceof(Function);
         expect(this.parent.children_['new']()).to.equal(this.newChild);
      });

      it('should add the new child to the children observable', function() {
         this.parent.setChild('new', this.newChild);
         expect(this.parent.childrenObservable_()).to.contain(this.newChild);
      });

      it('should call \'childAdded\' when a child is added', function() {
         this.parent.setChild('new', this.newChild);
         expect(this.parentChildAdded.calledOnce).to.be.true();
         expect(this.parentChildAdded.calledWith(this.newChild, 'new')).to.be.true();
      });

      it('should call \'childRemoved\' when a child is removed', function() {
         this.parent.setChild('foo', null);
         expect(this.parentChildRemoved.calledOnce).to.be.true();
         expect(this.parentChildRemoved.calledWith(this.child, 'foo')).to.be.true();
      });

      it('should call \'addedToParent\' when a child is added to parent', function() {
         this.parent.setChild('new', this.newChild);
         expect(this.newChildAddedToParent.calledOnce).to.be.true();
         expect(this.newChildAddedToParent.calledWith(this.parent, 'new')).to.be.true();
      });

      it('should remove the child from the children observable', function() {
         this.parent.setChild('foo', null);
         expect(this.parent.getChildren()).to.have.length(0);
      });

      it('should call \'removedFromParent\' when called with null', function() {
         this.parent.setChild('foo', null);
         expect(this.childRemovedFromParent.calledOnce).to.be.true();
         expect(this.childRemovedFromParent.calledWith(this.parent, 'foo')).to.be.true();
      });

      it('should remove the existing child if setting a new child over an old one', function() {
         this.parent.setChild('foo', this.newChild);
         // Check that childAdded was called on parent.
         expect(this.parentChildAdded.calledOnce).to.be.true();
         expect(this.parentChildAdded.calledWith(this.newChild, 'foo')).to.be.true();

         // Check that addedToParent was called on child.
         expect(this.newChildAddedToParent.calledOnce).to.be.true();
         expect(this.newChildAddedToParent.calledWith(this.parent, 'foo')).to.be.true();

         // Check that childRemoved was called on old child.
         expect(this.parentChildRemoved.calledOnce).to.be.true();
         expect(this.parentChildRemoved.calledWith(this.child, 'foo')).to.be.true();

         // Check that removedFromParent was called on child.
         expect(this.childRemovedFromParent.calledOnce).to.be.true();
         expect(this.childRemovedFromParent.calledWith(this.parent, 'foo')).to.be.true();
      });
   });

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

      it('should call boundToElement on child when child is bound', function(done) {
         var element = $('<div data-bind="child: child"></div>')[0];
         ko.applyBindings(this.fooViewModel, element);
         setTimeout((function() {
            expect(this.parentBoundToElement.calledOnce).to.be.true();
            expect(this.parentBoundToElement.calledWith(element)).to.be.true();
            done();
         }).bind(this), 0);
      });

      it('should call unboundFromElement on child when element is deleted', function(done) {
         var element = $('<div data-bind="child: child"></div>')[0];
         ko.applyBindings(this.fooViewModel, element);
         ko.removeNode(element);
         setTimeout((function() {
            expect(this.parentUnboundFromElement.calledOnce).to.be.true();
            expect(this.parentUnboundFromElement.calledWith(element)).to.be.true();
            done();
         }).bind(this), 0);
      });

      it('should call boundToElement/unboundFromElement when child is changed out', function(done) {
         var element = $('<div data-bind="child: child"></div>')[0];
         ko.applyBindings(this.fooViewModel, element);
         
         var newChild = new ViewModel();
         var newChildBoundToElement = sinon.spy(newChild, 'boundToElement');
         this.fooViewModel.child(newChild);

         setTimeout((function() {
            expect(this.parentUnboundFromElement.calledOnce).to.be.true();
            expect(this.parentUnboundFromElement.calledWith(element)).to.be.true();
            expect(newChildBoundToElement.calledOnce).to.be.true();
            expect(newChildBoundToElement.calledWith(element)).to.be.true();
            done();
         }).bind(this), 0);
      });
   });
});
