"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FormContainer, FormSection } from "@/components/ui/form-layout"
import { getWheats, addWheat, deleteWheat } from "../../utils/api"
import type { Wheat } from "../../types"
import { Loader2, Plus, Save, Building2, MapPin, Percent, FileText, ArrowUpDown, Trash2 } from "lucide-react"
import type React from "react"

type SortConfig = {
  key: keyof Wheat
  direction: "asc" | "desc"
} | null

export default function WheatInfoPage() {
  const [wheats, setWheats] = useState<Wheat[]>([])
  const [newWheat, setNewWheat] = useState<Omit<Wheat, "id" | "deletedAt" | "display_order" | "notes">>({
    name: "",
    millingCompany: "",
    origin: "",
    proteinPercentage: 0,
    ashPercentage: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "display_order", direction: "asc" })

  useEffect(() => {
    const fetchData = async () => {
      const wheatsData = await getWheats()
      setWheats(wheatsData.sort((a, b) => a.display_order - b.display_order))
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const addedWheat = await addWheat({ ...newWheat, notes: "" })
      if (addedWheat) {
        const sortedWheats = [...wheats, addedWheat].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        setWheats(sortedWheats)
      }
      setNewWheat({
        name: "",
        millingCompany: "",
        origin: "",
        proteinPercentage: 0,
        ashPercentage: 0,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const sortData = (key: keyof Wheat) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })

    const sortedWheats = [...wheats].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      if (aValue === null || bValue === null) return 0;
      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    })
    setWheats(sortedWheats)
  }

  const getSortIcon = (key: keyof Wheat) => {
    if (sortConfig?.key === key) {
      return (
        <ArrowUpDown
          className={`h-4 w-4 inline-block ml-1 ${sortConfig.direction === "desc" ? "transform rotate-180" : ""}`}
        />
      )
    }
    return <ArrowUpDown className="h-4 w-4 inline-block ml-1 text-gray-300" />
  }

  return (
    <FormContainer>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">小麦情報</h1>

        <div className="rounded-lg border bg-card overflow-x-auto relative">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="font-medium text-center min-w-[10em] sticky left-0 bg-gray-50/50 z-20">名称</TableHead>
                <TableHead
                  className="font-medium text-center px-1 cursor-pointer"
                  onClick={() => sortData("proteinPercentage")}
                >
                  <div className="text-center">蛋白 {getSortIcon("proteinPercentage")}</div>
                </TableHead>
                <TableHead
                  className="font-medium text-center px-1 cursor-pointer"
                  onClick={() => sortData("ashPercentage")}
                >
                  <div className="text-center">灰分 {getSortIcon("ashPercentage")}</div>
                </TableHead>
                <TableHead className="font-medium w-[10em] text-center">産地</TableHead>
                <TableHead className="font-medium min-w-[10em] text-center">製粉会社</TableHead>
                <TableHead className="font-medium w-16 text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wheats.map((wheat) => (
                <TableRow key={wheat.id}>
                  <TableCell className="text-center sticky left-0 bg-white">{wheat.name}</TableCell>
                  <TableCell className="text-center px-1">{wheat.proteinPercentage.toFixed(1)}</TableCell>
                  <TableCell className="text-center px-1">{wheat.ashPercentage.toFixed(1)}</TableCell>
                  <TableCell className="text-center">{wheat.origin}</TableCell>
                  <TableCell className="text-center">{wheat.millingCompany}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={async () => {
                        if (window.confirm(`${wheat.name}を削除しますか？`)) {
                          const success = await deleteWheat(wheat.id)
                          if (success) {
                            setWheats((prev) => prev.filter((w) => w.id !== wheat.id))
                            alert("小麦情報を削除しました")
                          }
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <FormSection>
          <h2 className="flex items-center gap-2 text-lg font-medium">
            <Plus className="h-5 w-5" />
            新規登録
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="h-4 w-4" />
                名称
              </label>
              <Input
                className="bg-white"
                value={newWheat.name}
                onChange={(e) => setNewWheat({ ...newWheat, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="h-4 w-4" />
                製粉会社
              </label>
              <Input
                className="bg-white"
                value={newWheat.millingCompany}
                onChange={(e) => setNewWheat({ ...newWheat, millingCompany: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                産地
              </label>
              <Input
                className="bg-white"
                value={newWheat.origin}
                onChange={(e) => setNewWheat({ ...newWheat, origin: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <Percent className="h-4 w-4" />
                  蛋白
                </label>
                <Input
                  type="number"
                  step="0.1"
                  className="bg-white"
                  value={newWheat.proteinPercentage.toFixed(1)}
                  onChange={(e) => setNewWheat({ ...newWheat, proteinPercentage: Number(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <Percent className="h-4 w-4" />
                  灰分
                </label>
                <Input
                  type="number"
                  step="0.1"
                  className="bg-white"
                  value={newWheat.ashPercentage.toFixed(1)}
                  onChange={(e) => setNewWheat({ ...newWheat, ashPercentage: Number(e.target.value) })}
                />
              </div>
            </div>



            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              登録する
            </Button>
          </form>
        </FormSection>
      </div>
    </FormContainer>
  )
}

