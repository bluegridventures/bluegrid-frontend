import AdminDashboard from '../panel/Admin/Dashboard';
import NppesData from '../panel/Admin/NppesData';
import LeadManagement from '../panel/Admin/LeadManagement';
import SalesTeam from '../panel/Admin/SalesTeam';
import Transfers from '../panel/Admin/Transfers';
import AdminAppointments from '../panel/Admin/Appointments';
import ClientsFinance from '../panel/Admin/ClientsFinance';
import AdminReports from '../panel/Admin/Reports';
import Activity from '../panel/Admin/Activity';
import AdminSettings from '../panel/Admin/Settings';

import PlatformDashboard from '../panel/Platform/Dashboard';
import Companies from '../panel/Platform/Companies';
import Plans from '../panel/Platform/Plans';
import SubscriptionLedger from '../panel/Platform/SubscriptionLedger';
import Health from '../panel/Platform/Health';
import Imports from '../panel/Platform/Imports';
import PlatformSettings from '../panel/Platform/Settings';

import BdeDashboard from '../panel/Bde/Dashboard';
import LeadPool from '../panel/Bde/LeadPool';
import MyLeads from '../panel/Bde/MyLeads';
import IncomingTransfers from '../panel/Bde/IncomingTransfers';
import TransferredLeads from '../panel/Bde/TransferredLeads';
import FollowUps from '../panel/Bde/FollowUps';
import BdeAppointments from '../panel/Bde/Appointments';
import AchievedClients from '../panel/Bde/AchievedClients';

// Single source of truth: [label, path (relative to the portal root), element]
const defs = (base, rows) =>
  rows.map(([label, path, Page]) => ({ label, path, Page, to: path ? `${base}/${path}` : base, end: !path }));

const admin = defs('/admin', [
  ['Dashboard', '', AdminDashboard],
  ['NPPES Data', 'nppes-data', NppesData],
  ['Lead Management', 'lead-management', LeadManagement],
  ['Sales Team', 'sales-team', SalesTeam],
  ['Transfers', 'transfers', Transfers],
  ['Appointments', 'appointments', AdminAppointments],
  ['Clients & Finance', 'clients-finance', ClientsFinance],
  ['Reports', 'reports', AdminReports],
  ['Activity', 'activity', Activity],
  ['Settings', 'settings', AdminSettings],
]);

const platform = defs('/platform', [
  ['Dashboard', '', PlatformDashboard],
  ['Companies', 'companies', Companies],
  ['Plans', 'plans', Plans],
  ['Subscription Ledger', 'subscription-ledger', SubscriptionLedger],
  ['Health', 'health', Health],
  ['Imports', 'imports', Imports],
  ['Settings', 'settings', PlatformSettings],
]);

const bde = defs('/bde', [
  ['Dashboard', '', BdeDashboard],
  ['Lead Pool', 'lead-pool', LeadPool],
  ['My Leads', 'my-leads', MyLeads],
  ['Incoming Transfers', 'incoming-transfers', IncomingTransfers],
  ['Transferred Leads', 'transferred-leads', TransferredLeads],
  ['Follow-ups', 'follow-ups', FollowUps],
  ['Appointments', 'appointments', BdeAppointments],
  ['Achieved Clients', 'achieved-clients', AchievedClients],
]);

export const adminRoutes = admin;
export const platformRoutes = platform;
export const bdeRoutes = bde;

export const adminNav = admin;
export const platformNav = platform;
export const bdeNav = bde;

export const homeFor = (role) => (role === 'admin' ? '/admin' : role === 'bde' ? '/bde' : '/login');
