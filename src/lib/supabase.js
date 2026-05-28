

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

//auth
export const auth = {
  signUp: async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    })
    return { data, error }
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }
}

//realtime
export const realtime = {
  subscribeToGame: (gameId, callback) => {
    return supabase
      .channel(`game-${gameId}`)
      .on('broadcast', { event: 'game-update' }, callback)
      .subscribe()
  },

  broadcastGameUpdate: (gameId, payload) => {
    return supabase
      .channel(`game-${gameId}`)
      .send({
        type: 'broadcast',
        event: 'game-update',
        payload
      })
  },

  subscribeToScores: (gameId, callback) => {
    return supabase
      .channel(`scores-${gameId}`)
      .on('broadcast', { event: 'score-update' }, callback)
      .subscribe()
  },

  broadcastScoreUpdate: (gameId, payload) => {
    return supabase
      .channel(`scores-${gameId}`)
      .send({
        type: 'broadcast',
        event: 'score-update',
        payload
      })
  }
}
