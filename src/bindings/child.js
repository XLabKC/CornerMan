//= require base.js

(function() {

   var templateInit = ko.bindingHandlers.template.init
   var templateUpdate = ko.bindingHandlers.template.update

   var BOUND_ELEMENT = 'corner-man:child-boundElement';
   // var jstTemplateEngine = new ko.jstTemplateEngine()

   // Use this function to minimize what is retained in the closure.
   var createValueAccessorFn = function(data) {
      var data = data;
      return function() {
         return data;
      };
   };

   var makeTemplateValueAccessor = function(element, valueAccessor, viewModel) {
      assertArgs(arguments, Node, Function, anything());
      var value = ko.unwrap(valueAccessor());
      
      // If there is no value, just return null and don't do anything.
      if (!value) {
         return null;
      }

      var ViewModel = cmRequire("viewmodels.ViewModel");
      assertOfType(value, [String, ViewModel, Object]);
      var child = null;
      var ifCondition = true

      if (value instanceof ViewModel) {
         // A view model is being supplied as the value.
         child = value;
      } else {
         // If the view model is not being supplied as a value, the view model parent must be
         // supplied.
         assertOfType(viewModel, ViewModel);
         if ((value instanceof Object) && value['data']) {
            assertOfType(value.data, [String, ViewModel]);
            if (value['data'] instanceof ViewModel) {
               // The view model to present was supplied in the object.
               child = value['data'];
            } else {
               // A key to the child was supplied, use the parent view model to fetch the actual
               // child.
               child = ko.unwrap(viewModel.getChildObservable(value['data']));
            }
            ifCondition = value['if'] ? value['if'] : ifCondition;
         } else {
            // A key to the child was provided as the value, use the parent view model to fetch the
            // actual child.
            child = ko.unwrap(viewModel.getChildObservable(value));
         }
      }
      if (!child) {
         return createValueAccessorFn({});
      }
      var currentChild = ko.utils.domData.get(element, BOUND_ELEMENT);
      if (currentChild != child) {
         // The child has been changed, notify the old child and the new child.
         if (currentChild) {
            currentChild.unboundFromElement_(element);   
         }
         child.boundToElement_(element);
         ko.utils.domData.set(element, BOUND_ELEMENT, child);
      }
      return createValueAccessorFn({
         'name': child.template,
         'data': child,
         // 'templateEngine': jstTemplateEngine,
         'if': ifCondition   
      });
   };

   // Add child to the knockout binding handles.
   ko.bindingHandlers.child = {
      'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
         ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
            var currentChild = ko.utils.domData.get(element, BOUND_ELEMENT);
            if (currentChild) {
               currentChild.unboundFromElement_(element);   
            }
         });
         var accessor = makeTemplateValueAccessor(element, valueAccessor, bindingContext['$data']);
         if (accessor) {
            return templateInit(element, accessor, allBindings, viewModel, bindingContext);
         };
      },
      'update': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
         var accessor = makeTemplateValueAccessor(element, valueAccessor, bindingContext['$data']);
         if (accessor) {
            return templateUpdate(element, accessor, allBindings, viewModel, bindingContext);
         }
      }
   };
})();
