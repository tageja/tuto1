import request from 'supertest';

const BASE = process.env.EMULATOR_BASE || 'https://asia-southeast1-tuto1-73fc4.cloudfunctions.net/api';
const TOKEN = process.env.TEST_ID_TOKEN || '';

const authHeaders = TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {} as any;

describe('Guardian linking endpoints (smoke)', () => {
  it('lookupCode returns masked preview or proper error', async () => {
    const res = await request(BASE)
      .post('/api/guardian/lookupCode')
      .set(authHeaders)
      .send({ code: 'ABC123' });
    expect([200, 404, 410, 409, 429].includes(res.status)).toBe(true);
    if (res.status === 200) {
      expect(res.body.ok).toBe(true);
      expect(res.body.student).toHaveProperty('fullNameInitials');
      expect(res.body.student).toHaveProperty('grade');
    }
  });

  it('createLink returns link id and status', async () => {
    const res = await request(BASE)
      .post('/api/guardian/createLink')
      .set(authHeaders)
      .send({ studentId: 'stu_1', method: 'code' });
    expect([200, 403, 400].includes(res.status)).toBe(true);
    if (res.status === 200) {
      expect(res.body.ok).toBe(true);
      expect(res.body.link).toHaveProperty('id');
      expect(res.body.link).toHaveProperty('status');
    }
  });

  it('getLinkById returns link status', async () => {
    const res = await request(BASE)
      .post('/api/guardian/getLinkById')
      .set(authHeaders)
      .send({ linkId: 'lnk_1' });
    expect([200, 403, 400].includes(res.status)).toBe(true);
  });
});





















