# Lotus Resume Generator - Artifact Edition

A standalone, client-side resume generator that creates professionally formatted DOCX files from JSON data. No server required!

## Features

- **100% Client-Side**: All processing happens in your browser - no data sent to servers
- **Zero Setup**: Just open the HTML file in any modern browser
- **Dual Input Methods**: Upload JSON files or paste JSON directly
- **Professional Formatting**: Generates Word documents with consistent typography and layout
- **Offline Capable**: Works offline after initial library load
- **Completely Private**: Your resume data never leaves your computer

## Quick Start

### Option 1: Upload JSON File

1. Open `lotus-artifact.html` in your web browser
2. Click on the "Upload JSON File" tab (default)
3. Click "Select Resume JSON File" and choose your JSON file
4. Click "Generate Resume"
5. Your `resume.docx` will download automatically

### Option 2: Paste JSON

1. Open `lotus-artifact.html` in your web browser
2. Click on the "Paste JSON" tab
3. Paste your JSON resume data into the text area
4. Click "Generate Resume" (or press Ctrl/Cmd + Enter)
5. Your `resume.docx` will download automatically

### Try the Example

1. Open `lotus-artifact.html`
2. Click "📋 Show Example JSON"
3. Click "Use This Example"
4. Click "Generate Resume"
5. Open the downloaded `resume.docx` to see the result

## JSON Format

### Required Fields

```json
{
  "name": "Your Name",
  "contact": {
    "items": ["email@example.com", "(555) 123-4567", "linkedin.com/in/username"]
  },
  "sections": [...]
}
```

### Section Types

#### Experience
```json
{
  "heading": "EXPERIENCE",
  "type": "experience",
  "content": [
    {
      "company": "Company Name",
      "dates": "Jan 2020 - Present",
      "title": "Job Title",
      "location": "City, State",
      "bullets": [
        "Achievement or responsibility",
        "Another accomplishment"
      ]
    }
  ]
}
```

#### Education
```json
{
  "heading": "EDUCATION",
  "type": "education",
  "content": [
    {
      "institution": "University Name",
      "location": "City, State",
      "degree": "Degree Name",
      "dates": "2015 - 2019",
      "details": [
        "GPA: 3.8/4.0",
        "Honors or awards"
      ]
    }
  ]
}
```

#### Skills
```json
{
  "heading": "SKILLS",
  "type": "skills",
  "content": [
    {
      "label": "Category Name",
      "items": ["Skill 1", "Skill 2", "Skill 3"]
    }
  ]
}
```

#### Projects
```json
{
  "heading": "PROJECTS",
  "type": "projects",
  "content": [
    {
      "name": "Project Name",
      "technologies": "Tech Stack",
      "dates": "2023",
      "link": "github.com/username/project",
      "bullets": [
        "Project achievement",
        "Impact or outcome"
      ]
    }
  ]
}
```

#### Certifications
```json
{
  "heading": "CERTIFICATIONS",
  "type": "certifications",
  "content": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "2022"
    }
  ]
}
```

### Optional Fields

#### Professional Summary
```json
{
  "summary": {
    "heading": "PROFESSIONAL SUMMARY",
    "text": "Your professional summary text here..."
  }
}
```

## Document Format

The generated DOCX file has the following formatting:

- **Page Size**: 8.5" × 11" (US Letter)
- **Margins**: 0.5" on all sides
- **Font**: Calibri (with Arial fallback)
- **Name**: 20pt, bold
- **Section Headers**: 14pt, bold
- **Body Text**: 10.5pt
- **Bullets**: Solid circles (•) with 0.2" indent
- **Alignment**: Dates and locations right-aligned using tab stops

## Browser Compatibility

### Supported Browsers
- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

### Requirements
- Modern browser with ES6 support
- Internet connection (for initial CDN library load)
- JavaScript enabled

## Files Included

- `lotus-artifact.html` - The standalone artifact application
- `sample-resume.json` - Example resume JSON for testing
- `ARTIFACT_README.md` - This documentation file
- `ARTIFACT_PLAN.md` - Technical implementation plan

## How It Works

1. **Load**: Opens HTML file, loads docx library from CDN
2. **Input**: Accepts JSON via file upload or paste
3. **Validate**: Checks for required fields
4. **Build**: Constructs document using ResumeDocumentBuilder class
5. **Generate**: Creates DOCX blob using docx.js library
6. **Download**: Triggers browser download of the file

All processing happens locally in your browser. No data is transmitted to any server.

## Troubleshooting

### "Document library not loaded" Error
- Check your internet connection
- Refresh the page to retry loading the CDN library
- If problems persist, check browser console for errors

### "Invalid JSON" Error
- Verify JSON syntax (use a JSON validator)
- Ensure all required fields are present
- Check for missing commas or brackets
- Make sure strings are properly quoted

### Download Doesn't Start
- Check if your browser is blocking downloads
- Ensure popups are not blocked
- Try using a different browser

### Formatting Issues in Generated DOCX
- Verify your JSON structure matches the expected format
- Check that section types are spelled correctly
- Ensure all arrays and objects are properly formatted

## Comparison with Web App

| Feature | Web App | Artifact |
|---------|---------|----------|
| Hosting Required | Yes | No |
| Setup | npm install | Open HTML file |
| Authentication | Yes | No (local use) |
| Data Privacy | Server-side | 100% local |
| Internet Required | Yes | Only for initial load |
| Offline Use | No | Yes* |
| Portability | URL only | Single file |
| Output | Identical | Identical |

*After initial library load

## Privacy & Security

- **No Tracking**: No analytics or tracking code
- **No Data Collection**: Your resume data stays on your device
- **No External Calls**: Only loads docx library from CDN
- **Open Source**: Full source code visible in HTML file
- **No Authentication**: No passwords or credentials needed

## Technical Details

### Dependencies
- **docx.js v8.2.0**: Document generation library (loaded from CDN)

### Size
- **HTML File**: ~40KB
- **docx Library**: ~500KB (loaded from CDN)
- **Total Initial Load**: ~540KB

### Generation Performance
- Simple resume (1-2 pages): <500ms
- Complex resume (3-5 pages): 1-2 seconds
- All processing is client-side with no network latency

## Tips for Best Results

1. **Validate JSON First**: Use a JSON validator to check syntax before generating
2. **Use Consistent Formatting**: Keep date formats and location formats consistent
3. **Keep Bullets Concise**: Start with action verbs, keep points focused
4. **Section Order**: Put most important sections first (typically Experience)
5. **Contact Info**: Include 3-4 contact methods for best appearance
6. **Test Download**: Always open the generated DOCX to verify formatting

## Example Workflow

1. Create resume data in JSON format
2. Save as `my-resume.json`
3. Open `lotus-artifact.html`
4. Upload `my-resume.json`
5. Click "Generate Resume"
6. Open downloaded `resume.docx` in Microsoft Word
7. Make any final adjustments if needed
8. Export as PDF for distribution

## Credits

Original Lotus Resume Generator by [Your Name/Organization]

Artifact adaptation leverages:
- [docx](https://github.com/dolanmiu/docx) library by dolanmiu
- Modern browser APIs (FileReader, Blob, URL)

## License

[Include your license information here]

## Support

For issues or questions:
- Check the Troubleshooting section above
- Review the JSON format examples
- Test with the included `sample-resume.json`
- Open the browser console (F12) to see error details

## Version

Artifact Version: 1.0.0
Based on: Lotus Resume Generator Web App
Created: 2026-01-18
