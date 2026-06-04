import { DragInsertType } from '@/d.ts';
import { generateRedisCopyText } from './redis';

describe('redis copy text', () => {
  test('generates scan statement', () => {
    expect(generateRedisCopyText('user', DragInsertType.SELECT)).toBe(
      'SCAN 0 MATCH user:* COUNT 100'
    );
  });

  test('generates write statements', () => {
    expect(generateRedisCopyText('user:1', DragInsertType.INSERT)).toBe(
      'SET user:1 ${1:value}'
    );
    expect(generateRedisCopyText('user:1', DragInsertType.UPDATE)).toBe(
      'SET user:1 ${1:value}'
    );
    expect(generateRedisCopyText('user:1', DragInsertType.DELETE)).toBe(
      'DEL user:1'
    );
  });
});
