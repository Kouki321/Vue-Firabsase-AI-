<template>
  <div class="admin-chat-container">
    <aside class="user-list">
    <input v-model="searchQuery" type="text" placeholder="Search users..." class="search-input" />
    <ul>
      <li 
        v-for="user in filteredUsers" 
        :key="user.id" 
        @click="selectUser(user)" 
        :class="{'active': user.id === selectedUser?.id}" 
        class="text_users"
      >
        <img :src="user.profileImage" alt="User Image" class="user-image" />
        <div class="user-info">
          <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
          <span v-if="user?.online" class="online-status online">Online</span>
          <span v-else-if="user?.lastOnline" class="online-status offline">
            {{ formatTimestamp(user.lastOnline) }}
          </span>
          <span v-else class="online-status offline">Offline</span>
        </div>
      </li>
    </ul>
  </aside>
    <div class="chat-area" v-if="selectedUser">
      <header class="chat-header">
        <img :src="selectedUser?.profileImage" alt="User Image" class="user-image" />
        <h1 >Chat with {{ selectedUser?.firstName }} {{ selectedUser?.lastName }}</h1>
        <!-- Display online status safely -->
        </header>
      <div class="chat-messages" ref="messagesContainer">
        <div 
          v-for="message in messages" 
          :key="message.id" 
          :class="['message', message.sender === userId ? 'sent' : 'received']"
        >
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
  </div>
</template>


<script>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { getFirestore, collection, query, orderBy, getDocs, onSnapshot, addDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default {
  name: 'adminchatView',
  setup() {
    const users = ref([]);
    const searchQuery = ref('');
    const selectedUser = ref(null);
    const messages = ref([]);
    const newMessage = ref('');
    const userId = ref('');
    const unsubscribe = ref(null);

    // Filter users based on search query
    const filteredUsers = computed(() => {
      return users.value.filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase(); // Use full name for search
        return fullName.includes(searchQuery.value.toLowerCase());
      });
    });

    // Function to select a user and load their chat
    const selectUser = async (user) => {
      console.log(selectUser)
      selectedUser.value = user;
      await loadChat(user.id);
    };

    // Function to load chat messages from Firestore
    const loadChat = async (chatId) => {
      try {
        const db = getFirestore();
        const messagesRef = collection(db, `chatAdmin/${chatId}/messages`);
        const q = query(messagesRef, orderBy('timestamp'));

        unsubscribe.value = onSnapshot(q, querySnapshot => {
          messages.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          nextTick(() => {
            const container = document.querySelector('.chat-messages');
            container.scrollTop = container.scrollHeight;
          });
        });
      } catch (error) {
        console.error('Error loading chat:', error);
      }
    };

    // Function to send a message
    const sendMessage = async () => {
      if (newMessage.value.trim() && selectedUser.value) {
        try {
          const db = getFirestore();
          const messagesRef = collection(db, `chatAdmin/${selectedUser.value.id}/messages`);
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

    // Function to get the current user ID
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

    // Function to format timestamp into a readable format
    const formatTimestamp = (timestamp) => {
      const now = new Date();
      const date = new Date(timestamp.toDate());
      const diffInSeconds = Math.floor((now - date) / 1000);

      // More than a month ago
      if (diffInSeconds > 2592000) { // 30 days * 24 hours * 60 minutes * 60 seconds
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      }
      // More than a day ago
      if (diffInSeconds > 86400) { // 24 hours * 60 minutes * 60 seconds
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
      }
      // More than an hour ago
      if (diffInSeconds > 3600) { // 60 minutes * 60 seconds
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
      }
      // More than a minute ago
      if (diffInSeconds > 60) {
        return `${Math.floor(diffInSeconds / 60)} minutes ago`;
      }
      return 'Just now';
    };

    // Fetch users and setup Firestore listeners when component is mounted
    onMounted(async () => {
      try {
        await getUserId();

        // Load users from Firestore
        const db = getFirestore();
        const usersRef = collection(db, 'users'); // Ensure this path is correct
        const usersSnapshot = await getDocs(usersRef);

        // Filter users who are not admin, are active, and include lastOnline and online fields
        users.value = usersSnapshot.docs
          .map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            lastOnline: doc.data().lastOnline,  // Include lastOnline field
            online: doc.data().online           // Include online field
          }))
          .filter(user => user.admin === false && user.active === true);

        console.log('Filtered Users:', users.value);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    });

    // Clean up Firestore listeners when component is unmounted
    onUnmounted(() => {
      if (unsubscribe.value) {
        unsubscribe.value(); // Clean up the Firestore listener
      }
    });

    return {
      users,
      searchQuery,
      filteredUsers,
      selectedUser,
      messages,
      newMessage,
      sendMessage,
      formatTimestamp,
      selectUser
    };
  },
  computed: {
    userIds() {
      const user = this.$store.state.user;
      return user ? user.uid : null; // Ensure `user` is not null  
    }
  }
};
</script>

<style scoped>
.user-image {
  width: 40px;             /* Adjust size of the user image */
  height: 40px;            /* Adjust size of the user image */
  border-radius: 50%;      /* Make the image circular */
  margin-right: 10px;      /* Space between image and text */
}

.admin-chat-container {
  display: flex;
  height: 90vh;
  width: 80vw;
  margin: 0 auto;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #fff;
}

.user-list {
  width: 25%;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  padding: 10px;
  background-color: #f4f4f4;
}

.search-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin-bottom: 10px;
}

.user-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.user-list li {
  padding: 10px;
  cursor: pointer;
}

.user-list li.active {
  background-color: #ddd;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.chat-header {
  display: flex; /* Use flexbox to align items horizontally */
  align-items: center; /* Center items vertically */
  background-color: #4CAF50;
  color: #fff;
  padding: 16px;
  text-align: auto; /* Change to left to align items in a row */
  font-size: 1.2em;
  border-bottom: 1px solid #ddd;
}
 .chat-header img {
  width: 75px; /* Adjust the size of the icon */
  height: 75px;
  border-radius: 50%; /* Optional: If you want a circular icon */
  margin-right: 20px; /* Space between the icon and the title */
}


.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background-color: #f9f9f9;
  border-bottom: 1px solid #ddd;
}
 
.text_users {
  display: flex;           /* Enable Flexbox */
  align-items: center;     /* Align items vertically in the center */
  margin-bottom: 10px;     /* Space between list items */
  padding: 5px;            /* Space within list items */
  border-bottom: 1px solid #ddd; /* Optional: Add a border for separation */
}
 
.text_users:hover {
  background-color: #f5f5f5;
}
.user-info {
  display: flex;           /* Enable Flexbox for user info */
  flex-direction: column;  /* Stack text items vertically */
}

.user-name {
  font-size: 1em;          /* Adjust font size for the user name */
}

.online-status {
  font-size: 0.7em;        /* Adjust font size if needed */
  width: 100%; /* Adjust the size of the icon */
  height: 5px;
}

.online {
  color: green;            /* Color for online status */
}

.offline {
  color: red;              /* Color for offline status */
}

.status-text {
  font-size: 0.8em;        /* Smaller font size for status text */
  margin-top: 5px;         /* Space between status label and timestamp */
}
.active {
  background-color: #e0f7fa; /* Optional: highlight active user */
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
  background-color: #d0f4d1;
  align-self: flex-start;
  margin-left: auto;
  margin-right: 0;
}

.message-content.received {
  background-color: #cce5ff;
  align-self: flex-end;
  margin-right: auto;
  margin-left: 0;
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
  padding: 8px 16px;
  border: none;
  background-color: #4CAF50;
  color: #fff;
  border-radius: 20px;
  cursor: pointer;
}
 
.chat-input button:hover {
  background-color: #45a049;
}

.chat-input button:focus {
  outline: none;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}

</style>