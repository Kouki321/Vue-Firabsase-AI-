<template>
  <div class="home">
    <BlogPost v-if="!user" :post="welcomeScreen" />
    <BlogPost :post="post" v-for="(post, index) in blogPostsFeed" :key="index" />
    <div class="blog-card-wrap">
        <div class="container">
          <h3>View More Recent Posts</h3>
          <div class="blog-cards">
             <BlogCards :post="post" v-for="(post, index) in blogPostscards" :key="index" />
          </div>
        </div>
      </div>
      <div v-if="!user" class="updates">
        <div class="container">
          <h2> Register now to access to see my new Model.</h2>
          <router-link class="router-button" :to="{name:'RegisterView'}">  registre 
          </router-link>
        </div>
      </div>
  </div>
</template> 
<script>

import BlogPost from "../components/BlogPost"
import BlogCards from "../components/BlogCard"

export default {
  name: "HomeView",
  components :{BlogPost,BlogCards},
  data() {
    return {
      welcomeScreen: {
        title: "Welcome!",
        blogPost: "We're delighted to have you join our community. Our app is designed to provide you with easy access to personalized medical care, connect you with experienced doctors, and manage your health needs all in one place. Whether you're booking appointments, chatting with your healthcare provider, or keeping track of your health records, we are here to support you every step of the way..",
        welcomeScreen:true,
        photo: "coding", // Assuming 'coding' refers to an image asset
      },
     
    };
  },
  
  computed: {
    blogPostsFeed(){
      return this.$store.getters.blogPostsFeed;
    },
    blogPostscards(){
      return this.$store.getters.blogPostscards;
    },
    user(){
            return this.$store.state.user;
        }
  }
};
</script>
<style lang="scss" scoped>
.sendrequest{  
  margin-top: -6%; /* Space between search and dropdown */
  width: calc(100% - 22px); /* Adjust for padding */
 transform: translateX(50%);
 background-color: #28a745;
 color: #fff;
 border: none;
 border-radius: 5px;
 padding: 10px ;
 cursor: pointer;
 transition: background-color 0.3s;
}


  .blog-card-wrap {
    h3 {
      font-weight: 300;
      font-size: 28px;
      margin-bottom: 32px;
    }
  }

  .updates {
    .container {
      padding: 100px 25px;
      display: flex;
      flex-direction: column;
      align-items: center;

      @media (min-width: 800px) {
        padding: 125px 25px;
        flex-direction: row;
      }
    }

    .router-button {
      display: flex;
      font-size: 14px;
      text-decoration: none;

      @media (min-width: 800px) {
        margin-left: auto;
      }
    }

    h2 {
      font-weight: 300;
      font-size: 32px;
      max-width: 425px;
      width: 100%;
      text-align: center;
      text-transform: uppercase;

      @media (min-width: 800px) {
        text-align: initial;
        font-size: 40px;
      }
    }
}

</style>
