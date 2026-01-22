import React from "react";

export function Card({ children, className = "" }) {
  return (
    <div className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm ${className}`}>{children}</div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`px-4 py-3 border-b border-gray-200 dark:border-gray-700 ${className}`}>{children}</div>
  );
}

export function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
  );
}

export function CardBody({ children, className = "" }) {
  return (
    <div className={`px-4 py-3 ${className}`}>{children}</div>
  );
}
