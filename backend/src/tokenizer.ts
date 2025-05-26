export function tokenize(content: string): string[] {
  // Basic tokenization: lowercase, remove punctuation, split by whitespace
  return content
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 0);
}