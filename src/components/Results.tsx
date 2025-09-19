import React from "react";

interface Props {
  correctCount: number;
  totalCount: number;
  onRestart: () => void;
}

const Results: React.FC<Props> = ({ correctCount, totalCount, onRestart }) => {
  const percent = totalCount > 0 ? ((correctCount / totalCount) * 100).toFixed(1) : "0.0";

  return (
    <div className="results-container">
      <h2>Результаты теста</h2>
      <p>
        Правильных ответов: {correctCount} из {totalCount} ({percent}%)
      </p>
      <button onClick={onRestart}>Начать заново</button>
    </div>
  );
};

export default Results;
