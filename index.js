'use strict';

var Alexa = require('alexa-sdk');
var Items = require('./items');
var Ship = require('./ship');
var Battle = require('./battle');

var APP_ID = 'amzn1.ask.skill.d4b6ed32-b05e-4b69-a16d-609a98afbdde';

var states = {
	START_MODE: '_START',
    BATTLE: '_BATTLE'
};

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context, callback);
    alexa.appId = APP_ID;
    alexa.registerHandlers(newSessionHandlers, startHandlers, battleHandlers);
    alexa.execute();
};

var newSessionHandlers = {
    'NewSession': function() {
        // console.log('new session', this.handler.state);
    	if (Object.keys(this.attributes).length === 0) { // check if it's the first time the skill has been invoked
			this.attributes['endedSessionCount'] = 0;
			this.attributes['gamesPlayed'] = 0;
        }
        this.handler.state = states.START_MODE;
    	this.emitWithState('StartBattle');
    },

    'StartBattle': function() {
		// console.log('start battle', this.handler.state);
    	if (Object.keys(this.attributes).length === 0) { // check if it's the first time the skill has been invoked
			this.attributes['endedSessionCount'] = 0;
			this.attributes['gamesPlayed'] = 0;
        }
        this.handler.state = states.START_MODE;
    	this.emitWithState('StartBattle');
    },

    'AMAZON.HelpIntent': function () {
        this.attributes['speechOutput'] = 'Say <s>start battle</s> to start the simulation.';
        this.attributes['repromptSpeech'] = 'Say <s>start battle</s> to start the simulation.';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
	'SessionEndedRequest': function() {
		// console.log('session ended!', this.handler.state);
		this.emit(':tell', 'Thanks for playing. Visit us facebook.com/AlexaStarship for tips and improvement requests. Goodbye.');
	},

    'Unhandled': function() {
		this.emit(':ask', 'Sorry, I didn\'t get that. Try saying that again.', 'Try again.');
    }
};

var startHandlers = Alexa.CreateStateHandler(states.START_MODE, {
	'StartBattle': function() {
		this.handler.state = states.BATTLE;
		var myShip = new Ship.Ship(50, [Items.randomWeapon(), Items.randomWeapon()], [Items.randomDefense()]);
		this.attributes['my_ship'] = myShip;
		this.attributes['enemy_ship'] = new Ship.Ship(50, [Items.randomWeapon(), Items.randomWeapon()], [Items.randomDefense()]);
		this.attributes['options'] = [];
		var stats = Ship.stats(this.attributes['my_ship']);
		if (stats.beamAtk) {
			this.attributes['options'].push('Fire lasers');
		}
		if (stats.missileAtk) {
			this.attributes['options'].push('Fire missiles');
		}
		if (stats.railGunAtk) {
			this.attributes['options'].push('Fire rail guns');
		}
		this.attributes['options'].push('Scan the enemy ship');
		this.attributes['options'].push('Attempt to flee');
		// this.attributes['speechOutput'] = 'Our ship is equipped with ';
		// var equipped = Ship.equippedWeapons(myShip);
		// Object.keys(equipped).forEach(function(weapon, index){
		// 	this.attributes['speechOutput'] += equipped[weapon] + ' ' + weapon;
		// 	if (equipped[weapon] > 1){
		// 		this.attributes['speechOutput'] += 's';
		// 	}
		// 	if (index !== Object.keys(equipped).length -1) {
		// 		this.attributes['speechOutput'] += ', ';
		// 	}
		// 	if (index === Object.keys(equipped).length - 2) {
		// 		this.attributes['speechOutput'] += 'and ';
		// 	}
		// }.bind(this));
		this.attributes['speechOutput'] = 'Welcome aboard captain. Our ship\'s ' + buildScanSpeech(myShip);
		this.attributes['speechOutput'] += '<break time="10ms"/> An enemy pirate ship has powered up its weapons. ' +
			'<audio src="https://s3.amazonaws.com/tsatsatzu-alexa/sound/beeps/CRASHBUZ.mp3" />' +
			'<audio src="https://s3.amazonaws.com/tsatsatzu-alexa/sound/beeps/CRASHBUZ.mp3" />' +
			'<audio src="https://s3.amazonaws.com/tsatsatzu-alexa/sound/beeps/CRASHBUZ.mp3" />' +
			'What are your orders?';
		this.attributes['repromptSpeech'] = 'If you don\'t know what to do, you can ask <s>what are my options?</s>';
		this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
	},
	'AMAZON.YesIntent': function () {
		// console.log('yes', this.handler.state);
		this.emitWithState('StartBattle');
	},
	'AMAZON.NoIntent': function (){
		// console.log('no', this.handler.state);
		this.emit('SessionEndedRequest');
	},

	'AMAZON.HelpIntent': function () {
		this.emit('AMAZON.HelpIntent');
	},
	'AMAZON.StopIntent': function () {
		this.emit('SessionEndedRequest');
	},
	'AMAZON.CancelIntent': function () {
		this.emit('SessionEndedRequest');
	},

	'Unhandled': function() {
		// console.log('unhandled', this.handler.state);
		this.emit('Unhandled');
	}
});

var battleHandlers = Alexa.CreateStateHandler(states.BATTLE, {
    'NewSession': function() {
		if (Object.keys(this.attributes).length === 0){
			this.emit('NewSession'); // emit NewSession intent from newSessionHandlers
		} else {
			this.emitWithState('Unhandled');
		}
    },

    'BeamAttack': function() {
		// console.log('beam', this.handler.state);
		// check if we have beam weapons
		var myShip = this.attributes['my_ship'];
		var enemyShip = this.attributes['enemy_ship'];
		if (!Ship.stats(myShip).beamAtk){
            this.attributes['speechOutput'] = 'We don\'t have any beam weapons. What are your orders?';
            this.attributes['repromptSpeech'] = 'If you don\'t know what to do, you can ask <s>what are my options?</s>';
            this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
        }
        var result = Battle.resolveTurn(myShip, Battle.BEAM_TYPE, enemyShip);
		this.attributes['my_ship'] = result.myShip;
		this.attributes['enemy_ship'] = result.enemyShip;
		this.attributes['speechOutput'] = buildBattleTurnResolutionSpeech(result);
		if (result.enemyShipDestroyed || result.myShipDestroyed || result.myAtk.fleeSuccessful || result.enemyAtk.fleeSuccessful) {
			console.log('ended');
			this.emitWithState('BattleEnded'); // emit battle ended from battleHandlers
		} else {
			this.attributes['speechOutput'] += ' What are your next orders?';
		}
		this.attributes['repromptSpeech'] = 'If you don\'t know what to do, you can ask <s>what are my options?</s>';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'MissileAttack': function() {
		// console.log('missile', this.handler.state);
		// check if we have missile weapons
		var myShip = this.attributes['my_ship'];
		var enemyShip = this.attributes['enemy_ship'];
		if (!Ship.stats(myShip).missileAtk){
            this.attributes['speechOutput'] = 'We don\'t have any missile weapons. What are your orders?';
            this.attributes['repromptSpeech'] = 'If you don\'t know what to do, you can ask <s>what are my options?</s>';
            this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
        }
		var result = Battle.resolveTurn(myShip, Battle.MISSILE_TYPE, enemyShip);
		this.attributes['my_ship'] = result.myShip;
		this.attributes['enemy_ship'] = result.enemyShip;
		this.attributes['speechOutput'] = buildBattleTurnResolutionSpeech(result);
		if (result.enemyShipDestroyed || result.myShipDestroyed || result.myAtk.fleeSuccessful || result.enemyAtk.fleeSuccessful) {
			// console.log('ended');
			this.emitWithState('BattleEnded');
			return;
		} else {
			this.attributes['speechOutput'] += ' What are your next orders?';
		}
		this.attributes['repromptSpeech'] = 'If you don\'t know what to do, you can ask <s>what are my options?</s>';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'RailGunAttack': function() {
		// console.log('rail gun', this.handler.state);
		//  check if we have rail gun weapons
		var myShip = this.attributes['my_ship'];
		var enemyShip = this.attributes['enemy_ship'];
		if (!Ship.stats(myShip).railGunAtk){
            this.attributes['speechOutput'] = 'We don\'t have any rail guns. What are your orders?';
            this.attributes['repromptSpeech'] = 'If you don\'t know what to do, you can ask <s>what are my options?</s>';
            this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
        }
		var result = Battle.resolveTurn(myShip, Battle.RAIL_GUN_TYPE, enemyShip);
		this.attributes['my_ship'] = result.myShip;
		this.attributes['enemy_ship'] = result.enemyShip;
		this.attributes['speechOutput'] = buildBattleTurnResolutionSpeech(result);
		if (result.enemyShipDestroyed || result.myShipDestroyed || result.myAtk.fleeSuccessful || result.enemyAtk.fleeSuccessful) {
			// console.log('ended');
			this.emitWithState('BattleEnded');
		} else {
			this.attributes['speechOutput'] += ' What are your next orders?';
		}
		this.attributes['repromptSpeech'] = 'If you don\'t know what to do, you can ask <s>what are my options?</s>';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
	'ScanIntent': function(){
		var myShip = this.attributes['my_ship'];
		var enemyShip = this.attributes['enemy_ship'];
		var result = Battle.resolveTurn(myShip, Battle.SCAN_TYPE, enemyShip);
		this.attributes['my_ship'] = result.myShip;
		this.attributes['enemy_ship'] = result.enemyShip;
		this.attributes['speechOutput'] = buildBattleTurnResolutionSpeech(result);
		if (result.enemyShipDestroyed || result.myShipDestroyed || result.myAtk.fleeSuccessful || result.enemyAtk.fleeSuccessful) {
			// console.log('ended');
			this.emitWithState('BattleEnded');
		} else {
			this.attributes['speechOutput'] += ' What are your next orders?';
		}
		this.attributes['repromptSpeech'] = 'If you don\'t know what to do, you can ask <s>what are my options?</s>';
		this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
	},
	'FleeIntent': function(){
		var myShip = this.attributes['my_ship'];
		var enemyShip = this.attributes['enemy_ship'];
		var result = Battle.resolveTurn(myShip, Battle.FLEE_TYPE, enemyShip);
		this.attributes['my_ship'] = result.myShip;
		this.attributes['enemy_ship'] = result.enemyShip;
		this.attributes['speechOutput'] = buildBattleTurnResolutionSpeech(result);
		if (result.enemyShipDestroyed || result.myShipDestroyed || result.myAtk.fleeSuccessful || result.enemyAtk.fleeSuccessful) {
			// console.log('ended');
			this.emitWithState('BattleEnded');
		} else {
			this.attributes['speechOutput'] += ' What are your next orders?';
		}
		this.attributes['repromptSpeech'] = 'If you don\'t know what to do, you can ask <s>what are my options?</s>';
		this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
	},
	'BattleEnded': function () {
		// console.log('battle ended', this.handler.state);
    	this.attributes['speechOutput'] += ' This simulation is over. Would you like to try again?';
		this.attributes['repromptSpeech'] = 'This simulation is over. Would you like to try again?';
		this.attributes['gamesPlayed'] ++;
		this.handler.state = states.START_MODE;
		var card = buildBattleResultCard(this.attributes['my_ship'], this.attributes['enemy_ship']);
		this.emit(':askWithCard', this.attributes['speechOutput'], this.attributes['repromptSpeech'], card.title, card.content, card.image);
	},

    'MyOptions': function() {
        var options = '';
        for (var i = 0; i < this.attributes['options'].length; i ++) {
            options += '<s>' + this.attributes['options'][i] + '</s>';
        }
        this.attributes['speechOutput'] = 'Here are your options: ' + options + '<break time="10ms"/>What are your orders?';
        this.attributes['repromptSpeech'] = 'What are your orders?';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },

    'AMAZON.HelpIntent': function () {
        this.emitWithState('MyOptions');
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },

    'Unhandled': function() {
		// console.log('unhandled', this.handler.state);
		this.attributes['speechOutput'] = 'Sorry, I didn\'t get that. If you don\'t know what to do, you can ask <s>what are my options?</s>';
        this.attributes['repromptSpeech'] = 'If you don\'t know what to do, you can ask <s>what are my options?</s>';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    }
});

var buildBattleResultCard = function (myShip, enemyShip) {
	var content = 'Your ship\'s hull: ' + myShip.hull +
	'\nThe enemy ship\'s hull: ' + enemyShip.hull +
	'\n\nVisit https://facebook.com/AlexaStarship for tips';
	return {
		title : 'Starship battle report',
		content: content
	}
};

var buildBattleTurnResolutionSpeech = function (resolution) {
	var speech = "";

	if (resolution.enemyAtk.type === Battle.FLEE_TYPE) {
		speech += 'The enemy ship is attempting to flee. ';
	}

	if (resolution.myAtk.type === Battle.SCAN_TYPE) {
		speech += 'Scanning the enemy ship. ';
		speech += audioOfAtkType(resolution.myAtk.type);
		if (resolution.myAtk.scanSuccessful) {
			speech += 'The enemy ship\'s ' + buildScanSpeech(resolution.enemyShip);
		} else {
			speech += 'Scan was unsuccessful. ';
		}
	} else if (resolution.myAtk.type === Battle.FLEE_TYPE) {
		speech += 'Attempting to flee. ';
	} else {
		speech += 'Firing ' + resolution.myAtk.type + '. ';
		speech += audioOfAtkType(resolution.myAtk.type);
		if (resolution.myAtk.hit) {
			if (resolution.enemyShipDestroyed) {
				speech += 'Direct hit! We destroyed the enemy ship, congratulations captain.';
				return speech;
			} else if (resolution.myAtk.critical) {
				speech += 'Critical hit! ';
			} else if (resolution.myAtk.notCritical) {
				speech += 'We barely hit the enemy ship. ';
			} else {
				speech += 'Direct hit. ';
			}
		} else {
			speech += 'We missed. ';
		}
	}

	//TODO implement scan and flee type message from the enemy
	if (resolution.enemyAtk.type === Battle.SCAN_TYPE) {
		speech += 'The enemy ship is scanning us. ';
		speech += audioOfAtkType(resolution.enemyAtk.type);
	} else if (resolution.enemyAtk.type === Battle.FLEE_TYPE) {

	} else {
		speech += 'The enemy ship fired ' + resolution.enemyAtk.type + '. ';
		speech += audioOfAtkType(resolution.enemyAtk.type);
		if (resolution.enemyAtk.hit) {
			if (resolution.myShipDestroyed) {
				speech += 'A major hull breach in our ship. We\'ve lost life support systems and engines. ' +
					'We have been destroyed.';
				return speech;
			} else if (resolution.enemyAtk.critical) {
				speech += 'Critical hit! ';
			} else if (resolution.enemyAtk.notCritical) {
				speech += 'We were barely hit. ';
			} else {
				speech += 'We were hit. ';
			}
			if (resolution.myDmgResult.beamShieldDmg) {
				speech += 'Our beam shields took ' + resolution.myDmgResult.beamShieldDmg + ' damage. ';
				if (resolution.myShip.shields.beam <= 0) {
					speech += 'Our beam shields were depleted. ';
				} else {
					speech += 'Our beam shields are at ' + resolution.myShip.shields.beam + '. ';
				}
			} else if (resolution.myDmgResult.missileShieldDmg) {
				speech += 'Our missile shields took ' + resolution.myDmgResult.missileShieldDmg + ' damage. ';
				if (resolution.myShip.shields.missile <= 0) {
					speech += 'Our missile shields were depleted. ';
				} else {
					speech += 'Our missile shields are at ' + resolution.myShip.shields.missile + '. ';
				}
			} else if (resolution.myDmgResult.railGunShieldDmg) {
				speech += 'Our rail gun shields took ' + resolution.myDmgResult.railGunShieldDmg + ' damage. ';
				if (resolution.myShip.shields.railGun <= 0) {
					speech += 'Our rail gun shields were depleted. ';
				} else {
					speech += 'Our rail gun shields are at ' + resolution.myShip.shields.railGun + '. ';
				}
			}
			if (resolution.myDmgResult.hullDmg > 0) {
				speech += 'We sustained ' + resolution.myDmgResult.hullDmg + ' hull damage. Our hull integrity is at ' + resolution.myShip.hull + '. ';
			}

		} else {
			speech += 'They missed us. ';
		}
	}

	if (resolution.myAtk.fleeSuccessful && resolution.enemyAtk.fleeSuccessful) {
		speech += 'We have fled successfully. ';
		speech += audioOfAtkType(Battle.FLEE_TYPE);
	} else if (resolution.myAtk.fleeSuccessful) {
		speech += 'We have fled successfully. ';
		speech += audioOfAtkType(Battle.FLEE_TYPE);
	}  else if (resolution.myAtk.fleeAttempt && !resolution.myAtk.fleeSuccessful) {
		speech += 'We couldn\'t flee. The enemy ship is still following us. '
	}
	if (resolution.enemyAtk.fleeSuccessful) {
		speech += 'The enemy ship has fled successfully. ';
		speech += audioOfAtkType(Battle.FLEE_TYPE);
	} else if (resolution.enemyAtk.fleeAttempt && !resolution.enemyAtk.fleeSuccessful) {
		speech += 'The enemy ship couldn\'t flee. ';
	}
	return speech;
};

var buildScanSpeech = function (ship) {
	var shipStats = Ship.stats(ship);
	var speech = 'hull integrity is ' + ship.hull + '. ';
	if (shipStats.beamAtk) {
		speech += 'beam attack strength is ' + shipStats.beamAtk + ', ';
	}
	if (shipStats.missileAtk) {
		speech += 'missile attack strength is ' + shipStats.missileAtk + ', ';
	}
	if (shipStats.railGunAtk) {
		speech += 'rail gun attack strength is ' + shipStats.railGunAtk + ', ';
	}
	if (ship.shields.beam) {
		speech += 'beam shields are ' + ship.shields.beam + ', ';
	}
	if (ship.shields.missile) {
		speech += 'missile shields are ' + ship.shields.missile + ', ';
	}
	if (ship.shields.railGun) {
		speech += 'rail gun shields are ' + ship.shields.railGun + ', ';
	}
	if (shipStats.accuracy) {
		speech += 'and accuracy is ' + shipStats.accuracy + '. ';
	}
	return speech;
};

var audioOfAtkType = function (atkType) {
	if (atkType === Battle.BEAM_TYPE) {
		return '<audio src="https://s3.amazonaws.com/tsatsatzu-alexa/sound/tech/PLASMAL.mp3" />';
	} else if (atkType === Battle.MISSILE_TYPE) {
		return '<audio src="https://s3.amazonaws.com/tsatsatzu-alexa/sound/tech/ELECTRI.mp3" />';
	} else if (atkType === Battle.RAIL_GUN_TYPE) {
		return '<audio src="https://s3.amazonaws.com/tsatsatzu-alexa/sound/space/ZING.mp3" />';
	} else if (atkType === Battle.SCAN_TYPE) {
		return '<audio src="https://s3.amazonaws.com/tsatsatzu-alexa/sound/misc/WOWBEEP.mp3" /><audio src="https://s3.amazonaws.com/tsatsatzu-alexa/sound/beeps/DOUBLE.mp3" />';
	} else if (atkType === Battle.FLEE_TYPE) {
		return '<audio src="https://s3.amazonaws.com/tsatsatzu-alexa/sound/misc/WHOOSH.mp3" />';
	}
};