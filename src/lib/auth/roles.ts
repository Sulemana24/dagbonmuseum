export const ROLES = ["super_admin", "content_manager", "content_editor", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "content:read", "content:write", "content:publish", "content:delete",
  "media:write", "media:delete",
  "inquiries:read", "inquiries:write",
  "subscribers:read", "subscribers:export", "subscribers:manage",
  "users:manage", "settings:write", "logs:read",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

// Add a role or permission here and everything downstream (guards, UI, tests) picks it up.
const MATRIX: Record<Role, readonly Permission[]> = {
  super_admin: PERMISSIONS,
  content_manager: [
    "content:read", "content:write", "content:publish", "content:delete",
    "media:write", "media:delete", "inquiries:read", "inquiries:write", "subscribers:read",
  ],
  // Editors draft and edit; publishing needs a manager (they submit for review).
  content_editor: ["content:read", "content:write", "media:write"],
  // Viewer / research assistant: read-only access to internal records.
  viewer: ["content:read"],
};

export const AREAS = ["articles", "exhibitions", "artifacts", "resources", "pages"] as const;

export const isRole = (v: unknown): v is Role => typeof v === "string" && (ROLES as readonly string[]).includes(v);

export function hasPermission(role: Role, permission: Permission): boolean {
  return MATRIX[role].includes(permission);
}

/** Content managers act only inside assigned areas (e.g. "articles"). Super admins act everywhere. */
export function canManageArea(role: Role, areas: readonly string[] | undefined, area: string): boolean {
  if (role === "super_admin") return true;
  if (role === "content_manager") return !!areas?.includes(area);
  return role === "content_editor"; // editors are not area-restricted for drafting
}
