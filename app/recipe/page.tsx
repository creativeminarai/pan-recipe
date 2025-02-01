"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormContainer, FormSection } from "@/components/ui/form-layout"
import { getBreads, getWheats, getMainBlends, updateMainBlend, addBread, deleteWheat } from "../../utils/api"
import type { Bread, Wheat, MainBlend } from "../../types"
import { Loader2, WheatIcon, Scale, Plus, Save, X } from "lucide-react"
import type React from "react"
import { Card, CardContent } from "@/components/ui/card"

export default function RecipePage() {
  const [breads, setBreads] = useState<Bread[]>([])
  const [wheats, setWheats] = useState<Wheat[]>([])
  const [mainBlends, setMainBlends] = useState<MainBlend[]>([])
  const [selectedBread, setSelectedBread] = useState<string | null>(null)
  const [blends, setBlends] = useState<{ wheatId: string; amount: number }[]>([{ wheatId: "", amount: 0 }])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newBreadName, setNewBreadName] = useState("")
  const [isAddingBread, setIsAddingBread] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const [breadsData, wheatsData, mainBlendsData] = await Promise.all([
        getBreads(),
        getWheats(),
        getMainBlends(),
      ])
      setBreads(breadsData)
      setWheats(wheatsData)
      setMainBlends(mainBlendsData)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedBread) {
      const mainBlend = mainBlends.find((blend) => blend.breadId === selectedBread)
      if (mainBlend) {
        setBlends(mainBlend.wheatBlends)
      } else {
        setBlends([{ wheatId: "", amount: 0 }])
      }
    }
  }, [selectedBread, mainBlends])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBread) return

    setIsSubmitting(true)
    try {
      const validBlends = blends.filter((blend) => blend.wheatId !== "" && blend.amount > 0)
      const result = await updateMainBlend(selectedBread, validBlends)
      
      if (result) {
        // 更新後のデータを更新
        setMainBlends((prev) => {
          const newMainBlends = prev.filter((blend) => blend.breadId !== selectedBread)
          if (validBlends.length > 0) {
            newMainBlends.push({
              breadId: selectedBread,
              wheatBlends: validBlends,
            })
          }
          return newMainBlends
        })
        alert("レシピを保存しました")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormContainer>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">レシピ管理</h1>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsAddingBread(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          新規パン登録
        </Button>
      </div>

      {isAddingBread && (
        <form
          className="mb-6 p-4 border rounded-lg bg-white"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!newBreadName.trim()) return

            setIsSubmitting(true)
            try {
              const result = await addBread(newBreadName.trim())
              if (result) {
                setBreads((prev) => [...prev, result])
                setNewBreadName("")
                setIsAddingBread(false)
                alert("パンを登録しました")
              }
            } finally {
              setIsSubmitting(false)
            }
          }}
        >
          <FormSection>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span>パンの名前</span>
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                className="bg-white"
                value={newBreadName}
                onChange={(e) => setNewBreadName(e.target.value)}
                placeholder="パンの名前を入力してください"
              />
              <Button type="submit" variant="default" className="bg-gray-800 hover:bg-gray-700" disabled={isSubmitting || !newBreadName.trim()}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                登録
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setNewBreadName("")
                  setIsAddingBread(false)
                }}
              >
                <X className="h-4 w-4" />
                キャンセル
              </Button>
            </div>
          </FormSection>
        </form>
      )}
      <form onSubmit={handleSubmit}>
        <FormSection>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Scale className="h-4 w-4" />
            <span>パンの種類</span>
          </div>
          <Select onValueChange={(value) => setSelectedBread(value)}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="パンを選択してください" />
            </SelectTrigger>
            <SelectContent>
              {breads.map((bread) => (
                <SelectItem key={bread.id} value={bread.id}>
                  {bread.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormSection>

        <FormSection>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <WheatIcon className="h-4 w-4" />
            <span>小麦粉の配合</span>
          </div>
          {blends.map((blend, index) => (
            <div key={index} className="grid grid-cols-[1fr,auto,auto] gap-2 mb-2">
              <Select
                value={blend.wheatId}
                onValueChange={(value) => {
                  const newBlends = [...blends]
                  newBlends[index].wheatId = value
                  setBlends(newBlends)
                }}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="小麦粉を選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {wheats.map((wheat) => (
                    <SelectItem key={wheat.id} value={wheat.id}>
                      {wheat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="量"
                  className="bg-white pr-8"
                  value={blend.amount || ""}
                  onChange={(e) => {
                    const newBlends = [...blends]
                    newBlends[index].amount = Number(e.target.value)
                    setBlends(newBlends)
                  }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">g</span>
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
          ))} {blends.length < 5 && (
            <Button
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={() => setBlends([...blends, { wheatId: "", amount: 0 }])}
            >
              <Plus className="mr-2 h-4 w-4" />
              小麦粉を追加
            </Button>
          )}
        </FormSection>

        <div className="flex justify-center mt-6">
          <Button type="submit" variant="default" className="w-[30%] bg-gray-800 hover:bg-gray-700 text-white" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" /> : <Save className="mr-2 h-4 w-4 text-white" />}
            <span className="text-white">保存する</span>
          </Button>
        </div>
      </form>

      <div className="mt-8">
        <h2 className="text-lg font-medium mb-4">登録済みのレシピ</h2>
        <div className="space-y-4">
          {mainBlends
            .sort((a, b) => {
              const breadA = breads.find((bread) => bread.id === a.breadId)?.name || ""
              const breadB = breads.find((bread) => bread.id === b.breadId)?.name || ""
              return breadA.localeCompare(breadB)
            })
            .map((mainBlend) => {
              const bread = breads.find((b) => b.id === mainBlend.breadId)
              if (!bread) return null

              return (
                <Card key={mainBlend.breadId} className="bg-white">
                  <CardContent className="pt-6">
                    <div className="font-medium mb-2">{bread.name}</div>
                    <div className="space-y-1">
                      {mainBlend.wheatBlends
                        .sort((a, b) => b.amount - a.amount)
                        .map((blend) => {
                          const wheat = wheats.find((w) => w.id === blend.wheatId)
                          if (!wheat) return null

                          const totalAmount = mainBlend.wheatBlends.reduce(
                            (sum, b) => sum + b.amount,
                            0
                          )
                          const percentage = Math.floor((blend.amount / totalAmount) * 100)

                          return (
                            <div
                              key={blend.wheatId}
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
                  </CardContent>
                </Card>
              )
            })
            .filter(Boolean)}
        </div>
      </div>
    </FormContainer>
  )
}
