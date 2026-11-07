import type { L, RecordField } from '../lib/types'

/**
 * Starter intervention library. PLACEHOLDER content: the team is preparing AEPS-3-inspired interventions;
 * replace these entries (and their domain links) when they're ready. Every intervention has a
 * "what / how / steps / what to record" structure and its own recording form.
 */
export interface InterventionTemplate {
  id: string
  emoji: string
  domains: string[] // ids from content/domains.ts
  title: L
  what: L
  how: L
  steps: L[]
  record: RecordField[]
  /** Optional in-app tool that helps carry it out. */
  tool?: 'routines'
}

const NOTES_FIELD: RecordField = { id: 'observations', kind: 'text', label: { en: 'Additional observations', hi: 'अतिरिक्त अवलोकन' } }
const MOOD_FIELD: RecordField = { id: 'mood', kind: 'mood', label: { en: 'Child’s mood during the activity', hi: 'गतिविधि के दौरान बच्चे का मूड' } }

export const INTERVENTIONS: InterventionTemplate[] = [
  {
    id: 'choice',
    emoji: '🍌',
    domains: ['expressive', 'receptive'],
    title: { en: 'Choice-making', hi: 'चुनाव करना (चॉइस-मेकिंग)' },
    what: {
      en: 'Offer the child two choices many times a day so they have a reason and a simple way to communicate.',
      hi: 'बच्चे को दिन में कई बार दो विकल्प दें ताकि उसे संवाद करने का कारण और आसान तरीका मिले।',
    },
    how: {
      en: 'Use snack time, play or dressing. Hold up two real items, name each one, and wait for any response — a look, point, sound or word.',
      hi: 'नाश्ते, खेल या कपड़े पहनने के समय करें। दो असली चीज़ें दिखाएँ, हर एक का नाम लें, और किसी भी प्रतिक्रिया — देखना, इशारा, आवाज़ या शब्द — का इंतज़ार करें।',
    },
    steps: [
      { en: 'Pick two items (one the child likes, one neutral to start).', hi: 'दो चीज़ें चुनें (शुरुआत में एक पसंदीदा, एक सामान्य)।' },
      { en: 'Hold them at the child’s eye level and name both: “Banana or biscuit?”', hi: 'उन्हें बच्चे की आँखों के स्तर पर रखें और दोनों का नाम लें: “केला या बिस्कुट?”' },
      { en: 'Wait 5–10 seconds without prompting.', hi: 'बिना संकेत दिए 5–10 सेकंड इंतज़ार करें।' },
      { en: 'Give the chosen item right away and name it again: “Banana!”', hi: 'चुनी हुई चीज़ तुरंत दें और उसका नाम फिर लें: “केला!”' },
    ],
    record: [
      { id: 'offered', kind: 'text', label: { en: 'Choices offered', hi: 'दिए गए विकल्प' } },
      { id: 'selected', kind: 'text', label: { en: 'What the child selected', hi: 'बच्चे ने क्या चुना' } },
      {
        id: 'response',
        kind: 'choice',
        label: { en: 'How the child responded', hi: 'बच्चे ने कैसे जवाब दिया' },
        options: [
          { value: 'word', label: { en: 'Said a word', hi: 'शब्द बोला' } },
          { value: 'point', label: { en: 'Pointed', hi: 'इशारा किया' } },
          { value: 'look', label: { en: 'Looked / reached', hi: 'देखा / हाथ बढ़ाया' } },
          { value: 'none', label: { en: 'No response', hi: 'कोई प्रतिक्रिया नहीं' } },
        ],
      },
      NOTES_FIELD,
    ],
  },
  {
    id: 'routine',
    emoji: '🖼️',
    domains: ['adaptive', 'emotional'],
    title: { en: 'Visual routine', hi: 'दृश्य दिनचर्या' },
    what: {
      en: 'A picture sequence of a daily routine so the child can predict what comes next and prepare for changes.',
      hi: 'दैनिक दिनचर्या का चित्र-क्रम ताकि बच्चा अगला कदम जान सके और बदलाव के लिए तैयार रहे।',
    },
    how: {
      en: 'Choose one routine (e.g. morning, going out). Build it in Visual routines with familiar pictures, show it before starting, and point to each step as you do it.',
      hi: 'एक दिनचर्या चुनें (जैसे सुबह, बाहर जाना)। दृश्य दिनचर्या में परिचित चित्रों से बनाएँ, शुरू करने से पहले दिखाएँ, और हर कदम करते समय उसकी ओर इशारा करें।',
    },
    steps: [
      { en: 'Pick the routine you want to work on.', hi: 'जिस दिनचर्या पर काम करना है, उसे चुनें।' },
      { en: 'Add familiar pictures in the right order (Visual routines page).', hi: 'सही क्रम में परिचित चित्र जोड़ें (दृश्य दिनचर्या पेज)।' },
      { en: 'Play the slideshow with the child before starting.', hi: 'शुरू करने से पहले बच्चे के साथ स्लाइडशो चलाएँ।' },
      { en: 'Go through the steps, pointing to each picture; praise at the end.', hi: 'हर चित्र की ओर इशारा करते हुए कदम पूरे करें; अंत में प्रशंसा करें।' },
    ],
    record: [
      { id: 'routineName', kind: 'text', label: { en: 'Routine used', hi: 'उपयोग की गई दिनचर्या' } },
      {
        id: 'completed',
        kind: 'choice',
        label: { en: 'Steps completed', hi: 'पूरे किए गए कदम' },
        options: [
          { value: 'all', label: { en: 'All', hi: 'सभी' } },
          { value: 'most', label: { en: 'Most', hi: 'अधिकतर' } },
          { value: 'few', label: { en: 'Few / none', hi: 'कुछ / कोई नहीं' } },
        ],
      },
      MOOD_FIELD,
      NOTES_FIELD,
    ],
    tool: 'routines',
  },
  {
    id: 'firstThen',
    emoji: '➡️',
    domains: ['emotional', 'adaptive', 'cognitive'],
    title: { en: 'First–Then', hi: 'पहले–फिर' },
    what: {
      en: 'Show “First (a task), then (something the child enjoys)” to make expectations clear and reduce resistance.',
      hi: '“पहले (काम), फिर (कुछ पसंदीदा)” दिखाकर अपेक्षाएँ साफ़ करें और विरोध कम करें।',
    },
    how: {
      en: 'Use two pictures or two words. Keep the “first” task short at the start and always deliver the “then”.',
      hi: 'दो चित्र या दो शब्द उपयोग करें। शुरुआत में “पहले” वाला काम छोटा रखें और “फिर” वाला हमेशा दें।',
    },
    steps: [
      { en: 'Choose a short task and a motivating reward.', hi: 'एक छोटा काम और एक प्रेरक इनाम चुनें।' },
      { en: 'Show or say: “First shoes, then park.”', hi: 'दिखाएँ या कहें: “पहले जूते, फिर पार्क।”' },
      { en: 'Help with the task if needed; point back to the board.', hi: 'ज़रूरत हो तो मदद करें; बोर्ड की ओर फिर इशारा करें।' },
      { en: 'Give the reward immediately when the task is done.', hi: 'काम पूरा होते ही तुरंत इनाम दें।' },
    ],
    record: [
      { id: 'task', kind: 'text', label: { en: 'First (task)', hi: 'पहले (काम)' } },
      { id: 'reward', kind: 'text', label: { en: 'Then (reward)', hi: 'फिर (इनाम)' } },
      { id: 'done', kind: 'yesno', label: { en: 'Did the child complete the task?', hi: 'क्या बच्चे ने काम पूरा किया?' } },
      MOOD_FIELD,
      NOTES_FIELD,
    ],
  },
  {
    id: 'oneStep',
    emoji: '☝️',
    domains: ['receptive', 'cognitive'],
    title: { en: 'One-step instructions', hi: 'एक-चरण निर्देश' },
    what: { en: 'Practise following short, single instructions with a visual cue.', hi: 'दृश्य संकेत के साथ छोटे, एक-चरण वाले निर्देशों का पालन करने का अभ्यास।' },
    how: {
      en: 'Get the child’s attention, give one short instruction with a gesture or picture, wait, then help only if needed.',
      hi: 'बच्चे का ध्यान लें, इशारे या चित्र के साथ एक छोटा निर्देश दें, इंतज़ार करें, फिर ज़रूरत हो तभी मदद करें।',
    },
    steps: [
      { en: 'Say the child’s name and wait for attention.', hi: 'बच्चे का नाम लें और ध्यान का इंतज़ार करें।' },
      { en: 'Give one instruction with a gesture: “Give me the ball.”', hi: 'इशारे के साथ एक निर्देश दें: “मुझे गेंद दो।”' },
      { en: 'Wait 5 seconds; if needed, show what to do.', hi: '5 सेकंड रुकें; ज़रूरत हो तो करके दिखाएँ।' },
      { en: 'Praise as soon as the child follows it.', hi: 'पालन करते ही प्रशंसा करें।' },
    ],
    record: [
      { id: 'instruction', kind: 'text', label: { en: 'Instruction given', hi: 'दिया गया निर्देश' } },
      {
        id: 'followed',
        kind: 'choice',
        label: { en: 'Did the child follow it?', hi: 'क्या बच्चे ने पालन किया?' },
        options: [
          { value: 'independent', label: { en: 'On their own', hi: 'स्वयं' } },
          { value: 'prompt', label: { en: 'With help', hi: 'मदद से' } },
          { value: 'no', label: { en: 'Not yet', hi: 'अभी नहीं' } },
        ],
      },
      NOTES_FIELD,
    ],
  },
  {
    id: 'turnTaking',
    emoji: '🎲',
    domains: ['social'],
    title: { en: 'Turn-taking play', hi: 'बारी-बारी खेल' },
    what: { en: 'Short games where the child and an adult (or sibling) take turns.', hi: 'छोटे खेल जिनमें बच्चा और कोई बड़ा (या भाई-बहन) बारी-बारी से खेलते हैं।' },
    how: {
      en: 'Use a simple activity like rolling a ball or stacking blocks. Say “my turn / your turn” every time.',
      hi: 'गेंद लुढ़काना या ब्लॉक जमाना जैसी आसान गतिविधि लें। हर बार “मेरी बारी / तुम्हारी बारी” कहें।',
    },
    steps: [
      { en: 'Pick a short activity the child enjoys.', hi: 'बच्चे की पसंद की छोटी गतिविधि चुनें।' },
      { en: 'Take the first turn and say “my turn”.', hi: 'पहली बारी लें और कहें “मेरी बारी”।' },
      { en: 'Hand over and say “your turn”; wait.', hi: 'सौंपें और कहें “तुम्हारी बारी”; इंतज़ार करें।' },
      { en: 'Repeat for a few rounds; stop before the child gets bored.', hi: 'कुछ बार दोहराएँ; बच्चे के ऊबने से पहले रोकें।' },
    ],
    record: [
      { id: 'activity', kind: 'text', label: { en: 'Activity', hi: 'गतिविधि' } },
      { id: 'turns', kind: 'number', label: { en: 'Number of turns taken', hi: 'ली गई बारियों की संख्या' } },
      MOOD_FIELD,
      NOTES_FIELD,
    ],
  },
  {
    id: 'calmCorner',
    emoji: '🧘',
    domains: ['emotional'],
    title: { en: 'Calm-down routine', hi: 'शांत होने की दिनचर्या' },
    what: { en: 'A fixed, practised way to calm down: a quiet corner, a comfort object and slow breathing.', hi: 'शांत होने का तय, अभ्यास किया हुआ तरीका: शांत कोना, आराम देने वाली चीज़ और धीमी साँस।' },
    how: {
      en: 'Practise when the child is calm first. During distress, guide them to the corner with few words and stay nearby.',
      hi: 'पहले शांत समय में अभ्यास करें। परेशानी में कम शब्दों के साथ कोने तक ले जाएँ और पास रहें।',
    },
    steps: [
      { en: 'Set up a quiet corner with a soft object.', hi: 'मुलायम चीज़ के साथ एक शांत कोना बनाएँ।' },
      { en: 'Practise going there and breathing slowly when calm.', hi: 'शांत समय में वहाँ जाने और धीरे साँस लेने का अभ्यास करें।' },
      { en: 'When upset, say “calm corner” and guide gently.', hi: 'परेशान होने पर “शांत कोना” कहें और धीरे से ले जाएँ।' },
      { en: 'Praise calm behaviour afterwards.', hi: 'बाद में शांत व्यवहार की प्रशंसा करें।' },
    ],
    record: [
      { id: 'used', kind: 'yesno', label: { en: 'Was the calm-down routine used today?', hi: 'क्या आज शांत होने की दिनचर्या उपयोग हुई?' } },
      { id: 'minutes', kind: 'number', label: { en: 'Minutes to calm down', hi: 'शांत होने में लगे मिनट' } },
      NOTES_FIELD,
    ],
  },
  {
    id: 'handSkills',
    emoji: '✋',
    domains: ['fineMotor'],
    title: { en: 'Hand-skills play', hi: 'हाथ के कौशल वाले खेल' },
    what: { en: 'Daily play that builds finger strength and control.', hi: 'रोज़ के खेल जो उंगलियों की ताकत और नियंत्रण बढ़ाते हैं।' },
    how: { en: 'Choose one activity for 5–10 minutes: playdough, bead threading, pegboards or tracing.', hi: '5–10 मिनट के लिए एक गतिविधि चुनें: आटा/मिट्टी, मोती पिरोना, पेगबोर्ड या ट्रेसिंग।' },
    steps: [
      { en: 'Sit at a table with the material ready.', hi: 'सामान तैयार रखकर मेज़ पर बैठें।' },
      { en: 'Show the action once.', hi: 'एक बार करके दिखाएँ।' },
      { en: 'Let the child try; help hand-over-hand only if needed.', hi: 'बच्चे को कोशिश करने दें; ज़रूरत हो तभी हाथ पकड़कर मदद करें।' },
      { en: 'Stop while it’s still fun.', hi: 'मज़ा रहते ही रोक दें।' },
    ],
    record: [
      {
        id: 'activity',
        kind: 'choice',
        label: { en: 'Activity', hi: 'गतिविधि' },
        options: [
          { value: 'playdough', label: { en: 'Playdough', hi: 'आटा / मिट्टी' } },
          { value: 'beads', label: { en: 'Beads', hi: 'मोती' } },
          { value: 'pegboard', label: { en: 'Pegboard', hi: 'पेगबोर्ड' } },
          { value: 'tracing', label: { en: 'Tracing', hi: 'ट्रेसिंग' } },
          { value: 'other', label: { en: 'Other', hi: 'अन्य' } },
        ],
      },
      { id: 'minutes', kind: 'number', label: { en: 'Minutes', hi: 'मिनट' } },
      NOTES_FIELD,
    ],
  },
  {
    id: 'movement',
    emoji: '🏃',
    domains: ['grossMotor'],
    title: { en: 'Movement & obstacle play', hi: 'चलने-फिरने और बाधा वाले खेल' },
    what: { en: 'Short active play that builds balance and coordination.', hi: 'छोटे सक्रिय खेल जो संतुलन और तालमेल बढ़ाते हैं।' },
    how: { en: 'Set up a simple course with cushions, a line to walk on and something to jump over.', hi: 'तकिए, चलने के लिए एक रेखा और कूदने की चीज़ से आसान कोर्स बनाएँ।' },
    steps: [
      { en: 'Set up 3–4 stations.', hi: '3–4 स्टेशन बनाएँ।' },
      { en: 'Show the course once.', hi: 'एक बार कोर्स करके दिखाएँ।' },
      { en: 'Let the child go through it; cheer each station.', hi: 'बच्चे को करने दें; हर स्टेशन पर उत्साह बढ़ाएँ।' },
      { en: 'Repeat 3–5 times.', hi: '3–5 बार दोहराएँ।' },
    ],
    record: [
      { id: 'activity', kind: 'text', label: { en: 'Activity', hi: 'गतिविधि' } },
      { id: 'minutes', kind: 'number', label: { en: 'Minutes', hi: 'मिनट' } },
      NOTES_FIELD,
    ],
  },
  {
    id: 'sharedReading',
    emoji: '📚',
    domains: ['literacy', 'expressive'],
    title: { en: 'Shared picture reading', hi: 'साथ बैठकर चित्र-पुस्तक पढ़ना' },
    what: { en: 'Reading a picture book together and naming, pointing and pausing for the child.', hi: 'साथ में चित्र-पुस्तक पढ़ना, नाम लेना, इशारा करना और बच्चे के लिए रुकना।' },
    how: { en: 'Let the child choose the book. Point to pictures, name them, and pause so the child can fill in.', hi: 'किताब बच्चे को चुनने दें। चित्रों की ओर इशारा करें, नाम लें, और रुकें ताकि बच्चा पूरा करे।' },
    steps: [
      { en: 'Sit side by side with the book.', hi: 'किताब लेकर साथ बैठें।' },
      { en: 'Point and name pictures.', hi: 'चित्रों की ओर इशारा करें और नाम लें।' },
      { en: 'Pause and wait for the child to point or say something.', hi: 'रुकें और बच्चे के इशारे या बोलने का इंतज़ार करें।' },
      { en: 'Repeat favourite books often.', hi: 'पसंदीदा किताबें बार-बार पढ़ें।' },
    ],
    record: [
      { id: 'book', kind: 'text', label: { en: 'Book', hi: 'किताब' } },
      {
        id: 'engagement',
        kind: 'choice',
        label: { en: 'Engagement', hi: 'जुड़ाव' },
        options: [
          { value: 'high', label: { en: 'High', hi: 'अधिक' } },
          { value: 'mid', label: { en: 'Some', hi: 'कुछ' } },
          { value: 'low', label: { en: 'Low', hi: 'कम' } },
        ],
      },
      NOTES_FIELD,
    ],
  },
  {
    id: 'counting',
    emoji: '🔢',
    domains: ['numeracy'],
    title: { en: 'Everyday counting', hi: 'रोज़मर्रा की गिनती' },
    what: { en: 'Counting real things during daily routines.', hi: 'रोज़ की दिनचर्या में असली चीज़ें गिनना।' },
    how: { en: 'Count stairs, spoons, buttons or toys together, touching each one.', hi: 'सीढ़ियाँ, चम्मच, बटन या खिलौने साथ गिनें, हर एक को छूते हुए।' },
    steps: [
      { en: 'Pick objects that are already part of the routine.', hi: 'दिनचर्या में पहले से मौजूद चीज़ें चुनें।' },
      { en: 'Touch and count each one aloud together.', hi: 'हर एक को छूकर साथ में ज़ोर से गिनें।' },
      { en: 'Ask “how many?” at the end.', hi: 'अंत में पूछें “कितने?”' },
    ],
    record: [
      { id: 'activity', kind: 'text', label: { en: 'What was counted', hi: 'क्या गिना' } },
      { id: 'upTo', kind: 'number', label: { en: 'Counted up to', hi: 'कहाँ तक गिना' } },
      NOTES_FIELD,
    ],
  },
]

export const INTERVENTION_BY_ID = Object.fromEntries(INTERVENTIONS.map((i) => [i.id, i]))

export function interventionsForDomain(domainId: string): InterventionTemplate[] {
  return INTERVENTIONS.filter((i) => i.domains.includes(domainId))
}

/** Fields used when the family writes their own intervention. */
export const CUSTOM_RECORD: RecordField[] = [
  { id: 'done', kind: 'yesno', label: { en: 'Did you do it today?', hi: 'क्या आज किया?' } },
  { ...MOOD_FIELD },
  { ...NOTES_FIELD },
]
