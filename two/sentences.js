//let sentences = ['we read books before bed','then we hug goodnight','my bed is soft a cozy','my cat sleeps with me','the sky has turned dark','my eyes close'];
//let sentences = ['Mayans built enormous temples','their jewelry was gold','their jewelry was made of jade','they wore cotton clothes','they ate bugs on special occasions','they drank the drink of the gods','they ate corn and drank water']
//let sentences = ['i want a toy car','what do you want','what does she want','she wants a doll','he wants a football','what do they want','they want a ball and a guitar','they want a doll and a football']//words.map(x=>{
let animals = ['parrot','shark','frog','owl','snake','stingray','seagull','elephant','whale','crocodile','crocodile','eel','jellyfish','spider','toad','frog'];
let adjs = ['smaller','smarter','scarier','bigger','fatter','smellier','angrier','happier','uglier','prettier','cuter','funnier','thinner','stronger','weaker'];
let sentences = Array(10).fill('').map(x=>{
   let a1 = getRandom(animals);
   let adj = getRandom(adjs);
   let a2 = getRandom(animals);
   while(a1 === a2){
       a2 = getRandom(animals);
   }
   return 'the ' + a1 + ' is ' + adj + ' than the ' + a2;
});


//let sentences = words.map(x=>'the word is ' +x);
