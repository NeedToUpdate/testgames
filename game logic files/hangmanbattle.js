let IMAGE_PATH = '../images/'

let characters = [
    'cat',
    'spiderman', 'ultraman', 'ironman',
    'peppapig', 'spongebob', 'monkey',
    'tiger', 'shark', 'cinderella',
    'elsa', 'ariel', 'deadfish', 'mrkrabs', 'thanos', 'pikachu', 'drstrange',
    'superman', 'genie', 'simba', 'captainmarvel', 'mewtwo', 'sailormoon', 'venom', 'thor',
    'ultraman2', 'ultraman3', 'olaf', 'hulk', 'gundam', 'optimus', 'snowwhite', 'deadpool',
    'goku', 'ash', 'charizard', 'captainamerica', 'nakoruru', 'mario', 'emmet', 'wyldstyle',
    'tree','link', 'isabelle',
];
let powers = [
    'blueenergy',
    'web', 'bluebeam', 'fire',
    'pinkenergy', 'krabbypatty', 'banana',
    'fire', 'water', 'blueenergy',
    'ice', 'water', 'nuke', 'water', 'blackenergy', 'electric', 'magic',
    'fire', 'magic', 'magic', 'electric', 'magic', 'pinkenergy', 'blackenergy', 'electric',
    'magic', 'electric', 'ice', 'rock', 'bluebeam', 'bullet', 'bluebeam', 'bullet',
    'bluebeam', 'fire', 'fire', 'fire', 'fire', 'fire', 'legored', 'blackenergy',
    'apple','blueenergy','water',
];

document.body.style.backgroundColor = 'lightgrey'
let MAINARENA = new Rectangle(width * .2, height * .2, width * .6 - 5, height * .8).asOutline('black', 5);
let background = 'background' + getRandom(20).toString() + '.jpg';
MAINARENA.set('backgroundColor', 'grey');
MAINARENA.set('backgroundImage', 'url(' + IMAGE_PATH + background.toString() + ')');
MAINARENA.set('backgroundSize', 'cover');
MAINARENA.set('backgroundRepeat', 'no-repeat');
MAINARENA.set('backgroundPosition', 'center');

let bigR = width/35;
let smallR = width/45
let rc = new Circle(width/2 +bigR*2 +6, 30 + bigR,bigR).asOutline('black',3).fromCenter();
let rcA1 = new Circle(width/2 + bigR*2 - smallR - 20,30+ smallR,smallR).asOutline('black',3).fromCenter();
let rcA2 = new Circle(width/2 + bigR*2 - smallR*2 - 40,30+ smallR,smallR).asOutline('black',3).fromCenter();
let rcB1 = new Circle(width/2 + bigR*2 + smallR + 20,30+ smallR,smallR).asOutline('black',3).fromCenter();
let rcB2 = new Circle(width/2 + bigR*2 + smallR*2 + 40,30+ smallR,smallR).asOutline('black',3).fromCenter();


let circles = [rcA1,rcA2,rc,rcB1,rcB2];

let winsA = 0
let winsB = 0
function handleWin(isTeamA){
    if(isTeamA){
       winsA++ 
    }else{
       winsB++
    }
    
}


let teamA = {
    wordPool: [],
    word: '',
    solvedWords: [],
    puzzleDiv: {},
    hp: 100,
    hpDiv: {},
    wordIndex: 0,
};


let teamB = {
    wordPool: [],
    word: '',
    solvedWords: [],
    puzzleDiv: {},
    hp: 100,
    hpDiv: {},
    wordIndex: 0,
};

class Glow extends Div{
    constructor(x,y,color){
        super(x,y,1,1,0);
        this.glow = color;
        this.set('zIndex','1000');
        this.color = color;
        this.set('boxShadow', '0 0 10px 10px ' + this.glow)
    }
}

function create_player(num) {
    let chosennum = num || getRandom(characters.length);
    if (num === 0) {
        chosennum = 0;
    }
    let char_name = characters[chosennum];
    let powr_name = powers[chosennum];
    if (char_name === 'deadfish') {
        powr_name = 'nuke';
    }
    if (char_name === 'snowwhite') {
        powr_name = 'bluebird';
    }
    if (char_name === 'ash') {
        powr_name = 'poke';
    }
    if (char_name === 'captainamerica') {
        powr_name = 'cashield';
    }
    if (char_name === 'nakoruru') {
        powr_name = 'mamahaha'
    }
    if (char_name === 'wyldstyle') {
        powr_name = 'blacklego'
    }
    if (char_name === 'link') {
        powr_name = 'zeldabomb'
    }
    return {num: chosennum, name: char_name, power: powr_name};
}


function setup() {
    teamA.hpDiv = new LoadingBar(width * .21, height * .35, width / 5, 35, 0, 100, 100)
    teamB.hpDiv = new LoadingBar(width * .59, height * .35, width / 5, 35, 0, 100, 100)

    let [a, b] = get2DPSArrays(words);
    teamA.wordPool = a;
    teamB.wordPool = b;
    nextWord(true);
    nextWord(false);
    teamA.input = createInputBox('A');
    teamB.input = createInputBox('B');
}

function nextWord(isTeamA) {
    let team = isTeamA ? teamA : teamB;
    team.word = team.wordPool[team.wordIndex][0];
    team.wordIndex++;
    setUpWord(isTeamA, team.word);
}


function setUpWord(team, word) {
    if (team) {
        if (Object.keys(teamA.puzzleDiv).length === 0) {
            teamA.puzzleDiv = new Puzzle(word, 0, 0, width * .3, height * .3, 'A')
        } else {
            teamA.puzzleDiv.addNewWord(word)
        }
    } else {
        if (Object.keys(teamB.puzzleDiv).length === 0) {
            teamB.puzzleDiv = new Puzzle(word, width * .7 - 6, 0, width * .3, height * .3, 'B')
        } else {
            teamB.puzzleDiv.addNewWord(word)
        }
    }
}

function get2DPSArrays(array) {
    function getCloseToAverageBy(val, exception) {
        return wordDpsTemp2.filter(x => x !== exception).reduce((a, b) => {
            let del = Math.abs((b[1] - averageDPS) - val);
            if (Math.abs((a[1] - averageDPS) - val) < del) {
                return a
            } else {
                return b
            }
        }, ((wordDPS[0][1] - averageDPS) - val))
    }

    let wordDPS = [];
    array.forEach(w => {
        let l = w.length;
        let uniq = Array.from(new Set(w.split(''))).length;
        let eff = (l / uniq);
        let dmg = Math.sqrt(eff) * (l - 1);
        wordDPS.push([w, ((dmg + l))])
    });
    let averageDPS = wordDPS.reduce((a, b) => a + b[1], 0) / wordDPS.length;
    let newWordOrder = [];
    let newWordOrder2 = [];
    let wordDpsTemp = Array.from(wordDPS);
    let wordDpsTemp2 = Array.from(wordDPS);
    for (let i = 0; i < (wordDPS.length); i++) {
        let ch = wordDpsTemp.splice(getRandom(wordDpsTemp.length), 1)[0];
        let cl = getCloseToAverageBy((ch[1] - averageDPS), ch);
        wordDpsTemp2.splice(wordDpsTemp2.indexOf(cl), 1);
        newWordOrder.push(ch);
        newWordOrder2.push(cl);
    }
    return [newWordOrder, newWordOrder2];
}


function createInputBox(team) {
    if (team === 'A') {
        return teamA.puzzleDiv.createInputBox(width * 0.005, height * 0.5, width * 0.18, height * 0.4)
    } else {
        return teamB.puzzleDiv.createInputBox(width * 0.81, height * 0.5, width * 0.18, height * 0.4)
    }
}

let BATTLE_IN_PROGRESS = false;

function submitLetters() {
    if (BATTLE_IN_PROGRESS) return;
    let A = teamA.puzzleDiv;
    let B = teamB.puzzleDiv;
    let letterA = teamA.input.getLetter();
    let letterB = teamB.input.getLetter();
    let numA = 0;
    let numB = 0;
    let readyA = false;
    let readyB = false;
    if (letterA !== '' && letterB !== '') {
        numA = A.checkLetter(letterA);
        numB = B.checkLetter(letterB);
    } else {
        console.log('team not ready');
        return
    }

    BATTLE_IN_PROGRESS = true;
    let finishedA = A.confirmLetter(letterA);
    let finishedB = B.confirmLetter(letterB);

    let divA = teamA.input.getDiv();
    let divB = teamB.input.getDiv();
    let charA = new Character(divA.x + divA.shape.parentElement.offsetLeft + divA.width / 2, divA.y + divA.shape.parentElement.offsetTop + divA.height / 2, letterA);
    let charB = new Character(divB.x + divB.shape.parentElement.offsetLeft + divB.width / 2, divB.y + divB.shape.parentElement.offsetTop + divB.height / 2, letterB);

    DomObject.attach(divA.fromCenter().detachSelf());
    DomObject.attach(divB.fromCenter().detachSelf());
    charA.addSprite(divA);
    charB.addSprite(divB);
    THINGS_TO_UPDATE.push(charA);
    THINGS_TO_UPDATE.push(charB);
    THINGS_TO_KILL.push(charA);
    THINGS_TO_KILL.push(charB);

    if (numA) {
        console.log('Team A got ' + numA + ' points');
        let indices = A.solvedLetters.map((x, i) => x === letterA ? i : -1).filter(x => x !== -1);
        divA.color = 'limegreen';
        for (let i = 0; i < numA; i++) {
            setTimeout(() => {
                let mover = {};
                if (i !== 0) {
                    mover = new Character(charA.x, charA.y, charA.name + i);
                    let p = new P(charA.name, charA.x, charA.y);
                    p.shape.remove();
                    p.shape = DomObject.attach(divA.shape.cloneNode(true));
                    mover.addSprite(p);
                    THINGS_TO_UPDATE.push(mover);
                    THINGS_TO_KILL.push(mover);
                } else {
                    mover = charA;
                }
                let target = A.letterDivs[indices[i]].p;
                mover.doMoveTo(target, 0.5).then(() => {
                    let glow = new Character(target.x,target.y, 'cyan');
                    glow.addSprite(new Glow(0,0,'cyan'));
                    glow.addForce(new Vector(1,0));
                    THINGS_TO_UPDATE.push(glow);
                    THINGS_TO_KILL.push(glow);
                    mover.kill();
                    A.revealLetter(indices[i]);
                    glow.doMoveTo(playerA.p,0.5).then(()=>{
                        glow.kill();
                        if (i === numA - 1) {
                            A.flash();
                            if (finishedA) {
                                A.letterDivs.forEach((x,k) => {
                                    x.color = 'limegreen';
                                    let glow = new Character(x.x,x.y, 'cyan');
                                    glow.addSprite(new Glow(0,0,'cyan'));
                                    glow.addForce(new Vector(1,0));
                                    THINGS_TO_UPDATE.push(glow);
                                    THINGS_TO_KILL.push(glow);
                                    glow.doMoveTo(playerA.p,0.5).then(()=>{
                                        glow.kill();
                                        if (k === A.letterDivs.length-1) {
                                            readyA = true;
                                            doBattle();
                                        }
                                    });
                                })
                            }else{
                                readyA = true;
                                doBattle();
                            }
                        }
                    });
                });
            }, 1000)
        }
    } else {
        divA.color = 'red';
        setTimeout(() => {
            charA.doSpin(360, 5);
            charA.hasNoBounds = true;
            charA.doMoveTo(new Vector(charA.x, height + 50), 0.5).then(() => {
                charA.kill();
                readyA = true;
                doBattle()
            })
        }, 1000);
    }
    if (numB) {
        console.log('Team B got ' + numB + ' points');
        let indices = B.solvedLetters.map((x, i) => x === letterB ? i : -1).filter(x => x !== -1);
        divB.color = 'limegreen';
        for (let i = 0; i < numB; i++) {
            setTimeout(() => {
                let mover = {};
                if (i !== 0) {
                    mover = new Character(charB.x, charB.y, charB.name + i);
                    let p = new P(charB.name, charB.x, charB.y);
                    p.shape.remove();
                    p.shape = DomObject.attach(divB.shape.cloneNode(true));
                    mover.addSprite(p);
                    THINGS_TO_UPDATE.push(mover);
                    THINGS_TO_KILL.push(mover);
                } else {
                    mover = charB;
                }
                let target = B.letterDivs[indices[i]].p.copy().add(B.p);
                mover.doMoveTo(target, 0.5).then(() => {
                    let glow = new Character(target.x,target.y, 'orange');
                    glow.addSprite(new Glow(0,0,'orange'));
                    glow.addForce(new Vector(-1,0));
                    THINGS_TO_UPDATE.push(glow);
                    THINGS_TO_KILL.push(glow);
                    mover.kill();
                    B.revealLetter(indices[i]);
                    glow.doMoveTo(playerB.p,0.5).then(()=>{
                        glow.kill();
                        if (i === numB - 1) {
                            B.flash();
                            if (finishedB) {
                                B.letterDivs.forEach((x,k) => {
                                    x.color = 'limegreen';
									let trgt = x.p.copy().add(B.p)
                                    let glow = new Character(trgt.x,trgt.y, 'orange');
                                    glow.addSprite(new Glow(0,0,'orange'));
                                    glow.addForce(new Vector(-1,0));
                                    THINGS_TO_UPDATE.push(glow);
                                    THINGS_TO_KILL.push(glow);
                                    glow.doMoveTo(playerB.p,0.5).then(()=>{
                                        glow.kill();
                                        if (k === B.letterDivs.length-1) {
                                            readyB = true;
                                            doBattle();
                                        }
                                    });
                                })
                            }else{
                                readyB = true;
                                doBattle();
                            }
                        }
                    });
                });
            }, 1000)
        }
    } else {
        divB.color = 'red';
        setTimeout(() => {
            charB.doSpin(360 * getRandom(-1), 5);
            charB.hasNoBounds = true;
            charB.doMoveTo(new Vector(charB.x, height + 50), 0.5).then(() => {
                charB.kill();
                readyB = true;
                doBattle()
            })
        }, 1000);
    }

    if (finishedB) {
        B.letterDivs.forEach(x => {
            x.color = 'limegreen';
        })
    }
    function doBattle() {
        //console.log('Battle is called' + (readyA? '': ' but Team A is not Ready') +(readyB? '' : ' but team B is not Ready'))
        if (!readyA || !readyB) return;
        console.log('battle phase!')

        battle(numA, numB, finishedA, finishedB);
    }
}

let goBtn = new Circle(width * 0.02, height * 0.37, 14).asOutline('green', 3);
goBtn.shape.addEventListener('click', submitLetters);
let resetBtn = new Circle(width * 0.02, height * 0.37 + 35, 14).asOutline('red', 3);
let THINGS_TO_KILL = [];
resetBtn.shape.addEventListener('click', () => {
    teamA.input.reset();
    teamB.input.reset();
    THINGS_TO_KILL.forEach(x => {
        x.kill();
    });
    THINGS_TO_KILL = [];
});
window.addEventListener('DOMContentLoaded', () => {
    resetBtn.attach(id('backbutton').content.cloneNode(true));
    goBtn.attach(id('checkmark').content.cloneNode(true));
});

let pAname = create_player(getRandom(characters.length))
let pBname = create_player(getRandom(characters.length))

LOADED_IMAGES = new ImageLoader(IMAGE_PATH + 'projectiles/', [pAname.power,pBname.power, 'fire', 'dynamite'].map(x => x + '_projectile'));
LOADED_IMAGES.add('fire', IMAGE_PATH);
let playerA = new Character(width * .28, height - 100, pAname.name);
let spriteA = new Img(IMAGE_PATH + '/' + playerA.name + '.png', 0, 0, width / 8).fromCenter().onLoad(() => {
    playerA.addSprite(spriteA);
    playerA.team = 'A';
    playerA.addForce(VECTORS.gravity);
    playerA.maxbounds.x = width * .79;
    playerA.minbounds.x = width * .21;
    playerA.maxbounds.y = height - 20;
    playerA.minbounds.y = height * .2;
    playerA.powerType = pAname.power;
    spriteA.set('zIndex', '10000');
    THINGS_TO_UPDATE.push(playerA);
    playerA.addDeathImage(LOADED_IMAGES.fire.cloneNode());
});
let playerB = new Character(width * .72, height - 100, pBname.name);
let spriteB = new Img(IMAGE_PATH + '/' + playerB.name + '.png', 0, 0, width / 8).fromCenter().onLoad(() => {
    playerB.addSprite(spriteB);
    playerB.team = 'B';
    playerB.addForce(VECTORS.gravity);
    playerB.maxbounds.x = width * .79;
    playerB.minbounds.x = width * .21;
    playerB.maxbounds.y = height - 20;
    playerB.minbounds.y = height * .2;
    THINGS_TO_UPDATE.push(playerB);
    playerB.faceLeft();
    playerB.powerType = pBname.power;
    playerB.addDeathImage(LOADED_IMAGES.fire.cloneNode());
    spriteB.set('zIndex', '10000');
});

function unIdlePlayers() {
    playerAState = '';
    playerBState = '';
    return new Promise(resolve => {
        function tryResolve() {
            if (!a || !b) return;
            resolve()
        }

        let a = false;
        let b = false;
        if (playerA.isJumping) {
            playerA.interruptSperHop = true;
            let unsub = playerA.landing_emitter.subscribe('land', () => {
                a = true;
                unsub();
                tryResolve();
            })
        } else {
            a = true;
            tryResolve();
        }
        if (playerB.isJumping) {
            playerB.interruptSperHop = true;
            let unsub = playerB.landing_emitter.subscribe('land', () => {
                b = true;
                unsub();
                tryResolve();
            })
        } else {
            b = true;
            tryResolve();
        }
    })
}


//===============FIGHTING FUNCTIONS============
//===============FIGHTING FUNCTIONS============
//===============FIGHTING FUNCTIONS============
//===============FIGHTING FUNCTIONS============

function doShot(player, target) {
    return new Promise(resolve => {
        let p = player.shoot();
        if (!p) {
            setTimeout(() => {
                p = player.shoot();
                if (!p) {
                    player.powerUp(5);
                    setTimeout(() => {
                        doShot(player, target).then(() => {
                            resolve();
                        })
                    }, 500)
                } else {
                    p.target = target;
                    PROJECTILES.push(p);
                    setTimeout(() => {
                        resolve()
                    }, 1000)
                }
            }, 500);
        } else {
            p.target = target;
            PROJECTILES.push(p);
            setTimeout(() => {
                resolve()
            }, 1000)
        }
    })
}


function regularShoot(isPlayerA, num) {
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    return new Promise(resolve => {
        for (let i = 0; i < num; i++) {
            setTimeout(() => {
                fighter.powerUp(5);
            }, (i + 1) * 1000)
        }
        setTimeout(() => {
            doShot(fighter, target).then(() => {
                resolve()
            })
        }, (num + 1) * 1000);
    })
}

function jumpAndHit(isPlayerA, dmg) {
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    return new Promise(resolve => {
        fighter.jumpWithAngle(isPlayerA ? 45 : -45, 20);
        let unsub = fighter.landing_emitter.subscribe('land', () => {
            handleDamage(target, dmg);
            fighter.jumpWithAngle(isPlayerA ? -45 : 45, 20);
            isPlayerA ? fighter.faceRight() : fighter.faceLeft();
            unsub();
            unsub = fighter.landing_emitter.subscribe('land', () => {
                unsub();
                resolve();
            })
        })
    })
}

function jumpSpinHit(isPlayerA, dmg) {
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    return new Promise(resolve => {
        fighter.jumpWithAngle(isPlayerA ? 45 : -45, 20);
        fighter.doSpin(360 * (isPlayerA? -1:1), 10);
        let unsub = fighter.landing_emitter.subscribe('land', () => {
            fighter.jumpWithAngle(isPlayerA ? -45 : 45, 20);
            isPlayerA ? fighter.faceRight() : fighter.faceLeft();
            handleDamage(target, dmg);
            unsub();
            unsub = fighter.landing_emitter.subscribe('land', () => {
                unsub();
                resolve();
            })
        })
    })
}

function spinShot(isPlayerA, dmg) {
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    return new Promise(resolve => {
        fighter.jumpUp(1.2);
        fighter.doSpin(360 * (isPlayerA? -1:1), 10);
        fighter.powerUp(dmg / 2);
        setTimeout(() => {
            fighter.powerUp(dmg / 2);
        }, 200);
        setTimeout(() => {
            doShot(fighter, target).then(() => {
                resolve()
            })
        }, 800)
    })
}


function rapidFire(isPlayerA, dmg) {
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    return new Promise(resolve => {
        let shootloop = setInterval(() => {
            fighter.powerUp(dmg / 8);
            setTimeout(() => {
                doShot(fighter, target)
            }, 300)
        }, 600);
        setTimeout(() => {
            clearInterval(shootloop);
            resolve();
        }, 5000)
    })
}

function pickUpandThrow(isPlayerA, dmg) {
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    return new Promise(resolve => {
        fighter.jumpWithAngle(isPlayerA ? 45 : -45, 20);
        let unsub = fighter.landing_emitter.subscribe('land', () => {
            isPlayerA ? fighter.faceLeft() : fighter.faceRight();
            unsub();
            target.forces = [];
            target.doMoveTo(target.p.copy().sub(new Vector(isPlayerA ? 10 : -10, 50)), 0.5).then(() => {
                setTimeout(() => {
                    target.addForce(VECTORS.gravity);
                    target.jumpWithAngle(isPlayerA ? -80 : 80, 50);
                    setTimeout(() => {
                        handleDamage(target, dmg / 1.5)
                    }, 200);
                    unsub = target.landing_emitter.subscribe('land', () => {
                        fighter.powerUp(dmg / 3);
                        unsub();
                        setTimeout(() => {
                            doShot(fighter, target).then(() => {
                                setTimeout(() => {
                                    fighter.jumpWithAngle(isPlayerA ? -45 : 45, 20);
                                    isPlayerA ? fighter.faceRight() : fighter.faceLeft();
                                    target.jumpWithAngle(isPlayerA ? 45 : -45, 20);
                                    unsub = target.landing_emitter.subscribe('land', () => {
                                        isPlayerA ? target.faceLeft() : target.faceRight();
                                        unsub();
                                        resolve();
                                    });
                                }, 300)
                            });
                        }, 500);
                    })
                }, 1000);
            })
        })
    })
}

function spinHitAndShoot(isPlayerA, dmg) {
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    return new Promise(resolve => {
        fighter.jumpWithAngle(isPlayerA ? 45 : -45, 20);
        fighter.doSpin(360 * (isPlayerA? -1:1), 10);
        let unsub = fighter.landing_emitter.subscribe('land', () => {
            handleDamage(target, dmg / 3);
            fighter.jumpWithAngle(isPlayerA ? -45 : 45, 15);
            isPlayerA ? fighter.faceRight() : fighter.faceLeft();
            unsub();
            fighter.powerUp(dmg / 3);
            setTimeout(() => {
                doShot(fighter,target).then(()=>{
                    fighter.jumpWithAngle(isPlayerA ? -45 : 45, 20);
                    isPlayerA ? fighter.faceRight() : fighter.faceLeft();
                    fighter.powerUp(dmg / 3);
                    setTimeout(() => {
                        doShot(fighter, target).then(() => {
                            resolve()
                        })
                    }, 500)
                })
            }, 500)
        })
    })
}

function throwBomb(isPlayerA, dmg) {
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    return new Promise(resolve => {
        fighter.powerUp(dmg, 'dynamite');
        setTimeout(() => {
            let p = fighter.shoot('dynamite');
            p.target = target;
            p.addDeathImage(LOADED_IMAGES.fire.cloneNode());
            PROJECTILES.push(p);
            resolve();
        }, 1000)
    })
}


//================ FINAL SMASH FUNCS =========================
//================ FINAL SMASH FUNCS =========================
//================ FINAL SMASH FUNCS =========================
//================ FINAL SMASH FUNCS =========================

function goGiantAndStomp(isPlayerA,val){
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    let team = isPlayerA ? teamA : teamB;
    return new Promise(resolve => {
        fighter.y -= height;
        fighter.sprite.addClass('slowsmoothed');
        fighter.width *=5;
        fighter.minbounds.y = -1000 ;
        fighter.minbounds.x = 0;
        fighter.maxbounds.x = width;
        setTimeout(()=>{
            team.puzzleDiv.addClass('smoothed');
            team.puzzleDiv.inputBox.addClass('smoothed');
            team.puzzleDiv.rotateTo(90* (isPlayerA? -1 : 1));
            team.puzzleDiv.x -= width*.15*(isPlayerA? 1 : -1);
            team.puzzleDiv.inputBox.x -= width*.15* (isPlayerA? 1 : -1);
        },3000);
        setTimeout(()=>{
            fighter.sprite.removeClass('slowsmoothed');
            isPlayerA? fighter.jumpRight() : fighter.jumpLeft();
            let unsub = fighter.landing_emitter.subscribe('land',()=>{
                unsub();
                target.height = '10px';
                target.sprite.addClass('smoothed');
                handleDamage(target,val);
                setTimeout(()=>{
                    fighter.sprite.addClass('smoothed');
                    fighter.width /=5;
                    fighter.minbounds.y = height * .2;
                    fighter.minbounds.x = width * .21;
                    fighter.maxbounds.x = width * .79;
                    setTimeout(()=>{
                        fighter.jumpWithAngle(45* (isPlayerA? -1 : 1),20);
                        unsub = fighter.landing_emitter.subscribe('land',()=>{
                            fighter.sprite.removeClass('smoothed');
                            team.puzzleDiv.removeClass('smoothed');
                            team.puzzleDiv.inputBox.removeClass('smoothed');
                            unsub();
                            setTimeout(()=>{
                                target.height = '';
                                target.sprite.removeClass('smoothed');
                                NEEDS_RESET = true;
                                resolve();
                            },1000)
                        })
                    },1100)
                },3000)
            });
        },6000);

    });
}

function throwMeteor(isPlayerA,val){
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    return new Promise(resolve => {

    });
}

function runBackAndSquish(isPlayerA,val){
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    return new Promise(resolve => {

    });
}



function marioHop(isPlayerA,val){
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    return new Promise(resolve => {

    });
}



function explode(isPlayerA,val){
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    return new Promise(resolve => {

    });
}


let NEEDS_RESET = false;

function battle(team1points, team2points, isTeam1finishingblow, isTeam2finishingblow) {
    let pA = team1points;
    let pB = team2points;
    let fbA = isTeam1finishingblow;
    let fbB = isTeam2finishingblow;
    let hpA = teamA.hp;
    let hpB = teamB.hp;

    function doAttack(plyr, val, isFB, oppVal, oppFB) {
        return new Promise(resolve => {
            if (val && !isFB) {
                if (val === 1) {
                    if (getRandom(10) < 2) {
                        jumpAndHit(plyr, 5).then(() => {
                            resolve()
                        })
                    } else if (oppVal === 1 && getRandom(10) < 0) {
                        // if 1 and pB is 1
                        //projectiles hit eachother
                    } else {
                        regularShoot(plyr, val).then(() => {
                            resolve()
                        })
                    }
                }
                if (val === 2) {
                    if (getRandom(10) < 3) {
                        jumpSpinHit(plyr, 10).then(() => {
                            resolve()
                        })
                    } else if (getRandom(10) < 3) {
                        spinShot(plyr, 10).then(() => {
                            resolve()
                        })
                    } else if (oppVal === 2 && getRandom(10) < 0) {
                        // if 2 and pB is 2
                        //projectiles hit eachother
                    } else if (getRandom(10 < 3)) {
                        throwBomb(plyr, 10).then(() => {
                            resolve()
                        })
                    } else {
                        regularShoot(plyr, val).then(() => {
                            resolve()
                        })
                    }
                }
                if (val === 3) {
                    if (getRandom(10) < 3) {
                        rapidFire(plyr, 15).then(() => {
                            resolve()
                        });
                    } else if (getRandom(10) < 3) {
                        //pick up and throw
                        pickUpandThrow(plyr, 15).then(() => {
                            resolve()
                        })
                    } else if (getRandom(10) < 3) {
                        spinHitAndShoot(plyr, 15).then(() => {
                            resolve()
                        });
                    } else {
                        regularShoot(plyr, val).then(() => {
                            resolve()
                        })
                    }
                }
                //is there gonna be a 4+?
                if (val >= 4) {
                    //idk
                }
            } else if (isFB) {
                console.log((plyr ? 'Team A' : 'Team B') + ' does a final smash');
                if(getRandom(10)<10){
                    goGiantAndStomp(plyr,20).then(()=>{
                        resolve()
                    })
                }
            } else if (val === 0 && !isFB) {
                resolve();
            } else {
                console.log('oh no');
            }
        })
    }

    return new Promise(resolve => {
            unIdlePlayers().then(() => {
                playerAState = 'fighting';
                playerBState = 'fighting';
                let isPlyrA = getRandom(2)
                if(fbA && hpA>pB*5) {
                   isPlyrA = false;
                }else if(fbA && !fbB && hpA<pB*5){
                   isPlyrA = true;
                }
                if(fbB && hpB>pA*5) {
                  isPlyrA = true;
                }else if (fbB && !fbA && hpB<pA*5){
                  isPlyrA = false;
                }
                if(hpA<=5 && hpB >=10){
                   isPlyrA = true;
                }else if(hpB <= 5 && hpA >= 10){
                   isPlyrA = false;
                }

                doAttack(isPlyrA, isPlyrA ? pA : pB, isPlyrA ? fbA : fbB, isPlyrA ? pB : pA, isPlyrA ? fbB : fbA).then(() => {
                    doAttack(!isPlyrA, isPlyrA ? pB : pA, isPlyrA ? fbB : fbA, isPlyrA ? pA : pB, isPlyrA ? fbA : fbB).then(() => {
                        console.log('done!');
                        playerA.jumpWithAngle(-70,10);
                        playerB.jumpWithAngle(70,10);
                        playerAState = 'idle';
                        playerBState = 'idle';
                        if (fbA) {
                            nextWord(true)
                        }
                        if (fbB) {
                            nextWord(false)
                        }
                        resetBtn.shape.click()
                        BATTLE_IN_PROGRESS = false;
                        if(NEEDS_RESET){
                            resetAll();
                        }
                        resolve();
                    })
                })
            });
        }
    )
}

function resetAll(){
    teamA.puzzleDiv.rotateTo(0);
    teamB.puzzleDiv.rotateTo(0);
    teamA.puzzleDiv.x = 0;
    teamA.puzzleDiv.y = 0;
    teamB.puzzleDiv.x = width*.7 -6;
    teamB.puzzleDiv.y = 0;
    teamA.puzzleDiv.inputBox.x = width * 0.005;
    teamA.puzzleDiv.inputBox.y = height * 0.5;
    teamA.puzzleDiv.inputBox.rotateTo() ;
    teamA.puzzleDiv.removeClass('smoothed');
    teamB.puzzleDiv.inputBox.x = width * 0.81;
    teamB.puzzleDiv.inputBox.y = height * 0.5;
    teamB.puzzleDiv.inputBox.rotateTo() ;
    teamB.puzzleDiv.removeClass('smoothed');

    playerA.x = width * .28;
    playerA.y = height - 100;
    playerB.x = width * .72;
    playerB.y = height - 100;

    playerA.shoot();
    playerB.shoot();

    playerAState = 'idle';
    playerBState = 'idle';
}

function addAction(isA, action, args, isPerm) {
    let act = {
        target: isA ? playerA : playerB,
        action: action,
        args: args,
        permanent: isPerm
    };
    ACTION_QUEUE.push(act)
}

let playerAState = 'idle';
let playerBState = 'idle';
let timeSinceCheckA = 0;
let timeSinceCheckB = 0;

function subroutines() {
    let time = window.performance.now();
    if (playerAState === 'idle' && time - timeSinceCheckA > 810) {
        addAction(1, 'sparHop', 0.5);
        timeSinceCheckA = time;
    }
    if (playerBState === 'idle' && time - timeSinceCheckB > 700) {
        addAction(0, 'sparHop', 0.5);
        timeSinceCheckB = time;
    }
}

function handleDamage(player, num) {
    if (player.team === 'A') {
        console.log('Team A takes ' + num + ' damage');
        teamA.hp -= num;
        playerA.jumpFwd(-0.3);
        if (teamA.hp <= 0) {
            teamA.hp = 0;
            playerA.kill()
        }
        teamA.hpDiv.value = teamA.hp;
    } else {
        console.log('Team B takes ' + num + ' damage');
        teamB.hp -= num;
        playerB.jumpFwd(-0.3);
        if (teamB.hp <= 0) {
            teamB.hp = 0;
            playerB.kill()
        }
        teamB.hpDiv.value = teamB.hp;
    }
    MAINARENA.border = 'solid red 5px';
    MAINARENA.x -= 2;
    setTimeout(()=>{
        MAINARENA.x +=2;
        MAINARENA.border = 'solid black 5px'
    },50)
}


let THINGS_TO_UPDATE = [];
let ACTION_QUEUE = [];
let PROJECTILES = [];

function floop() {
    for (let i = THINGS_TO_UPDATE.length - 1; i >= 0; i--) {
        THINGS_TO_UPDATE[i].update();
        if (THINGS_TO_UPDATE[i].dead) {
            THINGS_TO_UPDATE.splice(i, 1);
        }
    }
    for (let i = ACTION_QUEUE.length - 1; i >= 0; i--) {
        let act = ACTION_QUEUE[i];
        act.target[act.action].call(act.target, act.args);
        if (!act.permanent) ACTION_QUEUE.splice(i, 1);
    }
    for (let i = PROJECTILES.length - 1; i >= 0; i--) {
        let p = PROJECTILES[i];
        p.update();
        if (p.hasHitbox && p.target.hasHitbox && p.hitbox.contains(p.target.hitbox.vMiddle)) {
            handleDamage(p.target, p.power);
            p.kill()
        }
        if (p.dead) {
            PROJECTILES.splice(i, 1);
        }
    }

    subroutines();
}

let resetAllBtn = new Circle(0,0,20);
resetAllBtn.color = 'transparent';
resetAllBtn.set('zIndex', '10000');
resetAllBtn.shape.addEventListener('click',()=>{
    console.log('emergency reset');
    resetAll()
});



setup();
createFallbackLoopFunction(floop).start();

console.log(teamA.wordPool.map(x => x[0]));
console.log(teamB.wordPool.map(x => x[0]));

let testing = false;
function test() {
    let [a, b] = [getRandom(4), getRandom(4)];
    console.log('Battle ! with (' + a + ',' + b + ')');
    battle(a, b).then(()=>{
        if(testing)test()
    })
}

//TODO =================== MAIN =================
//DONE add jumpBack when getting hit
//TODO add 3 rounds
//TODO add player select screen
//TODO add free for all