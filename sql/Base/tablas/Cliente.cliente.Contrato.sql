USE [Cliente]
GO

/****** Object:  Table [cliente].[Contrato]    Script Date: 13/02/2019 09:19:56 a. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [cliente].[Contrato](
	[idContrato] [int] IDENTITY(1,1) NOT NULL,
	[idCliente] [int] NOT NULL,
	[numero] [nvarchar](50) NOT NULL,
	[descripcion] [nvarchar](500) NOT NULL,
	[fechaInicio] [datetime] NOT NULL,
	[fechaFin] [datetime] NULL,
	[activo] [bit] NOT NULL,
	[idUsuario] [int] NOT NULL,
 CONSTRAINT [PK_Contrato] PRIMARY KEY CLUSTERED 
(
	[idContrato] ASC,
	[idCliente] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [cliente].[Contrato]  WITH CHECK ADD  CONSTRAINT [FK_Contrato_Cliente] FOREIGN KEY([idCliente])
REFERENCES [cliente].[Cliente] ([idCliente])
GO

ALTER TABLE [cliente].[Contrato] CHECK CONSTRAINT [FK_Contrato_Cliente]
GO


