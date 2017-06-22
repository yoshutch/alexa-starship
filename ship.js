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
	console.log("beamAtk: ", atkStr);
	return atkStr;
};
var missileAtk = function (ship) {
	var atkStr = 0;
	for (var i = 0; i < ship.weapons.length; i ++) {
		if (ship.weapons[i].missile_atk) {
			atkStr += ship.weapons[i].missile_atk;
		}
	}
	console.log("missileAtk: ", atkStr);
	return atkStr;
};
var particleAtk = function (ship) {
	var atkStr = 0;
	for (var i = 0; i < ship.weapons.length; i ++) {
		if (ship.weapons[i].particle_atk) {
			atkStr += ship.weapons[i].particle_atk;
		}
	}
	console.log("particleAtk: ", atkStr);
	return atkStr;
};

module.exports = {
	Ship: Ship,
	beamAtk: beamAtk,
	missileAtk: missileAtk,
	particleAtk: particleAtk
};