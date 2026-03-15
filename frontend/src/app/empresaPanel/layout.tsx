"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useUser } from "@/app/context/UserContext";
import { Rol } from "@/API/types/auth";
import { GestionTipo } from "@/API/types/gestion/enum";

export default function EmpresaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) return;

    if (user.rol !== Rol.GESTOR && user.gestion !== GestionTipo.EMPRESA) {
      Swal.fire({
        icon: "error",
        title: "Acceso denegado",
        text: "Solo las empresas pueden acceder a este panel.",
        confirmButtonText: "Ir al inicio",
      }).then(() => {
        router.replace("/inicio");
      });
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (
    !user ||
    (user.rol !== Rol.GESTOR && user.gestion !== GestionTipo.EMPRESA)
  )
    return null;

  return <>{children}</>;
}
