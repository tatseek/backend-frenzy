import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request, { params }) {
  try {
    const { gameId } = params
    const { db } = await connectToDatabase()
    
    // Get random questions
    let questions = await db.collection('questions')
      .aggregate([{ $sample: { size: 10 } }])
      .toArray()
    
    if (questions.length === 0) {
      // Add sample questions if none exist
      const sampleQuestions = [
        {
          question: "What does HTML stand for?",
          options: ["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink Text Markup Language"],
          correct: 0,
          category: "web-development"
        },
        {
          question: "Which JavaScript framework is developed by Facebook?",
          options: ["Angular", "Vue", "React", "Svelte"],
          correct: 2,
          category: "javascript"
        },
        {
          question: "What is the time complexity of binary search?",
          options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
          correct: 1,
          category: "algorithms"
        },
        {
          question: "Which database type is MongoDB?",
          options: ["Relational", "Graph", "Document", "Key-Value"],
          correct: 2,
          category: "databases"
        },
        {
          question: "What does CSS stand for?",
          options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Colorful Style Sheets"],
          correct: 1,
          category: "web-development"
        },
        {
          question: "Which HTTP method is used to update data?",
          options: ["GET", "POST", "PUT", "DELETE"],
          correct: 2,
          category: "web-apis"
        },
        {
          question: "What is the default port for HTTP?",
          options: ["443", "8080", "80", "3000"],
          correct: 2,
          category: "networking"
        },
        {
          question: "Which company created TypeScript?",
          options: ["Google", "Facebook", "Microsoft", "Apple"],
          correct: 2,
          category: "javascript"
        },
        {
      question: "Which of the following uses Graph-based DBMS?",
      options: ["Cassandra", "SQLite", "MySQL", "neo4j"],
      correct: 3,
      category: "databases",
      difficulty: "medium"
    },
	  {
      question: "In C++ , an object is an instance of what?",
      options: ["Function", "Class", "Variable", "Method"],
      correct: 1,
      category: "OOP",
      difficulty: "easy"
    },
	  {
      question: "Which of the following is the most common internet protocol?",
      options: ["POP3", "SMTP", "FTP", "HTTP"],
      correct: 3,
      category: "networking",
      difficulty: "easy"
    },
	  {
      question: "Which of these is not a characteristic of web 2.0?",
      options: ["User-generated content", "Interactivity", "Read-only access", "Social-networking"],
      correct: 2,
      category: "web-development",
      difficulty: "hard"
    }
      ]
      
      await db.collection('questions').insertMany(sampleQuestions)
      questions = sampleQuestions.slice(0, 10)
    }
    
    const result = await db.collection('games').updateOne(
      { id: gameId },
      {
        $set: {
          status: 'playing',
          questions: questions.slice(0, 10),
          currentQuestion: 0,
          startedAt: new Date(),
          questionStartTime: new Date()
        }
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }
    
    const game = await db.collection('games').findOne({ id: gameId })
    return NextResponse.json({ game })
  } catch (error) {
    console.error('Error starting game:', error)
    return NextResponse.json({ error: 'Failed to start game' }, { status: 500 })
  }
}
