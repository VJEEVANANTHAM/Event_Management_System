import { useMemo } from "react";
import { useStore } from "../store/useStore";

export default function useProfilesByIds(ids = []) {
  const profilesArr = useStore((state) => {
    const m = state.profilesById;
    if (!m) return ids.map(() => null);
    return ids.map((id) => m.get(id) || null);
  });

  return useMemo(() => profilesArr || ids.map(() => null), [profilesArr, ids]);
}
