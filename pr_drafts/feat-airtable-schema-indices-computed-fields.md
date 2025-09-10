# feat(airtable): Row 37 indices & computed fields for performance optimization

## Summary

Implements computed fields (formulas and rollups) across Airtable tables to improve list performance, simplify UI queries, and provide pre-calculated metrics for better user experience.

## Changes Made

### New Files
- `scripts/add-computed-fields.ts` - Script to add computed fields to Airtable tables
- `docs/computed-fields.md` - Comprehensive documentation for computed fields system

### Modified Files
- `package.json` - Added `add-computed-fields` script command

## Implementation Details

### TutoTeachers Table Computed Fields

#### avgRating (Formula Field)
- **Purpose**: Pre-calculated average rating from all reviews
- **Formula**: `IF({Reviews}, AVERAGE({Reviews}), 0)`
- **Type**: Number (1 decimal place)
- **Usage**: Teacher list sorting, rating-based filtering

#### studentCount (Rollup Field)
- **Purpose**: Count of students taught by teacher
- **Type**: Number
- **Usage**: Teacher popularity metrics, capacity planning

#### geoHash (Formula Field)
- **Purpose**: Location-based grouping for proximity queries
- **Formula**: `IF(AND({Latitude}, {Longitude}), CONCATENATE(ROUND({Latitude}, 2), ",", ROUND({Longitude}, 2)), "")`
- **Type**: Single Line Text
- **Usage**: Nearby teacher searches, location filtering

#### experienceLevel (Formula Field)
- **Purpose**: Categorized experience levels
- **Formula**: `IF({Experience} >= 5, "Expert", IF({Experience} >= 2, "Intermediate", "Beginner"))`
- **Type**: Single Select (Beginner, Intermediate, Expert)
- **Usage**: Experience-based filtering and recommendations

#### availabilityStatus (Formula Field)
- **Purpose**: Current availability status
- **Formula**: `IF({Available}, "Available", "Unavailable")`
- **Type**: Single Select (Available, Unavailable)
- **Usage**: Real-time availability filtering

### TutoBookings Table Computed Fields

#### duration (Formula Field)
- **Purpose**: Calculated booking duration in hours
- **Formula**: `IF(AND({StartTime}, {EndTime}), DATETIME_DIFF({EndTime}, {StartTime}, "hours"), 0)`
- **Type**: Number (1 decimal place)
- **Usage**: Duration-based filtering, pricing calculations

#### totalAmount (Formula Field)
- **Purpose**: Total booking cost calculation
- **Formula**: `IF(AND({HourlyRate}, {duration}), {HourlyRate} * {duration}, 0)`
- **Type**: Currency (VND)
- **Usage**: Payment processing, financial reporting

#### bookingStatus (Formula Field)
- **Purpose**: Simplified booking status
- **Formula**: `IF({Status} = "Completed", "Completed", IF({Status} = "Cancelled", "Cancelled", "Active"))`
- **Type**: Single Select (Active, Completed, Cancelled)
- **Usage**: Status-based filtering, dashboard views

#### daysUntilBooking (Formula Field)
- **Purpose**: Days until booking starts
- **Formula**: `IF({StartTime}, DATETIME_DIFF({StartTime}, NOW(), "days"), 0)`
- **Type**: Number
- **Usage**: Upcoming bookings, scheduling alerts

### TutoReviews Table Computed Fields

#### reviewAge (Formula Field)
- **Purpose**: Age of review in days
- **Formula**: `IF({CreatedAt}, DATETIME_DIFF(NOW(), {CreatedAt}, "days"), 0)`
- **Type**: Number
- **Usage**: Recent reviews filtering, review freshness

#### ratingCategory (Formula Field)
- **Purpose**: Categorized rating sentiment
- **Formula**: `IF({Rating} >= 4, "Positive", IF({Rating} >= 3, "Neutral", "Negative"))`
- **Type**: Single Select (Positive, Neutral, Negative)
- **Usage**: Sentiment analysis, review filtering

### TutoPosts Table Computed Fields

#### postAge (Formula Field)
- **Purpose**: Age of post in hours
- **Formula**: `IF({Timestamp}, DATETIME_DIFF(NOW(), {Timestamp}, "hours"), 0)`
- **Type**: Number
- **Usage**: Recent posts filtering, feed algorithms

#### engagementScore (Formula Field)
- **Purpose**: Weighted engagement metric (comments weighted 2x)
- **Formula**: `IF(AND({Likes Count}, {Comments Count}), {Likes Count} + ({Comments Count} * 2), 0)`
- **Type**: Number
- **Usage**: Popular posts ranking, trending content

#### postType (Formula Field)
- **Purpose**: Post content type classification
- **Formula**: `IF({Content Media Type}, "Media", "Text")`
- **Type**: Single Select (Text, Media)
- **Usage**: Content type filtering, media-specific features

## Performance Benefits

### Query Optimization
- **Reduced Formula Complexity**: Pre-calculated values eliminate runtime calculations
- **Faster Filtering**: Indexed computed fields improve filter performance
- **Simplified Sorting**: Direct field sorting instead of complex formulas

### UI Improvements
- **Faster List Loading**: Pre-computed values reduce API response time
- **Better User Experience**: Instant filtering and sorting
- **Reduced Client Processing**: Less JavaScript calculations on frontend

### Data Consistency
- **Standardized Calculations**: Consistent formulas across all records
- **Real-time Updates**: Automatic recalculation when source fields change
- **Audit Trail**: Clear calculation logic in field definitions

## Script Usage

### Adding Computed Fields
```bash
npm run add-computed-fields
```

### Script Features
- **Environment Safety**: Prevents execution in production
- **Field Existence Check**: Avoids duplicate field creation
- **Error Handling**: Comprehensive error reporting
- **Progress Tracking**: Clear status updates during execution

## Testing

- [x] TypeScript compilation passes
- [x] Script execution validation
- [x] Formula syntax verification
- [x] Field type validation
- [x] Error handling scenarios
- [x] Documentation completeness

## Configuration Required

### Environment Variables
- `AIRTABLE_PAT` - Airtable personal access token
- `AIRTABLE_BASE` - Airtable base ID
- `NODE_ENV` - Environment setting (prevents production execution)

### Airtable Setup
- Ensure proper permissions for field creation
- Verify table names match script expectations
- Test computed fields with sample data

## Documentation

- Comprehensive computed fields documentation in `docs/computed-fields.md`
- Field purposes and formulas documented
- Performance benefits and usage guidelines
- Implementation and maintenance procedures
- Troubleshooting guide

## Quality Gates

- [x] TypeScript compilation (`tsc --noEmit`)
- [x] No linting errors
- [x] Script safety checks
- [x] Formula validation
- [x] Documentation complete
- [x] Error handling
- [x] Environment protection

## Local Patch

Generated: `patches/feat-airtable-schema-indices-computed-fields.patch`

## Related

- Row 37: Airtable Schema & Scripts: Indices / computed fields [P2]
- Improves list performance with pre-calculated values
- Simplifies UI queries and filtering
- Provides consistent data calculations
- Enhances user experience with faster loading
