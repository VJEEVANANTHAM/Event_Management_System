import { useCallback, useMemo } from "react";
import { useStore } from "../store/useStore";

export default function useProfiles() {
  const profiles = useStore((s) => s.profiles);
  const createProfile = useStore((s) => s.createProfile);
  const selectProfile = useStore((s) => s.selectProfile);
  const updateProfile = useStore((s) => s.updateProfile);

  const profilesMemo = useMemo(() => profiles || [], [profiles]);

  const filteredProfiles = useCallback(
    (query = "") => {
      const q = (query || "").trim().toLowerCase();
      if (!q) return profilesMemo;
      return profilesMemo.filter((p) => p.name.toLowerCase().includes(q));
    },
    [profilesMemo]
  );

  return {
    profiles: profilesMemo,
    filteredProfiles,
    createProfile,
    selectProfile,
    updateProfile,
  };
}
