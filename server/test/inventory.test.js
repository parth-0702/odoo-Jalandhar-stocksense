import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryRepository } from '../src/repositories/memoryRepository.js';
import { createInventoryService } from '../src/services/inventoryService.js';
import { createAuthService } from '../src/services/authService.js';
function setup() { const repo = new MemoryRepository(); return { repo, service: createInventoryService(repo), user: repo.get('users', 'u1') }; }
const input = (extra = {}) => ({ warehouseRef: 'w1', contact: 'Test Vendor', scheduleDate: '2026-09-26', fromLocation: 'l1', toLocation: 'l1', operationType: 'Customer Delivery', lines: [{ product: 'p1', quantity: 10 }], ...extra });
test('receipt transitions increase stock exactly once and write IN ledger', async () => {
  const { repo, service, user } = setup(); const d = await service.create('Receipt', input(), user);
  assert.match(d.reference, /^WH\/IN\/0003$/); assert.equal(d.status, 'Draft');
  await assert.rejects(() => service.transition('Receipt', d.id, 'validate'), /only available in Ready/);
  await service.transition('Receipt', d.id, 'todo'); await service.transition('Receipt', d.id, 'validate');
  assert.equal((await service.products())[0].onHand, 1260); assert.equal((await service.products())[0].freeToUse, 1260);
  assert.equal(repo.all('ledger')[0].direction, 'IN'); assert.equal(repo.all('ledger')[0].quantityChange, 10);
  await assert.rejects(() => service.transition('Receipt', d.id, 'validate'), /cannot be changed/);
  await assert.rejects(() => service.transition('Receipt', d.id, 'cancel'), /cannot be changed/);
  assert.equal(repo.all('ledger').length, 1);
});
test('delivery waits for stock, rechecks availability, then decreases stock', async () => {
  const { service, user } = setup(); const d = await service.create('Delivery', input({ lines: [{ product: 'p3', quantity: 10 }] }), user);
  assert.equal(d.lines[0].insufficientStock, true); assert.equal((await service.transition('Delivery', d.id, 'todo')).status, 'Waiting');
  await assert.rejects(() => service.transition('Delivery', d.id, 'check'), /Still waiting/);
  await service.manualStock('p3', { locationRef: 'l1', quantity: 20 }, user);
  assert.equal((await service.transition('Delivery', d.id, 'check')).status, 'Ready');
  await service.transition('Delivery', d.id, 'validate'); assert.equal((await service.products()).find(p => p.id === 'p3').onHand, 10);
  assert.equal((await service.ledger())[0].direction, 'OUT');
});
test('ready delivery rechecks stock at validation and does not partially apply', async () => {
  const { service, repo, user } = setup();
  const d = await service.create('Delivery', input({ lines: [{ product: 'p1', quantity: 5 }, { product: 'p2', quantity: 20 }] }), user);
  await service.transition('Delivery', d.id, 'todo'); await service.manualStock('p2', { locationRef: 'l1', quantity: 0 }, user);
  const before = structuredClone(repo.data);
  await assert.rejects(() => service.transition('Delivery', d.id, 'validate'), /Insufficient stock/); assert.deepEqual(repo.data, before);
});
test('transfer conserves global stock and records OUT + IN per product', async () => {
  const { service, user } = setup(); const d = await service.create('Transfer', input({ toLocation: 'l3' }), user);
  await service.transition('Transfer', d.id, 'todo'); await service.transition('Transfer', d.id, 'validate');
  const p = (await service.products())[0]; assert.equal(p.onHand, 1250); assert.equal(p.stock.find(s => s.locationRef === 'l1').onHand, 1240); assert.equal(p.stock.find(s => s.locationRef === 'l3').onHand, 10);
  assert.deepEqual((await service.ledger()).map(l => l.direction), ['IN', 'OUT']);
  await assert.rejects(() => service.create('Transfer', input(), user), /must be different/);
});
test('adjustment overwrites physical count, logs signed delta, allows zero', async () => {
  const { service, user } = setup(); await service.manualStock('p1', { locationRef: 'l1', quantity: 1200 }, user);
  assert.equal((await service.products())[0].onHand, 1200); assert.equal((await service.ledger())[0].quantityChange, -50); assert.equal((await service.ledger())[0].direction, 'OUT');
  await service.manualStock('p1', { locationRef: 'l1', quantity: 0 }, user); assert.equal((await service.products())[0].onHand, 0); assert.equal((await service.products())[0].freeToUse, 0);
});
test('reject duplicate lines, negative quantities, invalid locations and warehouse edits', async () => {
  const { service, user } = setup();
  await assert.rejects(() => service.create('Receipt', input({ lines: [{ product: 'p1', quantity: 1 }, { product: 'p1', quantity: 2 }] }), user), /only once/);
  await assert.rejects(() => service.create('Receipt', input({ lines: [{ product: 'p1', quantity: -1 }] }), user), /greater than zero/);
  await assert.rejects(() => service.create('Receipt', input({ toLocation: 'l3' }), user), /selected warehouse/);
  const d = await service.create('Receipt', input(), user);
  await assert.rejects(() => service.update('Receipt', d.id, input({ warehouseRef: 'w2', toLocation: 'l3' }), user), /Warehouse cannot change/);
});
test('cancellation and document-type flows remain separate', async () => {
  const { service, user } = setup(); const d = await service.create('Receipt', input(), user);
  await assert.rejects(() => service.transition('Receipt', d.id, 'check'), /Waiting deliveries/);
  await assert.rejects(() => service.transition('Delivery', d.id, 'todo'), /not found/);
  assert.equal((await service.transition('Receipt', d.id, 'cancel')).status, 'Canceled');
  await assert.rejects(() => service.transition('Receipt', d.id, 'todo'), /cannot be changed/);
  assert.equal((await service.ledger()).length, 0);
});
test('reference counters separate operations and warehouses; do not reuse canceled refs', async () => {
  const { service, user } = setup(); const one = await service.create('Receipt', input(), user); await service.transition('Receipt', one.id, 'cancel');
  assert.equal((await service.create('Receipt', input(), user)).reference, 'WH/IN/0004');
  assert.equal((await service.create('Delivery', input(), user)).reference, 'WH/OUT/0003');
  assert.equal((await service.create('Receipt', input({ warehouseRef: 'w2', toLocation: 'l3' }), user)).reference, 'PH/IN/0001');
});
test('manual stock change and initial stock creation roll back on failure', async () => {
  const { service, repo, user } = setup(); const before = structuredClone(repo.data);
  await assert.rejects(() => service.manualStock('p1', { locationRef: 'l1', quantity: -4 }, user)); assert.deepEqual(repo.data, before);
  await assert.rejects(() => service.saveProduct({ name: 'Test', sku: 'TEST', category: 'Test', unitOfMeasure: 'Pcs', perUnitCost: 1, reorderThreshold: 0, initialStock: 5, locationRef: 'invalid' }, undefined, user)); assert.deepEqual(repo.data, before);
});
test('dashboard uses date boundaries and applies filters', async () => {
  const { service } = setup(); const dashboard = await service.dashboard();
  assert.equal(dashboard.receipts.late, 1); assert.equal(dashboard.receipts.operations, 1); assert.equal(dashboard.deliveries.waiting, 1);
  assert.equal((await service.dashboard({ warehouse: 'w2' })).receipts.pending, 0);
  assert.equal((await service.dashboard({ category: 'Furniture' })).totalProducts, 2);
});
test('auth matches exact login error, unique IDs/email/password, and complexity', async () => {
  const { repo } = setup(); const auth = createAuthService(repo);
  await assert.rejects(() => auth.login({ loginId: 'bad', password: 'bad' }), { message: 'Invalid Login Id or Password' });
  const values = { loginId: 'tester01', email: 'tester@example.com', password: 'TestPass@123', confirmPassword: 'TestPass@123' };
  await assert.rejects(() => auth.signup({ ...values, loginId: 'short' }), /6–12/);
  await assert.rejects(() => auth.signup({ ...values, password: 'lowercaseonly' }), /more than 8/);
  await assert.rejects(() => auth.signup({ ...values, confirmPassword: 'different' }), /do not match/);
  const user = await auth.signup(values); assert.equal(user.passwordHash, undefined);
  await assert.rejects(() => auth.signup({ ...values, loginId: 'TESTER01' }), /Login ID already/);
  await assert.rejects(() => auth.signup({ ...values, loginId: 'tester02' }), /Email already/);
  await assert.rejects(() => auth.signup({ ...values, loginId: 'tester02', email: 'other@example.com' }), /Password must be unique/);
  assert.ok((await auth.login(values)).token);
});
test('OTP resets consume token and invalidate old sessions', async () => {
  const { repo } = setup(); const auth = createAuthService(repo), email = 'admin@stocksense.local';
  const session = await auth.login({ loginId: 'admin01', password: 'StockSense@123' });
  const { demoOtp } = await auth.requestOtp({ email }); assert.match(demoOtp, /^\d{6}$/);
  await assert.rejects(() => auth.verifyOtp({ email, otp: '000000' }), /Invalid or expired/);
  const { resetToken } = await auth.verifyOtp({ email, otp: demoOtp });
  await auth.resetPassword({ resetToken, password: 'NewPassword@12', confirmPassword: 'NewPassword@12' });
  assert.equal(await auth.authenticate(session.token), undefined);
  await assert.rejects(() => auth.resetPassword({ resetToken, password: 'AnotherPass@1', confirmPassword: 'AnotherPass@1' }), /Invalid or expired/);
  assert.ok((await auth.login({ loginId: 'admin01', password: 'NewPassword@12' })).token);
});
