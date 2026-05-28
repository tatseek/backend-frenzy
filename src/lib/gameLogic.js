export const GAME_STATES = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  FINISHED: 'finished'
}

export const QUESTION_TIME_LIMIT = 10000 

export class GameManager {
  constructor(gameId) {
    this.gameId = gameId
    this.currentQuestion = 0
    this.players = new Map()
    this.questions = []
    this.state = GAME_STATES.WAITING
    this.questionStartTime = null
  }

  addPlayer(userId, username) {
    this.players.set(userId, {
      id: userId,
      username,
      score: 0,
      answers: []
    })
  }

  removePlayer(userId) {
    this.players.delete(userId)
  }

  setQuestions(questions) {
    this.questions = questions
  }

  startGame() {
    this.state = GAME_STATES.PLAYING
    this.currentQuestion = 0
    this.questionStartTime = Date.now()
  }

  submitAnswer(userId, answerIndex) {
    const player = this.players.get(userId)
    if (!player) return { success: false, error: 'Player not found' }

    const question = this.questions[this.currentQuestion]
    const timeElapsed = Date.now() - this.questionStartTime
    
    if (timeElapsed > QUESTION_TIME_LIMIT) {
      return { success: false, error: 'Time limit exceeded' }
    }

    const isCorrect = answerIndex === question.correct
    const points = isCorrect ? this.calculatePoints(timeElapsed) : 0

    player.answers.push({
      questionIndex: this.currentQuestion,
      answer: answerIndex,
      correct: isCorrect,
      timeElapsed,
      points
    })

    if (isCorrect) {
      player.score += points
    }

    return {
      success: true,
      correct: isCorrect,
      points,
      timeElapsed
    }
  }

  calculatePoints(timeElapsed) {
    
    const maxPoints = 1000
    const timeBonus = Math.max(0, (QUESTION_TIME_LIMIT - timeElapsed) / QUESTION_TIME_LIMIT)
    return Math.round(maxPoints * (0.5 + 0.5 * timeBonus))
  }

  nextQuestion() {
    this.currentQuestion++
    this.questionStartTime = Date.now()
    
    if (this.currentQuestion >= this.questions.length) {
      this.state = GAME_STATES.FINISHED
      return { finished: true }
    }
    
    return { finished: false, questionIndex: this.currentQuestion }
  }

  getLeaderboard() {
    return Array.from(this.players.values())
      .sort((a, b) => b.score - a.score)
      .map((player, index) => ({
        rank: index + 1,
        ...player
      }))
  }

  getGameState() {
    return {
      gameId: this.gameId,
      state: this.state,
      currentQuestion: this.currentQuestion,
      totalQuestions: this.questions.length,
      players: Array.from(this.players.values()),
      leaderboard: this.getLeaderboard(),
      question: this.questions[this.currentQuestion] || null,
      timeRemaining: this.getTimeRemaining()
    }
  }

  getTimeRemaining() {
    if (!this.questionStartTime || this.state !== GAME_STATES.PLAYING) return 0
    return Math.max(0, QUESTION_TIME_LIMIT - (Date.now() - this.questionStartTime))
  }
}


const gameManagers = new Map()

export function getGameManager(gameId) {
  if (!gameManagers.has(gameId)) {
    gameManagers.set(gameId, new GameManager(gameId))
  }
  return gameManagers.get(gameId)
}

export function removeGameManager(gameId) {
  gameManagers.delete(gameId)
}
