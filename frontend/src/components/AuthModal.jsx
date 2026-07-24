import React from 'react';
import { createPortal } from 'react-dom';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { IoCloseOutline, IoSparklesOutline, IoLockClosedOutline } from 'react-icons/io5';

export default function AuthModal({ isOpen, onClose, initialMode = 'signup' }) {
  if (!isOpen) return null;

  const clerkAppearance = {
    layout: {
      socialButtonsVariant: 'iconButton',
      logoPlacement: 'none',
    },
    variables: {
      colorPrimary: '#059669',
      colorText: '#0F172A',
      colorBackground: '#FFFFFF',
      colorInputBackground: '#F8FAFC',
      colorInputText: '#0F172A',
      borderRadius: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    elements: {
      card: {
        boxShadow: 'none',
        border: 'none',
        padding: '24px 28px',
        width: '100%',
        backgroundColor: 'transparent'
      },
      headerTitle: {
        fontSize: '22px',
        fontWeight: '900',
        color: '#0F172A'
      },
      headerSubtitle: {
        fontSize: '13px',
        color: '#64748B'
      },
      formButtonPrimary: {
        backgroundColor: '#059669',
        fontSize: '15px',
        fontWeight: '800',
        borderRadius: '14px',
        padding: '12px',
        boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
        '&:hover': {
          backgroundColor: '#047857'
        }
      },
      formFieldInput: {
        borderRadius: '12px',
        border: '1px solid #CBD5E1',
        padding: '12px 14px',
        fontSize: '14px',
        '&:focus': {
          borderColor: '#059669',
          boxShadow: '0 0 0 3px rgba(5, 150, 105, 0.15)'
        }
      },
      footer: {
        borderTop: '1px solid #F1F5F9',
        paddingTop: '14px'
      },
      footerActionLink: {
        color: '#059669',
        fontWeight: '800'
      }
    }
  };

  const modalContent = (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 99999,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      overflowY: 'auto',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '28px',
        maxWidth: '520px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        position: 'relative',
        margin: 'auto'
      }}>
        {/* Top Header Bar */}
        <div style={{
          background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
          padding: '20px 26px',
          color: '#FFFFFF',
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTopLeftRadius: '28px',
          borderTopRightRadius: '28px'
        }}>
          <div>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              padding: '4px 12px',
              borderRadius: '14px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <IoSparklesOutline /> FLYERWISE CLOUD SYNC
            </span>
            <p style={{ fontSize: '13px', margin: '6px 0 0 0', opacity: 0.95, fontWeight: 600 }}>
              Save your basket & sync across phone, desktop & tablet.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '22px',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.35)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          >
            <IoCloseOutline />
          </button>
        </div>

        {/* Clerk Auth Component Body */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          {initialMode === 'signin' ? (
            <SignIn
              routing="hash"
              appearance={clerkAppearance}
            />
          ) : (
            <SignUp
              routing="hash"
              appearance={clerkAppearance}
            />
          )}
        </div>

        {/* Security Footer Note */}
        <div style={{
          backgroundColor: '#F8FAFC',
          padding: '14px 26px',
          borderTop: '1px solid #E2E8F0',
          textAlign: 'center',
          fontSize: '12px',
          color: '#64748B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          borderBottomLeftRadius: '28px',
          borderBottomRightRadius: '28px'
        }}>
          <IoLockClosedOutline style={{ color: '#059669' }} /> Secure 256-bit encrypted authentication powered by Clerk & PostgreSQL
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
