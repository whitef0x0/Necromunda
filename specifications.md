Necromunda Specifications:
==========================
	
	###Campaign overview:
		- The game is based on the Necromunda board game by GamesWorkshop.
			~ However, the game will deviate from this framework in many significant respects.
		
		- The game is multiplayer.
			~ A campaign is played between an even number of players, with a minimum of two.
			~ In each round of the campaign, the players are divided into pairs.
			~ Each pair play a skirmish game against one another.
			~ The winner is rewarded with additional territory to fund their operations.
			
		- At the beginning of a campaign:
			~ Each player chooses between one of six factions, or 'houses' (Cawdor, Delaque, Escher, Goliath, Orlock, VanSaar).
				> Each house has a different set of character skills (e.g. Cawdor is ferocious, Delaque is stealthy, Goliath is strong, VanSaar is techy).
				> Each house has a different set of weapons that it can acquire easily (e.g. Cawdor get flame-throwers, Delaque get silencers).
			~ Each player is then given 1000$ or 'credits' to assemble and arm a team of characters or 'gang'.
				> A gang is composed of Juves (inexperienced fighters), Gangers (experienced fighters), Heavys (fighters that can carry heavy weapons), and a gang leader.
				> Each type of character has a different hiring cost. These characters are then equipped with weaponry and other items by the player.
				> A starting gang or 'Initial Loadout' can be saved as a template and used again in future. A default template will be provided for each house.
			
		- Each player participates in a skirmish during each round of a campaign.
			~ A skirmish is played between two players.
			~ A skirmish is played on a randomly generated map, consisting of randomly placed buildings.
			~ A player can use all available and uninjured characters in a skirmish, but can choose to keep some back.
			~ Characters that are killed or wounded in a skirmish are killed or wounded permanently.
			~ Characters gain experience in a skirmish for collecting loot, wounding their opponents and healing their allies.
			~ The player that wins the skirmish is awarded with new territory that will increase their revenue and can be used to fund their operations.
			
		- Between skirmishes in a campaign:
			~ Players collect revenue from the territory they control.
			~ Players can transfer equipment between characters.
			~ If a character has gained enough experience to level up, it can be awarded with one of three randomly chosen skills.
			~ Players can use their revenue or credits to hire new characters.
			~ Players can use their revenue to purchase new equipment.
			
	
	###Skirmish overview:
		- A skirmish is played between two opposing players, each of whom has a team of fighters.
		
		- A skirmish is played on a randomly generated map, consisting of randomly placed and rotated buildings and structures.
			~ A building consists of high walls and low walls.
			~ A high wall is represented by a hatched area, a low wall is represented by an unhatched area.
			~ Low walls can be seen over by characters and can be crossed by characters.
			~ High walls cannot be seen through or moved through.
		
		- A skirmish is divided into rounds:
			~ During each round a player can issue orders to all of their characters. Characters can be ordered either to attack an opposing character or to move.
			~ Attacks are resolved first, and then movement occurs.
			~ The movement path of a character is specified by the player. 
				> Ultimately this path will be controlled using an interactive B-Spline (the control points can be dragged and dropped). 
				> For now it will be controlled using an interactive polyline.
				> Characters cannot pass through the walls of buildings.
		
		- Line of sight:
			~ A character can see in an arc of 120 degrees in front of them.
			~ High walls block line of sight.
			~ A player is only aware of those opposing characters that can be seen by one of their own characters.
			~ Characters can only be ordered to attack opponents that are within their line of sight.
			
		- Cover and shooting:
			~ A character can only target or shoot at an opponent within its line of sight.
			~ Whether a character hits or misses while shooting at an opponent is probabilistic .
			~ Low walls and the corners of high walls provide characters with 'cover' or protection from enemy fire, and reduce the chance that they will be hit.
			~ A characters chance to hit is also reduced by its distance from the target.
			~ The exact details of this model can be sorted out in future.

				
		
			

		
		