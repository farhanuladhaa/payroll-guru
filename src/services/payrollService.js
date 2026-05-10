// src/services/payrollService.js

import { supabase } from '../lib/supabase'
import { calculateYearsOfService } from '../utils/calculateYearsOfService'

/**
 * Menghitung payroll untuk periode tertentu.
 * Versi ini:
 * 1. Mengambil seluruh employee aktif
 * 2. Menghitung masa kerja (years of service)
 * 3. Mengembalikan data yang sudah diperkaya
 */
export async function calculatePayroll(year, month) {
  try {
    // Ambil seluruh employee aktif beserta data position
    const { data: employees, error } = await supabase
      .from('employees')
      .select(`
        *,
        positions (
          id,
          name
        )
      `)
      .eq('is_active', true)

    if (error) {
      throw error
    }

    // Tambahkan hasil perhitungan masa kerja ke setiap employee
    const employeesWithTenure = employees.map((employee) => ({
      ...employee,
      yearsOfService: calculateYearsOfService(
        employee.hire_date,
        year,
        month
      ),
    }))

    // Kembalikan hasil
    return {
      success: true,
      year,
      month,
      totalEmployees: employeesWithTenure.length,
      employees: employeesWithTenure,
    }
  } catch (error) {
    console.error('Error calculating payroll:', error)

    return {
      success: false,
      message: error.message,
    }
  }
}