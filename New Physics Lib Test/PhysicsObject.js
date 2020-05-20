class Blank {
    constructor(x, y, w, h, mass) {
        this.origin_x = x;
        this.origin_y = y;
        this.w = w;
        this.h = h || w;
        this.mass = mass || 1;
        this.name = 'blank';
        this.p = new Vector(x, y);
        this.old_p = new Vector(x,y);
        this.old_v = new Vector(0, 0);
        this.v = new Vector(0, 0);
        this.a = new Vector(0, 0);
        this.theta = 0;

        //forces should be of class vector. if the force should be constant, add a .constant = true property to the vector.
        this.forces = [];
        this.isDrawn = true;
        this.sprite = {};
        this.hitbox = {};

        this.maxbounds = {x: width || window.innerWidth, y: height || window.innerHeight};
        this.minbounds = {x: 0, y: 0};
        this.MAX_V = 40;
        this.MAX_F = 30;
        this.V_FLOOR_LIMIT = 2.1;
        this.dead = false;
        this.fragile = false;
        this.cache = {};

        //handler for dealing with objects attached to this object
        this.attachments = {};
        this.attachment_offset = null;

        this.health = 100;
        this.dead = false;
        this.hasAntiGrav = false;
        this.hasNoSkyBox = false;
        this.hasNoBounds = false;

        this.friction_coeff = 0.1;
        this.friction_force = {};
        this.hasFriction = false;
        this.hasBounce = false;
        //TODO change to has
        this.bounce_coeff = 0.8;

        //cache is used for the subroutines to store 
        //values like speed and target distance

        this.cache = {};

        this.subroutines = ['Spin', 'MoveTo'];

        //subroutine will call a method that is
        // named .do${name}() and check with
        // .isDoing${name} 
        //the subroutine should be also acticated with that same function
        //subroutimes can callback as well, stored in cache
        this.isDoingSpin = false;
        this.isDoingMoveTo = false;

    }

    get x() {
        return this.p.x;
    }

    set x(val) {
        if (typeof val !== 'number') return;
        this.p.x = val;
    }

    get y() {
        return this.p.y;
    }

    set y(val) {
        if (typeof  val !== 'number') return;
        this.p.y = val;
    }

    get angle() {
        return this.theta
    }

    set angle(val) {
        this.theta = parseInt(val)
    }

    get hasSprite() {
        return Object.keys(this.sprite).length > 0
    }

    get hasHitbox() {
        return Object.keys(this.hitbox).length > 0
    }

    addSprite(image) {
        if (image instanceof DomObject) {
            this.sprite = image;
            this.sprite.moveTo(this.p);
            if (this.sprite.isRectangle) {
                this.hitbox = new Hitbox(this.p.x, this.p.y, this.sprite.width, this.sprite.height, true).fromCenter();
            } else {
                this.hitbox = new Hitbox(this.p.x, this.p.y, this.sprite.width / 2);
            }
        } else {
            console.error('Unsupported Format')
        }
        return this;
    }
    createHitbox(){

    }


    replaceSprite(sprite) {
        this.sprite.remove();
        this.hitbox.destroy();
        this.addSprite(sprite);
    }

    addAttachment(thing,offset){
        if(!(thing instanceof Blank)){
            console.error(`${this.name} can't attach a ${typeof thing}`);
            return;
        }
        if(this.attachmentList.includes(thing.name)){
            thing.name += '#' + this.attachmentList.reduce((sum,next)=>{
                let num = next.split('#')[1];
                if(num){
                    return sum+1;
                }
                return sum;
            },1)
        }
        if(!offset) offset = new Vector(0,0);
        thing.p = this.p.copy().add(offset);
        thing.attachment_offset = offset.copy();
        if(this.hasSprite && thing.hasSprite){
            thing.sprite.moveTo(offset.copy().add(new Vector(this.w/2,this.h/2)));
            this.sprite.attach(thing.sprite);
            thing.isDrawn = false;
        }
        this.attachments[thing.name] = thing;
        return thing;
    }

    get attachmentList(){
        return Object.keys(this.attachments);
    }

    findAttachement(name){
        if(this.attachmentList.includes(name)){
            return this.attachments[name];
        }else{
            return undefined;
        }
    }

    detachAttachment(name){
        if(this.attachmentList.includes(name)){
            let thing = this.attachments[name];
            thing.isDrawn = this.isDrawn;
            thing.attachment_offset = null;
            let sprite = thing.sprite.detach();
            DomObject.attach(sprite);
            thing.sprite.moveTo(thing.p);
            delete this.attachments[name];
        }else{
            return undefined;
        }
    }

    changeAttachementOffset(name,offset){
        if(this.attachmentList.includes(name)){
            this.attachments[name].attachment_offset = offset.copy();
            return this.attachments[name];
        }else{
            return undefined;
        }
    }

    update() {
        if(this.health<=0) this.kill();
        if(this.dead) return;
        for (let i = this.forces.length - 1; i >= 0; i--) {
            this.a.add(this.forces[i]);
            if (!this.forces[i].constant) {
                this.forces.splice(i, 1)
            }
        }
        //if(this.attachment_offset) this.p.add(this.attachment_offset);

        this.a.limit(this.MAX_F);
        this.old_v = this.v.copy();
        this.v.add(this.a);
        if (this.dynamicFrictionCheck()) {
            this.friction_force = this.v.copy().mult(this.mass) * this.friction_coeff;
            this.v.add(this.friction_force);
        }
        this.v.limit(this.MAX_V);
        //if(this.v.mag < this.V_FLOOR_LIMIT && Math.abs(this.old_v.mag - this.v.mag) <= 0.5) this.v.clear();
        this.old_p = this.p.copy();
        this.p.add(this.v.copy().add(this.old_v).div(2));
        this.a.clear();

        this.subroutines.forEach(name => {
            if (this['isDoing' + name]) this['do' + name]()
        });


        if (this.hasHitbox) {
            this.hitbox.moveTo(this.p.copy());
            this.hitbox.rotateTo(this.theta)
        }
        this.handleBounds();
        if (this.isDrawn) this.draw();

        if(this.attachmentList.length){
            this.attachmentList.forEach(name=>{
                let thing = this.attachments[name];
                thing.p.add(this.p.copy().sub(this.old_p));
                thing.angle = this.theta;
                thing.update();
                //TODO deal with rotation;
            })
        }
    }

    draw() {
        if (!this.hasSprite) return;
        this.sprite.moveTo(this.p);
        this.sprite.rotateTo(this.theta);
    }

    dynamicFrictionCheck() {
        //can be changed to only apply friction in some areas of the place;
        return this.hasFriction;
    }

    addForce(force) {
        if (force instanceof Vector) {
            if (!force.constant) force.constant = false;
            this.forces.push(force)
        } else {
            console.error("must be a vector to add force")
        }
    }

    handleBounds() {
        if(this.hasNoBounds) return;
        let paddingx = 0;
        let paddingy = 0;
        if (this.hasSprite) {
            paddingx = this.sprite.width / 2;
            paddingy = this.sprite.height / 2;
            if (paddingy ===undefined || paddingx ===undefined) console.error("issue with " + this.name + "'s sprite")
        }
        if (this.p.x + paddingx > this.maxbounds.x) {
            this.p.x = this.maxbounds.x - paddingx;
            this.v.x = this.hasBounce ? (this.v.x * -1 * this.bounce_coeff) : 0;
            if (this.fragile) this.kill()
        }
        if (this.p.y + paddingy > this.maxbounds.y) {
            this.p.y = this.maxbounds.y - paddingy;
            this.v.y = this.hasBounce ? (this.v.y * -1 * this.bounce_coeff) : 0;
            if (this.fragile) this.kill()
        }
        if (this.p.x - paddingx < this.minbounds.x) {
            this.p.x = this.minbounds.x + paddingx;
            this.v.x = this.hasBounce ? (this.v.x * -1 * this.bounce_coeff) : 0;
            if (this.fragile) this.kill()
        }
        if (this.p.y - paddingy < (this.noskybox ? -3000 : this.minbounds.y)) {
            this.p.y = this.minbounds.y + paddingy - (this.noskybox ? 3000 : 0);
            this.v.y = this.hasBounce ? (this.v.y * -1 * this.bounce_coeff) : 0;
            if (this.fragile) this.kill()
        }
    }

    kill() {
        this.health = 0;
        this.dead = true;
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
    }

    doSpin(theta, speed) {
        if (!this.isDoingSpin) {
            this.cache.doSpin = {};
            this.cache.doSpin.target = this.theta + theta;
            this.cache.doSpin.speed = speed || 1;
            this.cache.doSpin.clockwise = theta > 0;
            this.cache.doSpin.callback = {};
            this.isDoingSpin = true;
            return {
                then: (fn) => {
                    this.cache.doSpin.callback = fn;
                }
            }
        }
        let config = this.cache.doSpin;
        let hasdiff = () => {
            return config.clockwise ? (config.target > this.theta) : (config.target < this.theta)
        };
        if (hasdiff()) { //TODO can be rearanged
            this.angle = this.angle + (config.speed * (config.clockwise ? 1 : -1));
            if (!hasdiff()) this.angle = config.target
        } else {
            this.isDoingSpin = false;
            this.theta = this.theta % 360;
            let callback = undefined;
            if (typeof config.callback === 'function')  callback = config.callback;
            delete this.cache.doSpin;
            if(callback) callback();
        }
    }

    doMoveTo(vector,force) {
        if (!this.isDoingMoveTo) {
            if(!(vector instanceof Vector)){
                console.error(`${this.name} expects a vector for .doMoveTo(), recieved ${typeof vector}`);
                return;
            }
            this.cache.doMoveTo = {};
            this.cache.doMoveTo.target = vector.copy();
            this.cache.doMoveTo.force = force || this.MAX_F;
            this.isDoingMoveTo = true;
            return {
                then: (fn) => {
                    this.cache.doMoveTo.callback = fn;
                }
            }
        }
        let config = this.cache.doMoveTo;
        let dist = this.p.dist(config.target);
        if(dist>this.MAX_F){
            let targetVec = config.target.copy().sub(this.p);
            let steer = targetVec.sub(this.v).normalize().mult(config.force);
            this.forces.push(steer);
        }else{
            //so theres no bouncing, the last few pixels can be skipped
            this.p = config.target.copy();
            this.v.clear();
            this.isDoingMoveTo = false;
            let callback = undefined;
            if(typeof config.callback === 'function') callback = config.callback;
            delete this.cache.doMoveTo;
            if(callback) callback();
        }
    }

}