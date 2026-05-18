/**
 * One-time script: send thank-you email to all HCMUTE survey respondents.
 * Usage:
 *   $env:RESEND_API_KEY="re_xxxx"   # PowerShell
 *   node scripts/send-hcmute-thankyou.mjs
 *
 * Dry-run (no emails sent, just prints recipients):
 *   $env:DRY_RUN="1"; node scripts/send-hcmute-thankyou.mjs
 */

import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
if (!RESEND_API_KEY) {
  console.error('ERROR: RESEND_API_KEY env var is not set.');
  process.exit(1);
}

const DRY_RUN = process.env.DRY_RUN === '1';
const FROM    = 'tuto. Pro <support@tutoglobal.com>';
const SUBJECT = 'Cảm ơn bạn đã tham gia khảo sát — và một góc nhìn về tiếng Anh thời AI 🎓';

// ─── Recipients (from hcmute_2026 survey, 2026-05-13 → 2026-05-14) ───────────
// NOTE: leduchung6a6@gnail.com looks like a typo — may bounce.
const RECIPIENTS = [
  { id: '0e84c92a-ce5a-4725-af06-2ed84d743b8b', name: 'Tarun Tageja',          email: 'tarun.tageja@gmail.com' },
  { id: '4a2836b0-185f-48c8-bdf1-970f39700dcc', name: 'Huỳnh Dư Long',         email: 'fengalaudicomrimen@gmail.com' },
  { id: '42ab9192-731d-47ac-9cdf-cd781f393dd9', name: 'Trần Minh Khoa',        email: 'tranminhkhoa12345678@gmail.com' },
  { id: 'ab27bcec-1950-4c0d-b5f9-59849d46211b', name: 'Nguyễn Nhựt Anh',       email: 'nguyennhutanh2006lhp@gmail.com' },
  { id: '52489e36-9c9c-4ef5-bdc2-dbb8fb9f6ed4', name: 'Lê Thành An',           email: 'hao93bp@gmail.com' },
  { id: '19e04c5d-844d-41e7-8ddf-b42fbed66292', name: 'Huỳnh Trương Phong',    email: 'phongggg17182006@gmail.com' },
  { id: 'b54e1692-4248-4175-a446-e6515f4c6292', name: 'Cao Đỗ Trí Dũng',       email: 'caodotridung2802@gmail.com' },
  { id: 'e1a9949f-91e9-4d18-a94f-257f26ca8a0c', name: 'Lê Tuấn Thành',         email: 'letuanthanh213@gmail.com' },
  { id: 'd2ea89a5-d5ba-484e-803a-0ccae879f08d', name: 'Vương Hoàng Gia',        email: 'vuonghoanggia2006@gmail.com' },
  { id: '2fe57ced-eaa9-440c-8a6b-a8ec678c3b00', name: 'Nguyễn Chí Khang',      email: 'khangst8888@gmail.com' },
  { id: 'df179aa7-c271-4ce7-971a-788cdb0009b0', name: 'Trần Võ Thanh Duy',     email: 'thanhduy40@gmail.com' },
  { id: 'f5d47c6b-b683-497a-81c0-c3aafeb86fb8', name: 'Nguyễn Đăk Lộc',        email: '24110107@student.hcmute.edu.vn' },
  { id: 'f6d566b2-7c07-466f-a18a-ece7b03a45fe', name: 'Bảo Hân',               email: 'baohan7765@gmail.com' },
  { id: 'f6d58bf9-5d0f-405c-9d7d-736caa694ee3', name: 'Lê Đức Hưng',           email: 'leduchung6a6@gnail.com' }, // ⚠ likely typo
  { id: '83f810db-39f0-42ce-a5a0-2dacf5fc9c32', name: 'Võ Thị Minh Ngọc',      email: 'minhngoc.vtmn1003@gmail.com' },
  { id: '228c4d9e-9a11-4ab0-abbf-4f39fecdfb83', name: 'Phạm Đức Anh',          email: '03.phamducanh@gmail.com' },
  { id: 'f7277936-3ed6-4b16-9c96-6674e0f603dd', name: 'Ngô Phước An',           email: 'angophuocan@gmail.com' },
  { id: 'a6c43db6-bd16-410a-949c-fb4be7a23032', name: 'Hào Trần',              email: 'chanhhao2006@gmail.com' },
  { id: 'b372bc7a-5c75-4a16-a411-cbdf07061019', name: 'Võ Tuấn Khanh',         email: 'bighero6.pv3@gmail.com' },
  { id: '2baa77e1-3771-4942-86c4-4bc71b81e945', name: 'Thái Bảo Tùng',         email: 'baotung4a1@gmail.com' },
  { id: '88f7f5fe-dd69-4c46-9908-80799fb22522', name: 'Nguyễn Phi Nguyên',     email: 'nguyenphinguyen032@gmail.com' },
];

// ─── Email builder ────────────────────────────────────────────────────────────

function buildHtml(firstName) {
  return /* html */`
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${SUBJECT}</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f6fb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrap { max-width: 580px; margin: 32px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; }
    .header { background: linear-gradient(135deg, #0B5FFF 0%, #4338ca 100%); padding: 36px 40px 28px; text-align: center; }
    .header img { height: 36px; }
    .header h1 { margin: 16px 0 0; color: #fff; font-size: 22px; font-weight: 700; line-height: 1.3; }
    .body { padding: 36px 40px; }
    .hi { font-size: 16px; color: #111827; font-weight: 600; margin: 0 0 16px; }
    p { font-size: 15px; color: #374151; line-height: 1.65; margin: 0 0 16px; }
    .insight-box { background: #f0f4ff; border-left: 4px solid #0B5FFF; border-radius: 0 12px 12px 0; padding: 16px 20px; margin: 24px 0; }
    .insight-box p { margin: 0; color: #1e3a8a; font-size: 14px; line-height: 1.6; }
    .cta-wrap { text-align: center; margin: 28px 0; }
    .cta { display: inline-block; background: #0B5FFF; color: #fff !important; text-decoration: none; padding: 13px 30px; border-radius: 10px; font-size: 15px; font-weight: 600; }
    .divider { border: none; border-top: 1px solid #f3f4f6; margin: 28px 0; }
    .footer { padding: 24px 40px; background: #f9fafb; text-align: center; }
    .footer p { font-size: 12px; color: #9ca3af; margin: 0; line-height: 1.6; }
    .tag { display: inline-block; background: #eff6ff; color: #1d4ed8; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; margin-bottom: 6px; letter-spacing: 0.04em; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="wrap">
    <!-- Header -->
    <div class="header">
      <img src="https://pro.tuto.asia/images/tuto-logo-white.png" alt="tuto. Pro" onerror="this.style.display='none'" />
      <h1>Cảm ơn bạn đã dành thời gian cho chúng tôi 🙏</h1>
    </div>

    <!-- Body -->
    <div class="body">
      <p class="hi">Chào ${firstName},</p>

      <p>
        Cảm ơn bạn đã tham gia khảo sát của <strong>tuto. Pro</strong> — mỗi câu trả lời là một viên gạch
        giúp chúng tôi xây dựng nền tảng học tiếng Anh chuyên ngành thực sự phù hợp với sinh viên
        kỹ thuật Việt Nam.
      </p>

      <p>
        Chúng tôi đang tổng hợp kết quả và <strong>sẽ liên hệ lại trong thời gian sớm</strong> với
        thông tin về voucher cũng như các cập nhật tiếp theo từ dự án.
      </p>

      <hr class="divider" />

      <span class="tag">Góc nhìn từ chúng tôi</span>
      <p style="margin-top: 10px;">
        Bạn có thể đang tự hỏi: <em>AI dịch ngay lập tức rồi — còn cần học tiếng Anh không?</em>
      </p>
      <p>
        Câu trả lời ngắn gọn: <strong>vẫn cần, và có lẽ còn cần hơn trước.</strong>
      </p>

      <div class="insight-box">
        <p>
          Công cụ AI dịch theo <em>pattern</em> — không phải theo <em>hiểu biết</em>.
          Chúng dễ mắc lỗi với ngữ cảnh chuyên ngành, sắc thái văn hoá và những tình huống đòi hỏi
          phán đoán thực sự. Trong kỹ thuật, một lỗi dịch thuật sai có thể là
          một lỗi hệ thống nghiêm trọng. Người giỏi tiếng Anh không chỉ <em>đọc được</em>
          tài liệu — họ <em>hiểu</em> được tài liệu, và đó là khoảng cách AI chưa lấp được.
        </p>
      </div>

      <p>
        Một nghiên cứu gần đây từ <em>The Conversation</em> còn chỉ ra rằng quá trình
        <strong>học ngôn ngữ thực sự</strong> — vật lộn với từ vựng, xây dựng câu, tiêu hoá
        tài liệu chuyên ngành — giúp tăng cường trí nhớ làm việc và khả năng tư duy linh hoạt
        theo cách mà dịch máy thụ động không bao giờ làm được.
      </p>

      <div class="cta-wrap">
        <a class="cta" href="https://theconversation.com/if-ai-can-translate-instantly-why-learn-another-language-280310" target="_blank">
          Đọc bài viết đầy đủ →
        </a>
      </div>

      <hr class="divider" />

      <p>
        Đó chính xác là hướng <strong>tuto. Pro</strong> đang xây dựng — không phải
        "học tiếng Anh phổ thông", mà là <strong>tiếng Anh chuyên ngành</strong> được thiết kế
        cho môi trường kỹ thuật: đọc tài liệu, debug, thuyết trình dự án, viết báo cáo, phỏng vấn
        công ty nước ngoài.
      </p>

      <p>
        Chúng tôi sẽ sớm quay lại. Cảm ơn bạn một lần nữa vì đã tin tưởng và dành thời gian!
      </p>

      <p style="margin-top: 24px;">Trân trọng,<br/><strong>Tarun &amp; đội ngũ tuto. Pro</strong></p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>tuto. Pro · pro.tuto.asia</p>
      <p style="margin-top: 6px;">Bạn nhận email này vì đã tham gia khảo sát HCMUTE của chúng tôi.</p>
    </div>
  </div>
</body>
</html>
`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const resend = new Resend(RESEND_API_KEY);

  console.log(`\n📬  tuto. HCMUTE thank-you email sender`);
  console.log(`    Recipients : ${RECIPIENTS.length}`);
  console.log(`    From       : ${FROM}`);
  console.log(`    Mode       : ${DRY_RUN ? 'DRY RUN (no emails sent)' : 'LIVE'}\n`);

  if (DRY_RUN) {
    RECIPIENTS.forEach((r) => console.log(`  → ${r.name} <${r.email}>`));
    console.log('\n✅  Dry run complete — no emails sent.');
    return;
  }

  // Send in batches of 10 (Resend batch limit is 100, but we stay conservative)
  const BATCH_SIZE = 10;
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < RECIPIENTS.length; i += BATCH_SIZE) {
    const batch = RECIPIENTS.slice(i, i + BATCH_SIZE);
    const emails = batch.map((r) => {
      const firstName = r.name.split(' ')[0];
      return {
        from: FROM,
        to: [r.email],
        subject: SUBJECT,
        html: buildHtml(firstName),
        // idempotency per recipient prevents duplicates if script re-runs
        // (passed via the batch array — each object is one send)
        headers: { 'X-Idempotency-Key': `hcmute-thankyou-2026/${r.id}` },
      };
    });

    const { data, error } = await resend.batch.send(emails);

    if (error) {
      console.error(`  ✗ Batch ${i / BATCH_SIZE + 1} failed:`, error.message);
      failed += batch.length;
    } else {
      const results = data?.data ?? [];
      results.forEach((result, idx) => {
        const r = batch[idx];
        if (result.id) {
          console.log(`  ✓ ${r.name} <${r.email}>  →  ${result.id}`);
          sent++;
        } else {
          console.error(`  ✗ ${r.name} <${r.email}>  →  failed`);
          failed++;
        }
      });
    }

    // Respect Resend rate limit: 2 req/s → wait 600ms between batches
    if (i + BATCH_SIZE < RECIPIENTS.length) {
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }

  console.log(`\n📊  Done — ${sent} sent, ${failed} failed out of ${RECIPIENTS.length} total.`);
  if (failed > 0) {
    console.log(`    Note: ${failed} failure(s) — check Resend dashboard for details.`);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
