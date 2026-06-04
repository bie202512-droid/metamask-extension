import { useMemo } from 'react';
import { useAppSelector } from '../../../store/store';
import {
  ApprovalsMetaMaskState,
  internalSelectPendingApproval,
} from '../../../selectors';
import { useConfirmationId } from './useConfirmationId';

export function useApprovalRequest() {
  const confirmationId = useConfirmationId();
  const confirmationIdForSelectors = confirmationId ?? '';

  const selectPendingApproval = useMemo(
    () => (state: ApprovalsMetaMaskState) =>
      internalSelectPendingApproval(state, confirmationIdForSelectors),
    [confirmationIdForSelectors],
  );

  return useAppSelector(selectPendingApproval);
}
