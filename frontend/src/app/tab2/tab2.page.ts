import { Component } from '@angular/core';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {
  loading = true;

  ionViewDidEnter() {
    // simula carga de datos
    setTimeout(() => {
      this.loading = false;
    }, 900);
  }
}
