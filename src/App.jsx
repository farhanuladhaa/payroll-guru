import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [status, setStatus] = useState('Testing connection...')

  useEffect(() => {
    async function testConnection() {
      try {
        const { error } = await supabase.auth.getSession()

        if (error) {
          setStatus(`Connection failed: ${error.message}`)
        } else {
          setStatus('Supabase connected successfully! 🚀')
        }
      } catch (err) {
        setStatus(`Unexpected error: ${err.message}`)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">Supabase Connection Test</h1>
      <p>{status}</p>
    </div>
  )
}

export default App