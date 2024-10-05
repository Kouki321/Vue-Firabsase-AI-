<template>
  <div class="reset-password">
    <Modal v-if="modalActive" :modalMessage="modalMessage" v-on:close-modal="closeModal"/>
    <Loading v-if="loading" />
    <div class="form-wrap">
      <form class="reset">
        <p class="login-register">
          Back to 
          <router-link class="router-link" :to="{ name: 'LoginView' }">Login</router-link>
        </p>
        <h2>Reset Password</h2>
        <p>Forgot your password? Enter your email to reset it</p>
        <div class="inputs">
          <div class="input">
            <input type="text" placeholder="Email" v-model="email" />
            <img src="../assets/Icons/envelope-regular.svg" class="icon" /> 
          </div>
        </div>
        <button type="button" @click.prevent="resetPassword">Reset</button>
        <div class="angle"></div>
      </form>
      <div class="background"></div>
    </div>
  </div>
</template>
  
<script>
//import { auth } from '@/firebase/firebaseInit';
import Loading from '../components/LoadingView';
import Modal from "../components/ModalView"

//import firebaseApp from '@/firebase/firebaseInit';

import { getAuth, sendPasswordResetEmail } from "firebase/auth";
//import { db } from "../firebase/firebaseInit";
//import firebase from 'firebase/app';
export default {
  name:"ForgetPassword",
  components:{
    Modal,
    Loading,
  },
  data(){
    return{
      email:null,
      modalActive:false,
      modalMessage:"",
      loading:null,

     }
  },
  methods:{

    resetPassword() {
    this.loading = true;
     sendPasswordResetEmail(getAuth(),this.email)
      .then(() => {
        this.modalMessage = "If your account exists, you will receive an email.";
        this.loading = false;
        this.modalActive = true;
      })
      .catch((err) => {
        this.modalMessage = err.message;
        this.loading = false;
        this.modalActive = true;
      });
  },

    closeModal(){
      this.modalActive=!this.modalActive;
      this.email='';
    }
  }
}
</script>
  
<style lang="scss" scoped>
.reset-password{
  position: relative;
  .form-wrap{
    .reset{
      h2{
        margin-bottom: 8px;
      }
      p{
        margin-bottom: 32px;
      }
    }
  }
}
  
</style>