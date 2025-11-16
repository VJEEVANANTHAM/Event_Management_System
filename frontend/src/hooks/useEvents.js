import { useCallback, useMemo } from "react";
import { useStore } from "../store/useStore";

export default function useEvents(viewTz) {
  const events = useStore((s) => s.events);
  const selectedProfile = useStore((s) => s.selectedProfile);
  const fetchEventsForProfile = useStore((s) => s.fetchEventsForProfile);

  const sortedEvents = useMemo(() => {
    if (!events) return [];
    const copy = [...events];
    copy.sort((a, b) => {
      const ta = Date.parse(a.start) || 0;
      const tb = Date.parse(b.start) || 0;
      return ta - tb;
    });
    return copy;
  }, [events]);

  const refresh = useCallback(() => {
    if (!selectedProfile) return;
    fetchEventsForProfile(selectedProfile._id, viewTz);
  }, [fetchEventsForProfile, selectedProfile, viewTz]);

  return {
    events: sortedEvents,
    refresh,
    selectedProfile,
  };
}
