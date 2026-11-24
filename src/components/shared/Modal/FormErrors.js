import { createContext, useContext } from 'react';

/** FormModal publishes { fieldName: message } here; Field / SelectField / TextAreaField show their own. */
export const FormErrorsContext = createContext({});
export const useFieldError = (name) => useContext(FormErrorsContext)[name];

/** details[] from a 422 -> { email: '...' } (uses the last segment of "body.email"). */
export const errorsFromDetails = (details = []) =>
  details.reduce((acc, d) => {
    const key = String(d.field || '').split('.').pop();
    if (key && d.message && !acc[key]) acc[key] = d.message;
    return acc;
  }, {});
