"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { fetchUnreadCount } from "@/services/notifications";
import { logout } from "@/services/auth";

export default function Navbar() {
  const [unread, setUnread] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    let timer: any;

    function load() {
      fetchUnreadCount()
        .then((d) => setUnread(d.unread))
        .catch(() => {});
    }

    load();
    timer = setInterval(load, 10000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="logo">TaskFlowPro</div>

      <Link 
        href="/dashboard" 
        className={pathname === "/dashboard" ? "active" : ""}
      >
        Dashboard
      </Link>
<Link 
  href="/tasks"
  className={
    pathname.startsWith("/tasks") || pathname === "/task-detail"
      ? "active"
      : ""
  }
>
  Tasks
</Link>


      <Link 
        href="/notifications" 
        className={pathname === "/notifications" ? "active" : ""}
        style={{ position: "relative" }}
      >
        Notifications
      <span
  className="notif-badge"
  style={{ display: unread > 0 ? "inline-block" : "none" }}
>
  {unread}
</span>

      </Link>

      <Link 
        href="/profile"
        className={pathname === "/profile" ? "active" : ""}
      >
        Profile
      </Link>

      <button onClick={handleLogout} className="btn-logout">
        Logout
      </button>
    </nav>
  );
}