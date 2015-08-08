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

    describe('Engine API', function () {

        var game = {};
        before(function () {

            /* if (window.__html__) {
                document.body.innerHTML = window.__html__['index.html'];
            }*/

            game.worldView = new engine.worldView('guiLayer', {zIndex:1});
        });

        describe('Geo tests', function () {
            describe('Geo.Point test', function () {
                before(function () {
                   this.x = -50;
                   this.y = 50;
                   this.radius = 2;
                   this.colour = engine.Colour.red; 
                });

                it('should throw an error if a non-numeric value is used for x or y', function () {
                    (function(){
                      new engine.Geo.Point(game.worldView, this.x, 'a', this.radius, engine.Colour.red)
                    }).should.throw(Error('x, y of Point must be integers'));

                    (function(){
                      new engine.Geo.Point(game.worldView, 'b', this.y, this.radius, engine.Colour.red)
                    }).should.throw(Error('x, y of Point must be integers'));
                });

                it('should throw an error if a non-numeric value is used for radius', function () {
                    (function(){
                        new engine.Geo.Point(game.worldView, this.x, this.y, 'nt', engine.Colour.red);
                    }).should.throw(Error('radius of Point must be an integer'));
                });

                it('should throw an error if a negative value is used for radius', function () {
                    (function(){
                        new engine.Geo.Point(game.worldView, this.x, this.y, -2, engine.Colour.red);
                    }).should.throw(Error('radius of Point must be greater than 0'));
                });

                it('should throw an error if a non-engine.WorldView value is used for viewPort', function () {
                    (function(){
                        new engine.Geo.Point(null, this.x, this.y, this.radius, engine.Colour.red);
                    }).should.throw(Error('viewPort of Point must be a engine.WorldView type object'));
                });

                it('should be able to make a canvasPath without any problems', function () {
                    var point = new engine.Geo.Point(game.worldView, this.x, this.y, this.radius, engine.Colour.red);
                    
                    var expectedPath = new Path2D();
                    expectedPath.arc(this.x, this.y, this.radius, 0, 2*Math.PI);

                    var actualPath = point.makeCanvasPath();

                    (actualPath).should.be.eql(expectedPath);
                });
            });

            describe('Geo.PathPoint test', function () {
                before(function () {
                   this.x = -50;
                   this.y = 50;
                   this.radius = 2;
                   this.colour = engine.Colour.red; 
                });
            });

            describe('Geo.Path test', function () {
                before(function () {
                   this.x = -50;
                   this.y = 50;
                   this.radius = 2;
                   this.colour = engine.Colour.red; 
                });
            });

            describe('Geo.PathPoint test', function () {
                before(function () {
                   this.x = -50;
                   this.y = 50;
                   this.radius = 2;
                   this.colour = engine.Colour.red; 
                });
            });

            describe('Geo.Vector test', function () {
                before(function () {
                   this.x = -50;
                   this.y = 50;
                   this.radius = 2;
                   this.colour = engine.Colour.red; 
                });
            });

            describe('Geo.Line test', function () {
                before(function () {
                   this.x = -50;
                   this.y = 50;
                   this.radius = 2;
                   this.colour = engine.Colour.red; 
                });
            });

            describe('Geo.PathLine test', function () {
                before(function () {
                   this.x = -50;
                   this.y = 50;
                   this.radius = 2;
                   this.colour = engine.Colour.red; 
                });
            });

            describe('Geo.Combatant test', function () {
                before(function () {
                   this.x = -50;
                   this.y = 50;
                   this.radius = 2;
                   this.colour = engine.Colour.red; 
                });
            });

            describe('Geo.Rect test', function () {
                before(function () {
                   this.x = -50;
                   this.y = 50;
                   this.radius = 2;
                   this.colour = engine.Colour.red; 
                });
            });

            describe('Geo.Path test', function () {
                before(function () {
                   this.x = -50;
                   this.y = 50;
                   this.radius = 2;
                   this.colour = engine.Colour.red; 
                });
            });
        });
    });

});