let names=[],filter="all";
const cards=document.querySelector("#cards"),q=document.querySelector("#q"),count=document.querySelector("#count");
function norm(v=""){return String(v).normalize("NFKD").replace(/[\u0591-\u05C7\u064B-\u065F\u0670\u06D6-\u06ED]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه").toLowerCase().trim()}
function render(){
 const s=norm(q.value);
 const x=names.filter(n=>{
  if(filter==="female"||filter==="male"){if(n.gender!==filter)return false;}else if(filter==="biblical"&&n.category!=="biblical")return false;
  const hay=[n.he,n.ar,n.latin,n.meaning,n.linguistic,n.cultural].map(norm).join(" ");
  return !s||hay.includes(s);
 });
 count.textContent=x.length+" שמות";
 cards.innerHTML=x.map(n=>`<article class="card"><div class="name-row"><div><div class="arabic" lang="ar" dir="rtl">${n.ar}</div><div class="hebrew">${n.he}</div><div class="latin" dir="ltr">${n.latin}</div><button class="speak" type="button" data-ar="${n.ar}" aria-label="השמעת ${n.he} בערבית">🔊 הגייה</button></div><span class="tag">${n.gender==="female"?"נקבה":"זכר"}</span></div><h3>משמעות</h3><p>${n.meaning}</p><h3>מקור לשוני</h3><p>${n.linguistic}</p><h3>משמעות / הקשר תרבותי</h3><p>${n.cultural}</p></article>`).join("")||"<p>לא נמצאו שמות מתאימים.</p>";
}
fetch("/names.json",{cache:"no-store"}).then(r=>r.json()).then(x=>{names=x;render()});
q.addEventListener("input",render);q.addEventListener("search",render);q.addEventListener("keyup",render);
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{const a=document.querySelector(".filter.active");if(a)a.classList.remove("active");b.classList.add("active");filter=b.dataset.filter;render()});
if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("/sw.js"));
let dp;const ib=document.querySelector("#install");addEventListener("beforeinstallprompt",e=>{e.preventDefault();dp=e;ib.hidden=false});ib.onclick=async()=>{if(dp){dp.prompt();await dp.userChoice;dp=null;ib.hidden=true}};addEventListener("appinstalled",()=>ib.hidden=true);
function speakArabic(text){
 if(!("speechSynthesis" in window))return;
 speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance(text);
 u.lang="ar";
 const vs=speechSynthesis.getVoices();
 const ar=vs.find(v=>String(v.lang).toLowerCase().startsWith("ar"));
 if(ar)u.voice=ar;
 u.rate=.82;
 speechSynthesis.speak(u);
}
cards.addEventListener("click",e=>{const b=e.target.closest(".speak");if(b)speakArabic(b.dataset.ar);});
