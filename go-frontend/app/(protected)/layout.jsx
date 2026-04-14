import ProtectedShell from '../_components/ProtectedShell'

export default function ProtectedLayout({ children }) {
  return <ProtectedShell>{children}</ProtectedShell>
}
