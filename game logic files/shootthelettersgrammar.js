let sentences = words.map(x=>(Math.random()>0.5? 'He': 'She') + ' is '+x + ' in line');

let gun = new Img('../images/gun.png', width / 2 - 50, height - 100, 100, true, 270);
gun.set('zIndex', 100000)
document.body.style.backgroundImage = 'url(../images/bg0.jpg)';

let city = new Img('../images/city.png', 0, 0, width);
//creates empty array, maps it to 0-n, shuffles it, maps again to have x be a random int from 0 to n
let buildings = shuffle(Array(6).fill('').map((x, i) => i)).map((x, i) => {
    let img = new Img('../images/buildings/skyscraper' + x + '.png', 50 + (width / 7) * i + getRandom(-40, 40), 'bottom', 50,);
    // img.onload = ()=>{
    //     let v = img.vector;
    // };
    return img
});
let invadercolors = ['red', 'green', 'purple', 'blue', 'pink', 'white', 'yellow', 'orange'];
let invaders = invadercolors.map((x, i) => {
    let img = new Img('../images/invaders/invader' + x + '.png', 0, 0, 50);
    return img
});
let aliens = [];

let aliendeathimg = new ImageLoader('../images/', ['electricball']);
for(let i = 0; i<5 ;i++){
    let alien = new Flyer(10,100,'invader' + getRandom(invadercolors));
    alien.addSprite(invaders[i]);
    alien.addDeathImage(aliendeathimg.electricball)
    alien.sprite.shape.addEventListener('click',()=>{
        aliens.forEach((alien,i)=>{
            alien.flyto(new Vector(allwords[i].x,allwords[i].y)).done(x=>{
                alien.extras.pickup = new PowerBall(alien.p.x,alien.p.y,'word');
                alien.extras.pickup.addSprite(allwords[i]);
                let bld = buildings[i];
                alien.flyto(bld.vector.copy()).done(x=>{
                    alien.hover()
                });
            })
        })
    });
    aliens.push(alien)
}

let extras = ['bullet', 'fire'];
let LOADED_IMAGES = new ImageLoader('../images/projectiles/', extras);
gun.shape.addEventListener('click', () => {
    shoot();
});
let dragging = false;
let startpos = {x: 0, y: 0};

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
            gun.mod('rotate', 4)
            if(gun.angle<=270){
                gun.shape.style.transform += ' scaleY(-1)'
            }else {
                gun.shape.style.transform += ''
            }
        }
    }

    function left() {
        if (gun.angle > 180) {
            gun.mod('rotate', -4)
            if(gun.angle<=270){
                gun.shape.style.transform += ' scaleY(-1)'
            }else {
                gun.shape.style.transform += ''
            }
        }
    }

    if (dragging) { //TODO implement better tracking
        if (startpos.x - ev.clientX < -3) {
            right()
        } else if (startpos.x - ev.clientX > 3) {
            left()
        }

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

    for (let i = aliens.length - 1; i >= 0; i--) {
        aliens[i].update();
        if (aliens[i].dead) {
            aliens.splice(i, 1)
            continue;
        }


        for (let j = bullets.length - 1; j >= 0; j--) {
            bullets[j].update();
            if (bullets[j].dead) {
                bullets.splice(j, 1);
                continue;
            }
            if (!bullets[j].dead && aliens[i].rect.contains(bullets[j].rect)) {
                aliens[i].kill();
                bullets[j].kill();
                let n = allwords.indexOf(aliens[i].extras.pickup.sprite);
                let p = allwords[n];
                delete aliens[i].extras.pickup.sprite;
                p.set('top', p.origp.y +'px');
                p.set('left', p.origp.x +'px');
                console.log(p)
            }

        }

    }
    if (LOOPING) {
        requestAnimationFrame(loop)
    }

};

let allwords = [];
let chosensentence = '';
function setup() {
    let start_x = width*0.3;
    let y_calc = height*0.1;
    let space = 15;
    chosensentence = getRandom(sentences);
    chosensentence.split(' ').forEach((word,i)=>{
        let p = new P(word, 0, y_calc);
        let leftoffset = allwords.reduce((tot,item)=>tot+= item.shape.offsetWidth + space,start_x);
        p.set('left', leftoffset  + 'px');
        p.set('top', y_calc - 32 + 'px');
        p.set('margin', 0);
        p.set('fontSize', '2em');
        p.rect = new Rect(p.x, p.y, p.shape.offsetWidth, p.shape.offsetHeight);
        p.origp = new Vector(leftoffset, y_calc-32);
        allwords.push(p);
    })

    lines = allwords.map((x, i) => {
        let w = 0;
        for(let j = i-1; j>=0; j--){
            w+= space + allwords[j].shape.offsetWidth;
        }
        if (Object.keys(x).length) {
            let l = new Line(start_x + w, y_calc, start_x + w +  allwords[i].shape.offsetWidth, y_calc, 'white');
            l.line.set('height', 2)
            l.line.set('box-shadow', 'black 2px 2px 2px')
            l.target = x.string;
            return l;
        } else {
            return {};
        }

    });

}


LOOPING = true;
//
setup();
requestAnimationFrame(loop)