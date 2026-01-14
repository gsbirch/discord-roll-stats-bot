import { use } from "react";

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

let sessionRounds = 0;
let encounterRoundNumber = 0;

const encounterStats = [encounterStats_DamageDealt, encounterStats_DamageTaken, encounterStats_Healing, encounterStats_EnemySaving, 
                        encounterStats_EnemySavingFail, encounterStats_Hits, encounterStats_Miss]

const sessionStats = [sessionStats_DamageDealt, sessionStats_DamageTaken, sessionStats_Healing, sessionStats_EnemySaving, 
                        sessionStats_EnemySavingFail, sessionStats_Hits, sessionStats_Miss]

const latestStats =  [latestStats_DamageDealt, latestStats_DamageTaken, latestStats_Healing, latestStats_EnemySaving, 
                        latestStats_EnemySavingFail, latestStats_Hits, latestStats_Miss]

const StatType = {
    DamageDealt: "DamageDealt",
    DamageTaken: "DamageTaken",
    Miss: "Miss",
    Hit: "Hit",
    EnemySaving: "EnemySaving",
    EnemySavingFail: "EnemySavingFail",
    Healing: "Healing",
}

function beginSession() {
    console.log("Beginning Session");

    resetSessionStats();
    resetEncounterStats();
    resetLatestStats();
}

function beginEncounter() {
    console.log("Beginning Encounter");

    resetEncounterStats();
    resetLatestStats();
}

function beginRound() {
    console.log("Beginning Round");

    encounterRoundNumber++;
}

function endSession() {
    console.log("Ending Session");
}

function endEncounter() {
    console.log("Ending Encounter");
    console.log("Recording encounter stats to the session");

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

function endRound() {
    console.log("Ending Round");
}

function modifyStat(userID, value, stat) {
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
    }
    else if (stat === StatType.Miss) {
        latestOfStat = latestStats_Miss;
        encounterOfStat = encounterStats_Miss;
    }

    latestOfStat[userID] = value;
    if (userID in encounterOfStat) {
        encounterOfStat[userID] += value;
    }
    else {
        encounterOfStat[userID] = value;
    }
}

function resetSessionStats() {
    sessionStats_DamageDealt = {};
    sessionStats_DamageTaken = {};
    sessionStats_EnemySaving = {};
    sessionStats_Healing = {};
    sessionStats_Hits = {};
    sessionStats_Miss = {};
    sessionRounds = 0;
}

function resetEncounterStats() {
    encounterStats_DamageDealt = {};
    encounterStats_DamageTaken = {};
    encounterStats_EnemySaving = {};
    encounterStats_Healing = {};
    encounterStats_Hits = {};
    encounterStats_Miss = {};
    encounterRoundNumber = 0;
}

function resetLatestStats() {
    latestStats_DamageDealt = {};
    latestStats_DamageTaken = {};
    latestStats_EnemySaving = {};
    latestStats_Healing = {};
    latestStats_Hits = {};
    latestStats_Miss = {};
}