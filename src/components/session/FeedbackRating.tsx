import { Button } from "@/components/ui";
import { fetchFeedback, submitFeedback } from "@/lib/services/session/feedback";
import type { FeedbackRatingDto } from "@/types";
import React, { useCallback, useEffect, useState } from "react";

interface FeedbackRatingProps {
  sessionId: number;
}

export const FeedbackRating: React.FC<FeedbackRatingProps> = ({ sessionId }) => {
  const [feedback, setFeedback] = useState<FeedbackRatingDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadFeedback() {
      try {
        const result = await fetchFeedback(sessionId);
        if (isMounted) setFeedback(result.data);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadFeedback();
    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const handleRate = useCallback(
    async (rating: 0 | 1) => {
      setSaving(true);
      setError(null);
      try {
        const result = await submitFeedback(sessionId, rating);
        setFeedback(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setSaving(false);
      }
    },
    [sessionId]
  );

  if (loading) return <p>Loading feedback...</p>;

  if (error && !feedback) {
    return (
      <p className="text-red-600 mb-2" data-testid="feedback-error">
        {error}
      </p>
    );
  }

  return (
    <div className="mt-6 text-center" data-testid="feedback-rating">
      <p className="mb-2 font-medium">Rate this session:</p>
      {error && (
        <p className="text-red-600 mb-2" data-testid="feedback-error">
          {error}
        </p>
      )}
      <div className="flex justify-center space-x-4">
        <Button
          aria-label="Rate session as positive"
          disabled={saving}
          variant={feedback?.rating === 1 ? "default" : "outline"}
          onClick={() => handleRate(1)}
          data-testid="feedback-positive"
        >
          {saving && feedback?.rating !== 0 ? "..." : "👍"}
        </Button>
        <Button
          aria-label="Rate session as negative"
          disabled={saving}
          variant={feedback?.rating === 0 ? "destructive" : "outline"}
          onClick={() => handleRate(0)}
          data-testid="feedback-negative"
        >
          {saving && feedback?.rating !== 1 ? "..." : "👎"}
        </Button>
      </div>
      {feedback?.rated_at && (
        <p className="mt-2 text-sm text-gray-500" data-testid="feedback-rated-at">
          Rated at: {new Date(feedback.rated_at).toLocaleString()}
        </p>
      )}
    </div>
  );
};
