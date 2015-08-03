game.mainCharEntity = me.AnimationSheet.extend({

	init: function(x, y, image) {

		this.name = "player Sprite";

		console.log("I'm the player! x:" + x + " : " + y + " image:" + image);
		this.parent(x, y, me.loader.getImage(image), 32, 48);

		this.addAnimation("walkforward", [0, 1, 0, 2], 100);
		this.addAnimation("walkbackward", [3, 4, 3, 5], 100);
		this.addAnimation("walksideways", [6, 7, 6, 8], 100);
		this.addAnimation("walkforwardangle", [9, 10, 9, 11], 100);
		this.addAnimation("walkbackwardangle", [12, 13, 12, 14], 100);
		this.setCurrentAnimation("walksideways");
		this.animationpause = true;

		MoveOnX(64, 1000, this, (function(){
			this.flipX(true);
			this.setCurrentAnimation("walkbackwardangle");
			this.animationpause = true;
		}).bind(this));//, "walkbackwardangle", true, false);

    },
/*
    update: function(delta) {
    	console.log("I'm player sprite, my pos is:" + this.pos.x + ":" + this.pos.y)
		this.parent(delta);
    	return true;
    },
*/
	waterHit: function(force) {
		if(force >= 40) {
			console.log("I got hit with a powerful stream!");

			MoveOnX(this.pos.x - 200, 600, this, (function(){
				game.puzzle.puzzle_container.removeChild(this);
			}).bind(this));
		} else if (!this.wet) {
			console.log("I got hit with water");
			//pause
			this.wet = true;
			game.pipe_manager.wet = true;

			MoveOnX(this.pos.x - 60, 500, this, (function(){
				//face forward
				this.setCurrentAnimation("walkforward");
				this.animationpause = true;
				//water dripping effect
				AttachParticles(this);

				//wait 20 seconds before coming back
				setTimeout((function(){
					//dripping off
					me.game.world.removeChild(this.emitter);
					me.game.world.removeChild(this.emitter.container);

					//unpause
					this.wet = false;
					game.pipe_manager.wet = false;
					//move back into position
					MoveOnX(60, 1000, this, (function(){
						this.flipX(true);
						this.setCurrentAnimation("walkbackwardangle");
						this.animationpause = true;
					}).bind(this));
				}).bind(this), 5000);
			}).bind(this));

		}
    },
});

/* deprecated - Don't use ObjectEntities when you don't need physics!
game.DEPmainCharEntity = me.ObjectEntity.extend({

    init: function(x, y, settings) {

        settings.spritewidth = 32;
        settings.spriteheight = 48;
        //settings.image = "farmer";
		this.width = 32;
		this.height= 48;

        // call the constructor
        this.parent(x, y, settings);
		this.alwaysUpdate = true;

        console.log("I'm the player! x:" + x + " : " + y);


        //this.starting_pos_x = x;
        //this.starting_pos_y = y;

        //this.renderable.anim = {};
        this.renderable.addAnimation("walkforward", [0, 1, 0, 2], 100);
        this.renderable.addAnimation("walkbackward", [3, 4, 3, 5], 100);
        this.renderable.addAnimation("walksideways", [6, 7, 6, 8], 100);
        this.renderable.addAnimation("walkforwardangle", [9, 10, 9, 11], 100);
        this.renderable.addAnimation("walkbackwardangle", [12, 13, 12, 14], 100);
        this.renderable.setCurrentAnimation("walksideways");

        // set the default horizontal & vertical speed (accel vector)
        this.setVelocity(2, 2);

        this.gravity = 0;

        this.direction = "up";
        this.old_direction = "up";
        this.moveOnX(64);
    },

    moveOnX: function(distance) {
		this.renderable.animationpause = false;
		this.old_direction = "";
        this.target = this.pos.x + distance;
        if(this.target >= this.pos.x) {
            this.direction = "right";
        } else {
            this.direction = "left";
        }
    },

    waterHit: function(force) {
		if(force >= 40) {
			console.log("I got hit with a powerful stream!");
			//tween offstage
			var tween = new me.Tween(this.pos).to({x: this.pos.x - 200}, 1000).onComplete((function(){
				//die
				game.puzzle.puzzle_container.removeChild(this);
			}).bind(this));
			tween.easing(me.Tween.Easing.Bounce.Out);
			tween.start();
		} else if (!this.wet) {
			console.log("I got hit with water");
			//pause
			this.wet = true;
			game.pipe_manager.wet = true;

			//tween right a bit
			var tween = new me.Tween(this.pos).to({x: this.pos.x - 60}, 1000).onComplete((function(){

				//face forward
				this.renderable.setCurrentAnimation("walkforward");
				this.renderable.animationpause = true;
				//water dripping effect

				//wait 20 seconds before coming back
				setTimeout((function(){
					//dripping off
					//unpause
					this.wet = false;
					game.pipe_manager.wet = false;
					//move back into position
					this.moveOnX(60);
				}).bind(this), 5000);

			}).bind(this));
			tween.easing(me.Tween.Easing.Quadratic.Out);
			tween.start();
			//face screen
			//wait x seconds,
			//walk back over
			//unpause screen
		}
    },

    update: function(delta) {

        if(this.target)
        {
            if(this.target >= this.pos.x && this.direction == "right") {
                //console.log("Walkin' the mile right");
                this.vel.x += this.accel.x * me.timer.tick;
            } else if (this.target <= this.pos.x && this.direction == "left") {
                //console.log("Walkin' the mile left");
                this.vel.x -= this.accel.x * me.timer.tick;
            } else {
                //console.log("Dead man, not walkin'");
                this.vel.x = 0;
                //this.renderable.setAnimationFrame(12);
                this.renderable.setCurrentAnimation("walkbackwardangle");
                this.flipX(true);
                delete this.target;
            }
        }

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

        // check & update player movement
        this.updateMovement();

        // update animation if necessary
        if (this.vel.x!=0 || this.vel.y!=0) {
            // update object animation
            this.parent(delta);
            return true;
        }

        // else inform the engine we did not perform
        // any update (e.g. position, animation)
        this.parent(delta);
        return true;
    }

});
*/

game.npcPuzzleEntity = me.AnimationSheet.extend({
 	busy: false,
 	wet: false,
 	talk_timer: 0,

	init: function(x, y, name, image, dialogue_array, difficulty) {

		this.parent(x, y, me.loader.getImage(image), 32, 48);
		console.log("x:" + x + " y:" + y + " name:" + name + " image:" + image);

		this.name = name;
		this.alwaysUpdate = true;
		this.difficulty = difficulty;
		this.dialogue_array = dialogue_array;
		this.dialogue_counter = 0;
		//var settings = {};
		//settings.spritewidth = 32;
		//settings.spriteheight = 48;
		this.width = 32;
		this.height= 48;
		//settings.image = image;

		this.difficulty_array = [6, 16, 8, 4];

		this.addAnimation("walkforward", [0, 1, 0, 2], 100);
		this.addAnimation("walkbackward", [3, 4, 3, 5], 100);
		this.addAnimation("walksideways", [6, 7, 6, 8], 100);
		this.addAnimation("dazed", [6, 7, 6, 8], 100);
		this.addAnimation("shouting", [6, 7, 6, 8], 100);
		this.setCurrentAnimation("walksideways");

		MoveOnX(this.pos.x - 64, 1000, this, (function(){
			this.setCurrentAnimation("walksideways");
			this.animationpause = true;
		}).bind(this));//, "walkbackwardangle", true, false);
	},

 	waterHit: function(force) {
		if(force >= 40) {
			game.puzzle.puzzleHUD.addScore(this.difficulty * 10);
			MoveOnX(this.pos.x + 200, 600, this, (function(){
				game.puzzle.puzzle_container.removeChild(this);
			}).bind(this));
		} else if (!this.wet) {
			console.log("I got hit with water");
			//pause
			game.puzzle.puzzleHUD.addScore(this.difficulty * 5);
			this.wet = true;

			MoveOnX(this.pos.x + 60, 500, this, (function(){
				//face forward
				this.setCurrentAnimation("walkforward");
				this.animationpause = true;
				//water dripping effect
				AttachParticles(this);

				//wait 20 seconds before coming back
				setTimeout((function(){
					//dripping off
					me.game.world.removeChild(this.emitter);
					me.game.world.removeChild(this.emitter.container);
					//unpause
					this.wet = false;
					//game.pipe_manager.wet = false;
					//move back into position
					MoveOnX(480, 800, this, (function(){
						this.setCurrentAnimation("walksideways");
						this.animationpause = true;
					}).bind(this));
				}).bind(this), 20000);
			}).bind(this));


/*			//tween right a bit
			var tween = new me.Tween(this.pos).to({x: this.pos.x + 60}, 1000).onComplete((function(){

				//face forward
				this.renderable.setCurrentAnimation("walkforward");
				this.renderable.animationpause = true;
				//water dripping effect

				//wait 20 seconds before coming back
				setTimeout((function(){
					//dripping off
					//unpause
					this.wet = false;
					//move back into position
					moveOnX(-60);
				}).bind(this), 20000);

			}).bind(this));
			tween.easing(me.Tween.Easing.Quadratic.Out);
			tween.start();
			//face screen
			//wait x seconds,
			//walk back over
			//unpause screen */
		}
 	},

    update: function(delta) {

        if(!this.busy && !this.wet) {
        	this.talk_timer += me.timer.tick;

        	if(this.talk_timer >= this.difficulty_array[this.difficulty] * 100) {
						console.log(this.dialogue_array[this.dialogue_counter]);
						game.puzzle.puzzleHUD.overlayDialogue(this.name, this.dialogue_array[this.dialogue_counter], 1);
						this.dialogue_counter++;
						if(this.dialogue_counter > this.dialogue_array.length) dialogue_counter = 0;
        		this.talk_timer = 0;
        	}
        }

		this.parent(delta);
		return true;

    }

});

//this is the character that comes in on the right side of the screen in the puzzles scene, they have the ability to talk on top of the field and can be sprayed with water
/*game.DEPnpcPuzzleEntity = me.ObjectEntity.extend({
 	busy: false,
 	wet: false,
 	talk_timer: 0,

	init: function(x, y, name, image, dialogue_array, difficulty) {

		console.log("x:" + x + " y:" + y + " name:" + name + " image:" + image);

		this.npcname = name;
		this.difficulty = difficulty;
		this.dialogue_array = dialogue_array;
		var settings = {};
		settings.spritewidth = 32;
		settings.spriteheight = 48;
		this.width = 32;
		this.height= 48;
		settings.image = image;

		this.difficulty_array = [16, 8, 4];

		// call the constructor
		this.parent(x, y, settings);

		//console.log("I'm an NPC! dialogue_array: " + this.dialogue_array);

		//this.starting_pos_x = x;
		//this.starting_pos_y = y;


		//this.renderable.anim = {};
		this.renderable.addAnimation("walkforward", [0, 1, 0, 2], 100);
		this.renderable.addAnimation("walkbackward", [3, 4, 3, 5], 100);
		this.renderable.addAnimation("walksideways", [6, 7, 6, 8], 100);
		this.renderable.setCurrentAnimation("walksideways");

		// set the default horizontal & vertical speed (accel vector)
		this.setVelocity(2, 2);

		this.gravity = 0;

		this.direction = "up";
		this.old_direction = "up";
		moveOnX(-64, 1000).bind(this);
	},

	moveOnX: function(distance) {
		this.renderable.animationpause = false;
		this.old_direction = "";
		this.target = this.pos.x + distance;
		if(this.target >= this.pos.x) {
		    this.direction = "right";
		} else {
		    this.direction = "left";
		}
	},

 	waterHit: function(force) {
		if(force >= 40) {
			console.log("I got hit with a powerful stream!");
			//tween offstage
			var tween = new me.Tween(this.pos).to({x: this.pos.x + 200}, 1000).onComplete((function(){
				//die
				game.puzzle.puzzle_container.removeChild(this);
			}).bind(this));
			tween.easing(me.Tween.Easing.Bounce.Out);
			tween.start();
		} else if (!this.wet) {
			console.log("I got hit with water");
			//pause
			this.wet = true;

			//tween right a bit
			var tween = new me.Tween(this.pos).to({x: this.pos.x + 60}, 1000).onComplete((function(){

				//face forward
				this.renderable.setCurrentAnimation("walkforward");
				this.renderable.animationpause = true;
				//water dripping effect

				//wait 20 seconds before coming back
				setTimeout((function(){
					//dripping off
					//unpause
					this.wet = false;
					//move back into position
					this.moveOnX(-60);
				}).bind(this), 20000);

			}).bind(this));
			tween.easing(me.Tween.Easing.Quadratic.Out);
			tween.start();
			//face screen
			//wait x seconds,
			//walk back over
			//unpause screen
		}
 	},

    update: function(delta) {

        if(!this.busy && !this.wet) {
        	this.talk_timer += me.timer.tick;
        	//console.log(this.talk_timer);

        	if(this.talk_timer >= this.difficulty_array[this.difficulty - 1] * 100) {
				game.puzzle.puzzleHUD.overlayDialogue(this.npcname, this.dialogue_array[RandomInt(0,this.dialogue_array.length - 1)], 1);
        		this.talk_timer = 0;
        	}
        }

        if(this.target)
        {
            if(this.target >= this.pos.x && this.direction == "right") {
                this.vel.x += this.accel.x * me.timer.tick;
            } else if (this.target <= this.pos.x && this.direction == "left") {
                this.vel.x -= this.accel.x * me.timer.tick;
            } else {
                this.vel.x = 0;
                delete this.target;
            }
        }

        //Did the direction change?
        if(this.old_direction !== this.direction) {
        	this.renderable.animationpause = false;
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
            if(this.vel.x === 0 && this.vel.y === 0) { this.renderable.animationpause = true; }
        }

        // check & update player movement
        this.updateMovement();

        // update animation if necessary
        if (this.vel.x!=0 || this.vel.y!=0) {
            // update object animation
            this.parent(delta);
            return true;
        }

        // else inform the engine we did not perform
        // any update (e.g. position, animation)
        return false;
    }

});
*/

game.pickup = me.AnimationSheet.extend({
	score: 5,

	init: function(value, x, y) {
		this.picked = false;
		//this.value = value;

		rejection_sampling_array = [[0, 0, 0, 0, 0, 0, 1],
									[0, 0, 0, 0, 1, 1, 1],
									[0, 0, 0, 0, 1, 1, 2],
									[0, 0, 1, 1, 2, 2, 3],
									[1, 1, 2, 2, 3, 3, 4]
									];

		//this.spritewidth = 32;
		this.parent(x, y, me.loader.getImage("pickup"), 32, 32);
		this.addAnimation("picked", [0, 1, 2, 3], 100);
		this.addAnimation("pressure", [4, 5, 6, 7], 100);
		this.addAnimation("time", [8, 9, 10, 11], 100);
		this.defineReward(rejection_sampling_array[value - 1][RandomInt(0,6)]);
	},

	waterHit: function(direction, force) {
		game.pipe_manager.pipe_grid[this.grid_x][this.grid_y] = 1;
		this.animationpause = true;
		FallingHelper(direction, force, this, true);
		return true;
	},

	evaporate: function() {
		this.setCurrentAnimation("picked", (function(){
			game.pipe_manager.pipe_grid[this.grid_x][this.grid_y] = 1;
			game.puzzle.puzzle_container.removeChild(this);
		}).bind(this));
	},

	next: function() {
		//run reward with value
		if(!this.picked) {
			this.picked = true;
			me.audio.play("pickup_sfx");
			RunFunction(this.reward_function, this, [this.reward_value]);
			this.evaporate();
			game.puzzle.puzzleHUD.addScore(this.score);
		}
	},

	defineReward: function(reward) {
		switch(reward)
		{
			case 0:
				this.reward_function = "timeReward";
				this.reward_value = 5;
				this.setCurrentAnimation("time");
				break;
			case 1:
				this.reward_function = "timeReward";
				this.reward_value = 10;
				this.setCurrentAnimation("time");
				break;
			case 2:
				this.reward_function = "pressureReward";
				this.reward_value = 10;
				this.setCurrentAnimation("pressure");
				break;
		}
	},

	//add X seconds to the timeout clock
	timeReward: function(seconds) {
		game.puzzle.puzzleHUD.popupText({message: "+" + seconds + " seconds", effect: "fadeupout", timeout: 1500, size: 18, x: this.pos.x, y: this.pos.y});
		console.log("add " + seconds + " seconds!");
		if(game.police_car) {
			game.police_car.addTime(seconds);
		}
	},

	//Turn on super pressure for x seconds
	pressureReward: function(seconds) {
		game.pipe_manager.addSuperPressureTime(10);
	},

	bombReward: function() {
		//not implemented
	}
});

game.carTimer = me.AnimationSheet.extend({
    paused: false,
    counter: 0,
    end_x: 0,

    init: function(x, y, image, end_x, end_time) {
        this.start_x = x;
        this.end_x = end_x;
        this.end_time = end_time;

        //var settings = {};
        //settings.image = "policecar";
        //settings.spritewidth = "32";
        this.parent(x, y, image, 32, 32);

        //this.renderable.image = me.loader.getImage("policecar");
        //this.renderable.spritewidth = 32;
        //this.renderable.anim = {};
        this.addAnimation("driving", [0, 1], 100);
        this.setCurrentAnimation("driving");
        this.animationpause = true;

        setTimeout( (function(){
            this.animationpause = false;
            this.timer_var = setInterval(this.addSecond.bind(this), 1000);
            if(game.pipe_manager.npc) {
            	if(game.pipe_manager.npc.difficulty > 0) {
            		game.pipe_manager.addNPC();
            	}
            }
        }).bind(this), (game.game_info_object.ability.stealth[0] + game.game_info_object.ability.stealth[1] + game.game_info_object.ability.stealth[2]) * 1000);
    },

    addTime: function(seconds) {
    	this.end_time += seconds;
    	console.log("Adding " + seconds + " seconds to the clock!");
    	//show +time graphic on scoreboard (or just call it if it's built into HUD)
    },

    pauseTimer: function() {
        this.paused = true;
        this.animationpause = true;
    },

    stopTimer: function() {
		this.paused = true;
        console.log("Hey I was told to stop!");
        clearInterval(this.timer_var);
    },

    addSecond: function() {
        if(!this.paused) {
            //console.log(this.counter);
            this.counter++;
            this.calculateX();
            if(this.counter >= this.end_time) {
                clearInterval(this.timer_var);
                game.pipe_manager.youLose();
            }
        }
    },

    calculateX: function() {
        var percent_complete = this.counter / this.end_time;
        var sub_x = this.end_x - this.start_x;

        //x = A + t * (B - A)
        this.pos.x = this.start_x + percent_complete * (this.end_x - this.start_x);
        //console.log(this.start_x + percent_complete * (this.end_x - this.start_x));
        //this.pos.x = Math.ceil(sub_x * percent_complete + this.start_x);
    }
});

function MoveOnX(distance, miliseconds, object_reference, final_func) {
		console.log(this);
		object_reference.setCurrentAnimation("walksideways");
		object_reference.animationpause = false;
		//check if negative (this means they're walking left) or postive (they're walking right)
		if(distance < object_reference.pos.x) {
			object_reference.flipX(true);
		} else {
			object_reference.flipX(false);
		}
		var tween = new me.Tween(object_reference.pos).to({x: distance}, miliseconds).onComplete((function(){
			if(final_func != null) final_func();
		}).bind(object_reference));
		tween.easing(me.Tween.Easing.Linear.None);
		tween.start();
}

function AttachParticles(object_reference, speed) {
	// Create a basic emitter at position 100, 100
	var emitter = new me.ParticleEmitter(object_reference.pos.x + 8, object_reference.pos.y + 4, {
		image: me.loader.getImage("drop"),
		width: 16,
		totalParticles: 30,
		angle: -3.14159265358979,
		minLife: 500,
		maxLife: 800,
		speed: 0,
		speedVariation: 0,
		minEndScale: 1,
		maxEndScale: 1,
		gravity: 0.3,
		followTrajectory: false,
		floating: true,
		maxParticles: 19,
		frequency: 31
	});

	object_reference.emitter = emitter;
	emitter.z = 300;

	// Add the emitter to the game world
	me.game.world.addChild(emitter);
	me.game.world.addChild(emitter.container);

	// Launch all particles one time and stop, like a explosion
	emitter.burstParticles();

	// Launch constantly the particles, like a fountain
	emitter.streamParticles();

	// At the end, remove emitter from the game world
	// call this in onDestroyEvent function
	//me.game.world.removeChild(emitter);
	//me.game.world.removeChild(emitter.container);
}

function FallingHelper(direction, force, object_reference, water, container) {

	object_reference.alwaysUpdate = true;

	if(water) AttachParticles(object_reference);

	//Depending on the direction and force of the water, make the object fly off the grid and fall to the ground
	switch (direction) {
		case 1:
			x_force = (force * -10);
			var new_x = object_reference.pos.x + x_force;
			var tween_to = {x: [new_x - 5, new_x], y: [object_reference.pos.y + 10, 280]};
			break;
		case 3:
			x_force = (force * 10);
			var new_x = object_reference.pos.x + x_force;
			var tween_to = {x: [new_x + 5, new_x], y: [object_reference.pos.y + 10, 280]};
			break;
		case 2:
			y_force = (force * -10);
			var new_x = object_reference.pos.x;
			var new_y = object_reference.pos.y + y_force;
			var tween_to = {x: [new_x, new_x], y: [new_y, 280]};
			break;
		case 0:
			x_force = (0);
			var new_x = object_reference.pos.x + x_force;
			var tween_to = {x: new_x, y: 280};
			break;
	}

	//var tween_to = (x_force !== 0)? {x: [new_x, new_x], y: [object.pos.y, 280]} : {x: [new_x, new_x], y: [object.pos.y, 280]};
	var tween = new me.Tween(object_reference.pos).to(tween_to, 1200).onComplete((function(){
		object_reference.flicker(600, (function() {

			//If the falling object has an emitter, destory it
			if(object_reference.emitter) {
				me.game.world.removeChild(object_reference.emitter);
				me.game.world.removeChild(object_reference.emitter.container);
			}

			//if the calling object has a custom container, use that instead of puzzle
			if(container) {
				container.removeChild(object_reference);
			} else {
				game.puzzle.puzzle_container.removeChild(object_reference);
			}

		}).bind(object_reference));
	}).bind(object_reference));

	//If particles are attached, tween them, too.
	if(object_reference.emitter) {
		console.log("object has emitter, tween it.");
		var tween_particles = new me.Tween(object_reference.emitter.pos).to(tween_to, 1200);
		tween_particles.easing(me.Tween.Easing.Bounce.Out);
		tween_particles.interpolation(me.Tween.Interpolation.Bezier);
		tween_particles.start();
	}

	/*var tween = new me.Tween(object.pos).to({y: 280}, 1200).onComplete((function(){
	//make the pipe flicker, then remove it
		this.flicker(60, (function() {
			me.game.remove(this);
		}).bind(object));
	}).bind(object));*/

	tween.easing(me.Tween.Easing.Bounce.Out);
	tween.interpolation(me.Tween.Interpolation.Bezier);
	tween.start();
}

function OppositeDirection(dir) {
	if(dir == "left") return "right";
	if(dir == "right") return "left";
	if(dir == "down") return "up";
	if(dir == "up") return "down";
}

function CheckEmpty(test_x,test_y) {
	//console.log("X:" + test_x + " Y:" + test_y);
	//console.log(game.pipe_manager.pipe_grid[test_x][test_y]);
	if (game.pipe_manager.pipe_grid[test_x] !== undefined && game.pipe_manager.pipe_grid[test_x][test_y] !== undefined && game.pipe_manager.pipe_grid[test_x][test_y] === 1) {
		//console.log(game.pipe_manager.pipe_grid[test_x][test_y]);
		return true;
	} else {
		return false;
	}
}
