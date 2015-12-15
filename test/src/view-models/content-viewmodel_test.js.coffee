#= require base.js
#= require view-models/content-view-model.js
#= require view-models/control-view-model.js

ContentViewModel = require("viewmodels.ContentViewModel")
ControlViewModel = require("viewmodels.ControlViewModel")

describe "lib/vm/ContentViewModel", ->

   beforeEach ->
      @parentControl = new ControlViewModel("foo", 0)
      @childControl = new ControlViewModel("foo", 3)
      @child = new ContentViewModel()
      @child.controlSetsInternal_["foo"] = ko.observableArray([@childControl])
      @parent = new ContentViewModel()
      @parent.controlSetsInternal_["foo"] = ko.observableArray([@parentControl])
      @parent.setChild("bar", @child)

   describe "constructor", ->

      it "should set template if supplied to constructor", ->
         vm = new ContentViewModel("foobar")
         expect(vm.template()).to.equal("foobar")

      it "should set title if supplied to constructor", ->
         vm = new ContentViewModel("foobar", "title")
         expect(vm.title()).to.equal("title")

      it "should set subtitle if supplied to constructor", ->
         vm = new ContentViewModel("foobar", "title", "subtitle")
         expect(vm.subtitle()).to.equal("subtitle")

   describe "setTitle", ->

      it "should set the title", ->
         @child.setTitle("title")
         expect(@child.title()).to.equal("title")

   describe "title", ->

      it "should return the title that has been set on the view model", ->
         @parent.setTitle("foo")
         expect(@parent.title()).to.equal("foo")

      it "should return the title from its children if any exist", ->
         @child.setTitle("bar")
         expect(@parent.title()).to.equal("bar")

      it "should return empty string if title has not been set on parent or any of the children", ->
         expect(@parent.title()).to.equal("")

   describe "setSubtitle", ->

      it "should set the subtitle", ->
         @child.setSubtitle("subtitle")
         expect(@child.subtitle()).to.equal("subtitle")

   describe "subtitle", ->

      it "should return the subtitle that has been set on the viewmodel", ->
         @parent.setSubtitle("foo")
         expect(@parent.subtitle()).to.equal("foo")

      it "should return the subtitle from its children if any exist", ->
         @child.setSubtitle("bar")
         expect(@parent.subtitle()).to.equal("bar")

      it "should return empty string if subtitle has not been set on parent or any of the children", ->
         expect(@parent.subtitle()).to.equal("")

   describe "addControl", ->

      it "should add the control if none already at key", ->
         control = new ControlViewModel("template", 0)
         @child.addControl("blah", control)
         expect(@child.controlSetsInternal_["blah"]()).to.have.length(1)
         expect(@child.controlSetsInternal_["blah"]()).to.contain(control)

      it "should add the control if some already exist at key", ->
         control = new ControlViewModel("template", 0)
         @child.addControl("foo", control)
         expect(@child.controlSetsInternal_["foo"]()).to.have.length(2)
         expect(@child.controlSetsInternal_["foo"]()).to.contain(control)

   describe "removeControl", ->

      it "should remove existing control", ->
         @child.removeControl("foo", @childControl)
         expect(@child.controlSetsInternal_["foo"]()).to.have.length(0)

   describe "getControlSetObservable", ->

      it "should return an observable for a key without controls", ->
         set = @child.getControlSetObservable("bar")
         expect(set).to.be.an.instanceof(Function)

      it "should return an observable with no length for a key without controls", ->
         set = @child.getControlSetObservable("bar")
         expect(set()).to.have.length(0)

      it "should return an observable with controls for a key with controls", ->
         set = @child.getControlSetObservable("foo")
         expect(set()).to.have.length(1)
         expect(set()).to.contain(@childControl)

      it "should return an observable including controls from child viewmodels", ->
         set = @parent.getControlSetObservable("foo")
         expect(set()).to.have.length(2)
         expect(set()).to.contain(@childControl)
         expect(set()).to.contain(@parentControl)

      it "should return an observable including controls from child viewmodels sorted by order", ->
         set = @parent.getControlSetObservable("foo")
         expect(set()).to.have.length(2)
         expect(set()[0].order()).to.equal(0)
         expect(set()[1].order()).to.equal(3)

      it "should return an observable that is updated when a control is added to viewmodel", (done) ->
         control = new ControlViewModel("template", 0)
         set = @child.getControlSetObservable("bar")
         set.subscribe (controls) ->
            expect(controls).to.have.length(1)
            expect(controls).to.contain(control)
            done()

         @child.addControl("bar", control)

      it "should return an observable that is updated when a control is added to child", (done) ->
         control = new ControlViewModel("template", 0)
         set = @parent.getControlSetObservable("bar")
         set.subscribe (controls) ->
            expect(controls).to.have.length(1)
            expect(controls).to.contain(control)
            done()

         @child.addControl("bar", control)

      it "should return an observable that is updated when a child is added", (done) ->
         control = new ControlViewModel("template", 1)
         newChild = new ContentViewModel()
         newChild.addControl("bar", control)
         set = @parent.getControlSetObservable("bar")
         set.subscribe (controls) ->
            expect(controls).to.have.length(1)
            expect(controls).to.contain(control)
            done()
         @parent.setChild("new", newChild)

      it "should return an observable that is updated when a child is removed", (done) ->
         set = @parent.getControlSetObservable("foo")
         set.subscribe (controls) =>
            expect(controls).to.have.length(1)
            expect(controls).to.contain(@parentControl)
            expect(controls).to.not.contain(@childControl)
            done()
         @parent.setChild("bar", null)
