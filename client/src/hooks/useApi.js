import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage } from '../api/client';
export function useApi(path) {
  const [data, setData] = useState(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision(n => n + 1), []);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError('');
    api.get(path, { signal: controller.signal }).then(r => setData(r.data)).catch(e => { if (e.code !== 'ERR_CANCELED') setError(errorMessage(e)); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [path, revision]);
  return { data, error, loading, refresh };
}
