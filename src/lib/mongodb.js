import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const options = {}

let client
let clientPromise

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local')
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

export async function connectToDatabase() {
  const client = await clientPromise
  const db = client.db('flashcard-frenzy')
  return { client, db }
}
// Database Collections
export const collections = {
  games: 'games',
  questions: 'questions',
  matches: 'matches',
  scores: 'scores'
}

// initializing database with sample data
export async function initializeDatabase() {
  const { db } = await connectToDatabase()
  
  // sample questions
  const sampleQuestions = [
    {
      question: "What does HTML stand for?",
      options: ["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"],
      correct: 0,
      category: "web-development",
      difficulty: "easy"
    },
    {
      question: "Which JavaScript framework is developed by Facebook?",
      options: ["Angular", "Vue", "React", "Svelte"],
      correct: 2,
      category: "javascript",
      difficulty: "easy"
    },
    {
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correct: 1,
      category: "algorithms",
      difficulty: "medium"
    },
    {
      question: "Which database type is MongoDB?",
      options: ["Relational", "Graph", "Document", "Key-Value"],
      correct: 2,
      category: "databases",
      difficulty: "easy"
    },
    {
      question: "What does REST stand for in API design?",
      options: ["Representational State Transfer", "Remote State Transfer", "Relational State Transfer", "Recursive State Transfer"],
      correct: 0,
      category: "apis",
      difficulty: "medium"
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
  
  try {
    await db.collection(collections.questions).insertMany(sampleQuestions)
    console.log('Sample questions inserted')
  } catch (error) {
    console.log('Questions may already exist:', error.message)
  }
}
