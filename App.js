import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import AuthForm from './components/AuthForm'; 
import heroImage from './assets/login-hero.png';
import './App.css';

function App() {
  const [view, setView] = useState('splash'); 
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]); 
  const [leaderboard, setLeaderboard] = useState([]); // State for scores

  // --- CREATE QUIZ STATE ---
  const [quizTitle, setQuizTitle] = useState('');
  const [questionsList, setQuestionsList] = useState([]); 
  const [question, setQuestion] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOption, setCorrectOption] = useState('A');

  // --- PLAYING STATE ---
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) { 
        setUser(u); 
        setView('dashboard'); 
        fetchLeaderboard(); // Load leaderboard on login
      }
      else { setUser(null); setView('splash'); }
    });
    return () => unsubscribe();
  }, []);

  // --- FIREBASE: FETCH LEADERBOARD ---
  const fetchLeaderboard = async () => {
    try {
      const q = query(collection(db, "scores"), orderBy("score", "desc"), limit(5));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeaderboard(data);
    } catch (err) { console.error("Leaderboard Error:", err); }
  };

  const fetchQuizzes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "quizzes"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuizzes(data);
      setView('play-list');
    } catch (err) { alert(err.message); }
  };

  // --- SAVE SCORE LOGIC ---
  const handleQuizEnd = async () => {
    try {
      await addDoc(collection(db, "scores"), {
        username: user?.email?.split('@')[0],
        score: score,
        total: currentQuiz?.questions?.length || 0,
        topic: currentQuiz?.title || "General",
        createdAt: serverTimestamp()
      });
      fetchLeaderboard(); // Refresh list
      setView('dashboard');
    } catch (err) { alert("Could not save score: " + err.message); }
  };

  // --- CREATE QUIZ LOGIC ---
  const addQuestionToTempList = () => {
    if (!question || !optA || !optB) return alert("Fill in Question and at least 2 options!");
    const newQ = { questionText: question, options: { a: optA, b: optB, c: optC, d: optD }, correct: correctOption };
    setQuestionsList([...questionsList, newQ]);
    setQuestion(''); setOptA(''); setOptB(''); setOptC(''); setOptD('');
  };

  const saveFullQuiz = async () => {
    if (questionsList.length === 0) return alert("Add at least one question!");
    try {
      await addDoc(collection(db, "quizzes"), {
        title: quizTitle,
        questions: questionsList,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      alert("Quiz Saved!");
      setQuestionsList([]); setQuizTitle(''); setView('dashboard');
    } catch (err) { alert(err.message); }
  };

  const handleAnswer = (ans) => {
    if (ans === currentQuiz.questions[currentIndex].correct) setScore(score + 1);
    if (currentIndex + 1 < currentQuiz.questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setView('results');
    }
  };

  // --- VIEWS ---
  if (view === 'splash') return (
    <div className="layout-center">
      <div className="glass-card">
        <h1 className="logo-main">Quizard</h1>
        <p className="logo-sub">1,000+ quizzes to challenge you!</p>
        <img src={heroImage} alt="Hero" className="hero-img" />
        <button className="btn-cyan" onClick={() => setView('auth')}>Start playing</button>
      </div>
    </div>
  );

  if (view === 'auth') return (
    <div className="layout-center">
      <div className="glass-card"><AuthForm /><button className="btn-link" onClick={() => setView('splash')}>← Back</button></div>
    </div>
  );

  if (view === 'dashboard') return (
    <div className="page-wrapper">
      <nav className="navbar"><h2 className="brand">QuizMaster Pro</h2><button className="btn-logout" onClick={() => signOut(auth)}>Logout</button></nav>
      <div className="dash-body">
        <h1 className="welcome-txt">Welcome, {user?.email?.split('@')[0]}! 🎮</h1>
        <div className="action-row">
          <button className="btn-cyan" onClick={fetchQuizzes}>Start Quiz</button>
          <button className="btn-outline" onClick={() => setView('create')}>Create Quiz</button>
        </div>
        <div className="white-card">
          <h3>🏆 Global Leaderboard</h3>
          {leaderboard.length > 0 ? (
            <table className="leader-table">
              <thead><tr><th>Player</th><th>Topic</th><th>Score</th></tr></thead>
              <tbody>
                {leaderboard.map(item => (
                  <tr key={item.id}><td>{item.username}</td><td>{item.topic}</td><td>{item.score}/{item.total}</td></tr>
                ))}
              </tbody>
            </table>
          ) : <p className="empty-msg">No scores yet. Be the first!</p>}
        </div>
      </div>
    </div>
  );

  if (view === 'create') return (
    <div className="layout-center">
      <div className="glass-card wide-card">
        <h2>{quizTitle || "New Quiz"}</h2>
        {questionsList.length === 0 && <input className="input-f" placeholder="Enter Quiz Title" onChange={(e)=>setQuizTitle(e.target.value)} />}
        <div className="badge">Questions: {questionsList.length}</div>
        <textarea className="input-f" placeholder="Question" value={question} onChange={(e)=>setQuestion(e.target.value)} />
        <div className="grid-2">
          <input className="input-f" placeholder="Opt A" value={optA} onChange={(e)=>setOptA(e.target.value)} />
          <input className="input-f" placeholder="Opt B" value={optB} onChange={(e)=>setOptB(e.target.value)} />
          <input className="input-f" placeholder="Opt C" value={optC} onChange={(e)=>setOptC(e.target.value)} />
          <input className="input-f" placeholder="Opt D" value={optD} onChange={(e)=>setOptD(e.target.value)} />
        </div>
        <div className="select-row">
          <label>Correct:</label>
          <select className="input-f dropdown" value={correctOption} onChange={(e)=>setCorrectOption(e.target.value)}>
            <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
          </select>
        </div>
        <div className="btn-stack">
          <button className="btn-outline" onClick={addQuestionToTempList}>+ Add Question</button>
          <button className="btn-cyan" onClick={saveFullQuiz}>Save Quiz</button>
        </div>
        <button className="btn-link" onClick={() => setView('dashboard')}>Cancel</button>
      </div>
    </div>
  );

  if (view === 'play-list') return (
    <div className="layout-center">
      <div className="glass-card wide-card">
        <h2>Available Quizzes</h2>
        <div className="quiz-list-container">
          {quizzes.map(q => (
            <div key={q.id} className="quiz-card-item" onClick={() => { setCurrentQuiz(q); setView('playing'); setScore(0); setCurrentIndex(0); }}>
              <h3>{q.title}</h3><p>{q.questions?.length || 0} Qs</p>
            </div>
          ))}
        </div>
        <button className="btn-link" onClick={() => setView('dashboard')}>Back</button>
      </div>
    </div>
  );

  if (view === 'playing') return (
    <div className="layout-center">
      <div className="glass-card wide-card">
        <h2 className="cyan-txt">{currentQuiz.title}</h2>
        <div className="badge">Q {currentIndex + 1} / {currentQuiz.questions.length}</div>
        <div className="q-text-display">{currentQuiz.questions[currentIndex].questionText}</div>
        <div className="grid-2">
          {['a','b','c','d'].map(key => (
            <button key={key} className="btn-outline" onClick={() => handleAnswer(key.toUpperCase())}>
              {currentQuiz.questions[currentIndex].options[key]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (view === 'results') return (
    <div className="layout-center">
      <div className="glass-card">
        <h1>🎉 Finished!</h1>
        <div className="score-display">Result: <span>{score} / {currentQuiz.questions.length}</span></div>
        <button className="btn-cyan" onClick={handleQuizEnd}>Save & Go Home</button>
      </div>
    </div>
  );

  return null;
}

export default App;