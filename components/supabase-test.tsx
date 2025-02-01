'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function SupabaseTest() {
  const [flours, setFlours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlours = async () => {
      try {
        const { data, error } = await supabase
          .from('flours')
          .select('*')
          .is('deleted_at', null);

        if (error) {
          throw error;
        }

        setFlours(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : '小麦粉データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchFlours();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>小麦粉一覧</h2>
      <ul>
        {flours.map((flour) => (
          <li key={flour.id}>
            {flour.name} - タンパク質: {flour.protein}%
          </li>
        ))}
      </ul>
    </div>
  );
}