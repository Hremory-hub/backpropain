import React, { useState, useRef } from 'react'
import About from './About.jsx'

// Point this at your deployed backend URL, or leave as-is for local dev.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [confidence, setConfidence] = useState(0.25)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [page, setPage] = useState('diagnose')
  const inputRef = useRef(null)

  function handleFile(selected) {
    if (!selected) return
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    setResult(null)
    setError(null)
  }

  async function runDiagnosis() {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_URL}/predict?confidence=${confidence}`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) throw new Error(`Server responded with ${res.status}`)
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(`Couldn't reach the diagnosis service. ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <header className="masthead">
        <h1>Lumbar Spine MRI Diagnosis Tool</h1>
        <p>Upload an MRI scan image to detect: Herniated Disc, Stenosis, Thecal Sac condition, or Unreadable scan.</p>
      </header>

      <nav className="nav-tabs">
        <button
          className={page === 'diagnose' ? 'active' : ''}
          onClick={() => setPage('diagnose')}
        >
          Diagnose
        </button>
        <button
          className={page === 'about' ? 'active' : ''}
          onClick={() => setPage('about')}
        >
          About
        </button>
      </nav>

      {page === 'about' ? (
        <About />
      ) : (
        <>
          <div className="upload-row">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => handleFile(e.target.files?.[0])}
              className="file-input"
            />
          </div>

          <div className="slider-row">
            <label>
              <span>Confidence threshold</span>
              <span>{confidence.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={confidence}
              onChange={(e) => setConfidence(parseFloat(e.target.value))}
            />
          </div>

          {previewUrl && (
            <button className="run-btn" onClick={runDiagnosis} disabled={loading}>
              {loading ? 'Analyzing...' : 'Run Diagnosis'}
            </button>
          )}

          {error && <div className="error-banner">{error}</div>}

          {previewUrl && (
            <div className="compare-row">
              <div className="compare-col">
                <img src={previewUrl} alt="Uploaded MRI" className="preview-img" />
                <p className="img-caption">Uploaded MRI</p>
              </div>
              <div className="compare-col">
                {result ? (
                  <>
                    <img src={result.annotated_image} alt="Detection Result" className="preview-img" />
                    <p className="img-caption">Detection Result</p>
                  </>
                ) : (
                  <div className="placeholder">Click "Run Diagnosis" to see the result here.</div>
                )}
              </div>
            </div>
          )}

          {result && (
            <>
              {result.findings.length === 0 ? (
                <p className="empty-state">No findings detected above this confidence threshold.</p>
              ) : (
                <>
                  <h3 className="findings-title">Findings</h3>
                  <ul className="findings-list">
                    {result.findings.map((f, i) => (
                      <li className="finding" key={i}>
                        <span>{f.class}</span>
                        <span className="conf">confidence: {(f.confidence * 100).toFixed(2)}%</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </>
      )}

      <p className="footnote">
        For academic/research demonstration purposes only. Not a substitute for professional medical diagnosis.
      </p>
    </div>
  )
}
