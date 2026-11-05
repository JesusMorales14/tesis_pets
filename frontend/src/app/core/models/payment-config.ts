/** Datos de cobro (Yape / transferencia) que configura el veterinario. */

export interface PaymentConfig {
  yape_phone: string | null;
  yape_qr_url: string | null;
  banco: string | null;
  tipo_cuenta: string | null;
  numero_cuenta: string | null;
  cci: string | null;
  titular: string | null;
}

export interface PaymentConfigBody {
  yape_phone?: string | null;
  banco?: string | null;
  tipo_cuenta?: string | null;
  numero_cuenta?: string | null;
  cci?: string | null;
  titular?: string | null;
}
