import type { AnnouncementResponse } from "~~/shared/posts";

// The post featured on the homepage and above inner pages' headings, if one
// is running now. The server decides, so it appears and disappears at its
// set times without the browser's clock coming into it. Shared by key, so a
// page asks once however many places show it.
export function useAnnouncement() {
  const { data } = useFetch<AnnouncementResponse>("/api/announcement", {
    key: "announcement",
  });
  return computed(() => data.value?.announcement ?? null);
}
