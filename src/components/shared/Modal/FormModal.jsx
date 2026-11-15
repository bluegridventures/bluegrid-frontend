import { useState } from 'react';
import Modal from './index';
import Button from '../Button';
import { showToast } from '../ShowToast';
import { formToPayload } from '../../../utils/utils';

/**
 * Modal wrapping a <form>. `onSubmit(payload)` may throw Error(message) to show an inline error,
 * or return `false` to keep the modal open (e.g. when it opens another modal itself).
 */
export default function FormModal({
  title,
  subtitle,
  submitLabel = 'Save',
  successMessage = 'Demo workspace updated.',
  arrays = [],
  onClose,
  onBack,
  onSubmit,
  children,
}) {
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const result = onSubmit(formToPayload(e.currentTarget, arrays));
      if (result === false) return;
      onClose();
      if (successMessage) showToast(successMessage);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {subtitle && <p className="mb-1 text-muted">{subtitle}</p>}
        {children}
        <p role="alert" className="min-h-0 text-danger">{error}</p>
        <div className="my-3 flex flex-wrap gap-3">
          <Button variant="primary" type="submit">{submitLabel}</Button>
          {onBack && <Button onClick={onBack}>Back to lead</Button>}
        </div>
      </form>
    </Modal>
  );
}
