export default function GoalCard({ goal, onUseGoal, onCancelGoal }) {
  const percent = Math.min((goal.current / goal.target) * 100, 100);
  const isComplete = Number(goal.current) >= Number(goal.target);

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

      {isComplete || onCancelGoal ? (
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 16,
            flexWrap: "wrap",
          }}
        >
          {onUseGoal ? (
            <button
              type="button"
              className="primary-btn"
              style={{ marginTop: 0 }}
              onClick={() => onUseGoal(goal)}
            >
              Complete Goal
            </button>
          ) : null}

          {onCancelGoal ? (
            <button
              type="button"
              className="primary-btn"
              onClick={() => onCancelGoal(goal.id)}
              style={{
                marginTop: 0,
              }}
            >
              Cancel Goal
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
