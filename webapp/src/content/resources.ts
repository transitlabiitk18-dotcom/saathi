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
