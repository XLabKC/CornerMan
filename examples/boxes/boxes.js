var randomColorValue = function() {
  return Math.round(Math.random() * 255);
}

// Create the Add Child button.
function AddChildButton(r, b, g) {
   CornerMan.ControlViewModel.call(this, 'add-child-button-template', 0);
   this.target = null;
   this.onClick = this.onClick.bind(this);
   this.rgbaColor = 'rgba(' + [r, g, b, 0.4].join(',') + ')';
};
CornerMan.inherit(AddChildButton, CornerMan.ControlViewModel);

AddChildButton.prototype.onClick = function() {
   if (this.target) this.target();
};

// Create the Root View Model.
function RootVM() {
   CornerMan.ContentViewModel.call(this, 'base-template');
   this.addChildButtons = this.getControlsObservableForKey('add-child-button');
   this.boxChildren = this.childrenObservable();
   this.addChildButton = new AddChildButton();
   this.addChildButton.target = this.addChild.bind(this);
   this.addControlAtKey('add-child-button', this.addChildButton);
   this.addChild();
};
CornerMan.inherit(RootVM, CornerMan.ContentViewModel);

RootVM.prototype.addChild = function() {
   this.boxChildren.push(new BoxVM(0, randomColorValue(), randomColorValue(), randomColorValue()));
};

// Create the Box View Model.
function BoxVM(depth, r, g, b) {
   CornerMan.ContentViewModel.call(this, 'box-template');
   this.depth = depth;
   this.r = ko.observable(r);
   this.g = ko.observable(g);
   this.b = ko.observable(b);
   this.boxChildren = this.childrenObservable();
   this.addChildButton = new AddChildButton();
   this.addChildButton.target = this.addChild.bind(this);
   this.addControlAtKey('add-child-button', this.addChildButton);
   this.rgbaColor = ko.pureComputed((function() {
      return 'rgba(' + [this.r(), this.g(), this.b(), 0.4].join(',') + ')';
   }).bind(this));
};
CornerMan.inherit(BoxVM, CornerMan.ContentViewModel);

BoxVM.prototype.addChild = function() {
   this.boxChildren.push(new BoxVM(this.depth, this.r(), this.g(), this.b()));
};

// Start up the app.
$(document).ready(function() {
   var rootVM = new RootVM();
   var app = CornerMan.create(rootVM);
   app.bindRootViewModel($('.content')[0]);
});
