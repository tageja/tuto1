const STATUS_EN: Record<string, string> = {
  open: 'Open',
  in_progress: 'In progress',
  closed: 'Closed',
  rejected: 'Rejected',
};

export function platformFeedbackRespondedEmail(input: {
  submitterName: string;
  bodyExcerpt: string;
  status: string;
  adminResponse: string | null;
  helpUrl: string;
}) {
  const statusLabel = STATUS_EN[input.status] ?? input.status;
  const subject = `[Tuto] Update on your feedback`;
  const text = [
    `Hi ${input.submitterName},`,
    ``,
    `Tuto has responded to your feedback.`,
    ``,
    `Your message (excerpt):`,
    input.bodyExcerpt,
    ``,
    `Status: ${statusLabel}`,
    input.adminResponse ? `\nResponse:\n${input.adminResponse}` : '',
    ``,
    `View updates: ${input.helpUrl}`,
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html><body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <p>Hi ${escapeHtml(input.submitterName)},</p>
  <p>Tuto has responded to your feedback.</p>
  <p><strong>Your message (excerpt):</strong></p>
  <blockquote style="border-left: 3px solid #0B5FFF; padding-left: 12px; margin: 0;">${escapeHtml(input.bodyExcerpt)}</blockquote>
  <p><strong>Status:</strong> ${escapeHtml(statusLabel)}</p>
  ${
    input.adminResponse
      ? `<p><strong>Response:</strong></p><pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(input.adminResponse)}</pre>`
      : ''
  }
  <p><a href="${escapeAttr(input.helpUrl)}">Open Help &amp; Support</a></p>
</body></html>`;

  return { subject, html, text };
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s: string) {
  return escapeHtml(s).replace(/'/g, '&#39;');
}
