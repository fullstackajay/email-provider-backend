import { createAccessControl } from 'better-auth/plugins/access'
import { defaultStatements, adminAc as defaultAdminAc } from 'better-auth/plugins/admin/access'

/**
 * 1. Define all resources and the actions that can be performed on them.
 * We merge the default statements from the admin plugin to ensure core
 * admin functionalities (like managing users and sessions) are included.
 */
const statement = {
	...defaultStatements,
	campaigns: ['create', 'read', 'update', 'delete', 'send', 'schedule'],
	templates: ['create', 'read', 'update', 'delete'],
	subscribers: ['create', 'read', 'update', 'delete', 'import', 'export'],
	billing: ['read', 'manage'],
	analytics: ['read', 'export']
} as const // Using 'as const' provides strict type-checking for roles.

/**
 * 2. Create the Access Control instance.
 * This object will be used by the admin plugin to manage permissions.
 */
export const ac = createAccessControl(statement)

/**
 * 3. Define the 10 roles for your email service provider.
 * Each role is granted a specific set of permissions based on the statement above.
 */

// SuperAdmin has full permissions on all custom resources.
// The plugin automatically grants full permissions on its own resources (user, session)
// because 'SuperAdmin' is listed in the `adminRoles` array in auth.ts.
const SuperAdmin = ac.newRole({
	campaigns: ['create', 'read', 'update', 'delete', 'send', 'schedule'],
	templates: ['create', 'read', 'update', 'delete'],
	subscribers: ['create', 'read', 'update', 'delete', 'import', 'export'],
	billing: ['read', 'manage'],
	analytics: ['read', 'export']
})

// Admin has most permissions but cannot delete certain resources.
// It extends the default admin permissions from the plugin.
const Admin = ac.newRole({
	...defaultAdminAc.statements,
	campaigns: ['read', 'update', 'delete', 'schedule'],
	templates: ['read', 'update', 'delete'],
	subscribers: ['read', 'update', 'delete', 'export'],
	billing: ['read'],
	analytics: ['read', 'export']
})

// Editor can create and manage campaigns and templates.
const Editor = ac.newRole({
	campaigns: ['create', 'read', 'update'],
	templates: ['create', 'read', 'update']
})

// Marketer can manage and send campaigns.
const Marketer = ac.newRole({
	campaigns: ['create', 'read', 'update', 'send', 'schedule'],
	templates: ['read'],
	subscribers: ['read', 'import'],
	analytics: ['read']
})

// Analyst can view and export data.
const Analyst = ac.newRole({
	analytics: ['read', 'export'],
	campaigns: ['read'],
	subscribers: ['read']
})

// SupportAgent can view users and manage subscribers.
const SupportAgent = ac.newRole({
	user: ['list'],
	subscribers: ['read', 'update']
})

// BillingManager can view and manage billing information.
const BillingManager = ac.newRole({
	billing: ['read', 'manage']
})

// Developer might have limited access, e.g., to view users.
const Developer = ac.newRole({
	user: ['list']
})

// Viewer has read-only access to most resources.
const Viewer = ac.newRole({
	campaigns: ['read'],
	templates: ['read'],
	subscribers: ['read'],
	analytics: ['read']
})

/**
 * 4. Export all defined roles to be used in the auth.ts configuration.
 * Note: We do not define a 'User' role here. The admin plugin handles the
 * default role automatically when you set `defaultRole: 'User'` in its options.
 */
export const allRoles = {
	SuperAdmin,
	Admin,
	Editor,
	Marketer,
	Analyst,
	SupportAgent,
	BillingManager,
	Developer,
	Viewer
}
