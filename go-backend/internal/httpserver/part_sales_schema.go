package httpserver

import "database/sql"

func detectPartSaleReferenceColumn(db *sql.DB) (string, error) {
	const q = `
		SELECT COLUMN_NAME
		FROM information_schema.columns
		WHERE table_schema = DATABASE()
		  AND table_name = 'part_sales'
		  AND column_name IN ('sale_number', 'invoice')
		ORDER BY CASE WHEN column_name = 'sale_number' THEN 0 ELSE 1 END
		LIMIT 1
	`

	var column sql.NullString
	if err := db.QueryRow(q).Scan(&column); err != nil {
		return "", err
	}
	if !column.Valid {
		return "", sql.ErrNoRows
	}

	return column.String, nil
}
