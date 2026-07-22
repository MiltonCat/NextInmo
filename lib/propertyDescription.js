const EMOJI_RULES = [
  { pattern: /(bosque|monta|naturaleza|verde|parque|vista|lago|cerro|patagonia)/i, emoji: "🌿" },
  { pattern: /(centro|ubicaci|cerca|acceso|comercios|servicios)/i, emoji: "📍" },
  { pattern: /(inversi|roi|rinde|rentabil|oportunidad|valor)/i, emoji: "📈" },
  { pattern: /(luz|luminos|ventanal|solead|abierto|aire)/i, emoji: "✨" },
  { pattern: /(familia|hogar|casa|vivir|tranquil|confort|comodidad)/i, emoji: "🏡" },
  { pattern: /(dormitorio|habitación|monoambiente|departamento|ph|cabañ|cabaña)/i, emoji: "🏠" },
];

function normalizeText(value) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

export function splitPropertyDescription(description) {
  const text = normalizeText(description);
  if (!text) return [];

  const explicitParagraphs = text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (explicitParagraphs.length > 1) {
    return explicitParagraphs;
  }

  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (sentences.length <= 2) {
    return [text];
  }

  const paragraphs = [];
  let current = [];
  let currentLength = 0;

  for (const sentence of sentences) {
    const sentenceLength = sentence.length;
    const shouldSplit = current.length >= 2 || currentLength + sentenceLength > 220;

    if (current.length > 0 && shouldSplit) {
      paragraphs.push(current.join(" "));
      current = [sentence];
      currentLength = sentenceLength;
      continue;
    }

    current.push(sentence);
    currentLength += sentenceLength + 1;
  }

  if (current.length > 0) {
    paragraphs.push(current.join(" "));
  }

  return paragraphs.filter(Boolean);
}

export function getPropertyDescriptionEmoji(paragraph, type = "") {
  const haystack = `${paragraph} ${type}`;
  const found = EMOJI_RULES.find(({ pattern }) => pattern.test(haystack));
  if (found) return found.emoji;

  if (/alquil/i.test(haystack)) return "🔑";
  if (/venta|precio|valor/i.test(haystack)) return "💎";
  return "✦";
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildPropertyDescriptionHtml(description, type = "") {
  return splitPropertyDescription(description)
    .map((paragraph) => {
      const emoji = getPropertyDescriptionEmoji(paragraph, type);
      return `
        <div class="desc-paragraph">
          <span class="desc-emoji" aria-hidden="true">${emoji}</span>
          <p>${escapeHtml(paragraph)}</p>
        </div>
      `;
    })
    .join("");
}
