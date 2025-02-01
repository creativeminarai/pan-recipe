export interface Bread {
  id: string
  name: string
  deletedAt: Date | null
  notes: string
}

export interface Wheat {
  id: string
  name: string
  millingCompany: string
  origin: string
  proteinPercentage: number
  ashPercentage: number
  deletedAt: Date | null
  notes: string
  display_order: number
}

export interface BlendHistory {
  history_id: string
  date: Date
  breadId: string
  wheatBlends: {
    wheatId: string
    amount: number
  }[]
  deletedAt: Date | null
  notes: string
}

export interface MainBlend {
  breadId: string
  wheatBlends: {
    wheatId: string
    amount: number
  }[]
}

