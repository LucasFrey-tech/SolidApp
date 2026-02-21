"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useUser } from "@/app/context/UserContext";

export default function EmpresaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || user.userType !== "empresa") {
        Swal.fire({
          icon: "error",
          title: "Acceso denegado",
          text: "Solo las empresas pueden acceder a este panel.",
          confirmButtonText: "Ir al inicio",
        }).then(() => {
          router.replace("/inicio");
        });
      }
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (!user || user.userType !== "empresa") return null;

  return <>{children}</>;
}