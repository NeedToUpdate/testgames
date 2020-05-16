class Blank{
    constructor(x,y,w,h,mass){
        this.origin_x = x;
        this.origin_y = y;
        this.w = w;
        this.h = h || w;
        this.mass = mass;
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
        this.hasBounce = false;
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

    setSprite(image){
        if(image instanceof DomObject){
            this.sprite = image;
        }else{
            console.error('Unsupported Format')
        }
        return this;
    }
    hasSprite(){
        return Object.keys(this.sprite).length>0
    }

    update(){
        this.forces.forEach(force=>{
            this.a.add(force);
        });
        this.a.limit(this.MAX_F);
        this.old_v = this.v.copy();
        this.v.add(this.a);
        if(this.dynamicFrictionCheck()){
            this.friction_force = this.v.copy().mult(this.mass)*this.friction_coeff;
            this.v.add(this.friction_force);
        }
        this.p.add(this.v.copy().add(this.old_v).div(2));
        this.a.clear();

        if(this.isDrawn) this.draw();
    }

    draw(){
        this.sprite.moveTo(this.p);
    }

    dynamicFrictionCheck(){
        //can be changed to only apply friction in some areas of the place;
        return this.hasFriction;
    }


}