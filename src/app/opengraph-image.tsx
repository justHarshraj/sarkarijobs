import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Sarkari Jobs - 24/7 Verified Govt Job Notifications & Results';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e1b4b 100%)',
          padding: '60px 80px',
          color: 'white',
        }}
      >
        {/* Top Header Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '26px',
              fontWeight: 900,
            }}
          >
            SJ
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '32px',
              fontWeight: 900,
              letterSpacing: '-1px',
              color: 'white',
            }}
          >
            <span>SARKARI</span>
            <span style={{ color: '#f97316' }}>JOBS</span>
          </div>
          <div
            style={{
              display: 'flex',
              padding: '6px 14px',
              borderRadius: '999px',
              backgroundColor: 'rgba(37, 99, 235, 0.25)',
              border: '1px solid rgba(147, 197, 253, 0.3)',
              color: '#93c5fd',
              fontSize: '16px',
              fontWeight: 700,
              marginLeft: '12px',
            }}
          >
            LIVE GOVT JOB ALERTS 2026
          </div>
        </div>

        {/* Hero Title & Subtext */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            maxWidth: '1000px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              fontSize: '52px',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-1.5px',
              color: '#ffffff',
              gap: '12px',
            }}
          >
            <span>Every</span>
            <span style={{ color: '#fbbf24' }}>Sarkari Naukri</span>
            <span>in One Place.</span>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '24px',
              color: '#94a3b8',
              lineHeight: 1.4,
            }}
          >
            Automated alerts for UPSC, SSC, Railways (RRB), Public Sector Banks (IBPS),
            Police & Defence with 1-click official PDF downloads.
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '16px',
              fontWeight: 600,
              color: '#34d399',
            }}
          >
            100% Official Govt Portals
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '16px',
              fontWeight: 600,
              color: '#fbbf24',
            }}
          >
            Real-time Deadline Tracking
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '16px',
              fontWeight: 600,
              color: '#60a5fa',
            }}
          >
            Verified PDF Downloads
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
