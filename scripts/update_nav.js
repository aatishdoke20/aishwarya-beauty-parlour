const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const files = ['index.html', 'about.html', 'services.html', 'bridal-makeup.html', 'gallery.html', 'location.html', 'contact.html'];

files.forEach(f => {
  const filePath = path.join(ROOT, f);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. main-nav
  if (content.includes('<a href="contact.html" class="nav-link">Contact</a>')) {
    content = content.replace(
      '<a href="contact.html" class="nav-link">Contact</a>',
      '<a href="contact.html" class="nav-link">Contact</a>\n        <a href="blog/" class="nav-link">Blog</a>'
    );
  } else if (content.includes('<a href="contact.html" class="nav-link active" aria-current="page">Contact</a>')) {
    content = content.replace(
      '<a href="contact.html" class="nav-link active" aria-current="page">Contact</a>',
      '<a href="contact.html" class="nav-link active" aria-current="page">Contact</a>\n        <a href="blog/" class="nav-link">Blog</a>'
    );
  }

  // 2. mobile-drawer
  if (content.includes('<a href="contact.html" class="mobile-nav-link">Contact Studio</a>')) {
    content = content.replace(
      '<a href="contact.html" class="mobile-nav-link">Contact Studio</a>',
      '<a href="contact.html" class="mobile-nav-link">Contact Studio</a>\n      <a href="blog/" class="mobile-nav-link">Blog &amp; Guides</a>'
    );
  } else if (content.includes('<a href="contact.html" class="mobile-nav-link active" aria-current="page">Contact Studio</a>')) {
    content = content.replace(
      '<a href="contact.html" class="mobile-nav-link active" aria-current="page">Contact Studio</a>',
      '<a href="contact.html" class="mobile-nav-link active" aria-current="page">Contact Studio</a>\n      <a href="blog/" class="mobile-nav-link">Blog &amp; Guides</a>'
    );
  }

  // 3. footer
  if (content.includes('<li><a href="contact.html" class="footer-link">Contact Studio</a></li>')) {
    content = content.replace(
      '<li><a href="contact.html" class="footer-link">Contact Studio</a></li>',
      '<li><a href="blog/" class="footer-link">Beauty Blog &amp; Guides</a></li>\n            <li><a href="contact.html" class="footer-link">Contact Studio</a></li>'
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Updated navigation in:', f);
});
