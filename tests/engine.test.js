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

describe('Engine', function () {
    before(function () {

        /* if (window.__html__) {
            document.body.innerHTML = window.__html__['index.html'];
        }*/

        this.game.worldView = new eng.WorldView('guiLayer', {zIndex:1});
    });


    describe('Point Geometric Figure', function () {
        before(function (done) {
           this.x = -50;
           this.y = 50;
           this.radius = 2;
           this.colour = eng.Colour.red; 
        });

        it('should throw an error if a non-numeric value is used for x or y', function () {
            var point = new eng.Point(this.worldView.worldView, this.x, 'a', this.radius, eng.Colour.red).should.throw(Error, {message: 'x, y of Point must be integers'});
            var point = new eng.Point(this.worldView.worldView, 'a', this.y, this.radius, eng.Colour.red).should.throw(Error, {message: 'x, y of Point must be integers'});
        });

        it('should throw an error if a non-numeric value is used for radius', function () {
            var point = new eng.Point(this.worldView.worldView, this.x, this.y, 'nt', eng.Colour.red).should.throw(Error, {message: 'radius of Point must be an integer'});
        });

        it('should throw an error if a negative value is used for radius', function () {
            var point = new eng.Point(this.worldView.worldView, this.x, this.y, -2, eng.Colour.red).should.throw(Error, {message: 'radius of Point must be greater than 0'});
        });

        it('should throw an error if a non-eng.WorldView value is used for viewPort', function () {
            var point = new eng.Point(null, this.x, this.y, this.radius, eng.Colour.red).should.throw(Error, {message: 'viewPort of Point must be a eng.WorldView type object'})
        });

        it('should be able to make a canvasPath without any problems', function () {
            var point = new eng.Point(game.worldView, this.x, this.y, this.radius, eng.Colour.red);
            var arcPath = new Path2D().arc(this.x, this.y, this.radius, 0, this.radius*Math.PI);
            (point.makeCanvasPath()).should.be.equal(arcPath);
        });

    });
});