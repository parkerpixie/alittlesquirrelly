(() => {
  'use strict';
  const KEY = 'a-little-squirrelly:v1';
  const $ = id => document.getElementById(id);
  const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const localDay = (date=new Date()) => [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
  const today = () => localDay(new Date());
  const uid = () => globalThis.crypto?.randomUUID?.() || 'id-'+Date.now()+'-'+Math.random().toString(36).slice(2);
  // Public meeting details: https://fitchburgserenityclub.com/zoom-meeting-schedule/
  const DEFAULT_MEETING_URL = 'https://us02web.zoom.us/j/8269797361';
  const DEFAULT_MEETING_PASSCODE = '54321';
  const defaults = () => ({version:1,settings:{name:'Michelle',meetingUrl:DEFAULT_MEETING_URL,meetingPasscode:DEFAULT_MEETING_PASSCODE},gratitude:[],feelings:[],notes:[],tools:[],oraclePulls:[]});
  function validData(x){return x && typeof x==='object' && !Array.isArray(x) && ['gratitude','feelings','notes','tools','oraclePulls'].every(k=>Array.isArray(x[k])) && x.settings && typeof x.settings==='object'}
  function load(){
    try {const raw=localStorage.getItem(KEY);if(!raw)return defaults();const v=JSON.parse(raw);if(validData(v))return v;throw Error('unexpected data format')}
    catch(e){alert('Your saved data could not be read safely. This app will not overwrite it. Please export your browser data before making changes.');return null}
  }
  let state=load();if(!state)return;
  let month=today().slice(0,7), chosenDay=today(), currentFamily=null, chosenWords=[], intensity=null, lastTool='halt', activeCard=0, currentTool=null, wheelRotation=0, pointerDown=null;
  function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));return true}catch(e){toast('Could not save on this device. Please check your storage.');return false}}
  function addTo(collection,record){state[collection].push(record);if(!persist()){state[collection].pop();return false}render();return true}
  function toast(message){const el=$('toast');el.textContent=message;el.classList.add('visible');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('visible'),3400)}
  const families = [
    {id:'happy',label:'Good',hint:'There is room for the good stuff too.',words:['Grateful','Hopeful','Content','Joyful','Proud','Connected','Excited','Relieved','Calm']},
    {id:'sad',label:'Sad',hint:'No need to make it better before you name it.',words:['Lonely','Hurt','Disappointed','Grieving','Unseen','Empty','Vulnerable','Discouraged']},
    {id:'angry',label:'Angry',hint:'Anger can tell you something important.',words:['Frustrated','Irritated','Resentful','Disrespected','Furious','Betrayed','Defensive','Annoyed']},
    {id:'scared',label:'Scared',hint:'What feels uncertain or threatening?',words:['Worried','Anxious','Panicked','Nervous','Uncertain','Overthinking','Dreading','Insecure']},
    {id:'off',label:'Off',hint:'Off is a perfectly legitimate feeling category.',words:['Overwhelmed','Tired','Numb','Restless','Stuck','Scattered','Burned out','Shut down']},
    {id:'surprised',label:'Surprised',hint:'Sometimes the day goes sideways in an interesting way.',words:['Amazed','Curious','Confused','Shocked','Awestruck','Caught off guard','Inspired','Unsure']}
  ];
  const tools=[
    {id:'stop',name:'STOP',icon:'✋',when:'Before you react.',intro:'Put a little space between the feeling and the next thing you do.',steps:['Stop: briefly freeze the action.','Take a step back: breathe or move away for a moment.','Observe: what are you noticing in your thoughts, body and surroundings?','Proceed mindfully: choose the next thing that works for you.']},
    {id:'halt',name:'HALT',icon:'☕',when:'When everything feels harder than usual.',intro:'Sometimes the basics are calling the shots.',steps:['Hungry? Would a snack or meal help?','Angry? Is something upsetting you or pushing a boundary?','Lonely? Would reaching out to someone help?','Tired? What rest or quiet is possible today?']},
    {id:'rain',name:'RAIN',icon:'☔',when:'When a feeling deserves some compassion.',intro:'Recognize, Allow, Investigate, Nurture. You may skip any part.',steps:['Recognize: what is here right now?','Allow: can this feeling exist for a moment without a fight?','Investigate gently: what might this feeling need? Skip if it is too much.','Nurture: what kindness can you offer yourself?']},
    {id:'facts',name:'Check the Facts',icon:'🔎',when:'When your brain is writing a whole screenplay.',intro:'A feeling is real. The story around it might be incomplete.',steps:['What happened that someone else could observe?','Which parts are your interpretation or prediction?','What do you not know yet?','What response would fit the facts you actually have?']},
    {id:'tipp',name:'TIPP (gentle)',icon:'🌊',when:'When feelings feel very intense.',intro:'A body-first reset. Pick what is safe and comfortable; avoid extreme temperatures or strenuous movement.',steps:['Try a cool cloth on your face or hands if comfortable.','Move gently for a minute, if that feels safe.','Let your exhale be a little longer than your inhale.','Unclench your jaw and relax your shoulders. Notice what changes.']},
    {id:'ground',name:'5–4–3–2–1',icon:'◉',when:'When you want to return to right now.',intro:'Use your senses to reconnect with the present.',steps:['Name five things you can see.','Name four things you can feel.','Name three things you can hear.','Name two things you can smell.','Name one thing you can taste, or something you like about this moment.']},
    {id:'soothe',name:'Self Soothe',icon:'♥',when:'When you need a little comfort.',intro:'Comfort is not something you have to earn.',steps:['Choose one sense: sight, sound, touch, smell or taste.','Find one safe, pleasant sensation nearby.','Stay with it for a few breaths.','What would a kind next step look like?']},
    {id:'wise',name:'Wise Mind',icon:'✦',when:'When heart and head disagree.',intro:'Your feelings and your facts both get a seat at the table.',steps:['What is your feeling saying?','What does your practical side know?','What action respects both, even imperfectly?']}
  ];
  const GRAPHICS = 'assets/graphics/';
  const feelingArt = {happy:'feelings-good.png',sad:'feelings-sad.png',angry:'feelings-angry.png',scared:'feelings-scared.png',off:'feelings-off.png',surprised:'feelings-surprised.png'};
  const toolArt = {stop:'tool-stop.png',halt:'tool-halt.png',rain:'tool-rain.png',facts:'tool-check-facts.png',tipp:'tool-tipp.png',ground:'tool-grounding.png',soothe:'tool-self-soothe.png',wise:'tool-wise-mind.png'};
  const recommended={
    Panicked:'tipp',Overwhelmed:'tipp','Burned out':'halt',Tired:'halt',Numb:'ground',Scattered:'halt',Furious:'stop',Frustrated:'stop',Resentful:'facts',Anxious:'ground',Overthinking:'facts',Worried:'facts',Guilty:'rain',Lonely:'soothe',Hurt:'rain',Unseen:'rain',Stuck:'wise',Confused:'wise',Grieving:'soothe',Disappointed:'rain'
  };
  const defaultTool={happy:'rain',sad:'soothe',angry:'stop',scared:'ground',off:'halt',surprised:'wise'};
  function navigate(tab){
    document.querySelectorAll('.screen').forEach(x=>x.classList.toggle('active',x.id==='screen-'+tab));
    document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab));
    window.scrollTo({top:0,behavior:'auto'});
    if(tab==='days')renderDays();if(tab==='today')renderToday();
  }
  document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.tab)));
  function render(){renderToday();renderDays()}
  function renderToday(){
    const d=new Date();const hour=d.getHours();
    // Rotate one gentle, slightly cheeky, name-free greeting each day and time of day.
    // The same greeting stays put during a session rather than changing on every render.
    const greetings=hour<12?[
      'Rise and mildly shine, you magnificent squirrel. ☕',
      'Good morning. Coffee, chaos, and character defects.',
      'One day at a time. One acorn at a time. 🐿️',
      'Morning, gorgeous. Let us not make this weird. Yet.',
      'Just for today, we are minding our own damn acorns.',
      'A little gratitude before the world gets mouthy.',
      'Good morning! Your squirrel sponsor approves. Probably.',
      'Wake up and be a tiny bit unreasonable. ☕',
      'Serenity now. Caffeine immediately.',
      'Good morning. Progress, not squirrelfection.',
      'The squirrels have convened. You are doing fine.',
      'Another 24 hours. Another chance to be delightfully odd.'
    ]:hour<17?[
      'Good afternoon. Are we being dramatic or hydrated?',
      'Plot twist: the squirrel has boundaries. 🐿️',
      'Easy does it, you fabulous disaster magnet.',
      'Not every circus needs your squirrel. ✦',
      'HALT check: hungry, angry, lonely, or just DONE?',
      'Afternoon reminder: other people are not your acorns.',
      'Keep coming back. The snacks are better here.',
      'You cannot control the nuts. Just your own stash.',
      'Do the next right thing. Then maybe get fries.',
      'Good afternoon. The audacity is complimentary.',
      'Have we tried serenity? Or a dramatic little walk?',
      'A meeting, a snack, or a nap. Choose your fighter.'
    ]:[
      'Good evening, you glorious little nutcase. 🌙',
      'Put the day down. You cannot carry every acorn.',
      'Even squirrels need to shut the hell down sometimes.',
      'Tonight we practice letting go. Aggressively.',
      'You made it through today. That is not nothing. 💜',
      'Good evening. Time to retire from managing the universe.',
      'Turn down the chaos. Turn up the cozy.',
      'One day at a time. Pajamas at a reasonable hour.',
      'Take what you need. Leave the rest for the squirrels.',
      'Evening inventory: feelings felt, acorns optional.',
      'The squirrels voted. You are off duty.',
      'Rest is not a moral failing, you fabulous weirdo.'
    ];
    const dayNumber=Math.floor(new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime()/86400000);
    $('todayTitle').textContent=greetings[((dayNumber%greetings.length)+greetings.length)%greetings.length];
    $('todayDate').textContent=d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
    for(const period of ['am','pm']){
      const items=state.gratitude.filter(g=>g.day===today()&&g.period===period);
      $(period+'Count').textContent=items.length+' / 3';
      $(period+'Items').innerHTML=items.map(g=>'<div class="entry-item"><span class="leaf">✦</span><span>'+safe(g.text)+'</span><button class="mini-delete" data-remove-gratitude="'+safe(g.id)+'" type="button" aria-label="Remove gratitude">×</button></div>').join('');
      $(period+'Input').disabled=items.length>=3;document.querySelector('#'+period+'Form button').disabled=items.length>=3;
      $(period+'Input').placeholder=items.length>=3?'Three things saved. That counts.':'One thing, big or small...';
    }
    const latest=[...state.feelings].sort((a,b)=>String(b.at).localeCompare(String(a.at)))[0];
    $('latestFeeling').textContent=latest?'Last check-in: '+latest.words.map(x=>x.word).join(' · '):'No check-in yet. Whenever you feel like it.';
    $('meetingCaption').textContent=safeUrl(state.settings.meetingUrl || DEFAULT_MEETING_URL)?'Every day · 7:30 AM CT · Code '+(state.settings.meetingPasscode||DEFAULT_MEETING_PASSCODE):'Add a meeting link';
    const meeting=meetingJoinDetails();if(meeting)$('zoomBackupLink').href=meeting.url;
  }
  function safeUrl(url){try{const x=new URL(url);return x.protocol==='https:'?x.href:null}catch{return null}}
  function addGratitude(event,period){
    event.preventDefault();const input=$(period+'Input'),text=input.value.trim();if(!text)return;
    if(state.gratitude.filter(g=>g.day===today()&&g.period===period).length>=3)return;
    if(addTo('gratitude',{id:uid(),day:today(),period,text,at:new Date().toISOString()})){input.value='';toast('A little good thing, saved. ✦')}
  }
  $('amForm').addEventListener('submit',e=>addGratitude(e,'am'));
  $('pmForm').addEventListener('submit',e=>addGratitude(e,'pm'));
  document.addEventListener('click',event=>{
    const b=event.target.closest('[data-remove-gratitude]');if(!b)return;
    const index=state.gratitude.findIndex(g=>g.id===b.dataset.removeGratitude);if(index<0)return;
    if(!confirm('Remove this gratitude entry?'))return;const old=state.gratitude.splice(index,1)[0];if(!persist())state.gratitude.splice(index,0,old);render();
  });
  $('noteForm').addEventListener('submit',e=>{e.preventDefault();const t=$('noteInput').value.trim();if(t&&addTo('notes',{id:uid(),day:today(),text:t,at:new Date().toISOString()})){$('noteInput').value='';toast('Kept safe in My Days.')}});
  function meetingJoinDetails(){
    const url=safeUrl(state.settings.meetingUrl || DEFAULT_MEETING_URL);
    if(!url)return null;
    const parsed=new URL(url);
    // Custom non-Zoom links still open normally.
    const isZoom=parsed.hostname==='zoom.us' || parsed.hostname.endsWith('.zoom.us');
    const parts=parsed.pathname.split('/').filter(Boolean);
    const meetingId=isZoom && parts.length===2 && parts[0]==='j' &&
      parts[1].length>0 && [...parts[1]].every(ch=>ch>='0'&&ch<='9')?parts[1]:null;
    const passcode=state.settings.meetingPasscode || DEFAULT_MEETING_PASSCODE;
    return {url,meetingId,passcode};
  }
  function isMobileZoomDevice(){
    const agent=navigator.userAgent || '';
    return /Android|iPhone|iPad|iPod/i.test(agent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
  }
  $('meetingButton').addEventListener('click',()=>{
    const details=meetingJoinDetails();
    if(!details){openDialog('settingsDialog');$('meetingUrl').focus();toast('Set your meeting link to join.');return}
    if(!details.meetingId){
      window.open(details.url,'_blank','noopener,noreferrer');
      toast('Opening your saved meeting link.');
      return;
    }
    // Zoom's legacy native URL protocol is not officially supported.
    // Use a direct user tap; keep the standard HTTPS link available below.
    // HTTPS invitation ?pwd= values are encoded tokens, not raw passcodes.
    const scheme=isMobileZoomDevice()?'zoomus':'zoommtg';
    const deepLink=scheme+'://zoom.us/join?confno='+encodeURIComponent(details.meetingId)+'&pwd='+encodeURIComponent(details.passcode);
    window.location.href=deepLink;
    toast('Trying the Zoom app. If it does not launch, use the regular link below.');
  });
  function setFamily(id){
    currentFamily=families.find(f=>f.id===id);if(!currentFamily)return;
    const image=$('feelingFamilyArt');image.src=GRAPHICS+feelingArt[id];image.hidden=false;
    $('familyTitle').textContent=currentFamily.label+' can mean a lot.';
    $('familyHint').textContent=currentFamily.hint;
    $('feelingWords').innerHTML=currentFamily.words.map(w=>'<button class="chip '+(chosenWords.some(x=>x.word===w)?'selected':'')+'" type="button" data-word="'+safe(w)+'">'+safe(w)+'</button>').join('');
    $('feelingForm').hidden=chosenWords.length===0;renderSelected();
    document.querySelectorAll('[data-family]').forEach(b=>b.classList.toggle('selected',b.dataset.family===id));
  }
  function renderSelected(){
    $('selectedWords').innerHTML=chosenWords.map(x=>'<span class="tag">'+safe(x.word)+'</span>').join('');
    $('feelingForm').hidden=chosenWords.length===0;
    if(currentFamily)document.querySelectorAll('[data-word]').forEach(b=>b.classList.toggle('selected',chosenWords.some(x=>x.word===b.dataset.word)));
  }
  document.querySelectorAll('[data-family]').forEach(b=>b.addEventListener('click',()=>setFamily(b.dataset.family)));
  $('feelingWords').addEventListener('click',event=>{
    const b=event.target.closest('[data-word]');if(!b||!currentFamily)return;
    const i=chosenWords.findIndex(x=>x.word===b.dataset.word);if(i>=0)chosenWords.splice(i,1);else chosenWords.push({word:b.dataset.word,family:currentFamily.id});
    renderSelected();
  });
  $('intensityChoices').addEventListener('click',e=>{const b=e.target.closest('[data-intensity]');if(!b)return;const v=Number(b.dataset.intensity);intensity=intensity===v?null:v;document.querySelectorAll('[data-intensity]').forEach(x=>x.classList.toggle('selected',Number(x.dataset.intensity)===intensity))});
  $('feelingForm').addEventListener('submit',e=>{
    e.preventDefault();if(!chosenWords.length)return;
    const words=chosenWords.map(x=>({...x}));
    if(addTo('feelings',{id:uid(),day:today(),words,intensity,note:$('feelingNote').value.trim(),at:new Date().toISOString()})){
      lastTool=words.map(x=>recommended[x.word]).find(Boolean)||defaultTool[words[0].family]||'halt';
      $('savedFeelingTitle').textContent=words.map(x=>x.word).join(' · ');
      $('savedFeelingCard').hidden=false;$('feelingDetails').hidden=true;
      $('savedFeelingCard').scrollIntoView({behavior:'smooth',block:'start'});toast('Feeling saved. That is enough.');
    }
  });
  function resetFeeling(){chosenWords=[];intensity=null;currentFamily=null;$('feelingDetails').hidden=false;$('savedFeelingCard').hidden=true;$('familyTitle').textContent='Tap a feeling on the wheel.';$('familyHint').textContent='No perfect answer. Just what fits.';$('feelingWords').innerHTML='';$('selectedWords').innerHTML='';$('feelingFamilyArt').hidden=true;$('feelingForm').hidden=true;$('feelingNote').value='';document.querySelectorAll('[data-family],[data-intensity]').forEach(b=>b.classList.remove('selected'))}
  $('againButton').addEventListener('click',resetFeeling);
  $('trySuggestedTool').addEventListener('click',()=>openTool(lastTool));
  const wheel=$('wheel');
  function rotateWheel(deg){wheelRotation=deg;wheel.style.transform='rotate('+deg+'deg)'}
  $('spinButton').addEventListener('click',()=>{const n=Math.floor(Math.random()*6);rotateWheel(wheelRotation+720+n*60);setTimeout(()=>setFamily(families[(6-(n%6))%6].id),650)});
  wheel.addEventListener('pointerdown',e=>{if(e.target.closest('[data-family]'))return;const box=wheel.getBoundingClientRect();pointerDown={x:e.clientX,y:e.clientY,cx:box.left+box.width/2,cy:box.top+box.height/2,angle:Math.atan2(e.clientY-(box.top+box.height/2),e.clientX-(box.left+box.width/2))*180/Math.PI,rotation:wheelRotation};wheel.setPointerCapture(e.pointerId);wheel.style.transition='none'});
  wheel.addEventListener('pointermove',e=>{if(!pointerDown)return;const a=Math.atan2(e.clientY-pointerDown.cy,e.clientX-pointerDown.cx)*180/Math.PI;rotateWheel(pointerDown.rotation+a-pointerDown.angle)});
  wheel.addEventListener('pointerup',()=>{if(!pointerDown)return;pointerDown=null;wheel.style.transition='transform .6s cubic-bezier(.2,.75,.15,1)';const idx=((Math.round((-wheelRotation%360)/60)%6)+6)%6;setFamily(families[idx].id)});
  function renderTools(){
    $('toolsGrid').innerHTML=tools.map(t=>'<button class="tool-tile" type="button" data-tool="'+safe(t.id)+'"><img class="tool-graphic" src="'+GRAPHICS+toolArt[t.id]+'" alt="" loading="lazy"><span><strong>'+safe(t.name)+'</strong><small>'+safe(t.when)+'</small></span><span class="arrow">›</span></button>').join('');
  }
  $('toolsGrid').addEventListener('click',e=>{const b=e.target.closest('[data-tool]');if(b)openTool(b.dataset.tool)});
  // Full-size worksheets are bundled with the app or hosted in GrizzlyJohn.
  const detailedSheets = {
    stop:'STOP Skill.png', halt:'graphics/HALT Skill.png', facts:'Check The Facts Skill.png',
    tipp:'TIPP Skill.png', soothe:'Self Soothe Skill.png', wise:'WISE MIND Skill.png'
  };
  const sheetBase='https://raw.githubusercontent.com/parkerpixie/GrizzlyJohn/main/';
  function openTool(id){
    const t=tools.find(x=>x.id===id);if(!t)return;currentTool=t;
    $('toolCategory').textContent='ONE LITTLE NEXT MOVE';$('toolName').textContent=t.name;$('toolIllustration').src=GRAPHICS+toolArt[t.id];$('toolIntro').textContent=t.intro;
    $('toolSteps').innerHTML=t.steps.map((s,i)=>'<div class="tool-step"><strong>'+String(i+1)+'.</strong> '+safe(s)+'</div>').join('');
    let sheetLink=$('fullSkillSheet');
    if(!sheetLink){
      sheetLink=document.createElement('a');sheetLink.id='fullSkillSheet';
      sheetLink.className='button outline';sheetLink.target='_blank';sheetLink.rel='noopener noreferrer';
      sheetLink.style.margin='14px 0 10px';
      $('finishTool').parentNode.insertBefore(sheetLink,$('finishTool'));
    }
    const sheetPath=id==='rain'
      ? GRAPHICS+'rain-skill-guide.png'
      : detailedSheets[id] && sheetBase+detailedSheets[id].split('/').map(encodeURIComponent).join('/');
    if(sheetPath){
      sheetLink.href=sheetPath;
      sheetLink.textContent='📖 View the full illustrated skill guide ↗';sheetLink.hidden=false;
    }else{sheetLink.hidden=true;sheetLink.removeAttribute('href')}
    openDialog('toolsDialog');
  }
  $('finishTool').addEventListener('click',()=>{if(!currentTool)return;const name=currentTool.name;if(addTo('tools',{id:uid(),day:today(),toolId:currentTool.id,at:new Date().toISOString()})){closeDialog('toolsDialog');toast(name+' saved. One little victory.')}});
  function parseDay(d){return new Date(d+'T12:00:00')}
  function dayLabel(d){return parseDay(d).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}
  function hasDay(d){return ['gratitude','feelings','notes','tools'].some(k=>state[k].some(x=>x.day===d))||state.oraclePulls.some(x=>x.day===d)}
  function renderDays(){
    const [year,mon]=month.split('-').map(Number),start=new Date(year,mon-1,1),length=new Date(year,mon,0).getDate(),offset=start.getDay();
    $('monthTitle').textContent=start.toLocaleDateString('en-US',{month:'long',year:'numeric'});
    let html='';for(let i=0;i<offset;i++)html+='<span></span>';
    for(let n=1;n<=length;n++){const d=month+'-'+String(n).padStart(2,'0');html+='<button type="button" data-date="'+d+'" class="'+(hasDay(d)?'has-data ':'')+(d===chosenDay?'active ':'')+(d===today()?'today':'')+'" aria-label="'+dayLabel(d)+'">'+n+'</button>'}
    $('calendarGrid').innerHTML=html;$('selectedDayTitle').textContent=dayLabel(chosenDay);
    const timeline=[];
    state.gratitude.filter(x=>x.day===chosenDay).forEach(x=>timeline.push({at:x.at,label:x.period==='am'?'MORNING GRATITUDE':'EVENING GRATITUDE',value:x.text}));
    state.feelings.filter(x=>x.day===chosenDay).forEach(x=>timeline.push({at:x.at,label:'FEELING',value:x.words.map(y=>y.word).join(' · ')+(x.intensity?' (intensity '+x.intensity+'/5)':'')+(x.note?'\n'+x.note:'')}));
    state.notes.filter(x=>x.day===chosenDay).forEach(x=>timeline.push({at:x.at,label:'THOUGHT',value:x.text}));
    state.tools.filter(x=>x.day===chosenDay).forEach(x=>timeline.push({at:x.at,label:'TOOL TRIED',value:tools.find(t=>t.id===x.toolId)?.name||x.toolId}));
    state.oraclePulls.filter(x=>x.day===chosenDay).forEach(x=>timeline.push({at:x.at||'',label:'ORACLE CARD',value:cardTitle(x.index),cardIndex:x.index}));
    timeline.sort((a,b)=>String(a.at).localeCompare(String(b.at)));
    $('selectedDayContent').innerHTML=timeline.length?'<div class="timeline">'+timeline.map(t=>'<div class="timeline-item"><strong>'+safe(t.label)+'</strong><p>'+safe(t.value)+'</p>'+(Number.isInteger(t.cardIndex)?'<button type="button" class="history-card-button" data-history-card="'+t.cardIndex+'">View this card ↗</button>':'')+'</div>').join('')+'</div>':'<div class="empty illustrated-empty"><img src="assets/graphics/empty-state.png" alt="" loading="lazy"><span>No notes here. Blank days are allowed.</span></div>';
    const days=new Set([...state.gratitude,...state.feelings,...state.notes,...state.tools].map(x=>x.day));
    const count=state.feelings.length;
    if(!count&&!state.gratitude.length){$('patterns').innerHTML='<p class="subtle">Give it some time. There is no score to chase.</p>';return}
    const counts={};state.feelings.forEach(f=>f.words.forEach(x=>counts[x.word]=(counts[x.word]||0)+1));const common=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([name,num])=>name+' ('+num+')');
    $('patterns').innerHTML='<p class="subtle">'+days.size+' day'+(days.size===1?'':'s')+' with entries · '+state.gratitude.length+' gratitude notes · '+state.feelings.length+' feeling check-ins.</p>'+(common.length?'<p style="margin-top:9px"><strong>Feelings you have named:</strong> '+safe(common.join(', '))+'.</p>':'')+'<p class="subtle" style="margin-top:8px">Just observations, not labels or conclusions.</p>';
  }
  $('selectedDayContent').addEventListener('click',e=>{const b=e.target.closest('[data-history-card]');if(!b)return;const i=Number(b.dataset.historyCard);if(state.oraclePulls.some(x=>x.day===chosenDay&&x.index===i))openCard(i)});
  $('calendarGrid').addEventListener('click',e=>{const b=e.target.closest('[data-date]');if(b){chosenDay=b.dataset.date;renderDays()}});
  function moveMonth(delta){const [year,mon]=month.split('-').map(Number),d=new Date(year,mon-1+delta,1);month=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');chosenDay=month+'-01';renderDays()}
  $('prevMonth').addEventListener('click',()=>moveMonth(-1));$('nextMonth').addEventListener('click',()=>moveMonth(1));
  function openDialog(id){const dialog=$(id);if(dialog&&!dialog.open)dialog.showModal()}
  function closeDialog(id){const dialog=$(id);if(dialog?.open)dialog.close()}
  document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>closeDialog(b.dataset.close)));
  document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close()}));
  $('openSettings').addEventListener('click',()=>openDialog('settingsDialog'));
  function showSettings(){$('displayName').value=state.settings.name||'Michelle';$('meetingUrl').value=state.settings.meetingUrl || DEFAULT_MEETING_URL;$('meetingPasscode').value=state.settings.meetingPasscode||DEFAULT_MEETING_PASSCODE}
  $('openSettings').addEventListener('click',showSettings);
  $('settingsForm').addEventListener('submit',e=>{e.preventDefault();const raw=$('meetingUrl').value.trim();if(raw&&!safeUrl(raw)){toast('Meeting links need to start with https://');return}const previous={...state.settings};state.settings={name:$('displayName').value.trim()||'friend',meetingUrl:raw || DEFAULT_MEETING_URL,meetingPasscode:$('meetingPasscode').value.trim()||DEFAULT_MEETING_PASSCODE};if(!persist())state.settings=previous;else{renderToday();closeDialog('settingsDialog');toast('Settings saved.')}});
  $('exportData').addEventListener('click',()=>{
    const payload=JSON.stringify({format:'a-little-squirrelly-backup-v1',exportedAt:new Date().toISOString(),data:state},null,2);
    const blob=new Blob([payload],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='a-little-squirrelly-backup-'+today()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('Backup downloaded. Keep it somewhere safe.');
  });
  $('importData').addEventListener('change',async e=>{
    const file=e.target.files?.[0];if(!file)return;
    try{
      if(file.size>10*1024*1024)throw Error('Backup is too large.');
      const parsed=JSON.parse(await file.text());if(parsed.format!=='a-little-squirrelly-backup-v1'||!validData(parsed.data))throw Error('This is not a valid Squirrelly backup.');
      if(!confirm('Replace the data saved on this device with this backup? Export your current data first if you want to keep it.'))return;
      const old=state;state=parsed.data;if(!persist())state=old;else{closeDialog('settingsDialog');render();toast('Your backup has been restored.')}
    }catch(error){toast(error.message||'Could not import that backup.')}finally{e.target.value=''}
  });
  const cards=Array.isArray(window.ALS_CARD_NAMES)?window.ALS_CARD_NAMES:[];
  const base='https://raw.githubusercontent.com/parkerpixie/GrizzlyJohn/main/';
  function cardUrl(index){const file=cards[index];return !file?'':(window.ALS_LOCAL_ORACLE?'assets/oracle/':base)+encodeURIComponent(file)}
  function cardTitle(index){return String(cards[index]||'Your card').replace(/\.(png|jpe?g|webp)$/i,'').replace(/\s*\(\d*\)/g,'').replace(/\(\)/g,'').replace(/\s+-\s+/,' · ').replace(/\s+/g,' ').trim()}
  function dailyPull(){return state.oraclePulls.find(x=>x.day===today())}
  function renderOracle(){
    const saved=dailyPull();
    $('oracleDaily').innerHTML=saved?'<div class="oracle-daily"><button type="button" data-card="'+saved.index+'"><img src="'+safe(cardUrl(saved.index))+'" alt="'+safe(cardTitle(saved.index))+'"><strong>Today: '+safe(cardTitle(saved.index))+'</strong><span>Tap to open again</span></button></div>':'';
    $('drawCardButton').textContent=saved?'✦ View today\'s card':'✦ Reveal today\'s card';
  }
  $('oracleButton').addEventListener('click',()=>{renderOracle();openDialog('oracleDialog')});
  $('drawCardButton').addEventListener('click',()=>{
    if(!cards.length){toast('The oracle deck could not be loaded.');return}
    let saved=dailyPull();
    if(!saved){
      const index=Math.floor(Math.random()*cards.length);
      saved={id:uid(),day:today(),index,at:new Date().toISOString()};
      if(!addTo('oraclePulls',saved))return;
    }
    renderOracle();openCard(saved.index);
  });
  $('oracleDaily').addEventListener('click',e=>{const b=e.target.closest('[data-card]');if(b&&dailyPull()?.index===Number(b.dataset.card))openCard(Number(b.dataset.card))});
  function openCard(index){
    if(!Number.isInteger(index)||index<0||index>=cards.length)return;
    if(!state.oraclePulls.some(x=>x.index===index))return;
    activeCard=index;
    $('cardTitle').textContent=cardTitle(index);
    $('cardImage').src=cardUrl(index);
    $('cardImage').alt=cardTitle(index);
    openDialog('cardDialog');
  }
  $('shareCard').addEventListener('click',async()=>{
    const url=cardUrl(activeCard);
    try{if(navigator.share)await navigator.share({title:cardTitle(activeCard)+' · A Little Squirrelly',url});else if(navigator.clipboard){await navigator.clipboard.writeText(url);toast('Card link copied.')}else window.open(url,'_blank','noopener,noreferrer')}
    catch(e){if(e.name!=='AbortError')toast('Could not share this card.')}
  });
  // Home Screen help is separate from personal entries and safe to reopen anytime.
  const INSTALL_HELP_KEY='a-little-squirrelly:install-help-seen-v1';
  function installedAsApp(){
    return window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone===true;
  }
  function chooseInstallPlatform(platform){
    const ios=platform==='ios';
    $('installIos').setAttribute('aria-pressed',String(ios));
    $('installAndroid').setAttribute('aria-pressed',String(!ios));
    $('installIosSteps').hidden=!ios;
    $('installAndroidSteps').hidden=ios;
  }
  function openInstallGuide(){
    chooseInstallPlatform(/Android/i.test(navigator.userAgent)?'android':'ios');
    openDialog('installDialog');
  }
  function closeInstallGuide(){
    try{localStorage.setItem(INSTALL_HELP_KEY,'yes')}catch(_){}
    closeDialog('installDialog');
  }
  $('installIos').addEventListener('click',()=>chooseInstallPlatform('ios'));
  $('installAndroid').addEventListener('click',()=>chooseInstallPlatform('android'));
  $('openInstallFromToday').addEventListener('click',openInstallGuide);
  $('openInstallFromSettings').addEventListener('click',openInstallGuide);
  $('installGotIt').addEventListener('click',closeInstallGuide);
  $('installLater').addEventListener('click',closeInstallGuide);
  $('closeInstallDialog').addEventListener('click',closeInstallGuide);
  $('installDialog').addEventListener('close',()=>{try{localStorage.setItem(INSTALL_HELP_KEY,'yes')}catch(_){}});
  function shouldOfferInstallGuide(){
    if(installedAsApp())return false;
    try{return localStorage.getItem(INSTALL_HELP_KEY)!=='yes'}catch(_){return false}
  }
  // Show once on an initial browser visit, not on every page load or installed launch.
  if(shouldOfferInstallGuide())setTimeout(openInstallGuide,900);
  renderTools();render();showSettings();
  if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
})();