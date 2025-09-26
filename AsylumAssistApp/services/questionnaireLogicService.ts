// Questionnaire Logic Service
// Maps user responses to timeline bundles and display logic according to specifications

import { TimelineStep, TimelineBundle } from '../types/timeline';

export interface QuestionnaireResponse {
  // 1. Entry Date
  entryDate?: string;
  
  // 2. Have you applied for asylum (I-589)?
  hasFiledI589: 'yes' | 'no' | 'not-sure' | '';
  
  // 3. When did you submit I-589?
  i589SubmissionDate?: string;
  
  // 4. Where did you file I-589?
  filingLocation?: 'uscis' | 'immigration-court' | 'not-sure' | '';
  
  // 5. Next Hearing Date
  nextHearingDate?: string;
  
  // 6. Court Assigned
  assignedCourt?: string;
  
  // 7. EOIR Case Status
  eoirCaseStatus?: 'yes' | 'no' | 'not-sure' | '';
  
  // 8. Special Status (TPS/Parole/Both/None)
  hasTPS?: 'yes' | 'no' | 'not-sure' | '';
  tpsCountry?: string;
  tpsExpirationDate?: string;
  hasParole?: 'yes' | 'no' | 'not-sure' | '';
  paroleType?: string;
  paroleExpirationDate?: string;
  
  // Additional fields
  hasAttorney?: boolean;
  hasCase?: 'yes' | 'no' | 'not-sure';
}

export interface DisplayCard {
  id: string;
  type: 'deadline' | 'eligibility' | 'warning' | 'action' | 'info';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  dueDate?: string;
  links?: Array<{
    title: string;
    url: string;
    type: 'form' | 'guide' | 'website' | 'status_check';
  }>;
}

export interface TimelineMapping {
  bundles: string[];
  cards: DisplayCard[];
  nextSteps: string[];
  warnings: string[];
}

export class QuestionnaireLogicService {
  
  /**
   * Main mapping function that processes questionnaire responses
   * and returns appropriate timeline bundles and display cards
   */
  static mapResponsesToTimeline(responses: QuestionnaireResponse): TimelineMapping {
    const cards: DisplayCard[] = [];
    const bundles: string[] = [];
    const nextSteps: string[] = [];
    const warnings: string[] = [];

    // 1. Process Entry Date
    const entryDateResults = this.processEntryDate(responses);
    cards.push(...entryDateResults.cards);
    nextSteps.push(...entryDateResults.nextSteps);
    warnings.push(...entryDateResults.warnings);

    // 2. Process I-589 Application Status
    const i589Results = this.processI589Status(responses);
    cards.push(...i589Results.cards);
    bundles.push(...i589Results.bundles);
    nextSteps.push(...i589Results.nextSteps);
    warnings.push(...i589Results.warnings);

    // 3. Process Filing Location and Path
    const filingResults = this.processFilingLocation(responses);
    cards.push(...filingResults.cards);
    bundles.push(...filingResults.bundles);
    nextSteps.push(...filingResults.nextSteps);

    // 4. Process Court Information
    const courtResults = this.processCourtInformation(responses);
    cards.push(...courtResults.cards);
    nextSteps.push(...courtResults.nextSteps);

    // 5. Process Special Status (TPS/Parole)
    const statusResults = this.processSpecialStatus(responses);
    cards.push(...statusResults.cards);
    bundles.push(...statusResults.bundles);
    warnings.push(...statusResults.warnings);

    return {
      bundles: [...new Set(bundles)], // Remove duplicates
      cards: this.sortCardsByPriority(cards),
      nextSteps: [...new Set(nextSteps)],
      warnings: [...new Set(warnings)]
    };
  }

  /**
   * 1. Entry Date Processing
   */
  private static processEntryDate(responses: QuestionnaireResponse) {
    const cards: DisplayCard[] = [];
    const nextSteps: string[] = [];
    const warnings: string[] = [];

    if (!responses.entryDate) {
      // Entry date not provided
      cards.push({
        id: 'find-entry-date',
        type: 'action',
        priority: 'high',
        title: 'Find your entry date',
        description: 'Look up your I-94 arrival/departure record to determine your entry date',
        links: [
          {
            title: 'I-94 Official Website',
            url: 'https://i94.cbp.dhs.gov/',
            type: 'website'
          }
        ]
      });
      nextSteps.push('Find your entry date using I-94 lookup');
      return { cards, nextSteps, warnings };
    }

    // Calculate one-year deadline
    const entryDate = new Date(responses.entryDate);
    const oneYearDeadline = new Date(entryDate);
    oneYearDeadline.setFullYear(oneYearDeadline.getFullYear() + 1);
    const today = new Date();
    const deadlinePassed = today > oneYearDeadline;

    if (deadlinePassed) {
      // Past one-year deadline
      warnings.push('Past one-year filing deadline - check for exceptions');
      cards.push({
        id: 'late-filing-warning',
        type: 'warning',
        priority: 'critical',
        title: 'LATE FILING: Past One-Year Deadline',
        description: 'You may still be able to file if you qualify for an exception (TPS, Parole, changed circumstances)',
        dueDate: oneYearDeadline.toISOString().split('T')[0]
      });
    } else {
      // Within one-year deadline
      cards.push({
        id: 'one-year-deadline',
        type: 'deadline',
        priority: 'critical',
        title: 'One-Year Asylum Filing Deadline',
        description: 'You must file your asylum application by this date unless you qualify for an exception',
        dueDate: oneYearDeadline.toISOString().split('T')[0]
      });
    }

    return { cards, nextSteps, warnings };
  }

  /**
   * 2. I-589 Application Status Processing
   */
  private static processI589Status(responses: QuestionnaireResponse) {
    const cards: DisplayCard[] = [];
    const bundles: string[] = [];
    const nextSteps: string[] = [];
    const warnings: string[] = [];

    const entryDate = responses.entryDate ? new Date(responses.entryDate) : null;
    const oneYearDeadline = entryDate ? new Date(entryDate.getTime() + 365 * 24 * 60 * 60 * 1000) : null;
    const deadlinePassed = oneYearDeadline ? new Date() > oneYearDeadline : false;

    switch (responses.hasFiledI589) {
      case 'no':
        if (entryDate && !deadlinePassed) {
          // Case A: No - Within 1 year
          bundles.push('affirmative-starter');
          
          // Add fee warning if after July 22, 2025
          const today = new Date();
          const feeEffectiveDate = new Date('2025-07-22');
          if (today >= feeEffectiveDate) {
            cards.push({
              id: 'filing-fee-banner',
              type: 'warning',
              priority: 'medium',
              title: 'Filing Fee Required',
              description: 'Asylum filing now requires $100 fee + $100/year pending',
            });
          }

          nextSteps.push('File asylum application (I-589)');
          nextSteps.push('Gather evidence');
          nextSteps.push('Find attorney');
          
        } else if (deadlinePassed) {
          // Case A: No - After 1 year
          warnings.push('Late filing - only Withholding of Removal may be available');
          
          cards.push({
            id: 'withholding-option',
            type: 'info',
            priority: 'high',
            title: 'Withholding of Removal Available',
            description: 'Since you\'re past the one-year deadline, you may still qualify for Withholding of Removal protection',
          });

          cards.push({
            id: 'late-filing-risk-warning',
            type: 'warning',
            priority: 'critical',
            title: 'RISK: Applying After One Year',
            description: 'If you are NOT currently in removal proceedings, filing asylum could put you at risk of deportation if denied',
          });

          nextSteps.push('Check for status exceptions (TPS/Parole)');
          nextSteps.push('Find attorney (urgent)');
        }
        break;

      case 'yes':
        // Case B: Yes - Already filed
        if (responses.i589SubmissionDate) {
          const filingDate = new Date(responses.i589SubmissionDate);
          const eadEligibilityDate = new Date(filingDate.getTime() + 150 * 24 * 60 * 60 * 1000);
          const biometricsDate = new Date(filingDate.getTime() + 30 * 24 * 60 * 60 * 1000);

          cards.push({
            id: 'ead-eligibility',
            type: 'eligibility',
            priority: 'medium',
            title: 'EAD Eligibility (Work Authorization)',
            description: 'You can apply for work authorization 150 days after filing',
            dueDate: eadEligibilityDate.toISOString().split('T')[0],
            links: [
              {
                title: 'Form I-765 (EAD Application)',
                url: 'https://www.uscis.gov/i-765',
                type: 'form'
              }
            ]
          });

          cards.push({
            id: 'biometrics-appointment',
            type: 'info',
            priority: 'high',
            title: 'Biometrics Appointment',
            description: 'Expect biometrics notice approximately 2-6 weeks after filing',
            dueDate: biometricsDate.toISOString().split('T')[0]
          });
        }

        nextSteps.push('Prepare for asylum interview or court hearings');
        break;

      case 'not-sure':
        // Case C: Not sure
        cards.push({
          id: 'check-filing-status',
          type: 'action',
          priority: 'critical',
          title: 'Check If You Have Filed I-589',
          description: 'Check your USCIS receipts or EOIR case status to determine if you have filed',
          links: [
            {
              title: 'USCIS Case Status',
              url: 'https://egov.uscis.gov/casestatus/landing.do',
              type: 'status_check'
            },
            {
              title: 'EOIR Case Status',
              url: 'https://portal.eoir.justice.gov/InfoSystem/Login',
              type: 'status_check'
            }
          ]
        });
        nextSteps.push('Determine if you have filed I-589');
        break;
    }

    return { cards, bundles, nextSteps, warnings };
  }

  /**
   * 4. Filing Location Processing
   */
  private static processFilingLocation(responses: QuestionnaireResponse) {
    const cards: DisplayCard[] = [];
    const bundles: string[] = [];
    const nextSteps: string[] = [];

    if (responses.hasFiledI589 !== 'yes') {
      return { cards, bundles, nextSteps };
    }

    switch (responses.filingLocation) {
      case 'uscis':
        // Affirmative process
        bundles.push('affirmative-starter');
        
        cards.push({
          id: 'affirmative-process-info',
          type: 'info',
          priority: 'medium',
          title: 'Affirmative Asylum Process',
          description: 'Your case will proceed through USCIS with an asylum interview',
        });

        nextSteps.push('Await biometrics appointment');
        nextSteps.push('Prepare for asylum interview');
        break;

      case 'immigration-court':
        // Defensive process
        bundles.push('defensive-starter');
        
        cards.push({
          id: 'defensive-process-critical',
          type: 'warning',
          priority: 'critical',
          title: 'CRITICAL: Immigration Court Process',
          description: 'You MUST attend all hearings. Failure to appear results in automatic deportation order',
        });

        nextSteps.push('Find attorney (urgent if none)');
        nextSteps.push('Prepare for Master Calendar Hearing');
        break;

      case 'not-sure':
        cards.push({
          id: 'check-filing-location',
          type: 'action',
          priority: 'high',
          title: 'Determine Where You Filed',
          description: 'Check your receipt notice or case status to determine filing location',
          links: [
            {
              title: 'USCIS Case Status',
              url: 'https://egov.uscis.gov/casestatus/landing.do',
              type: 'status_check'
            },
            {
              title: 'EOIR Case Status',
              url: 'https://portal.eoir.justice.gov/InfoSystem/Login',
              type: 'status_check'
            }
          ]
        });
        nextSteps.push('Determine where you filed I-589');
        break;
    }

    return { cards, bundles, nextSteps };
  }

  /**
   * Court Information Processing
   */
  private static processCourtInformation(responses: QuestionnaireResponse) {
    const cards: DisplayCard[] = [];
    const nextSteps: string[] = [];

    // Next Hearing Date
    if (responses.nextHearingDate) {
      cards.push({
        id: 'next-hearing',
        type: 'deadline',
        priority: 'critical',
        title: 'Next Court Hearing',
        description: 'You must attend this hearing. Failure to appear will result in deportation order',
        dueDate: responses.nextHearingDate,
        links: [
          {
            title: 'EOIR Case Status',
            url: 'https://portal.eoir.justice.gov/InfoSystem/Login',
            type: 'status_check'
          }
        ]
      });
    } else if (responses.eoirCaseStatus === 'yes') {
      cards.push({
        id: 'check-hearing-date',
        type: 'action',
        priority: 'critical',
        title: 'Check Your Next Hearing Date',
        description: 'Find your next hearing date in EOIR case status',
        links: [
          {
            title: 'EOIR Case Status',
            url: 'https://portal.eoir.justice.gov/InfoSystem/Login',
            type: 'status_check'
          }
        ]
      });
      nextSteps.push('Check EOIR case info for hearing date');
    }

    // Assigned Court
    if (responses.assignedCourt) {
      cards.push({
        id: 'assigned-court-info',
        type: 'info',
        priority: 'medium',
        title: 'Your Assigned Court',
        description: `Your case is assigned to: ${responses.assignedCourt}`,
        links: [
          {
            title: 'Change of Venue (EOIR-33)',
            url: 'https://www.justice.gov/eoir/page/file/1258521/download',
            type: 'form'
          }
        ]
      });
    } else if (responses.eoirCaseStatus === 'yes') {
      nextSteps.push('Find your assigned court');
    }

    // EOIR Case Status
    if (responses.eoirCaseStatus === 'not-sure') {
      cards.push({
        id: 'check-eoir-status',
        type: 'action',
        priority: 'high',
        title: 'Check EOIR Case Status',
        description: 'Determine if you have a case in Immigration Court',
        links: [
          {
            title: 'EOIR Case Status',
            url: 'https://portal.eoir.justice.gov/InfoSystem/Login',
            type: 'status_check'
          }
        ]
      });
      nextSteps.push('Check EOIR case status');
    }

    return { cards, nextSteps };
  }

  /**
   * 8. Special Status Processing (TPS/Parole)
   */
  private static processSpecialStatus(responses: QuestionnaireResponse) {
    const cards: DisplayCard[] = [];
    const bundles: string[] = [];
    const warnings: string[] = [];

    const entryDate = responses.entryDate ? new Date(responses.entryDate) : null;
    const oneYearDeadline = entryDate ? new Date(entryDate.getTime() + 365 * 24 * 60 * 60 * 1000) : null;
    const deadlinePassed = oneYearDeadline ? new Date() > oneYearDeadline : false;

    const hasTPS = responses.hasTPS === 'yes';
    const hasParole = responses.hasParole === 'yes';

    if (deadlinePassed && (hasTPS || hasParole)) {
      bundles.push('status-exception');
      
      cards.push({
        id: 'status-exception-window',
        type: 'eligibility',
        priority: 'high',
        title: 'Late Filing Exception Available',
        description: `Having ${hasTPS && hasParole ? 'TPS and Parole' : hasTPS ? 'TPS' : 'Parole'} status may allow asylum application even after one year`,
      });
    }

    // TPS Processing
    if (hasTPS) {
      if (responses.tpsExpirationDate) {
        const tpsExpiry = new Date(responses.tpsExpirationDate);
        const recommendedDate = new Date(tpsExpiry.getTime() + 90 * 24 * 60 * 60 * 1000); // +3 months
        const maxDate = new Date(tpsExpiry.getTime() + 180 * 24 * 60 * 60 * 1000); // +6 months

        if (deadlinePassed) {
          cards.push({
            id: 'tps-exception-window',
            type: 'deadline',
            priority: 'high',
            title: 'TPS Exception Filing Window',
            description: `Recommended: Apply by ${recommendedDate.toLocaleDateString()}. Maximum: ${maxDate.toLocaleDateString()}`,
            dueDate: recommendedDate.toISOString().split('T')[0]
          });
        }
      } else {
        cards.push({
          id: 'find-tps-expiry',
          type: 'action',
          priority: 'medium',
          title: 'Find Your TPS Expiration Date',
          description: 'Check your TPS documents or USCIS website for expiration date',
          links: [
            {
              title: 'USCIS TPS Information',
              url: 'https://www.uscis.gov/humanitarian/temporary-protected-status',
              type: 'website'
            }
          ]
        });
      }
    }

    // Parole Processing
    if (hasParole) {
      if (responses.paroleExpirationDate) {
        const paroleExpiry = new Date(responses.paroleExpirationDate);
        const recommendedDate = new Date(paroleExpiry.getTime() + 90 * 24 * 60 * 60 * 1000);
        const maxDate = new Date(paroleExpiry.getTime() + 180 * 24 * 60 * 60 * 1000);

        if (deadlinePassed) {
          cards.push({
            id: 'parole-exception-window',
            type: 'deadline',
            priority: 'high',
            title: 'Parole Exception Filing Window',
            description: `Recommended: Apply by ${recommendedDate.toLocaleDateString()}. Maximum: ${maxDate.toLocaleDateString()}`,
            dueDate: recommendedDate.toISOString().split('T')[0]
          });
        }
      } else {
        cards.push({
          id: 'find-parole-expiry',
          type: 'action',
          priority: 'medium',
          title: 'Find Your Parole Expiration Date',
          description: 'Check your parole documents for expiration date',
        });
      }
    }

    // Both TPS and Parole
    if (hasTPS && hasParole) {
      cards.push({
        id: 'multiple-status-info',
        type: 'info',
        priority: 'medium',
        title: 'Multiple Protected Status',
        description: 'Having both TPS and Parole provides strong exception basis for late asylum filing',
      });
    }

    // No special status and past deadline
    if (!hasTPS && !hasParole && deadlinePassed && responses.hasTPS === 'no' && responses.hasParole === 'no') {
      warnings.push('No exception status - only Withholding of Removal may be available');
      
      cards.push({
        id: 'no-exception-warning',
        type: 'warning',
        priority: 'high',
        title: 'Limited Options Available',
        description: 'Without TPS or Parole status, asylum may not be available after one year. Withholding of Removal may still be possible.',
      });
    }

    // Not sure about status
    if (responses.hasTPS === 'not-sure' || responses.hasParole === 'not-sure') {
      cards.push({
        id: 'check-protected-status',
        type: 'action',
        priority: 'high',
        title: 'Check Your Protected Status Documents',
        description: 'Review your immigration documents for TPS designation or Parole authorization',
      });
    }

    return { cards, bundles, warnings };
  }

  /**
   * Utility function to sort cards by priority
   */
  private static sortCardsByPriority(cards: DisplayCard[]): DisplayCard[] {
    const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
    return cards.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  /**
   * Generate summary for user
   */
  static generateSummary(mapping: TimelineMapping): string {
    const { bundles, warnings, cards } = mapping;
    
    let summary = '';
    
    if (warnings.length > 0) {
      summary += `⚠️ IMPORTANT: ${warnings.join(', ')}\n\n`;
    }
    
    const criticalCards = cards.filter(card => card.priority === 'critical');
    if (criticalCards.length > 0) {
      summary += `🚨 CRITICAL ACTIONS NEEDED:\n`;
      criticalCards.forEach(card => {
        summary += `• ${card.title}\n`;
      });
      summary += '\n';
    }
    
    if (bundles.includes('defensive-starter')) {
      summary += `📋 Your case is in Immigration Court (defensive process)\n`;
    } else if (bundles.includes('affirmative-starter')) {
      summary += `📋 Your case is with USCIS (affirmative process)\n`;
    }
    
    return summary;
  }
}

export default QuestionnaireLogicService;