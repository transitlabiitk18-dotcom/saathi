import type { L, Routine } from '../lib/types'

export const EMOJI_PALETTE = [
  '🌅', '🛏️', '🚽', '🪥', '🛁', '🚿', '👕', '👟', '🎒', '🍳', '🥛', '🍎', '🍽️', '🥪',
  '🚌', '🚗', '🛺', '🚶', '🏫', '🏠', '🏥', '🧑‍⚕️', '🧑‍🏫', '👵', '👴', '👨‍👩‍👧', '👋', '🤝',
  '⚽', '🛝', '🧩', '🎨', '📖', '🎵', '📺', '🧸', '🎂', '🎁', '🎉', '🛒', '💈', '✂️',
  '😴', '🌙', '⏰', '✅', '⭐', '🔊', '🤫', '🙏', '❤️',
]

interface Template {
  title: L
  kind: Routine['kind']
  time?: string
  slides: { emoji: string; caption: L }[]
}

export const ROUTINE_TEMPLATES: Template[] = [
  {
    title: { en: 'Morning routine', hi: 'सुबह की दिनचर्या' },
    kind: 'daily',
    time: '07:00',
    slides: [
      { emoji: '🌅', caption: { en: 'Wake up', hi: 'उठना' } },
      { emoji: '🚽', caption: { en: 'Go to the toilet', hi: 'शौचालय जाना' } },
      { emoji: '🪥', caption: { en: 'Brush teeth', hi: 'दाँत साफ़ करना' } },
      { emoji: '🛁', caption: { en: 'Take a bath', hi: 'नहाना' } },
      { emoji: '👕', caption: { en: 'Get dressed', hi: 'कपड़े पहनना' } },
      { emoji: '🍳', caption: { en: 'Eat breakfast', hi: 'नाश्ता करना' } },
      { emoji: '🎒', caption: { en: 'Pack the bag', hi: 'बैग तैयार करना' } },
      { emoji: '🚌', caption: { en: 'Go to the centre', hi: 'केंद्र जाना' } },
    ],
  },
  {
    title: { en: 'Evening play time', hi: 'शाम का खेल' },
    kind: 'daily',
    time: '16:00',
    slides: [
      { emoji: '🥛', caption: { en: 'Have milk and a snack', hi: 'दूध और नाश्ता' } },
      { emoji: '👟', caption: { en: 'Wear shoes', hi: 'जूते पहनना' } },
      { emoji: '🛝', caption: { en: 'Play in the park', hi: 'पार्क में खेलना' } },
      { emoji: '🏠', caption: { en: 'Come back home', hi: 'घर वापस आना' } },
      { emoji: '🧼', caption: { en: 'Wash hands', hi: 'हाथ धोना' } },
    ],
  },
  {
    title: { en: 'Birthday party (change in routine)', hi: 'जन्मदिन की पार्टी (दिनचर्या में बदलाव)' },
    kind: 'event',
    time: '16:00',
    slides: [
      { emoji: '⏰', caption: { en: 'Today we will NOT go to the park', hi: 'आज हम पार्क नहीं जाएँगे' } },
      { emoji: '🚗', caption: { en: 'We will go to a party by car', hi: 'हम गाड़ी से पार्टी में जाएँगे' } },
      { emoji: '👋', caption: { en: 'We will say hello to everyone', hi: 'हम सबको नमस्ते कहेंगे' } },
      { emoji: '🔊', caption: { en: 'It may be loud. I can cover my ears', hi: 'शोर हो सकता है। मैं कान ढक सकता हूँ' } },
      { emoji: '🎂', caption: { en: 'Everyone will sing and cut the cake', hi: 'सब गाना गाएँगे और केक काटेंगे' } },
      { emoji: '🍽️', caption: { en: 'We will eat food', hi: 'हम खाना खाएँगे' } },
      { emoji: '🏠', caption: { en: 'Then we come back home', hi: 'फिर हम घर वापस आएँगे' } },
    ],
  },
  {
    title: { en: 'Doctor visit', hi: 'डॉक्टर के पास जाना' },
    kind: 'event',
    slides: [
      { emoji: '🚗', caption: { en: 'We will go to the hospital', hi: 'हम अस्पताल जाएँगे' } },
      { emoji: '🪑', caption: { en: 'We wait for our turn', hi: 'हम अपनी बारी का इंतज़ार करेंगे' } },
      { emoji: '🧑‍⚕️', caption: { en: 'The doctor will say hello', hi: 'डॉक्टर नमस्ते कहेंगे' } },
      { emoji: '🩺', caption: { en: 'The doctor will listen to my heart', hi: 'डॉक्टर मेरी धड़कन सुनेंगे' } },
      { emoji: '⭐', caption: { en: 'I did well! Now we go home', hi: 'मैंने अच्छा किया! अब हम घर जाएँगे' } },
    ],
  },
]
