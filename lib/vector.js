class Vector {

    constructor(x, y) {

        if (x instanceof Vector) {
            this.x = x.x;
            this.y = x.y;
        } else if (typeof x === 'object') {
            if (x.x !== undefined && x.y !== undefined) {
                this.x = x.x;
                this.y = x.y
            } else {
                console.error("wrong object to make a vector")
            }
        } else if (typeof x === 'number' || x === undefined) {
            this.x = x || 0;
            this.y = y || 0;
        } else {
            throw 'Unable to make a vector with this input: ' + x
        }
    }

    static fromAngle(r, rads) {
        if (!rads) {
            r /= 180;
            r *= Math.PI;
            r -= Math.PI / 2;
            //console.log(r)
        }
        return new Vector(Math.cos(r), Math.sin(r))
    }

    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y
    }

    static random(x,y){
        //creates a random vector from 0 to limits given
        if(typeof x === 'number' && typeof y === 'number'){
            return new Vector(Math.random()*x, Math.random()*y)
        }else if(typeof x === 'number' && !y){
            return new Vector(Math.random()*2 -1, Math.random()*2 -1).set(x)
        }
        else{
            return new Vector(Math.random()*2 -1, Math.random()*2 -1).set(1)
        }
    }

    add(v) {
        if (v instanceof Vector) {
            this.x += v.x;
            this.y += v.y;
        } else if (typeof v === 'number') {
            this.x += v;
            this.y += v;
        } else if (typeof v === 'object' && typeof v.x === 'number' && typeof v.y === 'number') {
            this.x += v.x;
            this.y += v.y;
        }
        return this;
    }

    sub(vector) {
        return this.subtract(vector);
    }

    subtract(v) {
        if (v instanceof Vector) {
            this.x -= v.x;
            this.y -= v.y;
        } else if (typeof v === 'number') {
            this.x -= v;
            this.y -= v;
        } else if (typeof v === 'object' && typeof v.x === 'number' && typeof v.y === 'number') {
            this.x -= v.x;
            this.y -= v.y;
        }
        return this;
    }

    getAngle(rads) {
        if (!rads) {
            return Math.atan2(this.y, this.x) * 180 / Math.PI + 90;
        } else {
            return Math.atan2(this.y, this.x) + Math.PI / 2;
        }
    }

    clear() {
        this.x = 0;
        this.y = 0;
        return this;
    }

    div(scalar) {
        return this.divide(scalar);
    }

    divide(scalar) {
        return this.multiply(1 / scalar)
    }

    mult(scalar) {
        return this.multiply(scalar);
    }

    multiply(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    copy() {
        return new Vector(this);
    }

    map(fn) {
        this.x = fn(this.x);
        this.y = fn(this.y);
        return this;
    }

    get mag(){
        return this.magnitude
    }

    get magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    log() {
        console.log(JSON.stringify(this))
    }

    rotate(r, rads) {
        if (!rads) {
            r = this.d2r(r);
            //r -= Math.PI/2;
        }
        let dx = this.x * Math.cos(r) - this.y * Math.sin(r);
        let dy = this.x * Math.sin(r) + this.y * Math.cos(r);
        this.x = dx;
        this.y = dy;
        return this
    }

    d2r(r) {
        return (r / 180) * Math.PI
    }

    limit(n) {
        let m = this.mag;
        if (m > n) {
            this.mult(n / m);
            return this;
        } else {
            return this;
        }
    }

    perp() {
        return this.perpendicular()
    }

    perpendicular() {
        let dx = this.y;
        let dy = this.x * -1;
        this.y = dy;
        this.x = dx;
        return this;
    }

    dot(v) {
        return this.x * v.x + this.y * v.y
    }

    rotateAround(p, angle, rads) {
        if (!rads) {
            angle *= (Math.PI / 180)
        }
        let c = Math.cos(-angle);
        let s = Math.sin(-angle);
        let nx = (c * (this.x - p.x)) + (s * (this.y - p.y)) + p.x;
        let ny = (c * (this.y - p.y)) - (s * (this.x - p.x)) + p.y;
        this.x = nx;
        this.y = ny;
        return this;
    }

    distance(v) {
        let x = this.x - v.x;
        let y = this.y - v.y;
        return Math.sqrt(x * x + y * y)
    }

    dist(v) {
        return this.distance(v)
    }

    set(n) {
        let m = this.mag;
        this.mult(n / m);
        return this;
    }

    floor(){
        this.x = this.x |0;
        this.y = this.y |0;
    }
    normalize(){
        return this.set(1);
    }
    round(){
        this.x = this.x|0;
        this.y = this.y|0;
        return this;
    }
}