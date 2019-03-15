// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // serviceUrul: 'http://189.204.141.199:5112/',
  serviceUrul: 'http://localhost:1000/',
  excepcionUrl: 'http://189.204.141.199:5113/',
  // urlFileServer: 'http://189.204.141.199:4050/documento/UploadFiles'
  urlFileServer: 'http://localhost:4050/documento/'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
