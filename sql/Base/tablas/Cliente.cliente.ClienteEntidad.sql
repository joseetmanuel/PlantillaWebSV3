USE [Cliente]
GO

/****** Object:  Table [cliente].[ClienteEntidad]    Script Date: 13/02/2019 09:19:25 a. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [cliente].[ClienteEntidad](
	[idClienteEntidad] [int] IDENTITY(1,1) NOT NULL,
	[idCliente] [int] NOT NULL,
	[rfc] [nvarchar](13) NOT NULL,
	[razonSocial] [nvarchar](250) NOT NULL,
	[nombreComercial] [nvarchar](250) NOT NULL,
	[idTipoPersona] [int] NOT NULL,
	[idLogo] [int] NULL,
	[personaContacto] [nvarchar](300) NULL,
	[telefono] [nvarchar](400) NULL,
	[email] [nvarchar](400) NOT NULL,
	[pais] [nvarchar](300) NOT NULL,
	[estado] [nvarchar](300) NOT NULL,
	[ciudad] [nvarchar](300) NOT NULL,
	[delegacion] [nvarchar](300) NOT NULL,
	[colonia] [nvarchar](300) NOT NULL,
	[calle] [nvarchar](300) NOT NULL,
	[numInt] [nvarchar](300) NOT NULL,
	[numExt] [nvarchar](300) NOT NULL,
	[cp] [nvarchar](10) NOT NULL,
	[activo] [bit] NOT NULL,
	[idUsuario] [int] NOT NULL,
 CONSTRAINT [PK_ClienteEntidad] PRIMARY KEY CLUSTERED 
(
	[idClienteEntidad] ASC,
	[idCliente] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [cliente].[ClienteEntidad]  WITH CHECK ADD  CONSTRAINT [FK_ClienteEntidad_Cliente] FOREIGN KEY([idCliente])
REFERENCES [cliente].[Cliente] ([idCliente])
GO

ALTER TABLE [cliente].[ClienteEntidad] CHECK CONSTRAINT [FK_ClienteEntidad_Cliente]
GO

ALTER TABLE [cliente].[ClienteEntidad]  WITH CHECK ADD  CONSTRAINT [FK_ClienteEntidad_TipoPersona] FOREIGN KEY([idTipoPersona])
REFERENCES [cliente].[TipoPersona] ([idTipoPersona])
GO

ALTER TABLE [cliente].[ClienteEntidad] CHECK CONSTRAINT [FK_ClienteEntidad_TipoPersona]
GO


