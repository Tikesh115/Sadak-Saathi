from ultralytics import YOLO

# Use custom weights by default, with a fallback for incompatible checkpoints.
PRIMARY_MODEL_PATH = "models/best.pt"
FALLBACK_MODEL_PATH = "yolov8n.pt"


def _load_model(path):
    return YOLO(path)


model = _load_model(PRIMARY_MODEL_PATH)
active_model_path = PRIMARY_MODEL_PATH


def detect_potholes(image_path):
    global model, active_model_path

    try:
        results = model(image_path)
    except AttributeError as error:
        # Retry once with a known-stable model when custom weights mismatch runtime internals.
        if active_model_path != FALLBACK_MODEL_PATH:
            model = _load_model(FALLBACK_MODEL_PATH)
            active_model_path = FALLBACK_MODEL_PATH
            results = model(image_path)
        else:
            raise RuntimeError(f"Model inference failed: {error}") from error
    except Exception as error:
        raise RuntimeError(f"Model inference failed: {error}") from error

    potholes = []

    for r in results:

        boxes = r.boxes.xyxy
        conf = r.boxes.conf

        for i in range(len(boxes)):

            potholes.append({
                "confidence": float(conf[i]),
                "bbox": boxes[i].tolist()
            })

    return potholes