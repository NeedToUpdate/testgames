class Character extends Blank{
    constructor(x,y,w,h){
        super(x,y,w,h,1);
        this.poweringup = false;
        this.health = 100;
        this.power = 0;
        this.jump_multiplier = 1;
        this.isFacingRight = true;
        this.isShielded = false;
        this.powertype = 'fire';

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
                    this.jumpbkwd(.5);
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
        }, 8000)
    }

    chase(vector) {

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

    powerup() {
        if (this.dead) return;
        if (!this.poweringup) {
            if (this.extras.attack) {
                if (this.extras.attack.sprite) {
                    this.extras.attack.sprite.destroy();
                }
                this.extras.attack.kill();
                delete this.extras.attack;
            }
            let attack = new PowerBall(this.p.x + (this.isFacingRight ? this.sprite.shape.width : this.sprite.shape.width / -4), this.p.y - 50 + this.sprite.shape.height / 2, "fire");
            attack.power = 1;
            attack.noskybox = true;
            if (attack.x < 0) {
                attack.x = 100;
                attack.p.x = 100;
            }
            let atkname = this.powertype + 'ball';
            attack.addSprite(new Img(LOADED_IMAGES[atkname].cloneNode(), (attack.x < 0 ? 0 : attack.x), attack.y, 50));
            attack.permaload = false;
            requestAnimationFrame(() => {
                attack.sprite.shape.addEventListener('click', () => {
                    console.log(attack);
                    attack.kill();
                });
                attack.sprite.set('z-index', 10000);
                if (this.isFacingRight) {
                    attack.faceright();
                } else {
                    attack.faceleft();
                }

            });
            attack.hover();
            attack.fragile = true;
            this.extras.attack = attack;
            this.poweringup = true;
        } else {
            if (!this.extras.attack) {
                this.poweringup = false;
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