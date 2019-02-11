CREATE TABLE [esquema].[objeto](
	[idObjeto] [int] IDENTITY(1,1) NOT NULL,
	[descripcion] [nvarchar](500) NULL,
	[fechaAlta] [datetime] NULL,
	[estatus] [bit] NULL,
 CONSTRAINT [PK_objeto] PRIMARY KEY CLUSTERED 
(
	[idObjeto] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

