# Quick Start: Add Signature to Gmail

## The Console Security Warning

When you open the browser console, Chrome/Edge shows a security warning that **blocks pasting**. Here's how to fix it:

### Step 1: Enable Pasting
1. Open Console (F12 → Console tab)
2. **Type exactly:** `allow pasting`
3. Press **Enter**
4. The warning will disappear ✅

### Step 2: Paste the Code
1. Open `gmail-signature-inject.js` file
2. Copy **ALL** the code (Ctrl+A, then Ctrl+C / Cmd+A, then Cmd+C)
3. Paste into the console (Ctrl+V / Cmd+V)
4. Press **Enter**

### Step 3: Complete Setup
1. Make sure Gmail Settings → Signature editor is open
2. You should see: `✅ Signature HTML injected successfully!`
3. Click **Save Changes** in Gmail
4. Test by composing a new email

---

## Why This Happens

Chrome/Edge blocks pasting in the console by default to prevent malicious code injection. Typing `allow pasting` tells the browser you understand what you're doing.

---

## Troubleshooting

**Still can't paste?**
- Make sure you typed `allow pasting` exactly (lowercase, with space)
- Press Enter after typing it
- Try refreshing the page and opening console again

**Code not working?**
- Make sure Gmail signature editor is open and visible
- Check that you copied the ENTIRE file content
- Look for error messages in the console

---

**That's it!** Once you type `allow pasting`, you can paste the JavaScript code normally.