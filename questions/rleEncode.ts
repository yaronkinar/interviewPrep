/**
 * Explanation:
 * Run-length encoding (RLE) compresses consecutive repeated characters by
 * writing each character followed by its run count.
 *
 * Interview Thinking Process:
 * 1) Handle empty input early.
 * 2) Track previous character and a running count.
 * 3) Iterate once; when character changes, flush previous run.
 * 4) Append final run after loop (or iterate to `<= length` as done here).
 * 5) Discuss complexity: O(n) time, O(n) output space.
 */
function rleEncode(str: string): string {
  if (str.length === 0) return ''

  let out = ''
  let count = 1

  for (let i = 1; i <= str.length; i++) {
    const current = str[i]
    const prev = str[i - 1]
    console.log({current})
    console.log({prev})
    if (current === prev) {
      count++
    } else {
      out += prev + count
      count = 1
    }
  }

  return out
}

//console.log(rleEncode('AAsssRRggggDAA')) // "A2s3R2g4D1A2"
console.log(rleEncode('AA')) // "A2s3R2g4D1A2"
//current = undefind
//prev = a
// out = a2
