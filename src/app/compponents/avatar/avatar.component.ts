import { Component, computed, input } from '@angular/core';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
})
export class AvatarComponent {
  public url = input<string>();
  public alt = input<string>('User profile picture');
  public size = input<AvatarSize>('md');
  public avatarName = input<string>('');

  private readonly avatarDefaultUrl = 'assets/images/default-avatar.jpg';

  private readonly hasImageUrl = computed(() => {
    const u = this.url();
    return typeof u === 'string' && u.trim().length > 0;
  });

  public showLetterAvatar = computed(() => {
    const name = this.avatarName()?.trim() ?? '';
    return name.length > 0 && !this.hasImageUrl();
  });

  public initialLetter = computed(() => {
    const name = this.avatarName()?.trim() ?? '';
    if (!name) {
      return '';
    }
    return name.charAt(0).toLocaleUpperCase();
  });

  public avatarUrl = computed(() => this.url() || this.avatarDefaultUrl);

  public onImageError(event: Event): void {
    const image = event.target as HTMLImageElement | null;
    if (!image || image.src.endsWith(this.avatarDefaultUrl)) {
      return;
    }

    image.src = this.avatarDefaultUrl;
  }
}
