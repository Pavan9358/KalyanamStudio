'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Volume2, VolumeX, MessageSquare, Heart, Send } from 'lucide-react';
import styles from './PremiumSouthIndian.module.css';

// --- HELPERS ---
const getEmbedUrl = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
};

// --- ANIMATION VARIANTS ---
const revealVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};


// --- COUNTDOWN COMPONENT ---
function Countdown({ targetDate }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
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
          whileHover={{ y: -5, borderColor: '#D4AF37', boxShadow: '0 10px 30px rgba(212, 175, 55, 0.2)' }}
        >
          <span className={styles.countdownNum}>{String(val).padStart(2, '0')}</span>
          <span className={styles.countdownLabel}>
            {val === 1 ? label.slice(0, -1) : label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// --- RSVP FORM COMPONENT ---
function RSVPForm({ slug }) {
  const [form, setForm] = useState({ name: '', attending: null, message: '', guest_count: 1 });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || form.attending === null) return;
    setStatus('loading');

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitation_id: slug,
          guest_name: form.name.trim(),
          attending: form.attending,
          message: form.message.trim(),
          guest_count: form.attending ? (form.guest_count || 1) : 0,
        }),
      });
      if (res.ok) setStatus('success');
      else setStatus('error');
    } catch (err) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={styles.rsvpSuccess}>
        <Heart size={40} className={styles.eventIcon} />
        <h3 className={styles.sectionTitle} style={{fontSize: '1.5rem'}}>We'll see you there!</h3>
        <p>Thank you, {form.name.split(' ')[0]}! Your response has been recorded.</p>
      </motion.div>
    );
  }

  return (
    <div className={styles.rsvpCard}>
      <form onSubmit={handleSubmit} className={styles.rsvpForm}>
        <div className={styles.formGroup}>
          <input
            className={styles.formInput}
            placeholder="Your Name"
            required
            value={form.name}
            onChange={e => setForm({...form, name: e.target.value})}
          />
        </div>

        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input type="radio" name="attending" onChange={() => setForm({...form, attending: true})} checked={form.attending === true} />
            Joyfully Accepts
          </label>
          <label className={styles.radioLabel}>
            <input type="radio" name="attending" onChange={() => setForm({...form, attending: false})} checked={form.attending === false} />
            Regretfully Declines
          </label>
        </div>

        {form.attending && (
          <div className={styles.formGroup}>
            <input
              type="number"
              min="1"
              max="10"
              className={styles.formInput}
              placeholder="Number of Guests"
              value={form.guest_count}
              onChange={e => setForm({...form, guest_count: e.target.value})}
            />
          </div>
        )}

        <div className={styles.formGroup}>
          <textarea
            className={styles.formInput}
            placeholder="Message for the couple..."
            rows="3"
            value={form.message}
            onChange={e => setForm({...form, message: e.target.value})}
          />
        </div>

        <button type="submit" className={styles.primaryBtn} disabled={status === 'loading'} style={{width: '100%', justifyContent: 'center'}}>
          {status === 'loading' ? 'Sending...' : 'Send RSVP'}
        </button>
      </form>
    </div>
  );
}

// --- FIREFLIES BACKGROUND COMPONENT ---
function Fireflies() {
  // Generate 20 random particles
  const [particles, setParticles] = useState([]);
  
  useEffect(() => {
    // Math.random on client-side only to prevent hydration mismatch
    const pts = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${(i * 13) % 100}%`,
      xOffset: (i % 2 === 0 ? 30 : -30),
      duration: 5 + (i % 5),
      delay: i % 4,
    }));
    setParticles(pts);
  }, []);

  return (
    <div className={styles.particleOverlay}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: 'absolute',
            bottom: '-5%',
            left: p.left,
            width: '6px',
            height: '6px',
            background: '#D4AF37',
            borderRadius: '50%',
            filter: 'blur(1px) drop-shadow(0 0 8px #D4AF37)',
            opacity: 0.6,
          }}
          animate={{
            y: ['0vh', '-110vh'],
            x: [0, p.xOffset, 0],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: p.duration * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

// Ensure events match the required structure and provide fallbacks
const defaultEvents = [
  { name: 'Sacred Wedding', date: '2026-10-21', time: '10:30 AM', venue: 'Royal Palace Grounds' },
  { name: 'Grand Reception', date: '2026-10-21', time: '07:00 PM', venue: 'Grand Ballroom' }
];

const demoImages = [
  '/bg-couple-white.jpg',
  '/bg-couple-pink.jpg',
  '/bg-couple-textured.jpg',
  '/couple-white-gold.jpg'
];

export default function PremiumSouthIndianTemplate({ data, template, slug }) {
  const [playing, setPlaying] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const audioRef = useRef(null);

  // Robust audio management & cleanup
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.5;
    }
    
    // Cleanup: Ensure music stops when component unmounts (invitation closed)
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  // Page Visibility API to handle music when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!audioRef.current) return;
      if (document.hidden) {
        if (playing) audioRef.current.pause();
      } else {
        if (playing) audioRef.current.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [playing]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => console.log("Playback prevented by browser"));
    }
    setPlaying(!playing);
  };

  const handleScrollToRest = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    
    // Start music on first interaction (required by most browsers)
    if (audioRef.current && !playing) {
      audioRef.current.play().catch(() => console.log("Playback prevented by browser"));
      setPlaying(true);
    }
  };

  const getGoogleCalendarUrl = (ev) => {
    const title = encodeURIComponent(`${combinedNames} - ${ev.name}`);
    const details = encodeURIComponent(`We'd love to have you at our ${ev.name}!`);
    const location = encodeURIComponent(ev.venue);
    
    // Format date for Google Calendar: YYYYMMDDTHHMMSSZ
    const cleanDate = ev.date.replace(/-/g, '');
    const start = `${cleanDate}T090000`; // Default to 9 AM if no specific start time parse
    const end = `${cleanDate}T220000`;   // Default to 10 PM
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${start}/${end}`;
  };

  // Safe variables
  const groomName = data?.groom_name || template?.template_json?.couple_names?.groom || 'Vijay';
  const brideName = data?.bride_name || template?.template_json?.couple_names?.bride || 'Priya';
  const groomPhoto = data?.groom_photo || '/bg-couple-white.jpg';
  const events = (data?.events && data.events.length > 0) ? data.events : defaultEvents;
  
  // Custom copy enforcement
  const combinedNames = `${brideName} ❤️ ${groomName}`;

  return (
    <div className={styles.page}>
      
      {/* Background Audio */}
      {data && (
        <audio 
          ref={audioRef} 
          src={data.music_url || template?.template_json?.music_url || '/background-music.mp3'} 
          loop 
        />
      )}

      {/* Floating Elements Layers */}
      <Fireflies />

      {/* Music Toggle */}
      <button className={styles.musicBtn} onClick={toggleMusic} aria-label="Toggle Music">
        {playing ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>

      {/* HERO SECTION */}
      <section className={styles.hero}>
        <img src="/hero-garland.jpg" alt="Traditional Decor Background" className={styles.heroBg} />
        <div className={styles.heroOverlay} />
        
        <motion.div 
          className={styles.heroContent}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {data?.story_video_url && (
             <motion.img 
                variants={itemVariants}
                src="/decor-lotus.jpg" 
                alt="Lotus Decor" 
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', marginBottom: '1rem', border: '2px solid #D4AF37' }} 
             />
          )}
          <motion.h2 variants={itemVariants} className={styles.heroTopLabel}>With the blessings of God</motion.h2>
          
          <motion.h1 variants={itemVariants} className={styles.heroCoupleNames}>
            {groomName} <br/> <span style={{fontSize: '0.6em', color: '#8B1A1A'}}>&amp;</span> <br/> {brideName}
          </motion.h1>

          <motion.button variants={itemVariants} className={styles.heroScrollBtn} onClick={handleScrollToRest}>
            Open Invitation
          </motion.button>
        </motion.div>
      </section>



      {/* SAVE THE DATE SECTION */}
      <section className={styles.saveTheDate}>
        <div className={styles.saveTheDateOverlay} />
        <motion.div 
          className={styles.saveTheDateContent}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={revealVariants}
        >
          <span className={styles.sectionLabel} style={{ color: '#FDF8F0' }}>Are you ready?</span>
          <h2 className={styles.saveTheDateTitle}>Save Our Date</h2>
          <div className={styles.saveTheDateDivider} />
          <p className={styles.saveTheDateText}>
            {events[0]?.date || 'October 21, 2026'}
          </p>
          <p className={styles.saveTheDateSub}>The beginning of our forever</p>
          
          <div style={{ marginTop: '3rem' }}>
            <span className={styles.sectionLabel} style={{ color: '#FDF8F0', opacity: 0.8 }}>Countdown to the Big Day</span>
            <Countdown targetDate={events[0]?.date || '2026-10-21'} />
          </div>
        </motion.div>
      </section>

      {/* COUPLE SECTION */}
      <section className={styles.section}>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={revealVariants}
        >
          <div className={styles.coupleContainer}>
            <div className={styles.coupleImageWrapper}>
              <img src={groomPhoto} alt="The Couple" className={styles.coupleImage} />
            </div>
          </div>
          
          <h2 className={styles.coupleText}>
            {combinedNames}
          </h2>
          <p className={styles.sectionSubtitle} style={{ marginTop: '1.5rem', color: '#8B1A1A' }}>
            "Together with their families, invite you to celebrate their wedding"
          </p>
        </motion.div>
      </section>

      {/* INVITATION MESSAGE (Mid Parallax) */}
      <section className={styles.parallaxSection}>
        <div className={styles.parallaxOverlay} />
        <motion.div 
          className={styles.parallaxContent}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h3 className={styles.parallaxText}>
            We cordially invite you to grace this auspicious occasion with your presence and blessings.
          </h3>
        </motion.div>
      </section>

      {/* WEDDING DETAILS SECTION */}
      <section className={styles.section}>
        <motion.div
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           variants={revealVariants}
        >
          <h2 className={styles.sectionTitle}>Wedding Ceremonies</h2>
          <p className={styles.sectionSubtitle}>Join us in these sacred rituals</p>

          <motion.div 
            className={styles.eventsGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            {events.map((ev, idx) => (
              <motion.div key={idx} className={styles.eventCard} variants={itemVariants}>
                <h3 className={styles.eventName}>{ev.name}</h3>
                <div className={styles.eventDetailRow}>
                  <Calendar size={18} className={styles.eventIcon} />
                  <span>{ev.date}</span>
                </div>
                <div className={styles.eventDetailRow}>
                  <Clock size={18} className={styles.eventIcon} />
                  <span>{ev.time}</span>
                </div>
                <div className={styles.eventDetailRow}>
                  <MapPin size={18} className={styles.eventIcon} />
                  <span>{ev.venue}</span>
                </div>
                
                <a 
                  href={getGoogleCalendarUrl(ev)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.calendarLink}
                >
                  <Calendar size={14} /> Add to Calendar
                </a>
              </motion.div>
            ))}
          </motion.div>

          {/* JOIN US LIVE FEATURE */}
          <motion.div 
            className={styles.liveStreamCard}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className={styles.liveIndicator}>
              <span className={styles.liveDot} />
              LIVE STREAMING
            </div>
            <h3 className={styles.liveTitle}>Join Our Celebration Remotely</h3>
            <p className={styles.liveText}>For those who cannot join us in person, we'd love for you to be part of our divine union virtually.</p>
            <a href="https://youtube.com/live" target="_blank" rel="noopener noreferrer" className={styles.primaryBtn}>
              Join Us Live
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* OUR STORY VIDEO SECTION */}
      <section className={styles.section} style={{ background: '#1A0505', color: '#FDF8F0' }}>
        <motion.div
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 1 }}
        >
          <span className={styles.sectionLabel} style={{ color: '#D4AF37' }}>Our Cinema</span>
          <h2 className={styles.sectionTitle} style={{ color: '#FDF8F0' }}>Our Story Unfolds</h2>
          <div className={styles.videoContainer}>
            <div className={styles.videoWrapper}>
              <iframe
                src={getEmbedUrl(data?.story_video_url || 'https://www.youtube.com/watch?v=S08jO06iT7k')}
                title="Wedding Story Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </motion.div>
      </section>

      {/* GALLERY SECTION */}
      <section className={styles.section} style={{ background: '#FDF8F0' }}>
        <motion.div 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }}
          variants={revealVariants}
        >
          <h2 className={styles.sectionTitle}>Wedding Gallery</h2>
          <p className={styles.sectionSubtitle}>Captured moments of our love</p>

          <motion.div 
            className={styles.galleryGrid}
            variants={containerVariants}
          >
            {(data?.gallery?.length > 0 ? data.gallery : demoImages).map((img, i) => (
              <motion.div 
                key={i} 
                className={styles.galleryItem}
                variants={itemVariants}
                initial={{ opacity: 0, scale: 0.8, rotate: i % 2 === 0 ? -5 : 5 }}
                whileHover={{ rotate: 0, scale: 1.05, zIndex: 10, transition: { duration: 0.3 } }}
                onClick={() => setSelectedImage(img)}
              >
                <img src={img} alt={`Gallery ${i}`} className={styles.galleryImg} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            className={styles.lightbox}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <button className={styles.closeLightbox}>✕</button>
            <motion.img 
              src={selectedImage} 
              className={styles.lightboxImg}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* FORMAL RSVP SECTION */}
      <section className={styles.section} style={{ background: '#FFFBF5' }}>
        <motion.div
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           variants={revealVariants}
        >
          <h2 className={styles.sectionTitle}>Kindly RSVP</h2>
          <p className={styles.sectionSubtitle}>Please fulfill our hearts by responding by April 15, 2026</p>
          <RSVPForm slug={slug} />
        </motion.div>
      </section>

      {/* SHARE SECTION */}
      <section className={styles.rsvpSection}>
        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 1 }}
        >
          <img src="/decor-lotus.jpg" alt="Lotus" className={styles.rsvpDecor} style={{ borderRadius: '50%', border: '4px solid #D4AF37', width: '120px', height: '120px', objectFit: 'cover' }} />
          <h2 className={styles.sectionTitle}>Bless Us</h2>
          <p className={styles.sectionSubtitle} style={{ marginBottom: '2rem', fontSize: '1.2rem', color: '#8B1A1A' }}>
            Your presence is the greatest gift
          </p>

          {/* WhatsApp Share Button */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            <a 
              href={`https://wa.me/?text=${encodeURIComponent(`We invite you to our wedding! View the invitation here: https://kalyanamstudio.com/invite/${slug}`)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
            >
              <MessageSquare size={20} />
              Share on WhatsApp
            </a>
          </div>
          
          <div style={{ marginTop: '5rem', opacity: 0.6, fontSize: '0.8rem', letterSpacing: '3px', textTransform: 'uppercase' }}>
            Designed by KalyanamStudio • Premium Collection
          </div>
        </motion.div>
      </section>
      
    </div>
  );
}
