let sessionStats_DamageTaken = {};
let encounterStats_DamageTaken = {};
let latestStats_DamageTaken = {};

let sessionStats_DamageDealt = {};
let encounterStats_DamageDealt = {};
let latestStats_DamageDealt = {};

let sessionStats_Hits = {};
let encounterStats_Hits = {};
let latestStats_Hits = {};

let sessionStats_Miss = {};
let encounterStats_Miss = {};
let latestStats_Miss = {};

let sessionStats_EnemySaving = {};
let encounterStats_EnemySaving = {};
let latestStats_EnemySaving = {};

let sessionStats_EnemySavingFail = {};
let encounterStats_EnemySavingFail = {};
let latestStats_EnemySavingFail = {};

let sessionStats_Healing = {};
let encounterStats_Healing = {};
let latestStats_Healing = {};

let latestRolls = [];
let maxRollsKept = 10;

let sessionRounds = 0;
export let encounterRoundNumber = 0;

const encounterStats = [encounterStats_DamageDealt, encounterStats_DamageTaken, encounterStats_Healing, encounterStats_EnemySaving, 
                        encounterStats_EnemySavingFail, encounterStats_Hits, encounterStats_Miss]

const sessionStats = [sessionStats_DamageDealt, sessionStats_DamageTaken, sessionStats_Healing, sessionStats_EnemySaving, 
                        sessionStats_EnemySavingFail, sessionStats_Hits, sessionStats_Miss]

const latestStats =  [latestStats_DamageDealt, latestStats_DamageTaken, latestStats_Healing, latestStats_EnemySaving, 
                        latestStats_EnemySavingFail, latestStats_Hits, latestStats_Miss]

export const StatType = {
    DamageDealt: "DamageDealt",
    DamageTaken: "DamageTaken",
    Miss: "Miss",
    Hit: "Hit",
    EnemySaving: "EnemySaving",
    EnemySavingFail: "EnemySavingFail",
    Healing: "Healing",
}

export function beginSession() {
    console.log("Beginning Session");

    resetSessionStats();
    resetEncounterStats();
    resetLatestStats();
}

export function beginEncounter() {
    console.log("Beginning Encounter");

    resetEncounterStats();
    resetLatestStats();
}

export function beginRound() {
    console.log("Beginning Round");

    encounterRoundNumber++;
}

export function endSession() {
    console.log("Ending Session");
}

export function endEncounter() {
    console.log("Ending Encounter");
    console.log("Recording encounter stats to the session");
    let eStat = {};
    let sStat = {};

    for(let i = 0; i < encounterStats.length; i++) {
        eStat = encounterStats[i];
        sStat = sessionStats[i];
        Object.keys(eStat).forEach(key => {
            if (key in sStat) {
                sStat[key] += eStat[key];
            }
            else {
                sStat[key] = eStat[key];
            }
        });
    }
    sessionRounds += encounterRoundNumber;

    console.log("Reseting Encounter");
    resetEncounterStats();
    resetLatestStats();
}

export function endRound() {
    console.log("Ending Round");
}

export function modifyStat(userID, value, stat) {
    let latestOfStat = {};
    let encounterOfStat = {};

    if (stat === StatType.DamageDealt) {
        latestOfStat = latestStats_DamageDealt;
        encounterOfStat = encounterStats_DamageDealt;
    }
    else if (stat === StatType.DamageTaken) {
        latestOfStat = latestStats_DamageTaken;
        encounterOfStat = encounterStats_DamageTaken
    }
    else if (stat === StatType.EnemySaving) {
        latestOfStat = latestStats_EnemySaving;
        encounterOfStat = encounterStats_EnemySaving;
    }
    else if (stat === StatType.EnemySavingFail) {
        latestOfStat = latestStats_EnemySavingFail;
        encounterOfStat = encounterStats_EnemySavingFail;
    }
    else if (stat === StatType.Healing) {
        latestOfStat = latestStats_Healing;
        encounterOfStat = encounterStats_Healing;
    }
    else if (stat === StatType.Hit) {
        latestOfStat = latestStats_Hits;
        encounterOfStat = encounterStats_Hits;
        value /= value;
    }
    else if (stat === StatType.Miss) {
        latestOfStat = latestStats_Miss;
        encounterOfStat = encounterStats_Miss;
        value /= value;
    }

    latestOfStat[userID] = value;
    if (userID in encounterOfStat) {
        encounterOfStat[userID] += value;
    }
    else {
        encounterOfStat[userID] = value;
    }

}

export function trackRoll(userID, roll) {
    latestRolls.unshift([userID, roll])
    if (latestRolls.length > maxRollsKept) {
        latestRolls.pop();
    }
}

// Finds the index of the most recent roll for the user
// Returns -1 if there is no such recent roll
function findRecentIndex(userID) {
    for (let i = 0; i < latestRolls.length; i++) {
        let roll = latestRolls[i];
        if (latestRolls[i][0] === userID) {
            return i;
        }
    }
    return -1;
}

export function registerRoll(userID, stat) {
    let idx = findRecentIndex(userID);
    if (idx === -1) 
        return false;
    let roll = latestRolls[idx];
    modifyStat(roll[0], roll[1], stat);
}

function resetSessionStats() {
    Object.keys(sessionStats_DamageDealt).forEach(k => sessionStats_DamageDealt[k] = 0);
    Object.keys(sessionStats_DamageTaken).forEach(k => sessionStats_DamageTaken[k] = 0);
    Object.keys(sessionStats_EnemySaving).forEach(k => sessionStats_EnemySaving[k] = 0);
    Object.keys(sessionStats_EnemySavingFail).forEach(k => sessionStats_EnemySavingFail[k] = 0);
    Object.keys(sessionStats_Healing).forEach(k => sessionStats_Healing[k] = 0);
    Object.keys(sessionStats_Hits).forEach(k => sessionStats_Hits[k] = 0);
    Object.keys(sessionStats_Miss).forEach(k => sessionStats_Miss[k] = 0);
    sessionRounds = 0;
}

function resetEncounterStats() {
    Object.keys(encounterStats_DamageDealt).forEach(k => encounterStats_DamageDealt[k] = 0);
    Object.keys(encounterStats_DamageTaken).forEach(k => encounterStats_DamageTaken[k] = 0);
    Object.keys(encounterStats_EnemySaving).forEach(k => encounterStats_EnemySaving[k] = 0);
    Object.keys(encounterStats_EnemySavingFail).forEach(k => encounterStats_EnemySavingFail[k] = 0);
    Object.keys(encounterStats_Healing).forEach(k => encounterStats_Healing[k] = 0);
    Object.keys(encounterStats_Hits).forEach(k => encounterStats_Hits[k] = 0);
    Object.keys(encounterStats_Miss).forEach(k => encounterStats_Miss[k] = 0);
    encounterRoundNumber = 0;
}

function resetLatestStats() {
    latestStats_DamageDealt = {};
    latestStats_DamageTaken = {};
    latestStats_EnemySaving = {};
    latestStats_EnemySavingFail = {};
    latestStats_Healing = {};
    latestStats_Hits = {};
    latestStats_Miss = {};
}

export function printEncounter() {
    return `**Rounds:** ${encounterRoundNumber}\n` +
    `**Damage Dealt:** \n${formatDict(encounterStats_DamageDealt)}` +
    `**Damage Taken:** \n${formatDict(encounterStats_DamageTaken)}` + 
    `**Healing:** \n${formatDict(encounterStats_Healing)}` +
    `**Accuracy:** \n${formatAccuracy(encounterStats_Hits, encounterStats_Miss)}` +
    `**Damage Per Round:** \n${formatDictPerRound(encounterStats_DamageDealt, encounterRoundNumber)}` +
    `**Enemy Saving Throw Percent:** \n${formatAccuracy(encounterStats_EnemySaving, encounterStats_EnemySavingFail)}`
}

export function printSession() {
    return `**Rounds:** ${sessionRounds}\n` +
    `**Damage Dealt:** \n${formatDict(sessionStats_DamageDealt)}` +
    `**Damage Taken:** \n${formatDict(sessionStats_DamageTaken)}` + 
    `**Healing:** \n${formatDict(sessionStats_Healing)}` +
    `**Accuracy:** \n${formatAccuracy(sessionStats_Hits, sessionStats_Miss)}` +
    `**Damage Per Round:** \n${formatDictPerRound(sessionStats_DamageDealt, sessionRounds)}`
    `**Enemy Saving Throw Percent:** \n${formatAccuracy(sessionStats_EnemySaving, sessionStats_EnemySavingFail)}`
}

function formatDict(dict) {
    let string = "";
    let entries = Object.entries(dict);
    let sorted = entries.sort((a,b) => a[1] - b[1]);
    for (let i = 0; i < sorted.length; i++) {
        string += `\t${i + 1}: <@${sorted[i][0]}> ${sorted[i][1]}\n`;
    }
    return string;
}

function formatDictPerRound(dict, numRounds) {
    let string = "";
    let entries = Object.entries(dict);
    let sorted = entries.sort((a,b) => a[1] - b[1]);
    for (let i = 0; i < sorted.length; i++) {
        let perRound = sorted[i][1] / numRounds
        string += `\t${i + 1}: <@${sorted[i][0]}> ${parseFloat(perRound).toFixed(2)}\n`;
    }
    return string;
}

function formatAccuracy(dictHit, dictMiss) {
    let string = "";
    // In case someone has 0 misses
    for (const [key, value] of Object.entries(dictHit)) {
        if (!(key in dictMiss)) {
            dictMiss[key] = 0
        }
    }
    // In case someone has 0 hits
    for (const [key, value] of Object.entries(dictMiss)) {
        if (!(key in dictHit)) {
            dictHit[key] = 0
        }
    }
    let hitEntries = Object.entries(dictHit);
    let missEntries = Object.entries(dictMiss);
    let hitSorted = hitEntries.sort((a,b) => a[0] - b[0]);
    let missSorted = missEntries.sort((a,b) => a[0] - b[0]);
    
    for (let i = 0; i < hitSorted.length; i++) {
        let accuracy = hitSorted[i][1] / (hitSorted[i][1] + missSorted[i][1]);
        string += `\t${i + 1}: <@${hitSorted[i][0]}> ${parseFloat(accuracy).toFixed(2)}\n`;
    }
    return string;
}