<template> 
    <div class="form-wrap"> 
      <form class="login"> 
        <p class="login-register"> 
          Don't have an account? 
          <router-link class="router-link" :to="{ name: 'RegisterView' }">Register</router-link> 
        </p> 
        <h2>Login to FireBlogs</h2> 
        <div class="inputs">
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
        <router-link class="forget-password" :to="{ name: 'ForgetPassword' }"> 
          Forget your Password?
        </router-link>
        <button @click.prevent="signIn">Sign In</button>
        <div class="angle"></div>
      </form> 
      <div class="background"></div>
    </div> 
    
</template> 

<script>
import { getAuth,signOut, signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc, updateDoc, serverTimestamp  } from "firebase/firestore";
import { db } from "../firebase/firebaseInit"; // Ensure this import is correct

export default { 
  name: "LoginView",
  data() {
    return {
      email: null,
      password: null,
      error: null,
      errorMsg: "",
    };
  },
  mounted(){
    window.addEventListener('resize', this.checkScreen);

  },
  Unmount(){    // This will reload the page
    window.location.reload();
  },
  methods: {

    async signIn() {
      const auth = getAuth();
      try {
        // Sign in the user with email and password
        const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
        const userId = userCredential.user?.uid;

        // Reference to the user's document in Firestore
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          // Check if the user's account is active
          if (userDoc.data().active) {
            const user = this.$store.state.user; // Assuming user is already set in the Vuex state
            if (user) {
              this.$store.dispatch("getCurrentser", user);
            }
            this.$router.push({ name: "HomeView" });
            this.error = false;
            this.errorMsg = "";
            try {
                  await updateDoc(userRef, {
                    online: true,
                    // Optionally, update lastOnline to the current timestamp when logging in
                    lastOnline: serverTimestamp(),
                  });
                  console.log('User set to online');
                } catch (error) {
                  console.error('Error setting user online:', error);
                }


            
          } else {
            signOut(getAuth());
            throw new Error("Your account is not active. Please contact support.");
          }
        } else {
          // Handle the case where the user document does not exist
          throw new Error("User does not exist.");
        }
      } catch (err) {
        // Handle errors from Firebase authentication and Firestore
        this.error = true;
        this.errorMsg = err.message;
      }
    }
  


}
};

</script>


<style lang="scss">
.form-wrap {
  overflow: hidden;
  display: flex;
  height: 100vh;
  justify-content: center;
  align-self: center;
  margin: 0 auto;
  width: 90%;
  
  @media (min-width: 900px) {
    width: 100%;
  }

  .login-register {
    margin-bottom: 32px;
    
    .router-link {
      color: #000;
    }
  }

  form {
    padding: 0 10px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;

    @media (min-width: 900px) {
        padding: 0 50px;
    }
    h2 {  
    text-align: center;  
    font-size: 32px;  
    color: #303030;  
    margin-bottom: 40px;  

    @media (min-width: 900px) {  
        font-size: 40px;  
    }  
    }
    .inputs {
    width: 100%;
    max-width: 350px;

    .input {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 8px;

        input {
        width: 100%;
        border: none;
        background-color: #f2f7f6;
        padding: 4px 4px 4px 30px;
        height: 50px;
        outline: none;

        &:focus {
            outline:none;
        }
        }
        .icon{
            width: 12px;
            position: absolute;
            left: 6px;
        }
     ///2 24 24    
    }
}


    .forgot-password {  
    text-decoration: none;  
    color: #000;  
    cursor: pointer;  
    font-size: 14px;  
    margin: 16px 0 32px;  
    border-bottom: 1px solid transparent;  
    transition: 0.5s ease all;  
    
    &:hover {  
        border-color: #303030;  
    }  
    }
    .angle {
      display: none;
      position: absolute;
      background-color: #fff;
      transform: rotateZ(3deg);
      width: 60px;
      right: -30px;
      height: 101%;
        @media (min-width: 900px) {
        display: initial;
        }
      }




  }

  .background {  
    display: none;  
    flex: 2;  
    background-size: cover;  
    background-image: url("../assets/background.png");  
    width: 100%;  
    height: 100%;  
    @media (min-width: 900px) {  
      display: initial;  
      }  
    }
}
 
</style>
  