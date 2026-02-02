# Gmail Signature Setup Instructions

## Step-by-Step Guide

### 1. Open Gmail Settings
   - Go to [Gmail](https://mail.google.com)
   - Click the **Settings** gear icon (⚙️) in the top right corner
   - Select **See all settings**

### 2. Navigate to Signature Section
   - Scroll down to the **Signature** section (under "General" tab)
   - You'll see options for different email addresses if you have multiple accounts

### 3. Create or Edit Signature
   - Click **Create new** or select an existing signature to edit
   - Name your signature (e.g., "Main Signature")

### 4. Copy the HTML Code
   - Open the `email-signature.html` file
   - Copy **ONLY** the content between the `<!-- START EMAIL SIGNATURE -->` and `<!-- END EMAIL SIGNATURE -->` comments
   - **Do NOT copy the entire HTML file** - just the table structure inside

### 5. Paste into Gmail
   - In the Gmail signature editor, click the **Formatting options** button (looks like "A" with underline)
   - Make sure you're in **Rich text mode** (not plain text)
   - Paste the copied HTML code directly into the signature box
   - Gmail will automatically render it

### 6. Preview and Adjust
   - Scroll down and click **Save Changes**
   - Compose a new email to test your signature
   - The signature should appear automatically at the bottom

### 7. Set as Default (Optional)
   - In the signature settings, you can choose:
     - **No signature** (for replies/forwards)
     - Your new signature (for new emails)
   - Set it as default for new emails

## Important Notes

### Before Pasting:
1. **Update LinkedIn URL**: Replace `https://www.linkedin.com/in/yourprofile` with your actual LinkedIn profile URL in the HTML file before copying
2. **Test the Logo**: The logo should load from `https://www.tutoglobal.com/images/tuto-logo.png`
3. **Email Client Compatibility**: This signature uses table-based layout for maximum email client compatibility

### Troubleshooting:

**Logo not showing?**
- Check that the URL is correct: `https://www.tutoglobal.com/images/tuto-logo.png`
- Some email clients block external images by default
- Recipients may need to click "Display images" in their email client

**Formatting looks wrong?**
- Make sure you copied only the table HTML (between START and END comments)
- Ensure you're in Rich text mode in Gmail
- Try refreshing and re-pasting

**Signature too wide?**
- Adjust the `max-width: 600px;` value in the outer table style
- Or change `width="140"` on the logo image to make it smaller

## Alternative: Using Gmail's Visual Editor

If the HTML paste doesn't work well, you can:
1. Use Gmail's visual editor to recreate the layout
2. Insert the logo image manually using the image button
3. Format text using Gmail's formatting tools
4. This method is less precise but more compatible

## Mobile Considerations

- The signature will automatically adapt to mobile screens
- Links are touch-friendly
- Logo will scale appropriately

---

**Need to update your signature?** Just edit the HTML file and re-paste into Gmail settings.