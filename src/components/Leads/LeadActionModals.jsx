import { useState } from 'react';
import { FormModal, Field, SelectField, TextAreaField } from '../shared';
import { useLeadDetailStore } from '../../store/features/leads/useLeadDetailStore';
import { useMembersPicker } from '../../store/features/team/useMembersStore';

const leadName = (id) => useLeadDetailStore.getState().detail?.lead.name;

/** POST /leads/:id/contacts. Phone needs a source; Email is just the address. */
export function ApiContactModal({ id, onClose, open }) {
  const addContact = useLeadDetailStore((s) => s.addContact);
  const [kind, setKind] = useState('Phone');
  const onSubmit = (p) =>
    addContact(
      id,
      kind === 'Email'
        ? { kind: 'Email', value: p.value.trim() }
        : { kind: 'Phone', value: p.value.trim(), source: p.source.trim(), verified: p.verified },
    );
  return (
    <FormModal
      title="Add sales contact"
      subtitle={leadName(id)}
      submitLabel="Add contact"
      successMessage="Contact added."
      onClose={onClose}
      onBack={() => open('lead', id)}
      onSubmit={onSubmit}
    >
      <SelectField label="Contact type" name="kind" options={['Phone', 'Email']} onChange={setKind} />
      <Field key={kind} label={kind === 'Email' ? 'Email address' : 'Phone number'} name="value" type={kind === 'Email' ? 'email' : 'tel'} />
      {kind === 'Phone' && (
        <>
          <Field label="Source" name="source" maxLength={120} />
          <SelectField label="Verification" name="verified" options={['Unverified', 'Verified professional contact']} />
        </>
      )}
    </FormModal>
  );
}

/**
 * "Share read-only" calls POST /leads/:id/share. "Request transfer" belongs to the Transfers step and is not
 * connected yet, so picking it explains that instead of calling anything.
 */
export function ApiShareModal({ id, onClose, open }) {
  const shareLead = useLeadDetailStore((s) => s.shareLead);
  const { members, isLoading, error } = useMembersPicker({ excludeSelf: true });
  return (
    <FormModal
      title="Transfer or share"
      subtitle={leadName(id)}
      submitLabel="Confirm"
      successMessage="Shared read-only."
      onClose={onClose}
      onBack={() => open('lead', id)}
      onSubmit={(p) => {
        if (p.operation !== 'Share read-only') {
          // TODO(Transfers step): POST the transfer request here. Until then it is not available for real leads.
          throw Error('Transfer requests are connected in the Transfers step. Use "Share read-only" for now.');
        }
        return shareLead(id, { userId: p.userId, note: p.note.trim() });
      }}
    >
      <SelectField label="Action" name="operation" options={['Share read-only', 'Request transfer']} />
      <SelectField
        label="Team member"
        name="userId"
        placeholder={isLoading && !members.length ? 'Loading team…' : 'Select team member'}
        options={members.map((m) => ({ value: m.id, label: m.name }))}
      />
      {error && <p className="text-danger">Could not load team members: {error}</p>}
      <TextAreaField label="Note" maxLength={1200} />
    </FormModal>
  );
}
