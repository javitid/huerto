import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { environment } from '../../../environments/environment';
import { DashboardFileAnalysisResult } from '../model/dashboard.types';

export const DASHBOARD_FILE_ANALYSIS_EMAIL = 'AUTHORIZED_GOOGLE_EMAIL';

@Injectable({
  providedIn: 'root'
})
export class DashboardFileAnalysisService {
  canAnalyzeFiles(user: Pick<User, 'uid' | 'email'> | null): boolean {
    const userEmail = user?.email?.trim().toLowerCase() ?? '';
    const allowedEmails = environment.fileAnalysis.allowedEmails
      .map((value) => value.trim().toLowerCase())
      .filter((value) => value.length > 0 && value !== DASHBOARD_FILE_ANALYSIS_EMAIL.toLowerCase());

    return allowedEmails.includes(userEmail);
  }

  async analyzeFile(user: Pick<User, 'uid' | 'email'> | null, file: File): Promise<DashboardFileAnalysisResult> {
    if (!this.canAnalyzeFiles(user)) {
      throw new Error('dashboard.analysis.errors.unauthorized');
    }

    const normalizedUserId = user?.uid ?? '';
    const normalizedName = file.name.trim();

    if (!normalizedName) {
      throw new Error('dashboard.analysis.errors.required');
    }

    if (!this.isPdfFile(file)) {
      throw new Error('dashboard.analysis.errors.pdfOnly');
    }

    const preview = await this.extractPdfText(file);
    const fields = this.extractInvoiceFields(preview);
    const recommendations = this.buildRecommendations(fields);

    return {
      fileName: normalizedName,
      analyzed: true,
      message: 'Factura analizada. Revisa los datos extraidos y las oportunidades de optimizacion.',
      fields,
      recommendations,
      metadata: {
        userId: normalizedUserId,
        contentType: file.type,
        size: file.size
      }
    };
  }

  private isPdfFile(file: File): boolean {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  }

  private async extractPdfText(file: File): Promise<string> {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdf.worker.mjs';

    const data = new Uint8Array(await file.arrayBuffer());
    const document = await pdfjsLib.getDocument({ data }).promise;
    const pages: string[] = [];

    for (let index = 1; index <= document.numPages; index += 1) {
      const page = await document.getPage(index);
      const content = await page.getTextContent();
      pages.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '));
    }

    return pages.join(' ');
  }

  private extractInvoiceFields(text: string): DashboardFileAnalysisResult['fields'] {
    const normalizedText = text.replace(/\s+/g, ' ').trim();

    const fields = [
      this.createField('Resumen', 'Total factura', this.matchValue(normalizedText, /Total\s+(\d+,\d{2}\s*€)/i)),
      this.createField('Resumen', 'Periodo de facturacion', this.matchValue(normalizedText, /Periodo de facturaci[oó]n:\s*del\s*([0-9/]+\s*a\s*[0-9/]+)/i)),
      this.createField('Resumen', 'Fecha de emision', this.matchValue(normalizedText, /Fecha emisi[oó]n factura:\s*([0-9/]+)/i)),
      this.createField('Factura', 'Numero de factura', this.matchValue(normalizedText, /N[ºo]\s*factura:\s*([A-Z0-9]+)/i)),
      this.createField('Factura', 'Referencia', this.matchValue(normalizedText, /Referencia:\s*([0-9]+)/i)),
      this.createField('Contrato', 'Titular', this.matchValue(normalizedText, /Titular del contrato:\s*(.*?)\s+NIF:/i)),
      this.createField('Contrato', 'NIF', this.matchValue(normalizedText, /NIF:\s*([A-Z0-9]+)/i)),
      this.createField('Contrato', 'Direccion de suministro', this.matchValue(normalizedText, /Direcci[oó]n de suministro:\s*(.*?)\s+Contrato de mercado libre:/i)),
      this.createField('Contrato', 'Producto o tarifa', this.matchValue(normalizedText, /Contrato de mercado libre:\s*(.*?)\s+Referencia de contrato/i)),
      this.createField('Contrato', 'CUPS', this.matchValue(normalizedText, /CUPS:\s*([A-Z0-9]+)/i)),
      this.createField('Contrato', 'Peaje', this.matchValue(normalizedText, /Peaje de transporte y distribuci[oó]n:\s*([0-9.A-Z]+)/i)),
      this.createField('Contrato', 'Potencia contratada punta-llano', this.matchValue(normalizedText, /Potencias contratadas:\s*punta-llano\s*([\d.,]+\s*kW)/i)),
      this.createField('Contrato', 'Potencia contratada valle', this.matchValue(normalizedText, /Potencias contratadas:.*?valle\s*([\d.,]+\s*kW)/i)),
      this.createField('Consumo', 'Consumo total', this.matchValue(normalizedText, /Consumo Total\s*([\d.,]+\s*kWh)/i)),
      this.createField('Consumo', 'Precio medio del periodo', this.matchValue(normalizedText, /ha salido a\s*([\d.,]+\s*€\/kWh)/i)),
      this.createField('Consumo', 'Pico maximo P1', this.matchValue(normalizedText, /han sido\s*([\d.,]+\s*kW)\s*en P1/i)),
      this.createField('Consumo', 'Pico maximo P3', this.matchValue(normalizedText, /y\s*([\d.,]+\s*kW)\s*en P3/i)),
      this.createField('Consumo', 'Consumo punta', this.matchValue(normalizedText, /Punta\s+[\d.,]+\s+[\d.,]+\s+1,00\s+0,00\s+([\d.,]+)/i, ' kWh')),
      this.createField('Consumo', 'Consumo llano', this.matchValue(normalizedText, /Llano\s+[\d.,]+\s+[\d.,]+\s+1,00\s+0,00\s+([\d.,]+)/i, ' kWh')),
      this.createField('Consumo', 'Consumo valle', this.matchValue(normalizedText, /Valle\s+[\d.,]+\s+[\d.,]+\s+1,00\s+0,00\s+([\d.,]+)/i, ' kWh')),
      this.createField('Costes', 'Termino de potencia', this.matchValue(normalizedText, /Potencia\s+(\d+,\d{2}\s*€)/i)),
      this.createField('Costes', 'Termino de energia', this.matchValue(normalizedText, /Energ[ií]a\s+(\d+,\d{2}\s*€)/i)),
      this.createField('Costes', 'Descuentos', this.matchValue(normalizedText, /Descuentos\s+(-?[\d.,]+\s*€)/i)),
      this.createField('Costes', 'Otros conceptos', this.matchValue(normalizedText, /Otros\s+([\d.,]+\s*€)/i) || this.matchValue(normalizedText, /Varios\s+([\d.,]+\s*€)/i)),
      this.createField('Costes', 'Impuestos', this.matchValue(normalizedText, /Impuestos\s+([\d.,]+\s*€)/i))
    ];

    return fields.filter((field): field is NonNullable<typeof field> => field !== null);
  }

  private buildRecommendations(fields: DashboardFileAnalysisResult['fields']): DashboardFileAnalysisResult['recommendations'] {
    const recommendations: NonNullable<DashboardFileAnalysisResult['recommendations']> = [];
    const contractedPower = Math.max(
      this.parseNumericValue(this.getFieldValue(fields, 'Potencia contratada punta-llano')),
      this.parseNumericValue(this.getFieldValue(fields, 'Potencia contratada valle'))
    );
    const maxDemand = Math.max(
      this.parseNumericValue(this.getFieldValue(fields, 'Pico maximo P1')),
      this.parseNumericValue(this.getFieldValue(fields, 'Pico maximo P3'))
    );
    const powerCost = this.parseNumericValue(this.getFieldValue(fields, 'Termino de potencia'));
    const energyCost = this.parseNumericValue(this.getFieldValue(fields, 'Termino de energia'));
    const averageEnergyPrice = this.parseNumericValue(this.getFieldValue(fields, 'Precio medio del periodo'));
    const punta = this.parseNumericValue(this.getFieldValue(fields, 'Consumo punta'));
    const llano = this.parseNumericValue(this.getFieldValue(fields, 'Consumo llano'));
    const valle = this.parseNumericValue(this.getFieldValue(fields, 'Consumo valle'));

    if (contractedPower > 0 && maxDemand > 0 && contractedPower >= maxDemand * 5) {
      recommendations.push({
        severity: 'high',
        title: 'Potencia probablemente sobredimensionada',
        detail: `La potencia contratada (${this.formatDecimal(contractedPower)} kW) esta muy por encima del pico maximo detectado (${this.formatDecimal(maxDemand)} kW). Conviene revisar varias facturas y estudiar una bajada escalonada.`
      });
    }

    if (powerCost > energyCost && powerCost > 0 && energyCost > 0) {
      recommendations.push({
        severity: 'medium',
        title: 'El termino fijo pesa mas que el consumo',
        detail: `Estas pagando mas por potencia (${this.formatCurrency(powerCost)}) que por energia consumida (${this.formatCurrency(energyCost)}). Esto refuerza la hipotesis de exceso de potencia contratada.`
      });
    }

    if (averageEnergyPrice >= 0.18) {
      recommendations.push({
        severity: 'medium',
        title: 'Precio de energia alto para revisar',
        detail: `El precio medio del periodo (${averageEnergyPrice.toFixed(6)} €/kWh) parece elevado. Conviene compararlo con ofertas alternativas y con varias facturas del mismo suministro.`
      });
    } else if (averageEnergyPrice > 0) {
      recommendations.push({
        severity: 'info',
        title: 'Precio de energia aparentemente razonable',
        detail: `El precio medio del periodo (${averageEnergyPrice.toFixed(6)} €/kWh) no parece desproporcionado a primera vista, aunque conviene compararlo con otras comercializadoras y mas meses.`
      });
    }

    if (valle > punta && valle > llano) {
      recommendations.push({
        severity: 'info',
        title: 'Buen aprovechamiento del periodo valle',
        detail: `El mayor consumo cae en valle (${this.formatDecimal(valle)} kWh), lo que indica que la discriminacion horaria podria estar siendo util para este suministro.`
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        severity: 'info',
        title: 'Sin alertas claras en esta factura',
        detail: 'No se ha detectado una oportunidad obvia con reglas simples. Para optimizar mejor conviene comparar varias facturas consecutivas.'
      });
    }

    return recommendations;
  }

  private createField(section: string, label: string, value: string | null): { section: string; label: string; value: string } | null {
    if (!value) {
      return null;
    }

    return { section, label, value };
  }

  private matchValue(text: string, regex: RegExp, suffix = ''): string | null {
    const match = text.match(regex);
    const value = match?.[1]?.trim();
    return value ? `${value}${suffix}` : null;
  }

  private getFieldValue(fields: DashboardFileAnalysisResult['fields'], label: string): string {
    return fields?.find((field) => field.label === label)?.value ?? '';
  }

  private parseNumericValue(value: string): number {
    const normalizedValue = value
      .replace(/[^\d,.-]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');

    const parsedValue = Number.parseFloat(normalizedValue);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  private formatDecimal(value: number): string {
    return value.toFixed(3).replace('.', ',');
  }

  private formatCurrency(value: number): string {
    return `${value.toFixed(2).replace('.', ',')} €`;
  }
}
