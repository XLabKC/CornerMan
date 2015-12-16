//= require base.js
//= require view-models/content-view-model.js
//= require view-models/control-view-model.js

describe('viewmodels.ContentViewModel', function() {

   var ContentViewModel = cmRequire('viewmodels.ContentViewModel');
   var ControlViewModel = cmRequire('viewmodels.ControlViewModel');

   beforeEach(function() {
      this.parentControl = new ControlViewModel('foo', 0);
      this.childControl = new ControlViewModel('foo', 3);
      this.child = new ContentViewModel();
      this.child.controlSetsInternal_['foo'] = ko.observableArray([this.childControl]);
      this.parent = new ContentViewModel();
      this.parent.controlSetsInternal_['foo'] = ko.observableArray([this.parentControl]);
      this.parent.setChild('bar', this.child);
   });

   describe('constructor', function() {

      it('should set template if supplied to constructor', function() {
         var vm = new ContentViewModel('foobar');
         expect(vm.template()).to.equal('foobar');
      });
   });

   describe('addControl', function() {

      it('should add the control if none already at key', function() {
         var control = new ControlViewModel('template', 0);
         this.child.addControl('blah', control);
         expect(this.child.controlSetsInternal_['blah']()).to.have.length(1);
         expect(this.child.controlSetsInternal_['blah']()).to.contain(control);
      });

      it('should add the control if some already exist at key', function() {
         var control = new ControlViewModel('template', 0);
         this.child.addControl('foo', control);
         expect(this.child.controlSetsInternal_['foo']()).to.have.length(2);
         expect(this.child.controlSetsInternal_['foo']()).to.contain(control);
      });
   });

   describe('removeControl', function() {

      it('should remove existing control', function() {
         this.child.removeControl('foo', this.childControl);
         expect(this.child.controlSetsInternal_['foo']()).to.have.length(0);
      });
   });

   describe('getControlSetObservable', function() {

      it('should return an observable for a key without controls', function() {
         var set = this.child.getControlSetObservable('bar');
         expect(set).to.be.an.instanceof(Function);
      });

      it('should return an observable with no length for a key without controls', function() {
         var set = this.child.getControlSetObservable('bar');
         expect(set()).to.have.length(0);
      });

      it('should return an observable with controls for a key with controls', function() {
         var set = this.child.getControlSetObservable('foo');
         expect(set()).to.have.length(1);
         expect(set()).to.contain(this.childControl);
      });

      it('should return an observable including controls from child viewmodels', function() {
         var set = this.parent.getControlSetObservable('foo');
         expect(set()).to.have.length(2);
         expect(set()).to.contain(this.childControl);
         expect(set()).to.contain(this.parentControl);
      });

      it('should return an observable including controls from child viewmodels sorted by order', function() {
         var set = this.parent.getControlSetObservable('foo');
         expect(set()).to.have.length(2);
         expect(set()[0].order()).to.equal(0);
         expect(set()[1].order()).to.equal(3);
      });

      it('should return an observable that is updated when a control is added to viewmodel', function(done) {
         var control = new ControlViewModel('template', 0);
         var set = this.child.getControlSetObservable('bar');
         set.subscribe(function(controls) {
            expect(controls).to.have.length(1);
            expect(controls).to.contain(control);
            done();
         });
         this.child.addControl('bar', control);
      });

      it('should return an observable that is updated when a control is added to child', function(done) {
         control = new ControlViewModel('template', 0);
         var set = this.parent.getControlSetObservable('bar');
         set.subscribe(function(controls) {
            expect(controls).to.have.length(1);
            expect(controls).to.contain(control);
            done();
         });
         this.child.addControl('bar', control);
      });

      it('should return an observable that is updated when a child is added', function(done) {
         control = new ControlViewModel('template', 1);
         newChild = new ContentViewModel();
         newChild.addControl('bar', control);
         var set = this.parent.getControlSetObservable('bar');
         set.subscribe(function(controls) {
            expect(controls).to.have.length(1);
            expect(controls).to.contain(control);
            done()
         });
         this.parent.setChild('new', newChild);
      });

      it('should return an observable that is updated when a child is removed', function(done) {
         var set = this.parent.getControlSetObservable('foo')
         set.subscribe((function(controls) {
            expect(controls).to.have.length(1);
            expect(controls).to.contain(this.parentControl);
            expect(controls).to.not.contain(this.childControl);
            done();
         }).bind(this));
         this.parent.setChild('bar', null);
      });
   });
});
