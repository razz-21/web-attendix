import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@/app/store/auth/auth.store';

export const workspaceGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const user = authStore.user();

  if (!user) {
    router.navigate(['/auth/login']);
    return false;
  }

  if (!('workspace_id' in user)) {
    router.navigate(['/select-workspace']);
    return false;
  }

  return true;
};