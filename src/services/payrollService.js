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

export async function processPayroll(year, month) {
  try {
    // 1. Hitung payroll terlebih dahulu
    const calculation = await calculatePayroll(year, month)

    if (!calculation.success) {
      throw new Error(calculation.message)
    }

    // 2. Cek apakah payroll periode ini sudah ada
    const { data: existingPayroll } = await supabase
      .from('payroll')
      .select('id')
      .eq('payroll_year', year)
      .eq('payroll_month', month)
      .maybeSingle()

    if (existingPayroll) {
      throw new Error(
        `Payroll for ${month}/${year} already exists`
      )
    }

    // 3. Buat header payroll
    const { data: payrollHeader, error: payrollError } =
      await supabase
        .from('payroll')
        .insert({
          payroll_year: year,
          payroll_month: month,
          status: 'draft',
        })
        .select()
        .single()

    if (payrollError) throw payrollError

    // 4. Siapkan detail payroll
    const details = calculation.employees
      .filter((employee) => !employee.error)
      .map((employee) => ({
        payroll_id: payrollHeader.id,
        employee_id: employee.id,

        employee_name: employee.full_name,
        employee_nip: employee.nip,
        position_name: employee.positions?.name || '',

        years_of_service: employee.yearsOfService,
        days_present: employee.daysPresent,

        base_salary: employee.baseSalary,
        allowance: employee.allowance,
        attendance_rate: employee.attendanceRate,
        attendance_amount: employee.attendanceAmount,

        deductions: employee.deductions,
        total_salary: employee.totalSalary,
      }))

    // 5. Insert semua detail sekaligus
    const { error: detailsError } = await supabase
      .from('payroll_details')
      .insert(details)

    if (detailsError) throw detailsError

    // 6. Return hasil
    return {
      success: true,
      payrollId: payrollHeader.id,
      totalProcessed: details.length,
      message: `Payroll ${month}/${year} processed successfully`,
    }
  } catch (error) {
    console.error('Error processing payroll:', error)

    return {
      success: false,
      message: error.message,
    }
  }
}