// main alien class used in the alienchase game


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
        
        this.difficulty = 1;

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
                let last_move = checkObj(letter.last_move)? letter.last_move.copy().add(this.cache.doPredict.targetVector.zeroY) : this.cache.doPredict.targetVector.copy();
                this.MAX_V = mapNum(last_move.mag,0,25,this._DEFAULT_MAX_V/2,this._DEFAULT_MAX_V) //trial and error's numbers. maybe better way to figure this out
                this.MAX_F = mapNum(last_move.mag,0,25,this._DEFAULT_MAX_F/2,this._DEFAULT_MAX_F)
                let targetV = letter.p.copy().sub(last_move.mult(50).limit(150))
                this.pathTo(targetV);
            }
        }else{
            return new Promise(resolve=>{
                this.isDoingPredict = true;     
                this.cache.doPredict = {};
                this.cache.doPredict.targetVector = new Vector(getRandom(-1,1),getRandom(3,7))         
                resolve();
            })
        }
    }
    stopPredict() {
        if(this.isDoingPredict){
            this.isDoingPredict = false;
            delete this.cache.doPredict
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
                let last_move = checkObj(letter.last_move)? letter.last_move.copy().add(this.cache.doTaunt.targetVector.zeroY) : this.cache.doTaunt.targetVector.copy();
                let targetV = letter.p.copy().add(last_move.set(50-last_move.mag))
                this.MAX_V = mapNum(last_move.mag,0,25,this._DEFAULT_MAX_V/2,this._DEFAULT_MAX_V*1.2) //trial and error's numbers. maybe better way to figure this out
                this.MAX_F = mapNum(last_move.mag,0,25,this._DEFAULT_MAX_F/2,this._DEFAULT_MAX_F*1.2)
                this.pathTo(targetV);
            }
        }else{
            return new Promise(resolve=>{
                this.cache.doTaunt = {}
                this.cache.doTaunt.targetVector = new Vector(getRandom(-25,25), getRandom(4,9));
                this.isDoingTaunt = true;              
                resolve();
            })
        }
    }
    stopTaunt() {
        if(this.isDoingTaunt){
            this.isDoingTaunt = false;
            delete this.cache.doTaunt;
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
