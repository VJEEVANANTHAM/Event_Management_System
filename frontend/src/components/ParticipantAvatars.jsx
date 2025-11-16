import useProfileById from "../hooks/useProfileById";

export default function ParticipantAvatars({ ids = [], max = 3 }) {
  const visible = ids.slice(0, max);
  return (
    <div className="participants" aria-hidden>
      {visible.map((id) => {
        const p = useProfileById(id);
        const letter = p ? p.name.charAt(0).toUpperCase() : "?";
        return (
          <div
            key={id}
            className="participant-avatar"
            title={p ? p.name : "Unknown"}
          >
            {letter}
          </div>
        );
      })}
      {ids.length > max && (
        <div className="more-participants" title={`${ids.length - max} more`}>
          +{ids.length - max}
        </div>
      )}
    </div>
  );
}
