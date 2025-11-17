/**
 * Quick Airtable Table Creator
 * 
 * This script prompts you for credentials and creates the table immediately.
 * No environment setup needed!
 */

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Use node-fetch for API calls
let fetch;
try {
  fetch = require('node-fetch');
} catch (e) {
  console.log('Installing node-fetch...');
  require('child_process').execSync('npm install node-fetch', { stdio: 'inherit' });
  fetch = require('node-fetch');
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

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
  console.log('🚀 Quick Airtable Table Creator for TutoComments\n');
  
  console.log('📝 First, get your credentials:');
  console.log('1. Airtable PAT: https://airtable.com/create/tokens');
  console.log('2. Base ID: https://airtable.com/api (click your base)\n');
  
  const airtablePAT = await askQuestion('Enter your Airtable Personal Access Token: ');
  const baseId = await askQuestion('Enter your Base ID (starts with app): ');
  
  if (!airtablePAT || !baseId) {
    console.log('❌ Both PAT and Base ID are required!');
    rl.close();
    return;
  }
  
  console.log('\n⏳ Creating TutoComments table...');
  
  try {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${airtablePAT}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commentsTableSchema)
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Failed to create table:', response.status);
      console.log('Error:', error);
      
      if (response.status === 422) {
        console.log('\n💡 Table might already exist! Check your Airtable base.');
      }
    } else {
      const result = await response.json();
      console.log('✅ Success! TutoComments table created!');
      console.log(`📊 Table ID: ${result.id}`);
      console.log(`📝 Fields: ${result.fields.length} created`);
      console.log('\n🎉 Comments are now enabled in your app!');
    }
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  rl.close();
}

createTable();



































