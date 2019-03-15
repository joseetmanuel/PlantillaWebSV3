import 'reflect-metadata';
import { createExpressServer, useContainer, Action, UnauthorizedError } from 'routing-controllers';
import { Container, ContainerInstance } from 'typedi';
import { default as config } from './config';

/**
 * @summary En este archivo van todos los metodos referentes a ...
 * localhost:{{port}}/objeto/...
 */
import { ObjetoRepository } from './repository/objeto.repository';
import { ObjetoController } from './controllers/objeto.controller';
Container.get(ObjetoRepository)

/**
 * @summary En este archivo van todos los metodos referentes a los clientes
 * localhost:{{port}}/cliente/...
 */
import { ClienteRepository } from './repository/cliente.repository';
import { ClienteController } from './controllers/cliente.controller';
Container.get(ClienteRepository)


/**
 * @summary En este archivo van todos los metodos referentes a los clientes
 * localhost:{{port}}/cliente/...
 */
import { EmpresaRepository } from './repository/empresa.respository';
import { EmpresaController } from './controllers/empresa.controller';
Container.get(EmpresaRepository)


/**
 * @summary En este archivo van todos los metodos referentes a Common
 * localhost:{{port}}/cliente/...
 */
import { CommonRepository } from './repository/common.repository';
import { CommonController } from './controllers/common.controller';
Container.get(CommonRepository)


/**
 * @summary En este archivo van todos los metodos referentes a la seguridad (logins) el sistema 
 * localhost:{{port}}/seguridad/...
 */
import { SeguridadRepository } from './repository/seguridad.repository';
import { SeguridadController, SeguridadMiddleware } from './controllers/seguridad.controller';
Container.get(SeguridadRepository);

/**
 * @summary En este archivo van todos los metodos referentes a los proveedores
 * localhost:{{port}}/proveedor/...
 */
import { ProveedorRepository } from './repository/proveedor.repository';
import { ProveedorController } from './controllers/proveedor.controller';
Container.get(ProveedorController)



useContainer(Container);
// generamos el Express
const app = createExpressServer({
    cors: true,
    controllers: [ // Cada uno de los controlests de arriba
        ObjetoController,
        ClienteController,
        SeguridadController,
        EmpresaController,
        CommonController,
        ProveedorController
    ],
    middlewares: [SeguridadMiddleware]
});

//obtenemos el puerto del conf
const env: string = process.env.NODE_ENV || 'development';
const conf: any = (config as any)[env]; 

// si no se asigna puerto desde el servidor de aplicación
const PORT = process.env.PORT || conf.port;

app.listen(PORT);
console.log(`Running local server on http://localhost:${PORT}`);