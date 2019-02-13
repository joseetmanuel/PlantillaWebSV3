USE [Cliente]
GO

/****** Object:  Table [cliente].[Cliente]    Script Date: 13/02/2019 09:17:57 a. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [cliente].[Cliente](
	[idCliente] [int] IDENTITY(1,1) NOT NULL,
	[nombre] [nvarchar](250) NOT NULL,
	[activo] [bit] NOT NULL,
	[idEmpresa] [int] NOT NULL,
	[idUsuario] [int] NOT NULL,
 CONSTRAINT [PK_Cliente] PRIMARY KEY CLUSTERED 
(
	[idCliente] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [cliente].[Cliente]  WITH CHECK ADD  CONSTRAINT [FK_Cliente_Empresa] FOREIGN KEY([idEmpresa])
REFERENCES [empresa].[Empresa] ([idEmpresa])
GO

ALTER TABLE [cliente].[Cliente] CHECK CONSTRAINT [FK_Cliente_Empresa]
GO


