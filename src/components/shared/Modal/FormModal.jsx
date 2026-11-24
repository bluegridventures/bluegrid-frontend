import { useState } from 'react';
import Modal from './index';
import Button from '../Button';
import Spinner from '../Spinner';
import { showToast } from '../ShowToast';
import { formToPayload } from '../../../utils/utils';
import { FormErrorsContext, errorsFromDetails } from './FormErrors';

/**
 * Modal wrapping a <form>. `onSubmit(payload)` may be sync or async.
 *  - throw Error(message)        -> shown under the form
 *  - throw ApiError with details -> each details[] item is shown under its field (input `name` = API field)
 *  - throw err with .fieldErrors -> same, explicit { field: message }
 *  - return false                -> keep the modal open (e.g. it opened another modal itself)
 * While an async submit runs the button is disabled. `successMessage` can be a string or (result) => string.
 */
export default function FormModal({
  title,
  subtitle,
  submitLabel = 'Save',
  successMessage = 'Demo workspace updated.',
  arrays = [],
  submitDisabled = false,
  onClose,
  onBack,
  onSubmit,
  children,
}) {
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = formToPayload(e.currentTarget, arrays);
    setError('');
    setFieldErrors({});
    setBusy(true);
    try {
      const result = await onSubmit(payload);
      if (result === false) return;
      onClose();
      const message = typeof successMessage === 'function' ? successMessage(result) : successMessage;
      if (message) showToast(message);
    } catch (err) {
      const fields = err.fieldErrors || errorsFromDetails(err.details);
      setFieldErrors(fields);
      setError(err.fieldErrors ? '' : err.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose}>
      <FormErrorsContext.Provider value={fieldErrors}>
        <form onSubmit={handleSubmit}>
          {subtitle && <p className="mb-1 text-muted">{subtitle}</p>}
          {children}
          <p role="alert" className="min-h-0 text-danger">{error}</p>
          <div className="my-3 flex flex-wrap gap-3">
            <Button variant="primary" type="submit" disabled={busy || submitDisabled} className="flex items-center gap-2">
              {busy && <Spinner />} {submitLabel}
            </Button>
            {onBack && <Button onClick={onBack}>Back to lead</Button>}
          </div>
        </form>
      </FormErrorsContext.Provider>
    </Modal>
  );
}
