export function getShareUrl(): string {
  return window.location.origin;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

export async function shareLink(url: string, title: string, text: string): Promise<boolean> {
  // Check if Web Share API is supported
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return true;
    } catch (error) {
      // User cancelled or error occurred
      if ((error as Error).name === 'AbortError') {
        // User cancelled, not an error
        return false;
      }
      console.error('Error sharing:', error);
      // Fall back to copying the full message if text contains the url, otherwise just the url
      if (text.includes(url)) {
        return await copyToClipboard(text);
      }
      return await copyToClipboard(url);
    }
  } else {
    // Web Share API not supported, fall back to copying
    // If text contains the url, copy the full message; otherwise just the url
    if (text.includes(url)) {
      return await copyToClipboard(text);
    }
    return await copyToClipboard(url);
  }
}
