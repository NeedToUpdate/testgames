let guntype = {
    name: 'handgun',
    delay: 2000,
    ammo: 5,
    backupammo: 10,
    ammocap: 5,
};

let ammoP = {};

let gun = {};
let selectedgun = {}
let IMAGE_PATH = '../images/';
let city = {}
//creates empty array, maps it to 0-n, shuffles it, maps again to have x be a random int from 0 to n
let buildings = [];
let invadercolors = ['red', 'green', 'purple', 'blue', 'pink', 'white', 'yellow', 'orange'];
let invaders = {}
let aliens = [];

let aliendeathimg = {}

let LOADED_IMAGES = {}
let LEFT_OFFSET = 0;

function setupBackground() {
    return new Promise(resolve => {
        let extras = ['bullet', 'fire'];
        LOADED_IMAGES = new ImageLoader(IMAGE_PATH + 'projectiles/', extras);
        aliendeathimg = new ImageLoader(IMAGE_PATH + 'projectiles/', ['electric_projectile']);
        invaders = new ImageLoader(IMAGE_PATH + 'invaders/', invadercolors.map(x => 'invader' + x));

        DOMObjectGlobals.body.style.backgroundImage = 'url(' + IMAGE_PATH + 'bg3.jpg)';
        DOMObjectGlobals.body.style.pointerEvents = 'none';
        selectedgun = new Character(0, 0, guntype.name);
        selectedgun.hasNoBounds = true;
        LEFT_OFFSET = DOMObjectGlobals.body.offsetLeft;

        //to block out images that are preloaded into the game, to avoid loading times
        let imgBlk = id('image_blocker')
        imgBlk.style.width = width / 16 + 'px';
        imgBlk.style.height = width / 16 + 'px';
        imgBlk.style.backgroundColor = 'grey'
        imgBlk.style.zIndex = '1'
        imgBlk.style.position = 'absolute'
        imgBlk.style.left = '0'
        imgBlk.style.top = '0'
        imgBlk.style.backgroundImage = 'url(' + IMAGE_PATH + 'bg3.jpg)';
        imgBlk.style.backgroundSize = width + 'px auto';
        imgBlk.style.backgroundRepeat = 'no-repeat';



        id('jmpleft').style.pointerEvents = 'all';
        id('jmpleft').style.zIndex = '9999999';
        id('jmpleft').style.width = width / 14 + 'px';
        id('jmpleft').style.height = height / 10 + 'px';
        id('jmpleft').style.fontSize = (width / 60 > 24? 24 : width/60 ) + 'px';
        city = new Img(IMAGE_PATH + 'city.png', 0, 0, width).onLoad(() => {
            resolve()
        });
    })
}


let dragging_disabled = false;
let dragging = false;
let startpos = {
    x: 0,
    y: 0
};

function disableDragging() {
    dragging_disabled = true;
}

function dragStart(ev) {
    if (!dragging_disabled) {
        dragging = true;
        startpos.x = ev.clientX - LEFT_OFFSET;
        startpos.y = ev.clientY;
    }

}

function dragStop() {
    dragging = false;
}

function drag(ev) {
    if (dragging && !dragging_disabled) {
        let x = ev.clientX - LEFT_OFFSET
        let n = selectedgun.x;
        if (n + x - startpos.x < 0) {
            return
        }
        if (n + x - startpos.x > width - selectedgun.width / 2) {
            return
        }
        selectedgun.p.x += x - startpos.x;
        startpos.x = x;
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
        ammoP.string = 'ammo: ' + guntype.ammo + ' | ' + guntype.backupammo;
        let attachment = new Flyer(0, 0, 'loadingbar');
        let health = new LoadingBar(0, 0, width / 16, width / 96, 0, 100, 1);
        health.set('zIndex', '100000');
        health.setBar('zIndex', '100001');
        attachment.addSprite(health);
        selectedgun.addAttachment(attachment, new Vector(-width / 181, -width / 181));
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
    if (!started) return
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
    let x = selectedgun.x + cos * width / 19.2;
    let y = selectedgun.y + sin * width / 19.2;
    let bullet = new Flyer(x, y, 'bullet');
    let bulletimg = new Img(LOADED_IMAGES.bullet.cloneNode(), x, y, width / 32, 0, 0).fromCenter().onLoad(() => {
        bulletimg.set('zIndex', '1000');
        bullet.addSprite(bulletimg);
        bullet.angle = angle
        let vec = new Vector(cos, sin);
        bullet.addForce(vec.set(30));
        bullet.maxbounds = {
            x: width,
            y: height
        };
        bullet.isFragile = true;
        bullets.push(bullet);
    });
    guntype.ammo--;
    ammoP.string = 'ammo: ' + guntype.ammo + ' | ' + guntype.backupammo;
    if (guntype.ammo <= 0) {
        reload();
    }
}

let rescuedletters = '';
let rescued_num = 0;

function countHoveringAliens() {
    return aliens.reduce((a, b) => a + (b.isDoingHover ? 1 : 0), 0);
}

function loop() {
    selectedgun.update();
    if (Math.random() < 0.01 && countHoveringAliens() === aliens.length && aliens.length > 2) {
        let randoms = shuffle(aliens).slice(0, 3);
        let randomBlds = randoms.map(x => x.bld);
        randoms.forEach((alien, i) => {
            alien.stopHover();
            alien.bld = randomBlds[(i + 1) % 3];
            alien.doFlyTo(Vector.random(width, height * 0.5)).then(() => {
                alien.doFlyTo(alien.bld.p.copy().add(new Vector(alien.bld.width / 2, alien.bld.height / -2))).then(() => {
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
                buildingHandler.unOccupy(aliens[i].bld)
                if (aliens[i].attachmentList.length > 0) {
                    //if the alien is holding something, then kill it and deal with the letter
                    let letter = aliens[i].detachAttachment(aliens[i].attachmentList[0]); //is the actual letter Character object
                    letter.sprite.set('zIndex', '999999')
                    //find the letter
                    let remainder = chosenletters.replace(rescuedletters, '');
                    let letterThatsNeeded = allletters.slice(rescued_num).filter(x => x.name === splitletters[rescued_num])[0];
                    //find the letter that is needed
                    if (remainder.startsWith(letter.name)) { //its the right letter
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
    if (rescuedletters === (chosenletters + (GRAMMAR_MODE ? ' ' : '')) && allletters.filter(l => l.isDoingMoveTo).length < 1) {
        LOOPING = false;
        allletters.forEach(x => {
            x.sprite.color = 'limegreen'
        });
        LOADED_IMAGES.add('fire_projectile', IMAGE_PATH + 'projectiles');
        let promises = buildings.map(bld => {
            return new Promise(resolve => {
                let img = new Img(LOADED_IMAGES.fire_projectile.cloneNode(), bld.x, bld.y + bld.height / 2 - bld.width / 2, bld.width, 0, 240).fromCenter().onLoad(() => {
                    img.set('zIndex', '9');
                    bld.fire = img;
                    resolve()
                });
            })
        });
        stop();
        Promise.all(promises).then(() => {
            win();
        })
    }
};

function win() {
    buildings.forEach(bld => {
        let val = Math.random() * 5;
        bld.y -= val * 1.05;
        bld.fire.y -= val;
    });
    bullets.forEach(x => {
        x.update();
    });
    selectedgun.update();
    requestAnimationFrame(win)
}

function lose() {
    let promises = [];
    aliens.forEach(alien => {
        if (alien.isDoingHover) {
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
        if (alien.isDoingFlyTo) {
            alien.isDoingFlyTo = false;
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
        allletters.forEach(x => {
            x.sprite.color = 'red';
        })
    })
}

let allletters = [];
let chosenletters = '';
let splitletters = [];
let things_to_update = [];


function createAlien(target) {
    let alien = new Flyer(10, height / 4, 'invader' + getRandom(invadercolors));
    let sprite = new Img(invaders[alien.name].cloneNode(), 0, 0, width / 19.22).fromCenter().usingNewTransform().onLoad(() => {
        sprite.zIndex = 3;
        alien.addSprite(sprite);
        alien.addDeathImage(aliendeathimg.electric_projectile.cloneNode());
    });

    alien.hasNoBounds = true;
    alien.MAX_V = 5;
    if (target) {
        alien.target = target;

        function pickUpLetter() { //needs to be separate to have a bindable this;
            this.addAttachment(target, new Vector(0, -10));
            let bld = buildingHandler.occupy()
            this.bld = bld;
            this.doFlyTo(bld.vector.copy().add(new Vector(0, bld.height / -2))).then(() => {
                this.doHover();
            });
        }

        alien.doFlyTo(target.p).then(pickUpLetter.bind(alien));
    }
    aliens.push(alien)
}
let buildingHandler = {};

function setup() {
    let gunsprite = new Rectangle(width / 2, height - width / 24, width / 12.8, width / 12.7, 0).fromCenter();
    gunsprite.set('backgroundImage', 'url("' + IMAGE_PATH + 'gun.png")');
    gunsprite.set('backgroundSize', 'cover');
    gunsprite.set('backgroundColor', 'transparent');
    gunsprite.set('zIndex', '9999');
    selectedgun.x = width / 2;
    selectedgun.y = height - width / 24;
    selectedgun.addSprite(gunsprite);
    gunsprite.shape.style.pointerEvents = 'all';
    gunsprite.shape.addEventListener('click', shoot);
    selectedgun.angle = 270;
    selectedgun.addDeathImage(LOADED_IMAGES.fire);
    selectedgun.update();

    let y_calc = height * 0.15;
    let space = width / 64;
    chosenletters = getRandom(GRAMMAR_MODE ? sentences : words);
    if (!GRAMMAR_MODE) chosenletters = chosenletters.replace(' ', '');
    splitletters = chosenletters.split(GRAMMAR_MODE ? ' ' : '');
    splitletters.forEach((word, i) => {
        let letter = new Character(0, 0, word);
        let p = new P(word, 0, y_calc, width / 15).fromCenter();
        let leftOffset = allletters.reduce((tot, item) => tot + item.width + space, 0);
        letter.addSprite(p);
        letter.x = leftOffset + p.width / 2;
        letter.y = y_calc - p.height / 3;
        letter.hasNoBounds = true;
        p.set('zIndex', '4');
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
        let img = new Img(IMAGE_PATH + 'buildings/skyscraper' + getRandom(6) + '.png', width * .1 + (width * .9 / (splitletters.length + 1)) * i + getRandom(-40, 40), 0, width / 19.22, ).fromCenter().onLoad(() => {
            img.y = height - img.height / 2;
        });
        img.set('zIndex', '10');
        return img
    });
    buildingHandler = new BuildingHandler(buildings);
    for (let i = 0; i < splitletters.length; i++) {
        createAlien();
    }
    ammoP = new P('ammo: ' + guntype.ammo + ' | ' + guntype.backupammo, width * .9, height * 0.01, width / 30);
}

let started = false;
id('jmpleft').addEventListener('click', () => {
    if (!started) {
        aliens.forEach((alien, i) => {
            alien.target = allletters[i];
            alien.doFlyTo(allletters[i].p.copy()).then(() => {
                alien.addAttachment(allletters[i], new Vector(0, -10));
                let bld = buildingHandler.occupy();
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

class BuildingHandler {
    constructor(array) {
        this.blds = shuffle(array);
        this.size = this.blds.length;
        this.occupiedBlds = []
    }
    occupy() {
        if (this.occupiedBlds.length >= this.size) return null;
        let val = getRandom(this.size);
        while (this.occupiedBlds.includes(val)) {
            val = getRandom(this.size);
        }
        this.occupiedBlds.push(val)
        return this.blds[val]
    }
    unOccupy(bld) {
        let val = this.blds.indexOf(bld);
        if (val === -1) return null;
        this.occupiedBlds.splice(this.occupiedBlds.indexOf(val), 1);
        return val;
    }

}


function play() {
    createFallbackLoopFunction(loop).start()
}

setupBody(id("MAIN_SCREEN")).then(() => {
    setupBackground().then(() => {
        setup();
    })
})