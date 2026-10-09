'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search, Plus, ArrowRight, MessageCircle, X } from 'lucide-react';
import { faqData } from '@/data/faqs';
import { whatsappUrl } from '@/lib/whatsapp';
import styles from './page.module.css';

export default function FAQPage() {
  const [query,setQuery] = useState('');
  const [topic,setTopic] = useState('all');
  const filtered = faqData.filter(item => topic==='all' || item.category===topic).map(item => ({...item, questions:item.questions.filter(question => `${question.q} ${question.a}`.toLowerCase().includes(query.trim().toLowerCase()))})).filter(item => item.questions.length);
  const count = filtered.reduce((sum,item) => sum+item.questions.length,0);
  return <div className={`container ${styles.page}`}>
    <header className={styles.hero}><div><span>THE HELP CENTRE</span><h1>A little clarity.<br />A lot less guesswork.</h1></div><div><p>From your first packing list to your next restock. Find the answers, or talk to someone who can help.</p><form role="search" className={styles.search} onSubmit={event => event.preventDefault()}><Search size={20} /><input type="search" aria-label="Search frequently asked questions" placeholder="What would you like to know?" value={query} onChange={event => setQuery(event.target.value)} />{query && <button type="button" aria-label="Clear FAQ search" onClick={() => setQuery('')}><X size={18} /></button>}</form></div></header>
    <div className={styles.layout}><aside><nav className={styles.topics} aria-label="Help topics">{['all',...faqData.map(item => item.category)].map(category => <button key={category} aria-pressed={topic===category} onClick={() => setTopic(category)}>{category==='all' ? 'All questions' : category}<ArrowRight size={16} /></button>)}</nav><Link className={styles.track} href="/track-order">Looking for an order update? <ArrowRight size={17} /></Link></aside>
      <section className={styles.answers} aria-label="Help answers"><p className={styles.resultCount} aria-live="polite">{count} {count===1 ? 'answer' : 'answers'}{query ? ` for “${query}”` : ' to help you get started'}</p>{filtered.map(category => <section key={category.category} className={styles.group}><h2>{category.category}</h2>{category.questions.map(question => <details key={question.q}><summary>{question.q}<Plus size={21} /></summary><p>{question.a}</p></details>)}</section>)}{!count && <div className={styles.empty}><h2>Let’s try another question.</h2><p>Try a shorter search, choose another topic, or ask our team.</p><button className="btn btn-outline" onClick={() => {setQuery('');setTopic('all');}}>Reset search & topics</button></div>}</section></div>
    <section className={styles.support}><MessageCircle size={34} strokeWidth={1.3} /><div><h2>Some questions need a conversation.</h2><p>Share your product, quantity and pincode. We’ll take it from there.</p></div><a href={whatsappUrl('Hi! I have a question about packaging or placing an order.')} target="_blank" rel="noopener noreferrer">Talk to our team <ArrowRight size={18} /></a></section>
  </div>;
}
