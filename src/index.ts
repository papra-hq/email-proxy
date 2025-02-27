import type { Env } from './types';
import { triggerWebhook } from '@owlrelay/webhook';
import PostalMime from 'postal-mime';

async function parseEmail({ rawMessage }: { rawMessage: ReadableStream<Uint8Array> }) {
  const emailBuffer = await new Response(rawMessage).arrayBuffer();
  const email = await new PostalMime().parse(emailBuffer);

  return { email };
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
