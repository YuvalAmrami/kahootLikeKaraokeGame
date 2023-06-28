///////////////////////////////////////////////////////////// const and var 
const socket = io();
const playersVoicesGrid = document.getElementById("playersVoicesGrid");

var thisHostUid;
var thisHostName;

// var localPeerPort = 4001;
var hostPeer = new Peer();
var vidQueue = []; 

///////////////////////////////////////////////////////////// youtube API

// from https://developers.google.com/youtube/iframe_api_reference:
// loads the IFrame Player API code asynchronously.
var youtubeIframe_api = document.createElement('script');

youtubeIframe_api.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(youtubeIframe_api, firstScriptTag);

//    This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
// setting base frame and window size
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    //template video encanto Surface pressure sing along
    videoId: 'X-NH1uUfr0U',
    playerVars: {
      'playsinline': 1
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
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

socket.on('connected', async ()=> {
  console.log("new host joined: " + socket.id);
  // setPeerServer(thisHostUid);
  
  socket.on('NewPlayerAdded',(playerInfo)=>{
    // {"socket":socketId,"Name" :PlayerNameInputBar}
    console.log("playerName &#128264" + playerInfo.Name);
    console.log("playerName &#128265" + playerInfo.socket);
    console.log("playerName &#128266" + playerInfo.PeerId);

  });

})


hostPeer.on("open", (id) => {
  socket.emit('hostConnection', ({"SocketId":socket.id, "PeerId": id}));
  console.log("open peer");

});

hostPeer.on("call",(call) => {
  console.log("call peer");

  call.answer();
  console.log("answer peer");
  const playersVoicesGrid = document.getElementById("playersVoicesGrid");

  const playerVoiceDiv = document.createElement("div");
  playerVoiceDiv.innerHTML = '&#128264';
  const playerCallVoice = document.createElement("audio");
  console.log('&#128264');

  call.on('stream', playerVoiceStream => {
    addVoiceStream(playerVoiceDiv, playerCallVoice, playerVoiceStream);
    console.log("playersVoicesGrid ",playersVoicesGrid);

    playersVoicesGrid.appendChild(playerVoiceDiv);

    console.log("stream peer");

  })

  call.on('playerName', playerVoiceStream => {
    playerVoiceDiv.innerHTML = playerName +" "+ '&#128264';
    console.log("playerName peer");

  })

  call.on('close', () => {
    console.log("close peer");

    playerVoiceDiv.remove();
  })


})


function addVoiceStream(VoiceDiv, voice, stream){
  console.log("addVoiceStream ");

  voice.srcObject = stream;
  voice.addEventListener("loadedmetadata", () => {
      voice.autoplay = true;;
  });

  VoiceDiv.append(voice);
};



function setRoomName(){
  var roomName = document.getElementById('roomName');
  console.log("roomName ",roomName);
  roomName.innerHTML = "Room name is: "+thisHostName;
}


socket.on('hostName', (hostName)=> {
    thisHostName = hostName;
    // SetPeerinfo()
    setRoomName();
  });


  socket.on('user-connected', userId => {
    connectToNewHost(userId, stream)
  })


socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})