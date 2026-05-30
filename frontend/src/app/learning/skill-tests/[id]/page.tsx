'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Clock, 
  CheckCircle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import Link from 'next/link';

export default function TakeSkillTestPage() {
  const { id } = useParams();
  const router = useRouter();
  const [test, setTest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchTest();
  }, [id]);

  useEffect(() => {
    if (test && !result && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            submitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [test, result, timeLeft]);

  const fetchTest = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/learning/skill-tests/${id}`);
      setTest(res.data);
      setTimeLeft(res.data.timeLimitMin * 60);
      setAnswers(new Array(res.data.questions.length).fill(-1));
    } catch (error) {
      console.error('Error fetching test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (result) return; // Prevent changing answer after submit
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      submitTest();
    }
  };

  const submitTest = async () => {
    try {
      const res = await api.post(`/learning/skill-tests/${id}/attempt`, {
        answers,
      });
      setResult(res.data);
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Failed to submit test. Please try again.');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center text-center">
        <div>
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Test Not Found</h2>
          <Link href="/learning/skill-tests">
            <Button>Back to Skill Tests</Button>
          </Link>
        </div>
      </div>
    );
  }

  // --- RESULT VIEW ---
  if (result) {
    const isPass = result.passed;
    return (
      <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
        <div className="max-w-md w-full glass rounded-3xl p-8 text-center relative overflow-hidden border border-white/10 shadow-2xl">
          <div className={`absolute top-0 left-0 w-full h-2 ${isPass ? 'bg-green-500' : 'bg-red-500'}`} />
          
          <div className="mb-6 flex justify-center">
            {isPass ? (
              <div className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                 <ShieldCheck className="w-12 h-12 text-green-500" />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                 <XCircle className="w-12 h-12 text-red-500" />
              </div>
            )}
          </div>
          
          <h2 className="text-3xl font-black mb-2">
            {isPass ? 'Congratulations!' : 'Keep Practicing'}
          </h2>
          <p className="text-foreground/60 mb-8">
            You scored {result.score}% (Passing: {result.passingScore}%)
          </p>

          {isPass && result.badge && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8">
              <p className="text-sm font-bold text-accent mb-2">Badge Earned!</p>
              <p className="text-xs text-foreground/60">This skill badge has been added to your profile.</p>
            </div>
          )}

          <div className="flex gap-4">
            <Link href="/profile" className="flex-1">
              <Button variant="outline" className="w-full">View Profile</Button>
            </Link>
            <Link href="/learning/skill-tests" className="flex-1">
              <Button className="w-full">Done</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- TEST TAKING VIEW ---
  const question = test.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / test.questions.length) * 100;

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header / Progress */}
        <div className="glass rounded-2xl p-6 mb-8 border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-xl font-bold">{test.title}</h1>
            <p className="text-sm text-foreground/60">Question {currentQuestionIndex + 1} of {test.questions.length}</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-full font-mono font-bold border border-red-500/20">
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="w-full h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        {/* Question Area */}
        <div className="glass rounded-3xl p-8 border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32" />
          
          <h2 className="text-2xl font-bold mb-8 leading-relaxed relative z-10">
            {question.question}
          </h2>

          <div className="space-y-4 relative z-10">
            {question.options.map((opt: string, idx: number) => {
              const isSelected = answers[currentQuestionIndex] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`
                    w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between
                    ${isSelected 
                      ? 'bg-accent/10 border-accent/50 ring-1 ring-accent' 
                      : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'}
                  `}
                >
                  <span className="font-medium">{opt}</span>
                  {isSelected && <CheckCircle className="w-5 h-5 text-accent" />}
                </button>
              );
            })}
          </div>

          <div className="mt-12 flex justify-between items-center relative z-10 border-t border-white/5 pt-6">
            <div className="text-sm text-foreground/40">
              {answers[currentQuestionIndex] === -1 ? 'Select an answer to continue' : 'Ready'}
            </div>
            <Button 
              onClick={handleNext}
              disabled={answers[currentQuestionIndex] === -1}
              className="gap-2 px-8"
            >
              {currentQuestionIndex === test.questions.length - 1 ? 'Submit Test' : 'Next Question'} 
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
