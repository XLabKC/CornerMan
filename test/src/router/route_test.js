//= require base.js
//= require router/route.js

describe('router.Route', function() { 

   var Route = cm.require('router.Route');
      
   it('should pass the slug values all the way through to the callbacks', function() {
      var callback = sinon.spy();
      var route = new Route('/something/:foo/blah/:bar', [callback]);
      route.attemptToHandleUrl('/something/apple/blah/orange');

      expect(callback.called).to.be.true();
      var req = callback.getCall(0).args[0];
      expect(req).to.have.deep.property('params.foo', 'apple');
      expect(req).to.have.deep.property('params.bar', 'orange');
   });

   it('should pass the query values all the way through to callbacks', function() {
      var callback = sinon.spy();
      var route = new Route('/something', [callback]);
      route.attemptToHandleUrl('/something?foo=apple&bar=orange&testing');

      expect(callback.called).to.be.true();
      var req = callback.getCall(0).args[0];
      expect(req).to.have.deep.property('query.foo', 'apple');
      expect(req).to.have.deep.property('query.bar', 'orange');
      expect(req).to.have.deep.property('query.testing', true);
   });

   describe('attemptToHandleUrl', function() {

      it('should return false if the route doesn\'t match without slugs', function() {
         var route = new Route('/foo', [(function() {})]);
         expect(route.attemptToHandleUrl('/bar')).to.be.false();
      });

      it('should return false if the route doesn\'t match with slugs', function() {
         var route = new Route('/foo/:bar', [(function() {})]);
         expect(route.attemptToHandleUrl('/bar/something')).to.be.false();
      });

      it('should return true if the route matches without slugs', function() {
         var route = new Route('/foo/bar', [(function() {})]);
         expect(route.attemptToHandleUrl('/foo/bar')).to.be.true();
      });

      it('should return true if the route matches with slugs', function() {
         var route = new Route('/foo/:bar', [(function() {})]);
         expect(route.attemptToHandleUrl('/foo/something')).to.be.true();
      });

      it('should return true if the route matches with query parameters', function() {
         var route = new Route('/foo/:bar', [(function() {})]);
         expect(route.attemptToHandleUrl('/foo/something?test=true')).to.be.true();
      });

      it('should return false if the slug is empty', function() {
         var route = new Route('/foo/:bar', [(function() {})]);
         expect(route.attemptToHandleUrl('/foo/')).to.be.false();
      });

      it('should return true if the url has a trailing slash', function() {           
         var route = new Route('/foo', [(function() {})]);
         expect(route.attemptToHandleUrl('/foo/')).to.be.true();
      });
   });

   describe('fireCallbacks_', function() {

      it('It should fire with only one callback', function() {
         var callback = sinon.spy();
         var route = new Route('/foo', [callback]);
         route.fireCallbacks_({});
         expect(callback.called).to.be.true();
      });

      it('should fire multiple callbacks when each fires next()', function() {
         var firstCallback = function(req, next) { next(); };
         var secondCallback = function(req, next) { next() };
         var firstSpy = sinon.spy(firstCallback);
         var secondSpy = sinon.spy(secondCallback);
         var route = new Route('/foo', [firstSpy, secondSpy]);
         route.fireCallbacks_({});
         expect(firstSpy.called).to.be.true();
         expect(secondSpy.called).to.be.true();
      });

      it('should not fire next callbacks if next() isn\'t called', function() {
         var firstCallback = function(req, next) {};
         var secondCallback = function(req, next) { next() };
         var firstSpy = sinon.spy(firstCallback);
         var secondSpy = sinon.spy(secondCallback);
         var route = new Route('/foo', [firstSpy, secondSpy]);
         route.fireCallbacks_({});
         expect(firstSpy.called).to.be.true();
         expect(secondSpy.called).to.be.false();
      });

      it('should pass the request object to each callback', function() {
         var callback = sinon.spy();
         var route = new Route('/foo', [callback]);
         route.fireCallbacks_({data:'data'});
         var req = callback.getCall(0).args[0];
         expect(req).to.eql({data:'data'})
      });

      it('should pass a function as the second param to callbacks', function() {
         var callback = sinon.spy();
         var route = new Route('/foo', [callback]);
         route.fireCallbacks_({data: 'data'});
         var next = callback.getCall(0).args[1];
         expect(next).to.be.an.instanceof(Function);
      });
   });
});
