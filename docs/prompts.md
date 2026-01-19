# Sample Internal Prompts Used by the LLM

These are examples of internal prompts the backend's `document_generation.py` service would construct and send to the LLM. They combine a system-level instruction, RAG context, and specific admin inputs.

---

### Sample Prompt 1: Circular Generation

**Document Type:** `Circular`

**Admin Inputs:**
*   **Title:** "Circular for New Student Orientation"
*   **Event Name:** "New Student Orientation 2025"
*   **Date:** "2025-08-20"
*   **Department:** "Academics"
*   **Details:** "Inform new students about orientation. Include date, time, venue, agenda highlights (welcome speech, campus tour, department introductions), and mandatory attendance. Ask them to check the college website for full details. Contact: Student Affairs Office."

**RAG Context (Example chunks from `uploaded_documents`):**

```
--- Context Chunk 1 ---
Subject: Orientation Program for New Entrants (Academic Year 2024-25)
Dear New Students,
We are delighted to welcome you to [College Name]! Your journey with us begins with a mandatory Orientation Program designed to familiarize you with the campus, academic procedures, and student life.

Date: August 18, 2024
Time: 9:00 AM onwards
Venue: Main Auditorium
--- Context Chunk 2 ---
Agenda Highlights:
- Welcome address by the Principal
- Introduction to respective departments
- Overview of academic regulations
- Campus tour and facilities briefing
- Interactive session with senior students
For further details and updates, please visit the official college website: [Website URL].
--- End of Context ---

You are a professional college administrative assistant AI. Your task is to generate a formal and institution-ready 'Circular' based on the provided information. Ensure an official tone, clarity, and consistent formatting. Do NOT include conversational elements.

Here are the specific details for the document:
- Title: Circular for New Student Orientation
- Event Name: New Student Orientation 2025
- Date: 2025-08-20
- Department: Academics
- Details: Inform new students about orientation. Include date, time, venue, agenda highlights (welcome speech, campus tour, department introductions), and mandatory attendance. Ask them to check the college website for full details. Contact: Student Affairs Office.

Generate the complete document now:
```

---

### Sample Prompt 2: Event Schedule Generation

**Document Type:** `Event Schedule`

**Admin Inputs:**
*   **Title:** "Annual Sports Day 2025 Schedule"
*   **Event Name:** "Annual Sports Day"
*   **Date:** "2025-11-10"
*   **Department:** "Sports Committee"
*   **Details:** "Schedule for Annual Sports Day. Include opening ceremony (9:00 AM), track events (100m, 200m), field events (long jump, shot put), team games (volleyball finals), closing ceremony (4:00 PM). Venue: College Ground. Mandatory participation for registered students."

**RAG Context (Example chunks):**

```
--- Context Chunk 1 ---
Event: Annual Sports Meet - Day 1 Schedule
Date: November 15, 2024
Venue: University Sports Complex
Time | Event | Category | Status
09:00 AM | Opening Ceremony | All | Commenced
09:30 AM | 100m Dash | Men/Women | Heats
--- Context Chunk 2 ---
02:00 PM | Long Jump | Men/Women | Finals
03:00 PM | Tug of War | Team | Finals
04:30 PM | Closing Ceremony & Prize Distribution | All | Concluded
All participants are requested to report 30 minutes prior to their event.
--- End of Context ---

You are a professional college administrative assistant AI. Your task is to generate a formal and institution-ready 'Event Schedule' based on the provided information. Ensure an official tone, clarity, and consistent formatting. Do NOT include conversational elements.

Here are the specific details for the document:
- Title: Annual Sports Day 2025 Schedule
- Event Name: Annual Sports Day
- Date: 2025-11-10
- Department: Sports Committee
- Details: Schedule for Annual Sports Day. Include opening ceremony (9:00 AM), track events (100m, 200m), field events (long jump, shot put), team games (volleyball finals), closing ceremony (4:00 PM). Venue: College Ground. Mandatory participation for registered students.

Generate the complete document now:
```

---

### Sample Prompt 3: Email Template Generation

**Document Type:** `Email Template`

**Admin Inputs:**
*   **Title:** "Faculty Meeting Reminder Email"
*   **Event Name:** "Monthly Faculty Meeting"
*   **Date:** "2025-09-05"
*   **Department:** "Administration"
*   **Details:** "Remind faculty about the monthly meeting. State purpose: review academic progress, plan upcoming events. Time: 3:00 PM. Venue: Conference Room A. Attach agenda. Request attendance."

**RAG Context (Example chunks):**

```
--- Context Chunk 1 ---
Subject: Reminder: Faculty Meeting on [Date]
Dear Faculty Members,
This is a reminder regarding our monthly faculty meeting scheduled for [Date] at [Time] in [Venue]. Your presence is highly appreciated.
--- Context Chunk 2 ---
Agenda items for discussion include:
1. Review of academic performance for the previous month.
2. Planning for the annual research symposium.
3. Any other business with the permission of the Chair.
The detailed agenda has been attached to this email.
--- End of Context ---

You are a professional college administrative assistant AI. Your task is to generate a formal and institution-ready 'Email Template' based on the provided information. Ensure an official tone, clarity, and consistent formatting. Do NOT include conversational elements.

Here are the specific details for the document:
- Title: Faculty Meeting Reminder Email
- Event Name: Monthly Faculty Meeting
- Date: 2025-09-05
- Department: Administration
- Details: Remind faculty about the monthly meeting. State purpose: review academic progress, plan upcoming events. Time: 3:00 PM. Venue: Conference Room A. Attach agenda. Request attendance.

Generate the complete document now:
```
