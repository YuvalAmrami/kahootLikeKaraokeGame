///////////////////////////////////////////////////////////// const and var 
const socket = io();
var micStatus = 0;
var titles = [];
var thumbnails = [];
var thisUserUid;
var port = 4000;
var myPeer 
// = new Peer(undefined, {
//     path: "/peerjs",
//     host: "/",
//     port: port,
//   });
let myVoiceStream;

//voice setting
navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
  
// navigator.getUserMedia({
//     video: false,
//     audio: true
// }).then((stream) => {
//     myVoiceStream = stream;
//     peer.on("call", (call) => {
//         call.answer(stream);
//         const myVoice = document.createElement("audio");
//         call.on("stream", (userVoiceStream) => {
//             addVoiceStream(myVoice, userVoiceStream);
//         });
//     });
//     socket.on('connected', async (connectionInfo)=> {
//         thisUserUid = connectionInfo.uid;
//         port = connectionInfo.port
//         console.log("new user joined: " + thisUserUid);
//         SetPeerinfo(port);
//         connectToNewUser(thisUserUid, stream)
//     });
// }); 

// const connectToNewUser = (userId, stream) => {
//     const call = peer.call(userId, stream);
//     const voice = document.createElement("audio");
//     call.on("stream", (userVideoStream) => {
//         addVoiceStream(voice, userVideoStream);
//     });
// };
// peer.on("open", (id) => {
//     socket.emit("join-room", ROOM_ID, id);
// });


// const addVoiceStream = (voice, stream) => {
//     voice.srcObject = stream;
//     voice.addEventListener("loadedmetadata", () => {
//         voice.play();
//     });
// };


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


socket.on('connected', async (connectionInfo)=> {
    thisUserUid = connectionInfo.uid;
    port = connectionInfo.port
    console.log("new user joined: " + thisUserUid);
    SetPeerinfo(port);
    // const name = await swal("Your name:", {
    //     content: "input",
    //     button: "Join",
    //     closeOnClickOutside: false,
    //     closeOnEsc: false
    // })
});

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
    var SerchBar = document.getElementById("SerchBar");
    if (OpenSearch.style.display === "none") {
        OpenSearch.style.display = "inline-block";
        searchKaraoke.style.display = "none";
        searchSingAlong.style.display = "none";
        SerchBar.style.display = "none";
    } else {
        OpenSearch.style.display = "none";
        searchKaraoke.style.display ="inline-block";
        searchSingAlong.style.display ="inline-block";
        SerchBar.style.display = "block";
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

    if (micStatus === 0){
        micStatus = 1;
        micPic.style.filter = "grayscale(100%)";
        slider.innerHTML = "off"
    }else{
        micStatus = 0;
        micPic.style.filter = "grayscale(0%)";
        slider.innerHTML = "on"
    }
}


function SetPeerinfo(port){
    myPeer = new Peer(thisUserUid, {
        path: "/peerjs",
        host: "/",
        port: port,
      });
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


