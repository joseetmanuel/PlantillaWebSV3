USE [Cliente]
GO

/****** Object:  Table [empresa].[EmpresaDocumento]    Script Date: 13/02/2019 09:22:11 a. m. ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [empresa].[EmpresaDocumento](
	[idEmpresaDocumento] [int] IDENTITY(1,1) NOT NULL,
	[idEmpresa] [int] NOT NULL,
	[idTipoDocumento] [int] NOT NULL,
	[idDocumento] [int] NOT NULL,
	[idUsuario] [int] NOT NULL,
 CONSTRAINT [PK_EmpresaDocumento] PRIMARY KEY CLUSTERED 
(
	[idEmpresaDocumento] ASC,
	[idEmpresa] ASC,
	[idTipoDocumento] ASC,
	[idDocumento] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [empresa].[EmpresaDocumento]  WITH CHECK ADD  CONSTRAINT [FK_EmpresaDocumento_Empresa] FOREIGN KEY([idEmpresa])
REFERENCES [empresa].[Empresa] ([idEmpresa])
GO

ALTER TABLE [empresa].[EmpresaDocumento] CHECK CONSTRAINT [FK_EmpresaDocumento_Empresa]
GO

ALTER TABLE [empresa].[EmpresaDocumento]  WITH CHECK ADD  CONSTRAINT [FK_EmpresaDocumento_TipoDocumento] FOREIGN KEY([idTipoDocumento])
REFERENCES [cliente].[TipoDocumento] ([idTipoDocumento])
GO

ALTER TABLE [empresa].[EmpresaDocumento] CHECK CONSTRAINT [FK_EmpresaDocumento_TipoDocumento]
GO


