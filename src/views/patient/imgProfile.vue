<template>
    <div class="profile-picture">
      <div class="profile-image-wrapper" @click="triggerFileInput">
        <img v-if="imgUrl" :src="imgUrl" alt="Profile Picture" />
        <div v-else class="initials">{{ initials }}</div>
      </div>
      <input
        type="file"
        ref="profileImage"
        name="profileImage"
        id="profileImage"
        accept=".png, .jpg, .jpeg"
        @change="fileChange"
        style="display: none;" 
      />
    </div>
  </template>
  
  <script>
  import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
  import { mapState } from "vuex";
  
  export default {
    name: "imgProfile",
    props: ["imgUrl"],
    computed: {
      ...mapState({
        user: state => state.user,
        profileImage: state => state.profileImage,
        profileInitials: state => state.profileInitials
      }),
      initials() {
        return this.profileInitials || '';
      }
    },
    methods: {
      triggerFileInput() {
        this.$refs.profileImage.click(); // Trigger the file input click
      },
      async fileChange() {
        const file = this.$refs.profileImage.files[0];
        if (file && file instanceof File) {
          const storage = getStorage();
          const userId = this.user?.uid; // Ensure user is defined
          if (!userId) {
            console.error("User ID is not available.");
            return;
          }
  
          // Create a storage reference with the user ID
          const fileRef = storageRef(storage, `documents/images/${userId}`);
          
          try {
            // Upload file to Firebase Storage
            await uploadBytes(fileRef, file);
  
            // Get the download URL
            const downloadURL = await getDownloadURL(fileRef);
  
            // Emit the new image URL
            this.$emit("update-image", downloadURL);
  
            // Update the profile image in Vuex store
            this.$store.commit("setProfileImage", downloadURL);
          } catch (error) {
            console.error("Error uploading file: ", error);
          }
        } else {
          console.error("File is not valid or missing");
        }
      }
    }
  };
  </script>
  
  <style lang="scss" scoped>
  .profile-picture {
    display: flex;
    flex-direction: column;
    align-items: center;
  
    img {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      margin-bottom: 15px;
      border: 3px solid #f0f0f0; // Adding border for better visibility
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); // Adding shadow for better emphasis
    }
  
    .initials {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background-color: #9e9e9e; // Darker grey for better contrast
      font-size: 28px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 15px;
      border: 3px solid #f0f0f0; // Adding border for consistency
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); // Adding shadow for emphasis
    }
  
    input[type="file"] {
      margin-top: 15px;
      border: none; // Removing default border
      padding: 5px; // Adding padding for better user experience
      background-color: #f0f0f0; // Light background color for input
      border-radius: 5px; // Rounded corners for the input
    }
  }
  </style>
  