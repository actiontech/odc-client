import { DragInsertType } from '@/d.ts';
import { generateMongoCopyText } from './mongodb';

describe('mongodb copy text', () => {
  test('generates find statement', () => {
    expect(
      generateMongoCopyText('test_items', DragInsertType.SELECT, [
        '_id',
        'name',
        'qty',
        'status'
      ])
    ).toBe('db.test_items.find({})');
  });

  test('generates insertOne with fields', () => {
    expect(
      generateMongoCopyText('test_items', DragInsertType.INSERT, [
        '_id',
        'name',
        'qty',
        'status'
      ])
    ).toBe(
      'db.test_items.insertOne({ _id: ${1:expr}, name: ${2:expr}, qty: ${3:expr}, status: ${4:expr} })'
    );
  });

  test('generates updateOne and deleteOne', () => {
    expect(generateMongoCopyText('test_items', DragInsertType.UPDATE)).toBe(
      'db.test_items.updateOne({ ${1:filter} }, { $set: { ${2:field: value} } })'
    );
    expect(generateMongoCopyText('test_items', DragInsertType.DELETE)).toBe(
      'db.test_items.deleteOne({ ${1:filter} })'
    );
  });
});
