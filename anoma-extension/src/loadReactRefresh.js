import "http://localhost:3303/@vite/client"
import RefreshRuntime from "http://localhost:3303/@react-refresh"

RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => type => type
window.__vite_plugin_react_preamble_installed__ = true
