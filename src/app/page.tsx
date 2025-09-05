export default function RootPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      flexDirection: 'column',
      gap: '20px',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '2rem', color: '#333' }}>Gen C Alpha</h1>
      <p style={{ color: '#666', textAlign: 'center' }}>
        App is under maintenance. We're working to resolve deployment issues.
      </p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <a 
          href="/auth/v1/login" 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '5px' 
          }}
        >
          Login (V1)
        </a>
        <a 
          href="/write" 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '5px' 
          }}
        >
          Write
        </a>
        <a 
          href="/test" 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#17a2b8', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '5px' 
          }}
        >
          Test
        </a>
      </div>
      <small style={{ color: '#999', marginTop: '20px' }}>
        Build time: {new Date().toISOString()}
      </small>
    </div>
  );
}
