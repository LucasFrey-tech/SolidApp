"use client";

import { useEffect, useState } from "react";
import { Edit2 } from "lucide-react";
import Swal from "sweetalert2";

import styles from "@/styles/Paneles/organizationPanel.module.css";
import modalStyles from "@/styles/Paneles/couponForm.module.css";

import { CouponForm } from "./cuponForm";
import { useUser } from "@/app/context/UserContext";

import { baseApi } from "@/API/baseApi";

type Coupon = {
  id: number;
  titulo: string;
  detalle: string;
  cantidad: number;
  valor: number;
  estado: "pendiente" | "aprobado" | "rechazado";
};


export default function OrganizationCouponsPage() {
  const { user } = useUser();
  const empresaId = user?.sub;

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [open, setOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadCoupons = async () => {
    if (!empresaId) return;

    try {
      setLoading(true);

      const { items, total } =
        await baseApi.empresa.getCuponesPaginated(page, 10);

      const couponsWithEstado: Coupon[] = items.map((b: any) => ({
        id: b.id,
        titulo: b.titulo,
        detalle: b.detalle,
        cantidad: b.cantidad,
        valor: b.valor,
        estado: b.estado || "pendiente",
      }));

      setCoupons(couponsWithEstado);

      const calculatedTotalPages = Math.max(1, Math.ceil(total / 5));
      setTotalPages(calculatedTotalPages);

      if (page > calculatedTotalPages) {
        setPage(calculatedTotalPages);
      }

    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron cargar los cupones", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [empresaId, page]);


  const handleSaveCoupon = async (data: Partial<Coupon>) => {
    if (!empresaId) return;

    try {
      const payload = {
        titulo: data.titulo ?? "",
        detalle: data.detalle ?? "",
        cantidad: data.cantidad ?? 1,
        tipo: "Discount",
        valor: data.valor ?? 0,
        id_empresa: empresaId,
      };

      if (editingCoupon) {
        await baseApi.empresa.updateCupon(editingCoupon.id, payload);
      } else {
        await baseApi.empresa.createCupon(payload);
      }

      Swal.fire({
        title: "¡Guardado!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setEditingCoupon(null);
      setOpen(false);

      await loadCoupons();

    } catch (error) {
      console.error(error);
      Swal.fire(
        "Error",
        "No se pudo guardar el cupón. Verificá los datos.",
        "error"
      );
    }
  };

  return (
    <div className={styles.container}>

      <div className={styles.header}>
        <h2>Panel de Empresa</h2>

        <button
          className={styles.button}
          onClick={() => {
            setEditingCoupon(null);
            setOpen(true);
          }}
        >
          Agregar cupón
        </button>
      </div>

      <div className={styles.divider} />

      {!loading && coupons.length === 0 && (
        <p>No hay cupones en el momento</p>
      )}

      <ul className={styles.list}>
        {coupons.map((c) => (
          <li key={c.id} className={styles.card}>

            <div>
              <strong>{c.titulo}</strong> — {c.detalle} <br />

              <strong>Cantidad:</strong> {c.cantidad} —{" "}

              <strong>
                {c.valor === 0
                  ? "Gratis"
                  : `Puntos: ${c.valor}`}
              </strong>{" "}
              —{" "}

              <span
                style={{
                  color:
                    c.estado === "pendiente"
                      ? "blue"
                      : c.estado === "rechazado"
                      ? "red"
                      : "green",
                }}
              >
                {c.estado}
              </span>

            </div>

            <Edit2
              className={styles.editIcon}
              onClick={() => {
                setEditingCoupon(c);
                setOpen(true);
              }}
            />

          </li>
        ))}
      </ul>

      <div className={styles.pagination}>

        <button
          onClick={() =>
            setPage((p) => Math.max(1, p - 1))
          }
          disabled={page <= 1}
        >
          Anterior
        </button>

        <span>
          Página {page} de {totalPages}
        </span>

        <button
          onClick={() =>
            setPage((p) =>
              Math.min(totalPages, p + 1)
            )
          }
          disabled={page >= totalPages}
        >
          Siguiente
        </button>

      </div>

      {open && (
        <div
          className={modalStyles.overlay}
          onClick={() => setOpen(false)}
        >
          <div
            className={modalStyles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <CouponForm
              coupon={editingCoupon || undefined}
              onClose={() => {
                setOpen(false);
                setEditingCoupon(null);
              }}
              onSuccess={handleSaveCoupon}
            />
          </div>
        </div>
      )}

    </div>
  );
}
