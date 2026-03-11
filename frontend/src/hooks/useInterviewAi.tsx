import { useState } from "react";
import {
  generateInterviewAnswer,
  type InterviewRequest,
} from "../services/appServices";

export const useInterviewAI = () => {
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const askQuestion = async (payload: InterviewRequest) => {
    try {
      setLoading(true);
      setError(null);
      setAnswer(null);

      const data = await generateInterviewAnswer(payload);
      setAnswer(data.answer);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return {
    askQuestion,
    loading,
    answer,
    error,
  };
};
