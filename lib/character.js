class Character {
    constructor(x, y, name) {
        this.x = x;
        this.y = y;
        this.w = 100;
        this.h = 100;
        this.name = name;
        this.sprite = {};
        this.rect = {};
        this.a = new Vector(0, 0);
        this.v = new Vector(0, 0);
        this.old_v = new Vector(0, 0);
        this.p = new Vector(x, y);
        this.forces = [new Vector(0, 1),];
        this.being_drawn = true;
        this.bounds = {x: 1000, y: height - 200};
        this.minbounds = {x: 0, y: 0};
        this.max_v = 40;
        this.max_f = 30;
        this.poweringup = false;
        this.dead = false;
        this.fragile = false;
        this.cache = {};
        this.extras = {};
        this.health = 100;
        this.power = 0;
        this.jump_multiplier = 1;
        this.facing_right = true;
        this.shielded = false;
        this.powertype = 'fire';
        this.antigrav = false;
        this.noskybox = false;
        this.nobounds = false;
        this.landing_emitter = new EventEmitter();
        this.unsub_landing_emmitter = this.landing_emitter.subscribe('land', this.emit_landing.bind(this))
        this.isjumping = false;
        this.spinning = false;
        this.spinning_half = false;
        this.angle = 0;
    }

    setsize(w,h){
        this.w = w;
        this.h = h? h:-1;
    }
    addSprite(sprite) {

        requestAnimationFrame(() => {
            this.sprite = sprite;
            createRect.apply(this);

        });

        function createRect() {
            requestAnimationFrame(() => {
                if (sprite.shape.height === 0) {
                    createRect.apply(this);
                } else {
                    this.rect = new Rect(this.p.x, this.p.y, sprite.shape.width, sprite.shape.height);
                    this.rect.moveTo(this.p);
                    this.w = this.sprite.shape.width;
                    this.h = this.sprite.shape.height;
                }
            });
        }
    }


    //movement
    spin(val) {
        let angle = this.angle;
        function spinanim() {

            let innerloop = (now) => {
                angle += (10);
                this.angle = angle
                this.sprite.shape.style.transform = "rotate(" + angle + "deg)" + (this.facing_right ? '' : ' scaleX(-1)');
                start = now;
                if(angle>=360 || this.dead){
                    this.sprite.shape.style.transform = this.facing_right ? '' : ' scaleX(-1)';
                    this.spinning = false;
                }else{

                }

            };
           innerloop()

        }

        if (!this.spinning && !this.spinning_half) {
            this.spinning = true;
            this.sprite.shape.style.transformOrigin = "center";
            spinanim.apply(this)
        }else if(this.spinning && !this.spinning_half){
            spinanim.apply(this)
        }
    }
    spinhalf(){
        let angle = this.angle;
        function spinanim() {
            let anglestart = 0;
            if(this.sprite.shape.style.transform !== ""){
               let n= parseInt(this.sprite.shape.style.transform.replace(/[rotate(|)]/gi, ""));
                if(typeof n === "number"){
                    anglestart = n;
                }
            }
            let innerloop = () => {
                angle += 10;
                this.sprite.shape.style.transform = "rotate(" + angle + "deg)" + (this.facing_right ? '' : ' scaleX(-1)');
                this.angle = angle
                if(angle>=180 || this.dead){
                    this.sprite.shape.style.transform = "rotate(" + angle + "deg)" + (this.facing_right ? '' : ' scaleX(-1)');
                    this.spinning_half = false;
                    this.angle = angle
                }
            };
            let innerloop360 = () => {
                angle += 10;
                this.sprite.shape.style.transform = "rotate(" + angle + "deg)" + (this.facing_right ? '' : ' scaleX(-1)');
                this.angle = angle
                if(angle>=360 || this.dead){
                    this.sprite.shape.style.transform = "rotate(" + angle + "deg)" + (this.facing_right ? '' : ' scaleX(-1)');
                    this.spinning_half = false;
                    this.angle = 0
                }
            };
            if(angle<180){
                innerloop()
            }else{
                innerloop360()
            }


        }

        if (!this.spinning_half && !this.spinning) {
            this.spinning_half = true;
            this.sprite.shape.style.transformOrigin = "center";
            spinanim.apply(this)
        }else if(this.spinning_half && !this.spinning){
            spinanim.apply(this)
        }
    }
    faceright(){
        if(!this.facing_right){
            this.facing_right = true;
            this.sprite.set('transform', '')
        }
    }
    faceleft(){
        if(this.facing_right){
            this.facing_right = false;
            this.sprite.set('transform', 'scaleX(-1)')
        }

    }
    hop() {
        if(this.dead) return;
        if (!this.isjumping) {
            this.isjumping = true;
            this.a.add(new Vector(0, -10));
        }

    }
    async sparhop(){
        if(this.dead) return;
        return new Promise(resolve => {
            if (!this.isjumping) {
                this.jumpfwd(.5);
                let unsub = this.landing_emitter.subscribe('land',()=>{
                    this.jumpbkwd(.5);
                    let unsub2 = this.landing_emitter.subscribe('land',()=> {
                        unsub();
                        unsub2();
                    });
                    resolve();
                })
            }
        });

    }
    jump() {
        if(this.dead) return;
        if (!this.isjumping) {
            this.isjumping = true;
            this.a.add(new Vector(0, -40))
        }
    }

    jumpfwd(val){
        if(this.dead) return;
        if (!this.isjumping) {
            this.isjumping = true;
            let yval = -30;
            let xval = this.facing_right?10:-10;
            if(val){
                yval *=(val/2);
                xval +=val;
            }
            this.a.add(new Vector(xval * this.jump_multiplier, yval));
        }
    }
    jumpbkwd(val){
        if(this.dead) return;
        if (!this.isjumping) {
            this.isjumping = true;
            let yval = -30;
            let xval = this.facing_right?-10:10;
            if(val){
                yval *=(val/2);
                xval +=val;
            }
            this.a.add(new Vector(xval * this.jump_multiplier, yval));
        }
    }
    jumpright() {
        if(this.dead) return;
        this.faceright();
        this.jumpfwd();
    }

    jumpleft() {
        if(this.dead) return;
        this.faceleft();
        this.jumpfwd();
    }

    emit_landing(){
        this.isjumping = false;
    }

    update() {

        if (this.health <= 0 && !this.dead) this.kill();
        if (this.dead) return;
        let old_p = this.p.copy();
        this.old_v = this.v.copy();
        this.a.limit(this.max_f)
        this.v.add(this.a);
        if(!this.antigrav){
            this.forces.forEach(force => {
                this.v.add(force);
            });
        }
        let dv = this.v.copy().add(this.old_v).div(2).limit(this.max_v);
        this.v = dv;
        this.p.add(dv);
        //this.p.log();
        this.a.clear();
        if(!this.nobounds){
            this.checkBounds();
        }
        this.updateRect();
        if(this.isjumping && this.p.y + this.h/2 >= this.bounds.y){
            this.landing_emitter.emit('land')
        }

        let diff_p = this.p.copy().sub(old_p);
        if (Object.keys(this.extras).length > 0) {
            Object.keys(this.extras).forEach(x => {
                this.extras[x].p.add(diff_p);
                this.extras[x].x += diff_p.x;
                this.extras[x].y += diff_p.y;
                this.extras[x].update();
            });
        }
        if(this.spinning){
            this.spin();
        }
        if(this.spinning_half){
            this.spinhalf()
        }
        if (this.being_drawn) {
            this.draw();
        }
    }

    updateRect() {
        if(this.dead) return;
        if (Object.keys(this.rect).length < 1) return;
        this.rect.moveTo(this.p);
        if (this.sprite.shape.height !== this.rect.h) {
            this.rect.modHeight(this.sprite.shape.height - this.rect.h);
        }
        if (this.sprite.shape.width !== this.rect.w) {
            this.rect.modWidth(this.sprite.shape.width - this.rect.w);
        }
    }

    checkBounds() {
        let paddingx = 0;
        let paddingy = 0;
        if (Object.keys(this.sprite).length > 0) {
            paddingx = this.sprite.shape.width / 2;
            paddingy = this.sprite.shape.height / 2;
            if(!paddingy) paddingy = this.sprite.shape.offsetHeight/2
            if(!paddingx) paddingx = this.sprite.shape.offsetWidth/2
        } else {

        }
        if (this.p.x > this.bounds.x - paddingx) {
            this.p.x = this.bounds.x - paddingx;
            this.v.x = 0;
            if (this.fragile) this.kill()
        }
        if (this.p.y > this.bounds.y - paddingy) {
            this.p.y = this.bounds.y - paddingy;
            this.v.y = 0;
            this.v.x = 0;

            if (this.fragile) this.kill()
        }
        if (this.p.x + paddingx*2 < this.minbounds.x) {
            this.p.x = this.minbounds.x-paddingx;
            this.v.x = 0;
            if (this.fragile) this.kill()
        }
        if (this.p.y + paddingy < (this.noskybox? -3000 : this.minbounds.y)) {
            this.p.y = this.minbounds.y- paddingy - (this.noskybox? 3000 : 0);

            this.v.y = 0;
            if (this.fragile) this.kill()
        }

    }

    draw() {
        if (Object.keys(this.sprite).length < 1) {
            return undefined;
        }
        this.sprite.set("left", this.p.x);
        this.sprite.set("top", this.p.y);
    }
    shield(){
        if(this.shielded) return;
        this.shielded = true;
        let shield = new Img(LOADED_IMAGES.shield.cloneNode(), this.p.x -50, this.p.y, 300);
        shield.permaload = true;
        setTimeout(()=>{
            this.shielded = false;
            shield.destroy();
        },8000)
    }


    chase(vector){

            let target = vector.copy().sub(this.p);
            target.add(new Vector(Math.random()/10, Math.random()/10))
            target.set(this.max_v)
            let steer = target.copy().sub(this.v)
        if(steer.x>=0){
            this.faceright()
        }else{
            this.faceleft()
        }
            this.a.add(steer);


    }

    powerup() {
        if(this.dead) return;
        if (!this.poweringup) {
            if(this.extras.attack) {
                if(this.extras.attack.sprite){
                    this.extras.attack.sprite.destroy();
                }
                this.extras.attack.kill();
                delete this.extras.attack;
            };
            let attack = new PowerBall(this.p.x + (this.facing_right ? this.sprite.shape.width : this.sprite.shape.width/-4), this.p.y - 50 + this.sprite.shape.height/2, "fire");
            attack.power = 1;
            attack.noskybox = true;
            if(attack.x<0) {
                attack.x = 100;
                attack.p.x =100;
            }
            let atkname = this.powertype + 'ball';
            attack.addSprite(new Img(LOADED_IMAGES[atkname].cloneNode(), (attack.x<0?0:attack.x), attack.y, 50));
            attack.permaload = false;
            requestAnimationFrame(()=>{
                attack.sprite.shape.addEventListener('click', ()=>{
                   console.log(attack);
                    attack.kill();
                });
                attack.sprite.set('z-index', 10000);
                if(this.facing_right){ attack.faceright();
                }else{
                    attack.faceleft();
                }

            });
            attack.hover();
            attack.fragile = true;
            this.extras.attack = attack;
            this.poweringup = true;
        } else {
            if(!this.extras.attack) this.poweringup = false;
            let atk = this.extras.attack;
            atk.sprite.mod("width", 20);
            atk.sprite.mod("top", -10);
            atk.sprite.mod("left", -10);
            atk.p.x -= 10;
            atk.p.y -= 10;
            atk.x -= 10;
            atk.y -= 10;
            atk.power += 7;
        }
    }

    shootright() {
        if (this.poweringup) {
            this.extras.attack.a.add(new Vector(100, -10));
            this.poweringup = false;
        }
    }

    shootleft() {
        if (this.poweringup) {
            this.extras.attack.a.add(new Vector(-100, -10));
            this.poweringup = false;
        }
    }

    shoot(){
        if (this.poweringup) {
            this.extras.attack.a.add(new Vector((this.facing_right?100:-100), -10));
            this.poweringup = false;
        }
    }

    kill() {
        if (this.dead) return;
        this.dead = true;
        this.unsub_landing_emmitter();
        function explode() {
            let w = this.sprite.shape? this.sprite.shape.width : 0;
            let h = this.sprite.shape? this.sprite.shape.height : 0;
            let explosion = new Img(LOADED_IMAGES.fire.cloneNode(), this.p.x + w / 2, this.p.y +  h/ 2, 1);

            let loop = setInterval(() => {
                explosion.mod("width", 6);
                explosion.mod("left", -3);
                explosion.mod("top", -3);
            }, 15);
            setTimeout(() => {
                clearInterval(loop);
                explosion.destroy();
            }, 2000)
        }

        if (!this.fragile) {
            explode.apply(this);
        }
        if (this.poweringup) {
            if (this.extras.attack) {
                this.extras.attack.kill();
            }

            this.poweringup = false;
        }
        if(Object.keys(this.sprite).length>0){
            this.sprite.destroy();
            this.rect.destroy();
        }

        this.health = 0;
    }
}

class PowerBall extends Character{
    constructor(x , y, name){
        super(x,y,name);
        this.oscillating = false;
        this.oscillation_dist = 0;
        this.orbiting = false;
        this.hovering = false;
    }

    oscillate(vector, dist){
        if(!this.oscillating){
            this.x = this.p.x;
            this.y = this.p.y;
            this.a.add(vector.copy() || new Vector(0,10));
            this.oscillation_dist = dist || 10
            this.oscillating = true;
            this.antigrav = true;
        }else{
            let o = new Vector (this.x,this.y);
            let d = this.p.dist(o.copy());
            if(d> this.oscillation_dist){
                this.a.add(o.copy().sub(this.p).div(10));
            }
        }
    }
    orbit(vector){
        if(!this.orbiting){
            this.x = this.p.x;
            this.y = this.p.y;
            this.a.add(vector.copy() || new Vector(0,10));
            this.p.add(vector.copy() || new Vector(0,10));
            this.a.add(vector.copy().perp() || new Vector(-10, 0))
            this.orbiting = true;
            this.antigrav = true;
        }else{
            let o = new Vector (this.x,this.y);
            let d = this.p.dist(o.copy());
            let target = o.copy().sub(this.p)
            this.a.add(target.set(5/(d**(1/2))));
        }
    }
    hover() {
        if(this.dead) return;
        if (!this.hovering) {
            this.x = this.p.x;
            this.y = this.p.y;
            this.hovering = true;
            this.a.add(new Vector(0, -1));
            this.bounds.y += 10000;
            this.cache.forces = this.forces;
            this.forces = [];
        }
        if (this.p.y - this.y < -10) {
            this.a.y = 1;
        } else if (this.p.y - this.y > 10) {
            this.a.y = -1;
        }
    }

    stophover() {
        if (this.hovering) {
            this.p.x = this.x;
            this.p.y = this.y;
            this.v.clear();
            this.a.clear();
            this.hovering = false;
            this.bounds.y -= 10000;
            this.forces = this.cache.forces;
        }
    }
    update() {
        if (this.dead) return
        if (this.health <= 0) this.kill();
        if (this.hovering) {
            this.hover();
        }
        if (this.oscillating) {
            this.oscillate();
        }
        if(this.orbiting){
            this.orbit()
        }
        let old_p = this.p.copy();
        this.old_v = this.v.copy();
        this.v.add(this.a);
        if(!this.antigrav){
            this.forces.forEach(force => {
                this.v.add(force);
            });
        }

        let dv = this.v.copy().add(this.old_v).div(2);
        dv.limit(this.max_v);
        this.p.add(dv);
        //this.p.log();
        this.v = dv.copy();
        this.a.clear();
        if(!this.nobounds){
            this.checkBounds();
        }

        this.updateRect();

        let diff_p = this.p.copy().sub(old_p);

        if (Object.keys(this.extras).length > 0) {
            Object.keys(this.extras).forEach(x => {
                this.extras[x].p.add(diff_p);
                this.extras[x].x += diff_p.x;
                this.extras[x].y += diff_p.y;
                this.extras[x].update();
            });
        }
        if (this.being_drawn) {
            this.draw();
        }
    }
}

class GameButton extends Character {
    constructor(string, pos) {
        super(0, 0, string);
        this.par = new P(string, 0, 0);
        this.div = new Div(0, 0, 'blue', 70, 70, true);
        this.div.shape.append(this.par.shape);
        this.pos = pos;
        this.string = string;
        this.antigrav = false;
        this.nobounds = false;
        this.bounds.x = width;
        this.generate();
    }

    generate() {
        Object.assign(this.div.shape.style, {
            background: "rgba(215,215,255, 0.3)",
            "text-align": "center",
            border: winner ? "5px solid limegreen" : "5px solid white",
            borderRadius: "10px",
        });

        Object.assign(this.par.shape.style, {
            color: getRandom(colors),
            textShadow: "white 0px 0px 5px",
            fontSize: "4em",
            fontWeight: "bold",
            margin: 0,
            position: "relative",
            top: "-5px",
        });
        let [string, pos] = [this.string, this.pos];
        let fonts = ['arial', 'sans-serif', 'italic', 'times new roman', 'cursive', 'impact']
        this.par.set('fontFamily', getRandom(fonts))
        this.div.shape.addEventListener('click', () => {
            if(Math.random()<0.05){
                if(Math.random()<0.5) {
                    this.jumpright();
                }else {

                    this.jumpleft();
                }
            }else{
                clickHandler(string, pos);
            }

        })
        this.addSprite(this.div)

    }

    set(attr, val) {
        if (attr === 'top') {
            this.p.y = parseInt(val);
            this.bounds.y = this.p.y + 40
        }
        if (attr === 'left') {
            this.p.x = parseInt(val);
        }
        this.div.set(attr, val);
    }

    kill() {
        if (this.dead) return;
        this.dead = true;
        this.unsub_landing_emmitter();

        function explode() {
            let w = 20;
            let h = 20;
            let explosion = new Img(LOADED_IMAGES.fire.cloneNode(), this.p.x + (w + 25) / 2, this.p.y + (h + 25) / 2, 1);

            let loop = setInterval(() => {
                explosion.mod("width", 4);
                explosion.mod("left", -2);
                explosion.mod("top", -2);
            }, 15);
            setTimeout(() => {
                clearInterval(loop);
                explosion.destroy();
            }, 500)
        }

        explode.apply(this);
        this.par.remove();
        this.div.remove();
        this.health = 0;
    }

    correctkill() {
        if (this.dead) return;
        this.dead = true;
        this.unsub_landing_emmitter();

        function explode() {
            let w = 20;
            let h = 20;
            let explosion = new Img(LOADED_IMAGES.stars.cloneNode(), this.p.x + (w + 25) / 2, this.p.y + (h + 25) / 2, 20);
            let loop = setInterval(() => {
                explosion.mod("width", 4);
                explosion.mod("left", -2);
                explosion.mod("top", -2);
            }, 15);
            setTimeout(() => {
                clearInterval(loop);
                explosion.destroy();
            }, 500)
        }

        explode.apply(this);
        this.par.remove();
        this.div.remove();
        this.health = 0;
    }
}

class StaticGameButton extends GameButton{
    constructor(string,x,y){
        super(string,[x,y]);
        this.p.x = x;
        this.p.y = y;
    }
    generate(){
        Object.assign(this.div.shape.style, {
            position: 'absolute',
            background: "white",
            "text-align": "center",
            border: "5px solid darkgrey",
            borderRadius: "10px",
            boxShadow: "blue 1px 2px 2px",
            top: this.pos[1] + 'px',
            left: this.pos[0] + 'px'
        });

        Object.assign(this.par.shape.style, {
            color: 'transparent',
            textShadow: "rgba(255,255,255,0.5) 2px 2px 3px",
            fontSize: "4em",
            fontWeight: "bold",
            margin: 0,
            position: "relative",
            top: "-5px",
            "background-clip": "text",
            "-moz-background-clip": "text",
            "-webkit-background-clip": "text",
            backgroundColor: "blue"
        });
        let [string, pos] = [this.string, this.pos];
        this.div.shape.addEventListener('click', () => {
           // this.div.set('border', '5px solid blue');
            this.div.set('top', pos[1] + 2 + 'px');
            this.div.set('left', pos[0] + 2 + 'px');
            this.div.set('boxShadow', 'blue 0 0 0')
            setTimeout(()=>{
                //this.div.set('border', '5px solid black')
                    this.div.set('top', pos[1]+ 'px');
                    this.div.set('left', pos[0] +  'px');
                    this.div.set('boxShadow',  "blue 1px 2px 2px")
            },200
            );
            clickHandler(string, pos);
        });
        this.addSprite(this.div)
    }
}