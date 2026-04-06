
CREATE TABLE beneficios
(
  id                 INT          NOT NULL,
  titulo             VARCHAR(255) NOT NULL,
  tipo               VARCHAR(50)  NOT NULL,
  detalle            VARCHAR(255) NOT NULL,
  cantidad           INT          NOT NULL,
  fecha_registro     DATETIME2    NOT NULL DEFAULT GETDATE,
  ultimo_cambio      DATETIME2    NOT NULL DEFAULT GETDATE,
  valor              INT          NOT NULL,
  estado             VARCHAR(20)  NOT NULL DEFAULT PENDIENTE,
  creado_por_id      INT         ,
  actualizado_por_id INT         ,
  id_empresa         INT         ,
  CONSTRAINT PK_beneficios PRIMARY KEY (id)
)
GO

CREATE TABLE campañas
(
  id                 INT          NOT NULL,
  estado             VARCHAR(20)  NOT NULL,
  titulo             VARCHAR(255) NOT NULL,
  descripcion        VARCHAR(255) NOT NULL,
  fecha_Inicio       DATE         NOT NULL,
  fecha_Fin          DATE         NOT NULL,
  fecha_Registro     DATETIME2    NOT NULL DEFAULT GETDATE,
  objetivo           INT          NOT NULL DEFAULT 0,
  puntos             INT          NOT NULL DEFAULT 0,
  ultimo_cambio      DATETIME2    NOT NULL DEFAULT GETDATE,
  creado_por_id      INT         ,
  actualizado_por_id INT         ,
  id_organizacion    INT         ,
  CONSTRAINT PK_campañas PRIMARY KEY (id)
)
GO

CREATE TABLE contacto
(
  id       INT          NOT NULL,
  correo   VARCHAR(255) NOT NULL,
  prefijo  VARCHAR(5)  ,
  telefono VARCHAR(20) ,
  CONSTRAINT PK_contacto PRIMARY KEY (id)
)
GO

ALTER TABLE contacto
  ADD CONSTRAINT UQ_correo UNIQUE (correo)
GO

CREATE TABLE direcciones
(
  id            INT          NOT NULL,
  calle         VARCHAR(80) ,
  numero        VARCHAR(10) ,
  adicional     VARCHAR(100),
  codigo_postal VARCHAR(10) ,
  ciudad        VARCHAR(50) ,
  provincia     VARCHAR(50) ,
  CONSTRAINT PK_direcciones PRIMARY KEY (id)
)
GO

CREATE TABLE donaciones
(
  id               INT          NOT NULL,
  titulo           VARCHAR(100) NOT NULL,
  detalle          VARCHAR(255) NOT NULL,
  tipo             VARCHAR(25)  NOT NULL DEFAULT Articulo,
  cantidad         INT          NOT NULL,
  estado           INT          NOT NULL DEFAULT 0,
  puntos           INT         ,
  fecha_registro   DATETIME2    NOT NULL DEFAULT GETDATE,
  fecha_aprobacion DATETIME2   ,
  fecha_rechazo    DATETIME2   ,
  motivo_rechazo   VARCHAR(255),
  creado_por_id    INT         ,
  aprobado_por_id  INT         ,
  rechazado_por_id INT         ,
  id_campaña       INT         ,
  usuarioId        INT         ,
  CONSTRAINT PK_donaciones PRIMARY KEY (id)
)
GO

CREATE TABLE empresa
(
  id                 INT          NOT NULL,
  cuit               VARCHAR(20)  NOT NULL,
  razon_social       VARCHAR(100) NOT NULL,
  rubro              VARCHAR(50)  NOT NULL,
  nombre_empresa     VARCHAR(100) NOT NULL,
  contacto_id        INT          NOT NULL,
  direccion_id       INT         ,
  verificada         BIT          NOT NULL DEFAULT 0,
  logo               VARCHAR(255),
  web                VARCHAR(255),
  descripcion        VARCHAR(500) NOT NULL,
  fecha_registro     DATETIME2    NOT NULL DEFAULT GETDATE,
  ultimo_cambio      DATETIME2    NOT NULL DEFAULT GETDATE,
  habilitada         BIT          NOT NULL DEFAULT 1,
  creado_por_id      INT         ,
  actualizado_por_id INT         ,
  CONSTRAINT PK_empresa PRIMARY KEY (id)
)
GO

ALTER TABLE empresa
  ADD CONSTRAINT UQ_cuit UNIQUE (cuit)
GO

CREATE TABLE empresa_usuario
(
  id               INT         NOT NULL,
  id_usuario       INT         NOT NULL,
  id_empresa       INT         NOT NULL,
  fecha_asignacion DATETIME2   NOT NULL DEFAULT GETDATE,
  activo           BIT         NOT NULL DEFAULT 1,
  rol              VARCHAR(20) NOT NULL DEFAULT MIEMBRO,
  CONSTRAINT PK_empresa_usuario PRIMARY KEY (id)
)
GO

ALTER TABLE empresa_usuario
  ADD CONSTRAINT UQ_id_usuario UNIQUE (id_usuario)
GO

ALTER TABLE empresa_usuario
  ADD CONSTRAINT UQ_id_empresa UNIQUE (id_empresa)
GO

CREATE TABLE imagenes_campaña
(
  id          INT          NOT NULL,
  imagen      VARCHAR(255) NOT NULL,
  esPortada   BIT          NOT NULL DEFAULT 0,
  campañas_id INT         ,
  CONSTRAINT PK_imagenes_campaña PRIMARY KEY (id)
)
GO

CREATE TABLE invitaciones
(
  id               INT          NOT NULL,
  token            VARCHAR(255) NOT NULL,
  correo           VARCHAR(255) NOT NULL,
  empresaId        INT         ,
  organizacionId   INT         ,
  invitadorID      INT          NOT NULL,
  usuarioId        INT         ,
  rol              VARCHAR(20)  NOT NULL DEFAULT MIEMBRO,
  expirada         BIT          NOT NULL DEFAULT 0,
  fecha_creacion   DATETIME2    NOT NULL DEFAULT GETDATE,
  fecha_expiracion DATETIME2   ,
  CONSTRAINT PK_invitaciones PRIMARY KEY (id)
)
GO

ALTER TABLE invitaciones
  ADD CONSTRAINT UQ_token UNIQUE (token)
GO

CREATE TABLE organizacion
(
  id                  INT          NOT NULL,
  cuit                VARCHAR(20)  NOT NULL,
  razon_social        VARCHAR(100) NOT NULL,
  nombre_organizacion VARCHAR(100) NOT NULL,
  descripcion         VARCHAR(255) NOT NULL,
  verificada          BIT          NOT NULL DEFAULT 0,
  web                 VARCHAR(255) NOT NULL,
  fecha_registro      DATETIME2    NOT NULL DEFAULT GETDATE,
  ultimo_cambio       DATETIME2    NOT NULL DEFAULT GETDATE,
  habilitada          BIT          NOT NULL DEFAULT 1,
  contacto_id         INT         ,
  direccion_id        INT         ,
  creado_por_id       INT         ,
  actualizado_por_id  INT         ,
  CONSTRAINT PK_organizacion PRIMARY KEY (id)
)
GO

ALTER TABLE organizacion
  ADD CONSTRAINT UQ_cuit UNIQUE (cuit)
GO

CREATE TABLE organizacion_usuario
(
  id               INT         NOT NULL,
  id_usuario       INT         NOT NULL,
  id_organizacion  INT         NOT NULL,
  fecha_asignacion DATETIME2   NOT NULL DEFAULT GETDATE,
  activo           BIT         NOT NULL DEFAULT 1,
  rol              VARCHAR(20) NOT NULL DEFAULT MIEMBRO,
  CONSTRAINT PK_organizacion_usuario PRIMARY KEY (id)
)
GO

ALTER TABLE organizacion_usuario
  ADD CONSTRAINT UQ_id_usuario UNIQUE (id_usuario)
GO

ALTER TABLE organizacion_usuario
  ADD CONSTRAINT UQ_id_organizacion UNIQUE (id_organizacion)
GO

CREATE TABLE ranking_donador
(
  id_usuario INT NOT NULL,
  puntos     INT NOT NULL,
  CONSTRAINT PK_ranking_donador PRIMARY KEY (id_usuario)
)
GO

CREATE TABLE usuarios
(
  id                   INT          NOT NULL,
  clave                VARCHAR(255) NOT NULL,
  rol                  VARCHAR(20)  NOT NULL DEFAULT USUARIO,
  documento            VARCHAR(15)  NOT NULL,
  nombre               VARCHAR(50)  NOT NULL,
  apellido             VARCHAR(50)  NOT NULL,
  puntos               INT          DEFAULT 0,
  departamento         VARCHAR(10) ,
  habilitado           BIT          NOT NULL DEFAULT 1,
  verificado           BIT          NOT NULL DEFAULT 0,
  fecha_registro       DATETIME2    NOT NULL DEFAULT GETDATE,
  ultimo_cambio        DATETIME2    NOT NULL DEFAULT GETDATE,
  ultima_conexion      DATETIME2   ,
  resetPasswordToken   VARCHAR(255),
  resetPasswordExpires DATETIME2   ,
  contacto_id          INT         ,
  direccion_id         INT         ,
  CONSTRAINT PK_usuarios PRIMARY KEY (id)
)
GO

ALTER TABLE usuarios
  ADD CONSTRAINT UQ_documento UNIQUE (documento)
GO

CREATE TABLE usuarios_beneficios
(
  Relaciones 
)
GO

ALTER TABLE usuarios
  ADD CONSTRAINT FK_contacto_TO_usuarios
    FOREIGN KEY (contacto_id)
    REFERENCES contacto (id)
GO

ALTER TABLE usuarios
  ADD CONSTRAINT FK_direcciones_TO_usuarios
    FOREIGN KEY (direccion_id)
    REFERENCES direcciones (id)
GO

ALTER TABLE empresa
  ADD CONSTRAINT FK_contacto_TO_empresa
    FOREIGN KEY (contacto_id)
    REFERENCES contacto (id)
GO

ALTER TABLE empresa
  ADD CONSTRAINT FK_direcciones_TO_empresa
    FOREIGN KEY (direccion_id)
    REFERENCES direcciones (id)
GO

ALTER TABLE empresa
  ADD CONSTRAINT FK_usuarios_TO_empresa
    FOREIGN KEY (creado_por_id)
    REFERENCES usuarios (id)
GO

ALTER TABLE empresa
  ADD CONSTRAINT FK_usuarios_TO_empresa1
    FOREIGN KEY (actualizado_por_id)
    REFERENCES usuarios (id)
GO

ALTER TABLE organizacion
  ADD CONSTRAINT FK_contacto_TO_organizacion
    FOREIGN KEY (contacto_id)
    REFERENCES contacto (id)
GO

ALTER TABLE organizacion
  ADD CONSTRAINT FK_direcciones_TO_organizacion
    FOREIGN KEY (direccion_id)
    REFERENCES direcciones (id)
GO

ALTER TABLE organizacion
  ADD CONSTRAINT FK_usuarios_TO_organizacion
    FOREIGN KEY (creado_por_id)
    REFERENCES usuarios (id)
GO

ALTER TABLE organizacion
  ADD CONSTRAINT FK_usuarios_TO_organizacion1
    FOREIGN KEY (actualizado_por_id)
    REFERENCES usuarios (id)
GO

ALTER TABLE beneficios
  ADD CONSTRAINT FK_empresa_TO_beneficios
    FOREIGN KEY (id_empresa)
    REFERENCES empresa (id)
GO

ALTER TABLE beneficios
  ADD CONSTRAINT FK_usuarios_TO_beneficios
    FOREIGN KEY (creado_por_id)
    REFERENCES usuarios (id)
GO

ALTER TABLE beneficios
  ADD CONSTRAINT FK_usuarios_TO_beneficios1
    FOREIGN KEY (actualizado_por_id)
    REFERENCES usuarios (id)
GO

ALTER TABLE campañas
  ADD CONSTRAINT FK_usuarios_TO_campañas
    FOREIGN KEY (creado_por_id)
    REFERENCES usuarios (id)
GO

ALTER TABLE campañas
  ADD CONSTRAINT FK_usuarios_TO_campañas1
    FOREIGN KEY (actualizado_por_id)
    REFERENCES usuarios (id)
GO

ALTER TABLE campañas
  ADD CONSTRAINT FK_organizacion_TO_campañas
    FOREIGN KEY (id_organizacion)
    REFERENCES organizacion (id)
GO

ALTER TABLE donaciones
  ADD CONSTRAINT FK_usuarios_TO_donaciones
    FOREIGN KEY (creado_por_id)
    REFERENCES usuarios (id)
GO

ALTER TABLE donaciones
  ADD CONSTRAINT FK_usuarios_TO_donaciones1
    FOREIGN KEY (usuarioId)
    REFERENCES usuarios (id)
GO

ALTER TABLE donaciones
  ADD CONSTRAINT FK_usuarios_TO_donaciones2
    FOREIGN KEY (aprobado_por_id)
    REFERENCES usuarios (id)
GO

ALTER TABLE donaciones
  ADD CONSTRAINT FK_usuarios_TO_donaciones3
    FOREIGN KEY (rechazado_por_id)
    REFERENCES usuarios (id)
GO

ALTER TABLE donaciones
  ADD CONSTRAINT FK_campañas_TO_donaciones
    FOREIGN KEY (id_campaña)
    REFERENCES campañas (id)
GO

ALTER TABLE empresa_usuario
  ADD CONSTRAINT FK_usuarios_TO_empresa_usuario
    FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id)
GO

ALTER TABLE empresa_usuario
  ADD CONSTRAINT FK_empresa_TO_empresa_usuario
    FOREIGN KEY (id_empresa)
    REFERENCES empresa (id)
GO

ALTER TABLE imagenes_campaña
  ADD CONSTRAINT FK_campañas_TO_imagenes_campaña
    FOREIGN KEY (campañas_id)
    REFERENCES campañas (id)
GO

ALTER TABLE invitaciones
  ADD CONSTRAINT FK_usuarios_TO_invitaciones
    FOREIGN KEY (invitadorID)
    REFERENCES usuarios (id)
GO

ALTER TABLE invitaciones
  ADD CONSTRAINT FK_usuarios_TO_invitaciones1
    FOREIGN KEY (usuarioId)
    REFERENCES usuarios (id)
GO

ALTER TABLE invitaciones
  ADD CONSTRAINT FK_empresa_TO_invitaciones
    FOREIGN KEY (empresaId)
    REFERENCES empresa (id)
GO

ALTER TABLE invitaciones
  ADD CONSTRAINT FK_organizacion_TO_invitaciones
    FOREIGN KEY (organizacionId)
    REFERENCES organizacion (id)
GO

ALTER TABLE organizacion_usuario
  ADD CONSTRAINT FK_usuarios_TO_organizacion_usuario
    FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id)
GO

ALTER TABLE organizacion_usuario
  ADD CONSTRAINT FK_organizacion_TO_organizacion_usuario
    FOREIGN KEY (id_organizacion)
    REFERENCES organizacion (id)
GO

ALTER TABLE ranking_donador
  ADD CONSTRAINT FK_usuarios_TO_ranking_donador
    FOREIGN KEY (id_usuario)
    REFERENCES usuarios (id)
GO

ALTER TABLE usuarios_beneficios
  ADD CONSTRAINT FK_usuarios_TO_usuarios_beneficios
    FOREIGN KEY ()
    REFERENCES usuarios (id)
GO

ALTER TABLE usuarios_beneficios
  ADD CONSTRAINT FK_beneficios_TO_usuarios_beneficios
    FOREIGN KEY ()
    REFERENCES beneficios (id)
GO
