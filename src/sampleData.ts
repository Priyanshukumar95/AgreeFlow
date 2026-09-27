import { AnalysisData } from './types';

export const INITIAL_SAMPLE_NOTES = `Weekly Product & Engineering Sync - October 24
Attendees: Dave (Eng), Sarah (Legal), Marcus (Backend), Maya (Product)

Discussion points:
- Dave agreed that we will definitively ship the Stripe billing migration by next Friday. Marcus is heading the migration scripts.
- Maya suggested offering a 14-day grace extension for grandfathered tier accounts. Team generally liked this idea.
- Sarah asked: "Do we have formal legal sign-off on the revised terms of service for German customers?" Dave wasn't sure.
- Action: Marcus to complete API mock test suite by Wednesday 5 PM.
- Security QA penetration test is scheduled for Tuesday, but no single point of contact has claimed ownership yet. Need someone to facilitate credentials.
- We agreed to deprecate legacy PayPal direct integrations for EU users before the end of the month.
- What if we also evaluate unified dark-mode design tokens before kicking off the mobile app sprint?
- Should staging Datadog logs retain for 30 or 90 days?`;

export const INITIAL_ANALYSIS_DATA: AnalysisData = {
  title: 'Q3 Product & Billing Sync',
  wordCount: 480,
  rawNotes: INITIAL_SAMPLE_NOTES,
  analyzedAt: '14m ago',
  decisions: [
    {
      id: 'DEC-01',
      text: 'Migrate billing checkout directly to Stripe Elements v3 before end of current month',
      source_sentence: 'Dave agreed that we will definitively ship the Stripe billing migration by next Friday.',
      speaker: 'Sarah Chen (VP Prod)',
      timestamp: 'Line 14 / 00:08:22',
    },
    {
      id: 'DEC-02',
      text: 'Deprecate legacy PayPal direct integrations for EU users before end of month',
      source_sentence: 'We agreed to deprecate legacy PayPal direct integrations for EU users before the end of the month.',
      speaker: 'Finance & Marcus',
      timestamp: 'Line 22 / 00:14:10',
    },
    {
      id: 'DEC-03',
      text: 'Engineering deployment freeze begins August 28 across all payment services',
      source_sentence: 'Confirmed by Product & CRO that all migrations must hit staging 10 days prior.',
      speaker: 'Dave (Eng)',
      timestamp: 'Line 31 / 00:19:40',
    },
  ],
  suggestions: [
    {
      id: 'SUG-01',
      text: 'Offer 14-day grace extension for grandfathered tier accounts during migration',
      source_sentence: 'Maya suggested offering a 14-day grace extension for grandfathered tier accounts. Team generally liked this idea.',
      speaker: 'Maya (Product)',
      timestamp: 'Line 18 / 00:11:05',
    },
    {
      id: 'SUG-02',
      text: 'Evaluate unified dark-mode design tokens before initiating mobile app sprint',
      source_sentence: 'What if we also evaluate unified dark-mode design tokens before kicking off the mobile app sprint?',
      speaker: 'Elena Rostova',
      timestamp: 'Line 28 / 00:15:40',
    },
  ],
  open_questions: [
    {
      id: 'QUE-01',
      text: 'Do we have formal legal sign-off on revised EEA customer terms?',
      source_sentence: 'Sarah asked: "Do we have formal legal sign-off on the revised terms of service for German customers?" Dave wasn\'t sure.',
      speaker: 'Sarah (Legal)',
      timestamp: 'Line 20 / 00:12:30',
      resolved: false,
    },
    {
      id: 'QUE-02',
      text: 'Who approves refund webhook SLA exceptions for enterprise clients?',
      source_sentence: 'Who approves refund webhook SLA exceptions?',
      speaker: 'Marcus K.',
      timestamp: 'Line 25 / 00:16:15',
      resolved: false,
    },
    {
      id: 'QUE-03',
      text: 'Should staging Datadog logs retain for 30 or 90 days?',
      source_sentence: 'Should staging Datadog logs retain for 30 or 90 days?',
      speaker: 'DevOps inquiry',
      timestamp: 'Line 35 / 00:22:50',
      resolved: false,
    },
  ],
  action_items: [
    {
      id: 'ACT-01',
      task: 'Migrate checkout flow to Stripe Elements v3',
      owner: 'Marcus K.',
      deadline: 'Aug 18',
      owner_missing: false,
      deadline_missing: false,
      source_sentence: 'I will own the Stripe Elements checkout migration and have it ready for staging by August 18.',
      speaker: 'Marcus K.',
      timestamp: 'Line 15 / 00:14:22',
      completed: false,
    },
    {
      id: 'ACT-02',
      task: 'Update legal terms of service for annual billing',
      owner: null,
      deadline: 'Aug 25',
      owner_missing: true,
      deadline_missing: false,
      source_sentence: 'We definitely need legal to update terms for annual plans, who can take that?',
      speaker: 'Meeting Transcript',
      timestamp: 'Line 42 / 00:28:05',
      completed: false,
    },
    {
      id: 'ACT-03',
      task: 'Configure webhook retry alerts in Datadog',
      owner: 'Elena R.',
      deadline: null,
      owner_missing: false,
      deadline_missing: true,
      source_sentence: 'Elena mentioned setting up Datadog alerts when she gets some free cycles.',
      speaker: 'Elena R.',
      timestamp: 'Line 49 / 00:32:10',
      completed: false,
    },
    {
      id: 'ACT-04',
      task: 'Send sync recording and transcript to executive stakeholders',
      owner: 'David C.',
      deadline: 'Today, 5:00 PM',
      owner_missing: false,
      deadline_missing: false,
      source_sentence: 'David: I\'ll blast the recording to the exec channel right after.',
      speaker: 'David C.',
      timestamp: 'Line 55 / 00:44:50',
      completed: false,
    },
  ],
};

export const TEAM_MEMBERS = [
  { name: 'Marcus K.', initials: 'MK', color: 'bg-[#3525cd]' },
  { name: 'Elena R.', initials: 'ER', color: 'bg-[#4b4dd8]' },
  { name: 'David C.', initials: 'DC', color: 'bg-[#565e74]' },
  { name: 'Sarah M.', initials: 'SM', color: 'bg-[#3130c0]' },
  { name: 'Priyanshu P.', initials: 'PP', color: 'bg-[#0f0069]' },
  { name: 'Maya S.', initials: 'MS', color: 'bg-[#4f46e5]' },
];

export const WORKSPACES = [
  'Q3 Sync',
  'Core Sprint 42',
  'Payment & Billing Team',
  'Mobile App Alpha',
];
