# Tuto Web Dashboard

Modern web dashboard for Tuto Schools management and Tuto Ops administration.

## 🚀 Quick Start

```bash
# 1. Get Firebase web credentials
# See: SETUP_INSTRUCTIONS.md

# 2. Create .env.local with your credentials

# 3. Install & run
npm install
npm run dev

# 4. Open http://localhost:3000/setup
# 5. Run connectivity tests
```

## 📁 Project Structure

```
apps/dashboard/
├── app/                      # Next.js 15 App Router
│   ├── setup/               # Setup & testing page
│   └── login/               # Login page (coming)
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── lib/
│   ├── firebase/
│   │   └── config.ts        # Firebase initialization
│   ├── api/
│   │   ├── backend.ts       # API client
│   │   └── tables.ts        # Airtable constants
│   └── types/
│       └── index.ts         # TypeScript types
├── scripts/
│   ├── test-connection.js   # Backend connectivity test
│   └── setup-firebase-web.js # Firebase setup helper
└── docs/
    ├── SETUP_INSTRUCTIONS.md         # Full setup guide
    ├── WEB_DASHBOARD_PROGRESS.md     # Development progress
    ├── WEB_DASHBOARD_CHAT_SUMMARY.md # Session notes
    └── WEB_DASHBOARD_FEATURES_CHECKLIST.md
```

## 🔧 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (coming)
- **Auth**: Firebase Authentication
- **Backend**: Firebase Functions (asia-southeast1)
- **Database**: Airtable (via Functions proxy)
- **Animations**: Framer Motion

## 🔐 Security Architecture

```
Dashboard → Firebase Auth → Functions → Airtable
```

- ✅ No direct Airtable access from client
- ✅ All API calls authenticated with Firebase tokens
- ✅ Server-side validation & rate limiting
- ✅ Audit logging on all writes

## 📖 Documentation

| File | Purpose |
|------|---------|
| `SETUP_INSTRUCTIONS.md` | Step-by-step setup guide |
| `WEB_DASHBOARD_PROGRESS.md` | Development tracker |
| `WEB_DASHBOARD_CHAT_SUMMARY.md` | Detailed session notes |
| `WEB_DASHBOARD_FEATURES_CHECKLIST.md` | Feature implementation status |

## 🧪 Testing

### Backend Connectivity (No credentials needed)
```bash
node scripts/test-connection.js
```

### Dashboard Tests (Requires .env.local)
```bash
npm run dev
# Open: http://localhost:3000/setup
# Click: "Run All Tests"
```

## 🎯 Current Status

**Infrastructure**: ✅ Complete  
**Firebase Config**: 🟡 Needs web credentials  
**Backend API**: ✅ Working  
**Authentication**: ✅ Context ready  
**UI/Pages**: ⏳ Coming next  

## 📝 Next Steps

1. Get Firebase web credentials from console
2. Create `.env.local` file
3. Test connectivity
4. Build login page
5. Implement features per PRD

## 🔗 Related Projects

- **Mobile App**: `/src` - React Native with Expo
- **Firebase Functions**: `/functions` - Backend API
- **Shared Types**: Can be moved to `/packages` later

## 👥 Team

Built for Tuto Schools - Education platform for Vietnam and beyond.

---

**Need help?** See `SETUP_INSTRUCTIONS.md` for detailed setup steps.


