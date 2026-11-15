import { useState } from 'react';
import { FormModal, Field, SelectField, TextAreaField, KeyValueList } from '../../shared';
import { useBdeStore } from '../../../store/features/bde/useBdeStore';
import { isPending } from '../../../store/features/bde/bdeFns';
import { MEETING_OUTCOMES } from '../../../utils/data';
import { fmtLocal } from '../../../utils/utils';

const SAVED = 'Saved to your demo workspace.';
const when = (label) => <Field label={`${label} (your local time)`} name="at" type="datetime-local" />;

export function HandoffModal({ lead, onClose, open }) {
  const requestHandoff = useBdeStore((s) => s.requestHandoff);
  return (
    <FormModal title="Transfer or share" subtitle={lead.name} successMessage={SAVED} onClose={onClose} onBack={() => open('lead', lead.id)} onSubmit={(p) => requestHandoff({ leadId: lead.id, ...p })}>
      <SelectField label="Action" name="operation" options={isPending(lead) ? ['Share read-only'] : ['Request transfer', 'Share read-only']} />
      <SelectField label="Team member" name="to" options={['Maya', 'Moe']} />
      <Field label="Reason" name="reason" />
      <TextAreaField label="Handoff note" maxLength={1200} />
    </FormModal>
  );
}

export function ContactModal({ lead, onClose, open }) {
  const addContact = useBdeStore((s) => s.addContact);
  const [kind, setKind] = useState('Phone');
  return (
    <FormModal title="Add sales contact" subtitle={lead.name} submitLabel="Add contact" successMessage={SAVED} onClose={onClose} onBack={() => open('lead', lead.id)} onSubmit={(p) => addContact({ leadId: lead.id, ...p })}>
      <SelectField label="Contact type" name="kind" options={['Phone', 'Email']} onChange={setKind} />
      <Field key={kind} label={kind === 'Email' ? 'Email address' : 'Phone number'} name="value" type={kind === 'Email' ? 'email' : 'tel'} />
      <Field label="Source" name="source" />
      <SelectField label="Verification" name="verified" options={['Unverified', 'Verified professional contact']} />
    </FormModal>
  );
}

export function RejectModal({ lead, onClose }) {
  const rejectTransfer = useBdeStore((s) => s.rejectTransfer);
  return (
    <FormModal title="Reject transfer" subtitle={lead.name} submitLabel="Reject transfer" successMessage={SAVED} onClose={onClose} onSubmit={(p) => rejectTransfer({ leadId: lead.id, note: p.note })}>
      <TextAreaField label="Reason for rejection" maxLength={1200} />
    </FormModal>
  );
}

export function RescheduleModal({ lead, onClose, open }) {
  const reschedule = useBdeStore((s) => s.rescheduleFollowUp);
  return (
    <FormModal title="Reschedule follow-up" subtitle={lead.name} submitLabel="Reschedule" successMessage={SAVED} onClose={onClose} onBack={() => open('lead', lead.id)} onSubmit={(p) => reschedule({ leadId: lead.id, ...p })}>
      {when('New follow-up')}
      <TextAreaField label="Reason for rescheduling" maxLength={1200} />
    </FormModal>
  );
}

export function CompleteModal({ lead, onClose, open }) {
  const complete = useBdeStore((s) => s.completeFollowUp);
  return (
    <FormModal title="Complete follow-up" subtitle={lead.name} submitLabel="Mark complete" successMessage={SAVED} onClose={onClose} onBack={() => open('lead', lead.id)} onSubmit={(p) => complete({ leadId: lead.id, note: p.note })}>
      <TextAreaField label="Completion note" maxLength={1200} />
    </FormModal>
  );
}

export function MeetingModal({ lead, onClose, open }) {
  const updateMeeting = useBdeStore((s) => s.updateMeeting);
  const steps = lead.status === 'BAA sent' ? ['Record BAA signed'] : ['Confirm meeting', 'Reschedule meeting', 'Mark no-show', 'Record outcome', 'Record BAA sent'];
  const [step, setStep] = useState(steps[0]);
  const [result, setResult] = useState(MEETING_OUTCOMES[0]);
  const a = lead.appt;
  return (
    <FormModal title="Manage meeting" subtitle={lead.name} submitLabel="Save update" successMessage={SAVED} onClose={onClose} onBack={() => open('lead', lead.id)} onSubmit={(p) => updateMeeting({ leadId: lead.id, ...p })}>
      <KeyValueList
        items={{
          'Meeting time': fmtLocal(a.at),
          'Meeting link': a.link,
          'Provider email': a.email,
          'Meeting participants': a.participants.join(', '),
          'Meeting comment': a.comment,
          Status: a.status,
        }}
      />
      <SelectField label="Next action" name="step" options={steps} onChange={setStep} />
      <div key={step}>
        {step === 'Confirm meeting' && <SelectField label="Confirmation channel" name="channel" options={['Calendar invite accepted', 'Email reply', 'Phone confirmation']} />}
        {step === 'Reschedule meeting' && (
          <>
            {when('New meeting time')}
            <Field label="Reason" name="reason" />
          </>
        )}
        {step === 'Record outcome' && (
          <>
            <SelectField label="Meeting outcome" name="result" options={MEETING_OUTCOMES} onChange={setResult} />
            {['Follow-up required', 'Additional meeting required'].includes(result) && when(result === 'Follow-up required' ? 'Follow-up' : 'Additional meeting')}
          </>
        )}
        <TextAreaField label="Comment" maxLength={1200} />
      </div>
    </FormModal>
  );
}
