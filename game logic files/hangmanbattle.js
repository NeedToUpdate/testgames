setupBody(id("MAIN_SCREEN"))

let DAMAGE_PER_TICK = 7;
let FINAL_SMASH_SCALING = 5;
let ROUNDS = 3;

let HELP_A_TEAM = 'none';

let IMAGE_PATH = '../images/';
let BACKGROUND_CONFIG = IMAGE_CONFIG.backgrounds

document.body.style.backgroundColor = 'lightgrey';


let MAINARENA = new Rectangle(width * .2, height * .2, width * .6 - 5, height * .8).asOutline('black', 5);
let background = 'background' + getRandom(BACKGROUND_CONFIG.num).toString() + '.jpg';
MAINARENA.set('backgroundColor', 'grey');
MAINARENA.set('backgroundImage', 'url(' + IMAGE_PATH + BACKGROUND_CONFIG.path + background + ')');
MAINARENA.set('backgroundSize', 'cover');
MAINARENA.set('backgroundRepeat', 'no-repeat');
MAINARENA.set('backgroundPosition', 'center');


function message(isTeamA, msg) {
    if (isTeamA) {
        teamA.puzzleDiv.title = msg;
        setTimeout(() => {
            teamA.puzzleDiv.title = 'Team Blue';
        }, 2000)
    } else {
        teamB.puzzleDiv.title = msg;
        setTimeout(() => {
            teamB.puzzleDiv.title = 'Team Red';
        }, 2000)
    }
}


let circles = [];

function setUpCircles() {
    let bigR = width / 45;
    let smallR = width / 60;
    let rc = new Circle(width / 2 + bigR * 2 + 10, height * .18 + bigR / 2, bigR).asOutline('black', 3).fromCenter();
    circles = [rc];
    for (let i = 0; i < (ROUNDS - 1); i += 2) {
        circles.unshift(new Circle(width / 2 + bigR * 2 - smallR * (3 + i * 1.3), height * .18, smallR).asOutline('black', 3).fromCenter());
        circles.push(new Circle(width / 2 + bigR * 2 + smallR * (3 + i * 1.3), height * .18, smallR).asOutline('black', 3).fromCenter())
    }
}

let blackout = {};

function toggleBlackout() {
    if (Object.keys(blackout).length > 1) {
        blackout.remove();
        blackout = {};
        playerAState = 'idle';
        playerBState = 'idle';
    } else {
        blackout = new Rectangle(0, 0, width, height);
        blackout.color = 'rgba(0,0,0,0.3)';
        blackout.set('zIndex', '2000');
        unIdlePlayers();
    }

}


let winsA = 0;
let winsB = 0;

function checkCircle(isTeamA) {
    console.log(winsA, winsB, isTeamA);
    if (isTeamA == 1) {
        let circle = circles[winsA - 1];
        let check = id('checkmark').content.cloneNode(true);
        circle.attach(check);
        circle.addClass('smoothed');
        circle.border = 'solid royalblue 3px';
        circle.color = 'cyan';
        circle.shape.childNodes[1].childNodes[1].childNodes[3].setAttribute('fill', 'royalblue');
        circle.shape.childNodes[1].childNodes[1].childNodes[3].setAttribute('stroke', 'blue');
    } else if (isTeamA == 0) {
        let circle = circles[ROUNDS - winsB];
        let check = id('checkmark').content.cloneNode(true);
        circle.attach(check);
        circle.addClass('smoothed');
        circle.border = 'solid indianred 3px';
        circle.color = 'orange';
        circle.shape.childNodes[1].childNodes[1].childNodes[3].setAttribute('fill', 'indianred');
        circle.shape.childNodes[1].childNodes[1].childNodes[3].setAttribute('stroke', 'red');
    } else {
        let circle = circles[ROUNDS / 2 | 0];
        let check = id('checkmark').content.cloneNode(true);
        circle.attach(check);
        circle.addClass('smoothed');
        circle.set('borderTop', 'solid royalblue 3px');
        circle.set('borderLeft', 'solid royalblue 3px');
        circle.set('borderBottom', 'solid indianred 3px');
        circle.set('borderRight', 'solid indianred 3px');
        circle.set('backgroundImage', 'linear-gradient(135deg,cyan 0%,orange 100%)');
        circle.shape.childNodes[1].childNodes[1].childNodes[3].setAttribute('fill', 'indianred');
        circle.shape.childNodes[1].childNodes[1].childNodes[3].setAttribute('stroke', 'royalblue');
    }
}

function handleWin(isTeamA) {
    let gameEnd = false;
    if (isTeamA == 1) {
        winsA++;
        if (winsA > ROUNDS / 2) gameEnd = true;
        checkCircle(isTeamA)
    } else if (isTeamA == 0) {
        winsB++;
        if (winsB > ROUNDS / 2) gameEnd = true;
        checkCircle(isTeamA)
    } else {
        winsA++;
        winsB++;
        if (winsA >= (ROUNDS / 2) || winsB >= (ROUNDS / 2)) gameEnd = true;
        if (winsA > (ROUNDS / 2 | 0) && winsB > (ROUNDS / 2 | 0)) {
            checkCircle(2);
        } else {
            checkCircle(0);
            checkCircle(1);
            let numA;
            if (!gameEnd) {
                setTimeout(() => {
                    toggleBlackout();
                    choose_your_fighter_2Team(isTeamA).then(num => {
                        numA = num;
                        choose_your_fighter_2Team(!isTeamA).then(numB => {
                            toggleBlackout();
                            setUpCharacters(numA, numB).then(() => {
                                teamA.hp = 100;
                                teamA.hpDiv.value = 100;
                                teamB.hp = 100;
                                teamB.hpDiv.value = 100;
                                resetAll()
                            });
                        });
                    });
                    INTERRUPT_DAMAGE = false;
                }, 4000);
                return;
            }
        }
    }
    if (!gameEnd) {
        setTimeout(() => {
            toggleBlackout();
            choose_your_fighter_2Team(!isTeamA).then(num => {
                toggleBlackout();
                setUpCharacter_2Team(!isTeamA, num).then(() => {
                    teamA.hp = 100;
                    teamA.hpDiv.value = 100;
                    teamB.hp = 100;
                    teamB.hpDiv.value = 100;
                    resetAll()
                });
            });
            INTERRUPT_DAMAGE = false;
        }, 4000)
    } else {
        if (isTeamA) {
            playerAState = 'winner';
        } else {
            playerBState = 'winner';
        }
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

class Glow extends Div {
    constructor(x, y, color) {
        super(x, y, 1, 1, 0);
        this.glow = color;
        this.set('zIndex', '1000');
        this.color = color;
        this.set('boxShadow', '0 0 10px 10px ' + this.glow)
    }
}


let playerA = {};
let playerB = {};


function setUpCharacters(numA, numB) {
    return new Promise(resolve => {
        setUpCharacter_2Team(true, numA).then(() => {
            setUpCharacter_2Team(false, numB).then(() => {
                return resolve()
            });
        });
    })
}


function setup() {
    LOADED_IMAGES = new ImageLoader(IMAGE_PATH + 'projectiles/', ['fire', 'dynamite', 'shuriken','knife','grenade'].map(x => x + '_projectile'));
    LOADED_IMAGES.add('fire', IMAGE_PATH);
    LOADED_IMAGES.add('bloodsplatter', IMAGE_PATH);
    LOADED_IMAGES.add('heal', IMAGE_PATH);
    return new Promise(resolve => {
        let numA, numB;
        toggleBlackout();
        let [a, b] = get2DPSArrays(words);
        teamA.wordPool = a;
        teamB.wordPool = b;
        nextWord(true);
        nextWord(false);
        let go = new Rectangle(width / 2 - 50, height / 2 - 20, 100, 40);
        let p = new P('GO!', 50, 20).fromCenter();
        go.attach(p);
        go.set('borderRadius', '20px');
        go.set('zIndex', '2200');
        go.color = 'limegreen';
        go.border = 'solid green 2px';
        go.shape.addEventListener('click', () => {
            go.remove();
            choose_your_fighter_2Team(true).then(num => {
                numA = num;
                choose_your_fighter_2Team(false).then(num => {
                    numB = num;
                    setUpCharacters(numA, numB).then(() => {
                        teamA.hpDiv = new LoadingBar(width * .21, height * .35, width / 5, 35, 0, 100, 100);
                        teamB.hpDiv = new LoadingBar(width * .59, height * .35, width / 5, 35, 0, 100, 100);
                        teamA.hpDiv.shape.addEventListener('click',()=>{
                            HELP_A_TEAM = 'A';
                            console.log('helping team A')
                        });
                        teamB.hpDiv.shape.addEventListener('click',()=>{
                            HELP_A_TEAM = 'B';
                            console.log('helping team B')
                        });
                        teamA.puzzleDiv.set('zIndex', '10');
                        teamA.input = createInputBox('A');
                        teamB.input = createInputBox('B');
                        setUpCircles();
                        toggleBlackout();
                        return resolve();
                    });
                })
            });
        });
    });
}

function nextWord(isTeamA) {
    let team = isTeamA ? teamA : teamB;
    if(team.wordIndex>=team.wordPool.length) team.wordIndex = 0;
    team.word = team.wordPool[team.wordIndex][0];
    team.wordIndex++;
    setUpWord(isTeamA, team.word);
    message(isTeamA, 'New Word!')
}


function setUpWord(team, word) {
    if (team) {
        if (Object.keys(teamA.puzzleDiv).length === 0) {
            teamA.puzzleDiv = new Puzzle(word, 0, 0, width * .3, height * .3, 'A');
            teamA.puzzleDiv.set('zIndex', '10')
        } else {
            teamA.puzzleDiv.addNewWord(word)
        }
    } else {
        if (Object.keys(teamB.puzzleDiv).length === 0) {
            teamB.puzzleDiv = new Puzzle(word, width * .7 - 6, 0, width * .3, height * .3, 'B');
            teamB.puzzleDiv.set('zIndex', '10')
        } else {
            teamB.puzzleDiv.addNewWord(word)
        }
    }
}

function get2DPSArrays(array) {
    function getCloseToAverageBy(val, exceptions) {
        return wordDpsTemp2.filter(x => !exceptions.includes(x)).reduce((a, b) => {
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
        let dmg = Math.sqrt(eff) * Math.sqrt(l);
        wordDPS.push([w, ((dmg + l))])
    });
    let averageDPS = wordDPS.reduce((a, b) => a + b[1], 0) / wordDPS.length;
    let newWordOrder = [];
    let newWordOrder2 = [];
    let wordDpsTemp = Array.from(wordDPS);
    let wordDpsTemp2 = Array.from(wordDPS);
    for (let i = 0; i < (wordDPS.length); i++) {
        let ch = wordDpsTemp.splice(getRandom(wordDpsTemp.length), 1)[0];
        let exclusions = [ch];
        if (wordDpsTemp2.map(x => x[0]).includes(ch)) {
            exclusions.push(wordDpsTemp[wordDpsTemp2.map(x => x[0]).indexOf(ch)])
        }
        let cl = getCloseToAverageBy((ch[1] - averageDPS), exclusions);
        wordDpsTemp2.splice(wordDpsTemp2.indexOf(cl), 1);
        newWordOrder.push(ch);
        newWordOrder2.push(cl);
    }
    return shuffle([newWordOrder, newWordOrder2]);
}

function createSpinner(word1, word2, winner) {
    return new Promise(resolve => {
        let left = width / 2 - 3;
        let top = height / 2 - 3;
        let circleBG = new Circle(left, top, 150);
        circleBG.color = 'yellow';
        circleBG.border = 'blue solid 3px';
        let circle = new Circle(left, top, 100);
        circle.color = 'yellow';
        circle.border = "blue solid 3px";
        let arrow = new Arrow(width / 2 - 103, top, left, top, 5);
        arrow.shape.style.transformOrigin = '100% 50%';
        arrow.color = 'blue';

        function eq(val) {
            return -1 * (0.05 * val - 7.7) ** 2 + 60
        }

        let stuffToRemove = [];
        let cheat = getRandom(0, 360);

        function setWordsInCircle(wordA, wordB) {
            let wordArray = wordA.split('').reverse().concat(wordB.split(''));
            let theta = 360 / wordArray.length;
            let angles = [];
            if (typeof winner === 'boolean') {
                cheat = winner ? getRandom(360 - (wordA.length * theta) + 1, 360 - (theta / 2) - 1) : getRandom(theta / -2 + 1, theta * wordB.length - 1);
            }
            for (let i = 0; i < wordArray.length; i++) {
                let index = (wordA.length + i) % wordArray.length;
                let p = new P(wordArray[index], left - 6 + Math.cos(((theta * i) - 90 + theta / 2) / 180 * Math.PI) * 125, top - 9 + Math.sin(((theta * i - 90 + theta / 2) / 180) * Math.PI) * 125);
                let l = Line.fromAngle(left + 2 + Math.cos(((theta * i) - 90) / 180 * Math.PI) * 101, top + 2 + Math.sin(((theta * i - 90) / 180) * Math.PI) * 101, 50, theta * i - 90, 3);
                l.color = 'blue';
                p.color = index < wordA.length ? 'royalblue' : 'indianred';
                p.size = '3em';
                p.set('fontWeight', 'bolder');
                p.y -= 20;
                p.x -= 3;
                stuffToRemove.push(p);
                stuffToRemove.push(l);
                angles.push({w: wordArray[index], a: theta * i, t: index < wordA.length})
            }
            return angles
        }

        let angs = setWordsInCircle(word1, word2);
        console.log(angs);
        let angle = -63 + cheat;
        let x = 0;
        let loops = setInterval(() => {
            arrow.rotateTo(angle);
            angle += eq(x);
            x++;
            if (eq(x) < 0) {
                let finala = ((angle - 92) % 360);
                let lower = angs.filter(x => x.a < finala);
                clearInterval(loops);
                console.log(lower, finala, lower[lower.length - 1].t?'teamA':'teamB' );
                setTimeout(() => {
                    circle.remove();
                    circleBG.remove();
                    stuffToRemove.forEach(x => {
                        x.remove();
                    });
                    arrow.remove();
                    return resolve(lower[lower.length - 1].t);
                }, 3000)
            }
        }, 30);
    })
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
                    let glow = new Character(target.x, target.y, 'cyan');
                    glow.hasNoBounds = true;
                    glow.addSprite(new Glow(0, 0, 'cyan'));
                    glow.addForce(new Vector(1, 0));
                    THINGS_TO_UPDATE.push(glow);
                    THINGS_TO_KILL.push(glow);
                    mover.kill();
                    A.revealLetter(indices[i]);
                    glow.doMoveTo(playerA.p, 0.5).then(() => {
                        glow.kill();
                        if (i === numA - 1) {
                            A.flash();
                            if (finishedA) {
                                A.letterDivs.forEach((x, k) => {
                                    x.color = 'limegreen';
                                    let glow = new Character(x.x, x.y, 'cyan');
                                    glow.hasNoBounds = true;
                                    glow.addSprite(new Glow(0, 0, 'cyan'));
                                    glow.addForce(new Vector(1, 0));
                                    THINGS_TO_UPDATE.push(glow);
                                    THINGS_TO_KILL.push(glow);
                                    glow.doMoveTo(playerA.p, 0.5).then(() => {
                                        glow.kill();
                                        if (k === A.letterDivs.length - 1) {
                                            readyA = true;
                                            doBattle();
                                        }
                                    });
                                })
                            } else {
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
                    let glow = new Character(target.x, target.y, 'orange');
                    glow.hasNoBounds = true;
                    glow.addSprite(new Glow(0, 0, 'orange'));
                    glow.addForce(new Vector(-1, 0));
                    THINGS_TO_UPDATE.push(glow);
                    THINGS_TO_KILL.push(glow);
                    mover.kill();
                    B.revealLetter(indices[i]);
                    glow.doMoveTo(playerB.p, 0.5).then(() => {
                        glow.kill();
                        if (i === numB - 1) {
                            B.flash();
                            if (finishedB) {
                                B.letterDivs.forEach((x, k) => {
                                    x.color = 'limegreen';
                                    let trgt = x.p.copy().add(B.p);
                                    let glow = new Character(trgt.x, trgt.y, 'orange');
                                    glow.addSprite(new Glow(0, 0, 'orange'));
                                    glow.hasNoBounds = true;
                                    glow.addForce(new Vector(-1, 0));
                                    THINGS_TO_UPDATE.push(glow);
                                    THINGS_TO_KILL.push(glow);
                                    glow.doMoveTo(playerB.p, 0.5).then(() => {
                                        glow.kill();
                                        if (k === B.letterDivs.length - 1) {
                                            readyB = true;
                                            doBattle();
                                        }
                                    });
                                })
                            } else {
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

    function doBattle() {
        //console.log('Battle is called' + (readyA? '': ' but Team A is not Ready') +(readyB? '' : ' but team B is not Ready'))
        if (!readyA || !readyB) return;
        console.log('battle phase!');

        battle(numA, numB, finishedA, finishedB);
    }
}

let goBtn = new Circle(width * 0.03, height * 0.37, 14).asOutline('green', 3);
goBtn.shape.addEventListener('click', submitLetters);
let resetBtn = new Circle(width * 0.03, height * 0.37 + 35, 14).asOutline('red', 3);
let THINGS_TO_KILL = [];
resetBtn.shape.addEventListener('click', () => {
    BATTLE_IN_PROGRESS = false;
    teamA.input.reset();
    teamB.input.reset();
    THINGS_TO_KILL.forEach(x => {
        if(x.isProjectile && !x.isHandled){
            handleDamage(x.target, x.power);
        }
        x.kill();
    });
    THINGS_TO_KILL = [];
});
window.addEventListener('DOMContentLoaded', () => {
    resetBtn.attach(id('backbutton').content.cloneNode(true));
    goBtn.attach(id('checkmark').content.cloneNode(true));
});


function unIdlePlayers() {
    playerAState = '';
    playerBState = '';
    return new Promise(resolve => {
        function tryResolve() {
            if (!a || !b) return;
            return resolve()
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
                            return resolve();
                        })
                    }, 500)
                } else {
                    p.sprite.set('zIndex', '3000');
                    p.target = target;
                    p.angle = 0;
                    p.isProjectile = true;
                    PROJECTILES.push(p);
                    THINGS_TO_KILL.push(p);
                    setTimeout(() => {
                        return resolve()
                    }, 1000)
                }
            }, 500);
        } else {
            p.sprite.set('zIndex', '3000');
            p.target = target;
            p.angle = 0;
            p.isProjectile = true;
            PROJECTILES.push(p);
            THINGS_TO_KILL.push(p);
            setTimeout(() => {
                return resolve()
            }, 1000)
        }
    })
}


function regularShoot(isPlayerA, num,damage){
    if(damage === undefined) damage = DAMAGE_PER_TICK;
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    return new Promise(resolve => {
        if (fighter.dead) return resolve();
        for (let i = 0; i < num; i++) {
            setTimeout(() => {
                fighter.powerUp(damage);
            }, (i + 1) * 1000)
        }
        setTimeout(() => {
            doShot(fighter, target).then(() => {
                return resolve()
            })
        }, (num + 1) * 1000);
    })
}

function jumpAndHit(isPlayerA, dmg) {
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    return new Promise(resolve => {
        if (fighter.dead) return resolve();
        fighter.jumpWithAngle(isPlayerA ? 45 : -45, 20);
        let unsub = fighter.landing_emitter.subscribe('land', () => {
            unsub();
            handleDamage(target, dmg);
            if (INTERRUPT_DAMAGE) {
                NEEDS_RESET = true;
                return resolve()
            }
            fighter.jumpWithAngle(isPlayerA ? -45 : 45, 20);
            isPlayerA ? fighter.faceRight() : fighter.faceLeft();
            unsub = fighter.landing_emitter.subscribe('land', () => {
                unsub();
                return resolve();
            })
        })
    })
}

function jumpSpinHit(isPlayerA, dmg) {
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    return new Promise(resolve => {
        if (fighter.dead) return resolve();
        fighter.jumpWithAngle(isPlayerA ? 45 : -45, 20);
        fighter.doSpin(360 * (isPlayerA ? -1 : 1), 10);
        let unsub = fighter.landing_emitter.subscribe('land', () => {
            fighter.jumpWithAngle(isPlayerA ? -45 : 45, 20);
            isPlayerA ? fighter.faceRight() : fighter.faceLeft();
            handleDamage(target, dmg);
            unsub();
            unsub = fighter.landing_emitter.subscribe('land', () => {
                unsub();
                return resolve();
            })
        })
    })
}

function spinShot(isPlayerA, dmg) {
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    return new Promise(resolve => {
        if (fighter.dead) return resolve();
        fighter.jumpUp(1.2);
        fighter.doSpin(360 * (isPlayerA ? -1 : 1), 10);
        fighter.powerUp(dmg / 2);
        setTimeout(() => {
            fighter.powerUp(dmg / 2);
        }, 200);
        setTimeout(() => {
            doShot(fighter, target).then(() => {
                return resolve()
            })
        }, 800)
    })
}


function rapidFire(isPlayerA, dmg) {
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    return new Promise(resolve => {
        if (fighter.dead) return resolve();
        let timeouts = [];
        for(let i = 0; i<8; i++){
            timeouts.push(setTimeout(()=>{
                fighter.powerUp(dmg / 8);
                setTimeout(() => {
                    doShot(fighter, target);
                    if (INTERRUPT_DAMAGE) {
                        NEEDS_RESET = true;
                        timeouts.forEach(t=>{
                            clearTimeout(t);
                        });
                        return resolve();
                    }
                }, 300);
                if(i ===7){
                    setTimeout(()=>{
                        return resolve();
                    },1500);
                }
            },500*i))
        }
    })
}

function pickUpandThrow(isPlayerA, dmg) {
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    return new Promise(resolve => {
        if (fighter.dead) return resolve();
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
                        handleDamage(target, dmg / 1.5);
                        if (INTERRUPT_DAMAGE) {
                            NEEDS_RESET = true;
                            return resolve();
                        }
                    }, 200);

                    unsub = target.landing_emitter.subscribe('land', () => {
                        unsub();
                        fighter.powerUp(dmg / 3);
                        setTimeout(() => {
                            doShot(fighter, target).then(() => {
                                setTimeout(() => {
                                    fighter.jumpWithAngle(isPlayerA ? -45 : 45, 20);
                                    isPlayerA ? fighter.faceRight() : fighter.faceLeft();
                                    target.jumpWithAngle(isPlayerA ? 45 : -45, 20);
                                    unsub = target.landing_emitter.subscribe('land', () => {
                                        isPlayerA ? target.faceLeft() : target.faceRight();
                                        unsub();
                                        return resolve();
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
        if (fighter.dead) return resolve();
        fighter.jumpWithAngle(isPlayerA ? 45 : -45, 20);
        fighter.doSpin(360 * (isPlayerA ? -1 : 1), 10);
        let unsub = fighter.landing_emitter.subscribe('land', () => {
            unsub();
            handleDamage(target, dmg / 3);
            if (INTERRUPT_DAMAGE) {
                NEEDS_RESET = true;
                return resolve()
            }
            fighter.jumpWithAngle(isPlayerA ? -45 : 45, 15);
            isPlayerA ? fighter.faceRight() : fighter.faceLeft();
            fighter.powerUp(dmg / 3);
            setTimeout(() => {
                doShot(fighter, target).then(() => {
                    fighter.jumpWithAngle(isPlayerA ? -45 : 45, 20);
                    isPlayerA ? fighter.faceRight() : fighter.faceLeft();
                    fighter.powerUp(dmg / 3);
                    setTimeout(() => {
                        doShot(fighter, target).then(() => {
                            return resolve()
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
        let wep = getRandom(2)?  'dynamite' : 'grenade';
        if (fighter.dead) return resolve();
        fighter.powerUp(dmg, wep);
        setTimeout(() => {
            let p = fighter.shoot(wep);
            p.sprite.set('zIndex', '3001');
            let di = LOADED_IMAGES.fire.cloneNode();
            di.style.zIndex = '3002';
            p.addDeathImage(di);
            p.target = target;
            p.isProjectile = true;
            PROJECTILES.push(p);
            setTimeout(() => {
                return resolve();
            }, 1000);
        }, 1000)
    })
}

function throwShuriken(isPlayerA, dmg) {
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    return new Promise(resolve => {
        let wep = getRandom(2)?  'shuriken' : 'knife';
        if (fighter.dead) return resolve();
        fighter.powerUp(dmg,wep);
        setTimeout(() => {
            let p = fighter.shoot(wep);
            p.target = target;
            p.sprite.set('zIndex', '3001');
            p.doSpin(720, 30);
            let di = LOADED_IMAGES.bloodsplatter.cloneNode();
            di.style.zIndex = '3002';
            p.addDeathImage(di);
            p.isProjectile = true;
            PROJECTILES.push(p);
            setTimeout(() => {
                return resolve();
            }, 1000);
        }, 1000)
    })
}

function heal(isPlayerA, val) {
    val = val || 0;
    let fighter = isPlayerA ? playerA : playerB;
    return new Promise(resolve => {
        if (fighter.dead) return resolve();
        let healImg = new Img(LOADED_IMAGES.heal.cloneNode(), fighter.x, fighter.y + fighter.height / 2, fighter.width, 10).fromCenter().onLoad(() => {
            healImg.addClass('fastsmoothed');
            healImg.zIndex = 3002;
            setTimeout(() => {
                healImg.height = fighter.height * 1.2;
                healImg.y = fighter.y - fighter.height / 1.2;
                healImg.removeClass('fastsmoothed');
                healImg.addClass('smoothed');
                setTimeout(() => {
                    healImg.set('opacity', '0');
                    let team = isPlayerA ? teamA : teamB;
                    let value = team.hp + val;
                    if (value > 100) value = 100;
                    let healing = setInterval(() => {
                        if (team.hp >= value) {
                            clearInterval(healing)
                        } else {
                            team.hp++;
                            team.hpDiv.value = team.hp;
                        }
                        if (fighter.dead) {
                            fighter.kill();
                            team.hp = 0;
                            team.hpDiv.value = team.hp;
                            clearInterval(healing);
                            return resolve()
                        }
                    }, 30);
                    setTimeout(() => {
                        healImg.remove();
                        setTimeout(() => {
                            return resolve();
                        }, 500)
                    }, 1000)
                }, 700)
            }, 100)
        });
    })
}


//================ FINAL SMASH FUNCS =========================
//================ FINAL SMASH FUNCS =========================
//================ FINAL SMASH FUNCS =========================
//================ FINAL SMASH FUNCS =========================

function goGiantAndStomp(isPlayerA, val) {
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    let team = isPlayerA ? teamA : teamB;
    return new Promise(resolve => {
        if (fighter.dead) return resolve();
        fighter.y -= height;
        fighter.sprite.addClass('slowsmoothed');
        fighter.width *= 5;
        fighter.minbounds.y = -1000;
        fighter.minbounds.x = 0;
        fighter.maxbounds.x = width;
        setTimeout(() => {
            team.puzzleDiv.addClass('fastsmoothed');
            team.puzzleDiv.inputBox.addClass('fastsmoothed');
            team.puzzleDiv.rotateTo(90 * (isPlayerA ? -1 : 1));
            team.puzzleDiv.x -= width * .15 * (isPlayerA ? 1 : -1);
            team.puzzleDiv.inputBox.x -= width * .15 * (isPlayerA ? 1 : -1);
        }, 3000);
        setTimeout(() => {
            fighter.sprite.removeClass('slowsmoothed');
            isPlayerA ? fighter.jumpRight() : fighter.jumpLeft();
            let unsub = fighter.landing_emitter.subscribe('land', () => {
                unsub();
                target.height = 10;
                target.sprite.addClass('smoothed');
                handleDamage(target, val);
                if (INTERRUPT_DAMAGE) {
                    NEEDS_RESET = true;
                    return resolve()
                }
                setTimeout(() => {
                    fighter.sprite.addClass('smoothed');
                    fighter.width /= 5;
                    fighter.minbounds.y = height * .2;
                    fighter.minbounds.x = width * .21;
                    fighter.maxbounds.x = width * .79;
                    setTimeout(() => {
                        fighter.jumpWithAngle(45 * (isPlayerA ? -1 : 1), 20);
                        unsub = fighter.landing_emitter.subscribe('land', () => {
                            fighter.sprite.removeClass('smoothed');
                            team.puzzleDiv.removeClass('fastsmoothed');
                            team.puzzleDiv.inputBox.removeClass('fastsmoothed');
                            unsub();
                            setTimeout(() => {
                                target.height = '';
                                target.sprite.removeClass('smoothed');
                                NEEDS_RESET = true;
                                setTimeout(() => {
                                    return resolve();
                                }, 500);
                            }, 1000)
                        })
                    }, 1100)
                }, 3000)
            });
        }, 6000);

    });
}

function throwMeteor(isPlayerA, val) {
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    let team = isPlayerA ? teamA : teamB;

    function breakTop(onLeft) {
        MAINARENA.set('borderTop', 'solid transparent 5px');
        let l = Line.fromAngle(MAINARENA.x + (onLeft ? 0 : MAINARENA.width), MAINARENA.y, 100, (onLeft ? -45 : -135), 5);
        let l2 = Line.fromAngle(MAINARENA.x + (onLeft ? 250 : MAINARENA.width - 250), MAINARENA.y, 100, (onLeft ? -135 : -45), 5);
        let l3 = Line.fromAngle(MAINARENA.x + (onLeft ? 250 : 0), MAINARENA.y, MAINARENA.width - 250, 0, 5);
        l3.set('zIndex', '3');
        l.color = 'black';
        team.puzzleDiv.addClass('fastsmoothed');
        team.puzzleDiv.rotateTo(45 * (isPlayerA ? -1 : 1));
        team.puzzleDiv.y -= height * .15;
        team.puzzleDiv.x -= height * .15 * (isPlayerA ? 1 : -1);
        return {
            clear: function () {
                team.puzzleDiv.removeClass('fastsmoothed');
                l.remove();
                l2.remove();
                l3.remove();
            }
        }
    }

    return new Promise(resolve => {
        if (fighter.dead) return resolve();
        fighter.minbounds.y = -1000;
        fighter.forces = [];
        let lines = {};
        setTimeout(() => {
            lines = breakTop(isPlayerA);
        }, 200);
        fighter.doMoveTo(new Vector(fighter.x, -200)).then(() => {
            let confused = setInterval(() => {
                target.turnAround();
            }, 1000);
            setTimeout(() => {
                let meteor = new Character(target.x + (isPlayerA ? -100 : 100), -200, 'meteor');
                meteor.hasNoBounds = true;
                meteor.y = -100;
                let meteorSprite = new Img(IMAGE_PATH + 'meteor.png', 0, 0, 600).fromCenter().onLoad(() => {
                    clearInterval(confused);
                    meteor.addSprite(meteorSprite);
                    meteorSprite.set('zIndex', '2000');
                    meteor.addForce(VECTORS.slowGravity);
                    THINGS_TO_UPDATE.push(meteor);
                    THINGS_TO_KILL.push(meteor);
                    meteor.addDeathImage(LOADED_IMAGES.fire.cloneNode());
                    !isPlayerA ? meteor.faceLeft() : '';
                    setTimeout(() => {
                        lines.clear();
                        target.angle = isPlayerA ? -90 : 90;
                        fighter.addForce(VECTORS.gravity);
                        fighter.minbounds.y = height * .2;
                        handleDamage(target, val);
                        if (INTERRUPT_DAMAGE) {
                            NEEDS_RESET = true;
                            return resolve()
                        }
                        setTimeout(() => {
                            target.angle = 0;
                            NEEDS_RESET = true;
                            setTimeout(() => {
                                return resolve();
                            }, 500);
                        }, 1500)
                    }, 600)
                })
            }, 3000)
        })
    });
}

function runBackAndSquish(isPlayerA, val) {
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    return new Promise(resolve => {
        if (fighter.dead) return resolve();
        if (isPlayerA) {
            fighter.minbounds.x = 0;
        } else {
            fighter.maxbounds.x = width;
        }
        fighter.jumpWithAngle(80 * (isPlayerA ? -1 : 1), 30);
        let unsub = fighter.landing_emitter.subscribe('land', () => {
            unsub();
            setTimeout(() => {
                fighter.addForce(new Vector((isPlayerA ? 100 : -100), 0));
                setTimeout(() => {
                    handleDamage(target, val * 3 / 4);
                    target.height = target.sprite.height;
                    target.width = 10;
                    target.addForce(new Vector((isPlayerA?20:-20),0));
                    setTimeout(() => {
                        fighter.jumpWithAngle((isPlayerA ? -45 : 45), 20);
                        unsub = fighter.landing_emitter.subscribe('land', () => {
                            unsub();
                            setTimeout(() => {
                                if (isPlayerA) {
                                    fighter.minbounds.x = width * .21;
                                } else {
                                    fighter.maxbounds.x = width * .79;
                                }
                                fighter.powerUp(val / 8);
                                setTimeout(() => {
                                    fighter.powerUp(val / 8);
                                    setTimeout(() => {
                                        doShot(fighter, target).then(() => {
                                            setTimeout(() => {
                                                target.height = '';
                                                target.width = width/8;
                                                setTimeout(() => {
                                                    return resolve();
                                                }, 500)
                                            }, 1000)
                                        })
                                    }, 500);
                                }, 500)
                            }, 1800)
                        })
                    }, 500)
                }, 500)
            }, 1000)
        })
    });
}


function marioHop(isPlayerA, val) {
    let fighter = isPlayerA ? playerA : playerB;
    let target = isPlayerA ? playerB : playerA;
    return new Promise(resolve => {
        if (fighter.dead) return resolve();
        fighter.minbounds.y = 0;
        fighter.jumpWithAngle((isPlayerA ? 45 : -45), 20);
        let unsub = fighter.landing_emitter.subscribe('land', () => {
            unsub();
            handleDamage(target, val / 4);
            if (INTERRUPT_DAMAGE) {
                NEEDS_RESET = true;
                return resolve();
            }
            target.height *= 0.8;
            fighter.maxbounds.y = height - target.height;
            fighter.jumpUp(2);
            unsub = fighter.landing_emitter.subscribe('land', () => {
                unsub();
                handleDamage(target, val / 4);
                target.height *= 0.8;
                if (INTERRUPT_DAMAGE) {
                    NEEDS_RESET = true;
                    return resolve();
                }
                target.height *= 0.7;
                fighter.maxbounds.y = height - target.height;
                fighter.jumpUp(2);
                unsub = fighter.landing_emitter.subscribe('land', () => {
                    unsub();
                    handleDamage(target, val / 4);
                    if (INTERRUPT_DAMAGE) {
                        NEEDS_RESET = true;
                        return resolve();
                    }
                    target.height *= 0.6;
                    fighter.maxbounds.y = height - target.height;
                    fighter.jumpUp(2);
                    unsub = fighter.landing_emitter.subscribe('land', () => {
                        unsub();
                        handleDamage(target, val / 4);
                        if (INTERRUPT_DAMAGE) {
                            NEEDS_RESET = true;
                            return resolve();
                        }
                        target.height *= 0.5;
                        fighter.maxbounds.y = height - target.height;
                        setTimeout(() => {
                            fighter.jumpWithAngle((isPlayerA ? -45 : 45), 20);
                            unsub = fighter.landing_emitter.subscribe('land', () => {
                                fighter.maxbounds.y = height - 20;
                                unsub();
                                setTimeout(() => {
                                    fighter.minbounds.y = height * .2;
                                    target.height *= (1 / 0.168);
                                    target.height = '';
                                    NEEDS_RESET = true;
                                    setTimeout(() => {
                                        return resolve();
                                    }, 500);
                                }, 2000);
                            })
                        }, 1000);
                    })
                })
            })
        });
    });
}


function explode(isPlayerA, val) {
    let target = isPlayerA ? playerA : playerB;
    let fighter = isPlayerA ? playerB : playerA;
    //since both die, makes more sense to flip those
    return new Promise(resolve => {
        if (fighter.dead) return resolve();
        target.powerUp(0);
        setTimeout(() => {
            let explosion = new Img(LOADED_IMAGES.fire.cloneNode(), fighter.x, fighter.y, 50).fromCenter().onLoad(() => {
                setTimeout(() => {
                    doShot(target, fighter).then(() => {
                        explosion.addClass('slowsmoothed');
                        explosion.set('zIndex', '3000');
                        setTimeout(() => {
                            explosion.width = width * 2;
                            explosion.y = -height;
                            explosion.x = -width / 2;
                            setTimeout(() => {
                                let white = new Rectangle(0, 0, width, height);
                                white.color = 'transparent';
                                white.addClass('slowsmoothed');
                                white.set('zIndex', '3001');
                                setTimeout(() => {
                                    white.color = 'white';
                                    setTimeout(() => {
                                        explosion.remove();
                                        white.remove();
                                        playerA.kill();
                                        playerB.kill();
                                        teamA.hpDiv.value = 0;
                                        teamB.hpDiv.value = 0;
                                        setTimeout(() => {
                                            handleWin(2);
                                            return resolve();
                                        }, 2000);
                                    }, 3100)
                                }, 100);
                            }, 1000)
                        }, 1000)
                    });
                }, 500);
            })
        }, 500)
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
    let dmgA = DAMAGE_PER_TICK;
    let dmgB = DAMAGE_PER_TICK;
    let fbD = FINAL_SMASH_SCALING;

    if(HELP_A_TEAM!=='none'){
        if(HELP_A_TEAM === 'A'){
            dmgA += 1;
            console.log('adding 1 more damage per tick to team A')
        }else{
            dmgB += 1;
            console.log('adding 1 more damage per tick to team B')
        }
        if(!getRandom(5)) {
            HELP_A_TEAM = 'none';
            console.log('resetting help back to none')
        }
    }

    async function doAttack(plyr, val, isFB, oppVal, oppFB) {
        let hp = plyr ? hpA : hpB;
        let damage = plyr? dmgA : dmgB;
        return new Promise(resolve => {
            if (val && !isFB) {
                if (val === 1) {
                    if (getRandom(10) < ((50 - hp) / 10)) {
                        heal(plyr, damage * val + 10).then(() => {
                            return resolve()
                        })
                    } else if (oppVal === 1 && getRandom(10) < 0) {
                        // if 1 and pB is 1
                        //projectiles hit eachother
                    } else if (getRandom(11) < 3) {
                        throwBomb(plyr, damage * val).then(() => {
                            return resolve()
                        })
                    } else if (getRandom(11) < 3) {
                        throwShuriken(plyr, damage * val).then(() => {
                            return resolve()
                        })
                    } else if (getRandom(10) < 4) {
                        jumpAndHit(plyr, damage * val).then(() => {
                            return resolve()
                        })
                    } else {
                        regularShoot(plyr, val,damage).then(() => {
                            return resolve()
                        })
                    }
                }
                if (val === 2) {
                    if (getRandom(10) < ((50 - hp) / 10)) {
                        heal(plyr, damage * val + 10).then(() => {
                            return resolve()
                        })
                    } else if (getRandom(10) < 3) {
                        spinShot(plyr, damage * val).then(() => {
                            return resolve()
                        })
                    } else if (oppVal === 2 && getRandom(10) < 0) {
                        // if 2 and pB is 2
                        //projectiles hit eachother
                    } else if (getRandom(12) < 3) {
                        throwBomb(plyr, damage * val / 2).then(() => {
                            throwBomb(plyr, damage * val / 2).then(() => {
                                return resolve()
                            })
                        })
                    } else if (getRandom(12) < 3) {
                        throwShuriken(plyr, damage * val / 2).then(() => {
                            throwShuriken(plyr, damage * val / 2).then(() => {
                                return resolve()
                            })
                        })
                    } else if (getRandom(12) < 3) {
                        jumpSpinHit(plyr, damage * val).then(() => {
                            return resolve()
                        })
                    }else if (getRandom(12) < 3) {
                        rapidFire(plyr, damage * val).then(() => {
                            return resolve()
                        });
                    } else {
                        regularShoot(plyr, val,damage).then(() => {
                            return resolve()
                        })
                    }
                }
                if (val === 3) {
                    if (getRandom(10) < ((50 - hp) / 10)) {
                        heal(plyr, damage * val + 10).then(() => {
                            return resolve()
                        })
                    } else if (getRandom(10) < 3) {
                        //pick up and throw
                        pickUpandThrow(plyr, damage * val).then(() => {
                            return resolve()
                        })
                    } else if (getRandom(10) < 3) {
                        spinHitAndShoot(plyr, damage * val).then(() => {
                            return resolve()
                        });
                    } else if (getRandom(10) < 3) {
                        rapidFire(plyr, damage * val).then(() => {
                            return resolve()
                        });
                    } else {
                        regularShoot(plyr, val,damage).then(() => {
                            return resolve()
                        })
                    }
                }
                //is there gonna be a 4+?
                if (val >= 4) {
                    //idk
                    if (getRandom(10) < 3) {
                        rapidFire(plyr, damage * val / 2).then(() => {
                            rapidFire(plyr, damage * val / 2).then(() => {
                                return resolve()
                            });
                        });
                    } else if (getRandom(10) < 3) {
                        //pick up and throw
                        pickUpandThrow(plyr, damage * val / 2).then(() => {
                            regularShoot(plyr, 2,damage).then(() => {
                                return resolve()
                            })
                        })
                    } else if (getRandom(10) < 3) {
                        spinHitAndShoot(plyr, damage * val / 2).then(() => {
                            regularShoot(plyr, 2,damage).then(() => {
                                return resolve()
                            })
                        });
                    } else {
                        regularShoot(plyr, val,damage).then(() => {
                            return resolve()
                        })
                    }
                }
            } else if (isFB) {
                let team = plyr ? teamA : teamB;
                let oppteam = plyr ? teamB : teamA;
                let index = team.wordIndex - 1;
                if (index === -1) index = 0;
                let oppIndex = team.wordIndex - 1;
                if (oppIndex === -1) oppIndex = 0;
                let fbDmg = team.wordPool[index][1] * fbD;
                console.log((plyr ? 'Team A' : 'Team B') + ' does a final smash');
                let hpIsLessThanFBD = (plyr ? hpA : hpB) <= oppteam.wordPool[oppIndex][1]*fbD;
                let hpIsLessThanRegularDmg = (plyr ? hpA : hpB)<oppVal*DAMAGE_PER_TICK;
                if (isFB && ((oppFB && hpIsLessThanFBD) || (!oppFB && hpIsLessThanRegularDmg)) && (plyr ? hpB : hpA) <= fbDmg && oppVal > 0) {
                    //if youre gonna do a final attack, and that attack will kill, but you will also die from one shot
                    explode(plyr, fbDmg).then(() => {
                        UNTICK_LETTER = false;
                        console.log('both die, so no undo letter');
                        return resolve();
                    })
                } else {
                    if (getRandom(10) < 4) {
                        goGiantAndStomp(plyr, fbDmg).then(() => {
                            return resolve()
                        })
                    } else if (getRandom(10) < 4) {
                        throwMeteor(plyr, fbDmg).then(() => {
                            return resolve();
                        })
                    } else if (getRandom(10) < 4) {
                        runBackAndSquish(plyr, fbDmg).then(() => {
                            return resolve()
                        })
                    } else if (getRandom(10) < 10) {
                        marioHop(plyr, fbDmg).then(() => {
                            return resolve()
                        })
                    }
                }
            } else if (val === 0 && !isFB) {
                return resolve();
            } else {
                console.log('oh no');
            }
        })
    }

    async function fancyChoice(hasCheat) {
        console.log('decided by roll');
        let cheat;
        if (winsA === winsB) {
            cheat = null;
        } else {
            cheat = !(winsA > winsB);
        }
        if (typeof hasCheat === 'boolean') {
            cheat = hasCheat;
        }
        if(HELP_A_TEAM!== 'none'){
            console.log('help requested for team ' + HELP_A_TEAM + '. Fancy choice is set to cheat mode.');
            cheat = HELP_A_TEAM === 'A';
            if(getRandom(4)) {
                HELP_A_TEAM = 'none';
                console.log('Help reset back to none')
            }
        }
        if(cheat!== null) console.log('cheating in favor of team ' + (cheat? 'A': 'B'));
        return new Promise(resolve => {
            createSpinner(teamA.word, teamB.word, cheat).then(x => {
                resolve(x);
            })
        })
    }

    let UNTICK_LETTER = false;
    return new Promise(resolve => {
            unIdlePlayers().then(async () => {
                playerAState = 'fighting';
                playerBState = 'fighting';
                let isPlyrA = getRandom(2);

                //TODO optimize this mess
                if (fbA && hpA > pB * DAMAGE_PER_TICK) {
                    isPlyrA = false;
                } else if (fbA && !fbB && hpA < pB * DAMAGE_PER_TICK) {
                    isPlyrA = true;
                }
                if (fbB && hpB > pA * DAMAGE_PER_TICK) {
                    isPlyrA = true;
                } else if (fbB && !fbA && hpB < pA * DAMAGE_PER_TICK) {
                    isPlyrA = false;
                }
                if ((!fbA && !fbB) && hpA <= DAMAGE_PER_TICK && hpB >= DAMAGE_PER_TICK * 2) {
                    console.log('A will die, so they go first');
                    isPlyrA = await fancyChoice(true);
                } else if ((!fbA && !fbB) && hpB <= DAMAGE_PER_TICK && hpA >= DAMAGE_PER_TICK * 2) {
                    console.log('B will die, so they go first');
                    isPlyrA = await fancyChoice(false);
                }
                if (fbA && fbB && hpA <= teamB.wordPool[teamB.wordIndex - 1 === -1 ? 0 : teamB.wordIndex - 1][1] * fbD && hpB <= teamA.wordPool[teamA.wordIndex - 1 === -1 ? 0 : teamA.wordIndex - 1][1] * fbD) {
                    console.log('Both are doing final smash, so roll dice');
                    isPlyrA = await fancyChoice();
                    UNTICK_LETTER = true;
                    console.log('someone will get back a letter')
                } else if (hpA <= DAMAGE_PER_TICK * pB && hpB <= DAMAGE_PER_TICK * pA && !fbA && !fbB) {
                    console.log('Both are doing small damage but will die, so roll dice');
                    isPlyrA = await fancyChoice();
                } else if ((fbA || fbB) && hpA <= DAMAGE_PER_TICK * pB && hpB <= DAMAGE_PER_TICK * pA) {
                    console.log('one is doing final smash, other will kill, so final smash first');
                    //if fbA is the thing that procd this, then this should work
                    isPlyrA = await fancyChoice(Boolean(fbA));
                } else if ((fbA && fbB && hpB <= teamA.wordPool[teamA.wordIndex - 1 === -1 ? 0 : teamA.wordIndex - 1][1] * fbD) || (fbB && fbA && hpA <= teamB.wordPool[teamB.wordIndex - 1 === -1 ? 0 : teamB.wordIndex - 1][1] * fbD) ){
                    console.log('both doing fb but one isnt going to kill');
                    isPlyrA = await fancyChoice();
                    UNTICK_LETTER = true;
                    console.log('someone will get back a letter')
                }

                doAttack(isPlyrA, isPlyrA ? pA : pB, isPlyrA ? fbA : fbB, isPlyrA ? pB : pA, isPlyrA ? fbB : fbA).then(() => {

                    if (NEEDS_RESET) {
                        resetSome()
                    }
                    if (UNTICK_LETTER && (playerA.dead || playerB.dead)) {
                        let team = playerB.dead ? teamB : teamA;
                        console.log('player ' + (playerB.dead ? 'B' : 'A') + ' undoes letter');
                        team.puzzleDiv.undoLetter();
                    }
                    unIdlePlayers().then(() => {
                        doAttack(!isPlyrA, isPlyrA ? pB : pA, isPlyrA ? fbB : fbA, isPlyrA ? pA : pB, isPlyrA ? fbA : fbB).then(() => {
                            console.log('done!');
                            playerA.jumpWithAngle(-70, 10);
                            playerB.jumpWithAngle(70, 10);
                            playerAState = 'idle';
                            playerBState = 'idle';
                            resetBtn.shape.click();
                            BATTLE_IN_PROGRESS = false;
                            if (NEEDS_RESET) {
                                resetAll();
                            }
                            if (teamA.puzzleDiv.isFinished) {
                                nextWord(true)
                            }
                            if (teamA.puzzleDiv.isFinished) {
                                nextWord(false)
                            }
                            return resolve();
                        })
                    })

                })
            });
        }
    )
}

function resetSome() {
    teamA.puzzleDiv.rotateTo(0);
    teamB.puzzleDiv.rotateTo(0);
    teamA.puzzleDiv.x = 0;
    teamA.puzzleDiv.y = 0;
    teamB.puzzleDiv.x = width * .7 - 6;
    teamB.puzzleDiv.y = 0;
    teamA.puzzleDiv.inputBox.x = width * 0.005;
    teamA.puzzleDiv.inputBox.y = height * 0.5;
    teamA.puzzleDiv.inputBox.rotateTo();
    teamA.puzzleDiv.removeClass('smoothed');
    teamA.puzzleDiv.removeClass('fastsmoothed');
    teamB.puzzleDiv.inputBox.x = width * 0.81;
    teamB.puzzleDiv.inputBox.y = height * 0.5;
    teamB.puzzleDiv.inputBox.rotateTo();
    teamB.puzzleDiv.removeClass('smoothed');
    teamB.puzzleDiv.removeClass('fastsmoothed');
    playerA.x = width * .28;
    playerA.y = height - 100;
    playerB.x = width * .72;
    playerB.y = height - 100;
    playerA.shoot();
    playerB.shoot();
    playerA.faceRight();
    playerB.faceLeft();
    playerA.angle = 0;
    playerB.angle = 0;
}

function resetAll() {
    resetSome();
    THINGS_TO_KILL.forEach(x => {
        if(x.isProjectile && !x.isHandled){
            handleDamage(x.target, x.power);
        }
        x.kill()
    });
    THINGS_TO_KILL = [];
    playerA.width = 120;
    playerB.width = 120;
    playerA.height = '';
    playerB.height = '';
    playerA.maxbounds.x = width * .79;
    playerA.minbounds.x = width * .21;
    playerA.maxbounds.y = height - 20;
    playerA.minbounds.y = height * .2;
    playerB.maxbounds.x = width * .79;
    playerB.minbounds.x = width * .21;
    playerB.maxbounds.y = height - 20;
    playerB.minbounds.y = height * .2;
    if (teamA.puzzleDiv.isFinished) nextWord(1);
    if (teamB.puzzleDiv.isFinished) nextWord(0);


    playerAState = 'idle';
    playerBState = 'idle';

    BATTLE_IN_PROGRESS = false;
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
    if (playerAState === 'winner' && time - timeSinceCheckA > 810) {
        addAction(1, 'jumpUp', 1.5);
        addAction(1, 'doSpin', [270, 10]);
        timeSinceCheckA = time;
    }
    if (playerBState === 'winner' && time - timeSinceCheckB > 700) {
        addAction(0, 'jumpUp', 1.5);
        addAction(0, 'doSpin', [270, 10]);
        timeSinceCheckB = time;
    }
}

let INTERRUPT_DAMAGE = false;

function handleDamage(player, num) {
    if (player.team === 'A') {
        if (!playerA.dead) {
            console.log('Team A takes ' + num + ' damage');
            teamA.hp -= num;
            playerA.addForce(Vector.fromAngle(0).mult(6));
            if (teamA.hp <= 0) {
                teamA.hp = 0;
                playerA.kill();
                INTERRUPT_DAMAGE = true;
                setTimeout(() => {
                    handleWin(false);
                }, 2000);
            }
            teamA.hpDiv.value = teamA.hp;
        }
    } else {
        if (!playerB.dead) {
            console.log('Team B takes ' + num + ' damage');
            teamB.hp -= num;
            playerB.addForce(Vector.fromAngle(0).mult(6));
            if (teamB.hp <= 0) {
                teamB.hp = 0;
                playerB.kill();
                INTERRUPT_DAMAGE = true;
                setTimeout(() => {
                    handleWin(true);
                }, 2000);
            }
            teamB.hpDiv.value = teamB.hp;
        }
    }
    MAINARENA.border = 'solid red 5px';
    MAINARENA.x -= 2;
    setTimeout(() => {
        MAINARENA.x += 2;
        MAINARENA.border = 'solid black 5px'
    }, 50)
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
        if (typeof act.args === 'number') {
            act.target[act.action].call(act.target, act.args);
        } else {
            act.target[act.action].call(act.target, ...act.args);
        }
        if (!act.permanent) ACTION_QUEUE.splice(i, 1);
    }
    for (let i = PROJECTILES.length - 1; i >= 0; i--) {
        let p = PROJECTILES[i];
        p.update();
        if (!p.dead && p.hasHitbox && p.target.hasHitbox && p.target.hitbox.vMiddleTall.contains(p.hitbox)) {
            p.isHandled = true;
            handleDamage(p.target, p.power);
            p.kill()
        } 
        else if (!p.isHandled && !p.dead && (p.target.team === 'B' && p.hitbox.x2 > p.target.x) || (p.target.team === 'A' && p.hitbox.x2 < p.target.x)) {
            console.log('this projectile wasnt handled by the hitbox collision. gotta fix that')
            p.isHandled = true;
            handleDamage(p.target, p.power);
            p.kill()
        }
        if (p.dead) {
            PROJECTILES.splice(i, 1);
        }
    }

    subroutines();
}

let resetAllBtn = new Circle(0, 0, 20);
resetAllBtn.color = 'transparent';
resetAllBtn.set('zIndex', '10000');
resetAllBtn.shape.addEventListener('click', () => {
    console.log('emergency reset');
    resetAll()
});


setup().then(() => {
    createFallbackLoopFunction(floop).start();
});

console.log(teamA.wordPool.map(x => x[0]));
console.log(teamB.wordPool.map(x => x[0]));

let testing = false;

function test() {
    let [a, b] = [getRandom(4), getRandom(4)];
    console.log('Battle ! with (' + a + ',' + b + ')');
    battle(a, b).then(() => {
        if (testing) test()
    })
}

