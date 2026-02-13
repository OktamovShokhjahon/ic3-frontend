'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface TestResult {
  total: number;
  correct: number;
  wrong: number;
  score: number;
  timeSpent: number;
}

export default function ResultsPage() {
  const [result, setResult] = useState<TestResult | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      try {
        setResult(JSON.parse(decodeURIComponent(data)));
      } catch (error) {
        console.error('Failed to parse result data:', error);
        router.push('/dashboard');
      }
    } else {
      router.push('/dashboard');
    }
  }, [searchParams, router]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Excellent! Outstanding performance!';
    if (score >= 80) return 'Great job! Very good performance!';
    if (score >= 70) return 'Good work! Keep practicing!';
    if (score >= 60) return 'Fair performance. Room for improvement.';
    return 'Keep practicing! You can do better!';
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-white">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Test Results</h1>
          <p className="text-xl text-gray-600">Here&apos;s how you performed</p>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 text-center">
          <div className={`text-6xl font-bold mb-4 ${getScoreColor(result.score)}`}>
            {result.score}%
          </div>
          <div className="text-xl text-gray-700 mb-6">
            {getScoreMessage(result.score)}
          </div>
          
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-600">{result.correct}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-red-600">{result.wrong}</div>
              <div className="text-sm text-gray-600">Wrong</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-blue-600">{result.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-semibold text-gray-700">
              Time: {formatTime(result.timeSpent)}
            </div>
          </div>
        </div>

        {/* Performance Analysis */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Performance Analysis</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Accuracy Rate</span>
              <span className="font-semibold text-gray-800">
                {Math.round((result.correct / result.total) * 100)}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Time per Question</span>
              <span className="font-semibold text-gray-800">
                {Math.round(result.timeSpent / result.total)}s
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Performance Level</span>
              <span className={`font-semibold ${getScoreColor(result.score)}`}>
                {result.score >= 80 ? 'Excellent' : result.score >= 60 ? 'Good' : 'Needs Improvement'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Score Progress</span>
              <span>{result.score}%</span>
            </div>
            <div className="bg-gray-200 rounded-full h-4">
              <div 
                className={`h-4 rounded-full transition-all duration-1000 ${
                  result.score >= 80 ? 'bg-green-500' : 
                  result.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${result.score}%` }}
              />
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recommendations</h2>
          
          <div className="space-y-3">
            {result.score < 60 && (
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-sm">!</span>
                </div>
                <p className="text-gray-700">
                  Consider reviewing the study materials and retaking the test after more preparation.
                </p>
              </div>
            )}
            
            {result.score >= 60 && result.score < 80 && (
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-yellow-600 text-sm">i</span>
                </div>
                <p className="text-gray-700">
                  Good effort! Focus on the areas where you made mistakes to improve your score.
                </p>
              </div>
            )}
            
            {result.score >= 80 && (
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <p className="text-gray-700">
                  Excellent work! You&apos;re ready for the next level or more challenging topics.
                </p>
              </div>
            )}
            
            {result.timeSpent > result.total * 60 && (
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm">⏱</span>
                </div>
                <p className="text-gray-700">
                  Try to improve your time management. Practice with timed sessions to build speed.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition transform hover:scale-105"
          >
            Back to Dashboard
          </button>
          
          <button
            onClick={() => window.print()}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition transform hover:scale-105"
          >
            Print Results
          </button>
        </div>
      </div>
    </div>
  );
}
