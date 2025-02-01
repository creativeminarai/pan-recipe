"use client"

import { useState, useEffect } from "react"
import { Input } from "./input"

interface AmountInputProps {
  value: number
  onChange: (value: number) => void
}

export function AmountInput({ value, onChange }: AmountInputProps) {
  const [localValue, setLocalValue] = useState(value?.toString() || "")

  useEffect(() => {
    if (value?.toString() !== localValue) {
      setLocalValue(value?.toString() || "")
    }
  }, [value])

  return (
    <div className="relative w-full">
      <Input
        type="text"
        inputMode="numeric"
        placeholder="量"
        className="bg-white pr-8"
        value={localValue}
        onChange={(e) => {
          const newValue = e.target.value
          setLocalValue(newValue)
          const numValue = Number(newValue)
          if (!isNaN(numValue)) {
            onChange(numValue)
          }
        }}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">g</span>
    </div>
  )
}
