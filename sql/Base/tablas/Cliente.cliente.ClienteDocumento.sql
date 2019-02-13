USE [Cliente]
GO

/****** Object:  Table [cliente].[ClienteDocumento]    Script Date: 13/02/2019 09:18:50 a. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [cliente].[ClienteDocumento](
	[idClienteDocumento] [int] IDENTITY(1,1) NOT NULL,
	[idCliente] [int] NOT NULL,
	[idTipoDocumento] [int] NOT NULL,
	[idDocumento] [int] NOT NULL,
	[idUsuario] [int] NOT NULL,
 CONSTRAINT [PK_ClienteDocumento] PRIMARY KEY CLUSTERED 
(
	[idClienteDocumento] ASC,
	[idCliente] ASC,
	[idTipoDocumento] ASC,
	[idDocumento] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [cliente].[ClienteDocumento]  WITH CHECK ADD  CONSTRAINT [FK_ClienteDocumento_Cliente] FOREIGN KEY([idCliente])
REFERENCES [cliente].[Cliente] ([idCliente])
GO

ALTER TABLE [cliente].[ClienteDocumento] CHECK CONSTRAINT [FK_ClienteDocumento_Cliente]
GO

ALTER TABLE [cliente].[ClienteDocumento]  WITH CHECK ADD  CONSTRAINT [FK_ClienteDocumento_TipoDocumento] FOREIGN KEY([idTipoDocumento])
REFERENCES [cliente].[TipoDocumento] ([idTipoDocumento])
GO

ALTER TABLE [cliente].[ClienteDocumento] CHECK CONSTRAINT [FK_ClienteDocumento_TipoDocumento]
GO


