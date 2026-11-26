import { useCallback, useState } from 'react';
import { LeadDetailModal, AgentDetailModal } from './LeadAgentModals';
import LeadDetailDialog from '../../Leads/LeadDetailDialog';
import { ReassignModal, AgentFormModal, AgentStatusModal, CancelTransferModal } from './TeamModals';
import { RulesModal, PrepareBatchModal, BatchPreviewModal, ZipInspectModal } from './ImportModals';
import {
  NewMeetingModal, ManageMeetingModal, FinanceStepModal, CompanySettingsModal,
  TenantModal, PlanModal, LedgerModal, PlatformSettingsModal,
} from './WorkflowModals';

/**
 * One modal host for the whole admin console.
 *   const { open, modals } = useAdminModals();
 *   <Button onClick={() => open('assign', leadId)} />  …  {modals}
 */
export function useAdminModals() {
  const [m, setM] = useState(null);
  const close = useCallback(() => setM(null), []);
  const open = useCallback((type, id = null) => setM({ type, id }), []);
  const p = { onClose: close, open };
  let el = null;
  if (m) {
    switch (m.type) {
      // API leads have string ids (real detail); demo leads have numeric ids
      case 'lead': el = typeof m.id === 'string' ? <LeadDetailDialog id={m.id} {...p} /> : <LeadDetailModal id={m.id} {...p} />; break;
      case 'agent': el = <AgentDetailModal id={m.id} {...p} />; break;
      case 'assign': el = <ReassignModal ids={[m.id]} {...p} />; break;
      case 'bulk': el = <ReassignModal ids={m.id} {...p} />; break;
      case 'newAgent': el = <AgentFormModal {...p} />; break;
      case 'editAgent': el = <AgentFormModal id={m.id} {...p} />; break;
      case 'suspend':
      case 'reactivate':
      case 'revoke': el = <AgentStatusModal id={m.id} action={m.type} {...p} />; break;
      case 'cancelTransfer': el = <CancelTransferModal id={m.id} {...p} />; break;
      case 'rules': el = <RulesModal {...p} />; break;
      case 'prepare': el = <PrepareBatchModal {...p} />; break;
      case 'batch': el = <BatchPreviewModal id={m.id} {...p} />; break;
      case 'zip': el = <ZipInspectModal {...p} />; break;
      case 'newMeeting': el = <NewMeetingModal {...p} />; break;
      case 'meeting': el = <ManageMeetingModal id={m.id} {...p} />; break;
      case 'financial': el = <FinanceStepModal leadId={m.id} {...p} />; break;
      case 'settings': el = <CompanySettingsModal {...p} />; break;
      case 'tenant': el = <TenantModal id={m.id} {...p} />; break;
      case 'plan': el = <PlanModal index={m.id} {...p} />; break;
      case 'ledger': el = <LedgerModal {...p} />; break;
      case 'platformSettings': el = <PlatformSettingsModal {...p} />; break;
      default: el = null;
    }
  }
  return { open, close, modals: el };
}
