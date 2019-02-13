USE [Cliente]
GO

/****** Object:  Table [cliente].[TipoDocumento]    Script Date: 13/02/2019 09:20:25 a. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [cliente].[TipoDocumento](
	[idTipoDocumento] [int] IDENTITY(1,1) NOT NULL,
	[tipo] [nvarchar](250) NOT NULL,
	[descripcion] [nvarchar](500) NOT NULL,
	[activo] [bit] NOT NULL,
	[idUsuario] [int] NOT NULL,
 CONSTRAINT [PK_TipoDocumento] PRIMARY KEY CLUSTERED 
(
	[idTipoDocumento] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


