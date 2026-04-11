# Frontend Parity Matrix (Laravel vs Go)

Last updated: 2026-04-11
Owner: Migration Team
Purpose: Track visual and UX parity so Go-backed screens are indistinguishable from Laravel-backed screens.

Legend:
- [x] Pass
- [~] Partial / in progress
- [ ] Not started
- [!] Blocked

## 1) Parity Criteria (Applied to Every Screen)

- C1 Layout and visual hierarchy are identical (spacing, typography, cards, tables, badges, actions).
- C2 Filters/sort/search/pagination behavior are identical.
- C3 Empty/loading/error states are identical.
- C4 Validation messages and business-rule errors are identical.
- C5 Formatting parity (date, currency, number, status labels) is identical.
- C6 Realtime behavior parity (event trigger timing, update ordering, state refresh) is identical.
- C7 Permission-based visibility and action availability are identical.
- C8 Response payload shape and field semantics are identical.

Pass rule per screen:
- A screen is considered "Parity Pass" only when C1-C8 are all [x] and side-by-side UAT is signed.

## 2) Master Screen Matrix

| Domain | Screen | Laravel Route/Page | Go Feature Key | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | UAT | Overall |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Appointment | Appointment Index | /dashboard/appointments | appointment_index | [~] | [~] | [ ] | [ ] | [~] | [ ] | [ ] | [~] | [ ] | [~] |
| Appointment | Appointment Calendar | /dashboard/appointments/calendar | appointment_calendar | [~] | [~] | [ ] | [ ] | [~] | [ ] | [ ] | [~] | [ ] | [~] |
| Appointment | Available Slots API UX | /dashboard/appointments/get-available-slots | appointment_slots | [~] | [~] | [ ] | [ ] | [~] | [ ] | [ ] | [~] | [ ] | [~] |
| Service Order | Service Order Index | /dashboard/service-orders | service_order_index | [~] | [~] | [ ] | [ ] | [~] | [ ] | [ ] | [~] | [ ] | [~] |
| Vehicle | Vehicle Index | /dashboard/vehicles | vehicle_index | [~] | [~] | [ ] | [ ] | [~] | [ ] | [ ] | [~] | [ ] | [~] |
| Vehicle | Maintenance Insights | /dashboard/vehicles/{id}/maintenance-insights | vehicle_insights | [~] | [~] | [ ] | [ ] | [~] | [ ] | [ ] | [~] | [ ] | [~] |
| Vehicle | Service History | /dashboard/vehicles/{id}/service-history | vehicle_service_history | [~] | [~] | [ ] | [ ] | [~] | [ ] | [ ] | [~] | [ ] | [~] |
| Recommendation | Vehicle Recommendations | /dashboard/vehicles/{id}/recommendations | vehicle_recommendations | [~] | [~] | [ ] | [ ] | [~] | [ ] | [ ] | [~] | [ ] | [~] |
| Recommendation | Maintenance Schedule | /dashboard/vehicles/{id}/maintenance-schedule | vehicle_maintenance_schedule | [~] | [~] | [ ] | [ ] | [~] | [ ] | [ ] | [~] | [ ] | [~] |
| Reports | Part Sales Profit | /dashboard/reports/part-sales-profit | report_part_sales_profit | [~] | [~] | [ ] | [ ] | [~] | [ ] | [ ] | [~] | [ ] | [~] |
| Reports | Part Sales Profit by Supplier | /dashboard/reports/part-sales-profit/by-supplier | report_part_sales_profit_by_supplier | [~] | [~] | [ ] | [ ] | [~] | [ ] | [ ] | [~] | [ ] | [~] |
| Reports | Overall Report | /dashboard/reports/overall | report_overall | [~] | [~] | [ ] | [ ] | [~] | [ ] | [ ] | [~] | [ ] | [~] |
| Sync Ops | Sync Dashboard | /dashboard/sync | n/a | [~] | [~] | [~] | [~] | [~] | [ ] | [~] | [~] | [ ] | [~] |
| Import Ops | Import Dashboard | /dashboard/imports | n/a | [~] | [~] | [~] | [~] | [~] | [ ] | [~] | [~] | [ ] | [~] |

## 3) Critical Flow Checklist (Cross-Screen)

- [ ] Login -> dashboard -> navigate all migrated pages without visual jump/regression.
- [ ] Filter + sort + pagination returns identical row counts and ordering between Laravel and Go.
- [ ] Empty search results show identical state and wording.
- [ ] Business-rule failures show identical UI-friendly errors (no debug page leak).
- [ ] Currency/date formatting consistency verified in all report and transaction pages.
- [ ] Realtime updates (where enabled) have same trigger timing and no duplicate render.
- [ ] Permission matrix check: hidden/disabled actions match exactly for each role.

## 4) Evidence Required per Screen

For each screen marked pass, attach:
- Screenshot A: Laravel-backed view.
- Screenshot B: Go-backed view.
- JSON sample A/B payload snapshot.
- Test note for filter/sort/pagination parity.
- Test note for empty/loading/error state parity.
- UAT sign-off (name/date).

## 5) Weekly Gate

Week considered "frontend parity green" only when:
- 0 critical screens with [!] blocked.
- At least 3 critical screens moved to full [x] C1-C8 + UAT.
- No unresolved high-severity parity defect older than 7 days.

## 6) Notes

- Start with critical screens: Appointment Index, Service Order Index, Vehicle Index, Overall Report.
- Keep one frontend code path when possible; switch backend source only via feature toggle/canary.
- Treat payload contract drift as parity bug, not enhancement.

## 7) UAT Execution Checklist (Per Screen)

Gunakan checklist ini untuk setiap screen yang diuji side-by-side Laravel vs Go.

Pre-check:
- [ ] User role penguji ditetapkan (Admin/Kasir/Service Advisor/Owner).
- [ ] Toggle fitur dicatat (canary %, feature key, source backend aktif).
- [ ] Data sample pengujian disiapkan (normal, empty-case, error-case).

Step uji inti:
- [ ] Buka screen Laravel dan Go dengan filter default yang sama.
- [ ] Bandingkan C1 (layout/visual hierarchy) termasuk tabel, badge, action button.
- [ ] Uji C2 (filter/sort/search/pagination) pada minimal 3 variasi query.
- [ ] Uji C3 (empty/loading/error states) dengan skenario tanpa data dan request lambat.
- [ ] Uji C4 (validation/business-rule errors) dan pastikan pesan setara.
- [ ] Uji C5 (date/currency/number formatting) pada data yang sama.
- [ ] Uji C6 (realtime behavior) untuk urutan update dan no duplicate render.
- [ ] Uji C7 (permission visibility) pada minimal 2 role berbeda.
- [ ] Uji C8 (payload shape) dari network response snapshot A/B.

Evidence wajib:
- [ ] Screenshot Laravel (A) dan Go (B).
- [ ] JSON payload A/B (disamarkan jika berisi data sensitif).
- [ ] Catatan hasil per C1-C8.
- [ ] Keputusan UAT: Pass / Partial / Fail.

## 8) Business Sign-off Template

Gunakan template ini saat review mingguan parity.

Metadata:
- Tanggal review:
- Fitur/Screen yang dibahas:
- Reviewer bisnis:
- Reviewer teknis:

Ringkasan metrik 7 hari terakhir:
- Reconciliation variance batch_total (%):
- Reconciliation variance acknowledged_total (%):
- Shadow mismatch_rate (%):
- Shadow skipped_rate (%):
- Jumlah incident parity severity tinggi:

Keputusan:
- [ ] Sign-off diberikan
- [ ] Sign-off ditunda

Alasan keputusan:
-

Action item jika ditunda:
- Owner:
- Target date:
- Kriteria selesai:
