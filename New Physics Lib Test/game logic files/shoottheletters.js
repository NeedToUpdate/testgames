let guntype = {
    name: 'handgun',
    delay: 2000,
    ammo: 5,
    backupammo: 10,
    ammocap: 5,
};

let ammoP = {};

let gun = {};
let selectedgun = new Character(0, 0, guntype.name);

let IMAGE_PATH = '../../images/';
selectedgun.hasNoBounds = true;
document.body.style.backgroundImage = 'url(' + IMAGE_PATH + 'bg3.jpg)';
document.body.style.pointerEvents = 'none';

let city = new Img(IMAGE_PATH + 'city.png', 0, 0, width);
//creates empty array, maps it to 0-n, shuffles it, maps again to have x be a random int from 0 to n
let buildings = [];
let invadercolors = ['red', 'green', 'purple', 'blue', 'pink', 'white', 'yellow', 'orange'];
let invaders = new ImageLoader(IMAGE_PATH + 'invaders/', invadercolors.map(x => 'invader' + x));
let aliens = [];

let aliendeathimg = new ImageLoader(IMAGE_PATH + 'projectiles/', ['electric_projectile']);


let extras = ['bullet', 'fire'];
let LOADED_IMAGES = new ImageLoader(IMAGE_PATH + 'projectiles/', extras);

let dragging_disabled = false;
let dragging = false;
let startpos = {x: 0, y: 0};

function disableDragging() {
    dragging_disabled = true;
}

function dragStart(ev) {
    if (!dragging_disabled) {
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
        let n = selectedgun.x;
        if (n + ev.clientX - startpos.x < 0) {
            return
        }
        if (n + ev.clientX - startpos.x > width - selectedgun.width/2) {
            return
        }
        selectedgun.p.x += ev.clientX - startpos.x;
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
    if (guntype.backupammo > 0) {
        guntype.backupammo -= guntype.ammocap;
        guntype.ammo = guntype.ammocap;
        ammoP.string = guntype.ammo + ' : ' + guntype.backupammo;
        let attachment = new Flyer(0, 0, 'loadingbar');
        let health = new LoadingBar(0, 0, 60, 10, 0, 100, 1);
        health.set('zIndex', '100000');
        health.setBar('zIndex', '100001');
        attachment.addSprite(health);
        selectedgun.addAttachment(attachment, new Vector(-20, -20));
        gun.reloading = true;
        let interval = setInterval(() => {
            health.value++;
            if (health.value >= 100) {
                let attachment = selectedgun.detachAttachment('loadingbar');
                attachment.kill();
                gun.reloading = false;
                clearInterval(interval);
            }
        }, guntype.delay / 100)
    } else {
        disableDragging();
        lose();
    }


}


function shoot() {
    if(!started) return
    if (guntype.ammo <= 0) {
        reload();
        return;
    }
    if (gun.reloading) return;
    let angle = selectedgun.angle;
    let cos = Math.cos(angle * (Math.PI / 180));
    let sin = Math.sin(angle * (Math.PI / 180));
    let w = selectedgun.width;
    let h = selectedgun.height;
    let x = selectedgun.x + cos * 50;
    let y = selectedgun.y + sin * 50;
    let bullet = new Flyer(x, y, 'bullet');
    let bulletimg = new Img(LOADED_IMAGES.bullet.cloneNode(), x, y, 30, null, angle).fromCenter().usingNewTransform().onLoad(() => {
        bulletimg.set('zIndex', '1000');
        bullet.addSprite(bulletimg);
        bullet.angle = angle
        let vec = new Vector(cos, sin);
        bullet.addForce(vec.set(30));
        bullet.maxbounds = {x: width, y: height};
        bullet.isFragile = true;
        bullets.push(bullet);
    });
    guntype.ammo--;
    ammoP.string = guntype.ammo + ' : ' + guntype.backupammo;
    if (guntype.ammo <= 0) {
        reload();
    }
}

let rescuedletters = '';
let rescued_num = 0;

function countHoveringAliens(){
    return aliens.reduce((a,b)=>a+(b.isDoingHover?1:0),0);
}

function loop() {
    selectedgun.update();
    if(Math.random()<0.01 && countHoveringAliens() === aliens.length && aliens.length>2){
        let randoms = shuffle(aliens).slice(0,3);
        let randomBlds = [];
        randoms.forEach((alien,i)=>{
            randomBlds.push(alien.bld);
            alien.stopHover();
            alien.doFlyTo(Vector.random(width,height*0.5)).then(()=>{
                alien.bld = randomBlds[(i+1)%3];
                alien.doFlyTo(alien.bld.p.copy().add(new Vector(alien.bld.width/2,alien.bld.height/-2))).then(()=>{
                    alien.doHover();
                });


            })
        })
    }
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
            aliens.splice(i, 1);
            continue;
        }



        for (let j = bullets.length - 1; j >= 0; j--) {
            if (!bullets[j].dead && aliens[i].hasHitbox && bullets[j].hasHitbox && aliens[i].hitbox.contains(bullets[j].hitbox)) {
                aliens[i].bld.occupied = false;
                if (aliens[i].attachmentList.length > 0) {
                    //if the alien is holding something, then kill it and deal with the letter
                    let letter = aliens[i].detachAttachment(aliens[i].attachmentList[0]);//is the actual letter Character object
                    letter.sprite.set('zIndex', '999999')
                    //find the letter
                    let remainder = chosenletters.replace(rescuedletters, '');
                    let letterThatsNeeded = allletters.slice(rescued_num).filter(x => x.name === splitletters[rescued_num])[0];
                    //find the letter that is needed
                    if (remainder.startsWith(letter.name)) {//its the right letter
                        rescuedletters += letter.name + (GRAMMAR_MODE ? ' ' : '');
                        rescued_num++; //add it to rescued letters, now we know the next letter
                        letter.MAX_V = 5;
                        letter.doMoveTo(letterThatsNeeded.cache.origXY.copy()).then(() => {
                            letter.angle = 0;
                            letter.sprite.set('textShadow', 'green 0 0 2px')
                        });
                        letter.doSpin(360, 10);
                        things_to_update.push(letter); //add the obj to the main update loop
                    } else { //its not the right letter
                        letter.MAX_V = 5;
                        letter.doMoveTo(letterThatsNeeded.cache.origXY.copy()).then(() => {
                            letter.angle = 0;
                            createAlien(letter);
                        });
                        letter.doSpin(360, 10);
                        things_to_update.push(letter);
                    }

                } else {
                    //uh oh alien didnt have a pickup, meaning he died before picking it up. need to do mose hacky shit here;
                    //create a new alien but add old aliens targetting
                    createAlien(aliens[i].target);

                }
                aliens[i].kill();
                bullets[j].kill();
            }

        }

    }
    if (rescuedletters === (chosenletters + (GRAMMAR_MODE? ' ': '')) && allletters.filter(l=>l.isDoingMoveTo).length<1) {
        LOOPING = false;
        allletters.forEach(x => {
            x.sprite.color = 'limegreen'
        });
        LOADED_IMAGES.add('fire_projectile', IMAGE_PATH + 'projectiles');
        let promises = buildings.map(bld=>{
            return new Promise(resolve => {
                let img = new Img(LOADED_IMAGES.fire_projectile.cloneNode(),bld.x,bld.y+bld.height/2 - bld.width/2,bld.width,null,270).fromCenter().onLoad(()=>{
                    img.set('zIndex', '9');
                    bld.fire = img;
                    resolve()
                });
            })
        });
        Promise.all(promises).then(()=>{
            win();
        })
    }
    if (LOOPING) requestAnimationFrame(loop)

};

function win() {
    buildings.forEach(bld=>{
        let val = Math.random()*5;
        bld.y-= val;
        bld.fire.y -= val;
    })
    requestAnimationFrame(win)
}

function lose() {
    let promises = [];
    aliens.forEach(alien => {
        if(alien.isDoingHover){
            alien.stopHover();
            promises.push(
                new Promise((resolve) => {
                    alien.doFlyTo(new Vector(selectedgun.p)).then(() => {
                        alien.kill();
                        resolve();
                    })
                })
            )
        }
    });
    Promise.all(promises).then(() => {
        selectedgun.kill();
        allletters.forEach(x=>{
            x.sprite.color = 'red';
        })
    })
}

let allletters = [];
let chosenletters = '';
let splitletters = [];
let things_to_update = [];


function createAlien(target) {
    let alien = new Flyer(10, 100, 'invader' + getRandom(invadercolors));
    let sprite = new Img(invaders[alien.name].cloneNode(), 10, 100, 50).fromCenter().onLoad(() => {
        sprite.set('zIndex', '1');
        alien.addSprite(sprite);
        alien.addDeathImage(aliendeathimg.electric_projectile.cloneNode());
    });

    alien.hasNoBounds = true;
    alien.MAX_V = 5;
    if (target) {
        alien.target = target;

        function pickUpLetter() { //needs to be separate to have a bindable this;
            this.addAttachment(target, new Vector(0, -10));
            let emptybuildings = buildings.filter(x => !x.occupied);
            let bld = getRandom(emptybuildings);
            this.bld = bld;
            bld.occupied = true;
            this.doFlyTo(bld.vector.copy().add(new Vector(0, bld.height / -2))).then(() => {
                this.doHover();
            });
        }

        alien.doFlyTo(target.p).then(pickUpLetter.bind(alien));
    }
    aliens.push(alien)
}

function setup() {
    let gunsprite = new Rectangle(width / 2 - 50, height - 70, 75, 76, 0).fromCenter();
    gunsprite.set('backgroundImage', 'url("' + IMAGE_PATH + 'gun.png")');
    gunsprite.set('backgroundSize', 'cover');
    gunsprite.set('backgroundColor', 'transparent');
    gunsprite.set('zIndex', '9999');
    selectedgun.x = width / 2 - 50;
    selectedgun.y = height - 35;
    selectedgun.addSprite(gunsprite);
    gunsprite.shape.style.pointerEvents = 'all';
    gunsprite.shape.addEventListener('click', shoot);
    selectedgun.angle = 270;
    selectedgun.update();

    let y_calc = height * 0.15;
    let space = 15;
    chosenletters = getRandom(GRAMMAR_MODE ? sentences : words);
    if (!GRAMMAR_MODE) chosenletters = chosenletters.replace(' ', '');
    splitletters = chosenletters.split(GRAMMAR_MODE ? ' ' : '');
    splitletters.forEach((word, i) => {
        let letter = new Character(0, 0, word);
        let p = new P(word, 0, y_calc).fromCenter();
        p.set('fontSize', '4em');
        let leftOffset = allletters.reduce((tot, item) => tot + item.width + space, 0);
        letter.addSprite(p);
        letter.x = leftOffset + p.width / 2;
        letter.y = y_calc - p.height / 3;
        letter.hasNoBounds = true;
        p.set('zIndex', '3');
        p.set('textShadow', 'black 0 0 1px');
        letter.cache.origXY = new Vector(letter.x, letter.y);
        allletters.push(letter);
    });
    let start_x = width / 2 - (allletters.reduce((tot, item) => tot + item.width + space, 0)) / 2;
    allletters.forEach(p => {
        p.x += start_x;
        p.cache.origXY.add(new Vector(start_x, 0));
    });
    lines = allletters.map((x, i) => {
        let w = 0;
        for (let j = i - 1; j >= 0; j--) {
            w += space + allletters[j].width;
        }
        if (Object.keys(x).length) {
            let l = Line.fromAngle(start_x + w, y_calc, allletters[i].width, 0, 2).setColor('white');
            l.set('box-shadow', 'black 2px 2px 2px');
            l.target = x.string;
            return l;
        } else {
            return {};
        }

    });
    buildings = shuffle(Array(splitletters.length).fill('').map((x, i) => i)).map((x, i) => {
        let img = new Img(IMAGE_PATH + 'buildings/skyscraper' + getRandom(6) + '.png', 100 + ((width-100) / (splitletters.length + 1)) * i + getRandom(-40, 40), 0, 50,).fromCenter().onLoad(() => {
            img.y = height - img.height / 2;
        });
        img.set('zIndex', '10');
        return img
    });
    buildings = shuffle(buildings);
    for (let i = 0; i < splitletters.length; i++) {
        createAlien();
    }
    ammoP = new P(guntype.ammo + ' : ' + guntype.backupammo, width * .9, height * 0.01);
    ammoP.set('fontSize', '2em')
}

let started = false;
id('jmpleft').addEventListener('click', () => {
    if (!started) {
        aliens.forEach((alien, i) => {
            alien.target = allletters[i];
            alien.doFlyTo(allletters[i].p.copy()).then(() => {
                alien.addAttachment(allletters[i], new Vector(0, -10));
                let bld = buildings[i];
                alien.bld = bld;
                bld.occupied = true;
                alien.doFlyTo(bld.vector.copy().add(new Vector(0, bld.height / -2))).then(() => {
                    alien.doHover()
                });
            })
        });
        started = true;
        play();
    }
});
id('jmpleft').style.pointerEvents = 'all';
id('jmpleft').style.zIndex = '9999999';

function play() {
    LOOPING = true;
    loop()
}

//
setup();