//=============  DEBUG WITHOUT CONSOLE STUFF =====================
      if (typeof console !== 'undefined') {
          let dd = document.getElementById('debugdiv')
          if(!dd){
              dd = document.createElement("div")
              dd.setAttribute("id","debugdiv")
              dd.style.zIndex = "899999999"
              dd.style.border = "red solid 1px"
              dd.style.color = "white"
              window.onload = ()=>{document.body.appendChild(dd)}
          }
          
          
          if (typeof console.log !== 'undefined') {
              console.olog = console.log;
           } else {
              console.olog = function () {};
         }
        console.log = function (message) {
          console.olog(message);
             dd.append(`\n` + message)
        }
          console.error = console.exception = console.debug = console.info = console.log;
      
      window.addEventListener('error', e => {
           dd.append(`\n` + e.message)
       });
      dd.addEventListener('click', () => {
          dd.innerText = ''
       })
      }
      //=============  END DEBUG WITHOUT CONSOLE STUFF ==================



if( "serviceWorker" in navigator){
    navigator.serviceWorker.register("./sw.js").then(registration=>{
        console.log("registered!",registration)
    }).catch(e=>{
        console.log("failed reg.")
        console.log(e)
    })
}else{

}