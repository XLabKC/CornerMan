#= require base.js
#= require view-models/view-model.js

ViewModel = require("viewmodel.ViewModel")

describe "lib/vm/ViewModel", ->

   beforeEach ->
      @parent = new ViewModel()
      @child = new ViewModel()
      @parent.children_["foo"] = ko.observable(@child)
      @parent.childrenObservable_.push(@child)
      @child.parent_(@parent)
      @parentChildAdded = sinon.spy(@parent, "childAdded")
      @parentChildRemoved = sinon.spy(@parent, "childRemoved")
      @parentBoundToElement = sinon.spy(@parent, "boundToElement")
      @parentUnboundFromElement = sinon.spy(@parent, "unboundFromElement")
      @childAddedToParent = sinon.spy(@child, "addedToParent")
      @childRemovedFromParent = sinon.spy(@child, "removedFromParent")
      @childBoundToElement = sinon.spy(@child, "boundToElement")
      @childUnboundFromElement = sinon.spy(@child, "unboundFromElement")

   describe "constructor", ->

      it "should set template if supplied to constructor", ->
         vm = new ViewModel("foobar")
         expect(vm.template()).to.equal("foobar")

   describe "getChildren", ->

      it "should return an empty array if the viewmodel has no children", ->
         vm = new ViewModel()
         expect(vm.getChildren()).to.have.length(0)

      it "should return an array of the children", ->
         children = @parent.getChildren()
         expect(children).to.have.length(1)
         expect(children).to.contain(@child)

   describe "getChild", ->

      it "should return null if the child does not exist", ->
         expect(@parent.getChild("key")).to.be.null()

      it "should return the child if it exists", ->
         expect(@parent.getChild("foo")).to.equal(@child)

   describe "getChildObservable", ->

      it "should return new observable if the child does not exist", ->
         result = @parent.getChildObservable("key")
         expect(result).to.be.an.instanceof(Function)
         expect(result()).to.be.null()

      it "should return the observable containing child if child exists", ->
         result = @parent.getChildObservable("foo")
         expect(result).to.be.an.instanceof(Function)
         expect(result()).to.equal(@child)

   describe "getKeyForChild", ->

      it "should return null if the child does not exist", ->
         other = new ViewModel()
         expect(@parent.getKeyForChild(other)).to.be.null()

      it "should return the key for the supplied child if it exists", ->
         expect(@parent.getKeyForChild(@child)).to.equal("foo")

   describe "setChild", ->

      beforeEach ->
         @newChild = new ViewModel() 
         @newChildAddedToParent = sinon.spy(@newChild, "addedToParent")
         @newChildRemovedFromParent = sinon.spy(@newChild, "removedFromParent")

      it "should set the child for the supplied key", ->
         @parent.setChild("new", @newChild)
         expect(@parent.children_["new"]).to.be.an.instanceof(Function)
         expect(@parent.children_["new"]()).to.equal(@newChild)

      it "should add the new child to the children observable", ->
         @parent.setChild("new", @newChild)
         expect(@parent.childrenObservable_()).to.contain(@newChild)

      it "should call 'childAdded' when a child is added", ->
         @parent.setChild("new", @newChild)
         expect(@parentChildAdded.calledOnce).to.be.true()
         expect(@parentChildAdded.calledWith(@newChild, "new")).to.be.true()

      it "should call 'childRemoved' when a child is removed", ->
         @parent.setChild("foo", null)
         expect(@parentChildRemoved.calledOnce).to.be.true()
         expect(@parentChildRemoved.calledWith(@child, "foo")).to.be.true()

      it "should call 'addedToParent' when a child is added to parent", ->
         @parent.setChild("new", @newChild)
         expect(@newChildAddedToParent.calledOnce).to.be.true()
         expect(@newChildAddedToParent.calledWith(@parent, "new")).to.be.true()

      it "should remove the child from the children observable", ->
         @parent.setChild("foo", null)
         expect(@parent.getChildren()).to.have.length(0)

      it "should call 'removedFromParent' when called with null", ->
         @parent.setChild("foo", null)
         expect(@childRemovedFromParent.calledOnce).to.be.true()
         expect(@childRemovedFromParent.calledWith(@parent, "foo")).to.be.true()

      it "should remove the existing child if setting a new child over an old one", ->
         @parent.setChild("foo", @newChild)
         # Check that childAdded was called on parent.
         expect(@parentChildAdded.calledOnce).to.be.true()
         expect(@parentChildAdded.calledWith(@newChild, "foo")).to.be.true()

         # Check that addedToParent was called on child.
         expect(@newChildAddedToParent.calledOnce).to.be.true()
         expect(@newChildAddedToParent.calledWith(@parent, "foo")).to.be.true()

         # Check that childRemoved was called on old child.
         expect(@parentChildRemoved.calledOnce).to.be.true()
         expect(@parentChildRemoved.calledWith(@child, "foo")).to.be.true()

         # Check that removedFromParent was called on child.
         expect(@childRemovedFromParent.calledOnce).to.be.true()
         expect(@childRemovedFromParent.calledWith(@parent, "foo")).to.be.true()

   describe "bound/unbound", ->

      class FooViewModel extends ViewModel
         constructor: (child) ->
            @child = ko.observable(child)
         
      beforeEach ->
         @fooViewModel = new FooViewModel(@parent)

      it "should call boundToElement on child when child is bound", (done) ->
         element = $("<div data-bind='child: child'></div>")[0]
         ko.applyBindings(@fooViewModel, element)
         setTimeout =>
            expect(@parentBoundToElement.calledOnce).to.be.true()
            expect(@parentBoundToElement.calledWith(element)).to.be.true()
            done()
         , 0

      it "should call unboundFromElement on child when element is deleted", (done) ->
         element = $("<div data-bind='child: child'></div>")[0]
         ko.applyBindings(@fooViewModel, element)
         ko.removeNode(element)
         setTimeout =>
            expect(@parentUnboundFromElement.calledOnce).to.be.true()
            expect(@parentUnboundFromElement.calledWith(element)).to.be.true()
            done()
         , 0

      it "should call boundToElement/unboundFromElement when child is changed out", (done) ->
         element = $("<div data-bind='child: child'></div>")[0]
         ko.applyBindings(@fooViewModel, element)
         
         newChild = new ViewModel()
         newChildBoundToElement = sinon.spy(newChild, "boundToElement")
         @fooViewModel.child(newChild)

         setTimeout =>
            expect(@parentUnboundFromElement.calledOnce).to.be.true()
            expect(@parentUnboundFromElement.calledWith(element)).to.be.true()
            expect(newChildBoundToElement.calledOnce).to.be.true()
            expect(newChildBoundToElement.calledWith(element)).to.be.true()
            done()
         , 0
