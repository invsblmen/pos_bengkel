import React, { useState } from "react";
import {
    IconX,
    IconGauge,
    IconLoader2,
    IconCheck,
} from "@tabler/icons-react";
import toast from "react-hot-toast";

export default function OdometerCheckInModal({
    isOpen,
    onClose,
    onSuccess,
    prevKm = null,
}) {
    const [form, setForm] = useState({
        odometer_km: "",
        notes: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (!form.odometer_km.trim()) {
            toast.error("Odometer wajib diisi");
            return;
        }

        const odometerValue = parseInt(form.odometer_km);
        if (prevKm !== null && odometerValue < prevKm) {
            toast.error(
                `Odometer tidak boleh < ${prevKm.toLocaleString('id-ID')} km`
            );
            return;
        }

        setIsSubmitting(true);
        setTimeout(() => {
            onSuccess({
                odometer_km: form.odometer_km,
                notes: form.notes,
            });
            setForm({ odometer_km: "", notes: "" });
            setIsSubmitting(false);
        }, 300);
    };

    const handleClose = () => {
        setForm({ odometer_km: "", notes: "" });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <IconGauge size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">
                                Check-in Kendaraan
                            </h3>
                            <p className="text-sm text-white/80">
                                Catat odometer masuk
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    >
                        <IconX size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Odometer */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Odometer (Km) <span className="text-danger-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="odometer_km"
                            value={form.odometer_km}
                            onChange={handleChange}
                            placeholder="Masukkan pembacaan odometer"
                            min="0"
                            autoFocus
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Keluhan / Catatan
                        </label>
                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            placeholder="Deskripsi keluhan atau kondisi kendaraan..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                        />
                    </div>

                    {/* Info */}
                    {prevKm !== null && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <p className="text-xs text-blue-700 dark:text-blue-400">
                                <span className="font-semibold">Odometer terakhir:</span> {prevKm.toLocaleString('id-ID')} km
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 h-11 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                        >
                            {isSubmitting ? (
                                <>
                                    <IconLoader2
                                        size={18}
                                        className="animate-spin"
                                    />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <IconCheck size={18} />
                                    Simpan
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
