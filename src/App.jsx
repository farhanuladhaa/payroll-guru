import { useEffect, useState } from 'react'
import { calculatePayroll } from './services/payrollService'
import { formatCurrency } from './utils/formatCurrency'

function App() {
  const [result, setResult] = useState(null)

  useEffect(() => {
    async function testPayroll() {
      const response = await calculatePayroll(2026, 5)
      setResult(response)
    }

    testPayroll()
  }, [])

  if (!result) {
    return (
      <div className="p-10">
        <h1 className="text-3xl font-bold mb-4">Payroll Calculation Test</h1>
        <p>Loading...</p>
      </div>
    )
  }

  if (!result.success) {
    return (
      <div className="p-10">
        <h1 className="text-3xl font-bold mb-4">Payroll Calculation Test</h1>
        <p className="text-red-600">Error: {result.message}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold text-blue-600 mb-2">
        Payroll Calculation Test
      </h1>

      <p className="text-gray-600 mb-2">
        Payroll period: {result.month}/{result.year}
      </p>

      <p className="text-gray-600 mb-8">
        Total active employees: {result.totalEmployees}
      </p>

      {result.employees.map((employee) => (
        <div
          key={employee.id}
          className="bg-white shadow rounded-2xl p-6 mb-6"
        >
          <h2 className="text-2xl font-bold mb-4">
            {employee.full_name}
          </h2>

          <div className="space-y-1 text-gray-700">
            <p><strong>NIP:</strong> {employee.nip}</p>
            <p><strong>Jabatan:</strong> {employee.positions?.name}</p>
            <p>
              <strong>Masa Kerja:</strong>{' '}
              {employee.yearsOfService} tahun
            </p>
            <p>
              <strong>Hari Hadir:</strong>{' '}
              {employee.daysPresent}
            </p>
          </div>

          {employee.error ? (
            <p className="text-red-600 mt-4">
              Error: {employee.error}
            </p>
          ) : (
            <div className="mt-6 border-t pt-4 space-y-2">
              <p>
                <strong>Gaji Pokok:</strong>{' '}
                {formatCurrency(employee.baseSalary)}
              </p>

              <p>
                <strong>Tunjangan:</strong>{' '}
                {formatCurrency(employee.allowance)}
              </p>

              <p>
                <strong>Tarif Kehadiran:</strong>{' '}
                {formatCurrency(employee.attendanceRate)}
              </p>

              <p>
                <strong>Insentif Kehadiran:</strong>{' '}
                {formatCurrency(employee.attendanceAmount)}
              </p>

              <p className="text-2xl font-bold text-green-600 mt-4">
                Total Gaji:{' '}
                {formatCurrency(employee.totalSalary)}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default App