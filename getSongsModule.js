//////////////////////////////
// Luca D.
// 3-17-2022
//
// Given an array of song names,
// artists, and albums, this script
// attempts to compile a list of
// Spotify ID's with the corresponding
// names.
//
//////////////////////////////

//////////////////////////////
// Configuration:
//////////////////////////////

const MAX_SONGS = 25
const SONGS_BETWEEN_PROMPTS = 5
const SONGS_OFFSET = 1500
const SONGS_IN = "./data/ex_songs.json"
const IDS_OUT = "./scripts/song_ids.json"
const AUTH_TOKEN = ""

//////////////////////////////
// Imports:
//////////////////////////////

const fs = require('fs');
const https = require('https');
const prompt = require('prompt-sync')();

//////////////////////////////
// Load songs:
//////////////////////////////

var songs = require(SONGS_IN)

//////////////////////////////
// Prepare for user input:
//////////////////////////////

const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });


//////////////////////////////
// Accumulators:
//////////////////////////////

// Array of all string id's
var ids = require(IDS_OUT)

//////////////////////////////
// Helpers:
//////////////////////////////

// Flow:
// Enter ==> reqSongs ==> getSpotifyInformation ==> onSongReceive ==> reqSongs
//                                      (error) ==> reqSongs(?)

function reqSongs(songIndex) {
    // Check not out of bounds
    if(SONGS_OFFSET + songIndex >= songs.length - 1)
        exitProcess()
    // Find the object with the song's title, name, album
    var song = songs[songIndex + SONGS_OFFSET];
    // Inform of current status
    console.log(`[PREP] Preparing to search for ${toggle("red")}${song["title"]}${toggle()} by ${toggle("red")}${song["artist"]}${toggle("reset")}`)
    // Construct a query for the spotify APAI
    var query = ("track: " + song["title"] + " artist: " + song["artist"]).toLowerCase()
    // Prepare JSON payload for API
    var options = {
        // Passed to local functions
        "title": song["title"],
        "artist": song["artist"],
        "str": "",
        // Request information
        "method": "GET",
        "host": "api.spotify.com",
        "path": `/v1/search?q=${encodeURIComponent(query)}&type=track&limit=3`,
        "headers": {
            "Authorization": `Bearer ${AUTH_TOKEN}`
        },
    }
    // Manage request
    try {
        getSpotifyInformation(options, songIndex)
    } catch(e) {
        console.log("[API] [ERROR] " + e)
        shouldContinue(songIndex)
    }
}

function getSpotifyInformation(options, songIndex) {
    console.log(`[API] Executing request.`)
    const req = https.request(options, res => {
        // Accumulate data from GET request
        res.on("data", d => {
            options["str"] += d
        })
        // Run on completion
        res.on("end", function() {
            console.log(`[PREP] Finished search.`)
            onSongReceive(options["str"], options["title"], options["artist"], songIndex)
        })
        res.on("error", function(e) {
            console.log("[API] Errored out: " + e)
        })
    })
    req.on("error", function(e) {
        console.log("[API] Error: " + e)
        // shouldContinue(songIndex)
    })
    req.end()
}

function onSongReceive(stringData, title, artist, songIndex) {
    // If there's been an error with the API, sometimes
    // the data isn't in proper JSON format
    try {
        var stringData = JSON.parse(stringData.toString())
    } catch(e) {
        console.log("[API] [PROCESSING] Data failed to parse")
        shouldContinue(songIndex)
        return
    }
    if(stringData == undefined || !("tracks" in stringData)) {
        console.log("[API] Cooldown enabled...")
        console.log(stringData)
        setTimeout(reqSongs, 5000, songIndex)
        return
    }
    // If an error is thrown, then it won't appear
    if(!("items" in stringData["tracks"])) {
        console.log("[API] [PROCESSING] Data not in search-result form")
        shouldContinue(songIndex)
        return
    }
    // No results
    if(stringData["tracks"]["items"].length == 0) {
        console.log("[API] [PROCESSING] No results found")
        modifySong(songIndex)
        return
    }
    console.log(`[API] [PROCESSING] Found id ${toggle("red")}${stringData["tracks"]["items"][0]["id"]}${toggle()}`)
    var id = stringData["tracks"]["items"][0]["id"]
    if(ids.indexOf(id) == -1)
        ids.push(id)
    // Will prompt every X songs
    shouldContinue(songIndex, (songIndex % SONGS_BETWEEN_PROMPTS == 0) ? false : true)
}

// Allows the user to modify the current search
// if no results are found

function modifySong(songIndex) {
    // If neither element changes, then skip this song
    var changed = false
    console.log("[MODIFY] Entering modifying. Press enter to skip any.")
    var actualIndex = songIndex + SONGS_OFFSET
    // Title
    var replObj = {}
    var newTitle = prompt(`[MODIFY] New title? `, " ")
    if(newTitle != " ") {
        songs[actualIndex]["title"] = newTitle
        changed = true
    }
    // Artist
    var newArtist = prompt(`[MODIFY] New artist? `, " ")
    if(newArtist != " ") {
        songs[actualIndex]["artist"] = newArtist
        changed = true
    }
    console.clear()
    reqSongs(songIndex + ((changed) ? 0 : 1))
}

// Asks user if they would like to continue with the process
// If so, it iterates to the next song; otherwise, it manages
// exporting the current ID's
function shouldContinue(songIndex, bypass = false) {
    // If we already exceeded the limit, then no -- don't continue
    if(songIndex + 1 >= MAX_SONGS) {
        console.log("[STATUS] Maximum song index reached. Last checked: " + (SONGS_OFFSET + songIndex))
        exitProcess()
    }
    // Prevents prompting for easy completions
    if(bypass) {
        console.clear()
        reqSongs(songIndex + 1)
        return
    }
    // Ask if next song should be executed
    console.log(`[CHECK IN] ${toggle("green")}Song interval reached. Take a break!${toggle()}`)
    readline.question("[STATUS] Would you like to exit? (y)", con => {
        if(con.toLowerCase().indexOf("y") != -1) {
            console.log("[STATUS] Now exiting with last song index of: " + (SONGS_OFFSET + songIndex))
            exitProcess()
        }
        console.clear()
        reqSongs(songIndex + 1)
    });
}

//////////////////////////////
// Pre-exit export of id's:
//////////////////////////////

function exitProcess() {
    let data = JSON.stringify(ids);
    fs.writeFileSync(IDS_OUT, data);
    process.exit(200)
}

// to do: find which one of these is actually doing
// its job and delete the rest.

process.on("beforeExit", (code) => {
    console.log("[STATUS] Ending.")
    exitProcess()
})

process.on('exit', (code) => {
    console.log("[STATUS] Ending.")
    exitProcess()
});


process.on('SIGINT', (code) => {
    console.log("[STATUS] Ending.")
    exitProcess()
});

//////////////////////////////
// Print Styling:
//////////////////////////////

function toggle(color) {
    switch(color) {
        case "cyan":
            return "\x1b[36m"
        case "red":
            return "\x1b[31m"
        case "green":
            return "\x1b[32m"
        default:
            return "\x1b[0m"
    }
}

function clearConsole() {
    console.clear()
}

//////////////////////////////
// Start:
//////////////////////////////

clearConsole()
reqSongs(0)