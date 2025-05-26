import { CodeIndexer } from '../indexer';
import { writeFileSync, unlinkSync } from 'fs';

describe('CodeIndexer', () => {
  let indexer: CodeIndexer;
  const testFile = 'test.js';

  beforeEach(() => {
    indexer = new CodeIndexer();
    writeFileSync(testFile, 'function hello() { console.log("Hello World"); }');
  });

  afterEach(() => {
    unlinkSync(testFile);
  });

  test('should index a file correctly', () => {
    indexer.indexFile('test.js', testFile);
    const results = indexer.search('hello');
    expect(results).toHaveLength(1);
    expect(results[0].docId).toBe('test.js');
    expect(results[0].score).toBeGreaterThan(0);
  });

  test('should return empty results for non-existent term', () => {
    indexer.indexFile('test.js', testFile);
    const results = indexer.search('nonexistent');
    expect(results).toHaveLength(0);
  });
});