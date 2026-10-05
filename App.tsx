/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Heart,
  Clock,
  Calendar,
  BookOpen,
  Sparkles,
  Moon,
  Sun,
  Library,
} from 'lucide-react';
import { SplashScreen } from './components/SplashScreen';
import {
  MartyrsSection,
  AdminFooterControl,
} from './components/MartyrsSection';
import { ApkCloudGuideTrigger } from './components/ApkCloudGuideModal';
import { PrayerTimesSection } from './components/PrayerTimesSection';
import { QuranSection } from './components/QuranSection';
import { CalendarSection } from './components/CalendarSection';
import { MafatihSection } from './components/MafatihSection';
import { TaqeebatSection } from './components/TaqeebatSection';
import { CITIES, CityInfo } from './utils/prayerTimes';

type ActiveTab =
  | 'martyrs'
  | 'prayers'
  | 'quran'
  | 'mafatih'
  | 'calendar'
  | 'taqeebat';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  // Default to Prayer Times (مواقيت الصلاة) as the main home screen
  const [activeTab, setActiveTab] = useState<ActiveTab>('prayers');

  // Dark Mode state persisted in localStorage
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('noor_itrah_theme');
      return saved === 'dark';
    } catch {
      return false;
    }
  });

  // Selected Saudi City persisted in localStorage (defaults to Al-Madinah Al-Munawwarah)
  const [city, setCity] = useState<CityInfo>(() => {
    try {
      const saved = localStorage.getItem('noor_itrah_ksa_city');
      if (saved) {
        const parsed = JSON.parse(saved);
        const valid = CITIES.find((c) => c.id === parsed.id);
        if (valid) return valid;
      }
    } catch {
      // ignore
    }
    return CITIES[0]; // المدينة المنورة افتراضياً
  });

  // Hijri lunar sighting day offset (-2 to +2)
  const [hijriOffsetDays, setHijriOffsetDays] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('noor_itrah_hijri_offset');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Font size scale (1 to 5) for Quran, Mafatih & Taqeebat reading comfort
  const [fontSizeScale, setFontSizeScale] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('noor_itrah_fontsize');
      return saved ? parseInt(saved, 10) : 2;
    } catch {
      return 2;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('noor_itrah_theme', darkMode ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [darkMode]);

  const handleSelectCity = (newCity: CityInfo) => {
    setCity(newCity);
    try {
      localStorage.setItem('noor_itrah_ksa_city', JSON.stringify(newCity));
    } catch {
      // ignore
    }
  };

  const handleUpdateHijriOffset = (days: number) => {
    setHijriOffsetDays(days);
    try {
      localStorage.setItem('noor_itrah_hijri_offset', String(days));
    } catch {
      // ignore
    }
  };

  const updateFontScale = (next: number) => {
    const clamped = Math.max(1, Math.min(5, next));
    setFontSizeScale(clamped);
    try {
      localStorage.setItem('noor_itrah_fontsize', String(clamped));
    } catch {
      // ignore
    }
  };

  const navItems: {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'prayers', label: 'مواقيت الصلاة', icon: Clock },
    { id: 'quran', label: 'القرآن الكريم', icon: BookOpen },
    { id: 'mafatih', label: 'مفاتيح الجنان', icon: Library },
    { id: 'calendar', label: 'التقويم والمناسبات', icon: Calendar },
    { id: 'taqeebat', label: 'تعقيبات الصلوات', icon: Sparkles },
    { id: 'martyrs', label: 'روضة المتوفين', icon: Heart },
  ];

  return (
    <div className={darkMode ? 'dark' : ''}>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      <div className="min-h-screen bg-[#F9F6F0] dark:bg-[#0A0F0D] text-[#1C1917] dark:text-[#F5F2EB] flex flex-col pb-20 md:pb-10 transition-colors duration-200">
        {/* Top Bar Contract: Zone 1 (Single Brand Wordmark) — Zone 2 (Clean Nav Links) — Zone 3 (Theme Action) */}
        <header className="sticky top-0 z-30 h-14 md:h-16 bg-[#F9F6F0]/90 dark:bg-[#0A0F0D]/90 backdrop-blur-md border-b border-[#E5DEC9] dark:border-[#1E2D26] px-4 md:px-8 flex items-center justify-between">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('prayers');
            }}
            className="font-amiri text-2xl md:text-3xl font-bold tracking-tight text-[#0B3B24] dark:text-[#D4AF37]"
          >
            نور العترة
          </a>

          {/* Zone 2: Clean text navigation links on Desktop */}
          <nav
            className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-bold"
            aria-label="التنقل الرئيسي"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`py-1 transition-colors cursor-pointer whitespace-nowrap border-b-2 ${
                    isActive
                      ? 'text-[#0B3B24] dark:text-[#D4AF37] border-[#0B3B24] dark:border-[#D4AF37]'
                      : 'text-[#57534E] dark:text-[#A3B1AA] border-transparent hover:text-[#1C1917] dark:hover:text-[#F5F2EB]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Contextual Action (Dark/Light Mode Toggle) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#141F1A] border border-[#E5DEC9] dark:border-[#22332B] text-xs font-bold text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#B89038] transition-colors cursor-pointer whitespace-nowrap"
              aria-label={darkMode ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
            >
              {darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-[#D4AF37]" />
                  <span>الوضع النهاري</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#0B3B24]" />
                  <span>الوضع الليلي</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
          {activeTab === 'martyrs' && <MartyrsSection />}

          {activeTab === 'prayers' && (
            <PrayerTimesSection
              city={city}
              onSelectCity={handleSelectCity}
              hijriOffsetDays={hijriOffsetDays}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'quran' && (
            <QuranSection
              fontSizeScale={fontSizeScale}
              onIncreaseFont={() => updateFontScale(fontSizeScale + 1)}
              onDecreaseFont={() => updateFontScale(fontSizeScale - 1)}
              onResetFont={() => updateFontScale(2)}
            />
          )}

          {activeTab === 'mafatih' && (
            <MafatihSection
              fontSizeScale={fontSizeScale}
              onIncreaseFont={() => updateFontScale(fontSizeScale + 1)}
              onDecreaseFont={() => updateFontScale(fontSizeScale - 1)}
              onResetFont={() => updateFontScale(2)}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarSection
              hijriOffsetDays={hijriOffsetDays}
              onUpdateHijriOffset={handleUpdateHijriOffset}
            />
          )}

          {activeTab === 'taqeebat' && (
            <TaqeebatSection
              fontSizeScale={fontSizeScale}
              onIncreaseFont={() => updateFontScale(fontSizeScale + 1)}
              onDecreaseFont={() => updateFontScale(fontSizeScale - 1)}
            />
          )}
        </main>

        {/* Quiet Editorial Footer with Discreet Admin Login at the Very Bottom */}
        <footer className="mt-auto border-t border-[#E5DEC9] dark:border-[#1E2D26] py-6 px-4 md:px-8 text-center text-xs text-[#78716C] dark:text-[#8E9E96]">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-amiri text-sm text-[#0B3B24] dark:text-[#D4AF37]">
              نور العترة — مواقيت الصلاة · القرآن الكريم · مفاتيح الجنان · روضة المتوفين
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span>الفاتحة لأرواح المؤمنين والمؤمنات</span>
              <span aria-hidden="true">·</span>
              <ApkCloudGuideTrigger />
              <span aria-hidden="true">·</span>
              <AdminFooterControl />
            </div>
          </div>
        </footer>

        {/* Mobile Bottom Tab Bar */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-[#0D1512]/95 backdrop-blur-md border-t border-[#E5DEC9] dark:border-[#22332B] grid grid-cols-6 items-center px-1"
          aria-label="شريط التنقل السفلي"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`min-h-[44px] flex flex-col items-center justify-center rounded-xl transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#0B3B24] dark:text-[#D4AF37] font-bold'
                    : 'text-[#57534E] dark:text-[#A3B1AA]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px] mt-1 whitespace-nowrap truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
