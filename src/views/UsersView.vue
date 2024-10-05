<template>
  <div class="row">
    <div class="col-12">
      <div class="card my-4">
        <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
          <div class="bg-gradient-info shadow-primary border-radius-lg pt-2 pb-2">
            <h3 class="text-white text-capitalize ps-3">Voici la liste des Users</h3>
          </div>
        </div>
        <div class="card-body px-0 pb-2">
          <div class="ms-md-auto pe-md-3 d-flex align-items-center">
            <div class="input-group input-group-outline">
               <input type="text" @keyup="doFilter" class="form-control" v-model="searchQuery" placeholder="Type here...">
            </div>
          </div>
          <div class="table-responsive p-0" style="overflow: auto; ">
            <table class="table align-items-center mb-0">
              <thead>
                <tr>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Iamge</th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Name</th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Profile</th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Email</th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Online</th>
                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Change</th>
                  <th class="text-secondary opacity-7">Etat</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredEtudiants" :key="user.userId"   >
                  <td class="text-center">
                    <div class="d-flex flex-column justify-content-center">
                      <img :src="user.profileImage" alt="User Image" class="user-image" />
                    </div>
                  </td> 
                  <td class="text-center">
                    <div class="d-flex flex-column justify-content-center">
                      <h5 class="mb-0 text-sm">{{ user.firstName }} {{ user.lastName }}</h5>
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="d-flex flex-column justify-content-center">
                      <h5 class="mb-0 text-sm" v-if="user.admin">Admin</h5>
                      <h5 class="mb-0 text-sm" v-if="user.patient">User</h5>
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="d-flex flex-column justify-content-center">
                      <h5 class="mb-0 text-sm">{{ user.email }}</h5>
                    </div>
                  </td> 
                  <td class="text-center">
                    <div class="d-flex flex-column justify-content-center">
                      <h4  style="color: #076920; "  v-if="user.online">Online</h4>
                      <h4 style="color: red" v-else>{{formatTimestamp(user.lastOnline)}}</h4>
                    </div>
                  </td>

                  <td class="text-center">
                    <div class="toggle-active">
                      <input :disabled="user.admin" type="checkbox" v-model="user.active" @change="activer(user.userId, user.active)" />
                    </div>
                  </td>
                  <td class="text-center">
                    <h4 v-if="user.active" class="togelac">Active</h4>
                    <h4 v-else class="togelin">InActive</h4>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseInit";

export default {
  name: "UserView",
  data() {
    return {
      users: [],
      searchQuery: "",
      loading: false,
      error: null
    };
  },
  setup(){
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
return{
  formatTimestamp
}

  },
  computed: {
    filteredEtudiants() {
      return this.users.filter(user => {
        const activeStatus = user.active ? 'active' : 'inactive';
        return user.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
               user.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
               user.userName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
               activeStatus.includes(this.searchQuery.toLowerCase()) ||
               user.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      });
    }
  },
  created() {
    this.fetchUserData();
  },
  methods: {
    async fetchUserData() {
      this.loading = true;
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        this.users = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          userId: doc.id
        }));
        console.log("querySnapshot.",querySnapshot)
        console.log("querySnapshot.docs",querySnapshot.docs)
        console.log("querySnapshot.docs(aa)",querySnapshot.docs.map(doc => ({
          ...doc.data(),
          userId: doc.id,
          ausera: doc.metadata
        })))
      } catch (error) {
        this.error = error.message;
        console.error('There was a problem with the fetch operation:', error);
      } finally {
        this.loading = false;
      }
    },
    
    doFilter() {
      this.filteredEtudiants = this.users.filter(user => {
        return user.firstName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
               user.lastName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
               user.userName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
               user.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      });
    },
    async activer(userId, active) {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { active });
        
        this.fetchUserData();
      } catch (error) {
        console.error('Error updating user:', error);
      }
    }
  }
};
</script>
<style lang="scss" scoped>


.patient-row{
  background-color: #e0f7e0; /* Light green background */
}
    .user-image {
  width: 40px;             /* Adjust size of the user image */
  height: 40px;            /* Adjust size of the user image */
  border-radius: 50%;      /* Make the image circular */
  margin-right: 10px;      /* Space between image and text */
}
    input[type="checkbox"] {
    position: relative;
    border: none;
    -webkit-appearance: none;
    background: #fff;
    outline: none;
    width: 80px;
    height: 30px;
    border-radius: 20px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  input[type="checkbox"]:before {
    content: "";
    position: absolute;
    width: 30px;
    height: 30px;
    border-radius: 20px;
    top: 0;
    left: 0;
    background: #303030;
    transform: scale(1.1);
    transition: 750ms ease all;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  
  input:checked[type="checkbox"]:before {
    background: #fff;
    left: 52px;
  }
  
    
.row {
  display: flex;
  flex-wrap: wrap;
  margin-right: Opx;
  margin-left: Opx;
  margin-bottom: 0%;
}
.message-timestamp {
  display: block;
  margin-bottom: 2px;
}
.col-12 {
  position: relative;
  width: 100%;
  padding-right: 15px;
  padding-left: 15px;
}

.card {
  border: 0;
  border-radius: 1rem;
  box-shadow: 0 0.75rem 1.5rem rgba(4, 15, 4, 0.045);
  background-color: #fff;
  margin-bottom: 2rem;
}

.card-header {
  border-radius: 1rem 1rem 0 0;
  background: linear-gradient(87deg, #05c338,green);
  box-shadow: 0 1px 3px rgba(13, 255, 110, 0);
  padding: 1rem 1.5rem;
  position: relative;
}

.bg-gradient-info {
  background: linear-gradient(87deg, #03b84f,green);
}

.shadow-primary {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.border-radius-lg {
  border-radius: 1rem !important;
}

.text-capitalize {
  text-transform: capitalize !important;
}

.text-white {
  color: #fff !important;
}

.card-body {
  padding: 1.5rem;
}

.table-responsive {
  overflow-x: auto;
  overflow-y: auto;
}

.table {
  margin-bottom: 1rem;
  width: 100%;
  height: 100%;
  background-color: transparent;
}

.table thead th {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table td, .table th {
  padding: 0.75rem;
  vertical-align: middle; /* Center vertically */
  text-align: center; /* Center horizontally */
  border-top: 1px solid #e9ecef;
}
.toggle-active {
  display: flex;
  flex-grow: 5;
  align-items: center;
  justify-content: center;
}
.table td h5 {
  margin-bottom: 0;
}

.d-flex {
  display: flex !important;
}

.align-items-center {
  align-items: center !important;
}

.justify-content-center {
  justify-content: center !important;
}

.my-4 {
  margin-top: 1.5rem !important;
  margin-bottom: 1.5rem !important;
}

.p-0 {
  padding: 0 !important;
}

.px-0 {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.pb-2 {
  padding-bottom: 0.5rem !important;
}

.pt-2 {
  padding-top: 0.5rem !important;
}

.ps-3 {
  padding-left: 1rem !important;
}

.ms-md-auto {
  margin-left: auto !important;
}

.pe-md-3 {
  padding-right: 1rem !important;
}

.input-group-outline {
  display: flex;
  align-items: center;
}

.input-group-outline .form-label {
  margin-bottom: 0;
}

.input-group-outline .form-control {
  border: 1px solid #e9ecef;
  border-radius: 0.25rem;
  padding: 0.5rem 1rem;
}

.input-group-outline .form-control:focus {
  border-color: #1171ef;
  box-shadow: 0 0 0 0.2rem rgba(17, 113, 239, 0.25);
}

   .togelac{
    display: inline-flex; /* Allows the background to wrap around the content only */
    color: white; 
    border-radius: 8px;
    justify-content: center; 
    align-items: center; 
    text-align: center;
    padding: 0.05rem 2rem; /* Add padding to control the background around the text */
    background-color: rgb(8, 208, 38);

    @media (max-width: 800px) {
        justify-content: center;
        align-items: center; 
        text-align: center; /* Center text on smaller screens */
    }
  }
    .togelin {
    display: inline-flex; /* Allows the background to wrap around the content only */
    color: white; 
    border-radius: 8px;
    justify-content: center; 
    align-items: center; 
    text-align: center;
    padding: 0.05rem 1.5rem; /* Add padding to control the background around the text */
    background-color: rgb(181, 8, 8); /* Keep the background color */

    @media (max-width: 800px) {
        justify-content: center;
        align-items: center; 
        text-align: center; /* Center text on smaller screens */
    }


}
</style>
