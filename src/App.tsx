import { useEffect, useMemo, useState, useRef } from 'react'
import './App.css'
import './NeumorphicTheme.css' // Import the neumorphic theme
import cn from 'classnames'
import BeeImage from './BeeImage'

type WordItem = { word: string }

const MAX_REPLAYS = 5
const ROUNDS_TOTAL = 5
const WORDS_PER_ROUND = 5
const POINTS_PER_WORD = 2


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

function AudioManager() {
  // Word-Audio pairs data - Correctly mapped
  // This data is available for programmatic access but not displayed in UI
  const _wordAudioPairs = [
    {"word": "achievement", "audioFile": "achievement.mp3.wav"},
    {"word": "acquire", "audioFile": "acquire.mp3.wav"},
    {"word": "amateur", "audioFile": "amateur.mp3.wav"},
    {"word": "ancient", "audioFile": "ancient.mp3.wav"},
    {"word": "apparatus", "audioFile": "apparatus.mp3.wav"},
    {"word": "appreciate", "audioFile": "appreciate.mp3.wav"},
    {"word": "argument", "audioFile": "argument.mp3.wav"},
    {"word": "arithmetic", "audioFile": "arithmetic.mp3.wav"},
    {"word": "arrangement", "audioFile": "arrangement.mp3.wav"},
    {"word": "assassinate", "audioFile": "assassinate .mp3.wav"},
    {"word": "athlete", "audioFile": "athlete (1).mp3.wav"},
    {"word": "authority", "audioFile": "authority.mp3.wav"},
    {"word": "auxiliary", "audioFile": "auxiliary.mp3.wav"},
    {"word": "beautiful", "audioFile": "beautiful.mp3.wav"},
    {"word": "benefit", "audioFile": "benefit.mp3.wav"},
    {"word": "biography", "audioFile": "biography.mp3.wav"},
    {"word": "boundary", "audioFile": "boundary.mp3.wav"},
    {"word": "calendar", "audioFile": "calendar.mp3.wav"},
    {"word": "campaign", "audioFile": "campaign.mp3.wav"},
    {"word": "candidate", "audioFile": "candidate.mp3.wav"},
    {"word": "category", "audioFile": "category.mp3.wav"},
    {"word": "cemetery", "audioFile": "cemetery.mp3.wav"},
    {"word": "ceremony", "audioFile": "ceremony.mp3.wav"},
    {"word": "certificate", "audioFile": "certificate.mp3.wav"},
    {"word": "characteristic", "audioFile": "characteristic.mp3.wav"},
    {"word": "chocolate", "audioFile": "chocolate.mp3.wav"},
    {"word": "circumstances", "audioFile": "circumstances.mp3.wav"},
    {"word": "colleague", "audioFile": "colleague.mp3.wav"},
    {"word": "column", "audioFile": "column.mp3.wav"},
    {"word": "commission", "audioFile": "commission.mp3.wav"},
    {"word": "committee", "audioFile": "committee.mp3.wav"},
    {"word": "comparison", "audioFile": "comparison.mp3.wav"},
    {"word": "competition", "audioFile": "competition.mp3.wav"},
    {"word": "completely", "audioFile": "completely.mp3.wav"},
    {"word": "compliment", "audioFile": "compliment.mp3.wav"},
    {"word": "concentrate", "audioFile": "concentrate.mp3.wav"},
    {"word": "conference", "audioFile": "conference.mp3.wav"},
    {"word": "definitely", "audioFile": "definitely.mp3.wav"},
    {"word": "emergency", "audioFile": "emergency.mp3.wav"},
    {"word": "exaggerate", "audioFile": "exaggerate.mp3.wav"},
    {"word": "excitement", "audioFile": "excitement.mp3.wav"},
    {"word": "extraordinary", "audioFile": "extraordinary.mp3.wav"},
    {"word": "fahrenheit", "audioFile": "fahrenheit.mp3.wav"},
    {"word": "fortunate", "audioFile": "fortunate.mp3.wav"},
    {"word": "hierarchy", "audioFile": "hierarchy.mp3"},
    {"word": "pronunciation", "audioFile": "pronunciation.mp3.wav"}
  ]

  // Suppress unused variable warning by using it in a way that doesn't affect runtime
  console.debug('AudioManager loaded with', _wordAudioPairs.length, 'word-audio pairs')

  // Return null to hide from UI - component exists for programmatic access only
  return null
}

function App() {
  const [started, setStarted] = useState(false)
  const [paused, setPaused] = useState(false)
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
  const [plays, setPlays] = useState(0)
  const [loading, setLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Find the corresponding audio file for the current word
  const getAudioFile = (word: string) => {
    const audioFiles = [
      "achievement.mp3.wav", "acquire.mp3.wav", "amateur.mp3.wav", "ancient.mp3.wav",
      "apparatus.mp3.wav", "appreciate.mp3.wav", "argument.mp3.wav", "arithmetic.mp3.wav",
      "arrangement.mp3.wav", "assassinate .mp3.wav", "athlete (1).mp3.wav", "authority.mp3.wav",
      "auxiliary.mp3.wav", "beautiful.mp3.wav", "benefit.mp3.wav", "biography.mp3.wav",
      "boundary.mp3.wav", "calendar.mp3.wav", "campaign.mp3.wav", "candidate.mp3.wav",
      "category.mp3.wav", "cemetery.mp3.wav", "ceremony.mp3.wav", "certificate.mp3.wav",
      "characteristic.mp3.wav", "chocolate.mp3.wav", "circumstances.mp3.wav", "colleague.mp3.wav",
      "column.mp3.wav", "commission.mp3.wav", "committee.mp3.wav", "comparison.mp3.wav",
      "competition.mp3.wav", "completely.mp3.wav", "compliment.mp3.wav", "concentrate.mp3.wav",
      "conference.mp3.wav", "definitely.mp3.wav", "emergency.mp3.wav", "exaggerate.mp3.wav",
      "excitement.mp3.wav", "extraordinary.mp3.wav", "fahrenheit.mp3.wav", "fortunate.mp3.wav",
      "hierarchy.mp3", "pronunciation.mp3.wav"
    ]
    
    // Find audio file that matches the word
    return audioFiles.find(file => {
      const cleanFile = file.replace(/\.mp3\.wav$/, '').replace(/\.mp3$/, '').replace(/ \(1\)$/, '').replace(/ $/, '')
      return cleanFile.toLowerCase() === word.toLowerCase()
    }) || null
  }

  const playAudio = () => {
    if (!word || plays >= MAX_REPLAYS) {
      console.log('Cannot play: max replays reached')
      return
    }
    
    const audioFile = getAudioFile(word.word)
    if (!audioFile) {
      console.error('No audio file found for word:', word.word)
      return
    }
    
    setLoading(true)
    
    try {
      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        audioRef.current = new Audio(`/audio/${audioFile}`)
      } else {
        audioRef.current.src = `/audio/${audioFile}`
      }
      
      // Configure audio
      audioRef.current.volume = 1.0
      
      // Event handlers
      audioRef.current.onplay = () => {
        console.log('✅ Audio started playing')
        setLoading(false)
      }
      
      audioRef.current.onended = () => {
        console.log('✅ Audio ended')
        setPlays(p => p + 1)
        setLoading(false)
      }
      
      audioRef.current.onerror = (e: string | Event) => {
        console.error('❌ Audio error:', e)
        setLoading(false)
        setPlays(p => p + 1) // Count as played even if error
      }
      
      // Play the audio
      audioRef.current.play().catch((err: Error) => {
        console.error('❌ Audio play failed:', err)
        setLoading(false)
      })
      
      // Fallback timeout
      setTimeout(() => {
        if (loading) {
          console.log('⚠️ Audio timeout, stopping loading state')
          setLoading(false)
          setPlays(p => p + 1)
        }
      }, 5000)
      
    } catch (err) {
      console.error('❌ Audio error:', err)
      setLoading(false)
    }
  }

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

  // Keyboard event listener for pause functionality
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!started || gameComplete) return;
      
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (paused) {
          setPaused(false);
        } else {
          setPaused(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [started, paused, gameComplete]);

  if (!started) return <div className="app-container"><StartScreen onStart={() => setStarted(true)} /></div>
  if (gameComplete) return <div className="app-container"><EndScreen score={score} onReplay={() => { setStarted(false); setPaused(false); setRound(1); setScore(0); setInput(''); setIndex(0) }} /></div>
  if (wordsLoading) return <div className="app-container"><div className="game-card">Loading words...</div></div>

  const length = word?.word.length ?? 0

  return (
    <div className="app-container">
      <div className="game-card">
        {paused && (
          <div className="pause-overlay">
            <div className="pause-content">
              <h2>⏸️ Game Paused</h2>
              <p>Press <kbd>SPACEBAR</kbd> to resume</p>
            </div>
          </div>
        )}
        
        <header className="app-header">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <BeeImage size={60} />
            <h1>B the Bee</h1>
            <p>Listen carefully and spell the word</p>
            <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: 0 }}>
              Press <kbd style={{ fontSize: '0.7rem', padding: '2px 4px', background: 'rgba(0,0,0,0.1)', borderRadius: '3px' }}>SPACEBAR</kbd> to pause
            </p>
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
            onClick={playAudio} 
            disabled={plays >= MAX_REPLAYS || loading || paused}
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
             disabled={correct !== null || paused}
           />
           <button className="submit-button" type="submit" disabled={correct !== null || !input.trim() || paused}>
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
      
      {/* AudioManager component - hidden from UI but available programmatically */}
      <AudioManager />
    </div>
  )
}

export default App
