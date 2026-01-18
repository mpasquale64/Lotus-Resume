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

  // --- Helper Methods to Reduce Redundancy ---

  createText(text, options = {}) {
    return new TextRun({
      text: text || "",
      font: CONFIG.fonts.primary,
      size: CONFIG.sizes.body,
      color: CONFIG.colors.black,
      ...options
    });
  }

  createParagraph(children, style = "Normal", options = {}) {
    return new Paragraph({
      style: style,
      children: Array.isArray(children) ? children : [children],
      ...options
    });
  }

  createSplitLine(leftText, rightText, style) {
    const children = [this.createText(leftText)];
    if (rightText) {
      children.push(this.createText("\t"));
      children.push(this.createText(rightText));
    }
    return this.createParagraph(children, style, {
      tabStops: [{ type: TabStopType.RIGHT, position: CONFIG.rightTabPosition }]
    });
  }

  createBullet(content) {
    const children = Array.isArray(content) ? content : [this.createText(content)];
    return this.createParagraph(children, undefined, {
      numbering: { reference: "resume-bullets", level: 0 }
    });
  }

  addBullets(bullets) {
    if (bullets) bullets.forEach(b => this.children.push(this.createBullet(b)));
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
    this.children.push(this.createParagraph(
      this.createText(this.data.name, { size: CONFIG.sizes.name, bold: true }),
      "Heading1"
    ));
  }

  addContactLine() {
    this.children.push(this.createParagraph(
      this.createText(this.data.contact.items.join(" | "))
    ));
  }

  addSummarySection() {
    this.children.push(this.createParagraph(this.createText(this.data.summary.heading || "PROFESSIONAL SUMMARY"), "Heading2"));
    this.children.push(this.createParagraph(this.createText(this.data.summary.text)));
  }

  addEmptyLine() {
    this.children.push(this.createParagraph([]));
  }

  addSection(section) {
    this.children.push(this.createParagraph(this.createText(section.heading), "Heading2"));
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
      this.children.push(this.createParagraph([
        this.createText(`${group.label}: `, { bold: true }),
        this.createText(group.items.join(", "))
      ]));
    }
  }

  addExperienceContent(experiences) {
    for (const exp of experiences) {
      this.children.push(this.createSplitLine(exp.company, exp.dates, "Employer"));
      this.children.push(this.createSplitLine(exp.title, exp.location, "JobRole"));
      this.addBullets(exp.bullets);
    }
  }

  addEducationContent(educationEntries) {
    for (const edu of educationEntries) {
      this.children.push(this.createSplitLine(edu.institution, edu.location, "Employer"));
      this.children.push(this.createSplitLine(edu.degree, edu.dates, "JobRole"));
      this.addBullets(edu.details);
    }
  }

  addCertificationsContent(certs) {
    for (const cert of certs) {
      this.children.push(this.createBullet([
        this.createText(cert.name, { bold: true }),
        this.createText(cert.issuer ? ` – ${cert.issuer}` : ""),
        this.createText(cert.date ? ` (${cert.date})` : "")
      ]));
    }
  }

  addProjectsContent(projects) {
    for (const project of projects) {
      const nameText = project.name + (project.technologies ? ` | ${project.technologies}` : "");
      this.children.push(this.createSplitLine(nameText, project.dates, "Employer"));
      
      if (project.link) {
        this.children.push(this.createParagraph(
          this.createText(project.link, { color: "0563C1" })
        ));
      }
      this.addBullets(project.bullets);
    }
  }
}

module.exports = { ResumeDocumentBuilder, Packer };
