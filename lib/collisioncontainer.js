class Hitbox {
    constructor(x, y, WidthorRadius, height, drawBounds) {
        this.x = x;
        this.y = y;
        this.x2 = x + WidthorRadius;
        this.y2 = y + height;
        this.w = WidthorRadius;
        this.h = height || WidthorRadius;
        this.isRectangle = !!WidthorRadius && !!height;
        this.isfromCenter = false;
        //is a rectangle or a circle
        this.radius = this.isRectangle? WidthorRadius/2 : WidthorRadius;
        this.a = new Vector(x, y);
        this.b = new Vector(x, this.y2);
        this.c = new Vector(this.x2, this.y2);
        this.d = new Vector(this.x2, y);
        this.angle = this.getAngle();
        this.config = {
            rotation: 'custom'
            //can be bottom, left, right, xy, center
        };
        this.points = [];
        if (drawBounds) {
            this.drawPoints();
        }
        this.isDrawn = drawBounds; //draw||false;
    }


    drawPoints() {
        this.drawn = true;
        if(this.isRectangle){
            this.points = [
                new Div(this.a.x, this.a.y).asOutline('aqua'),
                new Div(this.b.x, this.b.y).asOutline( 'blue'),
                new Div(this.c.x, this.c.y).asOutline( 'cyan'),
                new Div(this.d.x, this.d.y).asOutline( 'darkred'),];
            this.points[0].label = 'a';
            this.points[1].label = 'b';
            this.points[2].label = 'c';
            this.points[3].label = 'd';
        }else{
            this.points = [
                new Div(this.a.x, this.a.y).asOutline('aqua'),
                new Circle(this.a.x,this.a.y,this.radius).asOutline('red')];
            this.points[0].label = 'a';
            this.points[1].label = 'radius';
        }

    }

    hidePoints() {
        if (this.points.length) {
            this.points.forEach(point => {
                point.remove();
            });
            this.points = [];
        }
    }

    getAngle(rads) {
        return this.a.copy().sub(this.b).getAngle(rads)
    }

    modHeight(val) {
        this.h += val;
        this.c.y += val;
        this.b.y += val;
        this.draw();
    }

    modWidth(val) {
        this.w += val;
        this.c.x += val;
        this.d.x += val;
        this.draw();
    }

    contains(target) {
        if(this.isRectangle){//if this is a rectangle
            if (target instanceof Hitbox) {//and the target is a Hitbox class, deal with the target being a cicrle or a rectabgle
                if(target.isRectangle) return this.a.x < target.d.x && this.d.x > target.a.x && this.a.y < target.b.y && this.b.y > target.a.y;
                return (this.a.y - target.radius < target.a.y) || (this.a.x - target.radius < target.a.x) || (this.c.y + target.radius > target.a.y) || (this.c.x + target.radius > target.a.x)
            } else {
                let p = new Vector(target.x, target.y);
                let AB = this.b.copy().sub(this.a);
                let AP = p.copy().sub(this.a);
                let BC = this.c.copy().sub(this.b);
                let BP = p.copy().sub(this.b);
                let dotABAP = AB.dot(AP);
                let dotABAB = AB.dot(AB);
                let dotBCBP = BC.dot(BP);
                let dotBCBC = BC.dot(BC);
                return 0 <= dotABAP && dotABAP <= dotABAB && 0 <= dotBCBP && dotBCBP <= dotBCBC;
            }
        }else{//but if this is a circle
            if(target instanceof Hitbox){// and target is a hitbox
                if(target.isRectangle) return target.contains(this); //just do the other one
                return this.a.dist(target.a) < this.radius + target.radius;
            }else{
                let p = new Vector(target.x, target.y);
                return this.a.dist(p) < this.radius;
            }
        }


    }

    rotateTo(r, rx, ry) {
        let nr = r - this.angle;
        return this.rotate(nr, rx, ry)

    }

    rotate(r, rx, ry) {
        let cx = 0;
        let cy = 0;
        //deal with rads
        this.angle += r;
        switch (this.config.rotation) {
            case 'center':
                cx = (this.x + this.x2) / 2;
                cy = (this.y + this.y2) / 2;
                break;
            case 'xy':
                cx = this.a.x;
                cy = this.a.y;
                break;
            case 'bottom':
                cx = (this.x + this.x2) / 2;
                cy = this.y2;
                break;
            case 'left':
                cx = this.x;
                cy = (this.y + this.y2) / 2;
                break;
            case  'right':
                cx = this.x2;
                cy = (this.y + this.y2) / 2;
                break;
            case 'top':
                cx = (this.x + this.x2) / 2;
                cy = this.y;
                break;
            case 'custom':
                cx = rx || this.x;
                cy = ry || this.y;
                break;
            default:
                break;
        }
        let p = {x: cx, y: cy};
        this.a.rotateAround(p, r);
        this.b.rotateAround(p, r);
        this.c.rotateAround(p, r);
        this.d.rotateAround(p, r);
        this.x = this.a.x;
        this.y = this.a.y;
        this.x2 = this.c.x;
        this.y2 = this.c.y;
        if (this.points) {
            this.draw()
        }
        return this
    }

    draw() {
        this.points.forEach(p => {
            let l = p.label;
            p.shape.style.top = this[l].y + 'px';
            p.shape.style.left = this[l].x + 'px';
        })

    }

    add(v) {
        this.a.add(v);
        this.b.add(v);
        this.c.add(v);
        this.d.add(v);
        this.x = this.a.x;
        this.y = this.a.y;
        this.x2 = this.c.x;
        this.y2 = this.c.y;
        return this
    }

    moveTo(p) {
        if (!(p instanceof Vector)) {
            console.error(this, '.moveTo() expects Vector');
            return;
        }
        if(this.isfromCenter && this.isRectangle){
            let offset = new Vector(this.w/-2,this.h/-2);
            p.add(offset);
        }
        if (!this.lastp) this.lastp = this.a.copy();
        let move = p.copy().sub(this.lastp);
        this.add(move);
        this.lastp = p.copy();
        if (this.isDrawn) {
            this.draw()
        }
        return this
    }

    destroy() {
        if (this.isDrawn) {
            this.points.forEach(point => {
                point.remove()
            })
        }
    }

    fromCenter(){
        let v = new Vector(this.w/-2,this.h/-2);
        this.a.add(v);
        this.b.add(v);
        this.c.add(v);
        this.d.add(v);
        this.x = this.a.x;
        this.y = this.a.y;
        this.x2 = this.c.x;
        this.y2 = this.c.y;
        this.isfromCenter = true;
        if(this.isDrawn) this.draw();
        return this;
    }

}