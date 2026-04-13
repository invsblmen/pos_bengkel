import Can from '@/components/Can'

export default function AdminPanel() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>

      <Can
        permissions={['users-access', 'roles-access', 'permissions-access']}
        fallback={<p className="mt-2 text-slate-600">You do not have access to this section.</p>}
      >
        <p className="mt-2 text-slate-600">
          This page is restricted by Laravel-style permissions.
        </p>
      </Can>
    </div>
  )
}
