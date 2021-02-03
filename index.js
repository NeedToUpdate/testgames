if( "serviceWorker" in navigator){
    navigator.serviceWorker.register("./sw.js").then(registration=>{
        console.log("registered!",registration)
    }).catch(e=>{
        console.log("failed reg.",e)
    })
}else{

}