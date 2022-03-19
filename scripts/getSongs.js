var songs = []
var x = $("ytmusic-responsive-list-item-renderer").each(function() {
    var songContainer = $($(this).find("yt-formatted-string.title"))
    var artistContainer = $($(this).find(".secondary-flex-columns > yt-formatted-string"))
    var artist = $(artistContainer[0]).text()
    var retSongObj = {
        "title": $(songContainer).text(),
        "artist": artist
    }
    if(artistContainer.length > 1 && $(artistContainer[1]).text().length > 0)
        retSongObj["album"] = $(artistContainer[1]).text()
    songs.push(retSongObj)
})
console.log(songs)