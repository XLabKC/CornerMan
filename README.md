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

# ViewModel API

## ViewModel
```
CornerMan.ViewModel
```

### Events (_CornerMan.ViewModel.Events_)
##### `CHILD_ADDED`
Dispatched from a _ViewModel_ when a child is added to it.
```js
var viewModel = new ViewModel();
viewModel.addListener(CornerMan.ViewModel.Events.CHILD_ADDED, function(event, child, key) {
  //...
});
```
##### `CHILD_MOVED`
Dispatched from a _ViewModel_ when a child is moved from one key to another.
```js
var viewModel = new ViewModel();
viewModel.addListener(CornerMan.ViewModel.Events.CHILD_MOVED,
    function(event, child, oldKey, newKey) {
  //...
});
```

##### `CHILD_REMOVED`
Dispatched from a _ViewModel_ when a child is removed from it.
```js
var viewModel = new ViewModel();
viewModel.addListener(CornerMan.ViewModel.Events.CHILD_REMOVED, function(event, child, oldKey) {
  //...
});
```

##### `MOVED_KEYS`
Dispatched from a _ViewModel_ when the _ViewModel_ moves from one key to another key but without its parent changing.
```js
var viewModel = new ViewModel();
viewModel.addListener(CornerMan.ViewModel.Events.MOVED_KEYS,
    function(event, parent, oldKey, newKey) {
  //...
});
```

##### `ADDED_TO_PARENT`
Dispatched from a _ViewModel_ when the _ViewModel_ is added as a child to another _ViewModel_.
```js
var viewModel = new ViewModel();
viewModel.addListener(CornerMan.ViewModel.Events.ADDED_TO_PARENT, function(event, parent, key) {
  //...
});
```

##### `REMOVED_FROM_PARENT`
Dispatched from a _ViewModel_ when the _ViewModel_ is removed as a child from another _ViewModel_.
```js
var viewModel = new ViewModel();
viewModel.addListener(CornerMan.ViewModel.Events.REMOVED_FROM_PARENT,
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

#### getOrder()
* `=>` _Number_: Returns the order of this _ControlViewModel_.

#### getOrder(order)
* `order` _Number_

Set the order of this _ControlViewModel_.

# Router API
