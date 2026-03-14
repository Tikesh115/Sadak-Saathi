from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, date
import os

from firebase_config import db
import cv2
import uuid
from detector import detect_potholes

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def to_json_safe(value):
    # Handle Firestore GeoPoint-like objects.
    if hasattr(value, "latitude") and hasattr(value, "longitude"):
        return {
            "latitude": value.latitude,
            "longitude": value.longitude,
        }

    if isinstance(value, (datetime, date)):
        return value.isoformat()

    if isinstance(value, list):
        return [to_json_safe(item) for item in value]

    if isinstance(value, dict):
        return {key: to_json_safe(val) for key, val in value.items()}

    return value


@app.route("/")
def home():
    return "Sadak Saathi Backend Running"


@app.route("/detect", methods=["POST"])
def detect():

    if "video" not in request.files:
        return jsonify({"error": "No video provided. Expected form-data field 'video'."}), 400

    file = request.files["video"]

    if not file or file.filename == "":
        return jsonify({"error": "Empty video upload."}), 400

    filename = str(uuid.uuid4()) + ".mp4"

    path = os.path.join("uploads", filename)

    file.save(path)

    cap = cv2.VideoCapture(path)

    frame_count = 0
    detections = []

    while True:

        ret, frame = cap.read()

        if not ret:
            break

        # process every 30th frame
        if frame_count % 15 == 0:

            frame_path = f"uploads/frame_{frame_count}.jpg"

            cv2.imwrite(frame_path, frame)

            try:
                potholes = detect_potholes(frame_path)
            except Exception as error:
                cap.release()
                return jsonify({
                    "error": "Detection failed",
                    "details": str(error)
                }), 500

            for p in potholes:

                data = {
                    "latitude": 21.1938,
                    "longitude": 81.3509,
                    "severity": "high",
                    "confidence": p["confidence"]
                }

                db.collection("potholes").add(data)

                detections.append(data)

        frame_count += 1

    cap.release()

    return jsonify({
        "detections": len(detections),
        "potholes": len(detections),
        "frames": frame_count,
        "processing_time": "completed"
    })


@app.route("/potholes")
def potholes():

    docs = db.collection("potholes").stream()

    result = []

    for doc in docs:
        data = to_json_safe(doc.to_dict())
        data["id"] = doc.id
        result.append(data)

    return jsonify(result)


@app.route("/repair/<id>", methods=["POST"])
def repair(id):

    db.collection("potholes").document(id).update({
        "status": "repaired"
    })

    return jsonify({"message": "Pothole marked repaired"})


if __name__ == "__main__":
    app.run(port=5000, debug=True)