// ========= CONFIGURAÇÃO =========
const CONFIG = {
  GOOGLE_SHEET_URL: "https://script.google.com/macros/s/AKfycbzXGQBi3Egv1yoabS_fvLLhjg-Eo_GvSwFkflVbRrqzPDXpvrp23WaZIjA8VolvCbBmoQ/exec",
  WHATSAPP_NUMERO: "5575988239129",
  WHATSAPP_MENSAGEM: (nome) => `Olá! Eu ${nome} confirmo presença no aniversário de 1 ano da Ellys no dia 19/12 às 15h! 🎀🐑💖`
};
// =================================

// CORREÇÃO PRINCIPAL: proteger código que quebrava antes
// Hearts
const heartsBg = document.querySelector('.hearts-bg');
const heartEmojis = ['💖','💕','💗','🌸','✨','💛','🎀'];
if(heartsBg){
  setInterval(()=>{
    const h=document.createElement('div');
    h.className='heart';
    h.textContent=heartEmojis[Math.floor(Math.random()*heartEmojis.length)];
    h.style.left=Math.random()*100+'vw';
    h.style.animationDuration=(4+Math.random()*4)+'s';
    heartsBg.appendChild(h);
    setTimeout(()=>h.remove(),6000);
  },380);
}

// RSVP
const nomeInput = document.getElementById('nomeConvidado');
const btn = document.getElementById('btnConfirmar');
const statusEl = document.getElementById('msgStatus');
const lista = document.getElementById('listaLocal');

// Lista removida a pedido da cliente - nomes só vão no WhatsApp
function loadLocal(){ /* não mostra lista */ }
if(lista){ lista.style.display='none'; }

function confettiBurst(){
  const c=document.getElementById('confetti');
  if(!c) return;
  for(let i=0;i<35;i++){
    const p=document.createElement('div');
    p.className='confetti-piece';
    p.style.left=Math.random()*100+'vw';
    p.style.background=['#ff1760','#ffca3a','#4cc9ff','#a8e6a0','#ff8fba'][Math.floor(Math.random()*5)];
    p.style.animationDelay=Math.random()*0.3+'s';
    p.style.transform=`rotate(${Math.random()*360}deg)`;
    c.appendChild(p);
    setTimeout(()=>p.remove(),1500);
  }
}

if(btn && nomeInput){
  btn.addEventListener('click', async ()=>{
    const nome = nomeInput.value.trim();
    if(nome.length < 2){
      statusEl.textContent='Por favor, digite seu nome completo.';
      statusEl.className='status err';
      return;
    }
    btn.disabled=true;
    const textoOriginal = btn.textContent;
    btn.textContent='Enviando...';
    statusEl.textContent='';
    
    // 1. Salva local só para controle interno (não exibe na tela)
    // Se quiser, pode remover essas 3 linhas também
    try{
      const dados = JSON.parse(localStorage.getItem('ellys_convidados')||'[]');
      dados.unshift({nome, data:new Date().toISOString()});
      localStorage.setItem('ellys_convidados', JSON.stringify(dados));
    }catch(e){}


    // 2. Tenta enviar para Google Sheets (não bloqueia o WhatsApp se falhar)
    let sheetOk = false;
    if(CONFIG.GOOGLE_SHEET_URL && CONFIG.GOOGLE_SHEET_URL.startsWith('http')){
      try{
        const fd = new FormData();
        fd.append('nome', nome);
        fd.append('data', new Date().toLocaleString('pt-BR'));
        fd.append('evento', 'Ellys 1 ano - 19/12/2026');
        await fetch(CONFIG.GOOGLE_SHEET_URL, {method:'POST', body:fd, mode:'no-cors'});
        sheetOk = true;
      }catch(e){ console.error('Sheets error', e); }
    }

    // 3. Abre WhatsApp - AGORA FUNCIONA
    const msg = encodeURIComponent(CONFIG.WHATSAPP_MENSAGEM(nome));
    const waUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMERO}?text=${msg}`;
    
    // Usar window.open com fallback
    const win = window.open(waUrl, '_blank');
    if(!win){
      // fallback se popup bloqueado
      window.location.href = waUrl;
    }

    statusEl.textContent = `Obrigado, ${nome}! Presença confirmada! Vamos te esperar! 🎉`;
    statusEl.className='status ok';
    confettiBurst();
    nomeInput.value='';
    btn.disabled=false;
    btn.textContent=textoOriginal;
  });

  nomeInput.addEventListener('keydown', e=>{ if(e.key==='Enter') btn.click(); });
}
