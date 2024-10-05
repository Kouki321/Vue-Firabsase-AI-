<template>
    <div class="loading">
        <span>
            
        </span>
    </div>
</template>

<script>

export default {
  name: "loadingView",
};

</script>

<style lang="scss" scoped>
.loading {
  position: fixed; /* Ensures the loading screen stays fixed while scrolling */
  top: 0;
  left: 0;
  z-index: 101; /* Keeps the loading overlay above other content */
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent background */
  display: flex; /* Centers the spinner */
  justify-content: center; /* Horizontally center the spinner */
  align-items: center; /* Vertically center the spinner */
}

@keyframes spin {
  to {
    transform: rotateZ(360deg);
  }
}

.loading span {
  display: block;
  width: 60px;
  height: 60px;
  border: 3px solid transparent;
  border-top-color: #fff;
  border-bottom-color: #fff;
  border-radius: 50%;
  animation: spin 1s ease infinite;
}

</style>
