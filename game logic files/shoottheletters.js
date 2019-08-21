let gun = new Img('../images/gun.png', width / 2 - 50, height - 100, 100, true, 270);
gun.set('zIndex', 100000)
document.body.style.backgroundImage = 'url(../images/bg0.jpg)';

let city = new Img('../images/city.png', 0, 0, width);
//creates empty array, maps it to 0-n, shuffles it, maps again to have x be a random int from 0 to n
let buildings = shuffle(Array(6).fill('').map((x, i) => i)).map((x, i) => {
    let img = new Img('../images/buildings/skyscraper' + x + '.png', 50 + (width / 7) * i + getRandom(-40, 40), 'bottom', 50,);
    img.onload = ()=>{
        let v = img.vector;
        new Div(v.x,v.y,'white',5)
    };
    return img
});
let invadercolors = ['red', 'green', 'purple', 'blue', 'pink', 'white', 'yellow', 'orange'];
let invaders = invadercolors.map((x, i) => {
    let img = new Img('../images/invaders/invader' + x + '.png', 0, 0, 50);
    return img
});

let testalien = new Flyer(100,100,'invadergreen');
testalien.addSprite(invaders[1]);
invaders[1].shape.addEventListener('click',()=>{
    testalien.flyto(new Vector(targets[0].x,targets[0].y))
})
let eventem = new EventEmitter();
let sub = testalien.landing_emitter.subscribe('flyto', ()=>{
   testalien.extras.pickup = new PowerBall(testalien.p.x,testalien.p.y,'word');
   testalien.extras.pickup.addSprite(targets[0]);
   if(!testalien.flyingwithword){
       testalien.flyingwithword = true;
       let bld = getRandom(buildings);
       testalien.flyto(bld.vector.copy());
   }
   sub();
});
let extras = ['bullet'];
let LOADED_IMAGES = new ImageLoader('../images/projectiles/', extras);
gun.shape.addEventListener('click', () => {
    shoot();
});
let dragging = false;
let startpos = {x: 0, y: 0}

function dragStart(ev) {
    dragging = true;

    startpos.x = ev.clientX;
    startpos.y = ev.clientY;
}

function dragStop() {
    dragging = false;
}

function drag(ev) {
    function right() {
        if (gun.angle < 360) {
            gun.mod('rotate', 2)
        }
    }

    function left() {
        if (gun.angle > 180) {
            gun.mod('rotate', -2)
        }
    }

    if (dragging) { //TODO implement better tracking
        if (startpos.x - ev.clientX < -3) {
            right()
        } else if (startpos.x - ev.clientX > 3) {
            left()
        }
        // if(ev.clientX > width/2){
        //     if(startpos.y-ev.clientY < -10){
        //         right()
        //     }else if (startpos.y-ev.clientY > 10){
        //         left()
        //     }
        // }else{
        //     if(startpos.y-ev.clientY < -10){
        //         left()
        //     }else if (startpos.y-ev.clientY > 10){
        //         right()
        //     }
        // }
    }
    startpos.x = ev.clientX;
}

document.addEventListener('touchstart', (ev) => {
    dragStart(ev.touches[0]);
});
document.addEventListener('mousedown', (ev) => {
    dragStart(ev);
});
document.addEventListener('mouseup', () => {
    dragStop();
});
document.addEventListener('touchstop', () => {
    dragStop();
});
document.addEventListener('touchmove', (ev) => {
    drag(ev.touches[0]);
});
document.addEventListener('mousemove', (ev) => {
    drag(ev)
});
let bullets = [];

function shoot() {
    let angle = gun.angle;
    let w = gun.shape.offsetWidth;
    let h = gun.shape.offsetHeight;
    let x = gun.x + w / 2 + Math.cos(gun.angle * (Math.PI / 180)) * 50;
    let y = gun.y + h / 2 + Math.sin(gun.angle * (Math.PI / 180)) * 50;
    let bullet = new PowerBall(x, y, 'bullet');
    let bulletimg = new Img(LOADED_IMAGES.bullet.cloneNode(), x, y, 30, false, angle)
    bullet.addSprite(bulletimg);
    requestAnimationFrame(() => {
        let vec = new Vector(Math.cos(gun.angle * (Math.PI / 180)), Math.sin(gun.angle * (Math.PI / 180)));
        bullet.a.add(vec.set(30))
        bullet.antigrav = true;
        bullet.bounds = {x: width, y: height};
        bullet.fragile = true;
        bullets.push(bullet)
    })
}

loop = function () {
    testalien.update();
    for (let i = bullets.length - 1; i >= 0; i--) {
        if (bullets[i].dead) {
            bullets.splice(i, 1);
            continue;
        }

        bullets[i].update();
        for (let j = targets.length - 1; j >= 0; j--) {
            if (targets[j].rect.contains(bullets[i].p) && !bullets[i].dead) {
                targets[j].remove();
                targets[j].rect.destroy()
                targets.splice(j, 1)
                bullets[i].kill();
                setup()
            }

        }
    }
    if (LOOPING) {
        requestAnimationFrame(loop)
    }

};

let targets = [];

function setup() {
    let word = getRandom(words);

    let p = new P(word, getRandom(width), getRandom(height - 200))
    p.set('margin', 0)
    p.set('fontSize', '2em')
    p.rect = new Rect(p.x, p.y, p.shape.offsetWidth, p.shape.offsetHeight);
    targets.push(p);
}


LOOPING = true;
//
setup();
requestAnimationFrame(loop)