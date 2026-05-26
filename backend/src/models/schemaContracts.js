const { z } = require('zod');

const dbSchemaContract = z.object({
    tables: z.array(z.object({
        tableName: z.string(),
        columns: z.array(z.object({
            name: z.string(),
            type: z.enum(["string", "integer", "boolean", "datetime", "text"]),
            isPrimary: z.boolean().optional(),
            isForeign: z.boolean().optional(),
            references: z.string().optional()
        }))
    }))
});

const apiSchemaContract = z.object({
    endpoints: z.array(z.object({
        path: z.string(),
        method: z.enum(["GET", "POST", "PUT", "DELETE"]),
        description: z.string(),
        payloadValidation: z.array(z.string()).optional(),
        requiresAuth: z.boolean()
    }))
});

const uiSchemaContract = z.object({
    pages: z.array(z.object({
        route: z.string(),
        name: z.string(),
        components: z.array(z.object({
            type: z.enum(["form", "table", "dashboard", "button"]),
            connectedApiEndpoint: z.string().optional()
        }))
    }))
});

const authSchemaContract = z.object({
    roles: z.array(z.string()),
    permissions: z.array(z.object({
        role: z.string(),
        allowedEndpoints: z.array(z.string())
    }))
});

const masterSystemContract = z.object({
    database: dbSchemaContract,
    api: apiSchemaContract,
    ui: uiSchemaContract,
    auth: authSchemaContract
});

module.exports = {
    dbSchemaContract,
    apiSchemaContract,
    uiSchemaContract,
    authSchemaContract,
    masterSystemContract
};