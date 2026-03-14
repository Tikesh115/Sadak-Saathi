import cv2
import numpy as np
from ultralytics import YOLO
import time

# Load model
model = YOLO("models/best.pt")

CONF_THRESHOLD = 0.40
DISTANCE_THRESHOLD = 70
MAX_TRACK_AGE = 40

# Tracked potholes
tracked_potholes = []
pothole_counter = 0


class TrackedPothole:
    def __init__(self, center, bbox, confidence):
        self.center = center
        self.bbox = bbox
        self.confidence = confidence
        self.last_seen = time.time()
        self.counted = False


def get_center(box):
    x1, y1, x2, y2 = box
    cx = int((x1 + x2) / 2)
    cy = int((y1 + y2) / 2)
    return (cx, cy)


def distance(p1, p2):
    return np.linalg.norm(np.array(p1) - np.array(p2))


def match_existing(center):
    global tracked_potholes

    for pothole in tracked_potholes:
        if distance(center, pothole.center) < DISTANCE_THRESHOLD:
            pothole.last_seen = time.time()
            return pothole

    return None


def cleanup_tracks():
    global tracked_potholes

    now = time.time()
    tracked_potholes = [
        p for p in tracked_potholes
        if now - p.last_seen < MAX_TRACK_AGE
    ]


def detect_potholes_in_frame(frame):

    global pothole_counter
    cleanup_tracks()

    results = model(frame, conf=CONF_THRESHOLD)

    detections = []

    for r in results:

        if r.boxes is None:
            continue

        boxes = r.boxes.xyxy.cpu().numpy()
        confs = r.boxes.conf.cpu().numpy()

        for i in range(len(boxes)):

            if confs[i] < CONF_THRESHOLD:
                continue

            x1, y1, x2, y2 = boxes[i]
            bbox = [x1, y1, x2, y2]

            center = get_center(bbox)

            existing = match_existing(center)

            if existing:

                existing.bbox = bbox
                existing.confidence = confs[i]

                detections.append({
                    "bbox": bbox,
                    "confidence": float(confs[i]),
                    "new": False
                })

            else:

                pothole = TrackedPothole(center, bbox, confs[i])
                tracked_potholes.append(pothole)

                pothole_counter += 1

                detections.append({
                    "bbox": bbox,
                    "confidence": float(confs[i]),
                    "new": True
                })

    return detections


def annotate_frame(frame, potholes):

    img = frame.copy()

    for p in potholes:

        x1, y1, x2, y2 = [int(v) for v in p["bbox"]]
        conf = p["confidence"]

        color = (0,255,0) if p["new"] else (0,0,255)

        cv2.rectangle(
            img,
            (x1, y1),
            (x2, y2),
            color,
            2
        )

        label = f"Pothole {conf:.2f}"

        cv2.putText(
            img,
            label,
            (x1, y1-10),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            color,
            2
        )

    # Draw pothole counter
    cv2.putText(
        img,
        f"Total Potholes Detected: {pothole_counter}",
        (20,40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0,255,255),
        3
    )

    return img


def get_total_potholes():
    return pothole_counter