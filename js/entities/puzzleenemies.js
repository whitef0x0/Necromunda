//Extend this class - This is the basic 'walker' type enemy. It will roam the grid, get washed away by leaks, and pauses when 'touched'
game.puzzleWalker = me.AnimationSheet.extend({

	type: "enemy",		//enemy object (as opposed to pipe and trap)
    casual_walk: true, 	//should I aggresively look for a new spot, or casually?
    wait_time: 400,	   	//how long should I wait in one spot before moving?
    distance: 1,		//how many grid units should I travel each time? (don't use)
    busy: false,		//Am I busy?
    value: 1,			//How valuable of a target am I? (mostly depends on what I drop)

    init: function(x, y, image) {
		this.parent(x, y, me.loader.getImage(image), 32, 32);

		this.addAnimation("idle", [0, 1, 2, 1], 100);
		this.addAnimation("walk", [0, 3, 0, 4], 100);
		this.setCurrentAnimation("idle");

        this.direction = 0;//"up";
        this.old_direction = -1;

        this.time = 0;
    },

    moveNoise: function() {
		me.audio.play("pitterpatter_sfx");
    },

    hurtNoise: function() {
    	me.audio.play("generichurt_sfx");
    },

    //all pieces on the board should have this function. What happens when I get hit by water?
    //return true if I was moved, false if I cannot be moved by the stream
	waterHit: function(direction, force) {
		game.puzzle.puzzleHUD.addScore(this.value * 5);
		game.puzzle.puzzleHUD.popupText({message: "+ " + (this.value * 5), effect: "fadeupout", timeout: 1500, size: 18, x: this.pos.x, y: this.pos.y});
		game.puzzle.puzzleHUD.killed++;
		this.pickUpDrop();
		this.drop(direction, force);
		return true;
	},

	//Drop a pickup item in my spot (Usually before death)
    pickUpDrop: function() {
		var pickup = new game.pickup(this.value, this.pos.x, this.pos.y);//, {spritewidth:32})
		pickup.grid_x = this.grid_x;
		pickup.grid_y = this.grid_y;
		game.pipe_manager.pipe_grid[this.grid_x][this.grid_y] = pickup;
		//me.game.add(pickup, 175);
		game.puzzle.puzzle_container.addChild(pickup, 200);
		//pickup.z = 200;
    },

    //fall off the board (death)
    drop:function(direction, force, effects) {
    	if(effects === undefined) effects = true;
		this.hurtNoise();
		//game.pipe_manager.pipe_grid[this.grid_x][this.grid_y] = 1;
		this.busy = true;
		delete this.target;
		this.setCurrentAnimation("walk");
		this.flipY();
		FallingHelper(direction, force, this, effects);
		/*var new_x = this.pos.x + x_force;
		var tween = new me.Tween(this.pos).to({x: new_x, y: 280}, 1200).onComplete((function(){
			this.renderable.flicker(60, (function() {
				me.game.remove(this);
			}).bind(this));
		}).bind(this));*/
    },

    action: function() {
        var count = 4;
        var available_directions_array = [0,1,2,3];
        //pick random direction, check if it's open
        while(count > 0 && !this.busy)
        {
            var test_x = 0;
            var test_y = 0;
            var dir = "";
            switch( available_directions_array[ RandomInt(0,available_directions_array.length - 1) ] ) {
                case 0:
                    test_x = this.grid_x;
                    test_y = this.grid_y - 1;
                    dir = "up";
                    var index = available_directions_array.indexOf(0);
                    available_directions_array.splice(0, 1);
                    break;
                case 1:
                    test_x = this.grid_x + 1;
                    test_y = this.grid_y;
                    dir = "right";
                    var index = available_directions_array.indexOf(0);
                    available_directions_array.splice(1, 1);
                    break;
                case 2:
                    test_x = this.grid_x;
                    test_y = this.grid_y + 1;
                    dir = "down";
                    var index = available_directions_array.indexOf(0);
                    available_directions_array.splice(2, 1);
                    break;
                case 3:
                    test_x = this.grid_x - 1;
                    test_y = this.grid_y;
                    dir = "left";
                    var index = available_directions_array.indexOf(0);
                    available_directions_array.splice(3, 1);
                    break;
            }

            //if grid spot is an empty spot
            if (game.pipe_manager.pipe_grid[test_x] !== undefined && game.pipe_manager.pipe_grid[test_x][test_y] !== undefined && game.pipe_manager.pipe_grid[test_x][test_y] === 1) {
                this.setCurrentAnimation("walk");
                this.startTween(this.distance * 32, dir);
                game.pipe_manager.pipe_grid[test_x][test_y] = this;
                game.pipe_manager.pipe_grid[this.grid_x][this.grid_y] = 1;
                this.grid_x = test_x;
                this.grid_y = test_y;
				this.moveNoise();
                return true;
            }

            if(this.casual_walk) { return false; }
            count--;
        }

        //The place I wanted to move wasn't available.
        return false;
    },

    //set movement distance in squares (32x32)
    startTween: function(distance, direction) {

        switch(direction) {
            case "up":
                this.direction = 0;
                //this.target = this.pos.y - distance * 32;
                var tween_to = {y: this.pos.y + -1 * distance};
                break;
            case "down":
                this.direction = 2;
                var tween_to = {y: this.pos.y + distance};
                //this.target = this.pos.y + distance * 32;
                break;
            case "left":
                this.direction = 3;
                var tween_to = {x: this.pos.x + -1 * distance};
                //this.target = this.pos.x - distance * 32;
                break;
            case "right":
                this.direction = 1;
                var tween_to = {x: this.pos.x + distance};
                //this.target = this.pos.x + distance * 32;
                break;
        }

		var tween = new me.Tween(this.pos).to(tween_to, 300).onComplete((function(){
			this.setCurrentAnimation("idle");
		}).bind(this));
		tween.start();

    },

    //check if target square is empty
    isGridTargetEmpty: function(x, y) {
        if(game.pipe_manager.pipe_grid[x][y] === 1) { return true; }
        return false;
    },

	next: function() {
	},

	update: function(delta) {
		// check & update player movement
		if(!this.busy && !this.overwrite_update) {
			this.updateTime();
		}
		this.parent(delta);
		return true;
	},

    updateTime: function() {
        this.time += me.timer.tick;
        if(this.time >= this.wait_time) {
            this.action();
            this.time = 0;
        }
    }

});

game.puzzleBug = game.puzzleWalker.extend({
    value: 1,

    init: function(x, y) {
        //settings.spritewidth = 32;
        //settings.spriteheight = 32;
        // call the constructor
        this.parent(x, y, "bug");
    },
});

game.puzzleBurrow = game.puzzleWalker.extend({

	value: 2,
    burrowed: true,
    casual_walk: false,
    wait_time: 100,
    overwrite_update: true,

    init: function(x, y) {
        //settings.image = "burrow";
        //settings.spritewidth = 32;
        // call the constructor
        this.parent(x, y, "burrow");

        //this.renderable.anim = {};
        this.addAnimation("pipeidle", [1, 2, 1, 2, 1, 0, 2], 100);
        this.addAnimation("attack", [3, 3, 3, 4, 5, 0], 100);
        this.addAnimation("idle", [9, 9, 10], 100);
        this.addAnimation("walk", [6, 8, 7], 100);
        this.addAnimation("burrow", [9, 11, 3, 4, 5], 100);
        this.addAnimation("unburrow", [5, 4, 3, 11, 9], 30);
        this.setCurrentAnimation("pipeidle");
        this.casual_walk = false;
    },

		setDirection: function(direction) {
			switch(direction) {
				case 1:
this.angle = 0;
this.flipX();
					break;
				case 2:
this.angle = -1.57;

					break;
				case 3:
					this.angle = 0;
					this.flipX(false);
					break;
			}
		},

    waterHit: function(direction, force) {
        if(force >= 40) {
            this.unburrow();
            this.parent(direction, force);
        }  else {
            if(this.burrowed) {
                this.unburrow();
            } else {
                this.parent(direction, force);
            }
        }
        return true;
    },

    burrow: function() {
        //this.busy = true;
        this.burrowed = true;
    },

    unburrow: function() {
        //this.busy = false;
        this.burrowed = false;
        this.angle = 0;
        this.setCurrentAnimation("idle");
        //this.unPauseMe();
        //this.action();
    },

    next: function() {
        if(this.burrowed) { this.setCurrentAnimation("attack", "pipeidle"); }
    },

    update: function(delta) {
        if(!this.busy && !this.burrowed) {

            if(this.direction !== this.old_direction) {
                if(this.direction == 3) {
                    this.flipX();
                } else if (this.direction == 1) {
                    this.flipX("false");
                }
                this.old_direction = this.direction;
            }
            this.updateTime();
        }

        this.parent(delta);
        return true;
    }
});

game.puzzleSnakey = game.puzzleWalker.extend({

	value: 3,
	wait_time: 300,
	alive: true,
	goingforwards: false,
	goingbackwards: false,
	stuck_count: 1,
	//next_unit_reference: {},
	//prev_unit_reference: {},

	init: function(x, y, direction, prevref) {
	this.parent(x, y, "snakey");
	if(prevref) this.prev_unit_reference = prevref;
	if(direction != undefined) this.setDirection(direction);

	//this.direction_map = ["up", "right", "down", "left"];
	//settings.image = "burrow";
	//settings.spritewidth = 32;
	// call the constructor
		this.addAnimation("idle", [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 15, 16, 15], 100);
		this.addAnimation("appear", [0, 1, 2, 3, 4], 100);
		this.addAnimation("straight", [10, 11, 12, 13, 14], 100);
		this.addAnimation("afterstraight", [13, 14, 13, 14, 13], 100);
		this.addAnimation("turn", [5, 6, 7, 8, 9], 100);
		this.addAnimation("afterturn", [8, 9, 8, 9, 8], 100);
		this.addAnimation("turnleft", [20, 21, 22, 23, 24], 100);
		this.addAnimation("afterturnleft", [23, 24, 23, 24, 23], 100);

		this.addAnimation("appearbackwards", [4, 3, 2 ,1 ,0], 100);
		this.addAnimation("straightbackwards", [14, 13, 12, 11, 10], 100);
		this.addAnimation("afterstraightbackwards", [14, 13, 14, 13, 14], 100);
		this.addAnimation("turnbackwards", [9, 8, 7, 6, 5], 100);
		this.addAnimation("afterturnbackwards", [9, 8, 9, 8, 9], 100);
		this.addAnimation("turnleftbackwards", [24, 23, 22, 21, 20], 100);
		this.addAnimation("afterturnleftbackwards", [24, 23, 24, 23, 24], 100);

		this.setCurrentAnimation("appear", function() {
			this.setCurrentAnimation("idle");
		});
	},

	setDirection: function(direction) {
		this.direction = direction;
		switch(direction) {
			case 1:
				this.angle = 3.14;// //0 1.57 3.14 4.71
				break;
			case 0:
				this.angle = 1.57;
				break;
			case 2:
				this.angle = 4.71;
				break;
			case 3:
				this.angle = 0;//
				break;
		}
	},

	moveNoise: function() {
		me.audio.play("snakeslide_sfx");
	},

	destroyAll: function() {
		if(this.alive) {
			this.alive = false;
			game.pipe_manager.pipe_grid[this.grid_x][this.grid_y] = 1;
			if(this.prev_unit_reference) this.prev_unit_reference.destroyAll();
			if(this.next_unit_reference) this.next_unit_reference.destroyAll();
			this.drop(2, 0, false, true)
		}
	},

	action: function() {
		if(!this.next_unit_reference) {
			var next_direction = this.pickDirection();
			this.next_direction = next_direction;
			if(next_direction > -1) {
				this.placeHead(next_direction);
				this.stuck_count = 0;
			} else {
				if(this.countPieces() > 1) this.goBackwards(this.stuck_count);
				this.stuck_count++;
			}
		}
	},

	next: function() {
	},

	//fall off the board (death)
	drop:function(direction, force, effects, delay) {
		if(effects === undefined) effects = true;
		this.hurtNoise();
		this.busy = true;
		delete this.target;

		if(delay) {
			setTimeout( (function() {
				FallingHelper(direction, force, this, effects);
			}).bind(this), 1000);
		} else {
			FallingHelper(direction, force, this, effects);
		}
	},

	waterHit: function(direction, force) {
		if(!this.next_unit_reference) {
			this.alive = false;
			this.parent(direction, force);
			/*game.puzzle.puzzleHUD.addScore(this.value * 5);
			game.puzzle.puzzleHUD.popupText({message: "+ " + (this.value * 5), effect: "fadeupout", timeout: 1500, size: 18, x: this.pos.x, y: this.pos.y});
			game.puzzle.puzzleHUD.killed++;
			this.pickUpDrop();
			this.drop(direction, force);*/
			if(this.prev_unit_reference) this.prev_unit_reference.destroyAll();

			return true;
		} else if (force >= 40) {
			this.destroyAll();
			return true;
		} else {
			if(this.countPieces() > 1) this.goBackwards(1);
			false;
		}
    },

    animatePrevious: function (prev, reverse) {
			if(prev) {
				backwards = (reverse) ? "backwards" : "";

				prev.animationpause = false;
				prev.setCurrentAnimation("after" + prev.current_animation + backwards, (function() {
					prev.animationpause = true;
				}).bind(prev));

				if(prev.prev_unit_reference) prev.animatePrevious(prev.prev_unit_reference);
			}
    },

    //get the last item in the snakes link list (opposite the head)
    getTail: function() {
    	if(!this.prev_unit_reference) {
    		return this;
    	} else {
    		return this.prev_unit_reference.getTail();
    	}
    },

		countPieces: function() {
			var piece = this.getTail();
			var count = 1;
			while (piece.next_unit_reference) {
				piece = piece.next_unit_reference;
				count++;
			}

			return count;
		},

    goBackwards: function(spots) {
	    this.moveNoise();
	    if(!this.getTail().goingforwards) {

	    		this.getTail().goingbackwards = true;
				if(this.next_unit_reference) {
					this.next_unit_reference.goBackwards(spots);
				} else {
					this.animatePrevious(this.prev_unit_reference.prev_unit_reference, true);
					this.prev_unit_reference.animationpause = false;
					this.prev_unit_reference.setCurrentAnimation(this.prev_unit_reference.current_animation + "backwards", (function() {
						this.prev_unit_reference.setCurrentAnimation("idle");
					}).bind(this));

					this.setCurrentAnimation("appearbackwards", (function() {
						spots--;

						delete this.prev_unit_reference.next_unit_reference;
						game.pipe_manager.pipe_grid[this.grid_x][this.grid_y] = 1;
						game.puzzle.puzzle_container.removeChild(this);

						this.getTail().goingbackwards = false;
						if(spots > 0) this.prev_unit_reference.goBackwards;
					}).bind(this));
				}
			}
			return true;
    },

	placeHead: function (next_direction) {
		this.moveNoise();
		if(!this.getTail().goingbackwards) {
			this.getTail().goingforwards = true;
			var x_offset = 0;
			var y_offset = 0;
			var x_grid_offset = 0;
			var y_grid_offset = 0;

			switch(next_direction) {
				case 0:
					y_offset = -32;
					y_grid_offset = -1;
					break;
				case 1:
					x_offset = 32;
					x_grid_offset = 1;
					break;
				case 2:
					y_offset = 32;
					y_grid_offset = 1;
					break;
				case 3:
					x_offset = -32;
					x_grid_offset = -1;
					break;
			}

			if(this.direction != next_direction) {

				if(this.goingLeft(this.direction, next_direction)) {
					this.setCurrentAnimation("turnleft", function() {
						this.setCurrentAnimation("afterturnleft");
						this.current_animation = "turnleft";
						this.animationpause = true;
						this.getTail().goingforwards = false;
					});
				} else {
					this.setCurrentAnimation("turn", function() {
						this.setCurrentAnimation("afterturn");
						this.current_animation = "turn";
						this.animationpause = true;
						this.getTail().goingforwards = false;
					});
				}
			} else {
				this.setCurrentAnimation("straight", function() {
					this.setCurrentAnimation("afterstraight");
					this.current_animation = "straight";
					this.animationpause = true;
					this.getTail().goingforwards = false;
				});
			}

			var snakey = new game.puzzleSnakey (this.pos.x + x_offset, this.pos.y + y_offset, next_direction, this);
			snakey.grid_x = this.grid_x + x_grid_offset;
			snakey.grid_y = this.grid_y + y_grid_offset;
			game.puzzle.puzzle_container.addChild(snakey, 175);
			game.pipe_manager.pipe_grid[this.grid_x + x_grid_offset][this.grid_y + y_grid_offset] = snakey;

			this.next_unit_reference = snakey;

			if(this.prev_unit_reference) this.animatePrevious(this.prev_unit_reference);
		}
	},

	goingLeft: function(curdir, nexdir) {
		//figure out if we're turning left (0up 1right 2down 3left algo is, if current direction minus 1 equals next direction, we're turning left (wraps around so -1 turns to 3))
		//CD     ND
		//0  ->  3
		//1  ->  0
		//2  ->  1
		//3  ->  2
		compare = curdir - 1;
		if(compare === -1) compare = 3;

		if (compare === nexdir) {
			return true;
		} else {
			return false;
		}
	},

	pickDirection: function() {
		var available_directions_array = [];

		if(CheckEmpty(this.grid_x, this.grid_y - 1)) {
			available_directions_array.push(0);
		}
		if(CheckEmpty(this.grid_x, this.grid_y + 1)) {
			available_directions_array.push(2);
		}
		if(CheckEmpty(this.grid_x + 1, this.grid_y)) {
			available_directions_array.push(1);
		}
		if(CheckEmpty(this.grid_x - 1, this.grid_y)) {
			available_directions_array.push(3);
		}

		if(available_directions_array.length > 0) {
			return available_directions_array[RandomInt(0, available_directions_array.length - 1)];
		} else {
			return -1;
		}
	}
});

////////////////BOSS///////////////

game.puzzleBoss = me.AnimationSheet.extend({
 	busy: false,
 	wet: false,

	init: function(name, image, difficulty) {

		x = game.screen_width - 20;
		y = game.screen_height - 138;

		this.name = name;
		this.difficulty = difficulty;
		this.threatening = false;

		this.attack_timer = 0;
		this.attack_array = [];
		this.attack_type_counter = 0;

		this.width = 128;
		this.height= 128;

		this.difficulty_array = [16, 8, 4];

		// call the constructor
		this.parent(x, y, me.loader.getImage(image), 128, 128);

		this.addAnimation("walksideways", [0, 1], 200);
		this.addAnimation("idle", [2, 3], 1500);
		this.addAnimation("dazed", [4, 5], 1500);
		this.addAnimation("threatening", [6, 7], 1500);

		this.setCurrentAnimation("walksideways");

		MoveOnX(this.pos.x - 128, 2000, this, (function(){
			this.setCurrentAnimation("idle");
		}).bind(this));//, "walkbackwardangle", true, false);
	},

	hurtNoise: function() {
		me.audio.play("generichurt_sfx");
	},

	attack: function () {
		this.animationpause = false;
		this.setCurrentAnimation(this.attack_array[this.attack_type_counter].attack_name, (function(){
			console.log("attacK: " + this.attack_array[this.attack_type_counter].attack_name);
			me.audio.play(this.attack_array[this.attack_type_counter].attack_noise);
			me.game.viewport.shake(10, 500, me.game.viewport.AXIS.BOTH);
			this.attack_array[this.attack_type_counter].attack_exec(this, this.difficulty);
			this.setCurrentAnimation("idle");
		}).bind(this))
	},

 	waterHit: function(force) {
		if(force >= 40) {

			game.puzzle.puzzleHUD.addScore(this.difficulty * 10);
			//this.setCurrentAnimation("hurt");
			MoveOnX(this.pos.x + 300, 600, this, (function(){
				game.puzzle.puzzle_container.removeChild(this);
			}).bind(this));
		} else if (!this.wet) {
			//pause
			game.puzzle.puzzleHUD.addScore(this.difficulty * 5);
			this.wet = true;
			this.attack_timer = 0;
			MoveOnX(this.pos.x + 60, 500, this, (function(){

				this.setCurrentAnimation("dazed");
				this.flipX(true);
				//this.setCurrentAnimation("dazed");
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
					this.setCurrentAnimation("walksideways");
					MoveOnX(this.pos.x - 60, 800, this, (function(){
						this.setCurrentAnimation("idle");
						this.animationpause = true;
					}).bind(this));
				}).bind(this), 20000);
			}).bind(this));
		}
 	},

	update: function(delta) {

		if(!this.busy && !this.wet) {
			this.attack_timer += me.timer.tick;

			if(this.attack_timer >= this.attack_imminent && !this.threatening) {
				this.threatening = true;
				this.setCurrentAnimation("threatening");
				me.audio.play(this.attack_array[this.attack_type_counter].warning_noise);
			}

			if(this.attack_timer >= this.attack_total_time) {
				this.threatening = false;
				this.attack_timer = 0;
				this.attack_type_counter++;
				if(this.attack_type_counter >= this.attack_array.length - 1) this.attack_type_counter = 0;
				this.attack();
			}
		}

		this.parent(delta);
		return true;

	},

	addAttack: function(attack, warning_noise, attack_noise) {
		window["attack_" + attack].warning_noise = warning_noise;
		window["attack_" + attack].attack_noise = attack_noise;
		this.attack_array.push(window["attack_" + attack]);
		this.addAnimation(this.attack_array[this.attack_array.length - 1].attack_name, [7 + this.attack_array.length, 8 + this.attack_array.length]);

		//pre-calculate the attack timers so we're not doing it every loop. Technically this is being done more than it needs to in this function but a
		//mild bit of processor waste is worth less code clutter. Alright I'm lazy, fuck off!
		this.attack_total_time = this.difficulty_array[this.difficulty - 1] * 100;
		this.attack_imminent = (this.difficulty_array[this.difficulty - 1] * 100) - ((this.difficulty_array[this.difficulty - 1] * 100) * 0.3);

	}

});

game.bossAlligator = game.puzzleBoss.extend({
	init: function() {
		this.parent("Alligator", "bossalligator", 3);
		this.addAttack("knock", "alligatorgrowl_sfx", "chomp_sfx");
	}
});

//////////BOSS ATTACKS

//knock attack (knock random pipes off the grid)
attack_knock = {
	attack_name: "knock",
	attack_exec: function (object, difficulty) {
		console.log("knock down pipes!");
		for (var i = 0; i <= game.pipe_manager.xMAX; i++) {
			for (var k = 0; k <= game.pipe_manager.yMAX; k++) {
				if(game.pipe_manager.pipe_grid[i][k].type !== undefined && game.pipe_manager.pipe_grid[i][k].type == "pipe" && game.pipe_manager.pipe_grid[i][k].subtype != "goal") {
					FallingHelper(0, 0, game.pipe_manager.pipe_grid[i][k], false);
					game.pipe_manager.pipe_grid[i][k] = 1;
				}
			}
		}
	}
};
