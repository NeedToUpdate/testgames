let IMAGE_PATH = '../images/'
document.body.style.backgroundColor = 'lightgrey'
let MAINARENA = new Rectangle(width * .2, height * .2, width * .6 - 5, height * .8).asOutline('black', 5);
let background = 'background' + getRandom(20).toString() + '.jpg';
MAINARENA.set('backgroundColor', 'grey');
MAINARENA.set('backgroundImage', 'url(' + IMAGE_PATH + background.toString() + ')');
MAINARENA.set('backgroundSize', 'cover');
MAINARENA.set('backgroundRepeat', 'no-repeat');
MAINARENA.set('backgroundPosition', 'center');

LOADED_IMAGES = new ImageLoader(IMAGE_PATH + 'projectiles/', ['web', 'lightning', 'fire'].map(x => x + '_projectile'))

let teamA = {
    wordPool: Array.from(words),
    word: '',
    solvedWords: [],
    puzzleDiv: {},
    hp: 100,
    hpDiv: {},
};


let teamB = {
    wordPool: Array.from(words),
    word: '',
    solvedWords: [],
    puzzleDiv: {},
    hp: 100,
    hpDiv: {},
};

function setup() {
    teamA.word = teamA.wordPool.splice(getRandom(teamA.wordPool.length), 1)
    teamB.word = teamB.wordPool.splice(getRandom(teamA.wordPool.length), 1)
}


function setUpWord(team, word) {
    if (team === 'A') {
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

function createInputBox(team) {
    if (team === 'A') {
        return teamA.puzzleDiv.createInputBox(width * 0.005, height * 0.5, width * 0.18, height * 0.4)
    } else {
        return teamB.puzzleDiv.createInputBox(width * 0.81, height * 0.5, width * 0.18, height * 0.4)
    }
}

setUpWord("A", "abccddeee");
setUpWord("B", "abccddeee");

teamA.input = createInputBox('A');
teamB.input = createInputBox('B');

function submitLetters() {
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
                mover.doMoveTo(A.letterDivs[indices[i]].p, 0.5).then(() => {
                    mover.kill();
                    A.revealLetter(indices[i]);
                    if (i === numA - 1) {
                        readyA = true;
                        doBattle()
                        A.flash();
                    }
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

                mover.doMoveTo(B.letterDivs[indices[i]].p.copy().add(B.p), 0.5).then(() => {
                    mover.kill();
                    B.revealLetter(indices[i]);
                    if (i === numB - 1) {
                        readyB = true
                        B.flash()
                        doBattle()
                    }
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

    function doBattle() {
        //console.log('Battle is called' + (readyA? '': ' but Team A is not Ready') +(readyB? '' : ' but team B is not Ready'))
        if (!readyA || !readyB) return;
        console.log('battle phase!')
        if (finishedA) {
            A.letterDivs.forEach(x => {
                x.color = 'limegreen';
            })
        }
        if (finishedB) {
            B.letterDivs.forEach(x => {
                x.color = 'limegreen';
            })
        }
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


let playerA = new Character(width * .28, height - 100, 'spiderman');
let spriteA = new Img(IMAGE_PATH + '/' + playerA.name + '.png', 0, 0, width / 8).fromCenter().onLoad(() => {
    playerA.addSprite(spriteA);
    playerA.team = 'A';
    playerA.addForce(VECTORS.gravity);
    playerA.maxbounds.x = width*.79;
    playerA.minbounds.x = width*.21;
    playerA.maxbounds.y = height - 20;
    playerA.minbounds.y = height*.2;
    THINGS_TO_UPDATE.push(playerA);
});
let playerB = new Character(width * .72, height - 100, 'thor');
let spriteB = new Img(IMAGE_PATH + '/' + playerB.name + '.png', 0, 0, width / 8).fromCenter().onLoad(() => {
    playerB.addSprite(spriteB);
    playerB.team = 'B';
    playerB.addForce(VECTORS.gravity);
    playerB.maxbounds.x = width*.79;
    playerB.minbounds.x = width*.21;
    playerB.maxbounds.y = height - 20;
    playerB.minbounds.y = height*.2;
    THINGS_TO_UPDATE.push(playerB);
    playerB.faceLeft();
});

function unIdlePlayers(){
    playerAState = '';
    playerBState = '';
    return new Promise(resolve=>{
        function tryResolve(){
            if(!a || !b) return;
            resolve()
        }
        let a = false;
        let b = false;
        if(playerA.isJumping){
            playerA.interruptSperHop = true;
            let unsub = playerA.landing_emitter.subscribe('land',()=>{
                a = true;
                unsub();
                tryResolve();
            })
        }else{
            a = true;
            tryResolve();
        }
        if(playerB.isJumping){
            playerB.interruptSperHop = true;
            let unsub = playerB.landing_emitter.subscribe('land',()=>{
                b = true;
                unsub();
                tryResolve();
            })
        }else{
            b = true;
            tryResolve();
        }
    })
}


function battle(team1points, team2points, isTeam1finishingblow, isTeam2finishingblow) {
    let pA = team1points;
    let pB = team2points;
    let fbA = isTeam1finishingblow;
    let fbB = isTeam2finishingblow;
    let hpA = teamA.hp;
    let hpB = teamB.hp;

    unIdlePlayers().then(()=>{
        playerAState = 'fighting';
        playerBState = 'fighting';
        function regularShoot(player,num) {
            for (let i = 0; i < num; i++) {
                setTimeout(() => {
                    addAction(player, 'powerUp', 5);
                }, (i + 1) * 1000)
            }
            setTimeout(() => {
                let p = player? playerA.shoot() : playerB.shoot();
                p.target = player? playerB : playerA;
                PROJECTILES.push(p)
            }, (num + 1) * 1000);
        }

        if (pA) {
            if(pA === 1){
                if(getRandom(10)<2){
                    //jump and hit
                    playerA.jumpWithAngle(45,20);
                    let unsub = playerA.landing_emitter.subscribe('land',()=>{
                        console.log('jumpback');
                        playerA.jumpWithAngle(-45,20);
                        playerA.faceRight();
                        unsub();
                    })
                }else if (pB === 1 && getRandom(10) < 2) {
                    // if 1 and pB is 1
                    //projectiles hit eachother
                }else{
                    regularShoot(1,pA)
                }
            }
            if (pA === 2) {
                if(getRandom(10)<9){
                    //jump spin hit
                    playerA.jumpWithAngle(45,20);
                    playerA.doSpin(-360,10);
                    let unsub = playerA.landing_emitter.subscribe('land',()=>{
                        playerA.jumpWithAngle(-45,20);
                        playerA.faceRight();
                        unsub();
                    })
                }else if(getRandom(10)<3) {
                    playerA.jumpUp(2);
                    playerA.doSpin(-360,10);
                    playerA.powerUp(5);
                    setTimeout(()=>{
                        playerA.powerUp(5);
                    },500);
                    setTimeout(()=>{
                        let p = playerA.shoot();
                        p.target = playerB;
                        PROJECTILES.push(p)
                    },800)
                }else if (pB === 2 && getRandom(10) < 2) {
                    // if 2 and pB is 2
                    //projectiles hit eachother
                }else{
                    regularShoot(1,pA)
                }
            }
            if(pA === 3){
                if(getRandom(10)<2){
                    //rapid fire
                    let shootloop = setInterval(()=>{
                        playerA.powerUp(5);
                        setTimeout(()=>{
                            let p = playerA.shoot();
                            p.target = playerB;
                            PROJECTILES.push(p)
                        },300)
                    },600)
                    setTimeout(()=>{
                        clearInterval(shootloop)
                    },5000)
                }else if(getRandom(10)<3){
                    //pick up and throw
                    playerA.jumpWithAngle(45,20);
                    let unsub = playerA.landing_emitter.subscribe('land',()=>{
                        playerA.faceLeft();
                        unsub();
                        playerB.forces = [];
                        playerB.doMoveTo(playerB.p.copy().sub(new Vector(10,50)),0.5).then(()=>{
                            setTimeout(()=>{
                                playerB.addForce(VECTORS.gravity);
                                playerB.jumpWithAngle(-80,50);
                                unsub = playerB.landing_emitter.subscribe('land',()=> {
                                    playerA.powerUp(5);
                                    setTimeout(()=>{
                                        let p = playerA.shoot();
                                        p.target = playerB;
                                        PROJECTILES.push(p);
                                        setTimeout(()=>{
                                            playerA.jumpWithAngle(-45,20);
                                            playerA.faceRight();
                                            playerB.jumpWithAngle(45,20);
                                            playerB.faceLeft();
                                        },2000)
                                    },500);
                                    unsub();
                                })
                            },1000);
                        })
                    })
                } else if(getRandom(10)<3){
                    playerA.jumpWithAngle(45,20);
                    playerA.doSpin(-360,10);
                    let unsub = playerA.landing_emitter.subscribe('land',()=>{
                        playerA.jumpWithAngle(-45,10);
                        playerA.faceRight();
                        unsub();
                        playerA.powerUp(5)
                        setTimeout(()=>{
                            let p = playerA.shoot();
                            p.target = playerB;
                            PROJECTILES.push(p);
                            setTimeout(()=>{
                                playerA.jumpWithAngle(-45,20);
                                playerA.faceRight();
                            },2000)
                        },500)
                    })
                }else if(getRandom(10<3)){
                    playerA.powerUp(5,'dynamite')
                    let p = playerA.shoot();
                    p.target = playerB;
                    p.addDeathImage(LOADED_IMAGES.fire.cloneNode())
                    PROJECTILES.push(p);
                }else{
                    regularShoot(1,pA)
                }
            }
            //is there gonna be a 4+?
            if(pA >= 4){
                //idk
            }


        }
        if (pB) {
            for (let i = 0; i < pB; i++) {
                setTimeout(() => {
                    addAction(0, 'powerUp', 5);
                }, (i + 1) * 1000)
            }
            setTimeout(() => {
                let p = playerB.shoot();
                p.target = playerA;
                PROJECTILES.push(p)
            }, (pB + 1) * 1000);
        }
        //TODO set back team hp
    })

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
        teamA.hp -= num;
        //TODO deal with healthbar
    } else {
        teamB.ho -= num;
    }
}


let THINGS_TO_UPDATE = [];
let ACTION_QUEUE = [];
let PROJECTILES = [];

function loop() {
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
        if (p.hasHitbox && p.target.hasHitbox && p.hitbox.contains(p.target.hitbox)) {
            console.log("hit")
            handleDamage(p.target, p.power)
            p.kill()
        }
        if (p.dead) {
            PROJECTILES.splice(i, 1);
        }
    }

    subroutines();
}

createFallbackLoopFunction(loop).start();