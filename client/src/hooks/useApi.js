import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage } from '../api/client';
export function useApi(path) {
  const [data, setData] = useState(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const refresh = useCallback(() => setRevision(n => n + 1), []);
  useEffect(() => {
    const controller = new AbortController(); let inFlight = false;
    setLoading(true); setError('');
    async function fetchData(background = false) {
      if (inFlight || controller.signal.aborted || background && document.hidden) return;
      inFlight = true;
      try { const response = await api.get(path, { signal: controller.signal, background }); if (!controller.signal.aborted) { setData(response.data); setError(''); } }
      catch (e) { if (e.code !== 'ERR_CANCELED') setError(errorMessage(e)); }
      finally { inFlight = false; if (!controller.signal.aborted) setLoading(false); }
    }
    fetchData();
    const update = () => fetchData(true);
    const interval = setInterval(update, 15000);
    window.addEventListener('focus', update); window.addEventListener('stocksense:changed', update);
    return () => { controller.abort(); clearInterval(interval); window.removeEventListener('focus', update); window.removeEventListener('stocksense:changed', update); };
  }, [path, revision]);
  return { data, error, loading, refresh };
}
