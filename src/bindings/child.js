//= require base.js
//= require view-models/view-model.js

(function() {
   var ViewModel = cm.require('viewmodels.ViewModel');
   
   // Use this function to minimize what is retained in the closure.
   var createValueAccessorFn = function(data) {
      var data = data;
      return function() {
         return data;
      };
   };

   var createTemplateAccessorFnForChildren = function(children, ifCondition) {
      if (CM_ASSERT_TYPES) {
         cm.assertArgs(arguments, cm.arrayOf(ViewModel), [cm.nullable(Function), Boolean]);  
      }
      var templateFn = function(child) {
         return child.getTemplate();
      }
      return function() {
         return {
            'name': templateFn,
            'foreach': children,
            'if': ifCondition,
            'templateEngine': ko.cornerManTemplateEngine || null
         };
      };
   };

   var makeTemplateValueAccessor = function(element, valueAccessor, viewModel, asChildren) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, Node, Function, cm.anything(), Boolean);
      var value = ko.unwrap(valueAccessor());
      
      // If there is no value, just return null and don't do anything.
      if (!value) {
         return null;
      }
      if (CM_ASSERT_TYPES) {
         cm.assertOfType(value, [String, ViewModel, cm.arrayOf(ViewModel), Object]);
      }
      var child = null;
      var children = null;
      var ifCondition = true
      var captureChildOrChildren = function(value) {
         if (value instanceof ViewModel) {
            // A view model is being supplied as the value.
            child = value;
         } else if (value instanceof Array) {
            if (CM_ASSERT_TYPES) cm.assertOfType(value, cm.arrayOf(ViewModel));
            // An array of view models is being supplied. Take the first child if asChildren option
            // is false.
            if (asChildren) {
               children = value;
            } else {
               child = value[0];
               if (!child) {
                  // Just return if the array is actually empty.
                  return null;
               }
            }
         }
      };
      if (value instanceof ViewModel || value instanceof Array) {
         if (CM_ASSERT_TYPES) cm.assertOfType(value, [ViewModel, cm.arrayOf(ViewModel)]);
         captureChildOrChildren(value);
      } else {
         // If the view model is not being supplied as a value, the view model parent must be
         // supplied.
         if (CM_ASSERT_TYPES) cm.assertOfType(viewModel, ViewModel);
         if (typeof value === 'string') {
            // A key to the child was provided as the value, use the parent view model to fetch the
            // actual child.
            captureChildOrChildren(viewModel.getChildrenForKey(value));
         } else {
            if (CM_ASSERT_TYPES) cm.assertOfType(value, Object);
            var childrenArray = (typeof value['data'] === 'string') ?
                  viewModel.getChildrenForKey(value['data']) :
                  value['data'];
            captureChildOrChildren(childrenArray);
            ifCondition = value['if'] ? value['if'] : ifCondition;
         }
      }
      if (child) {
         return createValueAccessorFn({
            'name': child.template_,
            'data': child,
            'if': ifCondition,
            'templateEngine': ko.cornerManTemplateEngine || null
         });
      } else if (children) {
         return createTemplateAccessorFnForChildren(children, ifCondition);
      }
      return createValueAccessorFn({});
   };

   var attachToKnockout = function() {
      var templateInit = ko.bindingHandlers.template.init;
      var templateUpdate = ko.bindingHandlers.template.update;

      // Add child to the knockout binding handles.
      ko.bindingHandlers.child = {
         'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var accessor = makeTemplateValueAccessor(element, valueAccessor,
                  bindingContext['$data'], false);
            if (accessor) {
               return templateInit(element, accessor, allBindings, viewModel, bindingContext);
            };
         },
         'update': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var accessor = makeTemplateValueAccessor(element, valueAccessor,
                  bindingContext['$data'], false);
            if (accessor) {
               return templateUpdate(element, accessor, allBindings, viewModel, bindingContext);
            }
         }
      };
      // Add children to the knockout binding handles.
      ko.bindingHandlers.children = {
         'init': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var accessor = makeTemplateValueAccessor(element, valueAccessor,
                  bindingContext['$data'], true);
            if (accessor) {
               return templateInit(element, accessor, allBindings, viewModel, bindingContext);
            };
         },
         'update': function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var accessor = makeTemplateValueAccessor(element, valueAccessor,
                  bindingContext['$data'], true);
            if (accessor) {
               return templateUpdate(element, accessor, allBindings, viewModel, bindingContext);
            }
         } 
      }
   };

   cm.define('bindings.Child', {
      attachToKnockout: attachToKnockout
   });
})();
