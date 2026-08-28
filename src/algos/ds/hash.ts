import type { AlgorithmDef, AlgorithmInput, Step, TableCell } from '../../core/types';
import { registerAlgorithm } from '../../core/registry';
import { makeTableStep, tableCell, tableRead, tableResult, tableCompute } from './helpers';

const pseudocode = [
  { text: 'procedure hashTable(entries)', indent: 0 },
  { text: 'table = array of size 10', indent: 1 },
  { text: 'for each (key, value) in entries', indent: 1, isLoopHeader: true, loopLabel: 'insert' },
  { text: 'index = hash(key) mod 10', indent: 2 },
  { text: 'while table[index] occupied', indent: 2, isLoopHeader: true, loopLabel: 'probe' },
  { text: 'if table[index].key == key', indent: 3 },
  { text: 'update value', indent: 4 },
  { text: 'return', indent: 4 },
  { text: 'end if', indent: 3 },
  { text: 'index = (index + 1) mod 10', indent: 3 },
  { text: 'end while', indent: 2 },
  { text: 'table[index] = (key, value)', indent: 2 },
  { text: 'end for', indent: 1 },
  { text: 'end procedure', indent: 0 },
];

const TABLE_SIZE = 10;

function simpleHash(key: string | number): number {
  if (typeof key === 'number') return ((key % 97) + 97) % 97;
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) % 97;
  }
  return h;
}

export function* hashTable(input: AlgorithmInput): Generator<Step> {
  const entries: [string | number, number | string][] =
    (input.entries as [string | number, number | string][]) ?? [
      ['apple', 10],
      ['banana', 20],
      ['cat', 30],
      ['dog', 40],
      ['apple', 15],
    ];

  const table: { key: string | number; value: number | string }[] = new Array(TABLE_SIZE).fill(undefined);

  const toCells = (): TableCell[][] => [
    table.map((slot, idx) =>
      tableCell(0, idx, slot ? `${slot.key}:${slot.value}` : '', !!slot)
    ),
  ];

  yield makeTableStep(toCells(), [], 1, `Initialize hash table of size ${TABLE_SIZE}`, { size: TABLE_SIZE });

  for (let e = 0; e < entries.length; e++) {
    const [key, value] = entries[e];
    let idx = simpleHash(key) % TABLE_SIZE;
    yield makeTableStep(
      toCells(),
      [tableCompute(0, idx)],
      3,
      `Hash "${key}" → index ${idx}`,
      { key: String(key), index: idx },
      [{ label: 'insert', iteration: e + 1 }]
    );

    const startIdx = idx;
    while (table[idx] !== undefined) {
      if (table[idx].key === key) {
        table[idx].value = value;
        yield makeTableStep(
          toCells(),
          [tableResult(0, idx)],
          6,
          `Key "${key}" already present — update value to ${value}`,
          { key: String(key), action: 'update' },
          [{ label: 'probe', iteration: 1 }]
        );
        break;
      }
      idx = (idx + 1) % TABLE_SIZE;
      if (idx === startIdx) break;
      yield makeTableStep(
        toCells(),
        [tableRead(0, idx)],
        10,
        `Collision — probing to index ${idx}`,
        { key: String(key), probe: idx },
        [{ label: 'probe', iteration: 2 }]
      );
    }

    if (table[idx] === undefined) {
      table[idx] = { key, value };
      yield makeTableStep(
        toCells(),
        [tableResult(0, idx)],
        12,
        `Inserted ("${key}", ${value}) at index ${idx}`,
        { key: String(key), value, index: idx, action: 'insert' },
        [{ label: 'insert', iteration: e + 1 }]
      );
    }
  }

  yield makeTableStep(toCells(), [], 13, `All entries processed`, { size: TABLE_SIZE });
}

const hashTableDef: AlgorithmDef = {
  id: 'ds-hash',
  name: 'Hash Table',
  category: 'ds',
  description:
    'Maps keys to values via a hash function, handling collisions with linear probing and supporting updates.',
  pseudocode,
  complexity: { time: 'O(1) avg, O(n) worst', space: 'O(n)' },
  defaultInput: {},
  run: hashTable,
  ops: [{ id: 'insert', label: 'Insert', needsValue: true }],
};

registerAlgorithm(hashTableDef);
