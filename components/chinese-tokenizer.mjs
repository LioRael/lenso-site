// The index and browser share deterministic Han bigrams. English's default
// whitespace tokenizer cannot find a Chinese word inside a longer sentence.
export function createChineseTokenizer() {
  return {
    language: "chinese",
    normalizationCache: new Map(),
    tokenize(raw) {
      const tokens = new Set();
      for (const word of raw.normalize("NFKC").toLowerCase().match(/[\p{Script=Han}]+|[\p{L}\p{N}_]+/gu) ?? []) {
        if (!/\p{Script=Han}/u.test(word)) {
          tokens.add(word);
          continue;
        }
        const characters = Array.from(word);
        for (const [index, character] of characters.entries()) {
          tokens.add(character);
          if (index + 1 < characters.length) tokens.add(character + characters[index + 1]);
        }
      }
      return [...tokens];
    },
  };
}
