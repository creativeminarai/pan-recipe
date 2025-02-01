"use client"

import { useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Inter } from "next/font/google"
import { getBreads, getWheats, getBlendHistories } from "../utils/api"
import type { Bread, Wheat, BlendHistory } from "../types"

const inter = Inter({ subsets: ["latin"] })

export function FormulaHistoryList() {
  const [breads, setBreads] = useState<Bread[]>([])
  const [wheats, setWheats] = useState<Wheat[]>([])
  const [blendHistories, setBlendHistories] = useState<BlendHistory[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const [breadsData, wheatsData, blendHistoriesData] = await Promise.all([
        getBreads(),
        getWheats(),
        getBlendHistories(),
      ])

      // 2週間前の日付を計算
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
      twoWeeksAgo.setHours(0, 0, 0, 0)

      // 2週間分のデータをフィルタリング
      const filteredHistories = blendHistoriesData.filter(history => {
        const historyDate = new Date(history.date)
        return historyDate >= twoWeeksAgo
      })

      setBreads(breadsData)
      setWheats(wheatsData)
      setBlendHistories(filteredHistories)
    }
    fetchData()
  }, [])

  const groupedHistories = blendHistories.reduce(
    (acc, history) => {
      const date = new Date(history.date)
      const dateStr = date.toLocaleDateString("ja-JP")
      const day = date.toLocaleDateString('ja-JP', { weekday: 'short' })
      const dateWithDay = `${dateStr} (${day})`
      if (!acc[dateWithDay]) acc[dateWithDay] = {}
      const breadIdStr = String(history.breadId)
      if (!acc[dateWithDay][breadIdStr]) acc[dateWithDay][breadIdStr] = []
      acc[dateWithDay][breadIdStr].push(history)
      return acc
    },
    {} as Record<string, Record<string, BlendHistory[]>>,
  )

  return (
    <div>
      {Object.entries(groupedHistories).map(([date, dateHistories], index) => (
        <div key={date} className={`mb-6 ${index !== 0 ? "border-t border-gray-300 pt-4" : ""}`}>
          <h2 className="text-xl font-semibold mb-2">
            <span className="inline-block min-w-[8em]">{date}</span>
          </h2>
          <Accordion type="multiple" className="w-full space-y-2">
            {breads.map((bread) => {
              const histories = dateHistories[bread.id]
              if (!histories || histories.length === 0) return null
              return (
                <AccordionItem
                  value={`${date}-${bread.id}`}
                  key={`${date}-${bread.id}`}
                  className="border rounded-lg bg-white shadow-sm overflow-hidden relative"
                >
                  <AccordionTrigger className="px-6 py-2 text-base font-medium text-left hover:bg-gray-50 rounded-t-lg">
                    {bread.name}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-2 bg-gray-50 rounded-b-lg space-y-4">
                    {histories
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((history, historyIndex) => (
                        <div key={history.history_id} className={historyIndex > 0 ? "pt-4 border-t border-gray-200" : ""}>
                          <div className="mb-2 text-xs text-gray-500 font-medium">小麦粉の配合</div>
                          {history.wheatBlends
                            .sort((a, b) => b.amount - a.amount)
                            .map((blend, blendIndex) => {
                              const wheat = wheats.find((w) => w.id === blend.wheatId)
                              if (!wheat) return null
                              const totalAmount = history.wheatBlends.reduce((sum, b) => sum + b.amount, 0)
                              const percentage = Math.floor((blend.amount / totalAmount) * 100)
                              return (
                                <div key={`${history.history_id}-${blendIndex}`} className="ml-2 text-sm flex items-center mb-1">
                                  <span className="inline-block w-24 font-medium">{wheat.name}</span>
                                  <span className={`inline-block w-20 text-right ${inter.className}`}>
                                    {blend.amount.toLocaleString()}g
                                  </span>
                                  <span className={`inline-block w-16 text-right text-gray-500 text-xs ${inter.className}`}>
                                    ({percentage}%)
                                  </span>
                                </div>
                              )
                            })
                            .filter(Boolean)}
                        </div>
                      ))
                    }
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>
      ))}
    </div>
  )
}