// const { default: Peer } = require("peerjs");

///////////////////////////////////////////////////////////// const and var 
const socket = io();

var thisUserUid;
// var localPeerPort = 4001;
var myPeer = new Peer();
var myVoiceStream;
var currentCall;
var peerID;
var thisPlayerName;
var thisHostId;

var titles = [];
var thumbnails = [];
let myNumOfResult = 5;

var micStatus = 1;

// view elements
const PlayerNameInputBar = document.getElementById("playerNameInputBar");    
const PlayerNameInput = document.getElementById("playerNameInput");
const PlayerName = document.getElementById("playerName");

const searchResultDiv = document.getElementById("searchResultDiv");
const SearchBar =document.getElementById("SearchBar");

const hostSearch = document.getElementById("roomNameSearch");
const hostNameSearch = document.getElementById("hostNameSearch");
const roomName = document.getElementById("roomName");

//////////////////////////////////////voice setting

// navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia
//  || navigator.mozGetUserMedia || navigator.msGetUserMedia);
  
navigator.mediaDevices.getUserMedia({
    video: false,
    audio: true
}).then((stream) => {
    myVoiceStream = stream;
    myPeer.on("call", (call) => {
        currentCall = call;
        call.answer(stream);
        call.on("stream", () => {
        });
    });
    socket.on("connected",()=>{
        console.log("NewUser userId: " + socket.id);


        socket.on("host-disconnected", (serial)=>{
            if (serial==thisHostId){
                alert("host disconnected")
                ThisHostId = "?";
                roomName.innerHTML = "Connected to host room : ?";
                hostNameSearch.style.display = "inline-block";
                roomName.style.display = "none";

            }
        })

        // socket.on("hostPeerInfo", (hostPeerId)=>{
        //     console.log("hostPeerInfo: " + hostPeerId);
        //     connectToNewHost(hostPeerId , myVoiceStream);
        // })
    

    });
}).catch(err=>{
    alert(err.message)
}); 




function connectToNewHost(hostPeerId, stream) {
    console.log("connectToNewHost hostPeerId: " + hostPeerId);
    console.log("connectToNewHost stream: " + stream);
    
    currentCall = myPeer.call(hostPeerId, stream);
    currentCall.emit("playerName", thisPlayerName);

    console.log("connectToNewHost currentCall: " + currentCall.toString());
    
                hostNameSearch.style.display = "none";

    // const voice = document.createElement("audio");
    // call.on("stream", (userVideoStream) => {
    //     // addVoiceStream(voice, userVideoStream);
    // });
};



function micStreamOff(){
    myVoiceStream.getAudioTracks()[0].enabled = false;
};
function micStreamOn(){
    myVoiceStream.getAudioTracks()[0].enabled = true; 
};

///////////////////////////////////////////////////////////// communication settings

myPeer.on("open", (id) => {
    peerID = id;
});


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












////////////////////////////////////////////////////////////////// youtube funcs
function searchSong(SearchTextBy){
    let qry = SearchBar.value;
    SearchBar.value = null;
    qry = qry+" "+SearchTextBy;
    console.log(qry);
        ///sending a new song for the server to search
    socket.emit("searchSong",({"qry":qry,"NumOfResult":myNumOfResult}));
    //adding results of search to a search overlay
    socket.on("answer", srchAns =>{
        titles = srchAns.titles;
        thumbnails =  srchAns.thumbnails;
        for (let i = 0; i < myNumOfResult; i++){
            let thumbnaile = thumbnails[i];
            var sechRes = document.createElement("a")
            sechRes.innerHTML  = titles[i];
            sechRes.addEventListener("click",function(){sendChosenSong(i)});
            var newline = document.createElement("br");
            sechRes.appendChild(newline);
            var img = document.createElement("img");
            img.src =thumbnaile.url;
            img.width = thumbnaile.width;
            img.height = thumbnaile.height;
            sechRes.appendChild(img);
            searchResultDiv.appendChild(sechRes);
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

function searchSongLyrics(){
    searchSong("Lyrics");
    replaceSearchFunc();
}

//answer on the search results based on titles and thumbnails 
function sendChosenSong(sngIndex){
    socket.emit("ChosenSong",sngIndex);
    closeSearchResult();
}










///////////////////////////////////////////////////////////// page view functions

function hideFunc(element) {
    var x = document.getElementById(element);
    console.log("element x: " + x);
    if (x.style.display === "none") {
      x.style.display = "inline-block";
    } else {
      x.style.display = "none";
    }
  }

function hideFuncMulti(elements) {
    elements.forEach( (element)=>{
        console.log("element: " + element);
        hideFunc(element);
    })
}

  function replaceSearchFunc(){
    hideFuncMulti(["OpenSearch","searchKaraoke","searchSingAlong","SearchBar"]);
  }

function openSearchResult() {
    document.getElementById("searchResult").style.width = "100%";
}

function closeSearchResult() {
    document.getElementById("searchResult").style.width = "0%";
    searchResultDiv.replaceChildren();
}

//sound
function muteTheMic(){
    var micPic = document.getElementById("micPic"); 
    var slider = document.getElementById("microphoneText");    
    if (micStatus === 1){
        micStatus = 0;
        micPic.style.filter = "grayscale(100%)";
        slider.innerHTML = "off";
        micStreamOff();
    }else {
        micStatus = 1;
        micPic.style.filter = "grayscale(0%)";
        slider.innerHTML = "on";
        micStreamOn();
    }
}





function setPlayerName(){
    thisPlayerName = document.getElementById("playerNameInputBar").value;    
    if (!peerID){
        console.error("connection failed");
    }
    PlayerName.innerHTML = "Player name: " + thisPlayerName;
    PlayerNameInput.style.display = "none";
    PlayerName.style.display = "inline-block";
    hostNameSearch.style.display = "inline-block"; 

    socket.emit("PlayerName", ({"socket":socket.id,"Name" :thisPlayerName, "PeerID": peerID}));

}

function joinHostRoom(){

    thisHostId = hostSearch.value;
    hostSearch.value = null;

    socket.emit("joinHostRoom", ({"HostId":thisHostId,"PlayerName" :thisPlayerName}));
    
    socket.on("playerHostConn", ({"HostId":newHostId,"HostPeer":hostPeer})=>{
        if (thisHostId === newHostId){
            socketConnection(thisHostId)
            connectToNewHost(hostPeer,myVoiceStream)

        }
    })

    socket.on("couldNotFindHost", (HostId)=>{
        alert("could Not Find Host: "+HostId);
    })
   

}

function socketConnection(hostId){
    roomName.innerHTML = "Connected to host room : "+hostId;
    roomName.style.display = "inline-block";
}
