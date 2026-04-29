import { Injectable } from '@angular/core';
import { User } from 'firebase/auth';
import { environment } from '../../../environments/environment';
import {
  DASHBOARD_FILE_ANALYSIS_SECTIONS,
  DashboardFileAnalysisField,
  DashboardFileAnalysisResult,
  DashboardFileAnalysisSection
} from '../model/dashboard.types';

@Injectable({
  providedIn: 'root'
})
export class DashboardFileAnalysisService {
  private readonly allowedEmails = new Set(
    (environment.fileAnalysis?.allowedEmails ?? [])
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0 && email !== 'authorized_google_email')
  );

  canAnalyzeFiles(user: Pick<User, 'uid' | 'email'> | null): boolean {
    if (!user?.email) {
      return false;
    }

    if (this.allowedEmails.size === 0) {
      return false;
    }

    return this.allowedEmails.has(user.email.trim().toLowerCase());
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
    const fields = this.extractCvFields(preview);
    const recommendations = this.buildRecommendations(fields);

    return {
      fileName: normalizedName,
      analyzed: true,
      message: 'CV analizado. Revisa los datos detectados y las recomendaciones de mejora.',
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

  private extractCvFields(text: string): DashboardFileAnalysisResult['fields'] {
    const normalizedText = text.replace(/\s+/g, ' ').trim();

    const fields = [
      this.createField(DASHBOARD_FILE_ANALYSIS_SECTIONS.Summary, 'Nombre completo', this.matchValue(normalizedText, /(?:Nombre|Candidato|Candidate):\s*(.*?)(?=\s+(?:Email|Correo|Tel[eé]fono|Telefono|Phone|Ubicaci[oó]n|Localidad|Location|Puesto objetivo|Objetivo profesional|Desired role):|$)/i)),
      this.createField(DASHBOARD_FILE_ANALYSIS_SECTIONS.Summary, 'Puesto objetivo', this.matchValue(normalizedText, /(?:Puesto objetivo|Objetivo profesional|Desired role):\s*(.*?)(?=\s+(?:Resumen profesional|Perfil profesional|Professional summary|Email|Correo|Tel[eé]fono|Telefono|Phone|Experiencia|Experience|Puesto actual|Current role):|$)/i)),
      this.createField(DASHBOARD_FILE_ANALYSIS_SECTIONS.Summary, 'Anios de experiencia', this.matchValue(normalizedText, /(\d+)\s*a[nñ]os?\s+de\s+experiencia/i, ' años')),
      this.createField(DASHBOARD_FILE_ANALYSIS_SECTIONS.Profile, 'Email', this.matchValue(normalizedText, /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i)),
      this.createField(DASHBOARD_FILE_ANALYSIS_SECTIONS.Profile, 'Telefono', this.matchValue(normalizedText, /(?:Tel[eé]fono|Telefono|Phone):\s*(\+?[0-9 ][0-9 -]{7,})/i)),
      this.createField(DASHBOARD_FILE_ANALYSIS_SECTIONS.Profile, 'Ubicacion', this.matchValue(normalizedText, /(?:Ubicaci[oó]n|Localidad|Location):\s*(.*?)(?=\s+(?:LinkedIn|GitHub|Portfolio|Portafolio|Resumen profesional|Perfil profesional|Professional summary|Experiencia|Experience|Puesto actual|Current role):|$)/i)),
      this.createField(DASHBOARD_FILE_ANALYSIS_SECTIONS.Profile, 'LinkedIn', this.matchValue(normalizedText, /(https?:\/\/(?:www\.)?linkedin\.com\/[^\s]+)/i) || this.matchValue(normalizedText, /LinkedIn:\s*(.*?)(?=\s+(?:GitHub|Portfolio|Portafolio|Resumen profesional|Perfil profesional|Professional summary|Experiencia|Experience):|$)/i)),
      this.createField(DASHBOARD_FILE_ANALYSIS_SECTIONS.Profile, 'GitHub o portfolio', this.matchValue(normalizedText, /(https?:\/\/(?:www\.)?(?:github\.com|gitlab\.com|[a-z0-9.-]+\.[a-z]{2,}\/portfolio)[^\s]*)/i) || this.matchValue(normalizedText, /(?:GitHub|Portfolio|Portafolio):\s*(.*?)(?=\s+(?:Resumen profesional|Perfil profesional|Professional summary|Experiencia|Experience|Formaci[oó]n|Educaci[oó]n|Education):|$)/i)),
      this.createField(DASHBOARD_FILE_ANALYSIS_SECTIONS.Profile, 'Resumen profesional', this.matchValue(normalizedText, /(?:Resumen profesional|Perfil profesional|Professional summary):\s*(.*?)(?=\s+(?:Experiencia|Experience|Puesto actual|Current role|Formaci[oó]n|Educaci[oó]n|Education):|$)/i)),
      this.createField(DASHBOARD_FILE_ANALYSIS_SECTIONS.Experience, 'Puesto actual', this.matchValue(normalizedText, /(?:Puesto actual|Current role):\s*(.*?)(?=\s+(?:Empresa actual|Current company|Empresa|Company|Desde|Periodo|Logro destacado|Achievement|Formaci[oó]n|Educaci[oó]n|Education):|$)/i)),
      this.createField(DASHBOARD_FILE_ANALYSIS_SECTIONS.Experience, 'Empresa actual', this.matchValue(normalizedText, /(?:Empresa actual|Current company|Empresa|Company):\s*(.*?)(?=\s+(?:Desde|Periodo|Logro destacado|Achievement|Formaci[oó]n|Educaci[oó]n|Education):|$)/i)),
      this.createField(DASHBOARD_FILE_ANALYSIS_SECTIONS.Experience, 'Periodo reciente', this.matchValue(normalizedText, /(?:Periodo|Desde):\s*((?:20\d{2}|19\d{2}).*?(?:Actualidad|Presente|Present|20\d{2}|19\d{2}))/i)),
      this.createField(DASHBOARD_FILE_ANALYSIS_SECTIONS.Experience, 'Logro destacado', this.matchValue(normalizedText, /(?:Logro destacado|Achievement):\s*(.*?)(?=\s+(?:Formaci[oó]n|Educaci[oó]n|Education|Habilidades|Skills|Idiomas|Languages):|$)/i)),
      this.createField(DASHBOARD_FILE_ANALYSIS_SECTIONS.Education, 'Titulacion principal', this.matchValue(normalizedText, /(?:Formaci[oó]n|Educaci[oó]n|Education):\s*(.*?)(?=\s+(?:Centro|Universidad|Institution|Promoci[oó]n|A[nñ]o|Graduation year|Habilidades|Skills|Idiomas|Languages):|$)/i)),
      this.createField(DASHBOARD_FILE_ANALYSIS_SECTIONS.Education, 'Centro', this.matchValue(normalizedText, /(?:Centro|Universidad|Institution):\s*(.*?)(?=\s+(?:Promoci[oó]n|A[nñ]o|Graduation year|Habilidades|Skills|Idiomas|Languages):|$)/i)),
      this.createField(DASHBOARD_FILE_ANALYSIS_SECTIONS.Education, 'Anio', this.matchValue(normalizedText, /(?:Promoci[oó]n|A[nñ]o|Graduation year):\s*(20\d{2}|19\d{2})/i)),
      this.createField(DASHBOARD_FILE_ANALYSIS_SECTIONS.Skills, 'Habilidades clave', this.matchValue(normalizedText, /(?:Habilidades|Skills):\s*(.*?)(?=\s+(?:Idiomas|Languages|Certificaciones|Certifications):|$)/i)),
      this.createField(DASHBOARD_FILE_ANALYSIS_SECTIONS.Skills, 'Idiomas', this.matchValue(normalizedText, /(?:Idiomas|Languages):\s*(.*?)(?=\s+(?:Certificaciones|Certifications):|$)/i)),
      this.createField(DASHBOARD_FILE_ANALYSIS_SECTIONS.Skills, 'Certificaciones', this.matchValue(normalizedText, /(?:Certificaciones|Certifications):\s*(.*)$/i))
    ];

    return fields.filter((field): field is NonNullable<typeof field> => field !== null);
  }

  private buildRecommendations(fields: DashboardFileAnalysisResult['fields']): DashboardFileAnalysisResult['recommendations'] {
    const recommendations: NonNullable<DashboardFileAnalysisResult['recommendations']> = [];
    const yearsOfExperience = this.parseNumericValue(this.getFieldValue(fields, 'Anios de experiencia'));
    const summary = this.getFieldValue(fields, 'Resumen profesional');
    const linkedIn = this.getFieldValue(fields, 'LinkedIn');
    const portfolio = this.getFieldValue(fields, 'GitHub o portfolio');
    const skills = this.getFieldValue(fields, 'Habilidades clave');
    const languages = this.getFieldValue(fields, 'Idiomas');
    const achievement = this.getFieldValue(fields, 'Logro destacado');
    const skillCount = skills
      .split(/[;,|]/)
      .map((value) => value.trim())
      .filter((value) => value.length > 0).length;

    if (!summary) {
      recommendations.push({
        severity: 'medium',
        title: 'Falta un resumen profesional claro',
        detail: 'Añadir un resumen de 3 a 5 lineas al inicio ayuda a contextualizar el perfil y a que reclutadores entiendan rapido tu propuesta de valor.'
      });
    }

    if (!linkedIn && !portfolio) {
      recommendations.push({
        severity: 'medium',
        title: 'Falta un enlace profesional visible',
        detail: 'Conviene incluir LinkedIn, GitHub o portfolio para facilitar la validacion del perfil y ampliar contexto mas alla del PDF.'
      });
    }

    if (skillCount > 0 && skillCount < 4) {
      recommendations.push({
        severity: 'medium',
        title: 'Conviene detallar mas habilidades',
        detail: 'El CV muestra pocas habilidades concretas. Incluir stack, herramientas o competencias clave suele mejorar la legibilidad del perfil.'
      });
    }

    if (!achievement && yearsOfExperience >= 3) {
      recommendations.push({
        severity: 'info',
        title: 'Seria bueno destacar logros medibles',
        detail: 'Si ya tienes experiencia relevante, añadir resultados concretos o impacto cuantificable puede hacer el CV mas convincente.'
      });
    }

    if (!languages) {
      recommendations.push({
        severity: 'info',
        title: 'No se han detectado idiomas',
        detail: 'Si manejas idiomas, conviene indicarlos con nivel para mejorar la evaluacion del perfil en procesos internacionales o mixtos.'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        severity: 'info',
        title: 'Perfil bien estructurado a primera vista',
        detail: 'No se ha detectado una carencia evidente con reglas simples. Aun asi, conviene adaptar el CV a cada vacante para mejorar relevancia.'
      });
    }

    return recommendations;
  }

  private createField(section: DashboardFileAnalysisSection, label: string, value: string | null): DashboardFileAnalysisField | null {
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
}
