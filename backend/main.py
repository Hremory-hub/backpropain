from fastapi import FastAPI, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from ultralytics import YOLO
from PIL import Image
import numpy as np
import io
import base64

MODEL_PATH = "best.pt"  # place your trained YOLO weights here, same folder as this file

app = FastAPI(title="Lumbar Spine MRI Diagnosis API")

# Allow the React frontend (any origin) to call this API.
# Tighten allow_origins to your deployed frontend URL before going live.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO(MODEL_PATH)


@app.get("/health")
def health():
    return {"status": "ok", "classes": model.names}


@app.post("/predict")
async def predict(file: UploadFile = File(...), confidence: float = Query(0.25, ge=0.0, le=1.0)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    results = model.predict(source=np.array(image), conf=confidence)
    result = results[0]

    findings = []
    for box in result.boxes:
        cls_id = int(box.cls[0])
        findings.append({
            "class": model.names[cls_id],
            "confidence": round(float(box.conf[0]), 4),
        })

    # Annotated image (boxes + labels drawn) sent back as base64 so the
    # frontend can display it without needing its own drawing logic.
    annotated_bgr = result.plot()
    annotated_rgb = annotated_bgr[:, :, ::-1]
    annotated_img = Image.fromarray(annotated_rgb)
    buf = io.BytesIO()
    annotated_img.save(buf, format="JPEG", quality=90)
    annotated_b64 = base64.b64encode(buf.getvalue()).decode("utf-8")

    return JSONResponse({
        "findings": findings,
        "annotated_image": f"data:image/jpeg;base64,{annotated_b64}",
    })
