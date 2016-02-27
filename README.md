# CornerMan
Knockouts faithful servant.

## Example
```js
function HelloVM() {
  CornerMan.ViewModel.call(this, 'hello-template');
  this.nameProvider = this.createChildObservable();
}
CornerMan.inherit(HelloVM, CornerMan.ViewModel);
   
function NameVM() {
  ViewModel.call(this, 'name-template');
  this.name = ko.observable('World');
}
CornerMan.inherit(NameVM, CornerMan.ViewModel);

var helloVM = new HelloVM();
var nameVM = new NameVM();
helloVM.nameProvider(nameVM);

var app = CornerMan.create();
app.setRootViewModel(helloVM);
app.bindRootViewModel();
```
Works with CoffeeScript class too:
```coffeescript
class HelloVM extends CornerMan.ViewModel
  constructor: ->
    super('hello-template')
    @nameProvider = @childObservable()

class NameVM extends CornerMan.ViewModel
  constructor: ->
    super('name-template')
    @name = ko.observable('World')

helloVM = new HelloVM()
nameVM = new NameVM()
helloVM.nameProvider(nameVM)

app = CornerMan.create()
app.setRootViewModel(helloVM)
app.bindRootViewModel()
```

# CornerMan API
The CornerMan API is exposed through the global variable `CornerMan`.
```js
// Classes
CornerMan.Router            // Provides URL routing infastructure.
CornerMan.ViewModel         // Base ViewModel
CornerMan.ContentViewModel  // Subclass of ViewModel, provides propagated controls 
CornerMan.ControlViewModel  // Subclass of ViewModel, used with the ContentViewModel
CornerMan.Events            // Definition of events dispatched from ViewModel when changes occur

// Utils
CornerMan.inherit           // Helper for correctly setting up prototype chain when subclassing.
CornerMan.create            // Initializes a new CornerMan instance
```

## CornerMan
The global `CornerMan` variable is also a class providing shortcuts for setting up the app.

#### CornerMan(rootViewModel)
* `rootViewModel` _ViewModel_ (optional): The root _ViewModel_ of the application.

It's easiest to have a single root _ViewModel_ that then has children for the various sections of the application.
```js
function FooViewModel() {
  CornerMan.ViewModel.call(this, 'foo-template');
}
CornerMan.inherit(FooViewModel, CornerMan.ViewModel);

var rootViewModel = new FooViewModel();
var app = new CornerMan(rootViewModel) // or CornerMan.create(rootViewModel)
app.bindRootViewModel();
```

#### getRootViewModel()
* `=>` _ViewModel_: Returns the root _ViewModel_ or null.

#### setRootViewModel(rootViewModel)
* `rootViewModel` _ViewModel_

#### registerRoute(route, callback [, callback ]...)
* `route` _String_: Route to register the callback(s) with.
* `callbacks` _Function_: Functions called when the URL matches the given route.

Adds a route to the _Router_ associated with this CornerMan instance. For more details, see _Router_`#registerRoute` below.

#### get(route, callback [, callback ]...)
* `route` _String_: Route to register the callback(s) with.
* `callbacks` _Function_: Functions called when the URL matches the given route.

Alas for `#registerRoute`.

#### listen()
Calls `#listen` on the  _Router_ associated with this CornerMan instance. For more details, see _Router_`#listen` below.

#### setTemplateEngine(templateEngine)
* `templateEngine` _ko.nativeTemplateEngine_: Subclass of Knockout's template engine.
Sets a template engine that will be used for all `child` and `children` data bindings.

#### bindRootViewModel(element)
* `element` _Node_ (optional): DOM element to bind the root _ViewModel_ to.

Binds the root _ViewModel_ to the given element or `document.body` if no element is given.

# ViewModel API

## ViewModel
```
CornerMan.ViewModel
```
#### ViewModel(template)
* `template` _String_ (optional): Template for the _ViewModel_.

```js
function FooViewModel() {
  CornerMan.ViewModel.call(this, 'foo-template');
}
CornerMan.inherit(FooViewModel, CornerMan.ViewModel);
```

### Events (_CornerMan.Events_)
##### `CHILD_ADDED`
Dispatched from a _ViewModel_ when a child is added to it.
```js
var viewModel = new ViewModel();
viewModel.addListener(CornerMan.Events.CHILD_ADDED, function(event, child, key) {
  //...
});
```
##### `CHILD_MOVED`
Dispatched from a _ViewModel_ when a child is moved from one key to another.
```js
var viewModel = new ViewModel();
viewModel.addListener(CornerMan.Events.CHILD_MOVED,
    function(event, child, oldKey, newKey) {
  //...
});
```

##### `CHILD_REMOVED`
Dispatched from a _ViewModel_ when a child is removed from it.
```js
var viewModel = new ViewModel();
viewModel.addListener(CornerMan.Events.CHILD_REMOVED, function(event, child, oldKey) {
  //...
});
```

##### `MOVED_KEYS`
Dispatched from a _ViewModel_ when the _ViewModel_ moves from one key to another key but without its parent changing.
```js
var viewModel = new ViewModel();
viewModel.addListener(CornerMan.Events.MOVED_KEYS,
    function(event, parent, oldKey, newKey) {
  //...
});
```

##### `ADDED_TO_PARENT`
Dispatched from a _ViewModel_ when the _ViewModel_ is added as a child to another _ViewModel_.
```js
var viewModel = new ViewModel();
viewModel.addListener(CornerMan.Events.ADDED_TO_PARENT, function(event, parent, key) {
  //...
});
```

##### `REMOVED_FROM_PARENT`
Dispatched from a _ViewModel_ when the _ViewModel_ is removed as a child from another _ViewModel_.
```js
var viewModel = new ViewModel();
viewModel.addListener(CornerMan.Events.REMOVED_FROM_PARENT,
    function(event, parent, oldKey)
  //...
});
```
### Methods
#### childObservation(initialValue, options)
* `initialValue` _ViewModel_
* `options` _Object_
  * `key` _String_ (optional): The key to use for this observable
* `=>` _Observable_: Returns a Knockout observable
  
Creates an observable that contains a ViewModel. Any ViewModel set in the observable will be set as a child of this ViewModel.
```js
function FooViewModel() {
  CornerMan.ViewModel.call(this);
  this.child = this.childObservable();
};
CornerMan.inherit(FooViewModel, CornerMan.ViewModel);
```

#### childrenObservable(initialValue, options)
* `initialValue` _ViewModel_
* `options` _Object_
  * `key` _String_ (optional): The key to use for this observable
* `=>` _Observable_: Returns a Knockout observable

Creates an observable that contains an array of <i>ViewModel</i>s. <i>ViewModel</i>s added/removed from this observable be set as children of this observable. 
```js
function FooViewModel() {
  CornerMan.ViewModel.call(this);
  this.children = this.childrenObservable();
};
CornerMan.inherit(FooViewModel, CornerMan.ViewModel);

var fooVM = new FooViewModel();
```

#### addListener(event, callback)
* `event` _ViewModel.Events_
* `callback` _Function_: Refer to _ViewModel.Events_ for callback parameters

Adds a listener to the _ViewModel_.
  
#### removeListener(listener)
* `listener` _Function_: The callback function passed to #addListener

Removes the listener from the _ViewModel_.

#### getParent()
* `=>` _ViewModel_: Returns the parent of this _ViewModel_ or null.

#### getTemplate()
* `=>` _String_: Returns the template of this _ViewModel_ or null.

#### getKeys()
* `=>` _Array< String >_: Returns all of the child keys of this _ViewModel_.

#### getKeysObservable()
* `=>` _Observable< Array< String > >_: Returns an observable containing all of the child keys of this _ViewModel_.

#### getChildren()
* `=>` _Array< ViewModel >_: Returns all of the children of this _ViewModel_.

#### getChildrenObservable()
* `=>` _Observable< Array< ViewModel > >_: Returns an observable containing all of the children of this _ViewModel_.

#### getChildrenForKey(key)
* `key` _String_
* `=>` _Array< ViewModel >_: Returns all of the children of this _ViewModel_ at the given key.

#### getChildrenObservableForKey(key)
* `key` _String_
* `=>` _Observable< Array< ViewModel > >_: Returns an observable containing all of the children of this _ViewModel_ at the given key.

#### getKeyForChild(viewModel)
* `viewModel` _ViewModel_: Child of this _ViewModel_
* `=>` _String_: The key of the given _ViewModel_ or null.

#### addChildAtKey(key, viewModel)
* `key` _String_
* `viewModel` _ViewModel_: _ViewModel_ to add as a child of this _ViewModel_.
* `=>` _Boolean_: Returns `true` if the _ViewModel_ was added as a child at the given key; returns `false` if the _ViewModel_ is already a child at the given key.

If the key is not significant, consider using `#addChild` instead.

#### addChildrenAtKey(key, viewModels)
* `key` _String_
* `viewModels` _Array< ViewModel >_: <i>ViewModel</i>s to add as childlren of this _ViewModel_.

If the key is not significant, consider using #addChildren instead.

#### addChild(viewModel)
* `viewModel` _ViewModel_: _ViewModel_ to add as a child of this _ViewModel_.
* `=>` _String_: Returns the key generated for the new child.

To add a child with a given key, use `#addChildAtKey` instead.

#### addChildren(viewModel)
* `viewModel` _ViewModel_: _ViewModel_ to add as a child of this _ViewModel_.
* `=>` _String_: Returns the key generated for the new child.

To add childlren with a given key, use `#addChildlrenAtKey` instead.

#### removeChildAtKey(key, viewModel)
* `key` _String_
* `viewModel` _ViewModel_: Child _ViewModel_ to remove.
* `=>` _Boolean_: Returns `true` if the child exists at the given key and was removed from this _ViewModel_; returns `false` otherwise.

#### removeChild(viewModel)
* `viewModel` _ViewModel_: Child _ViewModel_ to remove.
* `=>` _Boolean_: Returns `true` if the _ViewModel_ is a child of this _ViewModel_ and was removed; returns `false` otherwise.

#### replaceChildrenAtKey(key, viewModels)
* `key` _String_
* `viewModels` _ViewModel_: <i>ViewModel</i>s to add as children of this _ViewModel_.
Removes all child existing at the given key and then adds all of the given <i>ViewModel</i>s at that key.

## ContentViewModel
```
CornerMan.ContentViewModel
```
#### ContentViewModel(template)
* `template` _String_ (optional): Template for the _ContentViewModel_.

```js
function FooContentViewModel() {
  CornerMan.ContentViewModel.call(this, 'foo-template');
}
CornerMan.inherit(FooContentViewModel, CornerMan.ContentViewModel);

var fooVM = new FooContentViewModel();
```

#### getControlsForKey(key)
* `key` _String_
* `=>` _Array< ControlViewModel >_: Returns the controls for the given key.

Gets the controls for the given key; any controls at the same key associated with children of this content _ViewModel_ will be included. The controls are sorted by ascending using the `order` of the control _ViewModel_.

#### getControlsObservableForKey(key)
* `key` _String_
* `=>` _Observable< Array< ControlViewModel > >_: Returns an observable containing the <i>ControlViewModel</i>s for the given key.

Gets the observable that contains controls for the given key; any controls at the same key associated with children of this _ContentViewModel_ will be included. The controls are sorted by ascending using the `order` of the _ControlViewModel_.

#### addControlAtKey(key, control)
* `key` _String_
* `control` _ControlViewModel_

Adds the given _ControlViewModel_ to this _ContentViewModel_ at the given key.

## ControlViewModel
```
CornerMan.ControlViewModel
```
#### ControlViewModel(template, order)
* `template` _String_ (optional): Template for the _ControlViewModel_.
* `order` _Number_: Order of the _ControlViewModel_.

```js
function FooControlViewModel() {
  CornerMan.ControlViewModel.call(this, 'foo-template', 0);
}
CornerMan.inherit(FooControlViewModel, CornerMan.ControlViewModel);

var fooControl = new FooControlViewModel();
```

#### getOrder()
* `=>` _Number_: Returns the order of this _ControlViewModel_.

#### getOrder(order)
* `order` _Number_

Set the order of this _ControlViewModel_.

# Router API

## Router
```
CornerMan.Router
```
#### Router(on404)
* `on404` _Function_ (optional): Called when there is no registered route matching the current URL.

```js
var router = new CornerMan.Router(function(url) {
  console.log('Unknown page:', url);
});
```

#### setOn404(on404)
* `on404` _Function_ (optional): Called when there is no registered route matching the current URL.

Registers a function to be called when there is no registered route matching the current URL.

#### listen()
Starts the router listening for navigations. The current URL is immediately passed through the router.

#### registerRoute(route, callback [, callback ]...)
* `route` _String_: Route to register the callback(s) with.
* `callbacks` _Function_: Functions called when the URL matches the given route.

The `router` parameter can be a simple path, such as `"/animals/dog"` or it can contains "slugs" that match variable URLs such as `"/animals/:animal"`. This second example will match any URL in the form of `"/animals/..."` but will not match `"/animals/.../foo"`.

`#registerRoute` accepts a variable number of callbacks following the `route` parameter. The callbacks will be called in order with the following two parameters: `request` (_Object_) and `next` (_Function_). The `request` parameter has two properties: 1. `params` which contains the parameters parsed from the URL, and 2. `query` which contains the querystring parsed into an object. The `next` parameter is used to delegate to the next callback in the chain of registered callbacks. If a callback does not want of the following callbacks to be invoked, it simply shouldn't call `next`.
```js
var router = CornerMan.Router();

router.registerRoute("/animals/:animal",
    function(request, next) {
      console.log('params', request.params);
      console.log('query', request.query);
      next();
    },
    function(request, next) {
      console.log('Handling URL.');
    },
    function(request, next) {
      console.log('Never called.');
    });

router.listen();

// User navigates to: /animals/dog?name=Max

// The following lines will be printed:
//   params { animal: 'dog' }
//   query { name: 'Max' }
//   Handling URL.
```

#### get(route, callback [, callback ]...)
* `route` _String_: Route to register the callback(s) with.
* `callbacks` _Function_: Functions called when the URL matches the given route.

Alias for #registerRoute.

#### navigate(url)
* `url` _String_

Navigates to the given URL.

#### hasHistory()
* `=>` Returns whether there is a history entry to go back to.

This is useful to know if the user navigated to the current URL through the router, or if the user landed directly on the current URL, say through a link from an external site.

#### back()
Navigates back to the previous URL.

