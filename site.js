/* ============================================================
   site.js — התנהגויות משותפות לכל עמודי האתר
   1. הסרגל העליון נעלם בגלילה למטה וחוזר מיד בגלילה למעלה
   ============================================================ */
(function(){
  var hdr = document.querySelector('.site-header');
  if(!hdr) return;
  var last = window.pageYOffset || 0;
  var THRESHOLD = 6;          // כמה פיקסלים צריך לגלול כדי להחליף מצב
  var ticking = false;

  function update(){
    ticking = false;
    var y = window.pageYOffset || 0;
    var h = hdr.offsetHeight || 0;

    // בראש העמוד — הסרגל תמיד גלוי
    if(y <= h){
      document.body.classList.remove('hdr-hidden');
      last = y;
      return;
    }
    var delta = y - last;
    if(delta > THRESHOLD){            // גוללים למטה — להסתיר
      document.body.classList.add('hdr-hidden');
      last = y;
    } else if(delta < -THRESHOLD){    // גוללים למעלה — להראות מיד
      document.body.classList.remove('hdr-hidden');
      last = y;
    }
  }

  window.addEventListener('scroll', function(){
    if(!ticking){ ticking = true; window.requestAnimationFrame(update); }
  }, {passive:true});
})();
