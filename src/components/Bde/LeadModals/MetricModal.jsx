import { Modal, Table, ProviderCell } from '../../shared';
import { useBdeStore } from '../../../store/features/bde/useBdeStore';
import { fmtLocal, getBdeRange } from '../../../utils/utils';

const TITLES = { dials: 'Total dials', connected: 'Connected calls', clients: 'Clients achieved', baa: 'BAA sent', appointments: 'Appointments set' };

export default function MetricModal({ metric, period, onClose, open }) {
  const { leads, calls } = useBdeStore();
  const [lo, hi] = getBdeRange(period);
  const inside = (t) => t >= lo && t <= hi;
  const nameOf = (id) => leads.find((l) => l.id === id)?.name;
  const link = (l) => <ProviderCell name={l.name} npi={l.npi} onClick={() => open('lead', l.id)} />;

  let rows = [];
  if (metric === 'dials' || metric === 'connected') {
    rows = calls.filter((e) => inside(e.at) && (metric === 'dials' || e.connected)).map((e) => [nameOf(e.id), fmtLocal(e.at), e.outcome]);
  } else if (metric === 'clients') {
    rows = leads.filter((l) => l.achieved && inside(l.achieved)).map((l) => [link(l), fmtLocal(l.achieved), 'BAA signed']);
  } else {
    const label = metric === 'baa' ? 'BAA sent' : 'Appointment scheduled';
    rows = leads.flatMap((l) => l.history.filter((e) => e.label === label && inside(e.at)).map((e) => [link(l), fmtLocal(e.at), e.label]));
  }
  return (
    <Modal title={TITLES[metric]} onClose={onClose}>
      <p className="mb-2 text-muted">{period}</p>
      <Table columns={['Provider', 'When', 'Outcome'].map((header, i) => ({ header, cell: (r) => r[i] }))} rows={rows} />
    </Modal>
  );
}
