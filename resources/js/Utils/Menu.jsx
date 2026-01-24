import { usePage } from "@inertiajs/react";
import {
    IconBooks,
    IconBox,
    IconCar,
    IconCategory,
    IconChartArrowsVertical,
    IconChartBarPopular,
    IconChartInfographic,
    IconCirclePlus,
    IconClockHour6,
    IconCreditCard,
    IconFileCertificate,
    IconFileDescription,
    IconFileInvoice,
    IconFolder,
    IconHistory,
    IconLayout2,
    IconReceipt,
    IconSchool,
    IconShoppingCart,
    IconTable,
    IconUserBolt,
    IconUserShield,
    IconUserSquare,
    IconUsers,
    IconUsersPlus,
    IconArrowUp,
    IconArrowDown,
    IconTrendingUp,
    IconCalendar,
    IconPackage,
    IconAlertCircle,
} from "@tabler/icons-react";
import hasAnyPermission from "./Permission";
import React from "react";

export default function Menu() {
    // define use page
    const { url } = usePage();

    // define menu navigations
    const menuNavigation = [
        {
            title: "Overview",
            details: [
                {
                    title: "Dashboard",
                    href: route("dashboard"),
                    active: url === "/dashboard" ? true : false, // Update comparison here
                    icon: <IconLayout2 size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["dashboard-access"]),
                },
            ],
        },
        {
            title: "Data Management",
            details: [
                {
                    title: "Kategori",
                    href: route("categories.index"),
                    active: url === "/dashboard/categories" ? true : false, // Update comparison here
                    icon: <IconFolder size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["categories-access"]),
                },
                {
                    title: "Produk",
                    href: route("products.index"),
                    active: url === "/dashboard/products" ? true : false, // Update comparison here
                    icon: <IconBox size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["products-access"]),
                },
                {
                    title: "Supplier",
                    href: route("suppliers.index"),
                    active: url === "/dashboard/suppliers" || url.startsWith("/dashboard/suppliers") ? true : false,
                    icon: <IconFileCertificate size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["suppliers-access"]),
                },
                {
                    title: "Sparepart",
                    icon: <IconBox size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["parts-access"]),
                    subdetails: [
                        {
                            title: "Daftar Sparepart",
                            href: route("parts.index"),
                            active: url === "/dashboard/parts" && !url.includes("/stock") && !url.includes("/sales") && !url.includes("/part-purchases") && !url.includes("/part-sales-orders") && !url.includes("/part-purchase-orders") ? true : false,
                            icon: <IconTable size={20} strokeWidth={1.5} />,
                            permissions: hasAnyPermission(["parts-access"]),
                        },
                        {
                            title: "Pembelian Sparepart",
                            href: route("part-purchases.index"),
                            active: url.includes("/dashboard/part-purchases") ? true : false,
                            icon: <IconCirclePlus size={20} strokeWidth={1.5} />,
                            permissions: hasAnyPermission(["part-purchases-access"]),
                        },
                        {
                            title: "Penjualan Sparepart",
                            href: route("part-sales.index"),
                            active: url.includes("/dashboard/part-sales") && !url.includes("/part-sales-orders") ? true : false,
                            icon: <IconReceipt size={20} strokeWidth={1.5} />,
                            permissions: hasAnyPermission(["part-sales-access"]),
                        },
                        {
                            title: "Pesanan Jual Sparepart",
                            href: route("part-sales-orders.index"),
                            active: url.includes("/dashboard/part-sales-orders") ? true : false,
                            icon: <IconShoppingCart size={20} strokeWidth={1.5} />,
                            permissions: hasAnyPermission(["part-sales-orders-access"]),
                        },
                        {
                            title: "Pesanan Beli (PO)",
                            href: route("part-purchase-orders.index"),
                            active: url.includes("/dashboard/part-purchase-orders") ? true : false,
                            icon: <IconFileInvoice size={20} strokeWidth={1.5} />,
                            permissions: hasAnyPermission(["part-purchase-orders-access"]),
                        },
                        {
                            title: "History Transaksi Sparepart",
                            href: route("part-stock-history.index"),
                            active: url.includes("/dashboard/part-stock-history") ? true : false,
                            icon: <IconHistory size={20} strokeWidth={1.5} />,
                            permissions: hasAnyPermission(["part-stock-history-access", "parts-stock-access"]),
                        },
                        {
                            title: "Sparepart Masuk",
                            href: route("parts.stock.in.create"),
                            active: url.includes("/dashboard/parts/stock/in") ? true : false,
                            icon: <IconArrowUp size={20} strokeWidth={1.5} />,
                            permissions: hasAnyPermission(["parts-stock-in"]),
                        },
                        {
                            title: "Sparepart Keluar",
                            href: route("parts.stock.out.create"),
                            active: url.includes("/dashboard/parts/stock/out") ? true : false,
                            icon: <IconArrowDown size={20} strokeWidth={1.5} />,
                            permissions: hasAnyPermission(["parts-stock-out"]),
                        },
                    ],
                },
                {
                    title: "Pelanggan",
                    href: route("customers.index"),
                    active: url === "/dashboard/customers" ? true : false, // Update comparison here
                    icon: <IconUsersPlus size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["customers-access"]),
                },
                {
                    title: "Kendaraan",
                    href: route("vehicles.index"),
                    active: url === "/dashboard/vehicles" || url.startsWith("/dashboard/vehicles") ? true : false,
                    icon: <IconCar size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["vehicles-access"]),
                },
            ],
        },
        {
            title: "Transaksi",
            details: [
                {
                    title: "Transaksi",
                    href: route("transactions.index"),
                    active: url === "/dashboard/transactions" ? true : false, // Update comparison here
                    icon: <IconShoppingCart size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["transactions-access"]),
                },
                {
                    title: "Riwayat Transaksi",
                    href: route("transactions.history"),
                    active: url === "/dashboard/transactions/history" ? true : false,
                    icon: <IconClockHour6 size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["transactions-access"]),
                },
            ],
        },
        {
            title: "Laporan",
            details: [
                {
                    title: "Laporan Penjualan",
                    href: route("reports.sales.index"),
                    active: url.startsWith("/dashboard/reports/sales"),
                    icon: (
                        <IconChartArrowsVertical size={20} strokeWidth={1.5} />
                    ),
                    permissions: hasAnyPermission(["reports-access"]),
                },
                {
                    title: "Laporan Keuntungan",
                    href: route("reports.profits.index"),
                    active: url.startsWith("/dashboard/reports/profits"),
                    icon: <IconChartBarPopular size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["profits-access"]),
                },
                {
                    title: "Laporan Lanjut",
                    icon: <IconChartInfographic size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["reports-access"]),
                    subdetails: [
                        {
                            title: "Revenue Servis",
                            href: route("reports.service-revenue.index"),
                            active: url.startsWith("/dashboard/reports/service-revenue"),
                            icon: <IconTrendingUp size={20} strokeWidth={1.5} />,
                            permissions: hasAnyPermission(["reports-access"]),
                        },
                        {
                            title: "Produktivitas Mekanik",
                            href: route("reports.mechanic-productivity.index"),
                            active: url.startsWith("/dashboard/reports/mechanic-productivity"),
                            icon: <IconUserSquare size={20} strokeWidth={1.5} />,
                            permissions: hasAnyPermission(["reports-access"]),
                        },
                        {
                            title: "Inventory Sparepart",
                            href: route("reports.parts-inventory.index"),
                            active: url.startsWith("/dashboard/reports/parts-inventory"),
                            icon: <IconPackage size={20} strokeWidth={1.5} />,
                            permissions: hasAnyPermission(["reports-access"]),
                        },
                        {
                            title: "Pembayaran Tertunggak",
                            href: route("reports.outstanding-payments.index"),
                            active: url.startsWith("/dashboard/reports/outstanding-payments"),
                            icon: <IconAlertCircle size={20} strokeWidth={1.5} />,
                            permissions: hasAnyPermission(["reports-access"]),
                        },
                    ],
                },
            ],
        },
        {
            title: "User Management",
            details: [
                {
                    title: "Hak Akses",
                    href: route("permissions.index"),
                    active: url === "/dashboard/permissions" ? true : false, // Update comparison here
                    icon: <IconUserBolt size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["permissions-access"]),
                },
                {
                    title: "Akses Group",
                    href: route("roles.index"),
                    active: url === "/dashboard/roles" ? true : false, // Update comparison here
                    icon: <IconUserShield size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["roles-access"]),
                },
                {
                    title: "Pengguna",
                    icon: <IconUsers size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["users-access"]),
                    subdetails: [
                        {
                            title: "Data Pengguna",
                            href: route("users.index"),
                            icon: <IconTable size={20} strokeWidth={1.5} />,
                            active: url === "/dashboard/users" ? true : false,
                            permissions: hasAnyPermission(["users-access"]),
                        },
                        {
                            title: "Tambah Data Pengguna",
                            href: route("users.create"),
                            icon: (
                                <IconCirclePlus size={20} strokeWidth={1.5} />
                            ),
                            active:
                                url === "/dashboard/users/create"
                                    ? true
                                    : false,
                            permissions: hasAnyPermission(["users-create"]),
                        },
                    ],
                },
            ],
        },
        {
            title: "Workshop",
            details: [
                {
                    title: "Mekanik",
                    icon: <IconUserSquare size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["mechanics-access"]),
                    subdetails: [
                        {
                            title: "Daftar Mekanik",
                            href: route("mechanics.index"),
                            active: url === "/dashboard/mechanics" || (url.startsWith("/dashboard/mechanics") && !url.includes("/performance")),
                            icon: <IconTable size={20} strokeWidth={1.5} />,
                            permissions: hasAnyPermission(["mechanics-access"]),
                        },
                        {
                            title: "Performa Mekanik",
                            href: route("mechanics.performance.dashboard"),
                            active: url.startsWith("/dashboard/mechanics/performance"),
                            icon: <IconTrendingUp size={20} strokeWidth={1.5} />,
                            permissions: hasAnyPermission(["mechanics-access"]),
                        },
                    ],
                },
                {
                    title: "Layanan Service",
                    icon: <IconBooks size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["services-access", "service-categories-access"]),
                    subdetails: [
                        {
                            title: "Daftar Layanan",
                            href: route("services.index"),
                            active: url === "/dashboard/services" || url.startsWith("/dashboard/services") ? true : false,
                            icon: <IconTable size={20} strokeWidth={1.5} />,
                            permissions: hasAnyPermission(["services-access"]),
                        },
                        {
                            title: "Kategori Layanan",
                            href: route("service-categories.index"),
                            active: url === "/dashboard/service-categories" || url.startsWith("/dashboard/service-categories") ? true : false,
                            icon: <IconCategory size={20} strokeWidth={1.5} />,
                            permissions: hasAnyPermission(["service-categories-access"]),
                        },
                    ],
                },
                {
                    title: "Kategori Sparepart",
                    href: route("part-categories.index"),
                    active: url === "/dashboard/part-categories" || url.startsWith("/dashboard/part-categories") ? true : false,
                    icon: <IconCategory size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["part-categories-access"]),
                },
                {
                    title: "Service Orders",
                    href: route("service-orders.index"),
                    active: url === "/dashboard/service-orders" ? true : false,
                    icon: <IconFileDescription size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["service-orders-access"]),
                },
                {
                    title: "Appointments",
                    icon: <IconClockHour6 size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["appointments-access"]),
                    subdetails: [
                        {
                            title: "Daftar Appointments",
                            href: route("appointments.index"),
                            active: url === "/dashboard/appointments" || (url.startsWith("/dashboard/appointments") && !url.includes("/calendar")),
                            icon: <IconTable size={20} strokeWidth={1.5} />,
                            permissions: hasAnyPermission(["appointments-access"]),
                        },
                        {
                            title: "Kalender Appointments",
                            href: route("appointments.calendar"),
                            active: url.startsWith("/dashboard/appointments/calendar"),
                            icon: <IconCalendar size={20} strokeWidth={1.5} />,
                            permissions: hasAnyPermission(["appointments-access"]),
                        },
                    ],
                },
            ],
        },

        {
            title: "Pengaturan",
            details: [
                {
                    title: "Payment Gateway",
                    href: route("settings.payments.edit"),
                    active: url === "/dashboard/settings/payments",
                    icon: <IconCreditCard size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["payment-settings-access"]),
                },
            ],
        },
    ];

    return menuNavigation;
}
