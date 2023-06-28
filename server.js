//////////////////////////////////////////////settings

// setting up the server
const express = require("express");
const app = express();
const server = require('http').Server(app);
const port  = 4000;

//Socket
const  socket = require('socket.io');
const io = socket(server);

//peer settings
const peerPort  = 4001;
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
    });

 // management elements    
 const playersSocketsToInfoMap = new Map();
 const hostsSerialsToInfoMap = new Map();
 const hostSocketToSerialMap = new Map();
 const playersSocketsToHostsMap = new Map();
 const hostsToPlayersMap = new Map();
// const { json } = require("express");


//youtube settings 
const {google} = require("googleapis");
const secret = require ("./secrets.js"); /// your personal youtube OAuth apiKey
const apiKey = secret.apiKey;
const youtube = google.youtube({
    version: "v3",
    auth: apiKey
});


//HTML engine: ejs
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

// setting the peer communications server
app.use("/peerjs", peerServer);


//////////////////////////////////////////////API

// serving the HTML files and Handling get request
app.use(express.static(__dirname));
const path = require('path');
app.get('/host*', function(req, res) {
  res.sendFile(path.join(__dirname, 'host.html'));
});
app.get('/player*', function(req, res) {
  res.sendFile(path.join(__dirname, 'player.html'));
});
app.get('/', function(req, res) { 
  res.redirect('player');
});


//////////////////////////////////////////////communication
io.on("connection", (socket) => {
  console.log("A user connected!",socket.id)
  socket.emit("connected");
  var isHost = 0;
  socket.on("PlayerName",({"socket":socketId,"Name" :PlayerNameInputBar, "PeerID": peerID})=>  {
    // console.log("A new PlayerName!",PlayerNameInputBar)
    // console.log("peerID!",peerID)

    playersSocketsToInfoMap.set(socketId, {"Name" :PlayerNameInputBar, "PeerID": peerID});
    // socket.broadcast.emit("NewPlayerAdded",{"socket":socketId,"Name" :PlayerNameInputBar, "PeerID": peerID});
  })

  socket.on("hostConnection",({"SocketId":socketId, "PeerId": peerId})=>{
    isHost = 1;
    let hostSerial = Math.floor(Math.random() *1000000).toString();
    hostsSerialsToInfoMap.set(hostSerial, {"SocketId":socketId, "PeerId": peerId});
    hostSocketToSerialMap.set(socketId, hostSerial);

    socket.join(hostSerial);
    socket.emit("hostName",hostSerial);

    // socket.broadcast.emit("hostPeerInfo",peerId);
    console.log("socketId " + socketId);
    console.log("peerId " + peerId);
  })

  socket.on("joinHostRoom", ({"HostId":hostId,"PlayerName" :playerName}) => {
    let playerSocket = socket.id;
    let hostWithId = hostsSerialsToInfoMap.get(hostId)
    if(hostWithId !==undefined){
        let hostPeer = hostWithId.PeerId;
      socket.join(hostId);
      if(hostsToPlayersMap.has(hostId)){
        hostsToPlayersMap.set(hostId, hostsToPlayersMap.get(hostId).push(playerSocket));
      }
      else{
        const HostPlayers = [playerSocket]
        hostsToPlayersMap.set(hostId,HostPlayers);
      }
      playersSocketsToHostsMap.set(playerSocket,hostId)
      socket.emit("playerHostConn", ({"HostId":hostId,"HostPeer":hostPeer}));
    }else{
      socket.emit("couldNotFindHost", hostId);
    }
  });

  ///////////////////////////////////////youtube api: 
  //a player sends a new song search req and the server is youtube searching it.
  socket.on("searchSong",  async ({"qry":qry,"NumOfResult":NumOfResult})=> {
    try{
      const response = await youtube.search.list({
        part: "snippet",
        q: qry,
        maxResults:NumOfResult,
      });
      const titles = response.data.items.map((item)=> item.snippet.title);      
      const thumbnails = response.data.items.map((item)=> item.snippet.thumbnails.high);
      const ids = response.data.items.map((item)=> item.id);
      let answer = {'titles':titles,"thumbnails":thumbnails}
      socket.emit('answer', answer)
      //the server asks the player to choose one of the NumOfResult search results based on titles and thumbnails
      await socket.on("ChosenSong", index=> {
        if (index!= -1){
          //sending new vid to the host player
          let roomNumber = playersSocketsToHostsMap.get(socket.id);
          if(roomNumber!==-1){
            io.to(roomNumber).emit('newVid', ids[index]);
          }
          // socket.broadcast.emit('newVid', ids[index])
        }
        index = -1;
      })
  } catch (err) {
    console.log(err);
    }
  });


  socket.on('disconnect', () => {
    var socketId = socket.id
    if (isHost===1){
      let serial = hostSocketToSerialMap.get(socketId);
      
      // remove host from host lists

      hostSocketToSerialMap.delete(socketId);
      hostsSerialsToInfoMap.delete(serial);

      // remove host from other lists
      let listOfPlayers = hostsToPlayersMap.get(serial);
      hostsToPlayersMap.delete(serial);
      if(listOfPlayers !== undefined){
        console.log("host listOfPlayers " + listOfPlayers);


        listOfPlayers.forEach((playerOfThatHost)=>{
          playersSocketsToHostsMap.set(playerOfThatHost,-1);
        }) 
      }
      io.to(serial).emit('host-disconnected', serial);
      console.log("host disconnect " + serial);

      io.in(serial).socketsLeave(serial);
      io.to(serial).emit('host-disconnected', serial);


    }else{
      let hostSerial = playersSocketsToHostsMap.get(socketId);
      let playerInfo = playersSocketsToInfoMap.get(socketId);

      // remove player from host lists
      let hostsArray = hostsToPlayersMap.get(hostSerial);
      if(hostsArray !== undefined){
        const indexOfPlayer = hostsArray.indexOf(socketId);
        hostsToPlayersMap.set(hostSerial, hostsArray.splice(indexOfPlayer, 1))
      }
      // remove player from other lists
      playersSocketsToHostsMap.delete(socketId);
      playersSocketsToInfoMap.delete(socketId);


      io.to(hostSerial).emit('player-disconnected', playerInfo);
      console.log("disconnect " + playerInfo);
    }

  
  })

});



//SERVER 
server.listen(port , ()=>{
	console.log("Server running on port " + port);
})
