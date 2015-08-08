// Load the engineine and describe tests.
define(['engine/engine'], function(engine){

    if (!Function.prototype.bind) {
        Function.prototype.bind = function () {
            var fn = this,
                args = Array.prototype.slice.call(arguments),
                context = args.shift();
            return function () {
                fn.apply(context, args);
            };
        };
    }


    console.log(engine);
    describe('Engine API tests', function () {
        before(function () {

            /* if (window.__html__) {
                document.body.innerHTML = window.__html__['index.html'];
            }*/

            this.game = {};
            this.game.worldView = new engine.worldView('guiLayer', {zIndex:1});
        });


        describe('Point Geometric Figure', function () {
            before(function () {
               this.x = -50;
               this.y = 50;
               this.radius = 2;
               this.colour = engine.Colour.red; 
            });

            it('should throw an error if a non-numeric value is used for x or y', function () {
                var point = new engine.Geo.Point(this.game.worldView, this.x, 'a', this.radius, engine.Colour.red).should.throw(Error, 'x, y of Point must be integers');
                var point = new engine.Geo.Point(this.game.worldView, 'a', this.y, this.radius, engine.Colour.red).should.throw(Error, 'x, y of Point must be integers');
            });

            it('should throw an error if a non-numeric value is used for radius', function () {
                var point = new engine.Geo.Point(this.game.worldView, this.x, this.y, 'nt', engine.Colour.red).should.throw(Error, 'radius of Point must be an integer');
            });

            it('should throw an error if a negative value is used for radius', function () {
                var point = new engine.Geo.Point(this.game.worldView, this.x, this.y, -2, engine.Colour.red).should.throw(Error, 'radius of Point must be greater than 0');
            });

            it('should throw an error if a non-engine.WorldView value is used for viewPort', function () {
                var point = new engine.Geo.Point(null, this.x, this.y, this.radius, engine.Colour.red).should.throw(Error, 'viewPort of Point must be a engine.WorldView type object');
            });

            it('should be able to make a canvasPath without any problems', function () {
                var point = new engine.Geo.Point(game.worldView, this.x, this.y, this.radius, engine.Colour.red);
                var arcPath = new Path2D().arc(this.x, this.y, this.radius, 0, this.radius*Math.PI);
                (point.makeCanvasPath()).should.be.equal(arcPath);
            });

        });
    });

});