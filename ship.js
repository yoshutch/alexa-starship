var Ship = function (hull, weapons, shields){
	this.hull = hull;
    this.weapons = weapons;
    this.shields = shields;
};

var beamAtk = function (ship){
	var atkStr = 0;
	for (var i = 0; i < ship.weapons.length; i ++) {
		if (ship.weapons[i].beam_atk) {
			atkStr += ship.weapons[i].beam_atk;
		}
	}
	return atkStr;
};
var missileAtk = function (ship) {
	var atkStr = 0;
	for (var i = 0; i < ship.weapons.length; i ++) {
		if (ship.weapons[i].missile_atk) {
			atkStr += ship.weapons[i].missile_atk;
		}
	}
	return atkStr;
};
var particleAtk = function (ship) {
	var atkStr = 0;
	for (var i = 0; i < ship.weapons.length; i ++) {
		if (ship.weapons[i].particle_atk) {
			atkStr += ship.weapons[i].particle_atk;
		}
	}
	return atkStr;
};

module.exports = {
	Ship: Ship,
	beamAtk: beamAtk,
	missileAtk: missileAtk,
	particleAtk: particleAtk,
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