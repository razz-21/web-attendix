import { Component, computed, input, Input } from '@angular/core';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  public url = input<string>();
  public alt = input<string>('User profile picture');
  public size = input<AvatarSize>('md');

  private readonly avatarDefaultUrl = 'assets/images/default-avatar.jpg';

  public avatarUrl = computed(() => this.url() || this.avatarDefaultUrl);

  public onImageError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (!image || image.src.endsWith(this.avatarDefaultUrl)) {
      return;
    }

    image.src = this.avatarDefaultUrl;
  }
}
