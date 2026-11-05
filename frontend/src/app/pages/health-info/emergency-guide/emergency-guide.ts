import { Component } from '@angular/core';

import { IonicModule } from '@ionic/angular';
import { EmergencyScenario } from '@core/models/emergency';
import { EMERGENCY_SCENARIOS, FIRST_AID_KIT, UNIVERSAL_RED_FLAGS } from '@core/data/emergencies.data';

@Component({
  selector: 'app-emergency-guide',
  standalone: true,
  imports: [IonicModule],
  templateUrl: './emergency-guide.html',
  styleUrls: ['./emergency-guide.scss'],
})
export class EmergencyGuideComponent {
  readonly scenarios = EMERGENCY_SCENARIOS;
  readonly redFlags = UNIVERSAL_RED_FLAGS;
  readonly kit = FIRST_AID_KIT;

  expandedId: string | null = null;

  toggle(scenario: EmergencyScenario): void {
    this.expandedId = this.expandedId === scenario.id ? null : scenario.id;
  }

  isExpanded(scenario: EmergencyScenario): boolean {
    return this.expandedId === scenario.id;
  }
}
