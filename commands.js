import 'dotenv/config';
import { getRPSChoices } from './game.js';
import { capitalize, InstallGlobalCommands } from './utils.js';

// Get the game choices from game.js
function createCommandChallengeChoices() {
    const choices = getRPSChoices();
    const commandChoices = [];
    
    for (let choice of choices) {
        commandChoices.push({
            name: capitalize(choice),
            value: choice.toLowerCase(),
        });
    }
    
    return commandChoices;
}

function createCommandChoices() {
    const choices = ["Encounter", "Session", "Round"];
    const commandChoices = [];
    
    for (let choice of choices) {
        commandChoices.push({
            name: capitalize(choice),
            value: choice.toLowerCase(),
        });
    }
    
    return commandChoices;
}

// Simple test command
const TEST_COMMAND = {
    name: 'test',
    description: 'Basic command',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
};

function genRollCommand(name) {
    return {
        name: name,
        description: 'Roll some dice',
        type: 1,
        integration_types: [0, 1],
        contexts: [0, 1, 2],
        options: [
            {
                type: 3,
                name: 'dice',
                description: "Dice Expression",
                required: true,
            },
            {
                type: 5,
                name: 'stats',
                description: "Show stat tracking options",
                required: false,
            },
            {
                type: 10,
                name: 'scale',
                description: "Amount to scale your roll by for tracking",
                required: false,
            }
        ]
    }
}

const ROLL_COMMAND = genRollCommand('roll');

const R_COMMAND = genRollCommand('r');

const SHOW_STAT_COMMAND = {
    name: 'showstats',
    description: 'Set whether or not the stats menu will show for you by default',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
    options: [
        {
            type: 5,
            name: 'show',
            description: 'Pick True if you would like the stats menu to show by default, and False otherwise',
            required: true,
        }
    ]
}

const STAT_MENU_COMMAND = {
    name: 'stats',
    description: 'Shows stat menu for your latest roll',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
}


const BEGIN_COMMAND = {
    name: 'begin',
    description: 'Begin a session/encounter/round',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
    options: [
        {
            type: 3,
            name: 'event',
            description: 'Pick event to begin',
            required: true,
            choices: createCommandChoices(),
        },
    ],
}

const END_COMMAND = {
    name: 'end',
    description: 'End a session/encounter/round',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
    options: [
        {
            type: 3,
            name: 'event',
            description: 'Pick event to end',
            required: true,
            choices: createCommandChoices(),
        },
    ],
}

const PRINT_STATS_COMMAND = {
    name: 'print',
    description: 'Print stats for a session/encounter/round',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
    options: [
        {
            type: 3,
            name: 'event',
            description: 'Pick event print stats for',
            required: true,
            choices: createCommandChoices(),
        },
    ],
}

const DEAL_DAMAGE_COMMAND = {
    name: 'dealdamage',
    description: 'Deal damage to a player',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
    options: [
        {
            type: 4,
            name: 'amount',
            description: 'Amount of damage to deal',
            required: true,
        },
        {
            type: 6,
            name: 'player',
            description: 'Player to deal damage to',
            required: true,
        }
    ],
}

const ENEMY_SAVING_COMMAND = {
    name: 'enemysaving',
    description: 'Track the result of an enemy saving throw',
    type: 1,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
    options: [
        {
            type: 5,
            name: 'success',
            description: "Whether enemy succeeded on saving throw",
            required: true,
        },
        {
            type: 6,
            name: 'player',
            description: 'Player to attribute stat to',
            required: true,
        },
        {
            type: 4,
            name: 'amount',
            description: 'Amount (to add multiple successes/failures)',
            required: false,
        },
    ],
}

const ALL_COMMANDS = [ROLL_COMMAND, R_COMMAND, SHOW_STAT_COMMAND, STAT_MENU_COMMAND, BEGIN_COMMAND, END_COMMAND, PRINT_STATS_COMMAND, DEAL_DAMAGE_COMMAND, ENEMY_SAVING_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
