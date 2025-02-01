import { FormulaHistoryList } from '@/components/formula-history-list';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">配合履歴</h1>
      <FormulaHistoryList />
    </main>
  );
}
