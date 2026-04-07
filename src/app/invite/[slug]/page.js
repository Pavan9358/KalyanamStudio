'use client';
import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { TEMPLATES } from '@/lib/templates';
import styles from './page.module.css';
import { MapPin, Clock, Calendar, Share2, Check, Loader2, Heart, ChevronDown } from 'lucide-react';

function Countdown({ targetDate }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const target = new Date(targetDate + 'T00:00:00');
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
        <div key={label} className={styles.countdownUnit}>
          <span className={styles.countdownNum}>{String(val).padStart(2, '0')}</span>
          <span className={styles.countdownLabel}>{label}</span>
        </div>
      ))}
    </div>
  );
}

function RSVPForm({ invitationId, rsvpContact, primaryColor }) {
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
        body: JSON.stringify({ ...form, invitation_id: invitationId }),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      // Demo mode: just show success
      setStatus('success');
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={styles.rsvpSuccess}
      >
        <div className={styles.rsvpSuccessIcon} style={{ background: primaryColor }}>
          <Check size={28} />
        </div>
        <h3 className={styles.rsvpSuccessTitle}>RSVP Confirmed!</h3>
        <p className={styles.rsvpSuccessText}>
          Thank you, {form.name}! {form.attending ? "We can't wait to celebrate with you! 🎉" : "We'll miss you at the celebration."}
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.rsvpForm}>
      <div className="form-group">
        <label className="form-label">Your Full Name *</label>
        <input
          className="form-input"
          placeholder="Enter your name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
      </div>

      <div className={styles.attendingGroup}>
        <label className="form-label">Will you be joining? *</label>
        <div className={styles.attendingBtns}>
          <button
            type="button"
            className={`${styles.attendBtn} ${form.attending === true ? styles.attendBtnYes : ''}`}
            onClick={() => setForm(f => ({ ...f, attending: true }))}
            style={form.attending === true ? { background: primaryColor } : {}}
          >
            🎉 Yes, I'll be there!
          </button>
          <button
            type="button"
            className={`${styles.attendBtn} ${form.attending === false ? styles.attendBtnNo : ''}`}
            onClick={() => setForm(f => ({ ...f, attending: false }))}
          >
            😔 Sorry, I can't make it
          </button>
        </div>
      </div>

      {form.attending && (
        <div className="form-group">
          <label className="form-label">Number of Guests</label>
          <select
            className="form-input"
            value={form.guest_count}
            onChange={e => setForm(f => ({ ...f, guest_count: Number(e.target.value) }))}
          >
            {[1,2,3,4,5].map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Message (Optional)</label>
        <textarea
          className="form-input form-textarea"
          placeholder="Send your wishes to the couple..."
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
        />
      </div>

      <button
        type="submit"
        className={`btn btn-primary ${styles.rsvpSubmitBtn}`}
        disabled={!form.name || form.attending === null || status === 'loading'}
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
      >
        {status === 'loading' ? <Loader2 size={18} className={styles.spinIcon} /> : <Heart size={16} />}
        Submit RSVP
      </button>
    </form>
  );
}

export default function PublicInvitePage({ params }) {
  const { slug } = use(params);
  const [invitation, setInvitation] = useState(null);
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        // Try API first
        const res = await fetch(`/api/invite/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setInvitation(data.invitation.data_json);
          const t = TEMPLATES.find(t => t.id === data.invitation.template_id) || TEMPLATES[0];
          setTemplate(t);
        } else {
          throw new Error('not found');
        }
      } catch {
        // Fallback to localStorage demo
        const local = localStorage.getItem(`invite_${slug}`);
        if (local) {
          const parsed = JSON.parse(local);
          setInvitation(parsed);
          const t = TEMPLATES.find(t => t.id === parsed.template_id) || TEMPLATES[0];
          setTemplate(t);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `You're invited to ${invitation?.groom_name} & ${invitation?.bride_name}'s wedding! 🎊\n\n${window.location.href}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingOrn}>🪷</div>
        <div className={styles.loadingText}>Opening your invitation...</div>
        <div className="spinner" />
      </div>
    );
  }

  if (!invitation || !template) {
    return (
      <div className={styles.notFound}>
        <div className={styles.nfIcon}>💌</div>
        <h2>Invitation not found</h2>
        <p>This invitation link may have expired or been removed.</p>
        <a href="/" className="btn btn-primary">Create Your Own Invitation</a>
      </div>
    );
  }

  const tc = template.colors;
  const primaryEvent = invitation.events?.find(e => e.name?.toLowerCase().includes('wedding')) || invitation.events?.[0];

  return (
    <div className={styles.page}>
      {/* ===== ENVELOPE OPENER ===== */}
      {!opened && (
        <motion.div
          className={styles.envelope}
          style={{ background: tc.primary }}
          exit={{ opacity: 0, scale: 1.2 }}
        >
          <div className={styles.envelopeBg} />
          <div className={styles.envelopeContent}>
            <div className={styles.envelopeOrn}>🪷</div>
            <h1 className={styles.envelopeTitle} style={{ color: tc.secondary }}>
              You're Invited
            </h1>
            <p className={styles.envelopeNames}>{invitation.groom_name} &amp; {invitation.bride_name}</p>
            <p className={styles.envelopeText}>cordially invite you to celebrate their wedding</p>
            <motion.button
              className={styles.openBtn}
              style={{ background: tc.secondary, color: tc.primary }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setOpened(true)}
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              Open Invitation ✦
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ===== FULL INVITATION ===== */}
      {opened && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className={styles.invitation}
          style={{ background: tc.bg, color: tc.text }}
        >
          {/* HEADER */}
          <div className={styles.invHeader} style={{ background: tc.primary }}>
            <div className={styles.invHeaderOrn}>✦ ✦ ✦</div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={styles.invNames}
              style={{ color: tc.secondary }}
            >
              {invitation.groom_name}
              <br />
              <span className={styles.invAmpersand}>&amp;</span>
              <br />
              {invitation.bride_name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={styles.invSubtitle}
            >
              Together with their families
            </motion.p>
            {invitation.couple_photo && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={styles.invPhotoWrapper}
              >
                <img src={invitation.couple_photo} alt="Couple" className={styles.invPhoto} style={{ borderColor: tc.secondary + '80' }} />
              </motion.div>
            )}
          </div>

          {/* COUNTDOWN */}
          {primaryEvent?.date && (
            <div className={styles.invSection} style={{ background: tc.primary + '10' }}>
              <div className={styles.invSectionLabel} style={{ color: tc.primary }}>
                Counting down to the Muhurtham
              </div>
              <Countdown targetDate={primaryEvent.date} />
            </div>
          )}

          {/* EVENTS TIMELINE */}
          <div className={styles.invSection}>
            <h2 className={styles.invSectionTitle} style={{ color: tc.primary }}>
              ✦ Events ✦
            </h2>
            <div className={styles.timeline}>
              {invitation.events?.filter(e => e.name).map((ev, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={styles.timelineEvent}
                >
                  <div className={styles.timelineDot} style={{ background: tc.primary, borderColor: tc.secondary + '60' }} />
                  <div className={styles.timelineContent}>
                    <h3 className={styles.timelineEventName} style={{ color: tc.primary }}>
                      {ev.name}
                    </h3>
                    {ev.date && (
                      <p className={styles.timelineDate}>
                        <Calendar size={13} /> {formatDate(ev.date)}
                      </p>
                    )}
                    {ev.time && (
                      <p className={styles.timelineMeta}>
                        <Clock size={13} /> {ev.time} IST
                      </p>
                    )}
                    {ev.venue && (
                      <p className={styles.timelineMeta}>
                        <MapPin size={13} /> {ev.venue}
                      </p>
                    )}
                    {ev.venue_link && (
                      <a href={ev.venue_link} target="_blank" rel="noopener noreferrer"
                        className={styles.mapsLink} style={{ color: tc.primary }}>
                        📍 Get Directions
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* ADDRESS */}
          {invitation.address && (
            <div className={styles.invSection} style={{ borderTop: `1px solid ${tc.primary}20` }}>
              <h2 className={styles.invSectionTitle} style={{ color: tc.primary }}>✦ Venue ✦</h2>
              <div className={styles.venueBlock}>
                <MapPin size={18} style={{ color: tc.primary }} />
                <p className={styles.venueAddress}>{invitation.address}</p>
              </div>
              {invitation.maps_link && (
                <a href={invitation.maps_link} target="_blank" rel="noopener noreferrer"
                  className="btn btn-maroon" style={{ display: 'inline-flex', marginTop: 14 }}>
                  📍 Open in Google Maps
                </a>
              )}
            </div>
          )}

          {/* CUSTOM MESSAGE */}
          {invitation.custom_message && (
            <div className={styles.invSection}>
              <div className={styles.messageBlock} style={{ borderColor: tc.secondary }}>
                <div className={styles.messageOrn} style={{ color: tc.secondary }}>❝</div>
                <p className={styles.messageText}>{invitation.custom_message}</p>
              </div>
            </div>
          )}

          {/* DRESS CODE */}
          {invitation.dress_code && (
            <div className={styles.dressCode} style={{ background: tc.primary + '08', borderColor: tc.primary + '20' }}>
              👗 <strong>Dress Code:</strong> {invitation.dress_code}
            </div>
          )}

          {/* PARENTS */}
          {(invitation.groom_parents || invitation.bride_parents) && (
            <div className={styles.invSection} style={{ textAlign: 'center', background: tc.primary + '06' }}>
              <div className={styles.invSectionLabel} style={{ color: tc.primary }}>With blessings from</div>
              {invitation.groom_parents && <p className={styles.parentName}>{invitation.groom_parents}</p>}
              {invitation.bride_parents && <p className={styles.parentName}>{invitation.bride_parents}</p>}
            </div>
          )}

          {/* RSVP */}
          <div className={styles.invSection}>
            <h2 className={styles.invSectionTitle} style={{ color: tc.primary }}>✦ RSVP ✦</h2>
            <p className={styles.rsvpIntro}>
              Please let us know if you'll be joining the celebration — your response means the world to us.
            </p>
            <RSVPForm
              invitationId={slug}
              rsvpContact={invitation.rsvp_contact}
              primaryColor={tc.primary}
            />
          </div>

          {/* SHARE */}
          <div className={styles.shareSection}>
            <p className={styles.shareTitle}>Share this invitation</p>
            <div className={styles.shareBtns}>
              <button className={styles.shareBtn} onClick={copyLink} style={{ background: tc.primary + '15', color: tc.primary }}>
                {copied ? <Check size={16} /> : <Share2 size={16} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button
                className={`${styles.shareBtn} ${styles.whatsappBtn}`}
                onClick={shareWhatsApp}
              >
                <span>📱</span> Share on WhatsApp
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.invFooter}>
            <div className={styles.footerOrn} style={{ color: tc.secondary }}>꧁ ✦ ꧂</div>
            <p className={styles.footerCredit}>
              Created with <Heart size={12} className={styles.heartPink} /> on{' '}
              <a href="/" className={styles.ksLink} style={{ color: tc.primary }}>KalyanamStudio</a>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
