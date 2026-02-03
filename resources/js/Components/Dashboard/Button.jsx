import { Link } from "@inertiajs/react";
import React from "react";
import { useForm } from "@inertiajs/react";
import Swal from "sweetalert2";

export default function Button({
    className,
    icon,
    label,
    type,
    href,
    added,
    url,
    id,
    loading,
    variant,
    ...props
}) {
    const { delete: destroy } = useForm();

    const deleteData = async (url) => {
        Swal.fire({
            title: "Hapus Data?",
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#6366f1",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Ya, Hapus!",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(url);

                Swal.fire({
                    title: "Berhasil!",
                    text: "Data berhasil dihapus!",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        });
    };

    const baseStyles =
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-[0.98]";
    const sizeStyles = "px-4 py-2.5 text-sm rounded-xl";
    const smallStyles = "px-3 py-2 rounded-xl";

    return (
        <>
            {type === "link" && (
                <Link
                    href={href}
                    className={`${baseStyles} ${sizeStyles} ${className}`}
                >
                    {icon}{" "}
                    <span
                        className={`${added === true ? "hidden lg:block" : ""}`}
                    >
                        {label}
                    </span>
                </Link>
            )}
            {type === "button" && (
                <button
                    className={`${baseStyles} ${sizeStyles} ${className}`}
                    disabled={loading}
                    {...props}
                >
                    {loading ? (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : icon}
                    {" "}
                    <span
                        className={`${added === true ? "hidden md:block" : ""}`}
                    >
                        {label}
                    </span>
                </button>
            )}
            {type === "submit" && (
                <button
                    type="submit"
                    className={`${baseStyles} ${sizeStyles} ${className}`}
                    disabled={loading}
                    {...props}
                >
                    {loading ? (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : icon}
                    {" "}
                    <span
                        className={`${added === true ? "hidden lg:block" : ""}`}
                    >
                        {label}
                    </span>
                </button>
            )}
            {type === "delete" && (
                <button
                    onClick={() => deleteData(url)}
                    className={`${baseStyles} ${smallStyles} ${className}`}
                    {...props}
                >
                    {icon} {label && <span>{label}</span>}
                </button>
            )}
            {type === "modal" && (
                <button
                    className={`${baseStyles} ${smallStyles} ${className}`}
                    {...props}
                >
                    {icon}
                </button>
            )}
            {type === "edit" && (
                <Link
                    href={href}
                    className={`${baseStyles} ${smallStyles} ${className}`}
                    {...props}
                >
                    {icon}
                </Link>
            )}
            {type === "bulk" && (
                <button
                    {...props}
                    className={`${baseStyles} ${sizeStyles} ${className}`}
                >
                    {icon}{" "}
                    <span
                        className={`${added === true ? "hidden lg:block" : ""}`}
                    >
                        {label}
                    </span>
                </button>
            )}
        </>
    );
}
