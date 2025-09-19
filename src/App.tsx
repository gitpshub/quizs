import React, { useState } from "react";
import QuizSettings from "./components/QuizSettings";
import Quiz from "./components/Quiz";

const App: React.FC = () => {
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [numQuestions, setNumQuestions] = useState(5);

  const startQuiz = (topics: string[], questionsCount: number) => {
    setSelectedTopics(topics);
    setNumQuestions(questionsCount);
    setQuizStarted(true);
  };

  const restartQuiz = () => {
    setQuizStarted(false);
  };

  return (
    <div className="container">
      {!quizStarted ? (
        <QuizSettings onStart={startQuiz} />
      ) : (
        <Quiz
          topics={selectedTopics}
          numQuestions={numQuestions}
          onRestart={restartQuiz}
        />
      )}
    </div>
  );
};

export default App;
