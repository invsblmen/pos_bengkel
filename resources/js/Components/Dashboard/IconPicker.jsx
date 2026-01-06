import React, { useState } from 'react';

const availableIcons = [
    { emoji: '🔧', name: 'Wrench' },
    { emoji: '🔩', name: 'Bolt' },
    { emoji: '⚙️', name: 'Gear' },
    { emoji: '🛠️', name: 'Tools' },
    { emoji: '🔨', name: 'Hammer' },
    { emoji: '🪛', name: 'Screwdriver' },
    { emoji: '⚡', name: 'Electric' },
    { emoji: '🔋', name: 'Battery' },
    { emoji: '💡', name: 'Bulb' },
    { emoji: '🛞', name: 'Wheel' },
    { emoji: '🚗', name: 'Car' },
    { emoji: '🏍️', name: 'Motorcycle' },
    { emoji: '🔌', name: 'Plug' },
    { emoji: '📦', name: 'Box' },
    { emoji: '🧰', name: 'Toolbox' },
    { emoji: '🪚', name: 'Saw' },
    { emoji: '🔪', name: 'Knife' },
    { emoji: '✂️', name: 'Scissors' },
    { emoji: '🖇️', name: 'Paperclip' },
    { emoji: '📌', name: 'Pin' },
    { emoji: '📍', name: 'Location' },
    { emoji: '🎨', name: 'Paint' },
    { emoji: '🖌️', name: 'Brush' },
    { emoji: '🧲', name: 'Magnet' },
    { emoji: '⛽', name: 'Fuel' },
    { emoji: '🛢️', name: 'Oil' },
    { emoji: '💧', name: 'Drop' },
    { emoji: '🔥', name: 'Fire' },
    { emoji: '❄️', name: 'Cold' },
    { emoji: '🌡️', name: 'Temperature' },
    { emoji: '📡', name: 'Antenna' },
    { emoji: '🎚️', name: 'Control' },
    { emoji: '🎛️', name: 'Panel' },
    { emoji: '⏱️', name: 'Timer' },
    { emoji: '⏰', name: 'Clock' },
    { emoji: '🔒', name: 'Lock' },
    { emoji: '🔓', name: 'Unlock' },
    { emoji: '🔑', name: 'Key' },
    { emoji: '🧪', name: 'Lab' },
    { emoji: '🧬', name: 'DNA' },
    { emoji: '💎', name: 'Gem' },
    { emoji: '🔮', name: 'Crystal' },
    { emoji: '🪙', name: 'Coin' },
    { emoji: '💰', name: 'Money' },
    { emoji: '🏆', name: 'Trophy' },
    { emoji: '🎯', name: 'Target' },
    { emoji: '📊', name: 'Chart' },
    { emoji: '📈', name: 'Graph' },
];

export default function IconPicker({ label, value, onChange, errors }) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (emoji) => {
        onChange(emoji);
        setIsOpen(false);
    };

    return (
        <div>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                >
                    <span className="flex items-center gap-3">
                        {value ? (
                            <>
                                <span className="text-3xl">{value}</span>
                                <span className="text-gray-700 dark:text-gray-300">Icon dipilih</span>
                            </>
                        ) : (
                            <span className="text-gray-500 dark:text-gray-400">Pilih icon...</span>
                        )}
                    </span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute z-20 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                            <div className="p-3">
                                <div className="grid grid-cols-8 gap-2">
                                    {availableIcons.map((icon, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handleSelect(icon.emoji)}
                                            className={`p-3 text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
                                                value === icon.emoji ? 'bg-indigo-100 dark:bg-indigo-900 ring-2 ring-indigo-500' : ''
                                            }`}
                                            title={icon.name}
                                        >
                                            {icon.emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {value && (
                                <div className="border-t border-gray-200 dark:border-gray-700 p-3">
                                    <button
                                        type="button"
                                        onClick={() => handleSelect('')}
                                        className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                                    >
                                        Hapus icon
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {errors && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors}</p>
            )}
        </div>
    );
}
