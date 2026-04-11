'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { TEMPLATES } from '@/lib/templates';
import { saveDraft } from '@/lib/localdb';
import styles from './page.module.css';
import {
  Plus, Trash2, Save, Eye, Share2,
  ChevronDown, ChevronUp, MapPin, Calendar,
  Clock, User, Heart, MessageSquare, Sparkles,
  Image as ImageIcon, X
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
  groom_photo: null,
  bride_photo: null,
  couple_photo: null,
  gallery: [], // Added for multi-image support
  story_video_url: '',
};

// Lightweight frontend base64 image compressor to solve Server Payload latencies
const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress cleanly into JPEG (reduces 5MB PNGs to ~150KB)
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
    };
  });
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
        const slug = `${form.groom_name || 'groom'}-weds-${form.bride_name || 'bride'}-demo`.toLowerCase().replace(/\s+/g, '-');
        try {
          await saveDraft(`invite_${slug}`, { ...form, template_id: templateId, slug });
          showToast(status === 'published' ? 'Published (Demo mode — set up Supabase for full features)' : 'Saved offline to IndexedDB!');
          if (status === 'published') {
            router.push(`/invite/${slug}`);
          }
        } catch (e) {
          showToast('Failed to save to local storage.', 'error');
          console.error(e);
        }
      }
    } catch (err) {
      showToast('Network error, could not save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setForm(f => ({ ...f, couple_photo: compressed }));
  };

  const handleIndividualPhotoUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const compressed = await compressImage(file);
    setForm(f => ({ ...f, [field]: compressed }));
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      const compressed = await compressImage(file);
      setForm(f => ({ ...f, gallery: [...(f.gallery || []), compressed] }));
    }
  };

  const removeGalleryPhoto = (idx) => {
    setForm(f => ({
      ...f,
      gallery: f.gallery.filter((_, i) => i !== idx)
    }));
  };

  const handleMusicUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(f => ({ ...f, music_url: reader.result }));
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
    { id: 'events', label: 'Schedule', icon: <Calendar size={16} /> },
    { id: 'venue', label: 'Venue', icon: <MapPin size={16} /> },
    { id: 'media', label: 'Photos & Music', icon: <ImageIcon size={16} /> },
    { id: 'extra', label: 'RSVP & Final', icon: <MessageSquare size={16} /> },
  ];

  return (
    <main className={styles.page}>
      <Navbar />

      <div className={styles.builderLayout}>
        {/* ===== CENTERED FORM PANEL ===== */}
        <div className={styles.formPanel}>
          <div className={styles.formPanelHeader}>
            <div className={styles.templateBadge}>
              <Sparkles size={13} />
              {template.name} — Luxury Builder
            </div>
            <div className="flex-between">
              <h1 className={styles.formPanelTitle}>Customise Your Invitation</h1>
              <button 
                className={styles.previewTabBtn} 
                onClick={async () => {
                  const slug = `demo-${templateId}`;
                  try {
                    await saveDraft(`invite_${slug}`, {...form, template_id: templateId});
                    window.open(`/invite/${slug}`, '_blank');
                  } catch (e) {
                    alert('Could not save draft to IndexedDB.');
                    console.error(e);
                  }
                }}
              >
                <Eye size={16} /> View Full Preview
              </button>
            </div>
          </div>

          {/* New Prominent Tab Navigation */}
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
            <AnimatePresence mode="wait">
              {activeSection === 'couple' && (
                <motion.div 
                  key="couple"
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <div className={styles.sectionTitle}>
                    <Heart size={20} className={styles.sectionTitleIcon} />
                    The Happy Couple
                  </div>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Groom&apos;s Full Name *</label>
                      <input
                        className="form-input"
                        placeholder="e.g. Arjun Reddy"
                        value={form.groom_name}
                        onChange={e => setForm(f => ({ ...f, groom_name: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Bride&apos;s Full Name *</label>
                      <input
                        className="form-input"
                        placeholder="e.g. Priya Sharma"
                        value={form.bride_name}
                        onChange={e => setForm(f => ({ ...f, bride_name: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Groom&apos;s Parents</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Mr. & Mrs. Suresh Reddy"
                      value={form.groom_parents}
                      onChange={e => setForm(f => ({ ...f, groom_parents: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bride&apos;s Parents</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Mr. & Mrs. Ramesh Sharma"
                      value={form.bride_parents}
                      onChange={e => setForm(f => ({ ...f, bride_parents: e.target.value }))}
                    />
                  </div>
                </motion.div>
              )}

              {activeSection === 'events' && (
                <motion.div 
                  key="events"
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <div className={styles.sectionTitle}>
                    <Calendar size={20} className={styles.sectionTitleIcon} />
                    Sacred Muhurt & Schedule
                  </div>
                  <EventSection
                    events={form.events}
                    onChange={events => setForm(f => ({ ...f, events }))}
                  />
                </motion.div>
              )}

              {activeSection === 'venue' && (
                <motion.div 
                   key="venue"
                   initial={{ opacity: 0, x: -10 }} 
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 10 }}
                >
                  <div className={styles.sectionTitle}>
                    <MapPin size={20} className={styles.sectionTitleIcon} />
                    Venue Location
                  </div>
                  <div className="form-group">
                    <label className="form-label">Full Address</label>
                    <textarea
                      className="form-input form-textarea"
                      placeholder="Complete venue address for your guests"
                      value={form.address}
                      onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Global Venue Map Link</label>
                    <input
                      className="form-input"
                      placeholder="https://maps.google.com/..."
                      value={form.maps_link}
                      onChange={e => setForm(f => ({ ...f, maps_link: e.target.value }))}
                    />
                  </div>
                </motion.div>
              )}

              {activeSection === 'media' && (
                <motion.div 
                  key="media"
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <div className={styles.sectionTitle}>
                    <ImageIcon size={20} className={styles.sectionTitleIcon} />
                    Photos & Story Music
                  </div>
                  
                  {/* HERO PHOTO */}
                  <div className={styles.heroUpload}>
                     <div className={styles.heroPreview}>
                        {form.couple_photo ? (
                          <img src={form.couple_photo} alt="Couple" />
                        ) : (
                          <div style={{background: '#f0e0d0', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            📷
                          </div>
                        )}
                     </div>
                     <div className={styles.heroInfo}>
                        <h4>Main Couple Photo</h4>
                        <p>This appears prominently in the &quot;Our Story&quot; section.</p>
                        <label className="btn btn-secondary" style={{display: 'inline-block', fontSize: '0.75rem', cursor: 'pointer'}}>
                           Upload Photo
                           <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        </label>
                        {form.couple_photo && (
                          <button className="btn btn-link" onClick={() => setForm(f => ({...f, couple_photo: null}))} style={{color: '#C62828', marginLeft: 15, fontSize: '0.75rem'}}>
                            Remove
                          </button>
                        )}
                     </div>
                  </div>

                  {/* BRIDE & GROOM PHOTOS (INDIVIDUAL) */}
                  <div className="grid-2" style={{ marginTop: '2rem' }}>
                    <div className={styles.heroUpload} style={{ flexDirection: 'column', textAlign: 'center', padding: '1rem' }}>
                      <div className={styles.heroPreview} style={{ width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 1rem' }}>
                        {form.groom_photo ? (
                          <img src={form.groom_photo} alt="Groom" style={{ borderRadius: '50%' }} />
                        ) : (
                          <div style={{background: '#f0e0d0', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%'}}>
                            🤵
                          </div>
                        )}
                      </div>
                      <div className={styles.heroInfo} style={{ padding: 0 }}>
                        <h4 style={{ fontSize: '0.9rem' }}>Groom Portrait</h4>
                        <label className="btn btn-secondary" style={{display: 'inline-block', fontSize: '0.75rem', cursor: 'pointer', marginTop: '0.5rem'}}>
                           Upload
                           <input type="file" accept="image/*" className="hidden" onChange={e => handleIndividualPhotoUpload(e, 'groom_photo')} />
                        </label>
                        {form.groom_photo && (
                          <div style={{marginTop: '0.5rem'}}>
                            <button className="btn btn-link" onClick={() => setForm(f => ({...f, groom_photo: null}))} style={{color: '#C62828', fontSize: '0.75rem'}}>
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.heroUpload} style={{ flexDirection: 'column', textAlign: 'center', padding: '1rem' }}>
                      <div className={styles.heroPreview} style={{ width: '100px', height: '100px', borderRadius: '50%', margin: '0 auto 1rem' }}>
                        {form.bride_photo ? (
                          <img src={form.bride_photo} alt="Bride" style={{ borderRadius: '50%' }} />
                        ) : (
                          <div style={{background: '#f0e0d0', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%'}}>
                            👰
                          </div>
                        )}
                      </div>
                      <div className={styles.heroInfo} style={{ padding: 0 }}>
                        <h4 style={{ fontSize: '0.9rem' }}>Bride Portrait</h4>
                        <label className="btn btn-secondary" style={{display: 'inline-block', fontSize: '0.75rem', cursor: 'pointer', marginTop: '0.5rem'}}>
                           Upload
                           <input type="file" accept="image/*" className="hidden" onChange={e => handleIndividualPhotoUpload(e, 'bride_photo')} />
                        </label>
                        {form.bride_photo && (
                          <div style={{marginTop: '0.5rem'}}>
                            <button className="btn btn-link" onClick={() => setForm(f => ({...f, bride_photo: null}))} style={{color: '#C62828', fontSize: '0.75rem'}}>
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* GALLERY SECTION */}
                  <div className="form-group">
                    <label className="form-label">Photo Gallary (Multi-upload)</label>
                    <div className={styles.mediaGrid}>
                       {form.gallery?.map((img, i) => (
                         <div key={i} className={styles.previewBox}>
                            <img src={img} alt={`Gallery ${i}`} />
                            <button className={styles.removeImgBtn} onClick={() => removeGalleryPhoto(i)}>
                               <X size={14} />
                            </button>
                         </div>
                       ))}
                       <label className={styles.photoUploadBox}>
                          <input type="file" multiple accept="image/*" className="hidden" onChange={handleGalleryUpload} />
                          <Plus size={18} className={styles.uploadIcon} />
                          <span className={styles.uploadLabel}>Add Photo</span>
                       </label>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: '2rem' }}>
                    <label className="form-label">Story Video URL (YouTube Embed)</label>
                    <input
                      className="form-input"
                      placeholder="e.g. https://www.youtube.com/embed/..."
                      value={form.story_video_url}
                      onChange={e => setForm(f => ({ ...f, story_video_url: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Background Music (MP3 Upload)</label>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                      <label className="btn btn-secondary" style={{cursor: 'pointer'}}>
                         Upload MP3
                         <input type="file" accept="audio/mpeg, audio/mp3, audio/*" className="hidden" onChange={handleMusicUpload} />
                      </label>
                      {form.music_url && form.music_url.length > 500 && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--gold)' }}>✓ Custom Audio Attached</span>
                      )}
                      {!form.music_url || form.music_url.length <= 500 ? (
                        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Using Template Default Music</span>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeSection === 'extra' && (
                <motion.div 
                  key="extra"
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <div className={styles.sectionTitle}>
                    <MessageSquare size={20} className={styles.sectionTitleIcon} />
                    RSVP & Final Touches
                  </div>
                  <div className="form-group">
                    <label className="form-label">Personal Message</label>
                    <textarea
                      className="form-input form-textarea"
                      placeholder="A personal invitation message to your friends..."
                      value={form.custom_message}
                      onChange={e => setForm(f => ({ ...f, custom_message: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dress Code / Theme</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Traditional Wedding Attire"
                      value={form.dress_code}
                      onChange={e => setForm(f => ({ ...f, dress_code: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">RSVP WhatsApp Number</label>
                    <input
                      className="form-input"
                      placeholder="e.g. +91 93583 56885"
                      value={form.rsvp_contact}
                      onChange={e => setForm(f => ({ ...f, rsvp_contact: e.target.value }))}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Centered Actions */}
          <div className={styles.formActions}>
            <button
              className={`btn btn-secondary ${styles.actionBtn}`}
              onClick={() => saveInvitation('draft')}
              disabled={saving}
            >
              <Save size={18} />
              Save Progress
            </button>
            <button
              className={`btn btn-primary ${styles.actionBtn}`}
              onClick={() => saveInvitation('published')}
              disabled={saving || !form.groom_name || !form.bride_name}
              style={{ background: '#800000', borderColor: '#800000' }}
            >
              <Share2 size={18} />
              {saving ? 'Publishing...' : 'Finalize & Share'}
            </button>
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
