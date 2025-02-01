"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormContainer, FormSection } from "@/components/ui/form-layout"
import { getBreads, getWheats, getBlendHistories, addBlendHistory, getMainBlends, deleteBlendHistory, getMainBlend } from "../../utils/api"
import type { Bread, Wheat, BlendHistory, MainBlend } from "../../types"
import { Loader2, WheatIcon, Scale, Plus, Save, Calendar, History, X, ChevronLeft, ChevronRight } from "lucide-react"
import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDateWithDay } from "../../utils/date"
import { useRouter, useSearchParams } from "next/navigation"
import { AmountInput } from "@/components/ui/amount-input"

// 小麦の入力フィールドコンポーネント
function WheatAmountInput({ wheat, amount, onChange }: {
  wheat: Wheat
  amount: number | string
  onChange: (amount: number) => void
}) {
  const [localAmount, setLocalAmount] = useState(amount)

  // 親コンポーネントのamountが変更された場合にlocalAmountを更新
  useEffect(() => {
    setLocalAmount(amount)
  }, [amount])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value
    setLocalAmount(newAmount)
    onChange(parseFloat(newAmount) || 0)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">{wheat.name}</div>
      <div className="w-32">
        <Input
          type="number"
          value={localAmount}
          onChange={handleChange}
          placeholder="g"
        />
      </div>
    </div>
  )
}

function RegisterForm() {
  const [breads, setBreads] = useState<Bread[]>([])
  const [wheats, setWheats] = useState<Wheat[]>([])
  const [histories, setHistories] = useState<BlendHistory[]>([])
  const [selectedBread, setSelectedBread] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedDate, setSelectedDate] = useState<string>(
    searchParams.get('date') || new Date().toISOString().split('T')[0]
  )
  const [blends, setBlends] = useState<{ wheatId: string; amount: number }[]>([])
  const [notes, setNotes] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedBreads, setSelectedBreads] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const [breadsData, wheatsData, historiesData] = await Promise.all([
        getBreads(),
        getWheats(),
        getBlendHistories()
      ])
      setBreads(breadsData)
      setWheats(wheatsData)
      setHistories(historiesData)
    }
    fetchData()
  }, [])

  // パンが選択されたとき、main_formulasから初期情報を取得
  useEffect(() => {
    const fetchMainBlend = async () => {
      if (selectedBread) {
        const mainBlend = await getMainBlend(selectedBread)
        if (mainBlend) {
          setBlends(mainBlend.wheatBlends)
        } else {
          setBlends([{ wheatId: "", amount: 0 }])
        }
      }
    }
    fetchMainBlend()
  }, [selectedBread])

  // 日付が入力されたとき、formula_historyから登録済みの配合を表示
  useEffect(() => {
    if (selectedBread && selectedDate) {
      const history = histories.find(
        (h) => h.breadId === selectedBread && h.date.toISOString().split('T')[0] === selectedDate
      )
      if (history) {
        setBlends(history.wheatBlends)
        setNotes(history.notes)
      }
    }
  }, [selectedDate, selectedBread, histories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBread) return

    setIsSubmitting(true)
    try {
      const newBlendHistory = {
        date: new Date(selectedDate),
        breadId: selectedBread,
        wheatBlends: blends
          .filter((blend) => blend.wheatId !== "" && blend.wheatId !== "0" && blend.amount > 0)
          .map(blend => ({
            wheatId: blend.wheatId.toString(),
            amount: blend.amount
          })),
        history_id: "", // これはサーバー側で生成されます
        notes: notes,
      }

      await addBlendHistory(newBlendHistory)
      window.location.reload()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBulkRegister = async () => {
    if (selectedBreads.length === 0) {
      alert("パンを選択してください")
      return
    }

    setIsSubmitting(true)
    try {
      const mainBlends = await Promise.all(
        selectedBreads.map(breadId => getMainBlend(breadId))
      )

      const validMainBlends = mainBlends.filter((blend): blend is MainBlend => blend !== null)
      
      await Promise.all(
        validMainBlends.map(mainBlend => {
          const newBlendHistory = {
            date: new Date(selectedDate),
            breadId: mainBlend.breadId,
            wheatBlends: mainBlend.wheatBlends,
            history_id: "",
            notes: "",
          }
          return addBlendHistory(newBlendHistory)
        })
      )

      window.location.reload()
    } catch (error) {
      console.error("Error registering blends:", error)
      alert("登録中にエラーが発生しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormContainer>
      <h1 className="text-2xl font-semibold mb-6">配合登録</h1>
      <FormSection>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Calendar className="h-4 w-4" />
          <span>ミキシングの日</span>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => {
              const date = new Date(selectedDate)
              date.setDate(date.getDate() - 1)
              const newDate = date.toISOString().split('T')[0]
              setSelectedDate(newDate)
              router.push(`/register?date=${newDate}`)
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="relative w-full bg-white rounded-md border border-input px-3 py-2 text-sm ring-offset-background">
              <div className="flex justify-between items-center">
                <input
                  type="date"
                  className="absolute opacity-0 w-full h-full top-0 left-0 cursor-pointer"
                  value={selectedDate}
                  onChange={(e) => {
                    const newDate = e.target.value
                    setSelectedDate(newDate)
                    router.push(`/register?date=${newDate}`)
                  }}
                />
                <div className="flex-1 text-center">
                  {new Date(selectedDate).toLocaleDateString('ja-JP')} ({new Date(selectedDate).toLocaleDateString('ja-JP', { weekday: 'short' })})
                </div>
                <div className="text-gray-400">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => {
              const date = new Date(selectedDate)
              date.setDate(date.getDate() + 1)
              const newDate = date.toISOString().split('T')[0]
              setSelectedDate(newDate)
              router.push(`/register?date=${newDate}`)
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </FormSection>

      <FormSection>
        <div className="flex items-center justify-between gap-2 text-sm text-gray-600 mb-2">
          <span>通常通りの配合</span>
          <Button
            type="button"
            variant="outline"
            className="h-8"
            onClick={handleBulkRegister}
            disabled={isSubmitting || selectedBreads.length === 0}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            一括登録
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {breads.map((bread) => (
            <div
              key={bread.id}
              className="flex items-center space-x-2 bg-white rounded-md border p-2"
            >
              <Checkbox
                id={`bread-${bread.id}`}
                checked={selectedBreads.includes(bread.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedBreads(prev => [...prev, bread.id])
                  } else {
                    setSelectedBreads(prev => prev.filter(id => id !== bread.id))
                  }
                }}
              />
              <label
                htmlFor={`bread-${bread.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {bread.name}
              </label>
            </div>
          ))}
        </div>
      </FormSection>
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <FormSection>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Scale className="h-4 w-4" />
              <span>配合を変えて登録</span>
            </div>
            <Select onValueChange={(value) => {
              setSelectedBread(value)
              setBlends([{ wheatId: "0", amount: 0 }])
            }}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="パンを選択してください" />
              </SelectTrigger>
              <SelectContent>
                {breads.map((bread) => (
                  <SelectItem key={bread.id} value={bread.id.toString()}>
                    {bread.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormSection>

          {selectedBread && (
            <FormSection>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <WheatIcon className="h-4 w-4" />
                <span>小麦粉の配合</span>
              </div>
              {blends.map((blend, index) => (
              <div key={`blend-${index}`} className="grid grid-cols-[minmax(12ch,1fr),120px,auto] gap-2 mb-2">
                <Select
                  value={blend.wheatId.toString()}
                  onValueChange={(value) => {
                    const newBlends = [...blends]
                    newBlends[index].wheatId = value
                    setBlends(newBlends)
                  }}
                >
                  <SelectTrigger className="bg-white min-w-[12ch]">
                    <SelectValue placeholder="小麦粉を選択" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem key="default" value="0">選択してください</SelectItem>
                    {wheats.map((wheat) => (
                      <SelectItem key={`wheat-${wheat.id}-${index}`} value={wheat.id.toString()}>
                        {wheat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="relative w-[120px]">
                  <AmountInput
                    value={blend.amount}
                    onChange={(value) => {
                      const newBlends = [...blends].map((b, i) => 
                        i === index ? { ...b, amount: value } : b
                      )
                      setBlends(newBlends)
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-gray-500 hover:text-red-500"
                  onClick={() => {
                    const newBlends = blends.filter((_, i) => i !== index)
                    if (newBlends.length === 0) {
                      newBlends.push({ wheatId: "", amount: 0 })
                    }
                    setBlends(newBlends)
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {blends.length < 5 && (
              <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => setBlends([...blends, { wheatId: "0", amount: 0 }])}
              >
                <Plus className="mr-2 h-4 w-4" />
                小麦粉を追加
              </Button>
            )}
          </FormSection>
          )}

          <div className="flex justify-center">
            <Button type="submit" variant="default" className="w-[30%] bg-gray-800 hover:bg-gray-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" /> : <Save className="mr-2 h-4 w-4 text-white" />}
              <span className="text-white">登録する</span>
            </Button>
          </div>
        </div>
      </form>

      {selectedDate && (
        <div className="mt-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <History className="h-4 w-4" />
            <span>{selectedDate}の配合履歴</span>
          </div>
          <div className="space-y-4">
            {histories
              .filter((h) => h.date.toISOString().split("T")[0] === selectedDate)
              .sort((a, b) => {
                const breadA = breads.find((bread) => bread.id === a.breadId)?.name || ""
                const breadB = breads.find((bread) => bread.id === b.breadId)?.name || ""
                return breadA.localeCompare(breadB)
              })
              .map((history) => {
                const bread = breads.find((b) => b.id === history.breadId)
                if (!bread) return null

                return (
                  <Card key={history.history_id} className="bg-white">
                    <CardContent className="pt-6 relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 text-gray-500 hover:text-red-500"
                        onClick={async () => {
                          const success = await deleteBlendHistory(history.history_id)
                          if (success) {
                            setHistories((prev) => 
                              prev.filter((h) => h.history_id !== history.history_id)
                            )
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <div className="font-medium mb-2">{bread.name}</div>
                      <div className="space-y-1">
                        {history.wheatBlends
                          .sort((a, b) => b.amount - a.amount)
                          .map((blend, blendIndex) => {
                            const wheat = wheats.find((w) => w.id === blend.wheatId)
                            if (!wheat) return null

                            const totalAmount = history.wheatBlends.reduce(
                              (sum, b) => sum + b.amount,
                              0
                            )
                            const percentage = Math.floor((blend.amount / totalAmount) * 100)

                            return (
                              <div
                                key={`${history.history_id}-${blend.wheatId}-${blendIndex}`}
                                className="text-sm flex items-center text-gray-600"
                              >
                                <span className="inline-block w-24">{wheat.name}</span>
                                <span className="inline-block w-20 text-right">
                                  {blend.amount.toLocaleString()}g
                                </span>
                                <span className="inline-block w-16 text-right text-gray-400 text-xs">
                                  ({percentage}%)
                                </span>
                              </div>
                            )
                          })
                          .filter(Boolean)}
                      </div>
                      {history.notes && (
                        <div className="mt-2 text-sm text-gray-500">{history.notes}</div>
                      )}
                    </CardContent>
                  </Card>
                )
              })
              .filter(Boolean)}
          </div>
        </div>
      )}
    </FormContainer>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
