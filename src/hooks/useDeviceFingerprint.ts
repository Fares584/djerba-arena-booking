
export function useDeviceFingerprint() {
  const getDeviceFingerprint = (): string => {
    try {
      // Collecte d'informations sur l'appareil
      const screen = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const language = navigator.language;
      const platform = navigator.platform;
      const userAgent = navigator.userAgent;
      const cookieEnabled = navigator.cookieEnabled;
      const doNotTrack = navigator.doNotTrack;
      
      // Détection des plugins
      const plugins = Array.from(navigator.plugins)
        .map(plugin => plugin.name)
        .sort()
        .join(',');
      
      // Canvas fingerprinting (léger)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint 2024', 2, 2);
      }
      const canvasFingerprint = canvas.toDataURL();
      
      // WebGL fingerprinting avec typage correct
      const gl = canvas.getContext('webgl') as WebGLRenderingContext | null || 
                 canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
      let webglFingerprint = '';
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          webglFingerprint = `${gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)}_${gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)}`;
        }
      }
      
      // Combine toutes les informations
      const fingerprint = `${screen}_${timezone}_${language}_${platform}_${cookieEnabled}_${doNotTrack}_${plugins}_${canvasFingerprint.slice(-50)}_${webglFingerprint}`;
      
      // Génère un hash simple mais efficace
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      return Math.abs(hash).toString(36);
    } catch (error) {
      console.error('Erreur lors de la génération du fingerprint:', error);
      // Fallback vers un ID de session
      return `fallback_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    }
  };

  return { getDeviceFingerprint };
}
