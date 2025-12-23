import React, { useState } from "react";
import { router } from "@inertiajs/react";
import {
    IconClock,
    IconPlayerPlay,
    IconTrash,
    IconChevronDown,
    IconChevronUp,
    IconShoppingCart,
} from "@tabler/icons-react";
import toast from "react-hot-toast";

const formatPrice = (value = 0) =>
    value.toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    });

const formatTime = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

/**
 * Single Held Transaction Card
 */
function HeldTransactionCard({
    hold,
    onResume,
    onDelete,
    isResuming,
    isDeleting,
}) {
    return (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 truncate">
                        {hold.label}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <IconClock size={12} />
                        {formatTime(hold.held_at)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                        {formatPrice(hold.total)}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                        {hold.items_count} item
                    </p>
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => onResume(hold.hold_id)}
                    disabled={isResuming}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                    {isResuming ? (
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <IconPlayerPlay size={14} />
                            Lanjutkan
                        </>
                    )}
                </button>
                <button
                    onClick={() => onDelete(hold.hold_id)}
                    disabled={isDeleting}
                    className="py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors disabled:opacity-50"
                >
                    <IconTrash size={14} />
                </button>
            </div>
        </div>
    );
}

/**
 * HeldTransactions - Display and manage held transactions
 */
export default function HeldTransactions({
    heldCarts = [],
    hasActiveCart = false,
}) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [resumingId, setResumingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    if (!heldCarts || heldCarts.length === 0) {
        return null;
    }

    const handleResume = async (holdId) => {
        if (hasActiveCart) {
            toast.error(
                "Selesaikan atau tahan transaksi aktif terlebih dahulu"
            );
            return;
        }

        setResumingId(holdId);

        router.post(
            route("transactions.resume", holdId),
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Transaksi dilanjutkan");
                    setResumingId(null);
                },
                onError: (errors) => {
                    toast.error(
                        errors.message || "Gagal melanjutkan transaksi"
                    );
                    setResumingId(null);
                },
            }
        );
    };

    const handleDelete = async (holdId) => {
        if (!confirm("Hapus transaksi yang ditahan ini?")) return;

        setDeletingId(holdId);

        try {
            const response = await fetch(
                route("transactions.clearHold", holdId),
                {
                    method: "DELETE",
                    headers: {
                        "X-CSRF-TOKEN": document.querySelector(
                            'meta[name="csrf-token"]'
                        )?.content,
                        Accept: "application/json",
                    },
                }
            );

            const data = await response.json();

            if (data.success) {
                toast.success("Transaksi dihapus");
                router.reload({ only: ["heldCarts"] });
            } else {
                toast.error(data.message || "Gagal menghapus");
            }
        } catch (error) {
            toast.error("Gagal menghapus transaksi");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="border-b border-slate-200 dark:border-slate-800">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                        <IconClock
                            size={16}
                            className="text-amber-600 dark:text-amber-400"
                        />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Transaksi Ditahan
                        </p>
                        <p className="text-xs text-slate-500">
                            {heldCarts.length} transaksi
                        </p>
                    </div>
                </div>
                {isExpanded ? (
                    <IconChevronUp size={18} className="text-slate-400" />
                ) : (
                    <IconChevronDown size={18} className="text-slate-400" />
                )}
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="p-3 pt-0 space-y-2">
                    {heldCarts.map((hold) => (
                        <HeldTransactionCard
                            key={hold.hold_id}
                            hold={hold}
                            onResume={handleResume}
                            onDelete={handleDelete}
                            isResuming={resumingId === hold.hold_id}
                            isDeleting={deletingId === hold.hold_id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * HoldButton - Button to hold current transaction
 */
export function HoldButton({ hasItems = false, onHold, isHolding = false }) {
    const [showLabelInput, setShowLabelInput] = useState(false);
    const [label, setLabel] = useState("");

    const handleHold = () => {
        onHold(label || null);
        setLabel("");
        setShowLabelInput(false);
    };

    if (!hasItems) return null;

    if (showLabelInput) {
        return (
            <div className="flex gap-2">
                <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Label (opsional)"
                    className="flex-1 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleHold();
                        if (e.key === "Escape") setShowLabelInput(false);
                    }}
                />
                <button
                    onClick={handleHold}
                    disabled={isHolding}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold disabled:opacity-50"
                >
                    {isHolding ? "..." : "Tahan"}
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowLabelInput(true)}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-sm font-medium transition-colors"
        >
            <IconClock size={16} />
            Tahan Transaksi
        </button>
    );
}
