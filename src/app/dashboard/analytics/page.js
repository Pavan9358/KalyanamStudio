'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import styles from './page.module.css';
import {
  BarChart2,
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Download,
  RefreshCw,
  ChevronDown,
  Wifi,
  WifiOff,
  ArrowLeft,
  MessageCircle,
  Calendar,
  Activity,
  FileText,
  Sparkles,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────
// SVG DONUT CHART
// ─────────────────────────────────────────────────────────────
function DonutChart({ attending, declined }) {
  const total = attending + declined;
  const r = 56;
  const circ = 2 * Math.PI * r;
  const attendingArc = total > 0 ? (attending / total) * circ : 0;
  const declinedArc = total > 0 ? (declined / total) * circ : 0;

  return (
    <div className={styles.donutWrap}>
      <svg viewBox="0 0 140 140" className={styles.donutSvg}>
        {/* Background ring */}
        <circle cx="70" cy="70" r={r} fill="none" strokeWidth="18" stroke="rgba(212,175,55,0.12)" />
        {/* Declined arc */}
        {declined > 0 && (
          <circle
            cx="70" cy="70" r={r} fill="none" strokeWidth="18"
            stroke="#C62828"
            strokeDasharray={`${declinedArc} ${circ}`}
            strokeDashoffset={-attendingArc}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        )}
        {/* Attending arc */}
        {attending > 0 && (
          <circle
            cx="70" cy="70" r={r} fill="none" strokeWidth="18"
            stroke="#2E7D32"
            strokeDasharray={`${attendingArc} ${circ}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        )}
        {/* Center text */}
        <text x="70" y="65" textAnchor="middle" fontSize="22" fontWeight="700" fill="#800000" fontFamily="Playfair Display, serif">
          {total}
        </text>
        <text x="70" y="82" textAnchor="middle" fontSize="9" fill="#8B6840" fontFamily="Poppins, sans-serif" letterSpacing="1">
          RESPONSES
        </text>
      </svg>
      <div className={styles.donutLegend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#2E7D32' }} />
          <span>Attending ({attending})</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#C62828' }} />
          <span>Declined ({declined})</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SVG BAR CHART (timeline)
// ─────────────────────────────────────────────────────────────
function BarChart({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className={styles.chartEmpty}>
        <Calendar size={32} style={{ opacity: 0.3 }} />
        <p>No timeline data yet</p>
      </div>
    );
  }

  const maxVal = Math.max(...timeline.map((d) => d.total), 1);
  const W = 540;
  const H = 160;
  const pad = { top: 12, bottom: 36, left: 8, right: 8 };
  const barW = Math.min(40, (W - pad.left - pad.right) / timeline.length - 6);
  const slotW = (W - pad.left - pad.right) / timeline.length;

  return (
    <div className={styles.barChartWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} className={styles.barChartSvg} preserveAspectRatio="none">
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={pad.left} x2={W - pad.right}
            y1={pad.top + (1 - f) * (H - pad.top - pad.bottom)}
            y2={pad.top + (1 - f) * (H - pad.top - pad.bottom)}
            stroke="rgba(212,175,55,0.12)" strokeWidth="1"
          />
        ))}

        {timeline.map((d, i) => {
          const x = pad.left + i * slotW + slotW / 2 - barW / 2;
          const barH = ((d.total / maxVal) * (H - pad.top - pad.bottom));
          const y = H - pad.bottom - barH;
          const attendingH = ((d.attending / maxVal) * (H - pad.top - pad.bottom));
          const attendingY = H - pad.bottom - attendingH;

          return (
            <g key={i}>
              {/* Total bar (light) */}
              <rect x={x} y={y} width={barW} height={barH}
                rx="4"
                fill="rgba(212,175,55,0.20)"
              />
              {/* Attending bar (green) */}
              <rect x={x} y={attendingY} width={barW} height={attendingH}
                rx="4"
                fill="rgba(46,125,50,0.75)"
              />
              {/* Date label */}
              <text
                x={x + barW / 2} y={H - pad.bottom + 14}
                textAnchor="middle"
                fontSize="8"
                fill="#8B6840"
                fontFamily="Poppins, sans-serif"
              >
                {d.date}
              </text>
            </g>
          );
        })}
      </svg>
      <div className={styles.barLegend}>
        <span><span style={{ background: 'rgba(46,125,50,0.75)', display: 'inline-block', width: 10, height: 10, borderRadius: 2, marginRight: 4 }} />Attending</span>
        <span><span style={{ background: 'rgba(212,175,55,0.25)', display: 'inline-block', width: 10, height: 10, borderRadius: 2, marginRight: 4 }} />Total Responses</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <motion.div
      className={styles.statCard}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      style={{ '--accent': color }}
    >
      <div className={styles.statIcon} style={{ background: `${color}18`, color }}>
        <Icon size={20} />
      </div>
      <div className={styles.statBody}>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statLabel}>{label}</div>
        {sub && <div className={styles.statSub}>{sub}</div>}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// CSV EXPORT
// ─────────────────────────────────────────────────────────────
function exportCSV(rsvps, invSlug) {
  const header = ['Guest Name', 'Attending', 'Guest Count', 'Message', 'Date'];
  const rows = rsvps.map((r) => [
    `"${r.guest_name}"`,
    r.attending ? 'Yes' : 'No',
    r.guest_count || 1,
    `"${(r.message || '').replace(/"/g, "'")}"`,
    new Date(r.created_at).toLocaleString('en-IN'),
  ]);
  const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rsvp-${invSlug}-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function RSVPAnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [selectedInv, setSelectedInv] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [invLoading, setInvLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [newRsvpFlash, setNewRsvpFlash] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 8;
  const channelRef = useRef(null);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem('ks_token');
    const userData = localStorage.getItem('ks_user');
    if (!token) { router.push('/auth'); return; }
    if (userData) setUser(JSON.parse(userData));

    const fetchInvitations = async () => {
      try {
        const res = await fetch('/api/invitations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const invs = data.invitations || [];
          setInvitations(invs);
          if (invs.length > 0) setSelectedInv(invs[0]);
        }
      } catch { /* network error — show empty */ }
      finally { setInvLoading(false); }
    };
    fetchInvitations();
  }, [router]);

  // Fetch analytics whenever selected invitation changes
  const fetchAnalytics = useCallback(async () => {
    if (!selectedInv) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/rsvp/analytics?invitation_id=${selectedInv.slug}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
        setPage(1);
      }
    } catch { /* graceful fail */ }
    finally { setLoading(false); }
  }, [selectedInv]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // Supabase Realtime subscription
  useEffect(() => {
    if (!selectedInv) return;

    // Unsubscribe previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      setIsLive(false);
    }

    const channel = supabase
      .channel(`rsvps-analytics-${selectedInv.slug}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'rsvps',
          filter: `invitation_id=eq.${selectedInv.slug}`,
        },
        (payload) => {
          const newRsvp = payload.new;
          setAnalytics((prev) => {
            if (!prev) return prev;
            const updatedRsvps = [newRsvp, ...prev.rsvps];
            const attending = updatedRsvps.filter((r) => r.attending).length;
            const declined = updatedRsvps.filter((r) => !r.attending).length;
            const totalGuests = updatedRsvps.filter((r) => r.attending).reduce((a, r) => a + (r.guest_count || 1), 0);
            const total = updatedRsvps.length;
            const responseRate = total > 0 ? Math.round((attending / total) * 100) : 0;

            // Update timeline
            const d = new Date(newRsvp.created_at);
            const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
            const timeline = [...prev.timeline];
            const existing = timeline.find((t) => t.date === label);
            if (existing) {
              existing.total += 1;
              if (newRsvp.attending) existing.attending += 1;
            } else {
              timeline.push({ date: label, total: 1, attending: newRsvp.attending ? 1 : 0 });
            }

            return { ...prev, rsvps: updatedRsvps, attending, declined, totalGuests, total, responseRate, timeline };
          });
          setNewRsvpFlash(true);
          setTimeout(() => setNewRsvpFlash(false), 1500);
          setPage(1);
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      setIsLive(false);
    };
  }, [selectedInv]);

  // Pagination
  const paginatedRsvps = analytics?.rsvps?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) || [];
  const totalPages = Math.ceil((analytics?.rsvps?.length || 0) / PAGE_SIZE);

  const inv = selectedInv;
  const groomName = inv?.data_json?.groom_name || 'Groom';
  const brideName = inv?.data_json?.bride_name || 'Bride';

  return (
    <main className={styles.page}>
      <Navbar />

      <div className={styles.layout}>
        {/* ── SIDEBAR ── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarUser}>
            <div className={styles.userAvatar}>{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <div className={styles.userName}>{user?.name || 'User'}</div>
              <div className={styles.userEmail}>{user?.email}</div>
            </div>
          </div>

          <nav className={styles.sidebarNav}>
            <Link href="/dashboard" className={styles.navItem}>
              <FileText size={18} />
              My Invitations
            </Link>
            <Link href="/templates" className={styles.navItem}>
              <Sparkles size={18} />
              Templates
            </Link>
            <Link href="/dashboard/analytics" className={`${styles.navItem} ${styles.navItemActive}`}>
              <BarChart2 size={18} />
              RSVP Analytics
            </Link>
          </nav>

          <div className={styles.sidebarCTA}>
            <Link href="/templates" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              New Invitation
            </Link>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.contentHeader}>
            <div className={styles.headerLeft}>
              <Link href="/dashboard" className={styles.backLink}>
                <ArrowLeft size={16} /> Dashboard
              </Link>
              <h1 className={styles.pageTitle}>RSVP Analytics</h1>
              <p className={styles.pageSubtitle}>
                Real-time guest response tracking for your wedding invitations
              </p>
            </div>

            <div className={styles.headerRight}>
              {/* Live indicator */}
              <div className={`${styles.liveIndicator} ${isLive ? styles.liveOn : styles.liveOff}`}>
                {isLive ? <Wifi size={13} /> : <WifiOff size={13} />}
                {isLive ? 'Live' : 'Offline'}
              </div>

              {/* Refresh */}
              <button
                className={styles.refreshBtn}
                onClick={fetchAnalytics}
                disabled={loading}
                title="Refresh data"
              >
                <RefreshCw size={15} className={loading ? styles.spinning : ''} />
              </button>

              {/* Export CSV */}
              {analytics?.rsvps?.length > 0 && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => exportCSV(analytics.rsvps, selectedInv?.slug)}
                >
                  <Download size={15} />
                  Export CSV
                </button>
              )}
            </div>
          </div>

          {/* Invitation Selector */}
          {invLoading ? (
            <div className="spinner" />
          ) : invitations.length === 0 ? (
            <motion.div className={styles.emptyWrap} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className={styles.emptyIcon}>📊</div>
              <h2 className={styles.emptyTitle}>No Invitations Yet</h2>
              <p className={styles.emptyText}>Create an invitation first to start tracking RSVPs in real time.</p>
              <Link href="/templates" className="btn btn-primary">Browse Templates</Link>
            </motion.div>
          ) : (
            <>
              {/* Dropdown selector */}
              <div className={styles.selectorWrap}>
                <div className={styles.selectorLabel}>Viewing analytics for:</div>
                <div className={styles.selectorControl}>
                  <select
                    className={styles.invSelector}
                    value={selectedInv?.id || ''}
                    onChange={(e) => {
                      const found = invitations.find((i) => i.id === e.target.value);
                      if (found) setSelectedInv(found);
                    }}
                  >
                    {invitations.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.data_json?.groom_name || 'Groom'} & {inv.data_json?.bride_name || 'Bride'} — /{inv.slug}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className={styles.selectorArrow} />
                </div>
              </div>

              {loading && !analytics ? (
                <div className="spinner" />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedInv?.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                  >
                    {/* ── STAT CARDS ── */}
                    <div className={styles.statsGrid}>
                      <StatCard
                        icon={Users}
                        label="Total Responses"
                        value={analytics?.total ?? '—'}
                        color="#800000"
                        delay={0}
                      />
                      <StatCard
                        icon={UserCheck}
                        label="Attending"
                        value={analytics?.attending ?? '—'}
                        sub={analytics?.totalGuests ? `${analytics.totalGuests} total guests` : null}
                        color="#2E7D32"
                        delay={0.07}
                      />
                      <StatCard
                        icon={UserX}
                        label="Declined"
                        value={analytics?.declined ?? '—'}
                        color="#C62828"
                        delay={0.14}
                      />
                      <StatCard
                        icon={TrendingUp}
                        label="Response Rate"
                        value={analytics ? `${analytics.responseRate}%` : '—'}
                        sub="of all invited"
                        color="#D4AF37"
                        delay={0.21}
                      />
                    </div>

                    {/* ── CHARTS ROW ── */}
                    <div className={styles.chartsRow}>
                      {/* Donut */}
                      <motion.div
                        className={styles.chartCard}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className={styles.chartCardHeader}>
                          <Activity size={16} />
                          Attendance Breakdown
                        </div>
                        <DonutChart
                          attending={analytics?.attending || 0}
                          declined={analytics?.declined || 0}
                        />
                      </motion.div>

                      {/* Bar chart */}
                      <motion.div
                        className={`${styles.chartCard} ${styles.chartCardWide}`}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.28 }}
                      >
                        <div className={styles.chartCardHeader}>
                          <BarChart2 size={16} />
                          Response Timeline
                        </div>
                        <BarChart timeline={analytics?.timeline || []} />
                      </motion.div>
                    </div>

                    {/* ── RSVP TABLE ── */}
                    <motion.div
                      className={styles.tableCard}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.32 }}
                    >
                      <div className={styles.tableHeader}>
                        <div className={styles.tableTitle}>
                          <Users size={16} />
                          Guest Responses
                          {newRsvpFlash && (
                            <span className={styles.newBadge}>⚡ New!</span>
                          )}
                        </div>
                        <div className={styles.tableCount}>
                          {analytics?.rsvps?.length || 0} total
                        </div>
                      </div>

                      {!analytics?.rsvps?.length ? (
                        <div className={styles.tableEmpty}>
                          <MessageCircle size={32} style={{ opacity: 0.25, marginBottom: 8 }} />
                          <p>No RSVPs yet. Share your invitation link to start collecting responses!</p>
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ marginTop: 12 }}
                            onClick={() => {
                              navigator.clipboard.writeText(`${window.location.origin}/invite/${selectedInv?.slug}`);
                            }}
                          >
                            Copy Invite Link
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className={styles.tableWrap}>
                            <table className={styles.table}>
                              <thead>
                                <tr>
                                  <th>#</th>
                                  <th>Guest Name</th>
                                  <th>Status</th>
                                  <th>Guests</th>
                                  <th>Message</th>
                                  <th>Date & Time</th>
                                </tr>
                              </thead>
                              <tbody>
                                <AnimatePresence initial={false}>
                                  {paginatedRsvps.map((rsvp, i) => (
                                    <motion.tr
                                      key={rsvp.id || i}
                                      className={`${styles.tableRow} ${i === 0 && newRsvpFlash && page === 1 ? styles.rowFlash : ''}`}
                                      initial={{ opacity: 0, x: -8 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0 }}
                                      transition={{ duration: 0.25 }}
                                    >
                                      <td className={styles.tdNum}>
                                        {(page - 1) * PAGE_SIZE + i + 1}
                                      </td>
                                      <td className={styles.tdName}>{rsvp.guest_name}</td>
                                      <td>
                                        <span className={rsvp.attending ? styles.badgeYes : styles.badgeNo}>
                                          {rsvp.attending ? '✓ Attending' : '✕ Declined'}
                                        </span>
                                      </td>
                                      <td className={styles.tdCenter}>
                                        {rsvp.attending ? (rsvp.guest_count || 1) : '—'}
                                      </td>
                                      <td className={styles.tdMessage}>
                                        {rsvp.message ? (
                                          <span className={styles.messageText}>"{rsvp.message}"</span>
                                        ) : (
                                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
                                        )}
                                      </td>
                                      <td className={styles.tdDate}>
                                        {new Date(rsvp.created_at).toLocaleString('en-IN', {
                                          day: '2-digit', month: 'short', year: 'numeric',
                                          hour: '2-digit', minute: '2-digit',
                                        })}
                                      </td>
                                    </motion.tr>
                                  ))}
                                </AnimatePresence>
                              </tbody>
                            </table>
                          </div>

                          {/* Pagination */}
                          {totalPages > 1 && (
                            <div className={styles.pagination}>
                              <button
                                className={styles.pageBtn}
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                              >
                                ← Prev
                              </button>
                              <span className={styles.pageInfo}>
                                Page {page} of {totalPages}
                              </span>
                              <button
                                className={styles.pageBtn}
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                              >
                                Next →
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
