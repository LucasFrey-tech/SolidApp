"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/pages/NavBar";
import Footer from "@/components/pages/Footer";
import { UserProvider } from "./context/UserContext";
import styles from "./dynamicLayout.module.css";

export default function DynamicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideNavbarRoutes = ["/login", "/registro-entidad"];

  const hideNavbar = hideNavbarRoutes.includes(pathname);

  return (
    <UserProvider>
      {!hideNavbar && <Navbar />}

      <main className={!hideNavbar ? styles.mainWithNavbar : styles.main}>
        {children}
      </main>

      {!hideNavbar && <Footer />}
    </UserProvider>
  );
}