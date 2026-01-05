# 🌐 Legal Documents Hosting Guide

**For:** Tuto Education Platform  
**Domain:** tutoglobal.com  
**Date:** December 26, 2024

---

## 📋 What You Have

✅ **3 Legal Documents Created:**
1. `legal/privacy-policy.md` (8,000+ words, COPPA/FERPA compliant)
2. `legal/terms-of-service.md` (7,000+ words)
3. `legal/data-retention-policy.md` (3,000+ words)

✅ **App URLs Updated:**
- Privacy Policy: `https://tutoglobal.com/privacy`
- Terms of Service: `https://tutoglobal.com/terms`
- Data Retention: `https://tutoglobal.com/data-retention`

---

## 🎯 Your Goal

Host these 3 documents at:
- `https://tutoglobal.com/privacy`
- `https://tutoglobal.com/terms`
- `https://tutoglobal.com/data-retention`

So Apple reviewers can access them when reviewing your app.

---

## 🚀 Quick Start (Recommended Methods)

### Method 1: GitHub Pages (FREE, Easiest)
**Best for:** Quick deployment, technical users  
**Cost:** Free  
**Time:** 15-20 minutes

### Method 2: Vercel/Netlify (FREE, Professional)
**Best for:** Professional hosting, custom domain  
**Cost:** Free  
**Time:** 20-30 minutes

### Method 3: Wordpress/CMS (EASIEST, Non-Technical)
**Best for:** Non-technical users, existing website  
**Cost:** ~$10-50/year  
**Time:** 30 minutes

---

## 📖 Detailed Instructions

---

## METHOD 1: GitHub Pages (Recommended)

### Step 1: Create HTML Files

You have 2 options:

**Option A: Use Online Converter (Easiest)**

1. Go to https://markdowntohtml.com
2. Copy content from `legal/privacy-policy.md`
3. Paste and convert to HTML
4. Save as `privacy.html`
5. Repeat for `terms-of-service.md` → `terms.html`
6. Repeat for `data-retention-policy.md` → `data-retention.html`

**Option B: Use Command Line (If you have Node.js)**

```bash
# Install markdown converter
npm install -g markdown-it

# Convert files
markdown-it legal/privacy-policy.md > privacy.html
markdown-it legal/terms-of-service.md > terms.html
markdown-it legal/data-retention-policy.md > data-retention.html
```

### Step 2: Create GitHub Repository

1. Go to https://github.com
2. Click "New Repository"
3. Name it: `tuto-legal` (or anything you want)
4. Make it **Public**
5. Click "Create Repository"

### Step 3: Upload Files

**Option A: Via GitHub Website**
1. Click "uploading an existing file"
2. Drag and drop your 3 HTML files
3. Commit changes

**Option B: Via Git Command Line**
```bash
git clone https://github.com/YOUR-USERNAME/tuto-legal.git
cd tuto-legal
cp /path/to/privacy.html .
cp /path/to/terms.html .
cp /path/to/data-retention.html .
git add .
git commit -m "Add legal documents"
git push
```

### Step 4: Enable GitHub Pages

1. Go to repository Settings
2. Scroll to "Pages" section
3. Source: Deploy from branch
4. Branch: `main` (or `master`)
5. Folder: `/ (root)`
6. Click "Save"

### Step 5: Access Your Pages

Your documents will be available at:
- `https://YOUR-USERNAME.github.io/tuto-legal/privacy.html`
- `https://YOUR-USERNAME.github.io/tuto-legal/terms.html`
- `https://YOUR-USERNAME.github.io/tuto-legal/data-retention.html`

### Step 6: Set Up Custom Domain

**To use tutoglobal.com:**

1. In GitHub Pages settings:
   - Enter custom domain: `tutoglobal.com`
   - Click "Save"

2. In your domain registrar (where you bought tutoglobal.com):
   - Add CNAME record:
     - Name: `www`
     - Value: `YOUR-USERNAME.github.io`
   - Add A records for root domain:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`

3. Wait 5-60 minutes for DNS propagation

4. Access at:
   - `https://tutoglobal.com/privacy.html`
   - `https://tutoglobal.com/terms.html`
   - `https://tutoglobal.com/data-retention.html`

### Step 7: Remove .html Extension (Optional)

Create an `index.html` with redirects or use a Jekyll-based site.

**Simple Solution:** Create subdirectories:
```
/privacy/index.html
/terms/index.html
/data-retention/index.html
```

Then URLs become:
- `https://tutoglobal.com/privacy`
- `https://tutoglobal.com/terms`
- `https://tutoglobal.com/data-retention`

---

## METHOD 2: Vercel (Professional, Free)

### Step 1: Sign Up for Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel

### Step 2: Create Project Structure

```
tuto-legal/
├── public/
│   ├── privacy.html
│   ├── terms.html
│   └── data-retention.html
├── vercel.json
└── package.json
```

### Step 3: Create vercel.json

```json
{
  "rewrites": [
    { "source": "/privacy", "destination": "/privacy.html" },
    { "source": "/terms", "destination": "/terms.html" },
    { "source": "/data-retention", "destination": "/data-retention.html" }
  ]
}
```

This removes `.html` from URLs!

### Step 4: Deploy

**Option A: Via Vercel Website**
1. Click "New Project"
2. Import Git Repository
3. Deploy

**Option B: Via CLI**
```bash
npm i -g vercel
cd tuto-legal
vercel
```

### Step 5: Add Custom Domain

1. In Vercel dashboard → Settings → Domains
2. Add `tutoglobal.com`
3. Follow DNS instructions from Vercel
4. Wait for verification

Your docs will be at:
- `https://tutoglobal.com/privacy` ✅
- `https://tutoglobal.com/terms` ✅
- `https://tutoglobal.com/data-retention` ✅

---

## METHOD 3: WordPress/Traditional Hosting

### If You Have WordPress:

1. **Create 3 New Pages:**
   - Pages → Add New
   - Title: "Privacy Policy"
   - Slug: `privacy`
   - Copy markdown content, convert to HTML or use as-is
   - Publish

2. **Set Permalinks:**
   - Settings → Permalinks
   - Choose "Post name"
   - Save

3. **Pages Available At:**
   - `https://tutoglobal.com/privacy`
   - `https://tutoglobal.com/terms`
   - `https://tutoglobal.com/data-retention`

### If You Have cPanel/FTP Hosting:

1. **Convert Markdown to HTML** (see Method 1, Step 1)

2. **Upload via FTP:**
   - Connect to your hosting
   - Upload to `public_html/` or `www/`
   - Create folders: `/privacy`, `/terms`, `/data-retention`
   - Upload `privacy.html` as `index.html` in `/privacy` folder

3. **Result:**
   - `https://tutoglobal.com/privacy`
   - `https://tutoglobal.com/terms`
   - `https://tutoglobal.com/data-retention`

---

## 🎨 Optional: Style Your HTML

Add this `<style>` section to the `<head>` of each HTML file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy - Tuto Education Platform</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 {
            color: #0B5FFF;
            border-bottom: 3px solid #0B5FFF;
            padding-bottom: 10px;
        }
        h2 {
            color: #0B5FFF;
            margin-top: 30px;
        }
        h3 {
            color: #555;
        }
        a {
            color: #0B5FFF;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #0B5FFF;
            color: white;
        }
        .last-updated {
            font-style: italic;
            color: #666;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
        }
    </style>
</head>
<body>
    <!-- Your content here -->
</body>
</html>
```

This gives your legal pages the same blue theme as your app!

---

## ✅ Verification Checklist

Before submitting to Apple App Store, verify:

### Test Your URLs

- [ ] Open `https://tutoglobal.com/privacy` in incognito mode
- [ ] Open `https://tutoglobal.com/terms` in incognito mode
- [ ] Open `https://tutoglobal.com/data-retention` in incognito mode

### Check Accessibility

- [ ] Pages load without login required
- [ ] Pages display correctly on mobile
- [ ] Pages display correctly on desktop
- [ ] HTTPS is working (green lock icon)

### Verify Content

- [ ] Privacy Policy mentions "Tuto Education Platform"
- [ ] Privacy Policy has your contact email (support@tutoglobal.com)
- [ ] Terms of Service is complete and readable
- [ ] Data Retention Policy is accessible

### Test from App

- [ ] Open app settings → About & Legal
- [ ] Click "Privacy Policy" link
- [ ] Verify it opens the correct page
- [ ] Click "Terms of Service" link
- [ ] Verify it opens the correct page

---

## 🔧 Troubleshooting

### Problem: Domain not working

**Solution:**
- Wait 24-48 hours for DNS propagation
- Check DNS settings with https://dnschecker.org
- Verify CNAME/A records are correct

### Problem: 404 Not Found

**Solution:**
- Check file names match exactly (case-sensitive)
- Verify files are in correct directory
- Clear browser cache
- Check web server configuration

### Problem: "Not Secure" warning

**Solution:**
- Enable HTTPS/SSL certificate
- GitHub Pages: Enable "Enforce HTTPS" in settings
- Vercel: SSL is automatic
- Traditional hosting: Install Let's Encrypt certificate

### Problem: Pages not updating

**Solution:**
- Clear browser cache (Ctrl+Shift+Del)
- GitHub Pages: Wait 5-10 minutes for rebuild
- Vercel: Redeploy project
- Traditional hosting: Clear CDN cache

---

## 📱 Update App Store Connect

Once your pages are live:

1. Go to https://appstoreconnect.apple.com
2. Select your app
3. App Information section
4. Update:
   - **Privacy Policy URL:** `https://tutoglobal.com/privacy`
   - **Terms of Service URL:** `https://tutoglobal.com/terms`
   - **Support URL:** `https://tutoglobal.com/help` (create this page too!)

5. Save changes

---

## 🎯 Next Steps After Hosting

### 1. Test Everything

- [ ] All 3 URLs load correctly
- [ ] No 404 errors
- [ ] HTTPS works
- [ ] Mobile-friendly
- [ ] Content is correct

### 2. Create Support Page

Create a simple support page at `https://tutoglobal.com/help` with:
- Contact email
- FAQ
- How to report issues
- Links to Privacy Policy and Terms

### 3. Update App Store Listing

Fill in App Store Connect:
- Privacy Policy URL
- Terms of Service URL (optional but recommended)
- Support URL
- Marketing URL (your main website)

### 4. Final App Store Submission Checklist

Go back to: `docs/APP_STORE_SUBMISSION_CHECKLIST.md`

You can now check off:
- ✅ Privacy Policy published
- ✅ Terms of Service published
- ✅ Data Retention Policy published
- ✅ All URLs updated in app
- ✅ URLs working and accessible

---

## 💡 Pro Tips

### Keep Documents Updated

**When to Update:**
- When you add new features
- When you add new third-party services
- When laws change
- At least once per year

**How to Update:**
1. Edit the markdown file in `legal/` folder
2. Convert to HTML
3. Upload to hosting
4. Update "Last Updated" date

### Version Control

- Keep old versions in git history
- Update version number when making changes
- Major changes = notify users via app

### Translations

If you want Vietnamese versions:
1. Create `privacy-vi.md`, `terms-vi.md`
2. Host at `tutoglobal.com/vi/privacy`
3. Detect user language and redirect

---

## 📞 Need Help?

**If you get stuck:**

1. **GitHub Pages Issues:**
   - https://docs.github.com/en/pages

2. **Vercel Issues:**
   - https://vercel.com/docs

3. **Domain/DNS Issues:**
   - Contact your domain registrar support
   - Use https://dnschecker.org to verify

4. **General Help:**
   - Post in Expo Forums
   - Search Stack Overflow
   - Check Apple's App Store guidelines

---

## ✅ Success Checklist

You're ready when:

- [ ] All 3 legal documents are live at tutoglobal.com
- [ ] URLs work without .html extension
- [ ] HTTPS is enabled (green lock)
- [ ] Pages are mobile-friendly
- [ ] App URLs point to tutoglobal.com (already done!)
- [ ] You've tested all links from incognito mode
- [ ] Privacy Policy mentions COPPA and FERPA
- [ ] Contact email is correct (support@tutoglobal.com)

---

## 🎉 You're Done!

Once all URLs are live and verified:

1. ✅ Return to `docs/APP_STORE_CRITICAL_BLOCKERS.md`
2. ✅ Check off items 1-2 (Privacy Policy and Terms)
3. ✅ Move to next critical item (screenshots)
4. ✅ Continue with App Store submission

**Congratulations!** You've completed the most critical requirement for App Store submission. Legal documents are often the #1 reason for rejection, and you now have comprehensive, compliant policies.

---

**Questions?** You have 3 beautiful, comprehensive legal documents ready to go. Just pick a hosting method and follow the steps above!

**Recommended:** Method 1 (GitHub Pages) is free, easy, and works perfectly for static HTML pages.

Good luck! 🚀

