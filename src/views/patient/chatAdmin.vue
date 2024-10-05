<template>
  <div class="chat-container">
    <header class="chat-header">
      <h1>Chat with Admin</h1>
    </header>
    <div class="chat-messages" ref="messagesContainer">
      <div v-for="message in messages" :key="message.id" :class="['message', message.sender === userId ? 'sent' : 'received']">
        <div v-if="message.sender === userIds" class="message-content sent">
          <div class="message-text">
            <p>{{ message.content }}</p>
 
          </div>
          <span class="message-info">
            <span class="message-timestamp">{{ formatTimestamp(message.timestamp) }}</span>
          </span>
        </div>
        <div v-else class="message-content received">
          <div class="message-text">
            <p>{{ message.content }}</p>
 
          </div>
          <span class="message-info">
            <span class="message-timestamp">{{ formatTimestamp(message.timestamp) }}</span>
          </span>
        </div>
      </div>
    </div>
    <footer class="chat-input">
      <input v-model="newMessage" type="text" placeholder="Type a message..." @keyup.enter="sendMessage"/>
      <button @click="sendMessage">Send</button>
    </footer>
  </div>
</template>


<script>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, addDoc, getDoc, query, orderBy, onSnapshot } from 'firebase/firestore';

export default {
  name: 'ChatComponent',
  computed:{
    userIds(){
      const user = this.$store.state.user;
      return user ? user.uid : null; // Ensure `user` is not null  
        }
  },
  setup() {
    const newMessage = ref('');
    const messages = ref([]);
    const userId = ref('');
    const chatId = ref('');
    const unsubscribe = ref(null);
    const messagesContainer = ref(null); // Define ref for the messages container

    const getUserId = () => {
      const auth = getAuth();
      return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, user => {
          if (user) {
            userId.value = user.uid;
            resolve(user.uid);
          } else {
            reject('No user is signed in.');
          }
        });
      });
    };

    const sendMessage = async () => {
      if (newMessage.value.trim()) {
        try {
          const db = getFirestore();
          const messagesRef = collection(db, `chatAdmin/${chatId.value}/messages`);
          await addDoc(messagesRef, {
            sender: userId.value,
            content: newMessage.value.trim(),
            timestamp: new Date(),
          });
          newMessage.value = ''; // Clear the input field after sending
        } catch (error) {
          console.error('Error sending message:', error);
        }
      }
    };

    const listenForMessages = () => {
      const db = getFirestore();
      const messagesRef = collection(db, `chatAdmin/${chatId.value}/messages`);
      const q = query(messagesRef, orderBy('timestamp'));

      unsubscribe.value = onSnapshot(q, querySnapshot => {
        messages.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        nextTick(() => {
          // Scroll to the bottom of the messages container
          const container = messagesContainer.value;
          if (container) {
              container.scrollTop = container.scrollHeight;
            } else {
              console.warn('Messages container not found');
            }
        });
      });
    };

    const initializeChat = async () => {
      try {
        const uid = await getUserId();
        const adminId = '0Y7a0MuJvPVz2B2YYPO0bkLBPER2'; // Replace with your admin ID
        chatId.value = `${uid}`;

        const db = getFirestore();
        const chatDocRef = doc(db, 'chatAdmin', chatId.value);
        const chatDoc = await getDoc(chatDocRef);

        if (!chatDoc.exists()) {
          // Create chat document if it doesn't exist
          await setDoc(chatDocRef, {
            participants: [uid, adminId],
            createdAt: new Date(),
          });

          // Optionally, create initial messages
          const messagesRef = collection(chatDocRef, 'messages');
          await setDoc(doc(messagesRef, 'initial'), {
            sender: adminId,
            content: 'Hello! Welcome to the chat.',
            timestamp: new Date(),
          });
        }

        listenForMessages();
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp.toDate());
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    };

    onMounted(() => {
      initializeChat();
    });

    onUnmounted(() => {
      if (unsubscribe.value) {
        unsubscribe.value(); // Clean up the Firestore listener
      }
    });

    return {
      newMessage,
      messages,
      sendMessage,
      formatTimestamp,
    };
  },
};
</script>


<style scoped>
.chat-container {
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  height: 90vh;
  width: 80vw;
  min-width: 40%;
  margin: 0 auto;
  border: 1px solid #ddd;
   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

.chat-header {
  background-color: #4CAF50;
  color: #fff;
  padding: 16px;
  text-align: center;
  font-size: 1.2em;
  border-bottom: 1px solid #ddd;
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  border-bottom: 1px solid #ddd;
  background-color: #f9f9f9;
}

.message {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.message-content {
  padding: 8px 12px;
  border-radius: 20px;
  max-width: 80%;
  word-wrap: break-word;
  position: relative;
}

.message-content.sent {
  background-color: #d0f4d1; /* Green for user messages */
  align-self: flex-start; /* Align messages to the left */
  margin-left: auto; /* Push to the left */
  margin-right: 0; /* Remove margin on the right */
}

.message-content.received {
  background-color: #cce5ff; /* Blue for admin messages */
  align-self: flex-end; /* Align messages to the right */
  margin-right: auto; /* Push to the right */
  margin-left: 0; /* Remove margin on the left */
}
.message-text {
  margin-bottom: 4px;
}

.message-info {
  font-size: 0.8em;
  color: #555;
}

.message-timestamp {
  display: block;
  margin-bottom: 2px;
}

.chat-input {
  display: flex;
  padding: 8px;
  border-top: 1px solid #ddd;
}

.chat-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 20px;
  margin-right: 8px;
}

.chat-input button {
  padding: 10px 20px; /* Increase padding for a larger button */
  font-size: 1em; /* Adjust font size if needed */
  border: none;
  background-color: #4CAF50;
  color: #fff;
  border-radius: 20px;
  cursor: pointer;
}

.chat-input button:hover {
  background-color: #45a049;
}

</style>