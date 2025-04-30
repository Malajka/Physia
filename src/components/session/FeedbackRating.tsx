import { Button } from "@/components/ui/button";
import type { FeedbackRatingDto, SubmitFeedbackCommandDto } from "@/types";
import React, { useEffect, useState } from "react";

interface FeedbackRatingProps {
  sessionId: number;
}

export const FeedbackRating: React.FC<FeedbackRatingProps> = ({ sessionId }) => {
  const [feedback, setFeedback] = useState<FeedbackRatingDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const response = await fetch(`/api/sessions/${sessionId}/feedback`);
        const data: FeedbackRatingDto = await response.json();
        if (!response.ok) {
          throw new Error((data as any).error || "Failed to load feedback");
        }
        setFeedback(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    fetchFeedback();
  }, [sessionId]);

  const handleRate = async (rating: SubmitFeedbackCommandDto["rating"]) => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      const data: FeedbackRatingDto = await response.json();
      if (!response.ok) {
        throw new Error((data as any).error || "Failed to submit feedback");
      }
      setFeedback(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading feedback...</p>;
  }

  return (
    <div className="mt-6 text-center">
      <p className="mb-2 font-medium">Rate this session:</p>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      <div className="flex justify-center space-x-4">
        <Button
          disabled={saving}
          variant={feedback?.rating === 1 ? "default" : "outline"}
          onClick={() => handleRate(1)}
        >
          👍
        </Button>
        <Button
          disabled={saving}
          variant={feedback?.rating === 0 ? "destructive" : "outline"}
          onClick={() => handleRate(0)}
        >
          👎
        </Button>
      </div>
      {feedback?.rated_at && (
        <p className="mt-2 text-sm text-gray-500">
          Rated at: {new Date(feedback.rated_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}; 