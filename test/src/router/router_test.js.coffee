#= require base.js
#= require router/router.js

describe "lib/Router", ->

   Router = require("router.Router")
   Route = require("router.Route")
      
   describe "Router", ->

      beforeEach ->
         @router = new Router()
         @pushStateStub = sinon.stub(window.history, "pushState")

      afterEach ->
         @pushStateStub.restore()

      describe "addOriginIfNeeded_", ->

         beforeEach ->
            @originStub = sinon.stub(@router, "getOrigin_")
            @originStub.returns("http://www.something.com")

         afterEach ->
            @originStub.restore()

         it "should return the original url if it already has an origin", ->
            url = "http://www.something.com/blah"
            expect(@router.addOriginIfNeeded_(url)).to.equal(url)

         it "should return a url with origin if it doesn't have one", ->
            expect(@router.addOriginIfNeeded_("/blah")).to.equal("http://www.something.com/blah")

      describe "get", -> 

         it "should add a route to the routes array", ->
            @router.get("/foo", ->)
            expect(@router.routes).to.have.length(1)

      describe "navigate", ->

         it "should do nothing if already at the supplied path", ->
            callback = sinon.spy()
            @router.get(location.href, callback)
            @router.navigate(location.href)
            expect(@pushStateStub.called).to.be.false()
            expect(callback.called).to.be.false()

         it "should change the url to the supplied path", ->
            @router.navigate("/foo")
            expect(@pushStateStub.calledWith(null, "", "/foo")).to.be.true()

         it "should notify the first valid listener", ->
            callback1 = sinon.spy()
            callback2 = sinon.spy()
            @router.get("/foo", callback1)
            @router.get("/:bar", callback2)
            @router.navigate("/foo")
            expect(callback1.called).to.be.true()
            expect(callback2.called).to.be.false()

         it "should add one to the history length", ->
            @router.navigate("/foo")
            expect(@router.historyLength).to.equal(1)

   describe "Route", -> 

      it "should pass the slug values all the way through to the callbacks", ->
            callback = sinon.spy()
            route = new Route("/something/:foo/blah/:bar", [callback])
            route.checkUrl("/something/apple/blah/orange")

            expect(callback.called).to.be.true()
            req = callback.getCall(0).args[0]
            expect(req).to.have.deep.property("params.foo", "apple")
            expect(req).to.have.deep.property("params.bar", "orange")

      it "should pass the query values all the way through to callbacks", ->
            callback = sinon.spy()
            route = new Route("/something", [callback])
            route.checkUrl("/something?foo=apple&bar=orange&testing")

            expect(callback.called).to.be.true()
            req = callback.getCall(0).args[0]
            expect(req).to.have.deep.property("query.foo", "apple")
            expect(req).to.have.deep.property("query.bar", "orange")
            expect(req).to.have.deep.property("query.testing", true)

      describe "checkUrl", ->

         it "should return false if the route doesn't match without slugs", ->
            route = new Route("/foo", [(->)])
            expect(route.checkUrl("/bar")).to.be.false()

         it "should return false if the route doesn't match with slugs", ->
            route = new Route("/foo/:bar", [(->)])
            expect(route.checkUrl("/bar/something")).to.be.false()

         it "should return true if the route matches without slugs", ->
            route = new Route("/foo/bar", [(->)])
            expect(route.checkUrl("/foo/bar")).to.be.true()

         it "should return true if the route matches with slugs", ->
            route = new Route("/foo/:bar", [(->)])
            expect(route.checkUrl("/foo/something")).to.be.true()

         it "should return true if the route matches with query parameters", ->
            route = new Route("/foo/:bar", [(->)])
            expect(route.checkUrl("/foo/something?test=true")).to.be.true()

         it "should return false if the slug is empty", ->
            route = new Route("/foo/:bar", [(->)])
            expect(route.checkUrl("/foo/")).to.be.false()

         it "should return true if the url has a trailing slash", ->           
            route = new Route("/foo", [(->)])
            expect(route.checkUrl("/foo/")).to.be.true()

      describe "fireRouteCallbacks", ->

         it "It should fire with only one callback", ->
            callback = sinon.spy()
            route = new Route("/foo", [callback])
            route.fireRouteCallbacks({})
            expect(callback.called).to.be.true

         it "should fire multiple callbacks when each fires next()", ->
            firstCallback = (req, next) ->
               next()
            secondCallback = (req, next) ->
               next()

            firstSpy = sinon.spy(firstCallback)
            secondSpy = sinon.spy(secondCallback)
            route = new Route("/foo", [firstSpy, secondSpy])
            route.fireRouteCallbacks({})
            expect(firstSpy.called).to.be.true
            expect(secondSpy.called).to.be.true

         it "should not fire next callbacks if next() isn't called", ->
            firstCallback = (req, next) ->
   
            secondCallback = (req, next) ->
               next()

            firstSpy = sinon.spy(firstCallback)
            secondSpy = sinon.spy(secondCallback)
            route = new Route("/foo", [firstSpy, secondSpy])
            route.fireRouteCallbacks({})
            expect(firstSpy.called).to.be.true
            expect(secondSpy.called).to.be.false

         it "should pass the request object to each callback", ->
            callback = sinon.spy()
            route = new Route("/foo", [callback])
            route.fireRouteCallbacks({data:"data"})
            req = callback.getCall(0).args[0]
            expect(req).to.eql({data:"data"})

         it "should pass a function as the second param to callbacks", ->
            callback = sinon.spy()
            route = new Route("/foo", [callback])
            route.fireRouteCallbacks({data:"data"})
            next = callback.getCall(0).args[1]
            expect(next instanceof Function).to.be.true
