import { Component, inject } from '@angular/core';
import { IonicModule, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrls: ['./hero.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class HeroComponent {
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
