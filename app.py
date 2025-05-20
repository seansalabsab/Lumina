from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.models import load_model
import numpy as np
from PIL import Image
import io
import os
import traceback
import google.generativeai as genai

# Set up Google Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "AIzaSyDHeTsSX7r3Xy46SYlJA9lHgc_Hmb_ZAq0")
genai.configure(api_key=GOOGLE_API_KEY)

# Initialize the Flask app for plant identification
plant_identification_app = Flask(__name__)
CORS(plant_identification_app)  # Enable CORS for all routes

# Paths for the model
PLANT_MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "plant_identification_model.h5")

# Global variables for models
plant_model = None

# ✅ Function to get plant information using Gemini
def get_plant_info(plant_name):
    try:
        prompt = f"""Give a short description and a short care guide for the plant: {plant_name}.
        Include:
        - Short description
        - Light, water, and soil requirements
        - Common issues and tips
        """
        
        model = genai.GenerativeModel("gemini-2.0-flash")  # or "gemini-pro"
        response = model.generate_content(prompt)
        return {"status": "success", "info": response.text}
    except Exception as e:
        print(f"❌ Error getting plant info: {str(e)}")
        return {"status": "error", "message": f"Failed to get plant information: {str(e)}"}

# ✅ Load the plant identification model
try:
    if not os.path.exists(PLANT_MODEL_PATH):
        raise FileNotFoundError(f"❌ Plant model file not found at {PLANT_MODEL_PATH}")

    plant_model = load_model(PLANT_MODEL_PATH)
    print("✅ Plant identification model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading plant model: {e}")
    print(traceback.format_exc())
    exit(1)  # Stop execution if plant model fails to load

# ✅ Class names for plant identification (Ensure order matches model training)
PLANT_CLASS_NAMES = [
    "African Violet (Saintpaulia ionantha)", "Aloe Vera", "Anthurium (Anthurium andraeanum)", 
    "Areca Palm (Dypsis lutescens)", "Asparagus Fern (Asparagus setaceus)", "Begonia (Begonia spp.)", 
    "Bird of Paradise (Strelitzia reginae)", "Birds Nest Fern (Asplenium nidus)", 
    "Boston Fern (Nephrolepis exaltata)", "Calathea", "Cast Iron Plant (Aspidistra elatior)", 
    "Chinese Money Plant (Pilea peperomioides)", "Chinese evergreen (Aglaonema)", 
    "Christmas Cactus (Schlumbergera bridgesii)", "Chrysanthemum", "Ctenanthe", 
    "Daffodils (Narcissus spp.)", "Dracaena", "Dumb Cane (Dieffenbachia spp.)", 
    "Elephant Ear (Alocasia spp.)", "English Ivy (Hedera helix)", "Hyacinth (Hyacinthus orientalis)", 
    "Iron Cross begonia (Begonia masoniana)", "Jade plant (Crassula ovata)", "Kalanchoe", 
    "Lilium (Hemerocallis)", "Lily of the valley (Convallaria majalis)", "Money Tree (Pachira aquatica)", 
    "Monstera Deliciosa (Monstera deliciosa)", "Orchid", "Parlor Palm (Chamaedorea elegans)", 
    "Peace lily", "Poinsettia (Euphorbia pulcherrima)", "Polka Dot Plant (Hypoestes phyllostachya)", 
    "Ponytail Palm (Beaucarnea recurvata)", "Pothos (Ivy arum)", "Prayer Plant (Maranta leuconeura)", 
    "Rattlesnake Plant (Calathea lancifolia)", "Rubber Plant (Ficus elastica)", 
    "Sago Palm (Cycas revoluta)", "Schefflera", "Snake plant (Sanseviera)", "Tradescantia", 
    "Tulip", "Venus Flytrap", "Yucca", "ZZ Plant (Zamioculcas)"
]

# ✅ Image preprocessing function for plant identification
def preprocess_plant_image(image):
    try:
        input_shape = plant_model.input_shape
        expected_height = input_shape[1] if input_shape[1] is not None else 224
        expected_width = input_shape[2] if input_shape[2] is not None else 224
        print(f"✅ Resizing plant image to {expected_width}x{expected_height}")

        image = image.resize((expected_width, expected_height))
        img_array = np.array(image) / 255.0  # Normalize
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
        return img_array
    except Exception as e:
        print(f"❌ Error processing plant image: {e}")
        return None

# Debugging route to check if server is running
@plant_identification_app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy", 
        "message": "Plant identification server is running",
        "gemini_api": "connected" if GOOGLE_API_KEY else "not configured"
    })

# Plant identification prediction route
@plant_identification_app.route("/predict", methods=["POST"])
def predict_plant():
    try:
        print("✅ Received prediction request")
        
        if plant_model is None:
            return jsonify({"error": "Plant model not loaded"}), 500

        if "file" not in request.files:
            print("❌ No file in request")
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        print(f"✅ Received file: {file.filename}")

        # Read the file once and save the bytes
        file_bytes = file.read()

        # Create image from bytes for plant identification
        try:
            image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
            print(f"✅ Image opened successfully, size: {image.size}")
        except Exception as e:
            print(f"❌ Error opening image: {e}")
            return jsonify({"error": f"Failed to open image: {str(e)}"}), 400

        processed_image = preprocess_plant_image(image)
        if processed_image is None:
            return jsonify({"error": "Image processing failed"}), 500

        print("✅ Running prediction")
        prediction = plant_model.predict(processed_image)

        predicted_class_index = np.argmax(prediction[0])
        confidence = float(prediction[0][predicted_class_index]) * 100

        top_indices = np.argsort(prediction[0])[-3:][::-1]
        top_predictions = [{"plant_name": PLANT_CLASS_NAMES[idx], "accuracy": round(float(prediction[0][idx]) * 100, 2)} for idx in top_indices]

        predicted_plant = PLANT_CLASS_NAMES[predicted_class_index]
        
        print(f"✅ Prediction successful: {predicted_plant} ({confidence:.2f}%)")

        # Get additional plant information from Gemini API
        plant_info = get_plant_info(predicted_plant)
        print(f"✅ Retrieved plant information from Gemini API")

        return jsonify({
            "predicted_plant": predicted_plant,
            "accuracy": round(confidence, 2),
            "top_predictions": top_predictions,
            "plant_info": plant_info,
            "message": f"Identified plant as {predicted_plant} with {round(confidence, 2)}% accuracy"
        })

    except Exception as e:
        print(f"❌ Error in /predict route: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

# Plant information route that can be called separately
@plant_identification_app.route("/plant-info/<plant_name>", methods=["GET"])
def plant_info(plant_name):
    try:
        print(f"✅ Received plant info request for: {plant_name}")
        info = get_plant_info(plant_name)
        return jsonify(info)
    except Exception as e:
        print(f"❌ Error in /plant-info route: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"status": "error", "message": f"Failed to get plant information: {str(e)}"}), 500

# Additional route to list all supported plants
@plant_identification_app.route("/plants", methods=["GET"])
def list_plants():
    return jsonify({
        "status": "success",
        "plants": PLANT_CLASS_NAMES,
        "count": len(PLANT_CLASS_NAMES)
    })

# Run the Flask app for plant identification
if __name__ == "__main__":
    print("✅ Starting plant identification server with Gemini API integration...")
    plant_identification_app.run(debug=True, host="0.0.0.0", port=5001)