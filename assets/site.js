/* ArcTerra Expeditions · shared behaviour: menus, scroll-spy, rails, finder, forms, reading progress */
(function(){
  var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  // mobile menu
  var burger=$('.burger'),nav=$('#nav');
  if(burger&&nav){burger.addEventListener('click',function(){var o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o);document.body.style.overflow=o?'hidden':''})}
  // dropdowns: one open at a time, close on outside click / Esc, hover on desktop
  var dds=$$('.dd');var desk=window.matchMedia('(min-width:981px) and (hover:hover)');
  dds.forEach(function(d){
    d.addEventListener('toggle',function(){if(d.open)dds.forEach(function(o){if(o!==d)o.open=false})});
    var t;d.addEventListener('mouseenter',function(){if(desk.matches){clearTimeout(t);d.open=true}});
    d.addEventListener('mouseleave',function(){if(desk.matches){t=setTimeout(function(){d.open=false},180)}});
  });
  document.addEventListener('click',function(e){dds.forEach(function(d){if(!d.contains(e.target))d.open=false})});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){dds.forEach(function(d){d.open=false});if(nav&&nav.classList.contains('open')){nav.classList.remove('open');burger.setAttribute('aria-expanded',false);document.body.style.overflow=''}}});
  // scroll-spy sub-nav and table of contents
  var spies=$$('.subnav a, .toc a');
  if(spies.length&&'IntersectionObserver' in window){var map={};spies.forEach(function(a){var id=a.getAttribute('href').slice(1);(map[id]=map[id]||[]).push(a)});
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){spies.forEach(function(a){a.classList.remove('on')});(map[e.target.id]||[]).forEach(function(a){a.classList.add('on');var sn=a.closest('.subnav');if(sn)sn.scrollTo({left:a.offsetLeft-20,behavior:'smooth'})})}})},{rootMargin:'-30% 0px -60% 0px'});
    Object.keys(map).forEach(function(id){var el=document.getElementById(id);if(el)io.observe(el)})}
  // rails: arrow buttons
  $$('.railwrap').forEach(function(w){var r=$('.rail',w);$$('.railbtns button',w).forEach(function(b){b.addEventListener('click',function(){r.scrollBy({left:(b.dataset.dir==='prev'?-1:1)*r.clientWidth*.85,behavior:'smooth'})})})});
  // destination finder (works without JS: everything is visible)
  var fd=$('#finder');
  if(fd){var sel={path:$('#f-path'),style:$('#f-style'),month:$('#f-month')},items=$$('[data-dest]'),cnt=$('#f-count');
    var q=new URLSearchParams(location.search);['path','style','month'].forEach(function(k){if(q.get(k)&&sel[k])sel[k].value=q.get(k)});
    function run(){var p=sel.path.value,s=sel.style.value,m=sel.month.value,n=0,seen={};
      items.forEach(function(it){var ok=(p==='all'||it.dataset.path===p)&&(s==='all'||(' '+it.dataset.styles+' ').indexOf(' '+s+' ')>=0)&&(m==='all'||(' '+it.dataset.months+' ').indexOf(' '+m+' ')>=0);it.hidden=!ok;if(ok&&(fd.dataset.unit||!seen[it.dataset.dest])){seen[it.dataset.dest]=1;n++}});
      $$('.railgroup').forEach(function(g){g.hidden=!$$('[data-dest]:not([hidden])',g).length});
      var un=fd.dataset.unit||'destination';if(cnt)cnt.textContent=n+' '+un+(n===1?'':'s')+(m!=='all'&&un==='destination'?' in season':'');
      var u=new URL(location.href);['path','style','month'].forEach(function(k){if(sel[k].value==='all')u.searchParams.delete(k);else u.searchParams.set(k,sel[k].value)});history.replaceState(null,'',u)}
    Object.keys(sel).forEach(function(k){sel[k].addEventListener('change',run)});run()}
  // guide + newsletter forms → /api/subscribe
  $$('form[data-subscribe]').forEach(function(f){f.addEventListener('submit',function(e){e.preventDefault();var msg=$('.msg',f),btn=$('button',f);
    var data={};new FormData(f).forEach(function(v,k){data[k]=v});data.consent=!!f.querySelector('[name=consent]:checked')||f.dataset.subscribe==='newsletter';
    btn.disabled=true;msg.className='msg';msg.textContent='Sending…';
    fetch('/api/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}).then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j}})})
      .then(function(x){if(x.ok){msg.className='msg ok';msg.textContent=x.j.message||'Thank you. Check your inbox.';f.reset()}else throw new Error(x.j.error||'error')})
      .catch(function(err){msg.className='msg err';msg.textContent=(err&&err.message&&err.message!=='error')?err.message:'Sorry, that did not send. Please try again or email us.'})
      .then(function(){btn.disabled=false})})});
  // animated route previews: show a still poster, play the animation only when the card is on screen
  var anims=$$('img[data-anim]');
  if(anims.length&&'IntersectionObserver' in window&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&!(navigator.connection&&navigator.connection.saveData)){
    var toVid=function(i){var v=document.createElement('video');v.muted=true;v.defaultMuted=true;v.loop=true;v.autoplay=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('muted','');v.poster=i.currentSrc||i.src;v.className=i.className;v.style.cssText='width:100%;height:100%;object-fit:cover;display:block;'+i.style.cssText;v.setAttribute('aria-label',i.alt||'Animated route chart');v.width=i.width;v.height=i.height;v.src=i.dataset.anim;
      v.addEventListener('loadeddata',function(){if(i.parentNode)i.parentNode.replaceChild(v,i);var p=v.play();if(p&&p.catch)p.catch(function(){})},{once:true});v.load()};
    var io2=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var t=e.target;if(/\.mp4$/.test(t.dataset.anim))toVid(t);else t.src=t.dataset.anim;io2.unobserve(t)}})},{rootMargin:'160px 0px',threshold:.2});
    anims.forEach(function(i){io2.observe(i)})}
  // respect reduced motion on the hero route charts
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)$$('video.mapvid').forEach(function(v){v.removeAttribute('autoplay');v.pause()});
  // reading progress + back to top
  var pr=$('.progress'),tt=$('.totop');
  if(pr||tt){var art=$('.prose');window.addEventListener('scroll',function(){var y=window.scrollY;if(tt)tt.classList.toggle('on',y>900);
    if(pr&&art){var r=art.getBoundingClientRect(),h=art.offsetHeight-window.innerHeight*.6;pr.style.width=Math.max(0,Math.min(1,-r.top/h))*100+'%'}},{passive:true});
    if(tt)tt.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})})}
})();
