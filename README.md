# Papra - Email proxy

This repository contains the source code for the Papra email proxy. The Papra email proxy is a custom [Cloudflare Email worker](https://developers.cloudflare.com/email-routing/email-workers/) that allows to forward emails to your [Papra](https://papra.app) instance for document ingestion.

## Usage

1. Deploy this worker to your Cloudflare account.
    a. Clone this repository.
    b. Install the dependencies with `pnpm install`.
    c. Deploy the worker with `pnpm run deploy` (alias for `wrangler publish`).
2. Configure the worker with the following environment variables:
    - `WEBHOOK_URL`: The ingestion endpoint of your Papra instance, basically `https://<your-instance>/api/intake-emails/ingest`.
    - `WEBHOOK_SECRET`: The secret key to authenticate the webhook requests, the same as the `INTAKE_EMAILS_WEBHOOK_SECRET` environment variable in your Papra instance.
3. Configure CF email routing rules to forward emails to the worker.
   a. Create a new email catch-all rule in your Cloudflare account.
   b. Set the action to trigger the worker you deployed in step 1.
4. In your Papra instance, generate some "intake emails" under the "Integrations" section and set an allowed email address to receive emails from.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.

## Credits and Acknowledgements

This project is crafted with ❤️ by [Corentin Thomasset](https://corentin.tech).
If you find this project helpful, please consider [supporting my work](https://buymeacoffee.com/cthmsst).
