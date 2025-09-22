import React, { useState, useEffect } from 'react';
import { supabase } from '../services/api';

export default function KnowledgeBase({ tenantId }: { tenantId: string }) {
  const [articles, setArticles] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  async function load() {
    const { data } = await supabase.from('articles').select('*').eq('tenant_id', tenantId);
    setArticles(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    const { error } = await supabase.from('articles').insert([{ tenant_id: tenantId, title, content }]);
    if (!error) {
      setTitle('');
      setContent('');
      load();
    }
  }

  return (
    <div>
      <h2>Knowledge Base</h2>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" style={{ marginBottom: 10 }}/>
      <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Content" style={{ marginBottom: 10 }}></textarea>
      <button onClick={save}>Add</button>
      {articles.map(a => <div key={a.id}><h3>{a.title}</h3><p>{a.content}</p></div>)}
    </div>
  );
}