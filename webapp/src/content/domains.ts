import type { L } from '../lib/types'

/**
 * DRAFT domains: the team is finalising a 4–5 domain questionnaire (AEPS-3-inspired). Until then these
 * are the 10 developmental domains from the project brief. Each "indicator" doubles as a checklist item
 * (rated Never / Sometimes / Often) and each "strategy" is an intervention suggestion shown when the
 * domain is flagged. Hindi text is a working translation — have it reviewed before research use.
 */
export interface Domain {
  id: string
  emoji: string
  color: string // chart + accent colour
  name: L
  definition: L
  indicators: L[]
  strategies: L[]
  refer: L
}

export const DOMAINS: Domain[] = [
  {
    id: 'receptive',
    emoji: '👂',
    color: '#3b82a6',
    name: { en: 'Receptive Communication', hi: 'ग्रहणशील संचार (भाषा समझना)' },
    definition: {
      en: 'Ability to understand spoken language, instructions, questions, and conversations.',
      hi: 'बोली गई भाषा, निर्देशों, प्रश्नों और बातचीत को समझने की क्षमता।',
    },
    indicators: [
      { en: 'Does not follow one- or two-step instructions', hi: 'एक या दो चरणों वाले निर्देशों का पालन नहीं करता/करती' },
      { en: 'Appears confused during activities', hi: 'गतिविधियों के दौरान उलझन में दिखता/दिखती है' },
      { en: 'Watches others before beginning tasks', hi: 'काम शुरू करने से पहले दूसरों को देखता/देखती है' },
      { en: 'Frequently needs instructions repeated', hi: 'निर्देशों को बार-बार दोहराने की ज़रूरत होती है' },
      { en: 'Has difficulty understanding stories or discussions', hi: 'कहानियाँ या चर्चा समझने में कठिनाई होती है' },
    ],
    strategies: [
      { en: 'Give one instruction at a time', hi: 'एक समय में एक ही निर्देश दें' },
      { en: 'Use visual schedules and picture cues', hi: 'दृश्य समय-सारणी और चित्र संकेतों का उपयोग करें' },
      { en: 'Demonstrate tasks before expecting independent work', hi: 'स्वतंत्र रूप से काम की अपेक्षा से पहले काम करके दिखाएँ' },
      { en: 'Check understanding by asking the child to show rather than repeat', hi: 'समझ जाँचने के लिए बच्चे से दोहराने की बजाय करके दिखाने को कहें' },
      { en: 'Minimise background noise during instruction', hi: 'निर्देश देते समय आसपास का शोर कम रखें' },
    ],
    refer: {
      en: 'Difficulties persist despite support or significantly interfere with learning and participation.',
      hi: 'सहायता के बावजूद कठिनाइयाँ बनी रहें या सीखने और भागीदारी में काफ़ी बाधा डालें।',
    },
  },
  {
    id: 'expressive',
    emoji: '💬',
    color: '#6366f1',
    name: { en: 'Expressive Communication', hi: 'अभिव्यक्ति संचार' },
    definition: {
      en: 'Ability to express thoughts, needs, ideas, and feelings verbally or through alternative communication.',
      hi: 'विचारों, ज़रूरतों और भावनाओं को बोलकर या वैकल्पिक संचार द्वारा व्यक्त करने की क्षमता।',
    },
    indicators: [
      { en: 'Uses a limited vocabulary', hi: 'सीमित शब्दावली का उपयोग करता/करती है' },
      { en: 'Has difficulty answering questions', hi: 'प्रश्नों के उत्तर देने में कठिनाई होती है' },
      { en: 'Uses gestures instead of words beyond the expected age', hi: 'अपेक्षित आयु के बाद भी शब्दों की जगह इशारों का उपयोग करता/करती है' },
      { en: 'Speaks in short or incomplete sentences', hi: 'छोटे या अधूरे वाक्यों में बोलता/बोलती है' },
      { en: 'Has difficulty taking part in conversations or discussions', hi: 'बातचीत या चर्चा में भाग लेने में कठिनाई होती है' },
    ],
    strategies: [
      { en: 'Give extra response time', hi: 'उत्तर देने के लिए अतिरिक्त समय दें' },
      { en: 'Model complete sentences', hi: 'पूरे वाक्य बोलकर उदाहरण दें' },
      { en: 'Offer choices ("Do you want the red or blue pencil?")', hi: 'विकल्प दें ("तुम्हें लाल पेंसिल चाहिए या नीली?")' },
      { en: 'Encourage peer conversations', hi: 'साथियों के साथ बातचीत को प्रोत्साहित करें' },
      { en: 'Use pictures or communication boards when needed', hi: 'ज़रूरत पड़ने पर चित्रों या संचार बोर्ड का उपयोग करें' },
    ],
    refer: {
      en: 'Persistent expressive difficulties affecting communication or social participation.',
      hi: 'लगातार अभिव्यक्ति संबंधी कठिनाइयाँ जो संचार या सामाजिक भागीदारी को प्रभावित करें।',
    },
  },
  {
    id: 'fineMotor',
    emoji: '✏️',
    color: '#7c3aed',
    name: { en: 'Fine Motor Skills', hi: 'सूक्ष्म गतिक कौशल' },
    definition: {
      en: 'Ability to use the small muscles of the hands and fingers for daily and self-care activities.',
      hi: 'दैनिक और आत्म-देखभाल गतिविधियों के लिए हाथों और उंगलियों की छोटी मांसपेशियों के उपयोग की क्षमता।',
    },
    indicators: [
      { en: 'Has a poor pencil or crayon grip', hi: 'पेंसिल या क्रेयॉन ठीक से नहीं पकड़ पाता/पाती' },
      { en: 'Has difficulty cutting, colouring or writing', hi: 'काटने, रंग भरने या लिखने में कठिनाई होती है' },
      { en: 'Has trouble handling small objects', hi: 'छोटी वस्तुओं को संभालने में परेशानी होती है' },
      { en: 'Is slow to finish drawing or written work', hi: 'चित्र या लिखित काम धीरे-धीरे पूरा करता/करती है' },
    ],
    strategies: [
      { en: 'Pencil grips and thick crayons', hi: 'पेंसिल ग्रिप और मोटे क्रेयॉन' },
      { en: 'Playdough activities', hi: 'प्लेडो (आटे/मिट्टी) से खेल' },
      { en: 'Bead threading', hi: 'मोतियों में धागा पिरोना' },
      { en: 'Pegboards', hi: 'पेगबोर्ड गतिविधियाँ' },
      { en: 'Tracing and colouring exercises', hi: 'ट्रेसिंग और रंग भरने के अभ्यास' },
    ],
    refer: {
      en: 'Motor difficulties significantly interfere with participation or self-care.',
      hi: 'गतिक कठिनाइयाँ भागीदारी या आत्म-देखभाल में काफ़ी बाधा डालें।',
    },
  },
  {
    id: 'grossMotor',
    emoji: '🤸',
    color: '#0891b2',
    name: { en: 'Gross Motor Skills', hi: 'स्थूल गतिक कौशल' },
    definition: {
      en: 'Ability to use large muscles for movement and balance.',
      hi: 'गति और संतुलन के लिए बड़ी मांसपेशियों के उपयोग की क्षमता।',
    },
    indicators: [
      { en: 'Falls frequently', hi: 'अक्सर गिर जाता/जाती है' },
      { en: 'Has difficulty running or jumping', hi: 'दौड़ने या कूदने में कठिनाई होती है' },
      { en: 'Has poor balance', hi: 'संतुलन कमज़ोर है' },
      { en: 'Has difficulty climbing stairs', hi: 'सीढ़ियाँ चढ़ने में कठिनाई होती है' },
      { en: 'Avoids playground activities', hi: 'खेल के मैदान की गतिविधियों से बचता/बचती है' },
    ],
    strategies: [
      { en: 'Obstacle courses', hi: 'बाधा दौड़ (ऑब्स्टेकल कोर्स)' },
      { en: 'Ball games', hi: 'गेंद के खेल' },
      { en: 'Balance beam activities', hi: 'संतुलन बीम गतिविधियाँ' },
      { en: 'Movement breaks', hi: 'बीच-बीच में चलने-फिरने का विराम' },
      { en: 'Jumping and hopping games', hi: 'कूदने और फुदकने वाले खेल' },
    ],
    refer: {
      en: 'Persistent motor difficulties affecting safety or participation.',
      hi: 'लगातार गतिक कठिनाइयाँ जो सुरक्षा या भागीदारी को प्रभावित करें।',
    },
  },
  {
    id: 'social',
    emoji: '🤝',
    color: '#059669',
    name: { en: 'Social Skills', hi: 'सामाजिक कौशल' },
    definition: {
      en: 'Ability to interact appropriately with peers and adults.',
      hi: 'साथियों और वयस्कों के साथ उचित रूप से व्यवहार करने की क्षमता।',
    },
    indicators: [
      { en: 'Has difficulty making friends', hi: 'दोस्त बनाने में कठिनाई होती है' },
      { en: 'Rarely shares or takes turns', hi: 'शायद ही कभी चीज़ें बाँटता/बाँटती है या बारी का इंतज़ार करता/करती है' },
      { en: 'Plays alone most of the time', hi: 'अधिकतर समय अकेले खेलता/खेलती है' },
      { en: 'Has difficulty resolving conflicts', hi: 'झगड़े सुलझाने में कठिनाई होती है' },
      { en: 'Takes limited part in group activities', hi: 'समूह गतिविधियों में कम भाग लेता/लेती है' },
    ],
    strategies: [
      { en: 'Peer buddy system', hi: 'साथी-मित्र (बडी) प्रणाली' },
      { en: 'Cooperative learning and structured play', hi: 'सहयोगी गतिविधियाँ और संरचित खेल' },
      { en: 'Role-play social situations', hi: 'सामाजिक स्थितियों का रोल-प्ले' },
      { en: 'Social stories', hi: 'सामाजिक कहानियाँ' },
      { en: 'Reinforce positive peer interactions', hi: 'साथियों के साथ अच्छे व्यवहार की सराहना करें' },
    ],
    refer: {
      en: 'Social difficulties continue to interfere with peer relationships or daily functioning.',
      hi: 'सामाजिक कठिनाइयाँ साथियों से संबंधों या दैनिक कामकाज में बाधा डालती रहें।',
    },
  },
  {
    id: 'emotional',
    emoji: '🌈',
    color: '#ea580c',
    name: { en: 'Social-Emotional Regulation', hi: 'सामाजिक-भावनात्मक नियंत्रण' },
    definition: {
      en: 'Ability to understand, express, and regulate emotions appropriately.',
      hi: 'भावनाओं को समझने, व्यक्त करने और उचित रूप से नियंत्रित करने की क्षमता।',
    },
    indicators: [
      { en: 'Has frequent emotional outbursts', hi: 'अक्सर भावनात्मक विस्फोट (गुस्सा/रोना) होता है' },
      { en: 'Has difficulty coping with changes', hi: 'बदलावों का सामना करने में कठिनाई होती है' },
      { en: 'Shows anxiety or excessive withdrawal', hi: 'चिंता या अत्यधिक अलगाव दिखाता/दिखाती है' },
      { en: 'Shows aggressive behaviour', hi: 'आक्रामक व्यवहार करता/करती है' },
      { en: 'Gets frustrated easily', hi: 'जल्दी निराश या चिढ़ जाता/जाती है' },
    ],
    strategies: [
      { en: 'Maintain predictable routines', hi: 'पूर्वानुमेय दिनचर्या बनाए रखें' },
      { en: 'Teach emotion vocabulary', hi: 'भावनाओं के शब्द सिखाएँ' },
      { en: 'Create a calm-down corner', hi: 'शांत होने का एक कोना बनाएँ' },
      { en: 'Use visual regulation scales', hi: 'भावनाओं के दृश्य पैमानों का उपयोग करें' },
      { en: 'Praise calm behaviour', hi: 'शांत व्यवहार की प्रशंसा करें' },
      { en: 'Prepare the child before transitions (use Visual Routines)', hi: 'बदलाव से पहले बच्चे को तैयार करें (दृश्य दिनचर्या का उपयोग करें)' },
    ],
    refer: {
      en: 'Behaviour remains severe, persistent, or affects safety and learning.',
      hi: 'व्यवहार गंभीर, लगातार बना रहे या सुरक्षा और सीखने को प्रभावित करे।',
    },
  },
  {
    id: 'adaptive',
    emoji: '🧦',
    color: '#d97706',
    name: { en: 'Adaptive Skills', hi: 'अनुकूली (दैनिक जीवन) कौशल' },
    definition: {
      en: 'Ability to perform age-appropriate daily living and independence skills.',
      hi: 'आयु के अनुसार दैनिक जीवन और आत्मनिर्भरता के कौशल करने की क्षमता।',
    },
    indicators: [
      { en: 'Needs frequent help with routine tasks', hi: 'रोज़मर्रा के कामों में बार-बार मदद की ज़रूरत होती है' },
      { en: 'Has difficulty organising belongings', hi: 'अपनी चीज़ें व्यवस्थित रखने में कठिनाई होती है' },
      { en: 'Struggles to move between activities', hi: 'एक गतिविधि से दूसरी पर जाने में कठिनाई होती है' },
      { en: 'Has difficulty following routines', hi: 'दिनचर्या का पालन करने में कठिनाई होती है' },
      { en: 'Needs repeated adult prompts', hi: 'बड़ों के बार-बार याद दिलाने की ज़रूरत होती है' },
    ],
    strategies: [
      { en: 'Visual schedules', hi: 'दृश्य समय-सारणी' },
      { en: 'Step-by-step task analysis', hi: 'काम को छोटे-छोटे चरणों में बाँटें' },
      { en: 'Independence practice', hi: 'आत्मनिर्भरता का अभ्यास' },
      { en: 'Checklists', hi: 'जाँच-सूचियाँ (चेकलिस्ट)' },
      { en: 'Positive reinforcement for completing tasks independently', hi: 'स्वयं काम पूरा करने पर सकारात्मक प्रोत्साहन' },
    ],
    refer: {
      en: 'Significant dependence compared with age peers despite intervention.',
      hi: 'हस्तक्षेप के बावजूद हमउम्र बच्चों की तुलना में काफ़ी अधिक निर्भरता।',
    },
  },
  {
    id: 'literacy',
    emoji: '📖',
    color: '#db2777',
    name: { en: 'Early Literacy', hi: 'प्रारंभिक साक्षरता' },
    definition: {
      en: 'Foundational skills required for reading and writing.',
      hi: 'पढ़ने और लिखने के लिए आवश्यक बुनियादी कौशल।',
    },
    indicators: [
      { en: 'Has difficulty recognising letters', hi: 'अक्षर पहचानने में कठिनाई होती है' },
      { en: 'Has limited awareness of sounds in words', hi: 'शब्दों की ध्वनियों की सीमित समझ है' },
      { en: 'Has difficulty identifying rhyming words', hi: 'तुकांत शब्द पहचानने में कठिनाई होती है' },
      { en: 'Shows limited interest in books', hi: 'किताबों में कम रुचि दिखाता/दिखाती है' },
      { en: 'Has difficulty writing own name (if age appropriate)', hi: 'अपना नाम लिखने में कठिनाई होती है (आयु अनुसार)' },
    ],
    strategies: [
      { en: 'Shared reading', hi: 'साथ बैठकर पढ़ना' },
      { en: 'Letter-sound games', hi: 'अक्षर-ध्वनि के खेल' },
      { en: 'Storytelling', hi: 'कहानी सुनाना' },
      { en: 'Alphabet puzzles', hi: 'वर्णमाला पहेलियाँ' },
      { en: 'Multisensory letter activities', hi: 'बहु-इंद्रिय अक्षर गतिविधियाँ (रेत/मिट्टी पर लिखना)' },
    ],
    refer: {
      en: 'Literacy difficulties persist despite targeted instruction.',
      hi: 'लक्षित शिक्षण के बावजूद साक्षरता कठिनाइयाँ बनी रहें।',
    },
  },
  {
    id: 'numeracy',
    emoji: '🔢',
    color: '#9333ea',
    name: { en: 'Early Numeracy', hi: 'प्रारंभिक गणना' },
    definition: {
      en: 'Foundational mathematical concepts including counting, number recognition, and quantity.',
      hi: 'गिनती, संख्या पहचान और मात्रा सहित बुनियादी गणितीय अवधारणाएँ।',
    },
    indicators: [
      { en: 'Has difficulty counting', hi: 'गिनती करने में कठिनाई होती है' },
      { en: 'Cannot recognise age-appropriate numbers', hi: 'आयु के अनुसार संख्याएँ नहीं पहचान पाता/पाती' },
      { en: 'Has difficulty comparing quantities (more / less)', hi: 'मात्राओं की तुलना (ज़्यादा / कम) में कठिनाई होती है' },
      { en: 'Has difficulty identifying patterns', hi: 'पैटर्न पहचानने में कठिनाई होती है' },
    ],
    strategies: [
      { en: 'Counting songs', hi: 'गिनती के गीत' },
      { en: 'Number games', hi: 'संख्या के खेल' },
      { en: 'Manipulatives (blocks, beads, coins)', hi: 'हाथ से छूने वाली वस्तुएँ (ब्लॉक, मोती, सिक्के)' },
      { en: 'Sorting activities', hi: 'छाँटने की गतिविधियाँ' },
      { en: 'Visual number lines', hi: 'दृश्य संख्या रेखा' },
      { en: 'Everyday counting opportunities', hi: 'रोज़मर्रा में गिनती के अवसर' },
    ],
    refer: {
      en: 'Numeracy difficulties significantly affect learning.',
      hi: 'गणना संबंधी कठिनाइयाँ सीखने को काफ़ी प्रभावित करें।',
    },
  },
  {
    id: 'cognitive',
    emoji: '🧩',
    color: '#65a30d',
    name: { en: 'Cognitive / Learning Skills', hi: 'संज्ञानात्मक / सीखने के कौशल' },
    definition: {
      en: 'Ability to attend, remember, problem-solve, and learn new information.',
      hi: 'ध्यान देने, याद रखने, समस्या सुलझाने और नई जानकारी सीखने की क्षमता।',
    },
    indicators: [
      { en: 'Has difficulty remembering instructions', hi: 'निर्देश याद रखने में कठिनाई होती है' },
      { en: 'Has poor attention', hi: 'ध्यान कम लगता है' },
      { en: 'Has difficulty solving age-appropriate problems', hi: 'आयु के अनुसार समस्याएँ सुलझाने में कठिनाई होती है' },
      { en: 'Learns new concepts slowly', hi: 'नई बातें धीरे-धीरे सीखता/सीखती है' },
      { en: 'Has difficulty using a skill in a new situation', hi: 'सीखे हुए कौशल को नई स्थिति में उपयोग करने में कठिनाई होती है' },
    ],
    strategies: [
      { en: 'Break tasks into smaller steps', hi: 'काम को छोटे चरणों में बाँटें' },
      { en: 'Use visual supports', hi: 'दृश्य सहायता का उपयोग करें' },
      { en: 'Repeat instructions', hi: 'निर्देश दोहराएँ' },
      { en: 'Hands-on learning', hi: 'करके सीखना' },
      { en: 'Frequent revision', hi: 'बार-बार दोहराव' },
      { en: 'Allow additional processing time', hi: 'सोचने-समझने के लिए अतिरिक्त समय दें' },
    ],
    refer: {
      en: 'Difficulties persist across areas and interfere with progress.',
      hi: 'कठिनाइयाँ कई क्षेत्रों में बनी रहें और प्रगति में बाधा डालें।',
    },
  },
]

export const DOMAIN_BY_ID = Object.fromEntries(DOMAINS.map((d) => [d.id, d]))

export const RATING_OPTIONS: { value: number; label: L }[] = [
  { value: 0, label: { en: 'Never / rarely', hi: 'कभी नहीं / शायद ही' } },
  { value: 1, label: { en: 'Sometimes', hi: 'कभी-कभी' } },
  { value: 2, label: { en: 'Often', hi: 'अक्सर' } },
]

export type Band = 'typical' | 'monitor' | 'support'

export function bandFor(score: number): Band {
  if (score >= 60) return 'support'
  if (score >= 30) return 'monitor'
  return 'typical'
}

export const BAND_STYLE: Record<Band, { label: L; cls: string; dot: string }> = {
  typical: { label: { en: 'Low', hi: 'कम' }, cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-500' },
  monitor: { label: { en: 'Medium', hi: 'मध्यम' }, cls: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-500' },
  support: { label: { en: 'High', hi: 'अधिक' }, cls: 'bg-rose-50 text-rose-700 ring-rose-200', dot: 'bg-rose-500' },
}

/** Score each domain 0–100 (share of the maximum concern rating). Unanswered items are skipped. */
export function scoreChecklist(answers: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {}
  for (const d of DOMAINS) {
    let sum = 0
    let n = 0
    d.indicators.forEach((_, i) => {
      const v = answers[`${d.id}.${i}`]
      if (typeof v === 'number') {
        sum += v
        n++
      }
    })
    if (n > 0) out[d.id] = Math.round((sum / (n * 2)) * 100)
  }
  return out
}
