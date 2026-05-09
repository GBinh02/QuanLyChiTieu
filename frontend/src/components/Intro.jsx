import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

const Intro = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(true);
    }, 2000); // Show splash for 2 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="intro-page" style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      transition: 'all 0.5s ease'
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        transition: 'all 0.5s ease',
        transform: showWelcome ? 'translateY(-50px)' : 'translateY(0)'
      }}>
        <Logo size={showWelcome ? "medium" : "large"} />
      </div>

      {showWelcome && (
        <div className="intro-buttons" style={{
          width: '100%',
          maxWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          animation: 'fadeIn 0.8s ease forwards',
          marginBottom: '4rem'
        }}>
          <button 
            className="intro-btn btn-login" 
            onClick={() => navigate('/login')}
            style={{
              background: '#1f2937',
              color: 'white',
              border: 'none',
              padding: '1.25rem',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s'
            }}
          >
            Login
          </button>
          <button 
            className="intro-btn btn-register" 
            onClick={() => navigate('/register')}
            style={{
              background: 'white',
              color: '#1f2937',
              border: '1px solid #e2e8f0',
              padding: '1.25rem',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.2s'
            }}
          >
            Register
          </button>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .intro-btn:active {
          transform: scale(0.98);
        }
      `}} />
    </div>
  );
};

export default Intro;
