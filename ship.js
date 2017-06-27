var Ship = function (hull, weapons, defences){
	this.hull = hull;
    this.weapons = weapons;
    this.defences = defences;
    this.shields = {
    	beam: 0,
		missile: 0,
		railGun: 0
	};
    rechargeShields(this);
};

var stats = function (ship) {
	var beamAtk = 0;
	var missileAtk = 0;
	var railGunAtk = 0;
	var beamDef = 0;
	var missileDef = 0;
	var railGunDef = 0;
	var accuracy = 0.5;
	var items = ship.weapons.concat(ship.defences);
	for (var i = 0; i < items.length; i ++) {
		var item = items[i];
		if (item.beam_atk) {
			beamAtk += item.beam_atk;
		}
		if (item.missile_atk) {
			missileAtk += item.missile_atk;
		}
		if (item.rail_atk) {
			railGunAtk += item.rail_atk;
		}
		if (item.beam_def) {
			beamDef += item.beam_def;
		}
		if (item.missile_def) {
			missileDef += item.missile_def;
		}
		if (item.rail_def) {
			railGunDef += item.rail_def;
		}
	}
	return {
		beamAtk: beamAtk,
		missileAtk: missileAtk,
		railGunAtk: railGunAtk,
		beamDef: beamDef,
		missileDef: missileDef,
		railGunDef: railGunDef,
		accuracy: accuracy
	}
};

var rechargeShields = function(ship) {
	var shipStats = stats(ship);
	ship.shields.beam = shipStats.beamDef;
	ship.shields.missile = shipStats.missileDef;
	ship.shields.railGun = shipStats.railGunDef;
};

module.exports = {
	Ship: Ship,
	stats: stats,
	equippedWeapons : function(ship) {
		var equipped = {};
		for (var i = 0; i < ship.weapons.length; i ++) {
			if (equipped[ship.weapons[i].name]) {
				equipped[ship.weapons[i].name] += 1;
			} else {
				equipped[ship.weapons[i].name] = 1;
			}
		}
		return equipped;
	},
	rechargeShields: rechargeShields
};