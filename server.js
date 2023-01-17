const express = require("express");
const app = express();

//server settings
const server = require('http').Server(app);
const io = require('socket.io')(server);
const port  = 4000;

//for event base actions
const events = require('events');
const timeUpEvent = new events.EventEmitter();

//peer settings
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
    });

//youtube settings 
const {google} = require("googleapis");
const secret = require ("./secrets.js");
const apiKey = secret.apiKey;
const youtube = google.youtube({
    version: "v3",
    auth: apiKey
});

// Calling the public folder
app.use(express.static("public"));

app.use("/peerjs", peerServer);


//HTML
app.engine('html', require('ejs').renderFile);

app.set('view engine', 'ejs');
app.use(express.static(__dirname));
const path = require('path');

// Handling get request
  app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/host.html'));
  });

  app.get('/:player', function(req, res) {
    res.sendFile(path.join(__dirname, '/player.html'));
  });

//youtube api

io.on('connection', (socket) => {
  console.log("A user connected!")

  socket.emit('connected')

  socket.on("searchSong",  async (qry)=> {
    console.log(qry)
  // })
    try{
      const response = await youtube.search.list({
        part: "snippet",
        q: qry,
      });

      const titles = response.data.items.map((item)=> item.snippet.title);      
      const thumbnails = response.data.items.map((item)=> item.snippet.thumbnails);
      const ids = response.data.items.map((item)=> item.id);
      // console.log(titles)
      // console.log(thumbnails)
      // console.log(ids)

      socket.emit('answer', (titles,thumbnails))
      // await   socket.on("choise", index=> {
          let index = 0;  
        if (index!= -1){
          io.emit('newVid', ids[index])
        }
      // })

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


