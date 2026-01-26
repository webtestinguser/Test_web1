import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import './Exam.css'

// Configuration for dynamic subjects and question counts
const EXAM_CONFIGS = {
  JEE: { 
    subjects: ['Physics', 'Chemistry', 'Mathematics'], 
    qPerSubject: 25, 
    totalQ: 75 
  },
  NEET: { 
    subjects: ['Physics', 'Chemistry', 'Botany', 'Zoology'], 
    qPerSubject: 45, 
    totalQ: 180 
  }
}

function Exam() {
  const { code } = useParams()
  const navigate = useNavigate()
  
  // 1. DYNAMIC CONFIG: Detects NEET vs JEE from URL code
  const isNEET = code?.toUpperCase().startsWith('NEET');
  const config = isNEET ? EXAM_CONFIGS.NEET : EXAM_CONFIGS.JEE;

  // --- STATE ---
  const [darkMode, setDarkMode] = useState(true) // Default to SQORA Dark
  const [currentGlobalQ, setCurrentGlobalQ] = useState(1) // Continuous count: 1 to 180
  const [userAnswers, setUserAnswers] = useState({}) // Stores { qNumber: "A" }
  const [status, setStatus] = useState({}) // Stores { qNumber: "seen" | "attempted" }
  const [timeLeft, setTimeLeft] = useState(3 * 60 * 60) // 3 Hours
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [paused, setPaused] = useState(false)

  // 2. AUTO-SWITCH LOGIC: Determines which subject tab should be active based on currentGlobalQ
  const { activeSubjectIdx, relativeNum } = useMemo(() => {
    const sIdx = Math.floor((currentGlobalQ - 1) / config.qPerSubject);
    const rNum = ((currentGlobalQ - 1) % config.qPerSubject) + 1;
    return { activeSubjectIdx: sIdx, relativeNum: rNum };
  }, [currentGlobalQ, config]);

  // --- AUTH GUARD (Mock) --- 
  // useEffect(() => { 
  //   const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'; 
  //   if (!isLoggedIn) { 
  //     // If not logged in, redirect to login page 
  //     navigate('/login'); 
  //   } 
  // }, [navigate]);

  // --- TIMER LOGIC ---
  useEffect(() => {
    if (paused || timeLeft <= 0) return
    const t = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000)
    return () => clearInterval(t)
  }, [paused, timeLeft])

  // --- HELPER FUNCTIONS ---
  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const n = s % 60;
    return [h, m, n].map((x) => String(x).padStart(2, '0')).join(':');
  }

  const handleOptionSelect = (key) => {
    setUserAnswers(prev => ({ ...prev, [currentGlobalQ]: key }));
    setStatus(prev => ({ ...prev, [currentGlobalQ]: 'attempted' }));
  }

  const navigateQuestion = (direction) => {
    if (direction === 'next' && currentGlobalQ < config.totalQ) {
      setCurrentGlobalQ(prev => prev + 1);
    } else if (direction === 'prev' && currentGlobalQ > 1) {
      setCurrentGlobalQ(prev => prev - 1);
    }
    // Mark next/prev question as seen immediately
    const nextQ = direction === 'next' ? currentGlobalQ + 1 : currentGlobalQ - 1;
    if (nextQ >= 1 && nextQ <= config.totalQ) {
        setStatus(prev => ({ ...prev, [nextQ]: prev[nextQ] === 'attempted' ? 'attempted' : 'seen' }));
    }
  }

  return (
    <div className={`exam-page ${darkMode ? 'exam-dark' : 'exam-light'}`}>
      {/* 3. HEADER: Increased size for readability */}
      <header className="exam-header">
        <div className="exam-header-left">
          <button className="pause-btn" onClick={() => setPaused(!paused)}>
            {paused ? '▶' : '⏸'} 
          </button>
          <div className="exam-timer">{formatTime(timeLeft)}</div>
          <h1 className="exam-title-text">{code}</h1>
        </div>

        <div className="exam-header-actions">
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
        </div>
      </header>

      {/* 4. SUBJECT TABS: Auto-highlights based on global number */}
      <nav className="exam-tabs">
        {config.subjects.map((s, i) => (
          <button
            key={s}
            className={`exam-tab ${i === activeSubjectIdx ? 'exam-tab-active' : ''}`}
            onClick={() => setCurrentGlobalQ((i * config.qPerSubject) + 1)}
          >
            {s}
          </button>
        ))}
      </nav>

      <div className="exam-body">
        <main className="exam-main">
          {/* Question Meta Info */}
          <div className="exam-q-header">
            <div className="q-badge">Question {currentGlobalQ}</div>
            <div className="q-subject-tag">{config.subjects[activeSubjectIdx]}</div>
            <div className="q-scoring">+4  -1</div>
          </div>
          
          <div className="exam-q-content">
            <p className="exam-q-text">
                The atomic number of the element from the following with lowest 1st ionisation enthalpy is:
            </p>
            
            {/* 5. OPTIONS: Fixed ghosting by using global number as key */}
            <div className="exam-options-grid">
              {['A', 'B', 'C', 'D'].map((opt) => (
                <div 
                  key={opt} 
                  className={`option-card ${userAnswers[currentGlobalQ] === opt ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(opt)}
                >
                  <span className="option-letter">{opt}</span>
                  <span className="option-label">Option value text for {opt}</span>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* 6. SIDEBAR: Continuous numbering with Subject Headings */}
        <aside className={`exam-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-scroll-area">
            {config.subjects.map((subName, si) => (
              <div key={subName} className="sidebar-section">
                <h4 className="sidebar-section-title">{subName}</h4>
                <div className="q-grid">
                  {Array.from({ length: config.qPerSubject }).map((_, i) => {
                    const qNum = (si * config.qPerSubject) + i + 1;
                    const qStatus = status[qNum] || 'not-seen';
                    return (
                      <button
                        key={qNum}
                        className={`q-circle ${qStatus} ${currentGlobalQ === qNum ? 'active-q' : ''}`}
                        onClick={() => setCurrentGlobalQ(qNum)}
                      >
                        {qNum}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="sidebar-footer">
            <button className="submit-btn" onClick={() => navigate('/contests')}>Submit Test</button>
          </div>
        </aside>
      </div>

      <footer className="exam-footer">
        <button className="clear-btn" onClick={() => {
          const newAns = {...userAnswers};
          delete newAns[currentGlobalQ];
          setUserAnswers(newAns);
        }}>Clear Response</button>
        
        <div className="footer-nav-group">
          <button className="nav-btn" onClick={() => navigateQuestion('prev')}>Previous</button>
          <button className="nav-btn next-btn" onClick={() => navigateQuestion('next')}>Next</button>
        </div>
      </footer>
    </div>
  )
}

export default Exam