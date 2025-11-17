const fs = require('fs');
const path = require('path');

console.log('🔥 Setting up Firebase configuration...');

// Create firebase.json
const firebaseConfig = {
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "functions": {
    "source": "functions",
    "predeploy": [
      "npm --prefix \"$RESOURCE_DIR\" run build"
    ]
  },
  "hosting": {
    "public": "web-build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8080
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
};

// Create .firebaserc
const firebaserc = {
  "projects": {
    "default": "tuto-school-platform"
  }
};

// Create firestore.rules
const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // School data isolation
    match /schools/{schoolId} {
      allow read, write: if request.auth != null && 
        (request.auth.token.schoolId == schoolId || 
         request.auth.token.role == 'admin');
    }
    
    // User data isolation
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || 
         request.auth.token.role == 'admin');
    }
    
    // Daily activities
    match /dailyActivities/{activityId} {
      allow read, write: if request.auth != null && 
        (request.auth.token.schoolId == resource.data.schoolId || 
         request.auth.token.role == 'admin');
    }
    
    // Messages
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        (request.auth.token.schoolId == resource.data.schoolId || 
         request.auth.token.role == 'admin');
    }
    
    // Absence requests
    match /absenceRequests/{requestId} {
      allow read, write: if request.auth != null && 
        (request.auth.token.schoolId == resource.data.schoolId || 
         request.auth.token.role == 'admin');
    }
    
    // Health records
    match /healthRecords/{recordId} {
      allow read, write: if request.auth != null && 
        (request.auth.token.schoolId == resource.data.schoolId || 
         request.auth.token.role == 'admin');
    }
    
    // Photo albums
    match /photoAlbums/{albumId} {
      allow read, write: if request.auth != null && 
        (request.auth.token.schoolId == resource.data.schoolId || 
         request.auth.token.role == 'admin');
    }
    
    // Payments
    match /payments/{paymentId} {
      allow read, write: if request.auth != null && 
        (request.auth.token.schoolId == resource.data.schoolId || 
         request.auth.token.role == 'admin');
    }
  }
}`;

// Create storage.rules
const storageRules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // School photos
    match /schools/{schoolId}/photos/{allPaths=**} {
      allow read, write: if request.auth != null && 
        (request.auth.token.schoolId == schoolId || 
         request.auth.token.role == 'admin');
    }
    
    // User uploads
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || 
         request.auth.token.role == 'admin');
    }
  }
}`;

// Create firestore.indexes.json
const firestoreIndexes = {
  "indexes": [
    {
      "collectionGroup": "dailyActivities",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "schoolId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "date",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "schoolId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "date",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "absenceRequests",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "schoolId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
};

// Write files
fs.writeFileSync('firebase.json', JSON.stringify(firebaseConfig, null, 2));
fs.writeFileSync('.firebaserc', JSON.stringify(firebaserc, null, 2));
fs.writeFileSync('firestore.rules', firestoreRules);
fs.writeFileSync('storage.rules', storageRules);
fs.writeFileSync('firestore.indexes.json', JSON.stringify(firestoreIndexes, null, 2));

console.log('✅ Firebase configuration files created successfully!');
console.log('📁 Files created:');
console.log('  - firebase.json');
console.log('  - .firebaserc');
console.log('  - firestore.rules');
console.log('  - storage.rules');
console.log('  - firestore.indexes.json');
console.log('');
console.log('🚀 Next steps:');
console.log('  1. Create Firebase project at https://console.firebase.google.com');
console.log('  2. Update .firebaserc with your project ID');
console.log('  3. Run: firebase deploy');































