'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Sparkles, BarChart2, User } from 'lucide-react';
import styles from './MobileNav.module.css';

export default function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', icon: FileText, label: 'Invites' },
    { href: '/templates', icon: Sparkles, label: 'Create' },
    { href: '/dashboard/analytics', icon: BarChart2, label: 'Stats' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className={styles.mobileNav}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
