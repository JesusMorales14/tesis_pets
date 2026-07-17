import { Component } from '@angular/core';

import { IonicModule } from '@ionic/angular';
import {
  EMERGENCY_SCENARIOS,
  UNIVERSAL_RED_FLAGS,
  FIRST_AID_KIT,
  EmergencyScenario,
} from '../emergency-data';

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
