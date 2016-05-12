//= require base.js

(function() {
   function Route(path, callbacks) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, String, cm.arrayOf(Function))
      var path = path.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

      // Capture the slugs (/:something) and replace them with regex fragment.
      this.slugs_ = (path.match(/\/:(\w+)/g) || []).map(function(slug) {
         return slug.substring(2);
      });
      this.regex_ = new RegExp(path.replace(/\/:(\w+)/g, '/([\\w-]+)'));
      this.callbacks_ = callbacks;
   };

   Route.prototype.attemptToHandleUrl = function(url) {
      if (CM_ASSERT_TYPES) cm.assertArgs(arguments, String);
      this.regex_.lastIndex = 0;

      // Extract the path from the url and test against that.
      var path = url.replace(/\?.*/, '');
      if (path[path.length - 1] == '/') {
         path = path.substring(0, path.length - 1) ;
      }

      var matches = url.match(/\?.*/);
      var query = matches && matches[0] ? matches[0] : '';
      var match = this.regex_.exec(path);
      if (match != null && match[0].length == path.length) {
         var req = {}

         // Add the slugs to the request object.
         if (this.slugs_) {
            req.params = {}
            for (var i = 0, len = this.slugs_.length; i < len; i++) {
               req.params[this.slugs_[i]] = match[i + 1];
            }
         }
         // Add the query parameters to the request object.
         if (query.length) {
            req.query = {}
            var values = query.match(/[\w=$+%@#^()]+/g);
            for (var i = 0, len = values.length; i < len; i++) {
               var split = values[i].split('=');
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
      var next = (function() {
         callbackIndex++;
         if (callbackIndex < callbackCount) {
            this.callbacks_[callbackIndex](req, next);
         }
      }).bind(this);
      this.callbacks_[callbackIndex](req, next);
   };

   cm.define('router.Route', Route);
})();

