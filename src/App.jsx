import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [payrolls, setPayrolls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPayrolls()
  }, [])

  async function loadPayrolls() {
    setLoading(true)

    const { data, error } = await supabase
      .from('payroll')
      .select(`
        *,
        payroll_details (
          id,
          total_salary
        )
      `)
      .order('payroll_year', { ascending: false })
      .order('payroll_month', { ascending: false })

    if (error) {
      console.error(error)
    } else {
      setPayrolls(data || [])
    }

    setLoading(false)
  }

  function getMonthName(month) {
    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ]

    return months[month - 1]
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(amount || 0))
  }

  if (loading) {
    return (
      <div className="p-10">
        <h1 className="text-3xl font-bold mb-4">
          Payroll History Dashboard
        </h1>
        <p>Loading payroll history...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">
          Payroll History Dashboard
        </h1>

        <p className="text-gray-600 mb-8">
          Riwayat seluruh payroll yang telah diproses.
        </p>

        <div className="bg-white shadow rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="text-left px-6 py-4">Periode</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-right px-6 py-4">Jumlah Guru</th>
                <th className="text-right px-6 py-4">Total Pengeluaran</th>
              </tr>
            </thead>

            <tbody>
              {payrolls.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center px-6 py-10 text-gray-500"
                  >
                    Belum ada payroll yang diproses.
                  </td>
                </tr>
              ) : (
                payrolls.map((payroll) => {
                  const details = payroll.payroll_details || []

                  const totalEmployees = details.length

                  const totalExpense = details.reduce(
                    (sum, detail) =>
                      sum + Number(detail.total_salary || 0),
                    0
                  )

                  return (
                    <tr
                      key={payroll.id}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium">
                        {getMonthName(payroll.payroll_month)}{' '}
                        {payroll.payroll_year}
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
                          {payroll.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {totalEmployees}
                      </td>

                      <td className="px-6 py-4 text-right font-semibold text-green-600">
                        {formatCurrency(totalExpense)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default App