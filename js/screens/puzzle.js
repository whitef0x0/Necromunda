game.PuzzleScreen = me.ScreenObject.extend({

    x_parts_offset: 32,
    y_parts_offset: 32,
    x_puzzle_offset: 128,
    y_puzzle_offset: 64,
    grid_width: 10,
    grid_height: 7,

	onResetEvent: function() {
		me.game.reset();

    //increment the play clock (adds to total time played)
    this.play_clock = setInterval(function() {
      game.game_info_object.play_time++;
    }, 1000);

		me.audio.playTrack(game.game_info_object.overworld.map + "puzzle_bgm");

        game.puzzle.puzzle_container = new game.puzzleContainer();
        me.game.world.addChild(game.puzzle.puzzle_container);
        //game.puzzle.puzzle_container.autoSort = false;

	    if(game.game_info_object.puzzle.settings.wallimage) {
			var background = new me.SpriteObject (0, 0, me.loader.getImage(game.game_info_object.puzzle.settings.wallimage));
		} else {
			var background = new me.SpriteObject (0, 0, me.loader.getImage("wallfarm"));
		}

        //left side pipe examples
		var farmpipestraight = new me.SpriteObject (32, 32, me.loader.getImage("farmpipestraight"));
		var farmpipebent = new me.SpriteObject (32, 74, me.loader.getImage("farmpipebent"));
		var farmpipetee = new me.SpriteObject (32, 116, me.loader.getImage("farmpipetee"));
		var farmpipecross = new me.SpriteObject (32, 158, me.loader.getImage("farmpipecross"));

        //define the player's cursors
		var hilight1 = new me.SpriteObject (this.x_parts_offset - 2, this.y_parts_offset - 2, me.loader.getImage("hilight1"));
		var hilight2 = new me.SpriteObject (this.x_puzzle_offset - 2, this.y_puzzle_offset - 2, me.loader.getImage("hilight2"));

        var suit_image = (game.game_info_object.inventory.equipped.suit.suitimage) ? game.game_info_object.inventory.equipped.suit.suitimage : "mainchar";
		var playerAnim = new game.mainCharEntity (0, 262, suit_image);

		//if an NPC is defined: Get the NPC's information from the game_info_object (it's inserted there by the trash portal)
		if(game.game_info_object.puzzle.settings.npc) {
			var npcObject = eval("(" + game.game_info_object.puzzle.settings.npc + ")");
			var npcAnim = new game.npcPuzzleEntity(544, 262, npcObject.npcname, npcObject.image, npcObject.dialogue_array, npcObject.difficulty);
			//npcAnim.addShape(new me.Rect(new me.Vector2d(0, 0), 32, 48));
			//npcAnim.width = 32;
			//npcAnim.height = 48;
		}

		//This object manages the grid, player interaction, enemies, etc.
		this.pipeManager = new game.pipeManager(hilight1, hilight2, this.x_puzzle_offset, this.y_puzzle_offset, this.grid_width, this.grid_height, playerAnim, npcAnim);

		//make a reference for all the critters
		game.pipe_manager = this.pipeManager;

        //if the trash can portal specifies a time, create the timer GUI and effect
        if(game.game_info_object.puzzle.settings.time) {

        	if(!game.game_info_object.puzzle.settings.timetype) {
        		timetype = "police";
        	} else {
        		var timetype = game.game_info_object.puzzle.settings.timetype;
        	}
            var house = new me.SpriteObject ((this.grid_width - 1) * this.x_parts_offset + this.x_puzzle_offset, this.y_parts_offset / 2, me.loader.getImage("timer_end_" + timetype));
            var police = new me.SpriteObject (0 * this.x_parts_offset + this.x_puzzle_offset, this.y_parts_offset / 2, me.loader.getImage("timer_start_" + timetype));
            var policecar = new game.carTimer (0 + this.x_parts_offset + this.x_puzzle_offset, this.y_parts_offset / 2, me.loader.getImage("timer_marker_" + timetype), (this.grid_width - 2) * this.x_parts_offset + this.x_puzzle_offset, game.game_info_object.puzzle.settings.time);
            //me.game.add(police, 300);
            //me.game.add(house, 300);
            //me.game.add(policecar, 300);
            game.puzzle.puzzle_container.addChild(police, 300);
            game.puzzle.puzzle_container.addChild(house, 300);
            game.puzzle.puzzle_container.addChild(policecar, 300);
            //police.z = 300;
            //house.z = 300;
            //policecar.z = 300;
            //reference to the timer (This object accepts a time and ends the puzzle with a lose condition if it runs out)
            game.police_car = policecar;
        }

        //this is the available spots for an inpipe
        this.inpipe_spots = [[0,2],[0,3],[0,4],[0,5],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[9,1],[9,2],[9,3],[9,4]];

        //this will contain actual inpipe spots during play
        this.inpipe_spots_actual = [];

        //inner field spots for spawning play objects
        this.full_play_field = [[1,1],[1,2],[1,3],[1,4],[1,5],[0,6],[0,7],[0,8],
                                [2,1],[2,2],[2,3],[2,4],[0,5],[0,6],[0,7],[0,8],
                                [3,1],[3,2],[3,3],[3,4],[0,5],[0,6],[0,7],[0,8],
                                [4,1],[4,2],[4,3],[4,4],[0,5],[0,6],[0,7],[0,8],
                                [5,1],[5,2],[5,3],[5,4],[0,5],[0,6],[0,7],[0,8],
                                [6,1],[6,2],[6,3],[6,4],[0,5],[0,6],[0,7],[0,8]];

		game.puzzle.puzzle_container.addChild(hilight1, 200);
		//me.game.world.addChild(hilight1, 200);
		//me.game.world.addChild(hilight2, 200);
		game.puzzle.puzzle_container.addChild(hilight2, 200);
		game.puzzle.puzzle_container.addChild(farmpipestraight, 150);
		if(game.game_info_object.ability.pieces > 0) game.puzzle.puzzle_container.addChild(farmpipebent, 150);
		if(game.game_info_object.ability.pieces > 1) game.puzzle.puzzle_container.addChild(farmpipetee, 150);
		if(game.game_info_object.ability.pieces > 2) game.puzzle.puzzle_container.addChild(farmpipecross, 150);
		game.puzzle.puzzle_container.addChild(playerAnim, 150);
		game.puzzle.puzzle_container.addChild(this.pipeManager, 10);
		game.puzzle.puzzle_container.addChild(background, 3);
		//me.game.world.addChild(background);

        //this function sets up the puzzle, it needs to call the game archive object for the settings ::TODO::
        this.createPuzzle(game.game_info_object.puzzle.settings);
        	/*{ time: game.game_info_object.puzzle.time,
                            pressure: game.game_info_object.puzzle.pressure,
                            sync: game.game_info_object.puzzle.sync,
                            outpipes: game.game_info_object.puzzle.outpipes,
                            pipeability: game.game_info_object.puzzle.pipeability,
                            bugs: game.game_info_object.puzzle.bugs,
                            burrowers: game.game_info_object.puzzle.burrowers,
                            snakeys: game.game_info_object.puzzle.snakeys
                            });*/

		me.input.bindKey(me.input.KEY.LEFT,  "left", true);
		me.input.bindKey(me.input.KEY.RIGHT, "right", true);
		me.input.bindKey(me.input.KEY.UP, "up", true);
		me.input.bindKey(me.input.KEY.DOWN, "down", true);

        this.puzzleHUD = new game.puzzleHUD.Container();
                me.game.world.addChild(this.puzzleHUD);
                game.puzzle.puzzle_container.sort();
	},

	/**
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent: function() {
      clearInterval(this.play_clock);

    	me.audio.stopTrack();
      //me.aduio.stop("fanfare_sfx");
		// remove the HUD from the game world
		me.game.world.removeChild(this.puzzleHUD);
	},

	createPuzzle: function(settings) {
	    game.pipe_manager.pressure = settings.pressure;

	    //First, set the out pipe, then mark it's spot in the origin variable (we only need X because y is fixed)
	    var outpipe_x = RandomInt(2,4);
	    this.pipeManager.outpipe_reference = new game.outPipe (outpipe_x, "pipeout", this.x_puzzle_offset, this.y_puzzle_offset);
        this.pipeManager.pipe_grid[outpipe_x][6] = this.pipeManager.outpipe_reference;
	    //me.game.add(this.pipeManager.pipe_grid[outpipe_x][6], 100);
	    game.puzzle.puzzle_container.addChild(this.pipeManager.pipe_grid[outpipe_x][6], 100);
	    //this.pipeManager.pipe_grid[outpipe_x][6].z = 100;
        this.pipeManager.origin = outpipe_x;

	    this.pipeManager.goal_total = settings.outpipes;
	    if(settings.sync == true && settings.outpipes < 2) {
        // Time to set up the out pipes, if there's only one and the sync flag is on, make the in and out pipe the same X
	        this.pipeManager.pipe_grid[outpipe_x][0] = new game.inPipe (this.x_puzzle_offset + 32 * outpipe_x, this.y_puzzle_offset, "pipein");
	        //me.game.add(this.pipeManager.pipe_grid[outpipe_x][0], 100);
	        game.puzzle.puzzle_container.addChild(this.pipeManager.pipe_grid[outpipe_x][0], 100);
	        //this.pipeManager.pipe_grid[outpipe_x][0].z = 100;
	        this.inpipe_spots_actual = [[outpipe_x, 0]]
	        this.pipeManager.pipe_grid[outpipe_x][0].flipY();
        } else {
        // Otherwise, pick random locations on the left, top and right to put the out pipes

            var pipes_dealt = settings.outpipes;
            while(pipes_dealt > 0) {
            //for(var p = 0; p < settings.outpipes; p++) {
                var spot = this.getSpot(this.inpipe_spots); //this.randomInt(0,15);

                if(this.pipeManager.pipe_grid[ spot.x ][ spot.y ] == 1) {
                    this.pipeManager.pipe_grid[ spot.x ][ spot.y ] = new game.inPipe (this.x_puzzle_offset + 32 * spot.x, this.y_puzzle_offset + 32 * spot.y, "pipein");
                    this.inpipe_spots_actual.push([spot.x, spot.y]);
                    //me.game.add(this.pipeManager.pipe_grid[ spot.x ][ spot.y ], 100);
                    game.puzzle.puzzle_container.addChild(this.pipeManager.pipe_grid[ spot.x ][ spot.y ], 100);
                    //this.pipeManager.pipe_grid[ spot.x ][ spot.y ].z = 100;

                    //Orient the in pipes towards the playing field
                    this.pipeManager.pipe_grid[ spot.x ][ spot.y ].orient(spot.x, spot.y, this.grid_width - 1);
                    pipes_dealt--;
                }
            }
        }

		if(settings.snakeys) {
			this.makeSnakey(settings.snakeys);
		}

		if(settings.burrowers) {
			this.makeBurrower(settings.burrowers);
		}

		if(settings.bugs) {
		    this.makeBug(settings.bugs);
		}

		if(settings.debris) {
		    this.makeDebris(settings.debris);
		}

		if(settings.boss) {
			var boss = new game[settings.boss];
			game.puzzle.puzzle_container.addChild(boss, 375);
			game.pipe_manager.npc = boss;
		}
	},

	//make some debris
	makeDebris: function(amount) {
		for(var b = 1; b <= amount; b++) {
			var debris = new game.puzzleDebris();
			game.puzzle.puzzle_container.addChild(debris, 175);
			this.placePlayObject(debris);
		}
	},

	//make a snakey
	makeSnakey: function(amount) {
		for(var b = 1; b <= amount; b++) {
			var snakey = new game.puzzleSnakey (0,0);
			game.puzzle.puzzle_container.addChild(snakey, 175);
			this.placePlayObjectBeforeInPipe(snakey, b);
		}
	},

	//create a bug
	makeBurrower: function(amount) {
		for(var b = 1; b <= amount; b++) {
			var burrower = new game.puzzleBurrow (0,0);
			game.puzzle.puzzle_container.addChild(burrower, 175);
			this.placePlayObjectBeforeInPipe(burrower, b);
		}
	},

	//create a bug
	makeBug: function(amount) {
        for(var b = 1; b <= amount; b++) {
            var bug = new game.puzzleBug(0,0);
            game.puzzle.puzzle_container.addChild(bug, 175);
            this.placePlayObject(bug);
        }
	},

	//accept a *moveable* play object, find an empty spot on the field, then place it on the field
	//(Must be moveable because this function could potentially place an object in front of an in-pipe)
	placePlayObject: function(play_object) {
        while(1) {
            var spot = this.getSpot(this.full_play_field); //this.randomInt(0,15);
                if(this.pipeManager.pipe_grid[ spot.x ][ spot.y ] == 1) {
                    //put the object reference into the grid
                    this.pipeManager.pipe_grid[ spot.x ][ spot.y ] = play_object;
                    //put the sprite in it's place
                    play_object.pos.x = this.x_puzzle_offset + 32 * spot.x;
                    play_object.pos.y = this.y_puzzle_offset + 32 * spot.y;
                    //let the object know where they are on the grid to start (they will need to keep track of it themselves from then on [if they move] )

                    play_object.grid_x = spot.x;
                    play_object.grid_y = spot.y;
                    return true;
                }
        }
	},

	//accept a *moveable* play object, find an empty spot on the field, then place it on the field
	//(Must be moveable because this function WILL place an object in front of an in-pipe)
	//****This contains some functionality specific to burrowers.. I probably need to move it into the burrower class******
	placePlayObjectBeforeInPipe: function(play_object, num) {
        while(1) {
            var spot = this.getSpot(this.inpipe_spots_actual);

            //figure out which direction the pipe is facing
            if (spot.y <= 0) {
   				//Top Row
                //play_object.angle = -1.57;
                if(play_object.setDirection) play_object.setDirection(2);//"down";
                //play_object.new_direction = 2;
                spot.y++;
            } else if(spot.x <= 0) {
            	//Left side
                spot.x++;
                //play_object.angle = 0;
                if(play_object.setDirection) play_object.setDirection(1)//"right";
                //play_object.flipX();
            } else if (spot.x >= this.pipeManager.pipe_grid.length - 1) {
                //Right side
                //play_object.angle = 0;
                if(play_object.setDirection) play_object.setDirection(3)//"left";
                //play_object.flipX(false);
                spot.x--;
            }

            if(this.pipeManager.pipe_grid[ spot.x ][ spot.y ] == 1) {

                //put the object reference into the grid
                this.pipeManager.pipe_grid[ spot.x ][ spot.y ] = play_object;

                //put the sprite in it's place
                play_object.pos.x = this.x_puzzle_offset + 32 * spot.x;
                play_object.pos.y = this.y_puzzle_offset + 32 * spot.y;

                //let the object know where they are on the grid to start (they will need to keep track of it themselves from then on [if they move] )
                play_object.grid_x = spot.x;
                play_object.grid_y = spot.y;
                return true;
            }
        }
	},

	//Find a spot for the inpipes
    getSpot: function(multi_array) {
        var rand = RandomInt(0,multi_array.length - 1);
        var spot = {x: 0, y: 0};
        spot.x = multi_array[rand][0];
        spot.y = multi_array[rand][1];
        return spot;
	},

	randomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
	}

});
