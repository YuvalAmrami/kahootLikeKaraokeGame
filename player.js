
function print_text(){
    console.log("text");
}

function mute_the_mic(){

}
//youtube funcs

function search_song(added_texy){
    const qry = req.query.search_query;
    const response = await youtube.search.list({
        part: "snippet",
        q: qry +added_texy,
    });
    const titles = response.data.items.map((item)=> item.snippet.defult.thumbnails);
}

function search_song_to_sing_along(){
    search_song("sing along");
}

function search_song_to_karaoke(){
    search_song("karaoke");
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