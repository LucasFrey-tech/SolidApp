"use client";

import { useEffect, useState } from "react";
import { Edit2 } from "lucide-react";
import Swal from "sweetalert2";

import styles from "@/styles/organizationPanel.module.css";
import formStyles from "@/styles/campaignPanel.module.css";

import { BeneficiosService } from "@/API/class/beneficios";
import { CouponForm } from "./cuponForm";
import { useUser } from "@/app/context/UserContext";

/* ===============================
   TIPOS
================================ */
type Coupon = {
  id: number;
  titulo: string;
  detalle: string;
  cantidad: number;
  valor: number;
  estado: "pendiente" | "aprobado" | "rechazado";
};

/* ===============================
   API
================================ */
const api = new BeneficiosService();

/* ===============================
   COMPONENTE
================================ */
export default function OrganizationCouponsPage() {
  const { user } = useUser();
  const empresaId = user?.sub; // 🔹 usar el ID del usuario logueado (empresa)

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [open, setOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);

  /* ===============================
     CARGAR CUPONES
  ================================ */
  const loadCoupons = async () => {
    if (!empresaId) return; // si no hay empresaId no hacemos nada
    try {
      setLoading(true);
      const data = await api.getByEmpresa(empresaId);

      // 🔹 Transformar datos para que siempre tengan 'estado'
      const couponsWithEstado: Coupon[] = data.map((b: any) => ({
        id: b.id,
        titulo: b.titulo,
        detalle: b.detalle,
        cantidad: b.cantidad,
        valor: b.valor,
        estado: b.estado || "pendiente",
      }));

      setCoupons(couponsWithEstado);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron cargar los cupones", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, [empresaId]); // 🔹 Dependencia para recargar si cambia empresaId

  /* ===============================
     CREATE / UPDATE
  ================================ */
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
        await api.update(editingCoupon.id, payload);
      } else {
        await api.create(payload);
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

  /* ===============================
     RENDER
  ================================ */
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

      {!loading && coupons.length === 0 && <p>No hay cupones en el momento</p>}

      <ul className={styles.list}>
        {coupons.map((c) => (
          <li key={c.id} className={styles.card}>
            <div>
              <strong>{c.titulo}</strong> — {c.detalle} <br />
              <strong>Cantidad:</strong> {c.cantidad} — {" "}
              <strong>
                {c.valor === 0 ? "Gratis" : `Puntos: ${c.valor} `}
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

      {open && (
        <div
          className={formStyles.modalOverlay}
          onClick={() => setOpen(false)}
        >
          <div
            className={formStyles.modal}
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
