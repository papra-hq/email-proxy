import type { Email } from 'postal-mime';
import type { Env } from './types';
import PostalMime from 'postal-mime';

async function parseEmail({ rawMessage }: { rawMessage: ReadableStream<Uint8Array> }) {
  const rawEmail = new Response(rawMessage);
  const parser = new PostalMime();

  const emailBuffer = await rawEmail.arrayBuffer();
  const email = await parser.parse(emailBuffer);

  return { email };
}

async function triggerWebhook({ email, webhookUrl, webhookSecret }: { email: Email; webhookUrl: string; webhookSecret: string }) {
  const body = new FormData();

  body.append('meta', JSON.stringify({ to: email.to, from: email.from }));

  for (const attachment of email.attachments) {
    body.append('attachments[]', new Blob([attachment.content], { type: attachment.mimeType }), attachment.filename ?? 'file');
  }

  await fetch(
    webhookUrl,
    {
      method: 'POST',
      body,
      headers: {
        Authorization: `Bearer ${webhookSecret}`,
      },
    },
  );
}

function parseConfig({ env }: { env: Env }) {
  const webhookUrl = env.WEBHOOK_URL;
  const webhookSecret = env.WEBHOOK_SECRET;

  if (!webhookUrl || !webhookSecret) {
    throw new Error('Missing required configuration: WEBHOOK_URL and WEBHOOK_SECRET');
  }

  return {
    webhookUrl,
    webhookSecret,
  };
}

export default {
  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    const { webhookUrl, webhookSecret } = parseConfig({ env });
    const { email } = await parseEmail({ rawMessage: message.raw });

    await triggerWebhook({ email, webhookUrl, webhookSecret });
  },
};
