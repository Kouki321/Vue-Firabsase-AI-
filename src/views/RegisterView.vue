<template>
  <div class="form-wrap"> 
    <form class="registerView"> 
      <p class="login-register"> 
        Already have an account?
        <router-link class="router-link" :to="{ name: 'LoginView' }">Login</router-link> 
      </p> 
      <h2>Create your Account</h2> 
      <div class="inputs">
        <div class="input">
          <input type="text" placeholder="First Name" v-model="firstName" /> 
          <img src="../assets/Icons/user-alt-light.svg" class="icon" />
        </div>
        <div class="input">
          <input type="text" placeholder="Last Name" v-model="lastName" /> 
          <img src="../assets/Icons/user-alt-light.svg" class="icon" />
        </div>
        <div class="input">
          <input type="text" placeholder="User Name" v-model="userName" /> 
          <img src="../assets/Icons/user-alt-light.svg" class="icon" />
        </div>
        <div class="input">
          <input type="text" placeholder="Email" v-model="email" /> 
          <img src="../assets/Icons/envelope-regular.svg" class="icon" />
        </div>
        <div class="input"> 
          <input type="password" placeholder="Password" v-model="password" /> 
          <img src="../assets/Icons/lock-alt-solid.svg" class="icon" />
        </div>
        <div class="error" v-show="error">{{ this.errorMsg }}</div>
      </div>  
      <button @click.prevent="register">Sign up</button>
      <div class="angle"></div>
    </form> 
    <div class="background"></div>
  </div> 
</template>

<script>
import {signOut, getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "../firebase/firebaseInit";
import { collection, doc, getDoc,setDoc, query, where, getDocs } from "firebase/firestore";
 
export default {
  name: 'RegisterView',
  data() {
    return {
      email: "",
      password: "",
      lastName: "",
      firstName: "",
      userName: "",
      error: null,
      errorMsg: "",
      active: false,
      admin: false,
      patient:true,
    };
  },
  unmounted(){
    window.location.reload();
  },
  methods: {
    async register() {
      if (
        this.email !== "" &&
        this.password !== "" &&
        this.firstName !== "" &&
        this.lastName !== "" &&
        this.userName !== ""
      ) {
        this.error = false;
        this.errorMsg = "";

        try {
           // Check if the email already exists in Firestore
           const q = query(collection(db, "users"), where("email", "==", this.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            // Email already exists in Firestore
            throw new Error("This email is already registered. Please use a different email.");
          }
          const auth = getAuth();
          const { user } = await createUserWithEmailAndPassword(auth, this.email, this.password);

          
          const userDoc = doc(collection(db, "users"), user.uid);
          await setDoc(userDoc, {
            firstName: this.firstName,
            lastName: this.lastName,
            userName: this.userName,
            active: false,
            admin: false,
            patient: true,
            profileImage:"",
            email: this.email,
            online:false,
            lastOnline:new Date()
          });
          const adminId = ' 0Y7a0MuJvPVz2B2YYPO0bkLBPER2';
          const chatId = `chat_${user.uid}_${adminId}`;

           // Check if the chat already exists
           const chatDocRef = doc(db, "chatAdmin", chatId);
          const chatDoc = await getDoc(chatDocRef);

          if (!chatDoc.exists()) {
            // Create chat document if it doesn't exist
            await setDoc(chatDocRef, {
              participants: [user.uid, adminId],
              createdAt: new Date(),
            });

            // Optional: Create initial messages in the chat
            const messagesRef = collection(chatDocRef, "messages");
            await setDoc(doc(messagesRef, 'initial'), {
              sender: adminId,
              content: 'Hello! Welcome to the chat.',
              timestamp: new Date(),
            });
          }

          signOut(getAuth());
          
          this.$router.push({ name: "HomeView" });
        } catch (error) {
          this.error = true;
          this.errorMsg = error.message;
          console.error("Error registering user:", error); // Print error details
        }
        return;
      }
      this.error = true;
      this.errorMsg = "Please fill out all the fields!";
    },
  }
};
</script>

<style lang="scss" scoped>
.register {
  h2 {
    max-width: 350px;
  }
}
</style>
