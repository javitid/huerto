import { DashboardFileAnalysisService } from './dashboard-file-analysis.service';

describe('DashboardFileAnalysisService', () => {
  it('enables analysis for any authenticated user', () => {
    const service = new DashboardFileAnalysisService();

    expect(service.canAnalyzeFiles({ uid: 'another-user', email: 'file-analysis@huerto.local' } as never)).toBe(true);
    expect(service.canAnalyzeFiles({ uid: 'another-user', email: 'otro@huerto.local' } as never)).toBe(true);
    expect(service.canAnalyzeFiles(null)).toBe(false);
  });

  it('rejects files that are not pdf cv files', async () => {
    const service = new DashboardFileAnalysisService();
    const file = new File(['id,value\n1,42'], 'analysis.csv', { type: 'text/csv' });

    await expect(service.analyzeFile({ uid: 'another-user', email: 'file-analysis@huerto.local' } as never, file)).rejects.toThrow('dashboard.analysis.errors.pdfOnly');
  });

  it('extracts key cv fields and recommendations from a pdf cv', async () => {
    const service = new DashboardFileAnalysisService();
    const file = new File(['fake pdf'], 'ana-perez-cv.pdf', { type: 'application/pdf' });

    jest.spyOn(service as any, 'extractPdfText').mockResolvedValue(
      'Nombre: Ana Perez Email: ana.perez@example.com Telefono: +34 600 123 123 Ubicación: Madrid ' +
      'LinkedIn: https://www.linkedin.com/in/anaperez ' +
      'Puesto objetivo: Frontend Developer 6 años de experiencia ' +
      'Perfil profesional: Desarrolladora frontend centrada en Angular, accesibilidad y rendimiento. ' +
      'Puesto actual: Senior Frontend Developer Empresa actual: Acme Tech Desde: 2021 - Actualidad ' +
      'Logro destacado: Reduje un 35% el tiempo de carga de una aplicacion interna. ' +
      'Formación: Grado en Ingeniería Informática Centro: Universidad de Salamanca Año: 2019 ' +
      'Habilidades: Angular, TypeScript, RxJS, Testing, HTML, CSS Idiomas: Español C2, Inglés B2'
    );

    const result = await service.analyzeFile({ uid: 'another-user', email: 'file-analysis@huerto.local' } as never, file);

    expect(result.message).toContain('CV analizado');
    expect(result.fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ section: 'Resumen', label: 'Nombre completo', value: 'Ana Perez' }),
        expect.objectContaining({ section: 'Experiencia', label: 'Puesto actual', value: 'Senior Frontend Developer' }),
        expect.objectContaining({ section: 'Habilidades', label: 'Idiomas', value: 'Español C2, Inglés B2' })
      ])
    );
    expect(result.recommendations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ severity: 'info', title: 'Perfil bien estructurado a primera vista' })
      ])
    );
  });

  it('rejects analysis for users outside the allowlist', async () => {
    const service = new DashboardFileAnalysisService();
    const file = new File(['hello'], 'orchard-plan.pdf');

    await expect(service.analyzeFile(null, file)).rejects.toThrow('dashboard.analysis.errors.unauthorized');
  });

  it('rejects empty file names', async () => {
    const service = new DashboardFileAnalysisService();
    const file = new File(['hello'], '   ');

    await expect(service.analyzeFile({ uid: 'another-user', email: 'file-analysis@huerto.local' } as never, file)).rejects.toThrow('dashboard.analysis.errors.required');
  });
});
