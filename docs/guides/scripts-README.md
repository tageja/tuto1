# Seed & Sample Data Scripts

This directory contains scripts for seeding the Tuto app with realistic sample data for QA and development environments.

## ⚠️ Safety Guards

- **Production Protection**: Scripts will refuse to run in production environment
- **Environment Check**: Requires `NODE_ENV=development` to execute
- **Seed Data Marking**: All seeded records are marked with `isSeedData: true`

## 📋 Available Scripts

### Seed Data
```bash
npm run seed
```
Creates realistic sample data including:
- 3 teachers with different subjects and qualifications
- 2 parents with children profiles
- 2 bookings with various statuses

### Reset Seed Data
```bash
npm run seed:reset
```
Removes all records marked with `isSeedData: true` from:
- Teachers table
- Users table (parents)
- Bookings table

## 🎯 Sample Data Details

### Teachers
- **Sarah Johnson**: Math & Physics tutor, 8 years experience
- **Michael Chen**: Chemistry & Biology PhD, 12 years experience  
- **Emily Rodriguez**: English Literature & Writing, 6 years experience

Each teacher includes:
- Complete profile information
- Subject expertise
- Qualifications and experience
- Location data (San Francisco area)
- Availability schedule
- Realistic ratings and reviews

### Parents
- **John Smith**: Parent of Alex (15, 10th grade)
- **Lisa Wang**: Parent of Emma (13, 8th grade) and David (16, 11th grade)

### Bookings
- Confirmed booking for Alex (Math tutoring)
- Pending booking for Emma (Chemistry exam prep)

## 🔧 Technical Details

- Uses TypeScript for type safety
- Integrates with existing Airtable API structure
- Handles API rate limits and error cases
- Provides detailed logging and progress feedback
- Supports both seeding and cleanup operations

## 🚀 Usage in Development

1. Ensure your `.env` file has valid Airtable credentials
2. Set `NODE_ENV=development`
3. Run `npm run seed` to populate with sample data
4. Use `npm run seed:reset` to clean up when done

## 📝 Notes

- Seed data is designed to be realistic but not production-ready
- All seeded records are clearly marked for easy identification
- Scripts can be run multiple times safely (reset first)
- Never run in production - environment guards will prevent this






