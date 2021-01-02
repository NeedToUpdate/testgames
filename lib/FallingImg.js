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
        let div = new Rectangle(0,0,shapeWidth,shapeHeight).asOutline(color || 'lightblue',r(width/360));
        div.set('borderRadius',r(width/180)+'px')
        div.set('backgroundColor','white')
        let img = {}
        return new Promise(resolve=>{
            if(typeof image == 'string'){
                div.set('backgroundImage','url(' + image + ')')
                div.set('backgroundSize','cover')
                resolve(div);
            }else if(image instanceof DomObject){
                div.attach(image)
                image.width = shapeWidth
                div.width = shapeWidth;
                div.y = (div.width-div.height)/2
                image.onLoad(()=>{
                    resolve(div)
                })
            }else if(image instanceof Node){
                img = new Img(image,0,0,width)
                div.attach(img)
                img.width = shapeWidth
                img.onLoad(()=>{
                    img.x = r(width/360)
                    img.y = (img.width-img.height)/2
                    resolve(div)
                })
            }else{
                console.error(typeof image + ' is not a valid image');
            }
        });
    }
}