//= require base.js
//= require view-models/content-view-model.js
//= require view-models/control-view-model.js

describe('viewmodels.ContentViewModel', function() {

   var ContentViewModel = cmRequire('viewmodels.ContentViewModel');
   var ControlViewModel = cmRequire('viewmodels.ControlViewModel');

   describe('constructor', function() {

      it('should set template if supplied to constructor', function() {
         var vm = new ContentViewModel('foobar');
         expect(vm.getTemplate()).to.equal('foobar');
      });
   });

   describe('addControlAtKey', function() {

      it('should add the control', function() {
         var contentVM = new ContentViewModel();
         var control = new ControlViewModel(0);
         contentVM.addControlAtKey('foo', control);
         expect(contentVM.getControlsForKey('foo')).to.include(control);
      });
   });

   describe('removeControlAtKey', function() {

      it('should return false when the control isn\'t at the given key', function() {
         var contentVM = new ContentViewModel();
         var control = new ControlViewModel(0);
         contentVM.addControlAtKey('foo', control);
         expect(contentVM.removeControlAtKey('bar', control)).to.be.false();
      });

      it('should return false when control isn\'t owned by the view model', function() {
         var childContentVM = new ContentViewModel();
         var parentContentVM = new ContentViewModel();
         parentContentVM.addChild(childContentVM);
         
         var control = new ControlViewModel(0);
         childContentVM.addControlAtKey('foo', control);

         expect(parentContentVM.removeChildAtKey('foo', control)).to.be.false();
      });

      it('should return true when the control is at given key', function() {
         var contentVM = new ContentViewModel();
         var control = new ControlViewModel(0);
         contentVM.addControlAtKey('foo', control);
         expect(contentVM.removeControlAtKey('foo', control)).to.be.true();
      });

      it('should remove the control when the control is at given key', function() {
         var contentVM = new ContentViewModel();
         var control = new ControlViewModel(0);
         contentVM.addControlAtKey('foo', control);
         contentVM.removeControlAtKey('foo', control);
         expect(contentVM.getControlsForKey('foo')).to.not.include(control);
      });      
   });

   describe('getControlsForKey', function() {

      it('should return an empty array for a key without controls', function() {
         var contentVM = new ContentViewModel();
         expect(contentVM.getControlsForKey('foo')).to.have.length(0);
      });

      it('should return the controls for the given key', function() {
         var contentVM = new ContentViewModel();
         var control = new ControlViewModel(0);
         contentVM.addControlAtKey('foo', control);
         expect(contentVM.getControlsForKey('foo')).to.include(control);
      });

      it('should return children\'s controls for the given key', function() {
         var childContentVM = new ContentViewModel();
         var parentContentVM = new ContentViewModel();
         parentContentVM.addChild(childContentVM);
         
         var control = new ControlViewModel(0);
         childContentVM.addControlAtKey('foo', control);
         expect(parentContentVM.getControlsForKey('foo')).to.include(control);
      });

      it('should return controls for the given key in order', function() {
         var childContentVM = new ContentViewModel();
         var parentContentVM = new ContentViewModel();
         parentContentVM.addChild(childContentVM);
         
         var control1 = new ControlViewModel(0);
         var control2 = new ControlViewModel(1);
         var control3 = new ControlViewModel(2);
         parentContentVM.addControlAtKey('foo', control3);
         parentContentVM.addControlAtKey('foo', control1);
         childContentVM.addControlAtKey('foo', control2);

         var controls = parentContentVM.getControlsForKey('foo');
         expect(controls).to.include.members([control1, control2, control3]);
         expect(controls[0]).to.equal(control1);
         expect(controls[1]).to.equal(control2);
         expect(controls[2]).to.equal(control3);
      });
   });
   
   describe('getControlsObservableForKey', function() {

      it('should return an observable that is updated when a control is added to viewmodel', function(done) {
         var contentVM = new ContentViewModel();
         var control = new ControlViewModel(0);
         var observable = contentVM.getControlsObservableForKey('foo');
         observable.subscribe(function(controls) {
            expect(controls).to.include(control);
            done();
         });
         contentVM.addControlAtKey('foo', control);
      });

      it('should return an observable that is updated when a control is added to child', function(done) {
         var parentContentVM = new ContentViewModel();
         var childContentVM = new ContentViewModel();
         parentContentVM.addChild(childContentVM);
         var observable = parentContentVM.getControlsObservableForKey('foo');
         observable.subscribe(function(controls) {
            expect(controls).to.include(control);
            done();
         });
         var control = new ControlViewModel(0);
         childContentVM.addControlAtKey('foo', control);
      });

      it('should return an observable that is updated when a child is added', function(done) {
         var parentContentVM = new ContentViewModel();
         var observable = parentContentVM.getControlsObservableForKey('foo');
         var control = new ControlViewModel(0);
         observable.subscribe(function(controls) {
            expect(controls).to.include(control);
            done();
         });
         var childContentVM = new ContentViewModel();
         childContentVM.addControlAtKey('foo', control);
         parentContentVM.addChild(childContentVM);
      });

      it('should return an observable that is updated when a child is removed', function(done) {
         var parentContentVM = new ContentViewModel();
         var childContentVM = new ContentViewModel();
         parentContentVM.addChild(childContentVM);
         var control = new ControlViewModel(0);
         childContentVM.addControlAtKey('foo', control);

         var observable = parentContentVM.getControlsObservableForKey('foo');
         observable.subscribe(function(controls) {
            expect(controls).to.not.include(control);
            done();
         });
         parentContentVM.removeChild(childContentVM);
      });
   });
});
