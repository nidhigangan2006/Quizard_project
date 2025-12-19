import React, { useState } from 'react';
import { db, auth } from '../firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const CreateQuizForm = () => {
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState({
    questionText: '',
    answerOptions: [
      { answerText: '', isCorrect: false },
      { answerText: '', isCorrect: false },
      { answerText: '', isCorrect: false },
      { answerText: '', isCorrect: false },
    ]
  });

  const addQuestionToList = () => {
    if (!currentQ.questionText) return alert("Enter a question!");
    setQuestions([...questions, currentQ]);
    // Reset question fields for the next one
    setCurrentQ({
      questionText: '',
      answerOptions: [
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false },
        { answerText: '', isCorrect: false },
      ]
    });
  };

  // Inside your CreateQuizForm component, update the save function:
const saveFullQuiz = async () => {
  // 1. Check if the title is empty
  if (!quizTitle.trim()) {
    return alert("Please give your quiz a name first!");
  }

  // 2. Check if the questions array is empty
  if (questions.length === 0) {
    return alert("Your quiz is empty! You must click 'Add Question to Set' at least once before saving.");
  }

  try {
    await setDoc(doc(db, "quizzes", quizTitle), {
      title: quizTitle,
      questions: questions,
      createdBy: auth.currentUser.uid,
      createdAt: serverTimestamp(),
    });
    alert(`Success! "${quizTitle}" is now live.`);
    setQuestions([]);
    setQuizTitle('');
  } catch (error) {
    console.error("Save error:", error);
  }
};
  return (
    <div className="card" style={{ textAlign: 'left' }}>
      <h2>Create a New Quiz Set</h2>
      <input 
        type="text" placeholder="Quiz Title (e.g. Science 101)" 
        value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)}
        style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
      />

      <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
        <h4>Add Question #{questions.length + 1}</h4>
        <input 
          type="text" placeholder="Question Text" 
          value={currentQ.questionText} 
          onChange={(e) => setCurrentQ({...currentQ, questionText: e.target.value})}
          style={{ width: '100%', marginBottom: '10px' }}
        />
        {currentQ.answerOptions.map((opt, i) => (
          <div key={i} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
            <input 
              placeholder={`Option ${i+1}`} 
              value={opt.answerText}
              onChange={(e) => {
                const newOpts = [...currentQ.answerOptions];
                newOpts[i].answerText = e.target.value;
                setCurrentQ({...currentQ, answerOptions: newOpts});
              }}
            />
            <input 
              type="checkbox" checked={opt.isCorrect}
              onChange={(e) => {
                const newOpts = currentQ.answerOptions.map((o, idx) => ({
                  ...o, isCorrect: i === idx
                }));
                setCurrentQ({...currentQ, answerOptions: newOpts});
              }}
            /> Correct?
          </div>
        ))}
        <button onClick={addQuestionToList} style={{ marginTop: '10px' }}>Add Question to Set</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        <p>Questions in this set: {questions.length}</p>
        <button onClick={saveFullQuiz} className="btn-start" style={{ background: '#2ecc71' }}>
          Save Entire Quiz to Database
        </button>
      </div>
    </div>
  );
};

export default CreateQuizForm;