game.DeathScreen = me.ScreenObject.extend({
	/**
	 *  action to perform on state change
	 */
	onResetEvent: function() {

		//clear the fade
		me.game.viewport.fadeOut("#000000", 1);

		game.death = {};
		me.audio.playTrack("death_bgm");

		game.death.demotivational = [
			"Why work so hard?",
			"It'd be a lot easier to watch TV than play this game.",
			"Why do today what you can put off 'till tomorrow?"
		];

		game.death.sprites_container = new game.deathSprites();
		me.game.world.addChild(game.death.sprites_container, 3);

		this.handler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {
			if (action === "action") game.death.sprites_container.continueGame();

			if (action === "alternate") game.death.sprites_container.endGame();
		});
	},

	/**
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent: function() {
		me.game.world.removeChild(game.death.sprites_container);
		me.audio.stopTrack();
		me.event.unsubscribe(this.handler);
	}
});

game.deathSprites = me.ObjectContainer.extend({
	init: function() {

		this.parent(0, 0, game.screen_width, game.screen_height);

        this.skull = new me.AnimationSheet(224, 60, me.loader.getImage("skull"), 128, 128);
        this.skull.animationpause = true;
		this.addChild(this.skull, 20);
		this.addChild(new game.deathBackground, 10);
	},

	continueGame: function() {
		me.game.viewport.fadeIn("000000", 500, function() {
			me.state.change(me.state.PLAY);
		})
	},

	endGame: function() {
		this.skull.animationspeed = 400;
		this.skull.animationpause = false;
		game.game_info_object = {};
		//SFX DEMONIC LAUGH HERE
		me.audio.play("evillaugh_sfx");
		me.game.viewport.fadeIn("FF0000", 2000, function() {
			me.state.change(me.state.READY);
		})
	}
});

game.deathBackground = me.Renderable.extend({
	init: function() {
		this.parent(new me.Vector2d(0, 0), game.screen_width, game.screen_height);
		this.messagefont = new me.Font("Courier New", 16, "#ccc");
		this.instructionsfont = new me.Font("Courier New", 22, "#eee");
		this.titlefont = new me.Font("Courier New", 44, "#FF0000");
		this.message = game.death.demotivational[RandomInt(0, game.death.demotivational.length - 1)];
	},

	draw : function (context) {
		context.fillStyle = "000000";
		context.fillRect(0, 0, game.screen_width, game.screen_height);
		this.titlefont.draw (context, "GAME OVER", 170, 5);
		this.messagefont.draw (context, this.message, 5, 200);
		this.instructionsfont.draw (context, "Press (X) to continue OR Press (Z) to quit", 5, 250);
	}
});
