if('addEventListener' in document){
    document.addEventListener('DOMContentLoaded', ()=>{
        FastClick.attach(document.body)
    }, false);
}


let guntype = {
    name: 'handgun',
    delay: 2000,
    ammo: 5,
    backupammo: 10,
    ammocap: 5,
};

let ammoP = {};

let gun = {};
let selectedgun = new Character(0,0,guntype.name);
selectedgun.nobounds = true;
selectedgun.forces = [];
document.body.style.backgroundImage = 'url(../images/bg3.jpg)';

let city = new Img('../images/city.png', 0, 0, width);
//creates empty array, maps it to 0-n, shuffles it, maps again to have x be a random int from 0 to n
let buildings = [];
let invadercolors = ['red', 'green', 'purple', 'blue', 'pink', 'white', 'yellow', 'orange'];
let invaders = new ImageLoader('../images/invaders/', invadercolors.map(x => 'invader' + x));
let aliens = [];

let aliendeathimg = new ImageLoader('../images/', ['electricball']);


let extras = ['bullet','fire'];
let LOADED_IMAGES = new ImageLoader('../images/projectiles/', extras);

let dragging_disabled = false;
let dragging = false;
let startpos = {x: 0, y: 0};

function disableDragging(){
    dragging_disabled = true;
}
function dragStart(ev) {
    if(!dragging_disabled){
        dragging = true;
        startpos.x = ev.clientX;
        startpos.y = ev.clientY;
    }

}

function dragStop() {
    dragging = false;
}

function drag(ev) {
    if (dragging && !dragging_disabled) {
        let n = selectedgun.sprite.getVal('left');
        if (n + ev.clientX - startpos.x < 0) {
            //gun.set('left', 50)
            return
        }
        if (n + ev.clientX - startpos.x > width - 100) {
            // selectedgun.sprite.set('left', width-50 )
            return
        }
        selectedgun.p.x += ev.clientX - startpos.x;
        if(selectedgun.extras.reloadbar){
            selectedgun.extras.reloadbar.p.x += ev.clientX - startpos.x;
        }
        startpos.x = ev.clientX;
    }


}


document.addEventListener('mousedown', dragStart);
document.addEventListener('mouseup', dragStop);
document.addEventListener('touchstop', dragStop);
document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', (ev) => {
    drag(ev.touches[0]);
});
document.addEventListener('touchstart', (ev) => {
    dragStart(ev.touches[0]);
});

let bullets = [];

function reload() {
    if(guntype.backupammo>0) {
        guntype.backupammo -= guntype.ammocap;
        guntype.ammo = guntype.ammocap;
        ammoP.string = guntype.ammo + ' : ' + guntype.backupammo;

        let loading = new PowerBall(selectedgun.p.x - 30, selectedgun.p.y - 50, 'health');
        loading.nobounds = true;
        let health = new LoadingBar(selectedgun.p.x - 30, selectedgun.p.y - 50, 60, 10, 0, 100, 1);
        loading.addSprite(health);
        health.set('zIndex', 10000);
        health.setBar('zIndex', 10001);
        selectedgun.extras.reloadbar = loading;
        gun.reloading = true;
        let interval = setInterval(() => {
            health.value++;
            if (health.value >= 100) {
                health.remove();
                delete selectedgun.extras.reloadbar;
                gun.reloading = false;
                clearInterval(interval);
            }
        }, guntype.delay / 100)
    }else{
        disableDragging();
        lose();
    }


}




function shoot() {
    if(guntype.ammo<= 0){
        reload();
        return;
    }
    if(gun.reloading) return;
    let angle = selectedgun.sprite.angle;
    let cos = Math.cos(angle * (Math.PI / 180));
    let sin = Math.sin(angle * (Math.PI / 180));
    let w = selectedgun.sprite.shape.offsetWidth;
    let h = selectedgun.sprite.shape.offsetHeight;
    let x = selectedgun.sprite.shape.offsetLeft + w / 2 - 20 +  cos* 50;
    let y = selectedgun.sprite.shape.offsetTop + h / 2 - 25 +  sin* 50;
    let bullet = new PowerBall(x, y, 'bullet');
    let bulletimg = new Img(LOADED_IMAGES.bullet.cloneNode(), x, y, 30, false, angle)
    bulletimg.set('zIndex', 1000)
    bullet.addSprite(bulletimg);
        let vec = new Vector(cos, sin);
        bullet.a.add(vec.set(30))
        bullet.antigrav = true;
        bullet.bounds = {x: width, y: height};
        bullet.fragile = true;
        bullets.push(bullet)
    guntype.ammo--
    ammoP.string = guntype.ammo + ' : ' + guntype.backupammo
    if(guntype.ammo<= 0){
        reload();
    }
}

let rescuedletters = '';
let rescued_num = 0;
loop = function () {
    selectedgun.update()
    for (let i = things_to_update.length - 1; i >= 0; i--) {
        things_to_update[i].update();
        if (things_to_update[i].dead) {
            things_to_update.splice(i, 1);
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
        if (aliens[i].rect === undefined || Object.keys(aliens[i].rect).length < 2) continue;

        if (!started) continue;
        for (let j = bullets.length - 1; j >= 0; j--) {
            if (!bullets[j].dead && aliens[i].rect.contains(bullets[j].rect)) {
                if (aliens[i].extras.pickup) {
                    //if the alien is holding something, then kill it and deal with the letter
                    let n = allletters.indexOf(aliens[i].extras.pickup.sprite);
                    let letter = allletters[n];
                    //find the letter
                    let remainder = chosenletters.replace(rescuedletters, '');
                    let actual_letter = allletters.slice(rescued_num).filter(x => x.string === splitletters[rescued_num])[0];
                    //find the letter that is needed
                    let obj = aliens[i].extras.pickup; //obj is the actual letter Character object
                    obj.nobounds = true;
                    obj.max_v = 5;
                    if (remainder.startsWith(letter.string)) {//its the right letter
                        rescuedletters += letter.string + (GRAMMAR_MODE ? ' ' : '');
                        rescued_num++; //add it to rescued letters, now we know the next letter
                        obj.moveto(new Vector(actual_letter.origp.x, actual_letter.origp.y)).done(() => {
                            obj.dead = true; //dead things get kicked out of update loop
                            obj.sprite.set('transform', '')
                        });
                        obj.spin();
                        things_to_update.push(obj); //add the obj to the main update loop
                    } else { //its not the right letter
                        obj.moveto(new Vector(actual_letter.origp)).done(location => {
                            obj.dead = true; //do the same thing, but get a new alien on it
                            obj.sprite.set('transform', '')
                            createAlien(obj, location);
                        });
                        obj.spin();
                        things_to_update.push(obj);
                    }
                    aliens[i].bld.occupied = false;
                } else {
                    //uh oh alien didnt have a pickup, meaning he died before picking it up. need to do mose hacky shit here;
                    //create a new alien but add old aliens targetting
                    createAlien(aliens[i].target, aliens[i].flytovec.copy());

                }
                aliens[i].kill();
                bullets[j].kill();
                delete aliens[i].extras.pickup;
            }

        }

    }
    if (chosenletters + (GRAMMAR_MODE ? ' ' : '') === rescuedletters) {
        win();
        }

};

function win(){
    allletters.forEach(x => {
        x.set('color', 'limegreen')
    })
}

function lose(){
    let promises = [];
    aliens.forEach(alien=>{
        alien.stophover()
        alien.doflyto = false;
        alien.flytovec = null;
        promises.push(
            new Promise((resolve,reject)=> {
                alien.flyto(new Vector(selectedgun.p)).done(() => {
                    console.log('done1')
                    alien.kill();
                    resolve();
                })
            })

        )})
    Promise.all(promises).then(()=>{
        selectedgun.kill();
    })
}
let allletters = [];
let chosenletters = '';
let splitletters = [];
let things_to_update = [];

function createAlien(target, vector) {
    let alien = new Flyer(10, 100, 'invader' + getRandom(invadercolors));
    let sprite = new Img(invaders[alien.name].cloneNode(), 10, 100, 50);
    sprite.set('zIndex', 1);
    alien.addSprite(sprite);
    alien.addDeathImage(aliendeathimg.electricball.cloneNode())
    alien.nobounds = true;
    alien.max_v = 5;
    if (target && vector) {
        alien.target = target;
        function pickUpLetter() { //needs to be separate to have a bindable this;
            this.extras.pickup = target;
            target.dead = false;
            let emptybuildings = buildings.filter(x => !x.occupied);
            let bld = getRandom(emptybuildings);
            this.bld = bld;
            bld.occupied = true;
            console.log(this.name)
            this.flyto(bld.vector.copy().add(new Vector(0, -30))).done(() => {
                this.hover();
            });
        }

        alien.flyto(vector).done(pickUpLetter.bind(alien));
    }
    aliens.push(alien)
}

function setup() {
    let gunsprite = new Img('../images/gun.png', width / 2 - 50, height - 70, 75, true, 270);
    selectedgun.p.x = width / 2 - 50;
    selectedgun.p.y = height- 35;
    selectedgun.addSprite(gunsprite);
    selectedgun.sprite.set('zIndex', 10000);
    selectedgun.sprite.shape.addEventListener('click', () => {
        shoot();
    });
    let y_calc = height * 0.15;
    let space = 15;
    chosenletters = getRandom(GRAMMAR_MODE ? sentences : words);
    splitletters = chosenletters.split(GRAMMAR_MODE ? ' ' : '');
    splitletters.forEach((word, i) => {
        let p = new P(word, 0, y_calc);
        let leftoffset = allletters.reduce((tot, item) => tot += item.shape.offsetWidth + space, 0);
        p.set('left', leftoffset + 'px');
        p.set('top', y_calc - (16 * 4) + 'px');
        p.set('margin', 0);
        p.set('fontSize', '4em');
        p.set('zIndex', 3);
        p.rect = new Rect(p.x, p.y, p.shape.offsetWidth, p.shape.offsetHeight);
        p.origp = new Vector(leftoffset, y_calc - (16 * 4));
        allletters.push(p);
    });
    let start_x = width / 2 - (allletters.reduce((tot, item) => tot += item.shape.offsetWidth + space, 0)) / 2;
    allletters.forEach(p => {
        p.mod('left', start_x);
        p.origp.add(new Vector(start_x, 0));
    });
    lines = allletters.map((x, i) => {
        let w = 0;
        for (let j = i - 1; j >= 0; j--) {
            w += space + allletters[j].shape.offsetWidth;
        }
        if (Object.keys(x).length) {
            let l = new Line(start_x + w, y_calc, start_x + w + allletters[i].shape.offsetWidth, y_calc, 'white');
            l.line.set('height', 2)
            l.line.set('box-shadow', 'black 2px 2px 2px')
            l.target = x.string;
            return l;
        } else {
            return {};
        }

    });
    buildings = shuffle(Array(splitletters.length).fill('').map((x, i) => i)).map((x, i) => {
        let img = new Img('../images/buildings/skyscraper' + getRandom(6) + '.png', 10 + (width / (splitletters.length + 1)) * i + getRandom(-40, 40), 'bottom', 50,);
        img.set('zIndex', 10)
        return img
    });
    buildings = shuffle(buildings)
    for (let i = 0; i < splitletters.length; i++) {
        createAlien();
    }
    ammoP = new P(guntype.ammo + ' : ' + guntype.backupammo, width*.9, height*0.01)
    ammoP.set('fontSize','2em')
}

let started = false;
id('jmpleft').addEventListener('click', () => {
    if(!started){
        started = true;
        aliens.forEach((alien, i) => {
            let target = new PowerBall(allletters[i].x, allletters[i].y, 'word');
            target.nobounds = true;
            target.addSprite(allletters[i]);
            alien.target = target;
            alien.flyto(new Vector(allletters[i].x, allletters[i].y)).done(x => {
                alien.extras.pickup = target;
                let bld = buildings[i];
                alien.bld = bld;
                bld.occupied = true;
                alien.flyto(bld.vector.copy().add(new Vector(0, -30))).done(x => {
                    alien.hover()
                });
            })
        })
    }

});

LOOPING = true;
//
setup();
setInterval(()=>loop(), 1000/FPS);