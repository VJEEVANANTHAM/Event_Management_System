import { useMemo } from "react";
import { useStore } from "../store/useStore";

export default function useEventById(id) {
  const ev = useStore(
    (state) => {
      if (!id) return null;
      const map = state.eventsById;
      return map ? map.get(id) || null : null;
    },
    (a, b) => a === b
  );
  return useMemo(() => ev || null, [ev]);
}
