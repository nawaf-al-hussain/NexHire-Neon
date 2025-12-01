# Document Upload Feature - Implementation Plan

## Executive Summary

This document outlines a detailed implementation plan for adding document uploading functionality to the NexHire recruitment platform. The feature will allow candidates to upload resumes, cover letters, and certificates.

---

## 1. Current State Analysis

### 1.1 What Already Exists

**Database Schema:**
- `Candidates` table has:
  - `ResumeFile VARBINARY(MAX)` - binary resume data
  - `ResumeFileName NVARCHAR(255)` - original filename
  - `ResumeText NVARCHAR(MAX)` - extracted text (via CLR)
  - `ExtractedSkills NVARCHAR(MAX)` - skills extracted from resume

- `CandidateDocuments` table:
  ```sql
  CREATE TABLE CandidateDocuments (
      DocumentID INT IDENTITY(1,1) PRIMARY KEY,
      CandidateID INT NOT NULL,
      DocumentType VARCHAR(50) CHECK (DocumentType IN ('Resume', 'CoverLetter', 'Certificate')),
      FilePath NVARCHAR(500),
      UploadedAt DATETIME DEFAULT GETDATE(),
      FOREIGN KEY (CandidateID) REFERENCES Candidates(CandidateID) ON DELETE CASCADE
  );
  ```

**CLR Functions (Already Implemented):**
- `ExtractTextFromPDF` - extracts text from PDF binary
- `ExtractTextFromDocx` - extracts text from DOCX binary
- `ExtractSkills` - identifies skills from text
- `ExtractYearsOfExperience` - parses experience years

**Stored Procedure:**
- `sp_ProcessCandidateResume` - processes uploaded resume, extracts text and skills

### 1.2 What's Missing

| Component | Status |
|-----------|--------|
| File upload API endpoints | ❌ Missing |
| File upload middleware (multer) | ❌ Missing |
| Frontend document upload component | ❌ Missing |
| File storage mechanism | ❌ Missing |

---

## 2. Proposed Architecture

### 2.1 Storage Strategy: Database (Recommended)

The project already has **CLR (Common Language Runtime) functions** that work directly with database binary data. Here's why storing in the database (VARBINARY) is the better choice:

**Existing CLR Functions:**

| Function | Purpose | Input |
|----------|---------|-------|
| [`ExtractTextFromPDF`](ProjectResources/NexHire%20Features%20Dictionary%20-%20CLRFunctions.tsv:22) | Extracts text from PDF | VARBINARY(MAX) |
| [`ExtractTextFromDocx`](ProjectResources/NexHire%20Features%20Dictionary%20-%20CLRFunctions.tsv:23) | Extracts text from DOCX | VARBINARY(MAX) |
| [`ExtractSkills`](ProjectResources/NexHire%20Features%20Dictionary%20-%20CLRFunctions.tsv:25) | Identifies 40+ skills from text | NVARCHAR(MAX) |
| [`ExtractYearsOfExperience`](ProjectResources/NexHire%20Features%20Dictionary%20-%20CLRFunctions.tsv:24) | Parses experience years | NVARCHAR(MAX) |

**Why Database Storage (VARBINARY):**
- ✅ Schema already supports it (`Candidates.ResumeFile VARBINARY(MAX)`)
- ✅ CLR functions work directly with database fields
- ✅ [`sp_ProcessCandidateResume`](ProjectResources/Database_Components_Seperated/NexHire_StoredProcedures/sp_ProcessCandidateResume.sql) already uses these functions
- ✅ Simpler backup/restore (single database)
- ✅ No file system permission issues

**Why NOT File System:**
- ❌ Would need to extract text before storing (extra step)
- ❌ CLR functions designed for database binary, not files
- ❌ Backup complexity (database + files)
- ❌ File permission management required

### 2.2 System Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DOCUMENT UPLOAD FLOW                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────┐ │
│  │ Candidate│────▶│ React UI     │────▶│ Express API │────▶│ SQL     │ │
│  │ Browser  │     │ Component    │     │ Endpoint    │     │ Server  │ │
│  └──────────┘     └──────────────┘     └─────────────┘     └─────────┘ │
│       │                                        │                   │     │
│       │                                        ▼                   │     │
│       │                               ┌─────────────────┐         │     │
│       │                               │ Multer Middle   │         │     │
│       │                               │ ware + File     │         │     │
│       │                               │ System Storage  │         │     │
│       │                               └─────────────────┘         │     │
│       │                                        │                   │     │
│       ▼                                        ▼                   ▼     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    PROCESSING PIPELINE                          │   │
│  │  1. Store file to disk                                         │   │
│  │  2. Insert metadata to CandidateDocuments                      │   │
│  │  3. If Resume: Call sp_ProcessCandidateResume                  │   │
│  │  4. Extract text & skills via CLR                               │   │
│  │  5. Update Candidates table with extracted data                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Storage Strategy

**Option A: File System Storage (Recommended for MVP)**
- Store files in `server/uploads/` directory
- Simple to implement
- Suitable for small to medium volumes

**Option B: Database VARBINARY Storage**
- Store file content directly in `Candidates.ResumeFile`
- Already supported by existing schema
- Simpler retrieval, but larger DB size

**Recommendation:** Use Option B initially (store in VARBINARY) since schema already supports it, then transition to Option A for production.

---

## 3. Implementation Steps

### Phase 1: Backend Infrastructure

#### Step 1.1: Install multer package
```bash
cd server
npm install multer
```

#### Step 1.2: Create uploads directory
```
server/uploads/
```

#### Step 1.3: Add file upload routes in `server/routes/documents.js`

```javascript
// New route file: server/routes/documents.js

// Endpoints needed:
// POST /api/documents/upload - Upload a document
// GET /api/documents - List all documents for current candidate
// GET /api/documents/:id - Get specific document metadata
// DELETE /api/documents/:id - Delete a document

// Resume-specific endpoints:
// POST /api/documents/resume - Upload resume (triggers processing)
// GET /api/documents/resume/download - Download current resume
```

### Phase 2: Database Integration

#### Step 2.1: API Endpoints Implementation

**POST /api/documents/upload**
- Accepts: multipart/form-data
- Fields: file, documentType
- Validates file type (PDF, DOC, DOCX, JPG, PNG)
- Validates file size (max 5MB)
- Stores file metadata in CandidateDocuments
- If documentType='Resume', triggers sp_ProcessCandidateResume

**GET /api/documents**
- Returns list of documents for logged-in candidate
- Returns: DocumentID, DocumentType, FilePath, UploadedAt

**DELETE /api/documents/:id**
- Deletes document record
- If Resume, clears Candidates.ResumeFile

### Phase 3: Frontend Implementation

#### Step 3.1: Create DocumentUpload component

**File:** `client/src/components/Candidate/DocumentUpload.jsx`

Features:
- Drag-and-drop file upload zone
- File type validation display
- Upload progress indicator
- Document type selector (Resume, CoverLetter, Certificate)
- List of uploaded documents
- Delete document functionality

#### Step 3.2: Integrate with Profile Management

Add document upload section to existing `ProfileManagement.jsx`:
- Resume upload/download
- Certificate management

#### Step 3.3: Add API service functions

**File:** `client/src/services/documentService.js`

```javascript
// Functions needed:
// uploadDocument(file, documentType)
// getDocuments()
// deleteDocument(id)
// downloadResume()
```

---

## 4. API Endpoint Specifications

### 4.1 POST /api/documents/upload

**Request:**
```
POST /api/documents/upload
Content-Type: multipart/form-data
x-user-id: <userId>
x-user-role: <roleId>

------Boundary
Content-Disposition: form-data; name="file"; filename="resume.pdf"
Content-Type: application/pdf

<binary data>
------Boundary
Content-Disposition: form-data; name="documentType"

Resume
------Boundary--
```

**Response (Success):**
```json
{
  "success": true,
  "document": {
    "DocumentID": 1,
    "DocumentType": "Resume",
    "FilePath": "/uploads/resume_123456.pdf",
    "UploadedAt": "2026-02-26T12:00:00Z"
  },
  "resumeProcessed": true,
  "extractedSkills": "Java:40,React:35,SQL:25",
  "resumeTextLength": 5000
}
```

**Response (Error):**
```json
{
  "error": "Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG"
}
```

### 4.2 GET /api/documents

**Response:**
```json
[
  {
    "DocumentID": 1,
    "DocumentType": "Resume",
    "FileName": "resume.pdf",
    "UploadedAt": "2026-02-26T12:00:00Z"
  },
  {
    "DocumentID": 2,
    "DocumentType": "Certificate",
    "FileName": "aws_cert.pdf",
    "UploadedAt": "2026-02-25T10:30:00Z"
  }
]
```

---

## 5. File Structure Changes

```
server/
├── index.js                    # Add documents route registration
├── uploads/                   # NEW: File storage directory
├── routes/
│   └── documents.js          # NEW: Document upload routes
└── db.js

client/src/
├── components/
│   └── Candidate/
│       ├── ProfileManagement.jsx   # MODIFIED: Add document section
│       └── DocumentUpload.jsx    # NEW: Upload component
├── services/
│   └── documentService.js        # NEW: API functions
└── pages/
    └── CandidateDashboard.jsx    # MODIFIED: Add Documents tab
```

---

## 6. Security Considerations

1. **File Validation:**
   - Check MIME type on server (don't trust client-provided type)
   - Validate file extensions
   - Scan for malicious content (optional: virus scanning)

2. **Storage Security:**
   - Generate unique filenames (UUID) to prevent overwrites
   - Store outside web root
   - Set proper file permissions

3. **Access Control:**
   - Only candidates can upload their own documents
   - Only recruiters can view/download candidate documents
   - Admin has full access

---

## 7. Testing Checklist

- [ ] Upload valid PDF resume
- [ ] Upload valid DOCX resume
- [ ] Upload invalid file type (should reject)
- [ ] Upload file exceeding 5MB (should reject)
- [ ] View list of uploaded documents
- [ ] Delete a document
- [ ] Verify resume text extraction works
- [ ] Verify skills are extracted and stored
- [ ] Recruiter can view candidate documents
- [ ] Unauthorized user cannot access documents

---

## 8. Implementation Priority

| Priority | Feature | Description |
|----------|---------|-------------|
| P0 | Resume Upload | Core feature - upload and process resumes |
| P0 | Resume Download | Allow candidates to download their resume |
| P1 | Certificate Upload | Upload supporting documents |
| P1 | Document List | View all uploaded documents |
| P2 | Cover Letter Upload | Additional document type |
| P2 | Document Delete | Remove uploaded documents |

---

## 9. Estimated Complexity

| Component | Complexity | Notes |
|-----------|------------|-------|
| Backend API | Medium | multer + file handling |
| Database integration | Low | Uses existing schema |
| Frontend component | Medium | Drag-drop, validation UI |
| Integration with Profile | Low | Add to existing component |

---

## 10. Approved Requirements

1. **Resume Behavior**: New resume replaces old one (no version history)
2. **Recruiter Access**: Recruiters can view all candidate documents

---

*Plan approved: 2026-02-26*
*Status: Ready for Implementation*
