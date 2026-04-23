import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

// Generic hook for syncing a list (words or phrases) with Supabase
export function useSyncedList(table, email) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  // Load from Supabase on mount
  useEffect(() => {
    if (!email) return;
    supabase
      .from(table)
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error(`[${table}] load error:`, error);
        if (data) setItems(data);
        setReady(true);
      });
  }, [table, email]);

  const add = async (item) => {
    const exists = items.some(i => i.hu === item.hu);
    if (exists) return;
    const row = { hu: item.hu, et: item.et || '', note: item.note || '', email };
    const { data, error } = await supabase.from(table).insert(row).select().single();
    if (error) console.error(`[${table}] insert error:`, error);
    if (data) setItems(prev => [...prev, data]);
  };

  const remove = async (hu) => {
    await supabase.from(table).delete().eq('email', email).eq('hu', hu);
    setItems(prev => prev.filter(i => i.hu !== hu));
  };

  const toggle = async (item) => {
    const exists = items.some(i => i.hu === item.hu);
    if (exists) await remove(item.hu);
    else await add(item);
  };

  const updateStats = async (hu, field) => {
    const item = items.find(i => i.hu === hu);
    if (!item) return;
    const newVal = (item[field] || 0) + 1;
    await supabase.from(table).update({ [field]: newVal }).eq('email', email).eq('hu', hu);
    setItems(prev => prev.map(i => i.hu === hu ? { ...i, [field]: newVal } : i));
  };

  const updateReview = async (hu, difficulty) => {
    const item = items.find(i => i.hu === hu);
    if (!item) return;
    const currentInterval = item.interval_days || 1;
    let newInterval;
    if (difficulty === 'hard') newInterval = 1;
    else if (difficulty === 'ok') newInterval = Math.max(1, Math.round(currentInterval * 1.5));
    else newInterval = Math.max(1, Math.round(currentInterval * 2.5)); // easy

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);
    const nextReviewStr = nextReview.toISOString().split('T')[0];

    await supabase.from(table)
      .update({ interval_days: newInterval, next_review: nextReviewStr })
      .eq('email', email).eq('hu', hu);
    setItems(prev => prev.map(i => i.hu === hu
      ? { ...i, interval_days: newInterval, next_review: nextReviewStr }
      : i));
  };

  return { items, ready, add, remove, toggle, updateStats, updateReview };
}
