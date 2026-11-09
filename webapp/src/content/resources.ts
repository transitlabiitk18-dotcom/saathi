import type { L } from '../lib/types'

export const RESOURCES: { title: L; source: string; url: string; lang: 'en' | 'hi' | 'both' }[] = [
  {
    title: { en: 'CDC milestone checklists (English)', hi: 'CDC विकास पड़ाव जाँच-सूची (अंग्रेज़ी)' },
    source: 'CDC — Learn the Signs. Act Early.',
    url: 'https://www.cdc.gov/act-early/media/pdfs/2025/10/cdc-milestone-checklists-ltsae-english-508.pdf',
    lang: 'en',
  },
  {
    title: { en: 'CDC milestone checklists (Hindi)', hi: 'CDC विकास पड़ाव जाँच-सूची (हिंदी)' },
    source: 'CDC — Learn the Signs. Act Early.',
    url: 'https://www.cdc.gov/act-early/media/pdfs/2025/11/cdc-milestone-checklists-ltsae-hindi.pdf',
    lang: 'hi',
  },
  {
    title: { en: 'Developmental milestones (CARA / WCD)', hi: 'विकासात्मक पड़ाव (CARA / महिला एवं बाल विकास)' },
    source: 'Ministry of Women & Child Development, India',
    url: 'https://cara.wcd.gov.in/PDF/Circular/Developmenat%20milestones.pdf',
    lang: 'both',
  },
]

/** Sources of the questionnaires used in the app (shown in Settings → Guidelines & references). */
export const REFERENCES: { title: L; source: string; url: string; note: L }[] = [
  {
    title: { en: 'M-CHAT-R (Modified Checklist for Autism in Toddlers, Revised)', hi: 'M-CHAT-R (टॉडलर्स में ऑटिज़्म के लिए संशोधित जाँच-सूची)' },
    source: 'Robins, D. L., Fein, D., & Barton, M. (2009). mchatscreen.com',
    url: 'https://mchatscreen.com/',
    note: {
      en: 'Checklist 1 in this app is inspired by M-CHAT-R (questions reworded by the project team; not the official questionnaire).',
      hi: 'इस ऐप की जाँच-सूची 1 M-CHAT-R से प्रेरित है (प्रश्न परियोजना टीम ने अपने शब्दों में लिखे हैं; आधिकारिक प्रश्नावली नहीं)।',
    },
  },
  {
    title: { en: 'ATEC (Autism Treatment Evaluation Checklist)', hi: 'ATEC (ऑटिज़्म उपचार मूल्यांकन जाँच-सूची)' },
    source: 'Rimland, B., & Edelson, S. M. (1999). Autism Research Institute',
    url: 'https://www.autism.org/autism-treatment-evaluation-checklist/',
    note: {
      en: 'Used in this app as the ATEC questionnaire.',
      hi: 'इस ऐप में ATEC प्रश्नावली के रूप में उपयोग किया गया।',
    },
  },
]
