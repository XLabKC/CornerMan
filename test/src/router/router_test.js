//= require base.js
//= require router/route.js
//= require router/router.js

describe('router.Router', function() {

   var Router = cmRequire('router.Router');
   var Route = cmRequire('router.Route');
      
   beforeEach(function() {
      this.router = new Router();
      this.pushStateStub = sinon.stub(window.history, 'pushState');
   });

   afterEach(function() {
      this.pushStateStub.restore();
   });

   describe('addOriginIfNeeded_', function() {

      beforeEach(function() {
         this.originStub = sinon.stub(this.router, 'getOrigin_');
         this.originStub.returns('http://www.something.com');
      });

      afterEach(function() {
         this.originStub.restore();
      });

      it('should return the original url if it already has an origin', function() {
         var url = 'http://www.something.com/blah';
         expect(this.router.addOriginIfNeeded_(url)).to.equal(url);
      });

      it('should return a url with origin if it doesn\'t have one', function() {
         var result = this.router.addOriginIfNeeded_('/blah');
         expect(result).to.equal('http://www.something.com/blah');
      });
   });

   describe('get', function() { 

      it('should add a route to the routes array', function() {
         this.router.get('/foo', function() {});
         expect(this.router.routes_).to.have.length(1);
      });
   });

   describe('navigate', function() {

      it('should do nothing if already at the supplied path', function() {
         var callback = sinon.spy();
         this.router.get(location.href, callback);
         this.router.navigate(location.href);
         expect(this.pushStateStub.called).to.be.false();
         expect(callback.called).to.be.false();
      });

      it('should change the url to the supplied path', function() {
         this.router.navigate('/foo');
         expect(this.pushStateStub.calledWith(null, '', '/foo')).to.be.true();
      });

      it('should notify the first valid listener', function() {
         var callback1 = sinon.spy();
         var callback2 = sinon.spy();
         this.router.get('/foo', callback1);
         this.router.get('/:bar', callback2);
         this.router.navigate('/foo');
         expect(callback1.called).to.be.true();
         expect(callback2.called).to.be.false();
      });

      it('should add one to the history length', function() {
         this.router.navigate('/foo');
         expect(this.router.historyLength_).to.equal(1);
      });
   });
});

   
