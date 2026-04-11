package httpserver

import (
	"database/sql"
	"fmt"
	"math"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type overallReportFilters struct {
	StartDate time.Time
	EndDate   time.Time
	Source    string
	Status    string
	PerPage   int
	Page      int
}

type overallReportRow struct {
	EventAt        string
	Source         string
	Reference      string
	Description    string
	Flow           string
	Amount         int64
	Status         string
	RunningBalance int64
}

func overallReportHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if db == nil {
			writeJSON(w, http.StatusServiceUnavailable, response{"message": "database is not configured"})
			return
		}

		filters := parseOverallReportFilters(r)
		referenceColumn, err := detectPartSaleReferenceColumn(db)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, response{"message": "failed to detect part sales reference column"})
			return
		}

		serviceRevenue, err := overallServiceRevenue(db, filters)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, response{"message": "failed to read service revenue"})
			return
		}

		partRevenue, err := overallPartRevenue(db, filters)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, response{"message": "failed to read part revenue"})
			return
		}

		cashIn, cashOut, err := overallCashFlow(db, filters)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, response{"message": "failed to read cash flow"})
			return
		}

		statusOptions, err := overallStatusOptions(db, filters, referenceColumn)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, response{"message": "failed to read status options: " + err.Error()})
			return
		}

		effectiveStatus := filters.Status
		if effectiveStatus != "all" {
			valid := false
			for _, item := range statusOptions {
				if item["value"] == effectiveStatus {
					valid = true
					break
				}
			}
			if !valid {
				effectiveStatus = "all"
			}
		}

		statusSummary, err := overallStatusSummary(db, filters, referenceColumn)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, response{"message": "failed to read status summary: " + err.Error()})
			return
		}

		transactions, transactionCount, err := overallTransactions(db, filters, effectiveStatus, referenceColumn)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, response{"message": "failed to read transactions: " + err.Error()})
			return
		}

		writeJSON(w, http.StatusOK, response{
			"filters": response{
				"start_date": filters.StartDate.Format("2006-01-02"),
				"end_date":   filters.EndDate.Format("2006-01-02"),
				"source":     filters.Source,
				"status":     effectiveStatus,
				"per_page":   filters.PerPage,
			},
			"statusOptions": statusOptions,
			"statusSummary": statusSummary,
			"summary": response{
				"service_revenue":   serviceRevenue,
				"part_revenue":      partRevenue,
				"total_revenue":     serviceRevenue + partRevenue,
				"cash_in":           cashIn,
				"cash_out":          cashOut,
				"net_cash_flow":     cashIn - cashOut,
				"transaction_count": transactionCount,
			},
			"transactions": transactions,
		})
	}
}

func parseOverallReportFilters(r *http.Request) overallReportFilters {
	now := time.Now()
	startDefault := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	endDefault := now

	q := r.URL.Query()
	startDate := parseDateOnlyOrDefault(q.Get("start_date"), startDefault)
	endDate := parseDateOnlyOrDefault(q.Get("end_date"), endDefault)

	source := strings.TrimSpace(q.Get("source"))
	switch source {
	case "all", "service_order", "part_sale", "cash_transaction":
	default:
		source = "all"
	}

	status := strings.TrimSpace(q.Get("status"))
	if status == "" {
		status = "all"
	}

	perPage := parsePositiveInt(q.Get("per_page"), 20)
	if perPage < 10 {
		perPage = 10
	}
	if perPage > 100 {
		perPage = 100
	}

	page := parsePositiveInt(q.Get("page"), 1)

	return overallReportFilters{
		StartDate: startDate,
		EndDate:   endDate,
		Source:    source,
		Status:    status,
		PerPage:   perPage,
		Page:      page,
	}
}

func parseDateOnlyOrDefault(raw string, fallback time.Time) time.Time {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return fallback
	}

	parsed, err := time.Parse("2006-01-02", raw)
	if err != nil {
		return fallback
	}

	return parsed
}

func overallRowsSubquery(partSaleReferenceColumn string) string {
	return fmt.Sprintf(`
		SELECT so.created_at AS event_at, 'service_order' AS source, so.order_number AS reference,
		       TRIM(CONCAT_WS(' | ', COALESCE(c.name, ''), COALESCE(v.plate_number, ''))) AS description,
		       'in' AS flow,
		       COALESCE(so.grand_total, so.total, COALESCE(so.labor_cost, 0) + COALESCE(so.material_cost, 0)) AS amount,
		       so.status AS status
		FROM service_orders so
		LEFT JOIN customers c ON c.id = so.customer_id
		LEFT JOIN vehicles v ON v.id = so.vehicle_id
		WHERE so.status IN ('completed', 'paid')
		  AND so.created_at BETWEEN ? AND ?
		UNION ALL
		SELECT ps.created_at AS event_at, 'part_sale' AS source, COALESCE(ps.%s, '') AS reference,
		       COALESCE(c2.name, '') AS description,
		       'in' AS flow,
		       COALESCE(ps.grand_total, 0) AS amount,
		       ps.status AS status
		FROM part_sales ps
		LEFT JOIN customers c2 ON c2.id = ps.customer_id
		WHERE ps.status != 'cancelled'
		  AND ps.created_at BETWEEN ? AND ?
		UNION ALL
		SELECT COALESCE(ct.happened_at, ct.created_at) AS event_at, 'cash_transaction' AS source,
		       CONCAT('CASH-', LPAD(ct.id, 6, '0')) AS reference,
		       COALESCE(ct.description, '') AS description,
		       CASE
		           WHEN ct.transaction_type = 'income' THEN 'in'
		           WHEN ct.transaction_type IN ('expense', 'change_given') THEN 'out'
		           ELSE 'neutral'
		       END AS flow,
		       COALESCE(ct.amount, 0) AS amount,
		       ct.transaction_type AS status
		FROM cash_transactions ct
		WHERE (
			(ct.happened_at BETWEEN ? AND ?)
			OR (ct.happened_at IS NULL AND ct.created_at BETWEEN ? AND ?)
		)
	`, partSaleReferenceColumn)
}

func overallRowsArgs(filters overallReportFilters) []any {
	start := filters.StartDate.Format("2006-01-02 15:04:05")
	end := filters.EndDate.Format("2006-01-02 15:04:05")
	return []any{start, end, start, end, start, end, start, end}
}

func overallOuterWhere(filters overallReportFilters, status string) (string, []any) {
	clauses := make([]string, 0)
	args := make([]any, 0)

	if filters.Source != "all" {
		clauses = append(clauses, "items.source = ?")
		args = append(args, filters.Source)
	}
	if status != "all" {
		clauses = append(clauses, "items.status = ?")
		args = append(args, status)
	}

	if len(clauses) == 0 {
		return "", args
	}

	return " WHERE " + strings.Join(clauses, " AND "), args
}

func overallServiceRevenue(db *sql.DB, filters overallReportFilters) (int64, error) {
	q := `
		SELECT COALESCE(SUM(COALESCE(grand_total, total, COALESCE(labor_cost, 0) + COALESCE(material_cost, 0))), 0)
		FROM service_orders
		WHERE status IN ('completed', 'paid')
		  AND created_at BETWEEN ? AND ?
	`
	var total sql.NullInt64
	if err := db.QueryRow(q, filters.StartDate.Format("2006-01-02 15:04:05"), filters.EndDate.Format("2006-01-02 15:04:05")).Scan(&total); err != nil {
		return 0, err
	}
	return int64OrZero(total), nil
}

func overallPartRevenue(db *sql.DB, filters overallReportFilters) (int64, error) {
	q := `
		SELECT COALESCE(SUM(COALESCE(grand_total, 0)), 0)
		FROM part_sales
		WHERE status != 'cancelled'
		  AND created_at BETWEEN ? AND ?
	`
	var total sql.NullInt64
	if err := db.QueryRow(q, filters.StartDate.Format("2006-01-02 15:04:05"), filters.EndDate.Format("2006-01-02 15:04:05")).Scan(&total); err != nil {
		return 0, err
	}
	return int64OrZero(total), nil
}

func overallCashFlow(db *sql.DB, filters overallReportFilters) (int64, int64, error) {
	q := `
		SELECT
			COALESCE(SUM(CASE WHEN transaction_type = 'income' THEN amount ELSE 0 END), 0) AS cash_in,
			COALESCE(SUM(CASE WHEN transaction_type IN ('expense', 'change_given') THEN amount ELSE 0 END), 0) AS cash_out
		FROM cash_transactions
		WHERE (
			(happened_at BETWEEN ? AND ?)
			OR (happened_at IS NULL AND created_at BETWEEN ? AND ?)
		)
	`
	start := filters.StartDate.Format("2006-01-02 15:04:05")
	end := filters.EndDate.Format("2006-01-02 15:04:05")
	var cashIn sql.NullInt64
	var cashOut sql.NullInt64
	if err := db.QueryRow(q, start, end, start, end).Scan(&cashIn, &cashOut); err != nil {
		return 0, 0, err
	}
	return int64OrZero(cashIn), int64OrZero(cashOut), nil
}

func overallStatusOptions(db *sql.DB, filters overallReportFilters, partSaleReferenceColumn string) ([]response, error) {
	base := overallRowsSubquery(partSaleReferenceColumn)
	baseArgs := overallRowsArgs(filters)
	clauses := []string{"items.status IS NOT NULL", "items.status != ''"}
	args := append([]any{}, baseArgs...)

	if filters.Source != "all" {
		clauses = append(clauses, "rows.source = ?")
		args = append(args, filters.Source)
	}

	q := `
		SELECT DISTINCT items.status
		FROM (` + base + `) items
		WHERE ` + strings.Join(clauses, " AND ") + `
		ORDER BY items.status ASC
	`

	rows, err := db.Query(q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]response, 0)
	for rows.Next() {
		var status sql.NullString
		if err := rows.Scan(&status); err != nil {
			return nil, err
		}
		if !status.Valid || strings.TrimSpace(status.String) == "" {
			continue
		}
		items = append(items, response{
			"value": status.String,
			"label": formatOverallStatusLabel(status.String),
		})
	}

	return items, rows.Err()
}

func overallStatusSummary(db *sql.DB, filters overallReportFilters, partSaleReferenceColumn string) ([]response, error) {
	base := overallRowsSubquery(partSaleReferenceColumn)
	baseArgs := overallRowsArgs(filters)
	clauses := []string{"items.status IS NOT NULL", "items.status != ''"}
	args := append([]any{}, baseArgs...)

	if filters.Source != "all" {
		clauses = append(clauses, "rows.source = ?")
		args = append(args, filters.Source)
	}

	q := `
		SELECT items.status,
		       COUNT(*) AS count,
		       SUM(CASE WHEN items.flow = 'in' THEN items.amount WHEN items.flow = 'out' THEN -items.amount ELSE 0 END) AS net_amount
		FROM (` + base + `) items
		WHERE ` + strings.Join(clauses, " AND ") + `
		GROUP BY items.status
		ORDER BY count DESC
	`

	rows, err := db.Query(q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]response, 0)
	for rows.Next() {
		var status sql.NullString
		var count sql.NullInt64
		var netAmount sql.NullInt64
		if err := rows.Scan(&status, &count, &netAmount); err != nil {
			return nil, err
		}
		items = append(items, response{
			"value":      overallNullStringValue(status),
			"label":      formatOverallStatusLabel(overallNullStringValue(status)),
			"count":      int64OrZero(count),
			"net_amount": int64OrZero(netAmount),
		})
	}

	return items, rows.Err()
}

func overallTransactions(db *sql.DB, filters overallReportFilters, effectiveStatus, partSaleReferenceColumn string) (response, int64, error) {
	base := overallRowsSubquery(partSaleReferenceColumn)
	baseArgs := overallRowsArgs(filters)
	where, whereArgs := overallOuterWhere(filters, effectiveStatus)

	countQuery := `SELECT COUNT(*) FROM (` + base + `) items` + where
	countArgs := append([]any{}, baseArgs...)
	countArgs = append(countArgs, whereArgs...)

	var total sql.NullInt64
	if err := db.QueryRow(countQuery, countArgs...).Scan(&total); err != nil {
		return nil, 0, err
	}

	totalRows := int64OrZero(total)
	lastPage := 1
	if totalRows > 0 {
		lastPage = int(math.Ceil(float64(totalRows) / float64(filters.PerPage)))
	}

	currentPage := filters.Page
	if currentPage < 1 {
		currentPage = 1
	}
	if currentPage > lastPage {
		currentPage = lastPage
	}

	pageQuery := `
		SELECT event_at, source, reference, description, flow, amount, status, running_balance
		FROM (
			SELECT items.event_at, items.source, items.reference, items.description, items.flow, items.amount, items.status,
				SUM(CASE WHEN items.flow = 'in' THEN items.amount WHEN items.flow = 'out' THEN -items.amount ELSE 0 END)
				OVER (ORDER BY items.event_at ASC, items.reference ASC) AS running_balance
			FROM (` + base + `) items
		` + where + `
		) ranked
		ORDER BY event_at DESC, reference DESC
		LIMIT ? OFFSET ?
	`

	queryArgs := append([]any{}, baseArgs...)
	queryArgs = append(queryArgs, whereArgs...)
	queryArgs = append(queryArgs, filters.PerPage, (currentPage-1)*filters.PerPage)

	rows, err := db.Query(pageQuery, queryArgs...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	items := make([]response, 0)
	for rows.Next() {
		var eventAt sql.NullString
		var source sql.NullString
		var reference sql.NullString
		var description sql.NullString
		var flow sql.NullString
		var amount sql.NullInt64
		var status sql.NullString
		var runningBalance sql.NullInt64

		if err := rows.Scan(&eventAt, &source, &reference, &description, &flow, &amount, &status, &runningBalance); err != nil {
			return nil, 0, err
		}

		dateValue := overallNullStringValue(eventAt)
		sourceValue := overallNullStringValue(source)
		referenceValue := overallNullStringValue(reference)
		statusValue := overallNullStringValue(status)

		items = append(items, response{
			"id":              sourceValue + "-" + referenceValue,
			"date":            dateValue,
			"date_unix":       0,
			"source":          sourceValue,
			"reference":       referenceValue,
			"description":     overallNullStringValue(description),
			"flow":            overallNullStringValue(flow),
			"amount":          int64OrZero(amount),
			"status":          statusValue,
			"status_label":    formatOverallStatusLabel(statusValue),
			"running_balance": int64OrZero(runningBalance),
		})
	}
	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	from, to := paginationBounds(totalRows, currentPage, filters.PerPage)
	path := "/reports/overall"
	query := overallReportQueryValues(filters, effectiveStatus)
	firstPageURL := buildReportIndexURL(path, query, 1)
	lastPageURL := buildReportIndexURL(path, query, lastPage)
	prevPageURL := ""
	if currentPage > 1 {
		prevPageURL = buildReportIndexURL(path, query, currentPage-1)
	}
	nextPageURL := ""
	if currentPage < lastPage {
		nextPageURL = buildReportIndexURL(path, query, currentPage+1)
	}

	return response{
		"current_page":   currentPage,
		"data":           items,
		"first_page_url": firstPageURL,
		"from":           from,
		"last_page":      lastPage,
		"last_page_url":  lastPageURL,
		"per_page":       filters.PerPage,
		"links":          buildReportIndexLinks(path, query, currentPage, lastPage),
		"next_page_url":  nextPageURL,
		"path":           path,
		"prev_page_url":  prevPageURL,
		"to":             to,
		"total":          totalRows,
	}, totalRows, nil
}

func overallReportQueryValues(filters overallReportFilters, status string) url.Values {
	values := url.Values{}
	if filters.StartDate.IsZero() == false {
		values.Set("start_date", filters.StartDate.Format("2006-01-02"))
	}
	if filters.EndDate.IsZero() == false {
		values.Set("end_date", filters.EndDate.Format("2006-01-02"))
	}
	if filters.Source != "" && filters.Source != "all" {
		values.Set("source", filters.Source)
	}
	if status != "" && status != "all" {
		values.Set("status", status)
	}
	if filters.PerPage > 0 {
		values.Set("per_page", fmt.Sprintf("%d", filters.PerPage))
	}
	return values
}

func formatOverallStatusLabel(status string) string {
	labels := map[string]string{
		"completed":       "Selesai",
		"paid":            "Lunas",
		"draft":           "Draft",
		"confirmed":       "Dikonfirmasi",
		"waiting_stock":   "Menunggu Stok",
		"ready_to_notify": "Siap Diberitahu",
		"waiting_pickup":  "Menunggu Diambil",
		"cancelled":       "Dibatalkan",
		"income":          "Kas Masuk",
		"expense":         "Kas Keluar",
		"change_given":    "Kembalian",
		"adjustment":      "Penyesuaian",
	}

	if label, ok := labels[status]; ok {
		return label
	}
	if strings.TrimSpace(status) == "" {
		return "-"
	}
	return strings.Title(strings.ReplaceAll(status, "_", " "))
}

func overallNullStringValue(value sql.NullString) string {
	if value.Valid {
		return value.String
	}
	return ""
}
