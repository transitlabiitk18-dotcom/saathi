import type { EntryType, L } from '../lib/types'

export type Question =
  | { id: string; kind: 'mood'; label: L; allowNA?: L }
  | { id: string; kind: 'choice'; label: L; options: { value: string; label: L }[] }
  | { id: string; kind: 'time'; label: L }
  | { id: string; kind: 'yesno'; label: L; detailsLabel?: L; /** which answer opens the details box (default: yes) */ detailsOn?: boolean }
  | { id: string; kind: 'text'; label: L; placeholder?: L }

export const MOODS: { value: number; emoji: string; label: L }[] = [
  { value: 1, emoji: '😣', label: { en: 'Very upset', hi: 'बहुत परेशान' } },
  { value: 2, emoji: '🙁', label: { en: 'Upset', hi: 'परेशान' } },
  { value: 3, emoji: '😐', label: { en: 'Okay', hi: 'ठीक-ठाक' } },
  { value: 4, emoji: '🙂', label: { en: 'Good', hi: 'अच्छा' } },
  { value: 5, emoji: '😄', label: { en: 'Very happy', hi: 'बहुत खुश' } },
]

const NOTES: Question = {
  id: 'notes',
  kind: 'text',
  label: { en: 'Anything else you noticed?', hi: 'कुछ और जो आपने देखा?' },
  placeholder: { en: 'Free text — write anything relevant', hi: 'कुछ भी लिखें जो ज़रूरी लगे' },
}

export const QUALITY_SCORE: Record<string, number> = { poor: 1, fair: 2, good: 3 }
export const APPETITE_SCORE: Record<string, number> = { poor: 1, less: 2, normal: 3, more: 4 }

/** Daily tracking sections (one entry per contributor per day). Incidents are recorded separately. */
export const TRACKERS: Record<EntryType, { emoji: string; title: L; subtitle: L; questions: Question[] }> = {
  sleep: {
    emoji: '🌙',
    title: { en: 'Sleep', hi: 'नींद' },
    subtitle: { en: 'Last night’s sleep', hi: 'पिछली रात की नींद' },
    questions: [
      { id: 'sleepTime', kind: 'time', label: { en: 'What time did the child fall asleep?', hi: 'बच्चा किस समय सोया?' } },
      { id: 'wakeTime', kind: 'time', label: { en: 'What time did the child wake up?', hi: 'बच्चा किस समय जागा?' } },
      {
        id: 'quality',
        kind: 'choice',
        label: { en: 'How was the sleep quality?', hi: 'नींद कैसी रही?' },
        options: [
          { value: 'good', label: { en: 'Good', hi: 'अच्छी' } },
          { value: 'fair', label: { en: 'Fair', hi: 'ठीक-ठाक' } },
          { value: 'poor', label: { en: 'Poor', hi: 'खराब' } },
        ],
      },
      {
        id: 'difficultyFalling',
        kind: 'yesno',
        label: { en: 'Did the child have difficulty falling asleep?', hi: 'क्या बच्चे को सोने में कठिनाई हुई?' },
        detailsLabel: { en: 'What happened?', hi: 'क्या हुआ?' },
      },
      {
        id: 'nightWaking',
        kind: 'yesno',
        label: { en: 'Did the child wake up during the night?', hi: 'क्या बच्चा रात में जागा?' },
        detailsLabel: { en: 'How many times / for how long?', hi: 'कितनी बार / कितनी देर?' },
      },
      { id: 'moodBeforeSleep', kind: 'mood', label: { en: 'How was the child’s mood before going to sleep?', hi: 'सोने से पहले बच्चे का मूड कैसा था?' } },
      { id: 'moodAfterWaking', kind: 'mood', label: { en: 'How was the child’s mood after waking up?', hi: 'जागने के बाद बच्चे का मूड कैसा था?' } },
      NOTES,
    ],
  },
  mood: {
    emoji: '🌤️',
    title: { en: 'Mood', hi: 'मूड' },
    subtitle: { en: 'Overall mood today', hi: 'आज का कुल मूड' },
    questions: [
      { id: 'overallMood', kind: 'mood', label: { en: 'What was the child’s overall mood today?', hi: 'आज बच्चे का कुल मिलाकर मूड कैसा था?' } },
      {
        id: 'outburst',
        kind: 'yesno',
        label: { en: 'Was there any outburst or meltdown?', hi: 'क्या कोई गुस्सा/रोने का दौरा पड़ा?' },
        detailsLabel: { en: 'Describe briefly (or log it as an incident)', hi: 'संक्षेप में बताएँ (या घटना के रूप में दर्ज करें)' },
      },
      {
        id: 'trigger',
        kind: 'yesno',
        label: { en: 'Did any specific event trigger the child today?', hi: 'क्या आज किसी खास घटना ने बच्चे को परेशान किया?' },
        detailsLabel: { en: 'What was it?', hi: 'वह क्या था?' },
      },
      {
        id: 'regulation',
        kind: 'yesno',
        label: { en: 'Did you do anything to help regulate the child’s behaviour?', hi: 'क्या आपने बच्चे के व्यवहार को शांत करने के लिए कुछ किया?' },
        detailsLabel: { en: 'What did you do, and did it help?', hi: 'आपने क्या किया, और क्या इससे मदद मिली?' },
      },
      {
        id: 'moodBeforeCentre',
        kind: 'mood',
        label: { en: 'Mood before going to the centre/school', hi: 'केंद्र/स्कूल जाने से पहले का मूड' },
        allowNA: { en: 'Did not go today / not applicable', hi: 'आज नहीं गया / लागू नहीं' },
      },
      {
        id: 'moodAfterCentre',
        kind: 'mood',
        label: { en: 'Mood after coming back from the centre/school', hi: 'केंद्र/स्कूल से लौटने के बाद का मूड' },
        allowNA: { en: 'Did not go today / not applicable', hi: 'आज नहीं गया / लागू नहीं' },
      },
      {
        id: 'unusual',
        kind: 'text',
        label: { en: 'Observations — anything unusual today?', hi: 'अवलोकन — आज कुछ असामान्य?' },
        placeholder: { en: 'Free text', hi: 'खुला उत्तर' },
      },
    ],
  },
  appetite: {
    emoji: '🍎',
    title: { en: 'Appetite', hi: 'भूख / भोजन' },
    subtitle: { en: 'Eating today', hi: 'आज का खाना' },
    questions: [
      {
        id: 'appetite',
        kind: 'choice',
        label: { en: 'How was the child’s overall appetite today?', hi: 'आज बच्चे की कुल भूख कैसी थी?' },
        options: [
          { value: 'poor', label: { en: 'Poor', hi: 'बहुत कम' } },
          { value: 'less', label: { en: 'Less than usual', hi: 'सामान्य से कम' } },
          { value: 'normal', label: { en: 'Normal', hi: 'सामान्य' } },
          { value: 'more', label: { en: 'More than usual', hi: 'सामान्य से अधिक' } },
        ],
      },
      {
        id: 'patternChange',
        kind: 'yesno',
        label: { en: 'Any change in eating patterns?', hi: 'क्या खाने के तरीके में कोई बदलाव हुआ?' },
        detailsLabel: { en: 'What changed?', hi: 'क्या बदला?' },
      },
      {
        id: 'refusal',
        kind: 'yesno',
        label: { en: 'Did the child refuse any food?', hi: 'क्या बच्चे ने कोई खाना खाने से मना किया?' },
        detailsLabel: { en: 'Which food?', hi: 'कौन-सा खाना?' },
      },
      {
        id: 'allMeals',
        kind: 'yesno',
        label: { en: 'Did the child eat all meals properly today?', hi: 'क्या आज बच्चे ने सभी भोजन ठीक से खाए?' },
        detailsLabel: { en: 'Which meal was missed or not finished?', hi: 'कौन-सा भोजन छूटा या पूरा नहीं हुआ?' },
        detailsOn: false,
      },
      { id: 'mealMood', kind: 'mood', label: { en: 'How was the child’s mood during meal times?', hi: 'भोजन के समय बच्चे का मूड कैसा था?' } },
      NOTES,
    ],
  },
}

export const TRACKER_TYPES: EntryType[] = ['sleep', 'mood', 'appetite']

export const SEVERITY: { value: 'mild' | 'moderate' | 'severe'; label: L; cls: string }[] = [
  { value: 'mild', label: { en: 'Mild', hi: 'हल्का' }, cls: 'bg-sky-50 text-sky-700 ring-sky-200' },
  { value: 'moderate', label: { en: 'Moderate', hi: 'मध्यम' }, cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
  { value: 'severe', label: { en: 'Severe', hi: 'गंभीर' }, cls: 'bg-rose-50 text-rose-700 ring-rose-200' },
]
