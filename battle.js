var Ship = require('./ship');

const BEAM_TYPE = 'beams';
const MISSILE_TYPE = 'missiles';
const RAIL_GUN_TYPE = 'rail guns';
const SCAN_TYPE = 'scan';
const FLEE_TYPE = 'flee';
const EFFECTIVE_RATE = 1.5;
const NOT_EFFECTIVE_RATE = 0.5;
const CRITICAL_RATE = 1.5;
const NOT_CRITICAL_RATE = 0.5;
const CRITICAL_THRESHOLD = 0.8;
const NOT_CRITICAL_THRESHOLD = 0.1;
const FLEE_THRESHOLD = 0.3;

var resolveTurn = function (myShip, myAtkType, enemyShip, enemyAtkType) {
	if (!enemyAtkType) {
		enemyAtkType = randomAtkType(enemyShip)
	}
	// var myAtk = resolveAtkPower(myShip, myAtkType, enemyAtkType);
	// var enemyAtk = resolveAtkPower(enemyShip, enemyAtkType, myAtkType);

	var myStats = Ship.stats(myShip);
	var enemyStats = Ship.stats(enemyShip);

	var myAtk = 0;
	var myAcc = myStats.accuracy;
	var enemyAtk = 0;
	var enemyAcc = enemyStats.accuracy;

	var result = {
		myAtk: {
			type: myAtkType
		},
		enemyAtk: {
			type: enemyAtkType
		}
	};

	switch(myAtkType) {
		case BEAM_TYPE:
			myAtk = myStats.beamAtk;
			switch (enemyAtkType) {
				case BEAM_TYPE:
					enemyAtk = enemyStats.beamAtk;
					break;
				case MISSILE_TYPE:
					result.myAtk.effective = true;
					myAcc *= EFFECTIVE_RATE;
					enemyAtk = enemyStats.missileAtk;
					enemyAcc *= NOT_EFFECTIVE_RATE;
					break;
				case RAIL_GUN_TYPE:
					result.enemyAtk.effective = true;
					myAcc *= NOT_EFFECTIVE_RATE;
					enemyAtk = enemyStats.railGunAtk;
					enemyAcc *= EFFECTIVE_RATE;
					break;
				case SCAN_TYPE:
					myAcc *= EFFECTIVE_RATE;
					break;
				case FLEE_TYPE:
					myAcc *= EFFECTIVE_RATE;
					break;
			}
			break;
		case MISSILE_TYPE:
			myAtk = myStats.missileAtk;
			switch (enemyAtkType) {
				case BEAM_TYPE:
					result.enemyAtk.effective = true;
					myAcc *= NOT_EFFECTIVE_RATE;
					enemyAtk = enemyStats.beamAtk;
					enemyAcc *= EFFECTIVE_RATE;
					break;
				case MISSILE_TYPE:
					enemyAtk = enemyStats.missileAtk;
					break;
				case RAIL_GUN_TYPE:
					result.myAtk.effective = true;
					myAcc *= EFFECTIVE_RATE;
					enemyAtk = enemyStats.railGunAtk;
					enemyAcc *= NOT_EFFECTIVE_RATE;
					break;
				case SCAN_TYPE:
					result.myAtk.effective = true;
					myAcc *= EFFECTIVE_RATE;
					break;
				case FLEE_TYPE:
					result.myAtk.effective = true;
					myAcc *= EFFECTIVE_RATE;
					break;
			}
			break;
		case  RAIL_GUN_TYPE:
			myAtk = myStats.railGunAtk;
			switch (enemyAtkType) {
				case BEAM_TYPE:
					result.myAtk.effective = true;
					myAcc *= EFFECTIVE_RATE;
					enemyAtk = enemyStats.beamAtk;
					enemyAcc *= NOT_EFFECTIVE_RATE;
					break;
				case MISSILE_TYPE:
					result.enemyAtk.effective = true;
					myAcc *= NOT_EFFECTIVE_RATE;
					enemyAtk = enemyStats.missileAtk;
					enemyAcc *= EFFECTIVE_RATE;
					break;
				case RAIL_GUN_TYPE:
					enemyAtk = enemyStats.railGunAtk;
					break;
				case SCAN_TYPE:
					result.myAtk.effective = true;
					myAcc *= EFFECTIVE_RATE;
					break;
				case FLEE_TYPE:
					result.myAtk.effective = true;
					myAcc *= EFFECTIVE_RATE;
					break;
			}
			break;
		case SCAN_TYPE:
			result.enemyAtk.effective = true;
			enemyAcc *= EFFECTIVE_RATE;
			switch (enemyAtkType) {
				case BEAM_TYPE:
					enemyAtk = enemyStats.beamAtk;
					break;
				case MISSILE_TYPE:
					enemyAtk = enemyStats.missileAtk;
					break;
				case RAIL_GUN_TYPE:
					enemyAtk = enemyStats.railGunAtk;
					break;
				case SCAN_TYPE:
					// TODO both scan
					break;
				case FLEE_TYPE:
					// TODO enemy successfully flees
					break;
			}
			break;
		case FLEE_TYPE:
			result.enemyAtk.effective = true;
			enemyAcc *= EFFECTIVE_RATE;
			switch (enemyAtkType) {
				case BEAM_TYPE:
					enemyAtk = enemyStats.beamAtk;
					break;
				case MISSILE_TYPE:
					enemyAtk = enemyStats.missileAtk;
					break;
				case RAIL_GUN_TYPE:
					enemyAtk = enemyStats.railGunAtk;
					break;
				case SCAN_TYPE:
					// TODO you successfully flee
					break;
				case FLEE_TYPE:
					// TODO both successfully flees
					break;
			}
			break;
	}

	var crit;

	if (myAtkType === SCAN_TYPE) {
		result.myAtk.scanSuccessful = true;
		result.myAtk.scan = {
			enemyHull : enemyShip.hull,
			enemyStats : enemyStats
		}
		//TODO maybe in the future add some variety of what is scanned (i.e. we were unable to scan their defenses etc)
	} else if (myAtkType === BEAM_TYPE || myAtkType === MISSILE_TYPE || myAtkType === RAIL_GUN_TYPE){
		var hitAcc = Math.random();
		if (hitAcc <= myAcc) { // hit
			result.myAtk.hit = true;
			crit = Math.random();
			if (crit >= CRITICAL_THRESHOLD) { // direct/critical hit, more damage
				myAtk *= CRITICAL_RATE;
				result.myAtk.critical= true;
			} else if (crit < NOT_CRITICAL_THRESHOLD) { // barely hit, less damage
				myAtk *= NOT_CRITICAL_RATE;
				result.myAtk.notCritical= true;
			}
			result.myAtk.dmg = myAtk;
			if (enemyShip.hull <= myAtk) { // attack will destroy enemy ship
				enemyShip.hull = 0;
				result.enemyShipDestroyed = true;
				result.myShip = myShip;
				result.enemyShip = enemyShip;
				return result; // don't care about enemy attack because they're destroyed
			}
			enemyShip.hull -= myAtk;
		} else {
			result.myAtk.hit = false;
		}
	}

	if (enemyAtkType === SCAN_TYPE){
		//TODO scan logic
	} else if (enemyAtkType === BEAM_TYPE || enemyAtkType === MISSILE_TYPE || enemyAtkType === RAIL_GUN_TYPE) {
		if (Math.random() <= enemyAcc) { // enemy hit
			result.enemyAtk.hit = true;
			crit = Math.random();
			if (crit >= CRITICAL_THRESHOLD) { // enemy direct/critical hit, more damage
				enemyAtk *= CRITICAL_RATE;
				result.enemyAtk.critical= true;
			} else if (crit < NOT_CRITICAL_THRESHOLD) { // enemy barely hit, less damage
				enemyAtk *= NOT_CRITICAL_RATE;
				result.enemyAtk.notCritical= true;
			}
			result.enemyAtk.dmg = enemyAtk;
			if (myShip.hull <= enemyAtk) { // attack will destroy our ship
				myShip.hull = 0;
				result.myShipDestroyed = true;
			}
			myShip.hull -= enemyAtk;
		} else {
			result.enemyAtk.hit = false;
		}
	}

	if (myAtkType === FLEE_TYPE && enemyAtkType === FLEE_TYPE){
		//both flee
		result.myAtk.fleeSuccessful = true;
		result.enemyAtk.fleeSuccessful = true;
	} else if (myAtkType === FLEE_TYPE){
		//try to flee
		result.myAtk.fleeAttempt = true;
		if (result.myShipDestroyed) {
			result.myAtk.fleeSuccessful = false;
		}
		//TODO maybe change probability depending on engines/enemy accuracy etc
		result.myAtk.fleeSuccessful = Math.random() < FLEE_THRESHOLD;
	} else if (enemyAtkType === FLEE_TYPE) {
		//enemy tries to flee
		result.enemyAtk.fleeAttempt = true;
		if (result.enemyShipDestroyed) {
			result.enemyAtk.fleeSuccessful = false;
		}
		//TODO maybe change probability depending on engines/my accuracy etc
		result.enemyAtk.fleeSuccessful = Math.random() < FLEE_THRESHOLD;
	}

	result.myShip = myShip;
	result.enemyShip = enemyShip;
	return result;
};

var resolveAtkPower = function(ship, shipAtkType, enemyAtkType) {
	var atk = 0;
	var acc = 0.5;
	var stats = Ship.stats(ship);
	if (shipAtkType === BEAM_TYPE) {
		atk = stats.beamAtk;
		if (enemyAtkType === MISSILE_TYPE) {
			atk *= EFFECTIVE_RATE;
		} else if (enemyAtkType === RAIL_GUN_TYPE) {
			atk *= NOT_EFFECTIVE_RATE;
		}
	} else if (shipAtkType === MISSILE_TYPE) {
		atk = stats.missileAtk;
		if (enemyAtkType === RAIL_GUN_TYPE) {
			atk *= EFFECTIVE_RATE;
		} else if (enemyAtkType === BEAM_TYPE) {
			atk *= NOT_EFFECTIVE_RATE;
		}
	} else if (shipAtkType === RAIL_GUN_TYPE) {
		atk = stats.railGunAtk;
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
	var stats = Ship.stats(ship);
	if (stats.beamAtk) {
		types.push(BEAM_TYPE);
	}
	if (stats.missileAtk) {
		types.push(MISSILE_TYPE);
	}
	if (stats.railGunAtk) {
		types.push(RAIL_GUN_TYPE);
	}
	return types[Math.floor(Math.random()*types.length)];
};

module.exports = {
	BEAM_TYPE : BEAM_TYPE,
	MISSILE_TYPE : MISSILE_TYPE,
	RAIL_GUN_TYPE : RAIL_GUN_TYPE,
	SCAN_TYPE: SCAN_TYPE,
	FLEE_TYPE: FLEE_TYPE,
	resolveTurn : resolveTurn,
	randomAtkType: randomAtkType
};
