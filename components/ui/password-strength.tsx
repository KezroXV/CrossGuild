"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

type PasswordStrengthProps = {
  password: string;
};

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setFeedback("");
      return;
    }

    // Simple password strength calculation
    let score = 0;

    // Length check
    if (password.length >= 8) score += 25;

    // Uppercase check
    if (/[A-Z]/.test(password)) score += 25;

    // Lowercase check
    if (/[a-z]/.test(password)) score += 25;

    // Number/special character check
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) score += 25;

    // Set feedback based on score
    if (score <= 25) {
      setFeedback("Weak password");
    } else if (score <= 50) {
      setFeedback("Fair password");
    } else if (score <= 75) {
      setFeedback("Good password");
    } else {
      setFeedback("Strong password");
    }

    setStrength(score);
  }, [password]);

  // Color based on strength
  const getColorClass = () => {
    if (strength <= 25) return "bg-red-500";
    if (strength <= 50) return "bg-orange-500";
    if (strength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs">
        <span>{feedback}</span>
        <span>{strength}%</span>
      </div>
      <Progress value={strength} className={getColorClass()} />
    </div>
  );
}
