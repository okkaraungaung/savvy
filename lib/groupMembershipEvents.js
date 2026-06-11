export const GROUP_MEMBERSHIP_CHANGED_EVENT = "savvy:group-membership-changed";

export function notifyGroupMembershipChanged() {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new Event(GROUP_MEMBERSHIP_CHANGED_EVENT));
}
