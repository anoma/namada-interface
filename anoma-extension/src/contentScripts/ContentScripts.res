%%raw(`
import { Buffer } from 'buffer'
window.global = window
window.Buffer = Buffer
`)

Anoma.Bridge.allowWindowMessaging("com.anoma.network")
