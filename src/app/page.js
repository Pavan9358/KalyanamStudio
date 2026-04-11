'use client';
import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import TemplateCard from '@/components/TemplateCard';
import { TEMPLATES } from '@/lib/templates';
import styles from './page.module.css';
import {
  Sparkles, Heart, Share2, Users, Clock, Shield,
  Star, ChevronDown, Zap, Globe, CheckCircle
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <main className={styles.main}>
      <Navbar />

      {/* ===== HERO ===== */}
      <section className={styles.hero} ref={heroRef}>
        <motion.div className={styles.heroBg} style={{ y: heroY }} />
        <div className={styles.heroOverlay} />

        {/* Floating ornaments */}
        <div className={styles.floatingOrn1}>🪷</div>
        <div className={styles.floatingOrn2}>✦</div>
        <div className={styles.floatingOrn3}>🌺</div>

        <motion.div
          className={styles.heroContent}
          style={{ opacity: heroOpacity }}
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} className={styles.heroBadge}>
            <Sparkles size={13} />
            South India&apos;s First Self-Service Wedding Studio
          </motion.div>

          <motion.h1 variants={fadeUp} className={styles.heroTitle}>
            Create Your
            <br />
            <span className={styles.heroTitleGold}>Dream Wedding</span>
            <br />
            Invitation
          </motion.h1>

          <motion.p variants={fadeUp} className={styles.heroSubtitle}>
            Design stunning South Indian wedding invitations in minutes.
            Share your special day with personalised digital invites — no designer needed.
          </motion.p>

          <motion.div variants={fadeUp} className={styles.heroCTA}>
            <Link href="/auth?mode=signup" className="btn btn-primary btn-lg">
              <Sparkles size={18} />
              Start Creating Free
            </Link>
            <Link href="/templates" className="btn btn-ghost btn-lg">
              View Templates
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>2,400+</span>
              <span className={styles.statLabel}>Invitations Created</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>48K+</span>
              <span className={styles.statLabel}>Guests Invited</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>4.9 ★</span>
              <span className={styles.statLabel}>Average Rating</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.scrollHint}
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
        >
          <ChevronDown size={22} />
        </motion.div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className={`${styles.howItWorks} section`} id="how">
        <div className="container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={stagger}
            viewport={{ once: true }}
            className="section-header"
          >
            <motion.div variants={fadeUp} className={styles.sectionBadge}>
              <Zap size={13} /> How It Works
            </motion.div>
            <motion.h2 variants={fadeUp}>Create in 3 Simple Steps</motion.h2>
            <motion.p variants={fadeUp} className={styles.sectionSubtitle}>
              From blank canvas to a beautiful, shareable invitation in minutes
            </motion.p>
          </motion.div>

          <motion.div
            className={styles.stepsGrid}
            initial="hidden"
            whileInView="visible"
            variants={stagger}
            viewport={{ once: true }}
          >
            {[
              { icon: '🎨', step: '01', title: 'Pick a Template', desc: 'Browse our curated gallery of South Indian wedding templates — Traditional, Royal, Floral & Modern styles.' },
              { icon: '✍️', step: '02', title: 'Customise Details', desc: 'Fill in couple names, event dates, venue, add photos and a personal message — watch the live preview update instantly.' },
              { icon: '🚀', step: '03', title: 'Share & Collect RSVPs', desc: 'Get a beautiful shareable link instantly. Share on WhatsApp, collect RSVPs and manage guests from your dashboard.' },
            ].map((step, i) => (
              <motion.div key={i} variants={fadeUp} className={styles.step}>
                <div className={styles.stepNum}>{step.step}</div>
                <div className={styles.stepIcon}>{step.icon}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
                {i < 2 && <div className={styles.stepArrow}>→</div>}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== TEMPLATE PREVIEW ===== */}
      <section className={`${styles.templatesSection} section`} id="templates">
        <div className="container">
          <div className="section-header">
            <div className={styles.sectionBadge}>
              <Heart size={13} /> Our Templates
            </div>
            <h2>Made for South Indian Celebrations</h2>
            <p className={styles.sectionSubtitle}>
              Every template is crafted with authentic cultural motifs, traditional typography and modern elegance
            </p>
          </div>

          <div className="grid-4">
            {TEMPLATES.map((t, i) => (
              <TemplateCard key={t.id} template={t} index={i} />
            ))}
          </div>

          <div className={styles.templatesCTA}>
            <Link href="/templates" className="btn btn-secondary btn-lg">
              View All Templates
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className={`${styles.features} section`} id="features">
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            variants={stagger}
            viewport={{ once: true }}
          >
            <motion.div variants={fadeUp} className={styles.sectionBadge}>
              <Sparkles size={13} /> Features
            </motion.div>
            <motion.h2 variants={fadeUp}>Everything You Need</motion.h2>
            <motion.p variants={fadeUp} className={styles.sectionSubtitle}>
              Packed with features to make your wedding invitation unforgettable
            </motion.p>
          </motion.div>

          <motion.div
            className={styles.featuresGrid}
            initial="hidden"
            whileInView="visible"
            variants={stagger}
            viewport={{ once: true }}
          >
            {[
              { icon: <Zap size={22} />, title: 'Instant Preview', desc: 'See every change reflected in real-time. No guessing, no waiting.' },
              { icon: <Share2 size={22} />, title: 'One-Click Sharing', desc: 'Get a beautiful shareable link. Share via WhatsApp, Instagram or email.' },
              { icon: <Users size={22} />, title: 'RSVP Management', desc: 'Guests can RSVP with a name, attendance status and a message — all in one place.' },
              { icon: <Clock size={22} />, title: 'Live Countdown', desc: 'A real-time countdown timer that builds anticipation for your big day.' },
              { icon: <Globe size={22} />, title: 'Multi-Event Support', desc: 'Add all your events — Haldi, Mehendi, Sangeet, Wedding and Reception.' },
              { icon: <Shield size={22} />, title: 'Always Available', desc: 'Your invite link is public, fast and accessible on any device, anywhere.' },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeUp} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className={`${styles.pricing} section`} id="pricing">
        <div className="container">
          <div className="section-header">
            <div className={styles.sectionBadge}>
              <Star size={13} /> Pricing
            </div>
            <h2 className="text-maroon">Simple, Transparent Pricing</h2>
            <p className={styles.sectionSubtitle}>Start free, upgrade when you&apos;re ready</p>
          </div>

          <div className={styles.pricingGrid}>
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={styles.pricingCard}
            >
              <div className={styles.planName}>Starter</div>
              <div className={styles.planPrice}>
                <span className={styles.priceAmount}>Free</span>
              </div>
              <p className={styles.planDesc}>Perfect for a simple, heartfelt invite</p>
              <ul className={styles.planFeatures}>
                {['1 Invitation', '2 Templates', 'Shareable Link', 'RSVP Collection', 'KalyanamStudio Watermark'].map(f => (
                  <li key={f} className={styles.planFeature}>
                    <CheckCircle size={16} className={styles.checkIcon} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth?mode=signup" className={`${styles.planBtn} btn btn-secondary`}>
                Get Started Free
              </Link>
            </motion.div>

            {/* Premium */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}
            >
              <div className={styles.featuredBadge}>
                <Star size={12} fill="currentColor" /> Most Popular
              </div>
              <div className={styles.planName}>Premium</div>
              <div className={styles.planPrice}>
                <span className={styles.priceAmount}>₹499</span>
                <span className={styles.pricePer}>/invite</span>
              </div>
              <p className={styles.planDesc}>For the celebration your love deserves</p>
              <ul className={styles.planFeatures}>
                {[
                  'Unlimited Invitations', 'All 10+ Templates', 'No Watermark',
                  'Photo Gallery (10 pics)', 'Live Countdown Timer', 'RSVP Analytics Dashboard',
                  'WhatsApp Integration', 'Priority Support',
                ].map(f => (
                  <li key={f} className={styles.planFeature}>
                    <CheckCircle size={16} className={styles.checkIconGold} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth?mode=signup" className={`${styles.planBtn} btn btn-primary`}>
                <Sparkles size={15} /> Start Premium
              </Link>
            </motion.div>

            {/* Family */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className={styles.pricingCard}
            >
              <div className={styles.planName}>Family Bundle</div>
              <div className={styles.planPrice}>
                <span className={styles.priceAmount}>₹999</span>
                <span className={styles.pricePer}>/year</span>
              </div>
              <p className={styles.planDesc}>For families with multiple celebrations</p>
              <ul className={styles.planFeatures}>
                {['5 Premium Invitations', 'All Premium Features', 'Background Music', 'Multi-language Support', 'Dedicated Account Manager'].map(f => (
                  <li key={f} className={styles.planFeature}>
                    <CheckCircle size={16} className={styles.checkIcon} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth?mode=signup" className={`${styles.planBtn} btn btn-secondary`}>
                Get Family Bundle
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerBg} />
        <div className="container">
          <motion.div
            className={styles.ctaBannerContent}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className={styles.ctaOrn}>🪷 ✦ 🌺</div>
            <h2 className={styles.ctaTitle}>
              Your Perfect Invitation<br />Awaits You
            </h2>
            <p className={styles.ctaText}>
              Join thousands of couples who have shared their love story with a KalyanamStudio invitation
            </p>
            <Link href="/auth?mode=signup" className="btn btn-primary btn-lg">
              <Sparkles size={18} />
              Create Your Invitation Now
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <span>🪷</span>
                <span>KalyanamStudio</span>
              </div>
              <p className={styles.footerTagline}>
                Creating beautiful South Indian wedding invitations with heart, tradition and modern elegance.
              </p>
            </div>
            <div className={styles.footerLinks}>
              <h4>Product</h4>
              <Link href="/templates">Templates</Link>
              <Link href="/#features">Features</Link>
              <Link href="/#pricing">Pricing</Link>
            </div>
            <div className={styles.footerLinks}>
              <h4>Company</h4>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/privacy">Privacy Policy</Link>
            </div>
            <div className={styles.footerLinks}>
              <h4>Get Started</h4>
              <Link href="/auth">Login</Link>
              <Link href="/auth?mode=signup">Sign Up Free</Link>
              <Link href="/dashboard">Dashboard</Link>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2025 KalyanamStudio. Made with <Heart size={13} className={styles.heartIcon} /> for South Indian weddings.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
