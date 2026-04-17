export default function GoalCard({ goal }) {
  const percent = Math.min((goal.current / goal.target) * 100, 100);

  return (
    <div className="card">
      <div className="goal-top">
        <div>
          <h3>{goal.title}</h3>
          <p className="muted">{goal.assetType} goal</p>
        </div>
        {goal.deadline ? (
          <span className="deadline">{goal.deadline}</span>
        ) : null}
      </div>

      <div className="goal-stats">
        <span>
          {goal.current} / {goal.target} {goal.unit}
        </span>
        <span>{percent.toFixed(0)}%</span>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}
