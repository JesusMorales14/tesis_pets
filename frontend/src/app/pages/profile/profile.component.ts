import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AppointmentService, Appointment } from '../../services/appointment.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class ProfileComponent implements OnInit {
  appointments: Appointment[] = [];
  isLoadingAppts = false;
  showAppointments = true;

  constructor(
    public auth: AuthService,
    private router: Router,
    private appointmentService: AppointmentService,
    public themeService: ThemeService,
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn) {
      this.loadMyAppointments();
    }
  }

  loadMyAppointments() {
    this.isLoadingAppts = true;
    this.appointmentService.getMyAppointments().subscribe({
      next: (a) => { this.appointments = a; this.isLoadingAppts = false; },
      error: () => { this.isLoadingAppts = false; },
    });
  }

  toggleAppointments() {
    this.showAppointments = !this.showAppointments;
  }

  goToLogin()    { this.router.navigate(['/login']); }
  goToRegister() { this.router.navigate(['/register']); }
  goToAdmin()    { this.router.navigate(['/admin']); }
  goBack()       { this.router.navigate(['/tabs/tab1']); }

  logout() {
    this.auth.logout();
    this.appointments = [];
  }

  getEstadoColor(estado: string): string {
    const map: Record<string, string> = { pendiente: '#d68910', confirmada: '#27ae60', cancelada: '#c0392b' };
    return map[estado] ?? '#888';
  }

  formatFecha(fecha: string): string {
    const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const d = new Date(fecha + 'T00:00:00');
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  }
}
