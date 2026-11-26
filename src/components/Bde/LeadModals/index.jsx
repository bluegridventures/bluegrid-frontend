import { useCallback, useState } from 'react';
import LeadDetailModal from './LeadDetailModal';
import DispositionModal from './DispositionModal';
import { HandoffModal, ContactModal, RejectModal, RescheduleModal, CompleteModal, MeetingModal } from './ActionModals';
import MetricModal from './MetricModal';
import { useBdeStore } from '../../../store/features/bde/useBdeStore';
import { isOwned, isPending } from '../../../store/features/bde/bdeFns';
import { showToast } from '../../shared';
import { claimPoolLeads } from '../../../store/features/nppes/nppesActions';
import LeadDetailDialog from '../../Leads/LeadDetailDialog';
import { ApiContactModal, ApiShareModal } from '../../Leads/LeadActionModals';

/**
 * Single modal host for the BDE workspace.
 *   const { open, modals } = useLeadModals();
 *   open('lead', id) · open('call', id) · open('metric', 'dials', { period }) …  {modals}
 * Direct (no-form) actions — claim / accept / cancel — are handled here too.
 */
export function useLeadModals() {
  const [m, setM] = useState(null);
  const { leads, acceptTransfer, cancelTransfer } = useBdeStore();
  const close = useCallback(() => setM(null), []);

  const open = useCallback(
    (type, id = null, extra = {}) => {
      const lead = useBdeStore.getState().leads.find((l) => l.id === Number(id));
      const run = (fn, msg) => {
        try {
          fn();
          if (msg) showToast(msg);
        } catch (err) {
          showToast(err.message);
        }
        setM(null);
      };
      if (type === 'claim') return run(() => {
        const n = claimPoolLeads([Number(id)]);
        showToast(`${n} of 1 claimed.`);
      });
      if (type === 'claimMany') return run(() => {
        const n = claimPoolLeads(id);
        showToast(`${n} of ${id.length} claimed.`);
      });
      if (type === 'accept') return run(() => acceptTransfer({ leadId: id }), 'Lead added to My Leads.');
      if (type === 'cancel') return run(() => cancelTransfer({ leadId: id }));
      // form actions require ownership (reject only requires being the recipient of a pending transfer)
      const formTypes = ['call', 'handoff', 'contact', 'reschedule', 'complete', 'meeting'];
      if (formTypes.includes(type) && lead && !isOwned(lead)) return showToast('Only the current owner can edit this lead.');
      if (type === 'reject' && lead && !isPending(lead)) return showToast('This request is no longer pending.');
      setM({ type, id, extra });
    },
    [acceptTransfer, cancelTransfer],
  );

  const lead = m ? leads.find((l) => l.id === Number(m.id)) : null;
  const p = { onClose: close, open };
  let el = null;
  if (m) {
    // real (API) leads have 24-char string ids; the demo data (dashboards, follow-ups...) uses numbers
    if (m.type === 'lead' && typeof m.id === 'string') el = <LeadDetailDialog id={m.id} {...p} />;
    else if (m.type === 'apiContact') el = <ApiContactModal id={m.id} {...p} />;
    else if (m.type === 'apiShare') el = <ApiShareModal id={m.id} {...p} />;
    else if (m.type === 'metric') el = <MetricModal metric={m.id} period={m.extra.period} {...p} />;
    else if (m.type === 'lead') el = <LeadDetailModal id={m.id} {...p} />;
    else if (lead) {
      const forms = { call: DispositionModal, handoff: HandoffModal, contact: ContactModal, reject: RejectModal, reschedule: RescheduleModal, complete: CompleteModal, meeting: MeetingModal };
      const Form = forms[m.type];
      el = Form ? <Form lead={lead} {...p} /> : null;
    }
  }
  return { open, close, modals: el };
}
