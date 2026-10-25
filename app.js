const $ = s => document.querySelector(s);
const content = window.CARD_CONTENT;
const visited = new Set();
let catActive = false, transitioning = false;
const doorNames = ['star', 'bell', 'snowflake'];
let active = 0, started = false, soundOn = false, audio, finaleTimer;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ns = 'http://www.w3.org/2000/svg';
for(let i=0;i<65;i++){
 const flake=document.createElementNS(ns,'circle');
 flake.setAttribute('cx',210+((i*137)%580));flake.setAttribute('cy',45+((i*83)%500));flake.setAttribute('r',i%4===0?2:1.2);flake.setAttribute('fill','#edf2df');flake.classList.add('flake');flake.style.setProperty('--duration',`${8+i%9}s`);flake.style.setProperty('--delay',`-${i%17}s`);$('#flakes').append(flake);
}
const strands=[[[614,332],[632,339],[651,343],[670,339],[683,334]],[[596,389],[618,400],[642,406],[665,405],[689,397],[703,390]],[[579,456],[600,467],[623,474],[647,477],[671,474],[696,466],[720,456]]];
strands.forEach((points,group)=>points.forEach(([x,y])=>{const b=document.createElementNS(ns,'circle');b.setAttribute('cx',x);b.setAttribute('cy',y);b.setAttribute('r','4');b.classList.add('bulb');b.dataset.group=group;$('#bulbs').append(b)}));
function chime(notes=[523.25,659.25,783.99]){if(!soundOn)return;audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume();notes.forEach((freq,i)=>{const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.type='sine';oscillator.frequency.value=freq;gain.gain.setValueAtTime(0,audio.currentTime+i*.16);gain.gain.linearRampToValueAtTime(.07,audio.currentTime+i*.16+.02);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+i*.16+1);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(audio.currentTime+i*.16);oscillator.stop(audio.currentTime+i*.16+1.1)})}
$('#sound').onclick=()=>{soundOn=!soundOn;$('#sound').setAttribute('aria-pressed',soundOn);$('#sound span').textContent=soundOn?'Sound on':'Sound off';if(!soundOn)stopCatSound();chime([659.25,783.99])};
$('#begin').onclick=()=>{started=true;$('#begin').hidden=true;$('#doors').inert=false;$('#cat-gifts').inert=false;soundOn=true;$('#sound').setAttribute('aria-pressed','true');$('#sound span').textContent='Sound on';$('#progress').hidden=false;updateGuidance();chime();$('.door').focus()};
function updateGuidance(){
 const next = content.stories.findIndex((_,i)=>!visited.has(i));
 document.querySelectorAll('.door').forEach((door,i)=>door.classList.toggle('suggested',i===next));
 $('#next-door').hidden=next===-1;
 if(next===-1)return;
 $('#instruction').textContent='Tap a star, bell, or snowflake door to open a greeting.';
 $('#status').textContent=visited.size===0?'Each greeting adds a little light to our tree.':`${visited.size} of 3 greetings opened. ${visited.size===1?'Two more doors to discover.':'One last door to discover.'}`;
 $('#next-door').textContent=visited.size===0?'Open the first door →':visited.size===1?'Open the next door →':'Open the last door →';
}
$('#next-door').onclick=()=>{const next=content.stories.findIndex((_,i)=>!visited.has(i));if(next!==-1)openStory(next)};
function openStory(index, isCat=false){clearTimeout(finaleTimer);catActive=isCat;active=index;const story=isCat?content.cats[index]:content.stories[index];const portrait=$('#portrait');portrait.className=`portrait ${story.theme}`;portrait.replaceChildren();if(story.image){const img=document.createElement('img');img.src=story.image;img.alt=story.photoLabel;portrait.append(img)}else{for(const [className,text] of [['symbol',story.symbol],['caption',story.caption],['photo-label',`${story.photoLabel} · photo placeholder`]]){const el=document.createElement('span');el.className=className;el.textContent=text;portrait.append(el)}}$('#story-kicker').textContent=story.kicker;$('#story-title').textContent=story.title;$('#story-message').textContent=story.message;$('.reading-hint').textContent=isCat?'A little extra Christmas cheer, just for you.':'When you’re ready, light the tree to continue.';$('#light').textContent=isCat?'Back to the Christmas magic':visited.has(index)?'Back to our Christmas globe':'Light the tree & continue ✧';$('#story-dialog').showModal();if(!isCat)chime([392,523.25])}
document.querySelectorAll('.door').forEach(button=>button.onclick=()=>openStory(Number(button.dataset.story)));
const giftButtons=[...document.querySelectorAll('.cat-gift')];
let giftEncouragementTimer, giftWaitingSeconds=0;
let catClip, catVoice, lastMeow=-Infinity, hintTimer, hideHintTimer, nextHint=0;
function stopGiftEncouragement(){
 clearInterval(giftEncouragementTimer);giftEncouragementTimer=undefined;giftWaitingSeconds=0;
 giftButtons.forEach(button=>delete button.dataset.excitement);
}
function updateGiftEncouragement(){
 const unopened=giftButtons.filter(button=>!button.classList.contains('discovered'));
 if(!unopened.length){stopGiftEncouragement();return;}
 const level=giftWaitingSeconds>=18?3:giftWaitingSeconds>=8?2:1;
 giftButtons.forEach(button=>{if(button.classList.contains('discovered'))delete button.dataset.excitement;else button.dataset.excitement=String(level)});
}
function startGiftEncouragement(){
 if(giftEncouragementTimer!==undefined)return;
 if(giftButtons.every(button=>button.classList.contains('discovered')))return;
 updateGiftEncouragement();
 giftEncouragementTimer=setInterval(()=>{
  if(document.hidden||$('#story-dialog').open||transitioning||$('.experience').hidden)return;
  giftWaitingSeconds=Math.min(18,giftWaitingSeconds+1);updateGiftEncouragement();
 },1000);
}
function stopCatSound(){if(catClip){catClip.pause();catClip=null;}if(catVoice){try{catVoice.stop()}catch{}catVoice=null;}}
function placeholderMeow(index){
 audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume();
 const voice=audio.createOscillator(),filter=audio.createBiquadFilter(),gain=audio.createGain();
 const now=audio.currentTime,pitch=index===0?540:680;
 voice.type='sawtooth';voice.frequency.setValueAtTime(pitch*.72,now);voice.frequency.exponentialRampToValueAtTime(pitch,now+.13);voice.frequency.exponentialRampToValueAtTime(pitch*.82,now+.35);voice.frequency.exponentialRampToValueAtTime(pitch*.48,now+.75);
 filter.type='lowpass';filter.Q.value=3;filter.frequency.setValueAtTime(1800,now);filter.frequency.exponentialRampToValueAtTime(550,now+.75);
 gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(.035,now+.07);gain.gain.exponentialRampToValueAtTime(.001,now+.8);
 voice.connect(filter);filter.connect(gain);gain.connect(audio.destination);voice.start(now);voice.stop(now+.82);catVoice=voice;
 voice.onended=()=>{voice.disconnect();filter.disconnect();gain.disconnect();if(catVoice===voice)catVoice=null;};
}
function meow(index){
 if(!soundOn||document.hidden||transitioning||performance.now()-lastMeow<1600)return;
 lastMeow=performance.now();stopCatSound();
 const source=content.cats[index].sound;
 if(source){const clip=new Audio(source);catClip=clip;clip.volume=.5;clip.play().catch(()=>{if(soundOn&&catClip===clip)placeholderMeow(index)});}
 else placeholderMeow(index);
}
function showCatHint(button){
 clearTimeout(hideHintTimer);giftButtons.forEach(gift=>gift.classList.remove('hinting'));
 button.classList.add('hinting');hideHintTimer=setTimeout(()=>button.classList.remove('hinting'),2000);
}
function scheduleCatHint(){
 clearTimeout(hintTimer);
 hintTimer=setTimeout(()=>{
  if(started&&!document.hidden&&!$('.experience').hidden&&!$('#story-dialog').open&&!transitioning){const unopened=giftButtons.filter(button=>!button.classList.contains('discovered'));if(unopened.length){showCatHint(unopened[nextHint%unopened.length]);nextHint++;}}
  scheduleCatHint();
 },5500+Math.random()*6500);
}
scheduleCatHint();
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopCatSound()});
giftButtons.forEach(button=>{
 const index=Number(button.dataset.cat);
 button.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){showCatHint(button);meow(index)}});
 button.addEventListener('focus',()=>showCatHint(button));
 button.onclick=()=>{button.classList.add('discovered');delete button.dataset.excitement;if(visited.size===3)updateGiftEncouragement();meow(index);openStory(index,true)};
});
function addLight(){if(catActive){$('#story-dialog').close();return;}const isNew=!visited.has(active);visited.add(active);document.querySelector(`[data-story="${active}"]`).classList.add('visited');document.querySelector(`[data-story="${active}"]`).setAttribute('aria-label',`Reopen the ${doorNames[active]} door: ${content.stories[active].title}`);document.querySelectorAll('.bulb').forEach(b=>b.classList.toggle('lit',Number(b.dataset.group)<visited.size));document.querySelectorAll('.steps i').forEach((s,i)=>s.classList.toggle('lit',i<visited.size));$('#status').textContent=`${visited.size} of 3 Christmas wishes shared`;if(isNew)chime();$('#story-dialog').close();updateGuidance();if(visited.size===3){$('#world').classList.add('complete');$('#instruction').textContent='A little love from each of us. A little light for you.';$('#status').textContent='Our tree is glowing! Peek at the meowing gifts, or see our Christmas card.';$('#finish').hidden=false;startGiftEncouragement();}}
function scheduleFinalReveal(){
 clearTimeout(finaleTimer);
 if(visited.size!==3||!giftButtons.every(button=>button.classList.contains('discovered'))||$('#story-dialog').open||$('.experience').hidden||transitioning||document.hidden)return;
 $('#status').textContent='Every wish shared, every surprise found. One last bit of Christmas magic…';
 finaleTimer=setTimeout(()=>{
  if(!$('#story-dialog').open&&!$('.experience').hidden&&!document.hidden&&!transitioning)showFinal();
 },4000);
}
// Start the pause only after a greeting closes, including Escape and the close button.
$('#story-dialog').addEventListener('close',scheduleFinalReveal);
document.addEventListener('visibilitychange',()=>{
 if(document.hidden)clearTimeout(finaleTimer);else scheduleFinalReveal();
});
$('#light').onclick=addLight;
$('.close').onclick=()=>$('#story-dialog').close();
$('#story-dialog').addEventListener('click',event=>{if(event.target===$('#story-dialog')){const r=event.target.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)event.target.close()}});
const magicStars=$('.magic-stars');
for(let i=0;i<48;i++){const spark=document.createElement('span');spark.textContent=i%3===0?'✧':'·';spark.style.setProperty('--x',`${(i*37)%100}%`);spark.style.setProperty('--y',`${(i*61)%100}%`);spark.style.setProperty('--spin',`${i*29}deg`);spark.style.setProperty('--delay',`${i%8*.08}s`);magicStars.append(spark)}
function showFinal(){
 clearTimeout(finaleTimer);if($('#story-dialog').open||transitioning)return;transitioning=true;stopGiftEncouragement();$('.experience').inert=true;
 chime([523.25,659.25,783.99,1046.5]);$('#world').classList.add('enchanted');$('.transition').classList.add('go');
 setTimeout(()=>{$('.experience').hidden=true;$('.experience').inert=false;$('#final').hidden=false;if(content.finalImage&&!$('#card-image img')){const img=document.createElement('img');img.src=content.finalImage;img.alt='The Lisowski family Christmas card';$('#card-image').replaceChildren(img)}$('#final-title').focus();window.scrollTo({top:0,behavior:'instant'})},reduced?0:3100);
 setTimeout(()=>{$('.transition').classList.remove('go');$('#world').classList.remove('enchanted');transitioning=false},reduced?0:4600);
}
$('#finish').onclick=showFinal;
$('#replay').onclick=()=>{stopGiftEncouragement();clearTimeout(finaleTimer);visited.clear();document.querySelectorAll('.cat-gift').forEach(el=>el.classList.remove('discovered'));$('#final').hidden=true;$('.experience').hidden=false;$('#world').classList.remove('complete');document.querySelectorAll('.lit').forEach(el=>el.classList.remove('lit'));document.querySelectorAll('.door').forEach((el,i)=>{el.classList.remove('visited');el.setAttribute('aria-label',`Open the ${doorNames[i]} door: ${content.stories[i].title}`)});$('#finish').hidden=true;updateGuidance();$('.door').focus();window.scrollTo({top:0,behavior:'instant'})};
