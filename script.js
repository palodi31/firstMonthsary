// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const targetId = a.getAttribute('href');
    if (targetId.length > 1){
      e.preventDefault();
      document.querySelector(targetId)?.scrollIntoView({behavior:'smooth'});
      // collapse nav on mobile
      const nav = document.getElementById('nav');
      if (nav.classList.contains('show')) new bootstrap.Collapse(nav).hide();
    }
  });
});

// Message hearts counter
const addHeartBtn = document.getElementById('addHeartBtn');
const heartCount = document.getElementById('heartCount');
let hearts = 0;
addHeartBtn?.addEventListener('click', ()=>{
  hearts++;
  heartCount.textContent = `${hearts} ${hearts===1?'heart':'hearts'} added`;
  addHeartBtn.classList.add('heart-pop');
  setTimeout(()=>addHeartBtn.classList.remove('heart-pop'), 600);
});

// Lightbox logic (with caption)
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');

document.querySelectorAll('#gallery a[data-bs-target="#lightbox"]').forEach(link=>{
  link.addEventListener('click', ()=>{
    const img = link.getAttribute('data-img');
    const caption = link.getAttribute('data-caption') || '';
    lightboxImg.src = img;
    lightboxCaption.textContent = caption;
  });
});

/* ===== Spotify-like Player (no hearts tied to play) ===== */
const audio = document.getElementById('audio');
const playPause = document.getElementById('playPause');
const seek = document.getElementById('seek');
const cur = document.getElementById('cur');
const dur = document.getElementById('dur');
const volume = document.getElementById('volume');

function fmt(t){
  if(!isFinite(t)) return '0:00';
  const m = Math.floor(t/60);
  const s = Math.floor(t%60).toString().padStart(2,'0');
  return `${m}:${s}`;
}
function updateProgress(){
  if(!audio.duration) return;
  seek.value = (audio.currentTime / audio.duration) * 100;
  cur.textContent = fmt(audio.currentTime);
}
playPause?.addEventListener('click', ()=>{
  if(audio.paused){ audio.play(); } else { audio.pause(); }
});
audio?.addEventListener('loadedmetadata', ()=>{
  dur.textContent = fmt(audio.duration);
  updateProgress();
});
audio?.addEventListener('timeupdate', updateProgress);
audio?.addEventListener('play', ()=>{
  playPause.innerHTML = '<i class="bi bi-pause-fill me-1"></i> Pause';
});
audio?.addEventListener('pause', ()=>{
  playPause.innerHTML = '<i class="bi bi-play-fill me-1"></i> Play';
});
audio?.addEventListener('ended', ()=>{
  playPause.innerHTML = '<i class="bi bi-play-fill me-1"></i> Play';
  seek.value = 0; cur.textContent = '0:00';
});
seek?.addEventListener('input', ()=>{
  if(!audio.duration) return;
  audio.currentTime = (seek.value/100) * audio.duration;
});
volume?.addEventListener('input', ()=>{
  audio.volume = parseFloat(volume.value);
});

/* ===== I Love You: Floating Hearts (independent button) ===== */
const heartsField = document.getElementById('heartsContainer');
const toggleHeartsBtn = document.getElementById('toggleHearts');

let heartTimer = null;
let heartsOn = false;

// Red/pink-only heart set (more variants)
const HEART_EMOJIS = ['❤️','🩷','💖','💗','💓','💞','💘','💝','💙'];

function spawnHeart(){
  const h = document.createElement('div');
  h.className = 'floating-heart';
  h.textContent = HEART_EMOJIS[Math.floor(Math.random()*HEART_EMOJIS.length)];
  h.style.left = Math.random()*90 + '%';
  h.style.bottom = '10px';
  // slight randomize size & rotation for variety
  h.style.transform = `scale(${0.9 + Math.random()*0.6}) rotate(${(Math.random()*20-10)}deg)`;
  heartsField.appendChild(h);
  setTimeout(()=>h.remove(), 6200);
}

function startHearts(){
  if(heartTimer) return;
  spawnHeart();
  heartTimer = setInterval(spawnHeart, 480);
}
function stopHearts(){
  clearInterval(heartTimer);
  heartTimer = null;
}

toggleHeartsBtn?.addEventListener('click', ()=>{
  heartsOn = !heartsOn;
  if(heartsOn){
    toggleHeartsBtn.innerHTML = '<i class="bi bi-heartbreak me-1"></i> Stop Floating Hearts';
    startHearts();
  }else{
    toggleHeartsBtn.innerHTML = '<i class="bi bi-heart-fill me-1"></i> Release Floating Hearts';
    stopHearts();
  }
});

/* === Daisy Garden: Day/Night toggle + fireflies === */
const toggleGardenBtn = document.getElementById('toggleGarden');
const dayScene = document.getElementById('dayScene');
const nightScene = document.getElementById('nightScene');
const daisiesGroup = document.getElementById('daisies');
const firefliesLayer = document.getElementById('fireflies');

let nightMode = false;
let fireflyTimer = null;

function setNight(on){
  nightMode = on;
  dayScene.style.display = on ? 'none' : 'block';
  nightScene.style.display = on ? 'block' : 'none';

  // add/remove glow on daisies
  if(on){
    daisiesGroup.classList.add('night-glow');
    toggleGardenBtn.innerHTML = '<i class="bi bi-sun me-1"></i> Day Mode';
    startFireflies();
  }else{
    daisiesGroup.classList.remove('night-glow');
    toggleGardenBtn.innerHTML = '<i class="bi bi-moon-stars me-1"></i> Night Mode';
    stopFireflies();
  }
}

function spawnFirefly(){
  // random position across the meadow
  const x = 120 + Math.random()*960;
  const y = 300 + Math.random()*80;
  const ff = document.createElementNS('http://www.w3.org/2000/svg','circle');
  ff.setAttribute('cx', x.toFixed(1));
  ff.setAttribute('cy', y.toFixed(1));
  ff.setAttribute('r', (1.8 + Math.random()*1.2).toFixed(1));
  ff.setAttribute('class','firefly');
  // small random animation delay
  ff.style.animationDelay = (Math.random()*2)+'s';
  firefliesLayer.appendChild(ff);
  // clean up after a while
  setTimeout(()=> ff.remove(), 8000);
}

function startFireflies(){
  if(fireflyTimer) return;
  // seed a few
  for(let i=0;i<10;i++) spawnFirefly();
  fireflyTimer = setInterval(()=> spawnFirefly(), 700);
}
function stopFireflies(){
  clearInterval(fireflyTimer); fireflyTimer = null;
  while(firefliesLayer.firstChild) firefliesLayer.firstChild.remove();
}

toggleGardenBtn?.addEventListener('click', ()=> setNight(!nightMode));
// default: Day
setNight(false);

/* ==== Daisy Garden: random stem directions & amplitudes ==== */
(function(){
  const groups = document.querySelectorAll('#daisies > g');
  if(!groups.length) return;

  groups.forEach((g, i) => {
    // baseline tilt between -5° and +5°
    const tilt = (Math.random() * 10 - 5).toFixed(2) + 'deg';

    // sway amplitude between -1.8° and +1.8° (avoid 0 so it always moves)
    let ampVal = (Math.random() * 3.6 - 1.8);
    if (Math.abs(ampVal) < 0.4) ampVal = ampVal < 0 ? -0.6 : 0.6; // nudge away from 0
    const amp = ampVal.toFixed(2) + 'deg';

    g.style.setProperty('--tilt', tilt);
    g.style.setProperty('--amp', amp);

    // desynchronize timing a bit
    g.style.animationDuration = (5.6 + Math.random()*1.4).toFixed(2) + 's';
    g.style.animationDelay = (Math.random()*1.5).toFixed(2) + 's';
  });
})();

/* === Random rotation for each daisy head === */
document.querySelectorAll('#daisies use').forEach(useEl => {
  const rot = (Math.random() * 360).toFixed(1);
  // Append a rotation after existing transform
  const old = useEl.getAttribute('transform') || '';
  useEl.setAttribute('transform', old + ` rotate(${rot})`);
});

/* === Virtual Teddy interactions === */
(() => {
  const teddy = document.querySelector('#teddy .teddy') || document.querySelector('#teddy svg #teddy');
  const eyes = document.querySelector('#teddy svg #eyes');
  const btnHug = document.getElementById('btnHug');
  const btnWave = document.getElementById('btnWave');
  const btnBlink = document.getElementById('btnBlink');
  const heartsLayer = document.getElementById('teddyHearts');

  if(!teddy) return;

  function spawnTeddyHeart(){
    const HEARTS = ['❤️','🩷','💖','💗','💓','💞','💘','💝'];
    const h = document.createElement('div');
    h.className = 'teddy-heart';
    h.textContent = HEARTS[Math.floor(Math.random()*HEARTS.length)];
    const x = 35 + Math.random()*30; // roughly chest area %
    const y = 55 + Math.random()*10;
    h.style.left = x + '%';
    h.style.top = y + '%';
    heartsLayer.appendChild(h);
    setTimeout(()=>h.remove(), 2000);
  }

  btnHug?.addEventListener('click', ()=>{
    teddy.classList.remove('wave','blink'); // reset others
    teddy.classList.add('hug');
    // burst of hearts
    for(let i=0;i<7;i++) setTimeout(spawnTeddyHeart, i*120);
    setTimeout(()=> teddy.classList.remove('hug'), 1000);
  });

  btnWave?.addEventListener('click', ()=>{
    teddy.classList.remove('hug','blink');
    teddy.classList.add('wave');
    setTimeout(()=> teddy.classList.remove('wave'), 1100);
  });

  btnBlink?.addEventListener('click', ()=>{
    teddy.classList.remove('hug','wave');
    teddy.classList.add('blink');
    setTimeout(()=> teddy.classList.remove('blink'), 240);
  });

  // Cute auto-blink every ~6–9s
  setInterval(()=>{
    if(!document.hidden){
      teddy.classList.add('blink');
      setTimeout(()=> teddy.classList.remove('blink'), 240);
    }
  }, 3000 + Math.random()*3000);
})();

