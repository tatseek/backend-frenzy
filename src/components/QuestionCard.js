'use client'

import { useState, useEffect } from 'react'

export default function QuestionCard({ 
  question, 
  questionNumber, 
  totalQuestions, 
  timeRemaining, 
  onAnswer, 
  disabled,
  currentQuestionIndex 
}) {
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  
  useEffect(() => {
    setSelectedAnswer(null)
    setAnswered(false)
    setIsSubmitting(false)
    console.log(`Question ${currentQuestionIndex}: Reset answer state`)
  }, [currentQuestionIndex]) // Reset when question index changes

  const handleAnswer = async (index) => {
    if (answered || disabled || isSubmitting) {
      console.log('Cannot answer:', { answered, disabled, isSubmitting })
      return
    }
    
    console.log(`Question ${currentQuestionIndex}: Selecting answer ${index}`)
    setSelectedAnswer(index)
    setAnswered(true)
    setIsSubmitting(true)
    
    try {
      await onAnswer(index)
    } catch (error) {
      console.error('Error submitting answer:', error)
      // Reset on error
      setSelectedAnswer(null)
      setAnswered(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getOptionClass = (index) => {
    let baseClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 mb-3 "
    
    if (answered && index === selectedAnswer) {
      baseClass += "border-blue-500 bg-blue-50 text-blue-800 "
    } else if (!answered && !disabled && !isSubmitting) {
      baseClass += "border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer "
    } else {
      baseClass += "border-gray-200 opacity-60 cursor-not-allowed "
    }
    
    return baseClass
  }

  const getTimerClass = () => {
    if (timeRemaining > 10) return "text-green-600"
    if (timeRemaining > 5) return "text-yellow-600"
    return "text-red-600 animate-pulse"
  }

  if (!question) return null

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      // Header with better debugging info 
      <div className="flex justify-between items-center mb-6">
        <span className="text-sm font-medium text-gray-500">
          Question {questionNumber} of {totalQuestions} (ID: {currentQuestionIndex})
        </span>
        <div className={`text-2xl font-bold ${getTimerClass()}`}>
          {timeRemaining}s
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}> </div>
      </div>

      // Question 
      <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
        {question.question}
      </h2>

      {/* Debug Info */}
      <div className="mb-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
        Debug: answered={answered.toString()}, selected={selectedAnswer}, disabled={disabled.toString()}, submitting={isSubmitting.toString()}
      </div>

      {/* Options */}
      <div className="space-y-0">
        {question.options.map((option, index) => (
          <button key={`${currentQuestionIndex}-${index}`} onClick={() => handleAnswer(index)} disabled={answered || disabled || isSubmitting}className={getOptionClass(index)} >
            <div className="flex items-center">
              <span className="bg-gray-100 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-lg">{option}</span>
              {answered && index === selectedAnswer && (
                <span className="ml-auto text-blue-600">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Status Messages */}
      {answered && !disabled && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 font-medium">
             Answer submitted! Selected: {String.fromCharCode(65 + selectedAnswer)}
          </p>
        </div>
      )}

      {disabled && !answered && (
        <div className="mt-6 p-4 bg-red-50 rounded-lg">
          <p className="text-red-800 font-medium"> Time's up! Waiting for next question...</p>
        </div>
      )}

      {isSubmitting && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <p className="text-yellow-800 font-medium"> Submitting answer...</p>
        </div>
      )}
    </div>
  )
}


