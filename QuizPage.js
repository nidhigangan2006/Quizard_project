import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';

const QuizPage = ({ user, quizId, playerName }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Track which button is clicked
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) return;
      try {
        const docRef = doc(db, "quizzes", quizId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setQuestions(docSnap.data().questions || []);
        setLoading(false);
      } catch (error) { setLoading(false); }
    };
    fetchQuiz();
  }, [quizId]);

  const handleAnswerClick = (index, isCorrect) => {
    setSelectedOption(index); // Highlight the button

    // Small delay so user SEES the color change
    setTimeout(() => {
      if (isCorrect) setScore(prev => prev + 1);
      
      const next = currentQuestion + 1;
      if (next < questions.length) {
        setCurrentQuestion(next);
        setSelectedOption(null); // Reset selection for next question
      } else {
        setShowScore(true);
        saveScore(isCorrect ? score + 1 : score);
      }
    }, 500); 
  };

  const saveScore = async (finalScore) => {
    await addDoc(collection(db, "leaderboard"), {
      username: playerName,
      score: finalScore,
      quizTopic: quizId,
      createdAt: serverTimestamp(),
    });
  };

  if (loading) return <div className="card"><h3>Loading Magic...</h3></div>;
  const currentItem = questions[currentQuestion];

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      {showScore ? (
        <div>
          <h1 style={{fontSize: '40px'}}>🏆</h1>
          <h2>Nice Work, {playerName}!</h2>
          <p style={{fontSize: '24px'}}>Your Score: {score} / {questions.length}</p>
          <button onClick={() => window.location.reload()} className="btn-start">Play Again</button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
             <span style={{opacity: 0.7}}>⌛ 2:14</span> {/* Decorative Timer like sample */}
             <span style={{fontWeight: 'bold'}}>Q {currentQuestion + 1}/{questions.length}</span>
          </div>

          <h2 style={{ fontSize: '26px', marginBottom: '30px' }}>
             {currentItem?.questionText || "Question Missing"}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {currentItem?.answerOptions?.map((option, index) => (
              <button 
                key={index} 
                className={`btn-option ${selectedOption === index ? 'selected' : ''}`}
                onClick={() => handleAnswerClick(index, option.isCorrect)}
                disabled={selectedOption !== null} // Prevent double clicks
              >
                {option.answerText}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default QuizPage;