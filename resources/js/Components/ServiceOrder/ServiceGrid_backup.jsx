import React, { useState } from 'react';
import { IconPlus, IconTools, IconTrash } from '@tabler/icons-react';
import Autocomplete from '@/Components/Dashboard/Autocomplete';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

const getPartStock = (part) => {
    return part.stock ?? part.qty ?? 0;
};

export default function ServiceGrid({ 
    services, 
    parts, 
    onAddServiceWithParts,
    onQuickCreatePart 
}) {
    const [selectedService, setSelectedService] = useState(null);
    const [serviceParts, setServiceParts] = useState([]);

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        setServiceParts([]);
    };

    const handleAddPart = () => {
        setServiceParts([...serviceParts, { part_id: '', qty: 1, price: 0 }]);
    };

    const handleRemovePart = (index) => {
        setServiceParts(serviceParts.filter((_, i) => i !== index));
    };

    const handlePartChange = (index, field, value) => {
        const newParts = [...serviceParts];
        if (field === 'part_id') {
            const part = parts.find((p) => p.id === parseInt(value));
            // Prevent selection if stock is 0
            if (!part || getPartStock(part) === 0) {
                return;
            }
            if (part) {
                newParts[index].part_id = value;
                newParts[index].price = part.sell_price;
            }
        } else {
            newParts[index][field] = field === 'qty' ? parseInt(value) || 1 : parseFloat(value) || 0;
        }
        setServiceParts(newParts);
    };

    const handleAddToOrder = () => {
        if (!selectedService) return;
        onAddServiceWithParts(selectedService, serviceParts);
        setSelectedService(null);
        setServiceParts([]);
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950">
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Buat Pesanan Service
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Pilih layanan dan tambahkan sparepart
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Service Selection */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        Pilih Layanan Service
                    </label>
                    <Autocomplete
                        value={selectedService?.id || ''}
                        onChange={(serviceId) => {
                            const service = services.find(s => s.id === parseInt(serviceId));
                            handleServiceSelect(service);
                        }}
                        options={services}
                        displayField={(s) => `${s.title} - ${formatCurrency(s.price)}`}
                        searchFields={['title', 'description']}
                        placeholder="Cari layanan..."
                    />
                    
                    {selectedService && (
                        <div className="mt-3 p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center flex-shrink-0">
                                    <IconTools size={20} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                                        {selectedService.title}
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                        {selectedService.description || 'Layanan service'}
                                    </p>
                                    <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-2">
                                        {formatCurrency(selectedService.price)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Parts Section */}
                {selectedService && (
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                                Sparepart (Opsional)
                            </label>
                            <button
                                type="button"
                                onClick={handleAddPart}
                                className="inline-flex items-center gap-1 rounded-lg bg-primary-100 px-3 py-1.5 text-xs font-medium text-primary-700 transition hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-300"
                            >
                                <IconPlus size={14} />
                                Tambah Part
                            </button>
                        </div>

                        {serviceParts.length > 0 ? (
                            <div className="space-y-3">
                                {serviceParts.map((part, index) => (
                                    <div
                                        key={index}
                                        className="grid gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800 md:grid-cols-12"
                                    >
                                        <div className="md:col-span-6">
                                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Part
                                            </label>
                                            <Autocomplete
                                                value={part.part_id}
                                                onChange={(partId) => handlePartChange(index, 'part_id', partId)}
                                                options={parts}
                                                displayField={(p) => `${p.name} - ${formatCurrency(p.sell_price)}`}
                                                searchFields={['name', 'sku']}
                                                placeholder="Pilih part..."
                                                onCreateNew={() => onQuickCreatePart(index)}
                                                createLabel="Tambah Part"
                                                getOptionDisabled={(p) => getPartStock(p) === 0}
                                                renderOption={(p, isDisabled) => {
                                                    const stock = getPartStock(p);
                                                    return (
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className={isDisabled ? 'text-gray-400 dark:text-gray-500' : ''}>
                                                                {p.name} - {formatCurrency(p.sell_price)}
                                                            </span>
                                                            {stock === 0 && (
                                                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                                    Stok Habis
                                                                </span>
                                                            )}
                                                        </div>
                                                    );
                                                }}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Qty
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={part.qty}
                                                    onChange={(e) => handlePartChange(index, 'qty', e.target.value)}
                                                    className="block w-full h-10 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900 transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                                />
                                                {part.part_id && (
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500 dark:text-slate-400">
                                                        {(() => {
                                                            const selectedPart = parts.find(p => p.id === parseInt(part.part_id));
                                                            return selectedPart ? `(${getPartStock(selectedPart)} ada)` : '';
                                                        })()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                                Harga
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={part.price}
                                                onChange={(e) => handlePartChange(index, 'price', e.target.value)}
                                                className="block w-full h-10 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900 transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                            />
                                        </div>
                                        <div className="flex items-end md:col-span-1">
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePart(index)}
                                                className="w-full h-10 rounded-lg bg-red-100 text-red-700 transition hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center"
                                            >
                                                <IconTrash size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-3">
                                Tidak ada sparepart. Klik "Tambah Part" untuk menambahkan.
                            </p>
                        )}
                    </div>
                )}

                {/* Add to Order Button */}
                {selectedService && (
                    <button
                        type="button"
                        onClick={handleAddToOrder}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center gap-2"
                    >
                        <IconPlus size={18} />
                        Tambahkan ke Pesanan
                    </button>
                )}
            </div>
        </div>
    );
}
