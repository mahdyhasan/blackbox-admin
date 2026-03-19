const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchBlackBox(endpoint: string, apiKey: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const BlackBoxAPI = {
  getApps: (key: string) => fetchBlackBox('/admin/v1/apps', key),
  getClients: (key: string, appId: string) => fetchBlackBox(`/admin/v1/apps/${appId}/clients`, key),
  getProviders: (key: string) => fetchBlackBox('/admin/v1/providers', key),
  getUsage: (key: string) => fetchBlackBox('/admin/v1/usage', key),
};