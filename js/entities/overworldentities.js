/*-------------------
a player entity
-------------------------------- */
game.PlayerEntity = me.ObjectEntity.extend({

    /* -----

    constructor

    ------ */

    init: function(x, y, settings) {

        settings.spritewidth = 32;
        settings.spriteheight = 48;
        settings.image = "mainchar";

        // call the constructor
        this.parent(x, y, settings);

        game.player = this;
        this.name = "player";
        this.action_distance = 48;

        //this.renderable.anim = {};
		this.renderable.addAnimation("walkforward", [0, 1, 0, 2], 100);
		this.renderable.addAnimation("walkbackward", [3, 4, 3, 5], 100);
		this.renderable.addAnimation("walksideways", [6, 7, 6, 8], 100);
		this.renderable.addAnimation("walkforwardangle", [9, 10, 9, 11], 100);
		this.renderable.addAnimation("walkbackwardangle", [12, 13, 12, 14], 100);
		this.renderable.setCurrentAnimation("walkforward");


        // set the default horizontal & vertical speed (accel vector)
        this.setVelocity(game.game_info_object.ability.velocity, game.game_info_object.ability.velocity);
        //this.setVelocity(4, 4);
		this.collideable = true;
		this.gravity = 0;
        // adjust the bounding box
        //this.updateColRect(4, 24, 38, 10);
		var shape = this.getShape();
		shape.pos.x = 4;
		shape.pos.y = 32;
		shape.resize(24, 16);

        this.busy = false;
        this.direction = "down";
        this.old_direction = "down";

        // set the display to follow our position on both axis
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

    },

    update: function(delta) {

        if(!this.busy) {


			if (me.input.isKeyPressed('left')) {
			    this.direction = 'left';

			    //this.renderable.setCurrentAnimation("walksideways");
			    // update the entity velocity
			    this.vel.x -= this.accel.x * me.timer.tick;
			} else if (me.input.isKeyPressed('right')) {
			    this.direction = 'right';
			    // update the entity velocity
			    this.vel.x += this.accel.x * me.timer.tick;
			} else {
			    if(!this.busy) {
			    	this.vel.x = 0;
			    }
			}

			if (me.input.isKeyPressed('up')) {
			    this.direction = 'up';
			    //this.renderable.setCurrentAnimation("walkbackward");
			    // update the entity velocity
			    this.vel.y -= this.accel.y * me.timer.tick;
			} else if (me.input.isKeyPressed('down')) {
			    this.direction = 'down';
			    // unflip the sprite
			    //this.renderable.setCurrentAnimation("walkforward");
			    // update the entity velocity
			    this.vel.y += this.accel.y * me.timer.tick;
			} else {
				if(!this.busy) {
			    	this.vel.y = 0;
			    }
			}

            if (me.input.isKeyPressed('up') && me.input.isKeyPressed('left')) {
                this.direction = 'upleft';
            } else if (me.input.isKeyPressed('up') && me.input.isKeyPressed('right')) {
                this.direction = 'upright';
            } else if (me.input.isKeyPressed('down') && me.input.isKeyPressed('left')) {
                this.direction = 'downleft';
            } else if (me.input.isKeyPressed('down') && me.input.isKeyPressed('right')) {
                this.direction = 'downright';
            }

            if (me.input.isKeyPressed('action')) {
              //console.log(this.closestNPC);
              //game.player.isFacing(this) && this.pos.distance(game.player.pos) < 100 && !this.busy) {
              if(this.closestNPC && this.pos.distance(this.closestNPC.pos) < this.action_distance && this.isFacing(this.closestNPC)) {
              this.closestNPC.action();
              }
            }

            if (me.input.isKeyPressed('start')) {
              this.busy = true;
              game.play.HUD.showMenu();
            }

        }

        if(!this.busy && !me.input.isKeyPressed('up') && !me.input.isKeyPressed('left') && !me.input.isKeyPressed('down') && !me.input.isKeyPressed('right')) this.renderable.setAnimationFrame(0);

        //Did the direction change?
        if(this.old_direction !== this.direction) {
            //this.renderable.setCurrentAnimation(this.direction);
            this.old_direction = this.direction;

            switch(this.direction)
            {
                case "up":
                    this.renderable.setCurrentAnimation("walkbackward");
                    break;
                case "down":
                    this.renderable.setCurrentAnimation("walkforward");
                    break;
                case "left":
                    this.flipX();
                    this.renderable.setCurrentAnimation("walksideways");
                    break;
                case "right":
                    this.flipX(false);
                    this.renderable.setCurrentAnimation("walksideways");
                    break;
                case "upleft":
                    this.flipX(false);
                    this.renderable.setCurrentAnimation("walkbackwardangle");
                    break;
                case "upright":
                    this.flipX();
                    this.renderable.setCurrentAnimation("walkbackwardangle");
                    break;
                case "downleft":
                    this.flipX(false);
                    this.renderable.setCurrentAnimation("walkforwardangle");
                    break;
                case "downright":
                    this.flipX();
                    this.renderable.setCurrentAnimation("walkforwardangle");
                    break;
            }
        }

        /*if (me.input.isKeyPressed('enter')) {
            game.player.HUD.removeDialogue();
        }*/

        // check & update player movement
        this.updateMovement();

        me.game.world.collide(this);

		// update animation if necessary
		if (this.vel.x!=0 || this.vel.y!=0) {
			// update object animation
			me.game.world.sort();
			this.parent(delta);
			return true;
		}

        // else inform the engine we did not perform
        // any update (e.g. position, animation)
        return false;
    },

    isFacing : function (obj) {
		return (
			(this.direction === "left"  && obj.right  - 32 < this.left) ||
			(this.direction === "right" && obj.left   + 32 > this.right) ||
			(this.direction === "up"    && obj.bottom - 48 < this.top) ||
			(this.direction === "down"  && obj.top    + 32 > this.bottom)
		)
	}

});

/* NPC's */
game.npcEntity = me.ObjectEntity.extend({

    init: function(x, y, settings, width) {
        settings.spritewidth = width || 32;
        settings.spriteheight = 48;
        this.mobility = settings.mobility;
        this.parent(x, y, settings);

        this.setMobility(settings.mobility);

        this.gravity = 0;
        this.collideable = true;

		if(!this.getShape()) {
			this.addShape(new me.Rect(new me.Vector2d(0, 0), 32, 48));
		}
		var shape = this.getShape();
		//console.log("shape follows:");
		//console.log(shape);
		shape.pos.x = 4;
		shape.pos.y = 32;
		shape.resize(24, 16);

        this.wait = 40;
		//this.setVelocity(4, 4);
        //this.walking_wait = 40;
        //this.standing_wait = 100;
        this.timer = 0;
        this.walk_switch = false;

        this.name = settings.fname;
        this.message = eval("(" + settings.message + ")");

        this.busy = false;
        this.direction = "down";
        this.old_direction = "";

        this.addAnimations();

    },

    setMobility: function(mobi) {
		switch(mobi) {
			case "stopped":
				this.setVelocity(4, 4);
				this.walking_wait = 40;
				this.standing_wait = 100;
				break;
			case "slow":
				this.setVelocity(4, 4);
				this.walking_wait = 40;
				this.standing_wait = 100;
				break;
			case "fast":
				this.setVelocity(6, 6);
				this.walking_wait = 40;
				this.standing_wait = 100;
				break;
			case "constant":
				this.setVelocity(4, 4);
				this.walking_wait = 40;
				this.standing_wait = 0;
				break;
			case "constantfast":
				this.setVelocity(6, 6);
				this.walking_wait = 40;
				this.standing_wait = 0;
				break;
			default:
				this.setVelocity(3, 3);
				this.walking_wait = 40;
				this.standing_wait = 100;
				break;
		}
    },

    addAnimations: function() {
        //this.renderable = new me.AnimationSheet(this.x, this.y, me.loader.getImage("farmer"), 32, 48);
        //this.renderable.anim = {};
        this.renderable.addAnimation("walkforward", [0, 1, 0, 2], 100);
        this.renderable.addAnimation("walkbackward", [3, 4, 3, 5], 100);
        this.renderable.addAnimation("walksideways", [6, 8, 7, 8], 100);
        //this.renderable.addAnimation("walkforwardangle", [9, 10, 9, 11], 100);
        //this.renderable.addAnimation("walkbackwardangle", [12, 13, 12, 14], 100);
        this.renderable.setCurrentAnimation("walkforward");
    },

    facePlayer: function() {
      switch(game.player.direction)
      {
          case "up":
              this.direction = "down";
              break;
          case "down":
              this.direction = "up";
              break;
          case "left":
              this.direction = "right";
              break;
          case "right":
              this.direction = "left";
              break;
          case "upleft":
              this.direction = "down";
              break;
          case "upright":
              this.direction = "down";
              break;
          case "downleft":
              this.direction = "up";
              break;
          case "downright":
              this.direction = "up";
              break;
      }
    },

    action: function() {

      this.facePlayer();
      this.checkDirection();

      //Player wants to interact
      this.busy = true;
      //stop moving
      this.vel.x = 0;
      this.vel.y = 0;
      //initiate a dialogue with the player
      game.play.HUD.dialogue(this.message, this);
    },

    doneTalking: function() {
        game.player.busy = false;
        this.busy = false;
    },

    movement: function() {
        //alternate between walking in a random direction and standing still
        if(this.walk_switch == false) {
            switch(RandomInt(0,3)) {
                case 0:
                    this.direction = "up";
                    break;
                case 1:
                    this.direction = "right";
                    break;
                case 2:
                    this.direction = "down";
                    break;
                case 3:
                    this.direction = "left";
                    break;
            }
            this.wait = this.walking_wait;
        } else {
            this.direction = "";
            this.wait = this.standing_wait;
        }

		this.walk_switch = !this.walk_switch;
		if(!this.walk_switch) this.renderable.setAnimationFrame(0);
        //this.vel.x += this.accel.x * me.timer.tick;
        //this.direction = "right";
    },

    update: function(delta) {

 		player_feet_pos = {"x":game.player.pos.x, "y":game.player.pos.y + 16};
        if (game.player.isFacing(this) && this.pos.distance(player_feet_pos) < game.player.action_distance && !this.busy) {
            //console.log("Player facing me!");
            game.player.closestNPC = this;
        }

        //Every four timer ticks, activate the movement function
        if(!this.busy && this.mobility != "stopped") {
            //this.movement();
           	this.timer += me.timer.tick;

			if(this.timer >= this.wait) {
				this.movement();
				this.timer = 0;
			}
        }

		this.updateMovement();
		this.checkDirection();


        if(!this.busy && this.mobility != "stopped") {

            switch(this.direction) {
                case "up":
                    this.vel.y -= this.accel.y * me.timer.tick;
                    break;
                case "right":
                    this.vel.x += this.accel.x * me.timer.tick;
                    break;
                case "down":
                    this.vel.y += this.accel.y * me.timer.tick;
                    break;
                case "left":
                    this.vel.x -= this.accel.x * me.timer.tick;
                    break;
                default:
                    this.vel.x = 0;
                    this.vel.y = 0;
            }
        }

        // update animation if necessary
        if (this.vel.x!=0 || this.vel.y!=0) {
            // update object animation
            me.game.world.sort();
            this.parent(delta);
            return true;
        }

        // else inform the engine we did not perform
        // any update (e.g. position, animation)
        return false;
    },

    checkDirection: function() {
        if(this.old_direction !== this.direction) {
            //this.renderable.setCurrentAnimation(this.direction);
            this.old_direction = this.direction;

			switch(this.direction)
			{
			    case "up":
			        this.renderable.setCurrentAnimation("walkbackward");
			        break;
			    case "down":
			        this.renderable.setCurrentAnimation("walkforward");
			        break;
			    case "left":
			        this.flipX();
			        this.renderable.setCurrentAnimation("walksideways");
			        break;
			    case "right":
			        this.flipX(false);
			        this.renderable.setCurrentAnimation("walksideways");
			        break;
			}
		}
	}

});

game.npcAnimal = game.npcEntity.extend({
	init: function(x, y, settings) {
		this.parent(x, y, settings, 64);
    this.noise = settings.noise;
	},

  action: function() {
    me.audio.play(this.noise);
  },

	addAnimations: function() {
		this.renderable.addAnimation("walkforward", [4, 5], 100);
		this.renderable.addAnimation("walkbackward", [2, 3], 100);
		this.renderable.addAnimation("walksideways", [0, 1], 100);
		this.renderable.setCurrentAnimation("walkforward");
  }
});

game.propAnimation = me.AnimationSheet.extend({
	init: function(x, y, settings) {
		//define frames as object variables first so they can be used to redefine
		//animations with new speeds later
		this.first_frames = [0, 1, 2, 3];
		this.second_frames = [4, 5, 6, 7];
		this.third_frames = [8, 9, 10, 11];
		this.firstreverse_frames = [3, 2, 1, 0];
		this.secondreverse_frames = [7, 6, 5, 4];
		this.thirdreverse_frames = [11, 10, 9, 8];

		console.log(settings.uid + "'s width is " + settings.width + " and height is " + settings.height);
		speed = (settings.speed) ? settings.speed : 400 ;

		this.parent(x, y, me.loader.getImage(settings.image), settings.width, settings.height);

		this.z += settings.z;
		//if(align = true) align the prop to the grid
		if(settings.align) {
			this.pos.x = ~~(this.pos.x / 32) * 32;
			this.pos.y = ~~(this.pos.y / 32) * 32;
		}

		this.name = settings.uid;
		this.addAnimation("first", this.first_frames, settings.speed);
		this.addAnimation("second", this.second_frames, settings.speed);
		this.addAnimation("third", this.third_frames, settings.speed);
		this.addAnimation("firstreverse", this.firstreverse_frames, settings.speed);
		this.addAnimation("secondreverse", this.secondreverse_frames, settings.speed);
		this.addAnimation("thirdreverse", this.thirdreverse_frames, settings.speed);
		this.setCurrentAnimation("first");
		this.animationpause = settings.pause;
	}
});

game.vehicleAnimation = me.AnimationSheet.extend({
	init: function(x, y, settings) {

		this.parent(x, y, me.loader.getImage(settings.image), 128, 128);

		this.name = settings.uid;
		this.addAnimation("driveforward", [4, 5], 400);
		this.addAnimation("drivebackward", [2, 3], 400);
		this.addAnimation("drivesideways", [0, 1], 400);
		this.setCurrentAnimation(settings.direction);
		this.animationpause = settings.animationpause || true;
	}
});

game.treasureChest = me.ObjectEntity.extend({
	init: function(x, y, settings) {

        settings.spritewidth = 32;

        // call the constructor
        this.parent(x, y, settings);

		//align the chest to the grid
		this.pos.x = ~~(this.pos.x / 32) * 32;
		this.pos.y = ~~(this.pos.y / 32) * 32;

        this.name = "treasureChest";
        this.message = settings.message || "You've found a(n) " + settings.item + "!";

		//this.renderable.anim = {};
		this.renderable.addAnimation("open", [0, 1, 2], 100);
		this.renderable.addAnimation("opened", [2], 100);

		this.settings = settings;


		if(game.game_info_object.inventory.opened[settings.uid])
		{
			this.opened = true;
			this.renderable.setCurrentAnimation("opened");

		} else {
						//game.game_info_object.puzzle.completed[settings.uid] = true;
			this.renderable.setCurrentAnimation("open");
		}

		this.renderable.animationpause = true;
    },

	action: function() {
		if(this.opened) { return "I already opened this chest!"; }

				this.renderable.animationpause = false;
		this.renderable.setCurrentAnimation("open", (function(){
			this.renderable.setCurrentAnimation("opened");
			this.renderable.animationpause = true;
			this.giveItem();
		}).bind(this));
	},

	giveItem: function() {
		game.game_info_object.inventory.opened[this.settings.uid] = true;

		//var lookup = {};

		AddInventory(this.settings.item);
		/*for (var i = 0; i < game.game_info_object.inventory.inventory_array.length; i++) {
			//lookup[array[i].id] = array[i];
			if(game.game_info_object.inventory.inventory_array[i].name === this.settings.item) game.game_info_object.inventory.inventory_array[i].owned = true;
		}*/

		this.opened = true;
		game.play.HUD.dialogue({"verses":[{"speech":[this.message],"speakers":["@treasure"]}]}, this);
            		//this.renderable.animationpause = true;
		//console.log(this.settings.item);
	},

	update: function(delta) {
		player_feet_pos = {"x":game.player.pos.x, "y":game.player.pos.y + 16};
		if (game.player.isFacing(this) && this.pos.distance(player_feet_pos) < game.player.action_distance) {
			//console.log("Player facing me!");
			game.player.closestNPC = this;
		}

		//if(this.opening) {
			this.parent(delta);
			return true;
		//}
    },

    doneTalking: function() {
        game.player.busy = false;
    }

});

game.trashEntity = me.ObjectEntity.extend({

    init: function(x, y, settings) {
        // call the constructor
        settings.spritewidth = 32;
        settings.spriteheight = 48;

        this.parent(x, y, settings);

		if(settings.outside) {
			this.renderable.addAnimation("open", [0, 1, 2], 100);
			this.renderable.addAnimation("tipped", [3], 1000);
			this.opening = true;
		} else {
			this.renderable.addAnimation("open", [0, 1, 2, 1, 0], 100);
			this.renderable.addAnimation("tipped", [3], 1000);
		}

		this.settings = settings;

		if(game.game_info_object.puzzle.completed[settings.uid])
		{
			this.completed = true;
			this.renderable.setCurrentAnimation("tipped");

		} else {
			//game.game_info_object.puzzle.completed[settings.uid] = true;
			this.renderable.setCurrentAnimation("open");
		}
		//this.renderable.animationpause = false;
    },

	action: function() {
		//console.log("start the puzzle!");

		if(this.completed) { return "I already fixed those pipes!"; }

    	this.opening = true;
    	this.renderable.setCurrentAnimation("open", (function(){this.opening=false;}).bind(this));

        //Save the map position for returning to later (But one block left so we don't warp onto the trash)
        game.game_info_object.overworld.location = String(this.pos.x) + ", " + String(this.pos.y + 32);
        //game.game_info_object.overworld.pos = this.y + 32;

        //Gather settings for the puzzle, pass it to the game_info object for perusal by the puzzle builder
        /*
        game.game_info_object.puzzle.uid = this.settings.uid;
        game.game_info_object.puzzle.npc = this.settings.npc;
        game.game_info_object.puzzle.pressure = this.settings.pressure;
        game.game_info_object.puzzle.time = this.settings.time;
        game.game_info_object.puzzle.sync = this.settings.sync;
        game.game_info_object.puzzle.outpipes = this.settings.outpipes;
        game.game_info_object.puzzle.pipeability = this.settings.pipeability;
        game.game_info_object.puzzle.bugs = this.settings.bugs;
        game.game_info_object.puzzle.burrowers = this.settings.burrowers;
        */
        game.game_info_object.puzzle.settings = this.settings;
                        //(this.settings.night) ? console.log("night") : console.log("no night")
		if(this.settings.night) {
			me.game.world.removeChild(game.player);
			game.play.HUD.darken(this);
		} else {
			this.startPuzzle();
		}
    },

    startPuzzle: function() {
        me.state.change(me.state.STATE_PUZZLE);
    },

    update: function(delta) {
		if (game.player.isFacing(this) && this.pos.distance(game.player.pos) < game.player.action_distance && !this.talking) {
			//console.log("Player facing me a puzzle!");
			game.player.closestNPC = this;
		}

		if(this.opening) {
			this.parent(delta);
			return true;
		}
    }
});

game.gateEntity = me.ObjectEntity.extend({
	init: function(x, y, settings) {

	settings.spritewidth = 32;
	this.settings = settings;
	this.parent(x, y, settings);

  this.image = settings.image;
	this.name = settings.uid;

	this.renderable.addAnimation("open", [1, 2], 400);
	this.renderable.addAnimation("closed", [0]);
	//this.renderable.setCurrentAnimation("closed");
	if(game.game_info_object.inventory.opened[settings.uid])
	{
		var collisionLayer = me.game.currentLevel.getLayerByName("collision");
		collisionLayer.clearTile(~~(this.pos.x / 32), ~~(this.pos.y / 32));
		this.renderable.setAnimationFrame(2);
	} else {
				//game.game_info_object.puzzle.completed[settings.uid] = true;
		this.renderable.setCurrentAnimation("closed");
	}
	this.renderable.animationpause = true;

	//align the gate to the grid
	this.pos.x = ~~(this.pos.x / 32) * 32;
	this.pos.y = ~~(this.pos.y / 32) * 32;

	/* // Don't make a gates array, that's stupid, just search by name using the engine tools
	if(!game.play.gates) {
		console.log("create the gates array if it's not already there");
		game.play.gates = [];
	}
	game.play.gates.push({uid: settings.uid, reference: this});
	*/

	this.renderable.flipX( (settings.flip) ? true : false );
	},

	open: function() {
		game.game_info_object.inventory.opened[this.settings.uid] = true;
		var collisionLayer = me.game.currentLevel.getLayerByName("collision");
		collisionLayer.clearTile(~~(this.pos.x / 32), ~~(this.pos.y / 32));
		me.audio.play(this.image + "_sfx");
    console.log('open sesame!, with anim - sound:' + this.image + "_sfx");
		this.renderable.animationpause = false;
		this.renderable.setCurrentAnimation("open", (function() {
			//console.log('open sesame anim over');
			this.renderable.animationpause = true;
			//this.renderable.setAnimationFrame(2);
			return false;
		}).bind(this));


	}/*,

    update: function(delta) {
		if (game.player.isFacing(this) && this.pos.distance(game.player.pos) < game.player.action_distance && !this.talking) {
			console.log("Player facing a gate!");
			game.player.closestNPC = this;
		}

		//if(this.opening) {
		this.parent(delta);
		return true;
		//}
    }*/
});

game.eventEntity = me.ObjectEntity.extend({
	spawned_entity_array : [],
	next_item : true,
	event_started: false,
	process_flag: false,

	/*event_que: [//{action: "noninteractive"},
				//{action: "spawn", image: "farmer", x_offset: 0, y_offset: 0},
				//{action: "move", index: 0, direction: "up", distance: 32, final_direction: "up", stop_followers: 0},
				//{action: "process"},
				//{action: "delay", delay: 1},
				//{action: "dialogue"},
				//{action: "move", index: 0, direction: "right", distance: 128, final_direction: "down", stop_followers: 0},
				//{action: "process"},
				{action: "phone", speaker: "Farmer Joe", message: "Meet me at my shop, it's on Main street right next to the burger palace."},
				//{action: "move", index: 0, direction: "down", distance: 32, final_direction: "down", stop_followers: 0},
				//{action: "process"},
				{action: "end"}
                        ],
    */

	init: function(x, y, settings)  {
		this.parent(x, y, settings);

		this.event_que = eval("(" + settings.script + ")");
		this.settings = settings;
		this.x = settings.x;
		this.y = settings.y;
		this.eventname = settings.eventname;
    this.nonplayer = settings.objectname;

		this.error_amount = 4;
    this.repeat = settings.repeat;

		this.trigger = settings.trigger;
    this.triggered = false;

		this.spawned_animation_array = [];

		//Always keep the player object at the top of the NPC array, in case he needs to be moved.
		this.spawned_entity_array.push(game.player);

		if(!this.triggered && !game.game_info_object.events[this.settings.eventname] && this.trigger == "load" && this.checkForItem(settings.item) && this.checkForEvent(settings.preevent) && this.checkForPuzzle(settings.prepuzzle) ) {
			//game.game_info_object.events[settings.eventname] = true;
			this.alwaysUpdate = true;

			console.log("Event starting");
			console.log(this);
      this.triggered = true;
			this.nextEvent("init");
		}
	},

	//If requested, only run it player found item 'settings.item' (Item name)
	checkForItem: function(item) {
		if(item === undefined) {
			return true;
		} else {
			return CheckInventory(item);
		}
	},

	//If requested, only run it player experienced event 'settings.event' (event name)
	checkForEvent: function(preevent) {
		if(preevent === undefined) {
			return true;
		} else {
			return game.game_info_object.events[preevent];
		}
	},

  	//If requested, only run if player solved puzzle 'settings.puzzle' (puzzle name)
	checkForPuzzle: function(prepuzzle) {
		if(prepuzzle === undefined) {
			return true;
		} else {
			return game.game_info_object.puzzle.completed[prepuzzle];
		}
	},

	onCollision: function(res,obj) {

    if(this.nonplayer) {
      var entity = (obj.name === this.nonplayer);
    } else {
      var entity = (obj instanceof game.PlayerEntity);
    }

		if (!game.game_info_object.events[this.settings.eventname] && this.trigger == "collision" && entity && this.checkForItem(this.settings.item) && this.checkForEvent(this.settings.preevent) && this.checkForPuzzle(this.settings.prepuzzle)) {
			game.game_info_object.events[this.settings.eventname] = true;
						this.alwaysUpdate = true;
			console.log(game.game_info_object.events);
      this.triggered = true;
			this.nextEvent("collision");
		}
	},

    nextEvent: function(caller) {
    	console.log(caller + " told me to move on!");

        if(!(this.event_que.length > 0)) { return false; }

        var current_event = this.event_que.shift();

		console.log("NEXT EVENT:" + current_event.action);
		console.log(current_event);

        switch(current_event.action) {
            case "noninteractive":
                this.noninteractive();
                break;
			case "animateprop":
				me.game.world.sort();
				var reverse = (current_event.reverse) ? "reverse" : "";
				if(current_event.speed) {
					//if event sends speed, redefine animation with new speed
					var frames = this.spawned_animation_array[current_event.index][current_event.animation+reverse+"_frames"];
					this.spawned_animation_array[current_event.index].addAnimation(current_event.animation+reverse, frames, current_event.speed);
				}
				this.spawned_animation_array[current_event.index].alwaysUpdate = true;
				this.spawned_animation_array[current_event.index].animationpause = false;

				//console.log("SPEED IS: " + this.spawned_animation_array[current_event.index].animationspeed + " Asked speed:" + current_event.speed);
				if(current_event.repeat) {
					this.spawned_animation_array[current_event.index].setCurrentAnimation(current_event.animation + reverse);
					//this.spawned_animation_array[current_event.index].alwaysUpdate = false;
					this.nextEvent("prop animate, repeat (Non-blocking");
				} else {
					this.spawned_animation_array[current_event.index].setCurrentAnimation(current_event.animation + reverse, (function() {
						this.spawned_animation_array[current_event.index].animationpause = true;
						this.spawned_animation_array[current_event.index].setAnimationFrame(3);
						if(current_event.blocking) this.nextEvent("animate prop (blocking)");
						//this.spawned_animation_array[current_event.index].alwaysUpdate = false;
					}).bind(this));
					if(!current_event.blocking) this.nextEvent("animate prop (non-blocking)");
					//this.spawned_animation_array[current_event.index].alwaysUpdate = false;
				}
				break;
			case "gate":
				var gates = me.game.world.getChildByName(current_event.uid);
				console.log(gates);
				gates.forEach(function(element) {
					element.open();
				})
				this.nextEvent('gates');
				break;
			case "addsprite":
				//console.log(this.spawned_animation_array);
				console.log(me.game.world.getChildByName(current_event.name)[0]);
				this.spawned_animation_array.push(me.game.world.getChildByName(current_event.name)[0]);
				this.nextEvent("add sprite");
				break;
            case "spawncar":
            	this.spawnCar(current_event.image, current_event.anim, current_event.direction, LocationInt(current_event.x), LocationInt(current_event.y));
            	break;
            case "tween":
            	console.log(this.spawned_animation_array[0]);
            	this.tweenTo(current_event.index, this.spawned_animation_array[current_event.index].x + LocationInt(current_event.x), this.spawned_animation_array[current_event.index].y + LocationInt(current_event.x), current_event.time, current_event.ease, current_event.direction, current_event.blocking);
            	break;
            case "tweento":
            	var block = (current_event.blocking === undefined)? true: current_event.blocking;
            	this.tweenTo(current_event.index, LocationInt(current_event.x), LocationInt(current_event.y), current_event.time, current_event.ease, current_event.direction, block);
            	break;
			case "addnpc":
        var npcref = me.game.world.getChildByName(current_event.name)[0]
        npcref.busy = true;
				this.spawned_entity_array.push(npcref);
				console.log(npcref);
        console.log(this.spawned_entity_array);
				this.nextEvent("add npc");
				break;
			case "spawnnpc":
				this.spawnNPC(current_event.image, current_event.dialogue, LocationInt(current_event.x), LocationInt(current_event.y), current_event.mobility);
				break;
			case "spawnanimalnpc":
				this.spawnAnimalNPC(current_event.image, current_event.dialogue, LocationInt(current_event.x), LocationInt(current_event.y));
				break;
			case "directionnpc":
				this.spawned_entity_array[current_event.index].direction = current_event.direction;
				this.nextEvent("directionnpc");
				break;
            case "move":
                console.log("Move event");
                //this.setMovementGoalEntity(current_event.index, current_event.direction, current_event.distance, current_event.final_direction, current_event.stop_followers);
                this.spawned_entity_array[current_event.index].targetx = this.spawned_entity_array[current_event.index].pos.x + (LocationInt(current_event.x));
				this.spawned_entity_array[current_event.index].targety = this.spawned_entity_array[current_event.index].pos.y + (LocationInt(current_event.y));
				this.nextEvent("move");
                break;
            case "moveto":
            	console.log("Move to point");
              console.log(this.spawned_entity_array);
            	console.log(this.spawned_entity_array[current_event.index]);
				this.spawned_entity_array[current_event.index].targetx = LocationInt(current_event.x);
				this.spawned_entity_array[current_event.index].targety = LocationInt(current_event.y);
				this.nextEvent("moveto");
            	//this.setMovementToGoalEntity(current_event.index, current_event.x, current_event.y);
            	break;
            case "teleport":
            	if(current_event.hide) {
            		if(current_event.index === 0) {
            			me.game.viewport.target = null;
            		}
					this.spawned_entity_array[current_event.index].pos.x = -100;
					this.spawned_entity_array[current_event.index].pos.y = -100;
            	} else {
					this.spawned_entity_array[current_event.index].pos.x = LocationInt(current_event.x);
					this.spawned_entity_array[current_event.index].pos.y = LocationInt(current_event.y);
            	}

            	this.nextEvent("teleport");
            	break;
            case "process":
                if(this.targetsAvailable()) { this.process_flag = true; }
                break;
            case "dialogue":
				this.initiateDialogue(current_event.message_script);
                break;
			case "face":
				this.spawned_entity_array[(current_event.index === undefined)? 0 : current_event.index].direction = current_event.direction;
				this.nextEvent("face");
				break;
			case "murder":
				me.game.world.removeChild(this.spawned_entity_array[(current_event.index === undefined)? 0 : current_event.index]);
				this.nextEvent("murder");
				break;
			case "blowup":
				me.game.world.removeChild(this.spawned_animation_array[(current_event.index === undefined)? 0 : current_event.index]);
				this.nextEvent("blowup");
				break;
			case "viewport":
				me.game.viewport.target = null;
				me.game.viewport.moveTo(LocationInt(current_event.x), LocationInt(current_event.y));
				this.nextEvent("viewport");
				break;
			case "follow":
				me.game.viewport.target = null;
				if(current_event.objecttype == "sprite") {
					var item_to_follow = this.spawned_animation_array[current_event.index].pos;
				} else {
					var item_to_follow = this.spawned_entity_array[current_event.index].pos;
				}
				console.log("trying to follow");
				console.log(item_to_follow);
				me.game.viewport.follow(item_to_follow);
				this.nextEvent("viewport");
				break;
			case "shake":
				me.game.viewport.shake(current_event.intensity, current_event.duration, me.game.viewport[current_event.axis], (function(){
					if(current_event.blocking) this.nextEvent("blocking screen shake");
				}).bind(this));
				if(!current_event.blocking) this.nextEvent("Non-blocking screen shake");
				break;
			case "fade":
				me.game.viewport["fade" + current_event.direction](current_event.color, current_event.duration, (function() {
					if(current_event.blocking) this.nextEvent("blocking fade");
				}).bind(this));
				if(!current_event.blocking) this.nextEvent("Non-blocking fade");
				break;
			//case "follow":
				//me.game.viewport.follow(this.spawned_entity_array[(current_event.index === undefined)? 0 : current_event.index]);
				//this.nextEvent("follow");
				//break;
			case "level":
				me.audio.stopTrack();
				//game.game_info_object.overworld.location = game.player.pos.x + ", " + (game.player.pos.y + location_offset);
				game.game_info_object.overworld.map = current_event.mapname;
				game.game_info_object.events[this.eventname] = true;
				this.alwaysUpdate = false;
				//turn off persistance in all entitys in the entity array
				if(game.play.HUD.bars) game.play.HUD.killBars();
				game.play.loadLevel({to: current_event.mapname});
				//this.nextEvent("level");
				break;
      case "screen":
        me.audio.stopTrack();
        game.game_info_object.overworld.location = game.player.pos.x + ", " + game.player.pos.y;
        game.game_info_object.overworld.map = current_event.mapname;
        game.game_info_object.events[this.eventname] = true;
        this.alwaysUpdate = false;
        //turn off persistance in all entitys in the entity array
        if(game.play.HUD.bars) game.play.HUD.killBars();

        //Make this dynamic later
        me.state.change(me.state[current_event.screenname]);
        //me.state.change(me.state.CREDITS);
        break;
			case "sfx":
				console.log(current_event.snd);
        var looping = current_event.loop;
				if(current_event.pausetrack) me.audio.pauseTrack();
				var volume = current_event.volume / 100;

        me.audio.play(current_event.snd, looping);
        //Sound is fucked in 1.0.2, fix this later in 1.1.x?
        /* (function() {
					if(current_event.pausetrack) me.audio.resumeTrack();
					if(current_event.blocking) this.nextEvent("blocking sfx");
				}).bind(this), volume);
        if(!current_event.blocking) this.nextEvent("nonblocking sfx"); */
        this.nextEvent("sfx");
				break;
      case "stoptrack":
        console.log("Stop Track");
        me.audio.pauseTrack();
        this.nextEvent("stop track");
        break;
      case "restarttrack":
        console.log("restart Track");
        me.audio.resumeTrack();
        this.nextEvent("restart track");
        break;
    case "playtrack":
      console.log("play Track");
      me.audio.playTrack(current_event.track);
      this.nextEvent("play track");
      break;
    case "phone":
    	game.play.HUD.cellDialogue(current_event.message, current_event.name, this);
    	break
		case "delay":
			this.delay(current_event.delay);
			break;
    case "end":
        this.eventOver();
        break;
    }
  },

	doneTalking: function() {
		this.nextEvent("talking over");
	},

    targetsAvailable: function() {
        for(var g = 0; g <= this.spawned_entity_array.length - 1; g++) {

            if(this.spawned_entity_array[g].target || this.spawned_entity_array[g].targetx || this.spawned_entity_array[g].targety) {
            	//console.log(this.spawned_entity_array[g].name + " has target of " + this.spawned_entity_array[g].targetx + ":" + this.spawned_entity_array[g].targety);
                return true;
            }
        }

                return false;
    },

    /*
	setMovementGoalEntity: function(index, direction, distance, final_direction, stop_followers) {
        console.log("Move someone!");
        this.spawned_entity_array[index].direction = direction;
        switch(this.spawned_entity_array[index].direction) {
            case "up":
                console.log("pos " + this.spawned_entity_array[index].pos.y + " distance " + distance);
                this.spawned_entity_array[index].target = this.spawned_entity_array[index].pos.y - distance;
                break;
            case "down":
                this.spawned_entity_array[index].target = this.spawned_entity_array[index].pos.y + distance;
                break;
            case "left":
                this.spawned_entity_array[index].target = this.spawned_entity_array[index].pos.x - distance;
                break;
            case "right":
                this.spawned_entity_array[index].target = this.spawned_entity_array[index].pos.x + distance;
                break;
        }
        console.log(this.spawned_entity_array[index].target);
        this.nextEvent();
    },*/

    update: function(delta) {

    	if(this.process_flag) {
    		for(var g = 0; g <= this.spawned_entity_array.length - 1; g++) {
    			    			var targx = this.spawned_entity_array[g].targetx;
    			var targy = this.spawned_entity_array[g].targety;

				if(this.spawned_entity_array[g].pos.y >= targy + this.error_amount) {
					this.spawned_entity_array[g].vel.y -= this.spawned_entity_array[g].accel.y * me.timer.tick;
					this.spawned_entity_array[g].direction = "up";
				} else if(this.spawned_entity_array[g].pos.y <= targy - this.error_amount){
										this.spawned_entity_array[g].vel.y += this.spawned_entity_array[g].accel.y * me.timer.tick;
					this.spawned_entity_array[g].direction = "down";
				} else {
					this.spawned_entity_array[g].vel.y = 0;
				}

				if(this.spawned_entity_array[g].pos.x >= targx + this.error_amount) {
					this.spawned_entity_array[g].vel.x -= this.spawned_entity_array[g].accel.x * me.timer.tick;
					this.spawned_entity_array[g].direction = "left";
				} else if(this.spawned_entity_array[g].pos.x <= targx - this.error_amount){
					this.spawned_entity_array[g].vel.x += this.spawned_entity_array[g].accel.x * me.timer.tick;
					this.spawned_entity_array[g].direction = "right";
				} else {
					this.spawned_entity_array[g].vel.x = 0;
				}

				if(this.spawned_entity_array[g].pos.x >= targx - this.error_amount && this.spawned_entity_array[g].pos.x <= targx + this.error_amount && this.spawned_entity_array[g].pos.y >= targy - this.error_amount && this.spawned_entity_array[g].pos.y <= targy + this.error_amount){
										this.spawned_entity_array[g].vel.x = 0;
					delete this.spawned_entity_array[g].targetx;

					this.spawned_entity_array[g].vel.y = 0;
					delete this.spawned_entity_array[g].targety;
									}
				/*
				if(this.spawned_entity_array[g].pos.x >= targx - this.error_amount && this.spawned_entity_array[g].pos.x <= targx + this.error_amount){
					console.log("reached x");
					this.spawned_entity_array[g].vel.x = 0;
					delete this.spawned_entity_array[g].targetx;
					console.log(this.spawned_entity_array[g].vel.x + ":" + this.spawned_entity_array[g].vel.y);
				}

				if(this.spawned_entity_array[g].pos.y >= targy - this.error_amount && this.spawned_entity_array[g].pos.y <= targy + this.error_amount){
					console.log("reached y");
					this.spawned_entity_array[g].vel.y = 0;
					delete this.spawned_entity_array[g].targety;
					console.log(this.spawned_entity_array[g].vel.x + ":" + this.spawned_entity_array[g].vel.y);
				}
				*/

				if(!this.targetsAvailable() && this.process_flag === true) {
					console.log(this.spawned_entity_array[g].name + " - final pos | x:" + ~~(this.spawned_entity_array[g].pos.x/32) + " y:" + ~~(this.spawned_entity_array[g].pos.y/32) + " process_flag:" + this.process_flag);
					this.spawned_entity_array[g].vel.x = 0;
					this.spawned_entity_array[g].vel.y = 0;
					this.process_flag = false;
					this.nextEvent("process over");
				}

    		}
    	}

		/*
        if(this.process_flag) {
            if(this.targetsAvailable()) {
                //move any entities with axis goals
                for(var g = 0; g <= this.spawned_entity_array.length - 1; g++) {
                                                                                if(this.spawned_entity_array[g].target) {
                                                                switch(this.spawned_entity_array[g].direction) {
                            case "up":
                                if(this.spawned_entity_array[g].pos.y > this.spawned_entity_array[g].target) {
                                                                        this.spawned_entity_array[g].vel.y -= this.spawned_entity_array[g].accel.y * me.timer.tick;
                                } else {
                                                                        this.goalReached(this.spawned_entity_array[g]);
                                }
                                break;
                            case "down":
                                if(this.spawned_entity_array[g].pos.y < this.spawned_entity_array[g].target) {
                                    this.spawned_entity_array[g].vel.y += this.spawned_entity_array[g].accel.y * me.timer.tick;
                                } else {
                                    this.goalReached(this.spawned_entity_array[g]);
                                }
                                break;
                            case "left":
                                if(this.spawned_entity_array[g].pos.x > this.spawned_entity_array[g].target) {
                                    this.spawned_entity_array[g].vel.x -= this.spawned_entity_array[g].accel.x * me.timer.tick;
                                } else {
                                    this.goalReached(this.spawned_entity_array[g]);
                                }
                                break;
                            case "right":
                                if(this.spawned_entity_array[g].pos.x < this.spawned_entity_array[g].target) {
                                    this.spawned_entity_array[g].vel.x += this.spawned_entity_array[g].accel.x * me.timer.tick;
                                } else {
                                    this.goalReached(this.spawned_entity_array[g]);
                                }
                                break;
                        }
                    }
                }
            }
        }
		*/

        this.parent(delta);

    },

    /*goalReached: function(entity) {
        entity.vel.x = 0;
        entity.vel.y = 0;
        delete entity.target;
        if(!this.targetsAvailable()) {
            this.process_flag = false;
            this.nextEvent();
        }
    },*/

    noninteractive: function() {
		console.log("start cinematic");
		game.play.HUD.showBars();
		game.player.vel.x = 0;
		game.player.vel.y = 0;
		game.player.busy = true;
		this.nextEvent("cinibars");
    },

	delay: function(delay) {
		var timeout_ref = setTimeout( (function(){
						this.nextEvent("timedelay:"+timeout_ref);
			//clearTimeout(this.timeout_ref);
		}).bind(this), delay);
		console.log("Timeoutstarted:" + timeout_ref);
	},

    eventOver: function() {
    	 if(!this.repeat) game.game_info_object.events[this.eventname] = true;
		this.alwaysUpdate = false;
		//turn off persistance in all entitys in the entity array
		if(game.play.HUD.bars) game.play.HUD.hideBars();
        game.player.busy = false;

        for(var s = 0; s <= this.spawned_entity_array.length -1; s++) {
            this.spawned_entity_array[s].busy = false;
        }
		//turn viewport follow back on if turned off
		me.game.viewport.follow(game.player.pos);
    },

    spawnCar: function(imagename, anim, direction, x, y) {
    	console.log("Spawning a car- image:" + imagename + " anim:" + anim + " dir:" + direction + " x:" + x + " y:" + y);
		var last_item = this.spawned_animation_array.push(new me.AnimationSheet(x, y, me.loader.getImage(imagename), 128, 128));
		console.log(this.spawned_animation_array[last_item - 1]);

		this.spawned_animation_array[last_item - 1].addAnimation("driveforward", [4, 5], 400);
		this.spawned_animation_array[last_item - 1].addAnimation("drivebackward", [2, 3], 400);
		this.spawned_animation_array[last_item - 1].addAnimation("drivesideways", [0, 1], 400);
		this.carDirection(this.spawned_animation_array[last_item - 1], direction);
		//this.spawned_animation_array[last_item - 1].setCurrentAnimation(direction);

		me.game.world.addChild(this.spawned_animation_array[last_item - 1], 8);
		this.spawned_animation_array[last_item - 1].animationpause = anim;

		this.nextEvent("spawn car");
    },

    carDirection: function(object, direction) {
		switch(direction)
		{
			case "down":
				object.setCurrentAnimation("driveforward");
				break;
			case "up":
				object.setCurrentAnimation("drivebackward");
				break;
			case "left":
				object.setCurrentAnimation("drivesideways");
				object.flipX(true);
				break;
			case "right":
				object.setCurrentAnimation("drivesideways");
				object.flipX(false);
				break;
		}
    },

    tweenTo: function(index, toX, toY, time, ease, direction, blocking) {

		console.log(this.spawned_animation_array);

		this.blocking = blocking;
		if(direction) {
			this.carDirection(this.spawned_animation_array[index], direction);
		}

    	var tween = new me.Tween(this.spawned_animation_array[index].pos).to({x: toX, y: toY}, time).onComplete( (function() {
    		if(this.blocking){
    			this.nextEvent("tweeny blocked");
    		}
    	}).bind(this));

		switch(ease) {
			case "start":
				var ease_type = me.Tween.Easing.Quintic.In;
				break;
			case "stop":
				var ease_type = me.Tween.Easing.Quintic.Out;
				break;
			case "startstop":
				var ease_type = me.Tween.Easing.Quintic.Out;
				break;
			case "cont":
				var ease_type = me.Tween.Easing.Linear.None;
				break;
			default:
				var ease_type = me.Tween.Easing.Quintic.Out;
				break;
		}

		tween.easing(ease_type);
		tween.start();
		if(!blocking) {
			this.nextEvent("tweeny unblocked");
		}
    },

    spawnNPC: function(imagename, dialogue, x_offset, y_offset, mobi) {
		console.log('imagename: ' + imagename + " offsets:" + (x_offset) + ":" + (y_offset));
		//var last_item = this.spawned_entity_array.push( new game.npcEntity (this.x + x_offset, this.y + y_offset, {image: imagename, spritewidth: 32, spriteheight: 48, width: 32, height: 48}) );
		var last_item = this.spawned_entity_array.push( new game.npcEntity (x_offset, y_offset, {image: imagename, spritewidth: 32, spriteheight: 48, width: 32, height: 48, mobility: mobi}) );

		this.spawned_entity_array[last_item - 1].message = dialogue;
		//this.spawned_entity_array[last_item - 1].addShape(new me.Rect(new me.Vector2d(0, 0), 32, 48));
		this.spawned_entity_array[last_item - 1].width = 32;
		this.spawned_entity_array[last_item - 1].height = 48;
		me.game.world.addChild(this.spawned_entity_array[last_item - 1], 8);
		this.spawned_entity_array[last_item - 1].busy = true;
		this.spawned_entity_array[last_item - 1].alwaysUpdate = true;
		this.nextEvent("spawn npc");
    },

    spawnAnimalNPC: function(imagename, dialogue, x_offset, y_offset) {
		console.log('imagename: ' + imagename + " offsets:" + (x_offset) + ":" + (y_offset));
		//var last_item = this.spawned_entity_array.push( new game.npcEntity (this.x + x_offset, this.y + y_offset, {image: imagename, spritewidth: 32, spriteheight: 48, width: 32, height: 48}) );
		var last_item = this.spawned_entity_array.push( new game.npcAnimal (x_offset, y_offset, {image: imagename, spritewidth: 64, spriteheight: 48, width: 64, height: 48}) );

		//this.spawned_entity_array[last_item - 1].addShape(new me.Rect(new me.Vector2d(0, 0), 64, 48));
		this.spawned_entity_array[last_item - 1].width = 64;
		this.spawned_entity_array[last_item - 1].height = 48;
		me.game.world.addChild(this.spawned_entity_array[last_item - 1], 8);
		this.spawned_entity_array[last_item - 1].busy = true;
		this.spawned_entity_array[last_item - 1].alwaysUpdate = true;
		console.log(this.spawned_entity_array[last_item]);
		this.nextEvent("spawn animal npc");
    },

    animateEntity: function(index, animation, repeats) {
        this.spawned_entity_array[index].renderable.setCurrentAnimation(animation, "default");
    },

    initiateDialogue: function(message_script, phone) {
        game.play.HUD.dialogue(message_script, this, 30, phone);
    },

});

me.LevelEntity = me.ObjectEntity.extend(
/** @scope me.LevelEntity.prototype */
{
    /** @ignore */
    init: function (x, y, settings) {
    	//only load once!
    	this.collision_detected = false;

        this.parent(x, y, settings);

        this.nextlevel = settings.to;
        this.fade = settings.fade || '#000000';
        this.duration = settings.duration || 250;
        this.location = settings.location;
        this.map = settings.to;
        this.to = settings.to;
        this.fading = false;
        this.fadeOut = settings.fadeOut;
        this.item = settings.item;
        this.message = settings.message || "This door seems to be locked.";
        this.music = settings.music;
        this.sound = settings.sound;

        // a temp variable
        this.gotolevel = settings.to;

    },

    /**
     * @ignore
     */
    onFadeComplete: function () {
        //me.levelDirector.loadLevel(this.gotolevel);

                this.collision_detected = false;
        game.play.loadLevel(this);

        me.game.viewport.fadeOut(this.fade, this.duration);
    },

    /**
     * go to the specified level
     * @name goTo
     * @memberOf me.LevelEntity
     * @function
     * @param {String} [level=this.nextlevel] name of the level to load
     * @protected
     */
    goTo: function (level) {
        //this.gotolevel = level || this.nextlevel;
        //this.to = level || this.nextlevel;
        // load a level
        switch(this.location){
        	case "up":
        		location_offset = -80;
        		break;
        	case "down":
        		location_offset = 80;
        		break;
        	default:
        		location_offset = 0;
        		break;
        }

		me.audio.stopTrack();

		game.game_info_object.overworld.location = game.player.pos.x + ", " + (game.player.pos.y + location_offset);
		console.log(game.game_info_object.overworld.location);


        if (this.fade && this.duration) {
            if (!this.fading) {

                this.fading = true;
                me.game.viewport.fadeIn(this.fade, this.duration,
                        this.onFadeComplete.bind(this));
            }
        } else {
            //me.levelDirector.loadLevel(this.gotolevel);
        }
	},

    /** @ignore */
    onCollision: function (res,obj) {

        if (obj instanceof game.PlayerEntity && this.collision_detected === false && CheckInventory(this.item)) {
            //kill the title if it's still there
            game.play.HUD.removeTitleEarly();

            me.audio.play(this.sound + "open_sfx");
            game.portal_noise = this.sound;

            this.collision_detected = true;
            game.player.busy = true;
            game.player.vel.x = 0;
            game.player.vel.y = 0;
            game.game_info_object.overworld.map = this.map;
            this.goTo();
        	console.log("You may enter! " + this.collision_detected);
        } else if(obj instanceof game.PlayerEntity && this.collision_detected === false) {
            me.audio.play("locked_sfx");
            var amount = 10;
            //door is locked, move player back a little in the direction he came from and play the locked message
			switch(game.player.direction) {
				case "up":
					game.player.pos.y += amount;
					break;
				case "right":
					game.player.pos.x -= amount;
					break;
				case "down":
					game.player.pos.y -= amount;
					break;
				case "left":
					game.player.pos.x -= amount;
					break;
				case "upleft":
					game.player.pos.x += amount;
					game.player.pos.y += amount;
					break;
				case "upright":
					game.player.pos.x -= amount;
					game.player.pos.y += amount;
					break;
				case "downright":
					game.player.pos.x -= amount;
					game.player.pos.y -= amount;
					break;
				case "downleft":
					game.player.pos.x += amount;
					game.player.pos.y -= amount;
					break;
            }
			game.play.HUD.dialogue({"verses":[{"speech":[this.message],"speakers":["@locked"]}]}, this);
            console.log("This door is Locked! " + this.collision_detected);
        }
    },

    doneTalking: function() {
        game.player.busy = false;
    }
});

game.soccerEntity = me.ObjectEntity.extend({

	init: function(x, y, settings) {

		settings.spritewidth = 32;
		settings.spriteheight = 48;
		settings.image = "soccerball";


		// call the constructor
		this.parent(x, y, settings);

		this.collideable = true;

		this.gravity = 0;

        // adjust the bounding box
        //this.updateColRect(4, 24, 38, 10);
		var shape = this.getShape();
		shape.pos.x = 4;
		shape.pos.y = 32;
		shape.resize(24, 16);

    this.name = settings.fname;
	},

  onCollision: function (res,obj) {
      me.audio.play("soccer_sfx");
    	this.vel.x = obj.vel.x * 1.5;
    	this.vel.y = obj.vel.y * 1.5;
	},

	update: function(delta) {

		this.updateMovement();

		me.game.world.collide(this);

		// update animation if necessary
		if (this.vel.x!=0 || this.vel.y!=0) {

			if(this.vel.x > 0) {
				this.vel.x -= 0.5;
			} else {
				this.vel.x += 0.5;
			}
			if(this.vel.y > 0) {
				this.vel.y -= 0.5;
			} else {
				this.vel.y += 0.5;
			}

			if(Math.abs(this.vel.x) <= 0.2) this.vel.x = 0;
			if(Math.abs(this.vel.y) <= 0.2) this.vel.y = 0;

			// update object animation
			me.game.world.sort();
			this.parent(delta);
			return true;
		}

		return false;
    }
});

function LocationInt(number) {
    if(isNaN(number)) {
        return parseInt(number.substr(1));
    } else {
        return parseInt(number * 32);
    }
}

function Truncate(input, len) {
  var curr = len;
  var prev = 0;

  output = [];

  while(input[curr]) {
    if(input[curr++] == ' ') {
      output.push(input.substring(prev,curr));
      prev = curr;
      curr += len;
    }
  }
  output.push(input.substr(prev));
  return output;
}

function ColorLuminance(hex, lum) {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
}
