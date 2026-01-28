import "@/app/globals.css";
import "@/app/styles/login.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="login-page">
      {children}
    </div>
  );
}