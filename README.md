# karaoke project -"Kahoot!-like karaoke" 
a karaoke system that operates like a Kahoot game with host and player screens. 
Instead of using expansive dedicated equipment, the microphone will be your own phone, and the karaoke screen your computer or smart tv.
using youtube you'll have all the karaoke/sing-along songs the web has to offer.

node js packeges in use:
express,
googleapis,
socket.io,
ejs,
peerjs


in order to activate the Youtube API key is needed and should be added to a file called secrets.js on the base folder at the following structure:
" module.exports = { apiKey: &apiKey } ".

in order to get your own Youtube API flow these steps:
https://developers.google.com/youtube/registering_an_application
