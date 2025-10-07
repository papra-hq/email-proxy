import type { Address, Email } from 'postal-mime';
import type { Env } from './types';
import { triggerWebhook } from '@owlrelay/webhook';
import PostalMime from 'postal-mime';

async function parseEmail({
  rawMessage,
  realTo,
  realFrom,
}: {
  rawMessage: ReadableStream<Uint8Array>;
  realTo: string;
  realFrom: string;
}): Promise<{ email: Email & { originalTo: Address[]; originalFrom: Address } }> {
  const rawEmail = new Response(rawMessage);
  const parser = new PostalMime();

  const emailBuffer = await rawEmail.arrayBuffer();
  const email = await parser.parse(emailBuffer);

  return {
    email: {
      ...email,
      originalTo: email.to ?? [],
      originalFrom: email.from,
      to: [
        {
          address: realTo,
          name: email.to?.find(to => to.address === realTo)?.name ?? '',
        },
      ],
      from: {
        address: realFrom,
        name: email.from.address === realFrom ? email.from.name : '',
      },
    },
  };
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
    const { email } = await parseEmail({
      rawMessage: message.raw,
      realTo: message.to,
      realFrom: message.from,
    });

    await triggerWebhook({ email, webhookUrl, webhookSecret });
  },
};
