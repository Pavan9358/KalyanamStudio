'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { TEMPLATES } from '@/lib/templates';
import styles from './page.module.css';
import {
  Plus, Trash2, Save, Eye, Share2,
  ChevronDown, ChevronUp, MapPin, Calendar,
  Clock, User, Heart, MessageSquare, Sparkles
} from 'lucide-react';

const DEFAULT_FORM = {
  groom_name: '',
  bride_name: '',
  groom_parents: '',
  bride_parents: '',
  events: [
    { name: 'Wedding Ceremony', date: '', time: '10:00', venue: '', venue_link: '' },
  ],
  address: '',
  maps_link: '',
  custom_message: '',
  dress_code: '',
  rsvp_contact: '',
  couple_photo: null,
};

function EventSection({ events, onChange }) {
  const addEvent = () => {
    onChange([...events, { name: '', date: '', time: '', venue: '', venue_link: '' }]);
  };
  const remove = (i) => onChange(events.filter((_, idx) => idx !== i));
  const update = (i, field, val) => {
    const updated = [...events];
    updated[i] = { ...updated[i], [field]: val };
    onChange(updated);
  };

  return (
    <div className={styles.eventsContainer}>
      {events.map((ev, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.eventCard}
        >
          <div className={styles.eventCardHeader}>
            <Calendar size={16} className={styles.eventIcon} />
            <span className={styles.eventLabel}>Event {i + 1}</span>
            {events.length > 1 && (
              <button className={styles.removeBtn} onClick={() => remove(i)}>
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <div className={styles.eventGrid}>
            <div className="form-group">
              <label className="form-label">Event Name</label>
              <input
                className="form-input"
                placeholder="e.g. Wedding, Haldi, Reception"
                value={ev.name}
                onChange={e => update(i, 'name', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                className="form-input"
                type="date"
                value={ev.date}
                onChange={e => update(i, 'date', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input
                className="form-input"
                type="time"
                value={ev.time}
                onChange={e => update(i, 'time', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Venue</label>
              <input
                className="form-input"
                placeholder="Venue name & hall"
                value={ev.venue}
                onChange={e => update(i, 'venue', e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Google Maps Link</label>
            <input
              className="form-input"
              placeholder="https://maps.google.com/..."
              value={ev.venue_link}
              onChange={e => update(i, 'venue_link', e.target.value)}
            />
          </div>
        </motion.div>
      ))}
      <button className={styles.addEventBtn} onClick={addEvent}>
        <Plus size={16} />
        Add Another Event
      </button>
    </div>
  );
}

function LivePreview({ template, form }) {
  const t = template;
  if (!t) return null;

  const formatDate = (d) => {
    if (!d) return 'Date to be announced';
    return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const primaryEvent = form.events?.[0];

  return (
    <div
      className={styles.preview}
      style={{ background: t.colors?.bg || '#FFF5E1' }}
    >
      {/* Header band */}
      <div
        className={styles.previewHeader}
        style={{ background: t.colors?.primary }}
      >
        <div className={styles.previewOrnTop}>✦ ✦ ✦</div>
        <p className={styles.previewGreeting}>
          {t.template_json?.subtitle || 'Together with their families'}
        </p>
        <h2
          className={styles.previewNames}
          style={{ color: t.colors?.secondary }}
        >
          {form.groom_name || 'Groom Name'}
          <span className={styles.previewAmpersand}> &amp; </span>
          {form.bride_name || 'Bride Name'}
        </h2>
        <p className={styles.previewInviteText}>
          joyfully invite you to their wedding celebration
        </p>
        {form.couple_photo && (
          <div className={styles.previewPhotoWrapper}>
            <img src={form.couple_photo} alt="Couple" className={styles.previewPhoto} />
          </div>
        )}
      </div>

      {/* Events */}
      <div className={styles.previewBody}>
        <div className={styles.previewDivider}>
          <span>♦</span>
        </div>

        {form.events?.filter(e => e.name || e.date).map((ev, i) => (
          <div key={i} className={styles.previewEvent}>
            <div
              className={styles.previewEventDot}
              style={{ background: t.colors?.primary }}
            />
            <div className={styles.previewEventInfo}>
              <h4
                className={styles.previewEventName}
                style={{ color: t.colors?.primary }}
              >
                {ev.name || 'Event'}
              </h4>
              {ev.date && (
                <p className={styles.previewEventDate}>
                  📅 {formatDate(ev.date)}
                </p>
              )}
              {ev.time && (
                <p className={styles.previewEventMeta}>
                  🕐 {ev.time} IST
                </p>
              )}
              {ev.venue && (
                <p className={styles.previewEventMeta}>
                  📍 {ev.venue}
                </p>
              )}
            </div>
          </div>
        ))}

        {form.address && (
          <div className={styles.previewAddress}>
            <MapPin size={14} style={{ flexShrink: 0, color: t.colors?.primary }} />
            <span>{form.address}</span>
          </div>
        )}

        {form.custom_message && (
          <div
            className={styles.previewMessage}
            style={{ borderColor: t.colors?.secondary }}
          >
            <p>{form.custom_message}</p>
          </div>
        )}

        {form.dress_code && (
          <div className={styles.previewDressCode}>
            👗 Dress Code: <strong>{form.dress_code}</strong>
          </div>
        )}

        {(form.groom_parents || form.bride_parents) && (
          <div className={styles.previewParents}>
            <div className={styles.previewDivider}><span>♦</span></div>
            <p className={styles.previewParentsLabel}>Blessed by</p>
            {form.groom_parents && <p className={styles.previewParent}>{form.groom_parents}</p>}
            {form.bride_parents && <p className={styles.previewParent}>{form.bride_parents}</p>}
          </div>
        )}

        <div className={styles.previewFooter}>
          <div className={styles.previewOrnBottom}>꧁ ✦ ꧂</div>
          <p className={styles.previewFooterText}>
            With blessings & love
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BuilderPage({ params }) {
  const { templateId } = use(params);
  const router = useRouter();
  const template = TEMPLATES.find(t => t.id === templateId);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeSection, setActiveSection] = useState('couple');

  useEffect(() => {
    const token = localStorage.getItem('ks_token');
    if (!token) {
      router.push('/auth?mode=signup');
      return;
    }

    // Check for edit mode
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');

    if (editId) {
      const fetchInvitation = async () => {
        try {
          const res = await fetch(`/api/invitations/${editId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.invitation && data.invitation.data_json) {
              setForm(data.invitation.data_json);
            }
          }
        } catch (err) {
          console.error('Failed to fetch invitation for edit:', err);
        }
      };
      fetchInvitation();
    }
  }, [router]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveInvitation = async (status = 'draft') => {
    setSaving(true);
    const token = localStorage.getItem('ks_token');

    // Try to save to API if Supabase is configured
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          template_id: templateId,
          data_json: { ...form, template_id: templateId },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showToast(status === 'published'
          ? 'Invitation published! Sharing link ready.'
          : 'Draft saved!');
        if (status === 'published') {
          router.push(`/invite/${data.invitation.slug}`);
        }
      } else {
        // Fallback to localStorage demo mode
        const slug = `${form.groom_name || 'groom'}-weds-${form.bride_name || 'bride'}-demo`.toLowerCase().replace(/\s+/g, '-');
        localStorage.setItem(`invite_${slug}`, JSON.stringify({ ...form, template_id: templateId, slug }));
        showToast(status === 'published' ? 'Published (Demo mode — set up Supabase for full features)' : 'Saved to local draft!');
        if (status === 'published') {
          router.push(`/invite/${slug}`);
        }
      }
    } catch {
      showToast('Saved locally (offline mode)', 'success');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(f => ({ ...f, couple_photo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  if (!template) {
    return (
      <div className={styles.notFound}>
        <Navbar />
        <div className={styles.notFoundContent}>
          <h2>Template not found</h2>
          <a href="/templates" className="btn btn-primary">Browse Templates</a>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'couple', label: 'Couple Details', icon: <Heart size={16} /> },
    { id: 'events', label: 'Events', icon: <Calendar size={16} /> },
    { id: 'venue', label: 'Venue', icon: <MapPin size={16} /> },
    { id: 'extra', label: 'Extra Details', icon: <MessageSquare size={16} /> },
    { id: 'media', label: 'Photo', icon: <User size={16} /> },
  ];

  return (
    <main className={styles.page}>
      <Navbar />

      <div className={styles.builderLayout}>
        {/* ===== LEFT: FORM PANEL ===== */}
        <div className={styles.formPanel}>
          <div className={styles.formPanelHeader}>
            <div className={styles.templateBadge}>
              <Sparkles size={13} />
              {template.name}
            </div>
            <h1 className={styles.formPanelTitle}>Customise Your Invite</h1>
          </div>

          {/* Section nav */}
          <div className={styles.sectionNav}>
            {sections.map(s => (
              <button
                key={s.id}
                className={`${styles.sectionNavBtn} ${activeSection === s.id ? styles.sectionNavBtnActive : ''}`}
                onClick={() => setActiveSection(s.id)}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>

          <div className={styles.formBody}>
            {/* COUPLE */}
            {activeSection === 'couple' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className={styles.sectionTitle}>
                  <Heart size={18} className={styles.sectionTitleIcon} />
                  Couple Details
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Groom's Full Name *</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Arjun Reddy"
                      value={form.groom_name}
                      onChange={e => setForm(f => ({ ...f, groom_name: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bride's Full Name *</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Priya Sharma"
                      value={form.bride_name}
                      onChange={e => setForm(f => ({ ...f, bride_name: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Groom's Parents</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Mr. & Mrs. Suresh Reddy"
                    value={form.groom_parents}
                    onChange={e => setForm(f => ({ ...f, groom_parents: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Bride's Parents</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Mr. & Mrs. Ramesh Sharma"
                    value={form.bride_parents}
                    onChange={e => setForm(f => ({ ...f, bride_parents: e.target.value }))}
                  />
                </div>
              </motion.div>
            )}

            {/* EVENTS */}
            {activeSection === 'events' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className={styles.sectionTitle}>
                  <Calendar size={18} className={styles.sectionTitleIcon} />
                  Events & Schedule
                </div>
                <EventSection
                  events={form.events}
                  onChange={events => setForm(f => ({ ...f, events }))}
                />
              </motion.div>
            )}

            {/* VENUE */}
            {activeSection === 'venue' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className={styles.sectionTitle}>
                  <MapPin size={18} className={styles.sectionTitleIcon} />
                  Venue Details
                </div>
                <div className="form-group">
                  <label className="form-label">Full Address</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Complete venue address"
                    value={form.address}
                    onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Google Maps Link</label>
                  <input
                    className="form-input"
                    placeholder="https://maps.google.com/..."
                    value={form.maps_link}
                    onChange={e => setForm(f => ({ ...f, maps_link: e.target.value }))}
                  />
                </div>
              </motion.div>
            )}

            {/* EXTRA */}
            {activeSection === 'extra' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className={styles.sectionTitle}>
                  <MessageSquare size={18} className={styles.sectionTitleIcon} />
                  Extra Details
                </div>
                <div className="form-group">
                  <label className="form-label">Custom Message</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="A personal note to your guests..."
                    value={form.custom_message}
                    onChange={e => setForm(f => ({ ...f, custom_message: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Dress Code</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Traditional South Indian Attire"
                    value={form.dress_code}
                    onChange={e => setForm(f => ({ ...f, dress_code: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">RSVP Contact (Phone/Email)</label>
                  <input
                    className="form-input"
                    placeholder="e.g. +91 98765 43210"
                    value={form.rsvp_contact}
                    onChange={e => setForm(f => ({ ...f, rsvp_contact: e.target.value }))}
                  />
                </div>
              </motion.div>
            )}

            {/* MEDIA */}
            {activeSection === 'media' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className={styles.sectionTitle}>
                  <User size={18} className={styles.sectionTitleIcon} />
                  Couple Photo
                </div>
                <div className={styles.photoUpload}>
                  {form.couple_photo ? (
                    <div className={styles.photoPreview}>
                      <img src={form.couple_photo} alt="Couple" />
                      <button
                        className={styles.removePhotoBtn}
                        onClick={() => setForm(f => ({ ...f, couple_photo: null }))}
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  ) : (
                    <label className={styles.photoUploadLabel}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className={styles.photoInput}
                      />
                      <div className={styles.uploadContent}>
                        <div className={styles.uploadIcon}>📷</div>
                        <p className={styles.uploadText}>Click to upload couple photo</p>
                        <p className={styles.uploadHint}>JPG, PNG — max 5MB recommended</p>
                      </div>
                    </label>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Action buttons */}
          <div className={styles.formActions}>
            <button
              className={`btn btn-secondary ${styles.actionBtn}`}
              onClick={() => saveInvitation('draft')}
              disabled={saving}
            >
              <Save size={16} />
              Save Draft
            </button>
            <button
              className={`btn btn-primary ${styles.actionBtn}`}
              onClick={() => saveInvitation('published')}
              disabled={saving || !form.groom_name || !form.bride_name}
            >
              <Share2 size={16} />
              {saving ? 'Publishing...' : 'Publish & Share'}
            </button>
          </div>
        </div>

        {/* ===== RIGHT: LIVE PREVIEW ===== */}
        <div className={styles.previewPanel}>
          <div className={styles.previewHeader}>
            <div className={styles.previewHeaderLabel}>
              <Eye size={15} />
              Live Preview
            </div>
            <div className={styles.previewDevice}>
              <div className={styles.previewDeviceNotch} />
              <div className={styles.previewDeviceScreen}>
                <LivePreview template={template} form={form} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`toast toast-${toast.type}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
