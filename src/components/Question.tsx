import React, { useMemo } from "react";
import { Question as QuestionType } from "../types/question";

interface Props {
  question: QuestionType;
  selectedAnswerIds: string[] | string;
  onAnswerSelect: (ids: string[] | string) => void;
}

const Question: React.FC<Props> = ({
  question,
  selectedAnswerIds,
  onAnswerSelect,
}) => {
  const shuffledAnswers = useMemo(() => {
    const arr = [...question.answers];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [question]);

  const singleAnswer = question.correctAnswerIds.length === 1;

  const handleChange = (answerId: string) => {
    if (singleAnswer) {
      onAnswerSelect(answerId);
    } else {
      if (Array.isArray(selectedAnswerIds)) {
        if (selectedAnswerIds.includes(answerId)) {
          onAnswerSelect(selectedAnswerIds.filter((id) => id !== answerId));
        } else {
          onAnswerSelect([...selectedAnswerIds, answerId]);
        }
      }
    }
  };

  return (
    <div className="question-container">
      <h3 className="question-text">{question.text}</h3>
      <div className="answers-list">
        {shuffledAnswers.map((answer) => {
          const checked = Array.isArray(selectedAnswerIds)
            ? selectedAnswerIds.includes(answer.id)
            : selectedAnswerIds === answer.id;
          return (
            <div className='item' key={answer.id}>
              <label>
                <input
                  type={singleAnswer ? "radio" : "checkbox"}
                  name={singleAnswer ? question.id : undefined}
                  checked={checked}
                  onChange={() => handleChange(answer.id)}
                />
                <div className='answer-text'>{answer.text}</div>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Question;
