/**
 * a HUD container and child items
 */

game.puzzleHUD = game.puzzleHUD || {};


game.puzzleHUD.Container = me.ObjectContainer.extend({

	score: 0,
	moves: 0,
	killed: 0,

	init: function() {
		// call the constructor
		this.parent();

		// persistent across level change
		this.isPersistent = true;

		// non collidable
		this.collidable = false;

		// make sure our object is always drawn first
		this.z = Infinity;

		// give a name
		this.name = "puzzleHUD";

		this.score_board = new game.puzzleHUD.ScoreItem(350, 100 )
		this.addChild(this.score_board);
        this.addChild(new game.score_panel(350, 100 ));
		//this.addChild(new game.HUD.Dialogue(0, 0, "", ""));
	},

	tallyKilled: function() {

		if(this.killed > 1) {
			this.popupText({message: this.killed + " in a row!", effect: "blink", timeout: 2500, size: 34});
			this.addScore(this.killed * 20);
		}
		this.killed = 0;
		//pop-up arcade text? (double kill, triple kill, super, monster, etc?)
	},

	addScore: function(score) {
		//arcade style '+score' text?
		this.score += score;
		this.score_board.score += score;
	},

	addMove: function() {
		this.moves++;
		this.score_board.moves++;
	},

	popupText: function(settings) {
		var popup = new game.puzzleHUD.popupText(settings, this);
		this.addChild(popup);
	},

	overlayDialogue: function(name, message, intensity) {
		this.background_dg = new game.puzzleHUD.backgroundDialogueBox(0.4);
		this.text_dg = new game.puzzleHUD.overlayDialogueText(name, message, intensity);
		this.addChild(this.text_dg);
		this.addChild(this.background_dg);

		setTimeout((function(){
			console.log(this.background_dg);
			this.removeChild(this.text_dg);
			this.removeChild(this.background_dg);
		}).bind(this), 5000);
	},

	report: function() {
		console.log("report time!");
		this.addChild(new game.puzzleHUD.ReportContainer(this, this.score_board));
	}
});

game.score_panel = me.SpriteObject.extend({
	init: function() {
		this.floating = true;
		this.parent( 465, 60, me.loader.getImage("score-panel"), 95, 184);
	}
});

game.puzzleHUD.popupText = me.Renderable.extend({
	init: function(settings, parent) {
		this.message = settings.message;
		this.timeout = settings.timeout || 1500;
		color = settings.color || "#FFFFFF";
		size = settings.size || 16;
		font = settings.font || "Courier New";

		this.parent(0, 0, game.screen_width, game.screen_height);

		this.name = "popup-text";
		this.floating = true;
		this.text_alpha = 1;

		this.text_font = new me.Font(font, size, color);

		//If caller passes x and y, use them as coords, otherwise, put it in the middle of the screen
		this.x = (settings.x) ? settings.x : (game.screen_width / 2) - ((this.message.length * 20) / 2);
		this.y = (settings.y) ? settings.y : (game.screen_height / 2) - (size / 2);

		if(settings.effect) this.effect(settings.effect);

		setTimeout((function(){
			parent.removeChild(this);
		}).bind(this), this.timeout)
	},

	effect: function (effect) {
		switch(effect) {
			case "fadeupout":
				tween = new me.Tween(this).to({text_alpha: 0}, this.timeout);
				tween.easing(me.Tween.Easing.Exponential.In);
				tween.start();
				tween = new me.Tween(this).to({y: this.y - 20}, this.timeout);
				tween.easing(me.Tween.Easing.Sinusoidal.Out);
				tween.start();
				break;
			case "fadein":
				this.text_alpha = 0;
				tween = new me.Tween(this).to({text_alpha: 1}, this.timeout);
				tween.easing(me.Tween.Easing.Bounce.Out);
				tween.start();
				break;
			case "blink":
				this.text_alpha = 0;
				tween = new me.Tween(this).to({text_alpha: 1}, this.timeout / 5).repeat(3);
				tween.easing(me.Tween.Easing.Exponential.InOut);
				tween.start();
				break;
		}
	},

	draw : function (context) {
		context.globalAlpha = this.text_alpha;
		this.text_font.draw (context, this.message, this.x, this.y);
	}

});


/**
 * the dialogue box
 */
game.puzzleHUD.overlayDialogueText = me.Renderable.extend({
	init: function(name, mess, intensity) {
		console.log(mess);

		this.parent(Math.ceil((game.screen_width / 2) - (307 / 2)), 20, 307, 232);

		this.name = "puzzle-dialogue-text";
		this.speaker = name;

		this.floating = true;

		this.x_offset = 0;
		this.y_offset = 0;

		this.speaker_font = new me.Font("Courier New", 16, "#F00");
		this.message_font = new me.Font("Courier New", 16, "#FFF");

		this.lines = this.wordWrap(mess);
	},

    wordWrap: function( str ) {
        console.log(str);
        //brk = "|";
        width = 27;
        cut = false;

        if (!str) { return str; }
        var regex = '.{1,' +width+ '}(\\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\\S+?(\\s|$)');
        return str.match( RegExp(regex, 'g') ); //.join( brk );
    },

    update: function(delta) {
    	this.parent(delta);
    	return true;
    },

	draw : function (context) {
	//draw npc message, ability to wiggle

		var row = 155;
		var column = 110;

		this.speaker_font.draw (context, this.speaker + ":", (row + this.x_offset), (column + this.y_offset));
		this.message_font.draw (context, this.lines[0], (row + this.x_offset), ((column += 30) + this.y_offset));
		this.message_font.draw (context, (this.lines[1]) ? this.lines[1] : "", (row + this.x_offset), ((column += 30) + this.y_offset));
		this.message_font.draw (context, (this.lines[2]) ? this.lines[2] : "", (row + this.x_offset), ((column += 30) + this.y_offset));
		this.message_font.draw (context, (this.lines[3]) ? this.lines[3] : "", (row + this.x_offset), ((column += 30) + this.y_offset));
	}

});

game.puzzleHUD.backgroundDialogueBox = me.SpriteObject.extend({
	init: function(alpha) {

		this.name = "puzzle-dialogue-background";

		this.floating = true;

		this.parent( Math.ceil((game.screen_width / 2) - (307 / 2)), 100, me.loader.getImage("puzzle-dialogue"), 486, 335);
		this.alpha = alpha;

		console.log("alpha should be: " + this.alpha);
	}
});


game.puzzleHUD.ScoreItem = me.Renderable.extend({

	score: 0,
	moves: 0,
    /**
     * constructor
     */
    init: function(x, y) {
    	this.score = 0;
    	this.moves = 0;
    	this.timer = 0;
		// call the parent constructor
		// (size does not matter here)
		this.parent(new me.Vector2d(0, 0), game.screen_width, game.screen_height);

		this.name = "scoreboard";
		this.label_font = new me.Font("Courier New", 16, "#ccc");
		this.score_font = new me.Font("Courier New", 18, "#fff");

		// make sure we use screen coordinates
		this.floating = true;
	},

    /**
     * update function
     */
    update : function () {

    	if (game.police_car && !game.police_car.paused) {
			this.timer = game.police_car.end_time - game.police_car.counter;
    	}

        return true;
    },

	/**
	 * draw the score
	 */
	draw : function (context) {
		// draw it baby !
		if(game.police_car)	{
			this.label_font.draw (context, "Timer", 475, 75);
			this.score_font.draw (context, ~~this.timer, 475, 95);
		}
		this.label_font.draw (context, "Score", 475, 115);
		this.score_font.draw (context, ~~this.score, 475, 135);
		this.label_font.draw (context, "Moves", 475, 155);
		this.score_font.draw (context, ~~this.moves, 475, 175);
	}
});

game.puzzleHUD.ReportContainer = me.ObjectContainer.extend({
	init: function(parent_container, scoreboard) {
		this.parent();

		game.pipe_manager.pauseGrid();
		//this.pos.y = -232;
		this.isPersistent = true;
		this.collidable = false;
		this.z = 500;
		this.name = "report container";
		//this.autoSort = false;

		//add in the report background
		//this.addChild(new game.puzzleHUD.reportText(won), 530);
		this.addChild(new game.puzzleHUD.backgroundReportBox(parent_container, scoreboard), 520);

	}
});

game.puzzleHUD.backgroundReportBox = me.SpriteObject.extend({
	init: function(parent_container, scoreboard) {
		this.floating = true;
		this.isPersistent = true;
		this.parent( Math.ceil((game.screen_width / 2) - (307 / 2)), -232, me.loader.getImage("puzzle-report"), 307, 232);

		var tween = new me.Tween(this.pos).to({y: 20}, 1000).onComplete( function() {

			parent_container.addChild(new game.puzzleHUD.reportText(scoreboard), 530);
		});
		tween.easing(me.Tween.Easing.Back.Out);
		tween.start();
	}
});

game.puzzleHUD.reportText = me.Renderable.extend({
	init: function(scoreboard) {
		this.scoreboard = scoreboard;
		this.floating = true;
		this.isPersistent = true;
		this.tallying = true;
		this.currentscore = 0;
		this.totalscore = game.game_info_object.score;

		this.title_font = new me.Font("Courier New", 26, "#FFF");
		this.label_font = new me.Font("Courier New", 20, "#ccc");
		this.score_font = new me.Font("Courier New", 18, "#fff");

		this.parent(new me.Vector2d(0, 0), game.screen_width, game.screen_height);

		//cache the real totals, so we can skip to them if necessary
		this.cachedcurrentscore = this.scoreboard.timer + this.scoreboard.score - this.scoreboard.moves;
		this.cachedtotalscore = this.cachedcurrentscore + this.totalscore;

		console.log("total should be, CS:" + this.cachedcurrentscore + " TS:" + this.cachedtotalscore);

		this.tally_count = 0;
		this.tally_array = 	[ 	[{score:0}, this.scoreboard.score],
								[{moves:0}, -this.scoreboard.moves]
							];
		if(game.police_car) this.tally_array.unshift([{timer:0}, this.scoreboard.timer]);

		this.nextTally();
	},

	/**
	 * update function
	 */
	update : function (delta) {
        if (me.input.isKeyPressed('action')) {
            if(this.tallying) {
            	this.tween1.stop();
            	this.tween2.stop();
            	this.tween3.stop();
            	this.doneTally();
            } else {
							me.game.viewport.fadeIn("#000000", 300, function() {
            		game.pipe_manager.endLevel();
							});
        	}
        }

        this.parent(delta);
		return true;
	},

	nextTally: function() {
		type = this.tally_array[this.tally_count][0];
		scoremark = this.tally_array[this.tally_count][1];
		//this.currentscore += scoremark;
		this.old_tween_count = 0;

		this.tween1 = new me.Tween(this.scoreboard).to(type, 2200);
		this.tween2 = new me.Tween(this).to({currentscore: this.currentscore + scoremark}, 2200).onUpdate(function() {
			//TODO: Soundeffect update noise
			//need to see if rounded number has changed!
			if(this.old_tween_count != ~~this.currentscore) me.audio.play("scoreupdate_sfx");
			this.old_tween_count = ~~this.currentscore;
		});
		this.tween3 = new me.Tween(this).to({totalscore: this.totalscore + scoremark}, 2200).onComplete(function() {
			this.tally_count++;
			if(this.tallying && this.tally_count < this.tally_array.length)	{
				this.nextTally();
			} else {
				this.doneTally();
			}
		});

		this.tween1.easing(me.Tween.Easing.Quadratic.Out);
		this.tween2.easing(me.Tween.Easing.Quadratic.Out);
		this.tween3.easing(me.Tween.Easing.Quadratic.Out);
		this.tween1.start();
		this.tween2.start();
		this.tween3.start();
	},

	doneTally: function () {
		//me.audio.stop("fanfare_sfx");
		this.tallying = false;

		this.currentscore = this.cachedcurrentscore;
		this.totalscore = this.cachedtotalscore;

		this.scoreboard.timer = 0;
		this.scoreboard.score = 0;
		this.scoreboard.moves = 0;

		game.game_info_object.score = this.totalscore;
		//this.totalscore = game.game_info_object.score;
	},

	/**
	 * draw the score
	 */
	draw : function (context) {
		// draw it baby !
		//context.save();
        //context.fillStyle = "black";
        //context.rect(0, 0, 100, 100);
        //context.fill();
        //context.restore();

        this.title_font.draw (context, "Repairs Complete!", 155, 40);

		this.label_font.draw (context, "Current Score", 175, 90);
		this.score_font.draw (context, ~~this.currentscore, 175, 120);
		this.label_font.draw (context, "Overall Score", 175, 150);
		this.score_font.draw (context, ~~this.totalscore, 175, 180);
	}

});
