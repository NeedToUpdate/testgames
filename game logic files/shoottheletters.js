let sentences = words.map(x=>(Math.random()>0.5? 'He': 'She') + ' is '+x + ' in line');;

let gun = new Img('../images/gun.png', width / 2 - 50, height - 100, 100, true, 270);
gun.set('zIndex', 100000)
document.body.style.backgroundImage = 'url(../images/bg0.jpg)';

let city = new Img('../images/city.png', 0, 0, width);
//creates empty array, maps it to 0-n, shuffles it, maps again to have x be a random int from 0 to n
let buildings = [];
let invadercolors = ['red', 'green', 'purple', 'blue', 'pink', 'white', 'yellow', 'orange'];
let invaders = new ImageLoader('../images/invaders/', invadercolors.map(x=>'invader'+x));
let aliens = [];

let aliendeathimg = new ImageLoader('../images/', ['electricball']);


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
    if(dragging){

        if(ev.clientX>width*.05 && ev.clientX<width*.95){
            console.log(ev.clientX)
            gun.mod('left', ( ev.clientX - startpos.x))
        }
        startpos.x = ev.clientX;
    }



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
    let x = gun.shape.offsetLeft + w / 2 -20 + Math.cos(gun.angle * (Math.PI / 180)) * 50;
    let y = gun.shape.offsetTop + h / 2 - 25 + Math.sin(gun.angle * (Math.PI / 180)) * 50;
    let bullet = new PowerBall(x, y, 'bullet');
    let bulletimg = new Img(LOADED_IMAGES.bullet.cloneNode(), x, y, 30, false, angle)
    bulletimg.set('zIndex', 1000)
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

let rescuedletters = '';
let rescued_num = 0;
loop = function () {
    for(let i = things_to_update.length -1; i>=0; i--){
        things_to_update[i].update();
        if(things_to_update[i].dead){
            things_to_update.splice(i,1);
        }
    }
    for (let j = bullets.length - 1; j >= 0; j--) {
        bullets[j].update();
        if (bullets[j].dead) {
            bullets.splice(j, 1);
        }
    }
    for (let i = aliens.length - 1; i >= 0; i--) {
        aliens[i].update();
        if (aliens[i].dead) {
            aliens.splice(i, 1)
            continue;
        }


        for (let j = bullets.length - 1; j >= 0; j--) {
            if (!bullets[j].dead && aliens[i].rect.contains(bullets[j].rect)) {

                let n = allletters.indexOf(aliens[i].extras.pickup.sprite);
                let letter = allletters[n];
                let remainder = chosenletters.replace(rescuedletters, '');
                let obj = aliens[i].extras.pickup;
                let actual_letter = allletters.slice(rescued_num).filter(x=>x.string === chosenletters[rescued_num])[0];
                obj.nobounds = true;
                obj.max_v = 5;
                if(remainder.startsWith(letter.string)){
                    console.log('in order')
                    rescuedletters += letter.string;
                    rescued_num++;


                    obj.moveto(new Vector(actual_letter.origp.x, actual_letter.origp.y)).done(()=>{
                        obj.dead = true;
                        obj.sprite.set('transform', '')
                    });
                    obj.spin();
                    things_to_update.push(obj);

                }else{


                    obj.moveto(new Vector(actual_letter.origp)).done(x=>{
                        obj.dead = true;
                        obj.sprite.set('transform', '')
                        let alien = new Flyer(10,100,'invader' + getRandom(invadercolors));
                        let sprite = new Img(invaders[getRandom(invaders.names)].cloneNode(), 10,100,50);
                        alien.addSprite(sprite);
                        alien.addDeathImage(aliendeathimg.electricball);
                        alien.nobounds = true;
                        alien.max_v = 5;
                        alien.flyto(x).done(x=>{
                            alien.extras.pickup = obj;
                            obj.dead = false;
                            let emptybuildings = buildings.filter(x=>!x.occupied);
                            let bld = getRandom(emptybuildings);
                            alien.bld = bld;
                            bld.occupied = true;
                            alien.flyto(bld.vector.copy().add(new Vector(0,-30))).done(x=>{
                                alien.hover();
                            });
                        });
                        aliens.push(alien)
                    });
                    obj.spin();
                    things_to_update.push(obj);

                }
                aliens[i].kill();
                bullets[j].kill();
                aliens[i].bld.occupied = false;
                delete aliens[i].extras.pickup;
            }

        }

    }
    if(chosenletters === rescuedletters){
        allletters.forEach(x=>{
            x.set('color', 'limegreen')
        })
    }
    if (LOOPING) {
        requestAnimationFrame(loop)
    }

};

let allletters = [];
let chosenletters = '';
let things_to_update = [];
function setup() {
    let start_x = width*0.3;
    let y_calc = height*0.15;
    let space = 15;
    chosenletters = getRandom(words);
    chosenletters.split('').forEach((word,i)=>{
        let p = new P(word, 0, y_calc);
        let leftoffset = allletters.reduce((tot,item)=>tot+= item.shape.offsetWidth + space,start_x);
        p.set('left', leftoffset  + 'px');
        p.set('top', y_calc - (16*4) + 'px');
        p.set('margin', 0);
        p.set('fontSize', '4em');
        p.set('zIndex', 3);
        p.rect = new Rect(p.x, p.y, p.shape.offsetWidth, p.shape.offsetHeight);
        p.origp = new Vector(leftoffset, y_calc-(16*4));
        allletters.push(p);
    })

    lines = allletters.map((x, i) => {
        let w = 0;
        for(let j = i-1; j>=0; j--){
            w+= space + allletters[j].shape.offsetWidth;
        }
        if (Object.keys(x).length) {
            let l = new Line(start_x + w, y_calc, start_x + w +  allletters[i].shape.offsetWidth, y_calc, 'white');
            l.line.set('height', 2)
            l.line.set('box-shadow', 'black 2px 2px 2px')
            l.target = x.string;
            return l;
        } else {
            return {};
        }

    });
    buildings = shuffle(Array(chosenletters.length).fill('').map((x, i) => i)).map((x, i) => {
        let img = new Img('../images/buildings/skyscraper' + getRandom(6)+ '.png', 10 + (width / (chosenletters.length+1)) * i + getRandom(-40, 40), 'bottom', 50,);
        img.set('zIndex', 10)
        return img
    });
    buildings = shuffle(buildings)
    for(let i = 0; i<chosenletters.length ;i++){
        let alien = new Flyer(10,100,'invader' + getRandom(invadercolors));
        let sprite = new Img(invaders[getRandom(invaders.names)].cloneNode(), 10,100,50);
        sprite.set('zIndex', 1);
        alien.addSprite(sprite);
        alien.addDeathImage(aliendeathimg.electricball)
        alien.nobounds = true;
        alien.max_v = 5;
        alien.sprite.shape.addEventListener('click',()=>{
            aliens.forEach((alien,i)=>{
                alien.flyto(new Vector(allletters[i].x,allletters[i].y)).done(x=>{
                    alien.extras.pickup = new PowerBall(alien.p.x,alien.p.y,'word');
                    alien.extras.pickup.nobounds = true;
                    alien.extras.pickup.addSprite(allletters[i]);
                    let bld = buildings[i];
                    alien.flyto(bld.vector.copy().add(new Vector(0,-30))).done(x=>{
                        alien.bld = bld;
                        bld.occupied = true;
                        alien.hover()
                    });
                })
            })
        });
        aliens.push(alien)
    }

}


LOOPING = true;
//
setup();
requestAnimationFrame(loop)