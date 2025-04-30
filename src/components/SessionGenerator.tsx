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
    <div className="bg-white p-6 rounded-xl shadow-lg mt-10 max-w-md mx-auto text-center">
      {error && <p className="text-[#F4A261] mb-4 font-semibold">{error}</p>}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="px-6 py-3 bg-[#1B9B6B] text-white rounded-xl shadow-md hover:bg-[#156F53] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
      >
        {loading ? 'Generating...' : 'Generate Training Session'}
      </button>
    </div>
  );
}; 