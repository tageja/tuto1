const CATEGORY_EN: Record<string, string> = {
  bug: 'Bug / Something broken',
  feature: 'Feature request',
  improvement: 'Improvement',
  question: 'Question',
  other: 'Other',
};

export function platformFeedbackCreatedEmail(input: {
  schoolName: string;
  submitterName: string;
  submitterEmail: string;
  category: string;
  body: string;
  detailUrl: string;
}) {
  const cat = CATEGORY_EN[input.category] ?? input.category;
  const subject = `[Tuto Feedback] ${cat} from ${input.schoolName}`;
  const text = [
    `New platform feedback`,
    ``,
    `School: ${input.schoolName}`,
    `Submitter: ${input.submitterName} <${input.submitterEmail}>`,
    `Category: ${cat}`,
    ``,
    input.body,
    ``,
    `Open in dashboard: ${input.detailUrl}`,
  ].join('\n');

  const html = `
<!DOCTYPE html>
<html><body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
  <h2>New platform feedback</h2>
  <p><strong>School:</strong> ${escapeHtml(input.schoolName)}</p>
  <p><strong>Submitter:</strong> ${escapeHtml(input.submitterName)} &lt;${escapeHtml(input.submitterEmail)}&gt;</p>
  <p><strong>Category:</strong> ${escapeHtml(cat)}</p>
  <hr />
  <pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(input.body)}</pre>
  <p><a href="${escapeAttr(input.detailUrl)}">Open in Tuto Admin</a></p>
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
