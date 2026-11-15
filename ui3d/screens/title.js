// Title screen, ported from Main.dc.html.
const KEY = "font-family: inherit; cursor: pointer; border: 3px solid #1E2430; border-radius: 16px; color: #1E2430;";

export function mount(root, ctx) {
  root.innerHTML = `<div style="width: 1280px; height: 800px; position: relative; overflow: hidden; background: #0E1424; font-family: Lexend, system-ui, sans-serif; color: #F3F4F6">
<svg aria-hidden="true" width="1280" height="800" viewBox="0 0 1280 800" style="position: absolute; left: 0; top: 0">
<g fill="#F3F4F6">
<circle class="dv-twinkle" cx="40" cy="60" r="1.4" opacity="0.6"></circle><circle class="dv-twinkle-b" cx="120" cy="30" r="1" opacity="0.4"></circle><circle class="dv-twinkle" cx="210" cy="90" r="1.8" opacity="0.7"></circle><circle class="dv-twinkle-b" cx="330" cy="40" r="1.1" opacity="0.5"></circle><circle class="dv-twinkle" cx="460" cy="70" r="1.4" opacity="0.6"></circle><circle class="dv-twinkle-b" cx="610" cy="34" r="2" opacity="0.8"></circle><circle class="dv-twinkle" cx="700" cy="110" r="1" opacity="0.4"></circle><circle class="dv-twinkle-b" cx="820" cy="52" r="1.3" opacity="0.5"></circle><circle class="dv-twinkle" cx="930" cy="96" r="1" opacity="0.4"></circle><circle class="dv-twinkle-b" cx="1010" cy="28" r="1.7" opacity="0.7"></circle><circle class="dv-twinkle" cx="1120" cy="74" r="1.1" opacity="0.5"></circle><circle class="dv-twinkle-b" cx="1230" cy="44" r="1.5" opacity="0.6"></circle><circle class="dv-twinkle" cx="1250" cy="160" r="1" opacity="0.4"></circle><circle class="dv-twinkle-b" cx="30" cy="250" r="1.2" opacity="0.5"></circle><circle class="dv-twinkle" cx="610" cy="200" r="1" opacity="0.3"></circle><circle class="dv-twinkle-b" cx="1200" cy="300" r="1.3" opacity="0.5"></circle><circle class="dv-twinkle" cx="20" cy="470" r="1" opacity="0.4"></circle><circle class="dv-twinkle-b" cx="620" cy="520" r="1.2" opacity="0.4"></circle><circle class="dv-twinkle" cx="1240" cy="470" r="1" opacity="0.4"></circle>
</g>
<path d="M0 720 C160 700 300 712 460 704 C640 694 820 716 1000 704 C1120 696 1210 706 1280 700 L1280 800 L0 800Z" fill="#1B2440"></path>
<path d="M0 752 C220 738 420 760 680 746 C900 734 1080 756 1280 744 L1280 800 L0 800Z" fill="#232E50"></path>
<ellipse cx="380" cy="772" rx="70" ry="9" fill="#1B2440"></ellipse><path d="M310 772 a70 9 0 0 1 140 0" fill="none" stroke="#2F3C66" stroke-width="2"></path>
<ellipse cx="1060" cy="780" rx="90" ry="10" fill="#1B2440"></ellipse><path d="M970 780 a90 10 0 0 1 180 0" fill="none" stroke="#2F3C66" stroke-width="2"></path>
<g transform="translate(1180 690)"><path d="M0 14 a12 12 0 0 1 24 0z" fill="#2F3C66"></path><circle cx="12" cy="8" r="2" fill="#F5C518"></circle><rect x="30" y="-10" width="2" height="24" fill="#2F3C66"></rect><circle class="dv-blink-b" cx="31" cy="-12" r="2" fill="#F26A1B"></circle></g>
</svg>

<svg class="dv-zoom" role="img" aria-label="Delta-V 26 mission patch. A base on the Moon near Shackleton crater, with a dome, greenhouse, solar tower, rover and three astronauts. Earth, Mars and the Sun are in the sky, and a supply ship flies toward the base. Three stars stand for the three crew." width="520" height="520" viewBox="0 0 520 520" style="position: absolute; left: 64px; top: 140px">
<defs>
<path id="dv-top" d="M70 260 a190 190 0 0 1 380 0"></path>
<path id="dv-bot" d="M42 260 a218 218 0 0 0 436 0"></path>
<clipPath id="dv-in"><circle cx="260" cy="260" r="164"></circle></clipPath>
</defs>
<circle cx="260" cy="260" r="256" fill="#0A0F1C" opacity="0.5"></circle>
<circle cx="260" cy="260" r="250" fill="#1E2430"></circle>
<circle class="dv-spin" cx="260" cy="260" r="244" fill="none" stroke="#3A4458" stroke-width="12" stroke-dasharray="1.4 2.2"></circle>
<circle cx="260" cy="260" r="236" fill="#F26A1B"></circle>
<g fill="none" stroke="#C9540F" stroke-width="1.2" stroke-dasharray="3 2.5" opacity="0.6">
<circle cx="260" cy="260" r="230"></circle><circle cx="260" cy="260" r="222"></circle><circle cx="260" cy="260" r="214"></circle><circle cx="260" cy="260" r="206"></circle><circle cx="260" cy="260" r="198"></circle><circle cx="260" cy="260" r="190"></circle><circle cx="260" cy="260" r="182"></circle>
</g>
<circle cx="260" cy="260" r="233" fill="none" stroke="#1E2430" stroke-width="2" stroke-dasharray="6 4"></circle>
<text font-family="Lexend" font-weight="800" font-size="40" fill="#1E2430" letter-spacing="7"><textPath href="#dv-top" startOffset="50%" text-anchor="middle">DELTA-V 26</textPath></text>
<text font-family="Lexend" font-weight="700" font-size="22" fill="#1E2430" letter-spacing="3"><textPath href="#dv-bot" startOffset="50%" text-anchor="middle">JUNIOR ASTRONAUT TRAINER</textPath></text>
<g fill="#1E2430"><path d="m56 248 3.5 7.5 8 1-6 5.5 1.6 8L56 266l-7 4 1.5-8-6-5.5 8-1z"></path><path d="m464 248 3.5 7.5 8 1-6 5.5 1.6 8L464 266l-7 4 1.5-8-6-5.5 8-1z"></path></g>
<circle cx="260" cy="260" r="174" fill="#1E2430"></circle>

<g clip-path="url(#dv-in)">
<rect x="90" y="90" width="340" height="340" fill="#1A2650"></rect>
<g fill="#F3F4F6"><circle class="dv-twinkle-b" cx="130" cy="230" r="1.2"></circle><circle class="dv-twinkle" cx="186" cy="118" r="1"></circle><circle class="dv-twinkle-b" cx="232" cy="200" r="1.4"></circle><circle class="dv-twinkle" cx="290" cy="112" r="1.1"></circle><circle class="dv-twinkle-b" cx="300" cy="210" r="0.9"></circle><circle class="dv-twinkle" cx="404" cy="250" r="1.2"></circle><circle class="dv-twinkle-b" cx="120" cy="190" r="0.9"></circle><circle class="dv-twinkle" cx="248" cy="246" r="1"></circle><circle class="dv-twinkle-b" cx="352" cy="232" r="0.9"></circle></g>
<g transform="translate(150 158)">
<g class="dv-spin-fast" stroke="#F5C518" stroke-width="3.5" stroke-linecap="round"><path d="M0 -30v-8M0 30v8M-30 0h-8M30 0h8M-21 -21l-6 -6M21 21l6 6M-21 21l-6 6M21 -21l6 -6"></path></g>
<circle r="22" fill="#F5C518" stroke="#1E2430" stroke-width="3"></circle>
<circle r="14" fill="none" stroke="#F9DC6A" stroke-width="2" stroke-dasharray="3 3"></circle>
<path class="dv-glow" d="M14 -16 C30 -32 46 -18 34 -2" fill="none" stroke="#F26A1B" stroke-width="4" stroke-linecap="round"></path>
</g>
<g class="dv-bob" transform="translate(362 150)">
<circle r="36" fill="#3D7BD9" stroke="#1E2430" stroke-width="3"></circle>
<path d="M-26 -14 C-16 -24 -2 -20 0 -10 C2 0 -8 2 -10 10 C-12 18 -22 14 -26 6 C-30 0 -30 -8 -26 -14Z" fill="#5CBF5A"></path>
<path d="M8 -28 C18 -26 24 -18 20 -10 C16 -4 8 -8 6 -14 C4 -20 4 -26 8 -28Z" fill="#5CBF5A"></path>
<path d="M6 14 C14 10 24 14 22 22 C18 28 8 28 6 22Z" fill="#5CBF5A"></path>
<g fill="none" stroke="#F3F4F6" stroke-width="2.5" stroke-linecap="round" opacity="0.9"><path d="M-30 -2 C-20 -6 -10 -2 -2 -4"></path><path d="M-6 28 C4 24 14 30 24 26"></path><path d="M10 -2 C18 -6 26 -2 32 -6"></path></g>
<path d="M4 -36 A36 36 0 0 1 4 36 A28 36 0 0 0 4 -36Z" fill="#0E1424" opacity="0.45"></path>
<circle r="36" fill="none" stroke="#1E2430" stroke-width="3"></circle>
</g>
<g transform="translate(404 222)"><circle r="10" fill="#D2693C" stroke="#1E2430" stroke-width="2.5"></circle><path d="M-6 -6 a10 10 0 0 1 12 0 a14 8 0 0 1 -12 0z" fill="#F3F4F6"></path><circle cx="3" cy="3" r="2.5" fill="#A4471F"></circle></g>
<path d="M336 182 C310 214 300 250 276 292" fill="none" stroke="#F3F4F6" stroke-width="2" stroke-dasharray="3 6" stroke-linecap="round"></path>
<g class="dv-orbit" transform="translate(306 236) rotate(28)"><path d="M0 -12 C5 -8 6 -2 6 6 L-6 6 C-6 -2 -5 -8 0 -12Z" fill="#F3F4F6" stroke="#1E2430" stroke-width="2"></path><path d="M-3 6 L0 14 L3 6Z" fill="#F26A1B"></path><path d="M-6 2 l-4 6 4-1zM6 2 l4 6-4-1z" fill="#F26A1B"></path></g>
<g class="dv-blink" fill="none" stroke="#F5C518" stroke-width="2" stroke-linecap="round"><path d="M318 212 l5 4 5-4"></path><path d="M316 220 l5 4 5-4"></path></g>

<path d="M90 300 C120 290 150 296 180 288 C210 280 236 286 262 280 L300 272 C330 270 352 282 380 278 C400 276 418 282 430 280 L430 430 L90 430Z" fill="#8D93A3"></path>
<path d="M250 290 C280 280 330 280 372 290 C352 300 290 302 250 290Z" fill="#2A3048"></path>
<g class="dv-twinkle" fill="#8FD9F0"><circle cx="290" cy="292" r="1.6"></circle><circle cx="318" cy="290" r="1.2"></circle><circle cx="344" cy="293" r="1.6"></circle></g>
<path d="M90 324 C140 312 190 320 240 314 C300 306 360 318 430 310 L430 430 L90 430Z" fill="#B3B8C5"></path>
<path d="M90 362 C150 350 220 360 280 354 C340 348 390 360 430 354 L430 430 L90 430Z" fill="#CDD0D9"></path>
<g><ellipse cx="140" cy="400" rx="26" ry="6" fill="#9CA1B0"></ellipse><path d="M114 400 a26 6 0 0 1 52 0" fill="none" stroke="#E6E8EE" stroke-width="2"></path></g>
<g><ellipse cx="372" cy="392" rx="34" ry="7" fill="#9CA1B0"></ellipse><path d="M338 392 a34 7 0 0 1 68 0" fill="none" stroke="#E6E8EE" stroke-width="2"></path></g>
<g><ellipse cx="260" cy="410" rx="12" ry="3" fill="#9CA1B0"></ellipse></g>
<g><ellipse cx="400" cy="330" rx="14" ry="3" fill="#9CA1B0"></ellipse></g>

<g transform="translate(0 0)">
<path d="M162 386 C200 380 236 372 262 352" fill="none" stroke="#9CA1B0" stroke-width="2" stroke-dasharray="2 3"></path>
<path d="M166 392 C204 386 240 378 266 358" fill="none" stroke="#9CA1B0" stroke-width="2" stroke-dasharray="2 3"></path>
<g transform="translate(148 376)"><rect x="-12" y="-8" width="26" height="10" rx="3" fill="#F7F8F9" stroke="#1E2430" stroke-width="2"></rect><rect x="-6" y="-14" width="12" height="7" rx="2" fill="#4BA3F0" stroke="#1E2430" stroke-width="2"></rect><circle cx="-7" cy="4" r="4" fill="#1E2430"></circle><circle cx="9" cy="4" r="4" fill="#1E2430"></circle><path d="M10 -8 v-8" stroke="#1E2430" stroke-width="1.5"></path><circle class="dv-blink" cx="10" cy="-17" r="1.6" fill="#F26A1B"></circle></g>
</g>

<g transform="translate(196 300)">
<rect x="-8" y="40" width="160" height="14" rx="2" fill="#9CA1B0"></rect>
<path d="M0 44 a38 38 0 0 1 76 0z" fill="#F7F8F9" stroke="#1E2430" stroke-width="3"></path>
<clipPath id="dv-dome"><path d="M0 44 a38 38 0 0 1 76 0z"></path></clipPath>
<g clip-path="url(#dv-dome)" stroke="#B3B8C5" stroke-width="3"><path d="M-4 18h84M-4 26h84M-4 34h84"></path></g>
<path d="M0 44 a38 38 0 0 1 76 0z" fill="none" stroke="#1E2430" stroke-width="3"></path>
<circle cx="38" cy="26" r="5" fill="#F5C518" stroke="#1E2430" stroke-width="2"></circle>
<rect x="74" y="32" width="16" height="12" fill="#DDE1E6" stroke="#1E2430" stroke-width="2.5"></rect>
<path d="M88 44 a26 26 0 0 1 52 0z" fill="#DDF3D8" stroke="#1E2430" stroke-width="3"></path>
<path d="M98 44 v-8 M106 44 v-12 M114 44 v-14 M122 44 v-12 M130 44 v-8" stroke="#2F7A2C" stroke-width="2.5" stroke-linecap="round"></path>
<rect x="-30" y="34" width="12" height="10" rx="2" fill="#DDE1E6" stroke="#1E2430" stroke-width="2"></rect>
<path d="M-24 34 v-12" stroke="#1E2430" stroke-width="2"></path><path d="M-34 16 a10 6 0 0 0 20 0z" fill="#F7F8F9" stroke="#1E2430" stroke-width="2"></path>
</g>
<g transform="translate(372 280)">
<rect x="-2.5" y="0" width="5" height="70" fill="#F7F8F9" stroke="#1E2430" stroke-width="2"></rect>
<g transform="rotate(-14)"><rect x="-32" y="-14" width="64" height="18" fill="#D9A43A" stroke="#1E2430" stroke-width="3"></rect><path d="M-20 -14v18M-8 -14v18M4 -14v18M16 -14v18M-32 -5h64" stroke="#1E2430" stroke-width="1.5"></path></g>
<path d="M-14 70 L0 60 L14 70" fill="none" stroke="#1E2430" stroke-width="2"></path>
</g>
<g class="dv-breathe" transform="translate(184 340)"><circle cx="0" cy="-10" r="4" fill="#F79A6B" stroke="#1E2430" stroke-width="1.5"></circle><rect x="-3.5" y="-6" width="7" height="9" rx="2" fill="#F79A6B" stroke="#1E2430" stroke-width="1.5"></rect></g>
<g class="dv-breathe" transform="translate(298 346)"><circle cx="0" cy="-10" r="4" fill="#8ED16C" stroke="#1E2430" stroke-width="1.5"></circle><rect x="-3.5" y="-6" width="7" height="9" rx="2" fill="#8ED16C" stroke="#1E2430" stroke-width="1.5"></rect></g>
<g class="dv-breathe" transform="translate(330 370)"><circle cx="0" cy="-10" r="4" fill="#B99AF5" stroke="#1E2430" stroke-width="1.5"></circle><rect x="-3.5" y="-6" width="7" height="9" rx="2" fill="#B99AF5" stroke="#1E2430" stroke-width="1.5"></rect><path d="M4 -4 l8 -6" stroke="#1E2430" stroke-width="1.5"></path></g>
</g>
<circle cx="260" cy="260" r="168" fill="none" stroke="#F3F4F6" stroke-width="2" stroke-dasharray="5 4" opacity="0.8"></circle>

<g stroke="#1E2430" stroke-width="2.5" stroke-linejoin="round">
<path d="m214 104 5 10.5 11.5 1.6-8.3 8 2 11.4L214 130l-10.2 5.5 2-11.4-8.3-8 11.5-1.6z" fill="#F79A6B"></path>
<path d="m260 96 5.5 11.5 12.5 1.8-9 8.7 2.1 12.4L260 124.5l-11.1 5.9 2.1-12.4-9-8.7 12.5-1.8z" fill="#8ED16C"></path>
<path d="m306 104 5 10.5 11.5 1.6-8.3 8 2 11.4L306 130l-10.2 5.5 2-11.4-8.3-8 11.5-1.6z" fill="#B99AF5"></path>
</g>
</svg>
<div style="position: absolute; left: 660px; top: 150px; width: 560px; display: flex; flex-direction: column; gap: 22px">
<h1 class="dv-rise dv-d2" style="margin: 0; font-weight: 800; font-size: 104px; line-height: 0.95; letter-spacing: -0.03em">Delta-V 26</h1>
<p class="dv-rise dv-d3" style="margin: 0; font-weight: 500; font-size: 26px; line-height: 1.4; color: #C9D2E3">Lead three astronauts for 30 days on the Moon or Mars. Every choice costs something.</p>
<div class="dv-rise dv-d4" style="display: flex; gap: 20px; margin-top: 8px">
<button type="button" id="t-start" class="dv-key" style="${KEY} display: inline-flex; align-items: center; gap: 12px; padding: 20px 36px; background: #F26A1B; box-shadow: 0 7px 0 #8E3A0B; font-weight: 800; font-size: 28px">Start mission</button>
<button type="button" id="t-how" class="dv-key" style="${KEY} display: inline-flex; align-items: center; padding: 20px 30px; background: #EEF0F2; box-shadow: 0 7px 0 #7C8592; font-weight: 700; font-size: 24px">How to play</button>
</div>
<div class="dv-rise dv-d5" style="display: flex; align-items: center; gap: 16px; margin-top: 18px">
<div style="display: flex">
<svg aria-hidden="true" width="52" height="52" viewBox="0 0 84 84"><circle cx="42" cy="42" r="39" fill="#F79A6B" stroke="#1E2430" stroke-width="5"></circle><rect x="16" y="24" width="52" height="34" rx="17" fill="#1E2430"></rect><path d="M25 33h12" stroke="#8FD9F0" stroke-width="5" stroke-linecap="round"></path></svg>
<svg aria-hidden="true" width="52" height="52" viewBox="0 0 84 84" style="margin-left: -12px"><circle cx="42" cy="42" r="39" fill="#8ED16C" stroke="#1E2430" stroke-width="5"></circle><rect x="16" y="24" width="52" height="34" rx="17" fill="#1E2430"></rect><path d="M25 33h12" stroke="#8FD9F0" stroke-width="5" stroke-linecap="round"></path></svg>
<svg aria-hidden="true" width="52" height="52" viewBox="0 0 84 84" style="margin-left: -12px"><circle cx="42" cy="42" r="39" fill="#B99AF5" stroke="#1E2430" stroke-width="5"></circle><rect x="16" y="24" width="52" height="34" rx="17" fill="#1E2430"></rect><path d="M25 33h12" stroke="#8FD9F0" stroke-width="5" stroke-linecap="round"></path></svg>
</div>
<p style="margin: 0; font-size: 18px; line-height: 1.4; color: #C9D2E3">Maya, Leo and Zuri are ready.<br>They're waiting for their Commander.</p>
</div>
</div>

<div class="dv-rise dv-d6" style="position: absolute; left: 660px; bottom: 44px; width: 540px; box-sizing: border-box; padding: 16px 20px; border-radius: 14px; background: #13211D; box-shadow: inset 0 0 0 4px #2B3833; color: #A8F5C2; display: flex; gap: 16px; align-items: center">
<svg class="dv-spin" aria-hidden="true" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#F5C518" stroke-width="2" stroke-linecap="round" style="flex-shrink: 0"><circle cx="12" cy="12" r="4.5"></circle><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"></path></svg>
<p style="margin: 0; font-size: 16px; line-height: 1.5">The Sun in this game is real. You will live through real solar flares recorded by NASA's DONKI database, day by day. <span style="color: #7FA894">Made for NASA Space Apps 2026.</span></p>
</div>
</div>`;

  root.querySelector("#t-start").addEventListener("click", () => { ctx.sfx("click"); ctx.go("choose"); });
  // "How to play" starts a real practice mission on the Moon with the interactive tour switched on.
  root.querySelector("#t-how").addEventListener("click", async () => {
    ctx.sfx("click");
    ctx.store.tutorial = true;
    await ctx.startGame("moon", "recent");
    ctx.go("game");
  });
}
