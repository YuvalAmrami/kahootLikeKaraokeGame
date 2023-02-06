// setting up the server
const express = require("express");
const app = express();
////settings
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port  = 4000;

//peer settings
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
    });
const { v4: uuidv4 } = require("uuid"); // for unique id
var uidList = [];

//youtube settings 
const {google} = require("googleapis");
const secret = require ("./secrets.js");
const apiKey = secret.apiKey;
const youtube = google.youtube({
    version: "v3",
    auth: apiKey
});



//HTML
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

// setting the peer communications server
app.use("/peerjs", peerServer);



// serving the HTML files and Handling get request
app.use(express.static(__dirname));
const path = require('path');
const { json } = require("express");
  app.get('/host*', function(req, res) {
    res.sendFile(path.join(__dirname, 'host.html'));
  });
  app.get('/player*', function(req, res) {
    res.sendFile(path.join(__dirname, 'player.html'));
  });
  app.get('/', function(req, res) { 
    res.redirect('player');
  });


//communication
io.on('connection', (socket) => {
  console.log("A user connected!")
  let newUid = uuidv4();
  uidList.push(newUid);
  var connectionInfo = {"port":port,"uid":newUid};
  
  socket.emit('connected',connectionInfo)


  ////youtube api: a player sends a new song search req and the server is youtube searching it.
  socket.on("searchSong",  async (qry)=> {
    try{
      const response = await youtube.search.list({
        part: "snippet",
        q: qry,
      });
      const titles = response.data.items.map((item)=> item.snippet.title);      
      const thumbnails = response.data.items.map((item)=> item.snippet.thumbnails.high);
      const ids = response.data.items.map((item)=> item.id);
      let answer = {'titles':titles,"thumbnails":thumbnails}
      socket.emit('answer', answer)
      //the server asks the player to choose one of the 5 first search results based on titles and thumbnails
      await socket.on("ChosenSong", index=> {
        if (index!= -1){
          //sending new vid to the host player
          io.emit('newVid', ids[index])
        }
        index = -1;
      })

  } catch (err) {
    console.log(err);
    }
  });



});



//SERVER 
server.listen(port , ()=>{
	console.log("Server running on port " + port);
})


// peers funcs
// app.get("/:room", (req, res) => {
//     res.render("host", { roomId: req.param.room });
// });

// io.on("connection", (socket) => {
//     socket.on("join-room", (roomId, userId) => {
//         socket.join(roomId);
//         socket.to(roomId).broadcast.emit("user-connected", userId);
//     });
// });


