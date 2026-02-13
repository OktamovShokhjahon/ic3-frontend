 'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '../../lib/api';
import { useTranslations } from '../../i18n/TranslationsProvider';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';

interface User {
  id: string;
  username: string;
  role: string;
  levelAccess: {
    level1: boolean;
    level2: boolean;
    level3: boolean;
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t } = useTranslations();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get(`/auth/me`);
      setUser(response.data.user);
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post(`/auth/logout`, {});
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLevelSelect = (level: number) => {
    router.push(`/test/${level}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-white">{t('common.loading')}</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Image src="/logo.png" alt="IC3 Xorazm" width={36} height={36} className="rounded-full" />
              <h1 className="text-2xl font-bold text-gray-800">IC3 XORAZM</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <span className="text-gray-700">
                {t('dashboard.welcome', { name: user.username })}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                {t('common.logout')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            {t('dashboard.chooseLevel')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('dashboard.levelDescription')}
          </p>
        </div>

        {/* Level Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((level) => {
            const isAccessible = user.levelAccess[`level${level}` as keyof typeof user.levelAccess];
            const isLocked = !isAccessible;
            
            return (
              <div
                key={level}
                className={`relative bg-white rounded-2xl shadow-xl p-8 transition-all duration-300 ${
                  isLocked 
                    ? 'opacity-60 cursor-not-allowed' 
                    : 'hover:shadow-2xl hover:scale-105 cursor-pointer'
                }`}
                onClick={() => !isLocked && handleLevelSelect(level)}
              >
                {isLocked && (
                  <div className="absolute inset-0 bg-gray-900 bg-opacity-50 rounded-2xl flex items-center justify-center">
                    <div className="text-white text-center">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <p className="text-lg font-semibold">{t('dashboard.locked')}</p>
                      <p className="text-sm">{t('dashboard.contactAdminUnlock')}</p>
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    isLocked ? 'bg-gray-300' : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}>
                    <span className="text-3xl font-bold text-white">{level}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {t('dashboard.level', { number: level })}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {isLocked ? t('dashboard.accessRestricted') : t('dashboard.startTest')}
                  </p>
                  {!isLocked && (
                    <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition">
                      {t('dashboard.startTest')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Statistics Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            {t('dashboard.yourProgress')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
              <div className="text-gray-600">{t('dashboard.testsCompleted')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">0%</div>
              <div className="text-gray-600">{t('dashboard.averageScore')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
              <div className="text-gray-600">{t('dashboard.studyStreak')}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
