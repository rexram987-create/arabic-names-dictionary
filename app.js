let names=[],filter="all";
const cards=document.querySelector("#cards"),q=document.querySelector("#q"),count=document.querySelector("#count");
const aliases={
  muhammad:["מוחמד","מחמד","محمد","mohammed","mohammad","muhammed"],
  sulayman:["סולימאן","סלימאן","suleiman","sulayman","soliman"],
  tawfiq:["תופיק","תאופיק","tawfiq","toufik","tawfik"],
  lubna:["לובנא","לובנה","לבנא","lubna","lubnah"]
};
function norm(v=""){return String(v).normalize("NFKD").replace(/[\u0591-\u05C7\u064B-\u065F\u0670\u06D6-\u06ED]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه").replace(/[\u0027\u2018\u2019\u02BC\u05F3\u0060\u00B4]/g,"").toLowerCase().trim()}
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function render(){
 const s=norm(q.value);
 const x=names.filter(n=>{
  if(filter==="female"||filter==="male"){if(n.gender!==filter&&n.gender!=="both")return false;}else if(filter==="biblical"&&n.category!=="biblical")return false;
  const hay=[n.he,n.ar,n.latin,n.meaning,n.linguistic,n.cultural,...(aliases[n.id]||[])].map(norm).join(" ");
  return !s||hay.includes(s);
 });
 count.textContent=x.length+" שמות";
 cards.innerHTML=x.map(n=>`<article class="card"><div class="name-row"><div><div class="arabic" lang="ar" dir="rtl">${escapeHtml(n.ar)}</div><div class="hebrew">${escapeHtml(n.he)}</div><div class="latin" dir="ltr">${escapeHtml(n.latin)}</div><button class="speak" type="button" data-ar="${escapeHtml(n.ar)}" aria-label="השמעת ${escapeHtml(n.he)} בערבית">🔊 הגייה</button></div><span class="tag">${n.gender==="both"?"זכר ונקבה":n.gender==="female"?"נקבה":"זכר"}</span></div><h3>משמעות</h3><p>${escapeHtml(n.meaning)}</p><p class="certainty"><strong>רמת ודאות אטימולוגית:</strong> ${escapeHtml(n.certainty||"בבדיקה")}</p><h3>מקור לשוני</h3><p>${escapeHtml(n.linguistic)}</p><h3>משמעות / הקשר תרבותי</h3><p>${escapeHtml(n.cultural)}</p>${Array.isArray(n.sources)&&n.sources.length?'<h3>מקורות</h3><ul>'+n.sources.filter(s=>{try{return ["https:"].includes(new URL(s.url).protocol)}catch{return false}}).map(s=>`<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.title||"מקור")}</a></li>`).join("")+'</ul>':'<p class="source-note">טרם צורף מקור חיצוני מאומת לרשומה זו.</p>'}</article>`).join("")||"<p>לא נמצאו שמות מתאימים.</p>";
}
async function loadNames(){
 count.textContent="טוען שמות…";cards.innerHTML="";
 try{
  const r=await fetch("/names.json",{cache:"no-store"});
  if(!r.ok)throw new Error("HTTP "+r.status);
  const data=await r.json();
  if(!Array.isArray(data)||!data.every(n=>n&&n.id&&n.he&&n.ar&&n.meaning))throw new Error("Invalid dictionary data");
  names=data;render();
 }catch(err){
  console.error("Dictionary load failed",err);
  count.textContent="לא ניתן לטעון את המילון כרגע.";
  cards.innerHTML='<div role="alert" class="card"><p>אירעה תקלה בטעינת השמות. בדוק את החיבור ונסה שוב.</p><button id="retry" type="button">נסה שוב</button></div>';
  document.querySelector("#retry").addEventListener("click",loadNames);
 }
}
loadNames();
q.addEventListener("input",render);q.addEventListener("search",render);
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{const a=document.querySelector(".filter.active");if(a)a.classList.remove("active");b.classList.add("active");filter=b.dataset.filter;render()});
if("serviceWorker"in navigator)addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(console.warn));
let dp;const ib=document.querySelector("#install");addEventListener("beforeinstallprompt",e=>{e.preventDefault();dp=e;ib.hidden=false});ib.onclick=async()=>{if(dp){dp.prompt();await dp.userChoice;dp=null;ib.hidden=true}};addEventListener("appinstalled",()=>ib.hidden=true);
const abdallahRecording=new Audio("/audio/Generated%20Audio%20September%2021%2C%202026%20-%201_41PM.wav");
abdallahRecording.preload="auto";
function speakArabic(text){
 const isAbdallah=/^عَبْدُ الله$|^عبد الله$/.test(text.trim());
 if("speechSynthesis" in window)speechSynthesis.cancel();
 abdallahRecording.pause();
 abdallahRecording.currentTime=0;
 if(isAbdallah){
  abdallahRecording.play().catch(()=>{count.textContent="לא ניתן להשמיע את ההקלטה כרגע. נסה שוב.";});
  return;
 }
 if(!("speechSynthesis" in window)){count.textContent="המכשיר אינו תומך בהקראה.";return}
 const u=new SpeechSynthesisUtterance(text);
 u.lang="ar";
 const ar=speechSynthesis.getVoices().find(v=>String(v.lang).toLowerCase().startsWith("ar"));
 if(ar)u.voice=ar;
 u.rate=.82;
 speechSynthesis.speak(u);
}
cards.addEventListener("click",e=>{const b=e.target.closest(".speak");if(b)speakArabic(b.dataset.ar)});
