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
    @nameProvider = this.childObservable()

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
#### childObservation(initialValue, options)
* `initialValue` _ViewModel_
* `options` _Object_
  * `key` _String_ (optional) the key to use for this observable
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
  * `key` _String_ (optional) the key to use for this observable
Creates an observable that contains an array of ViewModels. ViewModels added/removed from this observable be set as children of this observable. 
```js
function FooViewModel() {
  CornerMan.ViewModel.call(this);
  this.children = this.childrenObservable();
};
CornerMan.inherit(FooViewModel, CornerMan.ViewModel);
```

### addListener(event, callback)
* `event` _ViewModel.Events_
  * `CHILD_ADDED`: Dispatched when a child is added
  * `CHILD_MOVED`: Dispatched when a child is moved
  * `CHILD_REMOVED`: Dispatched when a child is removed
  * `MOVED_KEYS`: Dispatched when the ViewModel keeps the same parent but changes keys
  * `ADDED_TO_PARENT`: Dispatched when the ViewModel is added as a child to another ViewModel
  * `REMOVED_FROM_PARENT`: Dispatched when the ViewModel is removed as a child from another ViewModel
* `callback` _Function_
  
  

## ContentViewModel

## ControlViewModel

# Router API
