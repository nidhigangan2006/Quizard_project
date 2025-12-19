import React, { useState } from 'react';
import { auth } from '../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) { alert(err.message); }
  };

  return (
    <form className="auth-form" onSubmit={handleAuth}>
      <h2 style={{color:'white'}}>{isLogin ? 'Login / Sign Up' : 'Create Account'}</h2>
      <input className="input-f" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
      <input className="input-f" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit" className="btn-cyan">Start Playing</button>
      <p className="toggle-btn" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Need an account? Sign up" : "Have an account? Login"}
      </p>
    </form>
  );
};

export default AuthForm; // THIS LINE FIXES THE EXPORT ERROR