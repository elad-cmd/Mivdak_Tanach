/* ============================================================
   quiz.js — מנוע התרגול המשותף לכל האתר
   עקרון הפידבק: לעולם לא לחשוף את התשובה בטעות ראשונה.
   כל מסיח מסביר למה דווקא הוא אינו נכון, והתשובה הנכונה
   מסבירה למה היא נכונה — לא רק "נכון".
   ============================================================ */
function norm(s){
  return (s||'').trim()
    .replace(/["'.,־–\-]/g,'')
    .replace(/\s+/g,'')
    .replace(/[ךםןףץ]/g,function(c){return {'ך':'כ','ם':'מ','ן':'נ','ף':'פ','ץ':'צ'}[c];});
}
document.querySelectorAll('.quiz[data-type="mc"]').forEach(function(q){
  var opts=q.querySelectorAll('.opt');
  var fb=q.querySelector('.feedback');
  var tries=0;
  opts.forEach(function(o){
    o.addEventListener('click',function(){
      if(q.dataset.solved) return;                       // כבר נענתה נכון
      if(o.classList.contains('wrong')) {                // מסיח שכבר נפסל — להזכיר למה
        fb.className='feedback show no';
        fb.innerHTML='<b>כבר בדקנו את התשובה הזאת.</b> '+(o.dataset.why||'');
        return;
      }
      if(o.dataset.correct==='true'){
        q.dataset.solved='1';
        o.classList.add('correct');
        fb.className='feedback show ok';
        fb.innerHTML='<b>✔ נכון'+(tries?', אחרי '+(tries+1)+' ניסיונות':'')+'.</b> '+(q.dataset.explain||'');
      }else{
        tries++;
        o.classList.add('wrong');
        var left=0; opts.forEach(function(x){ if(!x.classList.contains('wrong')) left++; });
        var why=o.dataset.why||'התשובה הזאת אינה מתאימה למה שנאמר בפסוקים.';
        fb.className='feedback show no';
        fb.innerHTML='<b>✘ לא זו.</b> '+why+
          (left>1?'<br><span style="opacity:.75">נשארו '+left+' אפשרויות. קראו שוב את השאלה ונסו שוב.</span>'
                 :'<br><span style="opacity:.75">נשארה אפשרות אחת — סמנו אותה.</span>');
      }
    });
  });
});
document.querySelectorAll('.quiz[data-type="fill"]').forEach(function(q){
  var inp=q.querySelector('input');
  var btn=q.querySelector('.checkbtn');
  var fb=q.querySelector('.feedback');
  var raw=(q.dataset.answer||'').split('|');
  var answers=raw.map(norm);
  var tries=0;
  function check(){
    var val=(inp.value||'').trim();
    if(!val){ fb.className='feedback show no'; fb.innerHTML='<b>כתבו תשובה</b> ואז לחצו "בדיקה".'; return; }
    if(answers.indexOf(norm(val))>-1){
      fb.className='feedback show ok';
      fb.innerHTML='<b>✔ נכון'+(tries?', אחרי '+(tries+1)+' ניסיונות':'')+'.</b> '+(q.dataset.explain||'');
      return;
    }
    tries++;
    var a=raw[0].trim();
    if(tries===1){
      fb.className='feedback show no';
      fb.innerHTML='<b>✘ עוד לא.</b> קראו שוב את המשפט — התשובה נמצאת בו או נובעת ממנו ישירות. נסו שוב.';
    } else if(tries===2){
      fb.className='feedback show partial';
      fb.innerHTML='<b>רמז:</b> התשובה בת '+a.replace(/\s/g,'').length+' אותיות ומתחילה באות <b>'+a.charAt(0)+'</b>. נסו שוב.';
    } else {
      fb.className='feedback show no';
      fb.innerHTML='<b>התשובה היא: '+a+'</b><br>'+(q.dataset.explain||'')+
        '<br><span style="opacity:.75">כדאי לחזור לפסוק ולראות מאיפה היא מגיעה.</span>';
    }
  }
  btn.addEventListener('click',check);
  inp.addEventListener('keydown',function(e){if(e.key==='Enter')check();});
});
// שאלה פתוחה — בדיקה מבוססת רעיונות/מילות מפתח
function normOpen(s){
  return (s||'')
    .replace(/[֑-ׇ]/g,'')
    .replace(/["'.,־–\-?!:;()]/g,'')
    .replace(/[ךםןףץ]/g,function(c){return {'ך':'כ','ם':'מ','ן':'נ','ף':'פ','ץ':'צ'}[c];})
    .replace(/\s+/g,' ').trim();
}
document.querySelectorAll('.quiz[data-type="open-check"]').forEach(function(q){
  var ta=q.querySelector('textarea'), btn=q.querySelector('.checkbtn'), fb=q.querySelector('.feedback'), model=q.querySelector('.model');
  var points=(q.dataset.points||'').split(';;').map(function(p){var i=p.split('::');return {label:i[0], syns:(i[1]||'').split('|').map(normOpen).filter(Boolean)};});
  btn.addEventListener('click',function(){
    var t=normOpen(ta.value);
    if(t.length<2){ fb.className='feedback show no'; fb.innerHTML='כתבו תשובה ואז לחצו "בדיקה".'; return; }
    var hit=[],miss=[];
    points.forEach(function(pt){ (pt.syns.some(function(s){return t.indexOf(s)>-1;})) ? hit.push(pt.label) : miss.push(pt.label); });
    var need=q.dataset.min?parseInt(q.dataset.min,10):points.length;
    var ok=q.dataset.min?(hit.length>=need):(miss.length===0);
    var html=q.dataset.min
      ? ('מצאת <b>'+hit.length+'</b> דוגמאות מתאימות (צריך לפחות '+need+').')
      : ('כיסית <b>'+hit.length+'</b> מתוך <b>'+points.length+'</b> רעיונות מרכזיים.');
    if(hit.length) html+='<br>✔ זיהינו בתשובתך: '+hit.join(' · ');
    if(miss.length && !q.dataset.min) html+='<br><span class="miss"><i class="fa-solid fa-lightbulb"></i> כדאי להתייחס גם ל: '+miss.join(' · ')+'</span>';
    q.dataset.tries=(parseInt(q.dataset.tries||'0',10)+1);
    var reveal = ok || parseInt(q.dataset.tries,10)>=2;
    if(!ok && !reveal) html+='<br><span style="opacity:.8">השלימו את מה שחסר ולחצו "בדיקה" שוב.</span>';
    else html+='<br><span style="opacity:.8">השוו לתשובה לדוגמה שנפתחה למטה.</span>';
    fb.className='feedback show '+(ok?'ok':(hit.length?'partial':'no'));
    fb.innerHTML=html;
    if(model && reveal) model.open=true;
  });
});
// התאמה ויזואלית — מתחברים בקווים, ואז "בדיקה" מסמן נכון/טעות
document.querySelectorAll('.quiz[data-type="match"]').forEach(function(q){
  var match=q.querySelector('.match'), fb=q.querySelector('.feedback');
  if(!match) return;
  var SVGNS='http://www.w3.org/2000/svg';
  var svg=document.createElementNS(SVGNS,'svg'); svg.setAttribute('class','match__lines');
  match.insertBefore(svg, match.firstChild);
  var items=Array.prototype.slice.call(q.querySelectorAll('.mitem'));
  var cells=Array.prototype.slice.call(q.querySelectorAll('.mitem, .mopt'));
  var btn=document.createElement('button'); btn.className='btn matchcheck';
  btn.innerHTML='<i class="fa-solid fa-check"></i> בדיקה';
  fb.parentNode.insertBefore(btn, fb);
  var sel=null, pairs=[];
  function role(c){ return c.classList.contains('mitem')?'item':'opt'; }
  function clearSel(){ if(sel){ sel.classList.remove('sel'); sel=null; } }
  function pairOf(c){ for(var i=0;i<pairs.length;i++){ if(pairs[i].item===c||pairs[i].opt===c) return pairs[i]; } return null; }
  function resetColors(){ cells.forEach(function(c){ c.classList.remove('matched','wrong'); }); }
  function removePair(p){ if(!p) return; if(p.line.parentNode) p.line.parentNode.removeChild(p.line); pairs.splice(pairs.indexOf(p),1); }
  function position(p){
    var box=match.getBoundingClientRect(), a=p.item.getBoundingClientRect(), b=p.opt.getBoundingClientRect();
    p.line.setAttribute('x1', a.left-box.left); p.line.setAttribute('y1', a.top-box.top+a.height/2);
    p.line.setAttribute('x2', b.right-box.left); p.line.setAttribute('y2', b.top-box.top+b.height/2);
  }
  function redraw(){ pairs.forEach(position); }
  function addPair(item,opt){
    removePair(pairOf(item)); removePair(pairOf(opt));
    var line=document.createElementNS(SVGNS,'line'); svg.appendChild(line);
    var p={item:item,opt:opt,line:line}; pairs.push(p); position(p);
    resetColors(); fb.className='feedback';
  }
  cells.forEach(function(c){
    c.addEventListener('click',function(){
      var ep=pairOf(c);
      if(!sel){ if(ep){ removePair(ep); resetColors(); fb.className='feedback'; return; } c.classList.add('sel'); sel=c; return; }
      if(sel===c){ clearSel(); return; }
      if(role(sel)===role(c)){ sel.classList.remove('sel'); c.classList.add('sel'); sel=c; return; }
      var item=role(sel)==='item'?sel:c, opt=role(sel)==='item'?c:sel;
      addPair(item,opt); clearSel();
    });
  });
  btn.addEventListener('click',function(){
    if(!pairs.length){ fb.className='feedback show no'; fb.innerHTML='לחצו על פריט ואז על ההתאמה שלו בצד השני, ואז על "בדיקה".'; return; }
    var correct=0, total=items.length;
    pairs.forEach(function(p){
      var ok=p.opt.dataset.k && p.opt.dataset.k===p.item.dataset.k;
      p.line.setAttribute('class', ok?'ok':'bad');
      p.item.classList.remove('matched','wrong'); p.opt.classList.remove('matched','wrong');
      p.item.classList.add(ok?'matched':'wrong'); p.opt.classList.add(ok?'matched':'wrong');
      if(ok) correct++;
    });
    fb.className='feedback show '+(correct===total?'ok':(correct?'partial':'no'));
    fb.innerHTML=(correct===total)
      ? ('✔ כל הכבוד! כל '+total+' ההתאמות נכונות.')
      : ('סימנתי: <b>'+correct+'</b> מתוך <b>'+total+'</b> נכונות — ירוק = נכון, אדום = טעות. תקנו ובדקו שוב.');
  });
  window.addEventListener('resize', redraw);
});
// טאבים: מציג נושא אחד בכל פעם
(function(){
  var bar=document.getElementById('topicTabs'), host=document.getElementById('topicHost');
  if(!bar||!host) return;
  var tabs=Array.prototype.slice.call(bar.querySelectorAll('.tab'));
  var ids=tabs.map(function(t){return t.dataset.target;});
  var panels={}; ids.forEach(function(id){panels[id]=[];});
  var cur=null;
  Array.prototype.slice.call(host.children).forEach(function(node){
    var isGlobal=node.classList&&(node.classList.contains('legend')||node.classList.contains('center'));
    if(node.id&&ids.indexOf(node.id)>-1){ cur=node.id; panels[cur].push(node); }
    else if(isGlobal){ /* גלובלי — תמיד מוצג */ }
    else if(cur){ panels[cur].push(node); }
  });
  // מונה שאלות לכל נושא — באנר מתחת לכותרת הנושא (רשמיות + לתרגול)
  var qaOn=(getComputedStyle(document.documentElement).getPropertyValue("--qa-counts")||"").trim()!=="none";
  if(qaOn) ids.forEach(function(id){
    var quizzes=panels[id].filter(function(x){return x.classList&&x.classList.contains('quiz');});
    if(!quizzes.length) return;
    var off=quizzes.filter(function(x){return x.classList.contains('is-official');}).length;
    var add=quizzes.length-off;
    var title=document.getElementById(id);
    if(!title) return;
    var b=document.createElement('div');
    b.className='topic-count';
    b.style.cssText='display:flex;flex-wrap:wrap;align-items:center;gap:8px;background:#eef6f3;border:1px solid #cfe6df;border-radius:12px;padding:10px 14px;margin:10px 0 16px;font-weight:600;color:#2f6f60';
    b.innerHTML='<span><i class="fa-solid fa-list-check"></i> '+quizzes.length+' שאלות לתרגול:</span>'
      +'<span class="quiz__tag quiz__tag--official">★ '+off+' שאלות רשמיות לדוגמה</span>'
      +'<span class="quiz__tag quiz__tag--added">✎ '+add+' שאלות לתרגול</span>';
    if(title.nextSibling) title.parentNode.insertBefore(b,title.nextSibling); else title.parentNode.appendChild(b);
    panels[id].splice(panels[id].indexOf(title)+1,0,b);
  });
  function show(id){
    ids.forEach(function(pid){
      var disp=(pid===id)?'':'none';
      panels[pid].forEach(function(n){ n.style.display=disp; });
    });
    tabs.forEach(function(t){ t.classList.toggle('active', t.dataset.target===id); });
    var at=bar.querySelector('.tab.active'); if(at&&at.scrollIntoView) at.scrollIntoView({inline:'center',block:'nearest'});
    window.scrollTo({top:0,behavior:'smooth'});
  }
  tabs.forEach(function(t){ t.addEventListener('click',function(){ show(t.dataset.target); }); });
  var hdr=document.querySelector('.site-header');
  function setTop(){ bar.style.top=((hdr?hdr.offsetHeight:0))+'px'; }
  setTop(); window.addEventListener('resize',setTop);
  show(ids.indexOf("avot")>-1?"avot":ids[0]);
})();
