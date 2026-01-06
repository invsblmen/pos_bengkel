import React, { useState, useRef, useEffect } from 'react';
import { IconSearch, IconX } from '@tabler/icons-react';

export default function PartAutocomplete({ parts, value, onChange, placeholder = "Cari sparepart...", error }) {
    const [query, setQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedPart, setSelectedPart] = useState(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (value && parts) {
            const part = parts.find(p => p.id === value);
            if (part) {
                setSelectedPart(part);
                setQuery(part.name);
            }
        }
    }, [value, parts]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredParts = parts?.filter(part =>
        part.name.toLowerCase().includes(query.toLowerCase()) ||
        (part.sku && part.sku.toLowerCase().includes(query.toLowerCase()))
    ) || [];

    const handleSelect = (part) => {
        setSelectedPart(part);
        setQuery(part.name);
        onChange(part.id);
        setShowDropdown(false);
    };

    const handleClear = () => {
        setSelectedPart(null);
        setQuery('');
        onChange('');
        setShowDropdown(false);
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        setShowDropdown(true);
        if (!val) {
            setSelectedPart(null);
            onChange('');
        }
    };

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setShowDropdown(true)}
                    placeholder={placeholder}
                    className={`w-full h-11 pl-10 pr-10 rounded-xl border ${error ? 'border-red-500' : 'border-slate-200'} focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-colors`}
                />
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        <IconX size={18} />
                    </button>
                )}
            </div>

            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

            {showDropdown && filteredParts.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    {filteredParts.map((part) => (
                        <button
                            key={part.id}
                            type="button"
                            onClick={() => handleSelect(part)}
                            className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                        >
                            <div className="font-medium text-slate-800">{part.name}</div>
                            <div className="text-xs text-slate-500 flex gap-3 mt-0.5">
                                {part.sku && <span>SKU: {part.sku}</span>}
                                <span>Stock: {part.stock}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {showDropdown && query && filteredParts.length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center text-sm text-slate-500">
                    Tidak ada sparepart ditemukan
                </div>
            )}
        </div>
    );
}
