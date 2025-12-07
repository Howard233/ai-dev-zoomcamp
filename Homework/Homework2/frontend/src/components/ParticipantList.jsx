export default function ParticipantList({ participants = [] }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Participants</h3>
        <span className="badge">{participants.length}</span>
      </div>
      <ul className="participant-list">
        {participants.length === 0 && (
          <li className="participant muted">Waiting for collaborators…</li>
        )}
        {participants.map((participant) => (
          <li key={participant.id} className="participant">
            <span className="avatar">
              {participant.name?.charAt(0)?.toUpperCase() || '?'}
            </span>
            <span>{participant.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
