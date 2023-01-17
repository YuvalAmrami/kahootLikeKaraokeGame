///////////////////////////////////////////////////////////// const and var 
const socket = io();
const peer = new Peer();
var micStatus = 0;

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

function replaceFunc(){
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


//sound
function muteTheMic(){
    var micPic = document.getElementById("micPic");    
    if (micStatus === 0){
        micStatus = 1;
        micPic.style.filter = "grayscale(0%)";
    }else{
        micStatus = 0;
        micPic.style.filter = "grayscale(100%)";
    }
}

////////////////////////////////////////////////////////////////// youtube funcs
function searchSong(added_text){
    console.log(added_text);
    let qry = document.getElementById('SerchBar').value;
    document.getElementById('SerchBar').value = null;
    console.log(qry);
    qry = qry+" "+added_text;
    console.log(qry);
    socket.emit("searchSong",(qry));

    socket.on("answer",(titles,thumbnails)=>{
        console.log(titles);
        console.log(thumbnails);
        // thumbnails
    })

    // const response = youtube.search.list({
    //     part: "snippet",
    //     q: qry +added_texy,
    // });
    // const thumbnails = response.data.items.map((item)=> item.snippet.defult.thumbnails);
    // const titles = response.data.items.map((item)=> item.snippet.defult.title);

}

function searchSongToSingAlong(){
    searchSong("sing along");
    replaceFunc();
}


function searchSongLyrics(){
    searchSong("Lyrics");
    replaceFunc();
}

function searchSongToKaraoke(){
    searchSong("karaoke");
    replaceFunc();
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