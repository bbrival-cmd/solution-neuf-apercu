/* V3 — options de thème + bulle WhatsApp partagées par toutes les pages */
SN.FLOAT_WA = true;
SN.SITE = new URL("..", document.currentScript.src).href;
(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const p = () => window.SN_PROGRAM;
    const w = document.createElement("div");
    w.className = "wa-widget";
    w.innerHTML = `<div class="box" role="dialog" aria-label="Discuter sur WhatsApp">
        <div class="hd"><img src="${SN.ROOT}assets/brand/symbol.svg" alt=""><div><b>Solution Neuf</b><small>Un conseiller répond</small></div><button aria-label="Fermer">×</button></div>
        <div class="bd">
          <div class="bubble">Bonjour ! Je suis votre conseiller Solution Neuf. Sur quoi puis-je vous aider ?</div>
          <div id="waQR"></div>
        </div>
        <div class="ft"><a target="_blank" rel="noopener" id="waOpen">${SN.WA_ICON} Écrire sur WhatsApp</a></div>
      </div>
      <button class="fab" aria-label="Discuter sur WhatsApp">${SN.WA_ICON}<b>1</b></button>`;
    document.body.appendChild(w);
    const fill = () => {
      const prog = p();
      const qr = prog ? [
        ["Recevoir le plan et la grille de prix", SN.waProgram(prog)],
        ["Suis-je éligible au PTZ pour ce programme ?", SN.wa(`Bonjour, suis-je éligible au PTZ pour le programme ${SN.title(prog.n)} à ${SN.title(prog.c)} ? Lien : ${location.href}`)],
      ] : [
        ["Je cherche ma résidence principale", SN.wa("Bonjour, je cherche ma résidence principale dans le neuf. Pouvez-vous m'aider ?")],
        ["Je souhaite investir (dispositif Jeanbrun)", SN.wa("Bonjour, je souhaite investir dans l'immobilier neuf avec le dispositif Jeanbrun. Pouvez-vous m'aider ?")],
        ["Simuler mon PTZ et ma capacité d'achat", SN.wa("Bonjour, je souhaite simuler mon PTZ et ma capacité d'achat pour un logement neuf.")],
      ];
      w.querySelector("#waQR").innerHTML = qr.map(([t, u]) => `<a class="qr" target="_blank" rel="noopener" href="${u}">${SN.esc(t)}</a>`).join("<div style='height:8px'></div>");
      w.querySelector("#waOpen").href = prog ? SN.waProgram(prog) : SN.wa();
    };
    w.querySelector(".fab").onclick = () => { fill(); w.classList.toggle("open"); w.querySelector(".fab b").style.display = "none"; };
    w.querySelector(".hd button").onclick = () => w.classList.remove("open");
    // Ouverture douce une seule fois, quand le visiteur a parcouru plus de la moitié de la page
    // Une seule fois par visite, refermée seule après 8 s si le visiteur n'interagit pas
    let auto = false, touched = false;
    try { auto = sessionStorage.getItem("sn-wa-auto") === "1"; } catch (e) {}
    w.addEventListener("pointerenter", () => touched = true);
    const pop = () => {
      if (auto) return; auto = true; try { sessionStorage.setItem("sn-wa-auto", "1"); } catch (e) {}
      fill(); w.classList.add("open"); setTimeout(() => { if (!touched) w.classList.remove("open"); }, 8000);
    };
    addEventListener("scroll", () => { const h = document.documentElement; if (h.scrollTop / (h.scrollHeight - h.clientHeight) > .55) pop(); }, { passive: true });
  });
})();
