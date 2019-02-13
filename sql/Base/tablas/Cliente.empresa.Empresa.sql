USE [Cliente]
GO

/****** Object:  Table [empresa].[Empresa]    Script Date: 13/02/2019 09:21:42 a. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [empresa].[Empresa](
	[idEmpresa] [int] IDENTITY(1,1) NOT NULL,
	[rfc] [nvarchar](13) NOT NULL,
	[razonSocial] [nvarchar](250) NOT NULL,
	[nombreComercial] [nvarchar](250) NOT NULL,
	[activo] [bit] NOT NULL,
	[idBPRO] [int] NULL,
	[idUsuario] [int] NOT NULL,
 CONSTRAINT [PK_Empresa] PRIMARY KEY CLUSTERED 
(
	[idEmpresa] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


