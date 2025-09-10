/**
 * Add Computed Fields to Airtable
 * 
 * This script adds computed fields (formulas, rollups) to improve list performance
 * and simplify UI queries.
 */

import axios from 'axios';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE;

if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
  console.error('❌ Missing required environment variables: AIRTABLE_PAT, AIRTABLE_BASE');
  process.exit(1);
}

// Helper for Airtable API calls
async function callAirtableApi(endpoint: string, method: string, data?: any) {
  const url = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${AIRTABLE_PAT}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios({
      method,
      url,
      headers,
      data,
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Airtable API call failed: ${errorMessage}`);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

// Get table schema
async function getTableSchema(tableName: string) {
  try {
    const tables = await callAirtableApi('/tables', 'GET');
    const table = tables.tables.find((t: any) => t.name === tableName);
    if (!table) {
      throw new Error(`Table ${tableName} not found`);
    }
    return table;
  } catch (error) {
    console.error(`Error getting table schema for ${tableName}:`, error);
    throw error;
  }
}

// Add field to table
async function addField(tableId: string, field: any) {
  try {
    const result = await callAirtableApi(`/tables/${tableId}/fields`, 'POST', {
      fields: [field]
    });
    console.log(`✅ Added field: ${field.name}`);
    return result;
  } catch (error) {
    console.error(`Error adding field ${field.name}:`, error);
    throw error;
  }
}

// Check if field exists
function fieldExists(table: any, fieldName: string): boolean {
  return table.fields.some((field: any) => field.name === fieldName);
}

// Add computed fields to TutoTeachers table
async function addTeacherComputedFields() {
  console.log('📊 Adding computed fields to TutoTeachers table...');
  
  const table = await getTableSchema('TutoTeachers');
  const tableId = table.id;

  // Average Rating (formula field)
  if (!fieldExists(table, 'avgRating')) {
    await addField(tableId, {
      name: 'avgRating',
      type: 'formula',
      options: {
        formula: 'IF({Reviews}, AVERAGE({Reviews}), 0)',
        result: {
          type: 'number',
          precision: 1,
        },
      },
    });
  }

  // Student Count (rollup field)
  if (!fieldExists(table, 'studentCount')) {
    await addField(tableId, {
      name: 'studentCount',
      type: 'rollup',
      options: {
        fieldId: 'id', // Assuming there's a field linking to students
        linkedTableId: 'tblStudents', // This would need to be the actual table ID
        aggregation: 'count',
      },
    });
  }

  // Geo Hash (formula field for location-based queries)
  if (!fieldExists(table, 'geoHash')) {
    await addField(tableId, {
      name: 'geoHash',
      type: 'formula',
      options: {
        formula: 'IF(AND({Latitude}, {Longitude}), CONCATENATE(ROUND({Latitude}, 2), ",", ROUND({Longitude}, 2)), "")',
        result: {
          type: 'singleLineText',
        },
      },
    });
  }

  // Experience Level (formula field)
  if (!fieldExists(table, 'experienceLevel')) {
    await addField(tableId, {
      name: 'experienceLevel',
      type: 'formula',
      options: {
        formula: 'IF({Experience} >= 5, "Expert", IF({Experience} >= 2, "Intermediate", "Beginner"))',
        result: {
          type: 'singleSelect',
          choices: [
            { name: 'Beginner', color: 'blueLight2' },
            { name: 'Intermediate', color: 'yellowLight2' },
            { name: 'Expert', color: 'greenLight2' },
          ],
        },
      },
    });
  }

  // Availability Status (formula field)
  if (!fieldExists(table, 'availabilityStatus')) {
    await addField(tableId, {
      name: 'availabilityStatus',
      type: 'formula',
      options: {
        formula: 'IF({Available}, "Available", "Unavailable")',
        result: {
          type: 'singleSelect',
          choices: [
            { name: 'Available', color: 'greenLight2' },
            { name: 'Unavailable', color: 'redLight2' },
          ],
        },
      },
    });
  }

  console.log('✅ TutoTeachers computed fields added successfully');
}

// Add computed fields to TutoBookings table
async function addBookingComputedFields() {
  console.log('📊 Adding computed fields to TutoBookings table...');
  
  const table = await getTableSchema('TutoBookings');
  const tableId = table.id;

  // Booking Duration (formula field)
  if (!fieldExists(table, 'duration')) {
    await addField(tableId, {
      name: 'duration',
      type: 'formula',
      options: {
        formula: 'IF(AND({StartTime}, {EndTime}), DATETIME_DIFF({EndTime}, {StartTime}, "hours"), 0)',
        result: {
          type: 'number',
          precision: 1,
        },
      },
    });
  }

  // Total Amount (formula field)
  if (!fieldExists(table, 'totalAmount')) {
    await addField(tableId, {
      name: 'totalAmount',
      type: 'formula',
      options: {
        formula: 'IF(AND({HourlyRate}, {duration}), {HourlyRate} * {duration}, 0)',
        result: {
          type: 'currency',
          precision: 0,
          symbol: 'VND',
        },
      },
    });
  }

  // Booking Status (formula field)
  if (!fieldExists(table, 'bookingStatus')) {
    await addField(tableId, {
      name: 'bookingStatus',
      type: 'formula',
      options: {
        formula: 'IF({Status} = "Completed", "Completed", IF({Status} = "Cancelled", "Cancelled", "Active"))',
        result: {
          type: 'singleSelect',
          choices: [
            { name: 'Active', color: 'blueLight2' },
            { name: 'Completed', color: 'greenLight2' },
            { name: 'Cancelled', color: 'redLight2' },
          ],
        },
      },
    });
  }

  // Days Until Booking (formula field)
  if (!fieldExists(table, 'daysUntilBooking')) {
    await addField(tableId, {
      name: 'daysUntilBooking',
      type: 'formula',
      options: {
        formula: 'IF({StartTime}, DATETIME_DIFF({StartTime}, NOW(), "days"), 0)',
        result: {
          type: 'number',
          precision: 0,
        },
      },
    });
  }

  console.log('✅ TutoBookings computed fields added successfully');
}

// Add computed fields to TutoReviews table
async function addReviewComputedFields() {
  console.log('📊 Adding computed fields to TutoReviews table...');
  
  const table = await getTableSchema('TutoReviews');
  const tableId = table.id;

  // Review Age (formula field)
  if (!fieldExists(table, 'reviewAge')) {
    await addField(tableId, {
      name: 'reviewAge',
      type: 'formula',
      options: {
        formula: 'IF({CreatedAt}, DATETIME_DIFF(NOW(), {CreatedAt}, "days"), 0)',
        result: {
          type: 'number',
          precision: 0,
        },
      },
    });
  }

  // Rating Category (formula field)
  if (!fieldExists(table, 'ratingCategory')) {
    await addField(tableId, {
      name: 'ratingCategory',
      type: 'formula',
      options: {
        formula: 'IF({Rating} >= 4, "Positive", IF({Rating} >= 3, "Neutral", "Negative"))',
        result: {
          type: 'singleSelect',
          choices: [
            { name: 'Positive', color: 'greenLight2' },
            { name: 'Neutral', color: 'yellowLight2' },
            { name: 'Negative', color: 'redLight2' },
          ],
        },
      },
    });
  }

  console.log('✅ TutoReviews computed fields added successfully');
}

// Add computed fields to TutoPosts table
async function addPostComputedFields() {
  console.log('📊 Adding computed fields to TutoPosts table...');
  
  const table = await getTableSchema('TutoPosts');
  const tableId = table.id;

  // Post Age (formula field)
  if (!fieldExists(table, 'postAge')) {
    await addField(tableId, {
      name: 'postAge',
      type: 'formula',
      options: {
        formula: 'IF({Timestamp}, DATETIME_DIFF(NOW(), {Timestamp}, "hours"), 0)',
        result: {
          type: 'number',
          precision: 0,
        },
      },
    });
  }

  // Engagement Score (formula field)
  if (!fieldExists(table, 'engagementScore')) {
    await addField(tableId, {
      name: 'engagementScore',
      type: 'formula',
      options: {
        formula: 'IF(AND({Likes Count}, {Comments Count}), {Likes Count} + ({Comments Count} * 2), 0)',
        result: {
          type: 'number',
          precision: 0,
        },
      },
    });
  }

  // Post Type (formula field)
  if (!fieldExists(table, 'postType')) {
    await addField(tableId, {
      name: 'postType',
      type: 'formula',
      options: {
        formula: 'IF({Content Media Type}, "Media", "Text")',
        result: {
          type: 'singleSelect',
          choices: [
            { name: 'Text', color: 'blueLight2' },
            { name: 'Media', color: 'purpleLight2' },
          ],
        },
      },
    });
  }

  console.log('✅ TutoPosts computed fields added successfully');
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting computed fields addition...');
    console.log(`📋 Base ID: ${AIRTABLE_BASE_ID}`);
    
    // Check if we're in production
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ This script should not be run in production!');
      process.exit(1);
    }

    // Add computed fields to all tables
    await addTeacherComputedFields();
    await addBookingComputedFields();
    await addReviewComputedFields();
    await addPostComputedFields();

    console.log('🎉 All computed fields added successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Verify the computed fields in Airtable');
    console.log('2. Update any views that can benefit from these fields');
    console.log('3. Test list queries to ensure improved performance');
    console.log('4. Update documentation with new field descriptions');

  } catch (error) {
    console.error('❌ Error adding computed fields:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { addTeacherComputedFields, addBookingComputedFields, addReviewComputedFields, addPostComputedFields };
