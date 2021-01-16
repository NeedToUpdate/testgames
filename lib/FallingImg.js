class FallingImg extends Character{
    constructor(x,y,name,fallSpeed,killOnFall){
        super(x,y,name)
        this.fallSpeed = fallSpeed || 1;
        this.subroutines = this.subroutines.concat('Fall')
        this.isDoingFall = false;
        if(killOnFall){
            let unsub = this.landing_emitter.subscribe('land',()=>{
                this.kill();
                unsub()
            });
        }else{
            let unsub = this.landing_emitter.subscribe('land',()=>{
                this.isDoingFall = false;
                unsub()
            });
        }
    }
    doFall(){
        if(this.isDoingFall){
            this.v = new Vector(0,this.fallSpeed)
        }else{
            this.isDoingFall = true;
            this.isCurrentlyJumping = true;
        }
    }
    static createIcon(image,shapeWidth,shapeHeight,color){
        let img = {}
        return new Promise(resolve=>{
            if(typeof image == 'string'){
                img = new Img(image,-width,-height,width)
                img.width = shapeWidth
                img.onLoad(()=>{
                    img = img.asSquare()
                    img.set('borderRadius',r(width/180)+'px')
                    img.set('backgroundColor','white')
                    img.set('border','solid ' + (color || 'lightblue') + ' ' + r(width/300) + 'px')
                    resolve(img)
                })
            }else if(image instanceof DomObject){
                image.width = shapeWidth
                image.onLoad(()=>{
                    img = img.asSquare()
                    img.set('borderRadius',r(width/180)+'px')
                    img.set('backgroundColor','white')
                    img.set('border','solid ' + (color || 'lightblue') + ' ' + r(width/300) + 'px')
                    resolve(img)
                })
            }else if(image instanceof Node){
                img = new Img(image,-width,-height,width)
                img.width = shapeWidth
                img.onLoad(()=>{
                    img = img.asSquare()
                    img.set('borderRadius',r(width/180)+'px')
                    img.set('backgroundColor','white')
                    img.set('border','solid ' + (color || 'lightblue') + ' ' + r(width/300) + 'px')
                    resolve(img)
                })
            }else{
                console.error(typeof image + ' is not a valid image');
            }
        });
    }
}