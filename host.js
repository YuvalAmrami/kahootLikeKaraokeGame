///////////////////////////////////////////////////////////// const and var 
const socket = io();

var thisHostUid;
var thisHostName;

var hostPeer = new Peer(
  undefined,{
    host: 'localhost',
    port: '4000',
    path: '/peerjs'
  });

var hostPeerId;

const emptyMediaTrack = createEmptyAudioTrack();
const emptyStream = new MediaStream(emptyMediaTrack);

var playersVoicesGrid = document.getElementById("playersVoicesGrid");

const playersCalls = {};

var vidQueue = []; 

///////////////////////////////////////////////////////////// youtube API

// from https://developers.google.com/youtube/iframe_api_reference:
// loads the IFrame Player API code asynchronously.
var youtubeIframe_api = document.createElement("script");

youtubeIframe_api.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(youtubeIframe_api, firstScriptTag);

//    This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
// setting base frame and window size
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    height: "390",
    width: "640",
    //template video encanto Surface pressure sing along
    videoId: "X-NH1uUfr0U",
    playerVars: {
      "playsinline": 1
    },
    events: {
      "onReady": onPlayerReady,
      "onStateChange": onPlayerStateChange
    }
  });
}


function onPlayerReady(event) {
  event.target.playVideo();
}

//  when a video ends the next video on the queue will be played 
function onPlayerStateChange(event) {
  if((event.data == YT.PlayerState.ENDED ) && (vidQueue.length > 0) ){
    nextOnQ();
  }
}

function stopVideo() {
  player.stopVideo();
}

function nextOnQ(){
  var nextVid = vidQueue.shift();
  player.loadVideoById(nextVid);
}

//adding new videos to the q
socket.on("newVid",(ID)=>{
  console.log("new Vidd: " + ID.videoId);

  if (vidQueue.length == 0 && (player.getPlayerState() != YT.PlayerState.PLAYING)){
    player.loadVideoById(ID.videoId);
  }else{
    vidQueue.push(ID.videoId);
  }
})



///////////////////////////////////////////////////////////// connection to the server

socket.on("connected", async ()=> {
  console.log("new host joined: " + socket.id);
})

hostPeer.on("open", (id) => {
  socket.emit("hostConnection", ({"SocketId":socket.id, "PeerId": id}));
  console.log("open peer", id);
});

hostPeer.on("call",(call) => {
  console.log("call peer");
  call.answer(new MediaStream(createEmptyAudioTrack()));
  console.log("answer peer");
  // playersVoicesGrid;


  call.on("stream", playerVoiceStream => {
    playersVoicesGrid = document.getElementById("playersVoicesGrid");
    const playerVoiceDiv = document.createElement("div");
    playerVoiceDiv.innerHTML = "&#128264";
    const playerCallVoice = document.createElement("audio");
    console.log("&#128264");
    playerVoiceDiv.id = "stream";
    addVoiceStream(playerCallVoice, playerVoiceStream);

    playerVoiceDiv.innerHTML = '&#128264'+ " "+ playerName;
    playerVoiceDiv.id = playerPeerId;
    playerVoiceDiv.append(playerCallVoice);
    playersVoicesGrid.appendChild(playerVoiceDiv);
    console.log("stream peer");
  })


  // })
  call.on("close", () => {
    console.log("close peer");
    playerVoiceDiv.remove();
  })
})

socket.on("hostPlayerConn", ({ "PlayerName": playerName ,"PlayerPeer" :playerPeerId})=>{
  connectToNewPlayer(playerPeerId,playerName);
})



function connectToNewPlayer(playerPeerId, playerName){
  
  const call = hostPeer.call(playerPeerId, new MediaStream(createEmptyAudioTrack()));

  call.on("stream", playerVoiceStream => {

    playersVoicesGrid = document.getElementById("playersVoicesGrid");
    const playerCallVoice = document.createElement("audio");
    console.log("call");
    
    addVoiceStream(playerCallVoice, playerVoiceStream);

    const playerVoiceDiv = document.createElement("div");
    playerVoiceDiv.innerHTML = '&#128264'+ " "+ playerName;
    playerVoiceDiv.id = playerPeerId;
    playerVoiceDiv.append(playerCallVoice);
    playersVoicesGrid.appendChild(playerVoiceDiv);
    console.log("stream peer");
  })

  call.on("close", () => {
    playerVoiceDiv.remove()
  })

  playersCalls[playerPeerId] = call
}


function addVoiceStream(voice, stream){
  console.log("addVoiceStream ");

  voice.srcObject = stream;
  voice.addEventListener("loadedmetadata", () => {
      voice.autoplay = true;
  });
};


socket.on("playerDisconnected", ({ "Name": PlayerName, "PeerID": peerID }) => {
  const playersVoicesDiv = document.getElementById(peerID);
  playersVoicesDiv.remove();
  if (playersCalls[peerID]) {
    playersCalls[peerID].close()
  }
})

function setRoomName(){
  var roomName = document.getElementById("roomName");
  console.log("roomName ",roomName);
  roomName.innerHTML = "Room name is: "+thisHostName;
}


socket.on("hostName", (hostName)=> {
  thisHostName = hostName;
  setRoomName();
});





function createEmptyAudioTrack() {
  const AudioCntx = new AudioContext();
  const oscillator = AudioCntx.createOscillator();
  const dst = oscillator.connect(AudioCntx.createMediaStreamDestination());
  oscillator.start();
  const track = dst.stream.getAudioTracks()[0];
  return [Object.assign(track, { enabled: false })];
};