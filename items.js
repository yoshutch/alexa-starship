module.exports = {
	// Weapons
	basicLaser : {
		name: "Basic Laser",
		beam_atk: 10
	},

	basicMissile : {
		name: "Basic Missile",
		missile_atk: 10
	},

	basicRailGun : {
		name: "Basic Rail Gun",
		rail_atk: 10
	},

	// Shields
	basicShield : {
		name: "Basic Shield",
		beam_def: 1,
		missile_def: 1,
		rail_def: 1
	},

	// Functions
	randomWeapon : function () {
		var index = Math.floor(Math.random()*3);
		if (index === 0) {
			return this.basicLaser;
		} else if (index === 1) {
			return this.basicMissile;
		} else if (index === 2) {
			return this.basicRailGun;
		}
	}
};