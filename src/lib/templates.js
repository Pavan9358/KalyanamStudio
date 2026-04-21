// Updated Template Library — Featuring the new Royal Heritage Signature Theme
export const TEMPLATES = [
  {
    id: 'royal-heritage',
    name: 'Royal Heritage Signature',
    category: 'Premium',
    description: 'Our flagship experience featuring the Ganesha opening seal, persistent royal music player, and sophisticated light/dark modes for the ultimate luxury wedding invitation.',
    preview_names: 'Milind & Avika',
    preview_sub: 'The Wedding Celebration',
    preview_date: 'February 22, 2026',
    bg_gradient: 'linear-gradient(to bottom, #FFFBF0 0%, #FFF5E1 100%)',
    features: ['Envelope Opening', 'Floating Music', 'Light & Dark Mode', 'Our Story Video', 'Interactive RSVP'],
    is_premium: true,
    colors: {
      light: {
        primary: '#800000',
        secondary: '#D4AF37',
        bg: '#FFFBF0',
        card: '#FFFFFF',
        text: '#2C1810',
        muted: '#5F4B32',
      },
      dark: {
        primary: '#FFD700',
        secondary: '#800000',
        bg: '#0F0F1A',
        card: '#1A1A2E',
        text: '#F5E6CC',
        muted: '#A89F91',
      }
    },
    template_json: {
      title: 'The Wedding Celebration',
      opening_text: 'You\'re Invited',
      hero_ornament: 'ganesha',
      story_label: 'Our Memories Bloom',
      video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
      music_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder
      live_stream_url: 'https://youtube.com/live', // Showcase live stream
      groom_family_photo: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1200&auto=format&fit=crop', // Placeholder family
      bride_family_photo: 'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?q=80&w=1200&auto=format&fit=crop', // Placeholder family
      events_label: 'Sacred Rituals',
      rsvp_whatsapp: '911234567890',
      couple_names: {
        groom: 'Milind',
        bride: 'Avika'
      }
    }
  },
  {
    id: 'premium-south-indian',
    name: 'Premium South Indian',
    category: 'Premium',
    description: 'A luxurious true-scroll experience blending cinematic full-screen temple overlays with glowing typographic treatments and floating light particles.',
    preview_names: 'Vijay & Priya',
    preview_sub: 'The Divine Beginning',
    preview_date: 'April 21, 2026',
    bg_gradient: 'linear-gradient(to bottom, #FDF8F0 0%, #D4AF37 100%)',
    features: ['Glowing Parallax Elements', 'WhatsApp RSVP', 'Firefly Animations', 'Light & Dark Mode'],
    is_premium: true,
    colors: {
      light: {
        primary: '#8B1A1A',
        secondary: '#D4AF37',
        bg: '#FDF8F0',
        card: '#FFFFFF',
        text: '#3A2618',
        muted: '#666666',
      },
      dark: {
        primary: '#FFC107',
        secondary: '#D32F2F',
        bg: '#120000',
        card: '#240000',
        text: '#FFE0B2',
        muted: '#BCAAA4',
      }
    },
    template_json: {
      title: 'With the blessings of God',
      opening_text: '',
      hero_ornament: 'venkateshwara',
      story_label: 'Our Divine Journey',
      video_url: '', 
      music_url: '/background-music.mp3', 
      events_label: 'Wedding Ceremonies',
      rsvp_whatsapp: '911234567890',
      couple_names: {
        groom: 'Vijay',
        bride: 'Priya'
      }
    },
  }
];
