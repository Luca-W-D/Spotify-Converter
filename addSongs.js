//////////////////////////////
// Luca D.
// 3-18-2022
//
// Given an array of Spotify song ID's,
// this script will insert the
// songs into your library, aka
// "your likes."
//
//////////////////////////////

//////////////////////////////
// Configuration:
//////////////////////////////

const IDS_LOCATION = "./scripts/song_ids.json"
const ITERATE_BY = 50 // Spotify default
const AUTH_TOKEN = ""
const MS_BETWEEN_REQUESTS = 5000

//////////////////////////////
// Imports:
//////////////////////////////

var https = require("https")

//////////////////////////////
// Prep songs:
//////////////////////////////

const ALL_IDs = require(IDS_LOCATION)
var starting_index = 0

//////////////////////////////
// Main Functionality:
//////////////////////////////

// Basic recursive function
// to maintain X amount of seconds
// between Spotify requests.
function executeAdd() {
    run()
    setTimeout(() => {
        starting_index += ITERATE_BY
        executeAdd()
    }, MS_BETWEEN_REQUESTS)
}

function run() {
    var upperIndex = starting_index + 50
    if(upperIndex > ALL_IDs.length)
        upperIndex = ALL_IDs.length
    var ids = ALL_IDs.slice(starting_index, starting_index + 50)

    var options = {
        // Passed to local functions
        "str": "",
        // Request information
        "method": "PUT",
        "host": "api.spotify.com",
        "path": `/v1/me/tracks`,
        "headers": {
            "Authorization": `Bearer ${AUTH_TOKEN}`
        },
    }

    const req = https.request(options, res => {
        // Accumulate data from GET request
        res.on("data", d => {
            options["str"] += d
        })
        // Run on completion
        res.on("end", function() {
            console.log(`[PREP] Finished search.`)
            console.log(options["str"])
        })
        res.on("error", function(e) {
            console.log("[API] Errored out: " + e)
        })
    })
    req.on("error", function(e) {
        console.log("[API] Error: " + e)
    })
    req.end(JSON.stringify(ids))
}

//////////////////////////////
// Start:
//////////////////////////////

executeAdd()