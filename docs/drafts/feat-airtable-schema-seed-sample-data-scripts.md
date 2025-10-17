# feat(airtable): Row 35 create seed & sample data scripts for QA/dev

## 📋 Summary
Creates comprehensive seed and sample data scripts for QA and development environments with production safety guards.

## 🎯 What Changed
- **scripts/seed.ts**: New TypeScript seed script with realistic sample data
- **scripts/README.md**: Documentation for seed scripts usage and safety
- **package.json**: Added npm scripts for seeding and resetting data
- **Dependencies**: Added @types/node-fetch for TypeScript support

## 🔧 Technical Details
- Environment guard prevents production seeding (NODE_ENV check)
- All seeded records marked with `isSeedData: true` for easy identification
- Realistic sample data including teachers, parents, and bookings
- Reset functionality to clean up seed data
- TypeScript implementation with proper error handling
- Integration with existing Airtable API structure

## 🧪 Testing
- [x] TypeScript compilation passes
- [x] Environment guards prevent production execution
- [x] Seed data includes realistic teacher profiles
- [x] Parent data includes children profiles
- [x] Booking data with various statuses
- [x] Reset functionality removes seed data only

## 📱 Sample Data
- **3 Teachers**: Math/Physics, Chemistry/Biology, English Literature
- **2 Parents**: With children in different grades
- **2 Bookings**: Confirmed and pending statuses
- Complete profiles with locations, availability, ratings

## 🔗 Related
- Row 35: Airtable Schema & Scripts: Seed & sample data scripts [P1]
- Local patch: `patches/feat-airtable-schema-seed-sample-data-scripts.patch`






