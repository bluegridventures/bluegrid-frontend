import { useState } from 'react';
import { FormModal, Field, SelectField, TextAreaField, CheckboxGroup } from '../../shared';
import { useBdeStore } from '../../../store/features/bde/useBdeStore';
import { BDE_SERVICES, CALL_OUTCOMES, NOT_INTERESTED_REASONS } from '../../../utils/data';

const when = (label) => <Field label={`${label} (your local time)`} name="at" type="datetime-local" />;

function OutcomeFields({ lead, outcome }) {
  const phones = lead.phones.filter((p) => p.ok).map((p) => p.value);
  return (
    <>
      <CheckboxGroup legend={outcome === 'Wrong number' ? 'Identify wrong number(s)' : 'Dialed number(s)'} name="phones" options={phones} />
      {outcome === 'No response' && <SelectField label="Voicemail left" name="vm" options={['No', 'Yes']} />}
      {outcome === 'Wrong number' && <Field label="Replacement phone (optional)" name="replacement" type="tel" required={false} />}
      {outcome === 'Gatekeeper block' && (
        <>
          <Field label="Gatekeeper name" name="gatekeeper" />
          <Field label="Proposed follow-up (optional)" name="at" type="datetime-local" required={false} />
          <Field label="Additional phone (optional)" name="replacement" type="tel" required={false} />
        </>
      )}
      {outcome === 'Do not call' && <SelectField label="Reason" name="reason" options={['Customer said do not call', 'Requested removal']} />}
      {outcome === 'Not interested' && (
        <>
          <SelectField label="Reason" name="reason" options={NOT_INTERESTED_REASONS} />
          <SelectField label="Recontact" name="recycle" options={['Never again', 'After 3 months', 'After 6 months']} />
        </>
      )}
      {outcome === 'Callback' && (
        <>
          {when('Callback')}
          <Field label="Callback reason" name="reason" />
          <SelectField label="Contact person" name="person" options={['Provider', 'Manager', 'Front desk', 'Other']} />
        </>
      )}
      {outcome === 'Showing interest' && (
        <>
          {when('Follow-up')}
          <CheckboxGroup legend="Interested services" name="services" options={BDE_SERVICES} />
        </>
      )}
      {outcome === 'Appointment scheduled' && (
        <>
          <Field label="Provider email" name="email" type="email" defaultValue={lead.email} />
          {when('Meeting')}
          <Field label="Meeting link" name="link" type="url" />
          <CheckboxGroup legend="Services" name="services" options={BDE_SERVICES} />
          <CheckboxGroup legend="Optional participants" name="participants" options={['Maya', 'Moe']} />
        </>
      )}
      <TextAreaField label={outcome === 'Gatekeeper block' ? 'What did the gatekeeper say?' : 'Call note'} maxLength={1200} />
    </>
  );
}

export default function DispositionModal({ lead, onClose, open }) {
  const record = useBdeStore((s) => s.recordDisposition);
  const [outcome, setOutcome] = useState(CALL_OUTCOMES[0]);
  if (!lead.phones.some((p) => p.ok)) {
    // no callable number — send the rep to add a contact instead
    return (
      <FormModal title="Record disposition" subtitle={lead.name} submitLabel="Add contact" successMessage="" onClose={onClose} onBack={() => open('lead', lead.id)} onSubmit={() => { open('contact', lead.id); return false; }}>
        <p className="my-2 text-danger">Add a callable phone first.</p>
      </FormModal>
    );
  }
  return (
    <FormModal
      title="Record disposition"
      subtitle={lead.name}
      submitLabel="Save disposition"
      successMessage="Saved to your demo workspace."
      arrays={['phones', 'services', 'participants']}
      onClose={onClose}
      onBack={() => open('lead', lead.id)}
      onSubmit={(p) => record({ leadId: lead.id, ...p })}
    >
      <SelectField label="Call outcome" name="outcome" options={CALL_OUTCOMES} onChange={setOutcome} />
      <OutcomeFields key={outcome} lead={lead} outcome={outcome} />
    </FormModal>
  );
}
