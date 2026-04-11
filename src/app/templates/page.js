'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import TemplateCard from '@/components/TemplateCard';
import { TEMPLATES } from '@/lib/templates';
import styles from './page.module.css';

const CATEGORIES = ['All', 'Traditional', 'Royal', 'Floral', 'Modern'];

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === activeCategory);

  return (
    <main className={styles.page}>
      <Navbar />
      <div className={styles.header}>
        <div className={styles.headerBg} />
        <div className={styles.headerContent}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.headerBadge}>🎨 Template Gallery</div>
            <h1 className={styles.headerTitle}>
              Choose Your
              <em className={styles.headerTitleEm}> Perfect Style</em>
            </h1>
            <p className={styles.headerSubtitle}>
              Every template is crafted with authentic South Indian cultural motifs, traditional typography and modern elegance. Preview, customise, and share in minutes.
            </p>
          </motion.div>
        </div>
      </div>

      <div className={styles.body}>
        <div className="container">
          {/* Filters */}
          <motion.div
            className={styles.filters}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterBtnActive : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Count */}
          <p className={styles.resultCount}>
            Showing {filtered.length} template{filtered.length !== 1 ? 's' : ''}
            {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
          </p>

          {/* Grid */}
          <div className="grid-4">
            {filtered.map((t, i) => (
              <TemplateCard key={t.id} template={t} index={i} />
            ))}
          </div>

          {/* Bottom CTA */}
          <div className={styles.bottomCta}>
            <div className={styles.ctaCard}>
              <span className={styles.ctaEmoji}>✨</span>
              <div>
                <h3>Can&apos;t find what you&apos;re looking for?</h3>
                <p>More templates are being added regularly. Sign up to get notified about new additions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
