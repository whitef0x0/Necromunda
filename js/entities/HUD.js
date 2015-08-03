/**
 * a HUD container and child items
 */

game.HUD = game.HUD || {};


game.HUD.Container = me.ObjectContainer.extend({

    cinematic_bar_height: 32,

	init: function() {
		this.parent();
		this.isPersistent = true;
		this.collidable = false;
		this.z = Infinity;

		// give a name
		this.name = "HUD";

		this.addChild(new game.HUD.scoreItem(0, 0 ));
	},

	showMenu: function() {
		me.input.bindKey(me.input.KEY.LEFT,  "left", true);
		me.input.bindKey(me.input.KEY.RIGHT, "right", true);
		me.input.bindKey(me.input.KEY.UP, "up", true);
		me.input.bindKey(me.input.KEY.DOWN, "down", true);

		this.menu_container = new game.HUD.menuContainer();
		this.addChild(this.menu_container);
	},

	removeMenu: function() {
		me.input.bindKey(me.input.KEY.LEFT,  "left");
		me.input.bindKey(me.input.KEY.RIGHT, "right");
		me.input.bindKey(me.input.KEY.UP, "up");
		me.input.bindKey(me.input.KEY.DOWN, "down");

		this.removeChild(this.menu_container);
	},

    darken: function(portal) {
    	this.addChild(new game.HUD.nightCurtain(portal));
    },

    addTitle: function(title) {
    	this.maptitle = new game.HUD.mapTitle(title, this);
      this.addChild(this.maptitle);
    },

    removeTitleEarly: function() {
      if(this.maptitle) {
        this.maptitle.stopClock();
        this.removeChild(this.maptitle);
      }
    },

	//Cinematic bars
	showBars: function() {
		this.bars = true;
        this.firstbar = new game.HUD.cinematicBar(0, 0 - this.cinematic_bar_height, this.cinematic_bar_height, "down")
        this.addChild(this.firstbar);
        this.secondbar = new game.HUD.cinematicBar(0, game.screen_height, this.cinematic_bar_height, "up")
        this.addChild(this.secondbar);
	},

	hideBars: function() {
	    this.firstbar.hide(this);
	    this.secondbar.hide(this);
	    //game.play.HUD.setChildsProperty("foo", "test");
        //for(var b = 0; b <= bars.length - 1; b++) {
        //    bars[b].hide();
        //}
	},

	killBars: function() {
		this.firstbar.kill(this);
		this.secondbar.kill(this);
	},

	dialogue: function(message_script, npc, y_offset) {
    game.player.busy = true;
		game.player.vel.x = 0;
		game.player.vel.y = 0;

		this.background_dg = new game.HUD.backgroundBox(y_offset);
		this.icons_dg = new game.HUD.icons();
		this.text_dg = new game.HUD.textManipulator(message_script, npc, y_offset);
		this.addChild(this.text_dg);
		this.addChild(this.icons_dg);
		this.addChild(this.background_dg);
	},

	setIcon: function(iconname) {
	    this.icons_dg.setCurrentAnimation(iconname);
	},

	removeDialogue: function() {
        this.removeChild(this.background_dg);
        this.removeChild(this.icons_dg);
        this.removeChild(this.text_dg);
	},

	cellDialogue: function(message, caller, npc) {
		game.player.busy = true;
    me.audio.play("ringtone_sfx");

		this.cell_background_dg = new game.HUD.phoneBackgroundBox();
		this.bubble_dg = new game.HUD.phoneBubbleBox();
		this.cell_text_dg = new game.HUD.phoneText(message, caller, npc);
		this.addChild(this.cell_background_dg);

		var tween = new me.Tween(this.cell_background_dg.pos).to({y: 10}, 1000).onComplete((function(){
			//::SOUND:: cellphone sound
			this.addChild(this.cell_text_dg);
			this.moveUp(this.cell_text_dg);
			this.addChild(this.bubble_dg);
			this.moveUp(this.bubble_dg);
		}).bind(this));
		tween.easing(me.Tween.Easing.Quintic.Out);
		tween.start();
	},

	removeCellDialogue: function() {
		this.removeChild(this.cell_text_dg);
		this.removeChild(this.bubble_dg);

		var tween = new me.Tween(this.cell_background_dg.pos).to({y: game.screen_height + 1}, 1000).onComplete((function(){
				this.removeChild(this.cell_background_dg);
		}).bind(this));
		tween.easing(me.Tween.Easing.Quintic.Out);
		tween.start();
	},

});

////////////MAIN MENU//////////////////////////////////

game.HUD.menuContainer = me.ObjectContainer.extend({
	menu_items: ["Inventory", "Map", "Save"],
	line_height: 40,
	x: 50,
	y: 10,
	on_main_menu: true,
	index: 0,

	init: function() {
		this.parent();
		this.isPersistent = true;
		this.collidable = false;


		this.positions = this.menu_items.length - 1;

		this.selector_ball = new game.HUD.selectorBall(0, this.x - 45, this.y, this.line_height, this);
		//this.selector_ball = new game.HUD.selectorBallPrimary(this.menu_items.length, this.line_height, this.y_offset);
		this.addChild(this.selector_ball);
		//game.play.HUD.addChild(this.selector_ball, Infinity);
		this.addChild(new game.HUD.menuText(this.menu_items, this.x, this.y, this.line_height));
		this.addChild(new game.HUD.menuBackground());

		this.openSubMenu(this.index);
	},

	update : function (delta) {
        if (me.input.isKeyPressed('start')) {
            game.play.HUD.removeMenu();
            game.player.busy = false;
        }

        if ((me.input.isKeyPressed('left') || me.input.isKeyPressed('right')) && this.currentSubMenu.interactive)  {
        	this.on_main_menu = !this.on_main_menu;
        	if(!this.on_main_menu) {
				//notify submenu that it has just been 'selected'
				if(this.currentSubMenu.focus) {
					this.currentSubMenu.focus();
				}
        	} else {
				//notify submenu that it has just been 'deselected'
				if(this.currentSubMenu.blur) {
					this.currentSubMenu.blur();
				}
        	}
        }

        if (me.input.isKeyPressed('up')) {
			if(this.on_main_menu) {
				//::SOUND:: main menu select noise
				me.audio.play("menuup_sfx");
				this.selectUp()
				this.openSubMenu(this.index);
			} else {
				this.currentSubMenu.selectUp();
			}
		} else if (me.input.isKeyPressed('down')) {
			if(this.on_main_menu) {
				//::SOUND:: main menu select noise
				me.audio.play("menudown_sfx");
				this.selectDown()
				this.openSubMenu(this.index);
			} else {
				this.currentSubMenu.selectDown();
			}
		}

		if (me.input.isKeyPressed('action') && !this.on_main_menu) {
			if(this.currentSubMenu.yesAction) this.currentSubMenu.yesAction();
		}

		if (me.input.isKeyPressed('alternate') && !this.on_main_menu) {
			if(this.currentSubMenu.noAction) this.currentSubMenu.noAction();
		}

        this.parent(delta);
		return true;
	},

	selectUp: function() {
		this.index--;
		if(this.index < 0) {
			this.index = this.positions;
		}
		this.selector_ball.moveBall(this.index);
	},

	selectDown: function() {
		this.index++;
		if(this.index > this.positions) {
			this.index = 0;
		}
		this.selector_ball.moveBall(this.index);
	},

	openSubMenu: function(index) {
		if(this.currentSubMenu) { this.removeChild(this.currentSubMenu); }
		this.currentSubMenu = new game.HUD["subMenuContainer" + this.menu_items[index]];
		this.addChild(this.currentSubMenu);
		this.moveUp(this.currentSubMenu);
	}

});

game.HUD.menuBackground = me.SpriteObject.extend({
	init: function() {
		this.floating = true;
		this.parent( 0, 0, me.loader.getImage("menubg"), game.screen_width, game.screen_height);
	}
});

game.HUD.menuText = me.Renderable.extend({
	init: function(menu_items, x, y, line_height) {
		this.x = x;
		this.y = y;
		this.menu_items = menu_items;
		this.line_height = line_height;
		// call the parent constructor
		this.floating = true;
		this.parent(new me.Vector2d(0, 0), game.screen_width, game.screen_height);
		this.menu_item_font = new me.Font("Courier New", 26, "#eee");
		//this.item_font = new me.Font("Courier New", 26, "#111");
	},

	/**
	 * update function
	 */
	update : function () {
		this.parent();
		return true;
	},

	draw : function (context) {
		//var text_x = 50;
		//var text_y = line_spacing = 40;
		var new_y = this.y;

		for (var i = 0; i <= this.menu_items.length - 1; i++)
		{
			this.menu_item_font.draw (context, this.menu_items[i] || "", this.x, new_y += this.line_height);
		}
	}
});

game.HUD.selectorBall = me.AnimationSheet.extend({

	init: function(heirarchy, x, y, line_height) {
		this.index = 0;
		this.heirarchy = heirarchy;
		this.line_height = line_height;
		this.floating = true;
		this.y = y;
		this.local_offset = 0;
		var image = "selectorball" + heirarchy.toString();
		this.parent( x, y + line_height, me.loader.getImage(image), 32, 32);

		this.addAnimation("pulse", [0, 0, 1, 2, 3, 2, 1], 130);
        this.setCurrentAnimation("pulse");
        this.old_pulsing = false;
        //this.animationpause = false;
	},

	update: function(delta){
		//if my menu is selected, animate!
		if(game.play.HUD.menu_container.on_main_menu == !this.heirarchy) {
			this.pulsing = true;
			//if the difference checker has had a chance to run, call the parent so the orb animation updates
			if(this.pulsing == this.old_pulsing) {
				this.parent(delta);
				return true;
			}
		} else {
			//My menu is not selected so don't update
			this.pulsing = false;
		}

		//if the other menu is now active, put myself back to frame one
		if(this.pulsing !== this.old_pulsing) {
			if(this.pulsing) { this.setAnimationFrame(3); } else { this.setAnimationFrame(0); }
			this.old_pulsing = this.pulsing;
			this.parent(delta);
			return true;
		}
	},

	//'error' type animation, or when ball reaches last spot
	endAnimation: function(direction) {
		var movement_amount = 20;
		switch(direction) {
			case 0:
				tween_target = {y: [this.pos.y - movement_amount, this.pos.y]};
				break;
			case 1:
				tween_target = {x: [this.pos.x + movement_amount, this.pos.x]};
				break;
			case 2:
				tween_target = {y: [this.pos.y + movement_amount, this.pos.y]};
				break;
			case 3:
				tween_target = {x: [this.pos.x - movement_amount, this.pos.x]};
				break;
		}

		tween = new me.Tween(this.pos).to(tween_target, 100);
		tween.easing(me.Tween.Easing.Bounce.Out);
		tween.start();
	},

	moveBall: function(index) {
		this.pos.y = (this.line_height + this.y + this.local_offset) + (this.line_height * index);
	},
});

/////////////SUB MENU's////////////////////////////

////////////////////
//INVENTORY/////////
////////////////////

game.HUD.subMenuContainerInventory = me.ObjectContainer.extend({
	interactive: true,
	index: 0,
	index_offset: 0,
	x: 310,
	y: 100,
	line_spacing: 32,
	positions: 5,

	init: function() {
		this.parent();
		//this.isPersistent = true;
		this.collidable = false;
		//this.floating = true;

		this.inventory_thumbs = [];
		this.currentInventory = [];
		this.equipped_thumbs = [];
		this.status_indicators = [];

		//build an array for the inventory thumbnails
		var new_y = this.y;
		for (var i = 0; i < 6; i++)
		{
			var thumb = new me.SpriteObject(this.x - 36, (new_y += this.line_spacing) - 7, me.loader.getImage("itemempty"));
			thumb.floating = true;
			this.inventory_thumbs[i] = thumb;
			this.addChild(thumb);
		}

		//build an array of equipped icons
		this.equipped_icons = [];
		//var eicon = new me.SpriteObject(this.x - 36, -1000, me.loader.getImage("equippedicon"));
		for(var i = 0; i < 3; i++)
		{
			this.equipped_icons[i] = new me.SpriteObject(this.x + 210, -1000, me.loader.getImage("equippedicon"));
			this.equipped_icons[i].floating = true;
			this.addChild(this.equipped_icons[i]);
		}

		//build an array with two status indicators
		for(var i = 0; i < 2; i++)
		{
			this.status_indicators[i] = new me.AnimationSheet(this.x + 80 + (i*125), 30, me.loader.getImage("statusindicators"), 32, 32);
			this.status_indicators[i].floating = true;
			this.addChild(this.status_indicators[i]);
			this.status_indicators[i].animationpause = true;
			this.status_indicators[i].setAnimationFrame(3);
		}

		//build array with only available/owned inventory items in it
		this.inventory_only_owned = [];
		for(var i = 0; i <= game.game_info_object.inventory.inventory_array.length - 1; i++) {
			if(game.game_info_object.inventory.inventory_array[i].owned && game.game_info_object.inventory.inventory_array[i].type !== "event") this.inventory_only_owned.push(game.game_info_object.inventory.inventory_array[i]);
		}

		this.selector_ball = new game.HUD.selectorBall(1, this.x - 75, this.y - 8, this.line_spacing);
		this.inventory_text = new game.HUD.inventoryText(this.inventory_thumbs, this.x, this.y, this.line_spacing, this.status_indicators, this.equipped_icons);
		this.addChild(this.inventory_text);
		this.addChild(this.selector_ball);

		//set the initial text
		this.inventory_text.setText(this.index_offset, this.inventory_only_owned);

		//update the description
		if(this.inventory_only_owned[this.index * 6] != undefined) {
			this.inventory_text.updateDescription(this.inventory_only_owned[this.index + this.index_offset * 6]);
		}
	},

	yesAction: function() {

		//Equip item if 'equipabble'
		if(this.inventory_only_owned[this.index + this.index_offset * 6].equipable) {
			switch(this.inventory_only_owned[this.index + this.index_offset * 6].type) {
				case "wrench":
					game.game_info_object.inventory.equipped.wrench = this.inventory_only_owned[this.index + this.index_offset * 6];
					game.game_info_object.ability.stealth[0] = this.inventory_only_owned[this.index + this.index_offset * 6].stealth;
					game.game_info_object.ability.torque = this.inventory_only_owned[this.index + this.index_offset * 6].torque;
					this.equipped_icons[0].pos.y = this.selector_ball.pos.y + 7;
					break;
				case "suit":
					game.game_info_object.inventory.equipped.suit = this.inventory_only_owned[this.index + this.index_offset * 6];
					game.game_info_object.ability.stealth[1] = this.inventory_only_owned[this.index + this.index_offset * 6].stealth;
					this.equipped_icons[1].pos.y = this.selector_ball.pos.y + 7;
					break;
				case "shoes":
					game.game_info_object.inventory.equipped.shoes = this.inventory_only_owned[this.index + this.index_offset * 6];
					game.game_info_object.ability.velocity = this.inventory_only_owned[this.index + this.index_offset * 6].speed;
					game.game_info_object.ability.stealth[2] = this.inventory_only_owned[this.index + this.index_offset * 6].stealth;
					this.equipped_icons[2].pos.y = this.selector_ball.pos.y + 7;
					break;
			}
		}
	},

	selectUp: function() {
		this.index--;
		if(this.index < 0 && this.index_offset === 0) {
			//::SOUND:: error type sound
			me.audio.play("menuerror2_sfx");
			this.selector_ball.endAnimation(0);
			this.index++;
		} else if(this.index < 0) {
			this.index = this.positions;
			this.index_offset--;
			this.inventory_text.setText(this.index_offset, this.inventory_only_owned);
		}

		//update the description
		if(this.inventory_only_owned[this.index + this.index_offset * 6] != undefined) {
			this.inventory_text.updateDescription(this.inventory_only_owned[this.index + this.index_offset * 6]);
		}

		//::SOUND:: secondary menu select noise
		me.audio.play("menuup_sfx");
		this.selector_ball.moveBall(this.index);

		//show comparison
	},

	selectDown: function() {
		if(this.inventory_only_owned[(this.index + 1) + this.index_offset * 6]) {
			//::SOUND:: secondary menu select noise
			me.audio.play("menudown_sfx");
			this.index++;
			if(this.index > this.positions) {
				this.index = 0;
				this.index_offset++;
				this.inventory_text.setText(this.index_offset, this.inventory_only_owned);
			}
			this.selector_ball.moveBall(this.index);

			//update the description
			this.inventory_text.updateDescription(this.inventory_only_owned[this.index + this.index_offset * 6]);
		} else {
			//::SOUND:: error type sound
			me.audio.play("menuerror2_sfx");
			this.selector_ball.endAnimation(2);
		}

	},

});

game.HUD.inventoryText = me.Renderable.extend({
	init: function(thumbs, x, y, line_spacing, status_indicators, equips) {
		//this.index = index;
		//this.index_offset = index_offset;
		this.x = x;
		this.y = y;
		this.line_spacing = line_spacing;
		this.thumbs = thumbs;
		this.equips = equips;
		this.status_indicators = status_indicators;

		var item_description = "";
		this.item_description = "";
		this.stealth_text = "";
		this.stealth_value = "";
		this.extra_text = "";
		this.extra_value = "";

		// call the parent constructor
		this.parent(new me.Vector2d(0, 0), game.screen_width, game.screen_height);
		this.inventory_item_font = new me.Font("Courier New", 16, "#222");
		this.inventory_description_font = new me.Font("Courier New", 12, "#222");
		//this.item_font = new me.Font("Courier New", 26, "#111");
		this.floating = true;

		//this.setText(0, 0); //index_offset);
	},

	setText: function(index_offset, inventory_array) {

		this.inventory_items = inventory_array.slice(index_offset * 6, index_offset * 6 + 6);
		var equipped_numbers = {"wrench": 0, "suit": 1, "shoes": 2};

		//set the image for the 6 item slots or put a blank image if we're at the end of the list and it isnt' full
		for (var i = 0; i <= 6 - 1; i++)
		{
			if(inventory_array[ 6 * index_offset + i]) {
				if(game.game_info_object.inventory.equipped.wrench.name == inventory_array[i].name){
					this.equips[equipped_numbers[inventory_array[i].type]].pos.y = this.thumbs[i].pos.y + 7;
				}
				this.thumbs[i].init(this.thumbs[i].pos.x, this.thumbs[i].pos.y, me.loader.getImage(inventory_array[ 6 * index_offset + i].image), 32, 32);
				//this.thumbs[i].init(this.thumbs[i].pos.x, this.thumbs[i].pos.y, me.loader.getImage("itemwoodwrench"), 32, 32);
			} else {
				this.thumbs[i].init(this.thumbs[i].pos.x, this.thumbs[i].pos.y, me.loader.getImage("itemempty"), 32, 32);
			}
		}

	},

	updateDescription: function(item) {
		this.item_description = Truncate(item.description, 37);
    //var item_description = "";
		//this.item_description = "";
		switch(item.type) {
			case "wrench":
				this.status_indicators[0].setAnimationFrame( this.itemCompare(item, "stealth") );
				this.stealth_text = "Stealth";
				this.stealth_value = item.stealth;
				this.status_indicators[1].setAnimationFrame( this.itemCompare(item, "torque", true) );
				this.extra_text = "Torque";
				this.extra_value = item.torque;
				break;
			case "suit":
				this.status_indicators[0].setAnimationFrame( this.itemCompare(item, "stealth") );
				this.stealth_text = "Stealth";
				this.stealth_value = item.stealth;
				this.status_indicators[1].setAnimationFrame( this.itemCompare(item, "water") );
				this.extra_text = "Water";
				this.extra_value = "";
				break;
			case "shoes":
				this.status_indicators[0].setAnimationFrame( this.itemCompare(item, "stealth") );
				this.stealth_text = "Stealth";
				this.stealth_value = item.stealth;
				this.status_indicators[1].setAnimationFrame( this.itemCompare(item, "speed") );
				this.extra_text = "Speed";
				this.extra_value = item.speed;
				break;
			case "tool":
				this.status_indicators[0].setAnimationFrame(3);
				this.status_indicators[1].setAnimationFrame(3);
				this.stealth_text = "";
				this.stealth_value = "";
				this.extra_text = "";
				this.extra_value = "";
				break;
		}

	},

	itemCompare : function(item, comparator, desc) {
		if (!(comparator in game.game_info_object.inventory.equipped[item.type])) {
			return 3;
		} else if(item[comparator] > game.game_info_object.inventory.equipped[item.type][comparator]) {
			return (desc) ? 1 : 0;
		} else if (item[comparator] < game.game_info_object.inventory.equipped[item.type][comparator]) {
			return (desc) ? 0 : 1;
		} else if (item[comparator] == game.game_info_object.inventory.equipped[item.type][comparator]) {
			return 2;
		}
	},

	draw : function (context) {
		// the current item description
		if(this.item_description[0]) this.inventory_description_font.draw (context, this.item_description[0], this.x - 30, 70);
		if(this.item_description[1]) this.inventory_description_font.draw (context, this.item_description[1], this.x - 30, 85);
		this.inventory_item_font.draw (context, this.stealth_text, this.x - 30, 40);
		this.inventory_item_font.draw (context, this.stealth_value, this.x + 50, 40);
		this.inventory_item_font.draw (context, this.extra_text, this.x + 120, 40);
		this.inventory_item_font.draw (context, this.extra_value, this.x + 185, 40);

		//loop and display partial item list (paginated)
		var new_y = this.y;
		for (var i = 0; i <= 6 - 1; i++)
		{
			if(this.inventory_items[i]) this.inventory_item_font.draw (context, this.inventory_items[i].name, this.x, new_y += this.line_spacing);
		}
	}
});

////////////////////
//MAP/////////
////////////////////

game.HUD.subMenuContainerMap = me.ObjectContainer.extend({
	interactive: false,
	x: 230,
	y: 50,

	init: function() {
		this.parent();
		//this.isPersistent = true;
		this.collidable = false;

		this.addChild(new game.HUD.map(this.x, this.y));
	},
});

game.HUD.map = me.Renderable.extend({
	scale: 4,
	floating: true,
	camX_limit: 83,
	camY_limit: 64,
	x_cam: 20,
	y_cam: 20,

	init: function(x, y) {
    this.font = new me.Font("Courier New", 12, "#777");
    this.fontsmaller = new me.Font("Courier New", 10, "#777");
    this.x_limit = (game.screen_width/32) * 4;
    this.y_limit = (game.screen_height/32) * 4;

		this.x = x;
		this.y = y;
		this.parent(new me.Vector2d(x, y), 200, 200);
		//this.floating = true;
		this.collision_layer = me.game.currentLevel.getLayerByName("collision");
		map_width = this.collision_layer.layerData.length - 1;
		map_height = this.collision_layer.layerData[0].length - 1;
		max_scroll_x = map_width - this.x_limit;
		max_scroll_y = map_height - this.y_limit;
		playerPos = this.coordinateToScale(game.player.pos);

    this.camX = ~~this.clamp((~~playerPos.x/32)*4, 0, max_scroll_x);
    this.camY = ~~this.clamp((~~playerPos.y/32)*4, 0, max_scroll_y);
	},

	//scale in-game entity to map-sized coordinates
	coordinateToScale: function(pos){
		return {x: Math.ceil(pos.x / (this.scale * 2)), y: Math.ceil(pos.y / (this.scale * 2))};
	},

	clamp: function(value, min, max){
		if(value < min) return min;
		else if(value > max) return max;
		return value;
	},

	draw: function(context){
    this.font.draw (context, "Local Map - Legend: ", 230, 2);
    this.fontsmaller.draw (context, "(You are RED)", 230, 15);
    this.fontsmaller.draw (context, "(Pipes are BLUE)", 230, 25);
    this.fontsmaller.draw (context, "(Doors are white, where you can go through)", 230, 35);

		context.fillStyle = 'green';
		context.fillRect(this.x, this.y, 336, 260);

		//this.collision_layer.layerData.length - 1
		//this.collision_layer.layerData[c].length - 1
    	//Paint the walls
		for (var c = 0; c <= this.camX_limit; c++)
		{
				for (var r = 0; r <= this.camY_limit; r++){
					if(this.collision_layer.layerData[c+this.camX] && this.collision_layer.layerData[c+this.camX][r+this.camY] && this.collision_layer.layerData[c+this.camX][r+this.camY] != null) {
						context.fillStyle = 'black';
			    		context.fillRect(this.x + (c * this.scale), this.y + (r * this.scale), this.scale, this.scale);
					}
				}
		}

		//Paint the player
		context.fillStyle = 'red';
		var playerPos = this.coordinateToScale(game.player.pos);
    	context.fillRect(this.x + playerPos.x - (this.camX*4), this.y + playerPos.y - 1 - (this.camY*4), 2, 4);

    	//Paint Entity's
    	for (var t = 0; t <= me.game.world.children.length - 1; t++) {
    		//Paint the trash portals
    		if(me.game.world.children[t].name === "trashentity" && !me.game.world.children[t].completed) {

				context.fillStyle = 'blue';
				var trashPos = this.coordinateToScale(me.game.world.children[t].pos);
				if(this.coordinateInsideBounds(trashPos)) context.fillRect(this.x + trashPos.x - (this.camX*4), this.y + trashPos.y - (this.camY*4), 2, 2);
    		}

    		//paints the exits
			if(me.game.world.children[t].name === "me.levelentity") {

				context.fillStyle = 'white';
				var doorPos = this.coordinateToScale(me.game.world.children[t].pos);
				if(this.coordinateInsideBounds(doorPos)) context.fillRect(this.x + doorPos.x - (this.camX*4), this.y + doorPos.y - (this.camY*4), (me.game.world.children[t].width/32)*4, (me.game.world.children[t].height/32)*4);
    		}
    	}
	},

  coordinateInsideBounds: function(position) {
    return (position.x > this.camX*4 &&
            position.x < this.camX*4 + this.camX_limit*4 &&
            position.y > this.camY*4 &&
            position.y < this.camY*4 + this.camY_limit*4);
  }

});

////////////////////
//SAVE/////////
////////////////////

game.HUD.subMenuContainerSave = me.ObjectContainer.extend({
	init: function() {
		this.parent();
		//this.isPersistent = true;
		this.collidable = false;
		this.interactive = true;

		game.game_info_object.last_save = new Date();
		this.save_load_widget = new game.saveLoadWidget(300, 5, false, 0, true);
		this.addChild(this.save_load_widget);

		this.selector_ball = new game.HUD.selectorBall(1, 255, 14, 64);
		this.addChild(this.selector_ball);

    this.save_check = new game.HUD.saveCheck(this, 346);
    this.addChild(this.save_check);
	},

	focus: function() {
		this.save_load_widget.marker = 0;
		this.save_load_widget.animate();
		this.selector_ball.moveBall(0);
	},

	blur: function() {
		this.save_load_widget.pause();
	},

	selectUp: function() {
		//::SOUND:: secondary menu select noise
		me.audio.play("menuup_sfx");
		this.selector_ball.moveBall( this.save_load_widget.selectUp() );
	},

	selectDown: function() {
		//::SOUND:: secondary menu select noise
		me.audio.play("menudown_sfx");
		this.selector_ball.moveBall( this.save_load_widget.selectDown() );
	},

  saveGame: function() {
    game.games[this.save_load_widget.marker] = game.game_info_object;

    console.log(game.games);

    me.save.games = JSON.parse(JSON.stringify(game.games));
    me.save.lastmarker = this.save_load_widget.marker;


    //play succesful save noise
    me.audio.play("saved_sfx");
    //exit
    game.play.HUD.removeMenu();
    game.player.busy = false;
  },

	yesAction: function() {
    //while()
		game.game_info_object.overworld.location = game.player.pos.x + "," + game.player.pos.y;

    this.save_check.y = this.selector_ball.pos.y + 28;

      //always true, check if timestamp in object has time?
    if(game.games[this.save_load_widget.marker] && game.games[this.save_load_widget.marker].last_save !== undefined) {
      this.save_check.overwriting = true;
    } else {
        this.saveGame();
    }
	},

  noAction: function() {
    this.save_check.quitting = true;
  }
});

game.HUD.saveCheck = me.Renderable.extend({
  init: function(contain, x) {
    this.contain = contain;
    this.overwriting = false;
    this.overwriting_timer = 0;

    this.quitting = false;
    this.quitting_timer = 0;

    this.x = x;

    this.parent(new me.Vector2d(0, 0), game.screen_width, game.screen_height);
    this.floating = true;
    this.font = new me.Font("Courier New", 12, "#777");
  },

  update: function(delta) {
    if(this.overwriting) {
      if(me.input.keyStatus('action')) {
        this.overwriting_timer += me.timer.tick;
      } else {
        this.overwriting_timer = 0;
        this.overwriting = false;
      }
    }

    if(this.overwriting_timer >= 30) {
      this.overwriting_timer = 0;
      this.overwriting = false;

      this.contain.saveGame();
    }

    if(this.quitting) {
      if(me.input.keyStatus('alternate')) {
        this.quitting_timer += me.timer.tick;
      } else {
        this.quitting_timer = 0;
        this.quitting = false;
      }
    }

    if(this.quitting_timer >= 30) {
      this.quitting_timer = 0;
      this.quitting = false;

      //quit to title
      me.state.change(me.state.READY);
    }

    this.parent(delta);
    return true;
  },

  draw: function(context) {
    this.font.draw (context, "Hold (X) to save and Hold (Z) to quit", 260, 5);

    percent = (this.overwriting_timer / 30) * 100;
    bar = percent * 2.2;

    context.fillStyle = ColorLuminance("#110000", percent / 10);
    context.fillRect(this.x, this.y, bar, 5);
    if(this.overwriting_timer > 0) this.font.draw (context, "Overwriting...", 260, 20);

    quit_percent = (this.quitting_timer / 30) * 100;
    quit_bar = quit_percent * 2.4;

    context.fillStyle = ColorLuminance("#110000", quit_percent / 10);
    context.fillRect(225, 70, 10, quit_bar);
    if(this.quitting_timer > 0) this.font.draw (context, "Quitting...", 260, 20);
  }

});

//////////////MENU END//////////////////////////////////


game.HUD.nightCurtain = me.Renderable.extend({
    timer: 0,
    fade_complete: false,
    color_alpha: 0,
    max_alpha: 0.7,
    color: "rgba(0,0,0,0)",

	init: function(portal) {
		this.portal = portal;
		this.font = new me.Font("Courier New", 22, "#eee");
		this.night_message = "";
		this.floating = true;
		this.parent(new me.Vector2d(0, 0), game.screen_width, game.screen_height);
	},

	draw : function (context) {
		context.fillStyle = this.color;
		context.fillRect(0, 0, game.screen_width, game.screen_height);
		this.font.draw (context, this.night_message, 200, 100);
	},

    update: function(delta) {
		if(this.color_alpha >= this.max_alpha && !this.fade_complete) {
			this.fadeComplete();
		} else if (!this.fade_complete) {
			this.timer += me.timer.tick;
		}

		if(this.timer >= 5) {
			this.color_alpha += 0.05;
			this.color = "rgba(0,0,0," + this.color_alpha + ")";
			this.timer = 0;
		}

		this.parent(delta);
		return true;
    },

    fadeComplete: function() {
		//when finished
        this.fade_complete = true;

		this.night_message = "Darkness falls...";
		//::SOUND:: (nightfall) break glass noise
		setTimeout((function(){
			this.portal.startPuzzle();

		}).bind(this), 3000);
		//me.state.change(me.state.STATE_PUZZLE);
		//game.play.HUD.removeChild(this);
		//this.portal.startPuzzle();
    }

});

game.HUD.cinematicBar = me.Renderable.extend({

    init: function(x, y, height, direction) {
		this.start_y = y;
		this.height = height;
		this.width = game.screen_width;
		this.color = "rgba(0, 0, 0, 0.5)";
		this.name = "cbar";
		this.floating = true;
		this.parent(new me.Vector2d(x, y), game.screen_width, height);
		this.offset = (direction == "up") ? (-1 * this.height) : this.height;

		this.show();
    },

    update : function () {
        return true;
    },

	draw : function (context) {
		context.fillStyle = this.color;
		context.fillRect(this.pos.x, this.pos.y, this.width, this.height);
	},

    show: function() {
        var tween = new me.Tween(this.pos).to({y: this.start_y + this.offset}, 300);
        tween.easing(me.Tween.Easing.Sinusoidal.Out);
        tween.start();
    },

	hide: function(hud_object) {
		var tween = new me.Tween(this.pos).to({y: this.start_y}, 300).onComplete((function(){
			hud_object.removeChild(this);
		}).bind(this));
		tween.easing(me.Tween.Easing.Sinusoidal.Out);
		tween.start();
	},

	kill: function(hud_object) {
		hud_object.removeChild(this);
	}
});

/**
 * a basic HUD item to display score
 */
game.HUD.scoreItem = me.Renderable.extend({

        /**
         * constructor
         */
        init: function(x, y) {

                // call the parent constructor
                // (size does not matter here)
                this.parent(new me.Vector2d(x, y), 10, 10);

                // local copy of the global score
                this.score = -1;

                // make sure we use screen coordinates
                this.floating = true;
        },

        /**
         * update function
         */
        update : function () {
                // we don't do anything fancy here, so just
                // return true if the score has been updated
                /*if (this.score !== game.data.score) {
                        this.score = game.data.score;
                        return true;
                }*/
                return true;
        },

        /**
         * draw the score
         */
        draw : function (context) {
                // draw it baby !
        }

});

/**
 * the dialogue box
 */
game.HUD.textManipulator = me.Renderable.extend({

    name: "textlines",
	/**
	 * constructor
	 */
	init: function(message_script, npc, y_offset) {

        this.y_offset = y_offset || 0;
		this.npc = npc;
		// call the parent constructor
		// (size does not matter here)
		//this.parent(new me.Vector2d(Math.ceil((game.screen_width / 2) - (545 / 2)) + 20 + y_offset, 20), 545, 88);
		this.parent(new me.Vector2d(0, 0), game.screen_width, game.screen_height);
		//this.font = new me.BitmapFont("32x32_font", 32);
		this.font = new me.Font("Courier New", 16, "#eee");
		this.font2 = new me.Font("Courier New", 16, "#e00");
		// local copy of the global score
		//this.speaker = "Betty";
		this.message_script = message_script; //{"verses":[{"item":"stealth shoe","speech":["My god damn hovercraft is FULL of eels!","I don't know how to respond to that. You're either drunk or insane and it seems like either way it'd be a good idea to leave your home.","Shoelaces are like feet snakes."],"speakers":["Bessy","player","Bessy"]},{"speech":["Hi, Bessy. Feeling any better?","Chicken is like the sasquatch of the sea.","OK, got it."],"speakers":["player","Bessy","player"]}]};

        this.dialogue_que = [];

		// make sure we use screen coordinates
		this.floating = true;

		//fill the dialogue que
		this.processScript();
		this.nextSpeechBlock();
	},

    finishDialogue: function() {
      game.play.HUD.removeDialogue();
      this.npc.doneTalking();
    },

    nextSpeechBlock: function() {
        //if dialogue que is empty, run process script for next go around
        if(this.dialogue_que.length <= 0) {
            //this.processScript();
            this.finishDialogue();
        } else {
            //pop from the dialogue que (or unshift?)
            var speech_block = this.dialogue_que.shift();
            //draw to the bubble
            this.line1 = speech_block.message_array[0];
            this.line2 = (speech_block.message_array[1]) ? speech_block.message_array[1] : "";
            this.line3 = (speech_block.message_array[2]) ? speech_block.message_array[2] : "";

            this.setIcon(speech_block.icon);
            //if(speech_block.message_array[1]) { this.line2 = speech_block.message_array[1]; } else { this.line2 = ""; }
            //if(speech_block.message_array[2]) { this.line3 = speech_block.message_array[2]; } else { this.line2 = ""; }
            this.speaker = speech_block.speaker;
        }
    },

    setIcon: function(iconname) {
        game.play.HUD.setIcon(iconname);
    },

    processScript: function() {
        for(var v = 0; v <= this.message_script.verses.length - 1; v++){
            if(CheckInventory(this.message_script.verses[v].item)){
                for(var l = 0; l <= this.message_script.verses[v].speech.length - 1; l++) {

                    var lines = this.wordWrap(this.message_script.verses[v].speech[l]);
                    var speaker = this.message_script.verses[v].speakers[l];

                    //if this is the last one, make it close, instead of next
                    if (this.checkForSpecialSpeaker(speaker)) {
                    	var icon = speaker.substring(1);
                    	var speaker = "";
                    } else {
						var icon = (l <= this.message_script.verses[v].speech.length - 2) ? "next" : "close";
                    }

                    this.addDialogueBlock(speaker, lines, icon);
                }
                return true;
            }
        }
        return false;
    },

    addDialogueBlock: function (speaker, message_array, icon) {
        if(message_array.length > 3) {
            var temp_message_array = [];

            for (var t = 0; t <= 2; t++) {
                temp_message_array.push(message_array.shift());
            }
            this.addDialogueBlock(speaker, temp_message_array, "continue");
            this.addDialogueBlock(speaker, message_array, icon);
        } else {
            var dialogue_block = {};
            dialogue_block.speaker = speaker;
            dialogue_block.message_array = message_array;
            dialogue_block.icon = icon;

            this.dialogue_que.push(dialogue_block);
        }
    },

    checkForSpecialSpeaker: function( speaker ) {
    	return (speaker.charAt(0) == "@") ? true : false;
    },

    wordWrap: function( str ) {
        //brk = "|";
        width = 40;
        cut = false;

        if (!str) { return str; }
        var regex = '.{1,' +width+ '}(\\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\\S+?(\\s|$)');
        return str.match( RegExp(regex, 'g') ); //.join( brk );
    },

	/**
	 * update function
	 */
	update : function () {
        if (me.input.isKeyPressed('action')) {
            this.nextSpeechBlock();
        }

        this.parent();
		return true;
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
                  //My god damn hovercraft\n is FULL of eels!

		this.font2.draw (context, this.speaker, 32, 22 + this.y_offset);
		this.font.draw (context, this.line1, 112, 22 + this.y_offset);
		this.font.draw (context, this.line2, 112, 42 + this.y_offset);
		this.font.draw (context, this.line3, 112, 62 + this.y_offset);
	}

});

game.HUD.backgroundBox = me.SpriteObject.extend({
    init: function(offset) {
    	offset = offset || 0;
        this.floating = true;
        this.parent( Math.ceil((game.screen_width / 2) - (545 / 2)), 10 + offset, me.loader.getImage("dialogue-bg"), 545, 88);
    }
});

game.HUD.icons = me.AnimationSheet.extend({
   mode: "close",

   init: function() {
        this.floating = true;
        this.parent(game.screen_width - 45, 60, me.loader.getImage("dialogue-icons"), 16, 16)

        this.anim = {};
        this.addAnimation("next", [0, 1, 2, 2, 2], 150); //this icon means that the speaker is finished but there will be another speaker
        this.addAnimation("close", [3, 4, 5, 5, 5], 150); //all dialogue is finished, close it out
        this.addAnimation("question", [6, 7, 8, 8, 8], 150); //a question is being asked and the player is required to interact
        this.addAnimation("continue", [9, 10, 11, 11, 11], 150); //a speaker's words won't fit in just one box, finish their thought
        this.addAnimation("treasure", [12, 13, 14, 14, 14], 150); //Tell the player which item they recieved
        this.addAnimation("locked", [15, 16, 17, 17, 17], 150); //The player can't open a door
        this.setCurrentAnimation("question");

   },

   setMode: function(mode) {
       this.setCurrentAnimation(mode);
   }
});

game.HUD.phoneText = me.Renderable.extend({
	init: function(message, caller, npc) {
		// call the parent constructor
		// (size does not matter here)
		this.speaker = caller;
		this.parent(new me.Vector2d(0, 0), game.screen_width, game.screen_height);
		this.speaker_font = new me.Font("Courier New", 26, "#eee");
		this.message_font = new me.Font("Courier New", 16, "#111");
		this.npc = npc;
		this.floating = true;
		// local copy of the global score
		//this.speaker = "Betty";
		this.lines = this.wordWrap(message);
	},

    wordWrap: function( str ) {
        //brk = "|";
        width = 22;
        cut = false;

        if (!str) { return str; }
        var regex = '.{1,' +width+ '}(\\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\\S+?(\\s|$)');
        return str.match( RegExp(regex, 'g') ); //.join( brk );
    },

	/**
	 * update function
	 */
	update : function () {
        if (me.input.isKeyPressed('action')) {
            game.play.HUD.removeCellDialogue();
            this.npc.doneTalking();
        }

        this.parent();
		return true;
	},

	draw : function (context) {
		var text_y = 208;
		var text_x = 186;

		this.speaker_font.draw (context, this.speaker, 228, 140);
		this.message_font.draw (context, this.lines[0] || "", text_x, text_y);
		this.message_font.draw (context, this.lines[1] || "", text_x, text_y += 20);
		this.message_font.draw (context, this.lines[2] || "", text_x, text_y += 20);
		this.message_font.draw (context, this.lines[3] || "", text_x, text_y += 20);
	}
});

game.HUD.phoneBackgroundBox = me.SpriteObject.extend({
	init: function() {
		this.floating = true;
		this.parent( Math.ceil((game.screen_width / 2) - (270 / 2)), game.screen_height + 1, me.loader.getImage("celldialogue"), 270, 314);
	}
});

game.HUD.phoneBubbleBox = me.SpriteObject.extend({
	init: function() {
		this.floating = true;
		this.parent( Math.ceil((game.screen_width / 2) - (226 / 2)), 187, me.loader.getImage("cellbubble"), 270, 314);
	}
});

game.HUD.mapTitle = me.Renderable.extend({
	init: function(mapname, parent) {
		this.mapname = mapname;

		this.parent(0, 0, game.screen_width, game.screen_height);

		this.name = "map_title";
		this.floating = true;
		this.text_alpha = 1;

		this.text_font = new me.Font("Courier New", 32, "#ffffff");

		this.x = 10;
		this.y = game.screen_height - 80;

		//setTimeout((function() {
		tween = new me.Tween(this).to({text_alpha: 0}, this.timeout);
		tween.delay(8000);
		tween.easing(me.Tween.Easing.Circular.In);
		tween.start();

		this.remove_timer = setTimeout((function(){
			parent.removeChild(this);
		}).bind(this), 8000)
		//}).bind(this), 2000);
	},

  stopClock: function() {
    clearTimeout(this.remove_timer);
  },

	draw : function (context) {
		context.globalAlpha = this.text_alpha;
		this.text_font.draw (context, this.mapname, this.x, this.y);
	}

});
