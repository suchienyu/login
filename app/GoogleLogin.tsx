import React, { useEffect, useRef, useState } from 'react';

interface CredentialResponse {
  clientId: string;
  credential: string;
  select_by: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement | null, config: any) => void;
          prompt: (momentListener?: (resp: PromptMomentNotification) => void) => void;
        };
      };
    };
  }
}

interface PromptMomentNotification {
  isDisplayed: () => boolean;
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  isDismissedMoment: () => boolean;
  getNotDisplayedReason: () => string;
  getSkippedReason: () => string;
  getDismissedReason: () => string;
}

interface GoogleLoginProps {
  onSuccess: (response: CredentialResponse) => void;
  onError: (error: string) => void;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ onSuccess, onError }) => {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    console.log('GoogleLogin component mounted');
    console.log('Client ID:', clientId);

    if (!clientId || !clientId.endsWith('.apps.googleusercontent.com')) {
      const errorMsg = 'Invalid NEXT_PUBLIC_GOOGLE_CLIENT_ID';
      console.error(errorMsg);
      setError(errorMsg);
      onError(errorMsg);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      console.log('Google Sign-In script loaded');
      if (window.google && googleButtonRef.current) {
        console.log('Initializing Google Sign-In');
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response: CredentialResponse) => {
              console.log('Google Sign-In callback received:', response);
              if (response.credential) {
                onSuccess(response);
              } else {
                const errorMsg = 'Google login error: No credential received';
                console.error(errorMsg);
                setError(errorMsg);
                onError(errorMsg);
              }
            },
            auto_select: false,
            cancel_on_tap_outside: false,
          });

          console.log('Rendering Google Sign-In button');
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 340, // 設置固定寬度
          });

          console.log('Attempting to prompt One Tap');
          try {
            window.google.accounts.id.prompt((notification: PromptMomentNotification) => {
              if (notification.isNotDisplayed()) {
                console.log('One Tap was not displayed:', notification.getNotDisplayedReason());
              } else if (notification.isSkippedMoment()) {
                console.log('One Tap was skipped:', notification.getSkippedReason());
              } else if (notification.isDismissedMoment()) {
                console.log('One Tap was dismissed:', notification.getDismissedReason());
              }
            });
          } catch (promptError) {
            console.error('Error prompting One Tap:', promptError);
          }
        } catch (err) {
          const errorMsg = `Error initializing Google Sign-In: ${err}`;
          console.error(errorMsg);
          setError(errorMsg);
          onError(errorMsg);
        }
      } else {
        const errorMsg = 'Google object or button ref not available';
        console.error(errorMsg);
        setError(errorMsg);
        onError(errorMsg);
      }
    };

    script.onerror = () => {
      const errorMsg = 'Failed to load Google Sign-In script';
      console.error(errorMsg);
      setError(errorMsg);
      onError(errorMsg);
    };

    return () => {
      console.log('GoogleLogin component unmounting');
      document.body.removeChild(script);
    };
  }, [onSuccess, onError, clientId]);

  return (
    <div style={{ width: '400px' }}> {/* 使用固定寬度 */}
      <div ref={googleButtonRef}></div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default GoogleLogin;