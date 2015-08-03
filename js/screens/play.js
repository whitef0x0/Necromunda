//game.PlayScreen = game.AnimatedScreen.extend({
game.PlayScreen = me.ScreenObject.extend({
    "loading" : false,

    "onLevelLoaded" : function onLevelLoaded(settings) {

        this.loading = false;
		//me.input.bindKey(me.input.KEY.X, "action", true);
		//me.input.bindKey(me.input.KEY.Z, "alternate", true);
		//me.input.bindKey(me.input.KEY.ENTER, "start", true);
		//me.input.bindKey(me.input.KEY.C,     "test", true);

		me.input.bindKey(me.input.KEY.LEFT,  "left");
		me.input.bindKey(me.input.KEY.RIGHT, "right");
		me.input.bindKey(me.input.KEY.UP, "up");
		me.input.bindKey(me.input.KEY.DOWN, "down");

    if(game.portal_noise) me.audio.play(game.portal_noise + "close_sfx");
    delete(game.portal_noise);
        //game.player = me.game.getEntityByName("player")[0];
        //game.dialogue = me.game.getEntityByName("Dialogue")[0];
        if(settings.music) {
        	me.audio.playTrack(settings.music + "_bgm", 1);
        } else {
        	me.audio.playTrack(me.game.currentLevel.music + "_bgm", 1);
        }

        if (settings.location) {

        	if(settings.location == "up" || settings.location == "down") {
        		settings.location = game.game_info_object.overworld.location;
        	}

			var p = settings.location.split(",").map(function map(value) {
				return +value.trim();
			});

			game.player.pos.x = p[0];
			game.player.pos.y = p[1];

            if(me.game.currentLevel.type == "exterior") {
                game.play.HUD.addTitle(me.game.currentLevel.mapname);
            }

        }
/*
        if (settings.dir) {
            game.player.dir_name = settings.dir;
            game.player.setCurrentAnimation("stand_" + settings.dir);
        }

        if (settings.music) {
            me.audio.stopTrack();
            me.audio.playTrack(settings.music);
        }
*/
    //clear the fade
    me.game.viewport.fadeOut("#000000", 1);

    //increment the play clock (adds to total time played)
    this.play_clock = setInterval(function() {
      game.game_info_object.play_time++;
    }, 1000);

    },

    "loadLevel" : function loadLevel(settings) {
        var fade;
        var self = this;

        if (self.loading) {
            return;
        }
        self.loading = true;

        me.game.onLevelLoaded = function onLevelLoaded() {
            self.onLevelLoaded(settings);
        };

        // Load the first level.
        me.levelDirector.loadLevel(settings.to);
    },

	/**
	 *  action to perform on state change
	 */
	onResetEvent: function() {

		me.game.reset();

		// add our HUD to the game world
		this.HUD = new game.HUD.Container();
		me.game.world.addChild(this.HUD);

		//Load up the game object (game.game_info_object.overworld)

		// <property name="location" value="1018,250"/>
		this.loadLevel({
                "to"        : game.game_info_object.overworld.map,
                //"music"     : game.game_info_object.overworld.music,
                "fadeOut"   : "black",
                "duration"  : 1000,
                "location"  : game.game_info_object.overworld.location
            });
	},


	/**
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent: function() {
    clearInterval(this.play_clock);
		// remove the HUD from the game world
		me.audio.stopTrack();
		me.game.world.removeChild(this.HUD);
        //me.game.world.sortOn = "n";
	}
});
