import LoginClient from './LoginClient'

export default function LoginPage({ searchParams }) {
  const from = typeof searchParams?.from === 'string' ? searchParams.from : '/'
  return <LoginClient from={from} />
}
