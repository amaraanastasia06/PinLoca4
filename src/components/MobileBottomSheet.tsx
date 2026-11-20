import { ChevronDown, ChevronUp } from 'lucide-react';
import { ReactNode, useRef, useState } from 'react';
import { TRANSLATIONS } from '../i18n';
import { Language } from '../types';

interface MobileBottomSheetProps {
  lang: Language;
  headerTitle: string;
  children: ReactNode;
}

type SnapState = 'peek' | 'half' | 'full';

export function MobileBottomSheet({
  lang,
  headerTitle,
  children,
}: MobileBottomSheetProps) {
  const t = TRANSLATIONS[lang];
  const [snap, setSnap] = useState<SnapState>('peek');
  const dragStartY = useRef<number | null>(null);

  const cycleSnap = () => {
    setSnap((prev) => (prev === 'peek' ? 'half' : prev === 'half' ? 'full' : 'peek'));
  };

  const handleTouchStart = (y: number) => {
    dragStartY.current = y;
  };

  const handleTouchEnd = (y: number) => {
    if (dragStartY.current === null) return;
    const delta = dragStartY.current - y; // positive = dragged up
    dragStartY.current = null;
    if (Math.abs(delta) < 24) return;
    if (delta > 0) {
      setSnap((prev) => (prev === 'peek' ? 'half' : 'full'));
    } else {
      setSnap((prev) => (prev === 'full' ? 'half' : 'peek'));
    }
  };

  const heightClass =
    snap === 'peek'
      ? 'h-[82px]'
      : snap === 'half'
      ? 'h-[52vh]'
      : 'h-[calc(100vh-7.5rem)]';

  return (
    <section
      aria-label={headerTitle}
      className={`lg:hidden fixed left-0 right-0 bottom-14 z-30 bg-[#FAFAF7] rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-gray-200/90 flex flex-col transition-[height] duration-200 ease-out ${heightClass}`}
    >
      {/* Drag Handle & Summary Header */}
      <div
        onTouchStart={(e) => handleTouchStart(e.touches[0].clientY)}
        onTouchEnd={(e) => handleTouchEnd(e.changedTouches[0].clientY)}
        onClick={cycleSnap}
        className="px-4 pt-2.5 pb-3 bg-white rounded-t-3xl border-b border-gray-100 shrink-0 cursor-pointer select-none"
      >
        <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-2" />
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-extrabold text-[#1F2937] tabular-nums">{headerTitle}</p>
            {snap === 'peek' && (
              <p className="text-[11px] text-gray-500">{t.tapToExpand}</p>
            )}
          </div>
          <span className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
            {snap === 'full' ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </span>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto pinloca-scroll p-4 space-y-3">
        {children}
      </div>
    </section>
  );
}
