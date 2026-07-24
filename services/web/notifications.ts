import { Platform } from 'react-native';

/**
 * Show an alert/toast on web.
 * Uses inline toast instead of Alert.alert which doesn't work on web.
 */
export function showAlert(
  title: string,
  message: string,
  options?: { onDismiss?: () => void }
): void {
  if (Platform.OS !== 'web') {
    const { Alert } = require('react-native');
    Alert.alert(title, message, [
      { text: 'OK', onPress: options?.onDismiss },
    ]);
    return;
  }

  // Web implementation: create inline toast
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #1e293b;
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: Montserrat, sans-serif;
    max-width: 400px;
    animation: slideIn 0.3s ease-out;
  `;

  toast.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
    <div style="font-size: 14px; opacity: 0.9;">${message}</div>
  `;

  // Add animation keyframes
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      options?.onDismiss?.();
    }, 300);
  }, 3000);

  // Click to dismiss
  toast.addEventListener('click', () => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
    options?.onDismiss?.();
  });
}
