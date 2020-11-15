// ghosts chase the letters
// specific colurs have specific behaviours

let behaviours = ['chase', 'predict', 'taunt', 'scare', 'idle', 'patrol', 'random']

//chase is default from other game
//predict will go to where the velocity vector is pointing
//taunt will follow nearby but never touch
//scare will run really fast into the letter but stop most of the time
//block will go in front of the letter, and just move back and forth, never touch TODO
//circle will circle around the letter TODO
//idle is just hover
//patrol is to fly around the other letters <-- used as default?
//random is fly to random locations

//maybe start with a bomb? can kill the ghosts before they start chasing.
//they will show a thinking pattern 

difficulty = 3;
let NUM_OF_BOMBS = (3 - difficulty) < 0 ? 0 : (3 - difficulty); //can be adjusted

let valid_colors = ['blue','green','orange','pink','purple','red','yellow','rainbow','space','evil'];

let alien_config = {
    blue: {
        num: 3,
        behaviour: 'patrol',
        difficulty: 1
    },
    green: {
        num:3,
        behaviour: 'scare',
        difficulty: 2
    },
    orange:{
        num:3,
        behaviour: 'taunt',
        difficulty: 2
    },
    pink:{
        num:3,
        behaviour: 'chase',
        difficulty: 2
    },
    purple:{
        num:3,
        behaviour: 'chase',
        difficulty: 3
    },
    red:{
        num:3,
        behaviour: 'random',
        difficulty: 3
    },
    yellow:{
        num:3,
        behaviour: 'taunt',
        difficulty: 2
    },
    rainbow:{
        num:3,
        behaviour: 'taunt',
        difficulty: 3
    },
    space:{
        num:3,
        behaviour: 'predict',
        difficulty: 4
    },
    evil:{
        num:3,
        behaviour: 'chase',
        difficulty: 5,
    },
}




let THINGS_ARE_DRAGGABLE = false;
let chosen_word = getRandom(words)
let letters = []
let actual_letters = []
let lines = []
let aliens = []
let letterDivs = [];

function setup() {
    //perhaps get new background images
    document.body.style.backgroundColor = 'black'



    //pick a random word, and show a transparent figure of it in the final spot. but have extra letters?
    actual_letters = chosen_word.split('').filter(x=>x!=' ')
    letters = Array.from(actual_letters)
    for (let i = 0; i < difficulty; i++) {
        letters.push(getRandom(alphabet.split('')))
    }
    console.log(letters, actual_letters)

    //lines should be bnear the bottom in the middle half of the screen
    let line_width = 80
    let total_width = actual_letters.length * line_width
    let line_padding = 5;
    let line_len = (total_width) / (actual_letters.length) - line_padding * 2;
    let line_height = height * 0.9
    for (let i = 0; i < actual_letters.length; i++) {
        let line = Line.fromAngle(line_padding + (width / 2 - total_width / 2) + (line_len + line_padding * 2) * i, line_height, line_len, 0, 4);
        line.color = 'white';
        lines.push(line);
    }
    let decoy_index = 0;
    actual_letters.forEach((letter, i) => {
        let pChar = new Character(lines[i].x + line_len / 2, line_height, letter);
        let p = new P(letter, 0, 0);
        p.size = '4em'
        pChar.addSprite(p)
        pChar.y -= p.height;
        pChar.x -= p.width / 2;
        pChar.hasNoBounds = true;
        p.color = 'rgba(255,255,255,0.5)'
        letterDivs.push(pChar)
        decoy_index = i;
    })

    //decoy letters should appear outside the screen and fly in afterwards
    async function createDecoyLetters() {
        return new Promise(resolve => {
            for (let i = 0; i < (letters.length - actual_letters.length); i++) {
                let pChar = new Character(getRandom(50, width - 50), getRandom(50, height / 2), letters[decoy_index + i]);
                let p = new P(letters[decoy_index + i], 0, 0).fromCenter();
                p.size = '4em';
                pChar.addSprite(p)
                pChar.y -= p.height;
                pChar.x -= p.width / 2;
                pChar.hasNoBounds = true;
                letterDivs.push(pChar);
            }
            setTimeout(resolve, 1000)
        })
    }

    async function scatterRealLetters() {
        return new Promise(resolve => {
            let promises = []
            letterDivs.forEach((letter, i) => {

                letter.sprite.shape.addEventListener('click', ev => {
                    pickup(letter, ev)
                });

                letter.sprite.shape.addEventListener('touchstart', ev => {
                    ev = ev.touches[0]
                    pickup(letter, ev)
                });

                if (i < actual_letters.length) {
                    promises.push(new Promise(resolve => {
                        letter.doMoveTo(new Vector(getRandom(50, width - 50), getRandom(50, height / 2)), 2).then(x => {
                            setTimeout(() => {

                                letter.sprite.set('transition', '2s');
                                letter.sprite.color = 'white';

                                setTimeout(() => {
                                    letter.sprite.set('transition', '') //need to set it back or else dragging doesnt work
                                    resolve();
                                }, 2100);

                                
                            }, 300)
                        })
                    }))
                }
            })
            Promise.all(promises).then(resolve);
        })
    }

    return new Promise(resolve => {
        createDecoyLetters().then(() => {
            scatterRealLetters().then(() => {
                THINGS_ARE_DRAGGABLE = true;
                resolve()
            })
        })
    })


}

function createAlien(color){
    color = color || getRandom(valid_colors);
    let config = alien_config[color];
    let alien = new Alien(100, 100, 'alien_' + color + '_' + config.behaviour);
    let alien_sprite = new Img('../images/ghosts/'+ color + getRandom(config.num) + '.png', 0, 0, 50).onLoad(x => {
        alien.addSprite(alien_sprite);
    });
    alien.setTarget(letterDivs[0])
    alien.changeBehaviour('random');
    alien.defaultBehaviour = config.behaviour;
    alien._DEFAULT_MAX_F = 6*config.difficulty;
    alien._DEFAULT_MAX_V = 8*config.difficulty;
    alien.MAX_F = alien._DEFAULT_MAX_F
    alien.MAX_V = alien._DEFAULT_MAX_V
    aliens.push(alien);
}

function releaseAliens() {
    for(let i = 0; i<5; i++){
        createAlien()
    }
}

//=============== DRAGGING FUNCTIONS ================


function drag(ev) {
    letterDivs.forEach(letter => {
        if (letter.isDragging) {
            let old_p = letter.p.copy();
            let newY = (ev.clientY - letter.height / 2);
            let newX = (ev.clientX - letter.width / 2);
            if (newY > (height - letter.height)) newY = height - letter.height;
            if (newY < 0) newY = 0;
            if (newX > (width - letter.width)) newX = width - letter.width;
            if (newX < 0) newX = 0;
            letter.y = newY;
            letter.x = newX;
            letter.old_p = old_p;
            letter.last_move = old_p.copy().sub(new Vector(newX,newY));
        }
    });
}

function pickup(letter, ev) {
    if (!letter.isLocked && !letter.isResetting) {
        letter.sprite.color = 'blue';
        let newY = (ev.clientY - letter.height / 2);
        let newX = (ev.clientX - letter.width / 2);
        if (newY > height) newY = height;
        if (newY < 0) newY = 0;
        if (newX > width) newX = width;
        if (newX < 0) newX = 0;
        letter.y = newY;
        letter.x = newX;
        letter.isDragging = true;
        aliens.forEach(a=>{
            a.setTarget(letter);
            a.changeBehaviour(a.defaultBehaviour);
        })
        previouslyTouchedLetter = letter
    }
}

function drop(letter) {
    if (!letter.isLocked) {
        letter.sprite.color = 'white';
        letter.isDragging = false;
        aliens.forEach(a=>{
            if(!['patrol','random','scare','idle'].includes(a.defaultBehaviour.toLowerCase())){
                a.changeBehaviour(getRandom(['random','patrol','idle']))
            }
        })
    }
}

function dropAll() {
    letterDivs.forEach(x => {
        drop(x)
    })
}

function resetLetter(letter){
    drop(letter)
    letter.isResetting = true;
    letter.sprite.color = 'red';
    letter.x = getRandom(50,width-50);
    letter.y = getRandom(50,height-50);
    setTimeout(()=>{
        letter.color = 'white';
        letter.isResetting = false;
    },500)
}

let dragging_offset = new Vector(0, 0);

document.addEventListener('mouseup', dropAll);
document.addEventListener('touchend', dropAll);
document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', (ev) => {
    if (ev.touches.length > 1) {
        ev = ev.touches[ev.touches.length - 1];
    } else {
        ev = ev.touches[0];
    }
    drag(ev)
});

let speedy_check = {} //will cache the indices here for quicker checks

function checkLetter(letter) {
    if (actual_letters.includes(letter.name)) {
        if (!Object.keys(speedy_check).includes(letter.name)) {
            let indicies = []
            actual_letters.forEach((x, i) => {
                if (x == letter.name) {
                    indicies.push(i);
                }
            })
            speedy_check[letter.name] = indicies;
        }
        let index_to_remove = null;
        let buffer = 20
        let y_buffer = 40
        speedy_check[letter.name].forEach((index, i) => {
            let line = {
                x: lines[index].x + lines[index].width / 2,
                y: lines[index].y
            };
            let pos = {
                x: letter.x + letter.width / 2,
                y: letter.y + letter.height / 2
            };
            if (Math.abs(line.x - pos.x) < buffer && line.y - pos.y < y_buffer) {
                actual_letters[index] = '#'
                index_to_remove = i;
                letter.isLocked = true;
                letter.isDragging = false;
                letter.sprite.color = 'limegreen';
                letter.x = line.x - letter.width / 2
                letter.y = line.y - (letter.height)
            }
        })
        if (index_to_remove !== null) {
            speedy_check[letter.name].splice(index_to_remove, 1);
        }
    }
}



class Alien extends Flyer {
    constructor(x, y, name) {
        super(x, y, name);
        this.behaviour = 'Idle';
        this.subroutines = this.subroutines.concat(['Chase', 'Predict', 'Taunt', 'Scare', 'Block', 'Circle', 'Idle', 'Patrol', 'Random']);
        this.isDoingChase = false;
        this.isDoingPredict = false;
        this.isDoingTaunt = false;
        this.isDoingScare = false;
        this.isDoingBlock = false;
        this.isDoingCircle = false;
        this.isDoingIdle = false;
        this.isDoingPatrol = false;
        this.isDoingRandom = false;

        this.targetLetter = {}

        this.defaultBehaviour = 'random'
    }
    setTarget(target) {
        console.assert(checkObj(target), target + ' is not a valid object');
        this.targetLetter = target
    }
    doChase() {
        if (this.isDoingChase) {
            if(checkObj(this.targetLetter)) this.steerTo(new Vector(this.targetLetter))
        } else {
            return new Promise(resolve => {
                this.isDoingChase = true;
                resolve()
            })
        }
    }
    stopChase() {
        if(this.isDoingChase){
            this.isDoingChase = false;
            this.v.clear();
        } 
        return;
    }
    doPredict() {
        if(this.isDoingPredict){
            let letter = this.targetLetter
            if(checkObj(letter)){
                let last_move = checkObj(letter.last_move)? letter.last_move.copy() : new Vector(0,5) 
                let targetV = letter.p.copy().sub(last_move.mult(20))
                this.MAX_V = last_move.mag/2
                this.MAX_F = last_move.mag/40 //trial and error's numbers. maybe better way to figure this out
                this.pathTo(targetV);
            }
        }else{
            return new Promise(resolve=>{
                this.isDoingPredict = true;              
                resolve();
            })
        }
    }
    stopPredict() {
        if(this.isDoingPredict){
            this.isDoingPredict = false;
            this.MAX_V = this._DEFAULT_MAX_V;
            this.MAX_F = this._DEFAULT_MAX_F;
            this.v.clear();
        } 
        return;
    }
    doTaunt() {
        if(this.isDoingTaunt){
            let letter = this.targetLetter
            if(checkObj(letter)){
                let last_move = checkObj(letter.last_move)? letter.last_move.copy() : new Vector(0,5) 
                let targetV = letter.p.copy().add(last_move.mult(20))
                this.MAX_V = last_move.mag/3
                this.MAX_F = last_move.mag/30 //trial and error's numbers. maybe better way to figure this out
                this.pathTo(targetV);
            }
        }else{
            return new Promise(resolve=>{
                this.isDoingTaunt = true;              
                resolve();
            })
        }
    }
    stopTaunt() {
        if(this.isDoingTaunt){
            this.isDoingTaunt = false;
            this.MAX_V = this._DEFAULT_MAX_V;
            this.MAX_F = this._DEFAULT_MAX_F;
            this.v.clear();
        } 
        return;
    }
    doScare() {
        if(this.isDoingScare){
            let letter = this.targetLetter;
            if(letter.p.copy().sub(this.p).mag > 50 && !this.cache.doScare.running){
                let targetV = checkObj(letter)? letter.p.copy() : new Vector(width/2,height/2) 
                this.pathTo(targetV);
            }else if(!this.cache.doScare.running){
                this.MAX_V = 100
                let backwards = letter.p.copy().sub(this.p)
                backwards.set(this.MAX_F).mult(-1)
                this.v.clear()
                this.forces.push(backwards);
                this.cache.doScare.running  = true;
            }else if(!this.cache.doScare.resetting){
                if(letter.p.copy().sub(this.p).mag > width/2){
                    this.cache.doScare.resetting = true;
                    this.cache.doScare.timeout = setTimeout(()=>{
                        this.MAX_V = 30
                        this.cache.doScare.resetting = false;
                        this.cache.doScare.running  = false;
                    },getRandom(2000,3000))
                }
            }
        }else{
            return new Promise(resolve=>{
                this.MAX_V = 30
                this.cache.doScare = {}
                this.isDoingScare = true;
                resolve()
            })
        }
    }
    stopScare() {
        if(this.isDoingScare){
            clearTimeout(this.cache.doScare.timeout);
            delete this.cache.doScare;
            this.MAX_V = this._DEFAULT_MAX_V;
            this.MAX_F = this._DEFAULT_MAX_F;
            this.isDoingScare = false;
            this.v.clear()
            this.a.clear();
        }
        return;
    }
    doBlock() {
        console.log('doBlock isnt implemented yet')
    }
    stopBlock() {
        console.log('stopBlock isnt implemented yet')
    }
    doCircle() {
        console.log('doCircle isnt implemented yet')
    }
    stopCircle() {
        console.log('stopCircle isnt implemented yet')
    }
    doRandom() {
        if(this.isDoingRandom){
            if(!this.cache.doRandom.isFlying){
                let dir = Vector.random().set(this.MAX_F)
                if(dir.x>=0) this.faceRight();
                if(dir.x<0) this.faceLeft();
                this.forces.push(dir);
                this.cache.doRandom.isFlying = true;
                this.cache.doRandom.timeout = setTimeout(()=>{
                    this.v.clear()
                    this.cache.doRandom.isFlying = false;
                },getRandom(500,1500))
            }
        }else{
            return new Promise(resolve=>{
                this.isDoingRandom = true;
                this.cache.doRandom = {}
                this.cache.doRandom.isFlying = false
                resolve()
            })
        }

    }
    stopRandom(){
        if(this.isDoingRandom){
            clearTimeout(this.cache.doRandom.timeout)
            this.v.clear()
            this.isDoingRandom = false;
            delete this.cache.doRandom
        }
    }
    doIdle() {
        if (this.isDoingIdle) {

        } else {
            this.isDoingIdle = true;
            return new Promise(resolve => {
                this.doHover();
                resolve();
            })
        }
    }
    stopIdle() {
        if (this.isDoingIdle){
            this.isDoingIdle = false;
            this.stopHover();
            this.v.clear();
            this.a.clear();
        } 
        return;
    }
    doPatrol() {
        function randomPosition(pos) {
            let step_size = getRandom(3) * 50 + 150
            let poss = [0, 1, 2, 3];
            if (pos.x < step_size) {
                poss.splice(poss.indexOf(1), 1)
            }
            if (pos.x > width - step_size) {
                poss.splice(poss.indexOf(3), 1)
            }
            if (pos.y < step_size) {
                poss.splice(poss.indexOf(0), 1)
            }
            if (pos.y > height - step_size) {
                poss.splice(poss.indexOf(2), 1)
            }
            let dir = getRandom(poss); //0 up, 1 left, 2 down 3 right
            switch (dir) {
                case 0:
                    return pos.copy().add(new Vector(0, -step_size))
                case 1:
                    return pos.copy().add(new Vector(-step_size, 0))
                case 2:
                    return pos.copy().add(new Vector(0, step_size))
                case 3:
                    return pos.copy().add(new Vector(step_size, 0))
            }
        }
        if (this.isDoingPatrol) {
            //pick a random direction and move that way for a bit
            if (!this.cache.doPatrol.isPatrolling) {
                this.cache.doPatrol.isPatrolling = true;
                this.cache.doPatrol.last_pos = this.p.copy();
                this.cache.doPatrol.target_pos = randomPosition(this.p)
                this.cache.doPatrol.isPatrolling = true;
                if((this.cache.doPatrol.target_pos.x  - this.p.x)>=0) this.faceRight()
                if((this.cache.doPatrol.target_pos.x  - this.p.x)<0) this.faceLeft()
                this.doMoveTo(this.cache.doPatrol.target_pos, 1).then(() => {
                    this.cache.doPatrol.timeout = setTimeout(() => {
                        this.cache.doPatrol.isPatrolling = false;
                    }, 1000)
                })
            }
        } else {
            this.isDoingPatrol = true;
            this.v.clear()
            this.a.clear()
            this.cache.doPatrol = {};
            this.cache.doPatrol.last_pos = this.p.copy();
            this.cache.doPatrol.target_pos = randomPosition(this.p)
            this.cache.doPatrol.isPatrolling = true;
            this.doMoveTo(this.cache.doPatrol.target_pos, 1).then(() => {
                this.cache.doPatrol.timeout = setTimeout(() => {
                    this.cache.doPatrol.isPatrolling = false;
                }, 1000)
            })
            return new Promise(resolve => {
                resolve()
            })
        }
    }
    stopPatrol() {
        if (this.isDoingPatrol){
            this.isDoingPatrol = false;
            if (this.isDoingMoveTo) {
                this.stopMoveTo();
                this.v.clear()
                this.a.clear()
            }
            clearTimeout(this.cache.doPatrol.timeout);
            delete this.cache.doPatrol
        } 
        return;
    }

    changeBehaviour(behaviour) {
        if (!behaviours.includes(behaviour)) {
            console.error(behaviour + ' is not a valid behaviour');
            return
        }
        behaviour = behaviour[0].toUpperCase() + behaviour.slice(1); //makes sure its in sentence case for the subroutines
        let old_behaviour = this.behaviour;
        this.behaviour = behaviour;
        console.log(behaviour)
        this['stop' + old_behaviour]();
        return new Promise(resolve => {
            this['do' + this.behaviour]().then(x => {
                console.log('doing behaviour')
                resolve(x)
            });
        })

    }

}

let previouslyTouchedLetter = {}
function loop() {
    letterDivs.forEach(x => {
        if (THINGS_ARE_DRAGGABLE) {
            if (x.y > height / 2) {
                checkLetter(x);
            }
        }
        x.update()
    })
    aliens.forEach(a => {
        if(!(previouslyTouchedLetter.isResetting || previouslyTouchedLetter.isLocked)){
            xDiff = Math.abs(previouslyTouchedLetter.p.x - a.x);
            yDiff = Math.abs(previouslyTouchedLetter.p.y - a.y);
            if(xDiff<previouslyTouchedLetter.width/2 && yDiff<previouslyTouchedLetter.height/2){
                resetLetter(previouslyTouchedLetter);
            }
        }
        a.update()
    })
   
}
MAINLOOP = setInterval(loop, 1000 / FPS)


setup().then(() => {
    previouslyTouchedLetter = letterDivs[0]
    releaseAliens()
})


