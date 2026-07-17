import { bootstrapApplication } from '@angular/platform-browser';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

import { AppComponent } from './app/app';
import { appConfig } from './app/app.config';

defineCustomElements(window);

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
