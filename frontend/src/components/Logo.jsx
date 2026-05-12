

const Logo = ({ size = 'large' }) => {
  const isLarge = size === 'large';

  return (
    <div className={`logo-container ${size}`} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }}>
      <svg
        width={isLarge ? "120" : "60"}
        height={isLarge ? "100" : "50"}
        viewBox="0 0 120 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Book Icon */}
        <path d="M60 20C60 20 50 15 30 15C10 15 10 35 10 35V75C10 75 10 55 30 55C50 55 60 60 60 60" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M60 20C60 20 70 15 90 15C110 15 110 35 110 35V75C110 75 110 55 90 55C70 55 60 60 60 60" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M60 20V60" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Decorative lines inside book */}
        <path d="M35 25H25" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />
        <path d="M35 35H25" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />
        <path d="M35 45H25" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />

        <path d="M85 25H95" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />
        <path d="M85 35H95" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />
        <path d="M85 45H95" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />
      </svg>

      <div className="logo-text" style={{
        marginTop: isLarge ? '1rem' : '0.5rem',
        position: 'relative'
      }}>
        <h1 style={{
          fontSize: isLarge ? '2rem' : '1rem',
          fontWeight: '700',
          letterSpacing: '2px',
          color: '#1f2937',
          margin: 0,
          textTransform: 'uppercase'
        }}>
          BOOKSTORE<sup style={{ fontSize: '0.4em', top: '-1em' }}>®</sup>
        </h1>
        <div style={{
          width: isLarge ? '30px' : '15px',
          height: isLarge ? '4px' : '2px',
          backgroundColor: '#e11d48',
          marginTop: '4px',
          borderRadius: '2px'
        }}></div>
      </div>
    </div>
  );
};

export default Logo;
