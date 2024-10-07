from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import tensorflow as tf
import numpy as np
from io import BytesIO

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load your model (assumed pre-trained)
model = tf.keras.models.load_model('Image_classify1.keras')

# Image dimensions based on your model's input shape
img_height = 180  # Update based on your model
img_width = 180   # Update based on your model

# Define a prediction route
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Assumes the input is sent as a file
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400

        # Load the image for prediction
        image_load = tf.keras.utils.load_img(BytesIO(file.read()), target_size=(img_height, img_width))
        img_arr = tf.keras.utils.img_to_array(image_load)
        img_bat = tf.expand_dims(img_arr, axis=0)  # Ensure the batch dimension is correct

        # Perform prediction
        prediction = model.predict(img_bat)
        score = tf.nn.softmax(prediction[0])

        # Return prediction score as JSON
        return jsonify({
            'prediction': score.numpy().tolist(),
            'class': int(np.argmax(score))  # Return as an integer
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True)
