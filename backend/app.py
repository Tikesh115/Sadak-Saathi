from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import cv2
import os

from detector import detect_potholes_in_frame, annotate_frame

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

VIDEO_PATH = os.path.join(UPLOAD_FOLDER, "input.mp4")

state = {
    "frames": 0,
    "detections": 0
}


@app.route("/")
def home():
    return "Backend running"


@app.route("/upload", methods=["POST"])
def upload_video():

    if "video" not in request.files:
        return jsonify({"error": "No video"}), 400

    file = request.files["video"]

    file.save(VIDEO_PATH)

    print("Video saved:", VIDEO_PATH)

    return jsonify({
        "processedVideoURL": "http://localhost:5000/video_feed"
    })


def generate_frames():

    print("Starting video stream")

    if not os.path.exists(VIDEO_PATH):
        print("Video not found")
        return

    cap = cv2.VideoCapture(VIDEO_PATH)

    if not cap.isOpened():
        print("Video could not open")
        return

    while True:

        success, frame = cap.read()

        if not success:
            print("Video ended")
            break

        potholes = detect_potholes_in_frame(frame)

        state["detections"] += len(potholes)
        state["frames"] += 1

        annotated = annotate_frame(frame, potholes)

        ret, buffer = cv2.imencode(".jpg", annotated)

        frame_bytes = buffer.tobytes()

        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" +
            frame_bytes +
            b"\r\n"
        )

    cap.release()


@app.route("/video_feed")
def video_feed():

    return Response(
        generate_frames(),
        mimetype="multipart/x-mixed-replace; boundary=frame"
    )


@app.route("/detection_count")
def detection_count():

    return jsonify(state)


if __name__ == "__main__":
    app.run(port=5000, debug=True)