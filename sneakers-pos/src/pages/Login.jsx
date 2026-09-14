import BrandingPanel from '../components/login/BrandingPanel'
import LoginForm from '../components/login/LoginForm'

export default function Login() {
  return (
    <div className="min-h-screen flex">
      <BrandingPanel />
      <LoginForm />
    </div>
  )
}