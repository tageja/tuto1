import { getResend } from './client';

export async function sendMail(args: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const from = process.env.PLATFORM_FEEDBACK_FROM;
  if (!from) return { ok: false, error: 'PLATFORM_FEEDBACK_FROM not set' };
  try {
    const resp = await getResend().emails.send({ from, ...args });
    if (resp.error) return { ok: false, error: resp.error.message };
    return { ok: true, id: resp.data?.id ?? '' };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
