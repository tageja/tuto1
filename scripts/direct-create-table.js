/**
 * Direct Table Creator - Creates TutoComments table immediately
 * Just replace the credentials below and run
 */

// Replace these with your actual credentials
const AIRTABLE_PAT = 'YOUR_PAT_HERE';
const AIRTABLE_BASE_ID = 'YOUR_BASE_ID_HERE';

// Use node's built-in fetch (Node 18+) or require node-fetch
const fetch = globalThis.fetch || require('node-fetch');

const commentsTableSchema = {
  name: 'TutoComments',
  description: 'Table to store user comments on posts',
  fields: [
    {
      name: 'ID',
      type: 'singleLineText'
    },
    {
      name: 'Post ID', 
      type: 'singleLineText'
    },
    {
      name: 'Author ID',
      type: 'singleLineText'
    },
    {
      name: 'Author Name',
      type: 'singleLineText'
    },
    {
      name: 'Content',
      type: 'multilineText'
    },
    {
      name: 'Created At',
      type: 'dateTime',
      options: {
        dateFormat: { name: 'iso' },
        timeFormat: { name: '24hour' },
        timeZone: 'utc'
      }
    }
  ]
};

async function createTable() {
  console.log('🚀 Creating TutoComments table...\n');
  
  if (AIRTABLE_PAT === 'YOUR_PAT_HERE' || AIRTABLE_BASE_ID === 'YOUR_BASE_ID_HERE') {
    console.log('❌ Please replace YOUR_PAT_HERE and YOUR_BASE_ID_HERE with your actual credentials in this file');
    return;
  }
  
  try {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_PAT}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commentsTableSchema)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ SUCCESS! TutoComments table created!');
      console.log(`📊 Table ID: ${result.id}`);
      console.log(`📝 Fields: ${result.fields.length} created`);
      console.log('\n🎉 Comments functionality is now enabled!');
    } else {
      const error = await response.text();
      console.log(`❌ Failed: ${response.status} - ${response.statusText}`);
      console.log('Error:', error);
      
      if (response.status === 422) {
        console.log('\n💡 Table might already exist - check your Airtable base!');
      }
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

createTable();
