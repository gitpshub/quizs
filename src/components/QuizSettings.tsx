import React, { useState, useEffect } from "react";

interface Topic {
  name: string;
  title: string;
  description: string;
}

interface Stats {
  [topic: string]: {
    correctAnswers: number;
    totalQuestions: number;
    percentCorrect: number;
  };
}

interface Props {
  onStart: (selectedTopics: string[], numQuestions: number) => void;
}

const QuizSettings: React.FC<Props> = ({ onStart }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [stats, setStats] = useState<Stats>({});

  useEffect(() => {
    fetch("/topics.json")
      .then((res) => res.json())
      .then(setTopics)
      .catch(() => setTopics([]));

    const storedStats = localStorage.getItem("quizStatsByTopic");
    if (storedStats) {
      setStats(JSON.parse(storedStats));
    }
  }, []);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const startQuiz = () => {
    if (selectedTopics.length > 0 && numQuestions > 0) {
      onStart(selectedTopics, numQuestions);
    } else {
      alert("Выберите хотя бы одну тему и количество вопросов.");
    }
  };

  return (
    <div className="quiz-settings">
      <h2>Простые тесты по темам</h2>
      <div>
        {/* <p>Выберите темы:</p> */}
        {topics.length === 0 && <p>Загрузка тем...</p>}
        {topics.map((topic) => {
          const topicStats = stats[topic.name];
          return (
            <div key={topic.name} style={{ marginBottom: 12 }}>
              <label style={{ fontWeight: "bold", fontSize: 16, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={selectedTopics.includes(topic.name)}
                  onChange={() => toggleTopic(topic.name)}
                  style={{ marginRight: 8 }}
                />
                {topic.title}
              </label>
              {topic.description && (
                <p style={{ margin: "4px 0 0 28px", fontSize: 14, color: "#555" }}>
                  {topic.description}
                </p>
              )}
              {topicStats && topicStats.totalQuestions > 0 && (
                <p
                  style={{
                    margin: "4px 0 0 28px",
                    fontSize: 14,
                    color: "green",
                    fontWeight: "600",
                  }}
                >
                  Прошлый результат: {topicStats.correctAnswers} из {topicStats.totalQuestions} (
                  {topicStats.percentCorrect.toFixed(1)}%)
                </p>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 15 }}>
        <label>
          Количество вопросов:
          <input
            type="number"
            min={1}
            max={50}
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
          />
        </label>
      </div>
      <button onClick={startQuiz} style={{ marginTop: 20 }}>
        Начать тест
      </button>
    </div>
  );
};

export default QuizSettings;
