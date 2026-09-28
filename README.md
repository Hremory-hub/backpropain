# Lumbar Spine MRI Checker

A web app that checks lumbar spine MRI scans for 8 possible findings, using a trained YOLO model.

## Project Structure

```
BackP/
├── backend/     → Python server that runs the AI model
└── backp/       → React website (what users see)
```

## Requirements

- Python 3.9+
- Node.js 18+
- Your trained model file (`best.pt`)

## 1. Run the Backend (AI Server)

```
cd backend
pip install -r requirements.txt
```

Place your trained model file in the `backend` folder, then open `main.py` and make sure this line matches your filename:

```python
MODEL_PATH = "best.pt"
```

Start the server:

```
uvicorn main:app --reload
```

Check it worked by opening this in your browser:
```
http://localhost:8000/health
```
You should see your 8 class names listed.

## 2. Run the Frontend (Website)

Open a **new** terminal window (keep the backend one running):

```
cd backp
npm install
npm run dev
```

Open the link it gives you (usually `http://localhost:5173`).

## 3. Use the App

1. Upload an MRI image.
2. Click **Check This Scan**.
3. See the marked-up image and list of findings.

If nothing shows up, open "Show advanced setting" and lower the confidence percentage.

## Notes

- Both the backend and frontend must be running at the same time.
- This is a class project — not a real medical diagnosis tool.
