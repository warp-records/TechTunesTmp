import { useState, useEffect, useRef, useCallback } from 'react'
import { PitchDetector } from 'pitchy'

const STRING_TARGETS = [
  { note: 'e-low',  freq: 82.41  },
  { note: 'a',      freq: 110.00 },
  { note: 'd',      freq: 146.83 },
  { note: 'g',      freq: 196.00 },
  { note: 'b',      freq: 246.94 },
  { note: 'e-high', freq: 329.63 },
]

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Returns { note: 'A', octave: 4, cents: -12 }
export function findNearestNote(freq) {
  const midi = 12 * Math.log2(freq / 440) + 69
  const rounded = Math.round(midi)
  const cents = Math.round((midi - rounded) * 100)
  return {
    note: NOTE_NAMES[rounded % 12],
    octave: Math.floor(rounded / 12) - 1,
    cents,
  }
}

export function findNearestString(freq) {
  let best = null
  let bestAbsCents = Infinity
  for (const target of STRING_TARGETS) {
    const cents = Math.round(1200 * Math.log2(freq / target.freq))
    if (Math.abs(cents) < bestAbsCents) {
      bestAbsCents = Math.abs(cents)
      best = { note: target.note, cents }
    }
  }
  return best
}

export function useMicPitch() {
  const [listening, setListening] = useState(false)
  const [pitch, setPitch] = useState(null)
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const detectorRef = useRef(null)

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    audioCtxRef.current?.close()
    setListening(false)
    setPitch(null)
  }, [])

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream
    const audioCtx = new AudioContext()
    audioCtxRef.current = audioCtx
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 2048
    analyserRef.current = analyser
    audioCtx.createMediaStreamSource(stream).connect(analyser)
    detectorRef.current = PitchDetector.forFloat32Array(analyser.fftSize)
    setListening(true)

    const buf = new Float32Array(analyser.fftSize)
    function loop() {
      analyser.getFloatTimeDomainData(buf)
      const [frequency, clarity] = detectorRef.current.findPitch(buf, audioCtx.sampleRate)
      if (clarity > 0.9 && frequency > 60 && frequency < 1400) {
        setPitch({ ...findNearestString(frequency), nearestNote: findNearestNote(frequency) })
      } else {
        setPitch(null)
      }
      rafRef.current = requestAnimationFrame(loop)
    }
    loop()
  }, [])

  useEffect(() => () => stop(), [stop])

  return { listening, pitch, toggle: listening ? stop : start }
}
