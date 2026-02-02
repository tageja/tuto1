# How to Add HTML Signature to Gmail

**Gmail's signature editor doesn't accept raw HTML directly.** You need to inject it using browser developer tools.

## Quick Method (Recommended)

### Step 1: Open Gmail Signature Settings
1. Go to [Gmail](https://mail.google.com)
2. Click **Settings** (⚙️) → **See all settings**
3. Scroll to **Signature** section
4. Click **Create new** or select existing signature
5. **IMPORTANT:** Leave the signature editor open and visible on screen

### Step 2: Open Browser Console
- **Chrome/Edge**: Press `F12` → Click **Console** tab
- **Mac**: `Cmd+Option+I` → Click **Console** tab
- **Windows**: `Ctrl+Shift+I` → Click **Console** tab

### Step 3: Paste the JavaScript Code
1. Open the file `gmail-signature-inject.js` in this folder
2. **Copy the ENTIRE contents** of that file
3. **Paste it into the Console** (the bottom panel)
4. Press **Enter**

### Step 4: Save in Gmail
1. You should see: `✅ Signature HTML injected successfully!`
2. Go back to Gmail settings
3. Click **Save Changes** button
4. Compose a new email to test!

---

## Alternative: Manual Method (If JavaScript doesn't work)

### Step 1: Open Gmail Settings
1. Go to [Gmail](https://mail.google.com)
2. Click **Settings** (⚙️) → **See all settings**
3. Scroll to **Signature** section
4. Click **Create new** or select existing signature

### Step 2: Open Browser Developer Console
- **Chrome/Edge**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- **Firefox**: Press `F12` or `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)

### Step 3: Find the Signature Editor Element
1. In the Developer Console, click the **Elements** tab (or Inspector)
2. Click the **Select Element** tool (cursor icon) or press `Ctrl+Shift+C` / `Cmd+Shift+C`
3. Click inside the Gmail signature text box
4. You should see the element highlighted - it's usually a `<div>` with `contenteditable="true"` or a `<textarea>`

### Step 4: Inject the HTML Manually
1. In the Console tab, paste this code:

```javascript
// Find the signature editor
const editor = document.querySelector('div[contenteditable="true"][aria-label*="Signature"]') || 
               document.querySelector('div[contenteditable="true"]') ||
               document.querySelector('textarea[name*="signature"]');

if (editor) {
  // Your HTML signature code here
  editor.innerHTML = `
    <table cellpadding="0" cellspacing="0" border="0" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1A1A1A; max-width: 600px;">
        <tr>
            <td style="padding: 0;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr>
                        <td valign="top" style="padding-right: 24px; padding-bottom: 16px;">
                            <a href="https://www.tutoglobal.com" style="text-decoration: none; display: block;">
                                <img src="https://www.tutoglobal.com/images/tuto-logo.png" alt="tuto." width="140" height="auto" style="display: block; border: none; height: auto; max-width: 140px;" />
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
    </table>
  `;
  
  // Trigger change event so Gmail saves it
  editor.dispatchEvent(new Event('input', { bubbles: true }));
  console.log('Signature updated! Now click Save Changes in Gmail.');
} else {
  console.error('Could not find signature editor. Make sure the signature editor is open and visible.');
}
```

2. Press **Enter** to execute
3. You should see the signature render in the editor
4. Click **Save Changes** in Gmail

---

## Method 2: Using a Browser Extension

### Option A: Signature HTML Injector Extension
1. Install a Chrome extension like "Signature HTML" or "HTML Signature for Gmail"
2. Use the extension to inject your HTML code

### Option B: Use an External Tool
1. Use a tool like [HubSpot Email Signature Generator](https://www.hubspot.com/email-signature-generator) or similar
2. Copy the generated HTML
3. Use Method 1 above to inject it

---

## Method 3: Manual Visual Editor (Simpler but Less Control)

If the above methods don't work, you can manually recreate it:

1. **Add Logo:**
   - Click the image icon in Gmail's signature editor
   - Paste: `https://www.tutoglobal.com/images/tuto-logo.png`
   - Set width to 140px

2. **Add Text:**
   - Type your name, title, and contact info
   - Use Gmail's formatting tools to style it
   - Add links using the link button

3. **Layout:**
   - Use spaces and line breaks to position elements
   - Gmail's visual editor has limited layout control

---

## Troubleshooting

**Signature still shows as code?**
- Make sure you're using Method 1 (Developer Console)
- Check that you're pasting into the Console tab, not the signature box
- Ensure the signature editor is open and visible before running the script

**Logo not showing?**
- The URL is correct: `https://www.tutoglobal.com/images/tuto-logo.png`
- Some email clients block external images - this is normal
- Recipients will see a placeholder until they click "Display images"

**Formatting looks wrong?**
- Gmail may strip some CSS
- Try Method 3 (Visual Editor) for better compatibility
- Test by sending yourself an email

---

**Quick Tip:** After injecting HTML, always test by composing a new email to yourself!