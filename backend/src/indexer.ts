import { readFileSync } from 'fs';
import { tokenize } from './tokenizer';

// Inverted index structure
interface InvertedIndex {
  [term: string]: { [docId: string]: number[] };
}

export class CodeIndexer {
  private index: InvertedIndex = {};
  private docLengths: { [docId: string]: number } = {};
  private totalDocs: number = 0;
  private avgDocLength: number = 0;
  private k1: number = 1.2;
  private b: number = 0.75;

  // Index a code file
  indexFile(docId: string, filePath: string): void {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const tokens = tokenize(content);
      this.docLengths[docId] = tokens.length;
      this.totalDocs++;
      this.avgDocLength = Object.values(this.docLengths).reduce((sum, len) => sum + len, 0) / this.totalDocs;

      tokens.forEach((term, pos) => {
        if (!this.index[term]) {
          this.index[term] = {};
        }
        if (!this.index[term][docId]) {
          this.index[term][docId] = [];
        }
        this.index[term][docId].push(pos);
      });
    } catch (error: any) {
      throw new Error(`Failed to index ${filePath}: ${error.message || 'Unknown error'}`);
    }
  }

  // BM25 ranking
  search(query: string): { docId: string; score: number }[] {
    const queryTerms = tokenize(query);
    const scores: { [docId: string]: number } = {};

    queryTerms.forEach((term) => {
      if (this.index[term]) {
        const docs = this.index[term];
        const idf = Math.log((this.totalDocs - Object.keys(docs).length + 0.5) / (Object.keys(docs).length + 0.5) + 1);

        for (const docId in docs) {
          const tf = docs[docId].length;
          const docLen = this.docLengths[docId];
          const numerator = tf * (this.k1 + 1);
          const denominator = tf + this.k1 * (1 - this.b + this.b * (docLen / this.avgDocLength));
          scores[docId] = scores[docId] || 0;
          scores[docId] += idf * (numerator / denominator);
        }
      }
    });

    return Object.entries(scores)
      .map(([docId, score]) => ({ docId, score }))
      .sort((a, b) => b.score - a.score);
  }
}