import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';

test('HTTP routes authenticate, create, transition and report inventory', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  let token;
  async function request(path, body, method = body ? 'POST' : 'GET') {
    const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
    return { status: response.status, data: await response.json() };
  }
  try {
    assert.equal((await request('/health')).status, 200);
    assert.equal((await request('/products')).status, 401);
    assert.equal((await request('/auth/login', { loginId: 'no', password: 'no' })).data.message, 'Invalid Login Id or Password');
    const login = await request('/auth/login', { loginId: 'admin01', password: 'StockSense@123' }); token = login.data.token;
    for (const path of ['auth/me', 'products', 'warehouses', 'locations', 'receipts', 'deliveries', 'transfers', 'adjustments', 'ledger', 'dashboard']) assert.equal((await request(`/${path}`)).status, 200, path);
    const { data: doc, status } = await request('/receipts', { contact: 'HTTP Test', scheduleDate: '2026-09-26', warehouseRef: 'w1', toLocation: 'l1', lines: [{ product: 'p1', quantity: 3 }] });
    assert.equal(status, 201); assert.equal(doc.status, 'Draft');
    assert.equal((await request(`/receipts/${doc.id}/transition`, { action: 'validate' })).status, 400);
    assert.equal((await request(`/receipts/${doc.id}/transition`, { action: 'todo' })).data.status, 'Ready');
    assert.equal((await request(`/receipts/${doc.id}/transition`, { action: 'validate' })).data.status, 'Done');
    assert.equal((await request('/ledger')).data[0].quantityChange, 3);
    assert.equal((await request('/products/p1')).data.onHand, 1253);
    assert.equal((await request('/auth/logout', {})).status, 200);
    assert.equal((await request('/products')).status, 401);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
