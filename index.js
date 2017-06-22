'use strict';

var Alexa = require('alexa-sdk');
var Items = require('./items');
var Ship = require('./ship');

var APP_ID = 'amzn1.ask.skill.d4b6ed32-b05e-4b69-a16d-609a98afbdde'; // TODO replace with your app ID (OPTIONAL).

var states = {
    BATTLE: '_BATTLE'
};

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(newSessionHandlers, battleHandlers);
    alexa.execute();
};

var newSessionHandlers = {
    'NewSession': function() {
        if (Object.keys(this.attributes).length === 0) { // check if it's the first time the skill has been invoked
			this.attributes['endedSessionCount'] = 0;
			this.attributes['gamesPlayed'] = 0;
        }
        
        this.emit(':ask', 
            'Welcome aboard captain. I am the starship on-board computer. This is a starship battle simulation. Would you like to begin the simulation?',
            'Would you like to begin the starship battle simulation?');
    },

    'StartBattle': function() {
        if (Object.keys(this.attributes).length === 0) { // check if it's the first time the skill has been invoked
            this.emitWithState('NewSession');
        }
		this.handler.state = states.BATTLE;
		var myShip = new Ship.Ship(50, [Items.randomWeapon(), Items.randomWeapon()], [Items.basicShield]);
		this.attributes['my_ship'] = myShip;
		this.attributes['enemy_ship'] = new Ship.Ship(30, [Items.randomWeapon()], []);
        this.attributes['options'] = [];
        if (Ship.beamAtk(this.attributes['my_ship'])) {
            this.attributes['options'].push('Fire lasers');
        }
        if (Ship.missileAtk(this.attributes['my_ship'])) {
            this.attributes['options'].push('Fire missiles');
        }
        if (Ship.particleAtk(this.attributes['my_ship'])) {
            this.attributes['options'].push('Fire particle cannons');
        }
        this.attributes['options'].push('Scan the enemy ship');
        this.attributes['options'].push('Attempt to flee');
        this.attributes['speechOutput'] = 'Our ship is equipped with ';
        var equipped = Ship.equippedWeapons(myShip);
		Object.keys(equipped).forEach(function(weapon, index){
			this.attributes['speechOutput'] += equipped[weapon] + ' ' + weapon;
			if (equipped[weapon] > 1){
				this.attributes['speechOutput'] += 's';
			}
			if (index !== Object.keys(equipped).length -1) {
				this.attributes['speechOutput'] += ', ';
			}
			if (index === Object.keys(equipped).length - 2) {
				this.attributes['speechOutput'] += 'and ';
			}
		}.bind(this));
		this.attributes['speechOutput'] += '. An enemy pirate ship has powered up its weapons. The enemy ship\'s hull is ' + this.attributes['enemy_ship'].hull + '. What are your orders?';
        this.attributes['repromptSpeech'] = 'If you don\'t know what to do, you can ask <s>what are my options?</s>';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
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
		console.log('session ended!');
		this.emit(':tell', 'Goodbye');
	},

    'Unhandled': function() {
        this.emit(':ask', 'Sorry, I didn\'t get that. Try saying that again.', 'Try again.');
    }
};

var battleHandlers = Alexa.CreateStateHandler(states.BATTLE, {
    'NewSession': function() {
		if (Object.keys(this.attributes).length === 0){
			this.handler.state = '';
			this.emitWithState('NewSession');
		} else {
			this.emitWithState('Unhandled');
		}
    },

    'BeamAttack': function() {
        // check if we have beam weapons
        if (!Ship.beamAtk(this.attributes['my_ship'])){
            this.attributes['speechOutput'] = 'We don\'t have any beam weapons. What are your orders?';
            this.attributes['repromptSpeech'] = 'If you don\'t know what to do, you can ask <s>what are my options?</s>';
            this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
        }
        this.attributes['speechOutput'] = 'Firing beam weapons...';
        this.attributes['repromptSpeech'] = 'If you don\'t know what to do, you can ask <s>what are my options?</s>';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'MissileAttack': function() {
        // check if we have missile weapons
        if (!Ship.missileAtk(this.attributes['my_ship'])){
            this.attributes['speechOutput'] = 'We don\'t have any missile weapons. What are your orders?';
            this.attributes['repromptSpeech'] = 'If you don\'t know what to do, you can ask <s>what are my options?</s>';
            this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
        }
        this.attributes['speechOutput'] = 'Firing missile weapons...';
        this.attributes['repromptSpeech'] = 'If you don\'t know what to do, you can ask <s>what are my options?</s>';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    },
    'ParticleAttack': function() {
        //  check if we have particle weapons
        if (!Ship.particleAtk(this.attributes['my_ship'])){
            this.attributes['speechOutput'] = 'We don\'t have any particle cannon weapons. What are your orders?';
            this.attributes['repromptSpeech'] = 'If you don\'t know what to do, you can ask <s>what are my options?</s>';
            this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
        }
        this.attributes['speechOutput'] = 'Firing particle weapons...';
        this.attributes['repromptSpeech'] = 'If you don\'t know what to do, you can ask <s>what are my options?</s>';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
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
        this.emit('MyOptions');
    },
    'AMAZON.StopIntent': function () {
        this.emitWithState('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emitWithState('SessionEndedRequest');
    },
	'SessionEndedRequest': function() {
		console.log('session ended!');
		var cardContent = 'Your ship\'s hull: ' + this.attributes['my_ship'].hull +
            '\nThe enemy ship\'s hull: ' + this.attributes['enemy_ship'].hull;
		this.emit(':tellWithCard', 'Thanks for playing', 'Starship battle report', cardContent);
	},

    'Unhandled': function() {
        this.attributes['speechOutput'] = 'Sorry, I didn\'t get that. If you don\'t know what to do, you can ask <s>what are my options?</s>';
        this.attributes['repromptSpeech'] = 'If you don\'t know what to do, you can ask <s>what are my options?</s>';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech']);
    }
});

