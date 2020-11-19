let IMAGE_PATH = '../images/'; //just in case needs to be moved
let GHOSTS_IMAGE_PATH = PICTURE_CONFIG.ghosts.path;
let BACKGROUND_IMAGE_PATH = PICTURE_CONFIG.space_backgrounds.path;
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
let IS_VICTORY = false; //used to stop functions 

let valid_colors = PICTURE_CONFIG.ghosts.valid_names;
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

function setupLetters() {
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
        let p = new P(letter, 0, 0, '4em').fromCenter();
        pChar.addSprite(p)
        pChar.y -= p.height/2
        pChar.hasNoBounds = true;
        p.color = 'rgba(255,255,255,0.5)';
        p.set('textShadow','black 0 0 4px')
        letterDivs.push(pChar)
        decoy_index = i;
    })

    //decoy letters should appear outside the screen and fly in afterwards
    async function createDecoyLetters() {
        return new Promise(resolve => {
            for (let i = 0; i < (letters.length - actual_letters.length); i++) {
                let pChar = new Character(getRandom(50, width - 50), getRandom(150, height / 2), letters[decoy_index + i]);
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

                letter.sprite.shape.addEventListener('mousedown', ev => {
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
    let alien = new Alien(getRandom(100, width-100), 100, 'alien_' + color + '_' + config.behaviour);
    let alien_sprite = new Img(IMAGE_PATH + GHOSTS_IMAGE_PATH + color + getRandom(config.num) + '.png', 0, 0, 50).fromCenter().onLoad(x => {
        alien.addSprite(alien_sprite);
    });
    alien.setTarget(letterDivs[0])
    alien.changeBehaviour('idle');
    alien.defaultBehaviour = config.behaviour;
    alien._DEFAULT_MAX_F = 6*config.difficulty;
    alien._DEFAULT_MAX_V = 8*config.difficulty;
    alien.MAX_F = alien._DEFAULT_MAX_F
    alien.MAX_V = alien._DEFAULT_MAX_V
    aliens.push(alien);
}


let selected_aliens = [];
function releaseAliens() {
    selected_aliens.forEach(color=>{
        createAlien(color);
    })
}

let total_difficulty = 0;
let max_difficulty = 5;
let difficultyCounter = {};
let difficultyText = {};
function setupAliens(){
    let SPRITE_WIDTH = 45;
    let PADDING = 10;
    let TOTAL_WIDTH = (SPRITE_WIDTH + PADDING)* valid_colors.length
    let LEFT = width/2 - TOTAL_WIDTH*0.5;
    let TOP = height/1.5;
    let variety = getRandom(Object.values(valid_colors).map(color=>alien_config[color].num).reduce((a,b)=>Math.min(a,b))) //finds the smallest number of options in the config and chooses a random number at max of the value-1
    let imgs = []
    let okBtn = new Rectangle(25,25, 40,40).fromCenter();
    difficultyCounter = new LoadingBar(width/2-10,55, width/2,50,0,max_difficulty,total_difficulty).fromCenter();
    difficultyText = new P('Difficulty: ' + total_difficulty,0,0).fromCenter()
    let maxDifficultyText = new P('Max: ' + max_difficulty,0,0).fromCenter()
    difficultyText.size = '2em';
    maxDifficultyText.size = '2em';
    let slider = document.createElement('input')
    slider.setAttribute('type','range');
    document.body.appendChild(slider)
    slider.style.position = 'absolute';
    slider.setAttribute('min','0')
    slider.setAttribute('max','40')
    slider.setAttribute('value',max_difficulty)
    slider.addEventListener('input',()=>{
        let val = slider.value;
        if(total_difficulty<=val){
            max_difficulty = val
            difficultyCounter.stopVal = max_difficulty;
            difficultyCounter.value = total_difficulty;
            maxDifficultyText.string = 'Max: ' + max_difficulty;    
        }else{
            slider.value = total_difficulty;
        }
        })
    requestAnimationFrame(()=>{
        difficultyText.x = width/2 - difficultyText.width
        difficultyText.y = 105;
        maxDifficultyText.x = width/2 + difficultyText.width
        maxDifficultyText.y = 105;
        slider.style.left = maxDifficultyText.x - maxDifficultyText.width/2
        slider.style.top = 105 + maxDifficultyText.height/2
        slider.style.width = maxDifficultyText.width
    })
    difficultyCounter.type = 'range';
    difficultyCounter.setBar('backgroundColor', 'limegreen') 
    difficultyCounter.set('border','white solid 3px')
    difficultyCounter.on('10',()=>{
        difficultyCounter.setBar('backgroundColor', 'yellow') 
    })
    difficultyCounter.on('20',()=>{
        difficultyCounter.setBar('backgroundColor', 'orange') 
    })
    difficultyCounter.on('30',()=>{
        difficultyCounter.setBar('backgroundColor', 'red') 
    })
    difficultyCounter.set('transition','0.2s');
    difficultyCounter.setBar('transition','0.4s')
    difficultyCounter.set('borderRadius','20px')
    difficultyCounter.setBar('borderRadius','20px')
    let easyText = new P('← Easy',width/2- 180,height-50,'2em').fromCenter()
    let hardText = new P('Hard →',width/2 + 120,height-50,'2em').fromCenter()
    valid_colors = valid_colors.sort((a,b)=>alien_config[a].difficulty>alien_config[b].difficulty)
    valid_colors.forEach((color,i)=>{
        let img = new Img(IMAGE_PATH+ 'ghosts/' + color + variety + '.png', LEFT + (SPRITE_WIDTH+PADDING)*i, TOP,45).fromCenter().onLoad(()=>{
            let p = new P(alien_config[color].difficulty,img.x-3,img.y+img.height/2,'1em')
            imgs.push(p)
            easyText.y = img.y+ img.height + 15;
            hardText.y = img.y+ img.height + 15;
        });
        img.config = alien_config[color];
        img.shape.addEventListener('click',()=>{
            if(total_difficulty+img.config.difficulty <= max_difficulty){
                total_difficulty += img.config.difficulty;
                difficultyCounter.value = total_difficulty
                difficultyText.string = 'Difficulty: ' + total_difficulty;
                console.log(img.config.difficulty, total_difficulty);
                addAlien(color,variety)
            }else{
                difficultyCounter.set('border','red solid 3px')
                setTimeout(()=>{
                    difficultyCounter.set('border','white solid 3px')
                },500)
            }
        });
        imgs.push(img)
    })
    okBtn.color = 'limegreen';
    let ok = new P('✓',8,0)
    ok.size = '2em'
    okBtn.attach(ok)
    okBtn.set('borderRadius','50%')
    okBtn.set('border', 'green solid 4px')
    easyText.color = 'lightgreen';
    easyText.set('textShadow','black 0 0 4px');
    hardText.color = 'orange';
    hardText.set('textShadow','black 0 0 4px');
    return new Promise(resolve=>{
        okBtn.shape.addEventListener('click',()=>{
            okBtn.remove();
            imgs.forEach(img=>{
                img.remove()
            })
            difficultyCounter.remove();
            preview_divs.forEach(x=>{
                x.remove()
            })
            difficultyText.remove()
            maxDifficultyText.remove()
            easyText.remove()
            hardText.remove()
            document.body.removeChild(slider)
            resolve()
        })
    })
}
function setupBackground(){
    return new Promise(resolve=>{
        let background = 'space' + (getRandom(PICTURE_CONFIG.space_backgrounds.num)) + '.jpg';
        document.body.style.backgroundColor = 'grey';
        document.body.style.backgroundImage = 'url(' + IMAGE_PATH + BACKGROUND_IMAGE_PATH + background.toString() + ')';
        document.body.style.backgroundSize = width + 'px auto';
        document.body.style.backgroundRepeat = 'no-repeat';

        resolve()
    })
}
function addAlien(color,variety){
    variety = variety || 0;
    return new Promise((resolve,reject)=>{
        if(!valid_colors.includes(color)) return reject();
        selected_aliens.push(color)
        previewAliens(selected_aliens,variety).then(()=>{
            resolve();
        })
    })
}
function removeAlien(index,variety){
    variety = variety || 0;
    return new Promise(resolve=>{
        let color = selected_aliens.splice(index,1)
        total_difficulty-= alien_config[color].difficulty;
        if(checkObj(difficultyCounter)){
            difficultyCounter.value = total_difficulty;
            if(total_difficulty>30){
                difficultyCounter.setBar('backgroundColor','red')
            }else if(total_difficulty>20){
                difficultyCounter.setBar('backgroundColor','orange')
            }else if(total_difficulty>10){
                difficultyCounter.setBar('backgroundColor','yellow')
            }else{
                difficultyCounter.setBar('backgroundColor','limegreen')
            }
            if(checkObj(difficultyText)) difficultyText.string = 'Difficulty: ' + total_difficulty;
        }
        previewAliens(selected_aliens,variety).then(()=>{
            resolve();
        })
    })
}
let preview_divs = [];
function previewAliens(arrayOfAliens,variety){
    variety = variety || 0;
    preview_divs.forEach(x=>{
        x.remove();
    })
    preview_divs = [];
    let TOP = 50;
    let LEFT = 50;
    let PADDING = 5;
    let SPRITE_WIDTH = 25;
    let PER_ROW = 5;
    let TOTAL_WIDTH = arrayOfAliens.length*(SPRITE_WIDTH+PADDING);
    let promises = [];
    return new Promise(resolve=>{
        arrayOfAliens.forEach((color,i)=>{
            console.assert(valid_colors.includes(color), color + ' is not a valid color');
            let promise = new Promise(resolve=>{
                let img = new Img(IMAGE_PATH + GHOSTS_IMAGE_PATH + color + variety + '.png', LEFT + (PADDING+SPRITE_WIDTH)*(i%PER_ROW), TOP + (SPRITE_WIDTH*2*Math.floor(i/PER_ROW)), SPRITE_WIDTH).onLoad(()=>{
                    img.shape.addEventListener('click',()=>{
                        preview_divs.forEach(x=>{
                            x.remove();
                        })
                        preview_divs = [];
                        removeAlien(i,variety);
                    })
                    preview_divs.push(img)
                    resolve();
                })
            })
            promises.push(promise)
        })
        Promise.all(promises).then(()=>{
            resolve()
        })
    })
}

//=============== DRAGGING FUNCTIONS ================


function drag(ev) {
    letterDivs.forEach(letter => {
        if (letter.isDragging) {
            let old_p = letter.p.copy();
            let newY = (ev.clientY);
            let newX = (ev.clientX);
            if (newY > (height)) newY = height;
            if (newY < 0) newY = 0;
            if (newX > (width)) newX = width;
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
        let newY = (ev.clientY );
        let newX = (ev.clientX );
        if (newY > height) newY = height;
        if (newY < 0) newY = 0;
        if (newX > width) newX = width;
        if (newX < 0) newX = 0;
        letter.y = newY;
        letter.x = newX;
        letter.isDragging = true;
        if(!IS_VICTORY){
            aliens.forEach(a=>{
                a.setTarget(letter);
                a.changeBehaviour(a.defaultBehaviour);
            })
        }
        previouslyTouchedLetter = letter
    }
}

function drop(letter) {
    if (!letter.isLocked) {
        letter.sprite.color = 'white';
        letter.isDragging = false;
        if(!IS_VICTORY){
            aliens.forEach(a=>{
                if(!['patrol','random','scare','idle'].includes(a.defaultBehaviour.toLowerCase())){
                    a.changeBehaviour(getRandom(['random','patrol','idle']))
                }
            })
        }
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

function checkLetter(letter) { //TODO maybe refactor this to jsut check the previously touched letter
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
                x: letter.x,
                y: letter.y
            };
            if (Math.abs(line.x - pos.x) < buffer && line.y - pos.y < y_buffer) {
                actual_letters[index] = '#'
                index_to_remove = i;
                letter.isLocked = true;
                letter.isDragging = false;
                letter.sprite.color = 'limegreen';
                letter.x = line.x 
                letter.y = line.y - (letter.height/2);
                if(actual_letters.filter(x=>x!=='#').length==0){
                    IS_VICTORY = true;
                    aliens.forEach(alien=>{
                        alien.hasNoBounds = true;
                        alien.changeBehaviour('idle').then(()=>{
                            alien.stopIdle();
                            alien.doSpin(720,10);
                            alien.doMoveTo(new Vector(width/2,-500),1)

                        })
                        //last letters that arent locked must be the fake ones, so we can delete them;
                        letterDivs.forEach(letter=>{
                            if(!letter.isLocked){
                                letter.hasNoBounds = true;
                                letter.doSpin(720, 10);
                                letter.doMoveTo(new Vector(getRandom(2)? -100: width+100, height/2),1)
                            }
                        })
                    })
                }
            }
        })
        if (index_to_remove !== null) {
            speedy_check[letter.name].splice(index_to_remove, 1);
        }
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
            xDiff = Math.abs(previouslyTouchedLetter.x - a.x);
            yDiff = Math.abs(previouslyTouchedLetter.y - a.y);
            if(xDiff<previouslyTouchedLetter.width/2 && yDiff<previouslyTouchedLetter.height/2){
                resetLetter(previouslyTouchedLetter);
            }
        }
        a.update()
    })
   
}
MAINLOOP = setInterval(loop, 1000 / FPS)

setupBackground().then(()=>{
    setupAliens().then(()=>{
        setupLetters().then(() => {
            previouslyTouchedLetter = letterDivs[0]
            releaseAliens()
        })
    })
})




