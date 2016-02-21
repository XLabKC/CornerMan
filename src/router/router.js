//= require base.js
//= require router/route.js
// Based on: http://stackoverflow.com/questions/14738225/routing-knockout-js-app-with-sammy-js-and-history-with-html4-support

(function() {

   var Route = cm.require('router.Route');

   function Router(on404) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, cm.optional(Function));
      this.on404_ = on404 || (function(url) { console.log('404 at', url); });
      this.routes_ = [];
      this.historyLength_ = 0;
   }

   Router.prototype.setOn404 = function(on404) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, Function);
      this.on404_ = on404;
   };

   Router.prototype.get = function(/* route [, callbacks...] */) {
      var route = arguments[0];
      var callbacks = Array.prototype.slice.call(arguments, 1);
      if (CM_ASSERT_TYPES) cm.assertOfType(route, String);
      if (CM_ASSERT_TYPES) cm.assertOfType(callbacks, cm.arrayOf(Function));
      this.routes_.push(new Route(route, callbacks));
   };

   // Alias {@code get} to {@code registerRouter}.
   Router.prototype.registerRoute = Router.prototype.get;

   // Starts the router listening. The initial URL is passed through the router immediately.
   Router.prototype.listen = function() {
      window.addEventListener('popstate', (function () {
         this.historyLength_ -= 1;
         this.notify_(this.currentUrlWithoutOrigin_());
      }).bind(this));

      // Capture all clicks on links. Have to use self because 'this' is the element clicked.
      var self = this;
      // TODO: determine how to achieve this behavior without jquery.
      $(document).on('click', '[href]', function(e) {
         href = this.getAttribute('href');
         // Let external links behave normally.
         if (href.indexOf('http') != 0) {
            e.preventDefault();
            self.navigate(href);
         }
      });

      this.notify_(this.currentUrlWithoutOrigin_());
   };

   // Navigates to the supplied URL.
   Router.prototype.navigate = function(url) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, String)
      if (this.addOriginIfNeeded_(url) == window.location.href) {
         return;
      }
      if (window.history && window.history.pushState) {
         history.pushState(null, '', url);
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
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, String)
      for (var i = 0, len = this.routes_.length; i < len; i++) {
         if (this.routes_[i].attemptToHandleUrl(url)) {
            return;
         }
      }
      this.on404_(url);
   };

   // Gets the current URL without the origin.
   Router.prototype.currentUrlWithoutOrigin_ = function() {
      return window.location.href.replace(this.getOrigin_(), '');
   };

   // Adds on the origin to the URL if it's not already there.
   Router.prototype.addOriginIfNeeded_ = function(url) {
      if (url.indexOf('http') == 0) {
         return url;
      }
      url = (url[0] == '/') ? url : '/' + url;
      return this.getOrigin_() + url;
   };

   // Returns the current origin. This is pulled out to make testing possible.
    Router.prototype.getOrigin_ = function() {
      return window.location.origin;
   };

   
   cm.define('router.Router', Router);
})();

