///////////////////////////////////////////////////////////// const and var 
const socket = io();

var thisUserUid;

var myPeer = new Peer(
    undefined,{
      host: window.location.hostname,
      port: '4000',
      path: '/peerjs'
    });
     
var myVoiceStream;
var currentCall;
var connectToColler;
var peerId;
var hostPeerId
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

navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia
 || navigator.mozGetUserMedia || navigator.msGetUserMedia);
  
navigator.mediaDevices.getUserMedia({
    video: false,
    audio: true
}).then((stream) => {
    myVoiceStream = stream;
    myPeer.on("call", (call) => {
        currentCall = call;
        call.answer(stream);
        call.on("stream", (emptyStream) => {
        });
    });
    socket.on("connected",()=>{
        console.log("NewUser userId: " + socket.id);

        socket.on("hostDisconnected", (serial)=>{
            if (serial==thisHostId){
                alert("host disconnected")
                ThisHostId = "?";
                roomName.innerHTML = "Connected to host room : ?";
                hostNameSearch.style.display = "inline-block";
                roomName.style.display = "none";
            }
        })  

    });
}).catch(err=>{
    alert(err.message)
}); 




function connectToNewHost(inputHostPeerId, stream) {
    hostPeerId = inputHostPeerId;
    console.log("connectToNewHost hostPeerId: " + inputHostPeerId);
    console.log("connectToNewHost stream: " + stream);
    hostNameSearch.style.display = "none";

    // currentCall = myPeer.call(hostPeerId, stream);
    // myPeer.send(thisPlayerName);

    // console.log("connectToNewHost currentCall: " + currentCall.toString());
};



function micStreamOff(){
    myVoiceStream.getAudioTracks()[0].enabled = false;
};
function micStreamOn(){
    myVoiceStream.getAudioTracks()[0].enabled = true; 
};

///////////////////////////////////////////////////////////// communication settings

myPeer.on("open", (id) => {
    peerId = id;
    console.log("open peer", id);

});

////////////////////////////////////////////////////////////////// youtube funcs
function searchSong(SearchTextBy){
    let qry = SearchBar.value;
    SearchBar.value = null;
    qry = qry+" "+SearchTextBy;
    console.log(qry);
        ///sending a new song for the server to search
    socket.emit("searchSong",({"Qry":qry,"NumOfResult":myNumOfResult}));
    //adding results of search to a search overlay
    socket.on("searchAnswer", srchAns =>{
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
    socket.on("noHost",()=>{
        alert("The player has no host!");
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
    socket.emit("chosenSong",sngIndex);
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
    if (!peerId){
        console.error("connection failed");
    }
    PlayerName.innerHTML = "Player name: " + thisPlayerName;
    PlayerNameInput.style.display = "none";
    PlayerName.style.display = "inline-block";
    hostNameSearch.style.display = "inline-block"; 

    socket.emit("playerName", ({"Socket":socket.id,"Name" :thisPlayerName, "PeerID": peerId, "location.hostname": window.location.hostname}));

}

function joinHostRoom(){
    thisHostId = hostSearch.value;
    hostSearch.value = null;

    socket.emit("joinHostRoom", ({"HostId":thisHostId,"PlayerName" :thisPlayerName,"PlayerPeer" :peerId}));
    
    socket.on("playerHostConn", ({"HostId":newHostId,"HostPeer":hostPeer})=>{
        if (thisHostId === newHostId){
            socketConnection(thisHostId)
            connectToNewHost(hostPeer,myVoiceStream)

        }
    })

    socket.on("couldNotFindHost", (HostId)=>{
        thisHostId = -1;
        alert("could Not Find Host: "+HostId);
    })
   

}

function socketConnection(hostId){
    roomName.innerHTML = "Connected to host room : "+hostId;
    roomName.style.display = "inline-block";
    
}
