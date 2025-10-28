---
id: WEB-FIND-TEACHER
title: /find-teacher page
owner: web
priority: P1
status: In Progress
due: 2025-11-01
area: fullstack
---

## Goal
Cho phép phụ huynh tìm giáo viên theo môn học, vị trí, mức giá.

## Scope
- Web: apps/dashboard/app/find-teacher/page.tsx (server component)
- API: apps/dashboard/app/api/providers/route.ts → apps/dashboard/lib/api/providers.ts → Firebase Functions `/api/providers/search`
- Mobile reuse: src/screens/MapScreen.tsx (tìm giáo viên gần), src/components/TeacherCard.tsx (UI)

## Data Deps
- Functions: functions/src/index.ts → POST /api/providers/search
- Airtable: Providers table (fields: displayName, subjects, rating, priceMin, priceMax, city, district, photos)

## i18n
- web.findTeacher.* (vi default, en fallback)

## cURL (dev)
```bash
curl -X POST "$BASE/api/providers/search" \
  -H 'Content-Type: application/json' \
  -d '{"q":"math","subjects":["Math"],"radiusKm":10}'
```

## Sample JSON
```json
{
  "items": [
    {"id":"rec_1","displayName":"Cô Lan","subjects":["Math"],"rating":4.9,
     "priceRange":{"min":150000,"max":300000,"currency":"VND"},
     "location":{"city":"HN","district":"Cầu Giấy"},"thumbnail":null}
  ]
}
```

## Acceptance Criteria
- [ ] Fetch via route handler (no client secrets)
- [ ] Show list/cards and handle empty/error
- [ ] Responsive layout with Tailwind & UI primitives
- [ ] i18n copy present






