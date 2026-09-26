import { useEffect, useState, useSyncExternalStore } from 'react';
import { Package } from 'lucide-react';
import { getActivity, subscribeActivity } from '../api/activity';
export function RequestProgress() {
  const pending = useSyncExternalStore(subscribeActivity, getActivity, () => 0);
  const [visible, setVisible] = useState(false);
  useEffect(() => { if (!pending) { setVisible(false); return; } const timer = setTimeout(() => setVisible(true), 120); return () => clearTimeout(timer); }, [pending]);
  return visible ? <div className="request-progress" role="progressbar" aria-label="Loading page data"><span/></div> : null;
}
export function DataSkeleton() {
  return <div className="data-skeleton" role="status" aria-live="polite" aria-label="Loading your inventory"><div className="loading-package"><Package size={26}/><span/><span/><span/></div><p>Getting your workspace ready…</p><div className="skeleton-grid">{[0,1,2].map(i => <div className="skeleton-card" key={i}><i/><b/><span/></div>)}</div><div className="skeleton-table">{[0,1,2,3].map(i => <div key={i}><i/><span/><span/></div>)}</div></div>;
}
