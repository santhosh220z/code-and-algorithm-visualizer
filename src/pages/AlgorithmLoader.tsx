import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getAlgorithm } from '../core/registry';
import { usePlayerStore } from '../core/player';

/**
 * Side-effect component: syncs the :id route param into the player store.
 * Renders nothing.
 */
export function AlgorithmLoader() {
  const { category, id } = useParams<{ category: string; id: string }>();
  const location = useLocation();
  const setAlgorithm = usePlayerStore((s) => s.setAlgorithm);
  const clearAlgorithm = usePlayerStore((s) => s.clearAlgorithm);
  const currentId = usePlayerStore((s) => s.algorithm?.id);

  useEffect(() => {
    if (!id || !category) return;
    const algo = getAlgorithm(id);
    if (!algo || algo.category !== category) {
      if (currentId) clearAlgorithm();
      return;
    }
    if (currentId !== algo.id) {
      const input = (location.state as { input?: Record<string, unknown> } | null)?.input ?? algo.defaultInput;
      setAlgorithm(algo, input);
    }
  }, [category, id, location.state, currentId, setAlgorithm, clearAlgorithm]);

  return null;
}