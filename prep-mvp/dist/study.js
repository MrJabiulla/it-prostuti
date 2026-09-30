// Browser-local study preferences. Existing attempts and sessions remain untouched.
state.preferences = {theme:'light',fontSize:'standard',lowData:false,reminder:false,reminderTime:'20:00',streakAlert:false,...state.preferences};
if(!state.preferences.themeChosen&&state.preferences.theme==='system')state.preferences.theme='light';
state.profile = {name:'',exam:'BCS Preliminary',minutes:30,date:'',focus:[],...state.profile};
state.routinePlans ||= {};
state.completedTasks ||= {};
let routineTab='daily',routineDate=dayKey(),routineMonth=new Date().toISOString().slice(0,7),heatWeeks=16,heatDay=dayKey(),settingsTab='preferences';
const dateFromKey=key=>new Date(key+'T12:00:00');
const dateLabel=key=>dateFromKey(key).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
const isoDay=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
// Use local calendar dates for month and day controls, including around midnight.
routineMonth=isoDay(new Date()).slice(0,7);
function dayAttempts(key){return state.attempts.filter(a=>a.day===key)}
function dateShift(key,days){const d=dateFromKey(key);d.setDate(d.getDate()+days);return isoDay(d)}
function weekStart(key){const d=dateFromKey(key);d.setDate(d.getDate()-((d.getDay()+6)%7));return isoDay(d)}
function taskKey(date,id){return `${date}:${id}`}
function generatedPlan(date){
  const focus=state.profile.focus.length?state.profile.focus:[0,1,2,3];
  const dayIndex=Math.floor((dateFromKey(date)-new Date(2026,0,1,12))/86400000);
  const subject=focus[((dayIndex%focus.length)+focus.length)%focus.length];
  const total=goal(),reviewCount=Math.min(3,Math.floor(total/3)),practiceCount=Math.min(4,total-reviewCount),mixed=total-reviewCount-practiceCount;
  const tasks=[];
  if(reviewCount)tasks.push({id:'review',title:'Revisit your mistakes',kind:'review',questions:reviewCount,minutes:Math.max(1,Math.round(state.profile.minutes*reviewCount/total))});
  tasks.push({id:'subject',title:subjects[subject].name,kind:String(subject),questions:practiceCount,minutes:Math.max(1,Math.round(state.profile.minutes*practiceCount/total))});
  if(mixed)tasks.push({id:'mixed',title:'Mixed practice',kind:'mixed',questions:mixed,minutes:Math.max(1,state.profile.minutes-tasks.reduce((n,t)=>n+t.minutes,0))});
  return {goal:total,minutes:state.profile.minutes,tasks};
}
function planFor(date){return state.routinePlans[date]||generatedPlan(date)}
function ensureTodayPlan(){const key=dayKey();if(!state.routinePlans[key]){state.routinePlans[key]=generatedPlan(key);save()}}
function taskDone(date,task){return !!state.completedTasks[taskKey(date,task.id)]}
function routineTaskRows(date,compact=false){const plan=planFor(date);return plan.tasks.map((task,i)=>`<div class="routine-task ${taskDone(date,task)?'is-complete':''}"><label class="task-check"><input type="checkbox" data-task-date="${date}" data-task-id="${esc(task.id)}" ${taskDone(date,task)?'checked':''} aria-label="Mark ${esc(task.title)} complete" ${date>dayKey()?'disabled':''}><span class="sr-only">Complete</span></label><div class="details"><h3>${esc(task.title)}</h3><p>${task.questions} questions · ${task.minutes} min${task.kind==='review'?' · Due revision':''}</p></div>${date===dayKey()?`<button class="${taskDone(date,task)?'secondary':'primary'}" data-action="routine-start" data-id="${i}">${taskDone(date,task)?'Repeat':'Start'}</button>`:`<span class="tag">${taskDone(date,task)?'Done':date>dayKey()?'Planned':'Not marked'}</span>`}</div>`).join('')}
function dailyRoutineCard(){ensureTodayPlan();return `<div class="panel task-list">${routineTaskRows(dayKey(),true)}</div><p class="fine routine-note">Finishing a task session marks it done. You can also check off work studied elsewhere.</p>`}
function studyCalendar(){
  const today=dayKey(),end=dateFromKey(today),start=new Date(end);start.setDate(start.getDate()-end.getDay()-(heatWeeks-1)*7);
  const counts=new Map();state.attempts.forEach(a=>counts.set(a.day,(counts.get(a.day)||0)+1));
  let cells='',months='',total=0,active=0;
  for(let w=0;w<heatWeeks;w++){
    const week=new Date(start);week.setDate(start.getDate()+w*7);
    months+=`<span>${w===0||week.getDate()<=7?week.toLocaleDateString('en-GB',{month:'short'}):''}</span>`;
    for(let d=0;d<7;d++){const date=new Date(week);date.setDate(week.getDate()+d);const key=isoDay(date),n=counts.get(key)||0,future=key>today;const level=n===0?0:n<5?1:n<10?2:n<20?3:4;
      if(!future){total+=n;if(n)active++}
      cells+=`<button class="heat-cell level-${level} ${heatDay===key?'selected':''}" data-action="heat-day" data-date="${key}" ${future?'disabled':''} aria-label="${dateLabel(key)}: ${n} questions" aria-pressed="${heatDay===key}" title="${dateLabel(key)} · ${n} questions"><span class="sr-only">${n}</span></button>`;
    }
  }
  const selected=dayAttempts(heatDay);
  return `<section class="panel heatmap-panel"><div class="section-heading heat-heading"><div><b>Study calendar</b><p class="muted">${total} ${total===1?'question':'questions'} across ${active} active ${active===1?'day':'days'}</p></div><label class="range-label">Range<select id="heat-range"><option value="12" ${heatWeeks===12?'selected':''}>12 weeks</option><option value="16" ${heatWeeks===16?'selected':''}>16 weeks</option><option value="26" ${heatWeeks===26?'selected':''}>26 weeks</option></select></label></div><div class="heat-scroll" role="region" aria-label="Study activity calendar; scroll horizontally for all weeks" tabindex="0"><div class="heat-layout" style="--weeks:${heatWeeks}"><div class="heat-months">${months}</div><div class="heat-labels"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div><div class="heat-grid">${cells}</div></div></div><div class="heat-footer"><span class="fine">Tap a day to see your activity.</span><div class="heat-legend"><span>Less</span>${[0,1,2,3,4].map(l=>`<i class="level-${l}"></i>`).join('')}<span>More</span></div></div><div class="heat-detail" aria-live="polite"><b>${dateLabel(heatDay)}</b><span>${selected.length} ${selected.length===1?'question':'questions'} · ${selected.length?accuracy(selected)+'% accuracy':'No practice recorded'}</span></div></section>`;
}
function routine(){
  ensureTodayPlan();const date=routineDate,plan=planFor(date),done=plan.tasks.filter(t=>taskDone(date,t)).length;
  const daysLeft=state.profile.date?Math.max(0,Math.ceil((dateFromKey(state.profile.date)-dateFromKey(dayKey()))/86400000)):null;
  return heading('Your study routine','Daily, weekly and monthly plans')+`<section class="panel routine-target"><div><b>Target study</b><div class="row routine-target-stats"><div class="stat"><b>${goal()}</b><span class="sub">Q/day goal</span></div><div class="stat"><b>${state.profile.minutes}</b><span class="sub">min/day</span></div></div><p class="muted">${state.profile.minutes} minutes daily · ${daysLeft===null?'Exam date not set':daysLeft+' days until your exam'}</p></div><button class="secondary" data-action="settings">Edit targets</button></section><div class="tabs">${['daily','weekly','monthly'].map(t=>`<button class="tab ${routineTab===t?'active':''}" data-action="routine-tab" data-id="${t}">${t[0].toUpperCase()+t.slice(1)}</button>`).join('')}</div>${routineTab==='daily'?`<div class="section-heading"><div><h2>${date===dayKey()?'Today':dateLabel(date)}</h2><p class="muted">${done} / ${plan.tasks.length} tasks completed · ${plan.minutes} min planned</p></div><label class="date-label">Choose day<input id="routine-date" type="date" value="${date}"></label></div><div class="panel task-list">${routineTaskRows(date)}</div><div class="routine-actions"><button class="secondary" data-action="edit-routine">Edit this day’s routine</button><a class="text-button" href="#progress">See your study calendar</a></div><p class="fine">Task completion includes work you mark manually. Study calendar and accuracy use question attempts only.</p>`:routineTab==='weekly'?weeklyRoutine():monthlyRoutine()}`;
}
function weeklyRoutine(){const start=weekStart(routineDate),dates=Array.from({length:7},(_,i)=>dateShift(start,i)),attempts=state.attempts.filter(a=>dates.includes(a.day)),onTrack=dates.filter(d=>dayAttempts(d).length>=planFor(d).goal).length;
return `<div class="section-heading"><h2>${dateLabel(start)} – ${dateLabel(dates[6])}</h2><div class="row"><button class="secondary" data-action="week-shift" data-id="-7" aria-label="Previous week">Previous</button><button class="secondary" data-action="week-shift" data-id="7" aria-label="Next week">Next</button></div></div><div class="routine-summary"><div><b>${onTrack}/7</b><span>Days at question goal</span></div><div><b>${attempts.length}</b><span>Questions practiced</span></div><div><b>${attempts.length?accuracy(attempts)+'%':'—'}</b><span>Accuracy</span></div></div><div class="panel">${dates.map(date=>{const p=planFor(date),count=dayAttempts(date).length;return `<button class="week-plan-row" data-action="routine-day" data-date="${date}"><span class="week-date"><b>${dateFromKey(date).toLocaleDateString('en-GB',{weekday:'short'})}</b><small>${dateFromKey(date).getDate()}</small></span><span class="details"><b>${p.tasks.map(t=>esc(t.title)).join(' · ')}</b><small>${p.minutes} min · ${p.goal} questions planned</small></span><span class="tag">${count}/${p.goal}</span></button>`}).join('')}</div>`}
function monthlyRoutine(){const first=dateFromKey(routineMonth+'-01'),last=new Date(first.getFullYear(),first.getMonth()+1,0,12),dates=Array.from({length:last.getDate()},(_,i)=>isoDay(new Date(first.getFullYear(),first.getMonth(),i+1,12))),attempts=state.attempts.filter(a=>a.day.startsWith(routineMonth)),target=dates.reduce((n,d)=>n+planFor(d).goal,0),offset=(first.getDay()+6)%7;
return `<div class="section-heading"><h2>${first.toLocaleDateString('en-GB',{month:'long',year:'numeric'})}</h2><label class="date-label">Choose month<input id="routine-month" type="month" value="${routineMonth}"></label></div><div class="panel"><div class="row between"><h3>Monthly question goal</h3><span>${attempts.length} / ${target}</span></div><div class="bar"><i style="width:${Math.min(100,attempts.length/target*100)}%"></i></div><p class="fine">Based on saved daily plans and your current target for unplanned days.</p><div class="month-grid">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<span class="month-label">${d}</span>`).join('')}${'<span></span>'.repeat(offset)}${dates.map(date=>{const count=dayAttempts(date).length,reached=count>=planFor(date).goal;return `<button class="month-day ${date===dayKey()?'today':''} ${reached?'reached':''}" data-action="routine-day" data-date="${date}" aria-label="${dateLabel(date)}: ${count} questions; open routine"><b>${dateFromKey(date).getDate()}</b><small>${count?count+' Q':'—'}</small></button>`}).join('')}</div><p class="fine">Tap a date to view or edit its plan. Green means the question goal was reached.</p></div>`}
function settings(){
  const p=state.preferences,profile=state.profile;
  const tabs=[
    ['preferences','Preferences'],
    ['plan','Study plan'],
    ['reminders','Reminders'],
    ['data','Data & offline'],
    ['about','About']
  ];
  let content='';
  if(settingsTab==='preferences'){
    content=`<form id="preferences-form"><section class="panel settings-section"><h2>Preferences</h2><label class="setting-row"><span><b>Theme</b><small>Follow your device or choose a look.</small></span><select name="theme">${['system','light','dark'].map(v=>`<option value="${v}" ${p.theme===v?'selected':''}>${v[0].toUpperCase()+v.slice(1)}</option>`).join('')}</select></label><label class="setting-row"><span><b>Text size</b><small>Includes questions and explanations.</small></span><select name="fontSize">${[['standard','Standard'],['large','Large'],['extra','Extra large']].map(([v,l])=>`<option value="${v}" ${p.fontSize===v?'selected':''}>${l}</option>`).join('')}</select></label><label class="setting-row"><span><b>Language</b><small>English is the default. Bangla UI is planned.</small></span><select name="language" aria-label="Interface language"><option value="en">English</option><option disabled>বাংলা — coming later</option></select></label><label class="setting-row"><span><b>Low-data mode</b><small>Use device fonts and reduce motion.</small></span><input name="lowData" type="checkbox" role="switch" ${p.lowData?'checked':''}></label></section><div class="settings-save"><span class="fine">Changes apply immediately.</span><button class="primary" type="submit">Save preferences</button></div></form>`;
  } else if(settingsTab==='plan'){
    content=`<form id="plan-form"><section class="panel settings-section"><h2>Study plan</h2><label>Your name<input name="name" maxlength="30" value="${esc(profile.name)}" placeholder="Your name"></label><div class="field-grid"><label>Target exam<select name="exam">${['BCS Preliminary','Bank','Primary','NTRCA'].map(v=>`<option ${profile.exam===v?'selected':''}>${v}</option>`).join('')}</select></label><label>Exam date<input name="date" type="date" value="${esc(profile.date)}"></label><label>Daily study time<select name="minutes">${[15,30,60,120].map(n=>`<option value="${profile.minutes===n?'selected':''}>${n} minutes</option>`).join('')}</select></label><label>Daily question goal<input name="dailyGoal" type="number" min="3" max="${questions.length}" required value="${goal()}"></label></div><p class="fine">Daily goal can be set from 3 to ${questions.length} questions.</p><fieldset><legend>Focus subjects</legend><p class="fine">Prioritized in daily practice. Leave unchecked to include all subjects.</p><div class="focus-options">${subjects.map((s,i)=>`<label><input type="checkbox" name="focus" value="${i}" ${profile.focus.includes(i)?'checked':''}>${s.short}</label>`).join('')}</div></fieldset></section><div class="settings-save"><span class="fine">Existing practice progress is preserved.</span><button class="primary" type="submit">Save study plan</button></div></form>`;
  } else if(settingsTab==='reminders'){
    content=`<form id="reminders-form"><section class="panel settings-section"><h2>Reminders</h2><label class="setting-row"><span><b>Daily reminder</b><small>Show a reminder while the app is open.</small></span><input type="checkbox" role="switch" name="reminder" ${p.reminder?'checked':''}></label><label class="setting-row"><span><b>Reminder time</b><small>Your device’s local time.</small></span><input name="reminderTime" type="time" required value="${p.reminderTime}"></label><label class="setting-row"><span><b>Streak reminder</b><small>Include your streak when today’s goal is unfinished.</small></span><input type="checkbox" role="switch" name="streakAlert" ${p.streakAlert?'checked':''}></label><div class="setting-row"><span><b>Report status updates</b><small>Unavailable in this demo: reports stay on this device.</small></span><input type="checkbox" role="switch" aria-label="Report status updates unavailable" disabled></div><p class="demo-note">Reminders work only while this app is open. Background push notifications need the full app.</p></section><div class="settings-save"><button class="primary" type="submit">Save reminders</button></div></form>`;
  } else if(settingsTab==='data'){
    content=`<section class="panel settings-section"><h2>Data & offline reading</h2><div class="setting-row"><span><b>Question pack</b><small>Download all ${questions.length} questions and explanations as an offline reading file.</small></span><button class="secondary" type="button" data-action="download-questions">Download</button></div><div class="setting-row"><span><b>Export my data</b><small>Download your progress, bookmarks, preferences and plans as JSON.</small></span><button class="secondary" type="button" data-action="export-data">Export</button></div><div class="setting-row"><span><b>My reports</b><small>${state.reports.length} saved on this browser.</small></span><a href="#review" class="secondary">View</a></div><p class="fine">The downloaded question pack can be read offline. The interactive app itself still needs a connection to load.</p></section>`;
  } else if(settingsTab==='about'){
    content=`<section class="panel settings-section"><h2>About this preview</h2><p class="muted">Version 1.0 · Local demo</p><p class="fine">Progress stays on this browser. Accounts, cloud sync and a support inbox are not connected yet.</p><div class="row" style="margin-top:16px"><a class="secondary" href="#home">Back to Home</a><a class="secondary" href="#bank">Question bank</a></div></section>`;
  }
  return heading('Settings','Make your study space work for you.')+`<div class="tabs settings-tabs">${tabs.map(([id,label])=>`<button class="tab ${settingsTab===id?'active':''}" data-action="settings-tab" data-id="${id}">${label}</button>`).join('')}</div><div class="settings-single-wrap">${content}</div>`;
}
function applyPreferences(){const p=state.preferences;const dark=p.theme==='dark'||(p.theme==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=dark?'dark':'light';document.documentElement.style.setProperty('--font-scale',({standard:1,large:1.125,extra:1.25}[p.fontSize]||1));document.documentElement.classList.toggle('low-data',p.lowData);const fonts=$('#web-fonts');if(fonts){fonts.disabled=!!p.lowData;if(!p.lowData&&!fonts.getAttribute('href'))fonts.href=fonts.dataset.href}}
function downloadFile(name,text,type){const url=URL.createObjectURL(new Blob([text],{type})),link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function downloadQuestions(){const text=`PROSTHUTI — OFFLINE DEMO QUESTION PACK\n${questions.length} sample questions; not a verified exam bank.\n\n`+questions.map((q,i)=>`${i+1}. ${q.text}\n${q.options.map((o,j)=>'ABCD'[j]+'. '+o).join('\n')}\nAnswer: ${'ABCD'[q.answer]}\n${q.explanation}`).join('\n\n');downloadFile('prosthuti-questions.txt',text,'text/plain;charset=utf-8')}
function editRoutine(){const plan=planFor(routineDate);let d=$('#routine-editor');if(!d){d=document.createElement('dialog');d.id='routine-editor';document.body.appendChild(d)}d.innerHTML=`<form id="routine-edit-form"><div class="row between"><h2>Edit ${dateLabel(routineDate)}</h2><button type="button" class="icon-button" data-action="close-routine" aria-label="Close routine editor">✕</button></div><p class="fine">Customize this day. Saving keeps completed tasks and other days unchanged.</p><div id="task-edit-list">${plan.tasks.map(taskEditorRow).join('')}</div><div class="routine-actions"><button type="button" class="secondary" data-action="add-task">Add task</button><button type="submit" class="primary">Save routine</button></div></form>`;d.showModal()}
function taskEditorRow(task){return `<fieldset class="task-edit" data-id="${esc(task.id)}"><label>Task title<input name="task-title" required maxlength="80" value="${esc(task.title)}"></label><div class="field-grid"><label>Practice source<select name="task-kind">${[['review','Due revision'],['mixed','Mixed questions'],...subjects.map((s,i)=>[String(i),s.short])].map(([v,l])=>`<option value="${v}" ${task.kind===v?'selected':''}>${l}</option>`).join('')}</select></label><label>Questions<input name="task-questions" type="number" min="1" max="16" required value="${task.questions}"></label><label>Minutes<input name="task-minutes" type="number" min="1" max="180" required value="${task.minutes}"></label></div><button type="button" class="text-button" data-action="remove-task">Remove task</button></fieldset>`}
function startRoutineTask(index){const date=dayKey(),task=planFor(date).tasks[index];if(!task)return;if(state.session){navigate('practice');toast('Finish your current session first. Your routine is saved.');return}let ids=task.kind==='review'?due():task.kind==='mixed'?questions.map(q=>q.id):questions.filter(q=>q.subject===Number(task.kind)).map(q=>q.id);if(!ids.length){toast('No revision is due. You can mark this task complete or choose another task.');return}ids=ids.slice(0,task.questions);start(ids,task.title);state.session.routineTask=taskKey(date,task.id);save();if(ids.length<task.questions)toast(`Only ${ids.length} matching demo questions are available.`)}
document.addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(!button)return;const action=button.dataset.action;
if(action==='heat-day'){heatDay=button.dataset.date;const y=scrollY;render();window.scrollTo(0,y)}
else if(action==='routine-tab'){routineTab=button.dataset.id;render()}
else if(action==='routine-day'){routineDate=button.dataset.date;routineTab='daily';render()}
else if(action==='week-shift'){routineDate=dateShift(routineDate,Number(button.dataset.id));render()}
else if(action==='settings-tab'){settingsTab=button.dataset.id;render()}
else if(action==='edit-routine')editRoutine();
else if(action==='close-routine')$('#routine-editor').close();
else if(action==='add-task'){if(document.querySelectorAll('.task-edit').length>=6){toast('Keep your day focused: up to 6 tasks.');return}$('#task-edit-list').insertAdjacentHTML('beforeend',taskEditorRow({id:'custom-'+Date.now(),title:'',kind:'mixed',questions:3,minutes:10}))}
else if(action==='remove-task'){if(document.querySelectorAll('.task-edit').length===1){toast('Keep at least one task in your day.');return}button.closest('.task-edit').remove()}
else if(action==='routine-start')startRoutineTask(Number(button.dataset.id));
else if(action==='export-data')downloadFile('prosthuti-data-'+dayKey()+'.json',JSON.stringify({version:1,exportedAt:new Date().toISOString(),...state},null,2),'application/json');
else if(action==='download-questions')downloadQuestions();
});
document.addEventListener('change',e=>{const el=e.target;
if(el.id==='heat-range'){heatWeeks=Number(el.value);render()}
else if(el.id==='routine-date'&&el.value){routineDate=el.value;render()}
else if(el.id==='routine-month'&&el.value){routineMonth=el.value;render()}
else if(el.dataset.taskId){const date=el.dataset.taskDate;if(date>dayKey())return;if(!state.routinePlans[date])state.routinePlans[date]=generatedPlan(date);state.completedTasks[taskKey(date,el.dataset.taskId)]=el.checked;save();const y=scrollY;render();window.scrollTo(0,y)}
});
document.addEventListener('submit',e=>{
if(e.target.id==='preferences-form'){
  e.preventDefault();const f=new FormData(e.target);
  state.preferences={...state.preferences,theme:f.get('theme'),themeChosen:true,fontSize:f.get('fontSize'),lowData:f.has('lowData')};
  save();applyPreferences();render();toast('Preferences saved.');
}
else if(e.target.id==='plan-form'){
  e.preventDefault();const f=new FormData(e.target);
  state.profile={...state.profile,name:f.get('name').trim(),exam:f.get('exam'),minutes:Number(f.get('minutes')),date:f.get('date'),dailyGoal:Number(f.get('dailyGoal')),focus:f.getAll('focus').map(Number)};
  const today=dayKey();if(state.routinePlans[today]&&!state.routinePlans[today].custom&&!Object.keys(state.completedTasks).some(k=>k.startsWith(today+':')&&state.completedTasks[k]))state.routinePlans[today]=generatedPlan(today);
  save();render();toast('Study plan saved.');
}
else if(e.target.id==='reminders-form'){
  e.preventDefault();const f=new FormData(e.target);
  state.preferences={...state.preferences,reminder:f.has('reminder'),reminderTime:f.get('reminderTime'),streakAlert:f.has('streakAlert')};
  save();render();toast('Reminders saved.');
}
else if(e.target.id==='routine-edit-form'){
  e.preventDefault();const tasks=[...document.querySelectorAll('.task-edit')].map(row=>({id:row.dataset.id,title:row.querySelector('[name="task-title"]').value.trim(),kind:row.querySelector('[name="task-kind"]').value,questions:Number(row.querySelector('[name="task-questions"]').value),minutes:Number(row.querySelector('[name="task-minutes"]').value)}));if(tasks.some(t=>!t.title)){toast('Give each task a title.');return}state.routinePlans[routineDate]={custom:true,tasks,goal:tasks.reduce((n,t)=>n+t.questions,0),minutes:tasks.reduce((n,t)=>n+t.minutes,0)};save();$('#routine-editor').close();render();toast('Routine saved for '+dateLabel(routineDate));
}
});
function checkReminder(){const p=state.preferences;if(!p.reminder||document.visibilityState==='hidden')return;const d=new Date(),time=d.toTimeString().slice(0,5),today=dayKey();if(time>=p.reminderTime&&state.lastReminder!==today&&todayAttempts().length<goal()){state.lastReminder=today;save();toast('Time for a little practice.'+(p.streakAlert&&streak()?' Keep your '+streak()+'-day streak going.':''))}}
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(state.preferences.theme==='system')applyPreferences()});
ensureTodayPlan();applyPreferences();page=location.hash.slice(1)||'home';render();setInterval(updateTimer,1000);setInterval(checkReminder,30000);
