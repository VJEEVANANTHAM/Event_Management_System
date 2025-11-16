import useProfileById from "../hooks/useProfileById";

export default function ParticipantName({ profileId }) {
  const profile = useProfileById(profileId);
  if (!profile) return <span className="muted">Unknown</span>;
  return <span>{profile.name}</span>;
}
