import React, { useState } from "react";
import axios from "axios";
import {
    IconTruck,
    IconX,
    IconLoader2,
    IconCheck,
} from "@tabler/icons-react";
import toast from "react-hot-toast";

/**
 * AddSupplierModal - Modal to add new supplier from part creation page
 */
export default function AddSupplierModal({ isOpen, onClose, onSuccess }) {
    const [form, setForm] = useState({
        name: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = "Nama supplier wajib diisi";
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            newErrors.email = "Email tidak valid";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post(
                route("suppliers.storeAjax"),
                form
            );

            if (response.data.success) {
                toast.success("Supplier berhasil ditambahkan");
                setForm({
                    name: "",
                    contact_person: "",
                    phone: "",
                    email: "",
                    address: "",
                });
                setErrors({});
                setIsSubmitting(false);
                onSuccess?.(response.data.supplier);
                onClose();
            } else {
                setErrors(response.data.errors || {});
                toast.error(
                    response.data.message || "Gagal menambahkan supplier"
                );
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error("Add supplier error:", err);
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            }
            toast.error(
                err.response?.data?.message || "Gagal menambahkan supplier"
            );
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setForm({
            name: "",
            contact_person: "",
            phone: "",
            email: "",
            address: "",
        });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <IconTruck size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">
                                Tambah Supplier
                            </h3>
                            <p className="text-sm text-white/80">
                                Supplier sparepart baru
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
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Nama Supplier{" "}
                            <span className="text-danger-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="PT. Supplier Jaya"
                            className={`w-full h-11 px-4 rounded-xl border ${
                                errors.name
                                    ? "border-danger-500 focus:ring-danger-500/20"
                                    : "border-slate-200 dark:border-slate-700 focus:ring-primary-500/20"
                            } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all`}
                            autoFocus
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-danger-500">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Contact Person */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Nama Kontak (Opsional)
                        </label>
                        <input
                            type="text"
                            name="contact_person"
                            value={form.contact_person}
                            onChange={handleChange}
                            placeholder="Nama orang yang dapat dihubungi"
                            className={`w-full h-11 px-4 rounded-xl border ${
                                errors.contact_person
                                    ? "border-danger-500 focus:ring-danger-500/20"
                                    : "border-slate-200 dark:border-slate-700 focus:ring-primary-500/20"
                            } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all`}
                        />
                        {errors.contact_person && (
                            <p className="mt-1 text-xs text-danger-500">
                                {errors.contact_person}
                            </p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            No. Telepon (Opsional)
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="08123456789"
                            className={`w-full h-11 px-4 rounded-xl border ${
                                errors.phone
                                    ? "border-danger-500 focus:ring-danger-500/20"
                                    : "border-slate-200 dark:border-slate-700 focus:ring-primary-500/20"
                            } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all`}
                        />
                        {errors.phone && (
                            <p className="mt-1 text-xs text-danger-500">
                                {errors.phone}
                            </p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Email (Opsional)
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="supplier@email.com"
                            className={`w-full h-11 px-4 rounded-xl border ${
                                errors.email
                                    ? "border-danger-500 focus:ring-danger-500/20"
                                    : "border-slate-200 dark:border-slate-700 focus:ring-primary-500/20"
                            } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all`}
                        />
                        {errors.email && (
                            <p className="mt-1 text-xs text-danger-500">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Alamat (Opsional)
                        </label>
                        <textarea
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            placeholder="Alamat lengkap supplier"
                            rows={3}
                            className={`w-full px-4 py-3 rounded-xl border ${
                                errors.address
                                    ? "border-danger-500 focus:ring-danger-500/20"
                                    : "border-slate-200 dark:border-slate-700 focus:ring-primary-500/20"
                            } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all resize-none`}
                        />
                        {errors.address && (
                            <p className="mt-1 text-xs text-danger-500">
                                {errors.address}
                            </p>
                        )}
                    </div>

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
                            className="flex-1 h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
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
