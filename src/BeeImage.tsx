import React from 'react'

interface BeeImageProps {
  size?: number
  className?: string
}

export const BeeImage: React.FC<BeeImageProps> = ({ size = 80, className = '' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bee body - head and thorax */}
      <circle cx="50" cy="45" r="25" fill="#FFD700" stroke="#8B4513" strokeWidth="2"/>
      
      {/* Bee abdomen with stripes */}
      <ellipse cx="50" cy="70" rx="20" ry="15" fill="#FFD700" stroke="#8B4513" strokeWidth="2"/>
      <rect x="35" y="65" width="30" height="4" fill="#8B4513"/>
      <rect x="35" y="72" width="30" height="4" fill="#8B4513"/>
      <rect x="35" y="79" width="30" height="4" fill="#8B4513"/>
      
      {/* Bee face */}
      <circle cx="42" cy="40" r="3" fill="#8B4513"/>
      <circle cx="58" cy="40" r="3" fill="#8B4513"/>
      <path d="M 45 48 Q 50 52 55 48" stroke="#8B4513" strokeWidth="2" fill="none"/>
      
      {/* Cheek blush */}
      <circle cx="38" cy="45" r="2" fill="#FFB6C1" opacity="0.6"/>
      <circle cx="62" cy="45" r="2" fill="#FFB6C1" opacity="0.6"/>
      
      {/* Antennae */}
      <line x1="42" y1="25" x2="38" y2="15" stroke="#8B4513" strokeWidth="2"/>
      <line x1="58" y1="25" x2="62" y2="15" stroke="#8B4513" strokeWidth="2"/>
      <circle cx="38" cy="15" r="2" fill="#8B4513"/>
      <circle cx="62" cy="15" r="2" fill="#8B4513"/>
      
      {/* Wings */}
      <ellipse cx="30" cy="35" rx="8" ry="12" fill="#FFF8DC" stroke="#8B4513" strokeWidth="1" opacity="0.8"/>
      <ellipse cx="70" cy="35" rx="8" ry="12" fill="#FFF8DC" stroke="#8B4513" strokeWidth="1" opacity="0.8"/>
      <ellipse cx="25" cy="45" rx="6" ry="8" fill="#FFF8DC" stroke="#8B4513" strokeWidth="1" opacity="0.6"/>
      <ellipse cx="75" cy="45" rx="6" ry="8" fill="#FFF8DC" stroke="#8B4513" strokeWidth="1" opacity="0.6"/>
      
      {/* Wing details */}
      <path d="M 25 30 Q 30 35 25 40" stroke="#8B4513" strokeWidth="0.5" fill="none" opacity="0.5"/>
      <path d="M 75 30 Q 70 35 75 40" stroke="#8B4513" strokeWidth="0.5" fill="none" opacity="0.5"/>
    </svg>
  )
}

export default BeeImage

