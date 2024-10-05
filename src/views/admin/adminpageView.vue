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
              <div class="number">3333</div>
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
            <h2>Appointment</h2>
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
import Chart from 'chart.js/auto';
import { ref, onMounted } from 'vue';
import { getFirestore, collection, getDocs, where, query, onSnapshot } from 'firebase/firestore';

export default {
  name: 'adminpageView',
  setup() {
    const users = ref([]);
    const patients = ref([]);
    const doctors = ref([]);
    const appointmentsList = ref([]); // Ref for the list of all appointments
    const appointmentAccepted = ref([]);
    const appointmentDeletedByPatient = ref([]);
    const appointmentOnGoing = ref([]);
    const appointmentDeletedByDoctor = ref([]);
    const doughnutChart = ref(null); // Reference for the doughnut chart instance
    const lineChart = ref(null); // Reference for the line chart instance
    const acceptedCounts = ref(new Array(12).fill(0)); // Initialize counts for accepted appointments per month
    const rejectedCounts = ref(new Array(12).fill(0)); // Initialize counts for rejected appointments per month

    // Function to fetch and update data from Firestore
    const fetchData = async () => {
      const db = getFirestore();
      
      // Fetch users
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const usersArray = usersSnapshot.docs.map((doc) => doc.data());
      users.value = usersArray;
      doctors.value = usersArray.flatMap((user) => user.doctor || []);
      patients.value = usersArray.flatMap((user) => user.patient || []);

      // Fetch appointments
      const appointmentsRef = collection(db, 'AppointmentRequest');
      const qa = query(
        appointmentsRef,
        where('status', 'in', ['accepted', 'deleted by Doctor', 'deleted by Patient'])
      );
      onSnapshot(qa, (snapshot) => {
        // Reset counts
        const acceptedCounts = ref(new Array(7).fill(0)); // Initialize counts for accepted appointments per day of the week
        const rejectedCounts = ref(new Array(7).fill(0));

        // Get the start and end of the current week
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        // Process documents
        snapshot.forEach((doc) => {
          const data = doc.data();
          const date = new Date(data.createdAt); // Assuming createdAt is a timestamp field
          if (date >= startOfWeek && date <= endOfWeek) {
            const day = date.getDay(); // Get the day of the week (0-6)

            if (data.status === 'accepted') {
              acceptedCounts.value[day] += 1;
            } else if (data.status === 'deleted by Doctor' || data.status === 'deleted by Patient') {
              rejectedCounts.value[day] += 1;
            }
          }
        });

        if (lineChart.value) {
          lineChart.value.data.datasets[0].data = acceptedCounts.value;
          lineChart.value.data.datasets[1].data = rejectedCounts.value;
          lineChart.value.update(); // Refresh the line chart
        }
      });

      // Fetch all appointments
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
        appointmentsList.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          patient: userMap.get(doc.data().user),
          doctor: userMap.get(doc.data().doctor),
        }));

        appointmentAccepted.value = appointmentsList.value.filter((appointment) => appointment.status === 'accepted');
        appointmentDeletedByPatient.value = appointmentsList.value.filter(
          (appointment) => appointment.status === 'deleted by Patient'
        );
        appointmentOnGoing.value = appointmentsList.value.filter((appointment) => appointment.status === 'ongoing');
        appointmentDeletedByDoctor.value = appointmentsList.value.filter(
          (appointment) => appointment.status === 'deleted by Doctor'
        );

        if (doughnutChart.value) {
          doughnutChart.value.data.datasets[0].data = [
            appointmentAccepted.value.length,
            appointmentOnGoing.value.length,
            appointmentDeletedByPatient.value.length,
            appointmentDeletedByDoctor.value.length,
          ];
          doughnutChart.value.update(); // Refresh the doughnut chart
        }
      });
    };

    /*/ Function to initialize the line chart
    const initializeLineChart = () => {
        const ctx1 = document.getElementById('lineChart').getContext('2d');
        lineChart.value = new Chart(ctx1, {
          type: 'line',
          data: {
            labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            datasets: [
              {
                label: 'Accepted Appointments',
                data: acceptedCounts.value,
                backgroundColor: 'rgba(41, 155, 99, 0.2)',
                borderColor: 'rgb(41, 155, 99)',
                borderWidth: 2,
                fill: false,
              },
              {
                label: 'Rejected Appointments',
                data: rejectedCounts.value,
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 2,
                fill: false,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      };
*/
    // Function to initialize the doughnut chart
    const initializeDoughnutChart = () => {
      const ctx2 = document.getElementById('doughnut').getContext('2d');
      doughnutChart.value = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: ['Accepted', 'Ongoing', 'Deleted by Patient', 'Deleted by Doctor'],
          datasets: [
            {
              label: 'Appointments',
              data: [
                appointmentAccepted.value.length,
                appointmentOnGoing.value.length,
                appointmentDeletedByPatient.value.length,
                appointmentDeletedByDoctor.value.length,
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
        },
      });
    };

    onMounted(() => {
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
      fetchData();
    //  initializeLineChart();
      try {
        initializeDoughnutChart();
      } catch (error) {
  console.error("Error initializing line chart:", error);
}
      
    });

    return {
      appointmentAccepted,
      appointmentDeletedByPatient,
      appointmentOnGoing,
      appointmentDeletedByDoctor,
      users,
      doctors,
      patients,
      appointmentsList,
      acceptedCounts,
      rejectedCounts,
    };
  },
};
</script>

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