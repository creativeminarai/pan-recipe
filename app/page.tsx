import { FormulaHistoryList } from '@/components/formula-history-list';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">配合一覧</h1>
      <div className="text-sm text-gray-500 space-y-1 mb-6">
        <p>・食パンは当日焼成</p>
        <p>・バゲット・カンパーニュ・ロデヴは翌日焼成</p>
        <p>・クロワッサン、湯だねは3〜4日分まとめて作る</p>
      </div>
      <FormulaHistoryList />
    </main>
  );
}
