/// const and var 

var micStatus = 0;

// page view
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
        micPic.style.display = "block";
    }else{
        micStatus = 0;
        micPic.style.display = "none";
    }
}

//youtube funcs
function searchSong(added_texy){
    console.log(added_texy);
    // const qry = req.query.search_query;
    // const response = youtube.search.list({
    //     part: "snippet",
    //     q: qry +added_texy,
    // });
    // const titles = response.data.items.map((item)=> item.snippet.defult.thumbnails);
}

function searchSongToSingAlong(){
    searchSong("sing along");
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