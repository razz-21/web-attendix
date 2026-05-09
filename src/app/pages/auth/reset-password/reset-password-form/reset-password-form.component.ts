import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-reset-password-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './reset-password-form.component.html',
  styleUrl: './reset-password-form.component.scss'
})
export class ResetPasswordFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  resetPasswordForm: FormGroup = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  token: string | null = null;
  isValidatingToken = true;
  isTokenValid = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  hidePassword = true;
  hideConfirmPassword = true;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        this.validateToken(this.token);
      } else {
        this.isValidatingToken = false;
        this.errorMessage = 'Invalid password reset link. No token provided.';
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  async validateToken(token: string) {
    try {
      await this.authService.verifyForgotPasswordToken(token);
      this.isTokenValid = true;
    } catch (error: any) {
      this.errorMessage = error.error?.error || 'Invalid or expired password reset link.';
    } finally {
      this.isValidatingToken = false;
      this.cdr.markForCheck();
    }
  }

  async onSubmit() {
    if (this.resetPasswordForm.invalid || !this.token) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    try {
      const password = this.resetPasswordForm.value.password;
      const response = await this.authService.resetPassword(this.token, password);
      this.successMessage = response.message || 'Password has been successfully reset.';
      this.cdr.markForCheck();
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000);
    } catch (error: any) {
      this.errorMessage = error.error?.error || 'An error occurred. Please try again later.';
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }
}
