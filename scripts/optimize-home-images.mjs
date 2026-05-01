/**
 * Compress home hero OG + module card art, and mock-interviewer voice avatars.
 */
import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'

const pub = path.join(process.cwd(), 'public')

/**
 * @param {string} input
 * @param {string} output
 * @param {(s: import('sharp').Sharp) => import('sharp').Sharp} transform
 */
async function processFile(input, output, transform) {
  const pipeline = transform(sharp(input))
  await pipeline.webp({ quality: 80, alphaQuality: 80, smartSubsample: true }).toFile(output)

  const [inStat, outStat] = await Promise.all([fs.stat(input), fs.stat(output)])
  const beforeKb = Math.round(inStat.size / 1024)
  const afterKb = Math.round(outStat.size / 1024)
  console.log(`${path.relative(process.cwd(), input)}: ${beforeKb} KB → ${path.basename(output)}: ${afterKb} KB`)

  await fs.unlink(input)
}

async function main() {
  const names = await fs.readdir(pub)
  const targets = names.filter((f) => /^home-section-.*\.png$/.test(f) || f === 'og-interview-prep-home.png')

  for (const name of targets) {
    const input = path.join(pub, name)
    const output = input.replace(/\.png$/i, '.webp')
    const isOg = name.startsWith('og-')

    await processFile(input, output, (s) => {
      if (isOg) return s.resize(1200, 630, { fit: 'cover', position: 'centre' })
      return s.resize({
        width: 640,
        fit: 'inside',
        withoutEnlargement: true,
      })
    })
  }

  const voiceDir = path.join(pub, 'voice-avatars')
  let voiceTargets = []
  try {
    const vf = await fs.readdir(voiceDir)
    voiceTargets = vf.filter((f) => /^voice-mock-interviewer-\d{2}\.png$/i.test(f))
  } catch (e) {
    if (e && typeof e === 'object' && 'code' in e && e.code !== 'ENOENT') throw e
  }

  for (const name of voiceTargets) {
    const input = path.join(voiceDir, name)
    const output = input.replace(/\.png$/i, '.webp')
    await processFile(input, output, (s) => s.resize(256, 256, { fit: 'cover', position: 'centre' }))
  }

  console.log(`Done (${targets.length} home + ${voiceTargets.length} voice avatars).`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
