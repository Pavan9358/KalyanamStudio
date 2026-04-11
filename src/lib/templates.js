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
      events_label: 'Sacred Rituals',
      rsvp_whatsapp: '911234567890',
      couple_names: {
        groom: 'Milind',
        bride: 'Avika'
      }
    },
  }
];
