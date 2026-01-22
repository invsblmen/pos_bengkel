import React, { useState, useEffect } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import {
    IconChevronLeft,
    IconChevronRight,
    IconPlus,
    IconCheck,
    IconX,
    IconClock,
    IconSearch,
} from "@tabler/icons-react";
import { Card, CardBody, CardHeader, CardTitle } from "@/Components/Card";
import { toDisplayDate, toDisplayTime, toDisplayDateLong, todayLocalDate, dateToLocalDateInput } from '@/Utils/datetime';

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const statusColors = {
    scheduled: "bg-amber-100 text-amber-700 border-amber-200",
    confirmed: "bg-primary-100 text-primary-700 border-primary-200",
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cancelled: "bg-rose-100 text-rose-700 border-rose-200",
};

const statusLabels = {
    scheduled: "Terjadwal",
    confirmed: "Dikonfirmasi",
    completed: "Selesai",
    cancelled: "Dibatalkan",
};

export default function AppointmentCalendar({
    calendar_days,
    current_date,
    year,
    month,
    mechanics,
}) {
    const { props } = usePage();
    const csrfToken = props.csrf_token;
    const [selectedDate, setSelectedDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [availableSlotsLoading, setAvailableSlotsLoading] = useState(false);
    const [selectedMechanic, setSelectedMechanic] = useState("");
    const [selectedSlot, setSelectedSlot] = useState("");
    const [viewMechanicId, setViewMechanicId] = useState("");
    const [customerQuery, setCustomerQuery] = useState("");
    const [customerResults, setCustomerResults] = useState([]);
    const [customerLoading, setCustomerLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerError, setCustomerError] = useState("");
    const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState("");
    const [newCustomerPhone, setNewCustomerPhone] = useState("");
    const [newCustomerEmail, setNewCustomerEmail] = useState("");
    const [newCustomerAddress, setNewCustomerAddress] = useState("");
    const [creatingCustomer, setCreatingCustomer] = useState(false);
    const [notes, setNotes] = useState("");

    // Helpers
    const todayStr = todayLocalDate();
    const toDate = (d) => (typeof d === 'string' ? new Date(d + 'T00:00:00') : new Date(d));

    const handlePrevMonth = () => {
        const newMonth = month === 1 ? 12 : month - 1;
        const newYear = month === 1 ? year - 1 : year;
        router.get(route("appointments.calendar"), {
            year: newYear,
            month: newMonth,
        });
    };

    const handleNextMonth = () => {
        const newMonth = month === 12 ? 1 : month + 1;
        const newYear = month === 12 ? year + 1 : year;
        router.get(route("appointments.calendar"), {
            year: newYear,
            month: newMonth,
        });
    };

    const handleSelectDate = (day) => {
        if (day) {
            setSelectedDate(day.date);
            setShowModal(true);
            setSelectedMechanic("");
            setAvailableSlots([]);
            setSelectedCustomer(null);
            setCustomerQuery("");
            setCustomerResults([]);
            setNotes("");
        }
    };

    const handleMechanicSelect = (mechanicId) => {
        setSelectedMechanic(mechanicId);

        // Format date safely
        let formattedDate = selectedDate;
        if (typeof selectedDate === 'object' && selectedDate.format) {
            formattedDate = selectedDate.format('YYYY-MM-DD');
        } else if (typeof selectedDate === 'object' && selectedDate instanceof Date) {
            formattedDate = dateToLocalDateInput(selectedDate);
        }

        // Fetch available slots
        setAvailableSlotsLoading(true);
        fetch(
            route("appointments.available-slots") +
            `?mechanic_id=${mechanicId}&date=${formattedDate}`
        )
            .then((res) => res.json())
            .then((data) => {
                setAvailableSlots(data.available_slots);
                setSelectedSlot("");
            })
            .catch((err) => console.error(err))
            .finally(() => setAvailableSlotsLoading(false));
    };

    const handleBookAppointment = (e) => {
        e.preventDefault();

        if (!selectedMechanic || !selectedSlot) {
            alert('Pilih mekanik dan jam terlebih dahulu.');
            return;
        }

        // Submit appointment
        router.post(route("appointments.store"), {
            mechanic_id: selectedMechanic,
            scheduled_at: selectedSlot,
            customer_id: selectedCustomer?.id ?? null,
            notes: notes || null,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowModal(false);
                setSelectedMechanic("");
                setSelectedSlot("");
                setSelectedCustomer(null);
                setCustomerQuery("");
                setAvailableSlots([]);
                setNotes("");
            },
            onError: (errors) => {
                console.error('Booking errors:', errors);
                if (errors.scheduled_at) {
                    alert(errors.scheduled_at);
                } else {
                    alert('Gagal membuat appointment. Silakan coba lagi.');
                }
            }
        });
    };

    return (
        <DashboardLayout>
            <Head title="Kalender Appointment" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">Kalender Appointment</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Lihat dan kelola jadwal servis kendaraan
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Calendar */}
                    <div className="lg:col-span-3">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>
                                        {MONTHS[month - 1]} {year}
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handlePrevMonth}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                        >
                                            <IconChevronLeft size={20} strokeWidth={1.5} />
                                        </button>
                                        <button
                                            onClick={handleNextMonth}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                        >
                                            <IconChevronRight size={20} strokeWidth={1.5} />
                                        </button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardBody>
                                {/* Quick Hints + Legend + Filter */}
                                <div className="flex flex-col gap-2 mb-4">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Klik tanggal untuk membuat booking. Garis biru = hari ini.
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm text-gray-600 dark:text-gray-400">Filter Mekanik:</label>
                                            <select
                                                value={viewMechanicId}
                                                onChange={(e) => setViewMechanicId(e.target.value)}
                                                className="px-2 py-1 border rounded-lg text-sm"
                                            >
                                                <option value="">Semua Mekanik</option>
                                                {mechanics.map((m) => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {Object.entries(statusLabels).map(([key, label]) => (
                                            <span key={key} className={`px-2 py-1 rounded text-xs ${statusColors[key]}`}>
                                                {label}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Weekday Headers */}
                                <div className="grid grid-cols-7 gap-2 mb-4">
                                    {WEEKDAYS.map((day) => (
                                        <div
                                            key={day}
                                            className="text-center font-semibold text-gray-600 dark:text-gray-400 py-2"
                                        >
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Days */}
                                <div className="grid grid-cols-7 gap-2">
                                    {calendar_days.map((day, index) => (
                                        <div
                                            key={index}
                                            onClick={() => day && handleSelectDate(day)}
                                            className={`
                                                aspect-square p-2 rounded-lg border-2 transition
                                                ${!day
                                                    ? "bg-gray-50 dark:bg-gray-900 border-transparent"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 cursor-pointer"
                                                }
                                            `}
                                        >
                                            {day && (() => {
                                                const isToday = day.date === todayStr;
                                                const isSelected = selectedDate && typeof selectedDate === 'string' && selectedDate === day.date;
                                                const isPast = day.date < todayStr;
                                                const dayNum = day.day_num || toDate(day.date).getDate();
                                                const dayAppointments = viewMechanicId
                                                    ? day.appointments.filter((a) => String(a?.mechanic?.id ?? a?.mechanic_id) === String(viewMechanicId))
                                                    : day.appointments;
                                                return (
                                                    <div className={`h-full flex flex-col ${isPast ? 'opacity-60' : ''}`}>
                                                        <div className="flex items-start justify-between">
                                                            <p className={`font-semibold text-sm inline-flex items-center justify-center w-6 h-6 rounded-full ${isSelected ? 'bg-blue-600 text-white' : ''} ${isToday && !isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                                                                {dayNum}
                                                            </p>
                                                            {dayAppointments.length > 0 && (
                                                                <span className="text-[10px] text-gray-500">
                                                                    {dayAppointments.length} jadwal
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="mt-1 flex-1 overflow-hidden">
                                                            {dayAppointments.length > 0 && (
                                                                <div className="text-xs space-y-1">
                                                                    {dayAppointments.slice(0, 2).map((apt) => (
                                                                        <div
                                                                            key={apt.id}
                                                                            className={`px-1 py-0.5 rounded text-white truncate ${statusColors[apt.status]}`}
                                                                        >
                                                                            {apt.customer?.name || 'Belum dipilih'}
                                                                        </div>
                                                                    ))}
                                                                    {dayAppointments.length > 2 && (
                                                                        <p className="text-[10px] text-gray-500">
                                                                            +{dayAppointments.length - 2} lainnya
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Sidebar: Agenda Harian (if date selected) or Upcoming */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {selectedDate
                                        ? `Agenda ${toDisplayDateLong(`${selectedDate} 00:00:00`)}`
                                        : 'Mendatang'}
                                </CardTitle>
                            </CardHeader>
                            <CardBody>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {(() => {
                                        // Compute list depending on selectedDate or upcoming
                                        let items = [];
                                        if (selectedDate) {
                                            const selectedDay = calendar_days.find((d) => d && d.date === selectedDate);
                                            const list = selectedDay ? selectedDay.appointments : [];
                                            items = viewMechanicId
                                                ? list.filter((a) => String(a?.mechanic?.id) === String(viewMechanicId))
                                                : list;
                                        } else {
                                            const all = calendar_days
                                                .filter((day) => day && day.appointments.length > 0)
                                                .flatMap((day) => day.appointments)
                                                .sort((a, b) => String(a.scheduled_at).localeCompare(String(b.scheduled_at)));
                                            items = viewMechanicId
                                                ? all.filter((a) => String(a?.mechanic?.id) === String(viewMechanicId))
                                                : all;
                                            items = items.slice(0, 5);
                                        }

                                        if (!items || items.length === 0) {
                                            return (
                                                <div className="text-sm text-gray-500">
                                                    {selectedDate
                                                        ? 'Tidak ada appointment pada tanggal ini.'
                                                        : 'Tidak ada appointment mendatang yang cocok dengan filter.'}
                                                </div>
                                            );
                                        }

                                        return items.map((apt) => (
                                            <div key={apt.id} className={`p-3 rounded-lg border-l-4 ${statusColors[apt.status]}`}>
                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold text-sm">{apt.customer?.name || 'Belum dipilih'}</p>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded ${statusColors[apt.status]}`}>{statusLabels[apt.status]}</span>
                                                </div>
                                                <div className="text-xs mt-1 space-y-0.5">
                                                    <p className="flex items-center gap-1">
                                                        <IconClock size={14} />
                                                        {toDisplayDate(apt.scheduled_at).split(' ').slice(1, 3).join(' ')},
                                                        {toDisplayTime(apt.scheduled_at) || '00:00'}
                                                    </p>
                                                    <p>
                                                        <span className="font-medium">{apt.mechanic?.name || '-'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>

                {/* Booking Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md">
                            <CardHeader className="flex items-center justify-between">
                                <CardTitle>Booking Appointment</CardTitle>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                >
                                    <IconX size={20} strokeWidth={1.5} />
                                </button>
                            </CardHeader>
                            <CardBody>
                                <form onSubmit={handleBookAppointment} className="space-y-4">
                                    {/* Date Display */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Tanggal Booking
                                        </label>
                                        <input
                                            type="text"
                                            disabled
                                            value={selectedDate ? toDisplayDateLong(`${selectedDate} 00:00:00`) : ""}
                                            className="w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800"
                                        />
                                    </div>

                                    {/* Mechanic Select */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Pilih Mekanik
                                        </label>
                                        <select
                                            value={selectedMechanic}
                                            onChange={(e) => handleMechanicSelect(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        >
                                            <option value="" disabled>-- Pilih Mekanik --</option>
                                            {mechanics.map((mechanic) => (
                                                <option key={mechanic.id} value={mechanic.id}>
                                                    {mechanic.name} ({mechanic.specialty})
                                                </option>
                                            ))}
                                        </select>
                                        <p className="mt-1 text-xs text-gray-500">Pilih mekanik untuk melihat jam tersedia.</p>
                                    </div>

                                    {/* Customer Selector */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Pilih Pelanggan (opsional)
                                        </label>
                                        {selectedCustomer ? (
                                            <div className="flex items-center justify-between px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-800">
                                                <div>
                                                    <p className="text-sm font-medium">{selectedCustomer.name}</p>
                                                    <p className="text-xs text-gray-500">{selectedCustomer.phone}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="text-sm text-red-600 hover:underline"
                                                    onClick={() => setSelectedCustomer(null)}
                                                >
                                                    Ganti
                                                </button>
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-2.5 text-gray-400">
                                                        <IconSearch size={16} />
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={customerQuery}
                                                        onChange={(e) => {
                                                            const q = e.target.value;
                                                            setCustomerQuery(q);
                                                            setCustomerError("");
                                                            if (q && q.length >= 1) {
                                                                setCustomerLoading(true);
                                                                fetch(route('customers.search') + `?q=${encodeURIComponent(q)}`)
                                                                    .then(async (r) => {
                                                                        if (!r.ok) {
                                                                            throw new Error(`HTTP ${r.status}`);
                                                                        }
                                                                        return r.json();
                                                                    })
                                                                    .then((data) => setCustomerResults(data.data || []))
                                                                    .catch((err) => {
                                                                        setCustomerResults([]);
                                                                        setCustomerError('Tidak dapat mencari pelanggan. Pastikan Anda memiliki akses dan koneksi stabil.');
                                                                    })
                                                                    .finally(() => setCustomerLoading(false));
                                                            } else {
                                                                setCustomerResults([]);
                                                            }
                                                        }}
                                                        placeholder="Cari nama/telepon pelanggan..."
                                                        className="w-full pl-8 pr-3 py-2 border rounded-lg"
                                                    />
                                                </div>
                                                {customerError && (
                                                    <p className="text-xs text-red-600 mt-1">{customerError}</p>
                                                )}
                                                {customerLoading && (
                                                    <p className="text-xs text-gray-500 mt-1">Mencari pelanggan...</p>
                                                )}
                                                {!customerLoading && customerQuery && customerResults.length === 0 && !showNewCustomerForm && (
                                                    <div className="mt-1 flex items-center justify-between">
                                                        <p className="text-xs text-gray-500">Tidak ada hasil.</p>
                                                        {customerQuery.length >= 3 && (
                                                            <button
                                                                type="button"
                                                                className="text-xs text-blue-600 hover:underline"
                                                                onClick={() => {
                                                                    setShowNewCustomerForm(true);
                                                                    setNewCustomerName(customerQuery);
                                                                }}
                                                            >
                                                                Tambah pelanggan baru
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                                {!customerLoading && customerResults.length > 0 && (
                                                    <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg divide-y">
                                                        {customerResults.map((c) => (
                                                            <button
                                                                type="button"
                                                                key={c.id}
                                                                onClick={() => {
                                                                    setSelectedCustomer(c);
                                                                    setCustomerResults([]);
                                                                }}
                                                                className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                            >
                                                                <p className="text-sm font-medium">{c.name}</p>
                                                                <p className="text-xs text-gray-500">{c.phone}</p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                {showNewCustomerForm && (
                                                    <div className="mt-2 p-3 border rounded-lg space-y-2">
                                                        <div>
                                                            <label className="block text-xs text-gray-600 mb-1">Nama</label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-3 py-2 border rounded"
                                                                value={newCustomerName}
                                                                onChange={(e) => setNewCustomerName(e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-600 mb-1">No. Telepon</label>
                                                            <input
                                                                type="text"
                                                                className="w-full px-3 py-2 border rounded"
                                                                value={newCustomerPhone}
                                                                onChange={(e) => setNewCustomerPhone(e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-600 mb-1">Email (opsional)</label>
                                                            <input
                                                                type="email"
                                                                className="w-full px-3 py-2 border rounded"
                                                                value={newCustomerEmail}
                                                                onChange={(e) => setNewCustomerEmail(e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-600 mb-1">Alamat</label>
                                                            <textarea
                                                                className="w-full px-3 py-2 border rounded"
                                                                rows={2}
                                                                value={newCustomerAddress}
                                                                onChange={(e) => setNewCustomerAddress(e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                                                                disabled={creatingCustomer || !newCustomerName || !newCustomerPhone || !newCustomerAddress}
                                                                onClick={async () => {
                                                                    try {
                                                                        setCreatingCustomer(true);
                                                                        const res = await fetch(route('customers.storeAjax'), {
                                                                            method: 'POST',
                                                                            headers: {
                                                                                'Content-Type': 'application/json',
                                                                                'X-CSRF-TOKEN': csrfToken,
                                                                                'Accept': 'application/json',
                                                                            },
                                                                            body: JSON.stringify({
                                                                                name: newCustomerName,
                                                                                no_telp: newCustomerPhone,
                                                                                email: newCustomerEmail,
                                                                                address: newCustomerAddress,
                                                                            }),
                                                                        });
                                                                        const data = await res.json();
                                                                        if (!res.ok || !data.success) {
                                                                            const errorMsg = data.message || 'Gagal membuat pelanggan.';
                                                                            alert(`Gagal menambahkan pelanggan: ${errorMsg}`);
                                                                            setCreatingCustomer(false);
                                                                            return;
                                                                        }
                                                                        setSelectedCustomer(data.customer);
                                                                        setShowNewCustomerForm(false);
                                                                        setCustomerQuery("");
                                                                        setCustomerResults([]);
                                                                        setNewCustomerEmail("");
                                                                        setNewCustomerName("");
                                                                        setNewCustomerPhone("");
                                                                        setNewCustomerAddress("");
                                                                        alert('Pelanggan berhasil ditambahkan!');
                                                                        setCreatingCustomer(false);
                                                                    } catch (e) {
                                                                        console.error('Error adding customer:', e);
                                                                        alert('Gagal menambahkan pelanggan. Periksa console untuk detail.');
                                                                        setCreatingCustomer(false);
                                                                    }
                                                                }}
                                                            >
                                                                {creatingCustomer ? 'Menyimpan...' : 'Simpan & Pilih'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="px-3 py-2 border rounded"
                                                                onClick={() => setShowNewCustomerForm(false)}
                                                            >
                                                                Batal
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">Opsional, untuk mengaitkan appointment dengan pelanggan.</p>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Catatan (opsional)
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Tambahkan catatan, keluhan, atau permintaan khusus..."
                                            rows={3}
                                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Catatan akan ditampilkan saat melihat detail appointment.</p>
                                    </div>

                                    {/* Time Slot Select */}
                                    {selectedMechanic && availableSlotsLoading && (
                                        <div className="text-sm text-gray-600 dark:text-gray-300">Memuat jam tersedia...</div>
                                    )}

                                    {selectedMechanic && !availableSlotsLoading && availableSlots.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">
                                                Jam Tersedia
                                            </label>
                                            <select
                                                value={selectedSlot}
                                                onChange={(e) => setSelectedSlot(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg"
                                            >
                                                <option value="">-- Pilih Jam --</option>
                                                {availableSlots.map((slot, index) => (
                                                    <option key={index} value={slot.timestamp}>
                                                        {slot.display}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {selectedMechanic && !availableSlotsLoading && availableSlots.length === 0 && (
                                        <div className="p-3 bg-yellow-50 dark:bg-yellow-900 rounded-lg text-sm text-yellow-700 dark:text-yellow-200">
                                            Mekanik ini tidak memiliki slot tersedia pada tanggal ini
                                        </div>
                                    )}

                                    {/* Buttons */}
                                    <div className="flex gap-2 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!selectedSlot}
                                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                        >
                                            <IconPlus size={16} className="inline mr-1" />
                                            Booking
                                        </button>
                                    </div>
                                </form>
                            </CardBody>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
