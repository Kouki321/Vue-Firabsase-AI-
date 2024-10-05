<template>
  <div class="container">
    <div class="row">
      <div class="card card1">Card 1</div>
      <div class="card card2">Card 2</div>
      <div class="card card3">Card 3</div>
    </div>
    <div class="row">
      <div class="card card4">Card 4</div>
      <div class="card card5">Card 5</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CardLayout',
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 20px; /* Space between rows */
  padding: 20px;
 }

.row {
  display: flex;
  gap: 20px; /* Space between cards */
  justify-content: space-between; /* Space cards evenly */
}

.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  box-sizing: border-box;
  text-align: center;
  font-size: 1rem;
}

.card1, .card2, .card3 {
  flex: 1; /* Makes cards take equal space */
  max-width: 50vw; 
  height: 150px; /* Adjust as needed */
  /* Max width of 20% of viewport width */
}

.card4 {
  flex: 4; /* Makes Card 4 bigger than Card 5 */
  width: 800px; /* Adjust as needed */
  height: 300px; /* Adjust as needed */
}

.card5 {
  flex: 2;
  width: 100px; /* Adjust as needed */
  height: 300px;   }

/* Responsive Design */
@media (max-width: 800px) {
  .row {
    flex-direction: column;
  }

  .card {
    max-width: 100%; /* Full width for smaller screens */
  }

  .card4 {
    max-width: 100%;
  }
}
</style>
