import { Component } from '@angular/core';
import { IonicModule, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about-ai',
  templateUrl: './about-ai.component.html',
  styleUrls: ['./about-ai.component.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class AboutAiComponent {
  constructor(
    private router: Router,
    private loadingCtrl: LoadingController,
  ) {}

  async goToCheck() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando...',
      spinner: 'crescent',
      duration: 800,
    });

    await loading.present();

    await new Promise((resolve) => setTimeout(resolve, 500));

    await loading.dismiss();
    this.router.navigateByUrl('/tabs/tab2');
  }
}
