(function(){(function(scope){var root={};if(scope.cm={inherit:function(subClass,superClass){subClass.prototype=Object.create(superClass.prototype),subClass.prototype.constructor=subClass},define:function(namespace,obj){var namespace=namespace.replace(/\./g,"$");if(root[namespace])throw Error("Namespace already exists: "+namespace);root[namespace]=obj},require:function(namespace){var namespace=namespace.replace(/\./g,"$");if(!root[namespace])throw Error("Unknown namespace: "+namespace);return root[namespace]}},"undefined"==typeof CM_ASSERT_TYPES&&(CM_ASSERT_TYPES=!0),CM_ASSERT_TYPES){var noop=function(){},insist=scope.insist||{};scope.cm.assertArgs=scope.assertArgs||inist.args||noop,scope.cm.assertOfType=scope.assertOfType||insist.ofType||noop,scope.cm.assertType=scope.assertType||insist.isType||noop,scope.cm.getNameForValue=scope.getNameForValue||insist.getNameForValue||noop,scope.cm.getNameForType=scope.getNameForType||insist.getNameForType||noop,scope.cm.arrayOf=scope.arrayOf||insist.arrayOf||noop,scope.cm.nullable=scope.nullable||insist.nullable||noop,scope.cm.anything=scope.anything||insist.anything||noop,scope.cm.optional=scope.optional||insist.optional||noop,scope.cm.ofEnum=scope.ofEnum||insist["enum"]||noop}})(this),function(){function ViewModel(template){CM_ASSERT_TYPES&&cm.assertArgs(arguments,optional(String)),this.template_=ko.observable(template||null),this.hasTemplate=ko.pureComputed(this.computeHasTemplate_.bind(this)),this.parent_=ko.observable(null),this.parent_.subscribe(this.onParentWillChange_,this,"beforeChange"),this.parent_.subscribe(this.onParentChanged_,this,"change"),this.keys_=ko.observableArray(),this.keysToChildrenObservables_={},this.childrenObservable_=ko.pureComputed(this.computeChildrenObservable_.bind(this)),this.eventsToListeners_={},this.recentlyRemovedChildrenToKeys_={}}var AVAILABLE_CHARACTERS="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",RANDOM_KEY_LENGTH=10;ViewModel.Events={CHILD_ADDED:"child-added",CHILD_MOVED:"child-moved",CHILD_REMOVED:"child-removed",MOVED_KEYS:"self-moved-keys",ADDED_TO_PARENT:"self-added-to-parent",REMOVED_FROM_PARENT:"self-removed-from-parent",BOUND_TO_ELEMENT:"self-bound-to-element",UNBOUND_FROM_ELEMENT:"self-unbound-from-element"},ViewModel.generateKey=function(){var length=RANDOM_KEY_LENGTH,characters=AVAILABLE_CHARACTERS;1===arguments.length&&"number"==typeof arguments[0]?length=arguments[0]:1===arguments.length&&"string"==typeof arguments[0]?characters=arguments[0]:2===arguments.length&&(length=arguments[0],characters=arguments[1]),CM_ASSERT_TYPES&&(cm.assertOfType(length,Number),cm.assertOfType(characters,String)),keySegments=[];for(var i=0;length>i;i++)keySegments.push(characters.charAt(Math.floor(Math.random()*characters.length)));return keySegments.join("")},ViewModel.createChildObservable=function(viewModel,key,initialValue){CM_ASSERT_TYPES&&cm.assertArgs(arguments,ViewModel,String,optional(ViewModel)),key=key||ViewModel.generateKey();var observable=ko.pureComputed({read:function(){return viewModel.getChildrenForKey(key)[0]||null},write:function(child){CM_ASSERT_TYPES&&cm.assertArgs(arguments,optional(ViewModel)),viewModel.getChildrenForKey(key)[0]!==child&&viewModel.replaceChildrenAtKey(key,child?[child]:[])},owner:viewModel});return observable.key_=key,observable.viewModel_=viewModel,observable.getKey=function(){return observable.key_},observable.getViewModel=function(){return observable.viewModel_},observable(initialValue),observable},ViewModel.createChildrenObservable=function(viewModel,key,initialValue){CM_ASSERT_TYPES&&cm.assertArgs(arguments,ViewModel,String,optional(arrayOf(ViewModel)));var observable=ko.observableArray();return observable.subscribe(handleChildrenObservableChanged.bind(viewModel,viewModel,key),null,"arrayChange"),observable.key_=key,observable.viewModel_=viewModel,observable.getKey=function(){return observable.key_},observable.getViewModel=function(){return observable.viewModel_},observable(initialValue),observable},ViewModel.prototype.childObservable=function(initialValue,options){options=options||{};var key=options.key||ViewModel.generateKey(),viewModel=options.viewModel||this;return ViewModel.createChildObservable(viewModel,key,initialValue)},ViewModel.prototype.childrenObservable=function(initialValue,options){options=options||{};var key=options.key||ViewModel.generateKey(),viewModel=options.viewModel||this;return ViewModel.createChildrenObservable(viewModel,key,initialValue)},ViewModel.prototype.addListener=function(event,callback){CM_ASSERT_TYPES&&cm.assertArgs(arguments,ofEnum(ViewModel.Events),Function),this.eventsToListeners_[event]||(this.eventsToListeners_[event]=[]),this.eventsToListeners_[event].push(callback)},ViewModel.prototype.removeListener=function(listener){CM_ASSERT_TYPES&&cm.assertArgs(arguments,Function);var found=!1;for(var type in this.eventsToListeners_)for(var listeners=this.eventsToListeners_[type],i=0;listeners.length>i;i++)listener===listeners[i]&&(found=!0,listeners.splice(i,1),i--);return found},ViewModel.prototype.getParent=function(){return this.parent_()},ViewModel.prototype.getTemplate=function(){return this.template_()},ViewModel.prototype.getKeys=function(){return this.keys_()},ViewModel.prototype.getKeysObservable=function(){return this.keys_},ViewModel.prototype.getChildren=function(){return this.childrenObservable_()},ViewModel.prototype.getChildrenObservable=function(){return this.childrenObservable_},ViewModel.prototype.getChildrenForKey=function(key){return CM_ASSERT_TYPES&&cm.assertArgs(arguments,String),this.getChildrenObservableForKey(key)()},ViewModel.prototype.getChildrenObservableForKey=function(key){return CM_ASSERT_TYPES&&cm.assertArgs(arguments,String),this.keysToChildrenObservables_[key]||(this.keysToChildrenObservables_[key]=ko.observableArray([]),this.keys_.push(key)),this.keysToChildrenObservables_[key]},ViewModel.prototype.getKeyForChild=function(viewModel){CM_ASSERT_TYPES&&cm.assertArgs(arguments,ViewModel);var keys=this.keys_();if(viewModel.getParent()!=this)return null;for(var i=0,len=keys.length;len>i;i++){var childrenObservable=this.getChildrenObservableForKey(keys[i]);if(-1!=childrenObservable.indexOf(viewModel))return keys[i]}return null},ViewModel.prototype.addChildAtKey=function(key,viewModel){CM_ASSERT_TYPES&&cm.assertArgs(arguments,String,ViewModel);var currentParent=viewModel.getParent();if(currentParent===this){var currentKey=currentParent.getKeyForChild(viewModel);return currentKey===key?!1:(this.removeChildAtKeySilently_(currentKey,viewModel),this.keysToChildrenObservables_[key]?this.keysToChildrenObservables_[key].push([viewModel]):(this.keysToChildrenObservables_[key]=ko.observableArray([viewModel]),this.keys_.push(key)),viewModel.dispatchEvent_(ViewModel.Events.MOVED_KEYS,this,currentKey,key),this.dispatchEvent_(ViewModel.Events.CHILD_MOVED,viewModel,currentKey,key),!0)}var isNewKey=!this.keysToChildrenObservables_[key];if(isNewKey?(this.keysToChildrenObservables_[key]=ko.observableArray([viewModel]),this.keys_.peek().push(key)):this.keysToChildrenObservables_[key].peek().push(viewModel),currentParent){var currentKey=currentParent.getKeyForChild(viewModel);currentParent.removeChildAtKeySilently_(currentKey,viewModel,!0)}return viewModel.parent_(this),isNewKey?this.keys_.valueHasMutated():this.keysToChildrenObservables_[key].valueHasMutated(),!0},ViewModel.prototype.addChildrenAtKey=function(key,viewModels){CM_ASSERT_TYPES&&cm.assertArgs(arguments,String,arrayOf(ViewModel));for(var i=0,len=viewModels.length;len>i;i++)this.addChildAtKey(key,viewModels[i])},ViewModel.prototype.addChild=function(viewModel){CM_ASSERT_TYPES&&cm.assertArgs(arguments,ViewModel);var key=ViewModel.generateKey();return this.addChildAtKey(key,viewModel),key},ViewModel.prototype.addChildren=function(viewModel){CM_ASSERT_TYPES&&cm.assertArgs(arguments,arrayOf(ViewModel));var key=ViewModel.generateKey();return this.addChildrenAtKey(key,viewModel),key},ViewModel.prototype.removeChildAtKey=function(key,viewModel){CM_ASSERT_TYPES&&cm.assertArgs(arguments,String,ViewModel);var wasRemoved=this.removeChildAtKeySilently_(key,viewModel,!0);return wasRemoved&&viewModel.parent_(null),wasRemoved},ViewModel.prototype.removeChild=function(viewModel){CM_ASSERT_TYPES&&cm.assertArgs(arguments,ViewModel);var key=this.getKeyForChild(viewModel);return key?this.removeChildAtKey(key,viewModel):!1},ViewModel.prototype.replaceChildrenAtKey=function(key,viewModels){CM_ASSERT_TYPES&&cm.assertArgs(arguments,String,arrayOf(ViewModel));for(var children=this.getChildrenForKey(key),i=0,len=children.length;len>i;i++)this.removeChildAtKey(key,children[i]);this.addChildrenAtKey(key,viewModels)},ViewModel.prototype.computeChildrenObservable_=function(){var keys=this.keys_();keys.sort();for(var children=[],i=0,len=keys.length;len>i;i++)children=children.concat(this.getChildrenForKey(keys[i]));return children},ViewModel.prototype.computeHasTemplate_=function(){return null!=this.template_()},ViewModel.prototype.removeChildAtKeySilently_=function(key,viewModel,storeRemovedChild){if(CM_ASSERT_TYPES&&cm.assertArgs(arguments,String,ViewModel,optional(Boolean)),!this.keysToChildrenObservables_[key])return!1;var result=this.keysToChildrenObservables_[key].remove(viewModel);return result&&result.length?(storeRemovedChild&&(this.recentlyRemovedChildrenToKeys_[viewModel]=key),!0):!1},ViewModel.prototype.dispatchEvent_=function(){var eventType=arguments[0],args=Array.prototype.slice.call(arguments,1),listeners=this.eventsToListeners_[eventType];if(listeners)for(var i=0,len=listeners.length;len>i;i++)listeners[i].apply(this,args)},ViewModel.prototype.onParentWillChange_=function(oldParent){if(oldParent){var key=oldParent.recentlyRemovedChildrenToKeys_[this];key&&(delete oldParent.recentlyRemovedChildrenToKeys_[this],this.dispatchEvent_(ViewModel.Events.REMOVED_FROM_PARENT,oldParent,key),oldParent.dispatchEvent_(ViewModel.Events.CHILD_REMOVED,this,key))}},ViewModel.prototype.onParentChanged_=function(newParent){if(newParent){var key=newParent.getKeyForChild(this);this.dispatchEvent_(ViewModel.Events.ADDED_TO_PARENT,newParent,key),newParent.dispatchEvent_(ViewModel.Events.CHILD_ADDED,this,key)}},ViewModel.prototype.boundToElement_=function(element){CM_ASSERT_TYPES&&cm.assertArgs(arguments,Element),this.dispatchEvent_(ViewModel.Events.BOUND_TO_ELEMENT,element)},ViewModel.prototype.unboundFromElement_=function(element){CM_ASSERT_TYPES&&cm.assertArgs(arguments,Element),this.dispatchEvent_(ViewModel.Events.UNBOUND_FROM_ELEMENT,element)};var handleChildrenObservableChanged=function(viewModel,key,changes){for(var i=0,len=changes.length;len>i;i++){for(var change=changes[i],skip=!1,j=0,jLen=changes.length;jLen>j;j++){var other=changes[j];if("added"===other.status&&"deleted"===change.status||"deleted"===other.status&&"added"===change.status){skip=!0;break}}skip||("added"===change.status?viewModel.addChildAtKey(key,change.value):"deleted"===change.status&&viewModel.removeChildAtKey(key,change.value))}};cm.define("viewmodels.ViewModel",ViewModel)}(),function(){var ViewModel=cm.require("viewmodels.ViewModel"),createValueAccessorFn=function(data){var data=data;return function(){return data}},createTemplateAccessorFnForChildren=function(children,ifCondition){CM_ASSERT_TYPES&&cm.assertArgs(arguments,arrayOf(ViewModel),[nullable(Function),Boolean]);var templateFn=function(child){return child.getTemplate()};return function(){return{name:templateFn,foreach:children,"if":ifCondition}}},makeTemplateValueAccessor=function(element,valueAccessor,viewModel,asChildren){CM_ASSERT_TYPES&&cm.assertArgs(arguments,Node,Function,anything(),Boolean);var value=ko.unwrap(valueAccessor());if(!value)return null;CM_ASSERT_TYPES&&cm.assertOfType(value,[String,ViewModel,arrayOf(ViewModel),Object]);var child=null,children=null,ifCondition=!0,captureChildOrChildren=function(value){if(value instanceof ViewModel)child=value;else if(value instanceof Array)if(CM_ASSERT_TYPES&&cm.assertOfType(value,arrayOf(ViewModel)),asChildren)children=value;else if(child=value[0],!child)return null};if(value instanceof ViewModel||value instanceof Array)CM_ASSERT_TYPES&&cm.assertOfType(value,[ViewModel,arrayOf(ViewModel)]),captureChildOrChildren(value);else if(CM_ASSERT_TYPES&&cm.assertOfType(viewModel,ViewModel),"string"==typeof value)captureChildOrChildren(viewModel.getChildrenForKey(value));else{CM_ASSERT_TYPES&&cm.assertOfType(value,Object);var childrenArray="string"==typeof value.data?viewModel.getChildrenForKey(value.data):value.data;captureChildOrChildren(childrenArray),ifCondition=value["if"]?value["if"]:ifCondition}return child?createValueAccessorFn({name:child.template_,data:child,"if":ifCondition}):children?createTemplateAccessorFnForChildren(children,ifCondition):createValueAccessorFn({})},attachToKnockout=function(){var templateInit=ko.bindingHandlers.template.init,templateUpdate=ko.bindingHandlers.template.update;ko.bindingHandlers.child={init:function(element,valueAccessor,allBindings,viewModel,bindingContext){var accessor=makeTemplateValueAccessor(element,valueAccessor,bindingContext.$data,!1);return accessor?templateInit(element,accessor,allBindings,viewModel,bindingContext):void 0},update:function(element,valueAccessor,allBindings,viewModel,bindingContext){var accessor=makeTemplateValueAccessor(element,valueAccessor,bindingContext.$data,!1);return accessor?templateUpdate(element,accessor,allBindings,viewModel,bindingContext):void 0}},ko.bindingHandlers.children={init:function(element,valueAccessor,allBindings,viewModel,bindingContext){var accessor=makeTemplateValueAccessor(element,valueAccessor,bindingContext.$data,!0);return accessor?templateInit(element,accessor,allBindings,viewModel,bindingContext):void 0},update:function(element,valueAccessor,allBindings,viewModel,bindingContext){var accessor=makeTemplateValueAccessor(element,valueAccessor,bindingContext.$data,!0);return accessor?templateUpdate(element,accessor,allBindings,viewModel,bindingContext):void 0}}};cm.define("bindings.Child",{attachToKnockout:attachToKnockout})}(),function(){function Route(path,callbacks){CM_ASSERT_TYPES&&cm.assertArgs(arguments,String,arrayOf(Function));var path=path.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,"\\$&");this.slugs_=(path.match(/\/:(\w+)+/g)||[]).map(function(slug){return slug.substring(2)}),this.regex_=RegExp(path.replace(/\/:(\w+)+/g,"/([\\w-]+)+")),this.callbacks_=callbacks}Route.prototype.attemptToHandleUrl=function(url){CM_ASSERT_TYPES&&cm.assertArgs(arguments,String),this.regex_.lastIndex=0;var path=url.replace(/\?.*/,"");"/"==path[path.length-1]&&(path=path.substring(0,path.length-1));var matches=url.match(/\?.*/),query=matches&&matches[0]?matches[0]:"",match=this.regex_.exec(path);if(null!=match&&match[0].length==path.length){var req={};if(this.slugs_){req.params={};for(var i=0,len=this.slugs_.length;len>i;i++)req.params[this.slugs_[i]]=match[i+1]}if(query.length){req.query={};for(var values=query.match(/[\w=$+%@#^()]+/g),i=0,len=values.length;len>i;i++){var split=values[i].split("=");req.query[split[0]]=split[1]||!0}}return this.fireCallbacks_(req),!0}return!1},Route.prototype.fireCallbacks_=function(req){var callbackIndex=0,callbackCount=this.callbacks_.length,next=function(){callbackIndex++,callbackCount>callbackIndex&&this.callbacks_[callbackIndex](req,next)}.bind(this);this.callbacks_[callbackIndex](req,next)},cm.define("router.Route",Route)}(),function(){function Router(on404){CM_ASSERT_TYPES&&cm.assertArgs(arguments,insist.optional(Function)),this.on404_=on404||function(url){console.log("404 at",url)},this.routes_=[],this.historyLength_=0}var Route=cm.require("router.Route");Router.prototype.setOn404=function(on404){CM_ASSERT_TYPES&&cm.assertArgs(arguments,Function),this.on404_=on404},Router.prototype.get=function(){var route=arguments[0],callbacks=Array.prototype.slice.call(arguments,1);CM_ASSERT_TYPES&&cm.assertOfType(route,String),CM_ASSERT_TYPES&&cm.assertOfType(callbacks,arrayOf(Function)),this.routes_.push(new Route(route,callbacks))},Router.prototype.listen=function(){window.addEventListener("popstate",function(){this.historyLength_-=1,this.notify_(this.currentUrlWithoutOrigin_())}.bind(this));var self=this;$(document).on("click","[href]",function(e){href=this.getAttribute("href"),0!=href.indexOf("http")&&(e.preventDefault(),self.navigate(href))}),this.notify_(this.currentUrlWithoutOrigin_())},Router.prototype.navigate=function(url){CM_ASSERT_TYPES&&cm.assertArgs(arguments,String),this.addOriginIfNeeded_(url)!=window.location.href&&window.history&&window.history.pushState&&(history.pushState(null,"",url),this.historyLength_+=1,this.notify_(url))},Router.prototype.hasHistory=function(){return this.historyLength_>0},Router.prototype.back=function(){window.history.back()},Router.prototype.notify_=function(url){CM_ASSERT_TYPES&&cm.assertArgs(arguments,String);for(var i=0,len=this.routes_.length;len>i;i++)if(this.routes_[i].attemptToHandleUrl(url))return;this.on404_(url)},Router.prototype.currentUrlWithoutOrigin_=function(){return window.location.href.replace(this.getOrigin_(),"")},Router.prototype.addOriginIfNeeded_=function(url){return 0==url.indexOf("http")?url:(url="/"==url[0]?url:"/"+url,this.getOrigin_()+url)},Router.prototype.getOrigin_=function(){return window.location.origin},cm.define("router.Router",Router)}(),function(){function ControlViewModel(template,order){"number"==typeof template&&(order=arguments[0],template=""),ViewModel.call(this,template),this.order_=ko.observable(order)}var ViewModel=cm.require("viewmodels.ViewModel");cm.inherit(ControlViewModel,ViewModel),ControlViewModel.prototype.getOrder=function(){return this.order_()},ControlViewModel.prototype.setOrder=function(order){return this.order_(order)},cm.define("viewmodels.ControlViewModel",ControlViewModel)}(),function(){function ContentViewModel(template){CM_ASSERT_TYPES&&cm.assertArgs(arguments,optional(String)),ViewModel.call(this,template),this.keysToControlsObservables_={}}var ViewModel=cm.require("viewmodels.ViewModel"),ControlViewModel=cm.require("viewmodels.ControlViewModel"),CONTROL_KEY_PREFIX="control_key:";cm.inherit(ContentViewModel,ViewModel),ContentViewModel.prototype.getControlsForKey=function(key){return CM_ASSERT_TYPES&&cm.assertArgs(arguments,String),this.getControlsObservableForKey(key)()},ContentViewModel.prototype.getControlsObservableForKey=function(key){return CM_ASSERT_TYPES&&cm.assertArgs(arguments,String),this.getControlsObservableForKeyInternal_(CONTROL_KEY_PREFIX+key)},ContentViewModel.prototype.addControlAtKey=function(key,control){CM_ASSERT_TYPES&&cm.assertArgs(arguments,String,ControlViewModel),this.addChildAtKey(CONTROL_KEY_PREFIX+key,control)},ContentViewModel.prototype.removeControlAtKey=function(key,control){return CM_ASSERT_TYPES&&cm.assertArgs(arguments,String,ControlViewModel),this.removeChildAtKey(CONTROL_KEY_PREFIX+key,control)},ContentViewModel.prototype.getControlsObservableForKeyInternal_=function(controlKey){return CM_ASSERT_TYPES&&cm.assertArgs(arguments,String),this.keysToControlsObservables_[controlKey]||(this.keysToControlsObservables_[controlKey]=ko.pureComputed(this.computeControls_.bind(this,controlKey))),this.keysToControlsObservables_[controlKey]},ContentViewModel.prototype.computeControls_=function(controlKey){for(var controls=this.getChildrenForKey(controlKey),keys=this.getKeys(),i=0,len=keys.length;len>i;i++){var key=keys[i];if(0!=key.indexOf(CONTROL_KEY_PREFIX))for(var children=this.getChildrenForKey(key),j=0,childrenLength=children.length;childrenLength>j;j++){var child=children[j];if(child instanceof ContentViewModel){var observable=child.getControlsObservableForKeyInternal_(controlKey);controls=controls.concat(observable())}}}return controls.sort(controlComparator),controls};var controlComparator=function(a,b){CM_ASSERT_TYPES&&cm.assertArgs(arguments,ControlViewModel,ControlViewModel);var orderA=a.getOrder(),orderB=b.getOrder();return orderB>orderA?-1:orderA==orderB?0:1};cm.define("viewmodels.ContentViewModel",ContentViewModel)}(),function(){function CornerMan(rootViewModel){CM_ASSERT_TYPES&&CM_ASSERT_TYPES&&cm.assertArgs(arguments,ViewModel),this.router=new Router,this.rootViewModel_=ko.observable(rootViewModel)}var ViewModel=cm.require("viewmodels.ViewModel"),Router=cm.require("router.Router"),ChildBinding=cm.require("bindings.Child");CornerMan.prototype.getRootViewModel=function(){return this.rootViewModel_()},CornerMan.prototype.setRootViewModel=function(rootViewModel){CM_ASSERT_TYPES&&cm.assertArgs(arguments,ViewModel),this.rootViewModel_(rootViewModel)},CornerMan.prototype.get=function(){var route=arguments[0],callbacks=Array.prototype.slice.call(arguments,1);CM_ASSERT_TYPES&&cm.assertOfType(route,String),CM_ASSERT_TYPES&&cm.assertOfType(callbacks,arrayOf(Function));for(var i=0,len=callbacks.length;len>i;i++)callbacks[i]=callbacks[i].bind(this);this.router.get.apply(this.router,arguments)},CornerMan.prototype.addRouter=CornerMan.prototype.get,CornerMan.prototype.listen=function(){this.router.listen()},CornerMan.prototype.bindRootViewModel=function(element){CM_ASSERT_TYPES&&cm.assertArgs(arguments,optional(Node)),ChildBinding.attachToKnockout(),element=element||document.body,element.setAttribute("data-bind","child: rootViewModel_"),ko.applyBindings(this)},cm.define("CornerMan",CornerMan)}(this),function(scope){var ViewModel=cm.require("viewmodels.ViewModel"),CornerMan=cm.require("CornerMan");scope.CornerMan={CornerMan:CornerMan,Router:cm.require("router.Router"),ContentViewModel:cm.require("viewmodels.ContentViewModel"),ControlViewModel:cm.require("viewmodels.ControlViewModel"),ViewModel:ViewModel,Events:ViewModel.Events},scope.CornerMan.createChildObservable=ViewModel.createChildObservable,scope.CornerMan.createChildrenObservable=ViewModel.createChildrenObservable,scope.CornerMan.create=function(rootViewModel){return new CornerMan(rootViewModel)},scope.CornerMan.inherit=cm.inherit}(this)})();