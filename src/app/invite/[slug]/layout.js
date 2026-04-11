import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Generate dynamic metadata for social media sharing
export async function generateMetadata({ params }) {
  // Await the destructured params to conform with Next.js 15+ specifications
  const { slug } = await params;
  
  const siteUrl = 'https://kalyanamstudioss.vercel.app';
  const defaultThumbnail = `${siteUrl}/ganesha_transparent.png`;

  // Provide basic metadata specifically for local templates before db save
  if (slug.startsWith('demo-')) {
    return {
      title: "Wedding Preview Concept - KalyanamStudio",
      description: "A breathtaking digital experience of a KalyanamStudio wedding invitation.",
      openGraph: {
        title: "Wedding Preview Concept",
        description: "Experience the luxury of digital invitations.",
        images: [defaultThumbnail],
        url: `${siteUrl}/invite/${slug}`
      }
    };
  }

  // Fetch true invitation payload securely on the backend server
  try {
    const { data, error } = await supabase
      .from('invitations')
      .select('data_json')
      .eq('slug', slug)
      .single();

    if (!error && data?.data_json) {
      const payload = data.data_json;
      const groom = payload.groom_name || 'Groom';
      const bride = payload.bride_name || 'Bride';
      
      const weddingEvent = payload.events?.find(e => e.name.toLowerCase().includes('wedding')) || payload.events?.[0];
      const date = weddingEvent ? weddingEvent.date : 'the upcoming celebration';

      // Prefer couple portraits, fallback to gallery, fallback to Ganesha
      const thumbnail = payload.groom_photo || payload.bride_photo || payload.gallery?.[0] || defaultThumbnail;

      const titleStr = `${groom} & ${bride} - You're Invited!`;
      const descStr = `Join us on ${date} as we step into our new beginning.`;

      return {
        title: titleStr,
        description: descStr,
        openGraph: {
          title: titleStr,
          description: descStr,
          url: `${siteUrl}/invite/${slug}`,
          type: 'website',
          images: [
            {
              url: thumbnail,
              width: 1200,
              height: 630,
              alt: `Wedding Invitation`
            }
          ]
        },
        twitter: {
          card: 'summary_large_image',
          title: titleStr,
          description: descStr,
          images: [thumbnail]
        }
      };
    }
  } catch (error) {
    console.error("Layout Server Metadata Error", error);
  }

  // Fallback for non-existent slugs safely
  return {
    title: "KalyanamStudio Invitation",
    description: "Welcome to our wedding invitation.",
    openGraph: {
      images: [defaultThumbnail]
    }
  };
}

export default function InviteLayout({ children }) {
  // Simple transparent wrapper layout since page.js handles client-side rendering
  return <>{children}</>;
}
