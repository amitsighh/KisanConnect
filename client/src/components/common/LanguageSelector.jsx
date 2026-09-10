import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const LanguageSelector = ({ variant = 'default' }) => {
  const { currentLanguage, currentLanguageObj, languages, changeLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition border shadow-xs ${
          variant === 'card'
            ? 'bg-emerald-700 text-white border-emerald-500 hover:bg-emerald-600'
            : 'bg-slate-100 hover:bg-emerald-50 text-slate-800 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
        }`}
        title="Change Application Language"
      >
        <span className="flex items-center gap-1.5">
          <Globe size={15} className="text-emerald-600 shrink-0" />
          <span>{currentLanguageObj.flag}</span>
          <span className="font-extrabold">{currentLanguageObj.nativeName}</span>
        </span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden text-xs py-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100 font-extrabold text-[10px] uppercase text-slate-400 tracking-wider flex items-center justify-between">
            <span>🌐 {t('selectLanguage', 'Select Language')}</span>
            <span className="text-emerald-600">8 Languages</span>
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {languages.map((lang) => {
              const isSelected = lang.code === currentLanguage;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full text-left px-3.5 py-2 font-medium flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-800 font-extrabold'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{lang.flag}</span>
                    <span className="font-bold text-slate-900">{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({lang.name})</span>
                  </span>
                  {isSelected && <Check size={14} className="text-emerald-600 font-bold" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default LanguageSelector;
