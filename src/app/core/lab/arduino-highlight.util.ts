const KEYWORDS = [
  'void',
  'setup',
  'loop',
  'digitalWrite',
  'digitalRead',
  'analogWrite',
  'pinMode',
  'delay',
  'int',
  'const'
] as const;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Resaltado básico Arduino para overlay del IDE. */
export function highlightArduinoCode(source: string): string {
  return source
    .split('\n')
    .map((line) => {
      const commentIdx = line.indexOf('//');
      let codePart = line;
      let commentPart = '';

      if (commentIdx >= 0) {
        codePart = line.slice(0, commentIdx);
        commentPart = line.slice(commentIdx);
      }

      let html = escapeHtml(codePart);

      for (const kw of KEYWORDS) {
        const re = new RegExp(`\\b${kw}\\b`, 'g');
        html = html.replace(re, `<span class="c-keyword">${kw}</span>`);
      }

      if (commentPart) {
        html += `<span class="c-comment">${escapeHtml(commentPart)}</span>`;
      }

      return html.length ? html : '&nbsp;';
    })
    .join('\n');
}

export const DEFAULT_ARDUINO_SKETCH = `void setup() {
  pinMode(2, INPUT);
  pinMode(3, INPUT);
  pinMode(4, OUTPUT);
  pinMode(5, OUTPUT);
}

void loop() {
  int left = digitalRead(2);
  int right = digitalRead(3);

  if (left == LOW && right == LOW) {
    digitalWrite(4, HIGH);
    digitalWrite(5, HIGH);
  } else if (left == LOW) {
    digitalWrite(4, LOW);
    digitalWrite(5, HIGH);
  } else if (right == LOW) {
    digitalWrite(4, HIGH);
    digitalWrite(5, LOW);
  } else {
    digitalWrite(4, LOW);
    digitalWrite(5, LOW);
  }

  delay(50);
}
`;
