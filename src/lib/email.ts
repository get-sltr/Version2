import type { ReactElement } from 'react';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const defaultFromAddress = process.env.EMAIL_FROM_ADDRESS || 'SLTR <welcome@getsltr.com>';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export type SendTransactionalEmailInput = {
  to: string | string[];
  subject: string;
  react: ReactElement;
};

export async function sendTransactionalEmail(input: SendTransactionalEmailInput) {
  if (!resend) {
    throw new Error('RESEND_API_KEY is not configured');
  }

  const { data, error } = await resend.emails.send({
    from: defaultFromAddress,
    to: input.to,
    subject: input.subject,
    react: input.react,
  });

  if (error) {
    throw new Error(error.message || 'Resend failed to send email');
  }

  return data;
}
