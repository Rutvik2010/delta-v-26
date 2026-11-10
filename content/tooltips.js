// content/tooltips.js - Glossary tooltip helper for Delta-V 26

let termsCache = null;

const DEFAULT_TERMS = {
  "radiation": "Invisible energy rays and high-speed particles from the Sun and deep space that can harm human bodies and sensitive electronic circuits.",
  "sol": "A solar day on Mars, lasting 24 hours, 39 minutes, and 35 seconds, which is just slightly longer than an Earth day.",
  "solar flare": "A sudden, powerful flash of electromagnetic energy and radiation ejected from the surface of the Sun.",
  "shielding": "Protective barriers made of dense materials like regolith or water that absorb harmful radiation and stop micrometeoroids.",
  "comm delay": "The lag time required for radio communication signals travelling at the speed of light to cross the vast space between Earth and other worlds.",
  "microgravity": "The state of apparent weightlessness experienced by astronauts and spacecraft when they are in free fall in orbit."
};

/**
 * Loads terms from content/terms.json with fallback
 * @returns {Promise<Record<string, string>>}
 */
async function getTerms() {
  if (termsCache) return termsCache;
  try {
    const res = await fetch('content/terms.json');
    if (res.ok) {
      termsCache = await res.json();
      return termsCache;
    }
  } catch (err) {
    // Return fallback terms
  }
  termsCache = DEFAULT_TERMS;
  return termsCache;
}

/**
 * Injects glossary tooltip styles into document head
 */
function ensureTooltipStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('glossary-tooltip-styles')) return;

  const style = document.createElement('style');
  style.id = 'glossary-tooltip-styles';
  style.textContent = `
    .glossary-term {
      text-decoration: underline dotted #00d2ff;
      text-underline-offset: 4px;
      cursor: pointer;
      color: #7ee0ff;
      font-weight: 600;
      transition: color 0.15s ease;
      touch-action: manipulation;
    }
    .glossary-term:hover, .glossary-term:focus {
      color: #ffd15c;
      text-decoration-style: solid;
      outline: none;
    }
    .glossary-popup-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 9999;
      animation: tooltipFadeIn 0.15s ease-out;
    }
    .glossary-popup-card {
      background: #141b2d;
      border: 2px solid #00d2ff;
      border-radius: 12px;
      padding: 20px;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.8);
      position: relative;
    }
    .glossary-popup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .glossary-popup-title {
      font-size: 20px;
      font-weight: 800;
      color: #ffd15c;
      text-transform: capitalize;
    }
    .glossary-popup-close {
      background: #1e293b;
      border: 1px solid #2a3b5c;
      color: #f0f4fc;
      border-radius: 6px;
      width: 38px;
      height: 38px;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .glossary-popup-close:hover {
      background: #ff4b5c;
      color: #ffffff;
    }
    .glossary-popup-def {
      font-size: 16px;
      line-height: 1.5;
      color: #f0f4fc;
    }
    @keyframes tooltipFadeIn {
      from { opacity: 0; transform: scale(0.96); }
      to { opacity: 1; transform: scale(1); }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Shows the popup modal for a specific glossary term
 * @param {string} term
 * @param {string} definition
 */
function showPopup(term, definition) {
  // Remove any existing popup
  closePopup();

  const overlay = document.createElement('div');
  overlay.className = 'glossary-popup-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', `Definition for ${term}`);

  overlay.innerHTML = `
    <div class="glossary-popup-card" onclick="event.stopPropagation()">
      <div class="glossary-popup-header">
        <span class="glossary-popup-title">${term}</span>
        <button class="glossary-popup-close" aria-label="Close definition">&times;</button>
      </div>
      <p class="glossary-popup-def">${definition}</p>
    </div>
  `;

  const closeBtn = overlay.querySelector('.glossary-popup-close');
  closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', closePopup);

  document.body.appendChild(overlay);
  closeBtn.focus();
}

/**
 * Closes the active glossary popup
 */
function closePopup() {
  const existing = document.querySelector('.glossary-popup-overlay');
  if (existing) {
    existing.remove();
  }
}

/**
 * Scans rootEl, underlines glossary terms, and sets up tap-to-popup handlers.
 * @param {HTMLElement} rootEl
 */
export async function addTooltips(rootEl) {
  if (!rootEl) return;
  ensureTooltipStyles();
  const terms = await getTerms();

  // Sort terms by length descending so phrases like "solar flare" match before "solar"
  const termKeys = Object.keys(terms).sort((a, b) => b.length - a.length);
  if (termKeys.length === 0) return;

  // Build regex matching any of the term keys (e.g. \b(radiation|solar flare|sol|...)\b)
  const pattern = new RegExp(`\\b(${termKeys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(s)?\\b`, 'gi');

  // Traverse text nodes
  const walker = document.createTreeWalker(
    rootEl,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName.toLowerCase();
        if (['script', 'style', 'button', 'input', 'textarea', 'select'].includes(tag)) {
          return NodeFilter.FILTER_REJECT;
        }
        if (parent.closest('.glossary-term') || parent.closest('.modal-content') || parent.closest('.glossary-popup-card')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  for (const node of textNodes) {
    const text = node.nodeValue;
    if (pattern.test(text)) {
      pattern.lastIndex = 0; // reset regex index
      const span = document.createElement('span');
      span.innerHTML = text.replace(pattern, (match, baseTerm) => {
        const canonicalKey = baseTerm.toLowerCase();
        return `<span class="glossary-term" data-term="${canonicalKey}" tabindex="0" role="button" aria-haspopup="dialog">${match}</span>`;
      });
      node.parentNode.replaceChild(span, node);
    }
  }

  // Attach event listeners to all newly added terms
  rootEl.querySelectorAll('.glossary-term').forEach(el => {
    const termKey = el.getAttribute('data-term');
    const definition = terms[termKey] || DEFAULT_TERMS[termKey] || 'Glossary definition unavailable.';

    const handler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      showPopup(termKey, definition);
    };

    el.addEventListener('click', handler);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handler(e);
      }
    });
  });
}

export default { addTooltips };
