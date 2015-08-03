x /* Game namespace */
var game = {

    screen_width: 576,
    screen_height: 324,

    // an object where to store game information
    data : {
        // score
        score : 0
    },

    games: [],

    game_info_object : {
        load_slot: "", //the current load slot
        last_save: "lst!", //timestamp of the last time this game was last saved
        play_time: 0, //how long the player has been playing, in seconds
        score: 0,
        overworld: {map: "farm", location: "10, 10"},
        puzzle: {completed: {}},
        events: {},
        ability: {  waterproof: 0,  //is the player water proof (0: player is affected normally, 1: low pressure does nothing super pressure pushes back, 2: no affect)
            pieces: 0,              //how many pieces of pipe you have
            torque: 4,              //how fast you can turn pipes
            stealth: [0, 0, 0],     //how long before the timer starts 0: wrench, 1: suit, 2: shoes
            velocity: 8             //how fast the player moves
        },
        inventory: {
            //these contain references to the actual items
            equipped: {wrench: {}, suit: {}, shoes: {}},
            //a key-value group of opened treasure chests and gates
            opened: {},
            //All the inventory items in the game
            inventory_array: [
            {name: "Wooden Wrench", type: "wrench", subtype: "wood", image: "itemwoodwrench", torque: 6, stealth: 0, equipable: true, description: "A fragile, heirloom wooden wrench."},
            {name: "Iron Wrench", type: "wrench", subtype: "iron", image: "itemironwrench", torque: 3, stealth: 2, equipable: true, description: "A heavy and loud, but sturdy iron wrench"},
            {name: "Plastic Wrench", type: "wrench", subtype: "plastic", image: "itemplasticwrench", torque: 2, stealth: 15, equipable: true, description: "A 3d printed plastic polymer wrench"},
            {name: "Carbon Fiber Wrench", type: "wrench", subtype: "carbon", image: "itemcarbonwrench", torque: 1, stealth: 20, equipable: true, description: "A quiet, light and fast wrench"},
            {name: "Nanobot Wrench", type: "wrench", subtype: "nano", image: "itemnanowrench", torque: 0, stealth: 30, equipable: true, description: "A nanobot powered super wrench"},
            {name: "Black Cotton", type: "suit", subtype: "cotton", image: "itemcottonsuit", suitimage: "maincharcotton", stealth: 5, equipable: true, description: "An itchy old black outfit"},
            {name: "Shinobi Shozoku", type: "suit", subtype: "ninja", image: "itemninjasuit", suitimage: "maincharninja", stealth: 30, equipable: true, description: "A ninja's stealthy apparel"},
            {name: "Nano Suit", type: "suit", subtype: "nano", image: "itemnanosuit", suitimage: "maincharnano", stealth: 60, equipable: true, description: "A nanobot powered suit of armor"},
            {name: "Flip Flops", type: "shoes", subtype: "flip", image: "itemflipshoes", stealth: 0, speed: 0, equipable: true, description: "Noisey and slow but comfortable"},
            {name: "Tabi Boots", type: "shoes", subtype: "tabi", image: "itemtabishoes", stealth: 10, speed: 3, equipable: true, description: "Split toed ninja shoes"},
            {name: "Nano Boots", type: "shoes", subtype: "nano", image: "itemnanoshoes", stealth: 20, speed: 4, equipable: true, description: "Nanobot powered kicks"},
            {name: "Pipe Bender", type: "tool", subtype: "bender", image: "itempipebender", equipable: false, description: "A tool that will bend pipes"},
            {name: "Pipe Jig", type: "tool", subtype: "jig", image: "itempipejig", equipable: false, description: "A pipe holder that will help you weld T-shaped pipes"},
            {name: "Pipe Dual-Jig", type: "tool", subtype: "dualjig", image: "itemdualjig", equipable: false, description: "A pipe holder that will help you weld Cross-shaped pipes"},
            {name: "Town Meeting", type: "event"}
        ]}
    },

    // Run on page load.
    "onload" : function () {

        this.blank_game_info_object = JSON.parse(JSON.stringify(this.game_info_object));

        me.sys.fps = 30;
        me.sys.pauseOnBlur = false;

        // Initialize the video.
        if (!me.video.init("screen", this.screen_width, this.screen_height, true, "auto", true)) {
        alert("Your browser does not support HTML5 canvas.");
            return;
        }

        // add "#debug" to the URL to enable the debug Panel
        if (document.location.hash === "#debug") {
            window.onReady(function () {
                //me.plugin.register.defer(debugPanel, "debug");
                me.plugin.register(debugPanel, "debug");
            });
        }

        var STATE_PUZZLE = me.state.USER + 0;

        // Initialize the audio.
        me.audio.init("ogg");

        //Temporarily MUTE all audio for development ::REMOVE ME::
        //me.audio.muteAll();

        // Set a callback to run when loading is complete.
        me.loader.onload = this.loaded.bind(this);

        // Load the resources.
        me.loader.preload(game.resources);

        // Initialize melonJS and display a loading screen.
        me.state.set(me.state.LOADING, new game.LoadingScreen());
        me.state.change(me.state.LOADING);

        //me.game.onLevelLoaded = this.mapSettings.bind(this);
        //load default game_info_object
        //game.game_info_object = {overworld: {map: "farm", music: "farm song", location: "32, 32"}, puzzle: {}, event: {}};

            //Create new class based on save game
    },

    // Run on game resources loaded.
    "loaded" : function () {
        me.state.set(me.state.READY, new game.TitleScreen());

        me.state.set(me.state.MENU, new game.LoadScreen());

        me.state.set(me.state.GAMEOVER, new game.DeathScreen());
    me.state.set(me.state.CREDITS, new game.CreditsScreen());

        game.puzzle = new game.PuzzleScreen();
        me.state.set(me.state.STATE_PUZZLE, game.puzzle);

        // add our player entity in the entity pool

        me.pool.register("mainPlayer", game.PlayerEntity);
        me.pool.register("npcEntity", game.npcEntity);
        me.pool.register("soccerEntity", game.soccerEntity);
        me.pool.register("propAnimation", game.propAnimation);
        me.pool.register("vehicleAnimation", game.vehicleAnimation);
        me.pool.register("npcAnimal", game.npcAnimal);
        me.pool.register("trashEntity", game.trashEntity);
        me.pool.register("gateEntity", game.gateEntity);
        me.pool.register("treasureChest", game.treasureChest);
        me.pool.register("waterSprayer", game.waterSprayer, true);
        me.pool.register("eventEntity", game.eventEntity);

        // enable the keyboard
        me.input.bindKey(me.input.KEY.X, "action", true);
        me.input.bindKey(me.input.KEY.Z, "alternate", true);
        me.input.bindKey(me.input.KEY.ENTER, "start", true);
        me.input.bindKey(me.input.KEY.C,     "test", true);
        //me.input.bindKey(me.input.KEY.LEFT,  "left");
        //me.input.bindKey(me.input.KEY.RIGHT, "right");
        //me.input.bindKey(me.input.KEY.UP, "up");
        //me.input.bindKey(me.input.KEY.DOWN, "down");

        //me.loader.onload = this.loaded.bind(this);

        me.game.world.sortOn = "y";

        // Start the game.
        game.play = new game.PlayScreen();
        me.state.set(me.state.PLAY, game.play);
        //me.state.change(me.state.STATE_PUZZLE);
        me.state.change(me.state.READY);
    }
    /*,

    "mapSettings" : function () {
        //me.game.onLevelLoaded = this.mapSettings.bind(this);
        game.PlayScreen.onLoadLevel();
    }*/
};

function RandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function RunFunction(name, context, arguments)
{
    var fn = context[name];
    if(typeof fn !== 'function')
        return;

    fn.apply(context, arguments);
}

function CheckInventory(item) {
    if(item) {

        if(item.indexOf(':') > -1) {

            var name = item.split(':')[1];

            switch(item.split(':')[0]) {
                case "item":
                    for (p = 0; p < game.game_info_object.inventory.inventory_array.length; p++)
                    {
                        if(game.game_info_object.inventory.inventory_array[p].name == name && game.game_info_object.inventory.inventory_array[p].owned)
                        {
                            return true;
                        }
                    }
                    break;
                case "event":
                    return game.game_info_object.events[name];
                    break;
                case "puzzle":
                    return game.game_info_object.puzzle.completed[name];
                    break;
                default:
                    return false;
                    break;
            }

        } else {

            for (p = 0; p < game.game_info_object.inventory.inventory_array.length; p++)
            {
                if(game.game_info_object.inventory.inventory_array[p].name == item && game.game_info_object.inventory.inventory_array[p].owned)
                {
                    return true;
                }
            }

        }
    } else {
        return true;
    }

    return false;
}

function AddInventory(item) {
    for (var i = 0; i < game.game_info_object.inventory.inventory_array.length; i++) {
            //lookup[array[i].id] = array[i];
            //Item Found
            if(game.game_info_object.inventory.inventory_array[i].name === item) {
                if(game.game_info_object.inventory.inventory_array[i].type === "tool") {
                    game.game_info_object.ability.pieces++;
                }
                game.game_info_object.inventory.inventory_array[i].owned = true;
            }
    }
}

function removeArrayValue(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}
