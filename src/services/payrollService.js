import { supabase } from '../lib/supabase'
import { calculateYearsOfService } from '../utils/calculateYearsOfService'

export async function calculatePayroll(year, month) {
  try {
    // 1. Ambil seluruh employee aktif beserta posisi
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select(`
        *,
        positions (
          id,
          name
        )
      `)
      .eq('is_active', true)

    if (employeesError) throw employeesError

    const payrollResults = []

    // 2. Proses satu per satu
    for (const employee of employees) {
      // Hitung masa kerja
      const yearsOfService = calculateYearsOfService(
        employee.hire_date,
        year,
        month
      )

      // 3. Cari salary rule yang sesuai
      const { data: salaryRule, error: salaryRuleError } = await supabase
        .from('salary_rules')
        .select('*')
        .eq('position_id', employee.position_id)
        .eq('is_active', true)
        .lte('min_years', yearsOfService)
        .or(`max_years.is.null,max_years.gte.${yearsOfService}`)
        .order('min_years', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (salaryRuleError) throw salaryRuleError

      // Jika rule tidak ditemukan, skip employee ini
      if (!salaryRule) {
        payrollResults.push({
          ...employee,
          yearsOfService,
          error: 'Salary rule not found',
        })
        continue
      }

      // 4. Ambil attendance bulan tersebut
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('payroll_year', year)
        .eq('payroll_month', month)
        .maybeSingle()

      if (attendanceError) throw attendanceError

      const daysPresent = attendance?.days_present ?? 0

      // 5. Hitung komponen payroll
      const baseSalary = Number(salaryRule.base_salary)
      const allowance = Number(salaryRule.allowance)
      const attendanceRate = Number(salaryRule.attendance_rate)

      const attendanceAmount = attendanceRate * daysPresent
      const deductions = 0

      const totalSalary =
        baseSalary +
        allowance +
        attendanceAmount -
        deductions

      // 6. Simpan hasil
      payrollResults.push({
        ...employee,
        yearsOfService,
        salaryRule,
        daysPresent,
        baseSalary,
        allowance,
        attendanceRate,
        attendanceAmount,
        deductions,
        totalSalary,
      })
    }

    return {
      success: true,
      year,
      month,
      totalEmployees: payrollResults.length,
      employees: payrollResults,
    }
  } catch (error) {
    console.error('Error calculating payroll:', error)

    return {
      success: false,
      message: error.message,
    }
  }
}