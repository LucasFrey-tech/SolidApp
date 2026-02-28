"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useUser } from "@/app/context/UserContext";
import { RolCuenta } from "@/API/types/auth";

export default function OrganizacionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== RolCuenta.ORGANIZACION) {
        Swal.fire({
          icon: "error",
          title: "Acceso denegado",
          text: "Solo las organizaciones pueden acceder a este panel.",
          confirmButtonText: "Ir al inicio",
        }).then(() => {
          router.replace("/inicio");
        });
      }
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (!user || user.role !== RolCuenta.ORGANIZACION) return null;

  return <>{children}</>;
}