'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  MapPin, Clock, Calendar, Heart, 
  VolumeX, Volume2, Moon, Sun, 
  ChevronDown
} from 'lucide-react';
import styles from '@/app/invite/[slug]/page.module.css'; // Reuse existing styles

// --- SUB-COMPONENTS ---

export function Countdown({ targetDate }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  require('react').useEffect(() => {
    const calc = () => {
      const now = new Date();
      const target = new Date(targetDate.includes('T') ? targetDate : targetDate + 'T00:00:00'); 
      const diff = target - now;
      if (diff <= 0) return;
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <div className={styles.countdown}>
      {Object.entries(time).map(([label, val]) => (
        <motion.div 
          key={label} 
          className={styles.countdownBox}
          whileHover={{ y: -5, borderColor: '#FFE6B7' }}
        >
          <span className={styles.countdownNum}>{String(val).padStart(2, '0')}</span>
          <span className={styles.countdownLabel}>{label}</span>
        </motion.div>
      ))}
    </div>
  );
}

export function RSVPForm({ invitationId }) {
  const [form, setForm] = useState({ name: '', attending: null, message: '', guest_count: 1 });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || form.attending === null) return;
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitation_id: invitationId,
          guest_name: form.name.trim(),
          attending: form.attending,
          message: form.message.trim(),
          guest_count: form.attending ? (form.guest_count || 1) : 0,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to submit RSVP');
      }

      setStatus('success');
    } catch (err) {
      console.error('RSVP submit error:', err);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className={styles.rsvpSuccess}>
        <Heart size={40} color="#FFE6B7" />
        <h3 className={styles.sectionTitle}>
          {form.attending ? '🎉 We\'ll see you there!' : 'We\'ll miss you!'}
        </h3>
        <p>
          {form.attending
            ? `Thank you, ${form.name}! Your RSVP has been recorded. We can't wait to celebrate with you.`
            : `Thank you, ${form.name}. We understand and will miss your presence.`}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.rsvpPostcard}>
      <div>
        <h3 className={styles.rsvpPostcardLabel}>Kindly<br/>Reply</h3>
        <p className={styles.rsvpPostcardDesc}>We cannot wait to celebrate our union with you. Please let us know if you can make it.</p>
      </div>
      <form onSubmit={handleSubmit} className={styles.rsvpForm}>
        <input
          className={styles.rsvpInput}
          placeholder="M................................................ (Your Full Name)"
          required
          value={form.name}
          onChange={e => setForm({...form, name: e.target.value})}
        />
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-playfair)' }}>
            <input
              type="radio"
              name="attending"
              onChange={() => setForm({...form, attending: true})}
              checked={form.attending === true}
              style={{ accentColor: '#D4AF37', transform: 'scale(1.2)' }}
            />
            Joyfully Accepts
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-playfair)' }}>
            <input
              type="radio"
              name="attending"
              onChange={() => setForm({...form, attending: false})}
              checked={form.attending === false}
              style={{ accentColor: '#D4AF37', transform: 'scale(1.2)' }}
            />
            Regretfully Declines
          </label>
        </div>
        {form.attending && (
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ fontSize: '0.85rem', opacity: 0.7, fontFamily: 'var(--font-playfair)', whiteSpace: 'nowrap' }}>
              Number of guests:
            </label>
            <input
              type="number"
              min="1"
              max="20"
              className={styles.rsvpInput}
              style={{ width: '80px', textAlign: 'center' }}
              value={form.guest_count}
              onChange={e => setForm({...form, guest_count: Math.max(1, parseInt(e.target.value) || 1)})}
            />
          </div>
        )}
        <input
          className={styles.rsvpInput}
          style={{ marginTop: '0.5rem' }}
          placeholder="Any special diet or heartwarming wishes?"
          value={form.message}
          onChange={e => setForm({...form, message: e.target.value})}
        />
        {status === 'error' && (
          <p style={{ color: '#ffaaaa', fontSize: '0.82rem', marginTop: '0.5rem', textAlign: 'center' }}>
            ⚠ {errorMsg}
          </p>
        )}
        <button
          type="submit"
          className={styles.rsvpWaxBtn}
          disabled={status === 'loading'}
          style={{ opacity: status === 'loading' ? 0.7 : 1 }}
        >
          {status === 'loading' ? 'Sending…' : 'Send Response'}
        </button>
      </form>
    </div>
  );
}

// --- HELPERS ---
export const getEmbedUrl = (url) => {
  if (!url) return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  try {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v');
    } else if (url.includes('youtube.com/embed/')) {
      return url;
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`;
    }
  } catch (err) {
    console.error('URL parse error:', err);
  }
  return url;
};

// --- ROYAL HERITAGE TEMPLATE COMPONENT ---
export default function RoyalHeritageTemplate({ data, template, slug }) {
  const [opened, setOpened] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [playing, setPlaying] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const audioRef = useRef(null);

  const handleOpen = () => {
    setOpened(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFE6B7', '#800000', '#FDF5E6']
    });
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className={`${styles.page} ${styles[theme]}`}>
      <div className={styles.patternLayer} />
      {data && <audio ref={audioRef} src={data.music_url || template.template_json.music_url} loop />}

      <AnimatePresence>
        {!opened && (
          <motion.div 
            className={styles.entrance}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            <motion.div 
              className={styles.entranceContent}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { 
                  opacity: 1, 
                  y: 0,
                  transition: { staggerChildren: 0.2, delayChildren: 0.2 }
                }
              }}
              initial="hidden"
              animate="show"
            >
              <motion.p 
                className={styles.entranceShloka}
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
              >
                ॥ Shree Ganeshay Namah ॥
              </motion.p>
              
              <motion.img 
                src="/ganesha_transparent.png?v=2" 
                className={styles.entranceImage}
                variants={{ 
                  hidden: { opacity: 0, scale: 0.5, rotate: -10 }, 
                  show: { opacity: 1, scale: 1, rotate: 0, transition: { type: 'spring', bounce: 0.5 } } 
                }}
              />

              <motion.p 
                className={styles.entranceText}
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              >
                Together With Their Families
              </motion.p>
              
              <div className={styles.entranceNamesLayout}>
                <motion.h1 
                  className={styles.entranceName}
                  variants={{ hidden: { opacity: 0, x: -30 }, show: { opacity: 1, x: 0, transition: { duration: 0.8 } } }}
                >
                  {data.groom_name}
                </motion.h1>
                
                <motion.div 
                  className={styles.entranceAmpersand}
                  variants={{ hidden: { opacity: 0, scale: 0 }, show: { opacity: 1, scale: 1 } }}
                >
                  &
                </motion.div>

                <motion.h1 
                  className={styles.entranceName}
                  variants={{ hidden: { opacity: 0, x: 30 }, show: { opacity: 1, x: 0, transition: { duration: 0.8 } } }}
                >
                  {data.bride_name}
                </motion.h1>
              </div>

              <motion.button 
                className={styles.openBtn}
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,230,183,0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleOpen}
              >
                OPEN INVITATION ✦
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {opened && (
        <main>
          <div className={styles.controls}>
            <button className={styles.controlBtn} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button className={styles.controlBtn} onClick={toggleMusic}>
              {playing ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>

          <motion.header 
            className={styles.invHeader}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.3 }
              }
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.img 
              src="/ganesha_transparent.png?v=2" 
              className={styles.heroGanesha}
              variants={{ hidden: { opacity: 0, scale: 0.8, filter: 'blur(10px)' }, show: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 1.5, ease: 'easeOut' } } }}
            />
            
            <motion.div 
              className={styles.heroLabel}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 1 } } }}
            >
              The Wedding Celebration Of
            </motion.div>
            
            <motion.h1 
              className={styles.heroNames}
              variants={{ hidden: { opacity: 0, y: 30, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 1.2, ease: 'easeOut' } } }}
            >
              {data.groom_name}
              <span className={styles.heroAmpersand}>&</span>
              {data.bride_name}
            </motion.h1>
            
            <motion.p 
              className={styles.heroTagline}
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 1 } } }}
            >
              The Sacred Union
            </motion.p>
            
            <motion.p 
              className={styles.heroSubTagline}
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 1, delay: 0.5 } } }}
            >
              Join us as we step into our new beginning
            </motion.p>
            
            <motion.div animate={{y: [0, 10, 0]}} transition={{repeat: Infinity, duration: 2}}>
              <ChevronDown color="#FFE6B7" opacity={0.5} />
            </motion.div>
          </motion.header>

          <section className={styles.invSection}>
            <motion.div initial={{opacity: 0, y: 30}} whileInView={{opacity: 1, y: 0}} viewport={{once: true}}>
              <span className={styles.sectionLabel}>Sacred Muhurat</span>
              <h2 className={styles.sectionTitle}>Countdown To The Big Day</h2>
              <Countdown targetDate={data.events?.[0]?.date || '2026-02-22'} />
            </motion.div>
          </section>

          <section className={styles.invSection}>
            <span className={styles.sectionLabel}>Two Souls, One Heart</span>
            <h2 className={styles.sectionTitle}>Meet The Couple</h2>
            
            <div className={styles.coupleCardsGrid}>
              <motion.div 
                className={styles.coupleCard}
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
              >
                <div className={styles.coupleCardImgWrapper}>
                  {data.groom_photo ? (
                    <img src={data.groom_photo} alt="Groom" className={styles.coupleCardImg} />
                  ) : (
                    <span>🤵</span>
                  )}
                </div>
                <span className={styles.coupleCardRole}>The Groom</span>
                <h3 className={styles.coupleCardName}>{data.groom_name}</h3>
                {data.groom_parents && (
                  <p className={styles.coupleCardParents}>
                    S/O<br />{data.groom_parents}
                  </p>
                )}
              </motion.div>

              <motion.div 
                className={styles.coupleCard}
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4, delay: 0.2 }}
              >
                <div className={styles.coupleCardImgWrapper}>
                  {data.bride_photo ? (
                    <img src={data.bride_photo} alt="Bride" className={styles.coupleCardImg} />
                  ) : (
                    <span>👰</span>
                  )}
                </div>
                <span className={styles.coupleCardRole}>The Bride</span>
                <h3 className={styles.coupleCardName}>{data.bride_name}</h3>
                {data.bride_parents && (
                  <p className={styles.coupleCardParents}>
                    D/O<br />{data.bride_parents}
                  </p>
                )}
              </motion.div>
            </div>
          </section>

          <section className={styles.invSection}>
            <motion.div initial={{opacity: 0}} whileInView={{opacity: 1}} viewport={{once: true}} transition={{duration: 1}}>
              <span className={styles.sectionLabel}>Memories In Bloom</span>
              <h2 className={styles.sectionTitle}>Our Journey Together</h2>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', boxShadow: 'var(--shadow)' }}>
                <iframe 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  src={getEmbedUrl(data.story_video_url)}
                  frameBorder="0" allowFullScreen
                />
              </div>
            </motion.div>
          </section>

          <section className={styles.invSection}>
            <span className={styles.sectionLabel}>The Celebration Schedule</span>
            <h2 className={styles.sectionTitle}>Auspicious Ceremonies</h2>
            <div className={styles.eventsGrid}>
              {data.events?.map((ev, i) => (
                <motion.div 
                  key={i} 
                  className={styles.eventCard}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <div className={styles.eventIcon}>💍</div>
                  <h3 className={styles.eventName}>{ev.name}</h3>
                  <div className={styles.eventInfo}>
                    <span><Calendar size={14} style={{verticalAlign: 'middle', marginRight: 8}} /> {ev.date}</span>
                    <span><Clock size={14} style={{verticalAlign: 'middle', marginRight: 8}} /> {ev.time} IST</span>
                    <span><MapPin size={14} style={{verticalAlign: 'middle', marginRight: 8}} /> {ev.venue}</span>
                  </div>
                  {ev.venue_link && (
                    <a href={ev.venue_link} target="_blank" className={styles.mapsBtn}>
                      View Location on Maps
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </section>

          {data.gallery && data.gallery.length > 0 && (
            <section className={styles.invSection}>
              <span className={styles.sectionLabel}>Glimpses Of Our Love</span>
              <h2 className={styles.sectionTitle}>Wedding Gallery</h2>
              <motion.div 
                className={styles.galleryGrid}
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
              >
                {data.gallery.map((imgUrl, i) => (
                  <motion.div 
                    key={i} 
                    className={styles.galleryImgWrapper}
                    variants={{
                      hidden: { opacity: 0, scale: 0.8, y: 50, rotate: i % 2 === 0 ? -12 : 12 },
                      show: { opacity: 1, scale: 1, y: 0, rotate: i % 2 === 0 ? -4 : 4, transition: { type: 'spring', damping: 15 } }
                    }}
                    whileHover={{ scale: 1.05, rotate: 0, zIndex: 10, transition: { duration: 0.3 } }}
                    onClick={() => setSelectedImage(imgUrl)}
                    layoutId={`gallery-img-${imgUrl}`}
                  >
                    <img src={imgUrl} className={styles.galleryImg} alt={`Gallery Image ${i + 1}`} />
                  </motion.div>
                ))}
              </motion.div>
            </section>
          )}

          <AnimatePresence>
            {selectedImage && (
              <motion.div 
                className={styles.lightbox}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedImage(null)}
              >
                <button className={styles.closeLightbox} onClick={() => setSelectedImage(null)}>✕</button>
                <motion.img 
                  src={selectedImage} 
                  className={styles.lightboxImg} 
                  layoutId={`gallery-img-${selectedImage}`}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  onClick={(e) => e.stopPropagation()} 
                />
              </motion.div>
            )}
          </AnimatePresence>

          <section className={styles.invSection} style={{ borderTop: '1px solid rgba(255,230,183,0.1)' }}>
            <motion.div initial={{opacity: 0, y: 40}} whileInView={{opacity: 1, y: 0}} viewport={{once: true}}>
              <span className={styles.sectionLabel}>Honor Us With Your Presence</span>
              <h2 className={styles.sectionTitle}>RSVP Now</h2>
              <RSVPForm invitationId={slug} />
            </motion.div>
          </section>

          <footer className={styles.invSection} style={{ paddingBottom: '10rem' }}>
             <p style={{fontFamily: 'var(--font-cursive)', fontSize: '2rem', color: 'var(--gold)'}}>With Love,</p>
             <p style={{fontSize: '0.8rem', opacity: 0.5, letterSpacing: '2px'}}>KalyanamStudio Signature Series</p>
          </footer>
        </main>
      )}
    </div>
  );
}
