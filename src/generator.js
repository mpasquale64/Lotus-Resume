const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  TabStopType,
  AlignmentType,
  LevelFormat,
  convertInchesToTwip
} = require('docx');

const CONFIG = {
  page: {
    width: 12240,
    height: 15840,
    margins: { top: 720, bottom: 720, left: 720, right: 720 }
  },
  fonts: { primary: "Calibri", fallback: "Arial" },
  sizes: { name: 40, sectionHeader: 28, body: 21, small: 20 },
  colors: { black: "000000", darkGray: "666666" },
  spacing: { afterParagraph: 80, afterSection: 0, sectionGap: 160, lineSpacing: 240 },
  bullets: { leftIndent: 288, hangingIndent: 288 },
  rightTabPosition: 10800
};

class ResumeDocumentBuilder {
  constructor(resumeData) {
    this.data = resumeData;
    this.children = [];
  }

  build() {
    this.addNameHeader();
    this.addContactLine();
    if (this.data.summary) {
      this.addEmptyLine();
      this.addSummarySection();
    }
    for (const section of this.data.sections) {
      this.addEmptyLine();
      this.addSection(section);
    }
    return new Document({
      styles: this.getStyles(),
      numbering: this.getNumberingConfig(),
      sections: [{
        properties: {
          page: {
            size: { width: CONFIG.page.width, height: CONFIG.page.height },
            margin: CONFIG.page.margins
          }
        },
        children: this.children
      }]
    });
  }

  getStyles() {
    return {
      default: {
        document: {
          run: { font: CONFIG.fonts.primary, size: CONFIG.sizes.body, color: CONFIG.colors.black },
          paragraph: { spacing: { after: CONFIG.spacing.afterParagraph, line: CONFIG.spacing.lineSpacing, lineRule: "auto" } }
        }
      },
      paragraphStyles: [
        { id: "Normal", name: "Normal", run: { font: CONFIG.fonts.primary, size: CONFIG.sizes.body }, paragraph: { spacing: { after: CONFIG.spacing.afterParagraph, line: CONFIG.spacing.lineSpacing } } },
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", run: { font: CONFIG.fonts.primary, size: CONFIG.sizes.name, bold: true } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", run: { font: CONFIG.fonts.primary, size: CONFIG.sizes.sectionHeader, bold: true } },
        { id: "Employer", name: "Employer", basedOn: "Normal", run: { bold: true }, paragraph: { spacing: { after: 0 }, tabStops: [{ type: TabStopType.RIGHT, position: CONFIG.rightTabPosition }] } },
        { id: "JobRole", name: "Job Role", basedOn: "Normal", run: { italics: true }, paragraph: { spacing: { after: CONFIG.spacing.afterParagraph }, tabStops: [{ type: TabStopType.RIGHT, position: CONFIG.rightTabPosition }] } }
      ]
    };
  }

  getNumberingConfig() {
    return {
      config: [{
        reference: "resume-bullets",
        levels: [{
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: { indent: { left: CONFIG.bullets.leftIndent, hanging: CONFIG.bullets.hangingIndent } },
            run: { font: CONFIG.fonts.primary }
          }
        }]
      }]
    };
  }

  addNameHeader() {
    this.children.push(new Paragraph({ style: "Heading1", children: [new TextRun({ text: this.data.name })] }));
  }

  addContactLine() {
    this.children.push(new Paragraph({ style: "Normal", children: [new TextRun({ text: this.data.contact.items.join(" | ") })] }));
  }

  addSummarySection() {
    this.children.push(new Paragraph({ style: "Heading2", children: [new TextRun({ text: this.data.summary.heading || "PROFESSIONAL SUMMARY" })] }));
    this.children.push(new Paragraph({ style: "Normal", children: [new TextRun({ text: this.data.summary.text })] }));
  }

  addEmptyLine() {
    this.children.push(new Paragraph({ style: "Normal", children: [] }));
  }

  addSection(section) {
    this.children.push(new Paragraph({ style: "Heading2", children: [new TextRun({ text: section.heading })] }));
    switch (section.type) {
      case "skills": this.addSkillsContent(section.content); break;
      case "experience": this.addExperienceContent(section.content); break;
      case "education": this.addEducationContent(section.content); break;
      case "certifications": this.addCertificationsContent(section.content); break;
      case "projects": this.addProjectsContent(section.content); break;
    }
  }

  addSkillsContent(skillGroups) {
    for (const group of skillGroups) {
      this.children.push(new Paragraph({
        style: "Normal",
        children: [
          new TextRun({ text: `${group.label}: `, bold: true }),
          new TextRun({ text: group.items.join(", ") })
        ]
      }));
    }
  }

  addExperienceContent(experiences) {
    for (const exp of experiences) {
      this.children.push(new Paragraph({
        style: "Employer",
        children: [
          new TextRun({ text: exp.company }),
          new TextRun({ text: "\t", bold: true }),
          new TextRun({ text: exp.dates || "" })
        ]
      }));
      this.children.push(new Paragraph({
        style: "JobRole",
        children: [
          new TextRun({ text: exp.title }),
          new TextRun({ text: "\t", italics: true }),
          new TextRun({ text: exp.location || "" })
        ]
      }));
      for (const bullet of exp.bullets) {
        this.children.push(new Paragraph({
          numbering: { reference: "resume-bullets", level: 0 },
          children: [new TextRun({ text: bullet })]
        }));
      }
    }
  }

  addEducationContent(educationEntries) {
    for (const edu of educationEntries) {
      this.children.push(new Paragraph({
        style: "Employer",
        children: [
          new TextRun({ text: edu.institution }),
          new TextRun({ text: "\t" }),
          new TextRun({ text: edu.location || "" })
        ]
      }));
      this.children.push(new Paragraph({
        style: "JobRole",
        children: [
          new TextRun({ text: edu.degree }),
          new TextRun({ text: "\t" }),
          new TextRun({ text: edu.dates || "" })
        ]
      }));
      if (edu.details) {
        for (const detail of edu.details) {
          this.children.push(new Paragraph({
            numbering: { reference: "resume-bullets", level: 0 },
            children: [new TextRun({ text: detail })]
          }));
        }
      }
    }
  }

  addCertificationsContent(certs) {
    for (const cert of certs) {
      this.children.push(new Paragraph({
        numbering: { reference: "resume-bullets", level: 0 },
        children: [
          new TextRun({ text: cert.name, bold: true }),
          new TextRun({ text: cert.issuer ? ` – ${cert.issuer}` : "" }),
          new TextRun({ text: cert.date ? ` (${cert.date})` : "" })
        ]
      }));
    }
  }

  addProjectsContent(projects) {
    for (const project of projects) {
      this.children.push(new Paragraph({
        style: "Employer",
        children: [
          new TextRun({ text: project.name }),
          new TextRun({ text: project.technologies ? ` | ${project.technologies}` : "" }),
          new TextRun({ text: "\t" }),
          new TextRun({ text: project.dates || "" })
        ]
      }));
      if (project.link) {
        this.children.push(new Paragraph({ style: "Normal", children: [new TextRun({ text: project.link, color: "0563C1" })] }));
      }
      for (const bullet of project.bullets) {
        this.children.push(new Paragraph({
          numbering: { reference: "resume-bullets", level: 0 },
          children: [new TextRun({ text: bullet })]
        }));
      }
    }
  }
}

module.exports = { ResumeDocumentBuilder, Packer };
