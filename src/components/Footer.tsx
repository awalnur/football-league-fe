import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">⚽</span>
              </div>
              <div>
                <div className="text-white font-bold">Delameta e-Football</div>
                <div className="text-slate-400 text-xs">Liga Management</div>
              </div>
            </div>
            <p className="text-slate-400 text-sm">
              Platform manajemen liga sepakbola dan eFootball yang lengkap. 
              Kelola turnamen, jadwal pertandingan, dan klasemen dengan mudah.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Menu Utama</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-slate-400 hover:text-white transition-colors">
                  🏠 Home
                </Link>
              </li>
              <li>
                <Link href="/standings" className="text-slate-400 hover:text-white transition-colors">
                  📊 Klasemen
                </Link>
              </li>
              <li>
                <Link href="/matches" className="text-slate-400 hover:text-white transition-colors">
                  ⚽ Pertandingan
                </Link>
              </li>
              <li>
                <Link href="/schedule" className="text-slate-400 hover:text-white transition-colors">
                  📅 Jadwal
                </Link>
              </li>
              <li>
                <Link href="/teams" className="text-slate-400 hover:text-white transition-colors">
                  🛡️ Tim
                </Link>
              </li>
            </ul>
          </div>

          {/* About Section */}
          <div>
            <h3 className="text-white font-semibold mb-4">Tentang Sistem</h3>
            <p className="text-slate-400 text-sm mb-4">
              Sistem ini dirancang untuk memudahkan pengelolaan kompetisi sepakbola dan eFootball dengan fitur:
            </p>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Manajemen klasemen otomatis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Jadwal pertandingan terpadu</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Statistik tim & pemain</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>Sistem turnamen Cup</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <p>
            © {currentYear} Delameta e-Football. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-white transition-colors">
              Admin Panel
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
