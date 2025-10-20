"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/pages/NavBar";
import { UserProvider } from "./context/UserContext";

export default function DynamicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <UserProvider>
      {!isLoginPage && <Navbar />}
      <main>{children}</main>
    </UserProvider>
  );
}