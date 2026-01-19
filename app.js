import 'dotenv/config';
import express from 'express';
import {
    ButtonStyleTypes,
    InteractionResponseFlags,
    InteractionResponseType,
    InteractionType,
    MessageComponentTypes,
    verifyKeyMiddleware,
} from 'discord-interactions';
import { getRandomEmoji, DiscordRequest, generateStatsMenu } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';
import pkg from 'dice-roller-parser';
import { trackRoll, StatType, registerRoll, beginSession, beginEncounter, beginRound, endSession, endEncounter, endRound, encounterRoundNumber, printEncounter, printSession, modifyStat } from './stats.js';
const { DiceRoller, DiscordRollRenderer } = pkg;

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// To keep track of our active games
const activeGames = {};
// dice roller
const diceRoller = new DiceRoller();
// discord renderer
const renderer = new DiscordRollRenderer();

let showDefault = new Set();    


/**
* Interactions endpoint URL where Discord will send HTTP requests
* Parse request body and verifies incoming requests using discord-interactions package
*/
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
    // Interaction id, type and data
    const { id, type, data } = req.body;
    
    /**
    * Handle verification requests
    */
    if (type === InteractionType.PING) {
        return res.send({ type: InteractionResponseType.PONG });
    }
    
    /**
    * Handle slash command requests
    * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
    */
    if (type === InteractionType.APPLICATION_COMMAND) {
        const { name } = data;
        
        // "test" command
        if (name === 'test') {
            // Send a message into the channel where command was triggered from
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                    components: [
                        {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            // Fetches a random emoji to send from a helper function
                            content: `hello world ${getRandomEmoji()}`
                        }
                    ]
                },
            });
        }
        
        if (name === 'roll' || name === 'r') {
            // Interaction context
            const context = req.body.context;
            // User ID is in user field for (G)DMs, and member for servers
            const userId = context === 0 ? req.body.member.user.id : req.body.user.id;
            const username = context === 0 ? req.body.member.user.global_name : req.body.user.global_name;
            // User's object choice
            const rollString = req.body.data.options[0].value;

            let showValue = req.body.data.options[1]?.value;
            if (showValue === undefined) {
                //console.log("setting hide value based on preference");
                if (showDefault.has(userId)) {
                    showValue = true;
                }
                else {
                    showValue = false;
                }
            }

            let scaleValue = req.body.data.options[2]?.value;
            if (scaleValue === undefined) scaleValue = 1;
            
            const roll = diceRoller.roll(rollString);
            
            const render = renderer.render(roll);
            //console.log(render);
            //console.log(hideValue);

            trackRoll(userId, roll.value * scaleValue);

            const scaleString = `\n*Your result will be scaled by* \`${scaleValue}\` *in tracking*`
            
            // send a message with the rolled value
            let value = res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                    components: [
                        {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            content: `:game_die: **${username}** Request: \`${rollString}\` Roll: ${render} ${scaleValue != 1 ? scaleString : ""}`
                        },
                    ]
                },
            });

            if (showValue === true) {
                await DiscordRequest(
                    `webhooks/${process.env.APP_ID}/${req.body.token}`,
                    {
                        method: 'POST',
                        body: generateStatsMenu(req.body.id),
                    }
                );
            }


            return value;
        }
        
        if (name === 'showstats') {
            // Interaction context
            const context = req.body.context;
            // User ID is in user field for (G)DMs, and member for servers
            const userId = context === 0 ? req.body.member.user.id : req.body.user.id;

            const showValue = req.body.data.options[0]?.value;

            if (showValue === true) {
                showDefault.add(userId);
            }
            else {
                showDefault.delete(userId);
            }

            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
                    components: [
                        {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            // Fetches a random emoji to send from a helper function
                            content: `By default, the stats menu will ${showValue === true ? "**SHOW**" : "**HIDE**"} when you roll.`
                        }
                    ]
                },
            });
        }

        if (name === 'stats') {
            // Interaction context
            const context = req.body.context;
            // User ID is in user field for (G)DMs, and member for servers
            const userId = context === 0 ? req.body.member.user.id : req.body.user.id;

            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: generateStatsMenu(userId),
            })
        }

        if (name === 'begin') {
            // Interaction context
            const context = req.body.context;
            // User ID is in user field for (G)DMs, and member for servers
            const userId = context === 0 ? req.body.member.user.id : req.body.user.id;
            // User's event choice
            const eventName = req.body.data.options[0].value;
            if (eventName === "session") {
                beginSession();
            }
            else if (eventName === "encounter") {
                beginEncounter();
            }
            else if (eventName === "round") {
                beginRound();
            }

            // Send a message into the channel where command was triggered from
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                    components: [
                        {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            content: `Beginning ${eventName}${eventName === "round" ? " " + encounterRoundNumber : ""}!`
                        }
                    ]
                },
            });
        }

        if (name === 'end') {
            // Interaction context
            const context = req.body.context;
            // User ID is in user field for (G)DMs, and member for servers
            const userId = context === 0 ? req.body.member.user.id : req.body.user.id;
            // User's event choice
            const eventName = req.body.data.options[0].value;
            if (eventName === "session") {
                endSession();
            }
            else if (eventName === "encounter") {
                endEncounter();
            }
            else if (eventName === "round") {
                endRound();
            }

            // Send a message into the channel where command was triggered from
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                    components: [
                        {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            content: `Ending ${eventName}${eventName === "round" ? " " + encounterRoundNumber : ""}!`
                        }
                    ]
                },
            });
        }

        if (name === 'print') {
            // Interaction context
            const context = req.body.context;
            // User ID is in user field for (G)DMs, and member for servers
            const userId = context === 0 ? req.body.member.user.id : req.body.user.id;
            // User's event choice
            const eventName = req.body.data.options[0].value;

            let outString = "";
            if (eventName === "session") {
                outString = `Session Stats:\n\n${printSession()}`;
            }
            else if (eventName === "encounter") {
                outString = `Encounter Stats:\n\n${printEncounter()}`;
            }
            else if (eventName === "round") {
                
            }
            // Send a message into the channel where command was triggered from
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                    components: [
                        {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            content: outString
                        }
                    ]
                },
            });
        }

        if (name === 'dealdamage') {
            // Interaction context
            const context = req.body.context;
            // User ID is in user field for (G)DMs, and member for servers
            const userId = context === 0 ? req.body.member.user.id : req.body.user.id;
            
            const amount = req.body.data.options[0].value;
            const player = req.body.data.options[1].value;

            modifyStat(player, amount, StatType.DamageTaken);

            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                    components: [
                        {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            content: `<@${player}> received \`${amount}\` damage!`
                        }
                    ]
                },
            });
        }
        console.error(`unknown command: ${name}`);
        return res.status(400).json({ error: 'unknown command' });
    }
    
    if (type === InteractionType.MESSAGE_COMPONENT) {
        // custom_id set in payload when sending message component
        const componentId = data.custom_id;
        
        if (componentId.startsWith('track_')) {
            // Interaction context
            const context = req.body.context;
            // Delete message with token in request body
            const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

            // let messageContent = "Stat Tracked: ";
            let trackType;

            if (componentId.startsWith('track_attack_miss_')) {
                // messageContent += "Attack - Miss";
                trackType = StatType.Miss;
            }
            else if (componentId.startsWith('track_attack_hit_')) {
                // messageContent += "Attack - Hit";
                trackType = StatType.Hit;
            }
            else if (componentId.startsWith('track_healing_')) {
                // messageContent += "Healing";
                trackType = StatType.Healing;
            }
            else if (componentId.startsWith('track_damage_')) {
                // messageContent += "Damage";
                trackType = StatType.DamageDealt;
            }
            // else {
            //     messageContent = "Error: Unknown stat tracked";
            // }

            const userId = context === 0 ? req.body.member.user.id : req.body.user.id;
            registerRoll(userId, trackType);

            // // Send results
            // await res.send({
            //     type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            //     data: {
            //         flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
            //         components: [
            //             {
            //                 type: MessageComponentTypes.TEXT_DISPLAY,
            //                 content: messageContent,
            //             }
            //         ]
            //     },
            // });
            // Delete stats menu
            DiscordRequest(endpoint, { method: 'DELETE' });
        }
        
        return;
    }
    
    
    console.error('unknown interaction type', type);
    return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});
