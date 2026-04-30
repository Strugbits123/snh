import { createClient, ApiKeyStrategy, OAuthStrategy } from '@wix/sdk';
import { products, collections } from '@wix/stores';
import { posts } from '@wix/blog';
import { checkout } from '@wix/ecom';
import { contacts } from '@wix/crm';
import { submissions } from '@wix/forms';
import { items } from '@wix/data';
import { redirects } from '@wix/redirects';

// In Next.js, we prefer API Key for server-side and OAuth for client-side.
// However, to maintain current logic, we allow using the API Key if present.
const apiKey = process.env.WIX_API_KEY || process.env.NEXT_PUBLIC_WIX_API_KEY;
const siteId = process.env.WIX_SITE_ID || process.env.NEXT_PUBLIC_WIX_SITE_ID;
const clientId = process.env.WIX_CLIENT_ID || process.env.NEXT_PUBLIC_WIX_CLIENT_ID;

export const wixClient = createClient({
  modules: {
    products,
    collections,
    posts,
    checkout,
    contacts,
    submissions,
    items,
    redirects,
  },
  auth: (clientId && clientId !== "dsd")
    ? OAuthStrategy({ clientId })
    : ApiKeyStrategy({ apiKey: apiKey || "", siteId: siteId || "" }),
});
