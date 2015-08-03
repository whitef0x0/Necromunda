(function () {
    // a basic progress bar object
    var ProgressBar = me.Renderable.extend({

          // flag to know if we need to refresh the display
        invalidate : false,

        // default progress bar height
        barHeight : 4,

        // current progress
        progress : 0,

        // make sure the screen is refreshed every frame
        onProgressUpdate : function (progress) {
            this.progress = Math.floor(progress * this.width);
            this.invalidate = true;
        },

        // make sure the screen is refreshed every frame
        update : function () {
            if (this.invalidate === true) {
                // clear the flag
                this.invalidate = false;
                // and return true
                return true;
            }
            // else return false
            return false;
        },

         // draw function
        draw : function (context) {
            // draw the progress bar
            //context.fillStyle = "black";
            //context.fillRect(0, (this.height / 2) - (this.barHeight / 2), this.width, this.barHeight);
            context.fillStyle = "#FFF";
            context.fillRect(this.width/2 - this.width/4, (this.height - 20) - (this.barHeight / 2), this.progress/2, this.barHeight);
        }
    });

    // the melonJS Logo
    var IconLogo = me.Renderable.extend({
        // constructor
        init : function (x, y) {
            this.parent(new me.Vector2d(x, y), 100, 85);
        },

        // 100x85 Logo
        // generated using Illustrator and the Ai2Canvas plugin
        draw : function (context) {
            context.save();

            // translate to destination point
            context.translate(this.pos.x - 60, this.pos.y - 50);

// #layer1

// #path3132
	context.lineJoin = 'miter';
	context.strokeStyle = 'rgb(0, 0, 0)';
	context.lineCap = 'butt';
	context.lineWidth = 0.512724;
	context.beginPath();
	context.moveTo(62.420545, 184.313970);
	context.lineTo(69.519856, 183.398390);
	context.bezierCurveTo(69.519856, 183.398390, 92.732449, 153.023640, 103.703220, 150.282310);
	context.bezierCurveTo(113.237110, 147.900000, 145.341160, 155.237510, 165.122320, 143.821200);
	context.bezierCurveTo(171.556760, 140.107690, 156.835460, 138.123960, 156.835460, 138.123960);
	context.bezierCurveTo(156.835460, 138.123960, 201.324590, 95.989641, 191.018800, 94.099952);
	context.bezierCurveTo(180.438280, 92.159884, 165.301570, 96.553607, 156.348940, 92.331627);
	context.bezierCurveTo(150.696830, 89.666134, 162.465600, 77.536708, 163.170890, 73.477010);
	context.bezierCurveTo(164.441900, 66.160873, 158.268950, 68.993360, 158.268950, 68.993360);
	context.bezierCurveTo(158.268950, 68.993360, 162.913240, 54.470267, 160.460950, 43.342841);
	context.bezierCurveTo(159.362250, 38.357443, 140.261690, 55.773157, 140.261690, 55.773157);
	context.bezierCurveTo(140.261690, 55.773157, 133.167770, 58.462433, 130.149050, 50.562439);
	context.bezierCurveTo(129.071080, 47.741350, 118.027530, 69.788674, 113.266520, 69.056216);
	context.bezierCurveTo(109.787320, 68.873093, 105.142120, 57.239004, 94.689267, 34.600862);
	context.bezierCurveTo(90.609969, 25.766161, 86.397014, 64.060022, 86.397014, 64.060022);
	context.lineTo(80.181847, 64.060022);
	context.bezierCurveTo(80.181847, 64.060022, 81.432238, 75.088241, 81.432238, 79.749607);
	context.bezierCurveTo(81.432238, 84.410973, 73.966698, 81.151703, 73.966698, 81.151703);
	context.bezierCurveTo(73.966698, 81.151703, 76.556348, 98.243385, 81.217714, 104.976470);
	context.bezierCurveTo(85.879080, 111.709550, 74.484632, 106.530250, 74.484632, 106.530250);
	context.bezierCurveTo(74.484632, 106.530250, 74.252901, 129.495950, 99.863178, 145.374980);
	context.bezierCurveTo(107.599800, 150.171880, 94.595029, 144.825640, 94.595029, 144.825640);
	context.bezierCurveTo(94.595029, 144.825640, 77.195481, 159.818650, 62.268859, 179.406660);
	context.bezierCurveTo(60.163020, 182.170120, 62.420472, 184.313970, 62.420472, 184.313970);
	context.closePath();
	context.stroke();

// #path3163
	context.save();
	context.strokeStyle = 'rgb(255, 255, 255)';
	context.miterLimit = 4;
	context.lineWidth = 28.200001;
	context.beginPath();
	context.transform(0.470669, 0.000000, 0.000000, 0.481674, -62.914713, -37.070777);
	context.moveTo(600.000000, 318.790740);
	context.translate(377.142855, 318.837191);
	context.rotate(0.000000);
	context.scale(1.000000, 0.983974);
	context.arc(0.000000, 0.000000, 222.857150, -0.000212, 3.14180448, 0);
	context.scale(1.000000, 1.016287);
	context.rotate(-0.000000);
	context.translate(-377.142855, -318.837191);
	context.translate(377.142855, 318.744289);
	context.rotate(0.000000);
	context.scale(1.000000, 0.983974);
	context.arc(0.000000, 0.000000, 222.857150, 3.141381, 6.28339714, 0);
	context.scale(1.000000, 1.016287);
	context.rotate(-0.000000);
	context.translate(-377.142855, -318.744289);
	context.closePath();
	context.stroke();
	context.restore();

// #path3933
	context.save();
	context.strokeStyle = 'rgb(255, 255, 255)';
	context.miterLimit = 4;
	context.lineWidth = 2.000000;
	context.beginPath();
	context.transform(0.512724, 0.000000, 0.000000, 0.512724, -74.161183, -47.701646);
	context.moveTo(548.571430, 320.933620);
	context.translate(370.000000, 320.933620);
	context.rotate(0.000000);
	context.scale(1.000000, 1.000000);
	context.arc(0.000000, 0.000000, 178.571440, 0.000000, 3.14159265, 0);
	context.scale(1.000000, 1.000000);
	context.rotate(-0.000000);
	context.translate(-370.000000, -320.933620);
	context.translate(370.000000, 320.933620);
	context.rotate(0.000000);
	context.scale(1.000000, 1.000000);
	context.arc(0.000000, 0.000000, 178.571440, 3.141593, 6.28318531, 0);
	context.scale(1.000000, 1.000000);
	context.rotate(-0.000000);
	context.translate(-370.000000, -320.933620);
	context.closePath();
	context.stroke();
	context.restore();

// #path3935
	context.fillStyle = 'rgb(255, 255, 255)';
	context.beginPath();
	context.moveTo(62.341250, 181.836750);
	context.bezierCurveTo(62.346750, 179.492240, 72.429520, 167.503700, 84.792468, 155.140750);
	context.lineTo(94.559446, 145.373790);
	context.lineTo(96.942828, 146.338820);
	context.bezierCurveTo(103.847310, 149.134460, 105.108370, 147.980410, 99.219826, 144.255050);
	context.bezierCurveTo(91.750687, 139.529690, 83.628734, 130.647430, 79.721143, 122.930980);
	context.bezierCurveTo(77.629461, 118.800490, 75.521157, 112.148000, 75.521157, 109.678550);
	context.bezierCurveTo(75.521157, 108.112580, 75.736302, 108.040320, 79.183463, 108.448600);
	context.bezierCurveTo(83.590959, 108.970590, 83.658344, 108.703140, 80.671833, 102.542230);
	context.bezierCurveTo(78.811224, 98.703961, 77.145394, 93.152715, 75.193599, 84.286303);
	context.bezierCurveTo(74.754961, 82.293700, 74.813359, 82.247850, 77.216232, 82.698636);
	context.bezierCurveTo(81.407249, 83.484870, 82.261820, 81.906556, 81.735410, 74.351893);
	context.bezierCurveTo(81.492993, 70.872966, 81.142967, 67.284969, 80.957578, 66.378539);
	context.bezierCurveTo(80.647556, 64.862843, 80.886338, 64.730500, 83.930518, 64.730500);
	context.bezierCurveTo(86.967866, 64.730500, 87.240569, 64.580531, 87.240569, 62.909768);
	context.bezierCurveTo(87.240569, 61.908370, 87.925059, 56.790812, 88.761655, 51.537423);
	context.bezierCurveTo(90.320333, 41.749840, 92.282924, 34.333273, 93.314261, 34.333273);
	context.bezierCurveTo(93.633380, 34.333273, 96.652205, 40.266220, 100.022770, 47.517601);
	context.bezierCurveTo(103.393340, 54.769001, 107.042900, 62.284737, 108.132910, 64.219252);
	context.bezierCurveTo(110.581580, 68.565025, 112.922630, 70.276741, 114.940560, 69.196778);
	context.bezierCurveTo(116.632120, 68.291481, 120.788540, 63.350909, 125.630310, 56.490289);
	context.bezierCurveTo(127.549390, 53.771019, 129.364530, 51.546154, 129.663960, 51.546154);
	context.bezierCurveTo(129.963370, 51.546154, 130.629870, 52.333777, 131.145060, 53.296413);
	context.bezierCurveTo(132.255550, 55.371381, 134.824680, 56.673394, 137.808530, 56.673394);
	context.bezierCurveTo(139.403700, 56.673394, 141.719940, 55.244939, 146.707580, 51.185241);
	context.bezierCurveTo(150.416010, 48.166763, 154.780270, 45.039013, 156.405910, 44.234694);
	context.lineTo(159.361670, 42.772318);
	context.lineTo(159.998130, 44.412502);
	context.bezierCurveTo(160.866290, 46.649733, 160.005130, 59.782621, 158.665080, 64.730500);
	context.bezierCurveTo(157.248790, 69.961787, 157.186720, 69.724302, 159.937540, 69.599504);
	context.bezierCurveTo(162.076040, 69.502504, 162.339390, 69.714949, 162.528120, 71.688884);
	context.bezierCurveTo(162.681930, 73.298270, 161.743930, 75.454306, 159.022580, 79.745990);
	context.bezierCurveTo(155.061760, 85.992338, 154.362750, 87.746415, 154.749580, 90.468462);
	context.bezierCurveTo(155.231910, 93.862376, 157.968470, 94.395251, 174.915550, 94.395251);
	context.bezierCurveTo(185.119890, 94.395251, 190.716200, 94.668247, 191.240070, 95.191551);
	context.bezierCurveTo(193.436760, 97.385892, 187.076470, 105.936800, 169.371740, 124.591780);
	context.lineTo(156.176650, 138.495090);
	context.lineTo(160.064710, 139.365180);
	context.bezierCurveTo(162.203140, 139.843750, 164.557020, 140.677150, 165.295560, 141.217190);
	context.bezierCurveTo(166.528340, 142.118610, 166.320600, 142.360100, 162.759930, 144.164410);
	context.bezierCurveTo(160.626800, 145.245360, 156.358640, 146.832570, 153.275130, 147.691560);
	context.bezierCurveTo(148.169470, 149.113880, 145.706370, 149.261910, 125.694880, 149.349260);
	context.bezierCurveTo(100.666640, 149.458500, 102.234650, 149.124710, 93.520327, 156.198570);
	context.bezierCurveTo(89.059420, 159.819740, 77.964691, 171.787820, 71.463030, 179.992220);
	context.bezierCurveTo(69.587005, 182.359530, 68.692394, 182.863690, 65.786438, 183.191230);
	context.bezierCurveTo(62.531735, 183.558080, 62.337067, 183.481540, 62.341250, 181.836750);
	context.lineTo(62.341250, 181.836750);
	context.closePath();
	context.fill();


            context.restore();
        }
    });

    // the melonJS Text Logo
    var TextLogo = me.Renderable.extend({
        // constructor
        init : function (w, h) {
            this.parent(new me.Vector2d(), w, h);
            this.logo1 = new me.Font("century gothic", 32, "white", "middle");
            this.logo2 = new me.Font("century gothic", 32, "#55aa00", "middle");
            this.logo2.bold();
            this.logo1.textBaseline = this.logo2.textBaseline = "alphabetic";
        },

        draw : function (context) {
            // measure the logo size
            var logo1_width = this.logo1.measureText(context, "melon").width;
            var xpos = (this.width - logo1_width - this.logo2.measureText(context, "JS").width) / 2;
            var ypos = (this.height / 2) + (this.logo2.measureText(context, "melon").height);

            // draw the melonJS string
            this.logo1.draw(context, "melon", xpos, ypos);
            xpos += logo1_width;
            this.logo2.draw(context, "JS", xpos, ypos);
        }

    });

    /**
     * a default loading screen
     * @memberOf me
     * @ignore
     * @constructor
     */
    game.LoadingScreen = me.ScreenObject.extend({
        // call when the loader is resetted
        onResetEvent : function () {
            me.game.reset();

            // background color
            me.game.world.addChild(new me.ColorLayer("background", "#101010", 0));


            // progress bar
            var progressBar = new ProgressBar(
                new me.Vector2d(),
                me.video.getWidth(),
                me.video.getHeight()
            );
            this.handle = me.event.subscribe(
                me.event.LOADER_PROGRESS,
                progressBar.onProgressUpdate.bind(progressBar)
            );
            me.game.world.addChild(progressBar, 1);

            // melonJS text & logo
            var icon = new IconLogo(
                (me.video.getWidth() - 100) / 2,
                (me.video.getHeight() / 2) - (progressBar.barHeight / 2) - 90
            );
            me.game.world.addChild(icon, 1);

            //me.game.world.addChild(new TextLogo(me.video.getWidth(), me.video.getHeight()), 1);

        },

        // destroy object at end of loading
        onDestroyEvent : function () {
            // cancel the callback
            if (this.handle)  {
                me.event.unsubscribe(this.handle);
                this.handle = null;
            }
        }
    });
})();
