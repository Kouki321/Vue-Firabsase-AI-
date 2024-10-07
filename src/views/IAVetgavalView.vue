<template>
  <div>
    <h2>Image Classification</h2>
    <input type="file" @change="handleFileUpload" accept="image/*" />
    <img v-if="previewImage" :src="previewImage" alt="Uploaded Image" width="300" />
    
    <div v-if="topPredictions.length > 0" class="predictions">
      <h3>Top Predictions</h3>
      <ul>
        <li v-for="(prediction, index) in topPredictions" :key="index" class="prediction-item">
          <strong>Class:</strong> {{ prediction.className }} 
          <strong>Confidence:</strong> {{ (prediction.probability * 100).toFixed(2) }}%
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
 
export default {
  data() {
    return {
      previewImage: null,
      topPredictions: [],
      classNames: [
        "apple", "banana", "beetroot", "bell pepper", "cabbage", "capsicum",
        "carrot", "cauliflower", "chilli pepper", "corn", "cucumber", "eggplant",
        "garlic", "ginger", "grapes", "jalepeno", "kiwi", "lemon", "lettuce",
        "mango", "onion", "orange", "paprika", "pear", "peas", "pineapple",
        "pomegranate", "potato", "raddish", "soy beans", "spinach", "sweetcorn",
        "sweetpotato", "tomato", "turnip", "watermelon"
      ],
    };
  },
  methods: {
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Show the preview of the uploaded image
      this.previewImage = URL.createObjectURL(file);

      // Send the image to the API
      await this.sendImageToApi(file);
    },
    async sendImageToApi(file) {
      const formData = new FormData();
      formData.append('file', file); // Ensure the key matches what your Flask API expects

      try {
        const response = await fetch('http:flask api', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        this.topPredictions = this.formatTopPredictions(data); // Format the top predictions
      } catch (error) {
        console.error('Error during prediction:', error);
        alert('An error occurred during prediction. Please check the console for details.');
      }
    },
    formatTopPredictions(data) {
      if (data.error) {
        return [{ className: "Error", probability: 0 }];
      }

      // Get scores from the prediction and map to class names
      const scores = data.prediction;
      const classScores = scores.map((score, index) => ({
        className: this.classNames[index],
        probability: score,
      }));

      // Sort the predictions by probability in descending order
      classScores.sort((a, b) => b.probability - a.probability);

      // Return the top three predictions
      return classScores.slice(0, 3);
    },
  },
};
</script>

<style scoped>
.predictions {
  margin-top: 20px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 8px;
  background-color: #f9f9f9;
}
.prediction-item {
  padding: 5px;
  margin: 5px 0;
  border-bottom: 1px solid #eee;
  transition: background-color 0.3s;
}
.prediction-item:hover {
  background-color: #f1f1f1;
}
</style>
