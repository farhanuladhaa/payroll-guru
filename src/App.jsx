import { formatCurrency } from './utils/formatCurrency'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-10 text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          Sistem Penggajian Guru
        </h1>

        <p className="text-gray-600 mb-6">
          Utility format Rupiah berhasil berjalan 🚀
        </p>

        <div className="bg-blue-50 rounded-xl p-6">
          <p className="text-sm text-gray-500 mb-2">
            Contoh Total Gaji:
          </p>
          <h2 className="text-3xl font-bold text-green-600">
            {formatCurrency(7250000)}
          </h2>
        </div>
      </div>
    </div>
  )
}

export default App