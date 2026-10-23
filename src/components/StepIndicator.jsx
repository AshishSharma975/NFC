
export default function StepIndicator({ current, labels }) {
  return (
    <div className="step-indicator">
      {labels.map((label, index) => {
        const number = index + 1;
        const complete = number < current;
        const active = number === current;

        return (
          <div
            className={`step-item ${active ? "active" : ""} ${
              complete ? "complete" : ""
            }`}
            key={label}
          >
            <span className="step-number">
              {complete ? "✓" : `0${number}`}
            </span>
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
