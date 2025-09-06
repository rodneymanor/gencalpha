export default function TestPage() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Test Page</h1>
      <p>If you can see this, basic Next.js pages are working.</p>
      <p>Time: {new Date().toISOString()}</p>
    </div>
  );
}
