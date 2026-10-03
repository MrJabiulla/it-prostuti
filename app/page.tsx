import Script from 'next/script';

export default function StudentPage() {
  return (
    <>
      <Script src="/student.js" strategy="afterInteractive" />
      <div id="app">
        <aside id="sidebar-nav" aria-label="Desktop navigation"></aside>
        <div id="app-body">
          <header id="desktop-header"></header>
          <div id="account-controls" className="account-controls" aria-label="Account"></div>
          <p id="api-status" className="fine" role="status" hidden></p>
          <main id="main"></main>
        </div>
        <nav id="mobile-nav" aria-label="Main navigation"></nav>
      </div>
      <dialog id="auth-dialog" aria-labelledby="auth-title"></dialog>
      <dialog id="report-dialog">
        <form id="report-form">
          <div className="row between">
            <h2>Found an issue?</h2>
            <button
              type="button"
              className="icon-button"
              data-action="close-report"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <label>
            Issue type
            <select name="type">
              <option>Incorrect answer</option>
              <option>Incorrect explanation</option>
              <option>Question or option error</option>
            </select>
          </label>
          <label>
            Details
            <textarea
              name="detail"
              rows={3}
              placeholder="What needs to be corrected?"
            ></textarea>
          </label>
          <p className="fine">
            Demo reports stay in this browser and are not sent to a reviewer.
          </p>
          <button className="primary full">Save report</button>
        </form>
      </dialog>
      <dialog id="study-dialog" className="study-dialog">
        <div className="study-modal-wrap">
          <div className="row between study-modal-head">
            <div>
              <span className="chip" id="study-dialog-badge">
                Study Capsule
              </span>
              <h2 id="study-dialog-title" style={{ margin: '4px 0 0' }}>
                Title
              </h2>
              <div
                className="fine"
                id="study-dialog-meta"
                style={{ marginTop: '2px' }}
              >
                Meta
              </div>
            </div>
            <button
              type="button"
              className="icon-button"
              data-action="close-study"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div className="study-modal-content" id="study-dialog-content"></div>
          <div className="study-modal-foot" id="study-dialog-foot"></div>
        </div>
      </dialog>
      <div id="toast" role="status"></div>
    </>
  );
}
