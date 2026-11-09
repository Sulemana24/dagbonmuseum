export const INQUIRY_STATUSES = ["new", "in_progress", "resolved", "archived"] as const;
export const INQUIRY_LABEL: Record<string, string> = { new: "New", in_progress: "In progress", resolved: "Resolved", archived: "Archived" };
