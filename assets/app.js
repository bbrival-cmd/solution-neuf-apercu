/* Solution Neuf — socle commun (en-tête, pied de page, catalogue, formulaire lead) */
const SN = {
  // Racine du site (permet aux versions v2/, v3/ de partager données et icônes)
  ROOT: new URL("..", document.currentScript.src).href,
  // Dossier des pages du site (redéfini par theme.js pour les versions en sous-dossier)
  SITE: new URL("..", document.currentScript.src).href,
  WHATSAPP: "33615107875",
  PHONE: "01 84 80 94 05",
  PHONE_LINK: "tel:+33184809405",
  // Webhook n8n qui recevra les leads (à brancher à l'étape suivante). Vide = mode aperçu.
  LEAD_WEBHOOK: "",
  HABITER: ["RP neuf", "PTZ", "TVA réduite", "BRS", "Prix maîtrisé", "PSLA", "Accession abordable"],
  INVESTIR: ["Bailleur privé - Jeanbrun", "LMNP", "LMNP non géré", "LMNP second marché", "Pinel", "Pinel +", "LLI",
    "Nue propriété", "Déficit foncier", "Denormandie", "Malraux", "Monument historique", "Censi Bouvard", "Colocation"],
};

SN.eur = (n) => n == null ? "" : Math.round(n).toLocaleString("fr-FR").replace(/ /g, " ") + " €";
SN.quarter = (q, delivered) => {
  if (delivered) return "Livré";
  if (!q) return "Nous consulter";
  const m = /^(\d{4})T(\d)$/.exec(q);
  return m ? `${m[2]}${m[2] === "1" ? "er" : "e"} trim. ${m[1]}` : q;
};
// Libellé d'une grille de prix du portail (voir build_catalog.py)
SN.tvaLabel = (t) => t === 20 ? "TVA 20 %" : t === -1 ? "HT · TVA récupérable (LMNP)" : t === 0 ? "Prix net" : `TVA ${String(t).replace(".", ",")} % · sous conditions`;
SN.typos = (t) => {
  if (!t || !t.length) return "";
  const lab = (x) => x === "T1" ? "Studio/T1" : x;
  return t.length === 1 ? lab(t[0]) : `${lab(t[0])} à ${t[t.length - 1]}`;
};
SN.esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
SN.title = (s) => String(s || "").toLowerCase().replace(/(^|[\s'’-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
SN.url = (p) => `${SN.SITE}programme.html?id=${p.id}`;
SN.projet = (laws) => {
  const h = laws.some((l) => SN.HABITER.includes(l)), i = laws.some((l) => SN.INVESTIR.includes(l));
  return h && i ? "Habiter ou investir" : h ? "Résidence principale" : i ? "Investissement" : "";
};

let _cat;
SN.catalog = () => _cat ||= fetch(SN.ROOT + "data/catalog.json").then((r) => r.json()).then((c) => {
  c.programs.forEach((p) => { if (p.a != null && p.a < 30000) p.a = null; }); // garde-fou : prix de parking
  return c;
});

SN.card = (p) => {
  const img = p.img ? `style="background-image:url('${p.img}')"` : "";
  const tag = p.r || (p.l.includes("Bailleur privé - Jeanbrun") ? "Éligible Jeanbrun" : p.l.includes("PTZ") ? "Éligible PTZ" : "");
  return `<a class="card" href="${SN.url(p)}">
    <div class="ph corner ${p.img ? "" : "noimg"}" ${img}>${tag ? `<span class="tag">${SN.esc(tag)}</span>` : ""}
      ${p.k ? `<span class="tag r">${p.k} lot${p.k > 1 ? "s" : ""}</span>` : ""}</div>
    <div class="body">
      <div class="loc">${SN.esc(SN.title(p.c))} (${SN.esc(p.d)})</div>
      <h3>${SN.esc(SN.title(p.n))}</h3>
      <div class="meta">${p.nt && p.nt.includes("ma") ? (p.nt.includes("ap") ? "Maisons et appartements · " : "Maisons · ") : ""}${SN.esc(SN.typos(p.t))} · ${p.dl ? "Livré, emménagement rapide" : "Livraison " + SN.esc(SN.quarter(p.q, p.dl))}</div>
      <div class="price"><small>À partir de${p.at ? `<br><em style="font-style:normal;color:var(--gold);font-weight:600">${p.at}</em>` : ""}</small><b>${p.a ? SN.eur(p.a) : "Nous consulter"}</b></div>
    </div></a>`;
};

/* ---------- En-tête / pied de page ---------- */
SN.chrome = (active) => {
  const h = document.getElementById("hdr");
  if (h) h.outerHTML = `<header class="top"><div class="wrap">
    <a class="brand" href="${SN.SITE}"><img src="${SN.ROOT}assets/brand/symbol.svg" alt="Solution Neuf"><span><b>SOLUTION NEUF</b><small>iMMOBILIER</small></span></a>
    <button class="burger" aria-label="Menu" onclick="document.querySelector('.nav').classList.toggle('open')">☰</button>
    <nav class="nav">
      <a href="${SN.SITE}programmes.html" class="${active === "prog" ? "on" : ""}">Programmes neufs</a>
      <a href="${SN.SITE}programmes.html?projet=habiter">Résidence principale</a>
      <a href="${SN.SITE}programmes.html?projet=investir">Investir</a>
      <a href="${SN.SITE}actualites/">Conseils</a>
      <a class="tel" href="${SN.PHONE_LINK}">${SN.PHONE}</a>
      <a class="btn btn-cta" href="#" data-lead="header">Être rappelé</a>
    </nav></div></header>`;
  const f = document.getElementById("ftr");
  if (f) f.outerHTML = `<footer><div class="wrap">
    <div class="cols">
      <div><a class="brand" href="${SN.SITE}"><img src="${SN.ROOT}assets/brand/symbol-light.svg" alt=""><span><b style="color:#fff">SOLUTION NEUF</b><small>iMMOBILIER</small></span></a>
        <p style="margin-top:20px;max-width:340px">De la recherche du bien à la remise des clés, en passant par le financement : un accompagnement 360°, sans frais pour l'acquéreur.</p></div>
      <div><h5>Rechercher</h5><a href="${SN.SITE}programmes.html">Tous les programmes</a><a href="${SN.SITE}programmes.html?projet=habiter">Habiter</a><a href="${SN.SITE}programmes.html?projet=investir">Investir</a><a href="${SN.SITE}programmes.html?nat=ma">Maisons neuves</a></div>
      <div><h5>Conseils</h5><a href="${SN.SITE}loi-jeanbrun-2026-le-nouveau-dispositif-pour-investir-dans-limmobilier-neuf/">Loi Jeanbrun 2026</a><a href="${SN.SITE}primo-accedants-2026-toutes-les-aides-pour-acheter-votre-premier-logement-neuf/">Aides primo-accédants</a><a href="${SN.SITE}brs-2026-le-bail-reel-solidaire-pour-acheter-moins-cher-dans-les-grandes-villes/">Bail Réel Solidaire</a><a href="https://www.youtube.com/@SolutionNeuf" target="_blank" rel="noopener">Nos vidéos YouTube</a><a href="https://fr.trustpilot.com/review/solution-neuf.fr" target="_blank" rel="noopener">Nos avis Trustpilot</a></div>
      <div><h5>Contact</h5><a href="${SN.PHONE_LINK}">${SN.PHONE}</a><a href="mailto:commercial@solution-neuf.fr">commercial@solution-neuf.fr</a><a href="${SN.SITE}contact/">61 rue de Lyon, 75012 Paris</a></div>
    </div>
    <div class="legal">Solution Neuf est une marque du Cabinet BHB – Gestion Conseil Patrimoine, SASU au capital de 15 000 €, 61 rue de Lyon 75012 Paris, RCS Paris 839 328 036.
      Carte professionnelle « Transactions sur immeubles et fonds de commerce » CPI 7501 2018 0000 310 59 délivrée par la CCI de Paris. RCP AIG n° RD01898754P.
      Visuels non contractuels. Prix et disponibilités indicatifs, susceptibles d'évoluer. · <a style="display:inline" href="${SN.SITE}mentions-legales/">Mentions légales</a> · <a style="display:inline" href="${SN.SITE}politique-de-confidentialite/">Confidentialité</a></div>
  </div></footer>
  ${SN.FLOAT_WA ? `<a class="wa-float" href="${SN.wa()}" target="_blank" rel="noopener" aria-label="Discuter avec un conseiller sur WhatsApp">${SN.WA_ICON}<span>Un conseiller en ligne</span></a>` : ""}
  <div class="modal" id="leadModal"><div class="lead-form" id="leadModalBody"></div></div>`;
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-lead]");
    if (t) { e.preventDefault(); SN.openLead({ source: t.dataset.lead, lot: t.dataset.lot, program: window.SN_PROGRAM }); }
    if (e.target.id === "leadModal") SN.closeLead();
  });
};

/* ---------- Formulaire lead ---------- */
SN.leadForm = (ctx = {}) => {
  const p = ctx.program;
  const title = ctx.lot ? "Recevoir le plan et la grille de prix" : p ? "Recevoir la documentation complète" : "Parlons de votre projet";
  const hint = p ? `${SN.title(p.n)} · ${SN.title(p.c)}${ctx.lot ? " · " + ctx.lot : ""} — plans, grille tarifaire et frais de notaire offerts éventuels.`
    : "Un conseiller vous rappelle sous 24 h ouvrées. Gratuit et sans engagement.";
  const projet = ctx.projet || (p ? (p.l.some((l) => SN.HABITER.includes(l)) ? "habiter" : "investir") : "habiter");
  return `<h3>${title}</h3><p class="hint">${SN.esc(hint)}</p>
  <form class="sn-lead" novalidate>
    <div class="choice">
      <label><input type="radio" name="projet" value="habiter" ${projet === "habiter" ? "checked" : ""}><span>J'achète pour habiter</span></label>
      <label><input type="radio" name="projet" value="investir" ${projet === "investir" ? "checked" : ""}><span>J'investis</span></label>
    </div>
    <div class="row"><label class="fld"><span>Prénom</span><input name="prenom" required autocomplete="given-name"></label>
      <label class="fld"><span>Nom</span><input name="nom" required autocomplete="family-name"></label></div>
    <div class="row"><label class="fld"><span>Téléphone</span><input name="telephone" type="tel" required autocomplete="tel" placeholder="06 12 34 56 78"></label>
      <label class="fld"><span>Email</span><input name="email" type="email" required autocomplete="email"></label></div>
    <div class="row"><label class="fld"><span>Budget</span><select name="budget"><option value="">—</option><option>Moins de 200 000 €</option><option>200 000 – 300 000 €</option><option>300 000 – 450 000 €</option><option>Plus de 450 000 €</option></select></label>
      <label class="fld"><span>Délai</span><select name="delai"><option value="">—</option><option>Dès que possible</option><option>Sous 6 mois</option><option>Dans l'année</option><option>Je me renseigne</option></select></label></div>
    ${p ? "" : `<label class="fld"><span>Ville ou secteur recherché</span><input name="secteur" placeholder="Ex. Lyon, Bordeaux, 92…"></label>`}
    <label class="consent"><input type="checkbox" name="rgpd" required> <span>J'accepte d'être recontacté(e) par Solution Neuf (Cabinet BHB) au sujet de mon projet. Mes données ne sont jamais revendues. <a href="${SN.SITE}politique-de-confidentialite/" target="_blank">En savoir plus</a></span></label>
    <button class="btn btn-cta" type="submit">${ctx.lot ? "Recevoir le plan" : "Être rappelé gratuitement"}</button>
  </form>`;
};

SN.bindLead = (root, ctx = {}) => {
  const f = root.querySelector("form.sn-lead");
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bad = [...f.querySelectorAll("[required]")].find((i) => i.type === "checkbox" ? !i.checked : !i.value.trim());
    if (bad) { bad.focus(); bad.style.outline = "2px solid #c0392b"; return; }
    const data = Object.fromEntries(new FormData(f));
    const p = ctx.program;
    Object.assign(data, {
      source: ctx.source || "site", lot: ctx.lot || "", page: location.href,
      programme_id: p?.id || "", programme: p ? `${p.n} — ${p.c} (${p.d})` : "", date: new Date().toISOString(),
    });
    f.querySelector("button").disabled = true;
    try {
      if (SN.LEAD_WEBHOOK) await fetch(SN.LEAD_WEBHOOK, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      else console.info("[aperçu] lead non envoyé", data);
    } catch (err) { console.warn(err); }
    root.innerHTML = (root.id === "leadModalBody" ? `<button class="x" onclick="SN.closeLead()" aria-label="Fermer">×</button>` : "") + `<div class="ok"><div class="ic">✓</div><b>Merci ${SN.esc(data.prenom)} !</b>
      <p>Un conseiller Solution Neuf vous rappelle très vite au ${SN.esc(data.telephone)}.</p>
      <p class="note">Pressé(e) ? Appelez-nous au <a href="${SN.PHONE_LINK}">${SN.PHONE}</a></p></div>`;
  });
};

SN.openLead = (ctx) => {
  const b = document.getElementById("leadModalBody");
  b.innerHTML = `<button class="x" onclick="SN.closeLead()" aria-label="Fermer">×</button>` + SN.leadForm(ctx);
  SN.bindLead(b, ctx);
  document.getElementById("leadModal").classList.add("open");
};
SN.closeLead = () => document.getElementById("leadModal").classList.remove("open");
document.addEventListener("keydown", (e) => e.key === "Escape" && SN.closeLead());

/* ---------- WhatsApp ---------- */
// Pas d'émojis dans le texte pré-rempli : wa.me les transforme en caractères illisibles.
SN.wa = (text) => `https://wa.me/${SN.WHATSAPP}?text=${encodeURIComponent(text || "Bonjour, je souhaite échanger avec un conseiller Solution Neuf au sujet d'un projet immobilier neuf.")}`;
SN.waProgram = (p) => SN.wa(`Bonjour, le programme ${SN.title(p.n)} à ${SN.title(p.c)} (${p.d}) m'intéresse. Pouvez-vous m'envoyer les plans et la grille de prix ? Lien : ${location.href}`);
SN.WA_ICON = `<svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.4.7 4.7 1.9 6.7L3 29l6.9-2.2c1.9 1 4 1.6 6.1 1.6 7 0 12.7-5.7 12.7-12.7S23 3 16 3zm0 23.2c-2 0-3.9-.6-5.6-1.6l-.4-.2-4.1 1.3 1.3-4-.3-.4c-1.1-1.7-1.7-3.7-1.7-5.7C5.2 9.7 10 5 16 5s10.8 4.8 10.8 10.7S21.9 26.2 16 26.2zm5.9-8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.4-.5-2.6-1.6-1-.9-1.6-1.9-1.8-2.3-.2-.3 0-.5.1-.7l.5-.6c.2-.2.2-.4.3-.6.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.3 1.4 3.5c.2.2 2.4 3.7 5.8 5.1 2.9 1.1 3.4.9 4 .8.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg>`;

/* ---------- YouTube & Trustpilot ---------- */
let _social;
SN.social = () => _social ||= fetch(SN.ROOT + "assets/social.json").then((r) => r.json());
SN.YT_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15.1V8.9l5.8 3.1-5.8 3.1z"/></svg>`;
SN.stars = (score) => `<span class="tp-stars" aria-label="${String(score).replace(".", ",")} sur 5">${[1, 2, 3, 4, 5].map((i) => `<i style="--f:${Math.max(0, Math.min(1, score - i + 1)) * 100}%"></i>`).join("")}</span>`;
SN.tpBadge = (tp) => `<a class="tp-badge" href="${tp.url}" target="_blank" rel="noopener">${SN.stars(tp.score)}<span><b>${String(tp.score).replace(".", ",")}/5</b> · ${tp.label} · ${tp.count} avis sur</span><span class="tp-logo">Trustpilot</span></a>`;
// Titre sobre : version reformulée si disponible, sinon nettoyage (émojis, majuscules criardes)
const ACRO = ["BRS", "PTZ", "VEFA", "LMNP", "TVA", "LLI", "PEL", "RE2020"];
SN.calmTitle = (t) => t.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]\uFE0F?/gu, "").replace(/\bEUROS?\b/g, "€")
  .replace(/\b(\p{Lu}{3,})\b/gu, (w) => ACRO.includes(w) ? w : w.toLowerCase())
  .replace(/ ([ÀÉÈ]) /g, (m, c) => " " + c.toLowerCase() + " ").replace(/\s+/g, " ").trim().replace(/^./, (c) => c.toUpperCase());
SN.ytVideos = (yt, n = 6) => {
  const cur = yt.curated || {}, byId = Object.fromEntries(yt.videos.map((v) => [v.id, v]));
  // Les nouveautés de la chaîne passent en tête, puis la sélection
  const fresh = yt.videos.filter((v) => !cur[v.id] && Date.now() - new Date(v.date) < 60 * 864e5);
  const list = [...fresh, ...(yt.featured || []).map((id) => byId[id]).filter(Boolean)];
  return list.slice(0, n).map((v) => ({ ...v, t: cur[v.id]?.t || SN.calmTitle(v.title), c: cur[v.id]?.c || "Nouveau" }));
};
SN.ytBlock = (yt) => `<div class="yt-block">
  <div class="yt-channel">
    <img src="${SN.ROOT}assets/brand/symbol-white.svg" alt="">
    <div class="eyebrow" style="color:#fff;opacity:.8">La chaîne YouTube</div>
    <h3>Benoît Brival<br><em>Solution Neuf</em></h3>
    <p>Des explications claires, sans jargon, pour acheter ou investir dans le neuf en toute connaissance de cause.</p>
    <a class="btn btn-cta" href="${yt.url}?sub_confirmation=1" target="_blank" rel="noopener">${SN.YT_ICON} S'abonner gratuitement</a>
    <a class="yt-all" href="${yt.url}/videos" target="_blank" rel="noopener">Voir toutes les vidéos →</a>
  </div>
  <ol class="yt-list">${SN.ytVideos(yt).map((v, i) => `<li><a href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener">
    <span class="n">${String(i + 1).padStart(2, "0")}</span><span class="t"><small>${SN.esc(v.c)}</small>${SN.esc(v.t)}</span><span class="pl" aria-hidden="true"></span></a></li>`).join("")}</ol>
</div>`;
