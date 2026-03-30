export interface ElevenLabsVoiceProfile {
  id: string
  name: string
  accent: string
  vibe: string
  avatarPath: string
  requiresPaidPlan?: boolean
}

export const ELEVENLABS_VOICES: ElevenLabsVoiceProfile[] = [
  {
    id: 'gJx1vCzNCD1EQHT212Ls',
    name: 'Ava',
    accent: 'Custom',
    vibe: 'Imported from ElevenLabs library',
    avatarPath: 'https://api.dicebear.com/9.x/notionists/svg?seed=Ava',
    requiresPaidPlan: true,
  },
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    accent: 'US',
    vibe: 'Warm and clear',
    avatarPath: 'https://api.dicebear.com/9.x/notionists/svg?seed=Rachel',
  },
  {
    id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    accent: 'US',
    vibe: 'Confident and energetic',
    avatarPath: 'https://api.dicebear.com/9.x/notionists/svg?seed=Domi',
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    accent: 'US',
    vibe: 'Friendly and calm',
    avatarPath: 'https://api.dicebear.com/9.x/notionists/svg?seed=Bella',
  },
  {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    accent: 'US',
    vibe: 'Balanced and professional',
    avatarPath: 'https://api.dicebear.com/9.x/notionists/svg?seed=Antoni',
  },
  {
    id: 'VR6AewLTigWG4xSOukaG',
    name: 'Arnold',
    accent: 'US',
    vibe: 'Deep and steady',
    avatarPath: 'https://api.dicebear.com/9.x/notionists/svg?seed=Arnold',
  },
]

export const DEFAULT_ELEVENLABS_VOICE_ID = ELEVENLABS_VOICES[0].id
