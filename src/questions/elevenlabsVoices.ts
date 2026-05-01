export interface ElevenLabsVoiceProfile {
  id: string
  name: string
  accent: string
  vibe: string
  /** Persona presentation for portrait art (matches name). */
  avatarGender: 'male' | 'female'
  requiresPaidPlan?: boolean
}

export const ELEVENLABS_VOICES: ElevenLabsVoiceProfile[] = [
  {
    id: 'gJx1vCzNCD1EQHT212Ls',
    name: 'Elena Voss',
    accent: 'Custom',
    vibe: 'Imported from ElevenLabs library',
    avatarGender: 'female',
    requiresPaidPlan: true,
  },
  {
    id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel Park',
    accent: 'US',
    vibe: 'Warm and clear',
    avatarGender: 'female',
  },
  {
    id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Jordan Hayes',
    accent: 'US',
    vibe: 'Confident and energetic',
    avatarGender: 'male',
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Priya Nair',
    accent: 'US',
    vibe: 'Friendly and calm',
    avatarGender: 'female',
  },
  {
    id: 'ErXwobaYiN019PkySvjV',
    name: 'Marcus Webb',
    accent: 'US',
    vibe: 'Balanced and professional',
    avatarGender: 'male',
  },
  {
    id: 'VR6AewLTigWG4xSOukaG',
    name: 'Victor Kane',
    accent: 'US',
    vibe: 'Deep and steady',
    avatarGender: 'male',
  },
]

export const DEFAULT_ELEVENLABS_VOICE_ID = ELEVENLABS_VOICES[0].id
