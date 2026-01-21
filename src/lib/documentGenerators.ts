import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
} from 'docx';
import { saveAs } from 'file-saver';
import { FamilyAgreementData, ThirtyDayPlanData, DocumentData } from './documentTypes';

// Font configuration for fridge-readable documents
const FONT_FAMILY = 'Arial';
const TITLE_SIZE = 56;      // 28pt in half-points
const HEADING_SIZE = 36;    // 18pt in half-points
const SUBHEADING_SIZE = 28; // 14pt in half-points
const BODY_SIZE = 24;       // 12pt in half-points
const HEADING_COLOR = '2563EB'; // Primary blue

// Page margins for print (1 inch = 1440 twips)
const PAGE_MARGINS = {
  top: convertInchesToTwip(1),
  bottom: convertInchesToTwip(1),
  left: convertInchesToTwip(1),
  right: convertInchesToTwip(1),
};

// Helper to create a styled heading
const createHeading = (text: string) => {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: HEADING_SIZE,
        font: FONT_FAMILY,
        color: HEADING_COLOR,
      }),
    ],
    spacing: { before: 400, after: 200 },
  });
};

// Helper to create a bullet point
const createBullet = (text: string, level: number = 0) => {
  return new Paragraph({
    children: [new TextRun({ text, size: BODY_SIZE, font: FONT_FAMILY })],
    bullet: { level },
    spacing: { before: 120, after: 120 },
  });
};

// Helper to create a numbered item
const createNumberedItem = (text: string, number: number) => {
  return new Paragraph({
    children: [
      new TextRun({ text: `${number}. `, bold: true, size: BODY_SIZE, font: FONT_FAMILY }),
      new TextRun({ text, size: BODY_SIZE, font: FONT_FAMILY }),
    ],
    spacing: { before: 120, after: 120 },
  });
};

// Helper to create body text
const createBodyText = (text: string) => {
  return new Paragraph({
    children: [new TextRun({ text, size: BODY_SIZE, font: FONT_FAMILY })],
    spacing: { before: 120, after: 120 },
  });
};

// Helper to create a subheading
const createSubheading = (text: string) => {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: SUBHEADING_SIZE,
        font: FONT_FAMILY,
      }),
    ],
    spacing: { before: 240, after: 120 },
  });
};

// Helper to create signature line
const createSignatureLine = () => {
  return new Paragraph({
    children: [
      new TextRun({
        text: '________________________________    Date: ____________',
        size: BODY_SIZE,
        font: FONT_FAMILY,
      }),
    ],
    spacing: { before: 300 },
  });
};

// Generate Family Technology Agreement document
export const generateFamilyAgreement = async (data: FamilyAgreementData): Promise<Blob> => {
  const sections: Paragraph[] = [];

  // Title
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Family Technology Agreement',
          bold: true,
          size: TITLE_SIZE,
          font: FONT_FAMILY,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Date
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Created: ${new Date(data.dateCreated).toLocaleDateString()}`,
          italics: true,
          size: BODY_SIZE,
          font: FONT_FAMILY,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Family Values
  if (data.sections.familyValues.length > 0) {
    sections.push(createHeading('Our Family Values'));
    sections.push(
      createBodyText('These are the core values that guide how we use technology in our home:')
    );
    data.sections.familyValues.forEach((value) => {
      sections.push(createBullet(value));
    });
  }

  // Screen Time Rules
  if (data.sections.screenTimeRules.length > 0) {
    sections.push(createHeading('Screen Time Rules'));
    data.sections.screenTimeRules.forEach((rule, index) => {
      sections.push(createNumberedItem(rule.rule, index + 1));
      if (rule.details) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: rule.details,
                italics: true,
                size: BODY_SIZE,
                font: FONT_FAMILY,
              }),
            ],
            indent: { left: 720 },
            spacing: { before: 60, after: 120 },
          })
        );
      }
    });
  }

  // Device Rules
  if (data.sections.deviceRules.length > 0) {
    sections.push(createHeading('Device-Specific Rules'));
    data.sections.deviceRules.forEach((device) => {
      sections.push(createSubheading(device.device));
      device.rules.forEach((rule) => {
        sections.push(createBullet(rule, 1));
      });
    });
  }

  // AI Usage Guidelines
  if (data.sections.aiUsageGuidelines.length > 0) {
    sections.push(createHeading('AI & ChatGPT Guidelines'));
    data.sections.aiUsageGuidelines.forEach((guideline) => {
      sections.push(createBullet(guideline));
    });
  }

  // Consequences
  if (data.sections.consequences.length > 0) {
    sections.push(createHeading('Consequences for Breaking Rules'));
    data.sections.consequences.forEach((consequence, index) => {
      sections.push(createNumberedItem(consequence, index + 1));
    });
  }

  // Rewards
  if (data.sections.rewards.length > 0) {
    sections.push(createHeading('Rewards for Following Rules'));
    data.sections.rewards.forEach((reward) => {
      sections.push(createBullet(reward));
    });
  }

  // Exceptions
  if (data.sections.exceptions.length > 0) {
    sections.push(createHeading('Exceptions & Special Circumstances'));
    data.sections.exceptions.forEach((exception) => {
      sections.push(createBullet(exception));
    });
  }

  // Review Schedule
  if (data.sections.reviewSchedule) {
    sections.push(createHeading('Review Schedule'));
    sections.push(createBodyText(data.sections.reviewSchedule));
  }

  // Signature Section
  sections.push(createHeading('Signatures'));
  sections.push(
    createBodyText('By signing below, we agree to follow this Family Technology Agreement.')
  );
  sections.push(new Paragraph({ spacing: { before: 300 } }));

  // Parent signatures
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Parents/Guardians:',
          bold: true,
          size: BODY_SIZE,
          font: FONT_FAMILY,
        }),
      ],
      spacing: { before: 200 },
    })
  );
  sections.push(createSignatureLine());
  sections.push(createSignatureLine());

  // Child signatures
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Children:',
          bold: true,
          size: BODY_SIZE,
          font: FONT_FAMILY,
        }),
      ],
      spacing: { before: 400 },
    })
  );
  sections.push(createSignatureLine());
  sections.push(createSignatureLine());

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: PAGE_MARGINS,
          },
        },
        children: sections,
      },
    ],
  });

  return await Packer.toBlob(doc);
};

// Generate 30-Day Plan document
export const generate30DayPlan = async (data: ThirtyDayPlanData): Promise<Blob> => {
  const sections: Paragraph[] = [];

  // Title
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Your 30-Day Family Tech Plan',
          bold: true,
          size: TITLE_SIZE,
          font: FONT_FAMILY,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Date and child info
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Created: ${new Date(data.dateCreated).toLocaleDateString()}`,
          italics: true,
          size: BODY_SIZE,
          font: FONT_FAMILY,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  if (data.childAge) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Child's Age: ${data.childAge}`,
            size: BODY_SIZE,
            font: FONT_FAMILY,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );
  }

  // Main Goal
  sections.push(createHeading('Your Main Goal'));
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.mainGoal,
          bold: true,
          size: SUBHEADING_SIZE,
          font: FONT_FAMILY,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 200 },
      border: {
        top: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
        left: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
        right: { style: BorderStyle.SINGLE, size: 1, color: '999999' },
      },
      shading: { fill: 'f5f5f5' },
    })
  );

  // Overview
  sections.push(createHeading('Plan Overview'));
  sections.push(createBodyText(data.overview));

  // Weekly Plans
  data.weeks.forEach((week) => {
    sections.push(createHeading(`Week ${week.weekNumber}: ${week.theme}`));

    // Goals
    sections.push(createSubheading('Goals for this week:'));
    week.goals.forEach((goal) => {
      sections.push(createBullet(goal));
    });

    // Daily Actions
    if (week.dailyActions.length > 0) {
      sections.push(createSubheading('Daily Actions:'));

      week.dailyActions.forEach((action) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${action.day}: `,
                bold: true,
                size: BODY_SIZE,
                font: FONT_FAMILY,
              }),
              new TextRun({
                text: action.action,
                size: BODY_SIZE,
                font: FONT_FAMILY,
              }),
            ],
            spacing: { before: 100, after: 100 },
            indent: { left: 360 },
          })
        );
      });
    }

    // Tips
    if (week.tips.length > 0) {
      sections.push(createSubheading('Tips:'));
      week.tips.forEach((tip) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `💡 ${tip}`,
                italics: true,
                size: BODY_SIZE,
                font: FONT_FAMILY,
              }),
            ],
            spacing: { before: 60, after: 60 },
            indent: { left: 360 },
          })
        );
      });
    }
  });

  // Success Metrics
  if (data.successMetrics.length > 0) {
    sections.push(createHeading('How to Measure Success'));
    data.successMetrics.forEach((metric) => {
      sections.push(createBullet(`✓ ${metric}`));
    });
  }

  // Troubleshooting
  if (data.troubleshooting.length > 0) {
    sections.push(createHeading('Troubleshooting Guide'));
    data.troubleshooting.forEach((item) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Challenge: ${item.challenge}`,
              bold: true,
              size: BODY_SIZE,
              font: FONT_FAMILY,
            }),
          ],
          spacing: { before: 200 },
        })
      );
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Solution: ${item.solution}`,
              size: BODY_SIZE,
              font: FONT_FAMILY,
            }),
          ],
          spacing: { before: 60, after: 150 },
          indent: { left: 360 },
        })
      );
    });
  }

  // Notes section
  sections.push(createHeading('Notes & Reflections'));
  sections.push(
    createBodyText('Use this space to track your progress and note what\'s working:')
  );
  for (let i = 0; i < 10; i++) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '_______________________________________________',
            size: BODY_SIZE,
            font: FONT_FAMILY,
          }),
        ],
        spacing: { before: 200 },
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: PAGE_MARGINS,
          },
        },
        children: sections,
      },
    ],
  });

  return await Packer.toBlob(doc);
};

// Main export function that routes to correct generator
export const generateDocument = async (data: DocumentData): Promise<Blob> => {
  switch (data.type) {
    case 'family_agreement':
      return generateFamilyAgreement(data);
    case '30_day_plan':
      return generate30DayPlan(data);
    default:
      throw new Error('Unknown document type');
  }
};

// Download helper
export const downloadDocument = async (data: DocumentData, filename?: string): Promise<void> => {
  const blob = await generateDocument(data);
  const defaultFilename =
    data.type === 'family_agreement'
      ? 'Family-Technology-Agreement.docx'
      : '30-Day-Family-Tech-Plan.docx';
  saveAs(blob, filename || defaultFilename);
};
