// Browser stub for @ai-sdk/gateway.
// This package is server-only. It is aliased to this empty stub in the
// Turbopack client bundle to prevent "Module not found: Can't resolve 'zod'"
// errors caused by @ai-sdk/gateway's top-level zod import being bundled
// into client components that use @ai-sdk/react.
export const createGateway = () => null
export const gateway = null
export class GatewayAuthenticationError extends Error {}
export class GatewayError extends Error {}
