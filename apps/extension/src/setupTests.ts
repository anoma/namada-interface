import { TextEncoder, TextDecoder } from "util";
import "fake-indexeddb/auto";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;
