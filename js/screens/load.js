game.LoadScreen = me.ScreenObject.extend({
	/**
	 *  action to perform on state change
	 */
	onResetEvent: function() {
		this.blocked = false;

		//clear the fade
		me.game.viewport.fadeOut("#000000", 1);

		me.input.bindKey(me.input.KEY.UP, "up", true);
		me.input.bindKey(me.input.KEY.DOWN, "down", true);

		me.save.add({lastmarker: -1});
		lastmarker = me.save.lastmarker;

		me.save.add({games: []});
		game.games = JSON.parse(JSON.stringify(me.save.games));

		this.save_load_widget = new game.saveLoadWidget(200, 5, true, lastmarker, false);
		me.game.world.addChild(this.save_load_widget, 10);

		game.handler = me.event.subscribe(me.event.KEYDOWN, (function (action, keyCode, edge) {
			if(!this.blocked) {
				switch(action){
					case "up":
						//::SOUND:: secondary menu select noise
						me.audio.play("menuup_sfx");
						this.save_load_widget.selectUp();
						break;
					case "down":
						//::SOUND:: secondary menu select noise
						me.audio.play("menudown_sfx");
						this.save_load_widget.selectDown();
						break;
					case "action":

						if(this.save_load_widget.marker === -1) {
							//me.game.viewport.fadeOut("#000", 500);
							this.blocked = true;
							me.audio.play("saved_sfx");
							game.game_info_object = JSON.parse(JSON.stringify(game.blank_game_info_object));
							me.game.viewport.fadeIn("#000000", 500, function() {
								me.state.change(me.state.PLAY);
							});
						} else {
							if(game.games[this.save_load_widget.marker]) {
								//me.game.viewport.fadeOut("#000", 500);
								this.blocked = true;
								me.audio.play("saved_sfx");
								game.game_info_object = JSON.parse(JSON.stringify(game.games[this.save_load_widget.marker]));
								me.game.viewport.fadeIn("#000000", 500, function() {
									me.state.change(me.state.PLAY);
								});
							} else {
								//error noise, can't load empty game slot
								me.audio.play("menuerror2_sfx");
							}
						}
						break;
				}
			}
		}).bind(this));


		// add a new renderable component with the scrolling text
		me.game.world.addChild(new (me.Renderable.extend ({
			// constructor
			init : function() {
			this.parent(new me.Vector2d(0, 0), me.game.viewport.width, me.game.viewport.height);
			// font for the scrolling text
			this.title_font = new me.Font("Courier New", 16, "#FFF");
			},

			update : function (dt) {
				return true;
			},

			draw : function (context) {
				context.fillStyle = '#112626';
				context.fillRect(0, 0, me.game.viewport.width, me.game.viewport.height);

				this.title_font.draw (context, "Choose a game", 10, 10);
			},

			onDestroyEvent : function() {
			}

		})), 2);

	},


	/**
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent: function() {
		//me.game.world.removeChild(this.save_load_widget);
		//delete(this.save_load_widget);
		me.event.unsubscribe(game.handler);

		me.input.unbindKey(me.input.KEY.UP);
		me.input.unbindKey(me.input.KEY.DOWN);
	}
});

game.saveLoadWidget = me.ObjectContainer.extend ({
	marker: 0,

	init: function(x, y, new_game, marker_start, animationpaused) {
		this.parent();
		this.autoSort = false;

		//if 'new game' option is active, set the first index to negative 1
		this.first_index = (new_game) ? -1 : 0 ;

		this.marker = marker_start; // || this.first_index;

		this.x = x;
		this.y = y;

		game.games = me.save.games || [];

		this.suit_sprites = [];

		for(s = 0; s < 4; s++) {

			if(game.games[s]) {
				this.suit_sprites[s] = new game.suitAnim(this.x, this.y, (game.games[s].inventory.equipped.suit.suitimage) ? game.games[s].inventory.equipped.suit.suitimage : "mainchar");
			} else {
				this.suit_sprites[s] = new game.suitAnim(this.x, this.y, "suitempty");
			}

			this.addChild(this.suit_sprites[s]);
		}

		this.textWidget = new game.saveLoadWidgetText(this.x, this.y, new_game, this.marker);
		this.addChild(this.textWidget);


		if(this.marker !== -1) this.suit_sprites[this.marker].animationpause = animationpaused;

	},

	animate: function() {
		this.suit_sprites[this.marker].animationpause = false;
		this.textWidget.marker = 0;
	},

	pause: function() {
		this.suit_sprites[this.marker].animationpause = true;
		this.textWidget.marker = -1;
	},

	selectUp: function () {
		if(this.marker !== -1) this.suit_sprites[this.marker].animationpause = true;
		this.marker = ((this.marker - 1) >= this.first_index) ? (this.marker - 1) : 3;
		this.textWidget.marker = this.marker;
		if(this.marker !== -1) this.suit_sprites[this.marker].animationpause = false;
		return this.marker;
	},

	selectDown: function() {
		if(this.marker !== -1) this.suit_sprites[this.marker].animationpause = true;
		this.marker = ((this.marker + 1) < 4) ? (this.marker + 1) : this.first_index;
		if(this.marker !== -1) this.suit_sprites[this.marker].animationpause = false;
		this.textWidget.marker = this.marker;
		return this.marker;
	},

});

game.suitAnim = me.AnimationSheet.extend({
	floating: true,
	//isPersistent: true,

	init: function(x, y, image) {
		this.parent(x, y + 64 + (s * 64), me.loader.getImage(image), 32, 48);

		/*
		this.addAnimation("walkforward", [0, 1, 0, 2], 100);
		this.addAnimation("walkbackward", [3, 4, 3, 5], 100);
		this.addAnimation("walksideways", [6, 7, 6, 8], 100);
		this.addAnimation("walkforwardangle", [9, 10, 9, 11], 100);
		this.addAnimation("walkbackwardangle", [12, 13, 12, 14], 100);
		this.setCurrentAnimation("walksideways");
		*/
		//this.addAnimation("catwalk", [0, 1, 0, 2, 0, 1, 0, 2, ]
		this.animationpause = true;
	}

});

game.saveLoadWidgetText = me.Renderable.extend({
	marker: 0,
	floating: true,

	init: function(x, y, new_game, marker_start) {
		this.x = x;
		this.y = y;
		this.new_game = new_game;
		this.marker = marker_start || 0;
		this.parent(new me.Vector2d(0, 0), me.game.viewport.width, me.game.viewport.height);


		this.descriptor = new me.Font("Courier New", 14, "#ede6ea");
		this.val = new me.Font("Courier New", 14, "#52444c");
		this.value_hilighted = new me.Font("Courier New", 14, "#e8369f");
	},

	draw : function (context) {
		if(this.new_game){
			(this.marker === -1) ? this.value_hilighted.draw(context, "Start A New Game", this.x, this.y) : this.val.draw(context, "start a New Game", this.x, this.y);
		}

		for(s = 0; s < 4; s++) {

			if(game.games[s]) {
				var d = new Date(game.games[s].last_save);
				lst = d.getHours() + ":" + d.getMinutes() + " " + (d.getMonth()+1) + "/" + d.getDay()
				var lpt = this.secondsToTime(game.games[s].play_time) || "...";
			} else {
				lst = "...";
				lpt = "...";
			}

			this.descriptor.draw(context, "Save Time", this.x + 48, this.y + 64 + (s * 64));
			(s != this.marker) ? this.val.draw(context, lst, this.x + 148, this.y + 64 + (s * 64)) : this.value_hilighted.draw(context, lst, this.x + 148, this.y + 64 + (s * 64));

			this.descriptor.draw(context, "Play Time", this.x + 48, this.y + 84 + (s * 64));
			(s != this.marker) ? this.val.draw(context, lpt, this.x + 148, this.y + 84 + (s * 64)) : this.value_hilighted.draw(context, lpt, this.x + 148, this.y + 84 + (s * 64));
		}

	},

	secondsToTime: function(secs)
	{
    var t = new Date(1970,0,1);
    t.setSeconds(secs);
    var s = t.toTimeString().substr(0,8);
    if(secs > 86399)
    	s = Math.floor((t - Date.parse("1/1/70")) / 3600000) + s.substr(2);
    return s;
	}

});
