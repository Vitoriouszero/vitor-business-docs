#!/usr/bin/env node
// build_mapa.mjs — Gerador determinístico do mapa-regioes.html (v3, visual).
// Lê mapa-regioes-data.json (mesma pasta) e escreve mapa-regioes.html.
// Dados embutidos inline (legível por IA). Sanitizado: nunca imprime
// project id / bucket / IP (usa <PROJECT> nos caminhos 404).
// Uso:  node build_mapa.mjs
import { readFileSync, writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, "mapa-regioes-data.json");
const OUT  = join(HERE, "mapa-regioes.html");

const d = JSON.parse(readFileSync(DATA, "utf-8"));
const meta = d.meta, prov = d.provenance;
const EPO = d.endpointsOrder, MBM = d.modelsByModality;
const perModel = d.perModel, master = d.master;
const ARTIFACT_URL = prov.artifact || "";

const esc = (s) => String(s)
  .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
  .replaceAll('"',"&quot;").replaceAll("'","&#x27;");
const locOf = (ep) => ep.startsWith("us(") ? "us" : ep.startsWith("eu(") ? "eu" : ep;
const fmtMs = (ms) => (ms == null) ? "" : (ms < 1000 ? String(ms) : (ms/1000).toFixed(1)+"s");
const fmtInt = (n) => (n===""||n==null) ? "" : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

function heatClass(kind, ms){
  if (kind === "rai-filtered") return "c-rai";
  if (kind !== "OK" || ms == null) return "c-404";
  if (ms < 500) return "c-l1"; if (ms < 1000) return "c-l2"; if (ms < 2000) return "c-l3";
  if (ms < 5000) return "c-l4"; if (ms < 10000) return "c-l5"; return "c-l6";
}
const SHORT = {
 "gemini-2.5-pro":"g-2.5-pro","gemini-2.5-flash":"g-2.5-flash","gemini-2.5-flash-lite":"g-2.5-flash-lite",
 "gemini-3.5-flash":"g-3.5-flash","gemini-3.1-pro-preview":"g-3.1-pro·pv","gemini-3.1-flash-lite":"g-3.1-flash-lite",
 "gemini-3-flash-preview":"g-3-flash·pv","gemini-2.5-flash-image":"g-2.5-flash-image","gemini-3-pro-image":"g-3-pro-image",
 "gemini-3.1-flash-image":"g-3.1-flash-image","gemini-3.1-flash-lite-image":"g-3.1-flash-lite-image",
 "imagen-4.0-generate-001":"img4","imagen-4.0-ultra-generate-001":"img4-ultra","imagen-4.0-fast-generate-001":"img4-fast",
 "veo-3.1-fast-generate-001":"veo-fast","veo-3.1-generate-001":"veo-3.1","veo-3.1-lite-generate-001":"veo-lite",
};
const short = (m) => SHORT[m] || m;

const cell = new Map();
for (const c of master) cell.set(`${c.modality}|${c.model}|${c.endpoint}`, c);

function detailText(c){
  const { kind, model, endpoint } = c; const loc = locOf(endpoint);
  if (kind === "OK") return `200 OK · ${c.ms}ms`;
  if (kind === "rai-filtered")
    return "Unable to show generated images. Imagen could not generate images based on the prompt provided. You will not be charged.";
  return '{"error":{"code":404,"message":"Publisher model '
    + '`projects/<PROJECT>/locations/' + loc + '/publishers/google/models/' + model + '` '
    + 'was not found or your project does not have access to it. Please ensure you are '
    + 'using a valid model version.","status":"NOT_FOUND"}}';
}
const MOD_LABEL = { text:"TEXTO", image:"IMAGEM", video:"VÍDEO" };
const MOD_TAG   = { text:"T", image:"I", video:"V" };

function buildHeatmap(mod){
  const models = MBM[mod];
  const ths = models.map(m => `<th class="mono rot"><span>${esc(short(m))}</span></th>`).join("");
  const rows = EPO.map(ep => {
    const tds = models.map(m => {
      const c = cell.get(`${mod}|${m}|${ep}`);
      if (!c) return '<td class="c-404 mono">·</td>';
      const cls = heatClass(c.kind, c.ms);
      const txt = c.kind === "OK" ? fmtMs(c.ms) : (c.kind === "rai-filtered" ? "RAI" : "404");
      return `<td class="${cls} mono">${txt}</td>`;
    }).join("");
    return `<tr><th class="mono ep">${esc(ep)}</th>${tds}</tr>`;
  }).join("");
  return `<div class="hm-wrap"><table class="heat"><thead><tr>`
       + `<th class="mono ep-h">endpoint</th>${ths}</tr></thead><tbody>${rows}</tbody></table></div>`;
}

function buildModelCards(mod){
  const cards = MBM[mod].map(m => {
    const lst = (perModel[mod] && perModel[mod][m]) || [];
    if (!lst.length) return "";
    const best = lst[0], worst = lst[lst.length-1];
    const li = lst.map((x,i) => {
      let third = "", cls;
      if (mod === "image"){ third = `<span class="ex mono" title="bytes base64 da imagem">${fmtInt(x.b64len ?? "")}</span>`; cls="l4"; }
      else if (mod === "video"){ const dt=(x.detail||"").replaceAll("gs://<redacted>","gs://…");
        third = `<span class="ex mono vid" title="${esc(dt)}">${esc(dt)}</span>`; cls="l4"; }
      else { third=""; cls="l3"; }
      return `<li class="${cls}"><span class="rk mono">${i+1}</span>`
           + `<span class="ep mono">${esc(x.ep)}</span>`
           + `<span class="ms mono">${fmtMs(x.ms)}</span>${third}</li>`;
    }).join("");
    return `<article class="mcard"><header><h4 class="mono">${esc(m)}</h4>`
      + `<p class="meta mono">OK em ${lst.length} endpoint${lst.length!==1?"s":""} · `
      + `melhor ${fmtMs(best.ms)} · pior ${fmtMs(worst.ms)}</p></header>`
      + `<ol class="mlist ${mod}">${li}</ol></article>`;
  }).join("");
  return `<div class="mcards">${cards}</div>`;
}

function buildMasterRows(){
  const order = { text:0, image:1, video:2 };
  const idxModel = (c) => MBM[c.modality].indexOf(c.model);
  const idxEp = (c) => EPO.indexOf(c.endpoint);
  const rows = master.slice().sort((a,b) =>
    (order[a.modality]-order[b.modality]) || (idxModel(a)-idxModel(b)) || (idxEp(a)-idxEp(b)));
  return rows.map(c => {
    const mod = c.modality;
    const okcls = c.kind==="OK" ? "ok" : (c.kind==="rai-filtered" ? "rai" : "err");
    const status = c.kind;
    const ms = c.kind==="OK" ? fmtMs(c.ms) : "—";
    const det = esc(detailText(c));
    const search = esc(`${c.model} ${c.endpoint} ${MOD_LABEL[mod]}`.toLowerCase());
    return `<tr data-mod="${mod}" data-ok="${c.kind==="OK"?1:0}" data-s="${search}">`
      + `<td class="mono tag t-${mod}">${MOD_TAG[mod]}</td>`
      + `<td class="mono">${esc(c.model)}</td>`
      + `<td class="mono">${esc(c.endpoint)}</td>`
      + `<td><span class="badge ${okcls}">${esc(status)}</span></td>`
      + `<td class="mono num">${ms}</td>`
      + `<td class="mono detail" title="${det}">${det}</td></tr>`;
  }).join("");
}

const SECOES = {
s1:["SEÇÃO 1 — SETUP",`
<ul class="narr">
<li>PM2 <code>google-mcp</code>: watch mode <b>disabled</b> — confirmado antes de criar qualquer arquivo.</li>
<li><code>.env</code> carregado como o server.js (dotenv). Chaves presentes: <code>GOOGLE_APPLICATION_CREDENTIALS</code> (arquivo existe), <code>GOOGLE_CLOUD_PROJECT</code>, <code>GCS_VEO_BUCKET</code> — todas OK (valores não impressos).</li>
<li>Serialidade confirmada: uma chamada por vez, sem paralelismo, delay ~1s.</li>
<li>Preflight de sanidade (gemini-2.5-flash @ global) passou (916ms) antes do run pago.</li>
</ul>`],
s2:["SEÇÃO 2 — MULTI-REGIÃO (prioritária)",`
<p class="lead">Os endpoints multi-região <b>funcionam</b> — mas só para o texto Gemini 3.x flash.</p>
<ul class="narr">
<li><code>us</code> e <code>eu</code> são <b>alcançáveis</b>: ambos retornaram HTTP 404 <b>real</b> (não DNS/host).</li>
<li>Testados nos DOIS modos: instanciação <b>normal</b> (<code>location:"us"</code>) e <b>baseUrl explícita</b> (<code>aiplatform.{us,eu}.rep.googleapis.com</code>). Ambos alcançam e servem os mesmos modelos.</li>
<li>A sonda inicial (gemini-2.5-flash) deu 404 nos dois modos — sozinha enganaria para "não funciona". A matriz revelou que servem <code>gemini-3.5-flash</code> e <code>gemini-3.1-flash-lite</code>.</li>
<li><b>Não</b> servem gemini-2.5-*, imagem nem vídeo (404 em todos, nos dois modos).</li>
<li>A instanciação <b>normal foi mais rápida</b> que a baseUrl → preferir a normal.</li>
<li><b>Uso:</b> <code>us</code> é candidato válido a 2º elo de fallback para <b>texto 3.x flash</b> (failover automático entre regiões US). NÃO serve para imagem/vídeo.</li>
</ul>`],
s3:["SEÇÃO 3 — LISTA NEGRA",`
<p class="lead"><b>Vazia.</b> Nenhuma falha estrutural (DNS/rede/auth/location). Os 32 endpoints são válidos e alcançáveis. Toda falha foi <code>model-404</code> (modelo ausente na região), que não elimina endpoint. Zero 429.</p>`],
s6:["SEÇÃO 6 — CADEIA DE FALLBACK RECOMENDADA",`
<div class="chains">
<div class="chain"><h4>Texto</h4><p class="path mono">global → us-central1 → us-east5 → us (multi)</p>
<p>global serve os 7 (único com 3.1-pro-preview e 3-flash-preview). Família 2.5: us-central1/us-east5 rápidos. 3.x flash: us multi-região (failover US). 3.5-flash puro mais rápido em europe-west2 (426ms).</p></div>
<div class="chain"><h4>Imagem</h4><p class="path mono">global → us-central1 → us-east1/us-west4 → europe-west1</p>
<p>global <b>obrigatório</b> p/ Nano Banana 3.x. Imagen 4 tem ~20 regiões de fallback; us-central1 lidera. us/eu NÃO servem imagem.</p></div>
<div class="chain"><h4>Vídeo (Veo 3.1)</h4><p class="path mono">global → us-central1 <span class="dim">(sem 3º elo)</span></p>
<p>Só esses 2 endpoints hospedam Veo. Alertar operacionalmente: a redundância de vídeo é de <b>apenas 2 endpoints</b>.</p></div>
</div>`],
s7:["SEÇÃO 7 — COMPARAÇÃO COM O TESTE ANTERIOR",`
<table class="cmp"><thead><tr><th>Teste anterior dizia</th><th>Este re-teste (serial)</th></tr></thead><tbody>
<tr><td>Imagen 4 &amp; Veo = só global + us-central1</td><td><b>Diverge (parcial):</b> Imagen 4 funciona em ~19–20 regiões cada variante; Veo confirma só global+us-central1.</td></tr>
<tr><td>gemini-3.5-flash em 5 regiões</td><td><b>Diverge:</b> 9 endpoint-modos (europe-west2, asia-northeast1, asia-south1, asia-southeast1, global, + us/eu ×2 modos).</td></tr>
<tr><td>Nano Banana 3.x image = global-only</td><td><b>Confirma.</b> 3-pro-image, 3.1-flash-image, 3.1-flash-lite-image só em global.</td></tr>
<tr><td>22 endpoints · 4× 429 (falsos)</td><td><b>32 endpoints · 0× 429.</b> Multi-região us/eu (faltavam) investigados a fundo nos 2 modos.</td></tr>
</tbody></table>`],
s8:["SEÇÃO 8 — LIMPEZA",`
<ul class="narr">
<li>GCS: 7 objetos gravados sob <code>region-test-v2/</code> — <b>7/7 deletados</b> (1ª passada); 2ª e 3ª passadas encontraram <b>0 órfãos</b>. Guarda de prefixo ativa.</li>
<li>server.js <b>não editado</b> · PM2 <b>não reiniciado</b> · .env <b>intacto</b> · <b>nenhum commit/push</b>.</li>
<li>Script temporário deletado; <code>git status</code> volta ao estado pré-teste.</li>
</ul>`],
s9:["SEÇÃO 9 — OBSERVAÇÕES / ANOMALIAS",`
<ul class="narr">
<li><b>6 endpoints válidos servem ZERO modelos</b> (texto+imagem+vídeo): europe-west6, asia-east1, asia-east2, me-west1, me-central1, me-central2. Não usar em fallback.</li>
<li><b>1 filtro RAI</b> (não é falha de endpoint): imagen-4.0-generate-001 @ us-east5 barrou o prompt do círculo cinza; mesmo modelo funcionou em ~18 outras regiões.</li>
<li><b>Zero 429</b> em toda a execução — objetivo central do re-teste serial atingido.</li>
<li><b>Doc oficial contrariada:</b> gemini-3.5-flash (ausente na doc) funciona; IDs de imagem 3.x GA (sem <code>-preview</code>) são os válidos.</li>
<li><b>Variância de geração de vídeo:</b> 61s a &gt;180s no mesmo modelo; a latência de <b>iniciação</b> (usada no mapa) é estável (~160–360ms).</li>
</ul>`],
};

const NAV = [["s1","Setup"],["s2","Multi-região"],["s3","Lista negra"],["s4","Mapa de calor"],
 ["s5","Por modelo"],["s6","Fallback"],["s7","Comparação"],["smaster","Tabela mestre"],
 ["s8","Limpeza"],["s9","Anomalias"]];

const statCards = [
 ["endpoints","32","global + 2 multi + 29 regionais"],["células","578","texto · imagem · vídeo"],
 ["OK","154","chamadas bem-sucedidas"],["model-404","423","modelo ausente na região"],
 ["estrutural","0","DNS / auth / host"],["429","0","sem auto-contenção (serial)"],
].map(([k,v,lbl]) => `<div class="stat"><span class="k mono">${k}</span><span class="v mono">${v}</span><span class="lbl">${lbl}</span></div>`).join("");

const navHtml = NAV.map(([a,t]) => `<a href="#${a}">${esc(t)}</a>`).join("");
const heatBlocks = ["text","image","video"].map(m => `<div class="heat-block"><h3 class="mono">${MOD_LABEL[m]}</h3>${buildHeatmap(m)}</div>`).join("");
const mcardsBlocks = ["text","image","video"].map(m => `<div class="mc-block"><h3 class="mono">${MOD_LABEL[m]}</h3>${buildModelCards(m)}</div>`).join("");
const masterRows = buildMasterRows();

const CSS = String.raw`
:root{
 --bg:#0a0d12; --bg2:#0f141c; --surf:#121822; --surf2:#161d28; --bd:#232c3a; --bd2:#2e3a4c;
 --tx:#e6edf3; --tx2:#93a1b4; --tx3:#5f6c7e; --acc:#5ee0c8; --acc2:#7aa2ff;
 --l1:#0f6b2e; --l2:#2c8a3d; --l3:#7d861d; --l4:#b5761b; --l5:#c2510f; --l6:#a11f1f;
 --c404:#141a24; --crai:#4a2f73;
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--tx);
 font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.55;
 font-feature-settings:'ss01';-webkit-font-smoothing:antialiased}
.mono{font-family:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace}
.wrap{max-width:1180px;margin:0 auto;padding:0 22px}
a{color:var(--acc2);text-decoration:none}a:hover{text-decoration:underline}
code{font-family:'JetBrains Mono',monospace;background:#0c1119;border:1px solid var(--bd);
 border-radius:4px;padding:1px 5px;font-size:.86em;color:#b7c4d6}
h2{font-family:'Space Grotesk',sans-serif}
.hero{border-bottom:1px solid var(--bd);background:
 radial-gradient(120% 140% at 100% 0%,rgba(94,224,200,.07),transparent 55%),
 radial-gradient(120% 140% at 0% 0%,rgba(122,162,255,.06),transparent 50%);}
.hero .wrap{padding-top:44px;padding-bottom:30px}
.eyebrow{font-family:'JetBrains Mono',monospace;letter-spacing:.22em;text-transform:uppercase;
 font-size:11px;color:var(--acc);margin:0 0 14px}
.hero h1{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(30px,5vw,52px);
 line-height:1.03;margin:0 0 14px;letter-spacing:-.02em}
.hero h1 .x{color:var(--tx3);font-weight:400}
.sub{color:var(--tx2);max-width:70ch;margin:0 0 20px;font-size:15px}
.provbar{display:flex;flex-wrap:wrap;gap:6px 22px;font-size:12px;color:var(--tx3);
 font-family:'JetBrains Mono',monospace;margin-bottom:6px}
.provbar b{color:var(--tx2);font-weight:500}
.artlink{font-size:12.5px;margin-top:8px}
.artlink .tag{color:var(--tx3)}
.stats{display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin:26px 0 4px}
.stat{background:var(--surf);border:1px solid var(--bd);border-radius:10px;padding:14px 14px 12px;
 display:flex;flex-direction:column;gap:2px}
.stat .k{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--tx3)}
.stat .v{font-size:30px;font-weight:600;line-height:1.05;color:var(--acc)}
.stat:nth-child(4) .v{color:#e08a5e}.stat:nth-child(5) .v,.stat:nth-child(6) .v{color:var(--tx2)}
.stat .lbl{font-size:11px;color:var(--tx2);line-height:1.3}
.nav{position:sticky;top:0;z-index:20;background:rgba(10,13,18,.86);backdrop-filter:blur(8px);
 border-bottom:1px solid var(--bd)}
.nav .wrap{display:flex;gap:4px;overflow-x:auto;padding-top:9px;padding-bottom:9px}
.nav a{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--tx2);white-space:nowrap;
 padding:5px 11px;border-radius:7px}
.nav a:hover{background:var(--surf);color:var(--tx);text-decoration:none}
section{padding:40px 0;border-bottom:1px solid var(--bd)}
.sec-h{display:flex;align-items:baseline;gap:14px;margin:0 0 20px}
.sec-h .no{font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--acc);font-weight:600}
.sec-h h2{font-size:23px;margin:0;font-weight:600;letter-spacing:-.01em}
.sec-h .hint{margin-left:auto;font-size:12px;color:var(--tx3);font-family:'JetBrains Mono',monospace}
.lead{font-size:16px;color:var(--tx);margin:0 0 14px}
ul.narr{margin:0;padding-left:0;list-style:none;display:flex;flex-direction:column;gap:10px}
ul.narr li{position:relative;padding-left:20px;color:var(--tx2);font-size:14.5px}
ul.narr li b{color:var(--tx)}
ul.narr li::before{content:"▹";position:absolute;left:0;color:var(--acc)}
.heat-block{margin-bottom:26px}
.heat-block h3{font-size:12px;letter-spacing:.16em;color:var(--tx2);margin:0 0 10px}
.hm-wrap{overflow-x:auto;border:1px solid var(--bd);border-radius:10px}
table.heat{border-collapse:collapse;width:100%;font-size:12px}
table.heat th,table.heat td{border:1px solid var(--bg);padding:0;text-align:center}
table.heat thead th{background:var(--surf2);color:var(--tx2);font-weight:500;padding:8px 6px;position:sticky;top:0}
table.heat th.ep,table.heat th.ep-h{text-align:left;padding:7px 12px;background:var(--surf2);
 color:var(--tx2);font-weight:500;white-space:nowrap;position:sticky;left:0;z-index:2}
table.heat td{height:30px;min-width:58px;color:#eaf2f0;font-variant-numeric:tabular-nums}
.legend{display:flex;flex-wrap:wrap;gap:8px 14px;margin:14px 0 0;font-size:11.5px;color:var(--tx2);
 font-family:'JetBrains Mono',monospace;align-items:center}
.legend .sw{display:inline-block;width:22px;height:12px;border-radius:3px;vertical-align:-1px;margin-right:5px}
.c-l1{background:var(--l1)}.c-l2{background:var(--l2)}.c-l3{background:var(--l3)}
.c-l4{background:var(--l4)}.c-l5{background:var(--l5)}.c-l6{background:var(--l6)}
.c-404{background:var(--c404);color:var(--tx3)!important}
.c-rai{background:var(--crai);color:#e6d9ff!important}
.mc-block{margin-bottom:24px}
.mc-block>h3{font-size:12px;letter-spacing:.16em;color:var(--tx2);margin:0 0 12px}
.mcards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.mcard{background:var(--surf);border:1px solid var(--bd);border-radius:10px;padding:14px 15px;
 display:flex;flex-direction:column}
.mcard h4{margin:0 0 3px;font-size:14px;color:var(--acc);font-weight:600}
.mcard .meta{font-size:11px;color:var(--tx3);margin:0 0 10px}
ol.mlist{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:3px}
ol.mlist li{display:grid;grid-template-columns:22px 1fr auto;gap:8px;align-items:center;
 font-size:12.5px;padding:2px 0;border-bottom:1px solid rgba(255,255,255,.03)}
ol.mlist.image li{grid-template-columns:20px 1fr auto minmax(56px,auto)}
ol.mlist.video li{grid-template-columns:20px auto auto 1fr}
ol.mlist .rk{color:var(--tx3);text-align:right}
ol.mlist .ep{color:var(--tx2)}
ol.mlist .ms{color:var(--tx);font-variant-numeric:tabular-nums;text-align:right}
ol.mlist .ex{color:var(--tx3);font-size:11px;text-align:right;font-variant-numeric:tabular-nums}
ol.mlist .ex.vid{text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
 max-width:100%;cursor:help;color:#7fae8a}
.filters{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 14px}
.seg{display:inline-flex;border:1px solid var(--bd);border-radius:8px;overflow:hidden}
.seg button{background:transparent;border:0;color:var(--tx2);font-family:'JetBrains Mono',monospace;
 font-size:12px;padding:7px 14px;cursor:pointer;border-right:1px solid var(--bd)}
.seg button:last-child{border-right:0}
.seg button.on{background:var(--acc);color:#04231e;font-weight:600}
.filters input[type=text]{background:var(--surf);border:1px solid var(--bd);border-radius:8px;
 color:var(--tx);padding:7px 12px;font-family:'JetBrains Mono',monospace;font-size:12.5px;min-width:220px}
.filters label{font-size:12.5px;color:var(--tx2);display:inline-flex;align-items:center;gap:6px;cursor:pointer}
.filters .count{margin-left:auto;font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--tx3)}
.mt-wrap{border:1px solid var(--bd);border-radius:10px;overflow:auto;max-height:640px}
table.master{border-collapse:collapse;width:100%;font-size:12.5px}
table.master thead th{position:sticky;top:0;background:var(--surf2);color:var(--tx2);text-align:left;
 font-weight:500;padding:9px 12px;border-bottom:1px solid var(--bd);z-index:1;white-space:nowrap}
table.master td{padding:7px 12px;border-bottom:1px solid rgba(255,255,255,.04);vertical-align:top}
table.master tr:hover td{background:rgba(122,162,255,.05)}
td.tag{font-weight:700;width:26px;text-align:center;border-radius:0}
.t-text{color:#7aa2ff}.t-image{color:#e0b15e}.t-video{color:#c98bff}
td.num{text-align:right;font-variant-numeric:tabular-nums;color:var(--tx)}
.badge{font-family:'JetBrains Mono',monospace;font-size:11px;padding:2px 8px;border-radius:20px;white-space:nowrap}
.badge.ok{background:rgba(46,138,61,.18);color:#5fd07a;border:1px solid rgba(46,138,61,.4)}
.badge.err{background:rgba(161,31,31,.14);color:#e08585;border:1px solid rgba(161,31,31,.34)}
.badge.rai{background:rgba(74,47,115,.28);color:#c9aaff;border:1px solid rgba(74,47,115,.5)}
td.detail{color:var(--tx3);max-width:420px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
 font-size:11.5px;cursor:help}
td.detail.exp{white-space:normal;word-break:break-word;color:var(--tx2)}
.chains{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.chain{background:var(--surf);border:1px solid var(--bd);border-radius:10px;padding:16px}
.chain h4{margin:0 0 8px;font-size:14px}
.chain .path{font-size:13px;color:var(--acc);margin:0 0 10px;background:#0c1119;border:1px solid var(--bd);
 border-radius:6px;padding:7px 9px}
.chain .dim{color:var(--tx3)}
.chain p{font-size:13px;color:var(--tx2);margin:0}
table.cmp{width:100%;border-collapse:collapse;font-size:13.5px}
table.cmp th{text-align:left;padding:10px 12px;background:var(--surf2);color:var(--tx2);font-weight:500;
 border:1px solid var(--bd)}
table.cmp td{padding:11px 12px;border:1px solid var(--bd);color:var(--tx2);vertical-align:top;width:50%}
table.cmp td:first-child{color:var(--tx3)}table.cmp td b{color:var(--acc)}
footer{padding:30px 0 60px;color:var(--tx3);font-size:12px}
footer .prov{background:var(--surf);border:1px solid var(--bd);border-radius:10px;padding:16px 18px;line-height:1.6}
footer b{color:var(--tx2)}
@media(max-width:820px){.stats{grid-template-columns:repeat(2,1fr)}.chains{grid-template-columns:1fr}
 table.cmp td{width:auto}}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
html{scroll-behavior:smooth}
`;

const JS = String.raw`
(function(){
 var mod='all', ok=false, q='';
 var rows=[].slice.call(document.querySelectorAll('#mtbody tr'));
 var seg=document.querySelectorAll('.seg button');
 var search=document.getElementById('msearch');
 var onlyok=document.getElementById('monlyok');
 var count=document.getElementById('mcount');
 function apply(){
  var shown=0;
  for(var i=0;i<rows.length;i++){var r=rows[i];
   var okv=r.getAttribute('data-ok')==='1';
   var vis=(mod==='all'||r.getAttribute('data-mod')===mod)&&(!ok||okv)&&(q===''||r.getAttribute('data-s').indexOf(q)>-1);
   r.style.display=vis?'':'none'; if(vis)shown++;}
  count.textContent=shown+' / '+rows.length+' células';
 }
 for(var i=0;i<seg.length;i++){seg[i].addEventListener('click',function(e){
  for(var j=0;j<seg.length;j++)seg[j].classList.remove('on');
  e.target.classList.add('on');mod=e.target.getAttribute('data-mod');apply();});}
 search.addEventListener('input',function(e){q=e.target.value.toLowerCase().trim();apply();});
 onlyok.addEventListener('change',function(e){ok=e.target.checked;apply();});
 document.querySelector('table.master').addEventListener('click',function(e){
  var td=e.target.closest('td.detail'); if(td)td.classList.toggle('exp');});
 apply();
})();
`;

const legend = '<div class="legend"><span><span class="sw c-l1"></span>&lt;500ms</span>'
 + '<span><span class="sw c-l2"></span>&lt;1s</span><span><span class="sw c-l3"></span>&lt;2s</span>'
 + '<span><span class="sw c-l4"></span>&lt;5s</span><span><span class="sw c-l5"></span>&lt;10s</span>'
 + '<span><span class="sw c-l6"></span>≥10s</span><span><span class="sw c-404"></span>model-404</span>'
 + '<span><span class="sw c-rai"></span>RAI</span></div>';

function sec(no, sid, title, body, hint=""){
  const h = hint ? `<span class="hint">${hint}</span>` : "";
  return `<section id="${sid}"><div class="wrap"><div class="sec-h">`
       + `<span class="no">${no}</span><h2>${esc(title)}</h2>${h}</div>${body}</div></section>`;
}

const HTML_OUT = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mapa de Regiões × Modelos — Vertex AI (re-teste v2)</title>
<meta name="description" content="Diagnóstico serial de 32 endpoints da Vertex AI × modelos de texto/imagem/vídeo — 578 células, cadeias de fallback.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<style>${CSS}</style></head>
<body>
<header class="hero"><div class="wrap">
 <p class="eyebrow">Diagnóstico Vertex AI · execução 100% serial</p>
 <h1>Mapa de Regiões <span class="x">×</span> Modelos</h1>
 <p class="sub">Varredura serial dos <b>32 endpoints</b> da Vertex AI (global + 2 multi-região + 29 regionais) contra os modelos de texto, imagem e vídeo, com latências confiáveis (sem contenção, sem 429 de auto-contenção) para desenhar cadeias de fallback por modalidade.</p>
 <div class="provbar"><span><b>SDK</b> ${esc(prov.sdk)}</span><span><b>Node</b> ${esc(prov.node)}</span>
  <span><b>Client</b> vertexai:true</span><span><b>Data</b> ${esc(prov.data_teste)}</span>
  <span><b>Duração</b> ~36,5 min (serial)</span><span><b>Delay</b> ~1s entre chamadas</span></div>
 <p class="artlink"><span class="tag">Artifact interativo original (Claude):</span> <a href="${esc(ARTIFACT_URL)}" target="_blank" rel="noopener">${esc(ARTIFACT_URL)}</a></p>
 <div class="stats">${statCards}</div>
</div></header>
<nav class="nav"><div class="wrap">${navHtml}</div></nav>
<main>
${sec("01","s1",...SECOES.s1)}
${sec("02","s2",...SECOES.s2,"a seção prioritária")}
${sec("03","s3",...SECOES.s3)}
${sec("04","s4","Mapa de calor — endpoint × modelo × latência", `${heatBlocks}${legend}`, "verde = rápido · vermelho = lento · cinza = 404")}
${sec("05","s5","Mapa por modelo — ordenado por latência", mcardsBlocks, "completo, sem abreviação")}
${sec("06","s6",...SECOES.s6,"sustentada pelos números")}
${sec("07","s7",...SECOES.s7,"divergências explícitas")}
<section id="smaster"><div class="wrap"><div class="sec-h"><span class="no">·</span><h2>Tabela mestre — todas as 578 células</h2><span class="hint">filtrável · clique no detalhe p/ expandir</span></div>
 <div class="filters">
  <div class="seg"><button class="on" data-mod="all">Todas</button><button data-mod="text">Texto</button><button data-mod="image">Imagem</button><button data-mod="video">Vídeo</button></div>
  <input type="text" id="msearch" placeholder="filtrar modelo ou endpoint…">
  <label><input type="checkbox" id="monlyok"> só OK</label>
  <span class="count" id="mcount"></span>
 </div>
 <div class="mt-wrap"><table class="master"><thead><tr><th>Mod.</th><th>Modelo</th><th>Endpoint</th><th>Status</th><th>Latência</th><th>Detalhe</th></tr></thead>
 <tbody id="mtbody">${masterRows}</tbody></table></div>
</div></section>
${sec("08","s8",...SECOES.s8)}
${sec("09","s9",...SECOES.s9)}
</main>
<footer><div class="wrap"><div class="prov">
 <b>Proveniência &amp; sanitização.</b> Gerado deterministicamente a partir de <code>mapa-regioes-data.json</code> (mesma pasta) — 578 células, dados embutidos inline nesta página (legível por IA, sem <code>fetch</code> externo). Reproduz as 9 seções do relatório original; a Seção 5 (Mapa por modelo) aparece <b>completa</b>. Sanitizado para repositório público: nenhum project id, bucket GCS, IP, token, API key ou service-account. Os caminhos de modelo nos detalhes 404 usam <code>&lt;PROJECT&gt;</code> no lugar do ID real.<br>
 Re-teste serial v2 · 32 endpoints · 578 células · ${esc(prov.sdk)} · ${esc(prov.node)} · teste ${esc(prov.data_teste)} · publicado ${esc(prov.publicado_em)}.
</div></div></footer>
<script>${JS}</script>
</body></html>`;

writeFileSync(OUT, HTML_OUT, "utf-8");
console.log("OK ->", OUT);
console.log("bytes:", statSync(OUT).size);
console.log("linhas master:", (HTML_OUT.match(/data-mod="/g)||[]).length);
