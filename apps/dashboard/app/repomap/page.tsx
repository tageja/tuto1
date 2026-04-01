import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tuto — Branch Map',
  description: 'GitHub branch overview for the Tuto project',
};

export default function RepoMapPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

        :root {
          --blue: #0B5FFF;
          --blue-light: #EEF3FF;
          --blue-mid: #93B4FF;
          --green: #00C48C;
          --green-light: #E6FAF5;
          --amber: #F5A623;
          --amber-light: #FFF7E6;
          --purple: #7C3AED;
          --purple-light: #F5F3FF;
          --grey: #8492A6;
          --grey-light: #F4F6FA;
          --ink: #1A202C;
          --card: #FFFFFF;
          --bg: #F0F4FF;
          --border: #E2E8F4;
          --track: #CBD5E8;
        }
        .rm-body {
          font-family: 'Space Grotesk', sans-serif;
          background: var(--bg);
          color: var(--ink);
          min-height: 100vh;
          padding: 40px 32px 80px;
        }
        .rm-header { display: flex; align-items: center; gap: 16px; margin-bottom: 36px; }
        .rm-logo { font-size: 28px; font-weight: 700; letter-spacing: -1px; }
        .rm-logo span { color: var(--blue); }
        .rm-header-meta {
          margin-left: auto; font-size: 12px; color: var(--grey);
          font-family: 'JetBrains Mono', monospace;
          background: white; padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border);
        }
        .rm-stats-bar { display: flex; gap: 12px; margin-bottom: 32px; flex-wrap: wrap; }
        .rm-stat-pill {
          background: white; border: 1px solid var(--border); border-radius: 12px;
          padding: 10px 18px; display: flex; align-items: center; gap: 10px;
        }
        .rm-stat-num { font-size: 22px; font-weight: 700; color: var(--ink); }
        .rm-stat-label { font-size: 11px; color: var(--grey); font-weight: 500; line-height: 1.3; }
        .rm-stat-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .rm-section-label {
          font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
          color: var(--grey); margin-bottom: 14px; padding-left: 4px;
        }
        .rm-timeline { position: relative; padding-left: 36px; margin-bottom: 48px; }
        .rm-timeline::before {
          content: ''; position: absolute; left: 12px; top: 10px; bottom: 10px;
          width: 2px; background: linear-gradient(to bottom, var(--blue), var(--blue-mid), var(--border)); border-radius: 2px;
        }
        .rm-branch {
          position: relative; background: var(--card); border: 1px solid var(--border);
          border-radius: 14px; padding: 18px 20px; margin-bottom: 12px;
          transition: box-shadow .2s, transform .2s;
        }
        .rm-branch:hover { box-shadow: 0 8px 28px rgba(11,95,255,.10); transform: translateX(2px); }
        .rm-branch::before {
          content: ''; position: absolute; left: -30px; top: 22px;
          width: 12px; height: 12px; border-radius: 50%; border: 2.5px solid var(--card);
        }
        .rm-branch.active::before  { background: var(--blue);   box-shadow: 0 0 0 3px var(--blue-mid); }
        .rm-branch.watch::before   { background: var(--amber);  box-shadow: 0 0 0 3px #FDECC8; }
        .rm-branch.merged::before  { background: var(--green);  box-shadow: 0 0 0 3px #B3F0DC; }
        .rm-branch.parked::before  { background: var(--purple); box-shadow: 0 0 0 3px #DDD6FE; }
        .rm-branch.nurseed::before { background: var(--grey);   box-shadow: 0 0 0 2px var(--border); }
        .rm-branch-top { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
        .rm-branch-name {
          font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600;
          padding: 3px 10px; border-radius: 6px; flex-shrink: 0;
        }
        .rm-branch-name.blue   { color: var(--blue);  background: var(--blue-light); }
        .rm-branch-name.amber  { color: #B45309;       background: var(--amber-light); }
        .rm-branch-name.green  { color: #047857;       background: var(--green-light); }
        .rm-branch-name.purple { color: #5B21B6;       background: var(--purple-light); }
        .rm-branch-name.grey   { color: var(--grey);   background: var(--grey-light); }
        .rm-badge {
          font-size: 10px; font-weight: 700; letter-spacing: .6px;
          padding: 3px 9px; border-radius: 20px; text-transform: uppercase; flex-shrink: 0;
        }
        .rm-badge.current   { background: var(--blue);  color: white; }
        .rm-badge.watchme   { background: var(--amber); color: white; }
        .rm-badge.done      { background: var(--green); color: white; }
        .rm-badge.parked    { background: var(--purple);color: white; }
        .rm-badge.submitted { background: #059669;      color: white; }
        .rm-badge.nurseed   { background: #6B7280;      color: white; }
        .rm-badge.verify    { background: #D97706;      color: white; }
        .rm-branch-date { margin-left: auto; font-size: 11px; color: var(--grey); font-family: 'JetBrains Mono', monospace; white-space: nowrap; flex-shrink: 0; }
        .rm-branch-title { font-size: 15px; font-weight: 600; color: var(--ink); margin-bottom: 4px; }
        .rm-branch-desc  { font-size: 13px; color: #4A5568; line-height: 1.55; margin-bottom: 8px; }
        .rm-commits { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .rm-tag {
          font-size: 11px; font-family: 'JetBrains Mono', monospace;
          background: var(--grey-light); color: #4A5568;
          border: 1px solid var(--border); padding: 2px 8px; border-radius: 5px;
        }
        .rm-watch-panel {
          background: linear-gradient(135deg, #FFFBEB, #FFF7E0);
          border: 1.5px solid #F5D96B; border-radius: 16px; padding: 24px; margin-bottom: 48px;
        }
        .rm-watch-panel h3 { font-size: 14px; font-weight: 700; color: #92400E; margin-bottom: 16px; }
        .rm-watch-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
        .rm-watch-item { background: white; border-radius: 10px; padding: 14px; border: 1px solid #FDE68A; }
        .rm-watch-title { font-size: 12px; font-weight: 700; color: #92400E; margin-bottom: 4px; }
        .rm-watch-desc  { font-size: 12px; color: #78350F; line-height: 1.5; }
        .rm-legend { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 32px; }
        .rm-legend-item { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--grey); }
        .rm-legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .rm-divider { height: 1px; background: var(--border); margin: 32px 0; }
        .rm-clean-banner {
          background: linear-gradient(135deg, #ECFDF5, #D1FAE5);
          border: 1.5px solid #6EE7B7; border-radius: 12px; padding: 14px 20px; margin-bottom: 32px;
          display: flex; align-items: center; gap: 12px; font-size: 13px; color: #065F46; font-weight: 500;
        }
        .rm-code {
          background: #F3F4F6; padding: 1px 5px; border-radius: 4px;
          font-size: 12px; font-family: 'JetBrains Mono', monospace;
        }
        .rm-footer { text-align: center; color: var(--grey); font-size: 12px; margin-top: 24px; }
      `}</style>

      <div className="rm-body">

        {/* Header */}
        <div className="rm-header">
          <div className="rm-logo">tuto<span>.</span></div>
          <div style={{ fontSize: 13, color: 'var(--grey)', fontWeight: 500 }}>GitHub Branch Map</div>
          <div className="rm-header-meta">Updated: 27 Mar 2026 · 11 branches</div>
        </div>

        {/* Stats */}
        <div className="rm-stats-bar">
          {[
            { dot: 'var(--blue)',   num: 1, label: 'Active /\nIn-progress' },
            { dot: 'var(--amber)',  num: 2, label: 'Watch /\nNeeds merge' },
            { dot: 'var(--green)',  num: 2, label: 'Production /\nApp Store ✓' },
            { dot: 'var(--purple)', num: 2, label: 'Parked /\nAwaiting decision' },
            { dot: 'var(--grey)',   num: 4, label: 'NurseEd\nsub-project' },
          ].map((s) => (
            <div className="rm-stat-pill" key={s.label}>
              <div className="rm-stat-dot" style={{ background: s.dot }} />
              <div>
                <div className="rm-stat-num">{s.num}</div>
                <div className="rm-stat-label" style={{ whiteSpace: 'pre-line' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Housekeeping banner */}
        <div className="rm-clean-banner">
          ✅ <span><strong>Housekeeping done — 27 Mar 2026:</strong> 19 stale branches deleted (date-named checkpoints, old backups, Vercel CVE auto-PRs, merged features). Went from 26 → 11 branches.</span>
        </div>

        {/* Legend */}
        <div className="rm-legend">
          {[
            { dot: 'var(--blue)',   label: 'Active' },
            { dot: 'var(--amber)',  label: 'Watch / Needs merge' },
            { dot: 'var(--green)',  label: 'Shipped / Production' },
            { dot: 'var(--purple)', label: 'Parked — awaiting decision' },
            { dot: 'var(--grey)',   label: 'NurseEd sub-project' },
          ].map((l) => (
            <div className="rm-legend-item" key={l.label}>
              <div className="rm-legend-dot" style={{ background: l.dot }} />
              {l.label}
            </div>
          ))}
        </div>

        {/* Watch panel */}
        <div className="rm-watch-panel">
          <h3>⚠️ Things to Keep an Eye On</h3>
          <div className="rm-watch-grid">
            {[
              { title: '🚀 AppleLogin+homeRedesign → needs a build', desc: 'All new UI work lives here. QA all 3 roles (admin, teacher, parent) on simulator before submitting to Apple.' },
              { title: '🌐 tutoSocial1 — not merged to main', desc: 'Social feed is ahead of main. Merge before the next production release or those features will be lost.' },
              { title: '🔒 feat/backend-security — parked', desc: 'API auth hardening (requires auth for /tables writes). Valuable — worth merging when hardening the backend.' },
              { title: '⚖️ feat/legal-compliance — parked', desc: 'Data retention & deletion policies. May be needed for GDPR / App Store data deletion compliance.' },
            ].map((w) => (
              <div className="rm-watch-item" key={w.title}>
                <div className="rm-watch-title">{w.title}</div>
                <div className="rm-watch-desc">{w.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Mobile App branches ── */}
        <div className="rm-section-label">Mobile App — Tuto (newest first)</div>
        <div className="rm-timeline">

          <div className="rm-branch active">
            <div className="rm-branch-top">
              <div className="rm-branch-name blue">AppleLogin+homeRedesign</div>
              <span className="rm-badge current">Current Work</span>
              <div className="rm-branch-date">27 Mar 2026</div>
            </div>
            <div className="rm-branch-title">Home Redesign · Role Nav Bar · Profile · OTA · Phosphor Icons</div>
            <div className="rm-branch-desc">Full UI overhaul: role-smart home screen with live stats, Quick Access strip, Recent Activity feed. Replaced 6-tab nav bar with a role-adaptive 4-tab MainTabs (parent / teacher / admin). Upgraded to Phosphor Icons with bold/regular active/inactive states and blue tint. Compacted Photo Albums header. Fixed admin-over-teacher role priority. Rebuilt UserProfileScreen with real Supabase data. Configured expo-updates for OTA deploys.</div>
            <div className="rm-commits">
              {['MainTabs.tsx', 'Phosphor Icons', 'HeroSection.tsx', 'home-dashboard.ts', 'UserProfileScreen', 'OTA config', 'Role priority fix'].map(t => <span className="rm-tag" key={t}>{t}</span>)}
            </div>
          </div>

          <div className="rm-branch watch">
            <div className="rm-branch-top">
              <div className="rm-branch-name amber">tutoSocial1</div>
              <span className="rm-badge watchme">Needs merge</span>
              <div className="rm-branch-date">25 Mar 2026</div>
            </div>
            <div className="rm-branch-title">Tuto Social — Community Feed</div>
            <div className="rm-branch-desc">Full community feed (Parts 1 & 2): posts, comments, anonymous RLS policies, notification bell in feed header, TutoAdmin moderation page, tutoadmin redirect fix. Lives in the web dashboard. Currently ahead of main.</div>
            <div className="rm-commits">
              {['FeedScreen', 'CommentsScreen', 'Anon RLS policies', 'TutoAdmin moderation'].map(t => <span className="rm-tag" key={t}>{t}</span>)}
            </div>
          </div>

          <div className="rm-branch merged">
            <div className="rm-branch-top">
              <div className="rm-branch-name green">main</div>
              <span className="rm-badge done">Production</span>
              <div className="rm-branch-date">23 Mar 2026</div>
            </div>
            <div className="rm-branch-title">Production Baseline</div>
            <div className="rm-branch-desc">Latest stable production state. Has the tutoadmin redirect fix, full legal pages, CVE patches. Missing: tutoSocial1 feed features and all homeRedesign changes — those are in feature branches awaiting merge.</div>
            <div className="rm-commits">
              {['tutoadmin fix', 'Legal pages', 'CVE patches'].map(t => <span className="rm-tag" key={t}>{t}</span>)}
            </div>
          </div>

          <div className="rm-branch merged">
            <div className="rm-branch-top">
              <div className="rm-branch-name green">AppleLogInFeature</div>
              <span className="rm-badge submitted">App Store ✓</span>
              <div className="rm-branch-date">18 Mar 2026</div>
            </div>
            <div className="rm-branch-title">Sign in with Apple · Account Deletion (Apple 5.1.1)</div>
            <div className="rm-branch-desc">Apple Sign-In end-to-end (App Store guideline 4.8) and in-app account deletion (guideline 5.1.1v). Build submitted, reviewed, and approved by Apple. This is your safe recovery point — keep it clean and untouched.</div>
            <div className="rm-commits">
              {['expo-apple-authentication', 'Account deletion flow', 'build v2.1.1 (22)'].map(t => <span className="rm-tag" key={t}>{t}</span>)}
            </div>
          </div>

          <div className="rm-branch watch">
            <div className="rm-branch-top">
              <div className="rm-branch-name amber">schoolData1</div>
              <span className="rm-badge verify">Verify merged</span>
              <div className="rm-branch-date">18 Mar 2026</div>
            </div>
            <div className="rm-branch-title">Kindergarten Directory + Contact Enrichment</div>
            <div className="rm-branch-desc">Added a kindergarten school directory with enriched contact data. Likely a data/seeding branch. Confirm whether this content was merged into main before cleaning up.</div>
          </div>

        </div>

        <div className="rm-divider" />

        {/* ── Parked ── */}
        <div className="rm-section-label">Parked — Awaiting Decision</div>
        <div className="rm-timeline">

          <div className="rm-branch parked">
            <div className="rm-branch-top">
              <div className="rm-branch-name purple">feat/backend-security/secrets-handling</div>
              <span className="rm-badge parked">Parked</span>
              <div className="rm-branch-date">Mar 2026</div>
            </div>
            <div className="rm-branch-title">API Auth Hardening</div>
            <div className="rm-branch-desc">Requires authentication for <code className="rm-code">/tables</code> write endpoints and adds deprecation headers. A meaningful security improvement — never merged. Merge when ready to harden the backend API.</div>
            <div className="rm-commits">
              {['Auth required for /tables writes', 'Deprecation headers'].map(t => <span className="rm-tag" key={t}>{t}</span>)}
            </div>
          </div>

          <div className="rm-branch parked">
            <div className="rm-branch-top">
              <div className="rm-branch-name purple">feat/legal-compliance/data-retention-deletion</div>
              <span className="rm-badge parked">Parked</span>
              <div className="rm-branch-date">Mar 2026</div>
            </div>
            <div className="rm-branch-title">Data Retention & Deletion Policies</div>
            <div className="rm-branch-desc">GDPR-style data retention rules and user data deletion flows. May be needed for App Store compliance and EU user coverage. Merge when addressing data privacy requirements.</div>
            <div className="rm-commits">
              {['Data retention policies', 'Deletion flow', 'Role-based signup'].map(t => <span className="rm-tag" key={t}>{t}</span>)}
            </div>
          </div>

        </div>

        <div className="rm-divider" />

        {/* ── NurseEd ── */}
        <div className="rm-section-label">NurseEd / NurseMed — Separate Sub-Project</div>
        <div className="rm-timeline">
          <div className="rm-branch nurseed">
            <div className="rm-branch-top">
              <div className="rm-branch-name grey">newIcons · nursemed · module5 · newUI1</div>
              <span className="rm-badge nurseed">NurseEd</span>
              <div className="rm-branch-date">Mar 2026</div>
            </div>
            <div className="rm-branch-title">Nursing Education Web App (apps/med)</div>
            <div className="rm-branch-desc"><strong>newUI1</strong> — homepage colours/fonts. <strong>module5</strong> — Modules 10–12 (Emergency, Trauma, Family Communication). <strong>nursemed</strong> — Vercel deploy fix. <strong>newIcons</strong> — custom Canva icons. Consider moving to a separate repo when the project matures.</div>
            <div className="rm-commits">
              {['newUI1 — theme', 'module5 — content', 'nursemed — deploy fix', 'newIcons — Canva icons'].map(t => <span className="rm-tag" key={t}>{t}</span>)}
            </div>
          </div>
        </div>

        <div className="rm-footer">
          tuto. branch map · updated 27 Mar 2026 · 26 → 11 branches after housekeeping
        </div>

      </div>
    </>
  );
}
