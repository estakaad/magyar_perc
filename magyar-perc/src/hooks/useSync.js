import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useSyncedList(table, email, learningLang) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!email || !learningLang) return;
    setItems([]);
    setReady(false);
    supabase
      .from(table)
      .select('*')
      .eq('email', email)
      .eq('learning_lang', learningLang)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error(`[${table}] load error:`, error);
        if (data) setItems(data);
        setReady(true);
      });
  }, [table, email, learningLang]);

  const add = async (item) => {
    const exists = items.some(i => i.word === item.word);
    if (exists) return;
    const row = { word: item.word, translation: item.translation || '', note: item.note || '', email, learning_lang: learningLang };
    const { data, error } = await supabase.from(table).insert(row).select().single();
    if (error) console.error(`[${table}] insert error:`, error);
    if (data) setItems(prev => [...prev, data]);
  };

  const remove = async (word) => {
    await supabase.from(table).delete().eq('email', email).eq('learning_lang', learningLang).eq('word', word);
    setItems(prev => prev.filter(i => i.word !== word));
  };

  const toggle = async (item) => {
    const exists = items.some(i => i.word === item.word);
    if (exists) await remove(item.word);
    else await add(item);
  };

  const updateStats = async (word, field) => {
    const item = items.find(i => i.word === word);
    if (!item) return;
    const newVal = (item[field] || 0) + 1;
    await supabase.from(table).update({ [field]: newVal }).eq('email', email).eq('learning_lang', learningLang).eq('word', word);
    setItems(prev => prev.map(i => i.word === word ? { ...i, [field]: newVal } : i));
  };

  const updateReview = async (word, difficulty) => {
    const item = items.find(i => i.word === word);
    if (!item) return;
    const currentInterval = item.interval_days || 1;
    let newInterval;
    if (difficulty === 'hard') newInterval = 1;
    else if (difficulty === 'ok') newInterval = Math.max(1, Math.round(currentInterval * 1.5));
    else newInterval = Math.max(1, Math.round(currentInterval * 2.5));

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + newInterval);
    const nextReviewStr = nextReview.toISOString().split('T')[0];

    await supabase.from(table)
      .update({ interval_days: newInterval, next_review: nextReviewStr })
      .eq('email', email).eq('learning_lang', learningLang).eq('word', word);
    setItems(prev => prev.map(i => i.word === word
      ? { ...i, interval_days: newInterval, next_review: nextReviewStr }
      : i));
  };

  const updateExamples = async (word, examples) => {
    await supabase.from(table).update({ examples }).eq('email', email).eq('learning_lang', learningLang).eq('word', word);
    setItems(prev => prev.map(i => i.word === word ? { ...i, examples } : i));
  };

  return { items, ready, add, remove, toggle, updateStats, updateReview, updateExamples };
}
