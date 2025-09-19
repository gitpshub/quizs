import React, { useState, useEffect } from 'react';
import { Question as QuestionType } from '../types/question';
import Question from './Question';
import Results from './Results';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface Props {
  topics: string[];
  numQuestions: number;
  onRestart: () => void;
}

type StatsByTopic = {
  [topic: string]: {
    correctAnswers: number;
    totalQuestions: number;
    percentCorrect: number;
  };
};

const Quiz: React.FC<Props> = ({ topics, numQuestions, onRestart }) => {
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[] | string>([]);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);

  const [statsByTopic, setStatsByTopic] = useLocalStorage<StatsByTopic>(
    'quizStatsByTopic',
    {}
  );

  useEffect(() => {
    fetch('/allQuestions.json')
      .then((res) => res.json())
      .then((allQuestions: Record<string, QuestionType[]>) => {
        let combined: QuestionType[] = [];
        topics.forEach((topic) => {
          if (allQuestions[topic]) {
            combined = combined.concat(allQuestions[topic]);
          }
        });
        const shuffled = combined.sort(() => 0.5 - Math.random());
        setQuestions(shuffled.slice(0, numQuestions));
        setCurrentIndex(0);
        setScore(0);
        setSelectedAnswers([]);
        setShowFeedback(false);
      });
  }, [topics, numQuestions]);

  if (questions.length === 0) {
    return <div style={{ padding: 20 }}>Загрузка вопросов...</div>;
  }

  if (currentIndex >= questions.length) {
    return (
      <Results
        correctCount={score}
        totalCount={questions.length}
        onRestart={() => onRestart()}
      />
    );
  }

  const currentQuestion = questions[currentIndex];

  const handleAnswerSelect = (ids: string[] | string) => {
    setSelectedAnswers(ids);
  };

  const handleNext = () => {
    let isCorrect = false;

    if (Array.isArray(selectedAnswers)) {
      isCorrect =
        selectedAnswers.length === currentQuestion.correctAnswerIds.length &&
        selectedAnswers.every((id) =>
          currentQuestion.correctAnswerIds.includes(id)
        );
    } else {
      isCorrect = currentQuestion.correctAnswerIds.includes(selectedAnswers);
    }

    setLastAnswerCorrect(isCorrect);
    setShowFeedback(true);

    if (isCorrect) {
      setScore((s) => s + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);
    setSelectedAnswers([]);
    setCurrentIndex((i) => i + 1);

    if (currentIndex + 1 === questions.length) {
      const total = questions.length;
      const correct = score;
      const percentCorrect = total > 0 ? (correct / total) * 100 : 0;

      const newStats = { ...statsByTopic };

      topics.forEach((topic) => {
        const prev = newStats[topic] || {
          correctAnswers: 0,
          totalQuestions: 0,
          percentCorrect: 0,
        };

        const updatedCorrect = prev.correctAnswers + correct;
        const updatedTotal = prev.totalQuestions + total;
        const updatedPercent = (updatedCorrect / updatedTotal) * 100;

        newStats[topic] = {
          correctAnswers: updatedCorrect,
          totalQuestions: updatedTotal,
          percentCorrect: updatedPercent,
        };
      });

      setStatsByTopic(newStats);
    }
  };

  return (
    <div className='question' style={{ padding: '0 20px' }}>
      <p className='question-title'>
        Вопрос {currentIndex + 1} из {questions.length}
      </p>
      <Question
        question={currentQuestion}
        selectedAnswerIds={selectedAnswers}
        onAnswerSelect={handleAnswerSelect}
      />
      {!showFeedback && (
        <button
          onClick={handleNext}
          disabled={
            (Array.isArray(selectedAnswers)
              ? selectedAnswers.length === 0
              : selectedAnswers === '') || false
          }
        >
          Проверить
        </button>
      )}
      {showFeedback && (
        <>
          {lastAnswerCorrect ? (
            <div className='answer-feedback' style={{ color: 'green' }}>
              Правильно!
            </div>
          ) : (
            <div className='answer-feedback' style={{ color: 'red' }}>
              Неправильно! <br />
              Правильный ответ:{' '}
              {currentQuestion.answers
                .filter((ans) =>
                  currentQuestion.correctAnswerIds.includes(ans.id)
                )
                .map((ans) => ans.text)
                .join(', ')}
              <br />
              {currentQuestion.correctAnswerDescription}
            </div>
          )}
          <button onClick={handleContinue} style={{ marginTop: 10 }}>
            Далее
          </button>
        </>
      )}
    </div>
  );
};

export default Quiz;
