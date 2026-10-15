import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sarkari Jobs - 24/7 Live Govt Job Alerts & Results',
    short_name: 'Sarkari Jobs',
    description:
      'Fastest Indian government recruitment notifications, UPSC, SSC, RRB, Banking, Police, Defence, Admit Cards, and Results.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#1e3a8a',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
