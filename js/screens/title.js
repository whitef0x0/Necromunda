game.TitleScreen = me.ScreenObject.extend({
	/**
	 *  action to perform on state change
	 */
	onResetEvent: function() {

		game.title = {};

		game.title.scene = false;

		game.title.sprites_container = new game.introSprites();
		me.game.world.addChild(game.title.sprites_container, 3);

		this.handler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {
			if (action === "action") {
				// play something on tap / enter
				// this will unlock audio on mobile devices
				//me.audio.play("cling");
				if(game.title.scene){
					me.state.change(me.state.MENU);
				} else {
					game.title.sprites_container.nextPhase();
				}
			}
		});
	},

	/**
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent: function() {
		me.game.world.removeChild(game.title.sprites_container);
		me.audio.stopTrack();
		me.event.unsubscribe(this.handler);
	}
});

game.introSprites = me.ObjectContainer.extend({
	init: function() {

		this.time_to_road_object = 0;
		this.next_time = 0;
		this.cloud_time = 0;
		this.next_cloud = 0;

		this.parent(0, 0, game.screen_width, game.screen_height);
        //this.autoSort = false;

        this.cab_sprite = new game.introCab();
		this.addChild(this.cab_sprite, 20);

		game.title.logo_container = new game.logoContainer(95, 5);
		this.addChild(game.title.logo_container, 10);

		game.title.intro_screen_text = new game.introScreenText();
		this.addChild(game.title.intro_screen_text, 5);

		this.addChild(new game.introRoadSpriteBackground(), 3);
		this.addChild(new game.introScreenBackground(), 1);
	},

update: function(delta){
		if(game.title.scene) {

			this.time_to_road_object += me.timer.tick;

			if(this.time_to_road_object >= this.next_time) {

				this.next_time = RandomInt(100,160);
				this.time_to_road_object = 0;
				this.addChild(new game.roadSprite(), 4);

				this.cloud_time++;

				if(this.cloud_time >= this.next_cloud) {
					this.next_cloud = RandomInt(1,5);
					this.addChild(new game.roadCloud(), 2);
					this.cloud_time = 0;
				}
			}
		}

		this.parent(delta);
		return true;
	},

	nextPhase: function() {
		game.title.scene = true;
		game.title.logo_container.quit();
		me.game.viewport.fadeOut("#FFFFFF", 3000);
		me.audio.play("flash_sfx");
		this.cab_sprite.nextPhase();
		game.title.intro_screen_text.nextPhase();
		me.audio.playTrack("intro_bgm");
	}
});

game.roadSprite = me.SpriteObject.extend({
	init: function() {
		road_objects = ["roadtree", "roadshop", "roadsign"];
		road_odds = [0, 0, 0, 0, 0, 1, 1, 2];
		this.parent(-78, 95, me.loader.getImage(road_objects[ road_odds[RandomInt(0, road_odds.length - 1) ] ] ), 78, 109);
		this.slide();
	},

	slide: function() {
		this.tween = new me.Tween(this.pos).to({x: 578}, 5000).onComplete((function() {
			game.title.sprites_container.removeChild(this);
		}).bind(this));
		this.tween.easing(me.Tween.Easing.Linear.None);
		//tween.easing(me.Tween.Easing.Bounce.Out);
		this.tween.start();
	}
});

game.roadCloud = me.SpriteObject.extend({
	init: function() {
		this.parent(-78, RandomInt(-10, 90), me.loader.getImage("roadcloud"), 78, 109);
		this.slide();
	},

	slide: function() {
		this.tween = new me.Tween(this.pos).to({x: 578}, 25000).onComplete((function() {
			game.title.sprites_container.removeChild(this);
		}).bind(this));
		this.tween.easing(me.Tween.Easing.Linear.None);
		//tween.easing(me.Tween.Easing.Bounce.Out);
		this.tween.start();
	}
});

game.introRoadSpriteBackground = me.AnimationSheet.extend({
	init: function () {
		this.parent(0, 161, me.loader.getImage("roadmove"), 576, 163);
	}
});

game.introCab = me.AnimationSheet.extend({
	init: function () {
		this.parent(600, 120, me.loader.getImage("vehiclecab"), 128, 128);

		this.addAnimation("sideways", [0, 1], 130);
        this.setCurrentAnimation("sideways");
        this.flipX(true);
	},

	nextPhase: function() {
		tween = new me.Tween(this.pos).to({x: this.pos.x - 400}, 3000);
		tween.easing(me.Tween.Easing.Linear.None);
		//tween.easing(me.Tween.Easing.Bounce.Out);
		tween.start();
	}
});

game.introScreenBackground = me.Renderable.extend({
	init : function() {
	this.parent(new me.Vector2d(0, 0), me.game.viewport.width, me.game.viewport.height);
	},

	draw : function (context) {
		context.fillStyle = '#a4ded6';
		context.fillRect(0, 0, me.game.viewport.width, me.game.viewport.height);
	},

	onDestroyEvent: function() {
	}
});

game.introScreenText = me.Renderable.extend({
	// constructor
	init : function() {
	this.parent(new me.Vector2d(0, 0), me.game.viewport.width, me.game.viewport.height);
	this.bg = true;
	// font for the scrolling text
	this.title_font = new me.Font("Courier New", 100, "#222");
	this.action_font = new me.Font("Courier New", 16, "#222");
	},

	draw : function (context) {
		context.fillStyle = 'black';
		context.strokeStyle = 'white';
		context.lineWidth = 5;

		if(this.bg) { context.fillRect(0, 0, me.game.viewport.width, me.game.viewport.height); }

		this.action_font.draw (context, "PRESS (X) TO START", 200, 290);

		this.title_font.draw (context, "ANIMUS", 100, 90);
		this.title_font.drawStroke (context, "ANIMUS", 100, 90);
	},

	nextPhase: function() {
		this.bg = false;
	}
});

game.logoContainer = me.ObjectContainer.extend({
	init: function(x, y){
		adjust = 224;
		this.logo_time_counter = 0;

		this.pipe_logo_array = [[[2,3], [2,0], [3,3], [2,3], [2,0], [2,3], [1,1], [0,0], [0,0], [0,0], [0,0]],
								[[3,2], [2,1], [1,0], [3,2], [2,1], [3,2], [1,1], [0,0], [0,0], [0,0], [0,0]],
								[[1,0], [0,0], [3,1], [1,0], [0,0], [2,2], [1,1], [0,0], [0,0], [0,0], [0,0]]];/*,
								[[3,2], [2,0], [3,2], [2,0], [2,3], [1,1], [2,3], [2,0], [2,3], [3,3], [2,0]],
								[[1,0], [1,0], [3,2], [3,0], [3,2], [1,1], [3,2], [3,0], [1,0], [1,0], [1,0]],
								[[3,2], [2,1], [1,0], [2,2], [2,2], [1,1], [1,0], [1,0], [1,0], [1,0], [1,0]]];*/

		//this.pipe_object_array = [];
		this.parent(0, 0, game.screen_width, game.screen_height);
        this.autoSort = false;

        //this.pipe_logo_array.forEach(this.parseRow);
        logo_count = 0;
		for(var r = 0; r < 3; r++) {
			for(var c = 0; c < 11; c++) {
				adjust = RandomInt(224,900);
				this.pipe_logo_array[r][c].push(this.addPipe(c*32+x, (r*32+y)-adjust, this.pipe_logo_array[r][c][0], this.pipe_logo_array[r][c][1], logo_count, adjust, this));
				logo_count++;
			}
		}

		/*setInterval( (function(){
			this.logo_time_counter++;
		}).bind(this), 1000);*/
	},

	quit: function() {
		for(var r = 0; r < 3; r++) {
			for(var c = 0; c < 11; c++) {
				this.pipe_logo_array[r][c][2].quit();
			}
		}
	},

	addPipe: function(x, y, type, orientation, order, adjust, container) {
		pipe = new game.simplePipe(x, y, type, orientation, order, adjust, container);
		this.addChild(pipe);
		return pipe;
	}
});

game.simplePipe = me.SpriteObject.extend({
	init: function(x, y, type, orien, order, adjust, container) {
		this.type = type;
		this.original_y = y;
		this.adjust = adjust;
		angle_orientations = [0, 1.57, 3.14, 4.71];
		this.final_orien = angle_orientations[orien];
		this.order = order;
		this.container = container;

		if(type === 0) {
			type = RandomInt(1,3);
			orien = RandomInt(0,3);
			this.stay = false;
		} else {
			this.stay = true;
		}
		//this.angle = angle_orientations[orien];
		this.angle = angle_orientations[RandomInt(0,3)];

		switch(type) {
			case 1:
				image = "farmpipestraight";
				break;
			case 2:
				image = "farmpipebent";
				break;
			case 3:
				image = "farmpipetee";
				break;
		}
		this.parent(x, y, me.loader.getImage(image), 32, 32);

		//this.dropIn(RandomInt(1,3)*1000);
		this.dropIn(3000, adjust);
		this.reOrient(order, angle_orientations[orien]);
	},

	quit: function() {
		this.tween.stop();
		clearTimeout(this.interval_handle);
		this.angle = this.final_orien;
		//this.pos.x = this.x;
		this.pos.y = this.original_y + this.adjust;
		if(this.type === 0) { game.title.logo_container.removeChild(this); }
	},

	dropIn: function(time, adjust) {
		this.tween = new me.Tween(this.pos).to({y: this.pos.y + adjust}, time).onComplete( (function(){
		}).bind(this));
		this.tween.easing(me.Tween.Easing.Back.Out);
		//tween.easing(me.Tween.Easing.Bounce.Out);
		this.tween.start();
	},

	dropOut: function() {
		directions = [1,3]
		FallingHelper(directions[RandomInt(0,1)], 3, this, false, this.container);
		me.audio.play("piperemove_sfx");
	},

	reOrient: function(order, angle) {
		this.interval_handle = setTimeout((function(){
			if(this.order === 32 && !game.title.scene) {
				//this.container.startNext();
				game.title.sprites_container.nextPhase();
			}

			if(this.stay){
				if(this.angle !== angle)
				{
					this.angle = angle;
					me.audio.play("pipemove_sfx");
				}
			} else {
				this.dropOut();
			}
		}).bind(this), 3000 + (order*80))
	}
});
