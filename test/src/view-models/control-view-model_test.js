//= require base.js
//= require view-models/control-view-model.js


describe('viewmodels.ControlViewModel', function() {
   
   var ControlViewModel = cmRequire('viewmodels.ControlViewModel');

   describe('constructor', function() {

      it('should set template if supplied to constructor', function() {
         var vm = new ControlViewModel('foobar', 0);
         expect(vm.template()).to.equal('foobar');
      });

      it('should set the order', function() {
         var vm = new ControlViewModel('foobar', 0);
         expect(vm.order()).to.equal(0);
      });
   });
});