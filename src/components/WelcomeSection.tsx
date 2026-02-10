export default function WelcomeSection() {
  return (
    <div className="bg-gradient-to-r from-indigo-900/30 via-purple-900/30 to-pink-900/30 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 mb-8">
      <div className="max-w-4xl">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
            <span className="text-2xl sm:text-3xl">👋</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Selamat Datang di Delameta e-Football
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Platform manajemen liga sepakbola dan eFootball yang mudah digunakan
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-slate-300 leading-relaxed">
            Sistem ini dirancang untuk membantu Anda mengelola dan memantau kompetisi sepakbola dengan mudah. 
            Dari klasemen hingga jadwal pertandingan, semua informasi tersedia dalam satu platform.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
            <div className="flex items-start gap-3 bg-slate-800/50 rounded-lg p-4">
              <span className="text-2xl shrink-0">📊</span>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Klasemen Real-time</h3>
                <p className="text-slate-400 text-xs">Pantau posisi tim dan statistik lengkap secara langsung</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-800/50 rounded-lg p-4">
              <span className="text-2xl shrink-0">⚽</span>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Hasil Pertandingan</h3>
                <p className="text-slate-400 text-xs">Lihat skor, statistik, dan foto-foto pertandingan</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-800/50 rounded-lg p-4">
              <span className="text-2xl shrink-0">📅</span>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Jadwal Lengkap</h3>
                <p className="text-slate-400 text-xs">Cek jadwal pertandingan mendatang dengan mudah</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-800/50 rounded-lg p-4">
              <span className="text-2xl shrink-0">🏆</span>
              <div>
                <h3 className="text-white font-semibold text-sm mb-1">Sistem Turnamen</h3>
                <p className="text-slate-400 text-xs">Dukungan format liga dan cup/knockout</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-700/50">
            <p className="text-slate-400 text-xs sm:text-sm">
              💡 <strong className="text-slate-300">Tips:</strong> Gunakan menu navigasi di atas untuk menjelajahi berbagai fitur. 
              Klik pada liga untuk melihat detail klasemen dan pertandingan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
