# Tuto AI Assistant - Feature Plan

> **Status**: Draft for Review  
> **Last Updated**: January 8, 2026  
> **Author**: Development Team

---

## 1. Executive Summary

The Tuto AI Assistant is a native, context-aware AI copilot designed for partner schools. It enables school admins, teachers, and parents to interact with the platform using natural language — querying data, executing tasks, and getting help — all within a conversational chat interface.

### Vision Statement
*"Talk to your school data. Ask anything. Get things done."*

### Key Differentiators
- **Native integration**: Not a bolt-on chatbot; deeply integrated with all school data
- **Action-capable**: Can execute tasks, not just answer questions
- **Bilingual**: Full support for Vietnamese and English
- **Role-aware**: Respects permissions and shows relevant data per user role

---

## 2. Target Users & Personas

### 2.1 School Admin (Primary)
- **Needs**: Quick access to KPIs, bulk operations, report generation
- **Example queries**:
  - "Show me Mung's attendance for December"
  - "Upload these photos to a new album for class 5A"
  - "How many students were absent last week?"
  - "Send an announcement to all parents about the holiday schedule"

### 2.2 Teachers
- **Needs**: Class management, homework tracking, student progress
- **Example queries**:
  - "Which students haven't submitted the math homework?"
  - "Create a homework assignment for class 3B due Friday"
  - "Show attendance trends for my class"

### 2.3 Parents
- **Needs**: Child information, event awareness, communication
- **Example queries**:
  - "What homework does Minh have this week?"
  - "When is the next parent-teacher meeting?"
  - "Has my child's medicine been administered today?"

---

## 3. Core Capabilities

### 3.1 Data Query & Retrieval (READ Operations)

| Category | Capabilities | Data Sources |
|----------|-------------|--------------|
| **Attendance** | Query by student, class, date range | `school_attendance`, `att_kpis` RPC |
| **Students** | Profile info, enrolled classes, parents | `school_students`, `school_parent_students` |
| **Teachers** | Profile, assigned classes, subjects | `school_teachers`, `school_classes` |
| **Classes** | Roster, schedule, grade levels | `school_classes`, `school_students` |
| **Events** | Upcoming, past, filtered by type | `school_events` |
| **Announcements** | Active, archived, by category | `school_announcements` |
| **Photo Albums** | Browse, search, by class/event | `school_albums`, `school_album_photos` |
| **Homework** | Assignments, submissions, due dates | `school_homework_assignments` |
| **Health** | Records, medicine logs, allergies | `school_health_records`, `school_medicine_logs` |
| **Payments** | Status, history, pending fees | `school_payments` |
| **Progress Reports** | Grades, teacher comments, trends | `school_progress_reports` |
| **Messages** | Threads, conversations, unread count | `school_messages` |
| **Daily Activities** | What happened today in class | `school_daily_activities` |

### 3.2 Smart Actions (WRITE Operations)

#### 3.2.1 Content Creation
| Action | Description | Required Inputs |
|--------|-------------|-----------------|
| **Create Album** | Create photo album with uploaded images | Title, class, photos, category |
| **Post Announcement** | Publish school-wide or targeted announcement | Title, content, audience, priority |
| **Create Event** | Schedule new event with details | Title, date/time, location, audience |
| **Create Homework** | Assign homework to class | Title, description, due date, class |
| **Send Message** | Compose and send to parent/teacher | Recipient, subject, content |

#### 3.2.2 Data Modification
| Action | Description | Required Inputs |
|--------|-------------|-----------------|
| **Mark Attendance** | Record student attendance | Student, date, status |
| **Update Student Info** | Edit student profile | Student ID, field, new value |
| **Log Medicine** | Record medicine administration | Student, medicine, time |
| **Cancel Event** | Cancel scheduled event | Event ID, reason |

#### 3.2.3 Bulk Operations
| Action | Description | Required Inputs |
|--------|-------------|-----------------|
| **Bulk Attendance** | Mark multiple students at once | Class, date, status list |
| **Bulk Photo Upload** | Add photos to existing album | Album, photos |
| **Bulk Message** | Message multiple parents | Recipient list, content |

### 3.3 Platform Help & Guidance

| Topic | Examples |
|-------|----------|
| **Feature Discovery** | "How do I create a new class?", "Where can I see payment history?" |
| **Navigation Help** | "Take me to the homework section", "Open class 5A details" |
| **Best Practices** | "What's the best way to organize photo albums?", "How often should I update progress reports?" |
| **Troubleshooting** | "Why can't I see the attendance button?", "My parent invite isn't working" |

---

## 4. Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌─────────────────┐       ┌─────────────────┐                  │
│  │  Mobile App     │       │  Web Dashboard   │                 │
│  │  (React Native) │       │  (Next.js)       │                 │
│  │                 │       │                  │                 │
│  │  ┌───────────┐  │       │  ┌───────────┐   │                 │
│  │  │ AI Chat   │  │       │  │ AI Chat   │   │                 │
│  │  │ Component │  │       │  │ Component │   │                 │
│  │  └───────────┘  │       │  └───────────┘   │                 │
│  └────────┬────────┘       └────────┬────────┘                  │
└───────────┼──────────────────────────┼──────────────────────────┘
            │                          │
            ▼                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SUPABASE EDGE FUNCTIONS                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    AI ORCHESTRATOR                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │   │
│  │  │ Intent     │  │ Context     │  │ Action      │       │   │
│  │  │ Classifier │→ │ Builder     │→ │ Executor    │       │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘       │   │
│  │         │                │                │              │   │
│  │         ▼                ▼                ▼              │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │               TOOL/FUNCTION REGISTRY               │ │   │
│  │  │  - getStudentAttendance()   - createAlbum()        │ │   │
│  │  │  - getClassRoster()         - sendAnnouncement()   │ │   │
│  │  │  - getPaymentStatus()       - markAttendance()     │ │   │
│  │  │  - searchStudents()         - uploadPhotos()       │ │   │
│  │  │  - ...30+ functions         - ...                  │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
            │                          │
            ▼                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                │
│  ┌─────────────────┐       ┌─────────────────┐                  │
│  │    Supabase     │       │    Airtable     │                  │
│  │  (Primary DB)   │       │  (Legacy/Sync)  │                  │
│  └─────────────────┘       └─────────────────┘                  │
│                                                                 │
│  ┌─────────────────────────────────────────┐                    │
│  │           Supabase Storage              │                    │
│  │    (Photos, Attachments, AI Files)      │                    │
│  └─────────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LLM PROVIDER                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  OpenAI GPT-4o / Claude 3.5 Sonnet (via API)                ││
│  │  - Function calling support                                  ││
│  │  - Streaming responses                                       ││
│  │  - Vision capabilities (for photo analysis)                  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Component Details

#### 4.2.1 AI Chat Component (Client)
- **Location**: 
  - Mobile: `src/components/ai/AIChatSheet.tsx`
  - Web: `apps/dashboard/components/ai/AIChatPanel.tsx`
- **Features**:
  - Floating action button (FAB) to open chat
  - Bottom sheet (mobile) / side panel (web)
  - Message history with persistence
  - Attachment support (images, files)
  - Voice input (optional v2)
  - Typing indicators
  - Rich message rendering (tables, cards, charts)

#### 4.2.2 AI Orchestrator (Supabase Edge Function)
- **Location**: `supabase/functions/ai-chat/`
- **Files**:
  ```
  supabase/functions/ai-chat/
  ├── index.ts           # Main endpoint (Deno)
  ├── orchestrator.ts    # Core logic
  ├── intent.ts          # Intent classification
  ├── context.ts         # Context building
  ├── executor.ts        # Action execution
  ├── prompts.ts         # System prompts
  └── tools/
      ├── attendance.ts
      ├── students.ts
      ├── albums.ts
      ├── announcements.ts
      ├── events.ts
      ├── homework.ts
      ├── messages.ts
      ├── health.ts
      ├── payments.ts
      └── navigation.ts
  ```

#### 4.2.3 Tool/Function Registry
Each tool follows a standard interface:

```typescript
interface AITool {
  name: string;
  description: string;
  parameters: JSONSchema;
  requiresConfirmation: boolean;
  permissions: UserRole[];
  execute: (params: any, context: AIContext) => Promise<AIToolResult>;
}

interface AIContext {
  userId: string;
  userRole: 'admin' | 'teacher' | 'parent';
  schoolId: string;
  language: 'en' | 'vi';
  childIds?: string[]; // For parents
  classIds?: string[]; // For teachers
}

interface AIToolResult {
  success: boolean;
  data?: any;
  message: string;
  displayType: 'text' | 'table' | 'card' | 'chart' | 'confirmation';
}
```

---

## 5. User Experience

### 5.1 Chat Interface

#### Mobile (Bottom Sheet)
```
┌─────────────────────────────────────┐
│ ═══════════  Tuto Assistant  [×]   │
├─────────────────────────────────────┤
│                                     │
│  👋 Hi! I'm your Tuto assistant.   │
│  How can I help you today?         │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ User: Show me Mung's          │  │
│  │ attendance for December       │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 📊 Mung's Attendance - Dec    │  │
│  │                               │  │
│  │ Present: 18 days (90%)        │  │
│  │ Absent: 1 day                 │  │
│  │ Late: 1 day                   │  │
│  │                               │  │
│  │ [View Details] [Export]       │  │
│  └───────────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│ [📎] Type a message...      [Send]  │
└─────────────────────────────────────┘
```

#### Web (Side Panel)
```
┌──────────────────────────────────────────────────────────────────────┐
│                         School Dashboard                              │
├──────────────────────────────────────────────────────────────────────┤
│                                               │  🤖 Tuto Assistant   │
│   [Dashboard Content]                         │ ──────────────────── │
│                                               │                      │
│   ┌─────────────────────────────────────┐     │  👋 How can I help?  │
│   │                                     │     │                      │
│   │         Main Content Area           │     │  ┌────────────────┐  │
│   │                                     │     │  │ You: Upload    │  │
│   │                                     │     │  │ photos to 5A   │  │
│   │                                     │     │  └────────────────┘  │
│   │                                     │     │                      │
│   │                                     │     │  📸 I'll create an   │
│   │                                     │     │  album for class 5A. │
│   │                                     │     │                      │
│   │                                     │     │  Album name?         │
│   │                                     │     │  [Field Day 2026]    │
│   │                                     │     │                      │
│   │                                     │     │  [Confirm] [Cancel]  │
│   │                                     │     │                      │
│   └─────────────────────────────────────┘     │ ──────────────────── │
│                                               │ [📎] Message... [➤]  │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.2 Interaction Patterns

#### 5.2.1 Simple Query
```
User: "How many students are in class 5A?"

AI: "Class 5A has 28 students enrolled.
     
     📊 Quick Stats:
     • Boys: 15
     • Girls: 13
     • New this term: 2
     
     Would you like me to show the full roster?"
```

#### 5.2.2 Action with Confirmation
```
User: "Send an announcement about tomorrow's holiday"

AI: "I'll help you create an announcement. Let me gather a few details:

     📢 Draft Announcement
     ─────────────────────
     Title: School Closed Tomorrow
     
     What message would you like to send?
     
     [Suggested: "Dear parents, please note that school will 
      be closed tomorrow, [Date], for the public holiday. 
      Classes will resume on [Date]."]
     
     [Edit Message] [Send to All Parents] [Cancel]"
```

#### 5.2.3 Photo Upload Task
```
User: [Attaches 5 photos] "Add these to a new album for class 5A's field trip"

AI: "I'll create a new photo album for class 5A.

     📸 New Album Preview
     ─────────────────────
     Title: Class 5A Field Trip
     Category: Outing
     Photos: 5 images
     Class: 5A
     Visibility: Class parents only
     
     ✓ Upload progress: ████████░░ 80%
     
     [Creating album...]"
     
AI: "✅ Done! Album 'Class 5A Field Trip' created with 5 photos.
     
     [View Album] [Add More Photos] [Share Link]"
```

#### 5.2.4 Complex Query
```
User: "Which students have been absent more than 3 times this month?"

AI: "I found 4 students with more than 3 absences in January:

     ┌─────────────────────────────────────────────────┐
     │ Student          │ Class │ Absences │ Status   │
     ├──────────────────┼───────┼──────────┼──────────┤
     │ Nguyen Van A     │ 3A    │ 5        │ Excused  │
     │ Tran Thi B       │ 5A    │ 4        │ Unexcused│
     │ Le Van C         │ 2B    │ 4        │ Medical  │
     │ Pham Thi D       │ 4A    │ 4        │ Excused  │
     └─────────────────────────────────────────────────┘
     
     Would you like me to:
     • Send a notification to their parents?
     • View detailed attendance for any student?
     • Export this list?"
```

### 5.3 Suggested Actions (Quick Buttons)

Based on user role and context, show smart suggestions:

**Admin Dashboard:**
- "📊 Today's attendance summary"
- "📢 Recent announcements"
- "💰 Pending payments"
- "📸 Upload photos"

**Parent View:**
- "📅 Upcoming events"
- "📝 My child's homework"
- "💊 Medicine schedule"
- "📞 Message teacher"

---

## 6. Security & Permissions

### 6.1 Role-Based Access Control

| Action | Admin | Teacher | Parent |
|--------|-------|---------|--------|
| View any student | ✅ | Own class only | Own child only |
| View attendance | ✅ | Own class | Own child |
| Create album | ✅ | ✅ | ❌ |
| Send announcement | ✅ | Own class | ❌ |
| View payments | ✅ | ❌ | Own payments |
| Create event | ✅ | ✅ | ❌ |
| Message anyone | ✅ | ✅ | Teachers only |
| Bulk operations | ✅ | Limited | ❌ |

### 6.2 Confirmation Requirements

Actions that modify data require explicit confirmation:

```typescript
const CONFIRMATION_REQUIRED = [
  'createAlbum',
  'sendAnnouncement',
  'createEvent',
  'deleteRecord',
  'bulkUpdate',
  'sendMessage',
];
```

### 6.3 Audit Logging

All AI actions are logged:

```typescript
interface AIAuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  schoolId: string;
  action: string;
  input: string; // User message
  toolsUsed: string[];
  result: 'success' | 'error' | 'cancelled';
  dataAccessed: string[]; // Table names
  dataModified?: {
    table: string;
    recordId: string;
    changes: Record<string, any>;
  }[];
}
```

---

## 7. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-3)
- [ ] Set up AI infrastructure in Supabase Edge Functions
- [ ] Create basic chat UI component (mobile + web)
- [ ] Implement 5 core READ tools:
  - `getStudentInfo`
  - `getAttendance`
  - `getClassRoster`
  - `getEvents`
  - `getAnnouncements`
- [ ] Basic conversation memory (session-based)

### Phase 2: Query Expansion (Weeks 4-6)
- [ ] Add 10 more READ tools:
  - `searchStudents`
  - `getHomework`
  - `getPayments`
  - `getAlbums`
  - `getMessages`
  - `getHealthRecords`
  - `getMedicineSchedule`
  - `getProgressReports`
  - `getDailyActivities`
  - `getTeachers`
- [ ] Rich response rendering (tables, cards, charts)
- [ ] Vietnamese language support

### Phase 3: Action Capabilities (Weeks 7-9)
- [ ] Implement WRITE tools with confirmation:
  - `createAlbum` (with photo upload)
  - `sendAnnouncement`
  - `createEvent`
  - `createHomework`
  - `sendMessage`
- [ ] File attachment handling
- [ ] Action confirmation UI

### Phase 4: Smart Features (Weeks 10-12)
- [ ] Platform help & documentation integration
- [ ] Navigation assistance ("take me to...")
- [ ] Proactive suggestions
- [ ] Conversation persistence
- [ ] Usage analytics

### Phase 5: Advanced (Future)
- [ ] Voice input/output
- [ ] Image recognition (photo tagging)
- [ ] Scheduled actions ("remind me to...")
- [ ] Multi-turn complex workflows
- [ ] Custom school-specific commands

---

## 8. Technical Specifications

### 8.1 API Endpoint

```typescript
// Supabase Edge Function
POST /functions/v1/ai-chat

// Request
{
  "message": "Show me Mung's attendance for December",
  "conversationId": "conv_abc123", // Optional, for history
  "attachments": [
    {
      "type": "image",
      "url": "https://...",
      "name": "photo1.jpg"
    }
  ],
  "context": {
    "currentScreen": "dashboard",
    "selectedClass": "class_5a_id"
  }
}

// Response (streaming)
{
  "id": "msg_xyz789",
  "conversationId": "conv_abc123",
  "content": "Here's Mung's attendance for December...",
  "toolCalls": [
    {
      "name": "getAttendance",
      "arguments": { "studentId": "...", "month": 12 },
      "result": { ... }
    }
  ],
  "displayType": "card",
  "displayData": {
    "type": "attendance_summary",
    "data": { ... }
  },
  "suggestedActions": [
    { "label": "View Details", "action": "navigate", "target": "/attendance/..." },
    { "label": "Export", "action": "export", "format": "pdf" }
  ]
}
```

### 8.2 Tool Definition Example

```typescript
// supabase/functions/ai-chat/tools/attendance.ts

export const getStudentAttendanceTool: AITool = {
  name: 'getStudentAttendance',
  description: 'Get attendance records for a specific student within a date range',
  parameters: {
    type: 'object',
    properties: {
      studentId: {
        type: 'string',
        description: 'The student ID or name to search for'
      },
      studentName: {
        type: 'string',
        description: 'Student name if ID not known'
      },
      startDate: {
        type: 'string',
        format: 'date',
        description: 'Start date (defaults to current month start)'
      },
      endDate: {
        type: 'string',
        format: 'date',
        description: 'End date (defaults to today)'
      }
    },
    required: []
  },
  requiresConfirmation: false,
  permissions: ['admin', 'teacher', 'parent'],
  
  async execute(params, context) {
    // Resolve student
    let studentId = params.studentId;
    if (!studentId && params.studentName) {
      studentId = await resolveStudentByName(params.studentName, context.schoolId);
    }
    
    // Check permissions
    if (context.userRole === 'parent') {
      if (!context.childIds?.includes(studentId)) {
        return {
          success: false,
          message: 'You can only view attendance for your own children.',
          displayType: 'text'
        };
      }
    }
    
    // Fetch data
    const attendance = await fetchAttendanceKPIs(
      context.schoolId,
      params.startDate || monthStart(),
      params.endDate || today(),
      null,
      studentId
    );
    
    const student = await getStudentById(studentId);
    
    return {
      success: true,
      data: { student, attendance },
      message: `${student.firstName}'s attendance: ${attendance.rate}% (${attendance.present} present, ${attendance.absent} absent)`,
      displayType: 'card'
    };
  }
};
```

### 8.3 System Prompt

```typescript
const SYSTEM_PROMPT = `You are Tuto Assistant, a helpful AI for school administration.

ROLE: Help ${userRole}s at ${schoolName} manage their school efficiently.

CAPABILITIES:
- Query student, class, and teacher information
- View and analyze attendance data
- Help with announcements and events
- Manage photo albums
- Answer questions about the platform

GUIDELINES:
1. Always verify you have the right student/class before showing data
2. For actions that modify data, ask for confirmation
3. If a user asks about a student by name and multiple matches exist, ask to clarify
4. Keep responses concise but complete
5. Use ${language === 'vi' ? 'Vietnamese' : 'English'} for responses
6. Format data in easy-to-read tables when appropriate
7. Suggest follow-up actions when relevant

CURRENT CONTEXT:
- School: ${schoolName}
- User Role: ${userRole}
- Language: ${language}
${userRole === 'parent' ? `- Your children: ${childNames.join(', ')}` : ''}
${userRole === 'teacher' ? `- Your classes: ${classNames.join(', ')}` : ''}

Remember: You can only access data the user is authorized to see based on their role.`;
```

---

## 9. Cost Estimation

### 9.1 LLM Costs (per school/month)

| Usage Tier | Est. Messages | Token Usage | Cost (GPT-4o) |
|------------|---------------|-------------|---------------|
| Light | 500 | ~250K | $2.50 |
| Medium | 2,000 | ~1M | $10.00 |
| Heavy | 5,000 | ~2.5M | $25.00 |

### 9.2 Optimization Strategies
- Cache common queries (e.g., class rosters)
- Use cheaper models for simple queries (GPT-3.5)
- Implement request throttling
- Precompute daily summaries

---

## 10. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Adoption Rate | 60% of admins use weekly | Analytics |
| Task Completion | 85% of requests succeed | Logs |
| Time Saved | 30% faster than manual | User survey |
| User Satisfaction | 4.5+ stars | In-app rating |
| Response Accuracy | 95%+ correct responses | Manual review |

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| LLM hallucination | Shows incorrect data | Ground responses in actual DB queries |
| Slow responses | Poor UX | Streaming, caching, async loading |
| Cost overrun | Budget issues | Rate limiting, tiered access |
| Privacy breach | Legal/trust issues | Strict RBAC, audit logging |
| Vietnamese accuracy | User confusion | Human review, feedback loop |

---

## 12. Open Questions

1. **LLM Provider**: OpenAI GPT-4o vs Anthropic Claude vs Google Gemini?
2. **Pricing Model**: Include in subscription or separate AI tier?
3. **Data Retention**: How long to keep conversation history?
4. **Offline Mode**: Queue messages when offline?
5. **Customization**: Allow schools to add custom commands?

---

## 13. Next Steps

1. **Review this document** - Get stakeholder feedback
2. **Technical spike** - Test LLM integration with 2-3 tools
3. **Design mockups** - Create detailed UI/UX designs
4. **Cost analysis** - Get actual LLM pricing for expected usage
5. **Prioritization** - Finalize Phase 1 scope

---

## Appendix A: Full Tool Registry

### READ Tools (Query)
| Tool | Description | Params |
|------|-------------|--------|
| `getStudentInfo` | Get student profile | studentId/name |
| `getStudentAttendance` | Attendance records | studentId, dateRange |
| `getClassRoster` | List students in class | classId |
| `getClassAttendance` | Class attendance summary | classId, dateRange |
| `searchStudents` | Find students by name | query |
| `getEvents` | List upcoming events | dateRange, type |
| `getAnnouncements` | Active announcements | category |
| `getAlbums` | Photo albums | classId, dateRange |
| `getHomework` | Homework assignments | classId, status |
| `getPaymentStatus` | Payment records | parentId/studentId |
| `getHealthRecords` | Medical records | studentId |
| `getMedicineSchedule` | Medicine reminders | studentId, date |
| `getProgressReports` | Academic progress | studentId, term |
| `getMessages` | Message threads | userId |
| `getDailyActivities` | Today's activities | classId, date |
| `getTeacherInfo` | Teacher profile | teacherId/name |
| `getSchoolKPIs` | Overview metrics | dateRange |

### WRITE Tools (Actions)
| Tool | Description | Confirmation |
|------|-------------|--------------|
| `createAlbum` | Create photo album | Yes |
| `addPhotosToAlbum` | Upload photos | Yes |
| `sendAnnouncement` | Publish announcement | Yes |
| `createEvent` | Schedule event | Yes |
| `createHomework` | Assign homework | Yes |
| `sendMessage` | Send message | Yes |
| `markAttendance` | Record attendance | Yes (bulk) |
| `logMedicine` | Record medicine | Yes |
| `updateStudentInfo` | Edit student | Yes |
| `cancelEvent` | Cancel event | Yes |

### NAVIGATION Tools
| Tool | Description |
|------|-------------|
| `navigateTo` | Open specific screen |
| `showHelp` | Show help for feature |
| `findFeature` | Locate a feature |

---

## Appendix B: Sample Conversations

### Scenario 1: Admin Checking Attendance
```
Admin: "How is attendance looking this week?"

AI: "Here's this week's attendance summary for Demo School:

📊 Weekly Attendance (Jan 6-10, 2026)
────────────────────────────────────
Overall Rate: 94.2%

By Day:
• Monday: 96% (12 absent)
• Tuesday: 95% (15 absent)
• Wednesday: 94% (18 absent)
• Thursday: 93% (21 absent)
• Friday: 92% (24 absent)

⚠️ Note: Friday had higher absences, possibly pre-weekend.

Would you like to see:
• [Classes with lowest attendance]
• [Students absent 2+ days]
• [Compare to last week]"
```

### Scenario 2: Photo Album Creation
```
Admin: [Attaches 12 photos]
"Create an album for the Lunar New Year celebration"

AI: "I'll create a Lunar New Year album! 🎊

📸 Album Preview
───────────────
Title: Lunar New Year Celebration 2026
Category: Celebration
Date: January 8, 2026
Photos: 12 images
Visibility: All parents

Is this correct?

[Create Album] [Change Title] [Change Settings] [Cancel]"

Admin: [Clicks Create Album]

AI: "⏳ Uploading photos... (3/12)
    ████████████░░░░░░░░ 25%"

AI: "✅ Album created successfully!

📸 Lunar New Year Celebration 2026
12 photos uploaded

Parents will be notified about the new album.

[View Album] [Add More Photos] [Share Link]"
```

### Scenario 3: Parent Asking About Child
```
Parent: "Did Minh submit his homework this week?"

AI: "Let me check Minh's homework submissions this week...

📝 Minh's Homework Status (This Week)
─────────────────────────────────────

✅ Math - Due Mon 6th - Submitted
✅ Vietnamese - Due Tue 7th - Submitted  
⏳ Science - Due Thu 9th - Not yet submitted
📋 English - Due Fri 10th - Not assigned yet

Summary: 2 of 3 submitted (67%)

Would you like me to:
• [View homework details]
• [Message the teacher]"
```

---

*Document Version: 1.0 - Draft for Review*

