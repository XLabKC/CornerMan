/*!
 * CornerMan JavaScript library v1.0.0
 * License: MIT (http://www.opensource.org/licenses/mit-license.php)
 */
(function() {
   (function(scope) {
      var root = {};
      scope.cm = {
         inherit: function(subClass, superClass) {
            subClass.prototype = Object.create(superClass.prototype);
            subClass.prototype.constructor = subClass;
         },
         define: function(namespace, obj) {
            var namespace = namespace.replace(/\./g, "$");
            if (root[namespace]) throw Error("Namespace already exists: " + namespace);
            root[namespace] = obj;
         },
         require: function(namespace) {
            var namespace = namespace.replace(/\./g, "$");
            if (!root[namespace]) throw Error("Unknown namespace: " + namespace);
            return root[namespace];
         }
      };
   })(this);
   (function() {
      var AVAILABLE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      var RANDOM_KEY_LENGTH = 10;
      function ViewModel(template) {
         this.template_ = ko.observable(template || null);
         this.hasTemplate = ko.pureComputed(this.computeHasTemplate_.bind(this));
         this.parent_ = ko.observable(null);
         this.parent_.subscribe(this.onParentWillChange_, this, "beforeChange");
         this.parent_.subscribe(this.onParentChanged_, this, "change");
         this.keys_ = ko.observableArray();
         this.keysToChildrenObservables_ = {};
         this.childrenObservable_ = ko.pureComputed(this.computeChildrenObservable_.bind(this));
         this.eventsToListeners_ = {};
         // Map from children to keys at which they used to reside.
         this.recentlyRemovedChildrenToKeys_ = {};
      }
      ViewModel.Events = {
         CHILD_ADDED: "child-added",
         CHILD_MOVED: "child-moved",
         CHILD_REMOVED: "child-removed",
         MOVED_KEYS: "self-moved-keys",
         ADDED_TO_PARENT: "self-added-to-parent",
         REMOVED_FROM_PARENT: "self-removed-from-parent"
      };
      /** Generates a key. */
      ViewModel.generateKey = function() {
         var length = RANDOM_KEY_LENGTH;
         var characters = AVAILABLE_CHARACTERS;
         if (1 === arguments.length && "number" === typeof arguments[0]) length = arguments[0]; else if (1 === arguments.length && "string" === typeof arguments[0]) characters = arguments[0]; else if (2 === arguments.length) {
            length = arguments[0];
            characters = arguments[1];
         }
         keySegments = [];
         for (var i = 0; i < length; i++) keySegments.push(characters.charAt(Math.floor(Math.random() * characters.length)));
         return keySegments.join("");
      };
      /**
    * Creates an observable that can have a value of a view model or null. The value is set a child
    * of the given view model, at the given key.
    */
      ViewModel.createChildObservable = function(viewModel, key, initialValue) {
         key = key || ViewModel.generateKey();
         var observable = ko.pureComputed({
            read: function() {
               return viewModel.getChildrenForKey(key)[0] || null;
            },
            write: function(child) {
               viewModel.getChildrenForKey(key)[0] !== child && viewModel.replaceChildrenAtKey(key, child ? [ child ] : []);
            },
            owner: viewModel
         });
         observable.key_ = key;
         observable.viewModel_ = viewModel;
         observable["getKey"] = function() {
            return observable.key_;
         };
         observable["getViewModel"] = function() {
            return observable.viewModel_;
         };
         observable(initialValue);
         return observable;
      };
      /**
    * Creates an observable that can have a value of an array of view models. The values
    * (view models) are set as children of the given view model, at the given key.
    */
      ViewModel.createChildrenObservable = function(viewModel, key, initialValue) {
         var observable = ko.observableArray();
         observable.subscribe(handleChildrenObservableChanged.bind(viewModel, viewModel, key), null, "arrayChange");
         observable.key_ = key;
         observable.viewModel_ = viewModel;
         observable["getKey"] = function() {
            return observable.key_;
         };
         observable["getViewModel"] = function() {
            return observable.viewModel_;
         };
         initialValue && observable(initialValue);
         return observable;
      };
      /** Shortcut for {@code ViewModel.createChildObservable}. */
      ViewModel.prototype.childObservable = function(initialValue, options) {
         options = options || {};
         var key = options["key"] || ViewModel.generateKey();
         var viewModel = options["viewModel"] || this;
         return ViewModel.createChildObservable(viewModel, key, initialValue);
      };
      /** Shortcut for {@code ViewModel.createChildrenObservable}. */
      ViewModel.prototype.childrenObservable = function(initialValue, options) {
         options = options || {};
         var key = options["key"] || ViewModel.generateKey();
         var viewModel = options["viewModel"] || this;
         return ViewModel.createChildrenObservable(viewModel, key, initialValue);
      };
      /** Adds a listener for the given event. */
      ViewModel.prototype.addListener = function(event, callback) {
         this.eventsToListeners_[event] || (this.eventsToListeners_[event] = []);
         this.eventsToListeners_[event].push(callback);
      };
      /** Removes the listener. */
      ViewModel.prototype.removeListener = function(listener) {
         var found = false;
         for (var type in this.eventsToListeners_) {
            var listeners = this.eventsToListeners_[type];
            for (var i = 0; i < listeners.length; i++) if (listener === listeners[i]) {
               found = true;
               listeners.splice(i, 1);
               i--;
            }
         }
         return found;
      };
      /** Returns the parent for this view model or null. */
      ViewModel.prototype.getParent = function() {
         return this.parent_();
      };
      /** Returns the template for this view model or null. */
      ViewModel.prototype.getTemplate = function() {
         return this.template_();
      };
      /** Returns the keys for this view model or an empty array. */
      ViewModel.prototype.getKeys = function() {
         return this.keys_();
      };
      /** Returns the observable containing the keys for this view model. */
      ViewModel.prototype.getKeysObservable = function() {
         return this.keys_;
      };
      /** Returns all of the children view models for this view model. */
      ViewModel.prototype.getChildren = function() {
         return this.childrenObservable_();
      };
      /** Returns an observable containing all of the children view models for this view model. */
      ViewModel.prototype.getChildrenObservable = function() {
         return this.childrenObservable_;
      };
      /** Returns the children of this view model for the given key. */
      ViewModel.prototype.getChildrenForKey = function(key) {
         return this.getChildrenObservableForKey(key)();
      };
      /** Returns an observable containing the children of this view model for the given key. */
      ViewModel.prototype.getChildrenObservableForKey = function(key) {
         if (!this.keysToChildrenObservables_[key]) {
            this.keysToChildrenObservables_[key] = ko.observableArray([]);
            this.keys_.push(key);
         }
         return this.keysToChildrenObservables_[key];
      };
      /** Returns the key for the given child view model or null. */
      ViewModel.prototype.getKeyForChild = function(viewModel) {
         var keys = this.keys_();
         if (viewModel.getParent() != this) return null;
         for (var i = 0, len = keys.length; i < len; i++) {
            var childrenObservable = this.getChildrenObservableForKey(keys[i]);
            if (-1 != childrenObservable.indexOf(viewModel)) return keys[i];
         }
         return null;
      };
      /** Adds the given view model as a child of this view model at the given key. */
      ViewModel.prototype.addChildAtKey = function(key, viewModel) {
         var currentParent = viewModel.getParent();
         if (currentParent === this) {
            // Handle when a child is moving from one key to another within the same parent.
            var currentKey = currentParent.getKeyForChild(viewModel);
            if (currentKey === key) return false;
            this.removeChildAtKeySilently_(currentKey, viewModel);
            // We can't use #getChildrenObservableForKey because we need to add the view model to the
            // new observable array before adding the key so that any subscribes will be able to access
            // the children immediately.
            if (this.keysToChildrenObservables_[key]) this.keysToChildrenObservables_[key].push([ viewModel ]); else {
               this.keysToChildrenObservables_[key] = ko.observableArray([ viewModel ]);
               this.keys_.push(key);
            }
            viewModel.dispatchEvent_(ViewModel.Events.MOVED_KEYS, this, currentKey, key);
            this.dispatchEvent_(ViewModel.Events.CHILD_MOVED, viewModel, currentKey, key);
            return true;
         }
         // Silently update the observables values so that the parents are properly set before an
         // update occurs.
         var isNewKey = !this.keysToChildrenObservables_[key];
         if (isNewKey) {
            this.keysToChildrenObservables_[key] = ko.observableArray([ viewModel ]);
            this.keys_.peek().push(key);
         } else this.keysToChildrenObservables_[key].peek().push(viewModel);
         if (currentParent) {
            var currentKey = currentParent.getKeyForChild(viewModel);
            currentParent.removeChildAtKeySilently_(currentKey, viewModel, true);
         }
         viewModel.parent_(this);
         // Now that everything is setup properly, let subscribers know about the updates.
         isNewKey ? this.keys_.valueHasMutated() : this.keysToChildrenObservables_[key].valueHasMutated();
         return true;
      };
      /** Adds the given view models as children of this view model at the given key. */
      ViewModel.prototype.addChildrenAtKey = function(key, viewModels) {
         for (var i = 0, len = viewModels.length; i < len; i++) this.addChildAtKey(key, viewModels[i]);
      };
      /**
    * Adds the given view model as a child of this view model at a random key and returns the key.
    */
      ViewModel.prototype.addChild = function(viewModel) {
         var key = ViewModel.generateKey();
         this.addChildAtKey(key, viewModel);
         return key;
      };
      /**
    * Adds the given view models as children of this view model at a random key and returns the key.
    */
      ViewModel.prototype.addChildren = function(viewModel) {
         var key = ViewModel.generateKey();
         this.addChildrenAtKey(key, viewModel);
         return key;
      };
      /**
    * Attempts to remove the child view model at the given key and returns whether or not it was
    * successful.
    */
      ViewModel.prototype.removeChildAtKey = function(key, viewModel) {
         var wasRemoved = this.removeChildAtKeySilently_(key, viewModel, true);
         wasRemoved && viewModel.parent_(null);
         return wasRemoved;
      };
      /**
    * Attempts to remove the child view model at the given key and returns whether or not it was
    * successful.
    */
      ViewModel.prototype.removeChild = function(viewModel) {
         var key = this.getKeyForChild(viewModel);
         if (key) return this.removeChildAtKey(key, viewModel);
         return false;
      };
      /**
    * Removes any existing children at the given key and adds the given view models as children of
    * this view model.
    */
      ViewModel.prototype.replaceChildrenAtKey = function(key, viewModels) {
         var children = this.getChildrenForKey(key);
         for (var i = 0, len = children.length; i < len; i++) this.removeChildAtKey(key, children[i]);
         this.addChildrenAtKey(key, viewModels);
      };
      ViewModel.prototype.computeChildrenObservable_ = function() {
         var keys = this.keys_();
         keys.sort();
         var children = [];
         for (var i = 0, len = keys.length; i < len; i++) children = children.concat(this.getChildrenForKey(keys[i]));
         return children;
      };
      ViewModel.prototype.computeHasTemplate_ = function() {
         return null != this.template_();
      };
      ViewModel.prototype.removeChildAtKeySilently_ = function(key, viewModel, storeRemovedChild) {
         if (!this.keysToChildrenObservables_[key]) return false;
         var result = this.keysToChildrenObservables_[key].remove(viewModel);
         if (!result || !result.length) return false;
         storeRemovedChild && (this.recentlyRemovedChildrenToKeys_[viewModel] = key);
         return true;
      };
      ViewModel.prototype.dispatchEvent_ = function() {
         var eventType = arguments[0];
         var args = Array.prototype.slice.call(arguments, 1);
         var listeners = this.eventsToListeners_[eventType];
         if (listeners) for (var i = 0, len = listeners.length; i < len; i++) listeners[i].apply(this, args);
      };
      ViewModel.prototype.onParentWillChange_ = function(oldParent) {
         if (oldParent) {
            var key = oldParent.recentlyRemovedChildrenToKeys_[this];
            if (key) {
               delete oldParent.recentlyRemovedChildrenToKeys_[this];
               this.dispatchEvent_(ViewModel.Events.REMOVED_FROM_PARENT, oldParent, key);
               oldParent.dispatchEvent_(ViewModel.Events.CHILD_REMOVED, this, key);
            }
         }
      };
      ViewModel.prototype.onParentChanged_ = function(newParent) {
         if (newParent) {
            var key = newParent.getKeyForChild(this);
            this.dispatchEvent_(ViewModel.Events.ADDED_TO_PARENT, newParent, key);
            newParent.dispatchEvent_(ViewModel.Events.CHILD_ADDED, this, key);
         }
      };
      var handleChildrenObservableChanged = function(viewModel, key, changes) {
         // Determine the change status of each child, ignore any moves.
         for (var i = 0, len = changes.length; i < len; i++) {
            var change = changes[i];
            var skip = false;
            // Check if there is a complementary action and skip if there is.
            for (var j = 0, jLen = changes.length; j < jLen; j++) {
               var other = changes[j];
               if ("added" === other.status && "deleted" === change.status || "deleted" === other.status && "added" === change.status) {
                  skip = true;
                  break;
               }
            }
            if (skip) continue;
            "added" === change.status ? viewModel.addChildAtKey(key, change.value) : "deleted" === change.status && viewModel.removeChildAtKey(key, change.value);
         }
      };
      cm.define("viewmodels.ViewModel", ViewModel);
   })();
   (function() {
      var ViewModel = cm.require("viewmodels.ViewModel");
      // Use this function to minimize what is retained in the closure.
      var createValueAccessorFn = function(data) {
         var data = data;
         return function() {
            return data;
         };
      };
      var createTemplateAccessorFnForChildren = function(children, ifCondition) {
         var templateFn = function(child) {
            return child.getTemplate();
         };
         return function() {
            return {
               name: templateFn,
               foreach: children,
               "if": ifCondition
            };
         };
      };
      var makeTemplateValueAccessor = function(element, valueAccessor, viewModel, asChildren) {
         var value = ko.unwrap(valueAccessor());
         // If there is no value, just return null and don't do anything.
         if (!value) return null;
         var child = null;
         var children = null;
         var ifCondition = true;
         var captureChildOrChildren = function(value) {
            if (value instanceof ViewModel) // A view model is being supplied as the value.
            child = value; else if (value instanceof Array) // An array of view models is being supplied. Take the first child if asChildren option
            // is false.
            if (asChildren) children = value; else {
               child = value[0];
               if (!child) // Just return if the array is actually empty.
               return null;
            }
         };
         if (value instanceof ViewModel || value instanceof Array) captureChildOrChildren(value); else if ("string" === typeof value) // A key to the child was provided as the value, use the parent view model to fetch the
         // actual child.
         captureChildOrChildren(viewModel.getChildrenForKey(value)); else {
            var childrenArray = "string" === typeof value["data"] ? viewModel.getChildrenForKey(value["data"]) : value["data"];
            captureChildOrChildren(childrenArray);
            ifCondition = value["if"] ? value["if"] : ifCondition;
         }
         if (child) return createValueAccessorFn({
            name: child.template_,
            data: child,
            "if": ifCondition
         });
         if (children) return createTemplateAccessorFnForChildren(children, ifCondition);
         return createValueAccessorFn({});
      };
      var attachToKnockout = function() {
         var templateInit = ko.bindingHandlers.template.init;
         var templateUpdate = ko.bindingHandlers.template.update;
         // Add child to the knockout binding handles.
         ko.bindingHandlers.child = {
            init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
               var accessor = makeTemplateValueAccessor(element, valueAccessor, bindingContext["$data"], false);
               if (accessor) return templateInit(element, accessor, allBindings, viewModel, bindingContext);
            },
            update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
               var accessor = makeTemplateValueAccessor(element, valueAccessor, bindingContext["$data"], false);
               if (accessor) return templateUpdate(element, accessor, allBindings, viewModel, bindingContext);
            }
         };
         // Add children to the knockout binding handles.
         ko.bindingHandlers.children = {
            init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
               var accessor = makeTemplateValueAccessor(element, valueAccessor, bindingContext["$data"], true);
               if (accessor) return templateInit(element, accessor, allBindings, viewModel, bindingContext);
            },
            update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
               var accessor = makeTemplateValueAccessor(element, valueAccessor, bindingContext["$data"], true);
               if (accessor) return templateUpdate(element, accessor, allBindings, viewModel, bindingContext);
            }
         };
      };
      cm.define("bindings.Child", {
         attachToKnockout: attachToKnockout
      });
   })();
   (function() {
      function Route(path, callbacks) {
         var path = path.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
         // Capture the slugs (/:something) and replace them with regex fragment.
         this.slugs_ = (path.match(/\/:(\w+)+/g) || []).map(function(slug) {
            return slug.substring(2);
         });
         this.regex_ = new RegExp(path.replace(/\/:(\w+)+/g, "/([\\w-]+)+"));
         this.callbacks_ = callbacks;
      }
      Route.prototype.attemptToHandleUrl = function(url) {
         this.regex_.lastIndex = 0;
         // Extract the path from the url and test against that.
         var path = url.replace(/\?.*/, "");
         "/" == path[path.length - 1] && (path = path.substring(0, path.length - 1));
         var matches = url.match(/\?.*/);
         var query = matches && matches[0] ? matches[0] : "";
         var match = this.regex_.exec(path);
         if (null != match && match[0].length == path.length) {
            var req = {};
            // Add the slugs to the request object.
            if (this.slugs_) {
               req.params = {};
               for (var i = 0, len = this.slugs_.length; i < len; i++) req.params[this.slugs_[i]] = match[i + 1];
            }
            // Add the query parameters to the request object.
            if (query.length) {
               req.query = {};
               var values = query.match(/[\w=$+%@#^()]+/g);
               for (var i = 0, len = values.length; i < len; i++) {
                  var split = values[i].split("=");
                  req.query[split[0]] = split[1] || true;
               }
            }
            this.fireCallbacks_(req);
            return true;
         }
         return false;
      };
      Route.prototype.fireCallbacks_ = function(req) {
         var callbackIndex = 0;
         var callbackCount = this.callbacks_.length;
         var next = function() {
            callbackIndex++;
            callbackIndex < callbackCount && this.callbacks_[callbackIndex](req, next);
         }.bind(this);
         this.callbacks_[callbackIndex](req, next);
      };
      cm.define("router.Route", Route);
   })();
   // Based on: http://stackoverflow.com/questions/14738225/routing-knockout-js-app-with-sammy-js-and-history-with-html4-support
   (function() {
      var Route = cm.require("router.Route");
      function Router(on404) {
         this.on404_ = on404 || function(url) {
            console.log("404 at", url);
         };
         this.routes_ = [];
         this.historyLength_ = 0;
      }
      Router.prototype.setOn404 = function(on404) {
         this.on404_ = on404;
      };
      Router.prototype.get = function() {
         var route = arguments[0];
         var callbacks = Array.prototype.slice.call(arguments, 1);
         this.routes_.push(new Route(route, callbacks));
      };
      // Alias {@code get} to {@code registerRouter}.
      Router.prototype.registerRoute = Router.prototype.get;
      // Starts the router listening. The initial URL is passed through the router immediately.
      Router.prototype.listen = function() {
         window.addEventListener("popstate", function() {
            this.historyLength_ -= 1;
            this.notify_(this.currentUrlWithoutOrigin_());
         }.bind(this));
         // Capture all clicks on links. Have to use self because 'this' is the element clicked.
         var self = this;
         // TODO: determine how to achieve this behavior without jquery.
         $(document).on("click", "[href]", function(e) {
            href = this.getAttribute("href");
            // Let external links behave normally.
            if (0 != href.indexOf("http")) {
               e.preventDefault();
               self.navigate(href);
            }
         });
         this.notify_(this.currentUrlWithoutOrigin_());
      };
      // Navigates to the supplied URL.
      Router.prototype.navigate = function(url) {
         if (this.addOriginIfNeeded_(url) == window.location.href) return;
         if (window.history && window.history.pushState) {
            history.pushState(null, "", url);
            this.historyLength_ += 1;
            this.notify_(url);
         }
      };
      // Returns a value indicating if there is state to go back to.
      Router.prototype.hasHistory = function() {
         return this.historyLength_ > 0;
      };
      // Navigates to the previous URL.
      Router.prototype.back = function() {
         window.history.back();
      };
      // Calls the proper callbacks based on the supplied URL.
      Router.prototype.notify_ = function(url) {
         for (var i = 0, len = this.routes_.length; i < len; i++) if (this.routes_[i].attemptToHandleUrl(url)) return;
         this.on404_(url);
      };
      // Gets the current URL without the origin.
      Router.prototype.currentUrlWithoutOrigin_ = function() {
         return window.location.href.replace(this.getOrigin_(), "");
      };
      // Adds on the origin to the URL if it's not already there.
      Router.prototype.addOriginIfNeeded_ = function(url) {
         if (0 == url.indexOf("http")) return url;
         url = "/" == url[0] ? url : "/" + url;
         return this.getOrigin_() + url;
      };
      // Returns the current origin. This is pulled out to make testing possible.
      Router.prototype.getOrigin_ = function() {
         return window.location.origin;
      };
      cm.define("router.Router", Router);
   })();
   (function() {
      var ViewModel = cm.require("viewmodels.ViewModel");
      function ControlViewModel(template, order) {
         if ("number" === typeof template) {
            order = arguments[0];
            template = "";
         }
         ViewModel.call(this, template);
         this.order_ = ko.observable(order);
      }
      cm.inherit(ControlViewModel, ViewModel);
      ControlViewModel.prototype.getOrder = function() {
         return this.order_();
      };
      ControlViewModel.prototype.setOrder = function(order) {
         return this.order_(order);
      };
      cm.define("viewmodels.ControlViewModel", ControlViewModel);
   })();
   (function() {
      var ViewModel = cm.require("viewmodels.ViewModel");
      {
         cm.require("viewmodels.ControlViewModel");
      }
      var CONTROL_KEY_PREFIX = "control_key:";
      function ContentViewModel(template) {
         ViewModel.call(this, template);
         this.keysToControlsObservables_ = {};
      }
      cm.inherit(ContentViewModel, ViewModel);
      ContentViewModel.prototype.getControlsForKey = function(key) {
         return this.getControlsObservableForKey(key)();
      };
      ContentViewModel.prototype.getControlsObservableForKey = function(key) {
         return this.getControlsObservableForKeyInternal_(CONTROL_KEY_PREFIX + key);
      };
      ContentViewModel.prototype.addControlAtKey = function(key, control) {
         this.addChildAtKey(CONTROL_KEY_PREFIX + key, control);
      };
      ContentViewModel.prototype.removeControlAtKey = function(key, control) {
         return this.removeChildAtKey(CONTROL_KEY_PREFIX + key, control);
      };
      ContentViewModel.prototype.getControlsObservableForKeyInternal_ = function(controlKey) {
         this.keysToControlsObservables_[controlKey] || (this.keysToControlsObservables_[controlKey] = ko.pureComputed(this.computeControls_.bind(this, controlKey)));
         return this.keysToControlsObservables_[controlKey];
      };
      ContentViewModel.prototype.computeControls_ = function(controlKey) {
         var controls = this.getChildrenForKey(controlKey);
         var keys = this.getKeys();
         for (var i = 0, len = keys.length; i < len; i++) {
            var key = keys[i];
            if (0 == key.indexOf(CONTROL_KEY_PREFIX)) continue;
            var children = this.getChildrenForKey(key);
            for (var j = 0, childrenLength = children.length; j < childrenLength; j++) {
               var child = children[j];
               if (child instanceof ContentViewModel) {
                  var observable = child.getControlsObservableForKeyInternal_(controlKey);
                  controls = controls.concat(observable());
               }
            }
         }
         controls.sort(controlComparator);
         return controls;
      };
      var controlComparator = function(a, b) {
         var orderA = a.getOrder();
         var orderB = b.getOrder();
         if (orderA < orderB) return -1;
         if (orderA == orderB) return 0;
         return 1;
      };
      cm.define("viewmodels.ContentViewModel", ContentViewModel);
   })();
   (function() {
      {
         cm.require("viewmodels.ViewModel");
      }
      var Router = cm.require("router.Router");
      var ChildBinding = cm.require("bindings.Child");
      function CornerMan(rootViewModel) {
         this.router = new Router();
         this.rootViewModel_ = ko.observable(rootViewModel);
      }
      CornerMan.prototype.getRootViewModel = function() {
         return this.rootViewModel_();
      };
      CornerMan.prototype.setRootViewModel = function(rootViewModel) {
         this.rootViewModel_(rootViewModel);
      };
      CornerMan.prototype.get = function() {
         var callbacks = Array.prototype.slice.call(arguments, 1);
         // Bind each callback to this.
         for (var i = 0, len = callbacks.length; i < len; i++) callbacks[i] = callbacks[i].bind(this);
         this.router.get.apply(this.router, arguments);
      };
      /** Add alias for {@code get}. */
      CornerMan.prototype.addRouter = CornerMan.prototype.get;
      CornerMan.prototype.listen = function() {
         this.router.listen();
      };
      CornerMan.prototype.bindRootViewModel = function(element) {
         ChildBinding.attachToKnockout();
         element = element || document.body;
         element.setAttribute("data-bind", "child: rootViewModel_");
         ko.applyBindings(this);
      };
      cm.define("CornerMan", CornerMan);
   })(this);
   (function(scope) {
      var ViewModel = cm.require("viewmodels.ViewModel");
      var CornerMan = cm.require("CornerMan");
      // Export classes.
      scope.CornerMan = {
         CornerMan: CornerMan,
         Router: cm.require("router.Router"),
         ContentViewModel: cm.require("viewmodels.ContentViewModel"),
         ControlViewModel: cm.require("viewmodels.ControlViewModel"),
         ViewModel: ViewModel,
         Events: ViewModel.Events
      };
      // Export methods.
      scope.CornerMan["createChildObservable"] = ViewModel.createChildObservable;
      scope.CornerMan["createChildrenObservable"] = ViewModel.createChildrenObservable;
      scope.CornerMan["create"] = function(rootViewModel) {
         return new CornerMan(rootViewModel);
      };
      scope.CornerMan["inherit"] = cm.inherit;
   })(this);
})();