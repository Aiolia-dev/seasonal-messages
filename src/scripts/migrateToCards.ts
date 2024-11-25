import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8Ql2KPKbQlEpLwFxNHZPcXhRTGGHNpBc",
  authDomain: "seasons-test-cf01e.firebaseapp.com",
  projectId: "seasons-test-cf01e",
  storageBucket: "seasons-test-cf01e.appspot.com",
  messagingSenderId: "1015347156605",
  appId: "1:1015347156605:web:b5a5c5e5c1c5c5c5c5c5c5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateMessagesToCards() {
  try {
    // Get all messages
    const messagesRef = collection(db, 'messages');
    const messageSnapshot = await getDocs(messagesRef);
    
    console.log(`Found ${messageSnapshot.size} messages to migrate...`);

    // Migrate each message to cards collection
    for (const messageDoc of messageSnapshot.docs) {
      const messageData = messageDoc.data();
      
      // Create new card with the same data
      const cardsRef = collection(db, 'cards');
      await addDoc(cardsRef, {
        ...messageData,
        createdAt: messageData.createdAt // Preserve the original timestamp
      });
      
      // Delete the original message
      await deleteDoc(doc(db, 'messages', messageDoc.id));
      
      console.log(`Migrated message ${messageDoc.id} to cards collection`);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

// Run the migration
migrateMessagesToCards();
