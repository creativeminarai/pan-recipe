export const formatDateWithDay = (date: Date | string) => {
  const d = new Date(date)
  const days = ['日', '月', '火', '水', '木', '金', '土']
  const dayOfWeek = days[d.getDay()]
  return `${d.toLocaleDateString('ja-JP')} (${dayOfWeek})`
}
