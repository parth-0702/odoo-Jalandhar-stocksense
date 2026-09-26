import { useSelector } from 'react-redux';
import { isManager } from '../config/permissions';
import { Link } from 'react-router-dom';
import { Layers, Package } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { Alert, Badge, Loading, PageHeader, Table } from '../components/ui';
export default function CatalogViewsPage({ rules = false }) {
  const manager = isManager(useSelector(s => s.auth.user));
  const { data, error, loading } = useApi('/products');
  const categories = [...new Set((data || []).map(p => p.category))];
  return <><PageHeader title={rules ? 'Reordering Rules' : 'Categories'} subtitle={rules ? 'Review stock thresholds and keep your shelves replenished' : 'Organize and browse your product catalog'}/><Alert>{error}</Alert>{loading ? <Loading/> : rules ? <section className="panel"><Table columns={['Product', 'SKU', 'On Hand', 'Reorder Threshold', 'Status', 'Actions']} rows={data || []} renderRow={p => <tr key={p.id}><td><strong>{p.name}</strong></td><td>{p.sku}</td><td>{p.onHand}</td><td>{p.reorderThreshold}</td><td><Badge>{p.stockStatus}</Badge></td><td><Link className="text-button" to={`/products/${p.id}`}>{manager ? 'Edit rule' : 'View product'}</Link></td></tr>}/></section> : <div className="category-cards">{categories.map(c => <Link className="panel category-card" key={c} to={`/products?q=${encodeURIComponent(c)}`}><span className="metric-icon red"><Layers size={22}/></span><h2>{c}</h2><p><Package size={14}/>{data.filter(p => p.category === c).length} products</p><span className="text-button">View products →</span></Link>)}</div>}</>;
}
