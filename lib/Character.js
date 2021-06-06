function getImage(name) {
  //used primarily for testgames
  if (LOADED_IMAGES !== undefined) {
    let img = LOADED_IMAGES[name];
    if (!img) console.log("cant find " + name);
    return img;
  } else {
    return name;
  }
}

class Character extends Blank {
  constructor(x, y, name) {
    super(x, y, 50, 50, 1);
    this.maxbounds = { x: width, y: height - 100 };

    this.isPoweringUp = false;
    this.power = 0;
    this.jumpMult = 30;
    this.isFacingRight = true;
    this.isShielded = false;
    this.isCurrentlyJumping = false;
    this.powerType = "fire";
    this.name = name;
    this.subroutines = this.subroutines.concat(["Land", "Jump"]);

    this.interruptSparHop = false;
    this.isDoingLand = true;
    this.isDoingJump = false;
    this.jumpQueue = [];
    //jump queue should contain a value that is a object, with a value property descripbing the jump amount, and an event property describing who sent the queue
    this.isDoingSparHop = false;

    this.landing_emitter = new EventEmitter();
    this.unsub_landing_emmitter = this.landing_emitter.subscribe("land", this.emitLanding.bind(this));

    this.shieldTime = 8000;

    this.deathImage = {};
    this.deathImageTime = 800;
    this.shieldImage = {};
    this.projectileOffsetHeight = 0;

    this.scale = 1; //TODO add scaling as a method
    this.attackScale = 1;
  }
  addDeathImage(image) {
    if (image instanceof HTMLElement) this.deathImage = image;
  }
  get hasDeathImage() {
    return this.deathImage instanceof HTMLElement;
  }
  addShieldImage(image) {
    if (image instanceof HTMLElement) {
      this.shieldImage = image;
      this.shieldImage.style.zIndex = this.sprite.zIndex + 1;
    } else if (image instanceof DomObject) {
      this.shieldImage = image.shape;
      this.shieldImage.style.zIndex = this.sprite.zIndex + 1;
    }
  }
  get hasShieldImage() {
    return this.shieldImage instanceof HTMLElement;
  }
  faceRight() {
    if (!this.isFacingRight) {
      this.isFacingRight = true;
      if (this.hasSprite) this.sprite.flip("right");
    }
  }
  faceLeft() {
    if (this.isFacingRight) {
      this.isFacingRight = false;
      if (this.hasSprite) this.sprite.flip("left");
    }
  }
  turnAround() {
    if (this.isFacingRight) {
      this.faceLeft();
    } else {
      this.faceRight();
    }
  }

  async sparHop(val) {
    if (this.isDoingSparHop) return;
    if (this.dead) return;
    val = val || 1;
    return new Promise((resolve) => {
      if (!this.isDoingJump) {
        //TODO
        this.doJump(val);
        this.isDoingSparHop = true;
        let unsub = this.landing_emitter.subscribe("land", () => {
          if (!this.interruptSparHop) {
            //needed to interrupt it
            //sparhop continues to jump back
            //oh no we're still jumping tho cause of something else
            this.jumpQueue.push({ event: "sparhopjumpback", value: -1 * val });
            let jumpBackUnsub = this.landing_emitter.subscribe("sparhopjumpback", () => {
              jumpBackUnsub();
              // console.log('JUMP BACK')
              let jumpBackLandUnsub = this.landing_emitter.subscribe("land", () => {
                jumpBackLandUnsub();
                resolve();
                this.isDoingSparHop = false;
              });
            });
            unsub();
          } else {
            //sparhop interupted, dont jump back
            unsub();
            resolve();
            this.interruptSparHop = false;
            this.isDoingSparHop = false;
          }
        });
      } else {
        //perhaps ignore it if wee starting the sparhop
      }
    });
  }

  hop() {
    if (this.dead) return;
    this.jumpUp(0.5);
  }
  jumpUp(val) {
    if (this.dead) return;
    if (!val) val = 1;
    if (!this.isDoingJump) {
      this.doJump(val, 0);
    }
  }

  doJump(val, angle) {
    if (this.dead) return;
    if (this.isCurrentlyJumping) return;
    if (this.isDoingJump) {
      this.isCurrentlyJumping = true;
      let yval = this.jumpMult * -0.8;
      let xval = this.isFacingRight ? 10 : -10;
      // console.log('commiting the jump',this.cache.doJump)
      let config = this.cache.doJump;
      if (config.val) {
        if (config.angle === undefined) {
          yval *= Math.abs(config.val);
          xval *= config.val / 2;
          this.forces.push(new Vector(xval, yval));
        } else {
          this.forces.push(Vector.fromAngle(config.angle).mult(config.val));
        }
      }
      // console.log(this.forces[1])
      let unsub = this.landing_emitter.subscribe("land", () => {
        if (this.jumpQueue.length) {
          let lastVal = this.jumpQueue.shift();
          // console.log('landed and have a jump in the queue', lastVal)
          this.doJump(lastVal.value, lastVal.angle);
          this.landing_emitter.emit(lastVal.event);
        }
        unsub();
      });
      delete this.cache.doJump;
      this.isDoingJump = false;
      return;
    } else {
      if (!val) val = 1;
      // console.log('jump scheduled')
      this.isDoingJump = true;
      this.cache.doJump = {};
      this.cache.doJump.val = val;
      this.cache.doJump.angle = angle;
    }
  }
  jumpWithAngle(theta, force) {
    if (!force) force = 1;
    if (this.dead) return;
    this.doJump(force, theta);
  }

  jumpRight(val) {
    if (this.dead) return;
    this.faceRight();
    this.doJump(val);
  }

  jumpLeft(val) {
    if (this.dead) return;
    this.faceLeft();
    this.doJump(val);
  }

  emitLanding() {
    this.isCurrentlyJumping = false;
    this.v.x = 0;
  }

  shield(shieldTime) {
    if (this.isShielded) return;
    if (!this.hasShieldImage) return;
    this.isShielded = true;
    this.shieldTime = shieldTime * 1000 || 8000;
    let shield = new Img(this.shieldImage.cloneNode(), this.p.x + (this.isFacingRight ? (this.width * this.scale) / 4 : (this.width * this.scale) / -4), this.p.y, this.width * this.scale).fromCenter();
    setTimeout(() => {
      this.isShielded = false;
      shield.remove();
    }, this.shieldTime);
  }

  powerUp(num, power) {
    if (this.dead) return;
    power = power || this.powerType;
    if (typeof num !== "number") {
      num = 1;
    }
    if (!this.isPoweringUp) {
      this.isPoweringUp = true;
      if (this.attachments[power] !== undefined) {
        this.attachments[power].kill();
        delete this.attachments[power];
      }
      let sprite_width = (width / 19.22) * this.scale * this.attackScale;
      let attack = new Flyer(this.p.x + (this.isFacingRight ? this.width / 4 : this.width / -4), this.p.y - sprite_width + this.height / 2, power);
      attack.power = num;
      attack.hasNoBounds = true;
      let atkname = power + "_projectile";
      let attack_sprite = new Img(getImage(atkname).cloneNode(), attack.x < 0 ? 0 : attack.x, attack.y, sprite_width).fromCenter().onLoad(() => {
        attack.addSprite(attack_sprite);
        attack_sprite.set("will-change", "top,width,left");
        attack_sprite.zIndex = this.sprite.zIndex + 2;
        if (this.isFacingRight) {
          attack.faceRight();
        } else {
          attack.faceLeft();
        }
        let offsetHeight = this.projectileOffsetHeight || (this.height / 5 + this.height / -2) * this.scale;
        this.addAttachment(attack, this.isFacingRight ? new Vector((this.width * this.scale) / 3, offsetHeight) : new Vector((this.width * this.scale) / -3, offsetHeight));
        attack.doHover();
      });
    } else {
      let atk = this.attachments[power];
      atk.width += (this.width * this.scale) / 10;
      // atk.x -= (this.width * this.scale) / 50;
      atk.y -= (this.width * this.scale) / 15;
      atk.power += num;
    }
  }

  shoot(power) {
    power = power || this.powerType;
    if (this.isPoweringUp && this.attachments[power]) {
      let atk = this.detachAttachment(power);
      atk.stopHover();
      atk.forces.push(new Vector(this.isFacingRight ? atk.width / 4 : -atk.width / 4, 0));
      this.isPoweringUp = false;
      return atk;
    }
  }

  kill() {
    if (this.dead) return;
    let rememberZindex = this.sprite.zIndex + 1;
    let explode = () => {
      let explosion = new Img(this.deathImage, this.p.x, this.p.y, this.width * this.scale).fromCenter().usingNewTransform();
      explosion.zIndex = rememberZindex;
      let loop = setInterval(() => {
        explosion.mod("width", ((this.width * this.scale) / 30) | 0);
        explosion.mod("left", ((this.width * this.scale) / -60) | 0);
        explosion.mod("top", ((this.width * this.scale) / -60) | 0);
      }, 16);
      setTimeout(() => {
        clearInterval(loop);
        explosion.remove();
      }, this.deathImageTime);
    };
    this.health = 0;
    this.dead = true;
    this.unsub_landing_emmitter();
    if (this.hasSprite) {
      this.sprite.remove();
    }
    if (this.hasHitbox) {
      this.hitbox.destroy();
    }
    if (this.attachmentList.length) {
      this.attachmentList.forEach((name) => {
        this.attachments[name].kill();
      });
    }
    this.sprite = {};

    if (this.hasDeathImage) {
      explode.apply(this);
    }
  }

  doLand() {
    if (this.isCurrentlyJumping && this.p.y + this.height / 2 >= this.maxbounds.y) {
      this.landing_emitter.emit("land");
    }
  }
}

class Flyer extends Character {
  constructor(x, y, name) {
    super(x, y, name);
    this.maxbounds = { x: width, y: height };
    this.forces = [];

    this.subroutines = this.subroutines.concat(["Oscillate", "Hover", "Orbit", "FlyTo"]);
    this.isDoingHover = false;
    this.isDoingOscillate = false;
    this.isDoingOrbit = false;
    this.isDoingFlyTo = false;
    this.isDoingLand = false;
  }

  doHover() {
    if (this.dead) return;
    if (!this.isDoingHover) {
      this.isDoingHover = true;
      this.cache.doHover = {};
      this.cache.doHover.forces = this.forces;
      this.cache.doHover.origXY = this.p.copy();
      this.forces = [];
      this.forces.push(new Vector(0, -1));
      return {
        then: (fn) => {
          this.cache.doHover.callback = fn;
        },
      };
    }
    let config = this.cache.doHover;
    let limit = this.h / 4;
    if (this.p.y - config.origXY.y < -1 * limit) {
      this.y = config.origXY.y - limit;
      this.forces.push(new Vector(0, 0.8));
    } else if (this.p.y - config.origXY.y > limit) {
      this.y = config.origXY.y + limit;
      this.forces.push(new Vector(0, -0.8));
    }
  }
  stopHover() {
    if (!this.isDoingHover) return;
    let config = this.cache.doHover;
    this.forces = config.forces;
    this.p = config.origXY;
    this.isDoingHover = false;
    let callback = undefined;
    if (typeof config.callback === "function") callback = config.callback;
    delete this.cache.doHover;
    if (callback) callback();
  }
  doOscillate(target) {}
  stopOscillate() {}
  doOrbit(target, speed) {
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
      this.forces.push(target.set(config.speed / d ** (1 / 2)));
    }
  }
  stopOrbit() {}
  doFlyTo(target, max_v) {
    if (!this.isDoingFlyTo) {
      if (target instanceof Vector) {
        this.cache.doFlyTo = {};
        this.cache.doFlyTo.target = target.copy();
        this.cache.doFlyTo.max_v = max_v || this.MAX_V;
      } else {
        console.error(this.name + " cant .doFlyTo() to a", target);
      }
      this.isDoingFlyTo = true;
      return {
        then: (fn) => {
          this.cache.doFlyTo.callback = fn;
        },
      };
    } else {
      let config = this.cache.doFlyTo;
      let dir = config.target.copy().sub(this.p);
      let distX = Math.abs(dir.x);
      let dist = config.target.dist(this.p);
      if (dist > 120 && distX > 20) {
        let target = new Vector(dir.x, dir.y - getRandom(-1) * 500);
        let steer = target.copy().sub(this.v).set(config.max_v);
        this.addForce(steer);
      } else if (dist <= 120 && dist > 5 && distX > 20) {
        let target = new Vector(dir.x, dir.y);
        let steer = target.copy().sub(this.v);
        this.addForce(steer);
      } else if (dist <= 5 && dist > 2 && distX > 20) {
        this.v = new Vector(dir.x, dir.y);
      } else if (distX <= 20 && dist > 5) {
        let target = new Vector(dir.x + getRandom(-1) * 40, dir.y);
        let steer = target.copy().sub(this.v).set(config.max_v);
        this.addForce(steer);
      } else {
        this.v.clear();
        this.isDoingFlyTo = false;
        let callback = undefined;
        this.x = this.cache.doFlyTo.target.x;
        this.y = this.cache.doFlyTo.target.y;
        if (typeof config.callback === "function") callback = config.callback;
        delete this.cache.doFlyTo;
        if (callback) callback();
      }
    }
  }
  steerTo(vector) {
    let target = vector.copy().sub(this.p);
    target.add(new Vector(Math.random() / 10, Math.random() / 10));
    target.set(this.MAX_F);
    let steer = target.copy().sub(this.v);
    if (steer.x >= 0) {
      this.faceRight();
    } else {
      this.faceLeft();
    }
    this.forces.push(steer);
  }
  pathTo(vector) {
    let target = vector.copy().sub(this.p);
    target.limit(this.MAX_F);
    if (target.x >= 0) {
      this.faceRight();
    } else {
      this.faceLeft();
    }
    this.forces.push(target);
  }
}
