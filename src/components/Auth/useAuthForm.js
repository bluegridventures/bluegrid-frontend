import { useState } from 'react';

/**
 * Small form helper for the auth screens.
 *   const form = useAuthForm({ email: '' }, (v) => ({ email: validateEmail(v.email) }));
 *   <form onSubmit={form.submit(async (v) => { await doSomething(v); })}>
 * - runs the client validation first
 * - if the action throws, maps 422 `details[]` to field errors, otherwise shows error.message
 */
export default function useAuthForm(initial, validate) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const set = (name) => (value) => {
    setValues((p) => ({ ...p, [name]: value }));
    setErrors((p) => (p[name] ? { ...p, [name]: '' } : p));
  };

  const submit = (action) => async (e) => {
    e.preventDefault();
    setFormError('');
    const found = validate(values);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    try {
      await action(values);
    } catch (err) {
      const fieldErrors = {};
      const leftovers = [];
      (err.details || []).forEach((d) => {
        const key = String(d.field || '').split('.').pop();
        if (key in values) fieldErrors[key] = d.message;
        else if (d.message) leftovers.push(d.message);
      });
      setErrors(fieldErrors);
      setFormError(Object.keys(fieldErrors).length ? leftovers.join(' ') : err.message || 'Something went wrong. Please try again.');
    }
  };

  return { values, errors, formError, set, setValues, setErrors, setFormError, submit };
}
