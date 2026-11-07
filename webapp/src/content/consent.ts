import type { L } from '../lib/types'

// Basic consent (v1). If the wording changes, bump CONSENT_VERSION so every user is asked to consent again.
export const CONSENT_VERSION = 'v1'

export const GENERAL_CONSENT: { title: L; points: L[] } = {
  title: { en: 'Consent to use the app', hi: 'ऐप उपयोग की सहमति' },
  points: [
    {
      en: 'I am the parent or guardian of the child, or I have their permission to record information about the child.',
      hi: 'मैं बच्चे का/की माता-पिता या अभिभावक हूँ, या मुझे बच्चे की जानकारी दर्ज करने की उनकी अनुमति है।',
    },
    {
      en: 'I agree to record information about the child in this app: daily tracking, incidents, questionnaire answers and intervention records.',
      hi: 'मैं इस ऐप में बच्चे की जानकारी दर्ज करने के लिए सहमत हूँ: दैनिक ट्रैकिंग, घटनाएँ, प्रश्नावली उत्तर और हस्तक्षेप रिकॉर्ड।',
    },
    {
      en: 'This information is stored securely online and is visible only to people who joined the child’s profile with its join code.',
      hi: 'यह जानकारी सुरक्षित रूप से ऑनलाइन रखी जाती है और केवल उन्हीं लोगों को दिखती है जो बच्चे के जुड़ने वाले कोड से जुड़े हैं।',
    },
    {
      en: 'This app supports, but does not replace, assessment and advice from a doctor or therapist.',
      hi: 'यह ऐप डॉक्टर या थेरेपिस्ट के आकलन और सलाह में मदद करता है, उनकी जगह नहीं लेता।',
    },
    {
      en: 'Taking part is voluntary. I can stop at any time, download my data, or delete my account from Settings.',
      hi: 'भाग लेना स्वैच्छिक है। मैं कभी भी रुक सकता/सकती हूँ, सेटिंग्स से अपना डेटा डाउनलोड या खाता हटा सकता/सकती हूँ।',
    },
  ],
}

export const RESEARCHER_CONSENT: { title: L; points: L[] } = {
  title: { en: 'Researcher agreement', hi: 'शोधकर्ता सहमति' },
  points: [
    {
      en: 'I will run studies in this app only with the required ethics approval and with each family’s consent.',
      hi: 'मैं इस ऐप में अध्ययन केवल आवश्यक नैतिक स्वीकृति और हर परिवार की सहमति से ही चलाऊँगा/चलाऊँगी।',
    },
    {
      en: 'I will keep participants’ data confidential and use it only for the stated study.',
      hi: 'मैं प्रतिभागियों का डेटा गोपनीय रखूँगा/रखूँगी और केवल बताए गए अध्ययन के लिए उपयोग करूँगा/करूँगी।',
    },
    {
      en: 'I will act on withdrawal requests promptly, including deleting research data when asked.',
      hi: 'मैं हटने के अनुरोधों पर तुरंत कार्य करूँगा/करूँगी, माँगे जाने पर शोध डेटा हटाने सहित।',
    },
    {
      en: 'Tasks and interventions I assign support, but do not replace, a clinician’s care.',
      hi: 'मेरे दिए कार्य और हस्तक्षेप चिकित्सक की देखभाल में मदद करते हैं, उसकी जगह नहीं लेते।',
    },
  ],
}

export const RESEARCH_CONSENT: { title: L; body: L } = {
  title: { en: 'Research (optional)', hi: 'शोध (वैकल्पिक)' },
  body: {
    en: 'I agree that information recorded in this app, without the child’s name, may be used by the IIT Kanpur research team to study child development and intervention outcomes. Saying no does not affect my use of the app. Joining a specific study is asked for separately.',
    hi: 'मैं सहमत हूँ कि इस ऐप में दर्ज जानकारी, बच्चे के नाम के बिना, IIT कानपुर की शोध टीम द्वारा बाल विकास और हस्तक्षेप परिणामों के अध्ययन के लिए उपयोग की जा सकती है। मना करने से ऐप के उपयोग पर कोई असर नहीं पड़ेगा। किसी विशेष अध्ययन में जुड़ने की सहमति अलग से ली जाती है।',
  },
}
