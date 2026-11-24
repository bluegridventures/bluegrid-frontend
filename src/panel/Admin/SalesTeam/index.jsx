import { useEffect, useState } from 'react';
import { PageHeader, Panel, Table, Button, StatusBadge, SearchBar, FilterDropdown, showToast } from '../../../components/shared';
import { useAdminModals } from '../../../components/Admin/Modals';
import { useAuthStore } from '../../../store/features/auth/useAuthStore';
import { useTeamStore } from '../../../store/features/team/useTeamStore';
import { ROLE_LABELS } from '../../../store/constant';
import useDebounce from '../../../utils/hooks/useDebounce';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...['Invited', 'Active', 'Suspended', 'Revoked'].map((s) => ({ value: s, label: s })),
];

export default function SalesTeam() {
  const tenantName = useAuthStore((s) => s.user?.tenant?.name);
  const { members, filters, isLoading, hasLoaded, error, setFilters, fetchTeam, resendInvite } = useTeamStore();
  const { open, modals } = useAdminModals();
  const [search, setSearch] = useState(filters.search);
  const debouncedSearch = useDebounce(search, 300);
  const [busyId, setBusyId] = useState(null);

  // search box (debounced) and status filter both go to the API
  useEffect(() => {
    setFilters({ search: debouncedSearch });
    fetchTeam();
  }, [debouncedSearch, filters.status, setFilters, fetchTeam]);

  const resend = async (m) => {
    setBusyId(m.id);
    try {
      await resendInvite(m.id);
      showToast(`Invitation re-sent to ${m.email}.`);
    } catch (err) {
      showToast(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const statusActions = (m) => {
    if (m.status === 'Active') return <Button onClick={() => open('suspend', m.id)}>Suspend</Button>;
    if (m.status === 'Suspended') return <Button onClick={() => open('reactivate', m.id)}>Reactivate</Button>;
    if (m.status === 'Invited') {
      return (
        <>
          <Button disabled={busyId === m.id} onClick={() => resend(m)}>Resend invite</Button>
          <Button onClick={() => open('revoke', m.id)}>Revoke invitation</Button>
        </>
      );
    }
    return null; // Revoked: no actions
  };

  return (
    <>
      <PageHeader
        eyebrow={tenantName}
        title="Sales team"
        subtitle="Manage access, claim limits and assigned leads."
        actions={<Button variant="primary" onClick={() => open('newAgent')}>Create agent</Button>}
      />
      <Panel
        title="Team directory"
        actions={
          <span className="flex flex-wrap gap-2">
            <SearchBar value={search} onChange={setSearch} placeholder="Search name or email" />
            <FilterDropdown label="Filter by status" value={filters.status} onChange={(status) => setFilters({ status })} options={STATUS_OPTIONS} />
          </span>
        }
      >
        {error && (
          <p role="alert" className="mb-3 text-danger">
            Could not load the team: {error} <Button variant="link" onClick={fetchTeam}>Retry</Button>
          </p>
        )}
        <Table
          columns={[
            { header: 'Name', cell: (m) => <Button variant="link" onClick={() => open('agent', m.id)}>{m.name}</Button> },
            { header: 'Work email', key: 'email' },
            { header: 'Role', cell: (m) => ROLE_LABELS[m.role] || m.role },
            { header: 'Claim limit / hour', key: 'claimLimitPerHour' },
            { header: 'Status', cell: (m) => <StatusBadge label={m.status} /> },
            {
              header: 'Actions',
              cell: (m) => (
                <span className="inline-flex flex-wrap gap-2">
                  {m.status !== 'Revoked' && <Button onClick={() => open('editAgent', m.id)}>Edit</Button>}
                  {statusActions(m)}
                </span>
              ),
            },
          ]}
          rows={members}
          rowKey={(m) => m.id}
          empty={isLoading && !hasLoaded ? 'Loading team…' : 'No team members match.'}
        />
      </Panel>
      {modals}
    </>
  );
}
