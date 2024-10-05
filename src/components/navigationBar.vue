<template>
    <header> 
    <nav class="container">
            <div class="branding">
                <router-link class="header" :to="{name:'HomeView'}">AI Kouki</router-link>
            </div>
            <div class="nav-links">
                <ul v-show="!mobile">
                    <router-link class="link" :to="{name:'HomeView'}">Home</router-link>
                    <router-link class="link" :to="{name:'BlogsView'}">Posts</router-link>
                    <router-link v-if="admin" class="link"  :to="{name:'CreatePost'}">Create Post</router-link>
                    <router-link v-if="admin" class="link"  :to="{name:'UsersView'}">Users</router-link>
                    <router-link v-if="!user" class="link" :to="{name:'LoginView'}">Login/Register</router-link>
                    <router-link v-if="patient" class="link" :to="{ name: 'chat', params: { userId: userId } }">Chat Admin</router-link>
                    <router-link v-if="admin" class="link" :to="{ name: 'adminchatView', params: { userId: userId } }">Chat</router-link>
                    <router-link v-if="admin" class="link" :to="{ name: 'adminpageView',  }">Static</router-link>
                    <router-link v-if="user" class="link"  :to="{name:'IAVetgavalView'}">IA Vet & Fruit</router-link>
                </ul>
                
                <div v-if="user" @click="toggleProfileMenu" class="profile" ref="profile">
                    <span>{{ this.$store.state.profileInitials }}</span>
                    <div v-show="profileMenu" class="profile-menu">
                        <div class="info">
                            <p class="initials">{{ this.$store.state.profileInitials }}</p>
                            <div class="right">
                                <p>{{ this.$store.state.profileFirstName }} {{ this.$store.state.profileLastName }}</p>
                                <p>{{ this.$store.state.profileUserName }}</p>
                                <p>{{ this.$store.state.profileEmail }}</p>
                            </div>
                        </div>
                        <div class="options">
                            
                            <div class="option">
                                <router-link class="option" :to="{name:'Profilepatient'}">
                                    <img src="../assets/Icons/user-alt-light.svg" class="icon" />
                                    <p> Profile </p>
                                </router-link>
                            </div>
                          
                            <div @click="signOut" class="option">
                                <router-link class="option" to="#">
                                    <img src="../assets/Icons/sign-out-alt-regular.svg" class="icon" />
                                    <p> Sign Out</p>
                                </router-link>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </nav>
         <img @click="toggleMobileNav" src="../assets/Icons/bars-regular.svg"  class="menu-icon" v-show="mobile"> 
        <transition name="mobile-nav">
                <ul class="mobile-nav" v-show="mobileNav">
                    <router-link class="link" :to="{name:'HomeView'}">Home</router-link>
                    <router-link class="link" :to="{name:'BlogsView'}">Posts</router-link>
                    <router-link v-if="admin" class="link"  :to="{name:'CreatePost'}">Create Post</router-link>
                    <router-link v-if="admin" class="link"  :to="{name:'UsersView'}">Users</router-link>
                    <router-link v-if="user" class="link"  :to="{name:'IAVetgavalView'}">IA Vet & Fruit</router-link>
                    <router-link v-if="!user||!admin" class="link" :to="{name:'LoginView'}">Login/Register</router-link>
                    <router-link v-if=" patient" class="link" :to="{ name: 'chat', params: { userId: userId } }">Chat Admin</router-link>
                    <router-link v-if="admin" class="link" :to="{ name: 'adminchatView', params: { userId: userId } }">Chat</router-link>
                    <router-link v-if="admin" class="link" :to="{ name: 'adminpageView',  }">Static</router-link>
                    
                </ul>
        </transition>
   </header>
</template>


<script>
import { getAuth, signOut } from "firebase/auth";
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

 export default {
    name:"navigationBar",
  
     data (){
        return{
            mobile : false,
            mobileNav : false,
            windowWidth :null,
            profileMenu :false
        };
       
     },
     mounted() {
        this.checkScreen();
        window.addEventListener('resize', this.checkScreen);
    },
    beforeMount() {
        window.removeEventListener('resize', this.checkScreen);
    },
    methods: {
        async signOut(){

            const auth = getAuth();
            const db = getFirestore();

            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                try {
                // Update Firestore with offline status and last online timestamp
                await updateDoc(userDocRef, {
                    online: false,
                    lastOnline: serverTimestamp(),
                });

                // Sign the user out from Firebase Auth
                await signOut(auth);

            window.location.pathname = '/';
                } catch (error) {
                    console.error('Error logging out:', error);
                    }
                }
                window.location.reload()
         }
        ,
        toggleProfileMenu(event){
            if(event.target === this.$refs.profile)
           { this.profileMenu=!this.profileMenu
        }},

        checkScreen() {
            this.windownWidth = window.innerWidth;
            if (this.windownWidth <= 750) {
                this.mobile = true;
                return;
                }
            this.mobile = false;
            this.mobileNav = false;
            return;
            },
        toggleMobileNav(){
            this.mobileNav=!this.mobileNav;
        }


            },
    computed:{
        user(){
            return this.$store.state?.user;
        }, 
        userId() {
      return this.$store.state.user?.uid; // Optional chaining for safety
    },
        admin(){
            return this.$store.state.profileAdmin;
        }
       ,patient(){
            return this.$store.state.profilepatient;
        },
      /*  active(){
            return this.$store.state.active;
        }*/
    },  
  /*  created() {
    const user = this.$store.state.user; // Assuming user is already set in the Vuex state
    if (user) {
      this.$store.dispatch("getCurrentser", user);
    }},*/
    }

</script>



<style lang="scss" scoped>
header {
    background-color: #fff;
    padding: 0 25px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    z-index: 99;

    .link {
    font-weight: 500;
    padding: 0 8px;
    transition: 0.3s color ease;
        &:hover {
        color: #1eb8b8;
         }
    }
    nav {
        display: flex;
        padding: 25px 0;
        .branding {
            display: flex;
            align-items: center;
                .header {
                font-weight: 600;
                font-size: 24px;
                color: #000;
                text-decoration: none;
                        }
            }
            .nav-links {
                position: relative;
                display: flex;
                flex: 1;
                align-items: center;
                justify-content: flex-end;
                    ul {
                    margin-right: 32px;
                        .link {
                        margin-right: 32px;
                        }
                        .link:last-child {
                        margin-right: 0;
                        }
                    }
                    .profile {
                    position: relative;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    color: #fff;
                    background-color: #4CAF50;
                    span{
                        pointer-events: none;
                    }

                    .profile-menu {
                        position: absolute;
                        top: 60px;
                        right: 0;
                        width: 250px;
                        background-color: #1cb037;
                        box-shadow: 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);

                            .info {
                                display: flex;
                                align-items: center;
                                padding: 15px;
                                border-bottom: 1px solid #fff; 

                                .initials {
                                    position: initial; 
                                    width: 40px;
                                    height: 40px;
                                    background-color: #fff; 
                                    color: #303030;  
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    border-radius: 50%;  
                                    }
                                    .right{
                                        flex: 1;
                                        margin-left:24px ;
                                        p:nth-child(1){
                                            font-size: 14px;
                                        }
                                        p:nth-child(2),
                                        p:nth-child(3){
                                            font-size: 12px;
                                        }
                                    }

                                }
                              .options {
                                padding: 15px;

                                .option {
                                text-decoration: none;
                                color: #fff;
                                display: flex;
                                align-items: center;
                                margin-bottom: 12px;

                                .icon {
                                    width: 18px;
                                    height: auto;
                                    }

                                p {
                                    font-size: 14px;
                                    margin-left: 12px;
                                    }

                                &:last-child {
                                    margin-bottom: 0;
                                    }
                            }
                        }
                    } 
                }  
            }
    }   
        
        .menu-icon {
            cursor: pointer;
            position: absolute;
            top: 32px;
            right: 70px;
            height: 25px;
            width: auto;
            }

        .mobile-nav{
            padding: 20px;
            width: 70%;
            max-width: 250px;
            display: flex;
            flex-direction: column;
            position: fixed;
            height: 100%;
            background-color: #303030;
            top: 0;
            left: 0;
            .link{
                padding: 15px 0;
                color:#fff;
            }
            }
            .mobile-nav-enter-active ,
            .mobile-nav-leave-active {
            transition: all 1s ease;
            }

            .mobile-nav-enter {
            transform: translateX(-250px);
            }

            .mobile-nav-enter-to {
 
            transform: translateX(0);
            }
            
            .mobile-nav-leave-to {
            transform: translateX(-250px);
            }
}
</style>