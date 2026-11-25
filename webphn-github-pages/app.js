(() => {
  'use strict';
  const data=window.WEBPHN_DATA;
  const $=selector=>document.querySelector(selector);
  const root=document.documentElement;
  const reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');
  let motion=true;
  let savedMotion=null;
  let lastFocused=null;
  const el=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
  function storage(key,value){try{if(value===undefined)return localStorage.getItem(key);localStorage.setItem(key,value);}catch{}return null;}
  function applyMotion(enabled,persist=false){
    motion=!!enabled;root.dataset.motion=motion?'on':'off';
    $('#motion-toggle').setAttribute('aria-pressed',String(!motion));
    const label=motion?'Giảm chuyển động':'Bật chuyển động';$('#motion-toggle').setAttribute('aria-label',label);$('#motion-toggle').title=label;
    if(persist){savedMotion=String(motion);storage('webphn-motion',savedMotion);}
    if(!motion){document.querySelectorAll('[data-reveal]').forEach(node=>node.classList.add('is-visible'));document.querySelectorAll('.rail-card img').forEach(node=>node.style.setProperty('--parallax','0px'));}
  }
  savedMotion=storage('webphn-motion');applyMotion(savedMotion===null?!reducedQuery.matches:savedMotion==='true');
  $('#motion-toggle').addEventListener('click',()=>applyMotion(!motion,true));
  reducedQuery.addEventListener('change',()=>{if(savedMotion===null)applyMotion(!reducedQuery.matches);});
  function applyTheme(dark,persist=false){root.dataset.theme=dark?'dark':'light';$('#theme-toggle').setAttribute('aria-pressed',String(dark));$('#theme-toggle').setAttribute('aria-label',dark?'Bật giao diện sáng':'Bật giao diện tối');$('meta[name="theme-color"]').content=dark?'#0e202e':'#fafbf9';if(persist)storage('webphn-theme',dark?'dark':'light');}
  applyTheme(storage('webphn-theme')==='dark');$('#theme-toggle').addEventListener('click',()=>applyTheme(root.dataset.theme!=='dark',true));
  function closeMenu(){if($('#menu-dialog').open)$('#menu-dialog').close();}
  $('#menu-open').addEventListener('click',()=>{lastFocused=document.activeElement;$('#menu-search').value='';renderSearch();$('#menu-dialog').showModal();});
  $('#menu-close').addEventListener('click',closeMenu);
  $('#menu-dialog').addEventListener('close',()=>{if(lastFocused?.isConnected)lastFocused.focus({preventScroll:true});});
  for(const link of $('#menu-dialog').querySelectorAll('a'))link.addEventListener('click',closeMenu);
  $('#project-close').addEventListener('click',()=>$('#project-dialog').close());
  $('#project-dialog').addEventListener('click',event=>{const rect=event.currentTarget.getBoundingClientRect();if(event.target===event.currentTarget&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))event.currentTarget.close();});

  function openProject(project){
    closeMenu();const target=$('#project-detail');target.replaceChildren();
    const picture=el('div',undefined,'project-detail-image '+project.color);const image=el('img');image.src=project.image;image.alt='Giao diện '+project.name+' — dự án demo/concept';image.width=1440;image.height=1000;picture.append(image);
    const content=el('div',undefined,'project-detail-body');const label=el('div',undefined,'section-label');label.append(el('span',project.number+' / CONCEPT STUDY'),el('span',project.category));
    content.append(label,el('h2',project.name),el('p',project.description));
    const tags=el('div',undefined,'service-tags');for(const item of project.scope)tags.append(el('span',item));content.append(tags);
    const columns=el('div',undefined,'project-detail-columns');for(const[title,text]of [['Bài toán',project.challenge],['Hướng giải quyết',project.solution]]){const column=el('div');column.append(el('h3',title),el('p',text));columns.append(column);}content.append(columns,el('p',project.note,'project-note'));
    const contact=el('a','Cùng trao đổi dự án của bạn ↗','button button-gold');contact.href='#lien-he';contact.addEventListener('click',()=>{$('#project-dialog').close();$('#service').value=project.id==='la-court'?'landingpage':'website';});content.append(contact);target.append(picture,content);
    $('#project-dialog').setAttribute('aria-label','Dự án '+project.name);$('#project-dialog').showModal();
  }
  for(const project of data.projects){
    const card=el('button',undefined,'rail-card '+project.color);card.type='button';card.setAttribute('aria-label','Khám phá '+project.name);
    const image=el('img');image.src=project.image;image.alt='';image.width=1440;image.height=1000;card.append(image,el('span',project.name.toUpperCase()+' / '+project.category,'rail-label'),el('span','↗','rail-arrow'));card.addEventListener('click',()=>openProject(project));$('#showcase-rail').append(card);
    const article=el('article',undefined,'work-card');article.dataset.reveal='';
    const button=el('button',undefined,'work-image '+project.color);button.type='button';button.setAttribute('aria-label','Xem dự án '+project.name);
    const preview=el('img');preview.src=project.image;preview.alt=project.title;preview.width=1440;preview.height=1000;
    const open=el('span',undefined,'work-open');open.append(document.createTextNode('Khám phá dự án'),el('b','↗'));button.append(preview,open);button.addEventListener('click',()=>openProject(project));
    const meta=el('div',undefined,'work-meta');meta.append(el('span',project.name.toUpperCase()+' / '+project.category),el('span',project.number+' — '+project.year));article.append(button,meta,el('h3',project.title));$('#work-grid').append(article);
  }
  const rail=$('#showcase-rail');
  function railMove(direction){const distance=(rail.querySelector('.rail-card')?.offsetWidth||360)+24;rail.scrollBy({left:distance*direction,behavior:motion?'smooth':'auto'});}
  $('#rail-prev').addEventListener('click',()=>railMove(-1));$('#rail-next').addEventListener('click',()=>railMove(1));

  function openService(id){const details=$('#service-'+id);if(!details)return;closeMenu();details.open=true;details.scrollIntoView({behavior:motion?'smooth':'auto',block:'start'});}
  for(const[ index,service]of data.services.entries()){
    const details=el('details',undefined,'service-item');details.id='service-'+service.id;details.open=index===0;
    const summary=el('summary');summary.append(el('span',service.number,'service-number'),el('h3',service.title),el('span','+','service-plus'));
    const body=el('div',undefined,'service-body');const content=el('div',undefined,'service-content');content.append(el('h4',service.subtitle),el('p',service.body));
    const tags=el('div',undefined,'service-tags');for(const tag of service.tags)tags.append(el('span',tag));
    const link=el('a',undefined,'text-link');link.href='#lien-he';link.append(document.createTextNode('Trao đổi về giải pháp này'),el('span','↗'));link.addEventListener('click',()=>{$('#service').value=service.id;});content.append(tags,link);
    const art=el('div',undefined,'service-art '+service.visual);art.setAttribute('aria-hidden','true');art.append(el('small',service.stamp),el('strong',{brand:'webphn.',booking:'18:30',identity:'Aa',operations:'↗'}[service.visual]),el('span','DESIGN / DEVELOP / CONNECT'),el('b','✳','art-glyph'));
    body.append(content,art);details.append(summary,body);details.addEventListener('toggle',()=>{if(details.open)for(const sibling of $('#service-list').querySelectorAll('details'))if(sibling!==details)sibling.open=false;});$('#service-list').append(details);
  }
  for(const phase of data.phases){const section=el('article',undefined,'journey-step');section.dataset.phase=phase.id;section.append(el('span',phase.number+' / '+phase.label.toUpperCase(),'chapter-label'),el('span',undefined,'phase-line'),el('h3',phase.title),el('p',phase.body));const bottom=el('div',undefined,'phase-bottom');bottom.append(el('span'),document.createTextNode('WEBPHN / WITH INTENT'));section.append(bottom);$('#journey-steps').append(section);}

  const fold=text=>text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
  function renderSearch(){const value=fold($('#menu-search').value.trim());const items=[...data.projects.map(project=>({label:project.name,type:'Dự án concept',action:()=>openProject(project)})),...data.services.map(service=>({label:service.title,type:'Giải pháp',action:()=>openService(service.id)}))].filter(item=>!value||fold(item.label+' '+item.type).includes(value));
    const target=$('#search-results');target.replaceChildren();
    if(!items.length){target.append(el('p','Chưa tìm thấy nội dung. Thử một từ khóa khác nhé.','search-empty'));return;}
    for(const item of items){const button=el('button',undefined,'search-hit');button.type='button';const label=el('span');label.append(el('small',item.type),el('strong',item.label));button.append(label,el('span','↗'));button.addEventListener('click',item.action);target.append(button);}
  }
  $('#menu-search').addEventListener('input',renderSearch);

  document.body.classList.add('js');
  const reveals=[...document.querySelectorAll('[data-reveal]')];
  if('IntersectionObserver'in window&&motion){const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}},{threshold:.08,rootMargin:'0px 0px -20px 0px'});for(const item of reveals)observer.observe(item);}else reveals.forEach(item=>item.classList.add('is-visible'));
  requestAnimationFrame(()=>requestAnimationFrame(()=>document.body.classList.add('is-ready')));
  let ticking=false;let previousPhase='';
  function updateScroll(){
    ticking=false;const y=scrollY;$('#header').classList.toggle('is-scrolled',y>35);
    const max=document.documentElement.scrollHeight-innerHeight;$('.reading-progress').style.transform=`scaleX(${max>0?Math.min(1,Math.max(0,y/max)):0})`;
    if(motion&&matchMedia('(min-width:761px)').matches){for(const card of rail.querySelectorAll('.rail-card')){const rect=card.getBoundingClientRect();if(rect.bottom>0&&rect.top<innerHeight){const progress=Math.max(-1,Math.min(1,(innerHeight*.5-rect.top)/(innerHeight+rect.height)));card.querySelector('img').style.setProperty('--parallax',(progress*16).toFixed(2)+'px');}}}
    const steps=[...document.querySelectorAll('.journey-step')];const middle=innerHeight*.48;let nearest=0;let distance=Infinity;
    steps.forEach((step,index)=>{const rect=step.getBoundingClientRect();const d=Math.abs(rect.top+Math.min(rect.height*.4,150)-middle);if(d<distance){distance=d;nearest=index;}});
    const phase=data.phases[nearest];if(phase&&phase.id!==previousPhase){previousPhase=phase.id;steps.forEach((step,index)=>step.classList.toggle('is-active',index===nearest));$('#workbench').dataset.phase=phase.id;$('#phase-number').textContent=phase.number;$('#phase-name').textContent=phase.label;$('#phase-progress').textContent=phase.number+' / 03';}
  }
  function scheduleScroll(){if(!ticking){ticking=true;requestAnimationFrame(updateScroll);}}
  addEventListener('scroll',scheduleScroll,{passive:true});addEventListener('resize',scheduleScroll);rail.addEventListener('scroll',scheduleScroll,{passive:true});document.fonts.ready.then(scheduleScroll);scheduleScroll();
  $('#year').textContent=new Date().getFullYear();
})();
