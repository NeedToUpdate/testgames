class Rocket {
    constructor(x, y) {
        this.p = new Vector(x, y);
        this.body = {};
        this.v = new Vector(0, 0);
        this.oldv = new Vector(0, 0);
        this.a = new Vector(0, 0);
        this.fw = new Vector(0, -1);
        this.angle = this.fw.getAngle();
        this.boost = 5;
        this.amult = 0.001;
        this.counti = 0;
        this.time = 0;
        this.exp = {};
        this.exploded = false;
        this.life = 100;
        this.decay = 0.07;
        this.gravity = new Vector(0, .0001);
        this.canvasSize = {x:400,y:400};
        this.config = {
            move: 'rockets',
        };
        this.dt = 10;
        this.sl = 0.5;
        this.target = {};
        this.rockets = {
            center: Vector.fromAngle(0),
            left: Vector.fromAngle(45),
            right: Vector.fromAngle(-45)
        };
        this.gfx = {};
        this.gfx.rockets = {
            center: '',
            left: '',
            right: ''
        };
        this.alive = true;
        this.brain = new NeuralNetwork(6)
        this.brain.addLayer(7,'dense','sigmoid')
        this.brain.addLayer(7,'dense','relu')
        this.brain.addLayer(3,'dense','relu')
        this.brain.init();
        this.bounds = []
    }

    init() {
        this.body = new Div(this.p.x, this.p.y, 'grey', 5, 20, true);

        this.gfx.rockets.center = document.createElement('div');
        this.body.shape.append(this.gfx.rockets.center);
        Object.assign(this.gfx.rockets.center.style, Rocket.createStyle(1, 20));
        this.gfx.rockets.center.style.height = '8px';
        this.gfx.rockets.center.style.width = '2px';
        this.gfx.rockets.left = document.createElement('div');
        this.body.shape.append(this.gfx.rockets.left);
        Object.assign(this.gfx.rockets.left.style, Rocket.createStyle(-4, 9));
        this.gfx.rockets.left.style.transform = 'rotate(45deg)';
        this.gfx.rockets.right = document.createElement('div');
        this.body.shape.append(this.gfx.rockets.right);
        Object.assign(this.gfx.rockets.right.style, Rocket.createStyle(7, 2));
        this.gfx.rockets.right.style.transform = 'rotate(135deg)'
    }

    switch(pos, bool) {
        this.gfx.rockets[pos].style.border = (bool ? 'red' : 'black') + ' solid 1px';
        this.gfx.rockets[pos].fire = bool

    }

    static createStyle(x, y) {
        return {
            height: '5px',
            width: '1px',
            border: 'red solid 1px',
            position: 'relative',
            top: y + 'px',
            left: x +'px'
        }
    }

    move(input) {
        switch (this.config.move) {
            case 'rockets':

                if (input[0] > 0.1 && this.life > 0) {
                    this.switch('center', true)
                } else {
                    this.switch('center', false)
                }
                if (input[1] > 0.1 && this.life > 0) {
                    this.switch('left', true)
                } else {
                    this.switch('left', false)
                }
                if (input[2] > 0.1 && this.life > 0) {
                    this.switch('right', true)
                } else {
                    this.switch('right', false)
                }

                let rrs = this.gfx.rockets;
                Object.keys(rrs).forEach(key => {
                    if (rrs[key].fire && this.life > 0) {
                        if (key === 'left') {
                            this.rotate(-1)
                        }
                        if (key === 'right') {
                            this.rotate(1)
                        }
                        if (key === 'center') {
                            this.a.add(this.rockets[key].copy().mult(this.boost*input[0]))
                        }
                        this.a.add(this.rockets[key].copy().mult(0.1));
                        this.a.mult(this.amult)

                    }
                });
                break;
            default:
                //nothing
                break;
        }
        this.a.add(this.gravity);
        this.oldv = this.v.copy();
        this.v.add(this.a.mult(this.dt));
        this.v.limit(this.sl);
        let dv = this.v.copy().add(this.oldv).div(2);
        this.p.add(dv.mult(this.dt));
        this.a.clear()
    }

    rotate(r) {
        Object.keys(this.rockets).forEach(key => {
            this.rockets[key].rotate(r)
        });
        this.fw.rotate(r)
    }

    update(dt) {
        if (!this.alive) {
            this.destroy();
            return
        }
        if (dt) {
            this.dt = dt;
        }
        let inputs = [
            //1-Math.random()*2,
            
            this.life/100,
            this.v.mag() / this.sl,
            1 - (this.p.y / 650),
            Math.abs(1 - (this.p.x * 2 / 350)),
            (this.fw.getAngle() <=180 ? this.fw.getAngle()/180 : 0),
            this.fw.getAngle()>180? (360-this.fw.getAngle())/180 : 0
        ];
        let thoughts = this.brain.predict(inputs);
        this.move(thoughts);

        this.draw();
        if (this.isOOB()) {
            this.destroy()
        }
        this.life -= this.decay;
    }

    draw() {
        this.body.shape.style.left = this.p.x + 'px';
        this.body.shape.style.top = this.p.y + 'px';
        this.body.shape.style.transform = 'rotate(' + this.fw.getAngle() + 'deg)'

    }

    isOOB() {
        let hit = false;
        if (this.bounds.length > 0) {
            this.bounds.forEach(x => {
                if (x.contains(this.p)) {
                    hit = true
                }
            })
        }
        return this.p.x > this.canvasSize.x || this.p.x < 0 || this.p.y < 0 || this.p.y > this.canvasSize.y || hit
    }

    destroy() {
        if (this.alive) {
            this.body.remove();

            this.alive = false;

            this.exp = new Div(this.p.x, this.p.y, 'yellow', 10, 10, false);
            this.counti = 0

        }
        if (!this.exploded) {
            if (this.counti < 40) {
                if (window.performance.now() - this.time > 1) {
                    this.exp.shape.style.height = this.counti * 2 + 'px';
                    this.exp.shape.style.width = this.counti * 2 + 'px';
                    this.exp.shape.style.top = this.p.y - this.counti + 'px';
                    this.exp.shape.style.left = this.p.x - this.counti + 'px';
                    this.counti++;
                    this.time = window.performance.now()
                }
            } else {
                this.exp.remove();
                this.exploded = true
            }
        }
    }

    assignBounds(array) {
        this.bounds = this.bounds.concat(array)
    }

    setTarget(rect) {
        this.target = rect;
        this.bounds.push(rect);
    }

    getFitness() {
        let dx = target.x - this.p.x;
        let dy = target.y - this.p.y;
        let d = (dx * dx + dy * dy);
        if(this.p.y>this.canvasSize.y-20){
        	d+=1000
        }
        return Math.pow(1 / ((Math.log(d + 10) / Math.log(50) - 0.49)), 2)

    }


}
