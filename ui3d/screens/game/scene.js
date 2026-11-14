// GENERATED from Game.dc.html (planet scene SVG). c = palette, zz(id) = tired cloud for a crew member.
export function sceneSvg(c, zz) {
  return `<svg aria-hidden="true" class="dv-in" width="1280" height="800" viewBox="0 0 1280 800" style="position: absolute; left: 0; top: 0">
<defs>
<radialGradient id="pl-g" cx="50%" cy="8%" r="75%"><stop offset="0" stop-color="${c.top}"></stop><stop offset="1" stop-color="${c.edge}"></stop></radialGradient>
<linearGradient id="shade-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${c.night}" stop-opacity="0"></stop><stop offset="0.18" stop-color="${c.night}" stop-opacity="0.82"></stop><stop offset="1" stop-color="${c.night}" stop-opacity="0.9"></stop></linearGradient>
<radialGradient id="sun-g"><stop offset="0" stop-color="#F5C518" stop-opacity="0.55"></stop><stop offset="1" stop-color="#F5C518" stop-opacity="0"></stop></radialGradient>
<linearGradient id="cone-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE7A0" stop-opacity="0.75"></stop><stop offset="1" stop-color="#FFE7A0" stop-opacity="0"></stop></linearGradient>
<radialGradient id="pool-g"><stop offset="0" stop-color="#FFE7A0" stop-opacity="0.7"></stop><stop offset="1" stop-color="#FFE7A0" stop-opacity="0"></stop></radialGradient>
<radialGradient id="pink-g"><stop offset="0" stop-color="#FF8AD0" stop-opacity="0.7"></stop><stop offset="1" stop-color="#FF8AD0" stop-opacity="0"></stop></radialGradient>
<radialGradient id="win-g"><stop offset="0" stop-color="#FFD27A" stop-opacity="0.9"></stop><stop offset="1" stop-color="#FFD27A" stop-opacity="0"></stop></radialGradient>
<clipPath id="pl-clip"><circle cx="640" cy="1060" r="720"></circle></clipPath>
</defs>
<rect class="dv-cyc dv-dayk" x="0" y="0" width="1280" height="800" fill="${c.daySky}"></rect>
<g class="dv-cyc dv-starsk" fill="#F3F4F6">
<circle class="dv-twinkle-b" cx="40" cy="330" r="1.4"></circle>
<circle class="dv-twinkle" cx="90" cy="560" r="1"></circle>
<circle class="dv-twinkle-b" cx="230" cy="170" r="1.6"></circle>
<circle class="dv-twinkle" cx="380" cy="210" r="1.1"></circle>
<circle class="dv-twinkle-b" cx="760" cy="170" r="1.8"></circle>
<circle class="dv-twinkle" cx="900" cy="230" r="1.4"></circle>
<circle class="dv-twinkle-b" cx="1240" cy="420" r="1"></circle>
<circle class="dv-twinkle" cx="1200" cy="620" r="1.6"></circle>
<circle class="dv-twinkle-b" cx="40" cy="660" r="1.1"></circle>
<circle class="dv-twinkle" cx="1250" cy="560" r="1.8"></circle>
<circle class="dv-twinkle-b" cx="20" cy="460" r="1.4"></circle>
<circle class="dv-twinkle" cx="1100" cy="640" r="1"></circle>
<circle class="dv-twinkle-b" cx="180" cy="640" r="1.6"></circle>
<circle class="dv-twinkle" cx="300" cy="300" r="1.1"></circle>
<circle class="dv-twinkle-b" cx="520" cy="260" r="1.8"></circle>
<circle class="dv-twinkle" cx="980" cy="300" r="1.4"></circle>
<circle class="dv-twinkle-b" cx="140" cy="420" r="1"></circle>
<circle class="dv-twinkle" cx="1160" cy="300" r="1.6"></circle>
<circle class="dv-twinkle-b" cx="700" cy="230" r="1.1"></circle>
<circle class="dv-twinkle" cx="60" cy="240" r="1.8"></circle>
</g>
<g class="dv-cyc dv-sunorbit">
<circle cx="-220" cy="1060" r="110" fill="url(#sun-g)"></circle>
<g transform="translate(-220 1060)"><g class="dv-spin" stroke="#F5C518" stroke-width="5" stroke-linecap="round"><path d="M0 -48v-14M0 48v14M-48 0h-14M48 0h14M-34 -34l-10-10M34 34l10 10M-34 34l-10 10M34 -34l10-10"></path></g>
<circle r="36" fill="#F5C518" stroke="#1E2430" stroke-width="5"></circle><circle r="24" fill="none" stroke="#F9DC6A" stroke-width="3" stroke-dasharray="5 5"></circle></g>
</g>
<g class="dv-cyc dv-sunorbit">
<g transform="translate(1500 1060)" opacity="${c.earthOp}"><circle r="26" fill="#3D7BD9" stroke="#1E2430" stroke-width="4"></circle><path d="M-16 -6 c6-9 16-6 14 3s-10 7-14 0z" fill="#5CBF5A"></path><path d="M4 8 c6-4 12-2 10 5s-9 5-10 0z" fill="#5CBF5A"></path><path d="M-20 4 c8-4 14 0 22-2" stroke="#F3F4F6" stroke-width="3" fill="none" stroke-linecap="round"></path></g>
<g transform="translate(1500 1060)" opacity="${c.moonOp}"><ellipse rx="16" ry="12" fill="#9A8F86" stroke="#1E2430" stroke-width="3"></ellipse><circle cx="-4" cy="-2" r="3" fill="#7A7068"></circle></g>
</g>
<circle cx="640" cy="1060" r="742" fill="none" stroke="${c.haze}" stroke-width="22" opacity="0.35"></circle>
<circle cx="640" cy="1060" r="720" fill="url(#pl-g)" stroke="#1E2430" stroke-width="5"></circle>
<g clip-path="url(#pl-clip)">
<ellipse cx="300" cy="640" rx="58" ry="16" fill="${c.craterIn}"></ellipse><path d="M242 640 a58 16 0 0 0 116 0" fill="none" stroke="${c.rim}" stroke-width="3"></path>
<ellipse cx="520" cy="520" rx="30" ry="9" fill="${c.craterIn}"></ellipse><path d="M490 520 a30 9 0 0 0 60 0" fill="none" stroke="${c.rim}" stroke-width="3"></path>
<ellipse cx="860" cy="560" rx="44" ry="12" fill="${c.craterIn}"></ellipse><path d="M816 560 a44 12 0 0 0 88 0" fill="none" stroke="${c.rim}" stroke-width="3"></path>
<ellipse cx="1060" cy="660" rx="70" ry="18" fill="${c.craterIn}"></ellipse><path d="M990 660 a70 18 0 0 0 140 0" fill="none" stroke="${c.rim}" stroke-width="3"></path>
<ellipse cx="150" cy="760" rx="50" ry="14" fill="${c.craterIn}"></ellipse><path d="M100 760 a50 14 0 0 0 100 0" fill="none" stroke="${c.rim}" stroke-width="3"></path>
<ellipse cx="700" cy="700" rx="36" ry="10" fill="${c.craterIn}"></ellipse><path d="M664 700 a36 10 0 0 0 72 0" fill="none" stroke="${c.rim}" stroke-width="3"></path>
<ellipse cx="980" cy="470" rx="22" ry="7" fill="${c.craterIn}"></ellipse><path d="M958 470 a22 7 0 0 0 44 0" fill="none" stroke="${c.rim}" stroke-width="3"></path>
<ellipse cx="420" cy="430" rx="18" ry="6" fill="${c.craterIn}"></ellipse><path d="M402 430 a18 6 0 0 0 36 0" fill="none" stroke="${c.rim}" stroke-width="3"></path>
<ellipse cx="1180" cy="760" rx="40" ry="12" fill="${c.craterIn}"></ellipse><path d="M1140 760 a40 12 0 0 0 80 0" fill="none" stroke="${c.rim}" stroke-width="3"></path>
<ellipse cx="360" cy="760" rx="30" ry="9" fill="${c.craterIn}"></ellipse><path d="M330 760 a30 9 0 0 0 60 0" fill="none" stroke="${c.rim}" stroke-width="3"></path>
<circle cx="240" cy="520" r="3" fill="${c.speck}"></circle>
<circle cx="470" cy="600" r="2.5" fill="${c.speck}"></circle>
<circle cx="620" cy="470" r="2" fill="${c.speck}"></circle>
<circle cx="780" cy="640" r="3.5" fill="${c.speck}"></circle>
<circle cx="930" cy="520" r="3" fill="${c.speck}"></circle>
<circle cx="1120" cy="560" r="2.5" fill="${c.speck}"></circle>
<circle cx="330" cy="700" r="2" fill="${c.speck}"></circle>
<circle cx="560" cy="740" r="3.5" fill="${c.speck}"></circle>
<circle cx="840" cy="760" r="3" fill="${c.speck}"></circle>
<circle cx="1010" cy="740" r="2.5" fill="${c.speck}"></circle>
<circle cx="200" cy="620" r="2" fill="${c.speck}"></circle>
<circle cx="700" cy="560" r="3.5" fill="${c.speck}"></circle>
<g class="dv-cyc dv-sunorbit">
<rect x="560" y="200" width="900" height="1800" fill="url(#shade-g)"></rect>
</g>
</g>
<g class="dv-cyc dv-sunorbit"><path d="M283.0 1678.3 A714 714 0 0 1 283.0 441.7" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.45"></path></g>
<path d="M194.9 490.3 A723 723 0 0 1 1160.1 557.8" fill="none" stroke="${c.path}" stroke-width="4" stroke-dasharray="2 12" stroke-linecap="round"></path>
<g transform="translate(215.6 475.9) rotate(-36)"><rect x="-2" y="-14" width="4" height="14" fill="#9AA3AF" stroke="#1E2430" stroke-width="1.5"></rect><circle cx="0" cy="-16" r="3.5" fill="#5A6070" stroke="#1E2430" stroke-width="1.5"></circle><g class="dv-cyc dv-nightk"><circle cx="0" cy="-16" r="18" fill="url(#win-g)"></circle><circle cx="0" cy="-16" r="3" fill="#FFE7A0"></circle><ellipse cx="0" cy="2" rx="22" ry="5" fill="url(#pool-g)"></ellipse></g></g>
<g transform="translate(346.3 400.4) rotate(-24)"><rect x="-2" y="-14" width="4" height="14" fill="#9AA3AF" stroke="#1E2430" stroke-width="1.5"></rect><circle cx="0" cy="-16" r="3.5" fill="#5A6070" stroke="#1E2430" stroke-width="1.5"></circle><g class="dv-cyc dv-nightk"><circle cx="0" cy="-16" r="18" fill="url(#win-g)"></circle><circle cx="0" cy="-16" r="3" fill="#FFE7A0"></circle><ellipse cx="0" cy="2" rx="22" ry="5" fill="url(#pool-g)"></ellipse></g></g>
<g transform="translate(508.4 350.1) rotate(-10.5)"><rect x="-2" y="-14" width="4" height="14" fill="#9AA3AF" stroke="#1E2430" stroke-width="1.5"></rect><circle cx="0" cy="-16" r="3.5" fill="#5A6070" stroke="#1E2430" stroke-width="1.5"></circle><g class="dv-cyc dv-nightk"><circle cx="0" cy="-16" r="18" fill="url(#win-g)"></circle><circle cx="0" cy="-16" r="3" fill="#FFE7A0"></circle><ellipse cx="0" cy="2" rx="22" ry="5" fill="url(#pool-g)"></ellipse></g></g>
<g transform="translate(777.8 351.3) rotate(11)"><rect x="-2" y="-14" width="4" height="14" fill="#9AA3AF" stroke="#1E2430" stroke-width="1.5"></rect><circle cx="0" cy="-16" r="3.5" fill="#5A6070" stroke="#1E2430" stroke-width="1.5"></circle><g class="dv-cyc dv-nightk"><circle cx="0" cy="-16" r="18" fill="url(#win-g)"></circle><circle cx="0" cy="-16" r="3" fill="#FFE7A0"></circle><ellipse cx="0" cy="2" rx="22" ry="5" fill="url(#pool-g)"></ellipse></g></g>
<g transform="translate(904.6 388.2) rotate(21.5)"><rect x="-2" y="-14" width="4" height="14" fill="#9AA3AF" stroke="#1E2430" stroke-width="1.5"></rect><circle cx="0" cy="-16" r="3.5" fill="#5A6070" stroke="#1E2430" stroke-width="1.5"></circle><g class="dv-cyc dv-nightk"><circle cx="0" cy="-16" r="18" fill="url(#win-g)"></circle><circle cx="0" cy="-16" r="3" fill="#FFE7A0"></circle><ellipse cx="0" cy="2" rx="22" ry="5" fill="url(#pool-g)"></ellipse></g></g>
<g transform="translate(984.5 425.5) rotate(28.5)"><rect x="-2" y="-14" width="4" height="14" fill="#9AA3AF" stroke="#1E2430" stroke-width="1.5"></rect><circle cx="0" cy="-16" r="3.5" fill="#5A6070" stroke="#1E2430" stroke-width="1.5"></circle><g class="dv-cyc dv-nightk"><circle cx="0" cy="-16" r="18" fill="url(#win-g)"></circle><circle cx="0" cy="-16" r="3" fill="#FFE7A0"></circle><ellipse cx="0" cy="2" rx="22" ry="5" fill="url(#pool-g)"></ellipse></g></g>
<g transform="translate(1089.5 495.0) rotate(38.5)"><rect x="-2" y="-14" width="4" height="14" fill="#9AA3AF" stroke="#1E2430" stroke-width="1.5"></rect><circle cx="0" cy="-16" r="3.5" fill="#5A6070" stroke="#1E2430" stroke-width="1.5"></circle><g class="dv-cyc dv-nightk"><circle cx="0" cy="-16" r="18" fill="url(#win-g)"></circle><circle cx="0" cy="-16" r="3" fill="#FFE7A0"></circle><ellipse cx="0" cy="2" rx="22" ry="5" fill="url(#pool-g)"></ellipse></g></g>
<g transform="translate(167.6 516.6) rotate(-41)"><ellipse class="dv-cyc dv-shadowk" cx="30" cy="1" rx="30" ry="5" fill="#000000"></ellipse>
<path d="M-14 0 L0 -70 L14 0" fill="none" stroke="#1E2430" stroke-width="4"></path><path d="M-9 -24 h18 M-5 -46 h10" stroke="#1E2430" stroke-width="3"></path>
<path d="M-18 -78 a18 9 0 0 0 36 0z" fill="#F7F8F9" stroke="#1E2430" stroke-width="3" transform="rotate(-20 0 -78)"></path>
<circle class="dv-blink" cx="0" cy="-88" r="4" fill="#F26A1B" stroke="#1E2430" stroke-width="1.5"></circle>
</g>
<g transform="translate(269.2 442.8) rotate(-31)"><ellipse class="dv-cyc dv-shadowk" cx="70" cy="1" rx="70" ry="6" fill="#000000"></ellipse>
<rect x="18" y="-24" width="26" height="24" rx="3" fill="#B8BEC8" stroke="#1E2430" stroke-width="3"></rect><rect x="23" y="-19" width="5" height="12" fill="#5CBF5A" class="dv-glow"></rect><rect x="31" y="-19" width="5" height="12" fill="#5CBF5A"></rect>
<rect x="-22" y="-16" width="44" height="16" rx="3" fill="#DDE1E6" stroke="#1E2430" stroke-width="3"></rect>
<rect x="-5" y="-150" width="10" height="136" fill="#F7F8F9" stroke="#1E2430" stroke-width="3"></rect>
<path d="M-5 -130h10M-5 -110h10M-5 -90h10M-5 -70h10M-5 -50h10M-5 -30h10" stroke="#1E2430" stroke-width="2"></path>
<g class="dv-cyc dv-trackk"><rect x="-66" y="-170" width="132" height="22" rx="2" fill="#D9A43A" stroke="#1E2430" stroke-width="4"></rect><path d="M-44 -170v22M-22 -170v22M0 -170v22M22 -170v22M44 -170v22M-66 -159h132" stroke="#1E2430" stroke-width="2"></path><path class="dv-glint" d="M-60 -166h50" stroke="#FFF6D8" stroke-width="3" stroke-linecap="round"></path></g>
<circle cx="0" cy="-159" r="7" fill="#F26A1B" stroke="#1E2430" stroke-width="3"></circle>
<circle class="dv-blink" cx="0" cy="-178" r="4" fill="#E0445E" stroke="#1E2430" stroke-width="1.5"></circle>
</g>
<g transform="translate(429.5 371.5) rotate(-17)"><ellipse class="dv-cyc dv-shadowk" cx="56" cy="1" rx="56" ry="6" fill="#000000"></ellipse>
<path d="M-10 -24 h-20 v-30" fill="none" stroke="#1E2430" stroke-width="5"></path>
<rect x="-42" y="-56" width="62" height="56" rx="6" fill="#F7F8F9" stroke="#1E2430" stroke-width="4"></rect>
<rect x="-42" y="-14" width="62" height="14" fill="#9AA3AF" stroke="#1E2430" stroke-width="3"></rect>
<g fill="#F5C518"><path d="M-36 -14 l8 0 l-6 14 h-8z M-20 -14 l8 0 l-6 14 h-8z M-4 -14 l8 0 l-6 14 h-8z M12 -14 l8 0 l-6 14 h-8z"></path></g>
<rect x="-32" y="-46" width="30" height="22" rx="4" fill="#3A1A08" stroke="#1E2430" stroke-width="3"></rect><rect class="dv-flicker" x="-29" y="-43" width="24" height="16" rx="3" fill="#F26A1B"></rect>
<circle class="dv-cyc dv-nightk" cx="-17" cy="-35" r="34" fill="url(#win-g)"></circle>
<circle cx="8" cy="-44" r="4" fill="#5CBF5A" class="dv-blink-b"></circle><circle cx="8" cy="-32" r="4" fill="#F5C518"></circle>
<rect x="-36" y="-76" width="12" height="20" fill="#B8BEC8" stroke="#1E2430" stroke-width="3"></rect>
<circle class="dv-zz" cx="-30" cy="-90" r="7" fill="#DDE1E6"></circle><circle class="dv-zz" style="animation-delay: 1.2s" cx="-24" cy="-96" r="5" fill="#DDE1E6"></circle>
<rect x="24" y="-66" width="26" height="66" rx="13" fill="#4BA3F0" stroke="#1E2430" stroke-width="4"></rect><path d="M31 -54 v40" stroke="#9CD0FA" stroke-width="4" stroke-linecap="round"></path>
<path d="M20 -40 h4" stroke="#1E2430" stroke-width="5"></path>
</g>
<g transform="translate(640.0 340.0) rotate(0)"><ellipse class="dv-cyc dv-shadowk" cx="120" cy="2" rx="120" ry="8" fill="#000000"></ellipse>
<g class="dv-cyc dv-flood"><polygon points="-128,-62 -168,0 -96,0" fill="url(#cone-g)"></polygon><polygon points="128,-62 96,0 168,0" fill="url(#cone-g)"></polygon><ellipse cx="0" cy="2" rx="190" ry="14" fill="url(#pool-g)"></ellipse></g>
<rect x="-130" y="-66" width="5" height="66" fill="#9AA3AF" stroke="#1E2430" stroke-width="2"></rect><rect x="125" y="-66" width="5" height="66" fill="#9AA3AF" stroke="#1E2430" stroke-width="2"></rect>
<rect x="-136" y="-72" width="16" height="8" rx="2" fill="#5A6070" stroke="#1E2430" stroke-width="2"></rect><rect x="120" y="-72" width="16" height="8" rx="2" fill="#5A6070" stroke="#1E2430" stroke-width="2"></rect>
<g class="dv-cyc dv-nightk"><rect x="-134" y="-68" width="12" height="4" fill="#FFE7A0"></rect><rect x="122" y="-68" width="12" height="4" fill="#FFE7A0"></rect></g>
<rect x="-150" y="-50" width="64" height="40" rx="10" fill="#DDE1E6" stroke="#1E2430" stroke-width="4"></rect>
<rect x="-146" y="-44" width="20" height="34" rx="4" fill="#13211D" stroke="#1E2430" stroke-width="2.5"></rect>
<circle class="dv-blink" cx="-136" cy="-48" r="3.5" fill="#5CBF5A"></circle>
<rect x="-112" y="-10" width="224" height="10" rx="2" fill="#9AA3AF" stroke="#1E2430" stroke-width="3"></rect>
<path d="M-86 -10 A86 86 0 0 1 86 -10Z" fill="#F7F8F9" stroke="#1E2430" stroke-width="5"></path>
<clipPath id="dome-c"><path d="M-86 -10 A86 86 0 0 1 86 -10Z"></path></clipPath>
<g clip-path="url(#dome-c)"><path d="M-100 -10 A100 70 0 0 1 100 -10Z" fill="${c.soil}" transform="translate(0 30)"></path><path d="M-100 -44 A100 60 0 0 1 100 -44" fill="none" stroke="${c.soil}" stroke-width="12" stroke-dasharray="16 9" transform="translate(0 30)"></path><path d="M-90 -10 A90 55 0 0 1 90 -10" fill="none" stroke="${c.soilDark}" stroke-width="4" transform="translate(0 6)"></path></g>
<path d="M-86 -10 A86 86 0 0 1 86 -10Z" fill="none" stroke="#1E2430" stroke-width="5"></path>
<path d="M-60 -62 A70 70 0 0 1 -18 -90" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity="0.85"></path>
<circle cx="-30" cy="-58" r="11" fill="#4BA3F0" stroke="#1E2430" stroke-width="3"></circle><circle cx="8" cy="-66" r="11" fill="#4BA3F0" stroke="#1E2430" stroke-width="3"></circle><circle cx="44" cy="-54" r="11" fill="#4BA3F0" stroke="#1E2430" stroke-width="3"></circle>
<g class="dv-cyc dv-nightk"><circle cx="-30" cy="-58" r="11" fill="#FFD27A"></circle><circle cx="8" cy="-66" r="11" fill="#FFD27A"></circle><circle cx="44" cy="-54" r="11" fill="#FFD27A"></circle><circle cx="8" cy="-60" r="70" fill="url(#win-g)" opacity="0.5"></circle></g>
<rect x="-3" y="-128" width="6" height="34" fill="#1E2430"></rect>
<g class="dv-sway"><path d="M-20 -132 a20 10 0 0 0 40 0z" fill="#F7F8F9" stroke="#1E2430" stroke-width="3"></path></g>
<circle class="dv-blink-b" cx="0" cy="-140" r="4" fill="#F26A1B" stroke="#1E2430" stroke-width="1.5"></circle>
</g>
<g transform="translate(850.5 371.5) rotate(17)"><ellipse class="dv-cyc dv-shadowk" cx="70" cy="1" rx="70" ry="6" fill="#000000"></ellipse>
<ellipse class="dv-cyc dv-nightk" cx="0" cy="2" rx="110" ry="14" fill="url(#pink-g)"></ellipse>
<rect x="-62" y="-8" width="124" height="8" rx="2" fill="#9AA3AF" stroke="#1E2430" stroke-width="3"></rect>
<path d="M-56 -8 V-46 A56 34 0 0 1 56 -46 V-8Z" fill="#F3C6E2" stroke="#1E2430" stroke-width="4" opacity="0.95"></path>
<path class="dv-cyc dv-nightk" d="M-56 -8 V-46 A56 34 0 0 1 56 -46 V-8Z" fill="#FF9AD6"></path>
<g stroke="#1E2430" stroke-width="2.5" opacity="0.7"><path d="M-28 -8 V-74 M0 -8 V-80 M28 -8 V-74"></path></g>
<g class="dv-breathe"><g fill="#4E9E45" stroke="#1E2430" stroke-width="1.5"><circle cx="-42" cy="-16" r="7"></circle><circle cx="-14" cy="-18" r="8"></circle><circle cx="14" cy="-16" r="7"></circle><circle cx="42" cy="-18" r="8"></circle></g><g fill="#E0445E"><circle cx="-12" cy="-22" r="2.5"></circle><circle cx="40" cy="-22" r="2.5"></circle></g></g>
<rect class="dv-glow" x="-48" y="-66" width="96" height="5" rx="2.5" fill="#E55BB0"></rect>
<path d="M-56 -46 A56 34 0 0 1 56 -46" fill="none" stroke="#1E2430" stroke-width="4"></path>
</g>
<g transform="translate(944.3 407.5) rotate(25)"><g class="dv-breathe"><ellipse class="dv-cyc dv-shadowk" cx="30" cy="1" rx="30" ry="5" fill="#000000"></ellipse>
<rect x="-26" y="-30" width="52" height="18" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="3"></rect>
<rect x="-18" y="-40" width="22" height="10" rx="2" fill="#4BA3F0" stroke="#1E2430" stroke-width="2"></rect>
<path d="M14 -30 v-18" stroke="#1E2430" stroke-width="2.5"></path><circle class="dv-blink-b" cx="14" cy="-50" r="3.5" fill="#F26A1B" stroke="#1E2430" stroke-width="1.5"></circle>
<g fill="#1E2430"><circle cx="-18" cy="-8" r="8"></circle><circle cx="0" cy="-8" r="8"></circle><circle cx="18" cy="-8" r="8"></circle></g><g fill="#9AA3AF"><circle cx="-18" cy="-8" r="3"></circle><circle cx="0" cy="-8" r="3"></circle><circle cx="18" cy="-8" r="3"></circle></g>
<g class="dv-cyc dv-nightk"><polygon points="26,-26 80,-10 80,2 26,-18" fill="url(#cone-g)"></polygon></g>
</g></g>
<g transform="translate(1021.5 449.4) rotate(32)">
<path d="M-80 0 Q-74 -10 -62 -6 L62 -6 Q74 -10 80 0Z" fill="${c.rim}" stroke="#1E2430" stroke-width="3"></path>
<ellipse cx="0" cy="2" rx="64" ry="12" fill="${c.craterIn}" stroke="#1E2430" stroke-width="3"></ellipse>
<path d="M-64 2 A64 12 0 0 1 64 2 A64 8 0 0 0 -64 2Z" fill="#0B1020" opacity="0.45"></path>
<g fill="#BDEBFF" stroke="#1E2430" stroke-width="1.5"><path d="M-14 6 l5 -7 l5 7 l-5 4z"></path><path d="M16 4 l4 -5 l4 5 l-4 3z"></path></g>
<path class="dv-twinkle" d="M-8 -2 l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" fill="#FFFFFF"></path>
<path d="M52 -6 v-34" stroke="#1E2430" stroke-width="3"></path><path class="dv-sway" d="M52 -40 l18 6 l-18 6z" fill="#F26A1B" stroke="#1E2430" stroke-width="2"></path>
</g>
<g transform="translate(1140.2 542.1) rotate(44)">
<rect x="-62" y="-7" width="124" height="7" rx="2" fill="${c.pad}" stroke="#1E2430" stroke-width="3"></rect>
<path d="M-40 -7 h80" stroke="#F5C518" stroke-width="3" stroke-dasharray="8 6"></path>
<circle class="dv-blink" cx="-58" cy="-12" r="4" fill="#F26A1B" stroke="#1E2430" stroke-width="1.5"></circle><circle class="dv-blink-b" cx="58" cy="-12" r="4" fill="#F26A1B" stroke="#1E2430" stroke-width="1.5"></circle>
<rect x="-2" y="-46" width="4" height="40" fill="#F7F8F9" stroke="#1E2430" stroke-width="2"></rect><rect x="-18" y="-66" width="36" height="22" rx="3" fill="#F5C518" stroke="#1E2430" stroke-width="2.5"></rect>
<text x="0" y="-50" text-anchor="middle" font-family="Lexend" font-weight="800" font-size="14" fill="#1E2430">30</text>
</g>
<g transform="translate(533.6 347.9) rotate(-8.5)"><path d="M-30 0 C-24 -20 -6 -26 8 -19 C20 -13 26 -6 28 0 Z" fill="${c.soil}" stroke="#1E2430" stroke-width="3"></path><g fill="${c.soilDark}"><circle cx="-10" cy="-8" r="3"></circle><circle cx="8" cy="-6" r="2.5"></circle></g></g>
<g transform="translate(583.5 342.2) rotate(-4.5)"><g class="dv-breathe" >
<ellipse class="dv-cyc dv-shadowk" cx="22" cy="1" rx="22" ry="4" fill="#000000"></ellipse>
<ellipse class="dv-cyc dv-nightk" cx="-30" cy="1" rx="26" ry="4" fill="#000000" opacity="0.4"></ellipse>

<rect x="-17" y="-62" width="34" height="34" rx="7" fill="#C9CED6" stroke="#1E2430" stroke-width="2.5"></rect>
<rect x="-12" y="-11" width="10" height="11" rx="3" fill="#4A5366" stroke="#1E2430" stroke-width="2"></rect><rect x="2" y="-11" width="10" height="11" rx="3" fill="#4A5366" stroke="#1E2430" stroke-width="2"></rect>
<rect x="-11" y="-34" width="9" height="25" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="2"></rect><rect x="2" y="-34" width="9" height="25" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="2"></rect>
<rect x="-11" y="-24" width="9" height="4" fill="#F79A6B"></rect><rect x="2" y="-24" width="9" height="4" fill="#F79A6B"></rect>
<rect x="-14" y="-60" width="28" height="30" rx="9" fill="#F7F8F9" stroke="#1E2430" stroke-width="2.5"></rect>
<rect x="-14" y="-50" width="28" height="5" fill="#F79A6B" stroke="#1E2430" stroke-width="1.5"></rect>
<rect x="-7" y="-44" width="14" height="9" rx="2" fill="#9AA3AF" stroke="#1E2430" stroke-width="1.5"></rect><circle cx="-3" cy="-39.5" r="1.6" fill="#5CBF5A"></circle><circle class="dv-blink" cx="2" cy="-39.5" r="1.6" fill="#F26A1B"></circle>
<rect x="-21" y="-58" width="8" height="22" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="2"></rect><circle cx="-17" cy="-35" r="4.5" fill="#DDE1E6" stroke="#1E2430" stroke-width="2"></circle>
<g class="dv-scoop"><g transform="rotate(-38 18 -46)"><rect x="13" y="-58" width="8" height="22" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="2"></rect><circle cx="17" cy="-35" r="4.5" fill="#DDE1E6" stroke="#1E2430" stroke-width="2"></circle></g>
<g transform="rotate(48 30 -40)"><rect x="28" y="-84" width="4.5" height="46" rx="2" fill="#D9A43A" stroke="#1E2430" stroke-width="1.5"></rect><path d="M23 -40 h15 l-2 12 h-11z" fill="#9AA3AF" stroke="#1E2430" stroke-width="2"></path></g></g>
<g class="dv-toss" fill="${c.soil}" stroke="#1E2430" stroke-width="1.2"><circle cx="40" cy="-82" r="3.5"></circle><circle cx="48" cy="-74" r="2.5"></circle><circle cx="36" cy="-92" r="2"></circle></g>
${zz("maya")}
<rect x="-9" y="-64" width="18" height="5" rx="2" fill="#9AA3AF" stroke="#1E2430" stroke-width="1.5"></rect>
<circle cx="0" cy="-76" r="13" fill="#F7F8F9" stroke="#1E2430" stroke-width="2.5"></circle>
<path d="M-9 -78 a9 7 0 0 1 18 0 a9 6 0 0 1 -18 0z" fill="#D9A43A" stroke="#1E2430" stroke-width="2"></path>
<path d="M-5 -81 a5 3 0 0 1 6 -2" stroke="#FFF6D8" stroke-width="2" fill="none" stroke-linecap="round"></path>
<rect x="-3" y="-91" width="6" height="4" rx="1" fill="#F79A6B" stroke="#1E2430" stroke-width="1"></rect>
<g class="dv-cyc dv-nightk"><circle cx="10" cy="-86" r="10" fill="url(#win-g)"></circle></g><circle cx="10" cy="-86" r="3" fill="#F5C518" stroke="#1E2430" stroke-width="1.2"></circle>
</g></g>
<g transform="translate(658.8 340.2) rotate(1.5)"><g class="dv-breathe" >
<ellipse class="dv-cyc dv-shadowk" cx="22" cy="1" rx="22" ry="4" fill="#000000"></ellipse>
<ellipse class="dv-cyc dv-nightk" cx="-30" cy="1" rx="26" ry="4" fill="#000000" opacity="0.4"></ellipse>

<rect x="-17" y="-62" width="34" height="34" rx="7" fill="#C9CED6" stroke="#1E2430" stroke-width="2.5"></rect>
<rect x="-12" y="-11" width="10" height="11" rx="3" fill="#4A5366" stroke="#1E2430" stroke-width="2"></rect><rect x="2" y="-11" width="10" height="11" rx="3" fill="#4A5366" stroke="#1E2430" stroke-width="2"></rect>
<rect x="-11" y="-34" width="9" height="25" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="2"></rect><rect x="2" y="-34" width="9" height="25" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="2"></rect>
<rect x="-11" y="-24" width="9" height="4" fill="#8ED16C"></rect><rect x="2" y="-24" width="9" height="4" fill="#8ED16C"></rect>
<rect x="-14" y="-60" width="28" height="30" rx="9" fill="#F7F8F9" stroke="#1E2430" stroke-width="2.5"></rect>
<rect x="-14" y="-50" width="28" height="5" fill="#8ED16C" stroke="#1E2430" stroke-width="1.5"></rect>
<rect x="-7" y="-44" width="14" height="9" rx="2" fill="#9AA3AF" stroke="#1E2430" stroke-width="1.5"></rect><circle cx="-3" cy="-39.5" r="1.6" fill="#5CBF5A"></circle><circle class="dv-blink" cx="2" cy="-39.5" r="1.6" fill="#F26A1B"></circle>
<rect x="-21" y="-58" width="8" height="22" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="2"></rect><circle cx="-17" cy="-35" r="4.5" fill="#DDE1E6" stroke="#1E2430" stroke-width="2"></circle>
<rect x="13" y="-58" width="8" height="22" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="2"></rect>
<rect x="-22" y="-40" width="44" height="10" rx="2" fill="#7C5A3A" stroke="#1E2430" stroke-width="2"></rect>
<g class="dv-sway"><g stroke="#2F7A2C" stroke-width="2.5" stroke-linecap="round"><path d="M-14 -40 v-6 M-6 -40 v-8 M2 -40 v-6 M10 -40 v-8 M17 -40 v-5"></path></g><g fill="#5CBF5A"><circle cx="-14" cy="-47" r="2.5"></circle><circle cx="-6" cy="-49" r="2.8"></circle><circle cx="2" cy="-47" r="2.5"></circle><circle cx="10" cy="-49" r="2.8"></circle></g></g>
${zz("leo")}
<rect x="-9" y="-64" width="18" height="5" rx="2" fill="#9AA3AF" stroke="#1E2430" stroke-width="1.5"></rect>
<circle cx="0" cy="-76" r="13" fill="#F7F8F9" stroke="#1E2430" stroke-width="2.5"></circle>
<path d="M-9 -78 a9 7 0 0 1 18 0 a9 6 0 0 1 -18 0z" fill="#D9A43A" stroke="#1E2430" stroke-width="2"></path>
<path d="M-5 -81 a5 3 0 0 1 6 -2" stroke="#FFF6D8" stroke-width="2" fill="none" stroke-linecap="round"></path>
<rect x="-3" y="-91" width="6" height="4" rx="1" fill="#8ED16C" stroke="#1E2430" stroke-width="1"></rect>
<g class="dv-cyc dv-nightk"><circle cx="10" cy="-86" r="10" fill="url(#win-g)"></circle></g><circle cx="10" cy="-86" r="3" fill="#F5C518" stroke="#1E2430" stroke-width="1.2"></circle>
</g></g>
<g transform="translate(734.0 346.2) rotate(7.5)"><g class="dv-breathe" >
<ellipse class="dv-cyc dv-shadowk" cx="22" cy="1" rx="22" ry="4" fill="#000000"></ellipse>
<ellipse class="dv-cyc dv-nightk" cx="-30" cy="1" rx="26" ry="4" fill="#000000" opacity="0.4"></ellipse>
<path class="dv-sweep" d="M34 -64 L130 -24 L118 -6 Z" fill="#F5C518" opacity="0.16"></path>
<rect x="-17" y="-62" width="34" height="34" rx="7" fill="#C9CED6" stroke="#1E2430" stroke-width="2.5"></rect>
<rect x="-12" y="-11" width="10" height="11" rx="3" fill="#4A5366" stroke="#1E2430" stroke-width="2"></rect><rect x="2" y="-11" width="10" height="11" rx="3" fill="#4A5366" stroke="#1E2430" stroke-width="2"></rect>
<rect x="-11" y="-34" width="9" height="25" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="2"></rect><rect x="2" y="-34" width="9" height="25" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="2"></rect>
<rect x="-11" y="-24" width="9" height="4" fill="#B99AF5"></rect><rect x="2" y="-24" width="9" height="4" fill="#B99AF5"></rect>
<rect x="-14" y="-60" width="28" height="30" rx="9" fill="#F7F8F9" stroke="#1E2430" stroke-width="2.5"></rect>
<rect x="-14" y="-50" width="28" height="5" fill="#B99AF5" stroke="#1E2430" stroke-width="1.5"></rect>
<rect x="-7" y="-44" width="14" height="9" rx="2" fill="#9AA3AF" stroke="#1E2430" stroke-width="1.5"></rect><circle cx="-3" cy="-39.5" r="1.6" fill="#5CBF5A"></circle><circle class="dv-blink" cx="2" cy="-39.5" r="1.6" fill="#F26A1B"></circle>
<rect x="-21" y="-58" width="8" height="22" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="2"></rect><circle cx="-17" cy="-35" r="4.5" fill="#DDE1E6" stroke="#1E2430" stroke-width="2"></circle>
<g transform="rotate(-70 17 -54)"><rect x="13" y="-58" width="8" height="22" rx="4" fill="#F7F8F9" stroke="#1E2430" stroke-width="2"></rect><circle cx="17" cy="-35" r="4.5" fill="#DDE1E6" stroke="#1E2430" stroke-width="2"></circle></g>
<g transform="translate(36 -60) rotate(20)"><rect x="-6" y="-8" width="20" height="14" rx="3" fill="#4A5366" stroke="#1E2430" stroke-width="2"></rect><rect class="dv-blink" x="-3" y="-5" width="12" height="7" rx="1.5" fill="#A8F5C2"></rect></g>
${zz("zuri")}
<rect x="-9" y="-64" width="18" height="5" rx="2" fill="#9AA3AF" stroke="#1E2430" stroke-width="1.5"></rect>
<circle cx="0" cy="-76" r="13" fill="#F7F8F9" stroke="#1E2430" stroke-width="2.5"></circle>
<path d="M-9 -78 a9 7 0 0 1 18 0 a9 6 0 0 1 -18 0z" fill="#D9A43A" stroke="#1E2430" stroke-width="2"></path>
<path d="M-5 -81 a5 3 0 0 1 6 -2" stroke="#FFF6D8" stroke-width="2" fill="none" stroke-linecap="round"></path>
<rect x="-3" y="-91" width="6" height="4" rx="1" fill="#B99AF5" stroke="#1E2430" stroke-width="1"></rect>
<g class="dv-cyc dv-nightk"><circle cx="10" cy="-86" r="10" fill="url(#win-g)"></circle></g><circle cx="10" cy="-86" r="3" fill="#F5C518" stroke="#1E2430" stroke-width="1.2"></circle>
</g></g>
</svg>`;
}
