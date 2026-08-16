export interface GrammaticalFormItem {
  arabic: string;
  transliteration: string;
  meaning: string;
  explanation?: string;
}

export interface GrammaticalForms {
  singular?: GrammaticalFormItem;
  dual?: GrammaticalFormItem;
  plural?: GrammaticalFormItem;
  masculine?: GrammaticalFormItem;
  feminine?: GrammaticalFormItem;
  pastVerb?: GrammaticalFormItem;
  presentVerb?: GrammaticalFormItem;
  imperative?: GrammaticalFormItem;
  activeParticiple?: GrammaticalFormItem;
  passiveParticiple?: GrammaticalFormItem;
  nounOfPlace?: GrammaticalFormItem;
}

export interface MorphologyStep {
  part: string;
  type: "prefix" | "root" | "pattern" | "suffix" | "base";
  role: string;
  contribution: string;
}

export interface MorphologyDetails {
  root: string;
  rootMeaning: string;
  pattern?: string;
  patternMeaning?: string;
  wordClass?: string;
  constructionSteps?: MorphologyStep[];
}

export interface WordBreakdownItem {
  word: string;
  transliteration?: string;
  meaningEn?: string;
  meaningGu?: string;
  meaningUr?: string;
  root?: string;
  partOfSpeech?: string;
}

export interface WordLookupResult {
  word: string;
  cleanWord: string;
  transliteration: string;
  language: string;
  primaryMeaningEn: string;
  primaryMeaningGu?: string;
  primaryMeaningUr?: string;
  isVerseOrPhrase?: boolean;
  entireTranslationEn?: string;
  entireTranslationGu?: string;
  entireTranslationUr?: string;
  wordBreakdown?: WordBreakdownItem[];
  root?: string;
  rootMeaning?: string;
  partOfSpeech?: string;
  definition: string;
  contextNote?: string;
  morphology?: MorphologyDetails;
  grammaticalForms?: GrammaticalForms;
  meaningShiftExplanation?: string;
  funFact?: string;
  derivedTerms?: Array<{
    arabic: string;
    transliteration: string;
    meaning: string;
  }>;
  exampleSentence?: {
    arabic: string;
    transliteration: string;
    translation: string;
  };
  contextSentence?: string;
  pageNumber?: number;
  pdfName?: string;
  timestamp?: number;
}

export interface SelectionState {
  text: string;
  contextSentence: string;
  pageNumber: number;
  x: number;
  y: number;
}

export interface OcrResult {
  extractedText: string;
  transliteration?: string;
  translationEn: string;
  translationGu?: string;
  root?: string;
  meaningShiftExplanation?: string;
  wordBreakdown?: Array<{
    word: string;
    transliteration?: string;
    meaning?: string;
    root?: string;
  }>;
}

export interface SamplePdf {
  id: string;
  title: string;
  titleArabic: string;
  description: string;
  dataUrl?: string; // base64 or object URL
  pageCount?: number;
}
