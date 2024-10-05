import { createStore } from 'vuex'
///import { getAuth } from "firebase/auth";
import { db } from "../firebase/firebaseInit";
import { collection, doc,getDocs,getDoc,deleteDoc,updateDoc} from "firebase/firestore";
import {getStorage,ref,deleteObject} from 'firebase/storage';

export default createStore({
  state: {
     sampleBlogCards: [
      { blogTitle: "Blog Card #1", blogCoverPhoto: "stock-1", blogDate: "May 1, 2021" },
      { blogTitle: "Blog Card #2", blogCoverPhoto: "stock-2", blogDate: "May 1, 2021" },
      { blogTitle: "Blog Card #3", blogCoverPhoto: "stock-3", blogDate: "May 1, 2021" },
      { blogTitle: "Blog Card #4", blogCoverPhoto: "stock-4", blogDate: "May 1, 2021" },
      ],
      editPost: false,
      blogPosts:[],
      postLoaded:null,
      blogTitle:"",
      blogHTML:"Write your blog title here",
      blogPhotoName:"",
      blogPhotoFileURL:null,
      blogPhotoPreview:null,
      editpost: null,
      user: null, 
      profileImage: null,
      profileAdmin:false,
      profilepatient:null,
      profileEmail: null, 
      profileFirstName: null,
      profileLastName: null,
      profileUsername: null,
      profileId: null,
      profileInitials: null,
      profileActive:null,
  },  
  getters:{
    blogPosts(state){
      return state.blogPosts ;

    },
    blogPostsFeed(state){
      return state.blogPosts.slice(0,2);
    },
    blogPostscards(state){
      return state.blogPosts.slice(2,6);
    },

  },
  mutations: {
    openPhotoPreview(state){
      state.blogPhotoPreview=!state.blogPhotoPreview;
    },
    fileNameChange(state, payload) {
      state.blogPhotoName = payload;
    },
    createFileURL(state, payload) {
      state.blogPhotoFileURL = payload;
    },
    createFileURLProfile(state, fileUrl) {
      state.profileImage = fileUrl; // for immediate preview
  },
  
  
  setProfileImage(state, imageUrl) {
    console.log("Vuex Mutation Called with Image URL:", imageUrl); // Debugging line
    state.profileImage = imageUrl; // Correctly update the Vuex state
  },



    newBlogPost(state, payload) {
      state.blogHTML = payload;
      console.log(state.blogHTML); // Ensure you see this log in the console
     },
    updateBlogTitle(state, payload) {
      state.blogTitle = payload;
      console.log(state.blogTitle); // Ensure you see this log in the console
    }, 
    changeFirstName(state,payload){
      state.profileFirstName =payload;
    },
    filterBlogPost(state,payload){
      state.blogPosts =state.blogPosts.filter((p)=>p.blogID !== payload);
    },
    changeLastName(state,payload){
      state.profileLastName =payload;
    },
    changeUsername(state,payload){
      state.profileUsername =payload;
    }
    ,setProfileAdmin(state, isAdmin) {
      state.profileAdmin = isAdmin;
     },
     setProfilepatient(state,payload){
      state.profilepatient = payload;

     },
    
    toggleEditPost(state, payload) {
      state.editPost = payload;
     },
    updateUser(state,payload){
      state.user=payload;

    } ,
    setProfileEmail(state, email) {
      state.profileEmail = email;
    },
    setProfileActive(state, active) {
      state.profileActive = active;
    },
    setBlogState(state, { title, html, fileURL, photoName }) {
      state.blogTitle = title;
      state.blogHTML = html;
      state.blogPhotoFileURL = fileURL;
      state.blogPhotoName = photoName;
    },
    setProfileInfo(state,doc){
      state.profileId = doc.id;
      state.profileEmail=doc.data().email;
      state.profileFirstName=doc.data().firstName;
      state.profileLastName=doc.data().lastName      ;
      state.profileUsername=doc.data().userName;
      state.profileAdmin=doc.data().admin;
      state.profilepatient=doc.data().patient;
      state.profileActive=doc.data().active;
      state.profileImage=doc.data().profileImage;
      
     },
    setProfileInitials (state) { 
    state.profileInitials = 
    state.profileFirstName.match(/(\b\S)?/g).join("") +
    state.profileLastName.match(/(\b\S)?/g).join(""); 
  },
  }, 
  actions: { 

    async deleteFromthestoreImage(_, payload) {
             const storage = getStorage();
           const getStoreplaceImage   = ref(storage, `documents/BlogCoverPhotos/${payload}`);
         
             try {
              await deleteObject(getStoreplaceImage);
               console.log("Document successfully deleted!");
             } catch (error) {
               console.error("Error removing document: ", error);
             }
           },

    async updateProfileImage({ commit }, imageUrl) {
      commit('setProfileImage', imageUrl);}
      ,

    async updateUserSettings({ commit, state }) {
      try {
        const dataBase = doc(collection(db, "users"), state.profileId);
        await updateDoc(dataBase, {
          firstName: state.profileFirstName,
          lastName: state.profileLastName,
          userName: state.profileUsername,
          profileImage:state.profileImage
        });
        commit("setProfileInitials");
      } catch (error) {
        console.error("Error updating user settings:", error);
      }
    },
    async updatePost ({commit,dispatch},payload){
      commit("filterBlogPost",payload);
      await dispatch("getPost")
    },
    async getPost({ state }) {
      try {
         const dataBase = collection(db, "blogPosts");
         const querySnapshot = await getDocs(dataBase);
         state.blogPosts = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
           if (!state.blogPosts.some(post => post.blogID === doc.id)) {
            const blogPost = {
              blogID: doc.id,
              blogHTML: data.blogHTML,
              blogCoverPhoto: data.blogCoverPhoto,
              blogTitle: data.blogTitle,
              blogDate: data.date,
              blogPhotoName: data.blogCoverPhotoName,
             };
            state.blogPosts.push(blogPost);
          }
        });
        
        state.postLoaded = true;
      } catch (error) {
        console.error("Error fetching posts: ", error);
        state.postLoaded = false;
      }

     },
     async getCurrentser({ commit }, user) {//in the nav bar and in the login
      try {
        if (user) {
          const userId = user.uid;
          const dataBase = doc(collection(db, "users"), userId);
          const docSnap = await getDoc(dataBase);

          if (docSnap.exists()) {
            commit("setProfileInfo", docSnap);
            commit("setProfileInitials");
          } else {
            console.error("No such document!");
          }
        } else {
          console.log("No user is signed in");
        }
      } catch (error) {
        console.error("Error getting document:", error);
      }
    },
 

async deletePost({ commit }, payload) {
  const getPost = doc(collection(db, "blogPosts"), payload);
  try {
    await deleteDoc(getPost);
    console.log("Document successfully deleted!");
    commit("filterBlogPost", payload);
  } catch (error) {
    console.error("Error removing document: ", error);
  }
}},
  modules: {
  }
}) 