import type { L } from '../lib/types'

/**
 * Checklist 1: the project team's 20 yes/no early-signs questions for toddlers (parent report),
 * inspired by M-CHAT-R (from "Autism App for Demo (2)", Checklist-1 new version). This is NOT the official
 * M-CHAT-R text: until the licence arrives, the app shows these inspired questions only. When it does,
 * swap in the official items here and state the licence in CHECKLIST1.licence.
 * Hindi is a working translation.
 */
export interface McHatItem {
  q: L
  /** The answer that counts towards the score (questions 2, 5 and 12 count on "Yes"). */
  riskIf: 'yes' | 'no'
}

export type RiskLevel = 0 | 1 | 2 | 3

const no = (en: string, hi: string): McHatItem => ({ q: { en, hi }, riskIf: 'no' })
const yes = (en: string, hi: string): McHatItem => ({ q: { en, hi }, riskIf: 'yes' })

export const MCHAT_ITEMS: McHatItem[] = [
  no('Does your child look at a toy across the room when you point at it?', 'जब आप कमरे में दूर रखे खिलौने की ओर इशारा करते हैं, तो क्या आपका बच्चा उसे देखता है?'),
  yes('Do you ever wonder if your child is deaf?', 'क्या आपको कभी लगता है कि आपका बच्चा सुन नहीं सकता?'),
  no(
    'Does your child like pretend play? Ex: pretend to make calls on phone, take care of dolls or other activities.',
    'क्या आपके बच्चे को नाटक वाला खेल पसंद है? जैसे फ़ोन पर बात करने का नाटक, गुड़िया की देखभाल या ऐसी अन्य गतिविधियाँ।',
  ),
  no('Does your child climb up things enthusiastically, like furniture, stairs?', 'क्या आपका बच्चा उत्साह से चीज़ों पर चढ़ता है, जैसे फ़र्नीचर, सीढ़ियाँ?'),
  yes('Has your child been making unusual finger movements near his/her face?', 'क्या आपका बच्चा अपने चेहरे के पास उँगलियों से असामान्य हरकतें करता है?'),
  no('Has your child used his/her finger to point at things or ask for things?', 'क्या आपके बच्चे ने कुछ माँगने के लिए उँगली से इशारा किया है?'),
  no(
    'Has your child used his/her finger to point at things or for indicating interest in something?',
    'क्या आपके बच्चे ने किसी चीज़ में रुचि दिखाने के लिए उँगली से इशारा किया है?',
  ),
  no(
    'Does your child show interest in other children, such as by watching them, smiling at them, or going up to them?',
    'क्या आपका बच्चा दूसरे बच्चों में रुचि दिखाता है, जैसे उन्हें देखना, उन्हें देखकर मुस्कुराना या उनके पास जाना?',
  ),
  no(
    'Does your child show you things by bringing them to you or holding them up, just because they want to share them with you?',
    'क्या आपका बच्चा चीज़ें आपके पास लाकर या ऊपर उठाकर आपको दिखाता है, सिर्फ़ इसलिए कि वह उन्हें आपके साथ साझा करना चाहता है?',
  ),
  no('Is your child able to respond to his/her name when you call?', 'क्या आपका बच्चा अपना नाम पुकारे जाने पर जवाब देता है?'),
  no('Does your child smile back when you smile at them?', 'जब आप अपने बच्चे को देखकर मुस्कुराते हैं, तो क्या वह भी मुस्कुराता है?'),
  yes('Does your child get upset by everyday sounds, such as a vacuum cleaner or loud music?', 'क्या आपका बच्चा रोज़मर्रा की आवाज़ों से परेशान हो जाता है, जैसे वैक्यूम क्लीनर या तेज़ संगीत?'),
  no('Is your child able to walk?', 'क्या आपका बच्चा चल पाता है?'),
  no('Does your child make eye contact with you when you talk, play, or interact with them?', 'जब आप बात करते, खेलते या मिलते-जुलते हैं, तो क्या आपका बच्चा आपसे आँख मिलाता है?'),
  no('Has your child shown instances of imitating you? (Ex: they imitate the face you make)', 'क्या आपके बच्चे ने कभी आपकी नकल की है? (जैसे आपके बनाए चेहरे की नकल)'),
  no('If you turn your head to look at something, does your child look to see what you are looking at?', 'यदि आप सिर घुमाकर किसी चीज़ को देखते हैं, तो क्या आपका बच्चा भी देखता है कि आप क्या देख रहे हैं?'),
  no(
    'Does your child try to get you to watch or pay attention to them? For example, do they look at you for praise or say ‘look’ or ‘watch me’?',
    'क्या आपका बच्चा चाहता है कि आप उसे देखें या उस पर ध्यान दें? जैसे तारीफ़ के लिए आपकी ओर देखना या ‘देखो’ कहना?',
  ),
  no(
    'Does your child understand when you ask them to do something, even without pointing or showing them what to do? For example, can they understand ‘put the book on the chair’ or ‘bring me the blanket’?',
    'क्या आपका बच्चा बिना इशारा किए या दिखाए आपकी कही बात समझता है? जैसे ‘किताब कुर्सी पर रखो’ या ‘मुझे कंबल लाकर दो’?',
  ),
  no(
    'When something new or unexpected happens, does your child look at your face to see how you react? For example, if they hear a strange noise or see a new toy, do they look at you?',
    'जब कुछ नया या अचानक होता है, तो क्या आपका बच्चा आपकी प्रतिक्रिया देखने के लिए आपके चेहरे की ओर देखता है? जैसे अजीब आवाज़ सुनकर या नया खिलौना देखकर?',
  ),
  no('Does your child enjoy activities that involve movement, such as being swung or bounced on your knee?', 'क्या आपके बच्चे को हिलने-डुलने वाली गतिविधियाँ पसंद हैं, जैसे झूला झुलाना या घुटने पर उछालना?'),
]

export function scoreMchat(answers: Record<string, number>): number {
  // answers[i] = 1 for "yes", 0 for "no"
  return MCHAT_ITEMS.reduce((n, item, i) => n + ((answers[i] === 1 ? 'yes' : 'no') === item.riskIf ? 1 : 0), 0)
}

/** Score bands from the project doc (0–2 low, 3–7 moderate, 8–20 high likelihood). Not validated yet. */
export function interpretMchat(score: number): { label: L; advice: L; level: RiskLevel } {
  if (score <= 2)
    return {
      level: 0,
      label: { en: 'Low likelihood', hi: 'कम संभावना' },
      advice: {
        en: 'Few early signs were reported. Keep tracking your child’s development and repeat the checklist if you have concerns.',
        hi: 'बहुत कम शुरुआती संकेत बताए गए। बच्चे के विकास पर नज़र रखें और चिंता हो तो यह जाँच-सूची फिर से भरें।',
      },
    }
  if (score <= 7)
    return {
      level: 1,
      label: { en: 'Moderate likelihood', hi: 'मध्यम संभावना' },
      advice: {
        en: 'Some early signs were reported. Consider discussing these answers with a paediatrician or child development specialist.',
        hi: 'कुछ शुरुआती संकेत बताए गए। इन उत्तरों पर बाल रोग विशेषज्ञ या बाल विकास विशेषज्ञ से बात करने पर विचार करें।',
      },
    }
  return {
    level: 3,
    label: { en: 'High likelihood', hi: 'अधिक संभावना' },
    advice: {
      en: 'Many early signs were reported. Please discuss these answers with a paediatrician or child development specialist soon.',
      hi: 'कई शुरुआती संकेत बताए गए। कृपया जल्द ही इन उत्तरों पर बाल रोग विशेषज्ञ या बाल विकास विशेषज्ञ से बात करें।',
    },
  }
}

export const MCHAT = {
  id: 'mchat',
  name: 'Checklist 1',
  full: { en: 'Early signs checklist for toddlers (inspired by M-CHAT-R)', hi: 'छोटे बच्चों के लिए शुरुआती संकेत जाँच-सूची (M-CHAT-R से प्रेरित)' } as L,
  ages: { en: '0–2.5 years · parent report', hi: '0–2.5 वर्ष · माता-पिता द्वारा' } as L,
  scoreLabel: { en: 'Total score (0–20)', hi: 'कुल अंक (0–20)' } as L,
  /** Shown under every result until the official, licensed version replaces these questions. */
  licence: {
    en: 'Demo version: questions written by the project team, inspired by M-CHAT-R (not the official questionnaire). The score bands are provisional and not yet validated, so this is not a diagnosis.',
    hi: 'डेमो संस्करण: प्रश्न परियोजना टीम द्वारा लिखे गए हैं, M-CHAT-R से प्रेरित (आधिकारिक प्रश्नावली नहीं)। अंक-सीमाएँ अस्थायी हैं और अभी प्रमाणित नहीं हैं, इसलिए यह निदान नहीं है।',
  } as L,
}

export const LEVEL_CLS = [
  'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'bg-amber-50 text-amber-700 ring-amber-200',
  'bg-orange-50 text-orange-700 ring-orange-200',
  'bg-rose-50 text-rose-700 ring-rose-200',
]

export const CHECKLIST_NAME: L = { en: 'Domain screening questionnaire', hi: 'क्षेत्रवार जाँच प्रश्नावली' }

export function instrumentName(id: string, tl: (l: L) => string): string {
  return id === 'checklist' ? tl(CHECKLIST_NAME) : id === 'mchat' ? MCHAT.name : id === 'atec' ? 'ATEC' : id
}

// ---------------------------------------------------------------------------------------------
// ATEC — Autism Treatment Evaluation Checklist (Rimland & Edelson, Autism Research Institute).
// 77 items in 4 subscales; LOWER scores = fewer difficulties. Any contributor can fill it.
// Licence to be requested from the authors (pending). Hindi is a working translation.
// ---------------------------------------------------------------------------------------------

export interface AtecSubscale {
  id: 'speech' | 'social' | 'sensory' | 'health'
  title: L
  /** Rating options, with the points each one adds. */
  options: { label: L; points: number }[]
  items: L[]
}

const T = (en: string, hi: string): L => ({ en, hi })

export const ATEC: AtecSubscale[] = [
  {
    id: 'speech',
    title: T('I. Speech / Language / Communication', 'I. बोली / भाषा / संचार'),
    options: [
      { label: T('Not true', 'सही नहीं'), points: 2 },
      { label: T('Somewhat true', 'कुछ हद तक सही'), points: 1 },
      { label: T('Very true', 'बिल्कुल सही'), points: 0 },
    ],
    items: [
      T('Knows own name', 'अपना नाम जानता/जानती है'),
      T('Responds to “No” or “Stop”', '“नहीं” या “रुको” पर प्रतिक्रिया देता/देती है'),
      T('Can follow some commands', 'कुछ आदेशों का पालन कर सकता/सकती है'),
      T('Can use one word at a time (No!, Eat, Water, etc.)', 'एक बार में एक शब्द बोल सकता/सकती है (नहीं!, खाना, पानी आदि)'),
      T('Can use 2 words at a time (Don’t want, Go home)', 'एक बार में 2 शब्द बोल सकता/सकती है (नहीं चाहिए, घर चलो)'),
      T('Can use 3 words at a time (Want more milk)', 'एक बार में 3 शब्द बोल सकता/सकती है (और दूध चाहिए)'),
      T('Knows 10 or more words', '10 या अधिक शब्द जानता/जानती है'),
      T('Can use sentences with 4 or more words', '4 या अधिक शब्दों के वाक्य बोल सकता/सकती है'),
      T('Explains what they want', 'बताता/बताती है कि उसे क्या चाहिए'),
      T('Asks meaningful questions', 'सार्थक प्रश्न पूछता/पूछती है'),
      T('Speech tends to be meaningful / relevant', 'बोली आमतौर पर सार्थक / प्रासंगिक होती है'),
      T('Often uses several successive sentences', 'अक्सर कई वाक्य लगातार बोलता/बोलती है'),
      T('Carries on fairly good conversation', 'ठीक-ठाक बातचीत कर लेता/लेती है'),
      T('Has normal ability to communicate for their age', 'आयु के अनुसार सामान्य संचार क्षमता है'),
    ],
  },
  {
    id: 'social',
    title: T('II. Sociability', 'II. सामाजिकता'),
    options: [
      { label: T('Not descriptive', 'लागू नहीं'), points: 0 },
      { label: T('Somewhat descriptive', 'कुछ हद तक लागू'), points: 1 },
      { label: T('Very descriptive', 'पूरी तरह लागू'), points: 2 },
    ],
    items: [
      T('Seems to be in a shell — you cannot reach them', 'अपने ही खोल में रहता/रहती है — उस तक पहुँचना कठिन'),
      T('Ignores other people', 'दूसरे लोगों को अनदेखा करता/करती है'),
      T('Pays little or no attention when addressed', 'बात करने पर बहुत कम या कोई ध्यान नहीं देता/देती'),
      T('Uncooperative and resistant', 'सहयोग नहीं करता/करती, विरोध करता/करती है'),
      T('No eye contact', 'आँख नहीं मिलाता/मिलाती'),
      T('Prefers to be left alone', 'अकेले रहना पसंद करता/करती है'),
      T('Shows no affection', 'स्नेह नहीं दिखाता/दिखाती'),
      T('Fails to greet parents', 'माता-पिता का अभिवादन नहीं करता/करती'),
      T('Avoids contact with others', 'दूसरों से संपर्क से बचता/बचती है'),
      T('Does not imitate', 'नकल नहीं करता/करती'),
      T('Dislikes being held / cuddled', 'गोद में लिया जाना / गले लगाना पसंद नहीं'),
      T('Does not share or show', 'चीज़ें साझा नहीं करता/करती या दिखाता/दिखाती नहीं'),
      T('Does not wave “bye bye”', '“टाटा / बाय-बाय” नहीं करता/करती'),
      T('Disagreeable / not compliant', 'असहमत रहता/रहती है / बात नहीं मानता/मानती'),
      T('Temper tantrums', 'गुस्से के दौरे पड़ते हैं'),
      T('Lacks friends / companions', 'दोस्त / साथी नहीं हैं'),
      T('Rarely smiles', 'बहुत कम मुस्कुराता/मुस्कुराती है'),
      T('Insensitive to other’s feelings', 'दूसरों की भावनाओं के प्रति असंवेदनशील'),
      T('Indifferent to being liked', 'पसंद किए जाने की परवाह नहीं'),
      T('Indifferent if parent(s) leave', 'माता-पिता के जाने पर कोई फ़र्क नहीं पड़ता'),
    ],
  },
  {
    id: 'sensory',
    title: T('III. Sensory / Cognitive Awareness', 'III. संवेदी / संज्ञानात्मक जागरूकता'),
    options: [
      { label: T('Not descriptive', 'लागू नहीं'), points: 2 },
      { label: T('Somewhat descriptive', 'कुछ हद तक लागू'), points: 1 },
      { label: T('Very descriptive', 'पूरी तरह लागू'), points: 0 },
    ],
    items: [
      T('Responds to own name', 'अपने नाम पर प्रतिक्रिया देता/देती है'),
      T('Responds to praise', 'प्रशंसा पर प्रतिक्रिया देता/देती है'),
      T('Looks at people and animals', 'लोगों और जानवरों को देखता/देखती है'),
      T('Looks at pictures (and TV)', 'चित्र (और टीवी) देखता/देखती है'),
      T('Does drawing, colouring, art', 'चित्र बनाता/बनाती है, रंग भरता/भरती है'),
      T('Plays with toys appropriately', 'खिलौनों से सही ढंग से खेलता/खेलती है'),
      T('Appropriate facial expression', 'चेहरे के भाव उचित होते हैं'),
      T('Understands stories on TV', 'टीवी पर कहानियाँ समझता/समझती है'),
      T('Understands explanations', 'समझाई गई बातें समझता/समझती है'),
      T('Aware of environment', 'आसपास के माहौल से अवगत'),
      T('Aware of danger', 'खतरे से अवगत'),
      T('Shows imagination', 'कल्पनाशीलता दिखाता/दिखाती है'),
      T('Initiates activities', 'स्वयं गतिविधियाँ शुरू करता/करती है'),
      T('Dresses self', 'स्वयं कपड़े पहनता/पहनती है'),
      T('Curious, interested', 'जिज्ञासु, रुचि लेता/लेती है'),
      T('Venturesome — explores', 'खोजबीन करता/करती है'),
      T('“Tuned in” — not spacey', 'ध्यान में रहता/रहती है — खोया-खोया नहीं'),
      T('Looks where others are looking', 'जहाँ दूसरे देखते हैं, वहाँ देखता/देखती है'),
    ],
  },
  {
    id: 'health',
    title: T('IV. Health / Physical / Behaviour', 'IV. स्वास्थ्य / शारीरिक / व्यवहार'),
    options: [
      { label: T('Not a problem', 'समस्या नहीं'), points: 0 },
      { label: T('Minor problem', 'छोटी समस्या'), points: 1 },
      { label: T('Moderate problem', 'मध्यम समस्या'), points: 2 },
      { label: T('Serious problem', 'गंभीर समस्या'), points: 3 },
    ],
    items: [
      T('Bed-wetting', 'बिस्तर गीला करना'),
      T('Wets pants / diapers', 'कपड़े / डायपर गीले करना'),
      T('Soils pants / diapers', 'कपड़ों / डायपर में मल त्याग'),
      T('Diarrhoea', 'दस्त'),
      T('Constipation', 'कब्ज़'),
      T('Sleep problems', 'नींद की समस्या'),
      T('Eats too much / too little', 'बहुत ज़्यादा / बहुत कम खाना'),
      T('Extremely limited diet', 'बहुत सीमित आहार'),
      T('Hyperactive', 'अति-सक्रियता'),
      T('Lethargic', 'सुस्ती'),
      T('Hits or injures self', 'खुद को मारना या चोट पहुँचाना'),
      T('Hits or injures others', 'दूसरों को मारना या चोट पहुँचाना'),
      T('Destructive', 'तोड़-फोड़ करना'),
      T('Sound-sensitive', 'आवाज़ के प्रति संवेदनशील'),
      T('Anxious / fearful', 'चिंतित / डरा हुआ'),
      T('Unhappy / crying', 'दुखी / रोना'),
      T('Seizures', 'दौरे (मिर्गी)'),
      T('Obsessive speech', 'एक ही बात बार-बार बोलना'),
      T('Rigid routines', 'कठोर दिनचर्या'),
      T('Shouts or screams', 'चिल्लाना या चीखना'),
      T('Demands sameness', 'हर चीज़ एक जैसी रखने की ज़िद'),
      T('Often agitated', 'अक्सर बेचैन'),
      T('Not sensitive to pain', 'दर्द महसूस न होना'),
      T('“Hooked” or fixated on certain objects / topics', 'कुछ चीज़ों / विषयों पर अटके रहना'),
      T('Repetitive movements (stimming, rocking, etc.)', 'बार-बार दोहराई जाने वाली हरकतें (हिलना, झूलना आदि)'),
    ],
  },
]

export const ATEC_MAX: Record<AtecSubscale['id'], number> = { speech: 28, social: 40, sensory: 36, health: 75 }
export const ATEC_TOTAL_MAX = 179

/** answers key `${subscaleId}.${index}` = selected option index. */
export function scoreAtec(answers: Record<string, number>): { subscales: Record<string, number>; total: number } {
  const subscales: Record<string, number> = {}
  for (const s of ATEC) {
    subscales[s.id] = s.items.reduce((n, _, i) => {
      const opt = answers[`${s.id}.${i}`]
      return n + (opt === undefined ? 0 : s.options[opt].points)
    }, 0)
  }
  return { subscales, total: Object.values(subscales).reduce((a, b) => a + b, 0) }
}

export const ATEC_INFO = {
  name: 'ATEC',
  full: T('Autism Treatment Evaluation Checklist', 'ऑटिज़्म उपचार मूल्यांकन जाँच-सूची'),
  copyright: '© Autism Research Institute (Rimland & Edelson)',
  itemCount: 77,
}

/**
 * ATEC subscales mapped onto the app's (AEPS-3-inspired) domains, as given by the team, so an ATEC
 * result can also suggest interventions. Each domain gets the highest % score of the ATEC subscales
 * linked to it, then uses the same Low / Medium / High cut-offs as the domain screening.
 */
export const ATEC_DOMAIN_MAP: Record<AtecSubscale['id'], string[]> = {
  speech: ['expressive', 'receptive', 'literacy'], // AEPS-3: Social-Communication, Literacy (pre-verbal / phonics)
  social: ['social', 'emotional'], // AEPS-3: Social-Emotional, Social-Communication (pragmatics)
  sensory: ['cognitive', 'numeracy', 'literacy'], // AEPS-3: Cognitive, Math, Literacy (print concepts)
  health: ['adaptive', 'fineMotor', 'grossMotor', 'emotional'], // AEPS-3: Adaptive, Fine/Gross Motor, Social-Emotional (conduct)
}

/** What each ATEC subscale looks for in the linked AEPS-3 areas. */
export const ATEC_LOOK_FOR: Record<AtecSubscale['id'], L> = {
  speech: T('Receptive language, vocabulary, functional requests and articulation.', 'भाषा समझना, शब्दावली, ज़रूरत के लिए माँगना और उच्चारण।'),
  social: T('Shared enjoyment, parallel play, emotional regulation and responding to social cues.', 'साथ में आनंद लेना, साथ-साथ खेलना, भावनाओं को सँभालना और सामाजिक संकेतों का जवाब देना।'),
  sensory: T('Object permanence, spatial awareness, counting, tracking objects and following multi-step directions.', 'वस्तु स्थायित्व, स्थान की समझ, गिनती, चीज़ों पर नज़र रखना और कई चरणों वाले निर्देश मानना।'),
  health: T('Independent toileting / feeding, coordination, repetitive movements, sleeping patterns or sensory distress.', 'खुद शौच / खाना, तालमेल, बार-बार की हरकतें, नींद का पैटर्न या संवेदी परेशानी।'),
}

/** ATEC subscale points → domain scores (0–100, higher = more difficulty), for recommendations. */
export function atecDomainScores(subscales: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {}
  for (const s of ATEC) {
    const pct = Math.round(((subscales[s.id] ?? 0) / ATEC_MAX[s.id]) * 100)
    for (const d of ATEC_DOMAIN_MAP[s.id]) out[d] = Math.max(out[d] ?? 0, pct)
  }
  return out
}
