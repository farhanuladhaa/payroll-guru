// src/App.jsx

import { useEffect, useState } from 'react'
import { calculatePayroll } from './services/payrollService'

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
        <h1 className="text-3xl font-bold mb-4">Payroll Service Test</h1>
        <p>Loading...</p>
      </div>
    )
  }

  if (!result.success) {
    return (
      <div className="p-10">
        <h1 className="text-3xl font-bold mb-4">Payroll Service Test</h1>
        <p className="text-red-600">Error: {result.message}</p>
      </div>
    )
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">Payroll Service Test</h1>

      <p className="mb-2">
        Payroll period: {result.month}/{result.year}
      </p>

      <p className="mb-6">
        Total active employees: {result.totalEmployees}
      </p>

      {result.employees.map((employee) => (
        <div
          key={employee.id}
          className="mb-4 p-4 border rounded-lg bg-white shadow-sm"
        >
          <p>
            <strong>Nama:</strong> {employee.full_name}
          </p>

          <p>
            <strong>NIP:</strong> {employee.nip}
          </p>

          <p>
            <strong>Jabatan:</strong> {employee.positions?.name}
          </p>

          <p>
            <strong>Tanggal Masuk:</strong> {employee.hire_date}
          </p>

          <p>
            <strong>Masa Kerja:</strong> {employee.yearsOfService} tahun
          </p>
        </div>
      ))}
    </div>
  )
}

export default App