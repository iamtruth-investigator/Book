import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { Feather, BookOpen, PenLine, Heart, ChevronLeft, ChevronRight, X, Send, Sparkles } from 'lucide-react';
import './style.css';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = url && key ? createClient(url, key) : null;

function App() {
  const [opened, setOpened] = useState(false);
  const [writing, setWriting] = useState(false);
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(0);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Unsent words');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadEntries() {
    if (!supabase) { setEntries([]); setLoading(false); return; }
    const { data, error } = await supabase.from('entries').select('id,title,body,category,created_at').eq('published', true).order('created_at', { ascending: false }).limit(100);
    if (!error) setEntries(data || []);
    setLoading(false);
  }
  useEffect(() => { loadEntries(); }, []);

  async function publish(e) {
    e.preventDefault();
    if (!text.trim()) return;
    if (!supabase) { setStatus('The shared book is not connected yet. Add your Supabase keys to enable publishing.'); return; }
    setStatus('Adding your words to the book…');
    const { error } = await supabase.from('entries').insert({ title: title.trim() || 'A page without a title', body: text.trim(), category });
    if (error) setStatus('This page could not be saved. Please try again.');
    else { setStatus('Your words have found a page. Thank you for leaving them here.'); setText(''); setTitle(''); setWriting(false); setPage(0); await loadEntries(); }
  }

  const current = entries[page];
  return <main>
    {!opened ? <section className="intro">
      <div className="dust dust1"/><div className="dust dust2"/>
      <div className="eyebrow"><Feather size={15}/> A BOOK WITHOUT AUTHORS</div>
      <div className="closed-book" onClick={() => setOpened(true)} role="button" tabIndex="0" onKeyDown={e => e.key === 'Enter' && setOpened(true)}>
        <div className="book-spine"></div><div className="cover-content">
          <span className="cover-small">A place for the unsaid</span>
          <h1>All the Things<br/><i>I Never Told You</i></h1>
          <div className="cover-rule"></div><p>EVERY HEART HAS A HIDDEN PAGE</p>
          <Feather className="cover-feather" size={25}/>
        </div>
      </div>
      <p className="intro-copy">Some words stayed in our throats.<br/>Some stories never found a listener.<br/>Perhaps they can find a page here.</p>
      <button className="open-btn" onClick={() => setOpened(true)}>Open the book <BookOpen size={17}/></button>
      <span className="hint">TURN THE COVER · FIND A LITTLE COURAGE</span>
    </section> : <section className="library">
      <header><a className="wordmark" onClick={() => setOpened(false)}><Feather size={17}/> THE UNSAID LIBRARY</a><button className="write-top" onClick={() => {setWriting(true);setStatus('');}}><PenLine size={16}/> Leave a page</button></header>
      <div className="welcome"><span className="eyebrow">A SHARED BOOK · NO NAMES REQUIRED</span><h2>Every stranger carries<br/><i>a story worth hearing.</i></h2><p>Write what you never said. Read what someone else couldn't say aloud.</p></div>
      {writing && <div className="modal-backdrop" onClick={() => setWriting(false)}><form className="write-card" onSubmit={publish} onClick={e => e.stopPropagation()}>
        <button type="button" className="close" onClick={() => setWriting(false)}><X/></button><span className="eyebrow">YOUR PAGE, YOUR PRIVACY</span><h3>Leave something here.</h3><p className="muted">No name. No profile. Just your words.</p>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Give this page a title (optional)" maxLength="90"/>
        <select value={category} onChange={e=>setCategory(e.target.value)}><option>Unsent words</option><option>Love & longing</option><option>Regrets</option><option>Healing</option><option>Memories</option><option>Things I wish I said</option><option>Little truths</option></select>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Dear someone, ...&#10;&#10;Write freely. This is a place for the words you kept." maxLength="5000" required/>
        <div className="form-foot"><small>{text.length}/5000 · Please don't include private contact details.</small><button className="submit" type="submit"><Send size={15}/> Publish anonymously</button></div>
        {status && <p className="status">{status}</p>}
      </form></div>}
      <div className="book-area">
        <div className="book-open">
          <div className="paper left-paper"><span className="page-label">A NOTE TO THE READER</span><div className="left-quote">“You don't have to know who wrote it to understand how it feels.”</div><div className="scribble">— someone, somewhere</div><div className="leaf">✳</div></div>
          <div className="paper right-paper">
            {loading ? <div className="empty"><Sparkles/><p>Turning the first pages…</p></div> : current ? <><span className="page-label">{current.category || 'A PAGE FROM A STRANGER'}</span><h3>{current.title}</h3><p className="entry-body">{current.body}</p><span className="anonymous">— A fellow human, anonymously</span></> : <div className="empty"><Feather/><h3>The first page is waiting.</h3><p>Be the first to leave a few honest words.</p><button className="text-btn" onClick={()=>setWriting(true)}>Write the first page <PenLine size={15}/></button></div>}
            <span className="page-number">{entries.length ? String(page+1).padStart(2,'0') : '—'}</span>
          </div>
        </div>
        <div className="book-controls"><button disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))}><ChevronLeft/> Previous page</button><span>{entries.length ? `${page+1} of ${entries.length} pages` : 'A book in the making'}</span><button disabled={page>=entries.length-1} onClick={()=>setPage(p=>Math.min(entries.length-1,p+1))}>Next page <ChevronRight/></button></div>
      </div>
      <div className="bottom-note"><Heart size={14}/> Read gently. These pages belong to real people. <span>{entries.length} {entries.length===1?'page':'pages'} shared</span></div>
      <footer>ALL THE THINGS I NEVER TOLD YOU <span>·</span> A BOOK WRITTEN BY EVERYONE</footer>
    </section>}
  </main>;
}
createRoot(document.getElementById('root')).render(<App/>);
