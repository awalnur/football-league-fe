'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

/**
 * Legacy route handler for /cup?league={id}
 * Redirects to new cleaner route /cup/{id}
 */
function CupRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const leagueId = searchParams.get('league');

  useEffect(() => {
    if (leagueId) {
      // Redirect to new route
      router.replace(`/cup/${leagueId}`);
    } else {
      // No league ID provided, go to standings
      router.replace('/standings');
    }
  }, [leagueId, router]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Navigation />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <p className="text-slate-400 text-lg">Redirecting...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function CupLegacyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            </div>
            <p className="text-slate-400 text-lg">Redirecting...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <CupRedirect />
    </Suspense>
  );
}

