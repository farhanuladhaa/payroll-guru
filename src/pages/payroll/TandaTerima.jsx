import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

function TandaTerima() {
  const { id } = useParams()
  const [runData, setRunData] = useState(null)
  const [slips, setSlips] = useState([])
  const [loading, setLoading] = useState(true)

  // State untuk nama penandatangan yang bisa diedit (Default-nya adalah nama saat ini)
  const [kepsek, setKepsek] = useState("RINA ISROKHANI, S.Pd.I")
  const [keuangan, setKeuangan] = useState("DENA ARYANI, SE")

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    try {
      setLoading(true)
      const { data: run } = await supabase.from('payroll_runs').select('*').eq('id', id).single()
      setRunData(run)

      const { data: slipData } = await supabase
        .from('payroll_slips')
        .select('*, employees(full_name)')
        .eq('run_id', id)
      
      const sortedSlips = (slipData || []).sort((a, b) => 
        (a.employees?.full_name || '').localeCompare(b.employees?.full_name || '')
      )
      
      setSlips(sortedSlips)
    } catch (error) {
      alert('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const halfLength = Math.ceil(slips.length / 2)
  const leftCol = slips.slice(0, halfLength)
  const rightCol = slips.slice(halfLength)

  const getMonthName = (m) => ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][m - 1]

  if (loading) return <div className="p-10 text-center">Memuat daftar tanda terima...</div>
  if (!runData) return <div className="p-10 text-center">Data tidak ditemukan!</div>

  return (
    <div className="bg-gray-100 min-h-screen py-8 print:py-0 print:bg-white">
      
      {/* KONTROL PENGATURAN CETAK (HANYA MUNCUL DI LAYAR) */}
      <div className="max-w-5xl mx-auto mb-6 bg-white p-6 rounded-xl shadow-md border border-blue-100 print:hidden">
        <div className="flex justify-between items-center mb-4">
          <Link to={`/payroll-history/${id}`} className="text-black hover:underline font-bold">
            ← Kembali ke Detail
          </Link>
          <button 
            onClick={() => window.print()}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-indigo-700 flex items-center gap-2"
          >
            🖨️ Cetak Dokumen (Ctrl+P)
          </button>
        </div>

        {/* Area Input Nama Penandatangan */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h3 className="text-sm font-bold text-black mb-3">Pengaturan Penandatangan (Bisa Diubah)</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Kepala Madrasah</label>
              <input 
                type="text" 
                value={kepsek} 
                onChange={(e) => setKepsek(e.target.value.toUpperCase())}
                className="w-full border-gray-300 rounded p-2 text-sm uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nama Bag. Keuangan</label>
              <input 
                type="text" 
                value={keuangan} 
                onChange={(e) => setKeuangan(e.target.value.toUpperCase())}
                className="w-full border-gray-300 rounded p-2 text-sm uppercase"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2 italic">*Nama di atas akan langsung tercetak di bagian bawah dokumen.</p>
        </div>
      </div>

      {/* KERTAS A4 YANG AKAN DICETAK */}
      <div className="max-w-5xl mx-auto bg-white p-8 sm:p-12 shadow-xl print:shadow-none print:p-0 print:m-0">
        
        {/* HEADER */}
        <div className="text-center mb-6">
          <h1 className="font-bold text-lg uppercase tracking-wide">Daftar Tanda Terima Gaji</h1>
          <h2 className="font-bold text-lg uppercase tracking-wide">MI Kresna Mlilir</h2>
          <p className="font-semibold text-md">{getMonthName(runData.payroll_month)} {runData.payroll_year}</p>
        </div>

        {/* TABEL DUA KOLOM */}
        <table className="w-full border-collapse border-2 border-black text-sm">
          <thead>
            <tr className="bg-gray-50 uppercase font-bold text-center">
              <th className="border-2 border-black py-2 w-8">NO</th>
              <th className="border-2 border-black py-2">NAMA</th>
              <th className="border-2 border-black py-2 w-28">Tanda Tangan</th>
              <th className="border-2 border-black py-2 w-8">NO</th>
              <th className="border-2 border-black py-2">NAMA</th>
              <th className="border-2 border-black py-2 w-28">Tanda Tangan</th>
            </tr>
          </thead>
          <tbody>
            {leftCol.map((slipLeft, index) => {
              const numLeft = index + 1;
              const slipRight = rightCol[index];
              const numRight = index + 1 + halfLength;

              return (
                <tr key={index}>
                  {/* KOLOM KIRI */}
                  <td className="border border-black text-center py-1">{numLeft}</td>
                  <td className="border border-black px-2">{slipLeft.employees?.full_name}</td>
                  <td className="border border-black relative h-10">
                    <span className={`absolute text-xs font-semibold ${numLeft % 2 !== 0 ? 'top-1 left-2' : 'top-4 left-10'}`}>
                      {numLeft}
                    </span>
                  </td>

                  {/* KOLOM KANAN (Bisa kosong jika ganjil) */}
                  <td className="border border-black text-center py-1">{slipRight ? numRight : ''}</td>
                  <td className="border border-black px-2">{slipRight ? slipRight.employees?.full_name : ''}</td>
                  <td className="border border-black relative h-10">
                    {slipRight && (
                      <span className={`absolute text-xs font-semibold ${numRight % 2 !== 0 ? 'top-1 left-2' : 'top-4 left-10'}`}>
                        {numRight}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* BAGIAN TANDA TANGAN DINAMIS */}
        <div className="mt-12 flex justify-between px-10 text-center font-bold text-sm">
          <div>
            <p className="mb-20">KEPALA MADRASAH</p>
            {/* Menggunakan state kepsek */}
            <p className="underline underline-offset-4">{kepsek || "________________________"}</p>
          </div>
          <div>
            <p className="mb-20">BAG. KEUANGAN MADRASAH</p>
            {/* Menggunakan state keuangan */}
            <p className="underline underline-offset-4">{keuangan || "________________________"}</p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default TandaTerima