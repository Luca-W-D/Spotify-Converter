# Spotify-Converter

Overview

1. Grabs a list of song information from your given playlist on a different platform
1. Converts the song names into a list of Spotify song id's
1. Imports the list of song id's into your Spotify account

Instructions:
1. If you're using Youtube Music, you may use the script in `scripts/getSongs.js` to scrape data from the web page itself. If you inject jQuery into the page and load all elements in your `liked` playlist, you can then run the script to export a string version of all your songs.
1. Grab a basic Spotify authentication token (can be done at https://developer.spotify.com/console/get-search-item/).
1. Configure `getSongsModule.js` with your authentication token, the amount of songs in the list you'd like to scan (MAX_SONGS), how often you want to be prompted to exit (SONGS_BETWEEN_PROMPTS), what index in your list you want to start at (SONGS_OFFSET) and the file locations of your existing information and desired output. *Please note that the desired output file should be initialized before starting, you may start with the same version as `scripts/TEMPLATE-song_ids.json` but it does **not** have to be empty*.
1. Iterate over as many songs as you'd like to add to your library.
1. Configure `addSongs.js` with a new Spotify authentication token with permissions to edit your library. Let the script run to add the desired number of songs.