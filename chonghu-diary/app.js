const view = document.querySelector('#view');
const nav = document.querySelector('#nav');
const labels = {home:'首页',assessment:'养宠评估',budget:'费用管理',profile:'宠物档案',calendar:'养护日历',knowledge:'科学知识',project:'项目介绍',feedback:'意见反馈'};
const species = [
 ['dog','狗狗','🐶','mint','把运动与照护安排进日程','建立日常规律','先确认家庭能否稳定安排外出活动、互动、清洁与观察，并为加班和出差准备替代照护。','与当地兽医建立联系，记录个体体重、饮食与行为变化。疫苗、驱虫与复诊时间按兽医给出的安排录入日历。'],
 ['cat','猫咪','🐱','rose','从室内环境到日常观察','准备安心的室内空间','检查门窗、阳台与可能误食的物品。规划安静的休息处，以及容易清洁的饮水、进食和猫砂区域。','持续记录食欲、饮水、排泄与体重趋势。出现异常时联系兽医，并带上近期记录。'],
 ['rabbit','兔子','🐰','gold','活动空间与异宠就医准备','兔子的环境与照护清单','了解活动空间、地面安全、日常卫生与物种特异饮食，提前查找能接诊兔子的正规机构。','兔和仓鼠的需求分别核验。饮食及健康问题请向有兔科经验的兽医咨询。'],
 ['hamster','仓鼠','🐹','lavender','空间、垫材和作息规划','了解仓鼠的独立照护需求','在选购设备前，先核对具体物种的活动空间、垫材、藏身和逃逸防护要求。','作息与互动安排需结合个体行为。设备规格和饮食方案需进一步核实。'],
 ['bird','鹦鹉','🦜','mint','合法性、互动与噪音','决定养鸟前要核对的条件','确认具体物种及合法来源，了解所在地规定。与家人讨论噪音、活动时段及长期照护分工。','提前查找鸟类就诊资源，设备和环境要求请由专业人士确认。'],
 ['reptile','爬行动物','🦎','gold','合规核验与环境设备','从具体物种出发核对设备','先核验物种、来源与当地管理规定，再确认温湿度、照明、躲避和防逃逸设备的适用性。','守宫和蛇类的需求各异，具体参数与异常状况请向专业人员确认。'],
 ['fish','水族','🐠','rose','水质、过滤与物种搭配','从水体环境开始规划','确定目标物种与水体类型，列出过滤、温控、水质检测和设备维护等准备事项。','引入新个体前核验物种兼容性，具体水质参数和处理方案需结合物种确认。']
];
const today = () => new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai'}).format(new Date());
const initial = {careChecks:{},answers:{}, pets:[], tasks:[], spending:[], feedback:[], budget:{initial:0,daily:0,monthlyCare:0,supplies:0,annual:0,reserve:0,target:0,extra:0,source:''}};
let data;
try {data = {...initial,...JSON.parse(localStorage.getItem('pet-care-2026') || '{}')};} catch {data=structuredClone(initial);}
const save = () => localStorage.setItem('pet-care-2026',JSON.stringify(data));
const id = () => globalThis.crypto?.randomUUID?.() || String(Date.now())+'-'+Math.random().toString(36).slice(2);
const safe = (value='') => String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const money = value => new Intl.NumberFormat('zh-CN',{style:'currency',currency:'CNY',maximumFractionDigits:2}).format(value);
const pick = (name,title,items) => '<label>'+title+'<select name="'+name+'">'+items.map(x=>'<option value="'+safe(x[0])+'">'+safe(x[1])+'</option>').join('')+'</select></label>';
const field = (name,title,type='text',value='',extra='') => '<label>'+title+'<input name="'+name+'" type="'+type+'" value="'+safe(value)+'" '+extra+'></label>';
const button = (action,label,cls='') => '<button class="'+cls+'" type="button" data-action="'+action+'">'+label+'</button>';
const link = (route,label,cls='') => '<a class="button '+cls+'" href="#'+route+'">'+label+'</a>';
const head = (title,desc,theme='mint',parent='') => '<div class="page-head '+theme+'"><div class="crumb"><a href="#home">首页</a> / '+(parent?'<a href="#'+parent+'">'+labels[parent]+'</a> / ':'')+title+'</div><h1>'+title+'</h1><p>'+desc+'</p></div>';
const tile = (route,icon,title,desc,theme) => '<a href="#'+route+'" class="tile '+theme+'"><span class="icon" aria-hidden="true">'+icon+'</span><h3>'+title+'</h3><p>'+desc+'</p></a>';
const panel = (title,body) => '<section class="panel"><h2>'+title+'</h2>'+body+'</section>';
const empty = message => '<p class="empty">'+message+'</p>';
const speciesName = key => (species.find(s=>s[0]===key)||species[0])[1];
const kinds = [['日常','日常'],['清洁','清洁'],['疫苗','疫苗'],['驱虫','驱虫'],['复诊','复诊']];
const expenseKinds = ['初期投入','日常固定','预防保健','突发医疗','长期照护'];
let day=today(), month=day.slice(0,7), step=0, knowledgeFilter='all', editTask='', calendarMode='month', budgetMode=0, report=false;
const guideTabs = {}, quizChoices = {};
let compared = [];
function speciesCard(s){
 const [key,name,,,desc]=s;
 const c=care[key];
 return '<a href="#knowledge/'+key+'" class="species-card" style="--pet:'+c.gradient+';--accent:'+c.accent+'"><img src="pets/'+key+'.jpg" alt="" loading="lazy" width="384" height="512"><div><small>'+c.family+'</small><h3>'+name+'</h3><p>'+desc+'</p></div></a>';
}
function home(){
 const pets=data.pets.slice(0,3).map(p=>'<div class="row"><a href="#profile/'+p.id+'"><strong>'+safe(p.name)+'</strong> · '+speciesName(p.species)+'</a></div>').join('');
 return '<section class="hero"><div class="hero-copy"><div class="eyebrow">科学养护 · 多物种陪伴</div><h1>养之前先了解<span>养之后更安心</span></h1><p>从预算、时间与居住条件开始，做更充分的养宠准备。把每一次照护、成长与健康变化，写进宠护日记。</p><div class="actions">'+link('assessment','开始养宠评估','dark')+link('knowledge','浏览物种指南')+'</div></div><div class="hero-photo" role="img" aria-label="并排坐着的金毛幼犬和虎斑小猫"><span class="photo-note">陪伴，从了解开始</span></div></section>'+
 '<section class="section"><h2>你的养宠工具箱</h2><p>从第一次做准备，到每一天的照护。</p><div class="grid four">'+
 tile('assessment','🧭','养宠评估','检查预算、时间、住所与应急条件。','mint')+tile('budget','💰','费用管理','分清初期投入、日常花费与应急储备。','gold')+tile('profile','📒','宠物档案','把成长、体重和健康记录放在一起。','rose')+tile('calendar','🗓','养护日历','安排喂养、清洁和就诊待办。','lavender')+'</div></section>'+
 '<div class="grid two">'+panel('今日待办',taskRows(today()).slice(0,3).join('')||empty('今天还没有养护任务。'))+panel('我的宠物',pets||'<p>为你的伙伴建立第一份照护档案。</p>'+link('profile','创建档案'))+'</div>'+
 '<section class="section"><h2>从认识物种开始</h2><p>犬猫走完整照护流程，异宠提供入门准备指南。</p><div class="grid four">'+species.map(speciesCard).join('')+'</div></section>';
}
const questions = [
 ['pet','你计划饲养哪类宠物？','从目标物种开始，匹配相应的准备事项。',species.map(s=>[s[0],s[2]+' '+s[1]])],
 ['budget','日常费用和应急储备准备得怎样？','可以先用费用管理记录当地报价，再回来作答。',[['yes','日常费用已核算，也留有储备'],['partial','能覆盖日常，还没准备应急储备'],['no','日常费用尚未核算或预算不足']]],
 ['time','你能持续安排日常照护吗？','把上班、出差和假期都算进去。',[['yes','有稳定时间和备用照护人'],['partial','日常有空，但出差照护待安排'],['stop','目前没有持续照护安排']]],
 ['housing','现在的居住条件允许养宠吗？','确认住房规则、物种合法性与必要的安全设施。',[['yes','住房允许，环境已核对'],['partial','规则、具体物种或设备条件待核实'],['stop','明确不允许，或关键环境条件无法满足']]],
 ['family','同住成员对养宠怎么看？','讨论过敏、恐惧、清洁责任和照护分工。',[['yes','已达成共识，或独居且已有安排'],['partial','还没充分沟通或分工'],['stop','有明确反对或严重健康顾虑']]],
 ['medical','需要帮助时，你知道去哪里吗？','核实能接诊该物种的正规机构、交通和临时照护。',[['yes','已核实医疗与应急路径'],['partial','还未核实接诊资源或应急安排']]]
];
const reasons={budget:'核算当地日常费用并补足应急储备。',time:'落实日常照护时间及出差期间的替代人选。',housing:'核实允许饲养的条件及环境安全，解决住房或设施限制。',family:'先处理过敏和同住成员的顾虑，并明确分工。',medical:'确认可接诊该物种的机构、联系方式与交通。'};
function assessment(){
 const a=data.answers;
 if(report && questions.every(q=>a[q[0]])){
  const issues=questions.slice(1).filter(q=>a[q[0]]!=='yes');
  const exotic=!['dog','cat'].includes(a.pet);
  const status=issues.some(q=>a[q[0]]==='stop')?'当前不建议':exotic?'需要专业确认':issues.length?'补充准备后再考虑':'条件基本匹配';
  return head('适配评估报告',speciesName(a.pet)+' · 基于你的回答生成的准备建议。','mint','assessment')+
   panel(status,'<p>本报告使用项目原型的规则，优先识别住房、照护和家庭方面的明确限制。</p>'+
   (issues.length?'<ul>'+issues.map(q=>'<li>'+reasons[q[0]]+'</li>').join('')+'</ul>':'<p>五项准备条件均已确认。正式决定前，可再核对具体宠物的习性、年龄与长期照护需求。</p>')+
   (exotic?'<p>异宠的合法来源、专业设备和接诊资源需逐项核实。</p>':'')+
   '<div class="actions">'+link('budget','核算费用','dark')+link('knowledge/'+a.pet,'查看物种指南')+button('reassess','返回修改')+'</div>');
 }
 const [key,title,desc,options]=questions[step];
 return head('养宠评估','用几道问题核对现实条件，得到可解释的准备建议。')+
  panel(title,'<p>'+desc+'</p><div class="progress" role="progressbar" aria-label="评估进度" aria-valuenow="'+(step+1)+'" aria-valuemax="'+questions.length+'"><div style="width:'+((step+1)/questions.length*100)+'%"></div></div><small>第 '+(step+1)+' 步 / 共 '+questions.length+' 步 · 回答自动存于此浏览器</small><div class="options">'+options.map(([key2,label])=>'<button type="button" class="option" aria-pressed="'+(a[key]===key2)+'" data-action="answer/'+key2+'">'+safe(label)+'</button>').join('')+'</div><div class="actions">'+(step?button('back','上一步'):'')+'<button class="dark" data-action="next" '+(!a[key]?'disabled':'')+'>'+(step===questions.length-1?'查看报告':'下一步')+'</button></div>');
}
const budgetFields=[['initial','初期投入'],['daily','月度日常固定'],['monthlyCare','按月折算的预防保健'],['supplies','月度设备耗材'],['annual','另外安排的年度项目'],['reserve','当前应急储备'],['target','自定储备目标'],['extra','额外开支情景金额']];
function budget(){
 const b=data.budget, monthly=Number(b.daily)+Number(b.monthlyCare)+Number(b.supplies), yearly=monthly*12+Number(b.annual);
 const scenarios=[['基础维护',Number(b.daily)+Number(b.supplies),'日常固定与设备耗材的月度小计。'],['较充分维护',monthly,'计入按月折算的预防保健。'],['额外开支情景',yearly+Number(b.extra),'年度估算加自填额外费用。']];
 const total=data.spending.reduce((sum,x)=>sum+x.amount,0);
 return head('费用管理','用当地报价和自己的支出记录，规划初期、月度、年度与应急资金。','gold')+
  '<div class="grid four">'+[['初期准备',b.initial,'rose'],['月度预计',monthly,'mint'],['年度预计',yearly,'gold'],['应急储备差额',Math.max(0,b.target-b.reserve),'lavender']].map(([l,m,c])=>'<div class="tile metric '+c+'"><span>'+l+'</span><strong>'+money(m)+'</strong></div>').join('')+'</div><br>'+
  '<div class="grid two">'+panel('填写预算','<form id="budget"><div class="form-grid">'+budgetFields.map(([name,title])=>field(name,title+'（元）','number',b[name],'min="0" max="99999999" step="0.01"')).join('')+'</div>'+field('source','当地报价来源和日期','text',b.source,'maxlength="100" placeholder="例如：附近宠物医院，2026-11"')+'<p class="muted">年度项目仅填尚未按月计入的费用。储备目标由你设定。</p><button class="dark">更新预算</button></form>')+
  panel('情景比较','<div class="actions">'+scenarios.map(([l],i)=>button('scenario/'+i,l,budgetMode===i?'active':'')).join('')+'</div><h3>'+money(scenarios[budgetMode][1])+'</h3><p>'+scenarios[budgetMode][2]+'</p><div class="bar"><span style="width:'+Math.min(100,b.target?b.reserve/b.target*100:0)+'%"></span></div><p>应急储备 '+money(b.reserve)+' / '+money(b.target)+'</p><small>情景金额用于规划。医疗支出以当地机构的实际报价为准。</small>')+'</div><br>'+
  panel('实际支出 · '+money(total),'<form id="spending"><div class="form-grid">'+pick('category','费用类别',expenseKinds.map(x=>[x,x]))+field('amount','金额（元）','number','','required min="0.01" max="99999999" step="0.01"')+field('date','日期','date',today(),'required')+field('note','备注','text','','maxlength="100"')+'</div><button class="dark">记录支出</button></form>'+
  (data.spending.map(x=>'<div class="row"><span>'+safe(x.date)+' · '+safe(x.category)+' '+safe(x.note)+'</span><strong>'+money(x.amount)+'</strong>'+button('spend-delete/'+x.id,'删除')+'</div>').join('')||empty('尚无实际支出记录。')));
}
function profile(key){
 const pet=data.pets.find(p=>p.id===key);
 if(!pet) return head('宠物档案','集中记录每一位伙伴的基本资料和健康变化。','rose')+
 '<div class="grid two">'+panel('我的宠物',data.pets.map(p=>'<div class="row"><div><strong>'+safe(p.name)+'</strong><br><small>'+speciesName(p.species)+' '+safe(p.breed)+'</small></div>'+link('profile/'+p.id,'查看档案')+'</div>').join('')||empty('还没有宠物档案。'))+
 panel('新建档案','<form id="pet"><div class="form-grid">'+field('name','宠物名称','text','','required maxlength="30"')+pick('species','物种',species.map(s=>[s[0],s[1]]))+field('breed','品种（可选）','text','','maxlength="30"')+field('birthday','生日（可选）','date','','max="'+today()+'"')+'</div><button class="dark">创建档案</button></form>')+'</div>';
 const records=pet.records.toSorted((a,b)=>b.date.localeCompare(a.date));
 const weights=records.filter(r=>r.weight);
 return head(safe(pet.name),speciesName(pet.species)+' · '+safe(pet.breed||'宠物档案')+(pet.birthday?' · 出生于 '+safe(pet.birthday):''),'rose','profile')+
 '<div class="grid two">'+panel('成长与健康时间轴',(weights[0]?'<p>最近体重 <strong>'+safe(weights[0].weight)+' kg</strong></p>':'')+
 (records.map(r=>'<div class="timeline"><strong>'+safe(r.type)+' · '+safe(r.date)+'</strong><br>'+safe(r.note)+(r.weight?' · '+safe(r.weight)+' kg':'')+'</div>').join('')||empty('添加一条记录，开启照护日记。'))+'<p class="actions">'+button('pet-export/'+pet.id,'导出档案')+link('calendar','安排照护任务')+'</p>')+
 panel('添加记录','<form id="record" data-id="'+pet.id+'"><div class="form-grid">'+pick('type','记录类别',['日常观察','体重','疫苗','驱虫','体检','就诊'].map(x=>[x,x]))+field('date','日期','date',today(),'required')+field('weight','体重（kg，可选）','number','','min="0.001" max="9999" step="0.001"')+'</div><label>观察或就诊摘要<textarea name="note" required maxlength="500" rows="3"></textarea></label><p><button class="dark">保存记录</button></p></form>')+'</div>';
}
function due(t,date){
 if(t.paused || date<t.date) return false;
 if(t.repeat==='day') return true;
 if(t.repeat==='week') return (Date.parse(date)-Date.parse(t.date))%604800000===0;
 return date===t.date;
}
function taskRows(date, all=false){
 return data.tasks.filter(t=>due(t,date)||(all&&t.paused&&t.date===date)).map(t=>{
  const pet=data.pets.find(p=>p.id===t.pet), done=t.done.includes(date);
  return '<div class="row"><div><strong class="'+(done?'done':'')+'">'+safe(t.title)+'</strong><br><small>'+safe(t.time||'全天')+' · '+safe(t.kind)+(pet?' · '+safe(pet.name):'')+(t.paused?' · 已暂停':'')+'</small></div><div class="actions">'+
  (t.paused?'':button('task-done/'+t.id+'/'+date,done?'撤销完成':'完成'))+(all?button('task-edit/'+t.id,'编辑')+button('task-pause/'+t.id,t.paused?'恢复':'暂停')+button('task-delete/'+t.id,'删除'):'')+'</div></div>';
 });
}
function calendar(){
 const t=data.tasks.find(t=>t.id===editTask), [year,m]=month.split('-').map(Number);
 const count=new Date(Date.UTC(year,m,0)).getUTCDate(), offset=(new Date(month+'-01').getUTCDay()+6)%7;
 const cell=date=>'<button aria-label="'+date+'" class="'+(date===day?'active ':'')+(data.tasks.some(t=>due(t,date))?'marked':'')+'" data-action="day/'+date+'">'+Number(date.slice(-2))+'</button>';
 const week=Array.from({length:7},(_,i)=>{
  const d=new Date(day);d.setUTCDate(d.getUTCDate()-(new Date(day).getUTCDay()+6)%7+i);return d.toISOString().slice(0,10);
 });
 const dates=calendarMode==='month'?'<span></span>'.repeat(offset)+Array.from({length:count},(_,i)=>cell(month+'-'+String(i+1).padStart(2,'0'))).join(''):week.map(cell).join('');
 const options=(items,value)=>items.toSorted((a,b)=>Number(b[0]===value)-Number(a[0]===value));
 return head('养护日历','把照护事项放到具体时间。疫苗、驱虫与复诊请按兽医安排。','lavender')+
 '<div class="grid two">'+panel('照护计划','<div class="row"><div class="actions">'+button('month/-1','上月')+button('month/1','下月')+'</div><strong>'+year+' 年 '+m+' 月</strong></div><div class="actions">'+button('cal-mode/month','月视图',calendarMode==='month'?'active':'')+button('cal-mode/week','周视图',calendarMode==='week'?'active':'')+button('day/'+today(),'今天')+'</div><div class="calendar">'+['一','二','三','四','五','六','日'].map(x=>'<small>周'+x+'</small>').join('')+dates+'</div><h3>'+safe(day)+' 的待办</h3>'+(taskRows(day,true).join('')||empty('这天没有养护任务。')))+
 panel(t?'编辑任务':'新增养护任务','<form id="task"><div class="form-grid">'+field('title','任务名称','text',t?.title,'required maxlength="50"')+pick('kind','类型',options(kinds,t?.kind))+field('date','开始日期','date',t?.date||day,'required')+field('time','计划时间','time',t?.time)+pick('pet','关联宠物',options([['','未关联'],...data.pets.map(p=>[p.id,p.name])],t?.pet))+pick('repeat','重复频率',options([['once','一次'],['day','每天'],['week','每周']],t?.repeat))+'</div><div class="actions"><button class="dark">保存任务</button>'+(t?button('task-cancel','取消编辑'):'')+'</div><p class="muted">计划时间用于日历展示，记录保存在当前浏览器。</p></form>')+'</div>';
}
function knowledge(key){
 const pet=species.find(s=>s[0]===key);
 if(pet){
  const c=care[key], active=guideTabs[key]??0, [,title,body]=c.topics[active];
  const checks=data.careChecks[key]??[], progress=checks.length/c.list.length*100;
  const [question,answers,correct,explanation]=c.quiz, choice=quizChoices[key];
  const compareLabel=compared.includes(key)?'移出对比':'加入对比';
  return '<section class="pet-hero" style="--pet:'+c.gradient+';--accent:'+c.accent+'"><div><div class="crumb"><a href="#home">首页</a> / <a href="#knowledge">科学知识</a> / '+pet[1]+'</div><div class="eyebrow">'+c.family+'</div><h1>'+pet[1]+'</h1><p>'+c.headline+'</p><div class="actions">'+button('guide-assess/'+key,'评估养宠条件','dark')+pressed('compare/'+key,compareLabel,compared.includes(key),compared.length===2&&!compared.includes(key))+comparisonButton()+'</div></div><img src="pets/'+key+'.jpg" alt="'+c.photo+'" width="384" height="512"></section>'+
  '<section class="panel care-topic" style="--pet:'+c.gradient+';--accent:'+c.accent+'"><h2>照护指南</h2><div class="actions topic-tabs" aria-label="照护主题">'+c.topics.map(([label],i)=>pressed('topic/'+key+'/'+i,label,i===active)).join('')+'</div><article><h3>'+title+'</h3><p>'+body+'</p></article></section>'+
  '<div class="grid two"><section class="panel"><h2>养前准备清单</h2><p class="muted">已准备 '+checks.length+' / '+c.list.length+' · 自动保存在此浏览器</p><div class="progress" role="progressbar" aria-label="准备进度" aria-valuenow="'+checks.length+'" aria-valuemax="'+c.list.length+'"><div style="width:'+progress+'%"></div></div><div class="checklist">'+c.list.map((item,i)=>pressed('check/'+key+'/'+i,(checks.includes(i)?'✓':'○')+' '+item,checks.includes(i))).join('')+'</div></section>'+
  '<section class="panel"><h2>照护情境题</h2><p>'+question+'</p><div class="options">'+answers.map((answer,i)=>pressed('quiz/'+key+'/'+i,answer,choice===i)).join('')+'</div>'+(choice===undefined?'':'<p class="quiz-result" role="status">'+(choice===correct?'回答正确。':'再想一想。')+explanation+'</p>')+'</section></div>'+
  compareTray()+'<section class="panel sources"><h2>资料来源与适用范围</h2><p>适用于'+pet[1]+'的入门准备与日常观察。网页内容为策划原型，待专业复核。更新于 2026 年 11 月。</p><ul>'+c.refs.map(([name,url])=>'<li><a href="'+url+'" target="_blank" rel="noopener">'+name+'</a></li>').join('')+'</ul>'+link('feedback?topic='+key,'反馈此指南')+'</section>';
 }
 const filters=[['all','全部物种'],['common','犬猫'],['exotic','异宠']];
 const visible=species.filter((s,i)=>knowledgeFilter==='all'||(knowledgeFilter==='common'?i<2:i>=2));
 return head('科学知识','从动物的生活习性出发，比较不同物种的照护重点。')+
 '<div class="actions">'+filters.map(([k,l])=>pressed('filter/'+k,l,knowledgeFilter===k)).join('')+comparisonButton()+'</div><div class="section grid four">'+visible.map(s=>'<div class="species-stack">'+speciesCard(s)+pressed('compare/'+s[0],compared.includes(s[0])?'已加入对比':'加入对比',compared.includes(s[0]),compared.length===2&&!compared.includes(s[0]))+'</div>').join('')+'</div>'+compareTray();
}
function pressed(action,label,selected,disabled=false){
 return '<button type="button" class="option" data-action="'+action+'" aria-pressed="'+selected+'"'+(disabled?' disabled':'')+'>'+label+'</button>';
}
function comparisonButton(){
 return compared.length ? button('show-compare','查看对比（'+compared.length+' / 2）') : '';
}
function compareTray(){
 if(!compared.length)return '';
 const cards=compared.map(key=>{
  const c=care[key];
  return '<article class="compare-pet" style="--pet:'+c.gradient+'"><h3>'+speciesName(key)+'</h3><p>'+c.headline+'</p><ul>'+c.list.map(item=>'<li>'+item+'</li>').join('')+'</ul>'+button('compare/'+key,'移出'+speciesName(key))+'</article>';
 }).join('');
 return '<section class="panel compare" id="comparison" tabindex="-1"><h2>照护条件对比</h2><p>'+(compared.length===2?'并排比较两种宠物的养前条件。':'再选一种宠物，即可并排比较。')+'</p><div class="grid two">'+cards+'</div></section>';
}
function project(){
 return head('关于宠护日记','面向首次养宠者、城市上班族与已有犬猫的宠物主人。','gold')+
 '<div class="grid two">'+panel('产品定位','<p>通过结构化评估、预算、档案与日历，将养宠准备转化为可执行的长期照护计划。犬猫为首期完整流程，异宠先提供基础准备模板。</p>')+
 panel('试点目标','<p>拟招募 15–30 位用户，验证评估、支出录入、建档与设置任务的端到端体验。</p><ul><li>评估完成率目标 ≥70%</li><li>核心任务成功率与评估理解度目标均 ≥80%</li><li>知识内容有帮助率目标 ≥80%</li></ul>')+
 panel('实施路线','<p><strong>第 1–2 周</strong> 用户访谈、信息架构与优先级<br><strong>第 3–4 周</strong> 原型设计与核心流程实现<br><strong>第 5–6 周</strong> 日历、知识库、反馈和测试<br><strong>第 7–8 周</strong> 可选的异宠模板与展示优化</p>')+
 panel('调研背景','<p>策划书引用的行业调查中，2024 年 90 后和 00 后宠主合计占 66.8%，二线城市宠主占 42.5%。这些比例来自不同报告口径。</p><p><a class="button" href="https://static.cninfo.com.cn/finalpage/2025-06-27/1223996913.PDF" target="_blank" rel="noopener">年龄分布资料</a></p>')+'</div><br>'+
 panel('原型与数据','<p>当前为公开网页交互原型。预算、评估、档案、任务和反馈保存在你的当前浏览器。可在此导出本机数据。</p>'+button('export','导出本机数据')+' '+link('feedback','提交本机反馈'));
}
function feedback(topic){
 const s=species.find(s=>s[0]===topic);
 return head('意见反馈','记录内容疑问、使用问题或功能建议。反馈仅保存在当前浏览器。','lavender')+
 '<div class="grid two">'+panel('填写反馈','<form id="feedback"><div class="form-grid">'+pick('type','反馈类型',['功能问题','内容错误','体验问题','功能建议','安全问题'].map(x=>[x,x]))+field('area','功能或指南','text',s?s[5]:'','maxlength="60"')+'</div><label>反馈描述<textarea name="note" rows="4" required maxlength="500"></textarea></label><p><button class="dark">保存反馈</button></p></form>')+
 panel('本机反馈记录',data.feedback.map(f=>'<div class="row"><div><strong>'+safe(f.type)+' · '+safe(f.area||'通用反馈')+'</strong><br>'+safe(f.note)+'<br><small>'+safe(f.date)+'</small></div><span class="tag">已保存在本机</span></div>').join('')||empty('还没有反馈记录。'))+'</div>';
}
function route(){
 const [path,query]=location.hash.slice(1).split('?');
 const [name,part]=path.split('/');
 return [Object.hasOwn(labels,name)?name:'home',part,new URLSearchParams(query).get('topic')];
}
function render(){
 const [name,part,topic]=route();
 const renderers={home,assessment,budget,profile,calendar,knowledge,project,feedback:()=>feedback(topic)};
 document.title=labels[name]+' · 宠护日记';
 nav.innerHTML=Object.entries(labels).slice(0,7).map(([key,label])=>'<a href="#'+key+'"'+(key===name?' aria-current="page"':'')+'>'+label+'</a>').join('');
 view.innerHTML=renderers[name](part);
}
function download(name,value){
 const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
view.addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(!b)return;
 const [action,value,date]=b.dataset.action.split('/');
 const task=data.tasks.find(t=>t.id===value);
 switch(action){
  case 'answer':data.answers[questions[step][0]]=value;save();break;
  case 'back':step=Math.max(0,step-1);break;
  case 'next':if(step<questions.length-1)step++;else report=true;break;
  case 'reassess':report=false;step=0;break;
  case 'scenario':budgetMode=Number(value);break;
  case 'filter':knowledgeFilter=value;break;
  case 'topic':guideTabs[value]=Number(date);break;
  case 'quiz':quizChoices[value]=Number(date);break;
  case 'check':{
   const checks=data.careChecks[value]??[], index=Number(date);
   data.careChecks[value]=checks.includes(index)?checks.filter(i=>i!==index):[...checks,index];save();break;
  }
  case 'show-compare':{
   const panel=view.querySelector('#comparison');
   panel.scrollIntoView({block:'start'});panel.focus({preventScroll:true});return;
  }
  case 'compare':
   if(compared.includes(value))compared=compared.filter(key=>key!==value);
   else if(compared.length<2)compared=[...compared,value];
   break;
  case 'guide-assess':
   data.answers.pet=value;step=1;report=false;save();location.hash='assessment';return;
  case 'cal-mode':calendarMode=value;break;
  case 'day':day=value;month=day.slice(0,7);break;
  case 'month':{
   const d=new Date(month+'-01');d.setUTCMonth(d.getUTCMonth()+Number(value));day=d.toISOString().slice(0,10);month=day.slice(0,7);break;
  }
  case 'task-edit':editTask=value;break;
  case 'task-cancel':editTask='';break;
  case 'task-pause':task.paused=!task.paused;save();break;
  case 'task-delete':if(!confirm('删除这项养护任务及其完成记录？'))return;data.tasks=data.tasks.filter(t=>t.id!==value);if(editTask===value)editTask='';save();break;
  case 'task-done':task.done=task.done.includes(date)?task.done.filter(d=>d!==date):[...task.done,date];save();break;
  case 'spend-delete':if(!confirm('删除这笔支出？'))return;data.spending=data.spending.filter(x=>x.id!==value);save();break;
  case 'pet-export':download('宠护日记-宠物档案.json',data.pets.find(p=>p.id===value));return;
  case 'export':download('宠护日记-本机数据.json',data);return;
  default:return;
 }
 render();
 const matching=[...view.querySelectorAll('[data-action]')].find(x=>x.dataset.action===b.dataset.action&&!x.disabled);
 (matching||view).focus({preventScroll:true});
});
view.addEventListener('submit',e=>{
 e.preventDefault();
 const form=e.target, values=Object.fromEntries(new FormData(form));
 for(const key of Object.keys(values))values[key]=values[key].trim();
 if([...form.querySelectorAll('[required]')].some(el=>!values[el.name])){
  const input=[...form.querySelectorAll('[required]')].find(el=>!values[el.name]);input.setCustomValidity('请输入有效内容');input.reportValidity();input.addEventListener('input',()=>input.setCustomValidity(''),{once:true});return;
 }
 switch(form.id){
  case 'budget':data.budget={...Object.fromEntries(budgetFields.map(([key])=>[key,Number(values[key])])),source:values.source};break;
  case 'spending':data.spending.unshift({...values,id:id(),amount:Number(values.amount)});break;
  case 'pet':{
   const pet={...values,id:id(),records:[]};data.pets.push(pet);save();location.hash='profile/'+pet.id;return;
  }
  case 'record':data.pets.find(p=>p.id===form.dataset.id).records.push(values);break;
  case 'task':{
   const task=data.tasks.find(t=>t.id===editTask);
   if(task)Object.assign(task,values);else data.tasks.push({...values,id:id(),done:[],paused:false});
   editTask='';day=values.date;month=day.slice(0,7);break;
  }
  case 'feedback':data.feedback.unshift({...values,date:today()});break;
  default:return;
 }
 save();render();
 const status=document.createElement('div');status.className='sr';status.setAttribute('role','status');view.prepend(status);
 requestAnimationFrame(()=>status.textContent='已保存');
 view.querySelector('form#'+form.id+' button[type="submit"],form#'+form.id+' button.dark')?.focus({preventScroll:true});
});
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);view.focus({preventScroll:true});});
render();
