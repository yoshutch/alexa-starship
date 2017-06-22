var Ship = require('./ship');

const BEAM_TYPE = 'beams';
const MISSILE_TYPE = 'missiles';
const RAIL_GUN_TYPE = 'rail guns';
const EFFECTIVE_RATE = 1.5;
const NOT_EFFECTIVE_RATE = 0.5;

var resolveTurn = function (myShip, myAtkType, enemyShip, enemyAtkType) {
	if (!enemyAtkType) {
		enemyAtkType = randomAtkType(enemyShip)
	}
	var myAtk = resolveAtkPower(myShip, myAtkType, enemyAtkType);
	var enemyAtk = resolveAtkPower(enemyShip, enemyAtkType, myAtkType);
	enemyShip.hull -= myAtk;
	myShip.hull -= enemyAtk;
	var result = "";
	if (myAtkType !== 'scan'){
		result += 'Firing ' + myAtkType + '. ';
		if (myAtk > 0) {
			result += 'Direct hit.<break time="10ms"/>';
		}
	}
	result += 'The enemy ship is firing ' + enemyAtkType + '. ';
	if (enemyAtk > 0) {
		result += 'They hit our ship for a total of ' + enemyAtk + ' hull damage. '
	}
	if (myShip.hull <= 0 && enemyShip.hull <= 0) { //both ships were destroyed
		result += "Both ships were destroyed."
	} else if (myShip.hull <= 0) { //myShip was destroyed
		result += "Our ship was destroyed."
	} else if (enemyShip.hull <= 0) { //enemyShip was destroyed
		result += "The enemy ship was destroyed."
	} else { //neither ship was destroyed

	}
	return result;
	//TODO make this not dependent on the view (string) return an object of the result
};

var resolveAtkPower = function(ship, shipAtkType, enemyAtkType) {
	var atk = 0;
	if (shipAtkType === BEAM_TYPE) {
		atk = Ship.beamAtk(ship);
		if (enemyAtkType === MISSILE_TYPE) {
			atk *= EFFECTIVE_RATE;
		} else if (enemyAtkType === RAIL_GUN_TYPE) {
			atk *= NOT_EFFECTIVE_RATE;
		}
	} else if (shipAtkType === MISSILE_TYPE) {
		atk = Ship.missileAtk(ship);
		if (enemyAtkType === RAIL_GUN_TYPE) {
			atk *= EFFECTIVE_RATE;
		} else if (enemyAtkType === BEAM_TYPE) {
			atk *= NOT_EFFECTIVE_RATE;
		}
	} else if (shipAtkType === RAIL_GUN_TYPE) {
		atk = Ship.railGunAtk(ship);
		if (enemyAtkType === BEAM_TYPE) {
			atk *= EFFECTIVE_RATE;
		} else if (enemyAtkType === MISSILE_TYPE) {
			atk *= NOT_EFFECTIVE_RATE;
		}
	}
	return atk;
};

var randomAtkType = function (ship) {
	var types = [];
	if (Ship.beamAtk(ship)) {
		types.push(BEAM_TYPE);
	}
	if (Ship.missileAtk(ship)) {
		types.push(MISSILE_TYPE);
	}
	if (Ship.railGunAtk(ship)) {
		types.push(RAIL_GUN_TYPE);
	}
	return types[Math.floor(Math.random()*types.length)];
};

module.exports = {
	BEAM_TYPE : BEAM_TYPE,
	MISSILE_TYPE : MISSILE_TYPE,
	RAIL_GUN_TYPE : RAIL_GUN_TYPE,
	resolveTurn : resolveTurn,
	randomAtkType: randomAtkType
};
