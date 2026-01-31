'use client';

import { BaseApi } from '@/API/baseApi';
import { NumericInput } from '../../Utils/NumericInputProp';
import styles from '@/styles/data/userData.module.css';
import { useCallback, useEffect, useState } from 'react';
import { User } from '@/API/types/user';

type EditableUserFields = Pick<User, 
  'calle' | 'numero' | 'departamento' | 'codigoPostal' | 
  'provincia' | 'ciudad' | 'prefijo' | 'telefono'
>;

const defaultEditableData: EditableUserFields = {
  calle: '',
  numero: '',
  departamento: '',
  codigoPostal: '',
  provincia: '',
  ciudad: '',
  prefijo: '',
  telefono: ''
}

export default function UserData() {
  const [userData, setUserData] = useState<User>();
  const [editableData, setEditableData] = useState<EditableUserFields>(defaultEditableData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    const api = new BaseApi();
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if(!token) {
          throw new Error('No hay token disponible');
        }

        const payload = JSON.parse(atob(token.split('.')[1]));

        const response = await api.users.getOne(payload.sub);

        if (!response) {
          throw new Error('Error al obtener los datos');
        }
      
        setUserData(response);
        const { calle, numero, departamento, codigoPostal, provincia, ciudad, prefijo, telefono } = response;
        setEditableData({
          calle: calle || '',
          numero: numero || '',
          departamento: departamento || '',
          codigoPostal: codigoPostal || '',
          provincia: provincia || '',
          ciudad: ciudad || '',
          prefijo: prefijo || '',
          telefono: telefono || ''
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const handleInputChange = useCallback((field: keyof EditableUserFields, value: string) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }));
    
    setSuccess(false);
    setError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const api = new BaseApi();

      await api.users.update(userData.id, editableData);
      
      setSuccess(true);
      
      const updatedUser = await api.users.getOne(userData.id);
      setUserData(updatedUser);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al guardar cambios');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando datos de usuario...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <main className={styles.Content}>
      <form className={styles.Form} onSubmit={handleSubmit}>
        {/* ===== DATOS PERSONALES ===== */}
        <section className={styles.Section}>
          <h2 className={styles.Subtitle}>Datos personales</h2>

          <div className={styles.Grid}>
            <div className={styles.Field}>
              <label className={styles.Label}>Número de DNI</label>
              <NumericInput className={styles.Input} value={userData?.documento} readOnly />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Nombre</label>
              <input className={styles.Input} type="text" value={userData?.nombre} readOnly />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Apellido</label>
              <input className={styles.Input} type="text" value={userData?.apellido} readOnly />
            </div>
          </div>
        </section>

        {/* ===== DIRECCIÓN ===== */}
        <section className={styles.Section}>
          <h2 className={styles.Subtitle}>Información de dirección</h2>

          <div className={styles.Grid}>
            <div className={styles.Field}>
              <label className={styles.Label}>Calle</label>
              <input className={styles.Input} type="text" value={editableData?.calle || ''} onChange={(e) => handleInputChange('calle', e.target.value)} placeholder="Ej: Av. Siempre Viva" />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Número</label>
              <NumericInput className={styles.Input} value={editableData?.numero || ''} onChange={(e) => handleInputChange('numero', e.target.value)} placeholder="123" />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>
                Departamento <span className={styles.Optional}>(opcional)</span>
              </label>
              <input className={styles.Input} type="text" value={editableData?.departamento || ''} onChange={(e) => handleInputChange('departamento', e.target.value)} placeholder="A, 1º," />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Código Postal</label>
              <NumericInput className={styles.Input} value={editableData?.codigoPostal || ''} onChange={(e) => handleInputChange('codigoPostal', e.target.value)} placeholder="1234" />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Provincia</label>
              <input className={styles.Input} type="text" value={editableData?.provincia || ''} onChange={(e) => handleInputChange('provincia', e.target.value)} placeholder="Buenos Aires"/>
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Ciudad</label>
              <input className={styles.Input} type="text" value={editableData?.ciudad || ''} onChange={(e) => handleInputChange('ciudad', e.target.value)} placeholder="CABA" />
            </div>
          </div>
        </section>

        {/* ===== CONTACTO ===== */}
        <section className={styles.Section}>
          <h2 className={styles.Subtitle}>Información de contacto</h2>

          <div className={styles.Grid}>
            <div className={styles.Field}>
              <label className={styles.Label}>Prefijo</label>
              <NumericInput className={styles.Input} value={editableData?.prefijo || ''} maxLength={5} onChange={(e) => handleInputChange('prefijo', e.target.value)} placeholder="11" />
            </div>

            <div className={styles.Field}>
              <label className={styles.Label}>Teléfono</label>
              <NumericInput className={styles.Input} value={editableData?.telefono || ''} onChange={(e) => handleInputChange('telefono', e.target.value)} placeholder="12345678" />
            </div>
          </div>
        </section>

        {/* Mensajes de éxito/error */}
        {success && (
          <div className={styles.SuccessMessage}>
            ¡Cambios guardados exitosamente!
          </div>
        )}
        
        {error && (
          <div className={styles.ErrorMessage}>
            Error: {error}
          </div>
        )}

        <button type="submit" className={styles.SubmitButton} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </main>
  );
}
