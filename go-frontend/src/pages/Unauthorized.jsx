import { Link } from 'react-router-dom'

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-sm p-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">403 - Unauthorized</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your account does not have permission to access this page.
        </p>
        <div className="mt-5">
          <Link
            to="/"
            className="inline-flex items-center rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
