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
    ultimo_cambio,
    correo,
    clave
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
    GETDATE(),
    'malbec@gmail.com',
    'vinotinto'
),
(
    '30698765432',
    'Alimentos del Sur SRL',
    'DelSur Foods',
    'Producción y distribución de alimentos',
    'Alimentos',
    '011-4789-3322',
    'Ruta 2 Km 45, La Plata',
    'https://www.delsurfoods.com',
    0,
    0,
    GETDATE(),
    GETDATE(),
    'icardi005@gmail.com',
    'casabonita'
),
(
    '30999888777',
    'Eco Construcciones SA',
    'EcoBuild',
    'Construcción sustentable',
    'Construcción',
    '011-4012-7788',
    'Av. Libertador 850, Vicente López',
    'https://www.ecobuild.com.ar',
    1,
    0,
    GETDATE(),
    GETDATE(),
    'miguela@gmail.com',
    '123455abc'
);


-- ///////////////////////////////////

INSERT INTO beneficios
(
    id_empresa,
    titulo,
    tipo,
    detalle,
    cantidad,
    valor,
    fecha_registro,
    ultimo_cambio
)
VALUES
(
    1,
    'Descuento en Software',
    'Descuento',
    '20% de descuento en licencias anuales',
    100,
    120,
    GETDATE(),
    GETDATE()
),
(
    1,
    'Capacitación Gratuita',
    'Servicio',
    'Curso online de introducción a programación',
    50,
    100,
    GETDATE(),
    GETDATE()
),
(
    2,
    'Caja de Alimentos',
    'Producto',
    'Caja mensual de productos alimenticios',
    200,
    75,
    GETDATE(),
    GETDATE()
),
(
    3,
    'Asesoría Técnica',
    'Servicio',
    'Asesoría en construcción sustentable',
    30,
    55,
    GETDATE(),
    GETDATE()
);