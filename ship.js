var Ship = function (hull, weapons, shields){
	this.hull = hull;
    this.weapons = weapons;
    this.shields = shields;
};

var stats = function (ship) {
	var beamAtk = 0;
	var missileAtk = 0;
	var railGunAtk = 0;
	var beamDef = 0;
	var missileDef = 0;
	var railGunDef = 0;
	var accuracy = 0.5;
	var items = ship.weapons.concat(ship.shields);
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
	}
};