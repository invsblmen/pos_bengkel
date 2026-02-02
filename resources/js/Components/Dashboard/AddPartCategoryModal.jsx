import React, { useState } from "react";
import axios from "axios";
import {
    IconBox,
    IconTruck,
    IconTool,
    IconBolt,
    IconCylinder,
    IconGauge,
    IconFilter,
    IconLink,
    IconCircle,
    IconShield,
    IconSparkles,
    IconAlertTriangle,
    IconSettings,
    IconX,
    IconLoader2,
    IconCheck,
    IconChevronDown,
} from "@tabler/icons-react";
import toast from "react-hot-toast";

const AVAILABLE_ICONS = [
    { name: "Box", icon: IconBox },
    { name: "Truck", icon: IconTruck },
    { name: "Tool", icon: IconTool },
    { name: "Bolt", icon: IconBolt },
    { name: "Cylinder", icon: IconCylinder },
    { name: "Gauge", icon: IconGauge },
    { name: "Filter", icon: IconFilter },
    { name: "Link", icon: IconLink },
    { name: "Circle", icon: IconCircle },
    { name: "Shield", icon: IconShield },
    { name: "Sparkles", icon: IconSparkles },
    { name: "Alert", icon: IconAlertTriangle },
    { name: "Settings", icon: IconSettings },
];

/**
 * AddPartCategoryModal - Modal to add new part category from part creation page
 */
export default function AddPartCategoryModal({ isOpen, onClose, onSuccess }) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        icon: "Box",
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState(false);

    const selectedIconDef = AVAILABLE_ICONS.find((i) => i.name === form.icon);
    const SelectedIcon = selectedIconDef?.icon || IconBox;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const handleIconSelect = (iconName) => {
        setForm((prev) => ({ ...prev, icon: iconName }));
        setShowIconPicker(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = "Nama kategori wajib diisi";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post(
                route("part-categories.storeAjax"),
                form
            );

            if (response.data.success) {
                toast.success("Kategori sparepart berhasil ditambahkan");
                setForm({ name: "", description: "", icon: "Box" });
                setErrors({});
                setIsSubmitting(false);
                onSuccess?.(response.data.category);
                onClose();
            } else {
                setErrors(response.data.errors || {});
                toast.error(
                    response.data.message || "Gagal menambahkan kategori"
                );
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error("Add category error:", err);
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            }
            toast.error(
                err.response?.data?.message || "Gagal menambahkan kategori"
            );
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setForm({ name: "", description: "", icon: "Box" });
        setErrors({});
        setShowIconPicker(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-3 text-white">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <SelectedIcon size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">
                                Tambah Kategori
                            </h3>
                            <p className="text-sm text-white/80">
                                Kategori sparepart baru
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
                <form onSubmit={handleSubmit} className="p-6 space-y-4 rounded-b-2xl">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Nama Kategori{" "}
                            <span className="text-danger-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Contoh: Mesin & Komponen"
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

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Deskripsi (Opsional)
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Deskripsi singkat tentang kategori ini..."
                            rows={3}
                            className={`w-full px-4 py-3 rounded-xl border ${
                                errors.description
                                    ? "border-danger-500 focus:ring-danger-500/20"
                                    : "border-slate-200 dark:border-slate-700 focus:ring-primary-500/20"
                            } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all resize-none`}
                        />
                        {errors.description && (
                            <p className="mt-1 text-xs text-danger-500">
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {/* Icon Picker */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Icon (Opsional)
                        </label>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowIconPicker(!showIconPicker)}
                                className={`w-full h-11 px-4 rounded-xl border ${
                                    errors.icon
                                        ? "border-danger-500 focus:ring-danger-500/20"
                                        : "border-slate-200 dark:border-slate-700 focus:ring-primary-500/20"
                                } bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-4 focus:border-primary-500 transition-all flex items-center justify-between`}
                            >
                                <span className="flex items-center gap-2">
                                    <SelectedIcon
                                        size={18}
                                        className="text-primary-600 dark:text-primary-400"
                                    />
                                    <span className="text-sm">{form.icon}</span>
                                </span>
                                <IconChevronDown
                                    size={16}
                                    className={`transition-transform ${
                                        showIconPicker ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {/* Icon Dropdown */}
                            {showIconPicker && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-3 grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                                    {AVAILABLE_ICONS.map(({ name, icon: Icon }) => (
                                        <button
                                            key={name}
                                            type="button"
                                            onClick={() =>
                                                handleIconSelect(name)
                                            }
                                            className={`p-2 rounded-lg border-2 transition-all flex items-center justify-center ${
                                                form.icon === name
                                                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                                                    : "border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                            }`}
                                            title={name}
                                        >
                                            <Icon
                                                size={20}
                                                className={
                                                    form.icon === name
                                                        ? "text-primary-600 dark:text-primary-400"
                                                        : "text-slate-600 dark:text-slate-400"
                                                }
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
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
