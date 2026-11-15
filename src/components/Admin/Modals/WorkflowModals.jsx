import { useState } from 'react';
import { FormModal, Field, SelectField, TextAreaField, KeyValueList, FormRow } from '../../shared';
import { useAdminStore } from '../../../store/features/admin/useAdminStore';
import { isFixed, nextStep } from '../../../store/features/admin/adminFns';
import { ADMIN_SERVICES, MEETING_NEEDS_TIME, MEETING_UPDATES, TIMEZONES } from '../../../utils/data';
import { fmtZone, money } from '../../../utils/utils';

export function NewMeetingModal({ onClose }) {
  const { leads, meetings, scheduleMeeting } = useAdminStore();
  const eligible = leads.filter((l) => l.owner && !isFixed(l) && !meetings.some((m) => m.lead === l.id));
  return (
    <FormModal title="Schedule appointment" submitLabel="Schedule meeting" onClose={onClose} onSubmit={scheduleMeeting}>
      <SelectField label="Provider" name="lead" options={eligible.map((l) => ({ value: l.id, label: l.name }))} />
      <Field label="Provider email" name="email" type="email" />
      <Field label="Meeting time (browser timezone)" name="at" type="datetime-local" />
      <Field label="Meeting URL" name="url" type="url" />
      <SelectField label="Service" name="service" options={ADMIN_SERVICES} />
      <Field label="Participants (optional)" name="participants" required={false} />
      <TextAreaField label="Meeting notes" />
    </FormModal>
  );
}

export function ManageMeetingModal({ id, onClose }) {
  const { meetings, leads, zone, updateMeeting } = useAdminStore();
  const [status, setStatus] = useState(MEETING_UPDATES[0]);
  const m = meetings.find((x) => x.id === Number(id));
  const l = leads.find((x) => x.id === m.lead);
  return (
    <FormModal title="Manage appointment" onClose={onClose} onSubmit={(p) => updateMeeting({ id: m.id, ...p })}>
      <KeyValueList
        items={{ Provider: l.name, 'Meeting time': fmtZone(m.at, zone), 'Meeting URL': m.link, Participants: m.participants, Notes: m.note }}
      />
      <SelectField label="Update" name="status" options={MEETING_UPDATES} onChange={setStatus} />
      {MEETING_NEEDS_TIME.includes(status) && <Field label="New time (browser timezone)" name="at" type="datetime-local" />}
      <TextAreaField label="Update note" />
    </FormModal>
  );
}

export function FinanceStepModal({ leadId, onClose }) {
  const { clients, leads, zone, recordFinancialStep } = useAdminStore();
  const c = clients.find((x) => x.lead === Number(leadId));
  const step = nextStep(c);
  return (
    <FormModal title={step} submitLabel="Record action" onClose={onClose} onSubmit={(p) => recordFinancialStep({ leadId: c.lead, ...p })}>
      <KeyValueList
        items={{
          Client: leads.find((l) => l.id === c.lead).name,
          'BAA signed': fmtZone(c.signed, zone),
          'Invoice amount': c.invoice === null ? '—' : money(c.invoice),
        }}
      />
      {step === 'Send invoice' && (
        <>
          <Field label="Invoice amount (USD)" name="amount" type="number" min="0.01" step="0.01" />
          <Field label="Due date (optional)" name="due" type="date" required={false} />
        </>
      )}
      <TextAreaField label="Internal note" />
      <p className="my-2 text-muted">Records the action in the demo ledger. Document delivery is external.</p>
    </FormModal>
  );
}

export function CompanySettingsModal({ onClose }) {
  const { name, zone, quota, updateSettings } = useAdminStore();
  return (
    <FormModal title="Edit company settings" onClose={onClose} onSubmit={updateSettings}>
      <Field label="Company name" name="name" defaultValue={name} />
      <SelectField label="Reporting timezone" name="zone" options={TIMEZONES} defaultValue={zone} />
      <Field label="Default hourly claim limit" name="quota" type="number" defaultValue={quota} min="1" max="500" />
    </FormModal>
  );
}

/* ---- platform ---- */
export function TenantModal({ id, onClose }) {
  const { tenants, plans, saveTenant } = useAdminStore();
  const t = id ? tenants.find((x) => x.id === Number(id)) : null;
  return (
    <FormModal title={t ? 'Manage company' : 'Create company'} onClose={onClose} onSubmit={(p) => saveTenant({ ...p, id: t?.id })}>
      <Field label="Company name" name="name" defaultValue={t?.name} />
      <Field label="Workspace slug" name="slug" defaultValue={t?.slug} pattern="[a-z0-9-]+" />
      <Field label="Billing contact" name="email" type="email" defaultValue={t?.email} />
      <FormRow>
        <SelectField label="Plan" name="plan" options={plans.map((p) => p.name)} defaultValue={t?.plan} />
        <SelectField label="Account status" name="status" options={['Trial', 'Active', 'Past due', 'Suspended']} defaultValue={t?.status} />
        <Field label="Seat limit" name="seats" type="number" defaultValue={t?.seats || 5} min="1" />
        <Field label="Storage limit (GB)" name="storage" type="number" defaultValue={t?.storage || 10} min="1" />
        <Field label="Monthly import limit" name="limit" type="number" defaultValue={t?.limit || 4} min="1" />
      </FormRow>
    </FormModal>
  );
}

export function PlanModal({ index, onClose }) {
  const { plans, savePlan } = useAdminStore();
  const isNew = index === '' || index == null;
  const p = isNew ? null : plans[Number(index)];
  return (
    <FormModal title={p ? 'Edit plan' : 'Create plan'} onClose={onClose} onSubmit={(v) => savePlan({ ...v, index: isNew ? '' : index })}>
      <Field label="Plan name" name="name" defaultValue={p?.name} />
      <Field label="Setup fee (USD)" name="setup" type="number" defaultValue={p?.setup ?? 0} min="0" step=".01" />
      <Field label="Monthly fee (USD)" name="monthly" type="number" defaultValue={p?.monthly ?? 0} min="0" step=".01" />
    </FormModal>
  );
}

export function LedgerModal({ onClose }) {
  const { tenants, addLedgerEntry } = useAdminStore();
  return (
    <FormModal title="Record subscription entry" onClose={onClose} onSubmit={addLedgerEntry}>
      <SelectField label="Company" name="company" options={tenants.map((t) => t.name)} />
      <SelectField label="Charge type" name="kind" options={['Setup fee', 'Monthly subscription']} />
      <Field label="Amount (USD)" name="amount" type="number" min=".01" step=".01" />
      <Field label="Payment reference" name="ref" />
    </FormModal>
  );
}

export function PlatformSettingsModal({ onClose }) {
  const { platformName, savePlatformName } = useAdminStore();
  return (
    <FormModal title="Platform settings" onClose={onClose} onSubmit={savePlatformName}>
      <Field label="Display name" name="name" defaultValue={platformName} />
    </FormModal>
  );
}
