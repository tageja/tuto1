/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/assets/[...path]/route";
exports.ids = ["app/api/assets/[...path]/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fassets%2F%5B...path%5D%2Froute&page=%2Fapi%2Fassets%2F%5B...path%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fassets%2F%5B...path%5D%2Froute.ts&appDir=C%3A%5CUsers%5CAdmin%5Ctuto%5Capps%5Cdashboard%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CAdmin%5Ctuto%5Capps%5Cdashboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fassets%2F%5B...path%5D%2Froute&page=%2Fapi%2Fassets%2F%5B...path%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fassets%2F%5B...path%5D%2Froute.ts&appDir=C%3A%5CUsers%5CAdmin%5Ctuto%5Capps%5Cdashboard%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CAdmin%5Ctuto%5Capps%5Cdashboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_Admin_tuto_apps_dashboard_app_api_assets_path_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/assets/[...path]/route.ts */ \"(rsc)/./app/api/assets/[...path]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/assets/[...path]/route\",\n        pathname: \"/api/assets/[...path]\",\n        filename: \"route\",\n        bundlePath: \"app/api/assets/[...path]/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\Admin\\\\tuto\\\\apps\\\\dashboard\\\\app\\\\api\\\\assets\\\\[...path]\\\\route.ts\",\n    nextConfigOutput,\n    userland: C_Users_Admin_tuto_apps_dashboard_app_api_assets_path_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZhc3NldHMlMkYlNUIuLi5wYXRoJTVEJTJGcm91dGUmcGFnZT0lMkZhcGklMkZhc3NldHMlMkYlNUIuLi5wYXRoJTVEJTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGYXNzZXRzJTJGJTVCLi4ucGF0aCU1RCUyRnJvdXRlLnRzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNBZG1pbiU1Q3R1dG8lNUNhcHBzJTVDZGFzaGJvYXJkJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNBZG1pbiU1Q3R1dG8lNUNhcHBzJTVDZGFzaGJvYXJkJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUErRjtBQUN2QztBQUNxQjtBQUM4QjtBQUMzRztBQUNBO0FBQ0E7QUFDQSx3QkFBd0IseUdBQW1CO0FBQzNDO0FBQ0EsY0FBYyxrRUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLHNEQUFzRDtBQUM5RDtBQUNBLFdBQVcsNEVBQVc7QUFDdEI7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUMwRjs7QUFFMUYiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBcHBSb3V0ZVJvdXRlTW9kdWxlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBwYXRjaEZldGNoIGFzIF9wYXRjaEZldGNoIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL3BhdGNoLWZldGNoXCI7XG5pbXBvcnQgKiBhcyB1c2VybGFuZCBmcm9tIFwiQzpcXFxcVXNlcnNcXFxcQWRtaW5cXFxcdHV0b1xcXFxhcHBzXFxcXGRhc2hib2FyZFxcXFxhcHBcXFxcYXBpXFxcXGFzc2V0c1xcXFxbLi4ucGF0aF1cXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2Fzc2V0cy9bLi4ucGF0aF0vcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9hc3NldHMvWy4uLnBhdGhdXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hc3NldHMvWy4uLnBhdGhdL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiQzpcXFxcVXNlcnNcXFxcQWRtaW5cXFxcdHV0b1xcXFxhcHBzXFxcXGRhc2hib2FyZFxcXFxhcHBcXFxcYXBpXFxcXGFzc2V0c1xcXFxbLi4ucGF0aF1cXFxccm91dGUudHNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MgfSA9IHJvdXRlTW9kdWxlO1xuZnVuY3Rpb24gcGF0Y2hGZXRjaCgpIHtcbiAgICByZXR1cm4gX3BhdGNoRmV0Y2goe1xuICAgICAgICB3b3JrQXN5bmNTdG9yYWdlLFxuICAgICAgICB3b3JrVW5pdEFzeW5jU3RvcmFnZVxuICAgIH0pO1xufVxuZXhwb3J0IHsgcm91dGVNb2R1bGUsIHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fassets%2F%5B...path%5D%2Froute&page=%2Fapi%2Fassets%2F%5B...path%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fassets%2F%5B...path%5D%2Froute.ts&appDir=C%3A%5CUsers%5CAdmin%5Ctuto%5Capps%5Cdashboard%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CAdmin%5Ctuto%5Capps%5Cdashboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(rsc)/./app/api/assets/[...path]/route.ts":
/*!*******************************************!*\
  !*** ./app/api/assets/[...path]/route.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! fs */ \"fs\");\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! path */ \"path\");\n/* harmony import */ var path__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(path__WEBPACK_IMPORTED_MODULE_1__);\n\n\n// Serve static assets from the monorepo root assets/images directory\n// Example: /api/assets/images/tuto-logo.png -> ../../assets/images/tuto-logo.png\nasync function GET(req, ctx) {\n    try {\n        const { params } = await Promise.resolve(ctx);\n        const segments = params?.path || [];\n        // Only allow access under images/ to avoid arbitrary FS reads\n        if (segments[0] !== 'images') {\n            return new Response('Not Found', {\n                status: 404\n            });\n        }\n        const filePath = path__WEBPACK_IMPORTED_MODULE_1___default().resolve(process.cwd(), '..', '..', 'assets', ...segments);\n        if (!fs__WEBPACK_IMPORTED_MODULE_0___default().existsSync(filePath)) {\n            return new Response('Not Found', {\n                status: 404\n            });\n        }\n        const stat = fs__WEBPACK_IMPORTED_MODULE_0___default().statSync(filePath);\n        if (stat.isDirectory()) {\n            return new Response('Not Found', {\n                status: 404\n            });\n        }\n        const stream = fs__WEBPACK_IMPORTED_MODULE_0___default().createReadStream(filePath);\n        const ext = path__WEBPACK_IMPORTED_MODULE_1___default().extname(filePath).toLowerCase();\n        const type = ext === '.png' ? 'image/png' : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.webp' ? 'image/webp' : 'application/octet-stream';\n        return new Response(stream, {\n            status: 200,\n            headers: {\n                'Content-Type': type,\n                'Cache-Control': 'public, max-age=86400'\n            }\n        });\n    } catch (_e) {\n        return new Response('Internal Server Error', {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2Fzc2V0cy9bLi4ucGF0aF0vcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDb0I7QUFDSTtBQUV4QixxRUFBcUU7QUFDckUsaUZBQWlGO0FBRTFFLGVBQWVFLElBQUlDLEdBQWdCLEVBQUVDLEdBQW1DO0lBQzdFLElBQUk7UUFDRixNQUFNLEVBQUVDLE1BQU0sRUFBRSxHQUFHLE1BQU1DLFFBQVFDLE9BQU8sQ0FBQ0g7UUFDekMsTUFBTUksV0FBWUgsUUFBUUosUUFBUSxFQUFFO1FBQ3BDLDhEQUE4RDtRQUM5RCxJQUFJTyxRQUFRLENBQUMsRUFBRSxLQUFLLFVBQVU7WUFDNUIsT0FBTyxJQUFJQyxTQUFTLGFBQWE7Z0JBQUVDLFFBQVE7WUFBSTtRQUNqRDtRQUVBLE1BQU1DLFdBQVdWLG1EQUFZLENBQUNXLFFBQVFDLEdBQUcsSUFBSSxNQUFNLE1BQU0sYUFBYUw7UUFDdEUsSUFBSSxDQUFDUixvREFBYSxDQUFDVyxXQUFXO1lBQzVCLE9BQU8sSUFBSUYsU0FBUyxhQUFhO2dCQUFFQyxRQUFRO1lBQUk7UUFDakQ7UUFFQSxNQUFNSyxPQUFPZixrREFBVyxDQUFDVztRQUN6QixJQUFJSSxLQUFLRSxXQUFXLElBQUk7WUFDdEIsT0FBTyxJQUFJUixTQUFTLGFBQWE7Z0JBQUVDLFFBQVE7WUFBSTtRQUNqRDtRQUVBLE1BQU1RLFNBQVNsQiwwREFBbUIsQ0FBQ1c7UUFDbkMsTUFBTVMsTUFBTW5CLG1EQUFZLENBQUNVLFVBQVVXLFdBQVc7UUFDOUMsTUFBTUMsT0FDSkgsUUFBUSxTQUFTLGNBQ2pCQSxRQUFRLFVBQVVBLFFBQVEsVUFBVSxlQUNwQ0EsUUFBUSxVQUFVLGVBQ2xCO1FBRUYsT0FBTyxJQUFJWCxTQUFTUyxRQUFlO1lBQ2pDUixRQUFRO1lBQ1JjLFNBQVM7Z0JBQ1AsZ0JBQWdCRDtnQkFDaEIsaUJBQWlCO1lBQ25CO1FBQ0Y7SUFDRixFQUFFLE9BQU9FLElBQUk7UUFDWCxPQUFPLElBQUloQixTQUFTLHlCQUF5QjtZQUFFQyxRQUFRO1FBQUk7SUFDN0Q7QUFDRiIsInNvdXJjZXMiOlsiQzpcXFVzZXJzXFxBZG1pblxcdHV0b1xcYXBwc1xcZGFzaGJvYXJkXFxhcHBcXGFwaVxcYXNzZXRzXFxbLi4ucGF0aF1cXHJvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXF1ZXN0IH0gZnJvbSAnbmV4dC9zZXJ2ZXInO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vLyBTZXJ2ZSBzdGF0aWMgYXNzZXRzIGZyb20gdGhlIG1vbm9yZXBvIHJvb3QgYXNzZXRzL2ltYWdlcyBkaXJlY3Rvcnlcbi8vIEV4YW1wbGU6IC9hcGkvYXNzZXRzL2ltYWdlcy90dXRvLWxvZ28ucG5nIC0+IC4uLy4uL2Fzc2V0cy9pbWFnZXMvdHV0by1sb2dvLnBuZ1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gR0VUKHJlcTogTmV4dFJlcXVlc3QsIGN0eDogeyBwYXJhbXM6IHsgcGF0aDogc3RyaW5nW10gfSB9KSB7XG4gIHRyeSB7XG4gICAgY29uc3QgeyBwYXJhbXMgfSA9IGF3YWl0IFByb21pc2UucmVzb2x2ZShjdHgpO1xuICAgIGNvbnN0IHNlZ21lbnRzID0gKHBhcmFtcz8ucGF0aCB8fCBbXSkgYXMgc3RyaW5nW107XG4gICAgLy8gT25seSBhbGxvdyBhY2Nlc3MgdW5kZXIgaW1hZ2VzLyB0byBhdm9pZCBhcmJpdHJhcnkgRlMgcmVhZHNcbiAgICBpZiAoc2VnbWVudHNbMF0gIT09ICdpbWFnZXMnKSB7XG4gICAgICByZXR1cm4gbmV3IFJlc3BvbnNlKCdOb3QgRm91bmQnLCB7IHN0YXR1czogNDA0IH0pO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICcuLicsICcuLicsICdhc3NldHMnLCAuLi5zZWdtZW50cyk7XG4gICAgaWYgKCFmcy5leGlzdHNTeW5jKGZpbGVQYXRoKSkge1xuICAgICAgcmV0dXJuIG5ldyBSZXNwb25zZSgnTm90IEZvdW5kJywgeyBzdGF0dXM6IDQwNCB9KTtcbiAgICB9XG5cbiAgICBjb25zdCBzdGF0ID0gZnMuc3RhdFN5bmMoZmlsZVBhdGgpO1xuICAgIGlmIChzdGF0LmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgIHJldHVybiBuZXcgUmVzcG9uc2UoJ05vdCBGb3VuZCcsIHsgc3RhdHVzOiA0MDQgfSk7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlUGF0aCk7XG4gICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKGZpbGVQYXRoKS50b0xvd2VyQ2FzZSgpO1xuICAgIGNvbnN0IHR5cGUgPVxuICAgICAgZXh0ID09PSAnLnBuZycgPyAnaW1hZ2UvcG5nJyA6XG4gICAgICBleHQgPT09ICcuanBnJyB8fCBleHQgPT09ICcuanBlZycgPyAnaW1hZ2UvanBlZycgOlxuICAgICAgZXh0ID09PSAnLndlYnAnID8gJ2ltYWdlL3dlYnAnIDpcbiAgICAgICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nO1xuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShzdHJlYW0gYXMgYW55LCB7XG4gICAgICBzdGF0dXM6IDIwMCxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6IHR5cGUsXG4gICAgICAgICdDYWNoZS1Db250cm9sJzogJ3B1YmxpYywgbWF4LWFnZT04NjQwMCcsXG4gICAgICB9LFxuICAgIH0pO1xuICB9IGNhdGNoIChfZSkge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UoJ0ludGVybmFsIFNlcnZlciBFcnJvcicsIHsgc3RhdHVzOiA1MDAgfSk7XG4gIH1cbn1cblxuXG5cblxuXG4iXSwibmFtZXMiOlsiZnMiLCJwYXRoIiwiR0VUIiwicmVxIiwiY3R4IiwicGFyYW1zIiwiUHJvbWlzZSIsInJlc29sdmUiLCJzZWdtZW50cyIsIlJlc3BvbnNlIiwic3RhdHVzIiwiZmlsZVBhdGgiLCJwcm9jZXNzIiwiY3dkIiwiZXhpc3RzU3luYyIsInN0YXQiLCJzdGF0U3luYyIsImlzRGlyZWN0b3J5Iiwic3RyZWFtIiwiY3JlYXRlUmVhZFN0cmVhbSIsImV4dCIsImV4dG5hbWUiLCJ0b0xvd2VyQ2FzZSIsInR5cGUiLCJoZWFkZXJzIiwiX2UiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/assets/[...path]/route.ts\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fassets%2F%5B...path%5D%2Froute&page=%2Fapi%2Fassets%2F%5B...path%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fassets%2F%5B...path%5D%2Froute.ts&appDir=C%3A%5CUsers%5CAdmin%5Ctuto%5Capps%5Cdashboard%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5CAdmin%5Ctuto%5Capps%5Cdashboard&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();