// Drawings for Delta-V 26: the astronaut, the stars and the whole base.
// The base is a 1024 x 436 picture. Everything else is placed in those units.

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export function astro(color) {
  return `<svg class="astro" viewBox="0 0 44 70" aria-hidden="true"><rect x="9" y="17" width="26" height="28" rx="5" fill="#c9cedb"/><rect x="4" y="24" width="9" height="21" rx="4.5" fill="#f2f4fa"/><rect x="31" y="24" width="9" height="21" rx="4.5" fill="#f2f4fa"/><circle cx="8.5" cy="46" r="4.2" fill="#aeb4c4"/><circle cx="35.5" cy="46" r="4.2" fill="#aeb4c4"/><rect x="13" y="43" width="8.5" height="21" rx="3" fill="#f2f4fa"/><rect x="22.5" y="43" width="8.5" height="21" rx="3" fill="#f2f4fa"/><rect x="11" y="62" width="11" height="6" rx="2" fill="#8a90a0"/><rect x="22" y="62" width="11" height="6" rx="2" fill="#8a90a0"/><rect x="12" y="21" width="20" height="26" rx="7" fill="#f2f4fa"/><rect x="17" y="26" width="10" height="6" rx="1.5" fill="#c9cedb"/><rect x="12" y="35" width="20" height="4" fill="${color}"/><rect x="13" y="52" width="8.5" height="3" fill="${color}"/><rect x="22.5" y="52" width="8.5" height="3" fill="${color}"/><circle cx="22" cy="12" r="11" fill="#f2f4fa"/><rect x="14" y="6" width="16" height="11" rx="5.5" fill="#d9a441"/><path d="M17 10h5" stroke="#ffe7a8" stroke-width="1.6" stroke-linecap="round"/></svg>`;
}

export function stars() {
  const pts = [[210, 40], [330, 86], [470, 34], [560, 120], [640, 60], [800, 44], [880, 170], [1000, 80], [40, 70], [420, 160], [130, 130], [720, 130], [270, 170], [960, 30], [600, 180]];
  return [0, 1, 2].map((g) => `<g class="tw${g + 1}" fill="#fff">${pts.filter((_, i) => i % 3 === g).map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${1.2 + (i % 3) * 0.4}"/>`).join("")}</g>`).join("");
}

// The whole base, drawn for the Moon or for Mars.
// Pieces with class "upg u-<id>" only show once that upgrade is bought.
export function sceneSvg(site, label) {
  const m = site === "mars";
  const c = m
    ? { sky: "#b8764a", far: "#a8643e", mid: "#8f4e2c", near: "#74391f", rim: "#a8643e", pit: "#5a2a16", berm: "#8f4e2c", berm2: "#a8643e" }
    : { sky: "#05070f", far: "#a3a9b8", mid: "#868c9b", near: "#666c7b", rim: "#a3a9b8", pit: "#0a0c12", berm: "#868c9b", berm2: "#a3a9b8" };
  const bgImg = m ? "./assets/bg-mars.png" : "./assets/bg-moon.png";
  return `<svg viewBox="0 0 1024 436" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label)}">
<defs>
  <linearGradient id="hudShade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#05070f" stop-opacity="0.8"/>
    <stop offset="30%" stop-color="#05070f" stop-opacity="0.35"/>
    <stop offset="60%" stop-color="#05070f" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="marsSkyGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#5a2c14" stop-opacity="0.85"/>
    <stop offset="35%" stop-color="#8c4e28" stop-opacity="0.45"/>
    <stop offset="70%" stop-color="#b8764a" stop-opacity="0.1"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.4"/>
  </linearGradient>
  <linearGradient id="moonSkyGrad" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#020308" stop-opacity="0.95"/>
    <stop offset="50%" stop-color="#05070f" stop-opacity="0.7"/>
    <stop offset="100%" stop-color="#000000" stop-opacity="0.5"/>
  </linearGradient>
  <linearGradient id="marsHorizonHaze" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#b8764a" stop-opacity="0"/>
    <stop offset="65%" stop-color="#a8643e" stop-opacity="0.3"/>
    <stop offset="100%" stop-color="#a8643e" stop-opacity="0.6"/>
  </linearGradient>
</defs>
<rect width="1024" height="436" fill="${c.sky}"/>
<image href="${bgImg}" x="0" y="${m ? -45 : -35}" width="1024" height="${m ? 430 : 420}" preserveAspectRatio="xMidYMid slice" opacity="${m ? 0.85 : 0.65}"/>
<rect width="1024" height="436" fill="${m ? "url(#marsSkyGrad)" : "url(#moonSkyGrad)"}"/>
<rect width="1024" height="130" fill="url(#hudShade)"/>
${m ? `<rect x="0" y="140" width="1024" height="100" fill="url(#marsHorizonHaze)"/>` : ""}
${m ? "" : stars() + `<line class="shoot" x1="980" y1="20" x2="560" y2="190" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`}
<g class="sun"><circle class="sunglow" cx="70" cy="212" r="44" fill="#fff6d6" opacity=".18"/><circle cx="70" cy="212" r="${m ? 17 : 26}" fill="#fff6d6"/>
<g class="streaks" stroke="#ffb27a" stroke-width="3" stroke-linecap="round"><line x1="90" y1="200" x2="520" y2="120"/><line x1="90" y1="214" x2="540" y2="190"/><line x1="90" y1="226" x2="500" y2="250"/><line x1="90" y1="190" x2="460" y2="60"/></g></g>
${m ? "" : `<g><circle cx="940" cy="118" r="24" fill="#3f8fe8"/><ellipse cx="932" cy="112" rx="10" ry="7" fill="#58c27a"/><ellipse cx="948" cy="128" rx="7" ry="4" fill="#58c27a"/><circle cx="954" cy="108" r="24" fill="${c.sky}"/></g>`}
<path d="M0 236 120 214 260 228 420 206 600 226 760 204 900 222 1024 210V436H0z" fill="${c.far}"/>
${m ? `<g fill="#e3b58a" opacity=".35"><rect class="dust" x="0" y="150" width="2048" height="34" rx="17"/><rect class="dust d2" x="0" y="196" width="2048" height="20" rx="10"/></g>` : ""}
<path d="M0 262Q300 240 620 258T1024 250V436H0z" fill="${c.mid}"/>
<path d="M0 330Q400 300 1024 326V436H0z" fill="${c.near}"/>
<ellipse cx="850" cy="300" rx="162" ry="36" fill="${c.rim}"/><ellipse cx="850" cy="304" rx="150" ry="30" fill="${c.pit}"/>
<path d="M704 232 696 240M708 232 716 240" stroke="#aeb4c4" stroke-width="3" stroke-linecap="round"/>
<path d="M692 232 697 192Q706 168 715 192L720 232z" fill="#dadfea"/><circle class="beacon" cx="706" cy="176" r="3.5" fill="#ff5a5a"/>
<path d="M150 302 430 314V320L150 308z" fill="#000" opacity=".35"/>
<path d="M150 302V104M136 302l14-16 14 16" stroke="#c9cedb" stroke-width="5" stroke-linecap="round" fill="none"/>
<rect x="122" y="98" width="56" height="132" rx="3" fill="#2f5bd8"/><path d="M122 131h56M122 164h56M122 197h56M150 98v132" stroke="#0b1026" stroke-width="2"/>
<rect class="glint" x="122" y="98" width="56" height="132" rx="3" fill="#fff"/>
<g class="upg u-solar_array"><path d="M214 300V134M202 300l12-14 12 14" stroke="#c9cedb" stroke-width="5" stroke-linecap="round" fill="none"/><rect x="191" y="128" width="46" height="108" rx="3" fill="#2f5bd8"/><path d="M191 164h46M191 200h46M214 128v108" stroke="#0b1026" stroke-width="2"/></g>
<ellipse cx="282" cy="310" rx="52" ry="7" fill="#000" opacity=".3"/>
<rect x="240" y="280" width="46" height="28" rx="3" fill="#dadfea"/><path d="M248 280l6-14h18l6 14z" fill="#aeb4c4"/>
<circle cx="302" cy="290" r="17" fill="#f2f4fa"/><path d="M286 296h-6M302 273v-8h14" stroke="#aeb4c4" stroke-width="4" stroke-linecap="round" fill="none"/>
<g fill="#fff"><circle class="puff" cx="316" cy="262" r="5"/><circle class="puff p2" cx="320" cy="262" r="4"/><circle class="puff p3" cx="313" cy="262" r="4.5"/></g>
<ellipse cx="465" cy="308" rx="104" ry="9" fill="#000" opacity=".3"/>
<g class="upg u-recycler"><rect x="350" y="280" width="26" height="26" rx="5" fill="#5cc8ff"/><path d="M363 280v-12h14" stroke="#aeb4c4" stroke-width="4" stroke-linecap="round" fill="none"/></g>
<rect x="380" y="250" width="170" height="56" rx="28" fill="#eef1f8"/>
<path class="upg u-thick_shield" d="M358 286Q394 206 465 202 536 206 572 286 465 258 358 286z" fill="${c.berm2}"/>
<path d="M370 278Q400 226 465 222 530 226 560 278 465 256 370 278z" fill="${c.berm}"/>
<rect x="452" y="272" width="26" height="34" rx="4" fill="#4a5063"/>
<circle class="win" cx="412" cy="290" r="7" fill="#9fd8ff"/><circle class="win" cx="518" cy="290" r="7" fill="#9fd8ff"/>
<ellipse class="dome" cx="465" cy="306" rx="150" ry="118" fill="#c3aeff" fill-opacity=".12" stroke="#c3aeff" stroke-width="3" stroke-dasharray="10 8"/>
<ellipse cx="635" cy="308" rx="52" ry="7" fill="#000" opacity=".3"/>
<g class="upg u-greenhouse2"><path d="M690 306V290a28 28 0 0 1 56 0V306z" fill="#f2f4fa"/><rect class="grow" x="700" y="284" width="14" height="18" rx="3" fill="#ff7ad9"/><rect class="grow" x="722" y="284" width="14" height="18" rx="3" fill="#ff7ad9"/></g>
<path d="M590 306V280a45 45 0 0 1 90 0V306z" fill="#f2f4fa"/>
<rect class="grow" x="602" y="270" width="18" height="24" rx="4" fill="#ff7ad9"/><rect class="grow" x="626" y="270" width="18" height="24" rx="4" fill="#ff7ad9"/><rect class="grow" x="650" y="270" width="18" height="24" rx="4" fill="#ff7ad9"/>
<g class="rover"><rect x="745" y="350" width="50" height="16" rx="4" fill="#eef1f8"/><path d="M782 350v-16h10" stroke="#c9cedb" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="756" cy="370" r="7" fill="#2a2e3a"/><circle cx="784" cy="370" r="7" fill="#2a2e3a"/></g>
<rect class="nightshade" width="1024" height="436" fill="#02030a"/>
</svg>`;
}

export function skyBackdrop() {
  return `<svg class="sky" viewBox="0 0 1024 436" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="1024" height="436" fill="#05070f"/>${stars()}<line class="shoot" x1="980" y1="20" x2="560" y2="190" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;
}
