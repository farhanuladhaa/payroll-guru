import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

function RekapGaji() {
  const { id } = useParams()
  const [runData, setRunData] = useState(null)
  const [slips, setSlips] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalNominal, setTotalNominal] = useState(0)

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    try {
      setLoading(true)
      
      // Ambil data Master
      const { data: run } = await supabase.from('payroll_runs').select('*').eq('id', id).single()
      setRunData(run)

      // Ambil data slips join ke employees (pastikan ada bank_name dan account_number di database)
      const { data: slipData } = await supabase
        .from('payroll_slips')
        .select('*, employees(full_name, position_name, category, bank_name, account_number)')
        .eq('run_id', id)
      
      // Mengurutkan berdasarkan Kategori, lalu Nama (Biar warnanya mengelompok rapi)
      const sortedSlips = (slipData || []).sort((a, b) => {
        const catA = a.employees?.category || ''
        const catB = b.employees?.category || ''
        if (catA < catB) return -1
        if (catA > catB) return 1
        return (a.employees?.full_name || '').localeCompare(b.employees?.full_name || '')
      })
      
      setSlips(sortedSlips)
      
      // Hitung Total Gaji
      const total = sortedSlips.reduce((sum, slip) => sum + Number(slip.net_salary), 0)
      setTotalNominal(total)

    } catch (error) {
      alert('Gagal memuat rekapitulasi')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (val) => 'Rp ' + Number(val || 0).toLocaleString('id-ID')
  const getMonthName = (m) => ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][m - 1]

  // Fungsi untuk memberi warna baris seperti di Excel
  const getRowColor = (category) => {
    const cat = (category || '').toLowerCase()
    if (cat.includes('ummi')) return 'bg-yellow-100/50 print:bg-yellow-100/50' // Kuning
    if (cat.includes('staff') || cat.includes('satpam') || cat.includes('kebersihan')) return 'bg-blue-100/50 print:bg-blue-100/50' // Biru
    return 'bg-green-100/50 print:bg-green-100/50' // Hijau (Default untuk Guru/Wali Kelas)
  }

  if (loading) return <div className="p-10 text-center">Memuat rekapitulasi...</div>
  if (!runData) return <div className="p-10 text-center">Data tidak ditemukan!</div>

  return (
    <div className="bg-gray-100 min-h-screen py-8 print:py-0 print:bg-white">
      
      {/* KONTROL CETAK (Sembunyi saat print) */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center print:hidden px-4">
        <Link to={`/payroll-history/${id}`} className="text-black hover:underline font-bold">
          ← Kembali ke Detail
        </Link>
        <button 
          onClick={() => window.print()}
          className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-emerald-700 flex items-center gap-2"
        >
          🖨️ Cetak Rekapitulasi (Ctrl+P)
        </button>
      </div>

      {/* KERTAS CETAK */}
      <div className="max-w-5xl mx-auto bg-white p-8 sm:p-12 shadow-xl print:shadow-none print:p-0 print:m-0">
        
        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="font-bold text-xl uppercase tracking-wide">REKAPITULASI GAJI</h1>
          <h2 className="font-bold text-lg uppercase tracking-wide">MI KRESNA MLILIR</h2>
          <p className="font-semibold text-md">{getMonthName(runData.payroll_month)} {runData.payroll_year}</p>
        </div>

        {/* TABEL REKAP */}
        <table className="w-full border-collapse border-2 border-black text-sm">
          <thead>
            <tr className="bg-gray-100 uppercase font-bold text-center border-b-2 border-black">
              <th className="border border-black py-2 w-10">NO</th>
              <th className="border border-black py-2">NAMA</th>
              <th className="border border-black py-2 w-40">KETERANGAN</th>
              <th className="border border-black py-2 w-36">NOMINAL</th>
              <th className="border border-black py-2 w-28">BANK</th>
              <th className="border border-black py-2 w-40">NOREK</th>
            </tr>
          </thead>
          <tbody>
            {slips.map((slip, index) => {
              const emp = slip.employees || {}
              return (
                <tr key={slip.id} className={`${getRowColor(emp.category)} print:color-adjust-exact`}>
                  <td className="border border-black text-center py-1">{index + 1}</td>
                  <td className="border border-black px-2 font-semibold">{emp.full_name}</td>
                  <td className="border border-black px-2 text-center">{emp.position_name || emp.category || '-'}</td>
                  <td className="border border-black px-2 text-right">{formatCurrency(slip.net_salary)}</td>
                  
                  {/* Kolom Bank & Rekening */}
                  <td className="border border-black px-2 text-center uppercase">{emp.bank_name || '-'}</td>
                  <td className="border border-black px-2 text-center font-mono">
                    {emp.account_number ? emp.account_number : <span className="italic text-gray-500">Belum Punya</span>}
                  </td>
                </tr>
              )
            })}
            
            {/* BARIS TOTAL */}
            <tr className="font-black text-base bg-gray-100 print:bg-gray-100 print:color-adjust-exact border-t-2 border-black">
              <td colSpan="3" className="border border-black text-center py-3">TOTAL KESELURUHAN</td>
              <td className="border border-black px-2 text-right">{formatCurrency(totalNominal)}</td>
              <td colSpan="2" className="border border-black bg-gray-300"></td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  )
}

export default RekapGaji