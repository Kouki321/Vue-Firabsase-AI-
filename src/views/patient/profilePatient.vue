<template>
  <div class="profile">
    <Modal
      v-if="modalActive"
      :modalMessage="modalMessage"
      @close-modal="closeModal"
    />
    <div class="container">
      <h2>Account Settings</h2>
      <div class="profile-info">
        <!-- Pass the current profile image URL and handle image updates -->
        <imgProfile :imgUrl="profileImage" @update-image="handleImageUpdate" />
        <div class="admin-badge">
          <img src="../../assets/Icons/user-crown-light.svg" class="icon" />
          <span v-if="admin">Admin</span>
          <span v-else>User</span>
        </div>
        <div class="input">
          <label for="firstName">First Name:</label>
          <input type="text" id="firstName" v-model="firstName" />
        </div>
        <div class="input">
          <label for="lastName">Last Name:</label>
          <input type="text" id="lastName" v-model="lastName" />
        </div>
        <div class="input">
          <label for="username">Username:</label>
          <input type="text" id="username" v-model="username" />
        </div>
        <div class="input">
          <label for="email">Email:</label>
          <input disabled type="text" id="email" v-model="email" />
        </div>
        <button @click="updateProfile">Save Changes</button>
      </div>
    </div>
  </div>
</template>

<script>
import Modal from "../../components/ModalView";
import imgProfile from "../patient/imgProfile"; // Ensure this path is correct
import { mapState, mapActions } from "vuex";
//mapActions: It enforces a consistent approach to action dispatching, making your codebase easier to follow and refactor.
export default {
  name: "ProfileView",
  components: { imgProfile, Modal },
  data() {
    return {
      modalMessage: "Changes were saved!",
      modalActive: false,
    };
  },
  
  methods: {

    ...mapActions(["updateUserSettings"]),
    handleImageUpdate(newImageUrl) {
          this.$store.commit("setProfileImage", newImageUrl);
        },

    updateProfile() {
      this.$store.dispatch("updateUserSettings");
      this.updateUserSettings()
        .then(() => {
          this.modalActive = true;
        })
        .catch((error) => {
          console.error("Error updating profile: ", error);
        });
    },
    closeModal() {
      this.modalActive = false;
    },
  },
  computed: {
    ...mapState({
      profileImage: (state) => state.profileImage,
      firstName: (state) => state.profileFirstName,
      lastName: (state) => state.profileLastName,
      username: (state) => state.profileUsername,
      email: (state) => state.profileEmail,
      user: (state) => state.user,
    }),
    firstName: {
      get() {
        return this.$store.state.profileFirstName;
      },
      set(payload) {
        this.$store.commit("changeFirstName", payload);
      },
    },
    lastName: {
      get() {
        return this.$store.state.profileLastName;
      },
      set(payload) {
        this.$store.commit("changeLastName", payload);
      },
    },
    user() {
      return this.$store.state.user;
    },
    admin() {
      return this.$store.state.profileAdmin;
    },
   
    patient() {
      return this.$store.state.profilepatient;
    },
    username: {
      get() {
        return this.$store.state.profileUsername;
      },
      set(payload) {
        this.$store.commit("changeUsername", payload);
      },
    },
    email() {
      return this.$store.state.profileEmail;
    },
  },
};
</script>

<style lang="scss" scoped>
.profile-picture {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  width: 150px; /* Adjust as needed */
  height: 150px; /* Adjust as needed */
  border-radius: 50%;
  overflow: hidden; /* Ensures the image fits within the circle */
  background-color: #f1f1f1; /* Optional: fallback background color */
}

.profile-picture img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensures the image covers the entire container */
}

.profile {
  .container {
    max-width: 1000px;
    padding: 60px 25px;

    h2 {
      text-align: center;
      margin-bottom: 16px;
      font-weight: 300;
      font-size: 32px;
    }

    .profile-info {
      border-radius: 8px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -1px rgba(0, 0, 0, 0.06);
      padding: 32px;
      background-color: #f1f1f1;
      flex-direction: column;
      display: flex;
      max-width: 600px;
      margin: 32px auto;

      .initials {
        position: initial;
        width: 80px;
        height: 80px;
        font-size: 32px;
        background-color: #303030;
        color: #fff;
        display: flex;
        align-self: center;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      }

      .admin-badge {
        display: flex;
        align-self: center;
        color: #fff;
        font-size: 14px;
        padding: 8px 24px;
        border-radius: 8px;
        background-color: #303030;
        margin: 16px 0;
        text-align: center;
        text-transform: capitalize;

        .icon {
          width: 14px;
          height: auto;
          margin-right: 8px;
        }
      }

      .input {
        margin: 16px 0;

        label {
          font-size: 14px;
          display: block;
          padding-bottom: 6px;
        }

        input {
          width: 100%;
          border: none;
          background-color: #f2f7f6;
          padding: 8px;
          height: 50px;

          &:focus {
            outline: none;
          }
        }
      }

      button {
        align-self: center;
      }
    }
  }
}
</style>
