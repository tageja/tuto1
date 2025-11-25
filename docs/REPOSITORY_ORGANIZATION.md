# Repository Organization

**Last Updated**: October 28, 2025  
**Status**: Cleaned and organized

---

## 📁 **Docs Folder Structure**

```
docs/
├── school-dashboard/          ← School dashboard implementation docs
│   ├── SCHOOL_DASHBOARD_IMPLEMENTATION_COMPLETE.md
│   ├── SCHOOL_DASHBOARD_PHASE1_COMPLETE.md
│   ├── SCHOOL_DASHBOARD_ERRORS_ANALYSIS.md
│   ├── SCHOOL_DASHBOARD_LANGUAGE_TOGGLE_FIX.md
│   ├── SCHOOL_DASHBOARD_ROLE_SELECTION_FLOW.md
│   ├── ADMIN_DASHBOARD_INTEGRATION_AUDIT.md
│   ├── CLASSES_PAGE_ENHANCEMENT_COMPLETE.md
│   ├── PERFORMANCE_ANALYSIS_AND_OPTIMIZATION.md
│   └── school-dashboard-implementation.plan.md
│
├── web-dashboard/             ← Original web dashboard docs
│   ├── INVESTOR_PAGE_FINAL_STATUS.md
│   ├── INVESTOR_PAGE_README.md
│   └── [existing web dashboard docs]
│
├── summaries/                 ← Session summaries and context
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── NEW_CHAT_CONTEXT.md
│   └── [existing session summaries]
│
├── status/                    ← Project status tracking
│   ├── CURRENT_STATUS.md
│   ├── PROJECT_STATUS.md
│   ├── PROGRESS.md
│   ├── CHANGELOG.md
│   └── [existing status files]
│
├── prd-specs/                 ← Product requirements documents
│   ├── nextSteps.prd
│   ├── nextSteps.Cont.prd
│   ├── prd.txt
│   ├── Tuto Web Dashboard1.prd
│   └── Tuto Web Dashboard2.prd
│
├── csv-data/                  ← CSV data files
│   ├── Production ready - pending items - Sheet1.csv
│   ├── tuto_readiness_with_deep_notes.csv
│   └── [other CSV files]
│
├── design-assets/             ← Design files and resources
│   └── Bilingual Education Platform Layout.zip
│
├── archive/                   ← Old/deprecated files
│   ├── files/                 (Facebook HTML)
│   ├── guidevi2019_1755626691594317.pdf
│   ├── storage.rules.backup.txt
│   ├── ktop_config.json
│   └── test-env.mjs
│
├── airtable/                  ← Airtable schema docs
├── backend/                   ← Backend architecture docs
├── deployment/                ← Deployment guides
├── drafts/                    ← Draft documents
├── guides/                    ← How-to guides
├── product/                   ← Product specs
├── repoMap/                   ← Repository maps
├── tasks/                     ← Task tracking
└── [other existing folders]
```

---

## 📋 **What Was Moved**

### **School Dashboard Docs** → `docs/school-dashboard/`
- SCHOOL_DASHBOARD_IMPLEMENTATION_COMPLETE.md
- SCHOOL_DASHBOARD_PHASE1_COMPLETE.md  
- SCHOOL_DASHBOARD_ERRORS_ANALYSIS.md
- SCHOOL_DASHBOARD_LANGUAGE_TOGGLE_FIX.md
- SCHOOL_DASHBOARD_ROLE_SELECTION_FLOW.md
- ADMIN_DASHBOARD_INTEGRATION_AUDIT.md
- CLASSES_PAGE_ENHANCEMENT_COMPLETE.md
- PERFORMANCE_ANALYSIS_AND_OPTIMIZATION.md
- school-dashboard-implementation.plan.md

### **Investor/Web Dashboard Docs** → `docs/web-dashboard/`
- INVESTOR_PAGE_FINAL_STATUS.md
- INVESTOR_PAGE_README.md

### **Summaries** → `docs/summaries/`
- IMPLEMENTATION_SUMMARY.md
- NEW_CHAT_CONTEXT.md

### **PRD Files** → `docs/prd-specs/`
- nextSteps.prd
- nextSteps.Cont.prd
- prd.txt
- Tuto Web Dashboard1.prd
- Tuto Web Dashboard2.prd

### **CSV Files** → `docs/csv-data/`
- Production ready - pending items - Sheet1.csv
- tuto_readiness_with_deep_notes.csv

### **Design Assets** → `docs/design-assets/`
- Bilingual Education Platform Layout.zip

### **Archived** → `docs/archive/`
- files/ folder
- guidevi2019_1755626691594317.pdf
- storage.rules.backup.txt
- ktop_config.json
- test-env.mjs

---

## 🧹 **Clean Root Directory**

### **What Should Stay in Root:**
✅ **Essential Config Files**:
- package.json
- tsconfig.json
- babel.config.js
- tailwind.config.js
- firebase.json
- firestore.rules
- firestore.indexes.json
- storage.rules
- app.json
- eas.json
- next-env.d.ts

✅ **Main Entry Points**:
- App.tsx
- index.ts
- README.md

✅ **Folders**:
- /app (mobile app)
- /apps (dashboard, etc.)
- /assets
- /docs (documentation)
- /functions (Firebase)
- /packages (shared packages)
- /patches
- /scripts
- /src (mobile source)
- /tasks
- /cursor (cursor rules)
- /UI_sampleFromFigma* (design references)

❌ **Removed from Root**:
- Scattered .md files
- Scattered .csv files
- Scattered .prd files
- Old .pdf files
- Backup files
- Random config files

---

## 📚 **Quick Reference**

### **Looking for...**

**School Dashboard Documentation?**
→ `docs/school-dashboard/`

**Session Summaries?**
→ `docs/summaries/`

**Project Status?**
→ `docs/status/`

**Product Requirements?**
→ `docs/prd-specs/`

**CSV Data?**
→ `docs/csv-data/`

**Design Files?**
→ `docs/design-assets/`

**Old/Archived Files?**
→ `docs/archive/`

---

## 🎯 **Benefits of New Organization**

✅ **Cleaner Root**: Easy to find config files  
✅ **Logical Grouping**: Related docs together  
✅ **Easy Navigation**: Clear folder names  
✅ **Better Maintenance**: Know where to put new docs  
✅ **Archive Separation**: Old files don't clutter  

---

**Repository is now organized and clean!** 🎉
















