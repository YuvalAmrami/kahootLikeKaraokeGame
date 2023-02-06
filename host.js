///////////////////////////////////////////////////////////// const and var 
const socket = io();
// const peer = new Peer();
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
      //template video encanto Surface pressure
      videoId: 'tQwVKr8rCYw',
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


///////////////////////////////////////////////////////////// connection to the server

socket.on('connected', async _ => {
  console.log("new host");
})

//adding new videos to the q
socket.on("newVid",(ID)=>{
    if (vidQueue.length == 0 && (player.getPlayerState() != YT.PlayerState.PLAYING)){
      player.loadVideoById(ID.videoId);
    }else{
      vidQueue.push(ID.videoId);
    }
})

