import { PageHeader, Panel, Table, Button, StatusBadge } from '../../../components/shared';
import { useAdminModals } from '../../../components/Admin/Modals';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';

export default function SalesTeam() {
  const { name, agents } = useAdminStore();
  const { open, modals } = useAdminModals();

  const statusAction = (a) =>
    a.status === 'Revoked' ? null : a.status === 'Suspended' ? (
      <Button onClick={() => open('reactivate', a.id)}>Reactivate</Button>
    ) : a.status === 'Invited' ? (
      <Button onClick={() => open('revoke', a.id)}>Revoke invitation</Button>
    ) : (
      <Button onClick={() => open('suspend', a.id)}>Suspend</Button>
    );

  return (
    <>
      <PageHeader
        eyebrow={name}
        title="Sales team"
        subtitle="Manage access, claim limits and assigned leads."
        actions={<Button variant="primary" onClick={() => open('newAgent')}>Create agent</Button>}
      />
      <Panel title="Team directory">
        <Table
          columns={[
            { header: 'Name', cell: (a) => <Button variant="link" onClick={() => open('agent', a.id)}>{a.name}</Button> },
            { header: 'Work email', key: 'email' },
            { header: 'Role', key: 'role' },
            { header: 'Claim limit / hour', key: 'quota' },
            { header: 'Status', cell: (a) => <StatusBadge label={a.status} /> },
            {
              header: 'Actions',
              cell: (a) => (
                <span className="inline-flex gap-2">
                  <Button onClick={() => open('editAgent', a.id)}>Edit</Button>
                  {statusAction(a)}
                </span>
              ),
            },
          ]}
          rows={agents}
          rowKey={(a) => a.id}
        />
      </Panel>
      {modals}
    </>
  );
}
