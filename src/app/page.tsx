'use client';

import { useEffect, useState, useRef } from 'react';
import { BlackBoxAPI } from '../lib/api';
import { JSX } from 'react/jsx-runtime';

// Types
interface App {
  id: string;
  name: string;
  display_name: string;
  status: string;
  client_count: number;
}

interface Provider {
  id: string;
  name: string;
  display_name: string;
  status: string;
  base_url: string;
  created_at: string;
  updated_at: string;
  models: Model[];
}

interface Model {
  id: string;
  name: string;
  identifier: string;
  context_window: number;
  input_cost_per_1k: number;
  output_cost_per_1k: number;
  is_active: boolean;
}

interface Client {
  id: string;
  app_id: string;
  name: string;
  email: string;
  status: string;
  plan: string;
}

interface Usage {
  date: string;
  queries: number;
  cost: number;
}

export default function Home() {
  const [currentView, setCurrentView] = useState('overview');
  const [apps, setApps] = useState<App[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [usage, setUsage] = useState<Usage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const platformKey = 'bb_platform_demo_key_change_in_prod';

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setModalOpen(false);
      }
    };

    if (modalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appsData, providersData, usageData] = await Promise.all([
        BlackBoxAPI.getApps(platformKey),
        BlackBoxAPI.getProviders(platformKey),
        BlackBoxAPI.getUsage(platformKey)
      ]);
      setApps(appsData);
      setProviders(providersData);
      setUsage(usageData.by_day || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  const openModal = (content: React.ReactNode) => {
    setModalContent(content);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="text-2xl">Loading Black Box...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-red-500">
        <div className="text-2xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-900 flex flex-col">
        <div className="border-b border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-600/20">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Black Box</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Core Engine</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-1 space-y-1 px-2 py-4">
          <NavItem icon="overview" label="Overview" active={currentView === 'overview'} onClick={() => setCurrentView('overview')} />
          <NavItem icon="apps" label="Apps" active={currentView === 'apps'} onClick={() => setCurrentView('apps')} />
          <NavItem icon="providers" label="Providers" active={currentView === 'providers'} onClick={() => setCurrentView('providers')} />
          <NavItem icon="clients" label="Clients" active={currentView === 'clients'} onClick={() => setCurrentView('clients')} />
          <NavItem icon="usage" label="Usage" active={currentView === 'usage'} onClick={() => setCurrentView('usage')} />
          <NavItem icon="system" label="System" active={currentView === 'system'} onClick={() => setCurrentView('system')} />
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-xs font-bold">
              SA
            </div>
            <div>
              <p className="text-sm font-medium">Super Admin</p>
              <p className="text-xs text-slate-500">augmex.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* HEADER */}
        <header className="z-10 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/50 px-8 backdrop-blur-sm">
          <div>
            <h2 id="page-title" className="text-lg font-semibold">Dashboard Overview</h2>
            <p id="page-subtitle" className="text-xs text-slate-500">Monitor your AI engine performance</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-[10px] font-semibold text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
              System Healthy
            </span>
            <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-semibold text-blue-400">
              Super Admin
            </span>
          </div>
        </header>

        {/* MAIN VIEW AREA */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
          {currentView === 'overview' && <OverviewView apps={apps} usage={usage} />}
          {currentView === 'apps' && <AppsView apps={apps} openModal={openModal} />}
          {currentView === 'providers' && <ProvidersView providers={providers} openModal={openModal} />}
          {currentView === 'clients' && <ClientsView clients={clients} apps={apps} openModal={openModal} />}
          {currentView === 'usage' && <UsageView usage={usage} />}
          {currentView === 'system' && <SystemView />}
        </main>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50">
          <div className="modal-backdrop absolute inset-0" onClick={closeModal}></div>
          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <div ref={modalRef} className="pointer-events-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
              {modalContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Components
function NavItem({ icon, label, active, onClick }: { icon: string; label: string; active: boolean; onClick: () => void }) {
  const icons: Record<string, JSX.Element> = {
    overview: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
      </svg>
    ),
    apps: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
      </svg>
    ),
    providers: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
      </svg>
    ),
    clients: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
      </svg>
    ),
    usage: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
      </svg>
    ),
    system: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
      </svg>
    ),
  };

  return (
    <div
      className={`flex cursor-pointer items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition-all hover:bg-slate-800 ${
        active ? 'active' : 'text-slate-400'
      }`}
      onClick={onClick}
    >
      {icons[icon]}
      <span>{label}</span>
    </div>
  );
}

function OverviewView({ apps, usage }: { apps: App[]; usage: Usage[] }) {
  useEffect(() => {
    document.getElementById('page-title')!.textContent = 'Dashboard Overview';
    document.getElementById('page-subtitle')!.textContent = 'High-level metrics and health';
  }, []);

  return (
    <>
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Queries" value={usage.reduce((sum, u) => sum + u.queries, 0).toLocaleString()} iconPath="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" color="text-blue-400" />
        <StatCard title="Total Clients" value={apps.reduce((sum, app) => sum + app.client_count, 0)} iconPath="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" color="text-purple-400" />
        <StatCard title="Active Apps" value={apps.filter(a => a.status === 'active').length} iconPath="M4 6h16M4 10h16M4 14h16M4 18h16" color="text-green-400" />
        <StatCard title="Avg Latency" value="240ms" iconPath="M13 10V3L4 14h7v7l9-11h-7z" color="text-yellow-400" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
          <h3 className="mb-4 text-md font-semibold text-slate-200">Registered Apps</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="border-b border-slate-800 px-6 py-3 text-left">App Name</th>
                  <th className="border-b border-slate-800 px-6 py-3 text-left">Status</th>
                  <th className="border-b border-slate-800 px-6 py-3 text-left">Clients</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {apps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/20">
                    <td className="px-6 py-4 font-medium">{app.display_name}</td>
                    <td className="px-6 py-4">
                      {app.status === 'active' ? (
                        <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-xs text-green-400">Active</span>
                      ) : (
                        <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs text-red-400">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400">{app.client_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm">
          <h3 className="mb-4 text-md font-semibold text-slate-200">Quick Status</h3>
          <div className="space-y-3">
            {['Qdrant Vector DB', 'Redis Cache', 'PostgreSQL', 'Celery Workers'].map((service) => (
              <div key={service} className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
                <span className="text-sm font-medium">{service}</span>
                <span className="flex items-center gap-1.5 text-xs text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>
                  Operational
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function AppsView({ apps, openModal }: { apps: App[]; openModal: (content: React.ReactNode) => void }) {
  useEffect(() => {
    document.getElementById('page-title')!.textContent = 'App Registry';
    document.getElementById('page-subtitle')!.textContent = 'Manage connected products';
  }, [apps]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 p-6">
        <div>
          <h3 className="text-lg font-semibold">Connected Apps</h3>
          <p className="mt-1 text-xs text-slate-500">Products using Black Box Engine</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="border-b border-slate-800 px-6 py-3 text-left">App Name</th>
              <th className="border-b border-slate-800 px-6 py-3 text-left">Status</th>
              <th className="border-b border-slate-800 px-6 py-3 text-left">Clients</th>
              <th className="border-b border-slate-800 px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {apps.map((app) => (
              <tr key={app.id} className="hover:bg-slate-800/20">
                <td className="px-6 py-4 font-medium">{app.display_name}</td>
                <td className="px-6 py-4">
                  {app.status === 'active' ? (
                    <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-xs text-green-400">Active</span>
                  ) : (
                    <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs text-red-400">Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-400">{app.client_count}</td>
                <td className="px-6 py-4">
                  <button className="mr-3 text-blue-400 hover:text-blue-300">Edit</button>
                  <button className="text-slate-400 hover:text-white">Config</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProvidersView({ providers, openModal }: { providers: Provider[]; openModal: (content: React.ReactNode) => void }) {
  useEffect(() => {
    document.getElementById('page-title')!.textContent = 'LLM Providers';
    document.getElementById('page-subtitle')!.textContent = 'Connected AI models';
  }, [providers]);

  return (
    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {providers.map((provider) => (
        <div key={provider.id} className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900 p-6 transition-all hover:-translate-y-0.5 hover:shadow-2xl">
          <div>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 font-bold text-slate-300">
                {provider.name[0].toUpperCase()}
              </div>
              <span className={`flex items-center gap-1 text-xs ${provider.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${provider.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                {provider.status.toUpperCase()}
              </span>
            </div>
            <h3 className="mb-1 text-lg font-semibold">{provider.display_name}</h3>
            <div className="mb-4 flex flex-wrap gap-2">
              {provider.models.map((model) => (
                <span key={model.id} className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-700">
                  {model.name}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <button className="flex-1 rounded-lg border border-slate-700 py-2 text-xs text-slate-400 transition-colors hover:bg-slate-800">
              Edit
            </button>
            <button className="flex-1 rounded-lg border border-slate-700 py-2 text-xs text-slate-400 transition-colors hover:bg-slate-800">
              Config
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ClientsView({ clients, apps, openModal }: { clients: Client[]; apps: App[]; openModal: (content: React.ReactNode) => void }) {
  useEffect(() => {
    document.getElementById('page-title')!.textContent = 'Client Directory';
    document.getElementById('page-subtitle')!.textContent = 'End-user management';
  }, [clients]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-800 p-6">
        <div>
          <h3 className="text-lg font-semibold">Global Clients</h3>
          <p className="mt-1 text-xs text-slate-500">Tenants across all applications</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/50 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="border-b border-slate-800 px-6 py-3 text-left">Client</th>
              <th className="border-b border-slate-800 px-6 py-3 text-left">Email</th>
              <th className="border-b border-slate-800 px-6 py-3 text-left">Plan</th>
              <th className="border-b border-slate-800 px-6 py-3 text-left">Status</th>
              <th className="border-b border-slate-800 px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-800/20">
                <td className="px-6 py-4">
                  <div className="font-medium">{client.name}</div>
                </td>
                <td className="px-6 py-4">{client.email}</td>
                <td className="px-6 py-4">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-xs">{client.plan}</span>
                </td>
                <td className="px-6 py-4">
                  {client.status === 'active' ? (
                    <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-xs text-green-400">Active</span>
                  ) : (
                    <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-xs text-red-400">Suspended</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button className="mr-3 text-blue-400 hover:text-blue-300">Edit</button>
                  <button className="text-slate-400 hover:text-white">Config</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsageView({ usage }: { usage: Usage[] }) {
  useEffect(() => {
    document.getElementById('page-title')!.textContent = 'Usage Analytics';
    document.getElementById('page-subtitle')!.textContent = 'Cost and performance metrics';
  }, [usage]);

  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-700 text-slate-500">
      Detailed Usage Charts (Coming Soon)
    </div>
  );
}

function SystemView() {
  useEffect(() => {
    document.getElementById('page-title')!.textContent = 'System Health';
    document.getElementById('page-subtitle')!.textContent = 'Infrastructure monitoring';
  }, []);

  const services = [
    { name: 'Qdrant Vector DB', load: '24%', memory: '4.2GB' },
    { name: 'Redis Cache', load: '12%', memory: '1.1GB' },
    { name: 'PostgreSQL', load: '8%', memory: '2.5GB' },
    { name: 'Celery Workers', load: '45%', memory: '800MB' },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {services.map((service) => (
        <div key={service.name} className="rounded-xl border border-slate-800 bg-slate-900 p-6 transition-all hover:-translate-y-0.5 hover:shadow-2xl">
          <div className="mb-6 flex items-start justify-between">
            <h3 className="text-sm font-medium text-slate-400">{service.name}</h3>
            <span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></span>
              Healthy
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">CPU Load</span>
              <span className="text-slate-300">{service.load}</span>
            </div>
            <div className="h-1 w-full rounded-full bg-slate-800">
              <div className="h-1 rounded-full bg-blue-500" style={{ width: service.load }}></div>
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <span className="text-slate-500">Memory</span>
              <span className="text-slate-300">{service.memory}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ title, value, iconPath, color }: { title: string; value: string | number; iconPath: string; color: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-2xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-slate-100">{value}</h3>
        </div>
        <div className="rounded-lg bg-slate-800 p-2">
          <svg className={`h-6 w-6 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={iconPath}></path>
          </svg>
        </div>
      </div>
    </div>
  );
}