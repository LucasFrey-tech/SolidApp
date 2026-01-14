-- COMANDO PARA REINICCIAR UNA O MAS TABLAS Y QUE TENGAN ID 0
BEGIN TRANSACTION;

DELETE FROM tabla1;
DELETE FROM tabla2;

DBCC CHECKIDENT ('tabla1', RESEED, 0);
DBCC CHECKIDENT ('tabla2', RESEED, 0);

COMMIT;
-- -------------------------------------------------------------------
-- COMANDO EJEMPLO APRA CARGAR DATOS A UNA TABLA
INSERT INTO empresas
(
    nrodocumento,
    razon_social,
    nombre_fantasia,
    descripcion,
    rubro,
    telefono,
    direccion,
    web,
    verificada,
    deshabilitado,
    fecha_registro,
    ultimo_cambio
)
VALUES
(
    '30712345678',
    'Tech Solutions S.A.',
    'TechSolutions',
    'Empresa dedicada al desarrollo de software',
    'Tecnología',
    '011-4567-8900',
    'Av. Corrientes 1234, CABA',
    'https://www.techsolutions.com',
    1,
    0,
    GETDATE(),
    GETDATE()
),
