class Blank{
    constructor(x,y,w,h,mass){
        this.origin_x = x;
        this.origin_y = y;
        this.w = w;
        this.h = h || w;
        this.mass = mass || 1;
        this.name = 'blank';
        this.p = new Vector(x, y);
        this.old_v = new Vector(0, 0);
        this.v = new Vector(0, 0);
        this.a = new Vector(0, 0);
        this.forces = [];
        this.isDrawn = true;
        this.sprite;

        this.maxbounds = {x: width || window.innerWidth, y: height || window.innerHeight};
        this.minbounds = {x: 0, y: 0};
        this.MAX_V = 40;
        this.MAX_F = 30;
        this.dead = false;
        this.fragile = false;
        this.cache = {};
        this.attachments = {};
        this.health = 100;
        this.facing_right = true;
        this.hasAntiGrav = false;
        this.hasNoSkyBox = false;
        this.hasNoBounds = false;

        this.friction_coeff = 0.1;
        this.friction_force = {};
        this.hasFriction = false;
        this.canBounce = false;
        //TODO change to has
        this.bounce_coeff = 0.8;
    }

    get x(){
        return this.p.x;
    }
    set x(val){
        if(typeof val !== 'number') return;
        this.p.x = val;
    }

    get y(){
        return this.p.y;
    }
    set y(val){
        if(typeof  val !== 'number') return;
        this.p.y = val;
    }

    get angle(){

    }
    set angle(val){

    }

    addSprite(image){
        if(image instanceof DomObject){
            this.sprite = image;
            this.sprite.moveTo(this.p)
        }else{
            console.error('Unsupported Format')
        }
        return this;
    }
    get hasSprite(){
        return Object.keys(this.sprite).length>0
    }

    update(){
        for(let i = this.forces.length-1; i>=0; i--){
            this.a.add(this.forces[i]);
            if(!this.forces[i].constant){
               this.forces.splice(i,1)
            }
        };
        this.a.limit(this.MAX_F);
        this.old_v = this.v.copy();
        this.v.add(this.a);
        if(this.dynamicFrictionCheck()){
            this.friction_force = this.v.copy().mult(this.mass)*this.friction_coeff;
            this.v.add(this.friction_force);
        }
        this.p.add(this.v.copy().add(this.old_v).div(2));
        this.a.clear();

        this.handleBounds()
        if(this.isDrawn) this.draw();
    }

    draw(){
        if(!this.hasSprite) return;
        this.sprite.moveTo(this.p);
    }

    dynamicFrictionCheck(){
        //can be changed to only apply friction in some areas of the place;
        return this.hasFriction;
    }
    
    addForce(force){
       if(force instanceof Vector){
          if(!force.constant) force.constant = false;
          this.forces.push(force)
       }else{
          console.error("must be a vector to add force")
       }
    }
    
    handleBounds() {
         let paddingx = 0;
         let paddingy = 0;
         if (this.hasSprite) {
            paddingx = this.sprite.width / 2;
            paddingy = this.sprite.height / 2;
            if (!paddingy || !paddingx) console.error("issue with " +this.name + "'s sprite")
         }
         if (this.p.x + paddingx > this.maxbounds.x) {
              this.p.x = this.maxbounds.x - paddingx;
              this.v.x = this.canBounce? (this.v.x * -1*this.bounce_coeff ): 0;
              if (this.fragile) this.kill()
         }
         if (this.p.y + paddingy > this.maxbounds.y) {
              this.p.y = this.maxbounds.y - paddingy;
              this.v.y = this.canBounce? (this.v.y * -1 * this.bounce_coeff ): 0;
              if (this.fragile) this.kill()
         }
         if (this.p.x - paddingx < this.minbounds.x) {
              this.p.x = this.minbounds.x + paddingx;
              this.v.x =  this.canBounce? (this.v.x * -1 * this.bounce_coeff) : 0;
              if (this.fragile) this.kill()
         }
         if (this.p.y - paddingy < (this.noskybox ? -3000 : this.minbounds.y)) {
              this.p.y = this.minbounds.y + paddingy - (this.noskybox ? 3000 : 0);
              this.v.y =  this.canBounce? (this.v.y * -1 *this.bounce_coeff ): 0;
              if (this.fragile) this.kill()
         }
    }


}