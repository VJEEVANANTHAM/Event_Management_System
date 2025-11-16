import { useMemo } from "react";
import { useStore } from "../store/useStore";

export default function useProfileById(id) {
  const profile = useStore(
    (state) => {
      if (!id) return null;
      const map = state.profilesById;
      return map ? map.get(id) || null : null;
    },

    (a, b) => a === b
  );

  return useMemo(() => profile || null, [profile]);
}
