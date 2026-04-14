import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Access Denied</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">403 - Unauthorized</h1>
        <p className="mt-3 text-sm text-slate-600">Akun Anda tidak memiliki izin untuk membuka halaman ini.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">Ke Dashboard</Link>
          <Link href="/login" className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">Ke Login</Link>
        </div>
      </div>
    </div>
  )
}
