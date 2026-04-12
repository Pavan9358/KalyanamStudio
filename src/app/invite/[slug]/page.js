'use client';
import { useState, useEffect, use } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TEMPLATES } from '@/lib/templates';
import { loadDraft } from '@/lib/localdb';
import styles from './page.module.css';

// Import Templates dynamically or directly
import RoyalHeritageTemplate from '@/components/templates/RoyalHeritage';
import PremiumSouthIndianTemplate from '@/components/templates/PremiumSouthIndian';

export default function PublicInvitePage({ params }) {
  const { slug } = use(params);
  const [data, setData] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Demo Slug Handling
      if (slug.startsWith('demo-')) {
        const templateId = slug.replace('demo-', '');
        const t = TEMPLATES.find(it => it.id === templateId) || TEMPLATES[0];
        setTemplate(t);
        setData({
          groom_name: t.preview_names.split(' & ')[0],
          bride_name: t.preview_names.split(' & ')[1],
          events: [
            { 
              name: 'Sacred Wedding', 
              date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
              time: '10:30', 
              venue: 'Royal Palace Grounds', 
              venue_link: 'https://maps.google.com' 
            },
            { 
              name: 'Grand Reception', 
              date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
              time: '19:00', 
              venue: 'Grand Ballroom', 
              venue_link: 'https://maps.google.com' 
            }
          ],
          ...t.template_json
        });
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/invite/${slug}`, { cache: 'no-store' });
        if (res.ok) {
          const jsonRes = await res.json();
          if (jsonRes.found !== false && jsonRes.invitation) {
            setData(jsonRes.invitation.data_json);
            
            // Critical setup for multiple templates
            const assignedTemplateId = jsonRes.invitation.template_id || 'royal-heritage';
            setTemplate(TEMPLATES.find(t => t.id === assignedTemplateId) || TEMPLATES[0]); 
            
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error('API Fetch Error:', err);
      }

      // Final Fallback: Check IndexedDB for any draft with this slug
      const localData = await loadDraft(`invite_${slug}`);
      if (localData) {
        try {
          setData(localData);
          const assignedTemplateId = localData.template_id || 'royal-heritage';
          setTemplate(TEMPLATES.find(t => t.id === assignedTemplateId) || TEMPLATES[0]);
          console.warn('Loaded invitation from local storage fallback.');
        } catch (e) {
          console.error('Local storage parse error:', e);
        }
      }

      setLoading(false);
    };
    load();
  }, [slug]);

  if (!loading && !data) return <div className={styles.notFound}>Invitation not found.</div>;

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div 
            className={styles.loadingScreen}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            key="loader"
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0F0F1A' }}
          >
            <div className={styles.loaderSpinnerWrapper}>
              <div className={styles.loaderRing}></div>
              <div className={styles.loaderRingInner}></div>
              {/* Fallback general loader if template isn't determined yet */}
              <img src="/ganesha_transparent.png?v=2" className={styles.loaderGanesha} alt="Loading..." />
            </div>
            <h2 className={styles.loaderText}>Preparing Your Invitation</h2>
            <div className={styles.loaderBarWrapper}>
              <div className={styles.loaderPulseBar}></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && data && template && (
        <>
          {template.id === 'premium-south-indian' ? (
            <PremiumSouthIndianTemplate data={data} template={template} slug={slug} />
          ) : (
            <RoyalHeritageTemplate data={data} template={template} slug={slug} />
          )}
        </>
      )}
    </>
  );
}
