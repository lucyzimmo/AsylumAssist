import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  AsylumTimeline, 
  AsylumPhase, 
  DeadlineCalculation, 
  TimelineAlert, 
  AsylumPhaseType,
  TimelineStep,
  TimelineBundle,
  BundleDefinition,
  BundleConditionFunction,
  BundleStepGenerator
} from '../types/timeline';
import QuestionnaireLogicService, { QuestionnaireResponse, DisplayCard } from './questionnaireLogicService';

const TIMELINE_STORAGE_KEY = '@asylumassist_asylum_timeline';

// Timeline Bundle Definitions
const TIMELINE_BUNDLES: BundleDefinition[] = [
  {
    id: 'affirmative-starter',
    name: 'Affirmative Asylum Application',
    description: 'Steps for filing asylum with USCIS (not in court)',
    priority: 1,
    triggerConditions: (questionnaireData: any, timeline?: AsylumTimeline) => {
      const notInCourt = !questionnaireData?.hasCase || questionnaireData.hasCase === 'no';
      const hasEntryDate = !!questionnaireData?.entryDate;
      const notFiledI589 = !questionnaireData?.hasFiledI589 || questionnaireData.hasFiledI589 === 'no';
      
      return notInCourt && hasEntryDate && notFiledI589;
    },
    generateSteps: (questionnaireData: any, timeline?: AsylumTimeline) => {
      const entryDate = questionnaireData?.entryDate || timeline?.entryDate;
      const hasAttorney = questionnaireData?.hasAttorney || timeline?.personalInfo?.hasAttorney;
      
      if (!entryDate) return [];
      
      const oneYearDeadline = new Date(entryDate);
      oneYearDeadline.setFullYear(oneYearDeadline.getFullYear() + 1);
      const oneYearDeadlineStr = oneYearDeadline.toISOString().split('T')[0];
      
      const defaultFilingDate = new Date();
      defaultFilingDate.setDate(defaultFilingDate.getDate() + 30);
      const defaultFilingDateStr = defaultFilingDate.toISOString().split('T')[0];
      
      const steps: TimelineStep[] = [
        {
          id: 'one-year-deadline',
          bundleId: 'affirmative-starter',
          title: 'One-year asylum filing deadline',
          description: 'You must file your asylum application within one year of arrival unless you qualify for an exception',
          dueDate: oneYearDeadlineStr,
          status: 'pending',
          priority: 'critical',
          links: [
            {
              title: 'Form I-589 Instructions',
              url: 'https://www.uscis.gov/i-589',
              type: 'form'
            }
          ]
        },
        {
          id: 'file-i589',
          bundleId: 'affirmative-starter',
          title: 'File asylum application (I-589)',
          description: 'Submit Form I-589 to USCIS Asylum Office with supporting documents and $100 filing fee (if applicable)',
          dueDate: defaultFilingDateStr,
          status: 'pending',
          priority: 'high',
          links: [
            {
              title: 'Form I-589 (PDF)',
              url: 'https://www.uscis.gov/sites/default/files/document/forms/i-589.pdf',
              type: 'form'
            },
            {
              title: 'I-589 Instructions',
              url: 'https://www.uscis.gov/sites/default/files/document/forms/i-589instr.pdf',
              type: 'guide'
            },
            {
              title: 'USCIS Asylum Office Locations',
              url: 'https://www.uscis.gov/about-us/find-a-uscis-office/asylum-offices',
              type: 'website'
            }
          ]
        }
      ];
      
      // Add fee warning if applicable (after July 22, 2025)
      const today = new Date();
      const feeEffectiveDate = new Date('2025-07-22');
      if (today >= feeEffectiveDate) {
        steps.push({
          id: 'filing-fee-warning',
          bundleId: 'affirmative-starter',
          title: 'Filing fee required: $100 + $100/year pending',
          description: 'New asylum filing fees are now in effect',
          status: 'pending',
          priority: 'medium'
        });
      }
      
      // Add evidence gathering and preparation steps
      const evidenceDeadline = new Date(oneYearDeadline);
      evidenceDeadline.setDate(evidenceDeadline.getDate() - 60); // 60 days before filing deadline
      
      const interviewPrepDate = new Date();
      interviewPrepDate.setDate(interviewPrepDate.getDate() + 90); // Typical wait time
      
      steps.push(
        {
          id: 'find-attorney',
          bundleId: 'affirmative-starter',
          title: 'Find an attorney',
          description: hasAttorney ? 'You have legal representation' : 'Find qualified immigration attorney - legal representation significantly improves success rates',
          status: hasAttorney ? 'completed' : 'pending',
          priority: hasAttorney ? 'low' : 'high',
          completedDate: hasAttorney ? new Date().toISOString() : undefined,
          links: [
            {
              title: 'Find Pro Bono Legal Services',
              url: 'https://www.immigrationadvocates.org/nonprofit/legaldirectory/',
              type: 'website'
            },
            {
              title: 'American Immigration Lawyers Association',
              url: 'https://www.aila.org/about/member-directory',
              type: 'website'
            }
          ]
        },
        {
          id: 'gather-personal-evidence',
          bundleId: 'affirmative-starter',
          title: 'Gather personal evidence',
          description: 'Collect identity documents, medical records, police reports, photos, and other personal evidence of persecution',
          dueDate: evidenceDeadline.toISOString().split('T')[0],
          status: 'pending',
          priority: 'high',
          links: [
            {
              title: 'Evidence Checklist',
              url: 'https://www.uscis.gov/sites/default/files/document/guides/Asylum_Evidence_Guide.pdf',
              type: 'guide'
            }
          ]
        },
        {
          id: 'gather-country-conditions',
          bundleId: 'affirmative-starter',
          title: 'Research country conditions',
          description: 'Gather evidence about persecution in your home country from reliable sources like State Department reports, UN reports, and news articles',
          dueDate: evidenceDeadline.toISOString().split('T')[0],
          status: 'pending',
          priority: 'medium',
          links: [
            {
              title: 'US State Department Country Reports',
              url: 'https://www.state.gov/reports/2024-country-reports-on-human-rights-practices/',
              type: 'website'
            },
            {
              title: 'UNHCR Reports',
              url: 'https://www.unhcr.org/research-and-publications',
              type: 'website'
            }
          ]
        },
        {
          id: 'prepare-personal-statement',
          bundleId: 'affirmative-starter',
          title: 'Write personal statement',
          description: 'Prepare detailed written statement describing persecution experienced and feared. This is critical - work with attorney if possible',
          dueDate: evidenceDeadline.toISOString().split('T')[0],
          status: 'pending',
          priority: 'high',
          links: [
            {
              title: 'Personal Statement Guide',
              url: 'https://www.uscis.gov/sites/default/files/document/guides/Personal_Statement_Guide.pdf',
              type: 'guide'
            }
          ]
        },
        {
          id: 'await-interview-notice',
          bundleId: 'affirmative-starter',
          title: 'Await interview scheduling notice',
          description: 'After filing, USCIS will mail you an interview notice. This typically takes 2-4 months',
          status: 'pending',
          priority: 'low'
        },
        {
          id: 'prepare-for-interview',
          bundleId: 'affirmative-starter',
          title: 'Prepare for asylum interview',
          description: 'Practice telling your story clearly and consistently. Review all evidence with attorney. Prepare for detailed questions about your case',
          dueDate: interviewPrepDate.toISOString().split('T')[0],
          status: 'pending',
          priority: 'high',
          links: [
            {
              title: 'Interview Preparation Guide',
              url: 'https://www.uscis.gov/sites/default/files/document/guides/Asylum_Interview_Prep.pdf',
              type: 'guide'
            }
          ]
        },
        {
          id: 'asylum-interview',
          bundleId: 'affirmative-starter',
          title: 'Attend asylum interview',
          description: 'Your asylum interview with USCIS. Arrive early, bring interpreter if needed, and bring all original documents',
          status: 'pending',
          priority: 'critical',
          links: [
            {
              title: 'What to Expect at Interview',
              url: 'https://www.uscis.gov/humanitarian/refugees-and-asylum/asylum/the-asylum-interview',
              type: 'guide'
            }
          ]
        }
      );
      
      return steps;
    }
  },
  {
    id: 'defensive-starter',
    name: 'Defensive Asylum (Immigration Court)',
    description: 'Steps for asylum cases in Immigration Court proceedings',
    priority: 0, // Highest priority - court cases are urgent
    triggerConditions: (questionnaireData: any, timeline?: AsylumTimeline) => {
      return questionnaireData?.hasCase === 'yes' || questionnaireData?.visitedEOIR === true;
    },
    generateSteps: (questionnaireData: any, timeline?: AsylumTimeline) => {
      const hasAttorney = questionnaireData?.hasAttorney || timeline?.personalInfo?.hasAttorney;
      const nextHearingDate = questionnaireData?.nextHearingDate || timeline?.nextCourtHearing;
      const entryDate = questionnaireData?.entryDate || timeline?.entryDate;
      
      const steps: TimelineStep[] = [
        {
          id: 'critical-court-warning',
          bundleId: 'defensive-starter',
          title: 'CRITICAL: You MUST attend all hearings',
          description: 'Failure to appear will result in automatic deportation order',
          status: 'pending',
          priority: 'critical'
        },
        {
          id: 'find-court-attorney',
          bundleId: 'defensive-starter',
          title: hasAttorney ? 'Legal representation confirmed' : 'Find an attorney (URGENT)',
          description: hasAttorney ? 'You have legal representation for court' : 'Legal representation is critical for Immigration Court proceedings',
          status: hasAttorney ? 'completed' : 'pending',
          priority: hasAttorney ? 'low' : 'critical',
          completedDate: hasAttorney ? new Date().toISOString() : undefined,
          links: [
            {
              title: 'Find Immigration Lawyer',
              url: 'https://www.immigrationadvocates.org/nonprofit/legaldirectory/',
              type: 'website'
            }
          ]
        }
      ];
      
      if (nextHearingDate) {
        const hearingDate = new Date(nextHearingDate);
        const prepDeadline = new Date(hearingDate);
        prepDeadline.setDate(prepDeadline.getDate() - 14); // 2 weeks before hearing
        
        steps.push({
          id: 'master-calendar-hearing',
          bundleId: 'defensive-starter',
          title: 'Master Calendar Hearing',
          description: 'Initial court hearing to set timeline and procedures. Bring all documents, interpreter if needed, and legal representation',
          dueDate: nextHearingDate,
          status: 'pending',
          priority: 'critical',
          links: [
            {
              title: 'EOIR Case Status',
              url: 'https://portal.eoir.justice.gov/InfoSystem/Login',
              type: 'status_check'
            },
            {
              title: 'Immigration Court Practice Manual',
              url: 'https://www.justice.gov/eoir/page/file/1258536/download',
              type: 'guide'
            }
          ]
        });
        
        steps.push({
          id: 'prepare-hearing-documents',
          bundleId: 'defensive-starter',
          title: 'Prepare for hearing - gather documents',
          description: 'Organize all evidence, translations, and supporting documents for court presentation',
          dueDate: prepDeadline.toISOString().split('T')[0],
          status: 'pending',
          priority: 'high',
          links: [
            {
              title: 'Court Document Requirements',
              url: 'https://www.justice.gov/eoir/page/file/1258521/download',
              type: 'guide'
            }
          ]
        });
      }
      
      steps.push(
        {
          id: 'file-application-court',
          bundleId: 'defensive-starter',
          title: 'File defensive asylum application (I-589)',
          description: 'Submit Form I-589 to Immigration Court clerk within one-year deadline (with copy to DHS attorney)',
          status: 'pending',
          priority: 'critical',
          links: [
            {
              title: 'Form I-589 (PDF)',
              url: 'https://www.uscis.gov/sites/default/files/document/forms/i-589.pdf',
              type: 'form'
            },
            {
              title: 'Filing Requirements',
              url: 'https://www.justice.gov/eoir/page/file/1258521/download',
              type: 'guide'
            }
          ]
        },
        {
          id: 'evidence-submission-deadline',
          bundleId: 'defensive-starter',
          title: 'Submit evidence by deadline',
          description: 'Submit all supporting evidence and witness lists by court-ordered deadline (typically 10-15 days before individual hearing)',
          status: 'pending',
          priority: 'critical',
          links: [
            {
              title: 'Evidence Submission Guide',
              url: 'https://www.justice.gov/eoir/page/file/1258521/download',
              type: 'guide'
            }
          ]
        },
        {
          id: 'witness-preparation',
          bundleId: 'defensive-starter',
          title: 'Prepare witnesses',
          description: 'If you have witnesses, prepare them for testimony. Submit witness lists to court by deadline',
          status: 'pending',
          priority: 'medium',
          links: [
            {
              title: 'Witness Guide',
              url: 'https://www.justice.gov/eoir/page/file/1258526/download',
              type: 'guide'
            }
          ]
        },
        {
          id: 'individual-hearing-placeholder',
          bundleId: 'defensive-starter',
          title: 'Individual Hearing (Merits)',
          description: 'Your asylum trial before an Immigration Judge. This is your opportunity to present your case and testify about your persecution',
          status: 'pending',
          priority: 'critical',
          links: [
            {
              title: 'What to Expect in Court',
              url: 'https://www.justice.gov/eoir/page/file/1258531/download',
              type: 'guide'
            }
          ]
        },
        {
          id: 'post-hearing-wait',
          bundleId: 'defensive-starter',
          title: 'Await judge\'s decision',
          description: 'Judge will either grant asylum, deny the case, or continue for further proceedings. Decision may be oral or written',
          status: 'pending',
          priority: 'medium'
        },
        {
          id: 'change-of-venue',
          bundleId: 'defensive-starter',
          title: 'Change of Venue (if needed)',
          description: 'File EOIR-33 form if you need to transfer your case to a different court due to relocation',
          status: 'pending',
          priority: 'low',
          links: [
            {
              title: 'EOIR-33 Form',
              url: 'https://www.justice.gov/eoir/page/file/1258521/download',
              type: 'form'
            }
          ]
        }
      );
      
      // Add I-589 filing step if not yet filed
      if (entryDate && (!questionnaireData?.hasFiledI589 || questionnaireData.hasFiledI589 === 'no')) {
        const oneYearDeadline = new Date(entryDate);
        oneYearDeadline.setFullYear(oneYearDeadline.getFullYear() + 1);
        
        steps.unshift({
          id: 'file-i589-court',
          bundleId: 'defensive-starter',
          title: 'File Form I-589 with Immigration Court',
          description: 'Submit asylum application within one-year deadline',
          dueDate: oneYearDeadline.toISOString().split('T')[0],
          status: 'pending',
          priority: 'critical',
          links: [
            {
              title: 'Form I-589',
              url: 'https://www.uscis.gov/i-589',
              type: 'form'
            }
          ]
        });
      }
      
      return steps;
    }
  },
  {
    id: 'after-denial',
    name: 'Appeal to BIA',
    description: 'Steps after asylum denial by Immigration Judge',
    priority: 0,
    triggerConditions: (questionnaireData: any, timeline?: AsylumTimeline) => {
      return timeline?.caseOutcome === 'denied';
    },
    generateSteps: (questionnaireData: any, timeline?: AsylumTimeline) => {
      const denialDate = timeline?.decisionDate;
      if (!denialDate) return [];
      
      const appealDeadline = new Date(denialDate);
      appealDeadline.setDate(appealDeadline.getDate() + 30);
      
      return [
        {
          id: 'file-bia-appeal',
          bundleId: 'after-denial',
          title: 'File Notice of Appeal to BIA',
          description: 'Appeal Immigration Judge decision to Board of Immigration Appeals',
          dueDate: appealDeadline.toISOString().split('T')[0],
          status: 'pending',
          priority: 'critical',
          links: [
            {
              title: 'BIA Appeal Process',
              url: 'https://www.justice.gov/eoir/board-of-immigration-appeals',
              type: 'guide'
            }
          ]
        },
        {
          id: 'bia-briefing-schedule',
          bundleId: 'after-denial',
          title: 'BIA briefing schedule',
          description: 'Follow BIA briefing deadlines once appeal is accepted',
          status: 'pending',
          priority: 'medium',
          showAfterStep: 'file-bia-appeal'
        }
      ];
    }
  },
  {
    id: 'missed-hearing',
    name: 'Missed Hearing - Motion to Reopen',
    description: 'Steps after missing Immigration Court hearing',
    priority: 0,
    triggerConditions: (questionnaireData: any, timeline?: AsylumTimeline) => {
      return timeline?.hasMissedHearing === true;
    },
    generateSteps: (questionnaireData: any, timeline?: AsylumTimeline) => {
      const missedDate = timeline?.missedHearingDate || timeline?.nextCourtHearing;
      if (!missedDate) return [];
      
      const motionDeadline = new Date(missedDate);
      motionDeadline.setDate(motionDeadline.getDate() + 180);
      
      return [
        {
          id: 'in-absentia-order-info',
          bundleId: 'missed-hearing',
          title: 'In absentia removal order issued',
          description: 'You have been ordered removed in your absence',
          status: 'pending',
          priority: 'critical'
        },
        {
          id: 'motion-to-reopen',
          bundleId: 'missed-hearing',
          title: 'Motion to Reopen',
          description: 'File motion to reopen removal proceedings (within 180 days for exceptional circumstances)',
          dueDate: motionDeadline.toISOString().split('T')[0],
          status: 'pending',
          priority: 'critical',
          links: [
            {
              title: 'Motion to Reopen Guide',
              url: 'https://www.justice.gov/eoir/immigration-court-practice-manual',
              type: 'guide'
            }
          ]
        }
      ];
    }
  },
  {
    id: 'status-exception',
    name: 'Late Filing - Status Exception',
    description: 'Steps for asylum filing after one-year deadline with TPS or Parole',
    priority: 2,
    triggerConditions: (questionnaireData: any, timeline?: AsylumTimeline) => {
      const entryDate = questionnaireData?.entryDate || timeline?.entryDate;
      const hasFiledI589 = questionnaireData?.hasFiledI589 === 'yes' || !!timeline?.i589FilingDate;
      const hasTPS = questionnaireData?.hasTPS === 'yes' || timeline?.hasTPSStatus;
      const hasParole = questionnaireData?.hasParole === 'yes' || timeline?.hasParoleStatus;
      
      if (!entryDate || hasFiledI589) return false;
      
      const oneYearDeadline = new Date(entryDate);
      oneYearDeadline.setFullYear(oneYearDeadline.getFullYear() + 1);
      const isPastDeadline = new Date() > oneYearDeadline;
      
      return isPastDeadline && (hasTPS || hasParole);
    },
    generateSteps: (questionnaireData: any, timeline?: AsylumTimeline) => {
      const steps: TimelineStep[] = [];
      const hasTPS = questionnaireData?.hasTPS === 'yes' || timeline?.hasTPSStatus;
      const hasParole = questionnaireData?.hasParole === 'yes' || timeline?.hasParoleStatus;
      
      if (hasTPS) {
        const tpsExpiryDate = questionnaireData?.tpsExpirationDate || timeline?.tpsExpirationDate;
        if (tpsExpiryDate) {
          const expiryDate = new Date(tpsExpiryDate);
          const recommendedDate = new Date(expiryDate);
          recommendedDate.setMonth(recommendedDate.getMonth() + 3);
          const latestDate = new Date(expiryDate);
          latestDate.setMonth(latestDate.getMonth() + 6);
          
          steps.push({
            id: 'tps-expiry-window',
            bundleId: 'status-exception',
            title: 'TPS expiry filing window',
            description: `Recommended apply by: ${recommendedDate.toLocaleDateString()}, Latest: ${latestDate.toLocaleDateString()}`,
            dueDate: recommendedDate.toISOString().split('T')[0],
            status: 'pending',
            priority: 'high'
          });
        } else {
          steps.push({
            id: 'find-tps-expiry',
            bundleId: 'status-exception',
            title: 'Find your TPS expiry date',
            description: 'Check your TPS approval notice or USCIS website for expiry date',
            status: 'pending',
            priority: 'high',
            links: [
              {
                title: 'Check TPS Status',
                url: 'https://www.uscis.gov/humanitarian/temporary-protected-status',
                type: 'website'
              }
            ]
          });
        }
      }
      
      if (hasParole) {
        const paroleExpiryDate = questionnaireData?.paroleExpirationDate || timeline?.paroleExpirationDate;
        if (paroleExpiryDate) {
          const expiryDate = new Date(paroleExpiryDate);
          const recommendedDate = new Date(expiryDate);
          recommendedDate.setMonth(recommendedDate.getMonth() + 3);
          const latestDate = new Date(expiryDate);
          latestDate.setMonth(latestDate.getMonth() + 6);
          
          steps.push({
            id: 'parole-expiry-window',
            bundleId: 'status-exception',
            title: 'Parole expiry filing window',
            description: `Recommended apply by: ${recommendedDate.toLocaleDateString()}, Latest: ${latestDate.toLocaleDateString()}`,
            dueDate: recommendedDate.toISOString().split('T')[0],
            status: 'pending',
            priority: 'high'
          });
        }
      }
      
      return steps;
    }
  },
  {
    id: 'post-grant',
    name: 'After Asylum Approval',
    description: 'Steps after asylum is granted',
    priority: 3,
    triggerConditions: (questionnaireData: any, timeline?: AsylumTimeline) => {
      return timeline?.caseOutcome === 'asylum_granted';
    },
    generateSteps: (questionnaireData: any, timeline?: AsylumTimeline) => {
      const grantDate = timeline?.decisionDate;
      if (!grantDate) return [];
      
      const greenCardEligibleDate = new Date(grantDate);
      greenCardEligibleDate.setFullYear(greenCardEligibleDate.getFullYear() + 1);
      
      return [
        {
          id: 'apply-ssn-benefits',
          bundleId: 'post-grant',
          title: 'Apply for Social Security Number / benefits',
          description: 'Apply for SSN and explore available benefits',
          status: 'pending',
          priority: 'medium',
          links: [
            {
              title: 'Apply for SSN',
              url: 'https://www.ssa.gov/ssnumber/',
              type: 'website'
            }
          ]
        },
        {
          id: 'apply-green-card',
          bundleId: 'post-grant',
          title: 'Apply for Green Card',
          description: 'File Form I-485 to adjust status to permanent resident',
          dueDate: greenCardEligibleDate.toISOString().split('T')[0],
          status: 'pending',
          priority: 'high',
          links: [
            {
              title: 'Form I-485',
              url: 'https://www.uscis.gov/i-485',
              type: 'form'
            }
          ]
        },
        {
          id: 'derivative-family-petitions',
          bundleId: 'post-grant',
          title: 'Derivative family petitions (if applicable)',
          description: 'Apply for asylum for eligible family members',
          status: 'pending',
          priority: 'medium',
          links: [
            {
              title: 'Derivative Asylum Guide',
              url: 'https://www.uscis.gov/humanitarian/refugees-and-asylum/asylum/obtaining-asylum-united-states',
              type: 'guide'
            }
          ]
        }
      ];
    }
  },
  {
    id: 'appeal-case',
    name: 'Appeal Denied Asylum Case',
    description: 'Steps for appealing a denied asylum case to BIA',
    priority: 0, // Highest priority - time-sensitive appeals
    triggerConditions: (questionnaireData: any, timeline?: AsylumTimeline) => {
      // This bundle would typically be triggered manually when a case is denied
      return questionnaireData?.caseStatus === 'denied' || questionnaireData?.needsAppeal === true;
    },
    generateSteps: (questionnaireData: any, timeline?: AsylumTimeline) => {
      const denialDate = questionnaireData?.denialDate || new Date().toISOString().split('T')[0];
      const appealDeadline = new Date(denialDate);
      appealDeadline.setDate(appealDeadline.getDate() + 30); // 30-day deadline
      
      const steps: TimelineStep[] = [
        {
          id: 'appeal-deadline-warning',
          bundleId: 'appeal-case',
          title: 'CRITICAL: 30-day appeal deadline',
          description: 'You have only 30 days from the denial date to file an appeal to the Board of Immigration Appeals (BIA). This deadline is strictly enforced',
          dueDate: appealDeadline.toISOString().split('T')[0],
          status: 'pending',
          priority: 'critical',
          links: [
            {
              title: 'BIA Practice Manual',
              url: 'https://www.justice.gov/eoir/page/file/1084851/download',
              type: 'guide'
            }
          ]
        },
        {
          id: 'file-bia-appeal',
          bundleId: 'appeal-case',
          title: 'File Notice of Appeal (EOIR-26)',
          description: 'File Form EOIR-26 with the Immigration Court along with the $110 filing fee',
          dueDate: appealDeadline.toISOString().split('T')[0],
          status: 'pending',
          priority: 'critical',
          links: [
            {
              title: 'Form EOIR-26',
              url: 'https://www.justice.gov/eoir/page/file/1258521/download',
              type: 'form'
            },
            {
              title: 'BIA Filing Requirements',
              url: 'https://www.justice.gov/eoir/page/file/1084851/download',
              type: 'guide'
            }
          ]
        },
        {
          id: 'request-transcript',
          bundleId: 'appeal-case',
          title: 'Request hearing transcript',
          description: 'Request official transcript of your immigration court hearing - required for appeal',
          status: 'pending',
          priority: 'high',
          links: [
            {
              title: 'Transcript Request Form',
              url: 'https://www.justice.gov/eoir/page/file/1258526/download',
              type: 'form'
            }
          ]
        },
        {
          id: 'prepare-appeal-brief',
          bundleId: 'appeal-case',
          title: 'Prepare and file appeal brief',
          description: 'Prepare detailed legal brief explaining why the Immigration Judge made errors in your case. Must be filed within 21 days after transcript is available',
          status: 'pending',
          priority: 'critical',
          links: [
            {
              title: 'BIA Brief Writing Guide',
              url: 'https://www.justice.gov/eoir/page/file/1084856/download',
              type: 'guide'
            }
          ]
        },
        {
          id: 'await-bia-decision',
          bundleId: 'appeal-case',
          title: 'Await BIA decision',
          description: 'The BIA typically takes 6-18 months to decide appeals. Monitor case status regularly',
          status: 'pending',
          priority: 'medium',
          links: [
            {
              title: 'Check BIA Case Status',
              url: 'https://portal.eoir.justice.gov/InfoSystem/Login',
              type: 'status_check'
            }
          ]
        },
        {
          id: 'consider-federal-court',
          bundleId: 'appeal-case',
          title: 'Consider federal court review',
          description: 'If BIA denies your appeal, you may be able to petition federal Court of Appeals within 30 days',
          status: 'pending',
          priority: 'medium',
          links: [
            {
              title: 'Federal Court Petition Guide',
              url: 'https://www.uscourts.gov/services-forms/immigration-appeals',
              type: 'guide'
            }
          ]
        },
        {
          id: 'stay-of-removal',
          bundleId: 'appeal-case',
          title: 'Request stay of removal (if needed)',
          description: 'If you are at risk of immediate removal, file emergency motion for stay of removal',
          status: 'pending',
          priority: 'critical',
          links: [
            {
              title: 'Stay of Removal Motion',
              url: 'https://www.justice.gov/eoir/page/file/1258531/download',
              type: 'form'
            }
          ]
        }
      ];
      
      return steps;
    }
  }
];

class TimelineService {
  private asylumTimeline: AsylumTimeline | null = null;
  private bundleDefinitions: BundleDefinition[] = TIMELINE_BUNDLES;

  /**
   * Evaluate which bundles should be active based on questionnaire data
   */
  private evaluateBundles(questionnaireData: any, timeline?: AsylumTimeline): string[] {
    const activeBundles: string[] = [];
    
    for (const bundle of this.bundleDefinitions) {
      try {
        if (bundle.triggerConditions(questionnaireData, timeline)) {
          activeBundles.push(bundle.id);
        }
      } catch (error) {
        console.error(`Error evaluating bundle ${bundle.id}:`, error);
      }
    }
    
    return activeBundles;
  }

  /**
   * Generate timeline steps from active bundles
   */
  private generateTimelineSteps(questionnaireData: any, timeline?: AsylumTimeline): TimelineStep[] {
    const activeBundles = this.evaluateBundles(questionnaireData, timeline);
    const allSteps: TimelineStep[] = [];
    
    // Generate steps for each active bundle
    for (const bundleId of activeBundles) {
      const bundle = this.bundleDefinitions.find(b => b.id === bundleId);
      if (!bundle) continue;
      
      try {
        const steps = bundle.generateSteps(questionnaireData, timeline);
        steps.forEach(step => {
          step.bundleName = bundle.name;
        });
        allSteps.push(...steps);
      } catch (error) {
        console.error(`Error generating steps for bundle ${bundleId}:`, error);
      }
    }
    
    // Filter out steps that should be hidden based on showAfterStep conditions
    const visibleSteps = this.filterVisibleSteps(allSteps, timeline?.steps || []);
    
    // Update step statuses (pending, overdue, etc.)
    this.updateStepStatuses(visibleSteps);
    
    // Sort steps by priority and due date
    return this.sortStepsByPriority(visibleSteps);
  }

  /**
   * Filter steps based on showAfterStep conditions
   */
  private filterVisibleSteps(newSteps: TimelineStep[], existingSteps: TimelineStep[]): TimelineStep[] {
    return newSteps.filter(step => {
      if (!step.showAfterStep) return true;
      
      // Check if the required step is completed in existing steps
      const requiredStep = existingSteps.find(s => s.id === step.showAfterStep);
      return requiredStep?.status === 'completed';
    });
  }

  /**
   * Update step statuses based on current date and completion
   */
  private updateStepStatuses(steps: TimelineStep[]): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const step of steps) {
      if (step.status === 'completed') continue;
      
      if (step.dueDate) {
        const dueDate = new Date(step.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        if (today > dueDate) {
          step.status = 'overdue';
        } else {
          step.status = 'pending';
        }
      } else {
        step.status = 'pending';
      }
    }
  }

  /**
   * Sort steps by priority and due date
   */
  private sortStepsByPriority(steps: TimelineStep[]): TimelineStep[] {
    const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
    const statusOrder = { 'overdue': 0, 'pending': 1, 'completed': 2 };
    
    return steps.sort((a, b) => {
      // First sort by completion status (overdue first, then pending, then completed)
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      
      // Then by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by due date (earlier dates first)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      // Steps with dates come before steps without dates
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      // Finally by title alphabetically
      return a.title.localeCompare(b.title);
    });
  }

  /**
   * Rebuild timeline from questionnaire data using bundle system
   */
  private rebuildTimeline(questionnaireData: any, existingTimeline?: AsylumTimeline): AsylumTimeline {
    const timeline = existingTimeline || {} as AsylumTimeline;
    
    // Use new questionnaire logic service to determine bundles and display cards
    const questionnaireResponse: QuestionnaireResponse = this.mapToQuestionnaireResponse(questionnaireData);
    const mapping = QuestionnaireLogicService.mapResponsesToTimeline(questionnaireResponse);
    
    // Generate new steps from determined bundles
    const steps = this.generateStepsFromBundles(mapping.bundles, questionnaireData, timeline);
    
    // Preserve completed steps from existing timeline
    if (existingTimeline?.steps) {
      this.preserveCompletedSteps(steps, existingTimeline.steps);
    }
    
    // Update timeline with new data
    timeline.steps = steps;
    timeline.activeBundles = mapping.bundles;
    timeline.questionnaireData = questionnaireData;
    timeline.lastUpdated = new Date().toISOString();
    timeline.displayCards = mapping.cards; // Add display cards to timeline
    timeline.warnings = mapping.warnings; // Add warnings
    
    // Generate legacy phases for backward compatibility
    timeline.phases = this.generateLegacyPhases(steps);
    timeline.currentPhase = this.determineCurrentPhase(timeline.phases);
    
    return timeline;
  }
  
  /**
   * Map internal questionnaire data to QuestionnaireResponse format
   */
  private mapToQuestionnaireResponse(questionnaireData: any): QuestionnaireResponse {
    return {
      entryDate: questionnaireData?.entryDate,
      hasFiledI589: questionnaireData?.hasFiledI589 || '',
      i589SubmissionDate: questionnaireData?.i589SubmissionDate,
      filingLocation: questionnaireData?.filingLocation,
      nextHearingDate: questionnaireData?.nextHearingDate,
      assignedCourt: questionnaireData?.assignedCourt,
      eoirCaseStatus: questionnaireData?.eoirCaseStatus,
      hasTPS: questionnaireData?.hasTPS,
      tpsCountry: questionnaireData?.tpsCountry,
      tpsExpirationDate: questionnaireData?.tpsExpirationDate,
      hasParole: questionnaireData?.hasParole,
      paroleType: questionnaireData?.paroleType,
      paroleExpirationDate: questionnaireData?.paroleExpirationDate,
      hasAttorney: questionnaireData?.hasAttorney,
      hasCase: questionnaireData?.hasCase,
    };
  }
  
  /**
   * Generate steps from specific bundle IDs
   */
  private generateStepsFromBundles(bundleIds: string[], questionnaireData: any, timeline?: AsylumTimeline): TimelineStep[] {
    const allSteps: TimelineStep[] = [];
    
    for (const bundleId of bundleIds) {
      const bundle = this.bundleDefinitions.find(b => b.id === bundleId);
      if (bundle && bundle.triggerConditions(questionnaireData, timeline)) {
        const steps = bundle.generateSteps(questionnaireData, timeline);
        allSteps.push(...steps);
      }
    }
    
    // Sort steps by priority and due date
    return this.sortStepsByPriorityAndDate(allSteps);
  }

  /**
   * Sort steps by priority and due date
   */
  private sortStepsByPriorityAndDate(steps: TimelineStep[]): TimelineStep[] {
    return steps.sort((a, b) => {
      // First sort by priority (lower number = higher priority)
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      
      // Then sort by due date (earlier dates first)
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      // If one has a due date and the other doesn't, prioritize the one with a due date
      if (a.dueDate && !b.dueDate) return -1;
      if (!a.dueDate && b.dueDate) return 1;
      
      // If neither has a due date, maintain original order
      return 0;
    });
  }

  /**
   * Preserve completion status and dates from existing steps
   */
  private preserveCompletedSteps(newSteps: TimelineStep[], existingSteps: TimelineStep[]): void {
    for (const newStep of newSteps) {
      const existingStep = existingSteps.find(s => s.id === newStep.id);
      if (existingStep?.status === 'completed') {
        newStep.status = 'completed';
        newStep.completedDate = existingStep.completedDate;
      }
    }
  }

  /**
   * Generate legacy AsylumPhase objects for backward compatibility
   */
  private generateLegacyPhases(steps: TimelineStep[]): AsylumPhase[] {
    const phases: AsylumPhase[] = [];
    const bundleGroups = this.groupStepsByBundle(steps);
    
    for (const [bundleId, bundleSteps] of Object.entries(bundleGroups)) {
      const bundle = this.bundleDefinitions.find(b => b.id === bundleId);
      if (!bundle) continue;
      
      const hasCompletedSteps = bundleSteps.some(s => s.status === 'completed');
      const hasOverdueSteps = bundleSteps.some(s => s.status === 'overdue');
      const hasPendingSteps = bundleSteps.some(s => s.status === 'pending');
      
      let status: AsylumPhase['status'];
      if (hasOverdueSteps || hasPendingSteps) {
        status = 'current';
      } else if (hasCompletedSteps) {
        status = 'completed';
      } else {
        status = 'upcoming';
      }
      
      const earliestDueDate = bundleSteps
        .filter(s => s.dueDate)
        .map(s => s.dueDate!)
        .sort()[0];
      
      phases.push({
        id: bundleId,
        title: bundle.name,
        status,
        description: bundle.description,
        keyAction: bundleSteps[0]?.title || 'Complete required steps',
        deadline: earliestDueDate,
        daysUntilDeadline: earliestDueDate ? this.calculateDaysUntil(earliestDueDate) : undefined,
        nextSteps: bundleSteps.map(s => s.title),
        resources: bundleSteps.flatMap(s => s.links?.map(l => l.title) || []),
        isLocked: false,
        completedDate: status === 'completed' ? new Date().toISOString() : undefined
      });
    }
    
    return phases.sort((a, b) => {
      const bundle1 = this.bundleDefinitions.find(b => b.id === a.id);
      const bundle2 = this.bundleDefinitions.find(b => b.id === b.id);
      return (bundle1?.priority || 999) - (bundle2?.priority || 999);
    });
  }

  /**
   * Group steps by bundle ID
   */
  private groupStepsByBundle(steps: TimelineStep[]): Record<string, TimelineStep[]> {
    const groups: Record<string, TimelineStep[]> = {};
    
    for (const step of steps) {
      if (!groups[step.bundleId]) {
        groups[step.bundleId] = [];
      }
      groups[step.bundleId].push(step);
    }
    
    return groups;
  }

  /**
   * Mark a timeline step as completed
   */
  async markStepComplete(stepId: string): Promise<boolean> {
    if (!this.asylumTimeline) return false;
    
    const step = this.asylumTimeline.steps.find(s => s.id === stepId);
    if (!step) return false;
    
    step.status = 'completed';
    step.completedDate = new Date().toISOString();
    
    // Regenerate timeline to show any newly visible steps
    if (this.asylumTimeline.questionnaireData) {
      this.asylumTimeline = this.rebuildTimeline(this.asylumTimeline.questionnaireData, this.asylumTimeline);
    }
    
    await this.saveTimeline();
    return true;
  }

  /**
   * Update a step's due date (if editable)
   */
  async updateStepDueDate(stepId: string, newDueDate: string): Promise<boolean> {
    if (!this.asylumTimeline) return false;
    
    const step = this.asylumTimeline.steps.find(s => s.id === stepId);
    if (!step || !step.isEditableDate) return false;
    
    step.dueDate = newDueDate;
    this.updateStepStatuses([step]);
    
    await this.saveTimeline();
    return true;
  }

  /**
   * Get steps by bundle ID
   */
  getStepsByBundle(bundleId: string): TimelineStep[] {
    if (!this.asylumTimeline) return [];
    return this.asylumTimeline.steps.filter(s => s.bundleId === bundleId);
  }

  /**
   * Get overdue steps
   */
  getOverdueSteps(): TimelineStep[] {
    if (!this.asylumTimeline) return [];
    return this.asylumTimeline.steps.filter(s => s.status === 'overdue');
  }

  /**
   * Get upcoming steps (due within N days)
   */
  getUpcomingSteps(daysAhead: number = 30): TimelineStep[] {
    if (!this.asylumTimeline) return [];
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    return this.asylumTimeline.steps.filter(s => {
      if (!s.dueDate || s.status === 'completed') return false;
      
      const dueDate = new Date(s.dueDate);
      return dueDate <= futureDate;
    });
  }

  /**
   * Update timeline from new questionnaire data
   */
  async updateTimelineFromQuestionnaire(questionnaireData: any): Promise<boolean> {
    if (!this.asylumTimeline) return false;

    // Rebuild timeline with new questionnaire data
    this.asylumTimeline = this.rebuildTimeline(questionnaireData, this.asylumTimeline);
    
    await this.saveTimeline();
    return true;
  }

  /**
   * Initialize timeline for a new user with entry date
   */
  async initializeTimeline(entryDate: string, hasAttorney: boolean = false, questionnaireData?: any): Promise<AsylumTimeline> {
    // Prepare questionnaire data
    const fullQuestionnaireData = {
      entryDate,
      hasAttorney,
      ...questionnaireData
    };
    
    // Extract key information for basic timeline properties
    const hasTPSStatus = questionnaireData?.hasTPS === 'yes';
    const tpsExpirationDate = questionnaireData?.tpsExpirationDate;
    const tpsCountry = questionnaireData?.tpsCountry;
    const hasParoleStatus = questionnaireData?.hasParole === 'yes';
    const paroleExpirationDate = questionnaireData?.paroleExpirationDate;
    const inDeportationProceedings = questionnaireData?.hasCase === 'yes' || questionnaireData?.visitedEOIR === true;
    const eoirCaseNumber = questionnaireData?.eoirCaseNumber;
    const aNumber = questionnaireData?.aNumber;
    const nextCourtHearing = questionnaireData?.nextHearingDate;
    const assignedCourt = questionnaireData?.assignedCourt;
    const hasFiledI589 = questionnaireData?.hasFiledI589 === 'yes';
    const i589FilingDate = questionnaireData?.i589FilingDate;
    const interviewDate = questionnaireData?.interviewDate;
    
    // Determine asylum process type
    const asylumProcess: 'affirmative' | 'defensive' | 'unknown' = 
      inDeportationProceedings ? 'defensive' : 'affirmative';
    
    // Calculate key deadlines
    const deadlines = this.calculateDeadlines(
      entryDate, 
      hasTPSStatus, 
      tpsExpirationDate,
      hasParoleStatus, 
      paroleExpirationDate,
      i589FilingDate
    );
    
    // Determine if user has exceptions to the one-year deadline
    const hasOneYearException = hasTPSStatus || hasParoleStatus;
    let exceptionType: 'tps' | 'parole' | 'extraordinary_circumstances' | 'changed_circumstances' | undefined;
    
    if (hasTPSStatus) {
      exceptionType = 'tps';
    } else if (hasParoleStatus) {
      exceptionType = 'parole';
    }

    // Create base timeline object
    const baseTimeline: AsylumTimeline = {
      entryDate,
      i589FilingDate,
      interviewDate,
      caseOutcome: 'pending',
      
      // Bundle-based data (will be populated by rebuildTimeline)
      steps: [],
      activeBundles: [],
      
      // Legacy support
      currentPhase: '',
      phases: [],
      
      lastUpdated: new Date().toISOString(),
      questionnaireData: fullQuestionnaireData,
      
      // Legal Status Information
      asylumProcess,
      hasTPSStatus,
      tpsExpirationDate,
      tpsCountry,
      hasParoleStatus,
      paroleExpirationDate,
      inDeportationProceedings,
      eoirCaseNumber,
      aNumber,
      nextCourtHearing,
      assignedCourt,
      
      personalInfo: {
        hasAttorney,
        workPermitEligibleDate: deadlines.workPermitEligible,
        oneYearDeadline: deadlines.oneYearDeadline,
        hasOneYearException,
        exceptionType,
      }
    };

    // Use bundle system to generate steps and legacy phases
    this.asylumTimeline = this.rebuildTimeline(fullQuestionnaireData, baseTimeline);

    await this.saveTimeline();
    return this.asylumTimeline;
  }

  /**
   * Create timeline phases based on asylum process type
   */
  private createPhasesForAsylumProcess(
    asylumProcess: 'affirmative' | 'defensive' | 'unknown',
    hasFiledI589: boolean,
    i589FilingDate?: string,
    interviewDate?: string,
    deadlines?: any,
    inDeportationProceedings: boolean = false,
    nextCourtHearing?: string
  ): AsylumPhase[] {
    if (asylumProcess === 'defensive') {
      return this.createDefensiveAsylumPhases(hasFiledI589, i589FilingDate, interviewDate, deadlines, nextCourtHearing);
    } else {
      return this.createAffirmativeAsylumPhases(hasFiledI589, i589FilingDate, interviewDate, deadlines);
    }
  }

  /**
   * Create phases for affirmative asylum process (USCIS)
   */
  private createAffirmativeAsylumPhases(
    hasFiledI589: boolean,
    i589FilingDate?: string,
    interviewDate?: string,
    deadlines?: any
  ): AsylumPhase[] {
    return [
      {
        id: 'preparation',
        title: 'Preparing to File I-589',
        status: hasFiledI589 ? 'completed' : 'current',
        description: 'Gather documents and prepare your asylum application',
        keyAction: 'File Form I-589 with USCIS Asylum Office',
        deadline: deadlines?.oneYearDeadline,
        daysUntilDeadline: deadlines?.oneYearDeadline ? this.calculateDaysUntil(deadlines.oneYearDeadline) : undefined,
        nextSteps: hasFiledI589 ? [
          'Application filed successfully',
          'Wait for interview scheduling',
          'Continue gathering supporting evidence'
        ] : [
          'Gather identity documents (passport, birth certificate)',
          'Collect supporting evidence from your home country',
          'Find legal representation if possible',
          'Complete Form I-589 application',
          'File application with USCIS Asylum Office'
        ],
        resources: [
          'I-589 form guide',
          'USCIS Asylum Office locations',
          'Document checklist',
          'Legal aid organizations'
        ],
        isLocked: false,
        completedDate: hasFiledI589 ? i589FilingDate : undefined,
      },
      {
        id: 'application_pending',
        title: 'USCIS Review Process',
        status: hasFiledI589 ? 'current' : 'locked',
        description: 'Your I-589 application is being reviewed by USCIS Asylum Office',
        keyAction: 'Work permit eligible 150 days after filing',
        deadline: hasFiledI589 ? deadlines?.workPermitEligible : undefined,
        daysUntilDeadline: hasFiledI589 && deadlines?.workPermitEligible ? this.calculateDaysUntil(deadlines.workPermitEligible) : undefined,
        nextSteps: [
          'Wait for asylum interview scheduling notice',
          'Continue gathering supporting evidence',
          'Apply for work authorization (I-765) if eligible',
          'Maintain current address with USCIS',
          'Prepare for possible interview'
        ],
        resources: [
          'Work authorization guide (I-765)',
          'Interview preparation guide',
          'Address change form (AR-11)',
          'Case status checking online'
        ],
        isLocked: !hasFiledI589,
        completedDate: undefined,
      },
      {
        id: 'interview_scheduled',
        title: 'Asylum Interview Scheduled',
        status: interviewDate ? 'current' : 'locked',
        description: 'Your asylum interview has been scheduled at USCIS Asylum Office',
        keyAction: interviewDate ? `Attend asylum interview on ${this.formatDate(interviewDate)}` : 'Interview not yet scheduled',
        deadline: interviewDate,
        daysUntilDeadline: interviewDate ? this.calculateDaysUntil(interviewDate) : undefined,
        nextSteps: interviewDate ? [
          'Review your I-589 application thoroughly',
          'Practice your testimony with your attorney',
          'Organize all supporting documents',
          'Ensure all documents have English translations',
          'Prepare for interview questions about your persecution',
          'Arrive early on interview day with all documents'
        ] : [
          'Wait for interview scheduling notice',
          'Continue preparing your case',
          'Keep evidence organized and updated'
        ],
        resources: [
          'Affirmative asylum interview guide',
          'Mock interview practice',
          'Document organization checklist',
          'Interpretation services at USCIS'
        ],
        isLocked: !interviewDate,
        completedDate: undefined,
      },
      {
        id: 'decision_pending',
        title: 'Awaiting USCIS Decision',
        status: 'locked',
        description: 'Your interview is complete, waiting for asylum officer decision',
        keyAction: 'Decision typically within 2 weeks of interview',
        nextSteps: [
          'Wait for decision notice in mail',
          'Keep USCIS updated on address changes',
          'Continue maintaining legal status',
          'Prepare for possible outcomes (approval, denial, or referral)'
        ],
        resources: [
          'Decision explanation guide',
          'Appeal process information',
          'Immigration court process (if referred)',
          'Green card application guide'
        ],
        isLocked: true,
        completedDate: undefined,
      },
      {
        id: 'approved',
        title: 'Asylum Granted by USCIS',
        status: 'locked',
        description: 'Congratulations! Your asylum application has been approved by USCIS',
        keyAction: 'Apply for green card after 1 year',
        nextSteps: [
          'Apply for green card (Form I-485) after 1 year',
          'Apply for derivative asylum for family members',
          'Apply for travel document if needed (I-131)',
          'Update your status with other agencies',
          'Maintain approval conditions'
        ],
        resources: [
          'Green card application guide',
          'Derivative asylum process',
          'Travel document information',
          'Family reunification guide'
        ],
        isLocked: true,
        completedDate: undefined,
      },
      {
        id: 'denied',
        title: 'Case Denied - Referred to Court',
        status: 'locked',
        description: 'Your asylum application was denied and referred to Immigration Court',
        keyAction: 'Prepare for Immigration Court proceedings',
        nextSteps: [
          'Receive Notice to Appear (NTA) in Immigration Court',
          'Consult with an attorney immediately',
          'File new asylum application in court (within 1 year)',
          'Understand defensive asylum process',
          'Prepare for Master Calendar Hearing'
        ],
        resources: [
          'Immigration court process guide',
          'Defensive asylum information',
          'Legal representation resources',
          'Court hearing preparation'
        ],
        isLocked: true,
        completedDate: undefined,
      }
    ];
  }

  /**
   * Create phases for defensive asylum process (Immigration Court)
   */
  private createDefensiveAsylumPhases(
    hasFiledI589: boolean,
    i589FilingDate?: string,
    interviewDate?: string,
    deadlines?: any,
    nextCourtHearing?: string
  ): AsylumPhase[] {
    return [
      {
        id: 'court_preparation',
        title: 'Preparing for Immigration Court',
        status: hasFiledI589 ? 'completed' : 'current',
        description: 'Prepare your defensive asylum case for Immigration Court',
        keyAction: 'File Form I-589 with Immigration Court within 1 year',
        deadline: deadlines?.oneYearDeadline,
        daysUntilDeadline: deadlines?.oneYearDeadline ? this.calculateDaysUntil(deadlines.oneYearDeadline) : undefined,
        nextSteps: hasFiledI589 ? [
          'Application filed with court',
          'Await Master Calendar Hearing',
          'Continue case preparation'
        ] : [
          'CRITICAL: Find legal representation immediately',
          'File Form I-589 with Immigration Court',
          'Gather all supporting evidence',
          'Prepare for Master Calendar Hearing',
          'Understand your rights in court'
        ],
        resources: [
          'EOIR case information',
          'Immigration court locations',
          'Legal representation directory',
          'Defensive asylum guide'
        ],
        isLocked: false,
        completedDate: hasFiledI589 ? i589FilingDate : undefined,
      },
      {
        id: 'master_calendar',
        title: 'Master Calendar Hearing',
        status: nextCourtHearing ? 'current' : 'locked',
        description: 'Initial court hearing to set timeline and procedures',
        keyAction: nextCourtHearing ? `Attend Master Calendar Hearing on ${this.formatDate(nextCourtHearing)}` : 'Hearing not yet scheduled',
        deadline: nextCourtHearing,
        daysUntilDeadline: nextCourtHearing ? this.calculateDaysUntil(nextCourtHearing) : undefined,
        nextSteps: nextCourtHearing ? [
          'CRITICAL: Attend hearing - failure to appear = deportation order',
          'Bring your attorney and interpreter if needed',
          'Court will set Individual Hearing date',
          'Follow all court orders and deadlines',
          'File any required documents by deadlines'
        ] : [
          'Wait for Notice to Appear with hearing date',
          'Find legal representation',
          'Prepare case documentation'
        ],
        resources: [
          'Immigration court procedures',
          'What to expect at Master Calendar',
          'Court interpretation services',
          'Legal representation resources'
        ],
        isLocked: !nextCourtHearing,
        completedDate: undefined,
      },
      {
        id: 'individual_hearing',
        title: 'Individual Hearing (Trial)',
        status: 'locked',
        description: 'Your asylum trial before an Immigration Judge',
        keyAction: 'Present your case and testify before the judge',
        nextSteps: [
          'CRITICAL: Attend hearing with attorney',
          'Present your testimony and evidence',
          'Call witnesses if applicable',
          'Answer judge and DHS attorney questions',
          'Await judge decision'
        ],
        resources: [
          'Courtroom procedures guide',
          'Testimony preparation',
          'Evidence presentation guide',
          'What happens at Individual Hearing'
        ],
        isLocked: true,
        completedDate: undefined,
      },
      {
        id: 'court_decision',
        title: 'Judge Decision',
        status: 'locked',
        description: 'Immigration Judge renders decision on your case',
        keyAction: 'Receive oral or written decision',
        nextSteps: [
          'Receive decision from Immigration Judge',
          'If approved: Follow post-approval steps',
          'If denied: Consider appeal to Board of Immigration Appeals',
          'Understand all legal options and deadlines'
        ],
        resources: [
          'Understanding judge decisions',
          'Appeal process (BIA)',
          'Post-approval procedures',
          'Alternative relief options'
        ],
        isLocked: true,
        completedDate: undefined,
      },
      {
        id: 'approved',
        title: 'Asylum Granted by Immigration Court',
        status: 'locked',
        description: 'Immigration Judge granted your asylum application',
        keyAction: 'Apply for green card after 1 year',
        nextSteps: [
          'Apply for green card (Form I-485) after 1 year',
          'Apply for derivative asylum for family members',
          'Apply for work authorization if needed',
          'Apply for travel document if needed',
          'Update status with all agencies'
        ],
        resources: [
          'Green card application guide',
          'Derivative asylum process',
          'Work authorization guide',
          'Travel document information'
        ],
        isLocked: true,
        completedDate: undefined,
      },
      {
        id: 'denied',
        title: 'Case Denied - Appeal Options',
        status: 'locked',
        description: 'Immigration Judge denied your asylum application',
        keyAction: 'Consider appeal or alternative relief within 30 days',
        nextSteps: [
          'CRITICAL: File appeal to BIA within 30 days if eligible',
          'Consult with attorney about all options',
          'Consider other forms of relief (withholding, CAT)',
          'Understand deportation process and options',
          'Prepare for possible detention'
        ],
        resources: [
          'Board of Immigration Appeals process',
          'Alternative relief options',
          'Deportation process information',
          'Emergency legal resources'
        ],
        isLocked: true,
        completedDate: undefined,
      }
    ];
  }

  /**
   * Update phase statuses based on current state
   */
  private updatePhaseStatuses(phases: AsylumPhase[], hasFiledI589: boolean, interviewDate?: string): void {
    let foundCurrent = false;

    phases.forEach(phase => {
      if (phase.id === 'preparation') {
        if (hasFiledI589) {
          phase.status = 'completed';
        } else {
          phase.status = 'current';
          foundCurrent = true;
        }
      } else if (phase.id === 'application_pending') {
        if (hasFiledI589 && !interviewDate) {
          phase.status = 'current';
          foundCurrent = true;
        } else if (hasFiledI589) {
          phase.status = 'completed';
        } else {
          phase.status = 'locked';
        }
      } else if (phase.id === 'interview_scheduled') {
        if (interviewDate) {
          phase.status = 'current';
          foundCurrent = true;
        } else if (hasFiledI589) {
          phase.status = 'upcoming';
        } else {
          phase.status = 'locked';
        }
      } else if (phase.id === 'decision_pending') {
        if (foundCurrent) {
          phase.status = 'upcoming';
        } else {
          phase.status = 'locked';
        }
      } else {
        // approved/denied phases are always locked until reached
        phase.status = 'locked';
      }
    });
  }

  /**
   * Determine current phase based on completed phases
   */
  private determineCurrentPhase(phases: AsylumPhase[]): string {
    const currentPhase = phases.find(phase => phase.status === 'current');
    return currentPhase?.id || 'preparation';
  }

  /**
   * Calculate key deadlines based on legal rules and exceptions
   */
  calculateDeadlines(
    entryDate: string, 
    hasTPSStatus: boolean = false, 
    tpsExpirationDate?: string,
    hasParoleStatus: boolean = false,
    paroleExpirationDate?: string,
    i589FilingDate?: string
  ): DeadlineCalculation {
    const entry = new Date(entryDate);
    let oneYearDeadline = new Date(entry);
    oneYearDeadline.setFullYear(oneYearDeadline.getFullYear() + 1);

    // TPS Exception: Can apply within 3-6 months of TPS expiration
    if (hasTPSStatus && tpsExpirationDate) {
      const tpsExpiration = new Date(tpsExpirationDate);
      const tpsDeadline = new Date(tpsExpiration);
      tpsDeadline.setMonth(tpsDeadline.getMonth() + 6); // 6 months after TPS expiration
      if (tpsDeadline > oneYearDeadline) {
        oneYearDeadline = tpsDeadline;
      }
    }

    // Parole Exception: Can apply within reasonable time after parole expiration
    if (hasParoleStatus && paroleExpirationDate) {
      const paroleExpiration = new Date(paroleExpirationDate);
      const paroleDeadline = new Date(paroleExpiration);
      paroleDeadline.setMonth(paroleDeadline.getMonth() + 3); // 3 months after parole expiration
      if (paroleDeadline > oneYearDeadline) {
        oneYearDeadline = paroleDeadline;
      }
    }

    // Work permit eligibility: 150 days after I-589 filing (NOT entry date)
    let workPermitEligible: string;
    if (i589FilingDate) {
      const filingDate = new Date(i589FilingDate);
      const workPermitDate = new Date(filingDate);
      workPermitDate.setDate(workPermitDate.getDate() + 150);
      workPermitEligible = workPermitDate.toISOString().split('T')[0];
    } else {
      // If no filing date yet, use entry date as placeholder
      const workPermitDate = new Date(entry);
      workPermitDate.setDate(workPermitDate.getDate() + 150);
      workPermitEligible = workPermitDate.toISOString().split('T')[0];
    }

    return {
      oneYearDeadline: oneYearDeadline.toISOString().split('T')[0],
      workPermitEligible,
    };
  }

  /**
   * Calculate days until a deadline
   */
  calculateDaysUntil(deadline: string): number {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Update key dates in timeline
   */
  async updateKeyDates(updates: { entryDate?: string; i589FilingDate?: string; interviewDate?: string; decisionDate?: string }): Promise<boolean> {
    if (!this.asylumTimeline) return false;

    // Update dates
    if (updates.entryDate) {
      this.asylumTimeline.entryDate = updates.entryDate;
      const deadlines = this.calculateDeadlines(updates.entryDate);
      this.asylumTimeline.personalInfo.oneYearDeadline = deadlines.oneYearDeadline;
      this.asylumTimeline.personalInfo.workPermitEligibleDate = deadlines.workPermitEligible;
    }
    
    if (updates.i589FilingDate) {
      this.asylumTimeline.i589FilingDate = updates.i589FilingDate;
    }
    
    if (updates.interviewDate) {
      this.asylumTimeline.interviewDate = updates.interviewDate;
    }
    
    if (updates.decisionDate) {
      this.asylumTimeline.decisionDate = updates.decisionDate;
    }

    // Recalculate phases based on new dates
    const hasFiledI589 = !!this.asylumTimeline.i589FilingDate;
    this.updatePhaseStatuses(this.asylumTimeline.phases, hasFiledI589, this.asylumTimeline.interviewDate);
    this.asylumTimeline.currentPhase = this.determineCurrentPhase(this.asylumTimeline.phases);

    // Update deadlines
    this.asylumTimeline.phases.forEach(phase => {
      if (phase.deadline) {
        phase.daysUntilDeadline = this.calculateDaysUntil(phase.deadline);
      }
    });

    this.asylumTimeline.lastUpdated = new Date().toISOString();
    await this.saveTimeline();
    return true;
  }

  /**
   * Get current timeline alerts with specific messaging and mandatory legal warnings
   */
  getTimelineAlerts(): TimelineAlert[] {
    if (!this.asylumTimeline) return [];

    const alerts: TimelineAlert[] = [];
    const currentPhase = this.asylumTimeline.phases.find(p => p.status === 'current');
    
    // Add mandatory legal warnings first
    alerts.push(...this.getMandatoryLegalWarnings());
    
    // Add EOIR-specific alerts
    if (this.asylumTimeline.inDeportationProceedings) {
      alerts.push(...this.getEOIRAlerts());
    }
    
    // Add deadline-based alerts
    this.asylumTimeline.phases.forEach(phase => {
      if (phase.deadline && phase.status !== 'completed') {
        const daysLeft = this.calculateDaysUntil(phase.deadline);
        const deadlineDate = this.formatDate(phase.deadline);
        
        let alertType: TimelineAlert['type'] = 'info';
        let title = '';
        let message = '';
        
        if (phase.id === 'preparation' || phase.id === 'court_preparation') {
          alertType = daysLeft < 90 ? 'warning' : daysLeft < 30 ? 'critical' : 'info';
          title = `${daysLeft} days left to file I-589`;
          message = this.asylumTimeline.asylumProcess === 'defensive'
            ? `You must file your asylum application with Immigration Court before ${deadlineDate}. Missing this deadline could result in deportation.`
            : `You must file your asylum application with USCIS before ${deadlineDate}. This is a critical deadline.`;
          
          if (daysLeft <= 90 && !this.asylumTimeline.personalInfo.hasAttorney) {
            message += ' STRONGLY RECOMMEND getting legal representation immediately.';
          }
        } else if (phase.id === 'application_pending') {
          alertType = daysLeft <= 0 ? 'info' : 'info';
          title = daysLeft <= 0 ? 'Work permit eligible now' : `${daysLeft} days until work permit eligible`;
          message = daysLeft <= 0 
            ? `You can now apply for a work permit (Form I-765). This allows you to work legally in the US.`
            : `You can apply for a work permit on ${deadlineDate} (150 days after filing I-589).`;
        } else if (phase.id === 'interview_scheduled') {
          alertType = daysLeft < 7 ? 'critical' : daysLeft < 30 ? 'warning' : 'info';
          title = `Asylum Interview in ${daysLeft} days`;
          message = `Your asylum interview is on ${deadlineDate}. Prepare thoroughly - this determines your case outcome.`;
        } else if (phase.id === 'master_calendar' || phase.id === 'individual_hearing') {
          alertType = 'critical';
          title = `Court Hearing in ${daysLeft} days`;
          message = `CRITICAL: You have a court hearing on ${deadlineDate}. Failure to appear will result in an automatic deportation order.`;
        }
        
        alerts.push({
          type: alertType,
          title,
          message,
          deadline: phase.deadline,
          daysLeft,
          actionRequired: daysLeft < 30 || alertType === 'critical',
          phaseId: phase.id,
          isCourtRelated: this.asylumTimeline.asylumProcess === 'defensive',
          requiresAttorney: this.asylumTimeline.asylumProcess === 'defensive' && !this.asylumTimeline.personalInfo.hasAttorney
        });
      }
    });

    // Sort by priority: critical first, then by days left
    return alerts.sort((a, b) => {
      if (a.type === 'critical' && b.type !== 'critical') return -1;
      if (b.type === 'critical' && a.type !== 'critical') return 1;
      if (a.type === 'legal_warning' && b.type !== 'legal_warning') return -1;
      if (b.type === 'legal_warning' && a.type !== 'legal_warning') return 1;
      return (a.daysLeft || 0) - (b.daysLeft || 0);
    });
  }

  /**
   * Get mandatory legal warnings for all users
   */
  private getMandatoryLegalWarnings(): TimelineAlert[] {
    if (!this.asylumTimeline) return [];

    const warnings: TimelineAlert[] = [];

    // Legal representation warning - CRITICAL for defensive cases
    if (!this.asylumTimeline.personalInfo.hasAttorney) {
      const isDefensive = this.asylumTimeline.asylumProcess === 'defensive';
      warnings.push({
        type: isDefensive ? 'critical' : 'legal_warning',
        title: isDefensive ? 'URGENT: Legal Representation Required' : 'Legal Representation Strongly Recommended',
        message: isDefensive 
          ? 'You are in Immigration Court proceedings without an attorney. This is extremely dangerous - you should consult an attorney before applying. A rejected asylum application can lead to deportation. Find legal representation immediately.'
          : 'You should consult an attorney before applying for asylum. A rejected asylum application can lead to deportation. Legal representation significantly increases your chances of success.',
        actionRequired: true,
        requiresAttorney: true
      });
    }

    // One-year deadline warning (if approaching and no exceptions)
    if (!this.asylumTimeline.i589FilingDate && !this.asylumTimeline.personalInfo.hasOneYearException) {
      const daysUntilDeadline = this.calculateDaysUntil(this.asylumTimeline.personalInfo.oneYearDeadline);
      
      if (daysUntilDeadline <= 180) {
        warnings.push({
          type: 'legal_warning',
          title: 'One-Year Filing Deadline Approaching',
          message: `You must file your asylum application within one year of arrival unless you qualify for an exception. You have ${daysUntilDeadline} days remaining.`,
          deadline: this.asylumTimeline.personalInfo.oneYearDeadline,
          daysLeft: daysUntilDeadline,
          actionRequired: true,
          requiresAttorney: daysUntilDeadline <= 90
        });
      }
    }

    // Court proceedings critical warning
    if (this.asylumTimeline.inDeportationProceedings) {
      warnings.push({
        type: 'legal_warning',
        title: 'Immigration Court Proceedings',
        message: 'You are in removal proceedings. This is extremely serious - deportation is possible. Legal representation is critical for your case.',
        actionRequired: true,
        isCourtRelated: true,
        requiresAttorney: true
      });
    }

    // TPS/Parole status warnings
    if (this.asylumTimeline.hasTPSStatus && this.asylumTimeline.tpsExpirationDate) {
      const daysUntilExpiration = this.calculateDaysUntil(this.asylumTimeline.tpsExpirationDate);
      
      if (daysUntilExpiration <= 180) {
        warnings.push({
          type: 'warning',
          title: 'TPS Status Expiring Soon',
          message: `Your TPS status expires in ${daysUntilExpiration} days. File your asylum application well before expiration to maintain protection.`,
          deadline: this.asylumTimeline.tpsExpirationDate,
          daysLeft: daysUntilExpiration,
          actionRequired: true
        });
      }
    }

    if (this.asylumTimeline.hasParoleStatus && this.asylumTimeline.paroleExpirationDate) {
      const daysUntilExpiration = this.calculateDaysUntil(this.asylumTimeline.paroleExpirationDate);
      
      if (daysUntilExpiration <= 180) {
        warnings.push({
          type: 'warning',
          title: 'Parole Status Expiring Soon',
          message: `Your parole status expires in ${daysUntilExpiration} days. File your asylum application before expiration to maintain protection.`,
          deadline: this.asylumTimeline.paroleExpirationDate,
          daysLeft: daysUntilExpiration,
          actionRequired: true
        });
      }
    }

    // General legal disclaimer
    warnings.push({
      type: 'info',
      title: 'Legal Information Disclaimer',
      message: 'This app provides general information only and is not legal advice. Immigration law is complex and changes frequently. Always consult with a qualified immigration attorney for your specific situation.',
      actionRequired: false
    });

    return warnings;
  }

  /**
   * Get current status summary with critical deadline information
   */
  getCurrentStatus(): { 
    phase: string; 
    status: string; 
    nextAction: string; 
    daysUntilDeadline?: number;
    criticalDeadlines: {
      oneYearDeadline: { date: string; daysLeft: number; description: string; isCritical: boolean };
      workPermitEligible?: { date: string; daysLeft: number; description: string };
      nextCourtHearing?: { date: string; daysLeft: number; description: string; isCritical: boolean };
    };
    processType: 'affirmative' | 'defensive' | 'unknown';
    hasAttorney: boolean;
    inDeportationProceedings: boolean;
  } | null {
    if (!this.asylumTimeline) return null;

    const currentPhase = this.asylumTimeline.phases.find(p => p.status === 'current');
    if (!currentPhase) return null;

    // Calculate critical deadlines
    const oneYearDaysLeft = this.calculateDaysUntil(this.asylumTimeline.personalInfo.oneYearDeadline);
    const criticalDeadlines: any = {
      oneYearDeadline: {
        date: this.asylumTimeline.personalInfo.oneYearDeadline,
        daysLeft: oneYearDaysLeft,
        description: this.asylumTimeline.asylumProcess === 'defensive' 
          ? 'File I-589 with Immigration Court'
          : 'File I-589 with USCIS Asylum Office',
        isCritical: oneYearDaysLeft <= 90 && !this.asylumTimeline.i589FilingDate
      }
    };

    // Add work permit eligibility if I-589 filed
    if (this.asylumTimeline.personalInfo.workPermitEligibleDate) {
      const workPermitDaysLeft = this.calculateDaysUntil(this.asylumTimeline.personalInfo.workPermitEligibleDate);
      criticalDeadlines.workPermitEligible = {
        date: this.asylumTimeline.personalInfo.workPermitEligibleDate,
        daysLeft: workPermitDaysLeft,
        description: workPermitDaysLeft <= 0 ? 'Work permit application eligible NOW' : 'Work permit eligible in'
      };
    }

    // Add court hearing if exists
    if (this.asylumTimeline.nextCourtHearing) {
      const courtHearingDaysLeft = this.calculateDaysUntil(this.asylumTimeline.nextCourtHearing);
      criticalDeadlines.nextCourtHearing = {
        date: this.asylumTimeline.nextCourtHearing,
        daysLeft: courtHearingDaysLeft,
        description: 'Immigration Court Hearing',
        isCritical: true
      };
    }

    // Determine appropriate next actions based on current state
    let nextAction = currentPhase.keyAction;
    let status = currentPhase.description;

    if (this.asylumTimeline.asylumProcess === 'defensive' && !this.asylumTimeline.personalInfo.hasAttorney) {
      nextAction = 'URGENT: Find legal representation immediately - you are in deportation proceedings';
      status = 'Immigration Court proceedings - legal representation critical for success';
    } else if (!this.asylumTimeline.i589FilingDate && oneYearDaysLeft <= 90) {
      nextAction = 'URGENT: File I-589 asylum application immediately - deadline approaching';
    }

    return {
      phase: currentPhase.title,
      status,
      nextAction,
      daysUntilDeadline: currentPhase.daysUntilDeadline,
      criticalDeadlines,
      processType: this.asylumTimeline.asylumProcess,
      hasAttorney: this.asylumTimeline.personalInfo.hasAttorney,
      inDeportationProceedings: this.asylumTimeline.inDeportationProceedings,
    };
  }

  /**
   * Save timeline to storage
   */
  async saveTimeline(): Promise<void> {
    if (!this.asylumTimeline) return;
    
    try {
      await AsyncStorage.setItem(
        TIMELINE_STORAGE_KEY, 
        JSON.stringify(this.asylumTimeline)
      );
    } catch (error) {
      console.error('Failed to save timeline:', error);
    }
  }

  /**
   * Load timeline from storage
   */
  async loadTimeline(): Promise<AsylumTimeline | null> {
    try {
      const saved = await AsyncStorage.getItem(TIMELINE_STORAGE_KEY);
      if (saved) {
        this.asylumTimeline = JSON.parse(saved);
        // Recalculate days until deadlines
        this.asylumTimeline?.phases.forEach(phase => {
          if (phase.deadline) {
            phase.daysUntilDeadline = this.calculateDaysUntil(phase.deadline);
          }
        });
        return this.asylumTimeline;
      }
    } catch (error) {
      console.error('Failed to load timeline:', error);
    }
    return null;
  }

  /**
   * Get current timeline
   */
  getTimeline(): AsylumTimeline | null {
    return this.asylumTimeline;
  }

  /**
   * Mark a phase as complete (backward compatibility)
   * For new bundle system, this will mark related steps as complete
   */
  async markPhaseComplete(phaseId: string): Promise<boolean> {
    console.log('TimelineService: markPhaseComplete called with:', phaseId);
    
    if (!this.asylumTimeline) {
      console.log('TimelineService: No timeline available');
      return false;
    }

    // New bundle system: Mark all steps in the bundle as complete
    if (this.asylumTimeline.steps && this.asylumTimeline.steps.length > 0) {
      const bundleSteps = this.asylumTimeline.steps.filter(s => s.bundleId === phaseId);
      if (bundleSteps.length > 0) {
        console.log(`TimelineService: Found ${bundleSteps.length} steps for bundle ${phaseId}`);
        
        for (const step of bundleSteps) {
          if (step.status !== 'completed') {
            step.status = 'completed';
            step.completedDate = new Date().toISOString();
            console.log(`TimelineService: Marked step ${step.id} as completed`);
          }
        }
        
        // Update specific timeline dates based on completed bundle
        if (phaseId === 'affirmative-starter' || phaseId === 'defensive-starter') {
          if (!this.asylumTimeline.i589FilingDate) {
            this.asylumTimeline.i589FilingDate = new Date().toISOString();
            console.log('TimelineService: Updated i589FilingDate from bundle completion');
          }
        }
        
        // Regenerate timeline to show newly visible steps and update phases
        if (this.asylumTimeline.questionnaireData) {
          this.asylumTimeline = this.rebuildTimeline(this.asylumTimeline.questionnaireData, this.asylumTimeline);
        }
        
        await this.saveTimeline();
        console.log('TimelineService: Bundle steps completed and timeline updated');
        return true;
      }
    }

    // Legacy phase system fallback
    const phaseIndex = this.asylumTimeline.phases.findIndex(p => p.id === phaseId);
    if (phaseIndex === -1) {
      console.log('TimelineService: Phase not found:', phaseId);
      return false;
    }

    const phase = this.asylumTimeline.phases[phaseIndex];
    console.log('TimelineService: Found legacy phase:', phase.title, 'current status:', phase.status);
    
    // Mark phase as completed
    phase.status = 'completed';
    phase.completedDate = new Date().toISOString();
    console.log('TimelineService: Marked legacy phase as completed:', phase.id);

    // Update current phase to next available phase
    let nextPhaseFound = false;
    for (let i = phaseIndex + 1; i < this.asylumTimeline.phases.length; i++) {
      const nextPhase = this.asylumTimeline.phases[i];
      if (!nextPhaseFound && nextPhase.status !== 'completed') {
        nextPhase.status = 'current';
        nextPhase.isLocked = false;
        this.asylumTimeline.currentPhase = nextPhase.id;
        nextPhaseFound = true;
      } else if (nextPhase.status === 'locked' && i === phaseIndex + 1) {
        // Unlock the immediate next phase
        nextPhase.status = 'current';
        nextPhase.isLocked = false;
        this.asylumTimeline.currentPhase = nextPhase.id;
        nextPhaseFound = true;
      }
    }

    // Update specific timeline dates based on completed phase
    if (phaseId === 'preparation') {
      this.asylumTimeline.i589FilingDate = new Date().toISOString();
      console.log('TimelineService: Updated i589FilingDate');
    } else if (phaseId === 'interview_scheduled') {
      this.asylumTimeline.decisionDate = new Date().toISOString();
      console.log('TimelineService: Updated decisionDate');
    }

    this.asylumTimeline.lastUpdated = new Date().toISOString();
    
    await this.saveTimeline();
    console.log('TimelineService: Legacy phase completed and timeline saved');
    return true;
  }

  /**
   * Update key actions for a phase
   */
  async updatePhaseKeyActions(phaseId: string, keyActions: Record<string, boolean>): Promise<boolean> {
    if (!this.asylumTimeline) return false;

    const phase = this.asylumTimeline.phases.find(p => p.id === phaseId);
    if (!phase) return false;

    // Add key actions to phase object
    (phase as any).keyActions = { ...(phase as any).keyActions, ...keyActions };

    this.asylumTimeline.lastUpdated = new Date().toISOString();
    await this.saveTimeline();
    return true;
  }

  /**
   * Get key actions for a phase
   */
  getPhaseKeyActions(phaseId: string): Record<string, boolean> {
    if (!this.asylumTimeline) return {};

    const phase = this.asylumTimeline.phases.find(p => p.id === phaseId);
    return (phase as any)?.keyActions || {};
  }

  /**
   * Update EOIR case information
   */
  async updateEOIRCaseInfo(caseNumber: string, nextHearingDate?: string, assignedCourt?: string): Promise<boolean> {
    if (!this.asylumTimeline) return false;

    this.asylumTimeline.eoirCaseNumber = caseNumber;
    if (nextHearingDate) {
      this.asylumTimeline.nextCourtHearing = nextHearingDate;
    }
    if (assignedCourt) {
      this.asylumTimeline.assignedCourt = assignedCourt;
    }

    // If in deportation proceedings, ensure defensive process
    if (caseNumber && this.asylumTimeline.asylumProcess !== 'defensive') {
      this.asylumTimeline.asylumProcess = 'defensive';
      this.asylumTimeline.inDeportationProceedings = true;
      
      // Recreate phases for defensive process if needed
      const deadlines = this.calculateDeadlines(
        this.asylumTimeline.entryDate,
        this.asylumTimeline.hasTPSStatus,
        this.asylumTimeline.tpsExpirationDate,
        this.asylumTimeline.hasParoleStatus,
        this.asylumTimeline.paroleExpirationDate,
        this.asylumTimeline.i589FilingDate
      );
      
      this.asylumTimeline.phases = this.createDefensiveAsylumPhases(
        !!this.asylumTimeline.i589FilingDate,
        this.asylumTimeline.i589FilingDate,
        this.asylumTimeline.interviewDate,
        deadlines,
        nextHearingDate
      );
    }

    this.asylumTimeline.lastUpdated = new Date().toISOString();
    await this.saveTimeline();
    return true;
  }

  /**
   * Get EOIR case status and alerts
   */
  getEOIRAlerts(): TimelineAlert[] {
    if (!this.asylumTimeline || !this.asylumTimeline.inDeportationProceedings) return [];

    const alerts: TimelineAlert[] = [];

    // Critical court hearing alert
    if (this.asylumTimeline.nextCourtHearing) {
      const daysUntilHearing = this.calculateDaysUntil(this.asylumTimeline.nextCourtHearing);
      
      if (daysUntilHearing <= 30) {
        alerts.push({
          type: 'critical',
          title: 'Court Hearing Approaching',
          message: `You have a court hearing in ${daysUntilHearing} days. Failure to appear will result in an automatic deportation order.`,
          deadline: this.asylumTimeline.nextCourtHearing,
          daysLeft: daysUntilHearing,
          actionRequired: true,
          isCourtRelated: true,
          requiresAttorney: true
        });
      }
    }

    // Legal representation warning
    if (!this.asylumTimeline.personalInfo.hasAttorney && this.asylumTimeline.inDeportationProceedings) {
      alerts.push({
        type: 'legal_warning',
        title: 'Legal Representation Critical',
        message: 'You are in Immigration Court proceedings without an attorney. This significantly reduces your chances of success. Find legal representation immediately.',
        actionRequired: true,
        isCourtRelated: true,
        requiresAttorney: true
      });
    }

    // Filing deadline warning
    if (!this.asylumTimeline.i589FilingDate) {
      const daysUntilDeadline = this.calculateDaysUntil(this.asylumTimeline.personalInfo.oneYearDeadline);
      
      if (daysUntilDeadline <= 60) {
        alerts.push({
          type: 'critical',
          title: 'Filing Deadline Approaching',
          message: `You must file your I-589 asylum application with the Immigration Court within ${daysUntilDeadline} days or you may lose your right to apply for asylum.`,
          deadline: this.asylumTimeline.personalInfo.oneYearDeadline,
          daysLeft: daysUntilDeadline,
          actionRequired: true,
          isCourtRelated: true,
          requiresAttorney: true
        });
      }
    }

    return alerts;
  }

  /**
   * Check if case requires immediate legal attention
   */
  requiresImmediateLegalAttention(): boolean {
    if (!this.asylumTimeline) return false;

    // Court proceedings without attorney
    if (this.asylumTimeline.inDeportationProceedings && !this.asylumTimeline.personalInfo.hasAttorney) {
      return true;
    }

    // Upcoming court hearing
    if (this.asylumTimeline.nextCourtHearing) {
      const daysUntilHearing = this.calculateDaysUntil(this.asylumTimeline.nextCourtHearing);
      if (daysUntilHearing <= 30) {
        return true;
      }
    }

    // Approaching filing deadline
    if (!this.asylumTimeline.i589FilingDate) {
      const daysUntilDeadline = this.calculateDaysUntil(this.asylumTimeline.personalInfo.oneYearDeadline);
      if (daysUntilDeadline <= 60) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get court case summary
   */
  getCourtCaseSummary(): { 
    hasCourtCase: boolean;
    caseNumber?: string;
    nextHearing?: string;
    assignedCourt?: string;
    daysUntilHearing?: number;
    requiresAttorney: boolean;
  } | null {
    if (!this.asylumTimeline) return null;

    return {
      hasCourtCase: this.asylumTimeline.inDeportationProceedings,
      caseNumber: this.asylumTimeline.eoirCaseNumber,
      nextHearing: this.asylumTimeline.nextCourtHearing,
      assignedCourt: this.asylumTimeline.assignedCourt,
      daysUntilHearing: this.asylumTimeline.nextCourtHearing ? 
        this.calculateDaysUntil(this.asylumTimeline.nextCourtHearing) : undefined,
      requiresAttorney: this.asylumTimeline.inDeportationProceedings && !this.asylumTimeline.personalInfo.hasAttorney
    };
  }

  /**
   * Get specific next steps with urgency indicators
   */
  getNextSteps(): {
    urgent: Array<{ title: string; description: string; actionRequired: boolean }>;
    important: Array<{ title: string; description: string; actionRequired: boolean }>;
    general: Array<{ title: string; description: string; actionRequired: boolean }>;
  } {
    if (!this.asylumTimeline) {
      return {
        urgent: [{ title: 'Complete asylum questionnaire', description: 'Determine your specific timeline and process', actionRequired: true }],
        important: [],
        general: []
      };
    }

    const urgent: Array<{ title: string; description: string; actionRequired: boolean }> = [];
    const important: Array<{ title: string; description: string; actionRequired: boolean }> = [];
    const general: Array<{ title: string; description: string; actionRequired: boolean }> = [];

    // Critical deadlines
    const oneYearDaysLeft = this.calculateDaysUntil(this.asylumTimeline.personalInfo.oneYearDeadline);
    
    // Court hearing critical
    if (this.asylumTimeline.nextCourtHearing) {
      const daysUntilHearing = this.calculateDaysUntil(this.asylumTimeline.nextCourtHearing);
      if (daysUntilHearing <= 30) {
        urgent.push({
          title: `Court hearing in ${daysUntilHearing} days`,
          description: 'Prepare thoroughly with your attorney. Failure to appear results in deportation order.',
          actionRequired: true
        });
      }
    }

    // Legal representation
    if (!this.asylumTimeline.personalInfo.hasAttorney && this.asylumTimeline.asylumProcess === 'defensive') {
      urgent.push({
        title: 'Find legal representation immediately',
        description: 'You are in Immigration Court proceedings. Legal representation is critical.',
        actionRequired: true
      });
    } else if (!this.asylumTimeline.personalInfo.hasAttorney) {
      important.push({
        title: 'Find legal representation',
        description: 'Consult an attorney before filing. Rejection can lead to deportation.',
        actionRequired: true
      });
    }

    // Filing deadlines
    if (!this.asylumTimeline.i589FilingDate) {
      if (oneYearDaysLeft <= 60) {
        urgent.push({
          title: `File I-589 immediately - ${oneYearDaysLeft} days left`,
          description: this.asylumTimeline.asylumProcess === 'defensive' 
            ? 'File with Immigration Court before deadline'
            : 'File with USCIS Asylum Office before deadline',
          actionRequired: true
        });
      } else if (oneYearDaysLeft <= 180) {
        important.push({
          title: `Prepare I-589 application - ${oneYearDaysLeft} days left`,
          description: 'Gather documents and complete asylum application',
          actionRequired: true
        });
      }
    }

    // Work permit eligibility
    if (this.asylumTimeline.personalInfo.workPermitEligibleDate) {
      const workPermitDaysLeft = this.calculateDaysUntil(this.asylumTimeline.personalInfo.workPermitEligibleDate);
      if (workPermitDaysLeft <= 0) {
        important.push({
          title: 'Apply for work authorization now',
          description: 'You are eligible to apply for work permit (Form I-765)',
          actionRequired: true
        });
      } else if (workPermitDaysLeft <= 30) {
        general.push({
          title: `Work permit eligible in ${workPermitDaysLeft} days`,
          description: 'Prepare I-765 application materials',
          actionRequired: false
        });
      }
    }

    // Document gathering
    if (!this.asylumTimeline.i589FilingDate) {
      general.push({
        title: 'Gather identity documents',
        description: 'Passport, birth certificate, and supporting evidence from home country',
        actionRequired: false
      });
      
      general.push({
        title: 'Collect supporting evidence',
        description: 'Medical records, news articles, photos, witness statements about persecution',
        actionRequired: false
      });
    }

    return { urgent, important, general };
  }

  /**
   * Reset timeline (for testing/debugging)
   */
  async resetTimeline(): Promise<void> {
    this.asylumTimeline = null;
    await AsyncStorage.removeItem(TIMELINE_STORAGE_KEY);
  }
}

// Export singleton instance
export const timelineService = new TimelineService();
export default timelineService;