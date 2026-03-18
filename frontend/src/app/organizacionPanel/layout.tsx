"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { useUser } from "@/app/context/UserContext";
import { Rol } from "@/API/types/auth";
import { GestionTipo } from "@/API/types/gestion/enum";

export default function OrganizacionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;

    if (
      !user ||
      (user.rol !== Rol.COLABORADOR && user.gestion !== GestionTipo.ORGANIZACION)
    ) {
      Swal.fire({
        icon: "error",
        title: "Acceso denegado",
        text: "Solo las organizaciones pueden acceder a este panel.",
        confirmButtonText: "Ir al inicio",
      }).then(() => {
        router.replace("/inicio");
      });
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (
    !user ||
    (user.rol !== Rol.COLABORADOR && user.gestion !== GestionTipo.ORGANIZACION)
  )
    return null;

  return <>{children}</>;
}
