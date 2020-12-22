function getImage(name){
    //used primarily for testgames
    if(LOADED_IMAGES !== undefined){
        let img = LOADED_IMAGES[name];
         if(!img) console.log('cant find ' + name)
        return img
    }
    else{
        return name;
    }
}


class Character extends Blank{
    constructor(x,y,name){
        super(x,y,50,50,1);
        this.maxbounds = {x:width, y: height-100};

        this.isPoweringUp = false;
        this.power = 0;
        this.jumpMult = 30;
        this.isFacingRight = true;
        this.isShielded = false;
        this.isJumping = false;
        this.powerType = 'fire';
        this.name = name;
        this.subroutines = this.subroutines.concat(['Land']);

        this.interruptSperHop = false;
        this.isDoingLand = true;

        this.landing_emitter = new EventEmitter();
        this.unsub_landing_emmitter = this.landing_emitter.subscribe('land', this.emitLanding.bind(this));

        this.shieldTime = 8000;

        this.deathImage = {};
        this.deathImageTime = 800;
        this.shieldImage = {};
        this.projectileOffsetHeight = 0;
    }
    addDeathImage(image) {
        if(image instanceof HTMLElement) this.deathImage = image;
    }
    get hasDeathImage(){
        return this.deathImage instanceof HTMLElement;
    }
    addShieldImage(image){
        if(image instanceof HTMLElement){
            this.shieldImage = image;
            this.shieldImage.style.zIndex = this.sprite.zIndex +1 
        }else if(image instanceof DomObject){
            this.shieldImage = image.shape
            this.shieldImage.style.zIndex = this.sprite.zIndex +1 
        } 
            
    }
    get hasShieldImage(){
        return this.shieldImage instanceof HTMLElement;
    }
    faceRight() {
        if (!this.isFacingRight) {
            this.isFacingRight = true;
            if(this.hasSprite) this.sprite.flip('right')
        }
    }
    faceLeft() {
        if (this.isFacingRight) {
            this.isFacingRight = false;
            if(this.hasSprite) this.sprite.flip('left')
        }
    }
    turnAround(){
        if(this.isFacingRight){
            this.faceLeft();
        }else{
            this.faceRight();
        }
    }

    async sparHop(val) {
        if (this.dead) return;
        val = val || 1;
        return new Promise(resolve => {
            if (!this.isJumping) {
                this.jumpFwd(val);
                let unsub = this.landing_emitter.subscribe('land', () => {
                    if(!this.interruptSperHop){
                        let unsub2 = this.landing_emitter.subscribe('land', () => {
                            unsub2();
                        });
                        unsub();
                        this.jumpFwd(-1*val);
                        resolve();
                    }else{
                        unsub();
                        resolve();
                        this.interruptSperHop = false;
                    }
                })
            }
        });
    }

    hop() {
        if (this.dead) return;
        this.jumpUp(.5)

    }
    jumpUp(val) {
        if (this.dead) return;
        if (!val) val = 1;
        if (!this.isJumping) {
            this.isJumping = true;
            this.forces.push(new Vector(0, -1* this.jumpMult * val))
            console.log(this.forces)
        }
    }

    jumpFwd(val) {
        if (!val) val = 1;
        if (this.dead) return;
        if (!this.isJumping) {
            this.isJumping = true;
            let yval = this.jumpMult * -0.8;
            let xval = this.isFacingRight ? 10 : -10;
            if (val) {
                yval *= (Math.abs(val));
                xval *= val/2;
            }
            this.forces.push(new Vector(xval, yval));
        }
    }
    jumpWithAngle(theta,force) {
        if (!force) force = 1;
        if (this.dead) return;
        if (!this.isJumping) {
            this.isJumping = true;
            this.forces.push(Vector.fromAngle(theta).mult(force));
        }
    }

    jumpRight(val) {
        if (this.dead) return;
        this.faceRight();
        this.jumpFwd(val);
    }

    jumpLeft(val) {
        if (this.dead) return;
        this.faceLeft();
        this.jumpFwd(val);
    }

    emitLanding() {
        this.isJumping = false;
        this.v.x = 0;
    }


    shield() {
        if (this.isShielded) return;
        if (!this.hasShieldImage) return;
        this.isShielded = true;
        let shield = new Img(this.shieldImage.cloneNode(), this.p.x + (this.isFacingRight? this.width/4 : this.width/-4), this.p.y, this.width).fromCenter();
        setTimeout(() => {
            this.isShielded = false;
            shield.remove();
        }, this.shieldTime)
    }


    powerUp(num,power) {
        if (this.dead) return;
        power = power || this.powerType;
        if(typeof num !== 'number'){
            num = 1;
        }
        if (!this.isPoweringUp) {
            if (this.attachments[power] !== undefined) {
                this.attachments[power].kill();
                delete this.attachments[power];
            }
            let sprite_width = width/19.22
            let attack = new Flyer(this.p.x + (this.isFacingRight ? this.width : this.width / -4), this.p.y - sprite_width + this.height / 2,power);
            attack.power = num;
            attack.hasNoBounds = true;
            let atkname = power + '_projectile';
            let attack_sprite = new Img(getImage(atkname).cloneNode(), (attack.x < 0 ? 0 : attack.x), attack.y, sprite_width).fromCenter().onLoad(()=>{
                attack.addSprite(attack_sprite);
                attack_sprite.set('will-change','top,width,left');
                attack_sprite.zIndex = this.sprite.zIndex + 2
                if (this.isFacingRight) {
                    attack.faceRight();
                } else {
                    attack.faceLeft();
                }
                let offsetHeight = this.projectileOffsetHeight || this.height/5 +  this.height/-2;
                this.addAttachment(attack, this.isFacingRight? new Vector(this.width/3,offsetHeight) : new Vector(this.width/-3,offsetHeight));
                attack.doHover();

            });
         this.isPoweringUp = true;
        } else {
            if (!this.attachments[power]) {
                this.isPoweringUp = false;
            } else {
                let atk = this.attachments[power];
                atk.width += 20;
                atk.x -= 3;
                atk.y -= 10;
                atk.power += num;
            }

        }
    }


    shoot(power) {
        power = power || this.powerType;
        if (this.isPoweringUp && this.attachments[power]) {
            let atk = this.detachAttachment(power);
            atk.stopHover();
            atk.forces.push(new Vector(this.isFacingRight?atk.width/4:-atk.width/4,0));
            this.isPoweringUp = false;
            return atk;
        }
    }

    kill() {
        if (this.dead) return;
        function explode() {
            let explosion = new Img(this.deathImage, this.p.x, this.p.y, this.width).fromCenter().usingNewTransform();
            let loop = setInterval(() => {
                explosion.mod("width", this.width/30 |0);
                explosion.mod("left", this.width/-60 |0);
                explosion.mod("top", this.width/-60 |0);
            }, 16);
            setTimeout(() => {
                clearInterval(loop);
                explosion.remove();
            }, this.deathImageTime)
        }
        this.health = 0;
        this.dead = true;
        this.unsub_landing_emmitter();
        if (this.hasSprite) {
            this.sprite.remove();
        }
        if(this.hasHitbox){
            this.hitbox.destroy();
        }
        if(this.attachmentList.length){
            this.attachmentList.forEach(name=>{
                this.attachments[name].kill();
            })
        }
        this.sprite = {};

        if (this.hasDeathImage) {
            explode.apply(this);
        }
    }

    doLand(){
        if (this.isJumping && this.p.y + this.height/2 >= this.maxbounds.y) {
            this.landing_emitter.emit('land')
        }
    }
}


class Flyer extends Character{
    constructor(x,y,name){
       super(x,y,name);
       this.maxbounds = {x:width,y:height};
       this.forces = [];

       this.subroutines = this.subroutines.concat(['Oscillate', 'Hover', 'Orbit','FlyTo']);
       this.isDoingHover = false;
       this.isDoingOscillate = false;
       this.isDoingOrbit = false;
       this.isDoingFlyTo = false;
       }
       
       doHover(){
           if (this.dead) return;
           if (!this.isDoingHover) {
               this.isDoingHover = true;
               this.cache.doHover = {};
               this.cache.doHover.forces = this.forces;
               this.cache.doHover.origXY = this.p.copy();
               this.forces = [];
               this.forces.push(new Vector(0, -1));
               return({
                   then: (fn)=>{
                       this.cache.doHover.callback = fn;
                   }
               })
           }
           let config = this.cache.doHover;
           let limit = this.h/4;
           if (this.p.y - config.origXY.y < -1*limit) {
               this.y = config.origXY.y -limit;
               this.forces.push(new Vector(0,0.8));
           } else if (this.p.y - config.origXY.y > limit) {
               this.y = config.origXY.y +limit;
               this.forces.push(new Vector(0,-0.8));
           }
       }
       stopHover(){
            if(!this.isDoingHover) return;
            let config = this.cache.doHover;
            this.forces = config.forces;
            this.p = config.origXY;
            this.isDoingHover = false;
            let callback = undefined;
            if(typeof config.callback === 'function') callback = config.callback;
            delete this.cache.doHover;
            if(callback) callback();
       }
       doOscillate(target){
       
       }
       stopOscillate(){
       
       }
       doOrbit(target,speed){
           if (!this.isDoingOrbit) {
               this.cache.doOrbit = {};
               this.cache.doOrbit.forces = this.forces;
               this.cache.doOrbit.origXY = this.p.copy();
               this.cache.doOrbit.target = target.copy();
               this.cache.doOrbit.speed = speed;
               this.forces = [];
               let force = target.copy().sub(this.p).perp().set(speed);
               this.forces.push(force);
               this.isDoingOrbit = true;
           } else {
               let config = this.cache.doOrbit;
               let o = config.target;
               let d = this.p.dist(o.copy());
               let target = o.copy().sub(this.p);
               this.forces.push(target.set(config.speed / (d ** (1 / 2))));
           }
       }
       stopOrbit(){
       
       }
       doFlyTo(target, max_v){
           if (!this.isDoingFlyTo) {
               if (target instanceof Vector) {
                   this.cache.doFlyTo = {};
                   this.cache.doFlyTo.target = target.copy();
                   this.cache.doFlyTo.max_v = max_v || this.MAX_V
               } else {
                   console.error(this.name + ' cant .doFlyTo() to a' , target);
               }
               this.isDoingFlyTo = true;
               return({
                   then: (fn)=>{
                       this.cache.doFlyTo.callback = fn;
                   }
               })
           } else {
               let config = this.cache.doFlyTo;
               let dir = config.target.copy().sub(this.p);
               let distX = Math.abs(dir.x);
               let dist = config.target.dist(this.p);
               if (dist > 120 && distX>20) {
                   let target = new Vector(dir.x, dir.y - getRandom(-1) * 500);
                   let steer = target.copy().sub(this.v).set(config.max_v);
                   this.addForce(steer);
               } else if (dist<= 120 && dist > 5 && distX>20) {
                   let target = new Vector(dir.x, dir.y);
                   let steer = target.copy().sub(this.v);
                   this.addForce(steer);
               } else if (dist<= 5 && dist > 2 && distX>20) {
                   this.v = new Vector(dir.x, dir.y);
               } else if (distX<=20 && dist>5){
                    let target = new Vector(dir.x + getRandom(-1)*40, dir.y);
                  let steer = target.copy().sub(this.v).set(config.max_v);
                  this.addForce(steer);
               } else {
                   this.v.clear();
                   this.isDoingFlyTo = false;
                   let callback = undefined;
                   this.x = this.cache.doFlyTo.target.x;
                   this.y = this.cache.doFlyTo.target.y;
                   if(typeof config.callback === 'function') callback = config.callback;
                   delete this.cache.doFlyTo;
                   if(callback) callback();
               }
           }
       }
    steerTo(vector) {
        let target = vector.copy().sub(this.p);
        target.add(new Vector(Math.random() / 10, Math.random() / 10));
        target.set(this.MAX_F);
        let steer = target.copy().sub(this.v);
        if (steer.x >= 0) {
            this.faceRight()
        } else {
            this.faceLeft()
        }
        this.forces.push(steer);
    }
    pathTo(vector){
        let target = vector.copy().sub(this.p)
        target.limit(this.MAX_F);
        if (target.x >= 0) {
            this.faceRight()
        } else {
            this.faceLeft()
        }
        this.forces.push(target);
    }

}