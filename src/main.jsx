import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { Feather, BookOpen, PenLine, Heart, ChevronLeft, ChevronRight, X, Send, Sparkles, Search, Shuffle, Bookmark, Check, RefreshCw } from 'lucide-react';
import './style.css';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = url && key ? createClient(url, key) : null;
const DRAFT_KEY = 'unsaid-library-draft-v1';
const categories = ['All pages', 'Unsent words', 'Love & longing', 'Goodbyes', 'Regrets', 'Healing', 'Memories', 'Things I wish I said', 'Little truths'];

function App() {
  const [opened, setOpened] = useState(false);
  const [writing, setWriting] = useState(false);
  const [entries, setEntries] = useState([]);
  const [page, setPage] = useState(0);
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Unsent words');
  const [filter, setFilter] = useState('All pages');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [turn, setTurn] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);

  async function loadEntries() {
    if (!supabase) { setEntries([]); setLoading(false); return; }
    const { data, error } = await supabase.from('entries')
      .select('id,title,body,category,created_at')
      .eq('published', true).order('created_at', { ascending: false }).limit(200);
    if (!error) setEntries(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadEntries();
    if (!supabase) return;
    const channel = supabase.channel('public-book-pages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'entries' }, () => loadEntries())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const visibleEntries = useMemo(() => entries.filter(entry => {
    const categoryMatch = filter === 'All pages' || entry.category === filter;
    const needle = search.trim().toLowerCase();
    const searchMatch = !needle || (entry.title || '').toLowerCase().includes(needle) || (entry.body || '').toLowerCase().includes(needle);
    return categoryMatch && searchMatch;
  }), [entries, filter, search]);

  useEffect(() => { setPage(0); }, [filter, search]);

  useEffect(() => {
    if (!writing) return;
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      if (draft && !text && !title) {
        setText(draft.text || '');
        setTitle(draft.title || '');
        setCategory(draft.category || 'Unsent words');
      }
    } catch {}
  }, [writing]);

  useEffect(() => {
    if (!writing) return;
    const hasDraft = Boolean(text || title);
    try {
      if (hasDraft) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ text, title, category }));
        setDraftSaved(true);
      } else {
        localStorage.removeItem(DRAFT_KEY);
        setDraftSaved(false);
      }
    } catch {}
  }, [writing, text, title, category]);

  function changePage(next) {
    if (next < 0 || next >= visibleEntries.length || turn) return;
    setTurn(next > page ? 'forward' : 'back');
    window.setTimeout(() => { setPage(next); setTurn(''); }, 650);
  }

  function openWriter() { setWriting(true); setStatus(''); setHoneypot(''); }

  async function publish(e) {
    e.preventDefault();
    if (honeypot) return;
    if (text.trim().length < 20) { setStatus('A page needs at least 20 characters. Take your time.'); return; }
    if (!supabase) { setStatus('The book is having a quiet moment. Please try again soon.'); return; }
    setStatus('Carefully placing your words on a page…');
    const { error } = await supabase.from('entries').insert({
      title: title.trim() || 'A page without a title',
      body: text.trim(),
      category
    });
    if (error) {
      setStatus('Your page could not be saved just now. Please try again in a moment.');
    } else {
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      setStatus('Your words have found a home. Thank you for trusting this little book.');
      setText(''); setTitle(''); setWriting(false); setPage(0);
      await loadEntries();
    }
  }

  function surpriseMe() {
    if (!visibleEntries.length) return;
    const next = visibleEntries.length === 1 ? 0 : (page + 1 + Math.floor(Math.random() * (visibleEntries.length - 1))) % visibleEntries.length;
    if (next === page) return;
    changePage(next);
  }

  const current = visibleEntries[page];
  const dateLabel = current?.created_at ? new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(current.created_at)) : '';

  return <main>
    {!opened ? <section className="intro">
      <div className="glow glow-a"/><div className="glow glow-b"/>
      <div className="stars">✦　 ·　 ✧　　 ·　 ✦</div>
      <div className="intro-kicker"><Feather size={15}/> A QUIET PLACE FOR THE HEART</div>
      <div className="closed-book-wrap" onClick={() => setOpened(true)} role="button" tabIndex="0" aria-label="Open the book" onKeyDown={e => e.key === 'Enter' && setOpened(true)}>
        <div className="closed-book"><div className="book-pages-edge"/><div className="book-spine"/>
          <div className="cover-content"><span className="cover-ornament">❧</span><span className="cover-small">A collection of unspoken things</span>
            <h1>All the Things<br/><i>I Never Told You</i></h1><div className="cover-rule"><span>✦</span></div>
            <p>FOR THE WORDS THAT NEVER MADE IT OUT</p><Feather className="cover-feather" size={24}/><span className="cover-bottom">EST. IN THE QUIET</span>
          </div>
        </div>
      </div>
      <p className="intro-copy">For the goodbyes we swallowed.<br/>For the love we couldn't confess.<br/>For the nights we wished someone would ask.</p>
      <p className="intro-soft">You can leave a piece of your heart here.<br/>No name is needed. No explanation either.</p>
      <button className="open-btn" onClick={() => setOpened(true)}>Gently open the book <BookOpen size={17}/></button>
      <span className="hint">TAKE YOUR TIME · READ GENTLY · FEEL WHAT YOU FEEL</span>
    </section> : <section className="library">
      <header><a className="wordmark" onClick={() => setOpened(false)}><Feather size={17}/> THE UNSAID LIBRARY</a>
        <div className="header-actions"><button className="refresh-btn" onClick={loadEntries} aria-label="Refresh pages"><RefreshCw size={15}/></button><button className="write-top" onClick={openWriter}><PenLine size={16}/> Write a page</button></div>
      </header>
      <div className="welcome"><span className="eyebrow">A SHARED BOOK · WRITTEN BY STRANGERS</span>
        <h2>Some feelings are too heavy<br/><i>to keep carrying alone.</i></h2>
        <p>Read a stranger's heart. Leave a little of yours behind.</p>
      </div>
      <div className="library-tools">
        <label className="search-box"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a feeling, a word, a memory…" aria-label="Search pages"/></label>
        <select className="filter-select" value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter pages by feeling">
          {categories.map(item => <option key={item}>{item}</option>)}
        </select>
      </div>
      {writing && <div className="modal-backdrop" onClick={() => setWriting(false)}>
        <form className="write-card" onSubmit={publish} onClick={e => e.stopPropagation()}>
          <button type="button" className="close" onClick={() => setWriting(false)} aria-label="Close writing window"><X/></button>
          <span className="eyebrow">A BLANK PAGE · A BREATH · A BEGINNING</span>
          <h3>Write what your heart remembers.</h3>
          <p className="muted">No names. No judgement. Just a page that will listen.</p>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="A title for this feeling (optional)" maxLength="90" aria-label="Page title"/>
          <select value={category} onChange={e => setCategory(e.target.value)} aria-label="Choose a feeling">
            {categories.slice(1).map(item => <option key={item}>{item}</option>)}
          </select>
          <div className="writing-paper">
            <div className={'pen-cursor ' + (text.length ? 'pen-moving' : '')}><PenLine size={27}/><span/></div>
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder={'Dear someone,\n\nThere is something I have carried for so long…'} maxLength="5000" required aria-label="Your anonymous page"/>
            <div className="paper-flower">❧</div>
          </div>
          <input className="quiet-trap" tabIndex="-1" autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} aria-hidden="true"/>
          <div className="form-foot"><small>{text.length}/5000 · At least 20 characters. Avoid names, addresses and contact details.</small>
            <button className="submit" type="submit"><Send size={15}/> Place my page in the book</button>
          </div>
          <p className="draft-note"><Bookmark size={13}/> {draftSaved ? 'Your unfinished words are saved on this device.' : 'Your unfinished words stay on this device.'}</p>
          <p className="publish-note">A gentle reminder: once submitted, your page is public and can be read by anyone. Please do not include anything you need to keep private.</p>
          {status && <p className="status" role="status">{status}</p>}
        </form>
      </div>}
      <div className="book-area"><div className="book-open">
        <div className="paper left-paper"><span className="page-label">A LITTLE NOTE</span>
          <div className="left-quote">“Somewhere, someone has felt exactly what you are feeling.”</div>
          <div className="scribble">You are not as alone as it feels.</div><div className="leaf">❧</div><span className="page-number left-num">♡</span>
        </div>
        <div className={'paper right-paper ' + (turn ? 'turn-' + turn : '')}>
          {loading ? <div className="empty"><Sparkles/><p>Dusting off the pages…</p></div> : current ? <>
            <span className="page-label">{current.category || 'A PAGE FROM A STRANGER'}</span>
            <h3>{current.title}</h3><p className="entry-body">{current.body}</p>
            <span className="anonymous">— someone who needed to say it</span><span className="entry-date">{dateLabel}</span>
          </> : <div className="empty"><Feather/><h3>{search || filter !== 'All pages' ? 'No page found for this feeling.' : 'The first page is still blank.'}</h3>
            <p>{search || filter !== 'All pages' ? 'Try another word or turn the filter back to all pages.' : <>Perhaps yours will be the first story<br/>someone reads on a difficult night.</>}</p>
            <button className="text-btn" onClick={openWriter}>Write a page <PenLine size={15}/></button>
          </div>}
          <span className="page-number">{visibleEntries.length ? String(page + 1).padStart(2, '0') : '♡'}</span>
        </div>
      </div>
      <div className="book-controls">
        <button disabled={page === 0 || !!turn} onClick={() => changePage(page - 1)}><ChevronLeft/> Previous page</button>
        <span>{visibleEntries.length ? 'PAGE ' + (page + 1) + ' OF ' + visibleEntries.length : 'A BOOK WAITING FOR STORIES'}</span>
        <button className="surprise-btn" disabled={visibleEntries.length < 2 || !!turn} onClick={surpriseMe} aria-label="Open a random page"><Shuffle size={14}/></button>
        <button disabled={page >= visibleEntries.length - 1 || !!turn} onClick={() => changePage(page + 1)}>Turn the page <ChevronRight/></button>
      </div></div>
      <div className="bottom-note"><Heart size={14}/> Please read gently. Someone left a piece of themselves here. <span>{entries.length} {entries.length === 1 ? 'page' : 'pages'} in this book</span></div>
      <footer>ALL THE THINGS I NEVER TOLD YOU <span>·</span> MAY EVERY UNSAID THING FIND A HOME</footer>
    </section>}
  </main>;
}

createRoot(document.getElementById('root')).render(<App/>);
