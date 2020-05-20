class Character extends Blank{
    constructor(x,y,name){
        super(x,y,50,50,1);
        this.isPoweringUp = false;
        this.power = 0;
        this.jump_multiplier = 1;
        this.isFacingRight = true;
        this.isShielded = false;
        this.powerType = 'fire';
        this.name = name;
        this.subroutines = this.subroutines.concat(['Land'])

        this.isDoingLand = true;

        this.landing_emitter = new EventEmitter();
        this.unsub_landing_emmitter = this.landing_emitter.subscribe('land', this.emitLanding.bind(this));

        this.shieldTime = 8000;

        this.deathImage = {}
        this.shieldImage = {}
    }
    addDeathImage(image) {
        if(image instanceof HTMLElement) this.deathImage = image;
    }
    addShieldImage(image){
        if(image instanceof HTMLElement) this.shieldImage = image;
    }
    faceRight() {
        if (!this.isFacingRight) {
            this.isFacingRight = true;
            this.sprite.flip('right')
        }
    }
    faceLeft() {
        if (this.isFacingRight) {
            this.isFacingRight = false;
            this.sprite.flip('left')
        }
    }

    async sparHop() {
        if (this.dead) return;
        return new Promise(resolve => {
            if (!this.jumping) {
                this.jumpfwd(.5);
                let unsub = this.landing_emitter.subscribe('land', () => {
                    this.jumpfwd(-.5);
                    let unsub2 = this.landing_emitter.subscribe('land', () => {
                        unsub();
                        unsub2();
                    });
                    resolve();
                })
            }
        });
    }

    hop() {
        if (this.dead) return;
        if (!this.jumping) {
            this.jumping = true;
            this.forces.push(new Vector(0, -10));
        }

    }
    jumpUp(val) {
        if (this.dead) return;
        if (!val) val = 1;
        if (!this.jumping) {
            this.jumping = true;
            this.forces.push(new Vector(0, -40 * val))
        }
    }

    jumpFwd(val) {
        if (this.dead) return;
        if (!this.jumping) {
            this.jumping = true;
            let yval = -30;
            let xval = this.isFacingRight ? 10 : -10;
            if (val) {
                yval *= (Math.abs(val) / 2);
                xval += val;
            }
            this.a.add(new Vector(xval * this.jump_multiplier, yval));
        }
    }

    jumpRight() {
        if (this.dead) return;
        this.faceright();
        this.jumpfwd();
    }

    jumpLeft() {
        if (this.dead) return;
        this.faceleft();
        this.jumpfwd();
    }

    emitLanding() {
        this.jumping = false;
    }


    shield() {
        if (this.isShielded) return;
        this.isShielded = true;
        let shield = new Img(this.shieldImage.cloneNode(), this.p.x - 50, this.p.y, 300);
        shield.permaload = true;
        setTimeout(() => {
            this.isShielded = false;
            shield.destroy();
        }, this.shieldTime)
    }

    chase(vector) {
    //TODO probably can remove
        let target = vector.copy().sub(this.p);
        target.add(new Vector(Math.random() / 10, Math.random() / 10));
        target.set(this.max_v);
        let steer = target.copy().sub(this.v);
        if (steer.x >= 0) {
            this.faceright()
        } else {
            this.faceleft()
        }
        this.a.add(steer);
    }

    powerUp(power) {
        if (this.dead) return;
        power = power || this.powerType
        if (!this.isPoweringUp) {
            if (Object.keys(this.attachments[power]).length > 0) {
                this.attachments[power].kill();
                delete this.attachments[power];
            }
            let attack = new Flyer(power,this.p.x + (this.isFacingRight ? this.sprite.shape.width : this.sprite.shape.width / -4), this.p.y - 50 + this.sprite.shape.height / 2, "fire");
            attack.power = 1;
            attack.noskybox = true;
            attack.fragile = true;
            let atkname = this.powertype + '_projectile';
            attack.addSprite(new Img(LOADED_IMAGES[atkname].cloneNode(), (attack.x < 0 ? 0 : attack.x), attack.y, 50));
            requestAnimationFrame(() => {
                attack.sprite.set('z-index', 10000);
                if (this.isFacingRight) {
                    attack.faceRight();
                } else {
                    attack.faceLeft();
                }

            });
            attack.hover();
            this.addAttachment(attack, this.isFacingRight? new Vector(this.sprite.width/3,this.sprite.height/10) : new Vector(this
            sprite.width/-3,this.sprite.height/10);
            this.poweringUp = true;
        } else {
            if (!this.attachments[power]) {
                this.poweringUp = false;
            } else {
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

    shoot() {
        if (this.poweringup) {
            this.extras.attack.a.add(new Vector((this.isFacingRight ? 100 : -100), -10));
            this.poweringup = false;
        }
    }

    kill() {
        if (this.dead) return;
        this.dead = true;
        this.unsub_landing_emmitter();
        
        function explode() {
            let w = this.sprite.shape ? this.sprite.shape.width : 0;
            let h = this.sprite.shape ? this.sprite.shape.height : 0;
            let explosion = new Img(this.deathimage ? this.deathimage : LOADED_IMAGES.fire.cloneNode(), this.p.x + w / 2, this.p.y + h / 2, 1);

            let loop = setInterval(() => {
                explosion.mod("width", 6);
                explosion.mod("left", -3);
                explosion.mod("top", -3);
            }, 25);
            setTimeout(() => {
                clearInterval(loop);
                explosion.destroy();
            }, 1500)
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
        if (Object.keys(this.sprite).length > 0) {
            this.sprite.destroy();
        }
        if (Object.keys(this.rect).length > 0) {
            this.rect.destroy();
        }

        this.health = 0;
    }

    doLand(){
        if (this.jumping && this.p.y + this.h / 2 >= this.bounds.y) {
            this.landing_emitter.emit('land')
        }
    }

}


class Flyer{
    constructor(name,x,y){
       super(name,x,y)
       this.maxbounds = {x:width,y:height}
       this.forces = [];
       
       this.subroutines = this.subroutines.concat['Oscillate', 'Hover', 'Orbit','FlyTo'])
       this.isDoingHover = false;
       this.isDoingOscillate = false;
       this.isDoingOrbit = false;
       this.isDoingFlyTo = false;
       }
       
       doHover(){
       
       }
       stropHover(){
       
       }
       doOscillate(target){
       
       }
       stopOscillate(){
       
       }
       doOrbit(target){
       
       }
       stopOrbit(){
       
       }
       doFlyTo(target){
       
       }
    }
}

class GameButton extends Character {
    constructor(string, pos, color) {
        super(string,0,0);
        this.pDiv = new P(string, 0, 0);
        this.div = new Square(0, 0, 70);
        this.div.attach(this.pDiv);
        this.pos = pos;
        this.string = string;
        this.color = color;
        this.generate();
    }

    generate() {
        Object.assign(this.div.shape.style, {
            background: "rgba(215,215,255, 0.3)",
            "text-align": "center",
            border: "5px solid " + this.color,
            borderRadius: "10px",
        });
        let colors = ['darkred', 'darkgreen', 'darkgoldenrod', 'purple', 'darkblue', 'darkorange', 'darkcyan', 'darkslategray'];
        Object.assign(this.pDiv.shape.style, {
            color: getRandom(colors),
            textShadow: "white 0px 0px 5px",
            fontSize: "4em",
            fontWeight: "bold",
            margin: 0,
            position: "relative",
            top: "-5px",
        });
        let fonts = ['arial', 'sans-serif', 'italic', 'times new roman', 'cursive', 'impact'];
        this.pDiv.set('fontFamily', getRandom(fonts));
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
            let explosion = {};
            if (typeof LOADED_IMAGES !== 'undefined') {
                explosion = new Img(LOADED_IMAGES.fire.cloneNode(), this.p.x + (w + 25) / 2, this.p.y + (h + 25) / 2, 1);
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
        }

        explode.apply(this);
        this.pDiv.remove();
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
            let explosion = {};
            if (typeof LOADED_IMAGES !== 'undefined') {
                explosion = new Img(LOADED_IMAGES.stars.cloneNode(), this.p.x + (w + 25) / 2, this.p.y + (h + 25) / 2, 20);

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
        }

        explode.apply(this);
        this.pDiv.remove();
        this.div.remove();
        this.health = 0;
    }
}

class StaticGameButton extends GameButton {
    constructor(string, x, y) {
        super(string, [x, y]);
        this.p.x = x;
        this.p.y = y;
    }

    generate() {
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

        Object.assign(this.pDiv.shape.style, {
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
            this.div.set('boxShadow', 'blue 0 0 0');
            setTimeout(() => {
                    //this.div.set('border', '5px solid black')
                    this.div.set('top', pos[1] + 'px');
                    this.div.set('left', pos[0] + 'px');
                    this.div.set('boxShadow', "blue 1px 2px 2px")
                }, 200
            );
            clickHandler(string, pos);
        });
        this.addSprite(this.div)
    }
}