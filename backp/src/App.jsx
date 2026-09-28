import React, { useState, useRef } from 'react'
import About from './About.jsx'

// Point this at your deployed backend URL, or leave as-is for local dev.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function App() {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [confidence, setConfidence] = useState(0.25)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [page, setPage] = useState('diagnose')
  const inputRef = useRef(null)

  function handleFile(selected) {
    if (!selected) return
    setFile(selected)
    setPreviewUrl(URL.createObjectURL(selected))
    setResult(null)
    setError(null)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragActive(false)
    const dropped = e.dataTransfer.files?.[0]
    handleFile(dropped)
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
        <h1>Lumbar Spine MRI Checker</h1>
        <p>Upload a scan and see what the model finds.</p>
      </header>

      <nav className="nav-tabs">
        <button
          className={page === 'diagnose' ? 'active' : ''}
          onClick={() => setPage('diagnose')}
        >
          Check a Scan
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
          <section className="step-card">
            <div className="step-head">
              <span className="step-num">1</span>
              <h2>Upload your MRI image</h2>
            </div>

            <div
              className={`dropzone ${dragActive ? 'active' : ''}`}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="MRI preview" className="preview-img" />
              ) : (
                <>
                  <span className="icon">📁</span>
                  <div>Click here, or drag a JPG or PNG into this box</div>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>

            <button className="help-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
              {showAdvanced ? 'Hide advanced setting' : 'Show advanced setting'}
            </button>

            {showAdvanced && (
              <div className="slider-row">
                <label>
                  <span>How sure should the model be?</span>
                  <span>{Math.round(confidence * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={confidence}
                  onChange={(e) => setConfidence(parseFloat(e.target.value))}
                />
                <p className="hint">Lower this if the model isn't finding anything. Raise it to only show its most confident guesses.</p>
              </div>
            )}
          </section>

          <section className="step-card">
            <div className="step-head">
              <span className="step-num">2</span>
              <h2>Run the check</h2>
            </div>
            <button className="run-btn" onClick={runDiagnosis} disabled={!file || loading}>
              {loading ? 'Checking your scan…' : 'Check This Scan'}
            </button>
          </section>

          <section className="step-card">
            <div className="step-head">
              <span className="step-num">3</span>
              <h2>See the results</h2>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {!result && !error && (
              <p className="empty-state">
                Nothing here yet — upload a scan above and click "Check This Scan."
              </p>
            )}

            {result && (
              <>
                <img src={result.annotated_image} alt="Annotated result" className="preview-img" style={{ marginBottom: 16 }} />
                {result.findings.length === 0 ? (
                  <p className="empty-state">Nothing was found at this confidence level. Try lowering the advanced setting above.</p>
                ) : (
                  <ul className="findings-list">
                    {result.findings.map((f, i) => (
                      <li className="finding" key={i}>
                        <span>{f.class}</span>
                        <span className="conf">{(f.confidence * 100).toFixed(0)}% sure</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </section>
        </>
      )}

      <p className="footnote">
        Made for a school project. This is not a real medical diagnosis — always check with a doctor.
        Images you upload are only used to run the check and aren't saved anywhere.
      </p>
    </div>
  )
}
