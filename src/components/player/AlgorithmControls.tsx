import { useState, type FormEvent } from 'react';
import type { AlgorithmDef, AlgorithmInput } from '../../core/types';
import { usePlayerStore } from '../../core/player';
import { useEditorStore } from '../../core/editorStore';
import { Button } from '../ui/Button';

interface AlgorithmControlsProps {
  algorithm: AlgorithmDef;
  input: AlgorithmInput;
}

type FieldKind = 'list' | 'number' | 'text';

interface FieldSpec {
  name: string;
  label: string;
  kind: FieldKind;
  value: string | number;
  min?: number;
  max?: number;
  maxItems?: number;
  wide?: boolean;
  placeholder?: string;
}

function fieldsFor(input: AlgorithmInput, algorithm: AlgorithmDef): FieldSpec[] {
  const fields: FieldSpec[] = [];
  if (Array.isArray(input.array)) {
    fields.push({
      name: 'array',
      label: 'Array values',
      kind: 'list',
      value: input.array.join(', '),
      wide: true,
      maxItems: algorithm.id === 'rec-permutations' ? 6 : 30,
    });
  }
  if (typeof input.a === 'string') {
    fields.push({ name: 'a', label: 'Sequence A', kind: 'text', value: input.a, wide: true });
  }
  if (typeof input.b === 'string') {
    fields.push({ name: 'b', label: 'Sequence B', kind: 'text', value: input.b, wide: true });
  }
  if (Array.isArray(input.weights)) {
    fields.push({ name: 'weights', label: 'Weights', kind: 'list', value: input.weights.join(', '), wide: true });
  }
  if (Array.isArray(input.values)) {
    fields.push({ name: 'values', label: 'Values', kind: 'list', value: input.values.join(', '), wide: true });
  }
  if (typeof input.target === 'number') {
    fields.push({ name: 'target', label: 'Target', kind: 'number', value: input.target });
  }
  if (typeof input.n === 'number') {
    const max =
      algorithm.id === 'rec-hanoi' ? 7 : algorithm.id === 'dp-fibonacci' ? 30 : algorithm.id === 'rec-factorial' ? 10 : 20;
    const min = algorithm.id === 'rec-hanoi' || algorithm.id === 'dp-fibonacci' ? 1 : 0;
    fields.push({ name: 'n', label: 'Value of n', kind: 'number', value: input.n, min, max });
  }
  if (typeof input.capacity === 'number') {
    const max = algorithm.id === 'dp-knapsack' ? 20 : 30;
    fields.push({ name: 'capacity', label: 'Capacity', kind: 'number', value: input.capacity, min: 1, max });
  }
  if (algorithm.id === 'ds-stack' || algorithm.id === 'ds-queue') {
    const operations = Array.isArray(input.ops)
      ? (input.ops as { op: string; value?: number }[])
      : [];
    const pushName = algorithm.id === 'ds-stack' ? 'push' : 'enqueue';
    const popName = algorithm.id === 'ds-stack' ? 'pop' : 'dequeue';
    fields.push({
      name: '_operations',
      label: 'Operation sequence',
      kind: 'text',
      value: operations
        .map((operation) =>
          operation.value === undefined ? popName : `${pushName} ${operation.value}`
        )
        .join(', '),
      wide: true,
      placeholder: algorithm.id === 'ds-stack' ? 'push 5, pop, push 3' : 'enqueue 5, dequeue, enqueue 3',
    });
  }
  return fields;
}

function parseList(value: FormDataEntryValue | null): number[] | null {
  if (typeof value !== 'string') return null;
  const parts = value.split(/[\s,]+/).filter(Boolean).map(Number);
  return parts.length > 0 && parts.every(Number.isFinite) ? parts : null;
}

function parseOperations(value: string, algorithmId: string) {
  const popName = algorithmId === 'ds-stack' ? 'pop' : 'dequeue';
  return value.split(',').map((entry) => {
    const [operation, rawValue] = entry.trim().split(/\s+/);
    if (operation === popName) return { op: popName, value: undefined };
    return { op: operation ?? '', value: Number(rawValue) };
  });
}

export function AlgorithmControls({ algorithm, input }: AlgorithmControlsProps) {
  const patchInput = usePlayerStore((state) => state.patchInput);
  const setAlgorithm = usePlayerStore((state) => state.setAlgorithm);
  const inputDrafts = useEditorStore((state) => state.inputDrafts);
  const setInputDraft = useEditorStore((state) => state.setInputDraft);
  const clearInputDrafts = useEditorStore((state) => state.clearInputDrafts);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const fields = fieldsFor(input, algorithm);
  const drafts = inputDrafts[algorithm.id] ?? {};

  if (fields.length === 0) return null;

  const apply = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const next: AlgorithmInput = { ...input };

    for (const field of fields) {
      const raw = formData.get(field.name);
      if (field.kind === 'list') {
        const values = parseList(raw);
        const maxItems = field.maxItems ?? 30;
        if (!values || values.length > maxItems) {
          setError(`${field.label} must contain up to ${maxItems} numbers separated by commas.`);
          return;
        }
        if (
          (field.name === 'weights' || field.name === 'values') &&
          values.some((value) => !Number.isInteger(value) || value <= 0)
        ) {
          setError(`${field.label} must contain positive whole numbers.`);
          return;
        }
        if (field.name !== 'weights' && field.name !== 'values' && values.some((value) => !Number.isInteger(value))) {
          setError(`${field.label} must contain whole numbers.`);
          return;
        }
        next[field.name] = values;
      } else if (field.name === '_operations') {
        const value = typeof raw === 'string' ? raw.trim() : '';
        if (!value) {
          setError('Enter at least one operation.');
          return;
        }
        const pushName = algorithm.id === 'ds-stack' ? 'push' : 'enqueue';
        const popName = algorithm.id === 'ds-stack' ? 'pop' : 'dequeue';
        const operations = parseOperations(value, algorithm.id);
        const valid = operations.every((operation) =>
          operation.op === popName ||
          (operation.op === pushName && operation.value !== undefined && Number.isInteger(operation.value) && operation.value > 0)
        );
        if (!valid) {
          setError(`Use ${pushName} and ${popName}, separating operations with commas.`);
          return;
        }
        next.ops = operations;
      } else if (field.kind === 'text') {
        const value = typeof raw === 'string' ? raw.trim() : '';
        if (value.length === 0 || value.length > 20) {
          setError(`${field.label} must contain between 1 and 20 characters.`);
          return;
        }
        next[field.name] = value;
      } else {
        const value = Number(raw);
        const min = field.min ?? Number.NEGATIVE_INFINITY;
        const max = field.max ?? Number.POSITIVE_INFINITY;
        if (!Number.isInteger(value) || value < min || value > max) {
          setError(`${field.label} must be a whole number from ${field.min ?? '−∞'} to ${field.max ?? '∞'}.`);
          return;
        }
        next[field.name] = value;
      }
    }

    if (
      Array.isArray(next.weights) &&
      Array.isArray(next.values) &&
      next.weights.length !== next.values.length
    ) {
      setError('Weights and Values must contain the same number of items.');
      return;
    }

    setError(null);
    clearInputDrafts(algorithm.id);
    patchInput(next);
    setStatus(`Trace updated for ${algorithm.name}.`);
  };

  return (
    <form onSubmit={apply} className="shrink-0 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2.5 sm:px-4" aria-label={`${algorithm.name} input controls`}>
      <div className="flex flex-wrap items-end gap-2">
        {fields.map((field) => {
          const inputId = `algorithm-input-${field.name}`;
          const errorId = 'algorithm-input-error';
          return (
            <label key={field.name} htmlFor={inputId} className={field.wide ? 'min-w-[min(100%,18rem)] flex-1' : 'w-28'}>
              <span className="mb-1 block text-[11px] font-medium text-[var(--color-text-muted)]">{field.label}</span>
              <input
                id={inputId}
                name={field.name}
                type={field.kind === 'number' ? 'number' : 'text'}
                value={drafts[field.name] ?? String(field.value)}
                onChange={(event) => setInputDraft(algorithm.id, field.name, event.target.value)}
                placeholder={field.placeholder}
                min={field.min}
                max={field.max}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className="min-h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-3)] px-3 py-2 font-mono text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:border-[var(--color-accent)]"
              />
            </label>
          );
        })}
        <div className="flex gap-2">
          <Button type="submit" variant="primary" size="sm">Apply</Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setError(null);
              clearInputDrafts(algorithm.id);
              setAlgorithm(algorithm, algorithm.defaultInput);
              setStatus(`Reset ${algorithm.name} to its example data.`);
            }}
          >
            Reset
          </Button>
        </div>
      </div>
      {error && <p id="algorithm-input-error" role="alert" className="mt-2 text-xs text-[var(--color-danger)]">{error}</p>}
      <p className="sr-only" aria-live="polite">{status}</p>
    </form>
  );
}
