"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    
    if (!token) {
      router.push("/auth/login");
    } else {
      setIsChecking(false);
    }
  }, [router]);

  // Show nothing while checking (prevents hydration mismatch)
  if (isChecking) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}