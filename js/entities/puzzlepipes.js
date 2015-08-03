game.puzzleContainer = me.ObjectContainer.extend({
	init: function(){
		this.parent(0, 0, game.screen_width, game.screen_height);
        //this.autoSort = false;
	}
});

game.pipeManager = me.Renderable.extend({
    leaking: false,
    busy: false,
    super_pressure: false,
    super_pressure_counter: 0,
    debug: false,
    name: "puzzle Manager",

    init: function(hl1, hl2, xoff, yoff, gwidth, gheight, player, npc) {
        //var settings = {};
        //settings.width = 10;
        //settings.height = 10;
        // call the parent constructor
        this.parent(new me.Vector2d(0,0), 10, 10);

        this.current_pipe = 0;

		//references to the player and the current NPC or BOSS
        this.player = player;
        this.npc = npc;

        //this is the wrench and the pipe selector
        this.hilight1 = hl1;
        this.hilight2 = hl2;
        this.hilight1_spots = [30, 72, 114, 156];

        //leak array holds leak positions, goal total is how many goal pipes there are and goal tally counts them during spray phase
        this.leak_array = [];
        this.goal_total = 0;
        this.goal_tally = 0;

        //How many grid rows and columns there are
        this.xMAX = gwidth - 1;
        this.yMAX = gheight - 1;

        //where the grid is positioned on the screen
        this.x_offset = xoff;
        this.y_offset = yoff;

        //this.pipestraight = new me.SpriteObject (32, 32, me.loader.getImage("farmpipestraight"));
        //this.pipebent = new me.SpriteObject (32, 96, me.loader.getImage("farmpipebent"));

		//the X and Y of the wrench (in grid units)
        this.indexX = 0;
        this.indexY = 0;

        //clear the grid each new puzzle
        this.pipe_grid = new Array();

		for (var i = 0; i <= this.xMAX; i++) {
			this.pipe_grid[i] = new Array();
			for (var k = 0; k <= this.yMAX; k++) {
				this.pipe_grid[i][k] = 1;
			}
		}

        //bring in the NPC immediately if the difficulty is set to 0 (non-confrontational)
        if(this.npc && this.npc.difficulty === 0) { this.addNPC(); }

        //if debug is true, run water pipe solving debug visualisation
        //if(this.debug) {
        //	this.debug_visual = new game.debugVisual();
        //	game.puzzle.puzzle_container.addChild(this.debug_visual, Infinity);
        //}
	},

    update: function(delta) {


        if(!this.busy && !this.wet) {

        	if (this.super_pressure_counter > 0 && this.super_pressure == false) {
				this.super_pressure = true;
				game.pipe_manager.outpipe_reference.setSuperPressure(true);
        		this.super_pressure_interval = setInterval((function(){ this.super_pressure_counter--;}).bind(this), 1000);
        	} else if(this.super_pressure_counter < 1 && this.super_pressure == true){
        		this.super_pressure = false;
        		game.pipe_manager.outpipe_reference.setSuperPressure(false);
        		clearInterval(this.super_pressure_interval);
        		this.super_pressure_counter = 0;
        	}

            if (me.input.isKeyPressed('action')) {

                if (this.pipe_grid[this.indexX][this.indexY] == 1) {
                    this.insertPipe();
                } else {
                    this.reorderPipe();
                }
            }

            if (me.input.isKeyPressed('alternate')) {
                this.nextPipe();
            }

            if (me.input.isKeyPressed('left') && this.indexX > 0) {
                this.indexX--;
                this.hilight2.pos.x -= 32;
                //this.printIndexes();
            } else if (me.input.isKeyPressed('right') && this.indexX < this.xMAX) {
                this.indexX++;
                this.hilight2.pos.x += 32;
                //this.printIndexes();
            }

            if (me.input.isKeyPressed('up') && this.indexY > 0) {
                this.indexY--;
                this.hilight2.pos.y -= 32;
                //this.printIndexes();
            } else if (me.input.isKeyPressed('down') && this.indexY < this.yMAX) {
                this.indexY++;
                this.hilight2.pos.y += 32;
                //this.printIndexes();
            }
        }
        this.parent(delta);
        return true;
    },

    addNPC: function() {
        //me.game.add(this.npc, 100);
        game.puzzle.puzzle_container.addChild(this.npc, 150);
        game.puzzle.puzzle_container.sort();
        //this.npc.z = 100;
    },

	addSuperPressureTime: function(seconds) {
    	this.super_pressure_counter += seconds;
	},

    //Pause everything on the play field, including the player
    pauseGrid: function() {
		this.busy = true;
		if(this.npc) this.npc.busy = true;

		for (var i = 0; i <= this.xMAX; i++) {
			for (var k = 0; k <= this.yMAX; k++) {
				if(this.pipe_grid[i][k].busy !== undefined) this.pipe_grid[i][k].busy = true;
			}
		}
	},

    //unPause everything on the play field, including the player
    unPauseGrid: function() {
    	this.busy = false;
    	if(this.npc) this.npc.busy = false;

		for (var i = 0; i <= this.xMAX; i++) {
			for (var k = 0; k <= this.yMAX; k++) {
				if(this.pipe_grid[i][k].busy !== undefined) this.pipe_grid[i][k].busy = false;
			}
		}
    },

    insertPipe: function() {
        //this.printIndexes();
        //Add one move to the total moves (for scoring purposes)
        game.puzzle.puzzleHUD.addMove();

        //depending on which pipe type is selected (each piece starts 10 left of where it needs to go)
        switch(this.current_pipe)
        {
            case 0:
                this.pipe_grid[this.indexX][this.indexY] = new game.straightPipeObject ((this.x_offset + 32 * this.indexX) - 10, this.y_offset + 32 * this.indexY);
                break;
            case 1:
                this.pipe_grid[this.indexX][this.indexY] = new game.bentPipeObject ((this.x_offset + 32 * this.indexX) - 10, this.y_offset + 32 * this.indexY);
                break;
            case 2:
                this.pipe_grid[this.indexX][this.indexY] = new game.teePipeObject ((this.x_offset + 32 * this.indexX) - 10, this.y_offset + 32 * this.indexY);
                break;
            case 3:
                this.pipe_grid[this.indexX][this.indexY] = new game.crossPipeObject ((this.x_offset + 32 * this.indexX) - 10, this.y_offset + 32 * this.indexY);
                break;
        }

        //pass along it's grid coordinates
        this.pipe_grid[this.indexX][this.indexY].grid_x = this.indexX;
        this.pipe_grid[this.indexX][this.indexY].grid_y = this.indexY;

        game.puzzle.puzzle_container.addChild(this.pipe_grid[this.indexX][this.indexY], 200);

        //If torque is not instant (0), do pausing animation for inserting pipe
        game.pipe_manager.busy = true;
        me.audio.play("pipeslide" + game.game_info_object.ability.torque + "_sfx");
        if(game.game_info_object.ability.torque > 0) {
			//wait a certain amount of time depending on torque ability
			var tween = new me.Tween(this.pipe_grid[this.indexX][this.indexY].pos).to({x: this.pipe_grid[this.indexX][this.indexY].pos.x + 10}, game.game_info_object.ability.torque * 100).onComplete((function(){
			//setTimeout( (function(){
				//start a tween offect of the pipe dropping and release the users wrench
				game.pipe_manager.busy = false;
			}).bind(this.pipe_grid[this.indexX][this.indexY]));
			tween.easing(me.Tween.Easing.Exponential.In);
			tween.start();
		} else {
			game.pipe_manager.busy = false;
			this.pipe_grid[this.indexX][this.indexY].pos.x += 10;
		}
        game.puzzle.puzzle_container.sort();
    },

	//this function now activates whatever play is pointing to on the grid
    reorderPipe: function() {
        //Activate the object being pointed to on the grid, if it returns a true, object should be removed from the grid
        //if( this.pipe_grid[this.indexX][this.indexY].next() ) { this.pipe_grid[this.indexX][this.indexY] = 1; }
        this.pipe_grid[this.indexX][this.indexY].next();
    },

	//Switch to the next pipe type in your toolbox
    nextPipe: function() {
        if(this.current_pipe < game.game_info_object.ability.pieces) {
            this.current_pipe++;
        } else {
            this.current_pipe = 0;
        }
        this.hilight1.pos.y = this.hilight1_spots[this.current_pipe];
    },

    //tell all pipes that water is not flowing through them anymore
	clearPipes: function() {
		for (var i = 0; i <= this.xMAX; i++) {
			for (var k = 0; k <= this.yMAX; k++) {
				if(this.pipe_grid[i][k] !== 1 && this.pipe_grid[i][k].type === "pipe") {
					this.pipe_grid[i][k].resetPipe();
				} else {
				}
			}
		}
	},

	bugCheck: function() {
		for (var i = 0; i <= this.xMAX; i++) {
			for (var k = 0; k <= this.yMAX; k++) {
				if(this.pipe_grid[i][k].type == "enemy") {
					return false;
				}
			}
		}
		return true;
	},

    //this function runs when the player opens the water valve, it does the checking to see if the player solved the puzzle or to shoot water out of leaks
    runWater: function() {

    	//running the water counts as a move
    	game.puzzle.puzzleHUD.addMove();
        //Only let the user run the water once every 2 seconds
        this.leaking = true;
        setTimeout( (function(){ this.leaking = false; }).bind(this), 1500);

        //Variables to keep track of each leak and every time a pipe meets a goal pipe
        this.goal_tally = 0;
        this.leak_array = [];

        //figure out how much pressure the system has, double it if super_pressure pressure is on
        var pressure_holder = (this.super_pressure) ? this.pressure * 4 : this.pressure;
        //call the recursive water solver, the outpipe is always in the bottom row, so y is fixed (this.origin is set when the outpipe is initially placed)
        this.solve({x:this.origin, y: 5}, {x:this.origin, y:6});
        if(this.goal_tally == this.goal_total && this.leak_array.length === 0 && this.bugCheck()) {
            //all goal pipes have water running into them and there are no leaks, puzzle complete!
            //me.state.change(me.state.PLAY);

			//water runs but is muffled because there are no leaks
			me.audio.play("waterspraymuffled_sfx");
            this.youWin();

        } else {
            //this is where the leaks are placed.
            //TODO (?) reorder the leak array based on Y (height) and only shoot water out of low pipes

            //sort the leak array so that lowest leaks are in the beginning
            this.leak_array.sort(this.compare);

			//just in case the player has no leaks but hasn't killed all the bugs or doesn't have all outlets attached
			if(this.leak_array.length < 1) me.audio.play("waterspraymuffled_sfx");

            //this loop puts water leaks at the lowest (Y) coords and halfs the amount of water that comes out for each succesive leak
            for(var z = 0; z <= this.leak_array.length - 1; z++)
            {
                pressure_holder = Math.ceil( pressure_holder / 2);


                //is super_pressure pressure on?
                var super_pressure = (this.super_pressure && this.leak_array.length === 1) ? true : false;
                //shake the screen if the water pressure is on high
                if(super_pressure) {
            		me.audio.play("waterspraysuper_sfx");
                	me.game.viewport.shake(10, 500, me.game.viewport.AXIS.BOTH);
                } else {
					me.audio.play("waterspray_sfx");
                }
                //start first leak spawn
                var leak_anim = new game.waterSprayer(this.leak_array[z].x, this.leak_array[z].y, this.leak_array[z].direction, pressure_holder/* this.leak_array.length */, this.x_offset, this.y_offset, super_pressure);
                //me.game.add(leak_anim, 200);
                game.puzzle.puzzle_container.addChild(leak_anim, 250);
                game.puzzle.puzzle_container.sort();
                //leak_anim.z = 250;

                if(pressure_holder == 1) pressure_holder = 0;
                if(pressure_holder <= 0) break;
            }

			setTimeout( (function() {
				game.puzzle.puzzleHUD.tallyKilled();
				this.unPauseGrid();
				this.clearPipes();
			}).bind(this), 1000);

        }
    },

    //define the sort functionality for the leak array sort (I'm comparing the y coordinates and ordering accordingly)
    compare: function(a,b) {
        if (a.y < b.y)
            return 1;
        if (a.y > b.y)
            return -1;
        return 0;
    },

    //A recursive function that iterates through all the water pipes looking for end pieces and 'leaks' (a spot where a pipe ends and the water will run out)
    solve: function(test_pos, old_pos) {

        //find direction that the previous pipe in the chain was pointing (if we traverse this opening it'd be like the water also going the way it came.)
        var indirection = this.findIncomingDirection(test_pos,old_pos);

        //if() {
            //if next position is a pipe or endpiece
        if (this.pipe_grid[test_pos.x] !== undefined && this.pipe_grid[test_pos.x][test_pos.y] !== undefined && this.pipe_grid[test_pos.x][test_pos.y].type == "pipe" && this.pipe_grid[test_pos.x][test_pos.y].outlet[indirection] == 1) {
            if(this.pipe_grid[test_pos.x][test_pos.y].subtype == "goal") {
                //a player pipe fed into an inpipe, add one to the pipe tally
                this.goal_tally++;
            } else {
                //a player pipe found another pipe, figure out if it's got an opening pointing towards us (And if it doesn't already have water flowing through it, if so, recurse and move to that pipe
                var outlet = this.pipe_grid[test_pos.x][test_pos.y].inlet;

                //close off the direction we came from for this water run
                this.pipe_grid[test_pos.x][test_pos.y].inlet[indirection] = 0;

                for(var m = 0; m < 4; m++) {
                    if(m !== indirection && outlet[m] !== 0) {
                		//close off the direction we're going
                		this.pipe_grid[test_pos.x][test_pos.y].inlet[m] = 0;

                        //find the next position and recurse
                        var next_pos = this.applyDirectionToCoords(m, test_pos.x, test_pos.y);

                       	this.solve(next_pos, test_pos);
                    }
                }
            }
        } else {
            //a non pipe object was found, store this location as a leak, along with the direction that the water will shoot
            test_pos.direction = indirection;
            //if(test_pos.x !== this.origin && test_pos.y !== 6) {
				this.leak_array.push(test_pos);
            //}
        }
        //} else {
        //    test_pos.direction = indirection;
        //    this.leak_array.push(test_pos);
        //}
    },

    applyDirectionToCoords: function(dir, X, Y) {
        var pos = {x: X, y: Y};
        switch(dir) {
            case 0:
                pos.y -= 1;
                //if(pos.y >= this.yMAX) return -1;
                break;
            case 1:
                pos.x += 1;
                //if(pos.y >= this.yMAX) return -1;
                break;
            case 2:
                pos.y += 1;
                //if(pos.y >= this.yMAX) return -1;
                break;
            case 3:
                pos.x -= 1;
                //if(pos.y >= this.yMAX) return -1;
                break;

        }

        return pos;
    },

    findIncomingDirection: function(current, old) {
        if(old.y < current.y) {
            return 0;
        } else if (old.x > current.x) {
            return 1;
        } else if (old.y > current.y) {
            return 2;
        } else if (old.x < current.x) {
            return 3;
        }
    },

    youWin: function() {
    	game.puzzle.puzzleHUD.addScore(200);

		me.audio.stopTrack();
		me.audio.playTrack("fanfare_sfx");
        //happy dance, show score, whatever, set this puzzle to complete
				this.pauseGrid();
        //if timer exists, stop timer
        if(game.police_car) { game.police_car.stopTimer(); }
        //change back to play state
        //this.endLevel();
        game.game_info_object.puzzle.completed[game.game_info_object.puzzle.settings.uid] = true;

        game.puzzle.puzzleHUD.report(true);
    },

    youLose: function() {
        //sad gesture :( , show score, whatever, then change back to play state
        this.pauseGrid();
        if(game.police_car) game.police_car.stopTimer();

        game.puzzle.puzzleHUD.popupText({message: "TIME'S UP!", effect: "blink", timeout: 2500, size: 34});
        me.game.viewport.fadeIn("#000000", 3000, function() {
					//game.puzzle.puzzleHUD.report(false);
					me.state.change(me.state.GAMEOVER);
        });
    },

    endLevel: function() {
        game.puzzle.puzzle_container.removeChild(game.pipe_manager);
        delete game.pipe_manager;
        me.state.change(me.state.PLAY);
    }
});

game.debugVisual = me.Renderable.extend({

	init: function() {
		this.parent(new me.Vector2d(0,0),500,300);
		this.main = {};
		this.check_square = {};
	},

	moveTestPos: function(x, y){
		this.main.x = x;
		this.main.y = y;
	},

	directionCheck: function(direction, result) {
		switch(direction) {
			case 0:
				this.check_square.x = 0;
				this.check_square.y = -32;
				break;
			case 1:
				this.check_square.x = 32;
				this.check_square.y = 0;
				break;
			case 2:
				this.check_square.x = 0;
				this.check_square.y = 32;
				break;
			case 3:
				this.check_square.x = -32;
				this.check_square.y = 0;
				break;
		}

		this.color = (result) ? "green" : "red";
	},

	clear: function() {
		this.main.x = -100;
		this.main.y = -100;
	},

	draw: function(context) {
		context.fillStyle = 'pink';
		context.fillRect(this.main.x + 8, this.main.y + 8, 16, 16);
		context.fillStyle = this.color;
		context.fillRect(this.main.x + 8 + this.check_square.x, this.main.y + 8 + this.check_square.y, 16, 16);
	}
});

game.pipeObject = me.SpriteObject.extend({
    timer: 0,
	init: function(x, y, image) {
		//this.type = type;
		this.rotation = 0;
		this.type = "pipe";
		this.parent(x, y, me.loader.getImage(image));

		this.resetPipe();
	},

	waterHit: function(direction, force) {
		if(force >= 40) {
			this.drop(direction, force);
		} else {
			return false;
		}
	},

	resetPipe: function() {
		this.inlet = this.outlet.slice(0);
		return false;
	},

    update:function(delta) {
        this.timer += me.timer.tick;
        if(this.timer >= game.game_info_object.ability.torque) { //game.game_info_object.ability.torque; torque here?
            this.rotate();
            this.timer = 0;
        }

        this.parent(delta);
        return true;
    },

    next: function() {
		//adding a move because I'm being rotated
		game.puzzle.puzzleHUD.addMove();
        game.pipe_manager.busy = true;
    },

    //rotation tween function (Should this be replaced with melonjstween?)
    applyTorque: function(target) {
    	me.audio.play("pipeslide" + game.game_info_object.ability.torque + "_sfx");
        if(game.game_info_object.ability.torque > 0) {
            this.angle_target = target;
        } else {
            this.angle = target;
            game.pipe_manager.busy = false;
        }
    },

    rotate: function() {
        if(this.angle_target) {
            if(this.angle < this.angle_target) {
                this.angle += 0.4;
            } else {
                this.angle = this.angle_target;
                delete this.angle_target;
                game.pipe_manager.busy = false;
            }
        }
    },

    remove: function() {
		game.pipe_manager.busy = true;
		game.puzzle.puzzleHUD.addMove();

		me.audio.play("pipeslide" + game.game_info_object.ability.torque + "_sfx");
		if(game.game_info_object.ability.torque > 0) {
			//wait a certain amount of time depending on torque ability
	        var tween = new me.Tween(this.pos).to({x: this.pos.x + 10}, game.game_info_object.ability.torque * 100).onComplete((function(){
			//setTimeout( (function(){
				//start a tween offect of the pipe dropping and release the users wrench
				me.audio.play("piperemove_sfx");
				game.pipe_manager.busy = false;
				this.drop(0,0);
			}).bind(this));
			tween.easing(me.Tween.Easing.Exponential.In);
			tween.start();
		} else {
			me.audio.play("piperemove_sfx");
			game.pipe_manager.busy = false;
			this.drop(0,0);
		}
    },

	drop:function(direction, force) {
		FallingHelper(direction, force, this, false);
		game.pipe_manager.pipe_grid[this.grid_x][this.grid_y] = 1;
    }
});

game.straightPipeObject = game.pipeObject.extend({

    init: function(x, y, image) {
        this.outlet = [1,0,1,0];
        this.parent(x, y, "farmpipestraight");
        this.subtype = "straight";
    },

    next: function() {
        this.parent();
       //
        switch (this.rotation)
        {
        case 0:
            this.applyTorque(1.57);
            this.outlet = [0,1,0,1];
            this.rotation++;
			this.resetPipe();
            return false;
        case 1:
            this.remove();
            return true;
        }
	}
});

game.bentPipeObject = game.pipeObject.extend({

    init: function(x, y, image) {
        this.outlet = [0,0,1,1];
        this.parent(x, y, "farmpipebent");
        this.subtype = "bent";
    },

    next: function() {
        this.parent();

        switch (this.rotation)
        {
        case 0:
            this.applyTorque(1.57);
            this.outlet = [1,0,0,1];
            this.rotation++;
            this.resetPipe();
            return false;
        case 1:
            this.applyTorque(3.14);
            this.outlet = [1,1,0,0];
            this.rotation++;
            this.resetPipe();
            return false;
        case 2:
            this.applyTorque(4.71);
            this.outlet = [0,1,1,0];
            this.rotation++;
			this.resetPipe();
            return false;
        case 3:
            this.remove();
            return true;
        }
   }
});

game.teePipeObject = game.pipeObject.extend({

    init: function(x, y, image) {
        this.outlet = [1,0,1,1];
        this.parent(x, y, "farmpipetee");
		this.subtype = "tee";
    },

    next: function() {
        this.parent();
       //
        switch (this.rotation)
        {
        case 0:
            this.applyTorque(1.57);
            this.outlet = [1,1,0,1];
            this.rotation++;
            this.resetPipe();
            return false;
        case 1:
            this.applyTorque(3.14);
            this.outlet = [1,1,1,0];
            this.rotation++;
            this.resetPipe();
            return false;
        case 2:
            this.applyTorque(4.71);
            this.outlet = [0,1,1,1];
            this.rotation++;
            this.resetPipe();
            return false;
        case 3:
            this.remove();
            return true;
        }
		this.resetPipe();
   }
});

game.crossPipeObject = game.pipeObject.extend({

    init: function(x, y, image) {
        this.outlet = [1,1,1,1];
        this.parent(x, y, "farmpipecross");
		this.subtype = "cross";
    },

    next: function() {
        this.parent();
        this.remove();
        return true;

   }
});

game.inPipe = game.pipeObject.extend({
    init: function(x, y, image) {
        this.outlet = [0,0,1,0];
        this.subtype = "goal";
        this.parent(x, y, "pipein");
    },

    orient: function(x, y, width) {
        if(x == 0) {
            this.angle = 1.57;
            this.outlet = [0,1,0,0];
        } else if (y == 0) {
            this.flipY();
            //this.pipeManager.pipe_grid[ this.inpipe_spots[spot][0] ][ this.inpipe_spots[spot][1] ].outlet = [0,0,1,0];
        } else if (x == width) {
            this.angle = -1.57;
            this.outlet = [0,0,0,1];
        }
    },

    resetPipe: function() {
    	return false;
    },

	waterHit: function() {
		return false;
	},

    next: function() {
        return false;
    }
});

game.outPipe = me.AnimationSheet.extend({

	super_pressure: false,

	init: function(x, image, x_offset, y_offset) {
		this.outlet = [1,0,0,0];
		this.parent(x_offset + 32 * x, y_offset + 192, me.loader.getImage(image), 32, 32)

		//this.addAnimation("idle", [ 0 ]);
		this.addAnimation("turn", [ 0, 1, 2, 3 ], 30);
		this.addAnimation("bulge", [ 4, 5 ], 100);

		this.setCurrentAnimation("turn");
		this.animationpause = true;
	},

	setSuperPressure: function(bool) {
		this.super_pressure = bool;
		this.animationpause = false;
		if(this.super_pressure) {
			this.setCurrentAnimation('bulge', (function(){this.animationpause=true;}).bind(this));
		} else {
			this.setCurrentAnimation('turn', (function(){this.animationpause=true;}).bind(this));
		}
	},

   	waterHit: function() {
		return false;
	},

	next: function() {

		game.pipe_manager.pauseGrid();
		game.pipe_manager.runWater();
		this.setCurrentAnimation("turn");
		this.animationpause = false;
		setTimeout( this.animstop.bind(this), 1000);
		return false;
	},

	animstop: function() {
		if(this.super_pressure) {
			this.setCurrentAnimation('bulge', (function(){this.animationpause=true;}).bind(this));
		} else {
			this.setCurrentAnimation('turn', (function(){this.animationpause=true;}).bind(this));
		}
		//game.puzzle.puzzleHUD.tallyKilled();
		//game.pipe_manager.unPauseGrid();
	}
});

game.waterSprayer = me.AnimationSheet.extend({
    x_shift: 0,
    y_shift: 0,

    init: function(x, y, direction, force, xoff, yoff, super_pressure) {
        this.index_x = x;
        this.index_y = y;
        this.force = force
        this.xoff = xoff;
        this.yoff = yoff;
        this.adjustedX = xoff + 32 * this.index_x;
        this.adjustedY = yoff + 32 * this.index_y;

        // call the parent constructor
        this.parent(this.adjustedX, this.adjustedY, me.loader.getImage("waterjet"), 32, 32);

        //set to always running

        this.addAnimation("extend", [0, 1, 2, 3], 5);
        this.addAnimation("repeat", [4, 5, 6, 7], 80);
        this.addAnimation("super_pressure", [12, 13, 14, 15], 80);
        this.addAnimation("foam",  [8, 9, 10, 11], 50);

        this.direction = direction;
        this.super_pressure = super_pressure;
        this.current_time = 0;
        this.old_time = 0;

        switch(this.direction) {
            case 0:
                this.angle = 1.57;
                this.y_shift = 1;
                break;
            case 1:
                this.flipX();
                this.x_shift = -1;
                break;
            case 2:
                this.angle = -1.57;
                this.y_shift = -1;
                break;
            case 3:
                //this.flipX();
                this.x_shift = 1;
                break;
        }

        //if(!clone) {
        //    this.dropFountain();
        //}

        //there's no force left over or the object that it hit is immovable (checkspotforobject returns false) then stop flowing
        if(this.force <= 0 || !this.checkSpotForObject()) {
            this.setCurrentAnimation("foam");
            setTimeout( this.dieoff.bind(this), 1000);
        } else {
        //there's still pressure left and nothing in the way, spawn another water piece!
            setTimeout( this.dieoff.bind(this), 1000);
			this.setCurrentAnimation("extend", (function(){
				(super_pressure) ? this.setCurrentAnimation("super_pressure") : this.setCurrentAnimation("repeat");
				this.spawnNext();
			}).bind(this));
        }
    },

    checkSpotForObject: function() {
        //make force 40 automatically if super pressure is on
        var force = (this.super_pressure) ? 40 : this.force;

		//hardcoded check to see if virtual tiles for the player or npc/boss are hit
		if (this.index_y == game.pipe_manager.yMAX) {
			switch(this.index_x) {
				case -2:
					game.pipe_manager.player.waterHit(force);
					break;
				case game.pipe_manager.xMAX + 1:
					game.pipe_manager.npc.waterHit(force);
					break;
			}
		}

        //check the current grid spot that this water piece is on top of and if there's an object there, notify them that they've been sprayed
        if (game.pipe_manager.pipe_grid[this.index_x] !== undefined && game.pipe_manager.pipe_grid[this.index_x][this.index_y] !== undefined && game.pipe_manager.pipe_grid[this.index_x][this.index_y] !== 1) {
            return game.pipe_manager.pipe_grid[this.index_x][this.index_y].waterHit(this.direction, force);
        } else {
            return true;
        }
    },

    spawnNext: function() {
        var leak_anim = new game.waterSprayer(this.index_x + this.x_shift, this.index_y + this.y_shift, this.direction, this.force - 1, this.xoff, this.yoff, this.super_pressure);
        //me.game.add(leak_anim, 200);
    	game.puzzle.puzzle_container.addChild(leak_anim, 250);
        game.puzzle.puzzle_container.sort();
    	//leak_anim.z = 250
    },

    dieoff: function() {
        game.puzzle.puzzle_container.removeChild(this);
    }
});
