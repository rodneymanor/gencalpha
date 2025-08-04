'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

export interface SlidingSwitchOption {
  value: string
  icon: React.ReactElement
  label?: string
}

export interface SlidingSwitchProps {
  options: SlidingSwitchOption[]
  onChange?: (index: number, option: SlidingSwitchOption) => void
  defaultValue?: number
  className?: string
}

export const SlidingSwitch: React.FC<SlidingSwitchProps> = ({
  options,
  onChange,
  defaultValue = 0,
  className = ''
}) => {
  const [activeIndex, setActiveIndex] = useState(defaultValue)

  const handleOptionClick = (index: number) => {
    setActiveIndex(index)
    if (onChange && options[index]) {
      onChange(index, options[index])
    }
  }

  return (
    <div className={`
      border border-border bg-muted h-12 p-1 flex items-center rounded-full relative
      ${className}
    `}>
      {options.map((option, index) => (
        <button
          key={`${option.value}-${index}`}
          onClick={() => handleOptionClick(index)}
          className={`
            relative flex items-center justify-center h-full w-12 z-10
            text-sm transition-colors duration-200 rounded-full
            ${
              activeIndex === index
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground/80'
            }
          `}
        >
          {activeIndex === index && (
            <motion.div
              layoutId="sliding-background"
              className="absolute inset-0 bg-background shadow-sm rounded-full"
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 35
              }}
            />
          )}
          <div className="relative z-10 flex items-center">
            {React.cloneElement(option.icon, { size: 20 })}
            {option.label && <span className="ml-2">{option.label}</span>}
          </div>
        </button>
      ))}
    </div>
  )
}

export default SlidingSwitch