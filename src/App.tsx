import { useEffect, useMemo, useState } from 'react'
import './App.css'
import './NeumorphicTheme.css' // Import the neumorphic theme
import cn from 'classnames'
import BeeImage from './BeeImage'

type WordItem = { word: string }

const MAX_REPLAYS = 5
const ROUNDS_TOTAL = 5
const WORDS_PER_ROUND = 5
const POINTS_PER_WORD = 2

function useTTSPlayer(word?: string) {
  const [plays, setPlays] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!word) {
      setError(null)
      setPlays(0)
      return
    }
    
    console.log('TTS ready for word:', word)
    setError(null)
    setPlays(0)
    setLoading(false)
  }, [word])

  const play = () => {
    if (!word || plays >= MAX_REPLAYS) {
      console.log('Cannot play:', { word, plays, maxReplays: MAX_REPLAYS })
      return
    }
    
    console.log('🔊 Attempting to speak word:', word)
    setLoading(true)
    
    // Use simple Web Speech API with better error handling
    if (!('speechSynthesis' in window)) {
      console.error('TTS not supported')
      setError('TTS not supported in this browser')
      setLoading(false)
      return
    }
    
    try {
      // Cancel any ongoing speech
      speechSynthesis.cancel()
      
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(word)
      
      // Configure speech
      utterance.rate = 0.7
      utterance.pitch = 1.0
      utterance.volume = 1.0
      utterance.lang = 'en-US'
      
      // Get voices and select best English voice
      const voices = speechSynthesis.getVoices()
      const englishVoice = voices.find(v => v.lang.startsWith('en-US')) || 
                          voices.find(v => v.lang.startsWith('en')) || 
                          voices[0]
      
      if (englishVoice) {
        utterance.voice = englishVoice
        console.log('Using voice:', englishVoice.name)
      }
      
      // Event handlers
      utterance.onstart = () => {
        console.log('✅ TTS started for:', word)
        setLoading(true)
      }
      
      utterance.onend = () => {
        console.log('✅ TTS ended for:', word)
        setPlays(p => p + 1)
        setLoading(false)
      }
      
      utterance.onerror = (e) => {
        console.error('❌ TTS error:', e)
        setLoading(false)
        setError(`Speech error: ${e.error}`)
      }
      
      // Speak the word
      speechSynthesis.speak(utterance)
      
      // Fallback timeout
      setTimeout(() => {
        if (loading) {
          console.log('⚠️ TTS timeout, stopping loading state')
          setLoading(false)
          setPlays(p => p + 1)
        }
      }, 4000)
      
    } catch (err) {
      console.error('❌ TTS error:', err)
      setLoading(false)
      setError('Speech failed')
    }
  }

  return { play, plays, loading, error }
}

function HexLetters({ value, length, complete }: { value: string; length: number; complete: boolean }) {
  const cells = Array.from({ length })
  
  // Calculate responsive gap and sizing based on word length
  const gap = length > 12 ? 4 : length > 8 ? 6 : 8
  const hexSize = length > 12 ? 0.8 : length > 8 ? 0.9 : 1
  
  return (
    <div style={{ 
      display: 'flex', 
      gap, 
      justifyContent: 'center', 
      flexWrap: 'wrap',
      maxWidth: '100%',
      padding: '8px 0' 
    }}>
      {cells.map((_, i) => (
        <div 
          key={i} 
          className={cn('hex glass', { glow: complete && i === length - 1 })} 
          style={{ 
            transform: `scale(${hexSize})`,
            minWidth: 0
          }}
        >
          <span style={{ fontWeight: 800, letterSpacing: 1, fontSize: '14px' }}>
            {value[i]?.toUpperCase() ?? ''}
          </span>
        </div>
      ))}
    </div>
  )
}

function StartScreen({ onStart }: { onStart: () => void }) {
  const [ttsReady, setTtsReady] = useState(false)
  const [testing, setTesting] = useState(false)
  
  const testTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert('TTS not supported in this browser. Try Chrome or Edge.')
      return
    }
    
    setTesting(true)
    console.log('🧪 Testing TTS...')
    
    try {
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance('Test')
      utterance.rate = 0.8
      utterance.volume = 1.0
      utterance.lang = 'en-US'
      
      utterance.onstart = () => {
        console.log('✅ TTS test successful')
        setTtsReady(true)
        setTesting(false)
      }
      
      utterance.onend = () => {
        console.log('✅ TTS test completed')
        setTtsReady(true)
        setTesting(false)
      }
      
      utterance.onerror = (e) => {
        console.error('❌ TTS test failed:', e)
        setTesting(false)
        alert('TTS test failed. Please check your browser settings.')
      }
      
      speechSynthesis.speak(utterance)
      
      // Timeout fallback
      setTimeout(() => {
        if (testing) {
          console.log('⚠️ TTS test timeout')
          setTesting(false)
          alert('TTS test timed out. Please check your browser settings.')
        }
      }, 3000)
      
    } catch (err) {
      console.error('❌ TTS test error:', err)
      setTesting(false)
      alert('TTS test failed: ' + err)
    }
  }
  
  const handleStart = () => {
    onStart()
  }
  
  return (
    <div className="start-screen">
      <div className="start-card">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <BeeImage size={100} />
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>B the Bee</h1>
          <p style={{ marginTop: 8, fontSize: '1.1rem' }}>Audio-first honeycomb spelling practice</p>
        </div>
      </div>
      
      <div className="start-buttons">
        <button 
          className="btn" 
          onClick={testTTS}
          disabled={testing}
        >
          {testing ? '🔄 Testing...' : ttsReady ? '✅ Audio Works' : '🔊 Test Audio'}
        </button>
        
        <button 
          className="btn primary" 
          onClick={handleStart}
        >
          Begin Game
        </button>
        
        {!ttsReady && (
          <p style={{ fontSize: '14px', opacity: 0.7, margin: 0, textAlign: 'center' }}>
            Click "Test Audio" to verify speech works
          </p>
        )}
      </div>
    </div>
  )
}

function EndScreen({ score, onReplay }: { score: number; onReplay: () => void }) {
  const maxScore = ROUNDS_TOTAL * WORDS_PER_ROUND * POINTS_PER_WORD
  const percentage = Math.round((score / maxScore) * 100)
  
  let message = "Great effort!"
  if (percentage >= 90) message = "Outstanding! Perfect spelling!"
  else if (percentage >= 75) message = "Excellent work!"
  else if (percentage >= 50) message = "Good job! Keep practicing!"
  
  return (
    <div className="end-screen">
      <div className="end-card">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <BeeImage size={80} />
          <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 700 }}>🎉 Game Complete!</h2>
          <p style={{ marginTop: 8, fontSize: '1.1rem' }}>{message}</p>
        </div>
        
        <div style={{ 
          fontSize: '3rem', 
          fontWeight: 800, 
          color: 'var(--honey-accent)',
          margin: '20px 0',
          textShadow: '2px 2px 4px var(--shadow-dark)'
        }}>
          {score} / {maxScore}
        </div>
        
        <div style={{ 
          fontSize: '1.2rem', 
          fontWeight: 600,
          marginBottom: '20px'
        }}>
          {percentage}% Accuracy
        </div>
      </div>
      
      <button className="btn primary" onClick={onReplay}>
        Play Again
      </button>
    </div>
  )
}

function useWords() {
  const [allWords, setAllWords] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/words.txt')
      .then(res => res.text())
      .then(text => {
        const words = text.split('\n').map(w => w.trim()).filter(w => w.length > 0)
        console.log('Loaded words:', words.length)
        setAllWords(words)
      })
      .catch(err => {
        console.error('Failed to load words:', err)
        // Fallback words
        setAllWords(['accommodate', 'achievement', 'apparatus', 'calendar', 'boundary'])
      })
      .finally(() => setLoading(false))
  }, [])

  return { allWords, loading }
}

function App() {
  const [started, setStarted] = useState(false)
  const [round, setRound] = useState(1)
  const [score, setScore] = useState(0)
  const [input, setInput] = useState('')
  const [index, setIndex] = useState(0)
  const [correct, setCorrect] = useState<boolean | null>(null)

  const { allWords, loading: wordsLoading } = useWords()
  
  const gameWords: WordItem[] = useMemo(() => {
    if (allWords.length === 0) return []
    const shuffled = [...allWords].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, ROUNDS_TOTAL * WORDS_PER_ROUND).map(word => ({ word }))
  }, [allWords])

  const word: WordItem | undefined = gameWords[index]
  const { play, plays, loading } = useTTSPlayer(word?.word)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!word) return
    const isCorrect = input.trim().toLowerCase() === word.word.toLowerCase()
    setCorrect(isCorrect)
    
    if (isCorrect) {
      setScore((s) => s + POINTS_PER_WORD)
    }
    
    // Always move to next word after submit (correct or incorrect)
    setTimeout(() => {
      setInput('')
      setIndex((i) => i + 1)
      setCorrect(null)
    }, 1500) // Show result for 1.5 seconds
  }

  useEffect(() => {
    const currentRound = Math.floor(index / WORDS_PER_ROUND) + 1;
    if (currentRound !== round && currentRound <= ROUNDS_TOTAL) {
      setRound(currentRound);
    }
  }, [index, round]);

  const totalWords = ROUNDS_TOTAL * WORDS_PER_ROUND
  const gameComplete = index >= totalWords

  if (!started) return <div className="app-container"><StartScreen onStart={() => setStarted(true)} /></div>
  if (gameComplete) return <div className="app-container"><EndScreen score={score} onReplay={() => { setStarted(false); setRound(1); setScore(0); setInput(''); setIndex(0) }} /></div>
  if (wordsLoading) return <div className="app-container"><div className="game-card">Loading words...</div></div>

  const length = word?.word.length ?? 0

  return (
    <div className="app-container">
      <div className="game-card">
        <header className="app-header">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <BeeImage size={60} />
            <h1>B the Bee</h1>
            <p>Listen carefully and spell the word</p>
          </div>
        </header>

        <div className="stats-bar">
          <div className="stat-item">Round: <strong>{round} / {ROUNDS_TOTAL}</strong></div>
          <div className="stat-item">Score: <strong>{score}</strong></div>
        </div>

        <div className="hex-container">
          <HexLetters value={input} length={length} complete={Boolean(correct)} />
        </div>
        
        <div className="play-area">
          <button 
            className="main-play-button"
            onClick={play} 
            disabled={plays >= MAX_REPLAYS || loading}
          >
            {loading ? '...' : '🔊'}
          </button>
          <div className="plays-counter">
            Plays remaining: {MAX_REPLAYS - plays}
          </div>
        </div>

         <form onSubmit={onSubmit} className="input-form">
           <input
             type="text"
             className="spell-input"
             placeholder="Type your spelling here..."
             value={input}
             maxLength={length > 0 ? length : undefined}
             onChange={(e) => setInput(e.target.value)}
             disabled={correct !== null}
           />
           <button className="submit-button" type="submit" disabled={correct !== null || !input.trim()}>
             Submit
           </button>
         </form>
         
         {correct !== null && (
           <div className={cn('result-display', {
             'result-correct': correct,
             'result-incorrect': !correct
           })}>
             {correct ? '✅ Correct!' : `❌ Incorrect. The word was: "${word?.word}"`}
           </div>
         )}
      </div>
    </div>
  )
}

export default App
