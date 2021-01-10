let gunConfigs = {
    'gun': {
        name: 'Pistol',
        delay: 750,
        ammo: 5,
        backupammo: 10,
        ammocap: 5,
        reloadTime: 2000,
        perShot: 1,
        bulletSpeed: 30,
        rarity: 'common',
        spread: 0,
        isLarge: false,
    },
    'ak47': {
        name: 'AK-47',
        delay: 50,
        ammo: 30,
        backupammo: 60,
        ammocap: 30,
        reloadTime: 2000,
        perShot: 5,
        bulletSpeed: 30,
        rarity: 'rare',
        spread: 10,
        isLarge: true,
    },
    'alienblaster': {
        name: 'Alien Blaster',
        delay: 2000,
        ammo: 3,
        backupammo: 9,
        ammocap: 3,
        reloadTime: 200,
        perShot: 1,
        bulletSpeed: 7,
        rarity: 'legendary',
        spread: 0,
        isLarge: false,
    },
    'rpg': {
        name: 'RPG',
        delay: 300,
        ammo: 1,
        backupammo: 5,
        ammocap: 1,
        reloadTime: 2000,
        perShot: 1,
        bulletSpeed: 3,
        rarity: 'rare',
        spread: 0,
        isLarge: true,
    },
    'uzi': {
        name: 'Uzi',
        delay: 20,
        ammo: 16,
        backupammo: 20,
        ammocap: 16,
        reloadTime: 2000,
        perShot: 4,
        bulletSpeed: 30,
        rarity: 'uncommon',
        spread: 15,
        isLarge: false,
    },
    'infinitygauntlet': {
        name: 'Gauntlet',
        delay: 200,
        ammo: 1,
        backupammo: 3,
        ammocap: 1,
        reloadTime: 4000,
        perShot: 0,
        bulletSpeed: 0,
        rarity: 'legendary',
        spread: 0,
        isLarge: false,
    },
    'awm': {
        name: 'AWM',
        delay: 300,
        ammo: 4,
        backupammo: 8,
        ammocap: 4,
        reloadTime: 2000,
        perShot: 1,
        bulletSpeed: 60,
        rarity: 'uncommon',
        spread: 0,
        isLarge: true,
    },
    'deagle': {
        name: 'Desert Eagle',
        delay: 100,
        ammo: 5,
        backupammo: 20,
        ammocap: 5,
        reloadTime: 1000,
        perShot: 1,
        bulletSpeed: 40,
        rarity: 'uncommon',
        spread: 3,
        isLarge: false,
    },
    'glock': {
        name: 'Glock',
        delay: 20,
        ammo: 8,
        backupammo: 32,
        ammocap: 8,
        reloadTime: 200,
        perShot: 2,
        bulletSpeed: 30,
        rarity: 'uncommon',
        spread: 5,
        isLarge: false,
    },
    'm16': {
        name: 'M-16',
        delay: 200,
        ammo: 20,
        backupammo: 60,
        ammocap: 20,
        reloadTime: 2000,
        perShot: 4,
        bulletSpeed: 35,
        rarity: 'rare',
        spread: 10,
        isLarge: true,
    },
    'mp5': {
        name: 'MP5',
        delay: 50,
        ammo: 15,
        backupammo: 15,
        ammocap: 15,
        reloadTime: 1500,
        perShot: 3,
        bulletSpeed: 25,
        rarity: 'uncommon',
        spread: 15,
        isLarge: false,
    },
    'p90': {
        name: 'P90',
        delay: 40,
        ammo: 30,
        backupammo: 90,
        ammocap: 30,
        reloadTime: 1500,
        perShot: 5,
        bulletSpeed: 60,
        rarity: 'rare',
        spread: 1,
        isLarge: false,
    },
    'remington': {
        name: 'Remington',
        delay: 400,
        ammo: 2,
        backupammo: 10,
        ammocap: 2,
        reloadTime: 2500,
        perShot: 1,
        bulletSpeed: 40,
        rarity: 'rare',
        spread: 15,
        isLarge: true,
    },
    'revolver': {
        name: 'Revolver',
        delay: 200,
        ammo: 6,
        backupammo: 30,
        ammocap: 6,
        reloadTime: 1000,
        perShot: 1,
        bulletSpeed: 35,
        rarity: 'uncommon',
        spread: 4,
        isLarge: false,
    },
    'rpd': {
        name: 'RPD',
        delay: 50,
        ammo: 20,
        backupammo: 100,
        ammocap: 20,
        reloadTime: 3000,
        perShot: 10,
        bulletSpeed: 30,
        rarity: 'rare',
        spread: 20,
        isLarge: true,
    },
    'minigun': {
        name: 'Minigun',
        delay: 10,
        ammo: 50,
        backupammo: 50,
        ammocap: 50,
        reloadTime: 5000,
        perShot: 50,
        bulletSpeed: 30,
        rarity: 'broken',
        spread: 20,
        isLarge: true,
    },
};

let oddsOfDrop = 5 //out of 10
let oddsOfUncommon = 4
let oddsOfRare = 2
let oddsOfLegendary = 0.7;
let alienBlasterShots = 20;
let remingtonShots = 8;
let GUN_IMG_CONFIG = IMAGE_CONFIG.weapons;
let CITY_IMG_CONFIG = IMAGE_CONFIG.cityscapes;
let BUILDING_IMG_CONFIG = IMAGE_CONFIG.buildings;

const MAX_LEVELS_PER_PERSON = 2;
const TIME_PER_PLAYER = 61;

let currentGun = 'gun';
let gunStats = Object.assign({}, gunConfigs[currentGun])
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
let invaders = {}
let aliens = [];
let guns = {};

let aliendeathimg = {}

let LOADED_IMAGES = {}
let LEFT_OFFSET = 0;

let ALL_FALLERS = [];

let zIndices = {
    loadedImages: 0,
    imageBlocker: 1,
    lines: 1,
    levelText: 2,
    aliens: 3,
    heldLetters: 4,
    buildings: 5,
    finishedLetters: 6,
    startButton: 7,
    screenFade: 13,
    gun: 14,
    reload: 15, //reload+1 is needed
    nextPlayerBtn: 14,
    countdown: 13,
    itemDrops: 17,
    bullets: 14,
}
let measurements = {};

function setupBackground() {
    return new Promise(resolve => {
        let extras = ['fire'];
        LOADED_IMAGES = new ImageLoader(IMAGE_PATH + 'projectiles/', extras.concat(['electric', 'bullet', 'nuke', 'whitemagic'].map(x => x + '_projectile')));
        aliendeathimg = LOADED_IMAGES.electric_projectile
        invaders = new ImageLoader(IMAGE_PATH + 'invaders/', invadercolors.map(x => 'invader' + x));
        let randNum = getRandom(CITY_IMG_CONFIG.num);
        DOMObjectGlobals.body.style.backgroundImage = 'url(' + IMAGE_PATH + CITY_IMG_CONFIG.path + 'city' + randNum + '.jpg)';
        DOMObjectGlobals.body.style.backgroundSize = width + 'px auto';
        DOMObjectGlobals.body.style.backgroundPositon = 'bottom';
        selectedgun = new Character(0, 0, gunStats.name);
        selectedgun.hasNoBounds = true;
        LEFT_OFFSET = DOMObjectGlobals.body.offsetLeft;
        //to block out images that are preloaded into the game, to avoid loading times
        let imgBlk = id('image_blocker')
        imgBlk.style.width = width / 16 + 'px';
        imgBlk.style.height = width / 16 + 'px';
        imgBlk.style.backgroundColor = 'grey'
        imgBlk.style.zIndex = zIndices.imageBlocker;
        imgBlk.style.position = 'absolute'
        imgBlk.style.left = '0'
        imgBlk.style.top = '0'
        imgBlk.style.backgroundImage = 'url(' + IMAGE_PATH + CITY_IMG_CONFIG.path + 'city' + randNum + '.jpg)';
        imgBlk.style.backgroundSize = width + 'px auto';
        imgBlk.style.backgroundRepeat = 'no-repeat';



        id('jmpleft').style.zIndex = zIndices.startButton;
        id('jmpleft').style.width = width / 14 + 'px';
        id('jmpleft').style.height = height / 10 + 'px';
        id('jmpleft').style.fontSize = (width / 60 > 24 ? 24 : width / 60) + 'px';


        measurements = {
            quarterWidth: width/4,
            eighthWidth: width/8,
            alienWidth: width / 19.22,
        }

        resolve();
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
    if (dragging && !dragging_disabled && !BULLETS_ARE_FLYING && GAME_HAS_STARTED) {
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
let GUN_IS_RELOADNG = false;

function endReload() {
    return;
}
function doReload(){
    return;
}

function reload() {
    if (gunStats.backupammo > 0) {
        gunStats.ammo = Math.min(gunStats.ammocap,gunStats.backupammo);
        gunStats.backupammo -= Math.min(gunStats.ammocap,gunStats.backupammo);

        let attachment = new Flyer(0, 0, 'loadingbar');
        let health = new LoadingBar(0, 0, width / 16, width / 96, 0, gunStats.reloadTime, 1);
        health.set('zIndex', ''+zIndices.reload);
        health.setBar('zIndex', ''+(zIndices.reload+1));
        attachment.addSprite(health);
        selectedgun.addAttachment(attachment, new Vector(-width / 181, -width / 181));
        GUN_IS_RELOADNG = true;
        endReload = () => {
            let attachment = selectedgun.detachAttachment('loadingbar');
            attachment.kill();
            GUN_IS_RELOADNG = false;
            setAmmoText(gunStats.ammo, gunStats.backupammo)
            doReload = function(){return};
        }
        doReload = function(time){
            health.value += time;
            if(health.value>=gunStats.reloadTime){
                endReload();
            }
        }
    } else {
        if (oldGuns.length) {
            resetLastGun()
        } else {
            disableDragging();
            lose();
        }
    }


}

function shakeScreen() {
    id('MAIN_SCREEN').style.left = '-5px'
    setTimeout(() => {
        id('MAIN_SCREEN').style.left = '5px'
        setTimeout(() => {
            id('MAIN_SCREEN').style.left = '-5px'
            setTimeout(() => {
                id('MAIN_SCREEN').style.left = '5px'
                setTimeout(() => {
                    id('MAIN_SCREEN').style.left = '-5px'
                    setTimeout(() => {
                        id('MAIN_SCREEN').style.left = ''
                    }, 50)
                }, 50)
            }, 50)
        }, 50)
    }, 50)
}

function fadeScreen(color) {
    return new Promise(resolve => {
        let white = new Rectangle(0, 0, width, height);
        white.color = 'transparent';
        white.addClass('slowsmoothed');
        white.zIndex = zIndices.screenFade;
        setTimeout(() => {
            white.color = color || 'black';
            setTimeout(() => {
                resolve(function () {
                    white.remove();
                })
            }, 3100)
        }, 100);
    })
}

let IS_SHOOTING = false;
let GUN_CHANGE_QUEUE = 'none'
let BULLETS_ARE_FLYING = false;

function shoot() {
    if (!GAME_HAS_STARTED) return
    if (gunStats.ammo <= 0) {
        reload();
        return;
    }
    if (GUN_IS_RELOADNG) return;
    if (IS_SHOOTING) return;
    IS_SHOOTING = true;
    let angle = selectedgun.angle;
    let gunRadians = angle * (0.017453)
    let cos = Math.cos(gunRadians); // PI/180 
    let sin = Math.sin(gunRadians);
    let w = selectedgun.width;
    let h = selectedgun.height;
    let x = selectedgun.x + cos * measurements.alienWidth;
    let y = selectedgun.y + sin * measurements.alienWidth;
    let shotsRemaining = gunStats.perShot - gunStats.ammo > 0 ? gunStats.ammo : gunStats.perShot; //if less than the burst is in the chamber, only shoot the remaining
    function actuallyShoot() {
        BULLETS_ARE_FLYING = true;
        return new Promise(resolve => {
            if (currentGun === 'infinitygauntlet') {
                aliens.forEach((x, i) => {
                    if (!(i % 2)) {
                        killAlien(x);
                    }
                })
                shakeScreen();
                gunStats.ammo--;
                setAmmoText(gunStats.ammo, gunStats.backupammo)
                BULLETS_ARE_FLYING = false;
                resolve();
            } else {
                for (let i = 1; i <= shotsRemaining; i++) {
                    //starts from 1 so its easier to do the configs
                    let projectileName = 'bullet'
                    let gunShots = 1;
                    let bulletDim = 60;
                    if (currentGun == 'rpg') {
                        projectileName = 'nuke'
                        bulletDim = 6
                    }
                    if (currentGun == 'alienblaster') {
                        projectileName = 'whitemagic'
                        gunShots = alienBlasterShots
                        bulletDim = 30;
                    }
                    if (currentGun == 'remington') {
                        gunShots = remingtonShots
                        bulletDim = 120
                    }
                    gunSprite.set('backgroundColor','rgba(255,255,255,0.3')
                    setTimeout(() => {
                        for (let j = 0; j < gunShots; j++) {
                            let bullet = new Flyer(x, y, 'bullet');
                            let bulletAngle = angle + getRandom(-gunStats.spread, gunStats.spread)
                            if (gunShots > 1) {
                                bulletAngle -= currentGun === 'remington' ? 15 : 25
                                bulletAngle += ((currentGun === 'remington' ? 40 : 60) / gunShots) * j
                            }
                            bullet.angle = bulletAngle;
                            let bulletimgScatter = new Img(LOADED_IMAGES[projectileName + '_projectile'].cloneNode(), x, y, width / bulletDim, 0,bulletAngle).fromCenter().onLoad(() => {
                                bulletimgScatter.zIndex = zIndices.bullets;
                                
                                bullet.addSprite(bulletimgScatter);
                                let radians = bulletAngle * (0.017453)
                                cos = Math.cos(radians);
                                sin = Math.sin(radians);

                                let vec = new Vector(cos, sin);
                                bullet.addForce(vec.set(gunStats.bulletSpeed * (width / 960)));
                                bullet.maxbounds = {
                                    x: width,
                                    y: height
                                };
                                bullet.minbounds.y = -100
                                bullet.isFragile = true;
                                if (currentGun === 'rpg') {
                                    bullet.addDeathImage(LOADED_IMAGES.fire.cloneNode())
                                }
                                bullets.push(bullet);
                                setAmmoText(gunStats.ammo, gunStats.backupammo)
                            });
                        }
                        if (i === shotsRemaining) {
                           gunSprite.set('backgroundColor','')
                            BULLETS_ARE_FLYING = false;
                            resolve()
                        }
                    }, (i - 1) * gunStats.delay)
                    gunStats.ammo--;

                }
            }
        });
    }
    actuallyShoot().then(() => {
        setTimeout(() => {
            IS_SHOOTING = false;
            if (gunStats.ammo <= 0) {
                reload();
            }
            if (GUN_CHANGE_QUEUE !== 'none') {
                changeGun(GUN_CHANGE_QUEUE);
                GUN_CHANGE_QUEUE = 'none'
            }
        }, 500)
    })
}

let rescuedletters = '';
let NUM_OF_LETTERS_RESCUED = 0;

function countHoveringAliens() {
    return aliens.reduce((a, b) => a + (b.isDoingHover ? 1 : 0), 0);
}


function killAlien(alien) {
    buildingHandler.unOccupy(alien.bld)
    if (alien.attachmentList.length > 0) {
        //if the alien is holding something, then kill it and deal with the letter
        let letter = alien.detachAttachment(alien.attachmentList[0]); //is the actual letter Character object
        letter.sprite.zIndex = zIndices.finishedLetters;
        //find the letter
        let remainder = chosenletters.replace(rescuedletters, '');
        let letterThatsNeeded = allletters.slice(NUM_OF_LETTERS_RESCUED).filter(x => x.name === splitletters[NUM_OF_LETTERS_RESCUED])[0];
        //find the letter that is needed
        if (remainder.startsWith(letter.name)) { //its the right letter
            rescuedletters += letter.name + (GRAMMAR_MODE ? ' ' : '');
            NUM_OF_LETTERS_RESCUED++; //add it to rescued letters, now we know the next letter
            letter.MAX_V = 5 * (width / 960);
            letter.MAX_F *= (width / 960);
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
                letter.sprite.zIndex = zIndices.heldLetters;
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
    TOTAL_KILLS++
    setKillsText(TOTAL_KILLS)
    let roll = spinWheel();
    if ((chosenletters.length / 2 | 0) == aliens.length && currentGun === 'gun') roll = 'uncommon'
    if (roll !== 'none') {
        let name = 'gun'
        let chosen = getArrayOfGuns().filter(x => x.rarity == roll);
        name = getRandom(chosen).key
        createItemDrop(alien.x, alien.y, name)
    }
}

function getArrayOfGuns() {
    //returns a neat array of the guns with a new property called 'key'
    return Object.keys(gunConfigs).map(x => {
        let config = gunConfigs[x]
        config.key = x;
        return config;
    })
}

function spinWheel() {
    if (getRandom(1, 10) < oddsOfDrop) {
        let wheel = oddsOfUncommon + oddsOfRare + oddsOfLegendary
        let roll = getRandom(1, wheel);
        if (roll < oddsOfUncommon) {
            //uncommon
            return 'uncommon'
        }
        roll
        if (roll >= oddsOfUncommon && roll < oddsOfUncommon + oddsOfRare) {
            //rare
            return 'rare'
        }
        if (roll >= oddsOfRare + oddsOfUncommon && roll <= wheel) {
            //legendary
            return 'legendary'
        }
    } else {
        return 'none'
    }
}

function testWheel() {
    let allRolls = []
    let rolls = 1000
    for (let i = 0; i <= rolls; i++) {
        allRolls.push(spinWheel())
    }
    let none = allRolls.filter(x => x === 'none').length
    let rare = allRolls.filter(x => x === 'rare').length
    let uncommon = allRolls.filter(x => x === 'uncommon').length
    let legendary = allRolls.filter(x => x === 'legendary').length
    console.log(none / rolls, uncommon / rolls, rare / rolls, legendary / rolls, allRolls)
}

function releaseAliens() {
    aliens.forEach((alien, i) => {
        alien.target = allletters[i];
        alien.doFlyTo(allletters[i].p.copy()).then(() => {
            alien.addAttachment(allletters[i], new Vector(0, -alien.height / 2));
            let bld = buildingHandler.occupy();
            alien.bld = bld;
            bld.occupied = true;
            alien.doFlyTo(bld.vector.copy().add(new Vector(0, bld.height / -2))).then(() => {
                alien.doHover()
            });
        })
    });
}

function win() {
    CURRENT_LEVEL++;
    LEVELS_BEATEN_THIS_RELAY++
    IS_TIME_TICKING = false;
    setTimeout(() => {
        resetAll()
        fadeScreen('black').then(fadeOut => {
            if (LEVELS_BEATEN_THIS_RELAY >= MAX_LEVELS_PER_PERSON) {
                nextRelay().then(() => {
                    setup(); //fadescreen takes 3sec
                    fadeOut()
                    setLevelText(CURRENT_LEVEL)
                    setTimeText(PLAYER_TIME_LEFT|0)
                    doCountdown().then(() => {
                        setTimeout(() => {
                            IS_TIME_TICKING = true;
                            releaseAliens()
                        }, 500)
                    })
                })
            } else {
                setup(); //fadescreen takes 3sec
                fadeOut()
                setLevelText(CURRENT_LEVEL)
                setTimeText(PLAYER_TIME_LEFT|0)
                doCountdown().then(() => {
                    setTimeout(() => {
                        IS_TIME_TICKING = true;
                        releaseAliens()
                    }, 500)
                })
            }

        });
    }, 2000);
}

function resetAll() {
    ammoP.remove();
    levelP.remove();
    timeP.remove();
    killsP.remove();
    allletters.forEach(x => {
        x.kill();
    })
    allletters = [];
    lines.forEach(x => {
        x.remove();
    })
    lines = []
    buildings.forEach(x => {
        x.remove();
    })
    buildings = [];
    aliens.forEach(x => {
        x.kill()
    })
    aliens = [];
    NUM_OF_LETTERS_RESCUED = 0;
    rescuedletters = ''
    HAS_WON = false;
}

function doCountdown() {
    let time = getLevelStats().countdownTime
    let timerP = new P(time, width / 2, height / 2, width / 20).fromCenter()
    timerP.color = 'yellow'
    timerP.zIndex = zIndices.countdown;
    return new Promise(resolve => {
        for (let i = 0; i <= time; i++) {
            setTimeout(() => {
                timerP.string = time - i
                if (i === time) {
                    timerP.string = 'GO'
                    setTimeout(() => {
                        timerP.remove();
                    }, 1000)
                    resolve()
                }
            }, (i) * 1000)
        }
    });
}

let CURRENT_LEVEL = 0;

function getLevelStats() {
    return {
        alienSpeedMult: CURRENT_LEVEL / 100 + 1,
        countdownTime: Math.max(0, 5 - (CURRENT_LEVEL / 5 | 0)),
        oddsOfFlying: (CURRENT_LEVEL + 1) / 500,
        changingAliens: 3 + (CURRENT_LEVEL / 5 | 0)
    }
}


function lose() {
    let promises = [];
    IS_TIME_TICKING = false;
    ALL_FALLERS.forEach(x => {
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
        }else if (alien.isDoingFlyTo) {
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
    let alien = new Flyer(-width / 30, height / 4, 'invader' + getRandom(invadercolors));
    let sprite = new Img(invaders[alien.name].cloneNode(), 0, 0, measurements.alienWidth).fromCenter().usingNewTransform().onLoad(() => {
        sprite.zIndex = zIndices.aliens;
        alien.addSprite(sprite);
        alien.addDeathImage(aliendeathimg.cloneNode());
    });

    alien.hasNoBounds = true;
    alien.MAX_V = 5 * getLevelStats().alienSpeedMult * (width / 960);
    alien.MAX_F *= getLevelStats().alienSpeedMult * (width / 960);
    if (target) {
        alien.target = target;

        function pickUpLetter() { //needs to be separate to have a bindable this;
            this.addAttachment(target, new Vector(0, -this.height / 2));
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


function setupGun() {
    currentGun = 'gun';
    gunSprite = new Rectangle(width / 2, height - width / 24, width / 12.8, width / 12, 0).fromCenter();
    gunSprite.set('backgroundImage', 'url("' + IMAGE_PATH + GUN_IMG_CONFIG.path + currentGun + '.png")'); //done this way so you can drag it without it being an image
    gunSprite.set('backgroundSize', r(width / 12.8) + 'px');
    gunSprite.set('backgroundColor', 'transparent');
    gunSprite.set('backgroundRepeat', 'no-repeat');
    gunSprite.set('backgroundPosition', '0px ' + r(width / 30) + 'px');
    gunSprite.set('borderRadius',r(width/240) + 'px')
    gunSprite.zIndex = zIndices.gun;
    selectedgun.x = width / 2;
    selectedgun.y = height - width / 24;
    selectedgun.addSprite(gunSprite);
    gunSprite.shape.addEventListener('click', shoot);
    selectedgun.angle = 270;
    selectedgun.addDeathImage(LOADED_IMAGES.fire);
    selectedgun.update();
}

function setup() {
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
        p.zIndex =  zIndices.heldLetters;
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
        let img = new Img(IMAGE_PATH + BUILDING_IMG_CONFIG.path + 'skyscraper' + getRandom(BUILDING_IMG_CONFIG.num) + '.png', width * .1 + (width * .9 / (splitletters.length + 1)) * i + getRandom(-40, 40), 0, width / 19.22, ).fromCenter().onLoad(() => {
            img.y = height - img.height / 2;
        });
        img.zIndex =  zIndices.buildings;
        return img
    });
    buildingHandler = new BuildingHandler(buildings);
    for (let i = 0; i < splitletters.length; i++) {
        createAlien();
    }
    ammoP = new P('', width * .8, height * 0.01, width / 30);
    setAmmoText(gunStats.ammo, gunStats.backupammo)
    levelP = new P('Level: ' + (CURRENT_LEVEL + 1), 0, 0, width / 30).fromCenter();
    timeP = new P('', 0, 0, width / 30).fromCenter();
    killsP = new P('Kills: ' + TOTAL_KILLS, 0, 0, width / 30).fromCenter();
    setLevelText(0)
    setKillsText(0)
    levelP.zIndex = zIndices.levelText;
    levelP.color = 'lightblue'
    timeP.zIndex = zIndices.levelText;
    killsP.zIndex = zIndices.levelText;
    killsP.color = 'orange'


}

function createItemDrop(x, y, name) {
    let faller = new FallingImg(x, y, name, getRandom(1, 3) * (width / 960), true)
    let color = 'blue'
    switch (gunConfigs[name].rarity) {
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
    FallingImg.createIcon(IMAGE_PATH + GUN_IMG_CONFIG.path + name + '.png', width / 13, width / 13, color).then(spriteFaller => {
        spriteFaller.zIndex = zIndices.itemDrops
        faller.addSprite(spriteFaller)
        faller.maxbounds.y = height;
        faller.doFall()
        things_to_update.push(faller)
        ALL_FALLERS.push(faller)
        faller.sprite.shape.addEventListener('click', () => {
            changeGun(name)
            faller.kill();
        })
        faller.sprite.shape.addEventListener('touchstart', () => {
            changeGun(name)
            faller.kill();
        })
    })
}

function setAmmoText(ammo, backupammo) {
    ammoP.string = gunStats.name + ': ' + ammo + ' | ' + backupammo;
}
let levelP = {}

function setLevelText(level, moveToCenter) {
    if (moveToCenter) {
        levelP.x = width / 2
        levelP.y = height / 2 - levelP.height * 3
    } else {
        levelP.x = levelP.width / 2 + 1;
        levelP.y = levelP.height / 2 + 1;
    }
    levelP.string = 'Level: ' + (level + 1);
}
let timeP = {};

function setTimeText(time, moveToCenter, remove) {
    if (moveToCenter) {
        timeP.x = width / 2
        timeP.y = height / 2
    } else {
        timeP.x = timeP.width / 2 + 1
        timeP.y = levelP.height + width/150;
    }
    timeP.string = 'Time left: ' + time;
    if (remove) setTimeout(timeP.remove(), 1000)
}
let killsP = {};
let TOTAL_KILLS = 0;

function setKillsText(kills, remove) {
    killsP.x = levelP.width + width / 190 + killsP.width
    killsP.y = killsP.height / 2
    killsP.string = 'Kills: ' + TOTAL_KILLS;
}

function changeGun(name) {
    if (BULLETS_ARE_FLYING) {
        GUN_CHANGE_QUEUE = name;
        return;
    }
    if (GUN_IS_RELOADNG) {
        endReload();
    }
    if (gunConfigs[name].isLarge) {
        gunSprite.width = width / 7
        gunSprite.set('backgroundSize', width / 7 + 'px');
    } else {
        gunSprite.set('backgroundSize', width / 12.8 + 'px');
        gunSprite.width = width / 12
    }
    oldGuns.push({
        name: currentGun,
        stats: Object.assign({}, gunStats)
    })
    currentGun = name;
    gunStats = Object.assign({}, gunConfigs[currentGun])
    setAmmoText(gunStats.ammo, gunStats.backupammo);
    gunSprite.set('backgroundImage', 'url("' + IMAGE_PATH + GUN_IMG_CONFIG.path + currentGun + '.png")'); //done this way so you can drag it without it being an image
}

function resetLastGun() {
    if (oldGuns.length === 0) return;
    let lastGun = oldGuns.pop();
    currentGun = lastGun.name
    gunStats = lastGun.stats
    setAmmoText(gunStats.ammo, gunStats.backupammo);
    gunSprite.set('backgroundImage', 'url("' + IMAGE_PATH + GUN_IMG_CONFIG.path + currentGun + '.png")'); //done this way so you can drag it without it being an image
    if (gunStats.isLarge) {
        gunSprite.width = width / 7
        gunSprite.set('backgroundSize', width / 7 + 'px');
    } else {
        gunSprite.set('backgroundSize', width / 12.8 + 'px');
        gunSprite.width = width / 12
    }
}


let GAME_HAS_STARTED = false;
id('jmpleft').addEventListener('click', () => {
    if (!GAME_HAS_STARTED) {
        releaseAliens();
        GAME_HAS_STARTED = true;
        play();
        id('jmpleft').remove()
        setLevelText(CURRENT_LEVEL)
        IS_TIME_TICKING = true;
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

let LEVELS_BEATEN_THIS_RELAY = 0;

function nextRelay() {
    return new Promise(resolve => {
        GAME_HAS_STARTED = false;
        stop();
        fadeScreen('rgba(0,0,0,0.5)').then(fadeOut=>{
            bullets.forEach(x=>{
                x.kill();
            })
            bullets = []
        let nextBtn = new P('Next Player', width / 2, height * .1, width / 20).fromCenter()
        nextBtn.zIndex = zIndices.nextPlayerBtn;
        nextBtn.color = 'lightgreen';
        nextBtn.set('backgroundColor', 'black')
        nextBtn.shape.addEventListener('click', () => {
            fadeOut();
            LEVELS_BEATEN_THIS_RELAY = 0;
            GAME_HAS_STARTED = true;
            nextBtn.remove();
            play();
            resolve();
        })
        })
    })
}


let currentTime = 0;
let IS_TIME_TICKING = false;
let PLAYER_TIME_LEFT = TIME_PER_PLAYER;
function loop(time) {
    let deltaT = time - currentTime;
    currentTime = time;
    selectedgun.update();
    let seconds = deltaT/1000
    if(GUN_IS_RELOADNG){
        doReload(deltaT)
    }

    if(deltaT%5){//every 5 seconds to avoid too many calcs
        if (Math.random() < getLevelStats().oddsOfFlying && countHoveringAliens() === aliens.length && aliens.length >= getLevelStats().changingAliens) {
            //CHANGE PLACES!!!
            let randoms = shuffle(aliens).slice(0, getLevelStats().changingAliens);
            let randomBlds = randoms.map(x => x.bld);
            randoms.forEach((alien, i) => {
                alien.stopHover();
                alien.bld = randomBlds[(i + 1) % getLevelStats().changingAliens];
                alien.doFlyTo(Vector.random(width, height * 0.5)).then(() => {
                    alien.doFlyTo(alien.bld.p.copy().add(new Vector(alien.bld.width / 2, alien.bld.height / -2))).then(() => {
                        alien.doHover();
                    });
                })
            })
        }
    }
    for (let i = things_to_update.length - 1; i >= 0; i--) {
        things_to_update[i].update(deltaT);
        if (things_to_update[i].dead) {
            things_to_update.splice(i, 1);
        }
    }
    for (let j = bullets.length - 1; j >= 0; j--) {
        bullets[j].update(); //bullets dont need deltaT accuracy, they need more checks
        if (bullets[j].dead) {
            bullets.splice(j, 1);
        }
    }
    for (let i = aliens.length - 1; i >= 0; i--) {
        aliens[i].update(deltaT);
        if (aliens[i].dead) {
            aliens.splice(i, 1);
            continue;
        }
        for (let j = bullets.length - 1; j >= 0; j--) {
            if(Math.abs(bullets[j].x - aliens[i].x)>=measurements.eighthWidth){
                continue;
            }
            if (!bullets[j].dead && !aliens[i].dead && aliens[i].hasHitbox && bullets[j].hasHitbox && aliens[i].hitbox.contains(bullets[j].hitbox)) {
                killAlien(aliens[i])
                if (currentGun === 'rpg') {
                    aliens.forEach(alien => {
                        if (alien !== aliens[i] && !alien.dead) {
                            if (Math.abs(alien.x - aliens[i].x) < width / 4 && Math.abs(alien.y - aliens[i].y) < width / 4) {
                                killAlien(alien)
                            }
                        }
                    })
                }
                bullets[j].kill();
            }
        }
    }
    if (rescuedletters === (chosenletters + (GRAMMAR_MODE ? ' ' : '')) && allletters.filter(l => l.isDoingMoveTo).length < 1 && !HAS_WON) {
        allletters.forEach(x => {
            x.sprite.color = 'limegreen'
        });
        HAS_WON = true;
        win()
    }
    if(IS_TIME_TICKING && PLAYER_TIME_LEFT>0){
        PLAYER_TIME_LEFT -= seconds;
        setTimeText(PLAYER_TIME_LEFT|0);
        if(PLAYER_TIME_LEFT<5){
            timeP.color = 'red'
        }
    }else if(IS_TIME_TICKING && PLAYER_TIME_LEFT<=0){
        IS_TIME_TICKING = false;
        setTimeText(0)
        nextRelay().then(()=>{
            PLAYER_TIME_LEFT = TIME_PER_PLAYER
            timeP.color = 'white'
            IS_TIME_TICKING = true;
        })
    }
    if (LOOPING) {
        requestAnimationFrame(loop)
    }
};
let HAS_WON = false; //needed for the last bit of a check in the loop
function play() {
    currentTime = window.performance.now()
    //createFallbackLoopFunction(loop).start()
    LOOPING = true;
    requestAnimationFrame(loop);
}

setupBody(id("MAIN_SCREEN")).then(() => {
    setupBackground().then(() => {
        setupGun();
        setup();
    })
})



//DEBUG STUFF BELOW

let FPSLOCK = 0;
let FPSLOOP = 0;

function setFPS(num) {
    LOOPING = false;
    clearInterval(FPSLOOP)
    FPSLOCK = num;
    if (FPSLOCK > 0) {
        FPSLOOP = setInterval(()=>{loop(window.performance.now())}, 1000 / FPSLOCK)
    } else {
        requestAnimationFrame(loop);
    }
}

let LAST_FPS = 0;