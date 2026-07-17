import { Component, inject } from '@angular/core';
import { IonicModule, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about-ai',
  templateUrl: './about-ai.html',
  styleUrls: ['./about-ai.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class AboutAiComponent {
  private router = inject(Router);
  private loadingCtrl = inject(LoadingController);


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
