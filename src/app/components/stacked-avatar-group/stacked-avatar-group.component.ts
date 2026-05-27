import { Component, computed, input } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AvatarComponent } from '@/app/compponents/avatar/avatar.component';

export interface StackedAvatarUser {
  id: string;
  firstname: string;
  lastname: string;
  url?: string;
}

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

@Component({
  selector: 'app-stacked-avatar-group',
  templateUrl: './stacked-avatar-group.component.html',
  styleUrl: './stacked-avatar-group.component.scss',
  imports: [AvatarComponent, MatTooltipModule],
})
export class StackedAvatarGroupComponent {
  public readonly users = input<StackedAvatarUser[]>([]);
  public readonly size = input<AvatarSize>('xs');
  public readonly maxVisible = input<number | undefined>(undefined);
  public readonly ariaLabel = input<string>('Shared users');

  public readonly visibleUsers = computed(() => {
    const list = this.users();
    const max = this.maxVisible();
    if (max === undefined || max >= list.length) {
      return list;
    }
    return list.slice(0, max);
  });

  public readonly overflowCount = computed(() => {
    const max = this.maxVisible();
    if (max === undefined) return 0;
    return Math.max(0, this.users().length - max);
  });

  public displayName(user: StackedAvatarUser): string {
    return `${user.firstname} ${user.lastname}`.trim();
  }
}
