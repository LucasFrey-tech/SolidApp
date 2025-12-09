CREATE DATABASE Solid;

USE Solid;

---------------------------------------------------------
-- USUARIOS
---------------------------------------------------------
CREATE TABLE Usuarios(
	Id INT PRIMARY KEY IDENTITY,
	Correo NVARCHAR(100) NOT NULL,
	Clave NVARCHAR(255) NOT NULL,
	Deshabilitado BIT DEFAULT 0,
	Nombre NVARCHAR(50) NOT NULL,
	Apellido NVARCHAR(50) NOT NULL,
	Imagen TEXT,
	Direccion NVARCHAR(150),
	Rol NVARCHAR(100),
	Fecha_Registro DATETIME DEFAULT GETDATE(),
	Ultima_Conexion DATETIME,
	Ultimo_Cambio DATETIME DEFAULT GETDATE()
);

---------------------------------------------------------
-- DONADOR
---------------------------------------------------------
CREATE TABLE Donador(
	Id INT PRIMARY KEY IDENTITY,
	Id_Usuario INT NOT NULL,
	Puntos INT CHECK (Puntos >= 0),
	FOREIGN KEY (Id_Usuario) REFERENCES Usuarios(Id)
		ON DELETE CASCADE ON UPDATE CASCADE
);

---------------------------------------------------------
-- EMPRESAS
---------------------------------------------------------
CREATE TABLE Empresas(
	Id INT PRIMARY KEY IDENTITY,
	NroDocumento INT NOT NULL UNIQUE,
	Razon_Social NVARCHAR(100) NOT NULL,
	Nombre_Fantasia NVARCHAR(100),
	Descripcion TEXT,
	Rubro NVARCHAR(100),
	Telefono NVARCHAR(50),
	Direccion NVARCHAR(200),
	Web NVARCHAR(MAX),
	Verificada BIT DEFAULT 0,
	Deshabilitado BIT DEFAULT 0,
	Fecha_Registro DATE DEFAULT GETDATE(),
	Ultimo_Cambio DATETIME DEFAULT GETDATE()
);

---------------------------------------------------------
-- IMÁGENES EMPRESA
---------------------------------------------------------
CREATE TABLE Imagenes_Empresa(
	Id INT PRIMARY KEY IDENTITY,
	Id_Empresa INT NOT NULL,
	Logo TEXT,
	Banner TEXT,
	FOREIGN KEY (Id_Empresa) REFERENCES Empresas(Id)
		ON DELETE CASCADE ON UPDATE CASCADE
);

---------------------------------------------------------
-- USUARIOS-EMPRESA
---------------------------------------------------------
CREATE TABLE Usuarios_Empresa(
	Id INT PRIMARY KEY IDENTITY,
	Id_Usuario INT NOT NULL,
	Id_Empresa INT NOT NULL,
	FOREIGN KEY (Id_Usuario) REFERENCES Usuarios(Id)
		ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (Id_Empresa) REFERENCES Empresas(Id)
		ON DELETE CASCADE ON UPDATE CASCADE
);

---------------------------------------------------------
-- ORGANIZACIONES
---------------------------------------------------------
CREATE TABLE Organizaciones(
	Id INT PRIMARY KEY IDENTITY,
	NroDocumento INT NOT NULL UNIQUE,
	Verificada BIT DEFAULT 0,
	Deshabilitado BIT DEFAULT 0,
	Razon_Social NVARCHAR(100) NOT NULL,
	Nombre_Fantasia NVARCHAR(100),
	Descripcion TEXT,
	Telefono NVARCHAR(50),
	Direccion NVARCHAR(150),
	Web NVARCHAR(MAX),
	Fecha_Registro DATE DEFAULT GETDATE(),
	Ultimo_Cambio DATETIME DEFAULT GETDATE()
);

---------------------------------------------------------
-- IMÁGENES ORGANIZACIÓN
---------------------------------------------------------
CREATE TABLE Imagenes_Organizacion(
	Id INT PRIMARY KEY IDENTITY,
	Id_Organizacion INT NOT NULL,
	Logo TEXT,
	Banner TEXT,
	FOREIGN KEY (Id_Organizacion) REFERENCES Organizaciones(Id)
		ON DELETE CASCADE ON UPDATE CASCADE
);

---------------------------------------------------------
-- USUARIOS-ORGANIZACIÓN
---------------------------------------------------------
CREATE TABLE Usuarios_Organizacion(
	Id INT PRIMARY KEY IDENTITY,
	Id_Usuario INT NOT NULL,
	Id_Organizacion INT NOT NULL,
	FOREIGN KEY (Id_Usuario) REFERENCES Usuarios(Id)
		ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (Id_Organizacion) REFERENCES Organizaciones(Id)
		ON DELETE CASCADE ON UPDATE CASCADE
);

---------------------------------------------------------
-- CAMPAÑAS
---------------------------------------------------------
CREATE TABLE Campañas(
	Id INT PRIMARY KEY IDENTITY,
	Id_Organizacion INT NOT NULL,
	Estado NVARCHAR(50),
	Titulo NVARCHAR(200),
	Descripcion TEXT,
	Fecha_Inicio DATE,
	Fecha_Fin DATE,
	Fecha_Registro DATE DEFAULT GETDATE(),
	Objetivo INT,
	Ultimo_Cambio DATETIME DEFAULT GETDATE(),
	FOREIGN KEY (Id_Organizacion) REFERENCES Organizaciones(Id)
		ON DELETE CASCADE ON UPDATE CASCADE
);

---------------------------------------------------------
-- IMÁGENES CAMPAÑA
---------------------------------------------------------
CREATE TABLE Imagenes_Campaña(
	Id INT PRIMARY KEY IDENTITY,
	Id_Campaña INT NOT NULL,
	Imagen TEXT,
	FOREIGN KEY (Id_Campaña) REFERENCES Campañas(Id)
		ON DELETE CASCADE ON UPDATE CASCADE
);

---------------------------------------------------------
-- DONACIONES
---------------------------------------------------------
CREATE TABLE Donaciones(
	Id INT PRIMARY KEY IDENTITY,
	Id_Campaña INT NOT NULL,
	Id_Donador INT NOT NULL,
	Titulo NVARCHAR(100),
	Detalle TEXT,
	Tipo NVARCHAR(50),
	Cantidad INT,
	Estado NVARCHAR(50),
	Fecha_Registro DATETIME DEFAULT GETDATE(),
	FOREIGN KEY (Id_Campaña) REFERENCES Campañas(Id)
		ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (Id_Donador) REFERENCES Donador(Id)
		ON DELETE CASCADE ON UPDATE CASCADE
);

---------------------------------------------------------
-- IMÁGENES DONACIÓN
---------------------------------------------------------
CREATE TABLE Imagenes_Donacion(
	Id INT PRIMARY KEY IDENTITY,
	Id_Donacion INT NOT NULL,
	Imagen TEXT,
	FOREIGN KEY (Id_Donacion) REFERENCES Donaciones(Id)
		ON DELETE CASCADE ON UPDATE CASCADE
);

---------------------------------------------------------
-- BENEFICIOS
---------------------------------------------------------
CREATE TABLE Beneficios(
	Id INT PRIMARY KEY IDENTITY,
	Id_Empresa INT NOT NULL,
	Titulo NVARCHAR(100),
	Tipo NVARCHAR(50),
	Detalle TEXT,
	Cantidad INT,
	Fecha_Registro DATETIME DEFAULT GETDATE(),
	Ultimo_Cambio DATETIME DEFAULT GETDATE(),
	FOREIGN KEY (Id_Empresa) REFERENCES Empresas(Id)
		ON DELETE CASCADE ON UPDATE CASCADE
);

---------------------------------------------------------
-- IMÁGENES BENEFICIO
---------------------------------------------------------
CREATE TABLE Imagenes_Beneficio(
	Id INT PRIMARY KEY IDENTITY,
	Id_Beneficio INT NOT NULL,
	Imagen TEXT,
	FOREIGN KEY (Id_Beneficio) REFERENCES Beneficios(Id)
		ON DELETE CASCADE ON UPDATE CASCADE
);
