
import React, { useState, useEffect, useRef } from 'react';
import { Loader2 as LoaderIcon, ChevronDown, Search } from 'lucide-react';
import { getTranslation } from '../translations';
import { Language } from '../types';

export const Loader2: React.FC<{className?: string, size?: number}> = ({className, size = 24}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-loader-2 ${className}`}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export const SectionSkeleton = ({ title, height = "h-48" }: { title: string, height?: string }) => (
  <div className={`bg-white rounded-3xl border border-gray-100 p-6 shadow-sm animate-pulse-slow ${height}`}>
    <div className="h-4 w-32 bg-gray-100 rounded-md mb-6"></div>
    <div className="space-y-3">
      <div className="h-2 w-full bg-gray-50 rounded"></div>
      <div className="h-2 w-5/6 bg-gray-50 rounded"></div>
      <div className="h-2 w-4/6 bg-gray-50 rounded"></div>
    </div>
    <div className="mt-8 flex justify-center">
      <Loader2 className="animate-spin text-gray-200" size={16} />
    </div>
  </div>
);

export const COUNTRIES = [
    "United States", "United Kingdom", "Canada", "Australia", "Brazil", "Portugal", "Germany", "France", "Spain", "Italy", 
    "India", "Japan", "China", "Mexico", "Indonesia", "Netherlands", "Saudi Arabia", "Turkey", "Switzerland", "Poland", 
    "Argentina", "Belgium", "Sweden", "Ireland", "Thailand", "Austria", "Norway", "United Arab Emirates", "Israel", 
    "South Africa", "Singapore", "Malaysia", "Vietnam", "Philippines", "Colombia", "Chile", "Denmark", "Finland", 
    "Czech Republic", "Romania", "New Zealand", "Global"
];

export const SearchableCountrySelect: React.FC<{ value: string; onChange: (val: string) => void; language: Language }> = ({ value, onChange, language }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);
    const t = getTranslation(language);

    useEffect(() => { 
        function handleClickOutside(event: MouseEvent) { 
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) { 
                setIsOpen(false); 
            } 
        } 
        document.addEventListener("mousedown", handleClickOutside); 
        return () => document.removeEventListener("mousedown", handleClickOutside); 
    }, []);

    const filteredCountries = COUNTRIES.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return (
        <div className="relative" ref={wrapperRef}>
            <div className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-sm flex items-center justify-between cursor-pointer focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all hover:border-gray-300 shadow-sm" onClick={() => { setIsOpen(!isOpen); setSearchTerm(""); }}>
                <span className={`font-medium ${value ? "text-gray-900" : "text-gray-400"}`}>{value || t.common.selectCountry}</span>
                <ChevronDown size={16} className="text-gray-400" />
            </div>
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-hidden flex flex-col animate-fade-in">
                    <div className="p-2 border-b border-gray-100 bg-gray-50">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-3 text-gray-400" />
                            <input autoFocus type="text" className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 placeholder-gray-400" placeholder={t.common.search} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {filteredCountries.length > 0 ? (filteredCountries.map(country => (
                            <div key={country} className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-indigo-50 transition-colors ${value === country ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700'}`} onClick={() => { onChange(country); setIsOpen(false); }}>{country}</div>
                        ))) : (<div className="px-4 py-3 text-xs text-gray-400 text-center">{t.common.noResults}</div>)}
                    </div>
                </div>
            )}
        </div>
    );
};
