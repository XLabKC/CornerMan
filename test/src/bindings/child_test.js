//= require base.js
//= require bindings/child.js
//= require view-models/view-model.js

describe('bindings.Child', function() {
   
   var Child = cmRequire('bindings.Child');
   var ViewModel = cmRequire('viewmodels.ViewModel');

   var TextTemplate = '<script type="text/html" id="text-template">Hello World</script>'

   function ViewModelWithChildProperty(child) {
      assertArgs(arguments, ViewModel);
      ViewModel.call(this);
      this.child = this.childObservable(child, {key: 'key'});
   };
   cmInherit(ViewModelWithChildProperty, ViewModel);

   before(function() {
      Child.attachToKnockout();
   });

   describe('child', function() {
      
      it('should bind a supplied view model', function(done) {
         var $template = $(TextTemplate).appendTo('body');
         var $element = $('<div data-bind="child: child"></div>');
         var child = new ViewModel('text-template');
         var vm = new ViewModelWithChildProperty(child);
         ko.applyBindings(vm, $element[0]);
         setTimeout(function() {
            expect($element.html()).to.equal('Hello World');
            done();
         }, 0);
      });

      it('should bind the view model at a supplied key', function(done) {
         var $template = $(TextTemplate).appendTo('body');
         var $element = $('<div data-bind="child: \'key\'"></div>');
         var child = new ViewModel('text-template');
         var vm = new ViewModelWithChildProperty(child);
         ko.applyBindings(vm, $element[0]);
         setTimeout(function() {
            expect($element.html()).to.equal('Hello World');
            done();
         }, 0);
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
