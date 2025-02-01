import { supabase } from "@/lib/supabase"
import type { Bread, Wheat, BlendHistory } from "@/types"
import type { Database } from "@/types/supabase"

type Flour = Database["public"]["Tables"]["flours"]["Row"]
type FormulaHistory = Database["public"]["Tables"]["formula_histories"]["Row"] & {
  flour1: Pick<Flour, "id" | "name"> | null
  flour2: Pick<Flour, "id" | "name"> | null
  flour3: Pick<Flour, "id" | "name"> | null
  flour4: Pick<Flour, "id" | "name"> | null
  flour5: Pick<Flour, "id" | "name"> | null
}
type DbBread = Database["public"]["Tables"]["breads"]["Row"]

const convertBread = (bread: DbBread): Bread => ({
  id: bread.id,
  name: bread.name,
  deletedAt: bread.deleted_at ? new Date(bread.deleted_at) : null,
  notes: bread.notes || "",
})

const convertWheat = (flour: Flour): Wheat => ({
  id: flour.id,
  name: flour.name,
  millingCompany: flour.company || "",
  origin: flour.origin || "",
  proteinPercentage: flour.protein || 0,
  ashPercentage: flour.ash_content || 0,
  deletedAt: flour.deleted_at ? new Date(flour.deleted_at) : null,
  notes: flour.notes || "",
  display_order: flour.display_order,
})

const convertBlendHistory = (
  history: FormulaHistory,
  breadId: string
): BlendHistory => {
  const wheatBlends = []
  
  const flourFields = [
    { flour: history.flour1, weight: history.flour1_weight },
    { flour: history.flour2, weight: history.flour2_weight },
    { flour: history.flour3, weight: history.flour3_weight },
    { flour: history.flour4, weight: history.flour4_weight },
    { flour: history.flour5, weight: history.flour5_weight },
  ]

  for (const { flour, weight } of flourFields) {
    if (flour?.id && weight && weight > 0) {
      const wheatId = flour.id
      wheatBlends.push({
        wheatId,
        amount: weight,
      })
    }
  }

  return {
    history_id: history.history_id,
    date: new Date(history.recorded_at),
    breadId: breadId,
    wheatBlends,
    deletedAt: history.deleted_at ? new Date(history.deleted_at) : null,
    notes: history.notes || "",
  }
}

export const addBread = async (name: string): Promise<Bread | null> => {
  const { data, error } = await supabase
    .from("breads")
    .insert([{ name }])
    .select()
    .single()

  if (error) {
    console.error("Error adding bread:", error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
  }
}

export const getBreads = async (): Promise<Bread[]> => {
  const { data: breads, error } = await supabase
    .from("breads")
    .select("*")
    .is("deleted_at", null)
    .order("name")

  if (error) {
    console.error("Error fetching breads:", error)
    return []
  }

  return breads.map(convertBread)
}

export const deleteWheat = async (wheatId: string): Promise<boolean> => {
  const { error } = await supabase
    .from("wheats")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", wheatId)

  if (error) {
    console.error("Error deleting wheat:", error)
    return false
  }

  return true
}

export const getWheats = async (): Promise<Wheat[]> => {
  const { data: flours, error } = await supabase
    .from("flours")
    .select("*")
    .is("deleted_at", null)
    .order("display_order")

  if (error) {
    console.error("Error fetching flours:", error)
    return []
  }

  return flours.map(convertWheat)
}

export const addWheat = async (wheat: Omit<Wheat, "id" | "deletedAt" | "display_order">) => {
  const { data: maxOrderData, error: maxOrderError } = await supabase
    .from("flours")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)

  if (maxOrderError) {
    console.error("Error fetching max display order:", maxOrderError)
    return null
  }

  const nextOrder = maxOrderData && maxOrderData[0] ? maxOrderData[0].display_order + 1 : 1

  const { data, error } = await supabase
    .from("flours")
    .insert([
      {
        name: wheat.name,
        company: wheat.millingCompany,
        origin: wheat.origin,
        protein: wheat.proteinPercentage,
        ash_content: wheat.ashPercentage,
        notes: wheat.notes,
        display_order: nextOrder,
      },
    ])
    .select()

  if (error) {
    console.error("Error adding wheat:", error)
    return null
  }

  return data ? convertWheat(data[0]) : null
}



export const updateMainBlend = async (breadId: string, wheatBlends: WheatBlend[]) => {
  // 小麦粉の配合を5つまでに分割
  const validBlends = wheatBlends.filter(blend => blend.wheatId && blend.amount > 0)
  const blends = [...validBlends]
  while (blends.length < 5) {
    blends.push({ wheatId: "", amount: 0 })
  }

  const { data, error } = await supabase
    .from("main_formulas")
    .upsert([
      {
        bread_id: breadId,
        flour1_id: blends[0].wheatId || null,
        flour1_weight: blends[0].amount || null,
        flour2_id: blends[1].wheatId || null,
        flour2_weight: blends[1].amount || null,
        flour3_id: blends[2].wheatId || null,
        flour3_weight: blends[2].amount || null,
        flour4_id: blends[3].wheatId || null,
        flour4_weight: blends[3].amount || null,
        flour5_id: blends[4].wheatId || null,
        flour5_weight: blends[4].amount || null,
      },
    ])
    .select()

  if (error) {
    console.error("Error updating main blend:", error)
    return null
  }

  return {
    breadId,
    wheatBlends: validBlends,
  }
}

export const getMainBlend = async (breadId: string): Promise<MainBlend | null> => {
  const { data, error } = await supabase
    .from("main_formulas")
    .select(`
      bread_id,
      flour1_id,
      flour1_weight,
      flour2_id,
      flour2_weight,
      flour3_id,
      flour3_weight,
      flour4_id,
      flour4_weight,
      flour5_id,
      flour5_weight
    `)
    .eq("bread_id", breadId)
    .is("deleted_at", null)
    .single()

  if (error) {
    console.error("Error fetching main blend:", error)
    return null
  }

  if (!data) return null

  return {
    breadId: data.bread_id,
    wheatBlends: [
      { wheatId: data.flour1_id, amount: data.flour1_weight || 0 },
      { wheatId: data.flour2_id, amount: data.flour2_weight || 0 },
      { wheatId: data.flour3_id, amount: data.flour3_weight || 0 },
      { wheatId: data.flour4_id, amount: data.flour4_weight || 0 },
      { wheatId: data.flour5_id, amount: data.flour5_weight || 0 },
    ].filter((b) => b.wheatId && b.amount > 0)
  }
}

export const getMainBlends = async (): Promise<MainBlend[]> => {
  const { data, error } = await supabase
    .from("main_formulas")
    .select(`
      bread_id,
      flour1_id,
      flour1_weight,
      flour2_id,
      flour2_weight,
      flour3_id,
      flour3_weight,
      flour4_id,
      flour4_weight,
      flour5_id,
      flour5_weight
    `)
    .is("deleted_at", null)

  if (error) {
    console.error("Error fetching main blends:", error)
    return []
  }

  return data.map((blend) => ({
    breadId: blend.bread_id,
    wheatBlends: [
      { wheatId: blend.flour1_id, amount: blend.flour1_weight || 0 },
      { wheatId: blend.flour2_id, amount: blend.flour2_weight || 0 },
      { wheatId: blend.flour3_id, amount: blend.flour3_weight || 0 },
      { wheatId: blend.flour4_id, amount: blend.flour4_weight || 0 },
      { wheatId: blend.flour5_id, amount: blend.flour5_weight || 0 },
    ].filter((b) => b.wheatId && b.amount > 0)
  }))
}

export const addBlendHistory = async (history: Omit<BlendHistory, "id" | "deletedAt">) => {
  // 小麦粉の配合を5つまでに分割
  const wheatBlends = [...history.wheatBlends]
  while (wheatBlends.length < 5) {
    wheatBlends.push({ wheatId: "", amount: 0 })
  }

  const { data, error } = await supabase
    .from("formula_histories")
    .insert([
      {
        bread_id: history.breadId,
        recorded_at: history.date.toISOString(),
        flour1_id: wheatBlends[0].wheatId || null,
        flour1_weight: wheatBlends[0].amount || null,
        flour2_id: wheatBlends[1].wheatId || null,
        flour2_weight: wheatBlends[1].amount || null,
        flour3_id: wheatBlends[2].wheatId || null,
        flour3_weight: wheatBlends[2].amount || null,
        flour4_id: wheatBlends[3].wheatId || null,
        flour4_weight: wheatBlends[3].amount || null,
        flour5_id: wheatBlends[4].wheatId || null,
        flour5_weight: wheatBlends[4].amount || null,
        notes: history.notes || null,
      },
    ])
    .select()

  if (error) {
    console.error("Error adding blend history:", error)
    return null
  }

  const result = data && data[0] ? {
    id: data[0].history_id,
    date: new Date(data[0].recorded_at),
    breadId: data[0].bread_id,
    wheatBlends: [
      { wheatId: data[0].flour1_id || "", amount: data[0].flour1_weight || 0 },
      { wheatId: data[0].flour2_id || "", amount: data[0].flour2_weight || 0 },
      { wheatId: data[0].flour3_id || "", amount: data[0].flour3_weight || 0 },
      { wheatId: data[0].flour4_id || "", amount: data[0].flour4_weight || 0 },
      { wheatId: data[0].flour5_id || "", amount: data[0].flour5_weight || 0 },
    ].filter(blend => blend.wheatId && blend.amount > 0),
    deletedAt: data[0].deleted_at ? new Date(data[0].deleted_at) : null,
    notes: data[0].notes || "",
  } : null

  return result
}

export const deleteBlendHistory = async (historyId: string): Promise<boolean> => {
  const { error } = await supabase
    .from("formula_histories")
    .update({ deleted_at: new Date().toISOString() })
    .eq("history_id", historyId)

  if (error) {
    console.error("Error deleting blend history:", error)
    return false
  }

  return true
}

export const getBlendHistories = async (): Promise<BlendHistory[]> => {
  const { data: histories, error } = await supabase
    .from("formula_histories")
    .select(`
      *,
      flour1:flours!formula_histories_flour1_id_fkey(id, name),
      flour2:flours!formula_histories_flour2_id_fkey(id, name),
      flour3:flours!formula_histories_flour3_id_fkey(id, name),
      flour4:flours!formula_histories_flour4_id_fkey(id, name),
      flour5:flours!formula_histories_flour5_id_fkey(id, name)
    `)
    .is("deleted_at", null)
    .order("recorded_at", { ascending: false })

  if (error) {
    console.error("Error fetching formula histories:", error)
    return []
  }

  return histories.map((history) => convertBlendHistory(history, history.bread_id))
}
