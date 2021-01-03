let gunConfigs = {
    'gun':{
        name: 'Pistol',
        delay: 750,
        ammo: 5,
        backupammo: 10,
        ammocap: 5,
        reloadTime: 2000,
        perShot: 1,
        bulletSpeed: 30,
        rarity: 'common'
    },
    'ak47':{
        name: 'AK-47',
        delay: 50,
        ammo: 30,
        backupammo: 60,
        ammocap: 30,
        reloadTime: 2000,
        perShot: 3,
        bulletSpeed: 30,
        rarity: 'uncommon'
    },
    'alienblaster':{
        name: 'Alien Blaster',
        delay: 2000,
        ammo: 3,
        backupammo: 100, 
        ammocap: 3,
        reloadTime: 200,
        perShot: 1,
        bulletSpeed: 7,
        rarity: 'legendary'
    },
    'rpg':{
        name: 'RPG',
        delay: 3000,
        ammo: 1,
        backupammo: 5,
        ammocap: 1,
        reloadTime: 2000,
        perShot: 1,
        bulletSpeed: 3,
        rarity: 'rare'
    },
    'uzi':{
        name: 'Uzi',
        delay: 20,
        ammo: 45,
        backupammo: 45,
        ammocap: 45,
        reloadTime: 2000,
        perShot: 5,
        bulletSpeed: 30,
        rarity: 'uncommon'
    },
    'infinitygauntlet':{
        name: 'Gauntlet',
        delay: 200,
        ammo: 1,
        backupammo: 3,
        ammocap: 1,
        reloadTime: 4000,
        perShot: 0,
        bulletSpeed: 0,
        rarity: 'legendary'
    },
    'awm':{
        name: 'AWM',
        delay: 300,
        ammo: 4,
        backupammo: 8,
        ammocap: 4,
        reloadTime: 2000,
        perShot: 1,
        bulletSpeed: 200,
        rarity: 'rare'
    },
    'deagle':{
        name: 'Desert Eagle',
        delay: 100,
        ammo: 5,
        backupammo: 20,
        ammocap: 5,
        reloadTime: 1000,
        perShot: 1,
        bulletSpeed: 40,
        rarity: 'uncommon'
    },
    'glock':{
        name: 'Glock',
        delay: 20,
        ammo: 8,
        backupammo: 32,
        ammocap: 8,
        reloadTime: 200,
        perShot: 2,
        bulletSpeed: 30,
        rarity: 'uncommon'
    },
    'm16':{
        name: 'M-16',
        delay: 200,
        ammo: 20,
        backupammo: 60,
        ammocap: 20,
        reloadTime: 2000,
        perShot: 4,
        bulletSpeed: 35,
        rarity: 'uncommon'
    },
    'mp5':{
        name: 'MP5',
        delay: 50,
        ammo: 15,
        backupammo: 60,
        ammocap: 15,
        reloadTime: 1500,
        perShot: 3,
        bulletSpeed: 25,
        rarity: 'uncommon'
    },
    'p90':{
        name: 'P90',
        delay: 40,
        ammo: 30,
        backupammo: 90,
        ammocap: 30,
        reloadTime: 1500,
        perShot: 5,
        bulletSpeed: 60,
        rarity: 'rare'
    },
    'remington':{
        name: 'Remington',
        delay: 400,
        ammo: 2,
        backupammo: 10,
        ammocap: 2,
        reloadTime: 2500,
        perShot: 1,
        bulletSpeed: 40,
        rarity: 'rare'
    },
    'revolver':{
        name: 'Revolver',
        delay: 200,
        ammo: 6,
        backupammo: 30,
        ammocap: 6,
        reloadTime: 1000,
        perShot: 1,
        bulletSpeed: 35,
        rarity: 'uncommon'
    },
    'rpd':{
        name: 'RPD',
        delay: 50,
        ammo: 20,
        backupammo: 100,
        ammocap: 20,
        reloadTime: 3000,
        perShot: 10,
        bulletSpeed: 30,
        rarity: 'rare'
    },
};

let oddsOfDrop = 4 //out of 10
let oddsOfUncommon = 3
let oddsOfRare = 1
let oddsOfLegendary = 0.5;

let GUN_IMG_CONFIG = IMAGE_CONFIG.weapons;

let currentGun = 'gun';
let gunStats = Object.assign({},gunConfigs[currentGun])
let ammoP = {};
let gunSprite = {}

let oldGuns = [];
let gun = {};
let selectedgun = {}
let IMAGE_PATH = '../images/';
let city = {}
//creates empty array, maps it to 0-n, shuffles it, maps again to have x be a random int from 0 to n
let buildings = [];
let invadercolors = ['red', 'green', 'purple', 'blue', 'pink', 'white', 'yellow', 'orange'];
let validGunNames = ['gun','ak47','alienblaster','rpg','uzi','infinitygauntlet'];
let invaders = {}
let aliens = [];
let guns ={};

let aliendeathimg = {}

let LOADED_IMAGES = {}
let LEFT_OFFSET = 0;

let ALL_FALLERS = [];

function setupBackground() {
    return new Promise(resolve => {
        let extras = ['fire'];
        LOADED_IMAGES = new ImageLoader(IMAGE_PATH + 'projectiles/', extras.concat(['electric','bullet','nuke','whitemagic'].map(x=>x+'_projectile')));
        aliendeathimg = LOADED_IMAGES.electric_projectile
        invaders = new ImageLoader(IMAGE_PATH + 'invaders/', invadercolors.map(x => 'invader' + x));
        DOMObjectGlobals.body.style.backgroundImage = 'url(' + IMAGE_PATH + 'bg3.jpg)';
        selectedgun = new Character(0, 0, gunStats.name);
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
    if (gunStats.backupammo > 0) {
        gunStats.backupammo -= gunStats.ammocap;
        gunStats.ammo = gunStats.ammocap;
        
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
        }, gunStats.delay / 100)
    } else {
        if(oldGuns.length){
            resetLastGun()
        }else{
            disableDragging();
            lose();
        }
    }
    

}

function shakeScreen(){
    id('MAIN_SCREEN').style.left = '-5px'
    setTimeout(()=>{
        id('MAIN_SCREEN').style.left = '5px'
        setTimeout(()=>{
            id('MAIN_SCREEN').style.left = '-5px'
            setTimeout(()=>{
                id('MAIN_SCREEN').style.left = '5px'
                setTimeout(()=>{
                    id('MAIN_SCREEN').style.left = '-5px'
                    setTimeout(()=>{
                        id('MAIN_SCREEN').style.left = ''
                    },50)
                },50)
            },50)
        },50)
    },50)
}

let IS_SHOOTING = false;
let GUN_CHANGE_QUEUE = 'none'
function shoot() {
    if (!started) return
    if (gunStats.ammo <= 0) {
        reload();
        return;
    }
    if (gun.reloading) return;
    if (IS_SHOOTING) return;
    IS_SHOOTING = true;
    let angle = selectedgun.angle;
    let cos = Math.cos(angle * (Math.PI / 180));
    let sin = Math.sin(angle * (Math.PI / 180));
    let w = selectedgun.width;
    let h = selectedgun.height;
    let x = selectedgun.x + cos * width / 19.2;
    let y = selectedgun.y + sin * width / 19.2;
    let shotsRemaining = gunStats.perShot - gunStats.ammo >0? gunStats.ammo : gunStats.perShot; //if less than the burst is in the chamber, only shoot the remaining
    if(currentGun === 'infinitygauntlet'){
        aliens.forEach((x,i)=>{
            if(!(i%2)){
                killAlien(x);
            }
            gunStats.ammo--;
            setAmmoText(gunStats.ammo,gunStats.backupammo)
            shakeScreen();
        })
    }else{
        for(let i = 1; i<=shotsRemaining; i++){
            //starts from 1 so its easier to do the configs
            let projectileName = 'bullet'
            if(currentGun == 'rpg') projectileName = 'nuke'
            if(currentGun == 'alienblaster') projectileName = 'whitemagic'
            setTimeout(()=>{           
                if(currentGun === 'alienblaster'){
                    for(let i = 0; i<5; i++){
                        let bullet = new Flyer(x, y, 'bullet');
                        let bulletimgScatter = new Img(LOADED_IMAGES[projectileName + '_projectile'].cloneNode(), x, y, width / 32, 0, 0).fromCenter().onLoad(() => {
                            bulletimgScatter.set('zIndex', '1000');
                            bullet.addSprite(bulletimgScatter);
                            bullet.angle = angle - 35 + 18*i
                            cos = Math.cos(bullet.angle  * (Math.PI / 180));
                            sin = Math.sin(bullet.angle * (Math.PI / 180));
                            let vec = new Vector(cos, sin);
                            bullet.addForce(vec.set(gunStats.bulletSpeed));
                            bullet.maxbounds = {
                                x: width,
                                y: height
                            };
                            bullet.isFragile = true;
                            bullets.push(bullet);
                            setAmmoText(gunStats.ammo,gunStats.backupammo)
                        });
                    }
                }else if(currentGun === 'remington'){
                    for(let i = 0; i<8; i++){
                        let bullet = new Flyer(x, y, 'bullet');
                        let bulletimgScatter = new Img(LOADED_IMAGES[projectileName + '_projectile'].cloneNode(), x, y, width / 64, 0, 0).fromCenter().onLoad(() => {
                            bulletimgScatter.set('zIndex', '1000');
                            bullet.addSprite(bulletimgScatter);
                            bullet.angle = angle - 25 + 5.6*i
                            cos = Math.cos(bullet.angle  * (Math.PI / 180));
                            sin = Math.sin(bullet.angle * (Math.PI / 180));
                            let vec = new Vector(cos, sin);
                            bullet.addForce(vec.set(gunStats.bulletSpeed));
                            bullet.maxbounds = {
                                x: width,
                                y: height
                            };
                            bullet.isFragile = true;
                            bullets.push(bullet);
                            setAmmoText(gunStats.ammo,gunStats.backupammo)
                        });
                    }
                }else{
                    let bullet = new Flyer(x, y, 'bullet');
                    let bulletimg = new Img(LOADED_IMAGES[projectileName + '_projectile'].cloneNode(), x, y, currentGun === 'rpg'? width/8 : width / 32, 0, 0).fromCenter().onLoad(() => {
                        bulletimg.set('zIndex', '1000');
                        bullet.addSprite(bulletimg);
                        if(currentGun === 'rpg'){
                            bullet.addDeathImage(LOADED_IMAGES.fire)
                        }
                        bullet.angle = angle
                        let vec = new Vector(cos, sin);
                        bullet.addForce(vec.set(gunStats.bulletSpeed));
                        bullet.maxbounds = {
                            x: width,
                            y: height
                        };
                        bullet.isFragile = true;
                        bullets.push(bullet);
                        setAmmoText(gunStats.ammo,gunStats.backupammo)
                    });
                }
            },(i-1)*50)
            gunStats.ammo--;
            
        }
    }
    
    setTimeout(()=>{
        IS_SHOOTING = false;
        if(GUN_CHANGE_QUEUE !== 'none'){
            changeGun(GUN_CHANGE_QUEUE);
            GUN_CHANGE_QUEUE = 'none'
        }
    },gunStats.delay)
    if (gunStats.ammo <= 0) {
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
            if (!bullets[j].dead && !aliens[i].dead && aliens[i].hasHitbox && bullets[j].hasHitbox && aliens[i].hitbox.contains(bullets[j].hitbox)) {
                killAlien(aliens[i])
                if(currentGun === 'rpg'){
                    aliens.forEach(alien=>{
                        if(alien !== aliens[i] && !alien.dead){
                            if(Math.abs(alien.x - aliens[i].x)<width/4 && Math.abs(alien.y - aliens[i].y)<width/4){
                                killAlien(alien)
                            }
                        }
                    })
                }
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
        ALL_FALLERS.forEach(x=>{
            x.kill()
        })
        stop();
        Promise.all(promises).then(() => {
            win();
        })
    }
};

function killAlien(alien){
    buildingHandler.unOccupy(alien.bld)
    if (alien.attachmentList.length > 0) {
        //if the alien is holding something, then kill it and deal with the letter
        let letter = alien.detachAttachment(alien.attachmentList[0]); //is the actual letter Character object
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
        createAlien(alien.target);

    }
    alien.kill();
    let roll = spinWheel();
    if((chosenletters.length/2 | 0) == aliens.length && currentGun === 'gun') roll = 'uncommon'
    if(roll !== 'none'){
        let name = 'gun'
        let chosen = getArrayOfGuns().filter(x=>x.rarity == roll);
        name = getRandom(chosen).key 
        createItemDrop(alien.x,alien.y,name)
    }
}

function getArrayOfGuns(){
    //returns a neat array of the guns with a new property called 'key'
    return Object.keys(gunConfigs).map(x=>{
        let config = gunConfigs[x]
        config.key = x;
        return config;
    })
}

function spinWheel(){
    if(getRandom(1,10)<oddsOfDrop){
        let wheel = oddsOfUncommon + oddsOfRare + oddsOfLegendary
        let roll = getRandom(1,wheel);
        if(roll<oddsOfUncommon){
            //uncommon
            return 'uncommon'
        }roll
        if(roll >= oddsOfUncommon && roll < oddsOfUncommon+oddsOfRare){
            //rare
            return 'rare'
        }
        if(roll >= oddsOfRare+oddsOfUncommon && roll<= wheel){
            //legendary
            return 'legendary'
        }
    }else{
        return 'none'
    }
}

function testWheel(){
    let allRolls = []
    let rolls = 1000
    for(let i = 0; i<=rolls; i++){
        allRolls.push(spinWheel())
    }
    let none = allRolls.filter(x=>x==='none').length
    let rare = allRolls.filter(x=>x==='rare').length
    let uncommon = allRolls.filter(x=>x==='uncommon').length
    let legendary = allRolls.filter(x=>x==='legendary').length
    console.log(none/rolls,uncommon/rolls,rare/rolls,legendary/rolls,allRolls)
}

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
    ALL_FALLERS.forEach(x=>{
        x.kill()
    })
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
        alien.addDeathImage(aliendeathimg.cloneNode());
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
    currentGun = 'gun';

    gunSprite = new Rectangle(width / 2, height - width / 24, width / 12.8, width / 12, 0).fromCenter();
    gunSprite.set('backgroundImage', 'url("' + IMAGE_PATH + GUN_IMG_CONFIG.path + currentGun +  '.png")'); //done this way so you can drag it without it being an image
    gunSprite.set('backgroundSize', width / 12.8 + 'px');
    gunSprite.set('backgroundColor', 'transparent');
    gunSprite.set('backgroundRepeat', 'no-repeat');
    gunSprite.set('backgroundPosition', '0px ' +  width / 30 + 'px');
    gunSprite.set('zIndex', '9999');
    selectedgun.x = width / 2;
    selectedgun.y = height - width / 24;
    selectedgun.addSprite(gunSprite);
    gunSprite.shape.addEventListener('click', shoot);
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
    ammoP = new P('Pistol: ' + gunConfigs[currentGun].ammo + ' | ' + gunConfigs[currentGun].backupammo, width * .8, height * 0.01, width / 30);

    
}

function createItemDrop(x,y,name){
    let faller = new FallingImg(x,y,name,getRandom(1,3),true)
    let color = 'blue'
    switch(gunConfigs[name].rarity){
        case 'common': 
            color = 'blue';
            break;
        case 'uncommon':
            color = 'green';
            break;
        case 'rare':
            color = 'purple';
            break;
        case 'legendary': 
            color = 'yellow';
            break;
    }
    FallingImg.createIcon(IMAGE_PATH + GUN_IMG_CONFIG.path + name + '.png', 75,75,color).then(spriteFaller=>{
        spriteFaller.zIndex = 1000000
        faller.addSprite(spriteFaller)
        faller.maxbounds.y = height;
        faller.doFall()
        things_to_update.push(faller)
        ALL_FALLERS.push(faller)
        faller.sprite.shape.addEventListener('click',()=>{
            changeGun(name)
            faller.kill();
        })
    })
}

function setAmmoText(ammo,backupammo){
    ammoP.string = gunStats.name + ': ' + ammo + ' | ' + backupammo;
}

function changeGun(name){
    if(IS_SHOOTING){
        GUN_CHANGE_QUEUE = name;
        return;
    }
    if(name == 'rpg' || name == 'ak47'){
        gunSprite.width = width/7
        gunSprite.set('backgroundSize', width / 7 + 'px');
    }else{
        gunSprite.set('backgroundSize', width / 12.8 + 'px');
        gunSprite.width = width/12
    }
    oldGuns.push({name:currentGun, stats:Object.assign({},gunStats)})
    currentGun = name;
    gunStats = Object.assign({},gunConfigs[currentGun])
    setAmmoText(gunStats.ammo,gunStats.backupammo);
    gunSprite.set('backgroundImage', 'url("' + IMAGE_PATH + GUN_IMG_CONFIG.path + currentGun +  '.png")'); //done this way so you can drag it without it being an image
}
function resetLastGun(){
    if(oldGuns.length === 0) return;
    let lastGun = oldGuns.pop();
    currentGun = lastGun.name
    gunStats = lastGun.stats
    setAmmoText(gunStats.ammo,gunStats.backupammo);
    gunSprite.set('backgroundImage', 'url("' + IMAGE_PATH + GUN_IMG_CONFIG.path + currentGun +  '.png")'); //done this way so you can drag it without it being an image

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