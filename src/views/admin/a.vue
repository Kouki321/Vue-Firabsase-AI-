<template>
  <div class="container">
    <div class="main">
      <div class="cards">
        <div class="card">
          <div class="card-content">
              <div class="card-name">Users</div>
            <div class="number">{{ users.length }}</div>
          </div>
          <div class="icon-box">
            <i class="fas fa-user-graduate"></i>
          </div>
        </div>
        <div class="card">
          <div class="card-content">
              <div class="card-name">Patients</div>
            <div class="number">{{ patients.length }}</div>
          </div>
          <div class="icon-box">
            <i class="fas fa-chalkboard-teacher"></i>
          </div>
        </div>
        <div class="card">
          <div class="card-content">
              <div class="card-name">Doctors</div>
            <div class="number">{{ doctors.length }}</div>
          </div>
          <div class="icon-box">
            <i class="fas fa-users"></i>
          </div>
        </div>
        <div class="card">
          <div class="card-content">
            <div class="number">1</div>
            <div class="card-name">Admin</div>
          </div>
          <div class="icon-box">
            <i class="fas fa-dollar-sign"></i>
          </div>
        </div>
      </div>
      <div class="charts">
        <div class="chart">
          <h2>Appointment Accepted</h2>
          <div>
              <canvas id="lineChart"></canvas>
          </div>
        </div>
        <div class="chart doughnut-chart">
          <h2>Appointment</h2>
          <div>
              <canvas id="doughnut"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { ref, onMounted, watch } from 'vue';
import { getFirestore, collection, getDocs, where, query, onSnapshot } from 'firebase/firestore';
import Chart from 'chart.js/auto';

export default {
name: 'adminpageView',
setup() {
  const users = ref([]);
  const patients = ref([]);
  const doctors = ref([]);
  const appointmentAccepted = ref([]);
  const appointmentDeltedByPatient = ref([]);
  const appointmentOnGoing = ref([]);
  const appointmentDeltedByDoctor = ref([]);
  const Appointments = ref([]);
  const doughnutChart = ref(null); // Reference for the chart instance

  const fetchData = async () => {
    const db = getFirestore();
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    const usersArray = usersSnapshot.docs.map((doc) => doc.data());
    users.value = usersArray;
    doctors.value = usersArray.flatMap((user) => user.doctor || []);
    patients.value = usersArray.flatMap((user) => user.patient || []);

    const userMap = new Map();
    usersSnapshot.docs.forEach((doc) => {
      const userData = doc.data();
      const auid = doc.id;
      userMap.set(auid, userData);
    });

    const hisAppointmentRef = collection(db, 'AppointmentRequest');
    const q = query(
      hisAppointmentRef,
      where('status', 'in', ['ongoing', 'accepted', 'deleted by Doctor', 'deleted by Patient'])
    );

    onSnapshot(q, (snapshot) => {
      Appointments.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        patient: userMap.get(doc.data().user),
        doctor: userMap.get(doc.data().doctor),
      }));

      appointmentAccepted.value = Appointments.value.filter((Appointment) => Appointment.status === 'accepted');
      appointmentDeltedByPatient.value = Appointments.value.filter(
        (Appointment) => Appointment.status === 'deleted by Patient'
      );
      appointmentOnGoing.value = Appointments.value.filter((Appointment) => Appointment.status === 'ongoing');
      appointmentDeltedByDoctor.value = Appointments.value.filter(
        (Appointment) => Appointment.status === 'deleted by Doctor'
      );
    });
  };

  onMounted(async() => {
    await fetchData();
    await nextTick(); // Wait for the DOM to be updated before accessing the canvas element

    const ctx1 = document.getElementById('lineChart').getContext('2d');
    new Chart(ctx1, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Earnings in $',
            data: [2050, 1900, 2100, 2800, 1800, 2000, 2500, 2600, 2450, 1950, 2300, 2900],
            backgroundColor: ['rgba(85,85,85, 0.1)'],
            borderColor: 'rgb(41, 155, 99)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
 
      },
    });

    // Initialize Doughnut Chart
    const ctx2 = document.getElementById('doughnut').getContext('2d');
    doughnutChart.value = new Chart(ctx2, {
      type: 'doughnut',
      data: {
        labels: ['Accepted', 'Ongoing', 'Deleted by Patient', 'Deleted by Doctor'],
        datasets: [
          {
            label: 'Appointment',
            data: [
              appointmentAccepted.value.length,
              appointmentOnGoing.value.length,
              appointmentDeltedByPatient.value.length,
              appointmentDeltedByDoctor.value.length,
            ],
            backgroundColor: [
              'rgba(41, 155, 99, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(120, 46, 139, 0.8)',
            ],
            borderColor: [
              'rgba(41, 155, 99, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(120, 46, 139, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // Adjust this option as needed

      },
    });
  });

  // Watch for changes and update the doughnut chart
  watch(
    [appointmentAccepted, appointmentOnGoing, appointmentDeltedByPatient, appointmentDeltedByDoctor],
    () => {
      if (doughnutChart.value) {
        doughnutChart.value.data.datasets[0].data = [
          appointmentAccepted.value.length,
          appointmentOnGoing.value.length,
          appointmentDeltedByPatient.value.length,
          appointmentDeltedByDoctor.value.length,
        ];
        doughnutChart.value.update();
      }
    }
  );

  return {
    appointmentAccepted,
    appointmentDeltedByPatient,
    appointmentOnGoing,
    appointmentDeltedByDoctor,
    users,
    doctors,
    patients,
    Appointments,
  };
},
};</script> 




<style scoped>


* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  font-family: 'poppins', sans-serif;
}

img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.logo h2 {
  color: #299B63;
}  

/* main */
.main {
  position: relative; /* Use relative positioning to fit within the viewport */
  margin-left: 100px; /* Space for the sidebar */
  height: calc(100vh - 10px); /* Full viewport height minus top bar height */
  width: calc(100% - 160px); /* Full width minus sidebar width */
  background: #ffffff;
  overflow-y: auto; /* Add scrolling if content overflows */
}

.cards {
  width: 100%;
  padding: 35px 20px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-gap: 20px;
}
.cards .card {
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 7px 25px rgba(0, 0, 0, 0.08);
}
.number {
  font-size: 35px;
  font-weight: 500;
  color: #299B63;
}
.card-name {
  color: #888;
  font-weight: 600;
}
.icon-box i {
  font-size: 45px;
  color: #299b63;
}
/* charts */
.charts {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-gap: 20px;
  width: 100%;
  padding: 20px;
  padding-top: 0;
}
.chart {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 7px 25px rgba(0, 0, 0, 0.08);
  width: 100%;
}
.chart h2 {
  margin-bottom: 5px;
  font-size: 20px;
  color: #666;
  text-align: center
}
@media (max-width:1115px) {
  .sidebar {
      width: 60px;
  }
  .main {
      width: calc(100% - 60px);
      left: 60px;
  }
}
@media (max-width:880px) {
  /* .topbar {
      grid-template-columns: 1.6fr 6fr 0.4fr 1fr;
  } */
  .fa-bell {
      justify-self: left;
  }
  .cards {
      width: 100%;
      padding: 35px 20px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-gap: 20px;
  }
  .charts {
      grid-template-columns: 1fr;
  }
  .doughnut-chart {
      padding: 50px;
  }
  #doughnut {
      padding: 50px;
  }
}
@media (max-width:500px) {
  .topbar {
      grid-template-columns: 1fr 5fr 0.4fr 1fr;
  }
  .logo h2 {
      font-size: 20px;
  }
  .search {
      width: 80%;
  }
  .search input {
      padding: 0 20px;
  }
  .fa-bell {
      margin-right: 5px;
  }
  .cards {
      grid-template-columns: 1fr;
  }
  .doughnut-chart {
      padding: 10px;
  }
  #doughnut {
      padding: 0px;
  }
  .user {
      width: 40px;
      height: 40px;
  }
}</style>