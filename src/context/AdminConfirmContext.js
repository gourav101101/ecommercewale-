'use client';

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import styles from '@/components/ui/ConfirmDialog/ConfirmDialog.module.css';

const AdminConfirmContext = createContext(null);

export function AdminConfirmProvider({ children }) {
  const [request, setRequest] = useState(null);
  const pending = useRef(null);
  const confirm = useCallback(options => {
    // A second click must never create another pending mutation.
    if (pending.current) return Promise.resolve(false);
    return new Promise(resolve => {
      pending.current = resolve;
      setRequest(options);
    });
  }, []);
  const finish = useCallback(accepted => {
    const resolve = pending.current;
    pending.current = null;
    setRequest(null);
    resolve?.(accepted);
  }, []);
  useEffect(() => () => { pending.current?.(false); pending.current = null; }, []);
  return <AdminConfirmContext.Provider value={confirm}>
    {children}
    {request && <ConfirmDialog request={request} onFinish={finish} />}
  </AdminConfirmContext.Provider>;
}

function ConfirmDialog({ request, onFinish }) {
  const dialog = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const node = dialog.current;
    node.showModal();
    return () => node.close();
  }, []);
  return <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId} aria-describedby={descriptionId}
    onCancel={event => { event.preventDefault(); onFinish(false); }}
    onKeyDown={event => event.stopPropagation()}>
    <h2 id={titleId}>{request.title || 'Confirm change'}</h2>
    <p id={descriptionId}>{request.message}</p>
    <div className={styles.actions}>
      <button type="button" className="btn btn-outline" autoFocus onClick={() => onFinish(false)}>{request.cancelLabel || 'Cancel'}</button>
      <button type="button" className={`btn ${request.destructive ? styles.danger : 'btn-primary'}`} onClick={() => onFinish(true)}>{request.confirmLabel || 'Confirm'}</button>
    </div>
  </dialog>;
}

export function useAdminConfirm() {
  const confirm = useContext(AdminConfirmContext);
  if (!confirm) throw new Error('Admin confirmation provider is missing.');
  return confirm;
}
