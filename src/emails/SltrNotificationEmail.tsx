import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export type SltrNotificationEmailProps = {
  headline: string;
  messageLines: string[];
  ctaLabel?: string;
  ctaUrl?: string;
  previewText?: string;
  footerNote?: string;
};

const bodyStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  color: '#000000',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  margin: 0,
  padding: '40px 0',
};

const containerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
  border: '1px solid #eaeaea',
};

const innerSectionStyle: React.CSSProperties = {
  padding: '48px 48px 32px',
};

const signatureStyle: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
  fontSize: '32px',
  letterSpacing: '0.4em',
  textTransform: 'lowercase',
  marginBottom: '12px',
};

const tagLineStyle: React.CSSProperties = {
  fontSize: '11px',
  letterSpacing: '0.5em',
  textTransform: 'uppercase',
  opacity: 0.5,
  marginBottom: '24px',
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '15px',
  lineHeight: 1.7,
  marginBottom: '20px',
};

const buttonStyle: React.CSSProperties = {
  display: 'inline-block',
  backgroundColor: '#000000',
  color: '#ffffff',
  textTransform: 'uppercase',
  letterSpacing: '0.3em',
  fontSize: '12px',
  padding: '18px 32px',
  textDecoration: 'none',
  borderRadius: '2px',
};

const footerStyle: React.CSSProperties = {
  padding: '24px 48px 48px',
  fontSize: '11px',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  opacity: 0.4,
  textAlign: 'center' as const,
};

export function SltrNotificationEmail({
  headline,
  messageLines,
  ctaLabel,
  ctaUrl,
  previewText,
  footerNote,
}: SltrNotificationEmailProps) {
  return (
    <Html>
      <Head>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;600&family=Space+Mono:wght@400;700&display=swap');`}</style>
      </Head>
      <Preview>{previewText || headline}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={innerSectionStyle}>
            <div style={signatureStyle}>s l t r</div>
            <div style={tagLineStyle}>no rules apply</div>

            <Text
              style={{
                fontFamily: "'Cormorant Garamond', 'Times New Roman', serif",
                fontSize: '34px',
                marginBottom: '32px',
                lineHeight: 1.2,
              }}
            >
              {headline}
            </Text>

            {messageLines.map((line, index) => (
              <Text key={index} style={paragraphStyle}>
                {line}
              </Text>
            ))}

            {ctaLabel && ctaUrl && (
              <Button href={ctaUrl} style={buttonStyle}>
                {ctaLabel}
              </Button>
            )}
          </Section>

          <Section>
            <Hr style={{ borderColor: '#f5f5f5', margin: 0 }} />
            <div style={footerStyle}>
              {footerNote || 'Intelligent | Innovative | Intuitive'}
            </div>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default SltrNotificationEmail;
