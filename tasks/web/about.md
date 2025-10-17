---
id: WEB-ABOUT
title: /about page
owner: web
priority: P2
status: In Progress
due: 2025-10-31
area: fullstack
---

## Goal
Hiển thị trang giới thiệu Tuto trên web với nội dung tóm tắt và liên kết trợ giúp.

## Scope
- Web route: apps/dashboard/app/about/page.tsx
- Mobile reference: src/screens/HomeScreen.tsx (giới thiệu), src/components/TeacherCard.tsx (mẫu UI)

## Data Deps
- None (static content, i18n under packages/i18n/src/web.about)

## i18n
- Vietnamese default under web.about.*, English fallback.

## Deliverables & Acceptance Criteria
- [ ] Page renders with semantic headings and copy from i18n
- [ ] Loading/empty/error placeholders present (static page: loading only minimal)
- [ ] Responsive layout using Tailwind and UI primitives
- [ ] No client secrets; server calls not required
- [ ] Minimal unit test for render (optional)

## Notes
- Extend later with team, mission, timeline.




