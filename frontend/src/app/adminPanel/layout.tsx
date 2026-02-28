'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/app/context/UserContext';
import Swal from 'sweetalert2';
import { RolCuenta } from '@/API/types/auth';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== RolCuenta.ADMIN) {
        Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: 'No puedes acceder a esta página.',
          confirmButtonText: 'Ir al inicio',
        }).then(() => {
          router.replace('/inicio');
        });
      }
    }
  }, [user, loading, router]);

  if (loading) return null;

  if (!user || user.role !== RolCuenta.ADMIN) {
    return null;
  }

  return <>{children}</>;
}