"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface MathCaptchaProps {
  onSuccess: () => void;
  onError?: () => void;
  theme?: "light" | "dark";
}

interface MathProblem {
  num1: number;
  num2: number;
  operator: "+" | "-" | "*";
  answer: number;
}

const generateProblem = (): MathProblem => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operators = ["+", "-", "*"] as const;
  const operator = operators[Math.floor(Math.random() * operators.length)];

  let answer = 0;
  if (operator === "+") answer = num1 + num2;
  else if (operator === "-") answer = num1 - num2;
  else answer = num1 * num2;

  return { num1, num2, operator, answer };
};

export default function MathCaptcha({
  onSuccess,
  onError,
  theme = "dark",
}: MathCaptchaProps) {
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setProblem(generateProblem());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!problem) return;

    const answer = parseInt(userAnswer);
    
    if (answer === problem.answer) {
      setIsValid(true);
      toast.success("Verification successful ✅");
      onSuccess();
    } else {
      setAttempts((prev) => {
        const newAttempts = prev + 1;
        if (newAttempts >= 3) {
          setProblem(generateProblem());
          setUserAnswer("");
          toast.error("Too many attempts. Question refreshed.");
          onError?.();
          return 0;
        } else {
          toast.error(`Wrong answer. ${3 - newAttempts} attempts remaining.`);
          return newAttempts;
        }
      });
      setUserAnswer("");
    }
  };

  if (!problem) return null;

  return (
    <div
      className={`w-full max-w-sm mx-auto p-4 rounded-lg border ${
        theme === "dark"
          ? "bg-gray-800/50 border-gray-700"
          : "bg-gray-100 border-gray-300"
      }`}
    >
      <div className={`text-center mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
        <p className="text-sm font-medium mb-2">Solve this problem:</p>
        <div className={`text-lg font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
          {problem.num1} {problem.operator} {problem.num2} = ?
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="number"
          inputMode="numeric"
          placeholder="Your answer"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={isValid}
          className={`w-full px-3 py-2 rounded-lg border text-center font-semibold ${
            theme === "dark"
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
          } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
        />

        <button
          type="submit"
          disabled={isValid || !userAnswer}
          className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {isValid ? "✓ Verified" : "Verify"}
        </button>
      </form>

      {attempts > 0 && !isValid && (
        <p className={`text-xs mt-2 text-center ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
          {3 - attempts} attempt{3 - attempts !== 1 ? "s" : ""} remaining
        </p>
      )}
    </div>
  );
}
