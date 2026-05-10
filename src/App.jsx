// src/App.jsx

import { useState } from 'react'
import { processPayroll } from './services/payrollService'
import { generateSlipPDF } from './services/pdfService'
import { supabase } from './lib/supabase'

function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [latestPayrollDetail, setLatestPayrollDetail] = useState(null)

  async function handleProcessPayroll() {
    setLoading(true)
    setResult(null)

    const response = await processPayroll(2026, 5)
    setResult(response)

    // Jika sukses, ambil satu payroll detail terbaru
    if (response.success) {
      const { data } = await supabase
        .from('payroll_details')
        .select('*')
        .eq('payroll_id', response.payrollId)
        .limit(1)
        .single()

      setLatestPayrollDetail(data)
    }

    setLoading(false)
  }

  function handleGeneratePDF() {
    if (!latestPayrollDetail) return

    generateSlipPDF(latestPayrollDetail, 2026, 5)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-10">
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          Process Payroll
        </h1>

        <p className="text-gray-600 mb-6">
          Klik tombol di bawah untuk memproses payroll periode Mei 2026
          dan menyimpan snapshot ke database.
        </p>

        <div className="flex gap-4">
          <button
            onClick={handleProcessPayroll}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold"
          >
            {loading ? 'Processing...' : 'Process Payroll'}
          </button>

          <button
            onClick={handleGeneratePDF}
            disabled={!latestPayrollDetail}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Generate Slip PDF
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 rounded-xl bg-gray-50 border">
            {result.success ? (
              <div>
                <p className="text-green-600 font-bold text-lg">
                  ✅ Payroll berhasil diproses!
                </p>
                <p className="mt-2">{result.message}</p>
                <p>Total Processed: {result.totalProcessed}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Payroll ID: {result.payrollId}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  Sekarang klik "Generate Slip PDF"
                </p>
              </div>
            ) : (
              <div>
                <p className="text-red-600 font-bold text-lg">
                  ❌ Gagal memproses payroll
                </p>
                <p className="mt-2">{result.message}</p>
              </div>
            )}
          </div>
        )}

        {latestPayrollDetail && (
          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="font-semibold">
              Slip siap dibuat untuk:
            </p>
            <p>{latestPayrollDetail.employee_name}</p>
            <p>
              Total Gaji:{' '}
              {Number(
                latestPayrollDetail.total_salary
              ).toLocaleString('id-ID')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App