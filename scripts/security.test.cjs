const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const test = require('node:test');
const ts = require('typescript');
function load(file, mocks) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true }
  }).outputText;
  vm.runInNewContext(code, { exports, require: id => {
    assert.ok(id in mocks, `Unexpected import: ${id}`);
    return mocks[id];
  }, process: { env: mocks.env || {} }, console, Date, Map, URL });
  return exports;
}
const response = { NextResponse: { json: (body, options) => ({ body, status: options?.status || 200 }) } };
const id = 'a'.repeat(24);
function auth(token, payload, admin = false, secret = 'secret') {
  return load('lib/auth.ts', {
    env: { JWT_SECRET: secret },
    'next/headers': { cookies: async () => ({ get: () => token ? { value: token } : undefined }) },
    jsonwebtoken: { verify: () => { if (payload instanceof Error) throw payload; return payload; } },
    'next/server': response,
    '@/lib/db': async () => {},
    '@/lib/models/User': { findById: () => ({ select: async () => ({ _id: id, isAdmin: admin }) }) }
  });
}
test('sessions reject missing, forged, malformed, and unconfigured tokens', async () => {
  for (const instance of [auth(null), auth('x', new Error('signature')), auth('x', { id: 'invalid' }), auth('x', { id }, false, '')]) {
    assert.equal((await instance.requireSession()).error.status, 401);
  }
  assert.equal(await auth('x', { id }).getSessionUserId(), id);
});
test('admin role is enforced independently of the browser', async () => {
  assert.equal((await auth('x', { id }).requireAdmin()).error.status, 403);
  assert.equal((await auth('x', { id }, true).requireAdmin()).userId, id);
});
test('protected routes reject anonymous requests before database operations', async () => {
  const routes = ['admin/users', 'admin/posts', 'admin/comments', 'admin/stats', 'chat', 'notifications', 'posts', 'posts/like', 'posts/comment', 'users/follow', 'users/[id]', 'user/visited', 'user/rate-profile', 'comments'];
  for (const route of routes) {
    const source = fs.readFileSync(`app/api/${route}/route.ts`, 'utf8');
    const mocks = { 'next/server': response, '@/lib/auth': {
      requireSession: async () => ({ error: { status: 401 }, userId: null }),
      requireAdmin: async () => ({ error: { status: 401 }, userId: null })
    } };
    for (const match of source.matchAll(/from ['"]([^'"]+)['"]/g)) {
      if (!(match[1] in mocks)) mocks[match[1]] = new Proxy(function () { throw new Error('Unexpected database access'); }, { get(target, key) { if (key === '__esModule') return false; throw new Error('Unexpected database access'); } });
    }
    const module = load(`app/api/${route}/route.ts`, mocks);
    for (const method of ['POST', 'PUT', 'DELETE', ...(route.startsWith('admin/') || ['chat', 'notifications'].includes(route) ? ['GET'] : [])]) {
      if (module[method]) assert.equal((await module[method]({}, { params: Promise.resolve({ id }) })).status, 401, `${route} ${method}`);
    }
  }
});
test('diagnostic routes return 404 without database imports', async () => {
  for (const route of ['debug-db', 'test-rating']) assert.equal((await load(`app/api/${route}/route.ts`, { 'next/server': response }).GET()).status, 404);
});


test('profile ownership rejects updates to another user', async () => {
  const route = load('app/api/users/[id]/route.ts', {
    'next/server': response,
    '@/lib/auth': { requireSession: async () => ({ userId: id, error: null }) },
    '@/lib/db': async () => { throw new Error('Unexpected database access'); },
    '@/lib/models/User': {}, '@/lib/models/Comment': {}
  });
  const result = await route.PUT({ json: async () => ({ userName: 'Test', email: 'test@example.com' }) }, { params: Promise.resolve({ id: 'b'.repeat(24) }) });
  assert.equal(result.status, 403);
});
test('notification updates are scoped to the authenticated recipient', async () => {
  let filter;
  const route = load('app/api/notifications/route.ts', {
    'next/server': response,
    '@/lib/auth': { requireSession: async () => ({ userId: id, error: null }) },
    '@/lib/db': async () => {}, '@/lib/models/User': {},
    '@/lib/models/Notification': { updateMany: async value => { filter = value; } }
  });
  assert.equal((await route.POST({ json: async () => ({ notificationIds: ['b'.repeat(24)] }) })).status, 200);
  assert.equal(filter.recipientId, id);
});
test('message sender is taken from the session rather than the request', async () => {
  let message;
  const route = load('app/api/chat/route.ts', {
    'next/server': response,
    '@/lib/auth': { requireSession: async () => ({ userId: id, error: null }) },
    '@/lib/db': async () => {}, '@/lib/models/User': {}, mongoose: {},
    '@/lib/models/Message': { create: async value => { message = value; return value; } }
  });
  await route.POST({ json: async () => ({ senderId: 'c'.repeat(24), receiverId: 'b'.repeat(24), content: 'Hello' }) });
  assert.equal(message.senderId, id);
});
