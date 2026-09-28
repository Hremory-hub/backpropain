import React from 'react'

export default function About() {
  return (
    <section className="step-card about-body">
      <h2 style={{ marginTop: 0 }}>What is this?</h2>
      <p>
        This is a school project. It uses a trained AI model to look at lumbar
        spine MRI scans and flag things it notices — like a herniated disc or
        an unclear image.
      </p>

      <h3>What it can find</h3>
      <ul className="about-list">
        <li><span className="dot" style={{ background: '#d946a8' }} /> Herniated Disc — A</li>
        <li><span className="dot" style={{ background: '#e8d84f' }} /> Herniated Disc — L</li>
        <li><span className="dot" style={{ background: '#b7d84f' }} /> No Stenosis — A</li>
        <li><span className="dot" style={{ background: '#e08a3c' }} /> No Stenosis — L</li>
        <li><span className="dot" style={{ background: '#2FA88A' }} /> Thecal Sac — A</li>
        <li><span className="dot" style={{ background: '#4f9bd1' }} /> Thecal Sac — L</li>
        <li><span className="dot" style={{ background: '#d1544f' }} /> Unreadable — A</li>
        <li><span className="dot" style={{ background: '#7c4fd1' }} /> Unreadable — L</li>
      </ul>

      <h3>How it works</h3>
      <ol className="about-steps">
        <li>You upload a scan.</li>
        <li>It's sent to the model running on our server.</li>
        <li>The model marks anything it recognizes and how sure it is.</li>
        <li>You see the marked-up image and a list of findings.</li>
      </ol>

      <h3>Please keep in mind</h3>
      <p>
        This is a class project, not a medical tool. It won't always be right,
        and it should never replace an actual doctor's diagnosis.
      </p>
    </section>
  )
}
