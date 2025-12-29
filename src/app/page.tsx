'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0a1a0a 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        padding: 'var(--space-4) var(--space-6)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'var(--accent-primary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            ⚡
          </div>
          <span style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: '700'
          }}>
            Neon Bites
          </span>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => router.push('/admin')}
        >
          Admin Login
        </button>
      </header>

      {/* Hero Section */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)'
      }}>
        <div style={{
          maxWidth: '600px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'inline-block',
            background: 'var(--accent-primary-light)',
            border: '1px solid var(--accent-primary-border)',
            borderRadius: 'var(--radius-full)',
            padding: 'var(--space-2) var(--space-4)',
            marginBottom: 'var(--space-6)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--accent-primary)'
          }}>
            ⚡ Restaurant Ordering System
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 8vw, 4rem)',
            fontWeight: '700',
            lineHeight: '1.1',
            marginBottom: 'var(--space-6)'
          }}>
            Order Food
            <br />
            <span style={{ color: 'var(--accent-primary)' }}>Directly</span> From
            <br />
            Your Table
          </h1>

          <p style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-8)',
            maxWidth: '450px',
            margin: '0 auto var(--space-8)'
          }}>
            Scan the QR code on your table or select your table number below to start ordering.
          </p>

          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-2xl)',
            padding: 'var(--space-8)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-4)'
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: 'var(--space-2)'
            }}>
              📱
            </div>
            <h3 style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: '600'
            }}>
              Scan QR Code
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-2)'
            }}>
              Please scan the QR code placed on your table to view the menu and place your order.
            </p>
            <div style={{
              padding: 'var(--space-3) var(--space-6)',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--text-muted)'
            }}>
              Camera → Scan QR → Order
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: 'var(--space-6)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 'var(--font-size-sm)'
      }}>
        <p>© 2024 Neon Bites. Powered by Smart Restaurant Solutions.</p>
      </footer>
    </div>
  );
}
