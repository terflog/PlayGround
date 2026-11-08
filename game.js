(() => {
  'use strict';
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const W = canvas.width, H = canvas.height, T = 16;
  const $ = id => document.getElementById(id);
  const ui = {status:$('status-line'),area:$('area-label'),level:$('level'),hpBar:$('hp-bar'),hpText:$('hp-text'),buddyCount:$('buddy-count'),wins:$('win-count'),noteTitle:$('note-title'),note:$('field-note'),goal:$('goal-text'),goalCheck:$('goal-check'),progress:$('goal-progress'),action:$('action-label'),toast:$('toast')};
  const rnd = (a,b) => Math.floor(Math.random()*(b-a+1))+a;
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const creatures = [
    {name:'MOSSLET',kind:'LEAF',color:'#79bd83',accent:'#3d8d62',hp:20},
    {name:'EMBERCUB',kind:'FLAME',color:'#ee9870',accent:'#d8644e',hp:22},
    {name:'PEBBLIT',kind:'STONE',color:'#aaa6a0',accent:'#817a74',hp:24},
    {name:'CLOUDFIN',kind:'MIST',color:'#9cc9d7',accent:'#568ca5',hp:19},
  ];
  const game = {
    mode:'title', step:0, steps:0, wins:0, caught:0, potions:2, level:3, xp:0,
    maxHp:28, hp:28, x:12, y:17, facing:'down', moveClock:0, buddyTrail:[],
    toastTimer:0, message:'A bright new day is waiting.', talked:false, quest:false,
    battle:null, sound:true, keys:{}, lastTime:0, anim:0, grassEncounterCooldown:0
  };
  const mapW=32,mapH=26;
  const path = new Set();
  const addPath=(x1,y1,x2,y2)=>{let x=x1,y=y1;path.add(`${x},${y}`);while(x!==x2){x+=Math.sign(x2-x);path.add(`${x},${y}`)}while(y!==y2){y+=Math.sign(y2-y);path.add(`${x},${y}`)}};
  addPath(12,19,12,8);addPath(12,12,20,12);addPath(12,16,5,16);addPath(20,12,25,12);
  const grassAreas=[{x:21,y:7,w:8,h:4},{x:23,y:13,w:6,h:7},{x:4,y:19,w:7,h:5},{x:16,y:4,w:5,h:3}];
  const ponds=[{x:25,y:3,w:5,h:3},{x:2,y:7,w:4,h:3}];
  const solids=new Set();
  for(let x=0;x<mapW;x++){solids.add(`${x},0`);solids.add(`${x},${mapH-1}`)}
  for(let y=0;y<mapH;y++){solids.add(`0,${y}`);solids.add(`${mapW-1},${y}`)}
  const buildings=[{x:8,y:4,w:6,h:4,type:'lab'},{x:3,y:13,w:5,h:3,type:'home'},{x:17,y:16,w:5,h:3,type:'home'}];
  buildings.forEach(b=>{for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)solids.add(`${x},${y}`)});
  // Trees around the village make a soft, explorable boundary rather than a maze.
  const trees=[[2,3],[3,3],[4,3],[6,4],[7,4],[15,3],[16,3],[17,3],[18,3],[19,3],[20,3],[22,3],[23,3],[24,3],[3,5],[6,7],[7,7],[15,8],[16,8],[17,8],[18,8],[19,8],[29,5],[29,6],[29,7],[30,7],[2,11],[3,11],[4,11],[5,11],[9,9],[10,9],[28,21],[29,21],[30,21],[12,23],[13,23],[14,23],[15,23],[16,23],[17,23],[18,23],[19,23],[20,23],[21,23],[22,23],[23,23],[24,23],[25,23],[26,23],[27,23],[28,23],[29,23]];
  trees.forEach(([x,y])=>solids.add(`${x},${y}`));
  const npc={x:15,y:12};

  function tileType(x,y){
    if(x<0||y<0||x>=mapW||y>=mapH)return 'wall';
    if(ponds.some(p=>x>=p.x&&x<p.x+p.w&&y>=p.y&&y<p.y+p.h))return 'water';
    if(path.has(`${x},${y}`))return 'path';
    if(grassAreas.some(p=>x>=p.x&&x<p.x+p.w&&y>=p.y&&y<p.y+p.h))return 'tall';
    return 'grass';
  }
  function solid(x,y){return solids.has(`${x},${y}`)||tileType(x,y)==='water'||(x===npc.x&&y===npc.y)}
  function tone(hex,factor){const n=parseInt(hex.slice(1),16),r=clamp((n>>16)+factor,0,255),g=clamp(((n>>8)&255)+factor,0,255),b=clamp((n&255)+factor,0,255);return `rgb(${r},${g},${b})`}
  function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
  function pixelText(text,x,y,size=8,color='#fff',align='left'){ctx.font=`${size}px monospace`;ctx.textAlign=align;ctx.textBaseline='top';ctx.fillStyle=color;ctx.fillText(text,Math.round(x),Math.round(y))}
  function rounded(x,y,w,h,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill()}

  function drawTerrain(tx,ty,sx,sy){
    const type=tileType(tx,ty),seed=(tx*92821+ty*68917)%97;
    if(type==='grass'){
      rect(sx,sy,T,T,seed%5===0?'#84c28d':'#8bc995');
      if(seed%7===0){rect(sx+3,sy+4,2,2,'#a5d6a0');rect(sx+11,sy+12,2,1,'#6eb67c')}
    }else if(type==='path'){
      rect(sx,sy,T,T,'#d7bd85');if(seed%4===0)rect(sx+((seed%9)+3),sy+5,2,2,'#c7aa72');if(seed%6===0)rect(sx+3,sy+12,3,1,'#e6d09e');
    }else if(type==='tall'){
      rect(sx,sy,T,T,'#79bb80');
      let sway=Math.sin(game.anim*.003+tx*2+ty)*1.5;
      rect(sx+3,sy+9+sway,2,6,'#438e5c');rect(sx+5,sy+5+sway,2,9,'#519f66');rect(sx+9,sy+8-sway,2,7,'#3f8858');rect(sx+12,sy+4-sway,2,10,'#55a56c');rect(sx+4,sy+5+sway,2,2,'#9bd296');rect(sx+11,sy+4-sway,2,2,'#a1d89a');
    }else if(type==='water'){
      rect(sx,sy,T,T,'#78bbcf');rect(sx,sy,16,2,'#9cdaeb');if(seed%3===0){rect(sx+4,sy+8+Math.sin(game.anim*.002+tx)*2,5,1,'#a8e0e9');rect(sx+10,sy+12,2,1,'#639fb7')}
    }else rect(sx,sy,T,T,'#83bd8b');
  }

  function drawTree(x,y){
    const sx=x*T,sy=y*T;
    rect(sx+6,sy+9,5,8,'#875d42');rect(sx+4,sy+14,9,3,'#76513e');
    rect(sx+1,sy+5,14,7,'#39895c');rect(sx+3,sy+2,10,8,'#4b9b66');rect(sx+5,sy,6,6,'#5aa873');
    rect(sx+4,sy+4,2,2,'#82c585');rect(sx+11,sy+7,2,2,'#65b477');
  }
  function drawBuilding(b,cameraX,cameraY){
    const x=b.x*T-cameraX,y=b.y*T-cameraY,w=b.w*T,h=b.h*T;
    rect(x+3,y+8,w,h-7,'#d7c6a2');rect(x,y+5,w,7,b.type==='lab'?'#d96f55':'#d78363');
    for(let i=0;i<b.w;i++){rect(x+i*T+1,y+5,7,5,b.type==='lab'?'#e98764':'#e39a71')}
    rect(x+6,y+14,w-12,h-19,'#f1dfbd');rect(x+w/2-5,y+h-17,10,17,'#896248');rect(x+w/2-3,y+h-14,2,2,'#f4d36a');
    if(b.type==='lab'){
      rect(x+w/2-12,y+23,24,17,'#5e9fb2');rect(x+w/2-9,y+26,18,11,'#bde6d9');rect(x+w/2-10,y+38,20,2,'#42788b');
      rect(x+5,y+18,10,10,'#71a9b5');rect(x+7,y+20,6,6,'#b9e6d8');rect(x+w-15,y+18,10,10,'#71a9b5');rect(x+w-13,y+20,6,6,'#b9e6d8');
      rounded(x+w/2-23,y-3,46,12,3,'#fff2c7');pixelText('FIELD LAB',x+w/2,y,7,'#566477','center');
    }else{rect(x+6,y+18,15,12,'#72aab4');rect(x+8,y+20,11,8,'#bce3d6');rect(x+w-21,y+18,15,12,'#72aab4');rect(x+w-19,y+20,11,8,'#bce3d6')}
    rect(x+w/2-12,y+h-1,24,2,'#d2b37b');
  }

  function drawPerson(px,py,type,frame=0){
    const x=Math.round(px),y=Math.round(py);
    if(type==='hero'){
      // soft shadow, red cap, blue jacket and a tiny backpack
      rect(x-6,y+9,13,3,'#4b785d');rect(x-5,y-8,10,9,'#f0c79c');rect(x-6,y-11,12,5,'#c9544f');rect(x-4,y-15,9,5,'#d86054');rect(x+3,y-11,5,2,'#a63e44');
      rect(x-6,y,12,8,'#547fa1');rect(x-8,y+1,3,7,'#e2ad45');rect(x-4,y+2,3,4,'#d5e0dc');
      rect(x-5,y+7,4,5,'#40526b');rect(x+2,y+7,4,5,'#40526b');if(frame%2){rect(x-7,y+11,4,2,'#37465c');rect(x+2,y+11,4,2,'#37465c')}
      if(game.facing==='up'){rect(x-4,y-7,8,7,'#c78c66');rect(x-6,y-11,12,4,'#c9544f')}
    }else if(type==='prof'){
      rect(x-6,y+9,13,3,'#648966');rect(x-5,y-7,10,9,'#f2c99e');rect(x-7,y-10,14,5,'#f0f0dd');rect(x-7,y-4,14,13,'#f2f0df');rect(x-5,y+7,4,5,'#697c91');rect(x+2,y+7,4,5,'#697c91');rect(x-4,y-5,8,2,'#acb8b2');
    }
  }
  function drawVolt(px,py,scale=1){
    ctx.save();ctx.translate(Math.round(px),Math.round(py));ctx.scale(scale,scale);
    rect(-7,8,15,3,'#54825e');
    // lightning-bolt tail
    rect(7,0,4,3,'#e8b63d');rect(10,-4,3,5,'#e8b63d');rect(12,-7,4,5,'#e8b63d');rect(14,-9,4,3,'#e8b63d');
    // ears, body and cheeks
    rect(-7,-12,14,16,'#f2c849');rect(-5,-15,4,6,'#f2c849');rect(2,-15,4,6,'#f2c849');rect(-5,-16,3,3,'#34302e');rect(3,-16,3,3,'#34302e');
    rect(-8,-4,3,4,'#e76a56');rect(5,-4,3,4,'#e76a56');rect(-3,-8,2,3,'#282c32');rect(2,-8,2,3,'#282c32');rect(-1,-3,2,1,'#77503a');
    rect(-5,3,4,4,'#dfa83c');rect(2,3,4,4,'#dfa83c');rect(-4,7,3,3,'#8e6844');rect(2,7,3,3,'#8e6844');
    ctx.restore();
  }

  function drawMap(){
    const camX=clamp(game.x*T-W/2+8,0,mapW*T-W),camY=clamp(game.y*T-H/2+8,0,mapH*T-H);
    const startX=Math.floor(camX/T),startY=Math.floor(camY/T);
    for(let ty=startY;ty<=startY+H/T;ty++)for(let tx=startX;tx<=startX+W/T;tx++)drawTerrain(tx,ty,tx*T-camX,ty*T-camY);
    // Tiny flowers and stepping stones add a little life to the quiet town.
    for(let y=startY;y<=startY+H/T;y++)for(let x=startX;x<=startX+W/T;x++){
      if(tileType(x,y)==='grass'&&(x*7+y*13)%31===0){rect(x*T-camX+7,y*T-camY+8,2,2,'#f3d16a');rect(x*T-camX+9,y*T-camY+7,2,2,'#fff0c1')}
    }
    buildings.forEach(b=>drawBuilding(b,camX,camY));
    trees.forEach(([x,y])=>drawTree(x*T-camX,y*T-camY));
    // A little fence around the lab garden.
    for(let x=14;x<19;x++){const fx=x*T-camX,fy=10*T-camY;rect(fx,fy,2,8,'#ae8858');rect(fx+7,fy,2,8,'#ae8858');rect(fx,fy+2,9,2,'#c29a66')}
    const npcX=npc.x*T+8-camX,npcY=npc.y*T+8-camY;
    if(npcX>-10&&npcX<W+10)drawPerson(npcX,npcY,'prof',game.anim>>8);
    // Draw the companion a half-step behind the trainer.
    const buddy=game.buddyTrail[0]||{x:game.x,y:game.y+1};
    drawVolt(buddy.x*T+8-camX,buddy.y*T+8-camY,.72);
    drawPerson(game.x*T+8-camX,game.y*T+8-camY,'hero',game.anim>>7);
    // Area plaque and proximity hints.
    const inTrail=game.x>19||game.y>18;
    rounded(7,7,92,17,3,'#26384cdd');pixelText(inTrail?'SUNMEADOW TRAIL':'SUNMEADOW TOWN',12,12,7,'#fff3d4');
    if(Math.abs(game.x-npc.x)+Math.abs(game.y-npc.y)<=2){rounded(240,190,136,18,3,'#26384cdd');pixelText('SPACE  ·  TALK TO PROF.',248,196,7,'#fff3d4')}
    if(game.x>=20&&game.y>=7&&game.y<=20){rounded(276,7,99,17,3,'#26384cdd');pixelText('TALL GRASS  ✦',283,12,7,'#d7f0bc')}
  }

  function drawTitle(){
    rect(0,0,W,H,'#79bb92');
    // dreamy meadow, layered hills and flowers
    rect(0,126,W,90,'#75b783');rect(0,145,W,71,'#69aa7c');
    for(let i=0;i<12;i++){const x=i*38-10;rect(x,72+(i%3)*7,42,66,'#89c995');rect(x+8,58+(i%3)*7,28,25,'#89c995');rect(x+15,48+(i%3)*7,17,15,'#89c995')}
    for(let i=0;i<34;i++){const x=(i*67+19)%W,y=125+(i*29)%82;rect(x,y,2,2,i%3===0?'#f4d369':'#d7ebaa')}
    // little cabin silhouette
    rect(25,112,60,48,'#eed7a9');rect(19,104,72,17,'#cf725c');rect(36,130,13,16,'#70a6af');rect(61,137,12,23,'#8e6445');
    drawVolt(307,139,.95);
    // decorative sun
    rect(306,24,30,30,'#f7d466');rect(313,18,16,6,'#f7d466');rect(313,54,16,6,'#f7d466');rect(300,31,6,16,'#f7d466');rect(336,31,6,16,'#f7d466');
    rect(0,0,W,H,'#17263a38');
    rounded(49,25,286,163,7,'#203044ef');rect(61,37,262,139,'#f5efd9');
    pixelText('A POCKET-SIZED ADVENTURE',192,50,8,'#718077','center');
    pixelText('POCKET',192,67,22,'#28394a','center');pixelText('TRAILS',192,91,25,'#e1ae32','center');
    rect(124,123,136,1,'#d6d3c4');pixelText('YELLOW DAY',192,133,8,'#5d6e72','center');
    rounded(108,154,168,24,4,'#e9c34c');pixelText('PRESS ENTER TO BEGIN',192,162,8,'#28394a','center');
    pixelText('WANDER · MEET · BECOME FRIENDS',192,180,7,'#fff2d6','center');
  }

  function drawWild(mon,x,y,scale=1){
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
    const c=mon.color,a=mon.accent;
    // Friendly, chunky pixel creature silhouettes vary by species.
    rect(-21,7,43,7,'#557763');
    if(mon.name==='MOSSLET'){
      rect(-15,-8,30,22,c);rect(-10,-15,20,11,c);rect(-8,-20,5,8,a);rect(4,-22,5,10,a);rect(-17,0,6,9,a);rect(11,1,7,8,a);rect(-11,-9,4,4,'#eaf3c4');rect(6,-9,4,4,'#eaf3c4');rect(-10,-8,2,3,'#283344');rect(7,-8,2,3,'#283344');rect(-3,-16,6,3,'#55a76d');rect(0,-20,5,5,'#67b778');
    }else if(mon.name==='EMBERCUB'){
      rect(-16,-9,32,25,c);rect(-13,-16,9,10,c);rect(5,-16,9,10,c);rect(-15,3,7,8,a);rect(9,3,7,8,a);rect(-7,-4,4,5,'#fff2cf');rect(5,-4,4,5,'#fff2cf');rect(-6,-3,2,4,'#292f39');rect(6,-3,2,4,'#292f39');rect(-3,4,7,2,a);rect(12,-17,7,6,'#f3c75e');rect(15,-22,6,8,'#ea765a');
    }else if(mon.name==='PEBBLIT'){
      rect(-17,-9,34,25,c);rect(-11,-15,22,10,c);rect(-18,-5,7,8,a);rect(11,-4,8,8,a);rect(-13,2,9,8,a);rect(5,2,10,8,a);rect(-8,-6,4,4,'#f8f0d7');rect(5,-6,4,4,'#f8f0d7');rect(-7,-5,2,3,'#343c44');rect(6,-5,2,3,'#343c44');rect(-5,-17,7,3,'#c7c1b6');
    }else{
      rect(-17,-9,34,23,c);rect(-12,-16,24,10,c);rect(-19,-8,8,12,c);rect(11,-8,8,12,c);rect(-11,1,8,8,a);rect(5,1,8,8,a);rect(-7,-7,4,4,'#fff');rect(5,-7,4,4,'#fff');rect(-6,-6,2,3,'#293440');rect(6,-6,2,3,'#293440');rect(-4,-17,8,4,'#d7eff0');
    }
    ctx.restore();
  }

  function drawBattle(){
    const b=game.battle;if(!b)return;
    rect(0,0,W,H,'#b6d6c3');
    // soft forest battle clearing
    rect(0,0,W,107,'#b6d7ce');rect(0,104,W,112,'#8dc096');
    for(let i=0;i<8;i++){const x=i*58-15;rect(x,16,30,58,'#87bb9d');rect(x+5,8,22,22,'#76b48f');rect(x+10,1,12,16,'#69a985')}
    rect(0,108,W,4,'#c3d9b4');
    // creature platforms
    ctx.fillStyle='#78aa7d';ctx.beginPath();ctx.ellipse(281,108,66,13,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#6b9b75';ctx.beginPath();ctx.ellipse(93,169,77,15,0,0,Math.PI*2);ctx.fill();
    // Opponent info panel
    rounded(13,13,153,39,4,'#f8f4e5');rounded(15,15,149,35,3,'#f8f4e5');
    pixelText(b.enemy.name,23,21,9,'#354352');pixelText(`Lv.${b.enemy.level}`,151,21,8,'#667281','right');
    pixelText('HP',23,37,7,'#687686');rect(42,38,103,5,'#d8d6c8');rect(42,38,Math.max(1,103*b.enemy.hp/b.enemy.maxHp),5,b.enemy.hp/b.enemy.maxHp<.25?'#e26f5e':'#8fc388');
    drawWild(b.enemy,282,89,1.05);
    // Player name and vitality
    rounded(210,133,164,43,4,'#f8f4e5');pixelText('VOLTKIT',220,141,9,'#354352');pixelText(`Lv.${game.level}`,359,141,8,'#667281','right');
    pixelText(`${game.hp} / ${game.maxHp}`,359,155,7,'#667281','right');rect(220,166,139,5,'#d8d6c8');rect(220,166,Math.max(1,139*game.hp/game.maxHp),5,game.hp/game.maxHp<.25?'#e26f5e':'#8fc388');
    drawVolt(91,145,1.12);
    // Dialogue/action strip
    rect(0,184,W,32,'#f4f0df');rect(0,184,W,2,'#d0c7a8');
    if(b.phase==='menu'){
      pixelText('WHAT SHOULD VOLTKIT DO?',10,190,7,'#536272');
      const opts=[['1  SPARK','⚡'],['2  TAIL WHIP','↝'],[`3  SNACK ×${game.potions}`,'+'],['4  TRAIL ORB','○']];
      opts.forEach((o,i)=>{const x=9+i*94;rounded(x,201,87,12,2,'#fffdf3');pixelText(o[0],x+5,204,6,'#3b4b58')});
    }else{
      pixelText(b.message||'The wild creature is watching...',10,191,8,'#354352');
      if(b.phase.endsWith('Msg')||b.phase==='intro')pixelText('SPACE  ·  CONTINUE',374,202,6,'#7b817b','right');
    }
  }

  function render(){
    ctx.clearRect(0,0,W,H);
    if(game.mode==='title')drawTitle();
    else if(game.mode==='map')drawMap();
    else if(game.mode==='battle')drawBattle();
    else if(game.mode==='ending'){
      drawMap();rect(0,0,W,H,'#152438b8');rounded(44,40,296,137,6,'#f7f2df');
      pixelText('A TRAIL WELL WANDERED',192,58,8,'#68776d','center');pixelText('FRIENDS FOUND!',192,79,20,'#d9aa36','center');
      pixelText(`You found ${game.caught+1} little buddies.`,192,111,8,'#354556','center');pixelText('Take your time. The trail is always here.',192,127,7,'#718077','center');
      rounded(111,151,162,17,3,'#eac64e');pixelText('SPACE  ·  KEEP WANDERING',192,156,7,'#354556','center');
    }
  }

  function showToast(text){ui.toast.textContent=text;ui.toast.classList.add('show');clearTimeout(game.toastTimer);game.toastTimer=setTimeout(()=>ui.toast.classList.remove('show'),2100)}
  function updateUI(){
    ui.level.textContent=game.level;ui.hpBar.style.width=`${100*game.hp/game.maxHp}%`;ui.hpText.textContent=`${game.hp} / ${game.maxHp}`;
    ui.buddyCount.textContent=String(1+game.caught).padStart(2,'0');ui.wins.textContent=String(game.wins).padStart(2,'0');
    ui.area.textContent=game.x>19||game.y>18?'SUNMEADOW TRAIL':'SUNMEADOW TOWN';ui.status.textContent=game.message;
    ui.goal.textContent=game.caught?'Make a new friend in the tall grass':game.quest?'Meet the professor at the field lab':'Find the trail beyond town';
    ui.goalCheck.textContent=(game.caught||game.quest)?'✓':'○';ui.progress.style.width=game.caught?'100%':game.quest?'68%':'14%';
    if(game.caught){ui.noteTitle.textContent='FIELD NOTE #02';ui.note.textContent='A good battle can turn a stranger into a friend. Trail Orbs work best when a creature is getting tired.'}
    else if(game.quest){ui.noteTitle.textContent='FIELD NOTE #01';ui.note.textContent='Professor Fern asked you to explore the tall grass and meet the little creatures who live there.'}
    if(game.mode==='title')ui.action.textContent='START JOURNEY';else if(game.mode==='battle')ui.action.textContent='CHOOSE MOVE';else if(game.mode==='ending')ui.action.textContent='KEEP WANDERING';else ui.action.textContent='TALK / INTERACT';
  }
  function startJourney(){
    if(game.mode!=='title')return;
    game.mode='map';game.message='The professor is waiting by the field lab.';ui.status.textContent=game.message;
    showToast('A new day in Sunmeadow! Find Professor Fern near the lab.');updateUI();
  }
  function faceDirection(dir){game.facing=dir}
  function move(dir){
    if(game.mode!=='map')return;
    const delta={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[dir];if(!delta)return;
    faceDirection(dir);const nx=game.x+delta[0],ny=game.y+delta[1];
    if(!solid(nx,ny)){
      game.buddyTrail.unshift({x:game.x,y:game.y});if(game.buddyTrail.length>4)game.buddyTrail.pop();game.x=nx;game.y=ny;game.steps++;
      if(game.x>=20&&tileType(game.x,game.y)==='tall'&&game.grassEncounterCooldown<=0&&Math.random()<.14){game.grassEncounterCooldown=7;beginBattle()}
      if(game.x>=20&&game.steps>8&&!game.quest){game.quest=true;game.message='A grassy trail! Maybe the professor knows what lives here.';showToast('You found the trail beyond town.');}
      if(game.x===npc.x&&game.y===npc.y){game.message='Professor Fern is right there. Press SPACE to talk!'}
      updateUI();
    }else if(tileType(nx,ny)==='water')game.message='The water is cool and clear. Better not wade in.';
    else if(buildings.some(b=>nx>=b.x&&nx<b.x+b.w&&ny>=b.y&&ny<b.y+b.h))game.message='A cozy little home. The door is shut for now.';
  }
  function interact(){
    if(game.mode==='title'){startJourney();return}
    if(game.mode==='ending'){game.mode='map';game.message='There is always another little path to follow.';updateUI();return}
    if(game.mode==='battle'){battleContinue();return}
    if(game.mode!=='map')return;
    const d=Math.abs(game.x-npc.x)+Math.abs(game.y-npc.y);
    if(d<=2){
      if(!game.talked){game.talked=true;game.quest=true;game.message='Professor Fern: “Oh! You must be the new trailkeeper. This little Voltkit will be your friend. Explore the grass and say hello to everyone!”';showToast('Voltkit joined your little team!');}
      else{game.message='Professor Fern: “Take your time. Every little creature has its own kind of brave.”';showToast('A kind word from Professor Fern.');}
    }else if(tileType(game.x,game.y)==='tall'&&game.mode==='map'){
      game.message='The grass rustles nearby...';if(game.grassEncounterCooldown<=0)beginBattle();
    }else if(game.x>19||game.y>18){game.mode='ending';game.message='';}
    else {game.message='Nothing here but sunshine and the sound of the breeze.'}
    updateUI();
  }
  function beginBattle(){
    const base=creatures[rnd(0,creatures.length-1)];
    const enemy={...base,level:rnd(2,Math.max(3,game.level+1)),maxHp:base.hp+rnd(0,4)};enemy.hp=enemy.maxHp;
    game.mode='battle';game.battle={enemy,phase:'intro',message:`A wild ${enemy.name} appeared!`,turn:0,orbTried:false};game.message=`A wild ${enemy.name} appeared!`;updateUI();
  }
  function enemyTurn(){
    const b=game.battle;if(!b||game.mode!=='battle')return;
    const damage=rnd(2,5)+Math.floor(b.enemy.level/3);game.hp=Math.max(0,game.hp-damage);
    if(game.hp<=0){game.hp=game.maxHp;game.mode='map';game.battle=null;game.x=12;game.y=18;game.message='Voltkit had a little rest at the lab and feels much better.';showToast('Rested up at the field lab.');updateUI();return}
    b.phase='enemyMsg';b.message=`${b.enemy.name} gave a playful bump!  −${damage} vitality.`;game.message=b.message;updateUI();
  }
  function attack(kind){
    const b=game.battle;if(!b||b.phase!=='menu')return;
    if(kind==='snack'){
      if(game.potions<=0){b.phase='enemyMsg';b.message='Your snack pouch is empty!';return}
      if(game.hp>=game.maxHp){b.phase='enemyMsg';b.message='Voltkit is already feeling bright and bouncy!';return}
      game.potions--;const healed=Math.min(14,game.maxHp-game.hp);game.hp+=healed;b.phase='enemyMsg';b.message=`Voltkit munched a berry snack.  +${healed} vitality!`;updateUI();return;
    }
    if(kind==='orb'){
      if(game.caught>0){b.phase='enemyMsg';b.message='Your trail pouch is empty. You already made a friend!';return}
      if(b.enemy.hp>b.enemy.maxHp*.58&&!b.orbTried){b.orbTried=true;b.phase='enemyMsg';b.message=`${b.enemy.name} isn't ready to be friends just yet...`;return}
      b.phase='enemyMsg';b.message=`You tossed a little Trail Orb toward ${b.enemy.name}...`;b.pendingCapture=true;return;
    }
    const damage=kind==='spark'?rnd(7,11)+game.level:rnd(4,8)+game.level;
    b.enemy.hp=Math.max(0,b.enemy.hp-damage);b.turn++;
    if(b.enemy.hp<=0){
      game.wins++;game.xp+=12;
      if(game.xp>=24){game.xp-=24;game.level++;game.maxHp+=3;game.hp=Math.min(game.maxHp,game.hp+8);}
      b.phase='winMsg';b.message=`${b.enemy.name} bounced away. Voltkit gained a little confidence!`;game.message=b.message;updateUI();
    }else{b.phase='enemyMsg';b.message=`Voltkit used ${kind==='spark'?'SPARK':'TAIL WHIP'}!  ${b.enemy.name} −${damage} vitality.`;b.pendingEnemy=true;}
  }
  function battleContinue(){
    const b=game.battle;if(!b)return;
    if(b.phase==='intro'){b.phase='menu';return}
    if(b.phase==='enemyMsg'){
      if(b.pendingCapture){b.pendingCapture=false;game.caught++;game.wins++;game.buddyTrail=[];game.mode='map';game.battle=null;game.message='A new friend joined the trail!';game.grassEncounterCooldown=7;showToast('A new little buddy joined your team!');updateUI();return}
      if(b.pendingEnemy){b.pendingEnemy=false;enemyTurn();return}
      b.phase='menu';return;
    }
    if(b.phase==='winMsg'){game.mode='map';game.battle=null;game.message='A good battle. Voltkit feels a little braver!';game.grassEncounterCooldown=7;updateUI();return}
  }
  function keyDown(e){
    const key=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' ','enter'].includes(key))e.preventDefault();
    if(game.keys[key])return;game.keys[key]=true;
    if(game.mode==='title'){if(key==='enter'||key===' '||key==='z')startJourney();return}
    if(game.mode==='battle'){
      if(game.battle?.phase==='menu'){
        if(key==='1'||key==='z'||key==='a')attack('spark');else if(key==='2'||key==='x'||key==='s')attack('tail');else if(key==='3')attack('snack');else if(key==='4')attack('orb');else if(key===' '||key==='enter')attack('spark');
      }else if(key===' '||key==='enter'||key==='z')battleContinue();return;
    }
    if(game.mode==='ending'){if(key===' '||key==='enter'||key==='z')interact();return}
    const dirs={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'};
    if(dirs[key])move(dirs[key]);else if(key===' '||key==='enter'||key==='z')interact();
  }
  function keyUp(e){game.keys[e.key.toLowerCase()]=false}
  window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);
  document.querySelectorAll('.dpad-btn').forEach(btn=>{
    const dir=btn.dataset.dir;btn.addEventListener('pointerdown',e=>{e.preventDefault();btn.setPointerCapture(e.pointerId);if(game.mode==='title')startJourney();move(dir)});
    btn.addEventListener('pointerup',()=>{});
  });
  $('action-button').addEventListener('click',()=>{if(game.mode==='battle'&&game.battle?.phase==='menu')attack('spark');else interact()});
  canvas.addEventListener('pointerdown',e=>{
    const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;
    if(game.mode==='battle'){
      if(game.battle?.phase==='menu'&&y>198){const slot=Math.min(3,Math.max(0,Math.floor(x/96)));attack(['spark','tail','snack','orb'][slot]);}
      else if(game.battle?.phase!=='menu')battleContinue();
    }else if(game.mode==='map'&&Math.abs(game.x-npc.x)+Math.abs(game.y-npc.y)<=2)interact();
  });
  $('sound-toggle').addEventListener('click',e=>{game.sound=!game.sound;e.currentTarget.querySelector('span').textContent=game.sound?'Sound on':'Sound off';showToast(game.sound?'Sound is on':'Sound is off')});
  // Repeated movement supports held keyboard keys with a deliberate, cozy pace.
  function loop(now){
    const dt=Math.min(40,now-game.lastTime);game.lastTime=now;game.anim=now;
    if(game.mode==='map'){
      game.moveClock+=dt;if(game.grassEncounterCooldown>0)game.grassEncounterCooldown-=dt/1000;
      if(game.moveClock>155){let dir=null;if(game.keys.arrowup||game.keys.w)dir='up';else if(game.keys.arrowdown||game.keys.s)dir='down';else if(game.keys.arrowleft||game.keys.a)dir='left';else if(game.keys.arrowright||game.keys.d)dir='right';if(dir){move(dir);game.moveClock=0}}
    }
    render();requestAnimationFrame(loop);
  }
  updateUI();requestAnimationFrame(loop);
})();
