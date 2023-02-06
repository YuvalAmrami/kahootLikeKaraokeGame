///////////////////////////////////////////////////////////// const and var 
// import { Peer } from "peerjs";
const socket = io();
var micStatus = 0;
var titles = [];
var thumbnails = [];
var thisUserUid;
var localPort = 4000;
var myPeer = new Peer();
let myVoiceStream;

//voice setting

// navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia
//  || navigator.mozGetUserMedia || navigator.msGetUserMedia);
  
navigator.mediaDevices.getUserMedia({
    video: false,
    audio: true
}).then((stream) => {
    myVoiceStream = stream;
    myPeer.on("call", (call) => {
        call.answer(stream);
        const myVoice = document.createElement("audio");
        call.on("stream", (userVoiceStream) => {
            addVoiceStream(myVoice, userVoiceStream);
        });
    });
    socket.on('connected', async (connectionInfo)=> {
        thisUserUid = connectionInfo.uid;
        localPort = connectionInfo.port
        console.log("new user joined: " + thisUserUid);
        SetPeerinfo();
        connectToNewUser(thisUserUid, stream)
    });
}); 

const connectToNewUser = (userId, stream) => {
    const call = myPeer.call(userId, stream);
    const voice = document.createElement("audio");
    call.on("stream", (userVideoStream) => {
        addVoiceStream(voice, userVideoStream);
    });
};

myPeer.on("open", (id) => {
    socket.emit("join-room", thisUserUid, id);
});


const addVoiceStream = (voice, stream) => {
    voice.srcObject = stream;
    voice.addEventListener("loadedmetadata", () => {
        voice.play();
    });
};


///////////////////////////////////////////////////////////// communication settings

// myPeer.on('open', function() {
//     console.log('My PeerJS ID is:', myPeer.id);
//   });

//   (video, stream) => {
//     video.srcObject = stream;
//     video.addEventListener("loadedmetadata", () => {
//        video.play();
//        videoGrid.append(video);
//     });
// };


// socket.on('connected', async (connectionInfo)=> {
//     thisUserUid = connectionInfo.uid;
//     port = connectionInfo.port
//     console.log("new user joined: " + thisUserUid);
//     SetPeerinfo(port);
// });

// var conn = peer.connect('another-peers-id');

// let loader = document.createElement("div")
// loader.classList.add("loader")


// conn.on('open' , (id)=>{
//     console.debug("open")

//     socket.emit("newUser" , id);
// })





///////////////////////////////////////////////////////////// page view

function printText(){
    console.log("text");
}

function hideFunc(element) {
    var x = document.getElementById(element);
    if (x.style.display === "none") {
      x.style.display = "inline-block";
    } else {
      x.style.display = "none";
    }
  }

function replaceSearchFunc(){
    var OpenSearch = document.getElementById("OpenSearch");    
    var searchKaraoke = document.getElementById("searchKaraoke");
    var searchSingAlong = document.getElementById("searchSingAlong");    
    var SearchBar = document.getElementById("SearchBar");
    if (OpenSearch.style.display === "none") {
        OpenSearch.style.display = "inline-block";
        searchKaraoke.style.display = "none";
        searchSingAlong.style.display = "none";
        SearchBar.style.display = "none";
    } else {
        OpenSearch.style.display = "none";
        searchKaraoke.style.display ="inline-block";
        searchSingAlong.style.display ="inline-block";
        SearchBar.style.display = "inline-block";
    }
  }

function openSearchResult() {
    document.getElementById("searchResult").style.width = "100%";
}

function closeSearchResult() {
    document.getElementById("searchResult").style.width = "0%";
}

//sound
function muteTheMic(){
    var micPic = document.getElementById("micPic"); 
    var slider = document.getElementById("microphoneText");    
    if (micStatus === 1){
        micStatus = 0;
        micPic.style.filter = "grayscale(100%)";
        slider.innerHTML = "off"
    }else {
        micStatus = 1;
        micPic.style.filter = "grayscale(0%)";
        slider.innerHTML = "on"
    }
}

//peer to peer


function SetPeerinfo(){
    myPeer = new Peer(thisUserUid, {
        path: "/peerjs",
        host: "/",
        port: localPort,
      });
}

function joinHostRoom(){
    const hostSearch = document.getElementById("roomNameSearch");
    const hostNameSearch = document.getElementById("hostNameSearch");
    
    hostId = hostSearch.value;
    hostSearch.value = null;
    hostNameSearch.style.display = "none";

    socket.emit("joinHostRoom", (hostId, thisUserUid));
    socket.on("newPlayer", (connectionInfo)=>{
        if (thisUserUid === connectionInfo.userId){
            connectionWasEstablished(connectionInfo.hostId)
        }
    
    })
}

function connectionWasEstablished(hostId){
    var roomName = document.getElementById('roomName');
    roomName.innerHTML = "Connected to host room : "+hostId;
    roomName.style.display = "inline-block";
}




////////////////////////////////////////////////////////////////// youtube funcs
function searchSong(SearchTextBy){
    let qry = document.getElementById('SearchBar').value;
    document.getElementById('SearchBar').value = null;
    qry = qry+" "+SearchTextBy;
    console.log(qry);
        ///sending a new song for the server to search
    socket.emit("searchSong",(qry));
    //adding results of search to a search overlay
    socket.on("answer", srcAns =>{
        titles = srcAns.titles;
        thumbnails =  srcAns.thumbnails;
        for (let i = 0; i < 5; i++){
            let thumbnaile = thumbnails[i];
            let elementId = "searchResult" + String(i);
            var sechRes = document.getElementById(elementId);
            sechRes.innerHTML  = titles[i];
            var newline = document.createElement("br");
            sechRes.appendChild(newline);
            var img = document.createElement("img");
            img.src =thumbnaile.url;
            img.width = thumbnaile.width;
            img.height = thumbnaile.height;
            sechRes.appendChild(img);
        }
        openSearchResult();
    })
}

function searchSongToSingAlong(){
    searchSong("sing along");
    replaceSearchFunc();
}

function searchSongToKaraoke(){
    searchSong("karaoke");
    replaceSearchFunc();
}

// function searchSongLyrics(){
//     searchSong("Lyrics");
//     replaceSearchFunc();
// }

//answer on the search results based on titles and thumbnails 
function sendChosenSong(sngIndex){
    socket.emit("ChosenSong",sngIndex);
    closeSearchResult();
}


