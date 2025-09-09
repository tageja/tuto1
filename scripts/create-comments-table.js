/**
 * Automated Airtable Comments Table Creation Script
 * 
 * This script automatically creates the TutoComments table in your Airtable base
 * using the Airtable REST API.
 * 
 * Prerequisites:
 * 1. Get your Airtable Personal Access Token (PAT) from https://airtable.com/create/tokens
 * 2. Get your Base ID from your Airtable base URL
 * 3. Set environment variables or update the script below
 * 
 * Usage: 
 * 1. Set AIRTABLE_PAT and AIRTABLE_BASE_ID in your .env file, OR
 * 2. Replace the values below, then run: node scripts/create-comments-table.js
 */

require('dotenv').config();

const AIRTABLE_PAT = process.env.AIRTABLE_PAT || 'YOUR_AIRTABLE_PAT_HERE';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'YOUR_BASE_ID_HERE';

// Airtable API endpoint for creating tables
const AIRTABLE_API_URL = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`;

const commentsTableSchema = {
  name: 'TutoComments',
  description: 'Table to store user comments on posts',
  fields: [
    {
      name: 'ID',
      type: 'singleLineText',
      description: 'Unique comment identifier'
    },
    {
      name: 'Post ID',
      type: 'singleLineText',
      description: 'ID of the post this comment belongs to'
    },
    {
      name: 'Author ID',
      type: 'singleLineText',
      description: 'ID of the user who wrote the comment'
    },
    {
      name: 'Author Name',
      type: 'singleLineText',
      description: 'Display name of the comment author'
    },
    {
      name: 'Content',
      type: 'multilineText',
      description: 'The comment text content'
    },
    {
      name: 'Created At',
      type: 'dateTime',
      description: 'When the comment was created',
      options: {
        dateFormat: {
          name: 'iso'
        },
        timeFormat: {
          name: '24hour'
        },
        timeZone: 'utc'
      }
    }
  ]
};

async function createCommentsTable() {
  console.log('🚀 Creating TutoComments table in Airtable...\n');

  // Validate environment variables
  if (AIRTABLE_PAT === 'YOUR_AIRTABLE_PAT_HERE' || !AIRTABLE_PAT) {
    console.error('❌ AIRTABLE_PAT not set!');
    console.log('\n📝 To get your Airtable Personal Access Token:');
    console.log('1. Go to https://airtable.com/create/tokens');
    console.log('2. Click "Create new token"');
    console.log('3. Give it a name like "TutoApp Comments"');
    console.log('4. Add these scopes: data.records:read, data.records:write, schema.bases:read, schema.bases:write');
    console.log('5. Add your base and set it in AIRTABLE_PAT environment variable');
    return;
  }

  if (AIRTABLE_BASE_ID === 'YOUR_BASE_ID_HERE' || !AIRTABLE_BASE_ID) {
    console.error('❌ AIRTABLE_BASE_ID not set!');
    console.log('\n📝 To get your Base ID:');
    console.log('1. Open your Airtable base');
    console.log('2. Go to https://airtable.com/api');
    console.log('3. Click on your base');
    console.log('4. The Base ID is in the URL: "The ID of this base is appXXXXXXXXXXXXXX"');
    console.log('5. Set it in AIRTABLE_BASE_ID environment variable');
    return;
  }

  try {
    console.log(`📋 Base ID: ${AIRTABLE_BASE_ID}`);
    console.log(`🔑 PAT: ${AIRTABLE_PAT.substring(0, 8)}...`);
    console.log('');

    const response = await fetch(AIRTABLE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_PAT}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commentsTableSchema)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Failed to create table:', response.status, response.statusText);
      console.error('Error details:', error);
      
      if (response.status === 401) {
        console.log('\n💡 This is likely an authentication issue:');
        console.log('- Check that your AIRTABLE_PAT is correct');
        console.log('- Ensure your token has the required scopes');
        console.log('- Make sure the token is not expired');
      } else if (response.status === 404) {
        console.log('\n💡 This is likely a Base ID issue:');
        console.log('- Check that your AIRTABLE_BASE_ID is correct');
        console.log('- Ensure you have access to this base');
      } else if (response.status === 422) {
        console.log('\n💡 The table might already exist or there\'s a schema issue');
        console.log('- Check if TutoComments table already exists in your base');
        console.log('- Verify the field names don\'t conflict with existing fields');
      }
      return;
    }

    const result = await response.json();
    console.log('✅ Successfully created TutoComments table!');
    console.log(`📊 Table ID: ${result.id}`);
    console.log(`📝 Table Name: ${result.name}`);
    console.log(`🏗️  Fields Created: ${result.fields.length}`);
    
    console.log('\n🎉 Comments functionality is now fully enabled!');
    console.log('Your app will now store comments permanently in Airtable.');
    
  } catch (error) {
    console.error('❌ Error creating table:', error.message);
    
    if (error.message.includes('fetch is not defined')) {
      console.log('\n💡 Node.js version issue:');
      console.log('- This script requires Node.js 18+ for built-in fetch');
      console.log('- Or install node-fetch: npm install node-fetch');
    } else if (error.message.includes('network')) {
      console.log('\n💡 Network issue:');
      console.log('- Check your internet connection');
      console.log('- Verify Airtable API is accessible');
    }
  }
}

// Use node-fetch for compatibility
try {
  if (typeof fetch === 'undefined') {
    const fetch = require('node-fetch');
    global.fetch = fetch;
  }
  createCommentsTable();
} catch (e) {
  console.log('❌ Error importing fetch:', e.message);
  console.log('Please run: npm install node-fetch');
}
