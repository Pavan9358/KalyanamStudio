'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { TEMPLATES } from '@/lib/templates';
import styles from './page.module.css';
import {
  Plus, Sparkles, Share2, Edit3, Trash2, Eye,
  Copy, Check, Users, FileText, BarChart2, X, MessageCircle
} from 'lucide-react';

function RSVPModal({ invitation, onClose }) {
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRSVPs = async () => {
      try {
        const res = await fetch(`/api/rsvp?invitation_id=${invitation.slug}`);
        if (res.ok) {
          const data = await res.json();
          setRsvps(data.rsvps || []);
        }
      } catch (err) {
        console.error('Failed to fetch RSVPs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRSVPs();
  }, [invitation.slug]);

  const stats = {
    total: rsvps.length,
    attending: rsvps.filter(r => r.attending).length,
    guests: rsvps.filter(r => r.attending).reduce((acc, r) => acc + (r.guest_count || 1), 0),
    notAttending: rsvps.filter(r => !r.attending).length
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <motion.div
        className={styles.modalContent}
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
      >
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>RSVP Responses</h2>
            <p className={styles.modalSubtitle}>{invitation.data_json.groom_name} & {invitation.data_json.bride_name}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>

        <div className={styles.rsvpStats}>
          <div className={styles.statItem}>
            <span className={styles.statVal}>{stats.attending}</span>
            <span className={styles.statLabel}>Attending</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statVal}>{stats.guests}</span>
            <span className={styles.statLabel}>Total Guests</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statVal}>{stats.notAttending}</span>
            <span className={styles.statLabel}>Declined</span>
          </div>
        </div>

        <div className={styles.rsvpList}>
          {loading ? (
            <div className={styles.modalLoader}><div className="spinner" /></div>
          ) : rsvps.length === 0 ? (
            <div className={styles.noRsvps}>No RSVP responses yet. Share your link to collect them!</div>
          ) : (
            rsvps.map((rsvp, i) => (
              <div key={i} className={styles.rsvpRow}>
                <div className={styles.rsvpInfo}>
                  <div className={styles.rsvpName}>
                    {rsvp.guest_name}
                    <span className={rsvp.attending ? styles.badgeYes : styles.badgeNo}>
                      {rsvp.attending ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {rsvp.attending && <div className={styles.rsvpGuestCount}>{rsvp.guest_count} guests</div>}
                </div>
                {rsvp.message && (
                  <div className={styles.rsvpMessage}>
                    <MessageCircle size={14} />
                    {rsvp.message}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [viewingRSVPs, setViewingRSVPs] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('ks_token');
    const userData = localStorage.getItem('ks_user');
    if (!token) {
      router.push('/auth');
      return;
    }
    if (userData) setUser(JSON.parse(userData));

    const fetchInvitations = async () => {
      try {
        const res = await fetch('/api/invitations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setInvitations(data.invitations || []);
        }
      } catch {
        // Demo mode: show empty state
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [router]);

  const copyLink = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${slug}`);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteInvitation = async (id) => {
    if (!confirm('Delete this invitation? This cannot be undone.')) return;
    const token = localStorage.getItem('ks_token');
    await fetch(`/api/invitations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setInvitations(prev => prev.filter(inv => inv.id !== id));
  };

  const greeting = user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Welcome back';

  return (
    <main className={styles.page}>
      <Navbar />

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarUser}>
            <div className={styles.userAvatar}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className={styles.userName}>{user?.name || 'User'}</div>
              <div className={styles.userEmail}>{user?.email}</div>
            </div>
          </div>

          <nav className={styles.sidebarNav}>
            <Link href="/dashboard" className={`${styles.navItem} ${styles.navItemActive}`}>
              <FileText size={18} />
              My Invitations
            </Link>
            <Link href="/templates" className={styles.navItem}>
              <Sparkles size={18} />
              Templates
            </Link>
            <Link href="/dashboard/analytics" className={styles.navItem}>
              <BarChart2 size={18} />
              RSVP Analytics
            </Link>
          </nav>

          <div className={styles.sidebarCTA}>
            <Link href="/templates" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={16} />
              New Invitation
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <div className={styles.content}>
          <div className={styles.contentHeader}>
            <div>
              <h1 className={styles.pageTitle}>{greeting} 👋</h1>
              <p className={styles.pageSubtitle}>
                {invitations.length === 0
                  ? "You haven't created any invitations yet."
                  : `You have ${invitations.length} invitation${invitations.length !== 1 ? 's' : ''}.`}
              </p>
            </div>
            <Link href="/templates" className="btn btn-primary">
              <Plus size={16} />
              New Invitation
            </Link>
          </div>

          {loading ? (
            <div className="spinner" />
          ) : invitations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.emptyState}
            >
              <div className={styles.emptyOrn}>💌</div>
              <h2 className={styles.emptyTitle}>Your First Invitation Awaits</h2>
              <p className={styles.emptyText}>
                Create a beautiful South Indian wedding invitation in minutes. Pick a template and start customising!
              </p>
              <Link href="/templates" className="btn btn-primary btn-lg">
                <Sparkles size={18} />
                Browse Templates
              </Link>

              {/* Demo: show sample cards */}
              <div className={styles.demoLabel}>✦ Or preview demo invitations ✦</div>
              <div className={styles.demoCards}>
                {TEMPLATES.slice(0, 2).map(t => (
                  <div key={t.id} className={styles.demoCard} style={{ background: t.bg_gradient }}>
                    <div className={styles.demoCardNames}>Arjun & Priya</div>
                    <Link href={`/builder/${t.id}`} className="btn btn-primary btn-sm">
                      Use {t.name}
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className={styles.invitationsGrid}>
              {invitations.map((inv, i) => {
                const t = TEMPLATES.find(t => t.id === inv.template_id) || TEMPLATES[0];
                const data = inv.data_json || {};
                return (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={styles.invCard}
                  >
                    <div className={styles.invCardPreview} style={{ background: t.bg_gradient }}>
                      <div className={styles.invCardNames}>
                        {data.groom_name || 'Groom'} &amp; {data.bride_name || 'Bride'}
                      </div>
                      <div className={styles.invCardTemplate}>{t.name}</div>
                      <div
                        className={styles.invCardStatus}
                        style={{
                          background: inv.status === 'published' ? 'rgba(46,125,50,0.85)' : 'rgba(255,150,0,0.85)',
                        }}
                      >
                        {inv.status === 'published' ? '● Published' : '○ Draft'}
                      </div>
                    </div>
                    <div className={styles.invCardBody}>
                      <div className={styles.invCardInfo}>
                        <div className={styles.invCardDate}>
                          {new Date(inv.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div className={styles.invCardSlug}>/{inv.slug}</div>
                      </div>
                      <div className={styles.invCardActions}>
                        <Link href={`/invite/${inv.slug}`} className={styles.cardAction} title="View">
                          <Eye size={15} />
                        </Link>
                        <Link href={`/builder/${inv.template_id}?edit=${inv.id}`} className={styles.cardAction} title="Edit">
                          <Edit3 size={15} />
                        </Link>
                        <button className={styles.cardAction} title="Copy link" onClick={() => copyLink(inv.slug)}>
                          {copiedId === inv.slug ? <Check size={15} className={styles.copyCheck} /> : <Copy size={15} />}
                        </button>
                        <button className={styles.cardAction} title="RSVPs" onClick={() => setViewingRSVPs(inv)}>
                          <Users size={15} />
                        </button>
                        <button className={`${styles.cardAction} ${styles.deleteAction}`} title="Delete" onClick={() => deleteInvitation(inv.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RSVP Modal */}
      {viewingRSVPs && (
        <RSVPModal
          invitation={viewingRSVPs}
          onClose={() => setViewingRSVPs(null)}
        />
      )}
    </main>
  );
}
