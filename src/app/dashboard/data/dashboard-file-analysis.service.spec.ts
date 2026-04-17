jest.mock('../../../environments/environment', () => ({
  environment: {
    fileAnalysis: {
      allowedEmails: ['file-analysis@huerto.local']
    }
  }
}));

import { DashboardFileAnalysisService } from './dashboard-file-analysis.service';

describe('DashboardFileAnalysisService', () => {
  it('only enables analysis for configured emails', () => {
    const service = new DashboardFileAnalysisService();

    expect(service.canAnalyzeFiles({ uid: 'another-user', email: 'file-analysis@huerto.local' } as never)).toBe(true);
    expect(service.canAnalyzeFiles({ uid: 'another-user', email: 'otro@huerto.local' } as never)).toBe(false);
    expect(service.canAnalyzeFiles(null)).toBe(false);
  });

  it('rejects files that are not pdf invoices', async () => {
    const service = new DashboardFileAnalysisService();
    const file = new File(['id,value\n1,42'], 'analysis.csv', { type: 'text/csv' });

    await expect(service.analyzeFile({ uid: 'another-user', email: 'file-analysis@huerto.local' } as never, file)).rejects.toThrow('dashboard.analysis.errors.pdfOnly');
  });

  it('extracts key invoice fields and optimization recommendations from a pdf bill', async () => {
    const service = new DashboardFileAnalysisService();
    const file = new File(['fake pdf'], 'factura.pdf', { type: 'application/pdf' });

    jest.spyOn(service as any, 'extractPdfText').mockResolvedValue(
      'Nº factura: P26CON006763322 Referencia: 507695649970 Fecha emisión factura: 13/02/2026 ' +
      'Periodo de facturación: del 13/01/2026 a 10/02/2026 Total 82,82 € ' +
      'Titular del contrato: CDAD DE PROPIETARIOS V RIBERA DE DUERO NIF: H47411384 ' +
      'Dirección de suministro: VINOS DE TORO 2, 47008 VALLADOLID, VALLADOLID Contrato de mercado libre: Tempo 24 horas Referencia de contrato ' +
      'Potencias contratadas: punta-llano 9,900 kW; valle 9,900 kW CUPS: ES0021000009363231KC0F ' +
      'Peaje de transporte y distribución: 2.0TD Consumo Total 69,000 kWh ' +
      'En esta factura el consumo ha salido a 0.138840 €/kWh ' +
      'Las potencias máximas demandadas en el último año han sido 0,970 kW en P1 (punta) y 0,840 kW en P3 (valle). ' +
      'Punta 7.183,00 7.203,00 1,00 0,00 20,00 Llano 8.545,00 8.563,00 1,00 0,00 18,00 Valle 2.056,00 2.087,00 1,00 0,00 31,00 ' +
      'Potencia 53,81 € Energía 10,64 € Descuentos -1,06 € Otros 1,79 € Impuestos 17,64 €'
    );

    const result = await service.analyzeFile({ uid: 'another-user', email: 'file-analysis@huerto.local' } as never, file);

    expect(result.message).toContain('Factura analizada');
    expect(result.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ section: 'Resumen', label: 'Total factura', value: '82,82 €' }),
        expect.objectContaining({ section: 'Contrato', label: 'Producto o tarifa', value: 'Tempo 24 horas' }),
        expect.objectContaining({ section: 'Consumo', label: 'Pico maximo P1', value: '0,970 kW' })
      ])
    );
    expect(result.recommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ severity: 'high', title: 'Potencia probablemente sobredimensionada' }),
        expect.objectContaining({ severity: 'medium', title: 'El termino fijo pesa mas que el consumo' }),
        expect.objectContaining({ severity: 'info', title: 'Buen aprovechamiento del periodo valle' })
      ])
    );
  });

  it('rejects analysis for users outside the allowlist', async () => {
    const service = new DashboardFileAnalysisService();
    const file = new File(['hello'], 'orchard-plan.pdf');

    await expect(service.analyzeFile({ uid: 'another-user', email: 'otro@huerto.local' } as never, file)).rejects.toThrow('dashboard.analysis.errors.unauthorized');
  });

  it('rejects empty file names', async () => {
    const service = new DashboardFileAnalysisService();
    const file = new File(['hello'], '   ');

    await expect(service.analyzeFile({ uid: 'another-user', email: 'file-analysis@huerto.local' } as never, file)).rejects.toThrow('dashboard.analysis.errors.required');
  });
});
