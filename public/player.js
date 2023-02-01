///////////////////////////////////////////////////////////// const and var 
const socket = io();
const peer = new Peer();
var micStatus = 0;
var titles = [];
var thumbnails = [];

///////////////////////////////////////////////////////////// communication settings


socket.on('connected', async _ => {
    console.log("new user joined");

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
      x.style.display = "block";
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
        OpenSearch.style.display = "block";
        searchKaraoke.style.display = "none";
        searchSingAlong.style.display = "none";
        SerchBar.style.display = "none";
    } else {
        OpenSearch.style.display = "none";
        searchKaraoke.style.display ="block";
        searchSingAlong.style.display ="block";
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
    if (micStatus === 0){
        micStatus = 1;
        micPic.style.filter = "grayscale(100%)";
    }else{
        micStatus = 0;
        micPic.style.filter = "grayscale(0%)";
    }
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
        titles = srcAns[0];
        thumbnails =  srcAns[1];
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


// // app.get("/search",async (req, res, next)=> {
//     try{
//      const qry = req.query.search_query;
//      const response = await youtube.search.list({
//          part: "snippet",
//          q: qry +"sing along",
//      });
//      const titles = response.data.items.map((item)=> item.snippet.defult.thumbnails);
//      // const titles = response.data.items.map((item)=> item.snippet.title);
 
//      res.send(titles);
 
//  } catch (err) {
//      next(err);
//     }
//  });