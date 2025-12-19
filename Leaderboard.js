import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "leaderboard"),
      orderBy("score", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const scores = [];
      querySnapshot.forEach((doc) => {
        scores.push({ id: doc.id, ...doc.data() });
      });
      setLeaderboardData(scores);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="card" style={{ marginTop: '20px', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Global Leaderboard 🏆</h2>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '12px', textAlign: 'center', width: '15%' }}>Rank</th>
              <th style={{ padding: '12px', textAlign: 'left', width: '35%' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', width: '30%' }}>Quiz</th>
              <th style={{ padding: '12px', textAlign: 'center', width: '20%' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.length > 0 ? (
              leaderboardData.map((entry, index) => (
                <tr key={entry.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>
                    {entry.username || "Anonymous"}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'left', color: '#666' }}>
                    {entry.quizTopic || "General"}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#27ae60', fontWeight: 'bold' }}>
                    {entry.score}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No scores yet!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;