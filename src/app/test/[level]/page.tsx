'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';

interface Question {
  _id: string;
  level: number;
  number: number;
  question: string;
  options: string[];
}

interface User {
  id: string;
  username: string;
  role: string;
  levelAccess: {
    level1: boolean;
    level2: boolean;
    level3: boolean;
  };
  passportFullName?: string;
  passportNumber?: string;
}

export default function TestPage({ params }: { params: { level: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [testType, setTestType] = useState<'1-45' | '46-90' | 'full' | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [legacyUrl, setLegacyUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (testStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && testStarted) {
      handleSubmit();
    }
  }, [timeLeft, testStarted]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (testStarted && document.hidden) {
        setWarningCount(prev => prev + 1);
        if (warningCount >= 2) {
          handleSubmit(); // Auto-submit after 3 warnings
        }
      }
    };

    const handleBlur = () => {
      if (testStarted) {
        setWarningCount(prev => prev + 1);
        if (warningCount >= 2) {
          handleSubmit(); // Auto-submit after 3 warnings
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
        return false;
      }
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
        return false;
      }
    };

    if (testStarted) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleBlur);
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('copy', handleCopy);
      document.addEventListener('keydown', handleKeydown);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [testStarted, warningCount]);

  const checkAuth = async () => {
    try {
      const response = await api.get(`/auth/me`);
      setUser(response.data.user);
    } catch (error) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const requestFullscreen = async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (error) {
      console.error('Fullscreen request failed:', error);
    }
  };

  const startTest = async (type: '1-45' | '46-90' | 'full') => {
    try {
      await requestFullscreen();

      // Special case: external iSpring test for Level 1, Questions 1–45
      if (params.level === '1' && type === '1-45') {
        // Served from frontend/public as /lvl-1-1/index.html
        setLegacyUrl('/lvl-1-1/index.html');
        setTestType(type);
        setTestStarted(true);
        setStartTime(Date.now());
        // Optional timer for external test (still tracked locally)
        setTimeLeft(2700);
        return;
      }

      // Special case: external iSpring test for Level 1, Questions 46–90
      if (params.level === '1' && type === '46-90') {
        // Served from frontend/public as /lvl-1-2/index.html
        setLegacyUrl('/lvl-1-2/index.html');
        setTestType(type);
        setTestStarted(true);
        setStartTime(Date.now());
        // Same 45-minute limit as the first half
        setTimeLeft(2700);
        return;
      }

      const response = await api.get(`/tests/questions/${params.level}/${type}`);

      setQuestions(response.data.questions);
      setTestType(type);
      setAnswers(new Array(response.data.questions.length).fill(-1));
      setTestStarted(true);
      setStartTime(Date.now());

      // Set timer (90 minutes for full test, 45 minutes for half tests)
      const timeLimit = type === 'full' ? 5400 : 2700;
      setTimeLeft(timeLimit);
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  };

  const handleAnswer = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!startTime || !testType) return;
    
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      const response = await api.post(`/tests/submit`, {
        level: parseInt(params.level),
        type: testType,
        questionIds: questions.map(q => q._id),
        answers,
        timeSpent
      });
      
      router.push(`/results?data=${encodeURIComponent(JSON.stringify(response.data.result))}`);
    } catch (error) {
      console.error('Failed to submit test:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!testStarted) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        {/* Watermark background with passport info (best-effort, non-interactive) */}
        {user && (
          <div className="pointer-events-none select-none fixed inset-0 opacity-25 z-50">
            <div className="relative w-full h-full">
              {Array.from({ length: 5 }).map((_, row) =>
                Array.from({ length: 5 }).map((_, col) => {
                  const top = 10 + row * 20; // 10%, 30%, 50%, 70%, 90%
                  const left = 10 + col * 20;
                  return (
                    <div
                      key={`${row}-${col}`}
                      className="absolute text-2xl md:text-3xl font-semibold tracking-wide text-gray-700 whitespace-nowrap"
                      style={{
                        top: `${top}%`,
                        left: `${left}%`,
                        transform: 'translate(-50%, -50%) rotate(-20deg)',
                      }}
                    >
                      {user.passportFullName ?? user.username} · {user.passportNumber ?? 'N/A'}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl backdrop-blur-lg bg-opacity-95">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Level {params.level} Test</h1>
            <p className="text-gray-600">Choose your test type</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { type: '1-45' as const, label: 'Questions 1-45', desc: 'First half of the test' },
              { type: '46-90' as const, label: 'Questions 46-90', desc: 'Second half of the test' },
              { type: 'full' as const, label: 'Full Practice', desc: 'All 90 questions' }
            ].map((option) => (
              <button
                key={option.type}
                onClick={() => startTest(option.type)}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition transform hover:scale-105"
              >
                <h3 className="text-xl font-bold mb-2">{option.label}</h3>
                <p className="text-sm opacity-90">{option.desc}</p>
              </button>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-800 transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (legacyUrl) {
    const legacyLabel =
      testType === '1-45'
        ? 'Questions 1–45'
        : testType === '46-90'
        ? 'Questions 46–90'
        : 'Legacy Test';

    return (
      <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-0">
        {/* Watermark background with passport info */}
        {user && (
          <div className="pointer-events-none select-none fixed inset-0 opacity-25 z-50">
            <div className="relative w-full h-full">
              {Array.from({ length: 5 }).map((_, row) =>
                Array.from({ length: 5 }).map((_, col) => {
                  const top = 10 + row * 20;
                  const left = 10 + col * 20;
                  return (
                    <div
                      key={`${row}-${col}`}
                      className="absolute text-2xl md:text-3xl font-semibold tracking-wide text-gray-700 whitespace-nowrap"
                      style={{
                        top: `${top}%`,
                        left: `${left}%`,
                        transform: 'translate(-50%, -50%) rotate(-20deg)',
                      }}
                    >
                      {user.passportFullName ?? user.username} · {user.passportNumber ?? 'N/A'}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        <div className="relative z-10 h-screen flex flex-col">
          <div className="bg-white rounded-b-2xl shadow-lg p-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-lg font-semibold">
                Level {params.level} – IC3 GS6 ({legacyLabel})
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-lg font-mono">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
              <button
                onClick={async () => {
                  if (!startTime) {
                    router.push('/dashboard');
                    return;
                  }
                  const timeSpent = Math.floor((Date.now() - startTime) / 1000);
                  try {
                    const response = await api.post('/tests/legacy-complete', {
                      level: parseInt(params.level, 10),
                      type: testType ?? '1-45',
                      timeSpent
                    });
                    router.push(
                      `/results?data=${encodeURIComponent(
                        JSON.stringify(response.data.result)
                      )}`
                    );
                  } catch (error) {
                    console.error('Failed to record legacy test result:', error);
                    router.push('/dashboard');
                  }
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
              >
                Exit
              </button>
            </div>
          </div>

          <div className="flex-1">
            <iframe
              src={legacyUrl}
              className="w-full h-full border-0"
              title="IC3 GS6 Level 1 Test"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Watermark background with passport info (best-effort, non-interactive) */}
      {user && (
        <div className="pointer-events-none select-none fixed inset-0 opacity-25 z-50">
          <div className="relative w-full h-full">
            {Array.from({ length: 5 }).map((_, row) =>
              Array.from({ length: 5 }).map((_, col) => {
                const top = 10 + row * 20;
                const left = 10 + col * 20;
                return (
                  <div
                    key={`${row}-${col}`}
                    className="absolute text-xl md:text-2xl font-semibold tracking-wide text-gray-700 whitespace-nowrap"
                    style={{
                      top: `${top}%`,
                      left: `${left}%`,
                      transform: 'translate(-50%, -50%) rotate(-20deg)',
                    }}
                  >
                    {user.passportFullName ?? user.username} · {user.passportNumber ?? 'N/A'}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      {/* Warning Banner */}
      {warningCount > 0 && (
        <div className="bg-red-500 text-white p-4 text-center">
          ⚠️ Warning {warningCount}/3: Do not switch tabs or leave fullscreen! Test will be auto-submitted.
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-t-2xl shadow-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-semibold">Question {currentQuestion + 1}/{questions.length}</span>
            <span className="text-sm text-gray-600">Level {params.level} - {testType}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-lg font-mono">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
            <button
              onClick={handleSubmit}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
            >
              Submit Test
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {currentQuestionData.question}
        </h2>
        
        <div className="space-y-4">
          {currentQuestionData.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(currentQuestion, index)}
              className={`w-full text-left p-4 rounded-lg border-2 transition ${
                answers[currentQuestion] === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                  answers[currentQuestion] === index
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {answers[currentQuestion] === index && (
                    <div className="w-3 h-3 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-lg">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-2xl shadow-lg p-4">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg transition"
          >
            Previous
          </button>
          
          <div className="flex space-x-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm ${
                  answers[index] !== -1
                    ? 'bg-green-500 text-white'
                    : currentQuestion === index
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
            disabled={currentQuestion === questions.length - 1}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
