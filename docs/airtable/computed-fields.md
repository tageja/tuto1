# Airtable Computed Fields

## Overview

This document describes the computed fields (formulas and rollups) added to Airtable tables to improve list performance and simplify UI queries.

## Purpose

Computed fields provide:
- **Performance Optimization**: Pre-calculated values reduce query complexity
- **Simplified UI Logic**: Complex calculations moved to Airtable level
- **Consistent Data**: Standardized calculations across all records
- **Better Filtering**: Enhanced filtering and sorting capabilities

## TutoTeachers Table

### avgRating (Formula Field)
- **Type**: Number (1 decimal place)
- **Formula**: `IF({Reviews}, AVERAGE({Reviews}), 0)`
- **Purpose**: Pre-calculated average rating from all reviews
- **Usage**: Teacher list sorting, filtering by rating range

### studentCount (Rollup Field)
- **Type**: Number
- **Source**: Count of linked student records
- **Purpose**: Number of students taught by this teacher
- **Usage**: Teacher popularity metrics, capacity planning

### geoHash (Formula Field)
- **Type**: Single Line Text
- **Formula**: `IF(AND({Latitude}, {Longitude}), CONCATENATE(ROUND({Latitude}, 2), ",", ROUND({Longitude}, 2)), "")`
- **Purpose**: Location-based grouping and proximity queries
- **Usage**: Nearby teacher searches, location-based filtering

### experienceLevel (Formula Field)
- **Type**: Single Select
- **Formula**: `IF({Experience} >= 5, "Expert", IF({Experience} >= 2, "Intermediate", "Beginner"))`
- **Choices**: Beginner, Intermediate, Expert
- **Purpose**: Categorized experience levels
- **Usage**: Teacher filtering, experience-based recommendations

### availabilityStatus (Formula Field)
- **Type**: Single Select
- **Formula**: `IF({Available}, "Available", "Unavailable")`
- **Choices**: Available, Unavailable
- **Purpose**: Current availability status
- **Usage**: Real-time availability filtering

## TutoBookings Table

### duration (Formula Field)
- **Type**: Number (1 decimal place)
- **Formula**: `IF(AND({StartTime}, {EndTime}), DATETIME_DIFF({EndTime}, {StartTime}, "hours"), 0)`
- **Purpose**: Calculated booking duration in hours
- **Usage**: Duration-based filtering, pricing calculations

### totalAmount (Formula Field)
- **Type**: Currency (VND)
- **Formula**: `IF(AND({HourlyRate}, {duration}), {HourlyRate} * {duration}, 0)`
- **Purpose**: Total booking cost calculation
- **Usage**: Payment processing, financial reporting

### bookingStatus (Formula Field)
- **Type**: Single Select
- **Formula**: `IF({Status} = "Completed", "Completed", IF({Status} = "Cancelled", "Cancelled", "Active"))`
- **Choices**: Active, Completed, Cancelled
- **Purpose**: Simplified booking status
- **Usage**: Status-based filtering, dashboard views

### daysUntilBooking (Formula Field)
- **Type**: Number
- **Formula**: `IF({StartTime}, DATETIME_DIFF({StartTime}, NOW(), "days"), 0)`
- **Purpose**: Days until booking starts
- **Usage**: Upcoming bookings, scheduling alerts

## TutoReviews Table

### reviewAge (Formula Field)
- **Type**: Number
- **Formula**: `IF({CreatedAt}, DATETIME_DIFF(NOW(), {CreatedAt}, "days"), 0)`
- **Purpose**: Age of review in days
- **Usage**: Recent reviews filtering, review freshness

### ratingCategory (Formula Field)
- **Type**: Single Select
- **Formula**: `IF({Rating} >= 4, "Positive", IF({Rating} >= 3, "Neutral", "Negative"))`
- **Choices**: Positive, Neutral, Negative
- **Purpose**: Categorized rating sentiment
- **Usage**: Sentiment analysis, review filtering

## TutoPosts Table

### postAge (Formula Field)
- **Type**: Number
- **Formula**: `IF({Timestamp}, DATETIME_DIFF(NOW(), {Timestamp}, "hours"), 0)`
- **Purpose**: Age of post in hours
- **Usage**: Recent posts filtering, feed algorithms

### engagementScore (Formula Field)
- **Type**: Number
- **Formula**: `IF(AND({Likes Count}, {Comments Count}), {Likes Count} + ({Comments Count} * 2), 0)`
- **Purpose**: Weighted engagement metric (comments weighted 2x)
- **Usage**: Popular posts ranking, trending content

### postType (Formula Field)
- **Type**: Single Select
- **Formula**: `IF({Content Media Type}, "Media", "Text")`
- **Choices**: Text, Media
- **Purpose**: Post content type classification
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

## Usage Guidelines

### Best Practices
1. **Use for Frequently Queried Data**: Add computed fields for data used in filters/sorts
2. **Keep Formulas Simple**: Complex formulas can impact performance
3. **Monitor Field Count**: Too many computed fields can slow down record loading
4. **Regular Review**: Periodically review and optimize computed fields

### Performance Considerations
- **Formula Complexity**: Simple formulas perform better than complex ones
- **Field Dependencies**: Minimize dependencies on other computed fields
- **Update Frequency**: Consider how often source data changes
- **Query Patterns**: Optimize for common query patterns

### Maintenance
- **Regular Testing**: Test computed fields after schema changes
- **Documentation**: Keep field purposes and formulas documented
- **Monitoring**: Monitor performance impact of computed fields
- **Cleanup**: Remove unused computed fields to maintain performance

## Implementation

### Adding Computed Fields
Use the provided script to add computed fields:
```bash
npm run add-computed-fields
```

### Manual Addition
1. Open Airtable base
2. Navigate to table
3. Add new field with appropriate type
4. Configure formula or rollup options
5. Test with sample data

### Verification
1. Check field calculations with test data
2. Verify performance improvements
3. Update any dependent views
4. Test filtering and sorting functionality

## Monitoring

### Key Metrics
- **Query Performance**: Measure list loading times
- **Field Usage**: Track which computed fields are used most
- **Update Frequency**: Monitor how often fields recalculate
- **Error Rates**: Check for formula errors

### Alerts
- **Formula Errors**: Alert on calculation failures
- **Performance Degradation**: Monitor query times
- **Field Dependencies**: Track broken dependencies
- **Usage Patterns**: Monitor field utilization

## Troubleshooting

### Common Issues
1. **Formula Errors**: Check syntax and field references
2. **Performance Issues**: Review formula complexity
3. **Dependency Problems**: Ensure referenced fields exist
4. **Data Inconsistency**: Verify source field data

### Debug Steps
1. Check formula syntax in Airtable
2. Verify field references are correct
3. Test with sample data
4. Review performance metrics
5. Check for circular dependencies

## Future Enhancements

### Planned Additions
- **Teacher Performance Metrics**: Success rate, completion rate
- **Booking Analytics**: Popular time slots, cancellation rates
- **User Engagement**: Activity scores, interaction patterns
- **Financial Metrics**: Revenue calculations, payment trends

### Optimization Opportunities
- **Caching Strategies**: Implement field value caching
- **Batch Updates**: Optimize bulk field updates
- **Index Optimization**: Improve query performance
- **Formula Simplification**: Reduce calculation complexity






