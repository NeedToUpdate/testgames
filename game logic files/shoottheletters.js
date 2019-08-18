let gun = new Img('../images/gun.png', width/2, height-200, 100,true, 270);

gun.shape.addEventListener('click', ()=>{
    console.log('boom');
});
let dragging = false;
let startx = 0
function dragStart(ev){
    dragging = true;
    console.log('dragging' + ev.clientX);
    startx = ev.clientX;
}
function dragStop(){
    dragging = false;
}
function drag(ev){
    if(dragging){
        if(startx < ev.clientX){
            gun.mod('rotate', 1)
        }else if (startx > ev.clientX){
           gun.mod('rotate', -1)
        }
    }
}
gun.shape.addEventListener('touchstart', (ev)=>{
    dragStart(ev.touches[0]);

});
gun.shape.addEventListener('mousedown', (ev)=>{
    dragStart(ev);
})
gun.shape.addEventListener('mouseup', ()=>{
    dragStop();
})
gun.shape.addEventListener('touchstop', ()=>{
    dragStop();
})
gun.shape.addEventListener('touchmove', (ev)=>{
    drag(ev.touches[0]);
})
document.body.addEventListener('mousemove', (ev)=>{
    drag(ev)
})
