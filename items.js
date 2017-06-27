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
		beam_def: 5,
		missile_def: 5,
		rail_def: 5
	},
	basicBeamShield : {
		name: "Basic Beam Shield",
		beam_def: 15,
		missile_def: 0,
		rail_def: 0
	},
	basicMissileShield : {
		name: "Basic Missile Shield",
		beam_def: 0,
		missile_def: 15,
		rail_def: 0
	},
	basicRailGunShield : {
		name: "Basic Rail Gun Shield",
		beam_def: 0,
		missile_def: 0,
		rail_def: 15
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
	},
	randomDefense : function () {
		var index = Math.floor(Math.random()*4);
		if (index === 0) {
			return this.basicShield;
		} else if (index === 1) {
			return this.basicBeamShield;
		} else if (index === 2) {
			return this.basicMissileShield;
		} else if (index === 3) {
			return this.basicRailGunShield;
		}
	}
};