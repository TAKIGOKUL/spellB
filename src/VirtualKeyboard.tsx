import React from 'react'
import cn from 'classnames'

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void
  onBackspace: () => void
  onEnter: () => void
  disabled?: boolean
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
]

export default function VirtualKeyboard({ onKeyPress, onBackspace, onEnter, disabled = false }: VirtualKeyboardProps) {
  const handleKeyClick = (key: string) => {
    if (disabled) return
    onKeyPress(key)
  }

  const handleBackspaceClick = () => {
    if (disabled) return
    onBackspace()
  }

  const handleEnterClick = () => {
    if (disabled) return
    onEnter()
  }

  return (
    <div className="virtual-keyboard">
      <div className="keyboard-container">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map((key) => (
              <button
                key={key}
                className={cn('keyboard-key', { disabled })}
                onClick={() => handleKeyClick(key)}
                disabled={disabled}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
        
        <div className="keyboard-row keyboard-controls">
          <button
            className={cn('keyboard-key keyboard-key-wide', { disabled })}
            onClick={handleBackspaceClick}
            disabled={disabled}
          >
            ⌫
          </button>
          <button
            className={cn('keyboard-key keyboard-key-wide keyboard-key-enter', { disabled })}
            onClick={handleEnterClick}
            disabled={disabled}
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  )
}
