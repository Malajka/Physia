import React, { useState } from 'react';
import type { CreateSessionCommandDto } from '../types';

interface TestInput { muscle_test_id: number; pain_intensity: number; }
interface SessionGeneratorProps {
  bodyPartId: number;
  tests: TestInput[];
}

/**
 * React component to generate a new training session via /api/sessions
 */
export const SessionGenerator: React.FC<SessionGeneratorProps> = ({ bodyPartId, tests }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload: CreateSessionCommandDto = { body_part_id: bodyPartId, tests };
      const resp = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await resp.json();
      if (!resp.ok) {
        throw new Error(result.error?.message || 'Failed to create session');
      }
      // Redirect to the new session details page
      window.location.href = `/sessions/${result.id}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 text-center">
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Generating...' : 'Generate Training Session'}
      </button>
    </div>
  );
}; 