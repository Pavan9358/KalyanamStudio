'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import styles from './TemplateCard.module.css';
import { Eye, ArrowRight, Star } from 'lucide-react';

export default function TemplateCard({ template, index = 0 }) {
  const categoryColors = {
    Traditional: { bg: 'rgba(128,0,0,0.12)', color: '#800000' },
    Modern: { bg: 'rgba(37,99,235,0.12)', color: '#1D4ED8' },
    Floral: { bg: 'rgba(46,125,50,0.12)', color: '#2E7D32' },
    Royal: { bg: 'rgba(212,175,55,0.15)', color: '#A88920' },
    Premium: { bg: 'rgba(255,215,0,0.2)', color: '#B8860B' },
  };
  const cat = categoryColors[template.category] || categoryColors.Traditional;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={styles.card}
    >
      <div className={styles.imageWrapper}>
        <div className={styles.imageOverlay} />
        <img
          src={template.preview_image || `/templates/template-${template.id}-bg.jpg`}
          alt={template.name}
          className={styles.image}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div
          className={styles.templatePreview}
          style={{ background: template.bg_gradient || 'linear-gradient(135deg, #800000, #5A0000)' }}
        >
          <div className={styles.previewContent}>
            <div className={styles.previewOrnament}>✦ ✦ ✦</div>
            <p className={styles.previewSub}>{template.preview_sub || 'Together with their families'}</p>
            <h3 className={styles.previewNames}>{template.preview_names || 'Arjun & Priya'}</h3>
            <div className={styles.previewDivider}></div>
            <p className={styles.previewDate}>Auspicious Muhurtham</p>
            <p className={styles.previewDateVal}>{template.preview_date || 'December 12, 2025'}</p>
          </div>
        </div>

        <div className={styles.hoverActions}>
          <Link href={`/invite/demo-${template.id}`} className={`${styles.actionBtn} ${styles.previewBtn}`}>
            <Eye size={16} />
            Preview
          </Link>
          <Link href={`/builder/${template.id}`} className={`${styles.actionBtn} ${styles.selectBtn}`}>
            <ArrowRight size={16} />
            Use Template
          </Link>
        </div>

        {template.is_premium && (
          <div className={styles.premiumBadge}>
            <Star size={11} fill="currentColor" />
            Premium
          </div>
        )}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardTop}>
          <h3 className={styles.templateName}>{template.name}</h3>
          <span
            className={styles.categoryBadge}
            style={{ background: cat.bg, color: cat.color }}
          >
            {template.category}
          </span>
        </div>
        <p className={styles.templateDesc}>{template.description}</p>
        <div className={styles.cardFooter}>
          <div className={styles.features}>
            {template.features?.slice(0, 3).map(f => (
              <span key={f} className={styles.feature}>✓ {f}</span>
            ))}
          </div>
          <Link href={`/builder/${template.id}`} className={styles.cta}>
            Select <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
