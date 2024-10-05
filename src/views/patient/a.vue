<template>
  <div>
    <!-- Modal for Appointment Requests -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <button class="close-button" @click="showModal = false">X</button>
        <h2>Request Appointment</h2>

        <form @submit.prevent="submitRequest">
          <div>
            <label for="role">Select Role:</label>
            <select v-model="selectedRole" @change="fetchDoctors">
              <option value="">--Select Role--</option>
              <option value="dentist">Dentist</option>
              <!-- Add other roles as needed -->
            </select>
          </div>

          <!-- Displaying selected doctor details -->
          <img :src="doctorDetails.profileImage" class="user-image" />

          <div class="selectD">
            <input
              v-model="searchTerm"
              placeholder="Search doctors..."
              class="search-input"
            />
            <label for="doctor">Select Doctor:</label>
            <select v-model="selectedDoctor" :class="{ disabled: !selectedRole }">
              <option v-for="doctor in filteredDoctors" :key="doctor.id" :value="doctor.id">
                {{ doctor.firstName }} {{ doctor.lastName }}
              </option>
            </select>
          </div>

          <div class="dateA">
            <label for="appointmentDateTime">Select Date and Time:</label>
            <input
              type="datetime-local"
              v-model="appointmentDateTime"
              :min="minDateTime"
              required
            />
          </div>

          <div class="comment">
            <label for="comment">Comment:</label>
            <textarea
              v-model="comment"
              placeholder="Add your comments here"
              rows="4"
              required
            ></textarea>
          </div>

          <button class="submitbtn" type="submit" :class="{disabled:!selectedDoctor || !appointmentDateTime}">
            Submit Request
          </button>
        </form>
      </div>
    </div>
        <!-- Modal for Appointment Requests -->
        <div v-if="showModalEdit" class="modal-overlay">
      <div class="modal-content-edit">
        <button class="close-button" @click="showModalEdit = false">X</button>
        <h2>Request Appointment</h2>

        <form @submit.prevent="submitRequestChange">


          <div class="dateA">
            <label for="appointmentDateTimeChange">Select Date and Time:</label>
            <input
              type="datetime-local"
              v-model="appointmentDateTimeChange"
              :min="minDateTime"
              
            />
          </div>

          <div class="comment">
            <label for="commentChange">Comment:</label>
            <textarea
              v-model="commentChange"
              placeholder="Add your comments here"
              rows="4"
            ></textarea>
          </div>

          <button class="submitbtn" type="submit"  >
            Edit Request
          </button>
        </form>
      </div>
    </div>
    
    <!-- Displaying Appointment Requests -->
     <div class="row">
      <div class="col-12">
        <div class="card my-4">
          <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
            <div class="bg-gradient-info shadow-primary border-radius-lg pt-2 pb-2">
              <h6 class="text-white text-capitalize ps-3">Voici la liste des requests</h6>
            </div>
          </div>
          <div class="card-body px-0 pb-2">
            <div class="ms-md-auto pe-md-3 d-flex align-items-center">
              <div class="input-group input-group-outline">
                <input type="text" class="search-inputs" v-model="searchQueryDoctor"  placeholder="Type here..." />
                <button @click="showModal = true" class="sendrequest">Send Request</button>
              </div>
            </div>
            <div class="table-responsive p-0" style="overflow: auto; max-height: 400px;">
              <table class="table align-items-center mb-0">
                <thead>
                  <tr>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Image</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">First Name</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Last Name</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Email</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Specialist</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                    <th class="text-secondary opacity-7">Edit</th>
                    <th class="text-secondary opacity-7">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="Appointment in filteredRequestsDoctor" :key="Appointment.id" class="request-card">
                    
                    <td class="text-center">
                      <div class="d-flex flex-column justify-content-center">
                        <img :src="Appointment.doctor.profileImage" class="user-image-doctor" />
                      </div>
                    </td>  
                    <td class="text-center">
                      <div class="d-flex flex-column justify-content-center">
                        <h3 class="mb-0 text-sm">{{ Appointment.doctor.firstName }}</h3>
                      </div>
                    </td>
                    <td class="text-center">
                      <div class="d-flex flex-column justify-content-center">
                        <h4 class="mb-0 text-sm">{{ Appointment.doctor.lastName }}</h4>
                      </div>
                    </td>
                    <td class="text-center">
                      <div class="d-flex flex-column justify-content-center">
                        <h5 class="mb-0 text-sm">{{ Appointment.doctor.email }}</h5>
                      </div>
                    </td> <td class="text-center">
                      <div class="d-flex flex-column justify-content-center">
                        <h3 class="mb-0 text-sm">{{ Appointment.doctor.role }}</h3>
                      </div>
                    </td>
                    <td class="text-center">
                      <div class="d-flex flex-column justify-content-center">
                        <h4 class="mb-0 text-sm">{{ Appointment.status }}</h4>
                      </div>
                    </td>
                    <td class="text-center">
                      <button @click="editAppointment(Appointment.id),showModalEdit=true"  class="btn btn-warning">Edit</button>
                    </td>
                    <td class="text-center">
                      <button @click="deleteAppointment(Appointment.id)"  class="btn btn-danger">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch,onMounted } from 'vue';
import { useStore } from 'vuex';
import { getFirestore, collection, getDocs, query, where, addDoc,onSnapshot,updateDoc,doc,getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useToast } from 'vue-toastification';
 
export default {

  name: 'AppointmentRequestView',
  
  setup() {
    const store = useStore();
    const showModal = ref(false);
    const showModalEdit = ref(false);
    const selectedRole = ref('');
    const selectedDoctor = ref(null);
    const searchTerm = ref('');
    const searchQueryDoctor = ref('');
    const doctors = ref([]);
    const hisAppointment=ref([]);
    const filteredRequestsDoctor = computed(() => {
      return hisAppointment.value.filter(doctor =>
        doctor.doctor.firstName.toLowerCase().includes(searchQueryDoctor.value.toLowerCase()) ||
        doctor.doctor.lastName.toLowerCase().includes(searchQueryDoctor.value.toLowerCase())
        
      );
    });const filteredDoctors = computed(() => {
      return doctors.value.filter(doctor =>
        doctor.firstName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        doctor.lastName.toLowerCase().includes(searchTerm.value.toLowerCase())
      );
    });
    const toast = useToast();
    const appointmentDateTime = ref('');
    const appointmentDateTimeChange = ref('');
    const minDateTime = ref(new Date().toISOString().slice(0, 16));
    const comment = ref('');
    const commentChange = ref('');
    const doctorDetails = ref({});
 
    const fetchDoctorsAppointment = async () => {
            const user = store.state.user;
            const db = getFirestore();
            const hisAppointmentRef = collection(db, 'AppointmentRequest');

            // Set up a real-time listener for appointments with status "ongoing" or "accepted"
            const q = query(hisAppointmentRef, where('status', 'in', ['ongoing', 'accepted']));
            const userMap = new Map();

            const usersRef = collection(db, 'users');
           const usersSnapshot = await getDocs(usersRef);
            usersSnapshot.docs.forEach(doc => {
           const userData = doc.data();
      
           // Use the document ID as the key if UID is missing
            const uid = doc.id;  // Get the document ID
            userMap.set(uid, userData);

     });

            // Using onSnapshot for real-time updates
            onSnapshot(q, (snapshot) => {
              hisAppointment.value = snapshot.docs
              .map(doc => ({
                id: doc.id, // Include document ID
                ...doc.data()
              }))
              .filter(appointment => appointment.user === user.uid)
              .map(appointment => ({
                  ...appointment,
                  doctor: userMap.get(appointment.doctorId||appointment.doctor.id) ,// Add patient information

                  status: appointment.status
                }));
              console.log("Real-time Appointments:", hisAppointment);
            }, (error) => {
              console.error("Error fetching appointments in real-time:", error);
            });
          };  
    const appointmentIdChange=ref("");

    const editAppointment = async (appointmentId) => {
      appointmentIdChange.value = appointmentId;
      const db = getFirestore();

      // Use `doc` to get a reference to the specific document
      const appointmentRef = doc(db, 'AppointmentRequest', appointmentIdChange.value);
      
      try {
          // Fetch the document data
          const appointmentSnap = await getDoc(appointmentRef);

          if (appointmentSnap.exists()) {
              // Extract data if the document exists
              const appointmentData = appointmentSnap.data();
              commentChange.value = appointmentData.commentPatient || '';
              appointmentDateTimeChange.value = appointmentData.appointmentDateTime || '';
          } else {
              console.log('No such document!');
          }
          console.log("appointmentDateTimeChange.value,",appointmentDateTimeChange.value,)

      } catch (error) {
          console.error('Error fetching appointment:', error);
      }

   };

    const submitRequestChange = async () => {
      try {
        const db = getFirestore();
        const appointmentRef = doc(db, 'AppointmentRequest', appointmentIdChange.value);

 
        // Update the document with new values
        await updateDoc(appointmentRef, {
            appointmentDateTime: appointmentDateTimeChange.value,
            commentPatient: commentChange.value,
            status: "ongoing"
        });

        // Close the modal and reset values
        showModalEdit.value = false;
        appointmentDateTimeChange.value = '';
        commentChange.value = '';

        // Show success notification
        toast.success('Request sent successfully!');
    } catch (error) {
          toast.error('Error submitting request:', error);
        }
      
    };
    
    
    
    const deleteAppointment = async (appointment) => {
      try {
        const db = getFirestore();
        console.log("appointmentId:", appointment);

        const appointmentRef = doc(db, 'AppointmentRequest',appointment);
 
 
        // Update the status of the appointment
      await updateDoc(appointmentRef, {
          status: 'deleted by Patient'
        })

        toast.success('Appointment status updated to "had been deleted by User".');
      } catch (error) {
        console.error('Error updating appointment status:', error);
        toast.error('Failed to update appointment status.');
      }
    };

    const fetchDoctors = async () => {
      if (selectedRole.value) {
        const user = store.state.user;
        const db = getFirestore();
        const listofRequest = collection(db, 'requests');
        const listofRequestsnapshot = await getDocs(listofRequest);

        const listofthisPatientThatAcceptedDoctorID = listofRequestsnapshot.docs
          .map(doc => doc.data())
          .filter(request => request.userId === user.uid && request.status === "accepted")
          .map(request => request.doctorId);

        const doctorsRef = collection(db, 'users');
        const q = query(doctorsRef, where('role', '==', selectedRole.value));
        const querySnapshot = await getDocs(q);

        doctors.value = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(user =>
            listofthisPatientThatAcceptedDoctorID.includes(user.id) &&
            user.doctor === true &&
            user.active === true
          );
      }
    };

    const updateSelectedDoctor = (doctorId) => {
      const doctor = doctors.value.find((doc) => doc.id === doctorId);
      if (doctor) {
        doctorDetails.value = doctor;
        console.log(doctorDetails.value)
      }
    };

    watch(selectedDoctor, (newDoctorId) => {
      updateSelectedDoctor(newDoctorId);
    });

    const submitRequest = async () => {
      if (selectedDoctor.value && appointmentDateTime.value) {
        try {
          const auth = getAuth();
          const user = auth.currentUser;
          const db = getFirestore();

          await addDoc(collection(db, 'AppointmentRequest'), {
            user: user.uid, 
            doctor: doctorDetails.value,
            appointmentDateTime: appointmentDateTime.value,
            createdDate: new Date(),
            commentPatient: comment.value,
            commentDoctor: "",
            commentPrivate: "",
            status:"ongoing"
          });

          showModal.value = false;
          selectedRole.value = '';
          selectedDoctor.value = null;
          appointmentDateTime.value = '';
          comment.value = '';
          doctors.value = [];
          toast.success('Request sent successfully!');

        } catch (error) {
          toast.error('Error submitting request:', error);
        }
      }
    };
    onMounted(() => {
    fetchDoctorsAppointment();
  });
    return {
      showModal,showModalEdit,
      selectedRole,searchQueryDoctor,
      selectedDoctor,
      searchTerm,
      doctors,deleteAppointment,editAppointment,
      hisAppointment,
      filteredDoctors,
      appointmentDateTime,
      appointmentDateTimeChange,
          commentChange,
     
      minDateTime,
      comment,appointmentIdChange,
      filteredRequestsDoctor,
      doctorDetails,
      fetchDoctors,
      fetchDoctorsAppointment,
      submitRequest,submitRequestChange
    };
  }
};
</script>



<style scoped>

.profile-image {
width: 50px;
height: 50px;
border-radius: 50%;
}
.row {
display: flex;
flex-wrap: wrap;
margin-right: -15px;
margin-left: -15px;
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
box-shadow: 0 0.75rem 1.5rem rgba(18, 38, 63, 0.03);
background-color: #fff;
margin-bottom: 2rem;
}

.card-header {
border-radius: 1rem 1rem 0 0;
background: linear-gradient(87deg, #5b5c5c, #000000);
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
padding: 1rem 1.5rem;
position: relative;
}

.bg-gradient-info {
background: linear-gradient(87deg, #3a3b3b, #000000);
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
padding: 1rem;
}

.table-responsive {
overflow-x: auto;
overflow-y: auto;
max-height: 400px;
}

.table {
margin-bottom: 1rem;
width: 100%;
background-color: transparent;
}

.table thead th {
font-size: 0.875rem;
text-transform: uppercase;
letter-spacing: 0.05em;
}

.table td, .table th {
padding: 0.75rem;
vertical-align: middle;
text-align: center;
border-top: 1px solid #e9ecef;
}

.toggle-active {
display: flex;
align-items: center;
justify-content: center;
}

.table td h6 {
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

.btn {
border-radius: 0.375rem;
font-weight: 600;
font-size: 0.875rem;
line-height: 1.5;
padding: 0.75rem 1.5rem;
text-align: center;
}

.btn-success {
background-color: #28a745;
border: 1px solid #28a745;
color: #fff;
}

.btn-success:hover {
background-color: #218838;
border-color: #1e7e34;
}

.btn-danger {
background-color: #dc3545;
border: 1px solid #dc3545;
color: #fff;
}

.btn-danger:hover {
background-color: #c82333;
border-color: #bd2130;
}

.request-card {
background-color: #f8f9fa;
border-radius: 0.375rem;
margin-bottom: 1rem;
}

.request-card td {
vertical-align: middle;
}

.request-card button {
margin: 0.2rem;
}

.request-card td:first-child {
padding-left: 1rem;
}

.request-card td:last-child {
padding-right: 1rem;
}
.search-inputs{
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  width: calc(100% - 22px); /* Adjust for padding */
  margin-bottom: 7%; /* Space between search and dropdown */
  margin-top: 0%; /* Space between search and dropdown */
  margin-left: 20%;
}
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




















.sendrequest:hover {
  background-color: #218838; /* Hover effect for submit button */
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6); /* Slightly darker overlay for better focus */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999; /* Ensures modal appears on top */
}

.modal-content {
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  width: 100%;
  max-width: 600px;
  height: 700px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Adds a shadow for depth */
  position: relative; /* Correct positioning */
  animation: slide-down 0.3s ease-out; /* Simple animation for appearance */
  overflow-y: auto; /* Adds scroll if content exceeds height */
}
.modal-content-edit {
  background: #fff;
  padding: 30px;
  border-radius: 10px;
  width: 100%;
  max-width: 600px;
  height: 400px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Adds a shadow for depth */
  position: relative; /* Correct positioning */
  animation: slide-down 0.3s ease-out; /* Simple animation for appearance */
  overflow-y: auto; /* Adds scroll if content exceeds height */
}
.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4d4d;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s; /* Smooth background transition */
}

.close-button:hover {
  background: #ff1a1a; /* Hover effect for the close button */
}

h2 {
  margin-bottom: 20px; /* Adds space below the title */
}

form > div {
  margin-bottom: 10px; /* Reduced spacing between form elements */
}

select[v-model="selectedRole"] {
  margin-top: 10px; /* Adds space above the select role dropdown */
}
/* Search input */
.search-input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  width: calc(100% - 22px); /* Adjust for padding */
  margin-bottom: 10px; /* Space between search and dropdown */
}

/* Doctor dropdown */
.selectD {
  display: flex;
  flex-direction: column;
}
input[type='datetime-local'],
textarea,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
  font-size: 16px;
  transition: border-color 0.3s; /* Smooth border transition */
}

input[type='datetime-local']:focus,
textarea:focus,
select:focus {
  border-color: #007bff; /* Focus effect */
  outline: none;
}

.submitbtn {
  position: absolute;
  bottom: 20px;
  right: 50%;
  transform: translateX(50%);
  background-color: #28a745;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submitbtn:hover {
  background-color: #218838; /* Hover effect for submit button */
}
.user-image-doctor{
  width: 90px; /* Increased size for better visibility */
  height: 90px;
  border-radius: 50%;
  display: block; /* Centers the image */
  object-fit: cover;
  
}
.user-image {
  width: 150px; /* Increased size for better visibility */
  height: 150px;
  border-radius: 50%;
  margin-right: 10px;
  display: block; /* Centers the image */
  object-fit: cover;
  margin: 0 auto 15px; /* Centers horizontally and adds some spacing below */
  /* Ensures image covers area without distortion */
}

.disabled {
  background-color: #f0f0f0;
  color: #999;
  cursor: not-allowed;
  opacity: 0.7;
}

 

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>












