import { isManager } from '../config/permissions';
import ProductThumbnail from '../components/ProductThumbnail';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowUpRight, Trash2 } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { api, errorMessage } from '../api/client';
import { loadCatalog } from '../store';
import { Alert, Badge, Field, Kanban, Loading, Modal, money, PageHeader, SearchBox, Table, ViewToggle } from '../components/ui';

const stockClass = (status) => (status === 'Low Stock' ? 'stock-low' : status === 'Out of Stock' ? 'stock-out' : '');

export default function ProductsPage() {
  const manager = isManager(useSelector((s) => s.auth.user));
  const [params, setParams] = useSearchParams(),
    dispatch = useDispatch();
  const { warehouses, locations, products: catalogProducts } = useSelector((s) => s.catalog);
  const [category, setCategory] = useState(''),
    [location, setLocation] = useState(''),
    [warehouse, setWarehouse] = useState(''),
    [view, setView] = useState('list');
  const { data, error, loading, refresh } = useApi(`/products?${new URLSearchParams({ location, warehouse })}`);
  const [editing, setEditing] = useState(null),
    [stockLocation, setStockLocation] = useState(''),
    [quantity, setQuantity] = useState(''),
    [modalError, setModalError] = useState(''),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  const [deletingProduct, setDeletingProduct] = useState(null);

  const search = params.get('q') || '',
    status = params.get('stock') || '';
  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next);
  };

  const rows = (data || []).filter(
    (p) =>
      `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(search.toLowerCase()) &&
      (!category || p.category === category) &&
      (!status || (status === 'attention' ? p.stockStatus !== 'In Stock' : p.stockStatus === status))
  );

  const openStock = (p) => {
    setEditing(catalogProducts.find((item) => item.id === p.id) || p);
    const loc = location || locations[0]?.id || '';
    setStockLocation(loc);
    setQuantity((catalogProducts.find((item) => item.id === p.id) || p).stock.find((s) => s.locationRef === loc)?.onHand || 0);
    setModalError('');
  };

  async function updateStock(e) {
    e.preventDefault();
    setBusy(true);
    setModalError('');
    try {
      await api.post(`/products/${editing.id}/stock`, { locationRef: stockLocation, quantity });
      setEditing(null);
      setMessage('Stock updated and adjustment recorded in Move History.');
      refresh();
      dispatch(loadCatalog());
    } catch (err) {
      setModalError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function deleteProduct() {
    if (!deletingProduct) return;
    setBusy(true);
    setModalError('');
    try {
      await api.delete(`/products/${deletingProduct.id}`);
      setDeletingProduct(null);
      setMessage(`"${deletingProduct.name}" was removed from your inventory.`);
      refresh();
      dispatch(loadCatalog());
    } catch (err) {
      setModalError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Products / Stock"
        subtitle="Every product, every location. Your inventory in one place."
        action={manager ? 'Add Product' : undefined}
        to="/products/new"
      />
      <Alert success>{message}</Alert>
      <section className="panel">
        <div className="filter-bar">
          <SearchBox value={search} onChange={(v) => setParam('q', v)} placeholder="Search products, SKU, or categories…" />
          <select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {[...new Set((data || []).map((p) => p.category))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            aria-label="Warehouse"
            value={warehouse}
            onChange={(e) => {
              setWarehouse(e.target.value);
              setLocation('');
            }}
          >
            <option value="">All Warehouses</option>
            {warehouses.map((w) => (
              <option value={w.id} key={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <select aria-label="Location" value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">All Locations</option>
            {locations
              .filter((l) => !warehouse || l.warehouseRef === warehouse)
              .map((l) => (
                <option value={l.id} key={l.id}>
                  {l.name}
                </option>
              ))}
          </select>
          <select aria-label="Stock Status" value={status} onChange={(e) => setParam('stock', e.target.value)}>
            <option value="">Stock Status</option>
            {['In Stock', 'Low Stock', 'Out of Stock', 'attention'].map((s) => (
              <option key={s} value={s}>
                {s === 'attention' ? 'Needs attention' : s}
              </option>
            ))}
          </select>
          <ViewToggle view={view} setView={setView} />
        </div>
        <Alert>{error}</Alert>
        {loading ? (
          <Loading />
        ) : view === 'list' ? (
          <Table
            columns={['Product', 'SKU', 'Category', 'Per Unit Cost', 'On Hand', 'Free to Use', 'Status', 'Actions']}
            rows={rows}
            renderRow={(p) => (
              <tr key={p.id} className={stockClass(p.stockStatus)}>
                <td>
                  <Link className="product-name" to={`/products/${p.id}`}>
                    <span
                      className={`product-thumb ${
                        p.category === 'Furniture' ? 'purple' : p.category === 'Raw Material' ? 'amber' : 'blue'
                      }`}
                    >
                      <ProductThumbnail product={p} />
                    </span>
                    <strong>{p.name}</strong>
                  </Link>
                </td>
                <td className="muted">{p.sku}</td>
                <td>{p.category}</td>
                <td>{money(p.perUnitCost)}</td>
                <td>
                  <strong>{p.onHand.toLocaleString()}</strong> <small>{p.unitOfMeasure}</small>
                </td>
                <td>{p.freeToUse.toLocaleString()}</td>
                <td>
                  <Badge>{p.stockStatus}</Badge>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="text-button" onClick={() => openStock(p)}>
                      Update Stock
                    </button>
                    <Link to={`/products/${p.id}`} aria-label={`Edit ${p.name}`}>
                      <ArrowUpRight size={16} />
                    </Link>
                    {manager && (
                      <button
                        className="icon-button danger-quiet"
                        title={`Delete ${p.name}`}
                        aria-label={`Delete ${p.name}`}
                        onClick={() => setDeletingProduct(p)}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          />
        ) : (
          <Kanban
            rows={rows.map((p) => ({ ...p, status: p.stockStatus }))}
            statuses={['In Stock', 'Low Stock', 'Out of Stock']}
            renderCard={(p) => (
              <div className={`kanban-card ${stockClass(p.stockStatus)}`} key={p.id} style={{ position: 'relative' }}>
                <Link to={`/products/${p.id}`} style={{ display: 'block' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span className="product-thumb small" style={{ width: '30px', height: '30px' }}>
                      <ProductThumbnail product={p} />
                    </span>
                    <strong>
                      {p.name}
                      <ArrowUpRight size={14} />
                    </strong>
                  </div>
                  <p>
                    {p.sku} · {p.category}
                  </p>
                  <small>
                    {p.onHand.toLocaleString()} {p.unitOfMeasure} on hand
                  </small>
                  <footer>
                    <Badge>{p.stockStatus}</Badge>
                    <span>{money(p.perUnitCost)}</span>
                  </footer>
                </Link>
                {manager && (
                  <button
                    className="icon-button danger-quiet"
                    style={{ position: 'absolute', top: '10px', right: '10px', width: '28px', height: '28px' }}
                    title={`Delete ${p.name}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setDeletingProduct(p);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
          />
        )}
        <div className="table-footer">
          <span>{rows.length} products</span>
          <span>
            <i className="legend-dot amber" />
            Low stock <i className="legend-dot red" />
            Out of stock
          </span>
        </div>
      </section>

      {/* Stock Updater Modal */}
      {editing && (
        <Modal title={`Update stock · ${editing.name}`} onClose={() => setEditing(null)}>
          <form onSubmit={updateStock}>
            <Alert>{modalError}</Alert>
            <p className="muted modal-intro">Enter the actual counted quantity. The difference will be recorded as a stock adjustment.</p>
            <Field label="Location" required>
              <select
                required
                value={stockLocation}
                onChange={(e) => {
                  setStockLocation(e.target.value);
                  setQuantity(editing.stock.find((s) => s.locationRef === e.target.value)?.onHand || 0);
                }}
              >
                <option value="">Select location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {warehouses.find((w) => w.id === l.warehouseRef)?.shortCode}/{l.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Counted Quantity" required>
              <input required type="number" min="0" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </Field>
            <footer className="form-footer">
              <button type="button" className="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="button primary" disabled={busy}>
                {busy ? 'Updating…' : 'Update Stock'}
              </button>
            </footer>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <Modal title="Delete Product" onClose={() => setDeletingProduct(null)}>
          <div style={{ padding: '20px 24px' }}>
            <Alert>{modalError}</Alert>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
              Are you sure you want to remove <strong>{deletingProduct.name}</strong> (`{deletingProduct.sku}`)? All location counts for this item will be removed.
            </p>
            <div className="form-footer" style={{ margin: '0 -24px -20px', padding: '16px 24px' }}>
              <button type="button" className="button" onClick={() => setDeletingProduct(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="button"
                style={{ background: '#dc2626', color: '#fff', borderColor: '#dc2626' }}
                onClick={deleteProduct}
                disabled={busy}
              >
                {busy ? 'Deleting…' : 'Yes, Delete Product'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
