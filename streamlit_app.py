import streamlit as st
from ultralytics import YOLO
from PIL import Image
import numpy as np

st.set_page_config(page_title="Lumbar Spine MRI Classifier", layout="centered")

st.title("Lumbar Spine MRI Diagnosis Tool")
st.write("Upload an MRI scan image to detect: Herniated Disc, Stenosis, Thecal Sac condition, or Unreadable scan.")

MODEL_PATH = "best.pt"  # place your trained YOLO weights file here, same folder as this script

@st.cache_resource
def load_model():
    return YOLO(MODEL_PATH)

model = load_model()

uploaded_file = st.file_uploader("Upload MRI image", type=["jpg", "jpeg", "png"])

confidence = st.slider("Confidence threshold", 0.0, 1.0, 0.25, 0.05)

if uploaded_file is not None:
    image = Image.open(uploaded_file).convert("RGB")
    st.image(image, caption="Uploaded MRI", use_container_width=True)

    if st.button("Run Diagnosis"):
        with st.spinner("Analyzing..."):
            results = model.predict(source=np.array(image), conf=confidence)
            result = results[0]

            # Annotated image with boxes/labels drawn
            annotated = result.plot()  # returns numpy array (BGR)
            annotated_rgb = annotated[:, :, ::-1]
            st.image(annotated_rgb, caption="Detection Result", use_container_width=True)

            # List detected classes with confidence
            if len(result.boxes) == 0:
                st.warning("No findings detected above this confidence threshold.")
            else:
                st.subheader("Findings")
                for box in result.boxes:
                    cls_id = int(box.cls[0])
                    cls_name = model.names[cls_id]
                    conf = float(box.conf[0])
                    st.write(f"- **{cls_name}** — confidence: {conf:.2%}")

st.caption("For academic/research demonstration purposes only. Not a substitute for professional medical diagnosis.")
