"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
admin.initializeApp();
// Config (kept in Functions env, not client)
// Set with: firebase functions:config:set airtable.pat="..." airtable.base="..."
async function readSecretOrConfig(name) {
    try {
        // Try env-first in v1
        const envVal = process.env[name];
        if (envVal)
            return envVal;
    }
    catch (_) {
        // ignore
    }
    // Fallback to env or runtime config (no Secret Manager)
    const cfg = functions.config();
    const fromConfig = cfg?.airtable && (name === 'AIRTABLE_PAT' ? cfg.airtable.pat : cfg.airtable.base);
    return fromConfig;
}
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json({ limit: '2mb' }));
const airtableRequest = async (method, path, body, query, token, baseId) => {
    const isMeta = path.startsWith('/meta/');
    const url = isMeta
        ? `https://api.airtable.com/v0${path}`
        : `https://api.airtable.com/v0/${baseId}${path}`;
    const params = new URLSearchParams();
    if (query) {
        Object.entries(query).forEach(([k, v]) => {
            if (v !== undefined)
                params.append(k, String(v));
        });
    }
    const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;
    const resp = await axios_1.default.request({ url: fullUrl, method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, data: body, validateStatus: () => true });
    if (resp.status >= 200 && resp.status < 300)
        return resp.data;
    throw new Error(`Airtable ${resp.status} ${resp.statusText}: ${JSON.stringify(resp.data)}`);
};
// Helpers to map linked fields to arrays of ids if Airtable returns linked record objects
const normalizeRecord = (r) => {
    if (!r || !r.fields)
        return r;
    const out = { ...r, fields: { ...r.fields } };
    Object.entries(out.fields).forEach(([k, v]) => {
        if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && v[0].id) {
            out.fields[k] = v.map((x) => x.id);
        }
    });
    return out;
};
// Simple schema ensure endpoint (adds missing fields); can be extended to create tables via Metadata API
// POST /ensure-schema { table: string, fields: Array<{ name: string, type: string, options?: any }> }
app.post('/ensure-schema', async (req, res) => {
    try {
        const { table, fields } = req.body || {};
        if (!table || !Array.isArray(fields))
            return res.status(400).json({ message: 'Invalid payload' });
        // Fetch current table schema
        const result = await withSecrets(async (pat, base) => airtableRequest('get', `/meta/bases/${base}/tables`, undefined, undefined, pat, ''));
        const tbl = (result?.tables || []).find((t) => t.name === table);
        if (!tbl)
            return res.status(404).json({ message: `Table ${table} not found` });
        const existing = {};
        tbl.fields.forEach((f) => (existing[f.name] = f));
        const toCreate = fields.filter((f) => !existing[f.name]);
        if (toCreate.length === 0)
            return res.json({ created: 0 });
        // Add fields individually
        await withSecrets(async (pat, base) => {
            for (const f of toCreate) {
                await airtableRequest('post', `/meta/bases/${base}/tables/${tbl.id}/fields`, { fields: [f] }, undefined, pat, '');
            }
        });
        res.json({ created: toCreate.length, table: table });
    }
    catch (e) {
        const err = e;
        res.status(500).json({ message: err.message });
    }
});
const withSecrets = async (handler) => {
    const [patVal, baseVal] = await Promise.all([
        readSecretOrConfig('AIRTABLE_PAT'),
        readSecretOrConfig('AIRTABLE_BASE'),
    ]);
    if (!patVal || !baseVal)
        throw new Error('Airtable credentials not configured');
    return handler(patVal, baseVal);
};
// --- Public Providers Endpoints (no auth) ---
app.post('/api/providers/search', async (req, res) => {
    try {
        const { q, subjects, modalities, priceMin, priceMax, lat, lng, radiusKm, sort } = req.body || {};
        // Basic search: filter by subjects contains any, and price range overlap
        const filters = [];
        if (q)
            filters.push(`FIND(LOWER('${String(q).toLowerCase()}'), LOWER({displayName}))`);
        if (Array.isArray(subjects) && subjects.length) {
            filters.push(`OR(${subjects.map((s) => `FIND('${s}', ARRAYJOIN({subjects}))`).join(',')})`);
        }
        if (priceMin || priceMax) {
            if (priceMin)
                filters.push(`{priceMin} >= ${Number(priceMin)}`);
            if (priceMax)
                filters.push(`{priceMax} <= ${Number(priceMax)}`);
        }
        if (modalities && Array.isArray(modalities) && modalities.length) {
            filters.push(`OR(${modalities.map((m) => `{modalities.${m}} = 1`).join(',')})`);
        }
        const filterByFormula = filters.length ? `AND(${filters.join(',')})` : '';
        const data = await withSecrets(async (pat, base) => airtableRequest('get', `/Providers`, undefined, filterByFormula ? { filterByFormula, pageSize: 50 } : { pageSize: 50 }, pat, base));
        const items = (data?.records || []).map((r) => {
            const f = r.fields || {};
            return {
                id: r.id,
                displayName: f.displayName,
                subjects: f.subjects || [],
                rating: f.rating || 0,
                priceRange: { min: f.priceMin || 0, max: f.priceMax || 0, currency: f.currency || 'USD' },
                location: { city: f.city || '', district: f.district || '' },
                thumbnail: Array.isArray(f.photos) && f.photos[0] && f.photos[0].url ? f.photos[0].url : null,
            };
        });
        res.json({ items });
    }
    catch (e) {
        const err = e;
        res.status(500).json({ message: err.message });
    }
});
app.post('/api/providers/get', async (req, res) => {
    try {
        const providerId = String(req.body?.providerId || '').trim();
        if (!providerId)
            return res.status(400).json({ message: 'providerId required' });
        const rec = await withSecrets(async (pat, base) => airtableRequest('get', `/Providers/${encodeURIComponent(providerId)}`, undefined, undefined, pat, base));
        res.json({ provider: { id: rec.id, ...(rec.fields || {}) } });
    }
    catch (e) {
        const err = e;
        res.status(500).json({ message: err.message });
    }
});
// CRUD routes
app.get('/tables/:table', async (req, res) => {
    try {
        const { table } = req.params;
        const { filterByFormula, maxRecords, pageSize, sort, offset } = req.query;
        const query = {};
        if (filterByFormula)
            query.filterByFormula = filterByFormula;
        if (maxRecords)
            query.maxRecords = String(maxRecords);
        if (pageSize)
            query.pageSize = String(pageSize);
        if (sort) {
            // sort expects JSON: [{field:'Rating', direction:'desc'}]
            try {
                const arr = JSON.parse(sort);
                arr.forEach((s, idx) => {
                    if (s.field)
                        query[`sort[${idx}][field]`] = s.field;
                    if (s.direction)
                        query[`sort[${idx}][direction]`] = s.direction;
                });
            }
            catch (_) { }
        }
        if (offset)
            query.offset = offset;
        const data = await withSecrets(async (pat, base) => airtableRequest('get', `/${encodeURIComponent(table)}`, undefined, query, pat, base));
        data.records = (data.records || []).map(normalizeRecord);
        res.json(data);
    }
    catch (e) {
        const err = e;
        res.status(500).json({ message: err.message });
    }
});
// Health check
app.get('/', (_req, res) => {
    res.json({ ok: true });
});
app.get('/tables/:table/:id', async (req, res) => {
    try {
        const { table, id } = req.params;
        const data = await withSecrets(async (pat, base) => airtableRequest('get', `/${encodeURIComponent(table)}/${encodeURIComponent(id)}`, undefined, undefined, pat, base));
        res.json(normalizeRecord(data));
    }
    catch (e) {
        const err = e;
        res.status(500).json({ message: err.message });
    }
});
app.post('/tables/:table', async (req, res) => {
    try {
        const { table } = req.params;
        const { fields } = req.body || {};
        const data = await withSecrets(async (pat, base) => airtableRequest('post', `/${encodeURIComponent(table)}`, { fields }, undefined, pat, base));
        res.json(normalizeRecord(data));
    }
    catch (e) {
        const err = e;
        res.status(500).json({ message: err.message });
    }
});
app.patch('/tables/:table/:id', async (req, res) => {
    try {
        const { table, id } = req.params;
        const { fields } = req.body || {};
        const data = await withSecrets(async (pat, base) => airtableRequest('patch', `/${encodeURIComponent(table)}/${encodeURIComponent(id)}`, { fields }, undefined, pat, base));
        res.json(normalizeRecord(data));
    }
    catch (e) {
        const err = e;
        res.status(500).json({ message: err.message });
    }
});
app.delete('/tables/:table/:id', async (req, res) => {
    try {
        const { table, id } = req.params;
        await withSecrets(async (pat, base) => airtableRequest('delete', `/${encodeURIComponent(table)}/${encodeURIComponent(id)}`, undefined, undefined, pat, base));
        res.json({ success: true });
    }
    catch (e) {
        const err = e;
        res.status(500).json({ message: err.message });
    }
});
// Export as a single HTTPS function
exports.api = functions
    .region('asia-southeast1')
    .runWith({ timeoutSeconds: 60, memory: '256MB' })
    .https.onRequest(app);
// --- Domain helpers: Likes ---
// Server-side like registry to ensure integrity and per-user single-like
// Table: TutoPostLikes (fields: Post ID, User ID, Created At)
// POST /likes { postId, userId }
// DELETE /likes { postId, userId }
app.post('/likes', async (req, res) => {
    try {
        const { postId, userId } = req.body || {};
        if (!postId || !userId)
            return res.status(400).json({ message: 'postId and userId are required' });
        // Check if like exists
        const existsResp = await withSecrets(async (pat, base) => airtableRequest('get', `/TutoPostLikes`, undefined, { filterByFormula: `AND({Post ID} = '${postId}', {User ID} = '${userId}')`, maxRecords: 1 }, pat, base));
        if ((existsResp.records || []).length > 0)
            return res.json(normalizeRecord(existsResp.records[0]));
        // Create like
        const created = await withSecrets(async (pat, base) => airtableRequest('post', `/TutoPostLikes`, { fields: { 'Post ID': postId, 'User ID': userId, 'Created At': new Date().toISOString() } }, undefined, pat, base));
        res.json(normalizeRecord(created));
    }
    catch (e) {
        const err = e;
        res.status(500).json({ message: err.message });
    }
});
app.delete('/likes', async (req, res) => {
    try {
        const { postId, userId } = (req.body || req.query);
        if (!postId || !userId)
            return res.status(400).json({ message: 'postId and userId are required' });
        // Find like record
        const existsResp = await withSecrets(async (pat, base) => airtableRequest('get', `/TutoPostLikes`, undefined, { filterByFormula: `AND({Post ID} = '${postId}', {User ID} = '${userId}')`, maxRecords: 1 }, pat, base));
        const rec = (existsResp.records || [])[0];
        if (!rec)
            return res.json({ success: true });
        // Delete like
        await withSecrets(async (pat, base) => airtableRequest('delete', `/TutoPostLikes/${rec.id}`, undefined, undefined, pat, base));
        res.json({ success: true });
    }
    catch (e) {
        const err = e;
        res.status(500).json({ message: err.message });
    }
});
// GET /likes/count?postId=xxx
app.get('/likes/count', async (req, res) => {
    try {
        const postId = String((req.query?.postId || '')).trim();
        if (!postId)
            return res.status(400).json({ message: 'postId is required' });
        const resp = await withSecrets(async (pat, base) => airtableRequest('get', `/TutoPostLikes`, undefined, { filterByFormula: `{Post ID} = '${postId}'`, pageSize: 1000, maxRecords: 1000 }, pat, base));
        const count = (resp?.records || []).length;
        res.json({ count });
    }
    catch (e) {
        const err = e;
        res.status(500).json({ message: err.message });
    }
});
// Token verification middleware for /api routes (applies below; providers endpoints above are public)
const verifyIdToken = async (req, res, next) => {
    try {
        const authHeader = req.header('authorization') || req.header('Authorization') || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
        if (!token)
            return res.status(401).json({ ok: false, code: 'NO_TOKEN' });
        const decoded = await admin.auth().verifyIdToken(token);
        req.user = { uid: decoded.uid };
        return next();
    }
    catch (e) {
        return res.status(401).json({ ok: false, code: 'INVALID_TOKEN' });
    }
};
// Attach middleware only to /api namespace
app.use('/api', verifyIdToken);
// POST /api/users/getByUid { uid }
app.post('/api/users/getByUid', async (req, res) => {
    try {
        const uid = req.body?.uid || req.user?.uid;
        if (!uid)
            return res.status(400).json({ ok: false, code: 'MISSING_UID' });
        const data = await withSecrets(async (pat, base) => airtableRequest('get', `/Users`, undefined, { filterByFormula: `{firebaseUid} = '${uid}'`, maxRecords: 1 }, pat, base));
        const rec = (data?.records || [])[0];
        if (!rec)
            return res.status(404).json({ ok: false, code: 'NOT_FOUND' });
        return res.json({ ok: true, user: normalizeRecord(rec) });
    }
    catch (e) {
        const err = e;
        return res.status(500).json({ ok: false, code: 'INTERNAL', message: err.message });
    }
});
// POST /api/users/upsertRole { uid, role }
app.post('/api/users/upsertRole', async (req, res) => {
    try {
        const uid = req.body?.uid || req.user?.uid;
        const role = String(req.body?.role || '').trim();
        if (!uid)
            return res.status(400).json({ ok: false, code: 'MISSING_UID' });
        if (!['teacher', 'parent', 'student'].includes(role)) {
            return res.status(400).json({ ok: false, code: 'INVALID_ROLE' });
        }
        const found = await withSecrets(async (pat, base) => airtableRequest('get', `/Users`, undefined, { filterByFormula: `{firebaseUid} = '${uid}'`, maxRecords: 1 }, pat, base));
        const existing = (found?.records || [])[0];
        if (existing) {
            await withSecrets(async (pat, base) => airtableRequest('patch', `/Users/${existing.id}`, { fields: { role } }, undefined, pat, base));
            return res.json({ ok: true });
        }
        await withSecrets(async (pat, base) => airtableRequest('post', `/Users`, { fields: { firebaseUid: uid, role } }, undefined, pat, base));
        return res.json({ ok: true });
    }
    catch (e) {
        const err = e;
        return res.status(500).json({ ok: false, code: 'INTERNAL', message: err.message });
    }
});
// Helpers: resolve guardian user id from token → Users.firebaseUid
const resolveGuardianUserId = async (uidFromToken) => {
    const found = await withSecrets(async (pat, base) => airtableRequest('get', `/Users`, undefined, { filterByFormula: `{firebaseUid} = '${uidFromToken}'`, maxRecords: 1 }, pat, base));
    const rec = (found?.records || [])[0];
    return rec ? rec.id : null;
};
// Helpers: compute full name initials (e.g., "Nguyễn A. M.")
const toInitials = (fullName) => {
    if (!fullName)
        return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1)
        return parts[0][0]?.toUpperCase() || '';
    const first = parts[0];
    const rest = parts.slice(1).map(p => (p[0] ? `${p[0].toUpperCase()}.` : ''));
    return `${first} ${rest.join(' ')}`.trim();
};
// Simple in-memory rate limiter for lookups (per IP + route)
const failedAttempts = {};
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 min
const RATE_LIMIT_BLOCK_MS = 30 * 60 * 1000; // 30 min
const RATE_LIMIT_MAX_FAILS = 5;
const checkRateLimit = (key) => {
    const now = Date.now();
    const item = failedAttempts[key];
    if (item?.blockedUntil && now < item.blockedUntil)
        return false;
    if (item && now - item.firstAt > RATE_LIMIT_WINDOW_MS)
        delete failedAttempts[key];
    return true;
};
const registerFail = (key) => {
    const now = Date.now();
    const item = failedAttempts[key];
    if (!item) {
        failedAttempts[key] = { count: 1, firstAt: now };
        return;
    }
    if (now - item.firstAt > RATE_LIMIT_WINDOW_MS) {
        failedAttempts[key] = { count: 1, firstAt: now };
        return;
    }
    item.count += 1;
    if (item.count >= RATE_LIMIT_MAX_FAILS) {
        item.blockedUntil = now + RATE_LIMIT_BLOCK_MS;
    }
};
const clearFails = (key) => { delete failedAttempts[key]; };
// Ensure all guardian endpoints are behind /api and token middleware
// POST /api/guardian/lookupCode { code }
app.post('/api/guardian/lookupCode', async (req, res) => {
    try {
        const ipKey = `${req.ip}:lookupCode`;
        if (!checkRateLimit(ipKey))
            return res.status(429).json({ ok: false, code: 'TOO_MANY_ATTEMPTS', message: 'Too many attempts. Try later.' });
        const rawCode = String((req.body?.code || '')).trim();
        if (!rawCode)
            return res.status(400).json({ ok: false, code: 'INVALID_CODE', message: 'Code required' });
        const code = rawCode.toUpperCase();
        const invite = await withSecrets(async (pat, base) => airtableRequest('get', `/InviteCodes`, undefined, { filterByFormula: `{code} = '${code}'`, maxRecords: 1 }, pat, base));
        const rec = (invite?.records || [])[0];
        if (!rec) {
            registerFail(ipKey);
            return res.status(404).json({ ok: false, code: 'INVALID_CODE', message: 'Invalid code' });
        }
        const fields = rec.fields || {};
        const expiresAt = fields.expiresAt;
        const maxUses = Number(fields.maxUses || 0);
        const uses = Number(fields.uses || 0);
        if (expiresAt && Date.parse(expiresAt) < Date.now()) {
            registerFail(ipKey);
            return res.status(410).json({ ok: false, code: 'EXPIRED_CODE', message: 'Code expired' });
        }
        if (maxUses && uses >= maxUses) {
            registerFail(ipKey);
            return res.status(409).json({ ok: false, code: 'MAX_USES_REACHED', message: 'Max uses reached' });
        }
        const studentId = fields.studentId;
        if (!studentId) {
            registerFail(ipKey);
            return res.status(404).json({ ok: false, code: 'INVALID_CODE', message: 'Invalid code' });
        }
        const student = await withSecrets(async (pat, base) => airtableRequest('get', `/Students/${encodeURIComponent(studentId)}`, undefined, undefined, pat, base));
        const sFields = student.fields || {};
        const fullName = sFields.fullName || '';
        const grade = sFields.grade || '';
        clearFails(ipKey);
        return res.json({ ok: true, student: { id: student.id, fullNameInitials: toInitials(fullName), grade }, expiresAt: expiresAt || null });
    }
    catch (e) {
        const err = e;
        return res.status(500).json({ ok: false, code: 'INTERNAL', message: err.message });
    }
});
// POST /api/guardian/createLink { studentId, method }
app.post('/api/guardian/createLink', async (req, res) => {
    try {
        const uid = req.user?.uid;
        const guardianUserId = await resolveGuardianUserId(uid);
        if (!guardianUserId)
            return res.status(403).json({ ok: false, code: 'NOT_AUTHORIZED', message: 'User not found' });
        const studentId = String(req.body?.studentId || '').trim();
        const method = String(req.body?.method || '').trim();
        if (!studentId || !['code', 'qr', 'id'].includes(method))
            return res.status(400).json({ ok: false, code: 'INVALID_REQUEST', message: 'Invalid params' });
        // Already linked?
        const links = await withSecrets(async (pat, base) => airtableRequest('get', `/GuardianStudentLinks`, undefined, { filterByFormula: `AND({guardianUserId} = '${guardianUserId}', {studentId} = '${studentId}')`, maxRecords: 1 }, pat, base));
        const existing = (links?.records || [])[0];
        if (existing && (existing.fields?.status === 'active' || existing.fields?.status === 'pending')) {
            return res.json({ ok: true, link: { id: existing.id, status: existing.fields.status } });
        }
        // Create pending link
        const created = await withSecrets(async (pat, base) => airtableRequest('post', `/GuardianStudentLinks`, { fields: {
                guardianUserId,
                studentId,
                linkMethod: method,
                status: 'pending',
                requestedAt: new Date().toISOString(),
                createdByUid: uid,
            } }, undefined, pat, base));
        return res.json({ ok: true, link: { id: created.id, status: 'pending' } });
    }
    catch (e) {
        const err = e;
        return res.status(500).json({ ok: false, code: 'INTERNAL', message: err.message });
    }
});
// POST /api/guardian/getLinkById { linkId }
app.post('/api/guardian/getLinkById', async (req, res) => {
    try {
        const uid = req.user?.uid;
        const guardianUserId = await resolveGuardianUserId(uid);
        if (!guardianUserId)
            return res.status(403).json({ ok: false, code: 'NOT_AUTHORIZED', message: 'User not found' });
        const linkId = String(req.body?.linkId || '').trim();
        if (!linkId)
            return res.status(400).json({ ok: false, code: 'INVALID_REQUEST', message: 'linkId required' });
        const link = await withSecrets(async (pat, base) => airtableRequest('get', `/GuardianStudentLinks/${encodeURIComponent(linkId)}`, undefined, undefined, pat, base));
        if (!link || link.fields?.guardianUserId !== guardianUserId)
            return res.status(403).json({ ok: false, code: 'NOT_AUTHORIZED', message: 'Not your link' });
        return res.json({ ok: true, link: { id: link.id, status: link.fields.status } });
    }
    catch (e) {
        const err = e;
        return res.status(500).json({ ok: false, code: 'INTERNAL', message: err.message });
    }
});
// POST /api/guardian/getLinksForGuardian {}
app.post('/api/guardian/getLinksForGuardian', async (req, res) => {
    try {
        const uid = req.user?.uid;
        const guardianUserId = await resolveGuardianUserId(uid);
        if (!guardianUserId)
            return res.status(403).json({ ok: false, code: 'NOT_AUTHORIZED', message: 'User not found' });
        const links = await withSecrets(async (pat, base) => airtableRequest('get', `/GuardianStudentLinks`, undefined, { filterByFormula: `{guardianUserId} = '${guardianUserId}'` }, pat, base));
        const out = (links?.records || []).map((r) => ({ id: r.id, studentId: r.fields?.studentId, status: r.fields?.status }));
        return res.json({ ok: true, links: out });
    }
    catch (e) {
        const err = e;
        return res.status(500).json({ ok: false, code: 'INTERNAL', message: err.message });
    }
});
// POST /api/guardian/revokeLink { linkId, reason }
app.post('/api/guardian/revokeLink', async (req, res) => {
    try {
        const uid = req.user?.uid;
        const guardianUserId = await resolveGuardianUserId(uid);
        if (!guardianUserId)
            return res.status(403).json({ ok: false, code: 'NOT_AUTHORIZED', message: 'User not found' });
        const linkId = String(req.body?.linkId || '').trim();
        const reason = String(req.body?.reason || '').trim();
        if (!linkId)
            return res.status(400).json({ ok: false, code: 'INVALID_REQUEST', message: 'linkId required' });
        const link = await withSecrets(async (pat, base) => airtableRequest('get', `/GuardianStudentLinks/${encodeURIComponent(linkId)}`, undefined, undefined, pat, base));
        if (!link || link.fields?.guardianUserId !== guardianUserId)
            return res.status(403).json({ ok: false, code: 'NOT_AUTHORIZED', message: 'Not your link' });
        await withSecrets(async (pat, base) => airtableRequest('patch', `/GuardianStudentLinks/${link.id}`, { fields: { status: 'revoked', revokedReason: reason || undefined } }, undefined, pat, base));
        return res.json({ ok: true });
    }
    catch (e) {
        const err = e;
        return res.status(500).json({ ok: false, code: 'INTERNAL', message: err.message });
    }
});
// POST /api/students/searchById { studentCode }
app.post('/api/students/searchById', async (req, res) => {
    try {
        const ipKey = `${req.ip}:searchById`;
        if (!checkRateLimit(ipKey))
            return res.status(429).json({ ok: false, code: 'TOO_MANY_ATTEMPTS', message: 'Too many attempts. Try later.' });
        const raw = String(req.body?.studentCode || '').trim();
        if (!raw)
            return res.status(400).json({ ok: false, code: 'INVALID_REQUEST', message: 'studentCode required' });
        const studentCode = raw.toUpperCase();
        const result = await withSecrets(async (pat, base) => airtableRequest('get', `/Students`, undefined, { filterByFormula: `{studentCode} = '${studentCode}'`, maxRecords: 1 }, pat, base));
        const rec = (result?.records || [])[0];
        if (!rec) {
            registerFail(ipKey);
            return res.status(404).json({ ok: false, code: 'INVALID_CODE', message: 'Not found' });
        }
        const fields = rec.fields || {};
        const fullName = fields.fullName || '';
        const grade = fields.grade || '';
        clearFails(ipKey);
        return res.json({ ok: true, student: { id: rec.id, fullNameInitials: toInitials(fullName), grade } });
    }
    catch (e) {
        const err = e;
        return res.status(500).json({ ok: false, code: 'INTERNAL', message: err.message });
    }
});
// POST /api/students/getByQrToken { qrToken }
app.post('/api/students/getByQrToken', async (req, res) => {
    try {
        const ipKey = `${req.ip}:getByQrToken`;
        if (!checkRateLimit(ipKey))
            return res.status(429).json({ ok: false, code: 'TOO_MANY_ATTEMPTS', message: 'Too many attempts. Try later.' });
        const qrToken = String(req.body?.qrToken || '').trim();
        if (!qrToken)
            return res.status(400).json({ ok: false, code: 'INVALID_REQUEST', message: 'qrToken required' });
        const result = await withSecrets(async (pat, base) => airtableRequest('get', `/Students`, undefined, { filterByFormula: `{qrToken} = '${qrToken}'`, maxRecords: 1 }, pat, base));
        const rec = (result?.records || [])[0];
        if (!rec) {
            registerFail(ipKey);
            return res.status(404).json({ ok: false, code: 'INVALID_CODE', message: 'Not found' });
        }
        const fields = rec.fields || {};
        const fullName = fields.fullName || '';
        const grade = fields.grade || '';
        clearFails(ipKey);
        return res.json({ ok: true, student: { id: rec.id, fullNameInitials: toInitials(fullName), grade } });
    }
    catch (e) {
        const err = e;
        return res.status(500).json({ ok: false, code: 'INTERNAL', message: err.message });
    }
});
// --- StudentProfiles (auth) ---
app.post('/api/studentProfiles/create', async (req, res) => {
    try {
        const uid = req.user?.uid;
        if (!uid)
            return res.status(401).json({ ok: false, code: 'NO_TOKEN' });
        const guardianUserId = await resolveGuardianUserId(uid);
        if (!guardianUserId)
            return res.status(403).json({ ok: false, code: 'NOT_AUTHORIZED' });
        const { fullName, grade, yearOfBirth, notes } = req.body || {};
        if (!fullName || !grade)
            return res.status(400).json({ ok: false, code: 'INVALID_REQUEST' });
        const created = await withSecrets(async (pat, base) => airtableRequest('post', `/StudentProfiles`, { fields: { fullName, grade, yearOfBirth, notes, guardianUserId, createdAt: new Date().toISOString() } }, undefined, pat, base));
        return res.json({ ok: true, profile: { id: created.id } });
    }
    catch (e) {
        const err = e;
        return res.status(500).json({ ok: false, code: 'INTERNAL', message: err.message });
    }
});
app.post('/api/studentProfiles/listForGuardian', async (req, res) => {
    try {
        const uid = req.user?.uid;
        if (!uid)
            return res.status(401).json({ ok: false, code: 'NO_TOKEN' });
        const guardianUserId = await resolveGuardianUserId(uid);
        if (!guardianUserId)
            return res.status(403).json({ ok: false, code: 'NOT_AUTHORIZED' });
        const data = await withSecrets(async (pat, base) => airtableRequest('get', `/StudentProfiles`, undefined, { filterByFormula: `{guardianUserId} = '${guardianUserId}'` }, pat, base));
        const items = (data?.records || []).map((r) => ({ id: r.id, ...(r.fields || {}) }));
        return res.json({ ok: true, profiles: items });
    }
    catch (e) {
        const err = e;
        return res.status(500).json({ ok: false, code: 'INTERNAL', message: err.message });
    }
});
