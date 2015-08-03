game.puzzleDebris = me.AnimationSheet.extend({
	init: function() {
		this.parent(0, 0, me.loader.getImage("straightpipedebris"), 32, 32);

		//this.addAnimation("idle", [0, 1, 2, 1], 100);
		//this.addAnimation("walk", [0, 3, 0, 4], 100);
		this.animationpause = true;
	},

	drop:function(direction, force) {

		FallingHelper(direction, force, this, false);
		game.pipe_manager.pipe_grid[this.grid_x][this.grid_y] = 1;
    },

	next: function() {
	    game.pipe_manager.busy = true;

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

    //all pieces on the board should have this function. What happens when I get hit by water?
    //return true if I was moved, false if I cannot be moved by the stream
	waterHit: function(direction, force) {
		if(force >= 40) {
			this.drop(direction, force);
		} else {
			return false;
		}
	}
});
