#= require base.js
#= require view-models/control-view-model.js

ControlViewModel = require("viewmodels.ControlViewModel")

describe "lib/vm/ControlViewModel", ->

   describe "constructor", ->

      it "should set template if supplied to constructor", ->
         vm = new ControlViewModel("foobar", 0)
         expect(vm.template()).to.equal("foobar")

      it "should set the order", ->
         vm = new ControlViewModel("foobar", 0)
         expect(vm.order()).to.equal(0)
