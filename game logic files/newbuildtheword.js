// ghosts chase the letters
// specific colurs have specific behaviours

let behaviours = ['chase','predict','taunt','scare','block', 'circle', 'idle', 'patrol']

//chase is default from other game
//predict will go to where the velocity vector is pointing
//taunt will follow nearby but never touch
//scare will run really fast into the letter but stop most of the time
//block will go in front of the letter, and just move back and forth, never touch 
//circle will circle around the letter
//idle is just hover
//patrol is to fly around the other letters <-- used as default?

//maybe start with a bomb? can kill the ghosts before they start chasing.
//they will show a thinking pattern 

difficulty = 3;
let NUM_OF_BOMBS = (3 - difficulty)< 0? 0 : (3 - difficulty); //can be adjusted
let THINGS_ARE_DRAGGABLE = false;
let chosen_word = getRandom(words)
let letters = []
let actual_letters = []
let lines = []
let aliens = []
let letterDivs = [];

function setup(){
    //perhaps get new background images
    document.body.style.backgroundColor = 'black'



    //pick a random word, and show a transparent figure of it in the final spot. but have extra letters?
    actual_letters = chosen_word.split('')
    letters = Array.from(actual_letters)
    for(let i = 0; i< difficulty;i++){
        letters.push(getRandom(alphabet.split('')))
    }
    console.log(letters,actual_letters)

    //lines should be bnear the bottom in the middle half of the screen
    let line_width = 80
    let total_width = actual_letters.length * line_width
    let line_padding = 5;
    let line_len = (total_width)/(actual_letters.length) - line_padding*2;
    let line_height = height*0.9
    for(let i = 0; i< actual_letters.length; i++){
        let line = Line.fromAngle(line_padding + (width/2 - total_width/2) + (line_len + line_padding*2)*i, line_height, line_len, 0, 4);
        line.color = 'white';
        lines.push(line);
    }
    let decoy_index = 0;
    actual_letters.forEach((letter,i)=>{
        let pChar = new Character(lines[i].x + line_len/2, line_height, letter);
        let p = new P(letter, 0,0);
        p.size = '4em'
        pChar.addSprite(p)
        pChar.y -= p.height;
        pChar.x -= p.width/2;
        pChar.hasNoBounds = true;
        p.color = 'rgba(255,255,255,0.5)'
        letterDivs.push(pChar)
        decoy_index = i;
    })

    //decoy letters should appear outside the screen and fly in afterwards
    async function createDecoyLetters(){
        return new Promise(resolve=>{
            for(let i = 0; i<(letters.length - actual_letters.length); i++){
                let pChar = new Character(getRandom(50, width-50), getRandom(50, height/2), letters[decoy_index+i]);
                let p = new P(letters[decoy_index+i], 0,0);
                p.size = '4em';
                pChar.addSprite(p)
                pChar.y -= p.height;
                pChar.x -= p.width/2;
                pChar.hasNoBounds = true;
                letterDivs.push(pChar);
            }
            setTimeout(resolve,1000)
        })
    }

    async function scatterRealLetters(){
        return new Promise(resolve=>{
            let promises = []
            letterDivs.forEach((letter,i)=>{

                letter.sprite.shape.addEventListener('click',ev=>{
                    pickup(letter,ev)
                });

                letter.sprite.shape.addEventListener('touchstart',ev=>{
                    ev = ev.touches[0]
                    pickup(letter,ev)
                });

                if(i<actual_letters.length){
                    promises.push(new Promise(resolve=>{
                        letter.doMoveTo(new Vector(getRandom(50, width-50), getRandom(50, height/2)),2).then(x=>{
                            setTimeout(()=>{
                                
                                letter.sprite.set('transition','2s');
                                letter.sprite.color = 'white';

                                setTimeout(()=>{
                                    letter.sprite.set('transition','') //need to set it back or else dragging doesnt work
                                },2100);

                                resolve();
                            },300)
                        })
                    }))
                }
            })
            Promise.all(promises).then(resolve);
        })
    }

    return new Promise(resolve=>{
        createDecoyLetters().then(()=>{
            scatterRealLetters().then(()=>{
                THINGS_ARE_DRAGGABLE = true;
                resolve()
            })
        })
    })


}

function releaseAliens(){

}

//=============== DRAGGING FUNCTIONS ================


function drag(ev) {
    letterDivs.forEach(letter => {
        if (letter.isDragging) {
            let newY = (ev.clientY - letter.height/ 2);
            let newX = (ev.clientX - letter.width / 2);
            if(newY>(height - letter.height)) newY = height - letter.height;
            if(newY<0) newY = 0;
            if(newX>(width - letter.width)) newX = width - letter.width;
            if(newX<0) newX = 0 ;
            letter.y = newY ;
            letter.x = newX ;
        }
    });
}

function pickup(letter, ev) {
    if (!letter.isLocked && !letter.isResetting) {
        letter.sprite.color = 'blue';
        let newY = (ev.clientY - letter.height/ 2);
        let newX = (ev.clientX - letter.width / 2);
        if(newY>height) newY = height;
        if(newY<0) newY = 0;
        if(newX>width) newX = width;
        if(newX<0) newX = 0;
        letter.y = newY;
        letter.x = newX;
        letter.isDragging = true;
    }
}

function drop(letter) {
    if (!letter.isLocked) {
        letter.sprite.color = 'white';
        letter.isDragging = false;
    }
}
function dropAll() {
    letterDivs.forEach(x => {
        drop(x)
    })
}

let dragging_offset = new Vector(0, 0);

document.addEventListener('mouseup',dropAll);
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

let speedy_check = {}//will cache the indices here for quicker checks

function checkLetter(letter){
    if(actual_letters.includes(letter.name)){
        if(!Object.keys(speedy_check).includes(letter.name)){
            let indicies = []
            actual_letters.forEach((x,i)=>{
                if(x == letter.name){
                    indicies.push(i);
                }
            })
            speedy_check[letter.name] = indicies;
        }
        let index_to_remove = null;
        let buffer = 20
        let y_buffer = 40
        speedy_check[letter.name].forEach((index,i)=>{
            let line = {x:lines[index].x + lines[index].width/2,y: lines[index].y};
            let pos = {x: letter.x + letter.width/2, y: letter.y + letter.height/2}; 
            if(Math.abs(line.x-pos.x) < buffer && line.y-pos.y < y_buffer){
                actual_letters[index] = '#'
                index_to_remove = i;
                letter.isLocked = true;
                letter.isDragging = false;
                letter.sprite.color = 'limegreen';
                letter.x = line.x - letter.width/2
                letter.y = line.y - (letter.height)
            }
        })
        if(index_to_remove !== null){
            speedy_check[letter.name].splice(index_to_remove,1);
        }      
    }
}



class Alien extends Flyer{
    constructor(x,y,name){
        super(x,y,name);
        this.behaviour = 'Idle';
        this.subroutines = this.subroutines.concat(['Chase','Predict','Taunt','Scare','Block', 'Circle', 'Idle', 'Patrol']);
        this.isDoingChase = false;
        this.isDoingPredict = false;
        this.isDoingTaunt = false;
        this.isDoingScare = false;
        this.isDoingBlock = false;
        this.isDoingCircle = false;
        this.isDoingIdle = false;
        this.isDoingPatrol = false;
    }

    doChase(){
        console.log('doChase isnt implemented yet')
    }
    stopChase(){
        console.log('stopChase isnt implemented yet')
    }
    doPredict(){
        console.log('doPredict isnt implemented yet')
    }
    stopPredict(){
        console.log('stopPredict isnt implemented yet')
    }
    doTaunt(){
        console.log('doTaunt isnt implemented yet')
    }
    stopTaunt(){
        console.log('stopTaunt isnt implemented yet')
    }
    doScare(){
        console.log('doScare isnt implemented yet')
    }
    stopScare(){
        console.log('stopScare isnt implemented yet')
    }
    doBlock(){
        console.log('doBlock isnt implemented yet')
    }
    stopBlock(){
        console.log('stopBlock isnt implemented yet')
    }
    doCircle(){
        console.log('doCircle isnt implemented yet')
    }
    stopCircle(){
        console.log('stopCircle isnt implemented yet')
    }
    doIdle(){
        if(this.isDoingIdle){

        }else{
            this.isDoingIdle = true;
            return new Promise(resolve=>{
                this.doHover();
                resolve();
            })
        }
    }
    stopIdle(){
        if(!this.isDoingIdle) return;
        this.isDoingIdle = false;
        this.stopHover();
        this.v.clear();
        this.a.clear();
    }
    doPatrol(){
        function randomPosition(pos){
            let step_size = getRandom(3)*50 + 150
            let poss = [0,1,2,3];
            if(pos.x<step_size){
                poss.splice(poss.indexOf(1),1)
            }
            if(pos.x>width-step_size){
                poss.splice(poss.indexOf(3),1)
            }
            if(pos.y<step_size){
                poss.splice(poss.indexOf(0),1)
            }
            if(pos.y>height-step_size){
                poss.splice(poss.indexOf(2),1)
            }
            let dir = getRandom(poss); //0 up, 1 left, 2 down 3 right
            switch(dir){
                case 0:
                    return pos.copy().add(new Vector(0,-step_size))
                case 1:
                    return pos.copy().add(new Vector(-step_size,0))
                case 2:
                    return pos.copy().add(new Vector(0,step_size))
                case 3:
                    return pos.copy().add(new Vector(step_size,0))
            }
        }
        if(this.isDoingPatrol){
            //pick a random direction and move that way for a bit
            if(!this.cache.doPatrol.isPatrolling){
                this.cache.doPatrol.isPatrolling = true;
                this.cache.doPatrol.last_pos = this.p.copy();
                this.cache.doPatrol.target_pos = randomPosition(this.p)
                this.cache.doPatrol.isPatrolling = true;
               
                this.doMoveTo(this.cache.doPatrol.target_pos,1).then(()=>{
                    this.cache.doPatrol.timeout = setTimeout(()=>{
                        this.cache.doPatrol.isPatrolling = false;
                    },1000)
                })
            }
        }else{
            this.isDoingPatrol = true;
            this.v.clear()
            this.a.clear()
            this.cache.doPatrol = {};
            this.cache.doPatrol.last_pos = this.p.copy();
            this.cache.doPatrol.target_pos = randomPosition(this.p)
            this.cache.doPatrol.isPatrolling = true;
            this.doMoveTo(this.cache.doPatrol.target_pos,1).then(()=>{
                this.cache.doPatrol.timeout = setTimeout(()=>{
                    this.cache.doPatrol.isPatrolling = false;
                },1000)
            })
            return new Promise(resolve=>{
                resolve()
            })
        }
    }
    stopPatrol(){
        if(!this.isDoingPatrol) return;
        this.isDoingPatrol = false;
        if(this.isDoingMoveTo){
            this.stopMoveTo();
            this.v.clear()
            this.a.clear()
        }
        clearTimeout(this.cache.doPatrol.timeout);
        delete this.cache.doPatrol
    }

    changeBehaviour(behaviour){
        if(!behaviours.includes(behaviour)){
            console.error(behaviour + ' is not a valid behaviour');
            return
        }
        behaviour = behaviour[0].toUpperCase() + behaviour.slice(1); //makes sure its in sentence case for the subroutines
        let old_behaviour = this.behaviour;
        this.behaviour = behaviour;
        console.log(behaviour)
        this['stop' + old_behaviour]();
        return new Promise(resolve=>{
            this['do' + this.behaviour]().then(x=>{
                resolve(x)
            });
        })
       
    }

}

let alien = new Alien(100,100,'test_alien');
let alien_sprite = new Img('../images/invaders/invaderpurple.png',0,0,50).onLoad(x=>{
    alien.addSprite(alien_sprite);
});
aliens.push(alien);

function loop(){
    letterDivs.forEach(x=>{
        if(THINGS_ARE_DRAGGABLE){
            if(x.y>height/2){
                checkLetter(x);
            }
        }
        x.update()
    })
    aliens.forEach(x=>{
        x.update()
    })

}
setInterval(loop, 1000/FPS)


setup().then(()=>{
    releaseAliens()
})