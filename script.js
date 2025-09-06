 // Smooth scroll for anchor links (nice on mobile)
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', e=>{
        const targetId = a.getAttribute('href');
        if(targetId.length>1){
          e.preventDefault();
          document.querySelector(targetId)?.scrollIntoView({behavior:'smooth'});
          // collapse nav on mobile after click
          const nav = document.getElementById('nav');
          if(nav.classList.contains('show')) new bootstrap.Collapse(nav).hide();
        }
      })
    })

    // Message hearts counter
    const addHeartBtn = document.getElementById('addHeartBtn');
    const heartCount = document.getElementById('heartCount');
    let hearts = 0;
    addHeartBtn.addEventListener('click', ()=>{
      hearts++;
      heartCount.textContent = `${hearts} ${hearts===1?'heart':'hearts'} added`;
      addHeartBtn.classList.add('heart-pop');
      setTimeout(()=>addHeartBtn.classList.remove('heart-pop'), 600);
    });

    // Lightbox logic
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    document.querySelectorAll('#gallery a[data-bs-target="#lightbox"]').forEach(link=>{
      link.addEventListener('click', e=>{
        const img = link.getAttribute('data-img');
        lightboxImg.src = img;
      });
    });

    // Bouquet generator (simple radial flowers)
    const svg = document.getElementById('bouquetSvg');
    const flowersLayer = document.getElementById('flowersLayer');
    const stemsLayer = document.getElementById('stems');
    const colorPicker = document.getElementById('colorPicker');
    const countRange = document.getElementById('countRange');
    const countLabel = document.getElementById('countLabel');
    const regenBtn = document.getElementById('regenBtn');
    const savePngBtn = document.getElementById('savePngBtn');
    const noteInput = document.getElementById('noteInput');

    countRange.addEventListener('input', ()=>countLabel.textContent = countRange.value);

    function rand(min,max){return Math.random()*(max-min)+min}

    function drawBouquet(){
      const n = parseInt(countRange.value,10);
      const color = colorPicker.value;
      const type = document.querySelector('input[name="flowerType"]:checked').value;
      flowersLayer.innerHTML = '';
      stemsLayer.innerHTML = '';

      const centerX = 150, baseY = 230;
      for(let i=0;i<n;i++){
        const x = centerX + rand(-50,50);
        const y = baseY - rand(30,85);

        // draw stem
        const stem = document.createElementNS('http://www.w3.org/2000/svg','path');
        stem.setAttribute('d', `M ${centerX} ${baseY} Q ${centerX+rand(-20,20)} ${y+rand(10,30)} ${x} ${y}`);
        stemsLayer.appendChild(stem);

        // draw flower by type
        const g = document.createElementNS('http://www.w3.org/2000/svg','g');
        g.setAttribute('transform', `translate(${x},${y})`);

        if(type==='rose'){
          // layered petals
          for(let r=3; r>0; r--){
            const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
            c.setAttribute('cx',0); c.setAttribute('cy',0);
            c.setAttribute('r', 10 + r*4);
            c.setAttribute('fill', color);
            c.setAttribute('opacity', 0.25 + r*0.18);
            g.appendChild(c);
          }
          const core = document.createElementNS('http://www.w3.org/2000/svg','circle');
          core.setAttribute('r',7); core.setAttribute('fill', color);
          g.appendChild(core);
        } else if(type==='tulip'){
          const path = document.createElementNS('http://www.w3.org/2000/svg','path');
          path.setAttribute('d','M0 0 C -10 -12, -10 -26, 0 -28 C 10 -26, 10 -12, 0 0 z');
          path.setAttribute('fill', color);
          g.appendChild(path);
          for(let k=-8;k<=8;k+=8){
            const petal = document.createElementNS('http://www.w3.org/2000/svg','path');
            petal.setAttribute('d',`M${k} -6 C ${k-8} -16, ${k-8} -24, ${k} -28`);
            petal.setAttribute('stroke', color);
            petal.setAttribute('fill','none');
            petal.setAttribute('stroke-width','3');
            g.appendChild(petal);
          }
        } else { // daisy
          const petals = 10;
          for(let a=0;a<petals;a++){
            const angle = (Math.PI*2/petals)*a;
            const px = Math.cos(angle)*12;
            const py = Math.sin(angle)*12;
            const el = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
            el.setAttribute('cx',px); el.setAttribute('cy',py);
            el.setAttribute('rx',7); el.setAttribute('ry',12);
            el.setAttribute('fill', color);
            el.setAttribute('opacity','.9');
            g.appendChild(el);
          }
          const core = document.createElementNS('http://www.w3.org/2000/svg','circle');
          core.setAttribute('r',6); core.setAttribute('fill', '#ffd166');
          g.appendChild(core);
        }

        flowersLayer.appendChild(g);
      }

      // Optional note
      const oldNote = document.getElementById('noteSvg');
      if(oldNote) oldNote.remove();
      if(noteInput.value.trim()){
        const text = document.createElementNS('http://www.w3.org/2000/svg','text');
        text.setAttribute('id','noteSvg');
        text.setAttribute('x','150');
        text.setAttribute('y','270');
        text.setAttribute('text-anchor','middle');
        text.setAttribute('font-size','12');
        text.setAttribute('fill','#6c757d');
        text.textContent = noteInput.value.trim();
        svg.appendChild(text);
      }
    }

    // Convert SVG to PNG and download
    function downloadPNG(){
      const serializer = new XMLSerializer();
      const svgData = serializer.serializeToString(svg);
      const svgBlob = new Blob([svgData], {type:'image/svg+xml;charset=utf-8'});
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = function(){
        const canvas = document.createElement('canvas');
        canvas.width = 1000; canvas.height = 1000;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        URL.revokeObjectURL(url);
        const a = document.createElement('a');
        a.download = 'bouquet.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
      }
      img.src = url;
    }

    regenBtn.addEventListener('click', (e)=>{e.preventDefault(); drawBouquet();});
    savePngBtn.addEventListener('click', (e)=>{e.preventDefault(); downloadPNG();});
    document.querySelectorAll('input[name="flowerType"]').forEach(r=>r.addEventListener('change', drawBouquet));
    colorPicker.addEventListener('change', drawBouquet);
    countRange.addEventListener('change', drawBouquet);

    // Initial render
    drawBouquet();

    // I Love You: floating hearts
    const heartsContainer = document.getElementById('heartsContainer');
    function spawnHeart(){
      const h = document.createElement('div');
      h.className = 'floating-heart';
      h.style.left = Math.random()*100 + 'vw';
      h.style.bottom = '-20px';
      h.style.animationDelay = (Math.random()*1.5)+'s';
      h.textContent = ['❤','💖','💗','💓','💞'][Math.floor(Math.random()*5)];
      heartsContainer.appendChild(h);
      setTimeout(()=>h.remove(), 7000);
    }
    document.getElementById('confettiBtn').addEventListener('click', ()=>{
      for(let i=0;i<25;i++) setTimeout(spawnHeart, i*120);
    });