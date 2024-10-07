# Multi-User Vue.js Application with AI Model and Messaging

## Overview

This project is a multi-user Vue.js application hosted at [ia-fire.web.app](https://ia-fire.web.app), integrated with Firebase as a backend. It provides users access to AI models within the app and offers a messaging system for communication. Administrators can manage users, monitor their activity, and control access to AI models.

### Features

- **AI Model Integration**: Users can interact with AI models applied within the app.
- **Multi-User Support**: User registration, authentication, and role-based access.
- **Admin Functionality**: Administrators can:
  - Manage user statuses (active/inactive).
  - Monitor user activity (last online, current online/offline status).
  - Create and manage public posts.
  - Control access to AI features for specific users.
  - View messaging logs and moderate chat.
- **Messaging System**: Users can send messages in real-time with the integrated chat functionality.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: Make sure Node.js is installed on your machine. You can download it from [nodejs.org](https://nodejs.org/).
- **Firebase Account**: You need a Firebase account to set up the backend services.

## Installation

Follow these steps to set up the project locally:

1. **Clone the Repository**:
   ```bash
      https://github.com/Kouki321/Vue.js-Application-with-AI-Model.git


# Configure Firebase:

Create a Firebase project in your Firebase Console.
Set up Firestore and Authentication services.
In the src/firebase directory, create a configuration file (e.g., firebaseConfig.js) and add your Firebase configuration:
javascript
Copier le code
```

// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
```

## Project setup
### Running the Flask Backend

Follow the steps below to run the Flask server with CORS enabled and your Keras model:

1. **Install Flask-CORS** to handle cross-origin requests:

   ```bash
   pip install flask-cors
   ```

Run your Flask server (flaskk.py):
   ```bash
 python flaskk.py
```

npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```
model = tf.keras.models.load_model('path_to_your_model.keras')

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
