export default function Home() {
  return (
    <main style={{ padding: 20 }}>
      <h1>OK: Home (/)</h1>
      <p>Smart Press Monitor - Test Page</p>
      <p>Environment Check:</p>
      <ul>
        <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not Set'}</li>
        <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Not Set'}</li>
        <li>NEXT_PUBLIC_DEFAULT_ORG_ID: {process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || 'Not Set'}</li>
      </ul>
    </main>
  );
}