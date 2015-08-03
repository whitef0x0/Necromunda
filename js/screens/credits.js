game.CreditsScreen = me.ScreenObject.extend({
  /**
   *  DEMO CREDIT SCENE - NOT FINAL
   */
  onResetEvent: function() {

    //clear the fade
    me.game.viewport.fadeOut("#000000", 1);

    me.audio.playTrack("intro_bgm");

    this.handler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {
      if (action === "action") window.open("http://pipeanimus.falldeaf.com");

      //if (action === "alternate") game.death.sprites_container.endGame();
    });

    me.game.world.addChild(new game.creditsBackground, 10);
  },

  /**
   *  action to perform when leaving this screen (state change)
   */
  onDestroyEvent: function() {
    me.game.world.removeChild(game.creditsBackground);
    me.audio.stopTrack();
    me.event.unsubscribe(this.handler);
  }
});

game.creditsBackground = me.Renderable.extend({
  init: function() {
    this.parent(new me.Vector2d(0, 0), game.screen_width, game.screen_height);
    this.messagefont = new me.Font("Courier New", 16, "#ccc");
    this.instructionsfont = new me.Font("Courier New", 22, "#eee");
    this.titlefont = new me.Font("Courier New", 30, "#FFF");
  },

  draw : function (context) {
    context.fillStyle = "#101010";
    context.fillRect(0, 0, game.screen_width, game.screen_height);
    this.titlefont.draw (context, "Wow, you finished my demo!", 5, 5);
    //this.messagefont.draw (context, this.message, 5, 200);
    this.instructionsfont.draw (context, "But this story is not over, press (X) to", 5, 235);
    this.instructionsfont.draw (context, "find out how to follow and support", 5, 260);
    this.instructionsfont.draw (context, "my progress! Thanks for playing.", 5, 285);
  }
});
