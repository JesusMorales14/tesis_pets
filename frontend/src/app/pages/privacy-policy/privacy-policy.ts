import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PageToolbarComponent } from '@shared/components/page-toolbar/page-toolbar';

/** Política de privacidad (Ley N.° 29733 de Protección de Datos Personales). */
@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.html',
  styleUrls: ['./privacy-policy.scss'],
  standalone: true,
  imports: [IonicModule, PageToolbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPolicyComponent {
  private readonly location = inject(Location);

  protected readonly lastUpdated = '16 de julio de 2026';

  protected goBack(): void {
    this.location.back();
  }
}
