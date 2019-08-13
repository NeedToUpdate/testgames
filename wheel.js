

let images = [
    'Gold_Ingot',
    'Feather',
    'Golden_Apple',
    'Mushroom_Stew',
    'Bread',
    'Diamond_Sword',
    'Apple',
    'Zombie_Head',
    'Diamond',
    'Cooked_Fish',
    'Golden_Apple',
    'Mushroom_Stew',
    'Creeper_Head',
    'Diamond_Chestplate'
];

let weights = [6,3,1,4,4,1,4,8,5,6,1,4,6,1];


for(let i =0; i< images.length; i++){
    console.log(`%c ${images[i]} weight: ${weights[i]}`, 'color: darkblue');
}





















//Debug Vars
let LOGGING = true;


let wheel = document.getElementById('wheel');

var cWidth = getInnerSize(wheel, 'w');
var cHeight = getInnerSize(wheel, 'h');


var two = new Two({
    fullscreen: false,
    autostart: true,
    width: cWidth,
    height: cHeight
}).appendTo(wheel);
if(LOGGING){
    console.log('[two] Canvas created with height ' + cHeight + ' and width ' + cWidth);
}

let interval = 1;

//speen of rotation
let speed = 10;
let clicked = false;
let PI = Math.PI;




//
//
// let images =['Diamond','Diamond','Diamond','Diamond','Diamond','Diamond','Diamond','Diamond','Diamond','Diamond','Diamond','Diamond','Diamond', 'Feather'];
// let weights = [0,0,0,0,0,0,0,0,0,0,0,0,0,1];
let angleOfEach = 360/images.length;
let originX = cWidth/2;
let originY = cHeight/2;
let radius = 200;

let wheelShape = two.makeCircle(originX, originY, radius);
wheelShape.fill = 'yellow';
wheelShape.stroke = 'blue';
wheelShape.linewidth = 4;




getX= function(angle, customRadius){

    if(customRadius){
        return originX + customRadius * Math.cos(angle);
    }
    return originX + radius * Math.cos(angle);
};
getY= function(angle, customRadius){

    if(customRadius){
        return originY + customRadius * Math.sin(angle);
    }
    return  originY + radius * Math.sin(angle);
};

let sections = [];
setup = function(){

    let total = images.length;
    let incAng = (2*PI)/total;
    //should evenly space out the sections of the pinwheel
    for(let i = 0; i < images.length; i++){
        //create point at origin
       // console.log('test ' + i);

        let langle = incAng*(i+.5)  - PI/2;
        let sangle = incAng*(i) -PI/2;

        //lines
        let line = two.makeLine(originX,originY,getX(langle), getY(langle)); //draws a line at each angle incrementation and adjusts them
        line.linewidth = 4;                                                                // half an angle back so theyre between the pictures (adjustion moved to pics)
        line.stroke = 'blue';




        //images
        //uses the names from the array above to find them in the folder


        let sprite = two.makeSprite('/images/icons/'+ images[i] +'.png', getX(sangle, 150), getY(sangle, 150));
        sprite.rotation = sangle+PI/2;
        if(/Head$/.test(images[i])){
            sprite.scale = 0.2;
        }else{
            sprite.scale = 0.3;
        }


        sections.push({name: images[i], sprite: sprite, line: line, lineAng: langle, spriteAng:sangle,  id: i});

    }
    let arrow = two.makePolygon(originX,85, 20, 3);
    arrow.fill = 'red';
    arrow.rotation = PI;
};

spin = function(){



    for(let i = 0; i < images.length; i++){


        let s = sections[i];
        let newlineangle = s.lineAng - 2*PI/360;
        let newspriteeangle = s.spriteAng - 2*PI/360;
        s.line.vertices[1].x = (getX(newlineangle) - s.line.translation.x);
        s.line.vertices[1].y = (getY(newlineangle) - s.line.translation.y);
        s.sprite.translation =  new Two.Vector(getX(newspriteeangle, 150),getY(newspriteeangle, 150));

        s.sprite.rotation = newspriteeangle + PI/2;

        s.lineAng = newlineangle;
        s.spriteAng = newspriteeangle;


    }

};


setup();

let chosen = -1;
let angWinner = -1;
let spun = -1;
draw = function(){

    if(clicked){

        //run randomizer

        if( chosen < 0) {
            let pool = [];
            for (let i = 0; i < weights.length; i++) {

                for (let j = 0; j < weights[i]; j++) {
                    pool.push(i);
                }

            }

            chosen = pool[Math.floor(Math.random() * (pool.length - 1))];
            //console.log(pool);
            if(LOGGING){
                console.log('chosen is ' + chosen + ', named: ' + images[chosen]);

            }

            //calc angle or rotation


            angWinner = PI * 2 / weights.length * chosen ;
            if(chosen === 0){
                angWinner += 2*PI;
            }
            angWinner += 2 * PI; //add extra spin
            spun = 0;
            pool = [];

            //rotate array
            for(let r = 0; r < chosen; r++){

                arrayRotateOne(weights);
                arrayRotateOne(images);

            }

            //rotate to angle
            //spin() is 120 for full spin
        }
        if(angWinner === -1 || chosen === -1){
            return
        } else if(spun < angWinner - 0.01){

            for(let i = 0; i < interval; i++){

                spin();
            }
            spun += (2*PI/360);
        } else {
            spun = -1;
            angWinner = -1;
            chosen = -1;
            clicked = false;
        }



    }

};


button = document.getElementById('spin');
button.addEventListener('click', function(){

clicked = true;

});


two.bind('update', function(){
    for(let i = 0; i< speed ; i++){

        draw();
    }
});


function getInnerSize(elem, wORh) {

    if(wORh === 'w'){
        return parseFloat(window.getComputedStyle(elem).width);
    } else {
        return parseFloat(window.getComputedStyle(elem).height);
    }

}

function arrayRotateOne(arr){

    arr.push(arr.shift());
    return arr
}