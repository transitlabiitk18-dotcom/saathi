import type { L } from '../lib/types'

/**
 * M-CHAT-R (Modified Checklist for Autism in Toddlers, Revised), parent report, 20 yes/no items.
 * © 2009 Diana Robins, Deborah Fein & Marianne Barton. Free for clinical, research and educational use;
 * electronic use needs the authors' permission (see mchatscreen.com). Licensing is pending with the team.
 * Hindi text is a working translation — swap in the official Hindi M-CHAT-R before research use.
 */
export interface McHatItem {
  q: L
  example?: L
  /** The answer that counts as an at-risk response. Items 2, 5 and 12 are reverse-scored. */
  riskIf: 'yes' | 'no'
}

export type RiskLevel = 0 | 1 | 2 | 3

export const MCHAT_ITEMS: McHatItem[] = [
  {
    q: { en: 'If you point at something across the room, does your child look at it?', hi: 'यदि आप कमरे में दूर किसी चीज़ की ओर इशारा करते हैं, तो क्या आपका बच्चा उसे देखता है?' },
    example: { en: 'If you point at a toy or an animal, does your child look at the toy or animal?', hi: 'यदि आप किसी खिलौने या जानवर की ओर इशारा करें, तो क्या बच्चा उसे देखता है?' },
    riskIf: 'no',
  },
  { q: { en: 'Have you ever wondered if your child might be deaf?', hi: 'क्या आपको कभी लगा है कि आपका बच्चा शायद सुन नहीं सकता?' }, riskIf: 'yes' },
  {
    q: { en: 'Does your child play pretend or make-believe?', hi: 'क्या आपका बच्चा काल्पनिक / नाटक वाले खेल खेलता है?' },
    example: { en: 'Pretend to drink from an empty cup, talk on a phone, or feed a doll or stuffed animal', hi: 'खाली कप से पीने का नाटक, फ़ोन पर बात करने का नाटक, या गुड़िया को खिलाने का नाटक' },
    riskIf: 'no',
  },
  {
    q: { en: 'Does your child like climbing on things?', hi: 'क्या आपके बच्चे को चीज़ों पर चढ़ना पसंद है?' },
    example: { en: 'Furniture, playground equipment, or stairs', hi: 'फ़र्नीचर, झूले-फिसलपट्टी, या सीढ़ियाँ' },
    riskIf: 'no',
  },
  {
    q: { en: 'Does your child make unusual finger movements near their eyes?', hi: 'क्या आपका बच्चा अपनी आँखों के पास उंगलियों को असामान्य तरीके से हिलाता है?' },
    example: { en: 'Does your child wiggle their fingers close to their eyes?', hi: 'क्या बच्चा आँखों के बहुत पास उंगलियाँ हिलाता है?' },
    riskIf: 'yes',
  },
  {
    q: { en: 'Does your child point with one finger to ask for something or to get help?', hi: 'क्या आपका बच्चा कुछ माँगने या मदद के लिए एक उंगली से इशारा करता है?' },
    example: { en: 'Pointing to a snack or toy that is out of reach', hi: 'पहुँच से बाहर रखे खाने या खिलौने की ओर इशारा करना' },
    riskIf: 'no',
  },
  {
    q: { en: 'Does your child point with one finger to show you something interesting?', hi: 'क्या आपका बच्चा आपको कोई रोचक चीज़ दिखाने के लिए एक उंगली से इशारा करता है?' },
    example: { en: 'Pointing to an airplane in the sky or a big truck in the road', hi: 'आसमान में हवाई जहाज़ या सड़क पर बड़े ट्रक की ओर इशारा करना' },
    riskIf: 'no',
  },
  {
    q: { en: 'Is your child interested in other children?', hi: 'क्या आपके बच्चे की दूसरे बच्चों में रुचि है?' },
    example: { en: 'Does your child watch other children, smile at them, or go to them?', hi: 'क्या बच्चा दूसरे बच्चों को देखता है, उन्हें देखकर मुस्कुराता है, या उनके पास जाता है?' },
    riskIf: 'no',
  },
  {
    q: {
      en: 'Does your child show you things by bringing them to you or holding them up for you to see — not to get help, but just to share?',
      hi: 'क्या आपका बच्चा चीज़ें आपके पास लाकर या ऊपर उठाकर आपको दिखाता है — मदद के लिए नहीं, बस साझा करने के लिए?',
    },
    example: { en: 'Showing you a flower, a stuffed animal, or a toy truck', hi: 'आपको फूल, खिलौना जानवर या खिलौना ट्रक दिखाना' },
    riskIf: 'no',
  },
  {
    q: { en: 'Does your child respond when you call their name?', hi: 'क्या आपका बच्चा अपना नाम पुकारे जाने पर प्रतिक्रिया देता है?' },
    example: { en: 'Do they look up, talk or babble, or stop what they are doing?', hi: 'क्या वह ऊपर देखता है, कुछ बोलता/बड़बड़ाता है, या जो कर रहा है उसे रोक देता है?' },
    riskIf: 'no',
  },
  { q: { en: 'When you smile at your child, do they smile back at you?', hi: 'जब आप अपने बच्चे को देखकर मुस्कुराते हैं, तो क्या वह भी मुस्कुराता है?' }, riskIf: 'no' },
  {
    q: { en: 'Does your child get upset by everyday noises?', hi: 'क्या आपका बच्चा रोज़मर्रा की आवाज़ों से परेशान हो जाता है?' },
    example: { en: 'Does your child scream or cry at noise such as a vacuum cleaner or loud music?', hi: 'क्या बच्चा मिक्सर, वैक्यूम क्लीनर या तेज़ संगीत जैसी आवाज़ पर चीखता या रोता है?' },
    riskIf: 'yes',
  },
  { q: { en: 'Does your child walk?', hi: 'क्या आपका बच्चा चलता है?' }, riskIf: 'no' },
  {
    q: { en: 'Does your child look you in the eye when you are talking to them, playing with them, or dressing them?', hi: 'जब आप बच्चे से बात करते हैं, खेलते हैं या कपड़े पहनाते हैं, तो क्या वह आपकी आँखों में देखता है?' },
    riskIf: 'no',
  },
  {
    q: { en: 'Does your child try to copy what you do?', hi: 'क्या आपका बच्चा आपकी नकल करने की कोशिश करता है?' },
    example: { en: 'Wave bye-bye, clap, or make a funny noise when you do', hi: 'आपके करने पर टाटा करना, ताली बजाना, या मज़ेदार आवाज़ निकालना' },
    riskIf: 'no',
  },
  {
    q: { en: 'If you turn your head to look at something, does your child look around to see what you are looking at?', hi: 'यदि आप किसी चीज़ को देखने के लिए सिर घुमाते हैं, तो क्या आपका बच्चा भी देखता है कि आप क्या देख रहे हैं?' },
    riskIf: 'no',
  },
  {
    q: { en: 'Does your child try to get you to watch them?', hi: 'क्या आपका बच्चा चाहता है कि आप उसे देखें?' },
    example: { en: 'Does your child look at you for praise, or say "look" or "watch me"?', hi: 'क्या बच्चा तारीफ़ के लिए आपकी ओर देखता है, या "देखो" / "मुझे देखो" कहता है?' },
    riskIf: 'no',
  },
  {
    q: { en: 'Does your child understand when you tell them to do something?', hi: 'जब आप बच्चे से कुछ करने को कहते हैं, तो क्या वह समझता है?' },
    example: { en: 'Without pointing, can your child understand "put the book on the chair" or "bring me the blanket"?', hi: 'बिना इशारा किए, क्या बच्चा "किताब कुर्सी पर रखो" या "मुझे चादर लाकर दो" समझता है?' },
    riskIf: 'no',
  },
  {
    q: { en: 'If something new happens, does your child look at your face to see how you feel about it?', hi: 'जब कुछ नया होता है, तो क्या आपका बच्चा यह जानने के लिए आपका चेहरा देखता है कि आपको कैसा लगा?' },
    example: { en: 'If they hear a strange or funny noise, or see a new toy, will they look at your face?', hi: 'कोई अजीब या मज़ेदार आवाज़ सुनने या नया खिलौना देखने पर क्या वह आपका चेहरा देखता है?' },
    riskIf: 'no',
  },
  {
    q: { en: 'Does your child like movement activities?', hi: 'क्या आपके बच्चे को हिलने-डुलने वाली गतिविधियाँ पसंद हैं?' },
    example: { en: 'Being swung or bounced on your knee', hi: 'झुलाया जाना या घुटनों पर उछाला जाना' },
    riskIf: 'no',
  },
]

export function scoreMchat(answers: Record<string, number>): number {
  // answers[i] = 1 for "yes", 0 for "no"
  return MCHAT_ITEMS.reduce((n, item, i) => n + ((answers[i] === 1 ? 'yes' : 'no') === item.riskIf ? 1 : 0), 0)
}

export function interpretMchat(score: number): { label: L; advice: L; level: RiskLevel } {
  if (score <= 2)
    return {
      level: 0,
      label: { en: 'Low risk', hi: 'कम जोखिम' },
      advice: {
        en: 'No further action needed unless surveillance shows concern. If the child is younger than 24 months, screen again after the second birthday.',
        hi: 'जब तक निगरानी में चिंता न दिखे, आगे कुछ करने की ज़रूरत नहीं। यदि बच्चा 24 माह से छोटा है, तो दूसरे जन्मदिन के बाद फिर से जाँच करें।',
      },
    }
  if (score <= 7)
    return {
      level: 1,
      label: { en: 'Medium risk', hi: 'मध्यम जोखिम' },
      advice: {
        en: 'Do the M-CHAT-R Follow-Up interview with a clinician for the at-risk items. If 2 or more remain at risk after follow-up, refer for diagnostic evaluation and early intervention.',
        hi: 'जोखिम वाले प्रश्नों के लिए चिकित्सक के साथ M-CHAT-R फ़ॉलो-अप साक्षात्कार करें। फ़ॉलो-अप के बाद भी 2 या अधिक जोखिम में हों, तो निदान मूल्यांकन और प्रारंभिक हस्तक्षेप हेतु भेजें।',
      },
    }
  return {
    level: 3,
    label: { en: 'High risk', hi: 'उच्च जोखिम' },
    advice: {
      en: 'Refer right away for diagnostic evaluation and eligibility for early intervention. The follow-up interview may be skipped.',
      hi: 'तुरंत निदान मूल्यांकन और प्रारंभिक हस्तक्षेप के लिए भेजें। फ़ॉलो-अप साक्षात्कार छोड़ा जा सकता है।',
    },
  }
}

export const MCHAT = {
  id: 'mchat',
  name: 'M-CHAT-R',
  full: { en: 'Modified Checklist for Autism in Toddlers, Revised', hi: 'टॉडलर्स में ऑटिज़्म के लिए संशोधित जाँच-सूची' } as L,
  ages: { en: '0–2.5 years · parent report', hi: '0–2.5 वर्ष · माता-पिता द्वारा' } as L,
  scoreLabel: { en: 'Total score (0–20)', hi: 'कुल अंक (0–20)' } as L,
  copyright: '© 2009 Diana Robins, Deborah Fein & Marianne Barton',
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
