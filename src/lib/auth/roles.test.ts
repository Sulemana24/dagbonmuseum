import { describe, expect, it } from "vitest";
import { canManageArea, hasPermission, isRole } from "./roles";

describe("roles", () => {
  it("validates role names", () => {
    expect(isRole("super_admin")).toBe(true);
    expect(isRole("admin")).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });
  it("only super admins manage users and settings", () => {
    expect(hasPermission("super_admin", "users:manage")).toBe(true);
    for (const r of ["content_manager", "content_editor", "viewer"] as const) {
      expect(hasPermission(r, "users:manage")).toBe(false);
      expect(hasPermission(r, "settings:write")).toBe(false);
      expect(hasPermission(r, "logs:read")).toBe(false);
      expect(hasPermission(r, "subscribers:export")).toBe(false);
      expect(hasPermission(r, "subscribers:manage")).toBe(false);
    }
  });
  it("editors cannot publish or delete; managers can", () => {
    expect(hasPermission("content_editor", "content:publish")).toBe(false);
    expect(hasPermission("content_editor", "content:delete")).toBe(false);
    expect(hasPermission("content_manager", "content:publish")).toBe(true);
  });
  it("viewers are read-only", () => {
    expect(hasPermission("viewer", "content:read")).toBe(true);
    expect(hasPermission("viewer", "content:write")).toBe(false);
    expect(hasPermission("viewer", "media:write")).toBe(false);
  });
  it("managers are limited to assigned areas", () => {
    expect(canManageArea("content_manager", ["articles"], "articles")).toBe(true);
    expect(canManageArea("content_manager", ["articles"], "artifacts")).toBe(false);
    expect(canManageArea("content_manager", undefined, "articles")).toBe(false);
    expect(canManageArea("viewer", ["articles"], "articles")).toBe(false);
  });
});
