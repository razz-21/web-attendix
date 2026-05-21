import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '@/app/store/auth/auth.store';
import { UserRole } from '../types/users/users.type';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const authStore = inject(AuthStore);
    const router = inject(Router);
    const user = authStore.user();

    if (!user) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (!allowedRoles.includes(user.role)) {
      router.navigate(['/main/home']);
      return false;
    }

    return true;
  };
};