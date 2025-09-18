import { useState, useRef, useCallback } from 'react'

export interface WordAudioPair {
  word: string
  audioFile: string
}

// Word-Audio pairs data extracted from the original audio manager
const WORD_AUDIO_PAIRS: WordAudioPair[] = [
  { word: "achievement", audioFile: "achievement.mp3.wav" },
  { word: "acquire", audioFile: "acquire.mp3.wav" },
  { word: "amateur", audioFile: "amateur.mp3.wav" },
  { word: "ancient", audioFile: "ancient.mp3.wav" },
  { word: "apparatus", audioFile: "apparatus.mp3.wav" },
  { word: "appreciate", audioFile: "appreciate.mp3.wav" },
  { word: "argument", audioFile: "argument.mp3.wav" },
  { word: "arithmetic", audioFile: "arithmetic.mp3.wav" },
  { word: "arrangement", audioFile: "arrangement.mp3.wav" },
  { word: "assassinate", audioFile: "assassinate .mp3.wav" },
  { word: "athlete", audioFile: "athlete (1).mp3.wav" },
  { word: "authority", audioFile: "authority.mp3.wav" },
  { word: "auxiliary", audioFile: "auxiliary.mp3.wav" },
  { word: "beautiful", audioFile: "beautiful.mp3.wav" },
  { word: "benefit", audioFile: "benefit.mp3.wav" },
  { word: "biography", audioFile: "biography.mp3.wav" },
  { word: "boundary", audioFile: "boundary.mp3.wav" },
  { word: "calendar", audioFile: "calendar.mp3.wav" },
  { word: "campaign", audioFile: "campaign.mp3.wav" },
  { word: "candidate", audioFile: "candidate.mp3.wav" },
  { word: "category", audioFile: "category.mp3.wav" },
  { word: "cemetery", audioFile: "cemetery.mp3.wav" },
  { word: "ceremony", audioFile: "ceremony.mp3.wav" },
  { word: "certificate", audioFile: "certificate.mp3.wav" },
  { word: "characteristic", audioFile: "characteristic.mp3.wav" },
  { word: "chocolate", audioFile: "chocolate.mp3.wav" },
  { word: "circumstances", audioFile: "circumstances.mp3.wav" },
  { word: "colleague", audioFile: "colleague.mp3.wav" },
  { word: "column", audioFile: "column.mp3.wav" },
  { word: "commission", audioFile: "commission.mp3.wav" },
  { word: "committee", audioFile: "committee.mp3.wav" },
  { word: "comparison", audioFile: "comparison.mp3.wav" },
  { word: "competition", audioFile: "competition.mp3.wav" },
  { word: "completely", audioFile: "completely.mp3.wav" },
  { word: "compliment", audioFile: "compliment.mp3.wav" },
  { word: "concentrate", audioFile: "concentrate.mp3.wav" },
  { word: "conference", audioFile: "conference.mp3.wav" },
  { word: "definitely", audioFile: "definitely.mp3.wav" },
  { word: "emergency", audioFile: "emergency.mp3.wav" },
  { word: "exaggerate", audioFile: "exaggerate.mp3.wav" },
  { word: "excitement", audioFile: "excitement.mp3.wav" },
  { word: "extraordinary", audioFile: "extraordinary.mp3.wav" },
  { word: "fahrenheit", audioFile: "fahrenheit.mp3.wav" },
  { word: "fortunate", audioFile: "fortunate.mp3.wav" },
  { word: "hierarchy", audioFile: "hierarchy.mp3" },
  { word: "pronunciation", audioFile: "pronunciation.mp3.wav" }
]

export interface AudioStatus {
  loading: boolean
  playing: boolean
  error: string | null
  plays: number
}

export interface AudioManagerReturn {
  wordAudioPairs: WordAudioPair[]
  getAudioFile: (word: string) => string | null
  playAudio: (word: string) => Promise<void>
  audioStatus: AudioStatus
  resetPlays: () => void
  canPlay: (maxReplays: number) => boolean
}

export function useAudioManager(): AudioManagerReturn {
  const [audioStatus, setAudioStatus] = useState<AudioStatus>({
    loading: false,
    playing: false,
    error: null,
    plays: 0
  })
  
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const currentWordRef = useRef<string | null>(null)

  // Get audio file for a given word
  const getAudioFile = useCallback((word: string): string | null => {
    const pair = WORD_AUDIO_PAIRS.find(p => 
      p.word.toLowerCase() === word.toLowerCase()
    )
    return pair ? pair.audioFile : null
  }, [])

  // Play audio for a given word
  const playAudio = useCallback(async (word: string): Promise<void> => {
    const audioFile = getAudioFile(word)
    if (!audioFile) {
      setAudioStatus(prev => ({
        ...prev,
        error: `No audio file found for word: ${word}`
      }))
      return
    }

    setAudioStatus(prev => ({
      ...prev,
      loading: true,
      playing: false,
      error: null
    }))

    try {
      // Create audio element if it doesn't exist or if word changed
      if (!audioRef.current || currentWordRef.current !== word) {
        audioRef.current = new Audio(`/audio/${audioFile}`)
        currentWordRef.current = word
      } else {
        audioRef.current.src = `/audio/${audioFile}`
      }

      // Configure audio
      audioRef.current.volume = 1.0

      // Event handlers
      audioRef.current.onplay = () => {
        setAudioStatus(prev => ({
          ...prev,
          loading: false,
          playing: true,
          error: null
        }))
      }

      audioRef.current.onended = () => {
        setAudioStatus(prev => ({
          ...prev,
          playing: false,
          plays: prev.plays + 1
        }))
      }

      audioRef.current.onerror = (e) => {
        console.error('❌ Audio error:', e)
        setAudioStatus(prev => ({
          ...prev,
          loading: false,
          playing: false,
          error: 'Failed to load audio file',
          plays: prev.plays + 1 // Count as played even if error
        }))
      }

      // Play the audio
      await audioRef.current.play()

      // Fallback timeout
      setTimeout(() => {
        setAudioStatus(prev => {
          if (prev.loading) {
            return {
              ...prev,
              loading: false,
              playing: false,
              plays: prev.plays + 1
            }
          }
          return prev
        })
      }, 5000)

    } catch (err) {
      console.error('❌ Audio play failed:', err)
      setAudioStatus(prev => ({
        ...prev,
        loading: false,
        playing: false,
        error: 'Failed to play audio'
      }))
    }
  }, [getAudioFile])

  // Reset play count
  const resetPlays = useCallback(() => {
    setAudioStatus(prev => ({
      ...prev,
      plays: 0
    }))
  }, [])

  // Check if audio can be played (within replay limit)
  const canPlay = useCallback((maxReplays: number): boolean => {
    return audioStatus.plays < maxReplays && !audioStatus.loading
  }, [audioStatus.plays, audioStatus.loading])

  return {
    wordAudioPairs: WORD_AUDIO_PAIRS,
    getAudioFile,
    playAudio,
    audioStatus,
    resetPlays,
    canPlay
  }
}
