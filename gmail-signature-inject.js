// Gmail Signature HTML Injector
// Instructions:
// 1. Open Gmail Settings → Signature section
// 2. Open/create a signature (leave the editor open)
// 3. Open Browser Console (F12 → Console tab)
// 4. Paste this entire code and press Enter
// 5. Click "Save Changes" in Gmail

(function() {
  // Find the signature editor
  const editor = document.querySelector('div[contenteditable="true"][aria-label*="Signature"]') || 
                 document.querySelector('div[contenteditable="true"][aria-label*="signature"]') ||
                 document.querySelector('div[contenteditable="true"]') ||
                 document.querySelector('textarea[name*="signature"]') ||
                 document.querySelector('iframe[title*="Rich Text Area"]')?.contentDocument?.body;

  if (!editor) {
    console.error('❌ Could not find signature editor. Make sure:');
    console.error('   1. Gmail Settings → Signature section is open');
    console.error('   2. A signature is selected/created (editor is visible)');
    console.error('   3. Try refreshing the page and opening signature editor again');
    return;
  }

  // Your HTML signature
  const signatureHTML = `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1A1A1A; max-width: 600px;">
    <tr>
        <td style="padding: 0;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                    <td valign="top" style="padding-right: 24px; padding-bottom: 16px;">
                        <a href="https://www.tutoglobal.com" style="text-decoration: none; display: block;">
                            <img src="https://www.tutoglobal.com/images/tuto-logo.png" alt="tuto." width="140" style="display: block; border: none; height: auto; max-width: 140px;" />
                        </a>
                    </td>
                    <td valign="top" style="padding-left: 24px; border-left: 2px solid #E5E5E5;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                                <td style="padding-bottom: 8px;">
                                    <span style="font-size: 18px; font-weight: 700; color: #1A1A1A; letter-spacing: -0.3px;">Tarun Tageja</span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-bottom: 16px;">
                                    <span style="font-size: 14px; font-weight: 500; color: #666666;">Founder</span>
                                </td>
                            </tr>
                        </table>
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                                <td style="padding-bottom: 6px;">
                                    <a href="mailto:tarun@tutoglobal.com" style="text-decoration: none; color: #0B5FFF; font-size: 13px; display: inline-block;">
                                        <span style="color: #0B5FFF; margin-right: 6px;">✉</span>
                                        <span style="color: #0B5FFF; text-decoration: none;">tarun@tutoglobal.com</span>
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-bottom: 6px;">
                                    <a href="tel:+840349640253" style="text-decoration: none; color: #0B5FFF; font-size: 13px; display: inline-block;">
                                        <span style="color: #0B5FFF; margin-right: 6px;">📞</span>
                                        <span style="color: #0B5FFF; text-decoration: none;">+84 0349640253</span>
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-bottom: 6px;">
                                    <a href="https://www.tutoglobal.com" target="_blank" style="text-decoration: none; color: #0B5FFF; font-size: 13px; display: inline-block;">
                                        <span style="color: #0B5FFF; margin-right: 6px;">🌐</span>
                                        <span style="color: #0B5FFF; text-decoration: none;">tutoglobal.com</span>
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-bottom: 0;">
                                    <a href="https://www.linkedin.com/in/yourprofile" target="_blank" style="text-decoration: none; color: #0B5FFF; font-size: 13px; display: inline-block;">
                                        <span style="color: #0B5FFF; margin-right: 6px;">🔗</span>
                                        <span style="color: #0B5FFF; text-decoration: none;">LinkedIn</span>
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>`;

  // Function to safely set HTML (handles TrustedHTML restrictions)
  function setHTMLSafely(element, html) {
    try {
      // Method 1: Try insertAdjacentHTML (often bypasses TrustedHTML)
      element.insertAdjacentHTML('afterbegin', html);
      // Clear existing content first
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
      element.insertAdjacentHTML('afterbegin', html);
      return true;
    } catch (e1) {
      try {
        // Method 2: Use DOMParser
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const body = doc.body;
        while (element.firstChild) {
          element.removeChild(element.firstChild);
        }
        while (body.firstChild) {
          element.appendChild(body.firstChild);
        }
        return true;
      } catch (e2) {
        try {
          // Method 3: Create temporary container
          const temp = document.createElement('div');
          temp.innerHTML = html;
          while (element.firstChild) {
            element.removeChild(element.firstChild);
          }
          while (temp.firstChild) {
            element.appendChild(temp.firstChild);
          }
          return true;
        } catch (e3) {
          // Method 4: Direct innerHTML with try-catch (last resort)
          try {
            element.innerHTML = html;
            return true;
          } catch (e4) {
            console.error('All methods failed:', e4);
            return false;
          }
        }
      }
    }
  }

  // Handle iframe (Gmail sometimes uses iframes)
  if (editor.tagName === 'BODY' && editor.closest('iframe')) {
    if (setHTMLSafely(editor, signatureHTML)) {
      // Trigger input event
      const iframe = editor.closest('iframe');
      iframe.contentWindow.dispatchEvent(new Event('input', { bubbles: true }));
    }
  } else {
    // Regular div/textarea
    if (setHTMLSafely(editor, signatureHTML)) {
      // Trigger events so Gmail recognizes the change
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      editor.dispatchEvent(new Event('change', { bubbles: true }));
      
      // For contenteditable divs
      if (editor.contentEditable === 'true') {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else {
      console.error('❌ Failed to inject HTML. Try refreshing the page.');
      return;
    }
  }

  console.log('✅ Signature HTML injected successfully!');
  console.log('👉 Now click "Save Changes" button in Gmail settings');
  console.log('👉 Then compose a new email to test your signature');
})();