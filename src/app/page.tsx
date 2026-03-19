'use client';

import { useEffect, useState } from 'react';
import { BlackBoxAPI } from '../lib/api';

interface App {
  id: string;
  name: string;
  display_name: string;
  status: string;
  client_count: number;
}

interface Usage {
  date: string;
  queries: number;
  cost: number;
}

export default function Home() {
  const [apps, setApps] = useState<App[]>([]);
  const [usage, setUsage] = useState<Usage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const platformKey = 'bb_platform_demo_key_change_in_prod';
    
    Promise.all([
      BlackBoxAPI.getApps(platformKey),
      BlackBoxAPI.getUsage(platformKey)
    ])
      .then(([appsData, usageData]) => {
        setApps(appsData);
        setUsage(usageData.by_day || []);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load data');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-2xl text-zinc-600 dark:text-zinc-400">
          Loading Black Box...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-2xl text-red-600">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black">
      <header className="border-b border-zinc-200 bg-white px-8 py-4 dark:border-zinc-800 dark:bg-black">
        <h1 className="text-2xl font-bold text-black dark:text-white">
          Black Box Admin
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Multi-tenant AI Engine Management
        </p>
      </header>

      <main className="flex-1 p-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 text-lg font-semibold text-black dark:text-white">
              Total Apps
            </h2>
            <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              {apps.length}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 text-lg font-semibold text-black dark:text-white">
              Total Clients
            </h2>
            <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
              {apps.reduce((sum, app) => sum + app.client_count, 0)}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-4 text-lg font-semibold text-black dark:text-white">
              Active Apps
            </h2>
            <p className="text-4xl font-bold text-green-600">
              {apps.filter(app => app.status === 'active').length}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
            Applications
          </h2>
          <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            {apps.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 last:border-b-0 dark:border-zinc-800"
              >
                <div>
                  <h3 className="text-lg font-medium text-black dark:text-white">
                    {app.display_name}
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    ID: {app.name} • Status: {app.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {app.client_count} clients
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {usage.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
              Usage History (Last 10 Days)
            </h2>
            <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              {usage.map((day) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 last:border-b-0 dark:border-zinc-800"
                >
                  <p className="text-black dark:text-white">{day.date}</p>
                  <div className="flex gap-8">
                    <p className="text-zinc-900 dark:text-zinc-50">
                      <span className="font-semibold">{day.queries}</span> queries
                    </p>
                    <p className="text-zinc-900 dark:text-zinc-50">
                      <span className="font-semibold">${day.cost}</span> cost
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}