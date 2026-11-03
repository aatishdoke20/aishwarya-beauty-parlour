/**
 * Aishwarya Beauty Parlour - Multilingual Static Blog Site Generator
 * Compiles content/blog/*.md into production-ready, crawlable, pre-rendered static HTML
 * 
 * Supports 5-Article Multilingual Architecture (15 article variants + 3 blog archives = 18 routes):
 * - English (en-IN): /blog/ and /blog/{slug}/
 * - Marathi (mr-IN): /mr/blog/ and /mr/blog/{slug}/
 * - Hindi (hi-IN): /hi/blog/ and /hi/blog/{slug}/
 * 
 * Complies with Google Search Central SEO, AEO, GEO standards:
 * - Direct answers in standfirst for answer engines
 * - BlogPosting & BreadcrumbList Schema.org structured data (FAQPage schema omitted per 2026 guidelines)
 * - Strict self-referencing canonical URLs & reciprocal hreflang annotations (en-IN, mr-IN, hi-IN, x-default)
 * - 1:1 language switcher preserving article context across EN | मराठी | हिन्दी
 * - Draft exclusion from public output and sitemap
 * - Table of contents with full Unicode Devanagari slug support
 * - Dynamic category counts, data-driven empty states, and curated 1-2 related guides per post
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT_DIR, 'content', 'blog');
const BLOG_OUT_DIR = path.join(ROOT_DIR, 'blog');
const MR_BLOG_OUT_DIR = path.join(ROOT_DIR, 'mr', 'blog');
const HI_BLOG_OUT_DIR = path.join(ROOT_DIR, 'hi', 'blog');
const SITEMAP_PATH = path.join(ROOT_DIR, 'sitemap.xml');
const BASE_URL = 'https://aishwaryabeautyparlour.vercel.app';

// Ensure directories exist
[CONTENT_DIR, BLOG_OUT_DIR, MR_BLOG_OUT_DIR, HI_BLOG_OUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * UI Localization Strings for EN, MR, HI
 */
const UI_STRINGS = {
  en: {
    langCode: 'en-IN',
    htmlLang: 'en-IN',
    homeTitle: 'Home',
    blogTitle: 'Blog',
    journalEyebrow: 'THE AISHWARYA BEAUTY JOURNAL • LOCAL SALON EDITORIAL',
    archiveHeroTitle: 'Hair Styling, Skincare & Bridal Artistry Guides in Manchar',
    archiveHeroDesc: 'Your trusted local companion for precision haircut shaping, relaxing facial skincare, professional waxing, hair smoothening, and traditional Maharashtrian bridal artistry. Curated by Varsha Doke with around 20 years of hands-on salon experience in Patilwada, Manchar (near S.T. Bus Stand). Proudly serving clients across Manchar, Ambegaon Taluka, Ghodegaon, Kalamb, Pimpalgaon, Narayangaon, and Landewadi.',
    archiveMetaTitle: 'The Beauty Journal | Hair, Skincare & Bridal Guides in Manchar | Aishwarya Beauty Parlour',
    archiveMetaDesc: 'Authentic ladies haircut styling, facial skincare, waxing choices, keratin smoothening, and Maharashtrian bridal makeup guides by Varsha Doke in Patilwada, Manchar.',
    geoBanner: '📍 <strong>Salon Studio:</strong> Shop No. B-5, Shet Ambalal Trust Complex, Patilwada, Manchar • Call: <a href="tel:+919561985045" style="color: inherit; text-decoration: underline;">+91 95619 85045</a> • Serving Ambegaon Taluka, Ghodegaon, Kalamb, Pimpalgaon & Landewadi',
    aeoTitle: 'Manchar Salon & Beauty Advice At A Glance (AEO Direct Answers)',
    aeoItems: [
      { title: 'Haircuts in Manchar', text: 'Butterfly, layered and step cuts provide natural volume and easy air-dry styling without removing too much length, holding shape through local weather.' },
      { title: 'Hair Spa & Conditioning', text: 'Salon hair spa therapy and deep conditioning nourish the hair cuticle, smooth roughness and manage frizz based on your hair texture and routine.' },
      { title: 'Bridal Booking Timelines', text: 'Enquire 3 to 6 weeks early for wedding dates to reserve Nauvari saree draping, sacred mundavalya setting, and camera-ready HD makeup.' }
    ],
    allGuides: 'All Guides',
    searchPlaceholder: 'Search guides by keyword...',
    featuredGuide: '★ FEATURED SALON GUIDE',
    readCompleteGuide: 'Read Complete Guide →',
    latestGuides: 'Latest Articles & Practical Advice',
    noGuidesFound: 'No Guides Found',
    noGuidesDesc: 'No salon articles match your current search criteria. Try a different keyword or browse all categories.',
    resetFilter: 'Reset Search & Filters',
    exploreDepartments: 'Explore Our Main Salon Departments in Manchar',
    exploreDeptDesc: 'Looking for specific service pricing, timing details, or studio portfolios? Navigate directly:',
    bottomCtaTitle: 'Looking for Personal Advice or Booking?',
    bottomCtaDesc: 'Chat directly with Varsha Doke for customized haircut suggestions, skincare consultations, bridal booking dates, and salon hours.',
    bottomCtaBtn: 'Chat on WhatsApp',
    directAnswerBadge: 'Direct Answer for Readers',
    authorRole: 'Salon Owner & Stylist • ~20 Yrs Experience in Manchar',
    sidebarTitle: 'Salon Consultation',
    sidebarDesc: 'Visiting our studio in Patilwada, Manchar? Inquire directly with Varsha Doke for slot availability and pricing.',
    sidebarBtn: 'Ask on WhatsApp',
    faqTitle: 'Frequently Asked Questions',
    relatedServicesTitle: 'Explore Related Salon Services in Manchar',
    relatedGuidesTitle: 'Related Articles & Salon Guides',
    napStudioTitle: 'Aishwarya Beauty Parlour',
    napStudioAddress: 'Shop No. B-5, Shet Ambalal Trust Complex, near S.T. Bus Stand, Patilwada, Manchar, Maharashtra 410503',
    napStudioHours: 'Daily Hours: 10:30 AM – 8:00 PM • Direct Phone:',
    napStudioDirections: 'View Route Map & Studio Directions →',
    articleCtaTitle: 'Book or Ask a Question on WhatsApp',
    articleCtaDesc: 'Connect directly with Varsha Doke at Aishwarya Beauty Parlour to discuss haircuts, facials, waxing, hair treatments, or bridal booking dates.',
    articleCtaBtn: 'Book or Ask on WhatsApp',
    backToJournal: '← Back to all guides & articles in our journal',
    tableOfContents: 'Table of Contents'
  },
  mr: {
    langCode: 'mr-IN',
    htmlLang: 'mr-IN',
    homeTitle: 'मुख्यपृष्ठ',
    blogTitle: 'ब्युटी जर्नल',
    journalEyebrow: 'ऐश्वर्या ब्युटी जर्नल • स्थानिक पार्लर मार्गदर्शन',
    archiveHeroTitle: 'मंचरमधील महिलांचे हेअरकट, फेशियल, वॅक्सिंग आणि नवरी मेकअप मार्गदर्शक',
    archiveHeroDesc: 'मंचर, आंबेगाव तालुका, घोडेगाव, कळंब, पिंपळगाव आणि लांडेवाडी परिसरातील महिलांसाठी हेअरकट, रिलॅक्सिंग फेशियल, वॅक्सिंग, हेअर स्मूथनिंग आणि पारंपरिक नवरी मेकअप विषयी सविस्तर माहिती. वर्षा डोके (सुमारे २० वर्षांचा अनुभव), पाटीलवाडा, मंचर.',
    archiveMetaTitle: 'ब्युटी जर्नल | हेअरस्टाईल, फेशियल, वॅक्सिंग व नवरी मेकअप मार्गदर्शक मंचर | ऐश्वर्या ब्युटी पार्लर',
    archiveMetaDesc: 'मंचर व आंबेगाव तालुक्यातील महिलांसाठी हेअरकट, फेशियल, वॅक्सिंग पर्याय, केराटिन ट्रीटमेंट आणि पारंपरिक नवरी मेकअपची माहिती. वर्षा डोके, पाटीलवाडा, मंचर.',
    geoBanner: '📍 <strong>स्टुडिओ:</strong> शॉप नं. B-5, शेठ अंबालाल ट्रस्ट कॉम्प्लेक्स, एस.टी. स्टँड जवळ, पाटीलवाडा, मंचर • फोन: <a href="tel:+919561985045" style="color: inherit; text-decoration: underline;">+91 95619 85045</a> • सेवा क्षेत्र: मंचर व आंबेगाव तालुका',
    aeoTitle: 'मंचर पार्लर व हेअरकेअर सारांश (AEO Direct Answers)',
    aeoItems: [
      { title: 'मंचरमधील हेअरकट', text: 'बटरफ्लाय आणि लेअर्ड कटमुळे केसांची लांबी कमी न करता उत्तम व्हॉल्यूम मिळतो आणि रोजच्या धावपळीत केस सहज सांभाळता येतात.' },
      { title: 'हेअर स्पा आणि कंडिशनिंग', text: 'सलूनमधील हेअर स्पा थेरपी आणि डीप कंडिशनिंगमुळे केसांना योग्य पोषण मिळते, कोरडेपणा कमी होतो आणि केस मऊ व चमकदार राहतात.' },
      { title: 'ब्रायडल बुकिंगच्या वेळा', text: 'लग्नाच्या तारखेच्या किमान ३ ते ६ आठवडे आधी संपर्क साधल्यास नऊवारी साडी ड्रेपिंग, मुंडावळ्या आणि घामाचा परिणाम न होणारा HD मेकअप वेळेत नियोजित करता येतो.' }
    ],
    allGuides: 'सर्व लेख',
    searchPlaceholder: 'ब्लॉगमध्ये शोधा...',
    featuredGuide: '★ विशेष लेख',
    readCompleteGuide: 'संपूर्ण लेख वाचा →',
    latestGuides: 'नवीनतम लेख आणि उपयुक्त सल्ला',
    noGuidesFound: 'कोणताही लेख सापडला नाही',
    noGuidesDesc: 'आपण शोधत असलेले शब्द कोणत्याही लेखात आढळले नाहीत. कृपया दुसरा शब्द वापरून पहा किंवा सर्व विभाग तपासा.',
    resetFilter: 'शोध रीसेट करा',
    exploreDepartments: 'मंचरमधील आमच्या मुख्य पार्लर सेवा जाणून घ्या',
    exploreDeptDesc: 'विशिष्ट सेवांचे दर, लागणारा वेळ किंवा स्टुडिओ कामाचे नमुने पाहण्यासाठी खालील पानांवर जा:',
    bottomCtaTitle: 'वैयक्तिक सल्ला किंवा बुकिंग हवे आहे का?',
    bottomCtaDesc: 'तुमच्या चेहऱ्याला साजेसा हेअरकट, त्वचेनुसार फेशियल, ब्रायडल बुकिंगच्या उपलब्ध तारखा आणि सल्ल्यासाठी वर्षा डोके यांच्याशी थेट बोला.',
    bottomCtaBtn: 'व्हॉट्सॲपवर संपर्क साधा',
    directAnswerBadge: 'वाचकांसाठी थेट उत्तर (Direct Answer)',
    authorRole: 'पार्लर संचालिका व मुख्य स्टायलिस्ट • मंचरमध्ये ~२० वर्षांचा अनुभव',
    sidebarTitle: 'पार्लर सल्ला व वेळ',
    sidebarDesc: 'पाटीलवाडा, मंचर येथील आमच्या स्टुडिओला भेट देणार आहात? वेळ आणि दरांच्या माहितीसाठी वर्षा डोके यांच्याशी थेट संपर्क साधा.',
    sidebarBtn: 'व्हॉट्सॲपवर विचारा',
    faqTitle: 'वारंवार विचारले जाणारे प्रश्न (FAQs)',
    relatedServicesTitle: 'मंचरमधील संबंधित पार्लर सेवा जाणून घ्या',
    relatedGuidesTitle: 'संबंधित लेख आणि मार्गदर्शन',
    napStudioTitle: 'ऐश्वर्या ब्युटी पार्लर (Aishwarya Beauty Parlour)',
    napStudioAddress: 'शॉप क्र. B-5, शेठ अंबालाल ट्रस्ट कॉम्प्लेक्स, एस.टी. स्टँड जवळ, पाटीलवाडा, मंचर, महाराष्ट्र ४१०५०३',
    napStudioHours: 'वेळ: दररोज स. १०:३० ते रा. ८:०० • फोन:',
    napStudioDirections: 'गुगल मॅप व स्टुडिओचा पत्ता पहा →',
    articleCtaTitle: 'व्हॉट्सॲपवर संपर्क साधा किंवा वेळ बुक करा',
    articleCtaDesc: 'हेअरकट, फेशियल, वॅक्सिंग, हेअर ट्रीटमेंट्स किंवा ब्रायडल बुकिंगबाबत अधिक माहितीसाठी वर्षा डोके यांच्याशी थेट बोला.',
    articleCtaBtn: 'व्हॉट्सॲपवर संपर्क साधा',
    backToJournal: '← ब्लॉगमधील सर्व लेख पहा',
    tableOfContents: 'अनुक्रमणिका (Table of Contents)'
  },
  hi: {
    langCode: 'hi-IN',
    htmlLang: 'hi-IN',
    homeTitle: 'होम',
    blogTitle: 'ब्यूटी जर्नल',
    journalEyebrow: 'ऐश्वर्या ब्यूटी जर्नल • लोकल ब्यूटी पार्लर गाइड',
    archiveHeroTitle: 'मंचर में लेडीज हेयरकट, फेशियल, वैक्सिंग और ब्राइडल मेकअप गाइड',
    archiveHeroDesc: 'मंचर, आंबेगांव तालुका, घोडेगांव, कलंब, पिंपलगांव और लांडेवाडी की महिलाओं के लिए हेयरकट शेपिंग, फेशियल स्किनकेयर, वैक्सिंग, हेयर स्मूदनिंग और पारंपरिक महाराष्ट्रीयन ब्राइडल मेकअप की सही जानकारी। वर्षा डोके (~20 वर्षों का अनुभव), पाटिलवाडा, मंचर।',
    archiveMetaTitle: 'ब्यूटी जर्नल | हेयरकट, फेशियल, वैक्सिंग और ब्राइडल मेकअप गाइड मंचर | ऐश्वर्या ब्यूटी पार्लर',
    archiveMetaDesc: 'मंचर और आंबेगांव तालुका की महिलाओं के लिए लेडीज हेयरकट, फेशियल केयर, वैक्सिंग विकल्प, केराटिन और पारंपरिक महाराष्ट्रीयन ब्राइडल मेकअप गाइड। वर्षा डोके, पाटिलवाडा, मंचर।',
    geoBanner: '📍 <strong>स्टूडियो:</strong> शॉप नं. B-5, शेठ अंबालाल ट्रस्ट कॉम्प्लेक्स, एस.टी. स्टैंड के पास, पाटिलवाडा, मंचर • फोन: <a href="tel:+919561985045" style="color: inherit; text-decoration: underline;">+91 95619 85045</a> • सेवा क्षेत्र: मंचर व आंबेगांव तालुका',
    aeoTitle: 'मंचर ब्यूटी व हेयरकेयर सारांश (AEO Direct Answers)',
    aeoItems: [
      { title: 'मंचर में लेडीज हेयरकट', text: 'बटरफ्लाई और लेयर्ड कट बालों की लंबाई कम किए बिना बेहतरीन वॉल्यूम और स्टाइलिंग में आसानी प्रदान करते हैं।' },
      { title: 'हेयर स्पा और कंडीशनिंग', text: 'सैलून हेयर स्पा थेरेपी और डीप कंडीशनिंग से बालों को पोषण मिलता है, रूखापन दूर होता है और बाल मुलायम व चमकदार बनते हैं।' },
      { title: 'ब्राइडल बुकिंग समय सीमा', text: 'शुभ विवाह मुहूर्त के लिए 3 से 6 सप्ताह पहले संपर्क करें ताकि नौवारी साड़ी ड्रेपिंग, मुंडावल्या और लॉन्ग-लास्टिंग एचडी मेकअप पहले से सुनिश्चित हो सके।' }
    ],
    allGuides: 'सभी गाइड्स',
    searchPlaceholder: 'गाइड खोजें...',
    featuredGuide: '★ विशेष गाइड',
    readCompleteGuide: 'पूरा लेख पढ़ें →',
    latestGuides: 'नवीनतम लेख और ब्यूटी गाइड्स',
    noGuidesFound: 'कोई गाइड नहीं मिली',
    noGuidesDesc: 'आपके खोजे गए शब्द से कोई लेख नहीं मिला। कृपया कोई अन्य शब्द खोजें या सभी श्रेणियां देखें।',
    resetFilter: 'सर्च रीसेट करें',
    exploreDepartments: 'मंचर में हमारी मुख्य पार्लर सेवाएं',
    exploreDeptDesc: 'विशिष्ट सेवाओं के मूल्य, समय या कार्य के नमूने देखने के लिए सीधे इन पृष्ठों पर जाएं:',
    bottomCtaTitle: 'व्यक्तिगत परामर्श या बुकिंग के लिए संपर्क करें',
    bottomCtaDesc: 'हेयरकट सुझाव, स्किनकेयर, ब्राइडल परामर्श तिथियां और पार्लर समय के लिए वर्षा डोके से सीधे व्हाट्सएप पर बात करें।',
    bottomCtaBtn: 'व्हाट्सएप पर संपर्क करें',
    directAnswerBadge: 'पाठकों के लिए सीधा उत्तर (Direct Answer)',
    authorRole: 'पार्लर संचालिका व मुख्य स्टाइलिस्ट • मंचर में ~20 वर्षों का अनुभव',
    sidebarTitle: 'पार्लर परामर्श व अपॉइंटमेंट',
    sidebarDesc: 'पाटिलवाडा, मंचर स्थित हमारे स्टूडियो में आने की योजना बना रहे हैं? स्लॉट उपलब्धता और जानकारी के लिए वर्षा डोके से सीधे संपर्क करें।',
    sidebarBtn: 'व्हाट्सएप पर पूछें',
    faqTitle: 'अक्सर पूछे जाने वाले प्रश्न (FAQs)',
    relatedServicesTitle: 'मंचर में अन्य संबंधित ब्यूटी पार्लर सेवाएं',
    relatedGuidesTitle: 'संबंधित लेख और ब्यूटी गाइड्स',
    napStudioTitle: 'ऐश्वर्या ब्यूटी पार्लर (Aishwarya Beauty Parlour)',
    napStudioAddress: 'शॉप नं. B-5, शेठ अंबालाल ट्रस्ट कॉम्प्लेक्स, एस.टी. बस स्टैंड के पास, पाटिलवाडा, मंचर, महाराष्ट्र 410503',
    napStudioHours: 'समय: प्रतिदिन सुबह 10:30 से रात 8:00 • फोन:',
    napStudioDirections: 'गूगल मैप और पार्लर का रास्ता देखें →',
    articleCtaTitle: 'व्हाट्सएप पर अपॉइंटमेंट बुक करें या सलाह लें',
    articleCtaDesc: 'हेयरकट, फेशियल, वैक्सिंग, हेयर ट्रीटमेंट्स या ब्राइडल बुकिंग की तारीखों के लिए ऐश्वर्या ब्यूटी पार्लर की वर्षा डोके से सीधे व्हाट्सएप पर जुड़ें।',
    articleCtaBtn: 'व्हाट्सएप पर संपर्क करें',
    backToJournal: '← सभी गाइड्स और लेख देखें',
    tableOfContents: 'विषय सूची (Table of Contents)'
  }
};

/**
 * URL and Path Resolution Helpers
 */
function getArticleUrl(post) {
  const lang = post.lang || 'en';
  if (lang === 'mr') return `${BASE_URL}/mr/blog/${post.slug}/`;
  if (lang === 'hi') return `${BASE_URL}/hi/blog/${post.slug}/`;
  return `${BASE_URL}/blog/${post.slug}/`;
}

function getArchiveUrl(lang) {
  if (lang === 'mr') return `${BASE_URL}/mr/blog/`;
  if (lang === 'hi') return `${BASE_URL}/hi/blog/`;
  return `${BASE_URL}/blog/`;
}

function getRelativeArticleUrl(post) {
  const lang = post.lang || 'en';
  if (lang === 'mr') return `/mr/blog/${post.slug}/`;
  if (lang === 'hi') return `/hi/blog/${post.slug}/`;
  return `/blog/${post.slug}/`;
}

function getRelativeArchiveUrl(lang) {
  if (lang === 'mr') return `/mr/blog/`;
  if (lang === 'hi') return `/hi/blog/`;
  return `/blog/`;
}

/**
 * Parse YAML frontmatter and markdown body
 */
function parseMarkdownFile(fileContent) {
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: fileContent };
  }

  const rawYaml = match[1];
  const body = match[2];
  const frontmatter = {};

  const lines = rawYaml.split(/\r?\n/);
  let currentKey = null;
  let currentSubKey = null;
  let inList = false;
  let inFaqs = false;
  let currentFaq = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const indent = line.search(/\S|$/);
    const trimmed = line.trim();

    if (indent === 0) {
      inList = false;
      inFaqs = false;
      currentFaq = null;
      currentSubKey = null;

      const colonIdx = trimmed.indexOf(':');
      if (colonIdx !== -1) {
        const key = trimmed.substring(0, colonIdx).trim();
        const value = trimmed.substring(colonIdx + 1).trim();
        currentKey = key;

        if (value === '') {
          if (key === 'faqs') {
            frontmatter.faqs = [];
            inFaqs = true;
          } else if (key === 'featuredImage' || key === 'seo' || key === 'peerSlugs') {
            frontmatter[key] = {};
            currentSubKey = key;
          } else if (key === 'relatedServices' || key === 'relatedPosts' || key === 'relatedKeywords') {
            frontmatter[key] = [];
            inList = true;
          }
        } else {
          frontmatter[key] = cleanYamlValue(value);
        }
      }
    } else if (inFaqs) {
      if (trimmed.startsWith('- question:')) {
        currentFaq = { question: cleanYamlValue(trimmed.replace('- question:', '')), answer: '' };
        frontmatter.faqs.push(currentFaq);
      } else if (trimmed.startsWith('answer:') && currentFaq) {
        currentFaq.answer = cleanYamlValue(trimmed.replace('answer:', ''));
      }
    } else if (currentSubKey === 'featuredImage' || currentSubKey === 'seo' || currentSubKey === 'peerSlugs') {
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx !== -1) {
        const subKey = trimmed.substring(0, colonIdx).trim();
        const value = trimmed.substring(colonIdx + 1).trim();
        if (value === '' && (subKey === 'relatedKeywords' || subKey === 'relatedServices')) {
          frontmatter[currentSubKey][subKey] = [];
          currentKey = subKey;
          inList = true;
        } else {
          frontmatter[currentSubKey][subKey] = cleanYamlValue(value);
        }
      }
    } else if (inList) {
      if (trimmed.startsWith('- ')) {
        const itemVal = trimmed.substring(2).trim();
        if (itemVal.startsWith('title:')) {
          const title = cleanYamlValue(itemVal.replace('title:', ''));
          const nextLine = lines[i + 1] ? lines[i + 1].trim() : '';
          let url = '';
          if (nextLine.startsWith('url:')) {
            url = cleanYamlValue(nextLine.replace('url:', ''));
            i++;
          }
          frontmatter[currentKey].push({ title, url });
        } else {
          frontmatter[currentKey].push(cleanYamlValue(itemVal));
        }
      }
    }
  }

  return { frontmatter, body };
}

function cleanYamlValue(val) {
  val = val.trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    return val.substring(1, val.length - 1);
  }
  if (val === 'true') return true;
  if (val === 'false') return false;
  return val;
}

/**
 * Calculate estimated reading time
 */
function calculateReadingTime(text, lang = 'en') {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 180));
  if (lang === 'mr') return `${minutes} मिनिटे वाचन`;
  if (lang === 'hi') return `${minutes} मिनट वाचन`;
  return `${minutes} min read`;
}

/**
 * Convert markdown to HTML
 */
function renderMarkdown(md) {
  const lines = md.split(/\r?\n/);
  const output = [];
  let inList = false;
  let inOrderedList = false;
  let inTable = false;
  let tableHeaders = [];
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Check table
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableHeaders = line.split('|').slice(1, -1).map(c => c.trim());
        tableRows = [];
        if (lines[i + 1] && lines[i + 1].includes('---')) {
          i++;
        }
        continue;
      } else {
        const rowCols = line.split('|').slice(1, -1).map(c => c.trim());
        tableRows.push(rowCols);
        continue;
      }
    } else if (inTable) {
      inTable = false;
      output.push('<div class="article-table-wrap"><table>');
      output.push('<thead><tr>' + tableHeaders.map(h => `<th>${inlineFormat(h)}</th>`).join('') + '</tr></thead>');
      output.push('<tbody>');
      tableRows.forEach(row => {
        output.push('<tr>' + row.map(c => `<td>${inlineFormat(c)}</td>`).join('') + '</tr>');
      });
      output.push('</tbody></table></div>');
    }

    // Check lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!inList) {
        if (inOrderedList) { output.push('</ol>'); inOrderedList = false; }
        output.push('<ul>');
        inList = true;
      }
      output.push(`<li>${inlineFormat(line.substring(2))}</li>`);
      continue;
    } else if (/^\d+\.\s/.test(line)) {
      if (!inOrderedList) {
        if (inList) { output.push('</ul>'); inList = false; }
        output.push('<ol>');
        inOrderedList = true;
      }
      const itemText = line.replace(/^\d+\.\s/, '');
      output.push(`<li>${inlineFormat(itemText)}</li>`);
      continue;
    } else {
      if (inList) { output.push('</ul>'); inList = false; }
      if (inOrderedList) { output.push('</ol>'); inOrderedList = false; }
    }

    if (!line) {
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      const headingText = line.substring(4);
      const id = slugify(headingText);
      output.push(`<h3 id="${id}">${headingText}</h3>`);
      continue;
    } else if (line.startsWith('## ')) {
      const headingText = line.substring(3);
      const id = slugify(headingText);
      output.push(`<h2 id="${id}">${headingText}</h2>`);
      continue;
    } else if (line.startsWith('# ')) {
      const headingText = line.substring(2);
      const id = slugify(headingText);
      output.push(`<h1 id="${id}">${headingText}</h1>`);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      output.push(`<blockquote><p>${inlineFormat(line.substring(2))}</p></blockquote>`);
      continue;
    }

    // Paragraph
    output.push(`<p>${inlineFormat(line)}</p>`);
  }

  if (inTable) {
    output.push('<div class="article-table-wrap"><table>');
    output.push('<thead><tr>' + tableHeaders.map(h => `<th>${inlineFormat(h)}</th>`).join('') + '</tr></thead>');
    output.push('<tbody>');
    tableRows.forEach(row => {
      output.push('<tr>' + row.map(c => `<td>${inlineFormat(c)}</td>`).join('') + '</tr>');
    });
    output.push('</tbody></table></div>');
  }
  if (inList) output.push('</ul>');
  if (inOrderedList) output.push('</ol>');

  return output.join('\n');
}

/**
 * Handle inline markdown formatting (bold, italic, links, images)
 */
function inlineFormat(text) {
  // Images: ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    return `<figure class="blog-inline-figure"><img src="${src}" alt="${alt}" loading="lazy"><figcaption>${alt}</figcaption></figure>`;
  });
  // Links: [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // Bold: **text**
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic: *text*
  text = text.replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, '$1<em>$2</em>$3');
  return text;
}

/**
 * Universal Unicode slugify supporting ASCII, Devanagari (Marathi, Hindi) & marks
 */
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\p{M}\s\-]+/gu, '')
    .replace(/\s+/g, '-')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') || 'section';
}

/**
 * Extract Headings for Table of Contents
 */
function extractHeadings(md) {
  const headings = [];
  const lines = md.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      const title = trimmed.substring(3).trim();
      headings.push({ level: 2, title, id: slugify(title) });
    } else if (trimmed.startsWith('### ')) {
      const title = trimmed.substring(4).trim();
      headings.push({ level: 3, title, id: slugify(title) });
    }
  }
  return headings;
}

/**
 * Load all posts from content/blog/*.md
 */
function loadAllPosts() {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  const posts = [];

  for (const file of files) {
    const fullPath = path.join(CONTENT_DIR, file);
    const content = fs.readFileSync(fullPath, 'utf8');
    const { frontmatter, body } = parseMarkdownFile(content);

    const slug = frontmatter.slug || path.basename(file, '.md');
    const lang = frontmatter.lang || 'en';
    const readingTime = frontmatter.readingTime || calculateReadingTime(body, lang);

    posts.push({
      ...frontmatter,
      slug,
      lang,
      readingTime,
      body,
      headings: extractHeadings(body)
    });
  }

  posts.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
  return posts;
}

/**
 * WebP URL helper
 */
function getWebpUrl(src) {
  if (!src) return '';
  return src.replace(/\.(jpe?g|png)$/i, '.webp');
}

/**
 * Shared Header HTML with Multilingual Awareness
 */
function getHeaderHtml(activePage = 'blog', lang = 'en') {
  const blogLink = lang === 'mr' ? '/mr/blog/' : lang === 'hi' ? '/hi/blog/' : '/blog/';
  const blogLabel = lang === 'mr' ? 'ब्लॉग' : lang === 'hi' ? 'ब्लॉग' : 'Blog';

  return `
  <!-- Accessible Skip Link -->
  <a href="#main-content" class="skip-to-content">Skip to main content</a>

  <!-- Top Announcement Bar -->
  <div class="top-announcement-bar" role="region" aria-label="Studio quick info">
    <div class="container top-bar-inner">
      <div class="top-bar-location">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span>Shop No. B-5, Shet Ambalal Trust Complex, Near S.T. Bus Stand, Patilwada, Manchar</span>
      </div>
      <div class="top-bar-links">
        <a href="https://maps.app.goo.gl/HJ5yTbCJdpzcWc3k9" target="_blank" rel="noopener noreferrer" class="top-bar-link">
          <span>Get Directions on Google Maps</span>
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>
      </div>
    </div>
  </div>

  <!-- Site Header -->
  <header class="site-header" role="banner">
    <div class="container header-inner">
      <a href="/index.html" class="brand-lockup" aria-label="Aishwarya Beauty Parlour Manchar - Home">
        <div class="brand-crest" aria-hidden="true">A</div>
        <div class="brand-text">
          <span class="brand-name">Aishwarya Beauty Parlour</span>
          <span class="brand-location">Manchar</span>
        </div>
      </a>

      <!-- Navigation Links -->
      <nav class="main-nav" aria-label="Primary Navigation">
        <a href="/index.html" class="nav-link">Home</a>
        <a href="/about.html" class="nav-link">About</a>
        <a href="/services.html" class="nav-link">Services</a>
        <a href="/bridal-makeup.html" class="nav-link">Bridal Makeup</a>
        <a href="/gallery.html" class="nav-link">Gallery</a>
        <a href="/location.html" class="nav-link">Location</a>
        <a href="/contact.html" class="nav-link">Contact</a>
        <a href="${blogLink}" class="nav-link ${activePage === 'blog' ? 'active' : ''}" ${activePage === 'blog' ? 'aria-current="page"' : ''}>${blogLabel}</a>
      </nav>

      <!-- Header Actions -->
      <div class="header-actions">
        <a href="https://wa.me/919561985045?text=Hello%20Aishwarya%20Beauty%20Parlour,%20I%20would%20like%20to%20book%20an%20appointment." target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-whatsapp-header" aria-label="Book appointment on WhatsApp">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12.031 2c-5.502 0-9.972 4.469-9.972 9.974 0 1.76.459 3.479 1.33 4.996L2 22l5.176-1.356a9.927 9.927 0 0 0 4.855 1.258h.004c5.503 0 9.973-4.47 9.973-9.974 0-2.664-1.037-5.167-2.92-7.051A9.914 9.914 0 0 0 12.031 2zm0 18.232h-.003a8.267 8.267 0 0 1-4.221-1.157l-.303-.18-3.138.823.837-3.059-.197-.315a8.243 8.243 0 0 1-1.266-4.368c0-4.57 3.719-8.288 8.291-8.288 2.215 0 4.296.863 5.861 2.43 1.565 1.567 2.427 3.65 2.426 5.865 0 4.571-3.718 8.289-8.29 8.289zm4.542-6.198c-.249-.125-1.472-.726-1.7-.809-.228-.083-.394-.125-.561.125-.166.249-.644.809-.789.975-.145.166-.291.187-.54.062s-1.05-.387-2.001-1.234c-.739-.659-1.238-1.473-1.383-1.722-.145-.249-.015-.384.11-.508.112-.112.249-.291.374-.437.125-.145.166-.249.249-.415.083-.166.042-.312-.021-.437s-.561-1.352-.769-1.851c-.203-.486-.408-.42-.561-.428l-.478-.009c-.166 0-.437.062-.665.312s-.873.852-.873 2.078 1.096 2.41 1.251 2.618c.156.208 2.157 3.294 5.226 4.62 3.069 1.326 3.069.884 3.625.828.556-.057 1.787-.728 2.037-1.433.25-.705.25-1.31.175-1.433-.075-.124-.241-.186-.49-.311z"/>
          </svg>
          <span>Book on WhatsApp</span>
        </a>

        <button type="button" class="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Open Navigation Menu" aria-expanded="false" aria-controls="mobileNavDrawer">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  </header>

  <!-- Mobile Drawer -->
  <aside class="mobile-nav-drawer" id="mobileNavDrawer" aria-label="Mobile Navigation" aria-hidden="true">
    <div class="mobile-drawer-header">
      <span class="mobile-drawer-title">Navigation</span>
      <button type="button" class="mobile-drawer-close" id="mobileDrawerClose" aria-label="Close Navigation Menu">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div class="mobile-drawer-links">
      <a href="/index.html" class="mobile-nav-link">Home</a>
      <a href="/about.html" class="mobile-nav-link">About Varsha Doke</a>
      <a href="/services.html" class="mobile-nav-link">Services Catalog</a>
      <a href="/bridal-makeup.html" class="mobile-nav-link">Bridal Makeup</a>
      <a href="/gallery.html" class="mobile-nav-link">Studio Gallery</a>
      <a href="/location.html" class="mobile-nav-link">Studio Location</a>
      <a href="/contact.html" class="mobile-nav-link">Contact Studio</a>
      <a href="${blogLink}" class="mobile-nav-link ${activePage === 'blog' ? 'active' : ''}">${blogLabel}</a>
    </div>
    <div class="mobile-drawer-actions">
      <a href="https://wa.me/919561985045?text=Hello%20Aishwarya%20Beauty%20Parlour,%20I%20would%20like%20to%20book%20an%20appointment." target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp" style="width: 100%; justify-content: center;">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.031 2c-5.502 0-9.972 4.469-9.972 9.974 0 1.76.459 3.479 1.33 4.996L2 22l5.176-1.356a9.927 9.927 0 0 0 4.855 1.258h.004c5.503 0 9.973-4.47 9.973-9.974 0-2.664-1.037-5.167-2.92-7.051A9.914 9.914 0 0 0 12.031 2zm0 18.232h-.003a8.267 8.267 0 0 1-4.221-1.157l-.303-.18-3.138.823.837-3.059-.197-.315a8.243 8.243 0 0 1-1.266-4.368c0-4.57 3.719-8.288 8.291-8.288 2.215 0 4.296.863 5.861 2.43 1.565 1.567 2.427 3.65 2.426 5.865 0 4.571-3.718 8.289-8.29 8.289zm4.542-6.198c-.249-.125-1.472-.726-1.7-.809-.228-.083-.394-.125-.561.125-.166.249-.644.809-.789.975-.145.166-.291.187-.54.062s-1.05-.387-2.001-1.234c-.739-.659-1.238-1.473-1.383-1.722-.145-.249-.015-.384.11-.508.112-.112.249-.291.374-.437.125-.145.166-.249.249-.415.083-.166.042-.312-.021-.437s-.561-1.352-.769-1.851c-.203-.486-.408-.42-.561-.428l-.478-.009c-.166 0-.437.062-.665.312s-.873.852-.873 2.078 1.096 2.41 1.251 2.618c.156.208 2.157 3.294 5.226 4.62 3.069 1.326 3.069.884 3.625.828.556-.057 1.787-.728 2.037-1.433.25-.705.25-1.31.175-1.433-.075-.124-.241-.186-.49-.311z"/>
        </svg>
        <span>Book on WhatsApp</span>
      </a>
    </div>
  </aside>`;
}

/**
 * Shared Footer HTML
 */
function getFooterHtml() {
  return `
  <!-- Site Footer -->
  <footer class="site-footer" role="contentinfo">
    <div class="container">
      <div class="footer-grid">
        
        <!-- Brand Column -->
        <div class="footer-brand-col">
          <span class="footer-brand-name">Aishwarya Beauty Parlour</span>
          <span class="footer-owner-tag">By Varsha Doke • Manchar</span>
          <p class="footer-brand-desc">
            With around 20 years of experience, Varsha Doke provides bridal makeup, hairstyling, beauty parlour services, and professional training in Manchar, Maharashtra.
          </p>
        </div>

        <!-- Services Links -->
        <div>
          <h3 class="footer-col-title">Services</h3>
          <ul class="footer-links-list">
            <li><a href="/services.html#haircut" class="footer-link">Ladies Haircut &amp; Styling</a></li>
            <li><a href="/services.html#facial" class="footer-link">Facials &amp; Skincare</a></li>
            <li><a href="/services.html#waxing" class="footer-link">Waxing Studio</a></li>
            <li><a href="/services.html#hair-treatments" class="footer-link">Keratin &amp; Smoothening</a></li>
            <li><a href="/bridal-makeup.html" class="footer-link">Bridal Makeup &amp; Draping</a></li>
            <li><a href="/services.html" class="footer-link">Complete Services Menu</a></li>
          </ul>
        </div>

        <div>
          <h3 class="footer-col-title">Studio &amp; Blog</h3>
          <ul class="footer-links-list">
            <li><a href="/about.html" class="footer-link">About Varsha Doke</a></li>
            <li><a href="/services.html" class="footer-link">Services Catalog</a></li>
            <li><a href="/bridal-makeup.html" class="footer-link">Bridal Studio</a></li>
            <li><a href="/gallery.html" class="footer-link">Photo Gallery</a></li>
            <li><a href="/blog/" class="footer-link">Beauty Blog &amp; Guides (EN)</a></li>
            <li><a href="/mr/blog/" class="footer-link">मराठी ब्युटी ब्लॉग (MR)</a></li>
            <li><a href="/hi/blog/" class="footer-link">हिन्दी ब्यूटी ब्लॉग (HI)</a></li>
            <li><a href="/location.html" class="footer-link">Location &amp; Reviews</a></li>
            <li><a href="/contact.html" class="footer-link">Contact Studio</a></li>
            <li><a href="https://maps.app.goo.gl/HJ5yTbCJdpzcWc3k9" target="_blank" rel="noopener noreferrer" class="footer-link">Google Maps</a></li>
          </ul>
        </div>

        <!-- Studio Address & NAP -->
        <div>
          <h3 class="footer-col-title">Location &amp; Contact</h3>
          <address class="footer-contact-address">
            Shop No B-5, Shet Ambalal Trust Complex,<br>
            Near S.T. Bus Stand, Patilwada,<br>
            Manchar, Maharashtra 410503<br>
            India
          </address>
          <p style="margin: 0.5rem 0 0.75rem;">
            <a href="tel:+919561985045" class="footer-link" style="color: var(--color-accent-gold); font-weight: 600;">Call: +91 95619 85045</a><br>
            <span style="font-size: 0.8125rem; opacity: 0.85;">Daily: 10:30 AM – 8:00 PM</span>
          </p>
          <a href="https://wa.me/919561985045?text=Hello%20Aishwarya%20Beauty%20Parlour,%20I%20would%20like%20to%20inquire%20about%20your%20services." target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-whatsapp-header">
            <span>Inquire on WhatsApp</span>
          </a>
        </div>

      </div>

      <div class="footer-bottom-bar">
        <p>&copy; 2026 Aishwarya Beauty Parlour Manchar. All rights reserved.</p>
        <p>Managed by Varsha Doke • <a href="https://maps.app.goo.gl/HJ5yTbCJdpzcWc3k9" target="_blank" rel="noopener noreferrer">Patilwada, Manchar</a></p>
      </div>
    </div>
  </footer>

  <!-- Back to Top Floating Button -->
  <button type="button" class="back-to-top-btn" id="backToTopBtn" aria-label="Scroll back to top">
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  </button>

  <!-- Interactive script for FAQ and Mobile Menu -->
  <script>
    // FAQ toggles
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    });

    // Mobile menu toggle
    const toggle = document.getElementById('mobileMenuToggle');
    const drawer = document.getElementById('mobileNavDrawer');
    const closeBtn = document.getElementById('mobileDrawerClose');
    if (toggle && drawer) {
      toggle.addEventListener('click', () => {
        const open = drawer.getAttribute('aria-hidden') === 'false';
        drawer.setAttribute('aria-hidden', open ? 'true' : 'false');
        toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
      });
    }
    if (closeBtn && drawer) {
      closeBtn.addEventListener('click', () => {
        drawer.setAttribute('aria-hidden', 'true');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    }

    // Back to top
    const topBtn = document.getElementById('backToTopBtn');
    if (topBtn) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
          topBtn.style.display = 'block';
        } else {
          topBtn.style.display = 'none';
        }
      });
      topBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  </script>
  <!-- Instant Page Pre-fetch for Instant Navigation -->
  <script src="/js/instant-page.js" defer></script>`;
}

/**
 * Build Single Article HTML Page
 */
function buildArticlePage(post, allPosts) {
  const lang = post.lang || 'en';
  const strings = UI_STRINGS[lang] || UI_STRINGS.en;
  const canonicalUrl = getArticleUrl(post);
  const archiveUrl = getRelativeArchiveUrl(lang);

  const seoTitle = (post.seo && post.seo.title) || `${post.title} | Aishwarya Beauty Parlour`;
  const seoDesc = (post.seo && post.seo.description) || post.excerpt;
  const ogImgUrl = (post.seo && post.seo.ogImage) || `${BASE_URL}${post.featuredImage.src}`;

  // Peer URLs for exact article-to-article switching and hreflangs
  const enSlug = (post.peerSlugs && post.peerSlugs.en) || post.slug;
  const mrSlug = (post.peerSlugs && post.peerSlugs.mr) || post.slug;
  const hiSlug = (post.peerSlugs && post.peerSlugs.hi) || post.slug;

  const enUrl = `${BASE_URL}/blog/${enSlug}/`;
  const mrUrl = `${BASE_URL}/mr/blog/${mrSlug}/`;
  const hiUrl = `${BASE_URL}/hi/blog/${hiSlug}/`;

  // Extract standfirst (first paragraph of body)
  const paragraphs = post.body.split(/\r?\n\r?\n/).filter(p => p.trim() && !p.trim().startsWith('#'));
  const standfirst = paragraphs.length > 0 ? paragraphs[0].trim() : post.excerpt;
  const remainingMd = post.body.replace(standfirst, '').trim();
  const renderedBodyHtml = renderMarkdown(remainingMd);

  // Table of Contents HTML
  const tocHtml = post.headings.length > 0 ? `
    <nav class="toc-card" aria-label="${strings.tableOfContents}">
      <div class="toc-card-header">
        <span class="toc-title">${strings.tableOfContents}</span>
      </div>
      <ul class="toc-list" id="tocList">
        ${post.headings.map(h => `
          <li class="toc-level-${h.level}">
            <a href="#${h.id}">${h.title}</a>
          </li>
        `).join('')}
      </ul>
    </nav>
  ` : '';

  // FAQs HTML (Semantic HTML kept visible for users and AEO; FAQPage schema omitted per 2026 guidelines)
  const faqsHtml = (post.faqs && post.faqs.length > 0) ? `
    <section class="article-faq-section" aria-labelledby="faq-title">
      <h2 id="faq-title" class="article-faq-title">${strings.faqTitle}</h2>
      <div class="faq-list">
        ${post.faqs.map((faq, idx) => `
          <div class="faq-item ${idx === 0 ? 'active' : ''}">
            <button type="button" class="faq-question" aria-expanded="${idx === 0 ? 'true' : 'false'}">
              <span>${faq.question}</span>
              <svg class="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div class="faq-answer">
              <p>${faq.answer}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  ` : '';

  // Related Services HTML
  const relatedServicesHtml = (post.relatedServices && post.relatedServices.length > 0) ? `
    <section class="article-related-services" aria-labelledby="services-title">
      <h3 id="services-title" class="article-related-title">${strings.relatedServicesTitle}</h3>
      <div class="article-services-grid">
        ${post.relatedServices.map(srv => `
          <a href="${srv.url}" class="article-service-pill">
            <span>${srv.title}</span>
            <span style="color: var(--color-accent-gold-dark);" aria-hidden="true">&rarr;</span>
          </a>
        `).join('')}
      </div>
    </section>
  ` : '';

  // Related Posts HTML (Show 1-2 curated, relevant related guides in the same language)
  const relatedPostSlugs = post.relatedPosts || [];
  let otherPosts = [];
  if (relatedPostSlugs.length > 0) {
    otherPosts = allPosts.filter(p => {
      if ((p.lang || 'en') !== lang || p.slug === post.slug || p.status !== 'published') return false;
      const pEnSlug = (p.peerSlugs && p.peerSlugs.en) || p.slug;
      return relatedPostSlugs.includes(p.slug) || relatedPostSlugs.includes(pEnSlug);
    }).slice(0, 2);
  }
  if (otherPosts.length === 0) {
    otherPosts = allPosts.filter(p => p.slug !== post.slug && p.status === 'published' && (p.lang || 'en') === lang).slice(0, 2);
  }

  const relatedPostsHtml = otherPosts.length > 0 ? `
    <section class="section-spacing" style="padding-top: 2rem;" aria-labelledby="related-posts-title">
      <h2 id="related-posts-title" class="blog-hero-title" style="font-size: 1.85rem; margin-bottom: 1.5rem;">${strings.relatedGuidesTitle}</h2>
      <div class="blog-grid" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
        ${otherPosts.map(op => `
          <article class="blog-card">
            <div class="blog-card-media">
              <picture>
                <source type="image/webp" srcset="${getWebpUrl(op.featuredImage.src)}">
                <img src="${op.featuredImage.src}" alt="${op.featuredImage.alt}" loading="lazy" decoding="async" width="600" height="375">
              </picture>
            </div>
            <div class="blog-card-body">
              <span class="blog-badge">${op.category}</span>
              <h3 class="blog-card-title"><a href="${getRelativeArticleUrl(op)}">${op.title}</a></h3>
              <p class="blog-card-excerpt">${op.excerpt}</p>
              <div class="blog-card-footer">
                <span>${op.readingTime}</span>
                <a href="${getRelativeArticleUrl(op)}" class="blog-read-more">${strings.readCompleteGuide}</a>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  ` : '';

  // WhatsApp Pre-filled message (Localized & Natural)
  let rawWaMsg = `Hello Varsha Doke, I read your article "${post.title}" on the Aishwarya Beauty Parlour website and would like to ask a question.`;
  if (lang === 'mr') {
    rawWaMsg = `नमस्ते वर्षा डोके, मी ऐश्वर्या ब्युटी पार्लरच्या वेबसाइटवर आपला "${post.title}" हा लेख वाचला. मला याबाबत अधिक माहिती हवी आहे.`;
  } else if (lang === 'hi') {
    rawWaMsg = `नमस्ते वर्षा डोके, मैंने ऐश्वर्या ब्यूटी पार्लर की वेबसाइट पर आपका "${post.title}" लेख पढ़ा। मुझे इस सेवा के बारे में परामर्श चाहिए।`;
  }
  const waUrl = `https://wa.me/919561985045?text=${encodeURIComponent(rawWaMsg)}`;

  // JSON-LD Structured Data: BlogPosting
  const jsonLdBlogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": seoDesc,
    "image": ogImgUrl,
    "inLanguage": strings.langCode,
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt || post.publishedAt,
    "author": {
      "@type": "Person",
      "name": post.author || "Varsha Doke",
      "jobTitle": "Owner & Lead Stylist",
      "url": `${BASE_URL}/about.html`
    },
    "publisher": {
      "@type": "BeautySalon",
      "name": "Aishwarya Beauty Parlour Manchar",
      "url": BASE_URL,
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/images/bridal-hero.jpg`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    }
  };

  // JSON-LD Structured Data: BreadcrumbList (Home > Blog > Current Article)
  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": strings.homeTitle,
        "item": `${BASE_URL}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": strings.blogTitle,
        "item": getArchiveUrl(lang)
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": canonicalUrl
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="${strings.htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seoTitle}</title>
  <meta name="description" content="${seoDesc}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta name="robots" content="index, follow">

  <!-- Reciprocal Hreflang Tags (Multilingual SEO) -->
  <link rel="alternate" hreflang="en-IN" href="${enUrl}">
  <link rel="alternate" hreflang="mr-IN" href="${mrUrl}">
  <link rel="alternate" hreflang="hi-IN" href="${hiUrl}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${seoTitle}">
  <meta property="og:description" content="${seoDesc}">
  <meta property="og:image" content="${ogImgUrl}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="article:published_time" content="${post.publishedAt}">
  <meta property="article:modified_time" content="${post.updatedAt || post.publishedAt}">
  <meta property="article:author" content="${post.author || 'Varsha Doke'}">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${seoTitle}">
  <meta name="twitter:description" content="${seoDesc}">
  <meta name="twitter:image" content="${ogImgUrl}">

  <!-- Preconnect & Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Marcellus&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- Stylesheets -->
  <link rel="stylesheet" href="/css/style.css?v=3.0">
  <link rel="stylesheet" href="/css/blog.css?v=1.4">

  <!-- Favicon -->
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2246%22 fill=%22%23FAF7F2%22 stroke=%22%23B5893B%22 stroke-width=%224%22/><text x=%2250%22 y=%2260%22 font-family=%22Georgia,serif%22 font-size=%2246%22 font-weight=%22bold%22 fill=%22%238C6521%22 text-anchor=%22middle%22>A</text></svg>">

  <!-- JSON-LD Structured Data: BlogPosting -->
  <script type="application/ld+json">
${JSON.stringify(jsonLdBlogPosting, null, 2)}
  </script>

  <!-- JSON-LD Structured Data: BreadcrumbList -->
  <script type="application/ld+json">
${JSON.stringify(jsonLdBreadcrumb, null, 2)}
  </script>
</head>
<body>

${getHeaderHtml('blog', lang)}

  <main id="main-content">
    <div class="container">
      
      <!-- Top Bar: Visible Breadcrumb Navigation & Multilingual Switcher -->
      <div class="blog-top-bar">
        <nav class="blog-breadcrumbs" aria-label="Breadcrumbs">
          <ol>
            <li><a href="/index.html">${strings.homeTitle}</a></li>
            <li><a href="${archiveUrl}">${strings.blogTitle}</a></li>
            <li aria-current="page">${post.title}</li>
          </ol>
        </nav>
        <div class="lang-switcher" role="navigation" aria-label="Language selection">
          <span class="lang-label">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span>Language:</span>
          </span>
          <a href="/blog/${enSlug}/" class="lang-btn ${lang === 'en' ? 'active' : ''}" ${lang === 'en' ? 'aria-current="true"' : ''} hreflang="en-IN" lang="en">EN</a>
          <span class="lang-divider" aria-hidden="true">|</span>
          <a href="/mr/blog/${mrSlug}/" class="lang-btn ${lang === 'mr' ? 'active' : ''}" ${lang === 'mr' ? 'aria-current="true"' : ''} hreflang="mr-IN" lang="mr">मराठी</a>
          <span class="lang-divider" aria-hidden="true">|</span>
          <a href="/hi/blog/${hiSlug}/" class="lang-btn ${lang === 'hi' ? 'active' : ''}" ${lang === 'hi' ? 'aria-current="true"' : ''} hreflang="hi-IN" lang="hi">हिन्दी</a>
        </div>
      </div>

      <!-- Article Header -->
      <header class="article-header">
        <div class="article-category">
          <span class="blog-badge">${post.category}</span>
        </div>
        <h1 class="article-title">${post.title}</h1>
        
        <!-- AEO DIRECT ANSWER CALLOUT (Optimized for AI Overviews & Search Snippets) -->
        <div class="article-direct-answer-box" role="region" aria-label="Direct answer overview">
          <div class="direct-answer-badge">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            <span>${strings.directAnswerBadge}</span>
          </div>
          <p class="direct-answer-text">${standfirst}</p>
        </div>

        <div class="article-meta-banner">
          <div class="article-author-info">
            <div class="article-author-avatar" aria-hidden="true">VD</div>
            <div>
              <a href="/about.html" style="color: inherit; text-decoration: none;"><strong>${post.author || 'Varsha Doke'}</strong></a>
              <div style="font-size: 0.75rem; color: var(--color-text-muted);">${strings.authorRole}</div>
            </div>
          </div>
          <div class="blog-meta-item">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <time datetime="${post.publishedAt}">${new Date(post.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
          </div>
          <div class="blog-meta-item">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>${post.readingTime}</span>
          </div>
        </div>
      </header>

      <!-- Featured Image Figure -->
      <figure class="article-featured-figure">
        <picture>
          <source type="image/webp" srcset="${getWebpUrl(post.featuredImage.src)}">
          <img src="${post.featuredImage.src}" alt="${post.featuredImage.alt}" fetchpriority="high" decoding="async" width="960" height="640">
        </picture>
        ${post.featuredImage.caption ? `<figcaption>${post.featuredImage.caption}</figcaption>` : ''}
      </figure>

      <!-- Main Layout: Sidebar TOC + Prose Body -->
      <div class="article-layout-container">
        
        <!-- Table of Contents Sidebar -->
        <aside class="article-sidebar">
          ${tocHtml}

          <!-- Sticky Studio Quick Card -->
          <div class="toc-card" style="margin-top: 1.5rem;">
            <span class="toc-title" style="display: block; margin-bottom: 0.5rem;">${strings.sidebarTitle}</span>
            <p style="font-size: var(--font-size-xs); color: var(--color-text-espresso); margin-bottom: 0.75rem; line-height: 1.5;">
              ${strings.sidebarDesc}
            </p>
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp" style="width: 100%; justify-content: center; font-size: var(--font-size-xs);">
              <span>${strings.sidebarBtn}</span>
            </a>
          </div>
        </aside>

        <!-- Main Prose Article -->
        <article class="article-main-content">
          <div class="article-prose">
            ${renderedBodyHtml}
          </div>

          ${faqsHtml}

          ${relatedServicesHtml}

          <!-- Studio Visit & NAP Verification Card -->
          <div class="article-studio-nap-card">
            <div class="nap-crest" aria-hidden="true">A</div>
            <div class="nap-details">
              <h4>${strings.napStudioTitle}</h4>
              <address>
                ${strings.napStudioAddress}
              </address>
              <p>${strings.napStudioHours} <a href="tel:+919561985045" style="color: inherit; text-decoration: underline;">+91 95619 85045</a></p>
              <div style="margin-top: 0.65rem;">
                <a href="/location.html" class="blog-read-more" style="font-size: 0.8125rem;">${strings.napStudioDirections}</a>
              </div>
            </div>
          </div>

          <!-- Dedicated WhatsApp Conversion CTA -->
          <div class="article-whatsapp-cta-box">
            <h3>${strings.articleCtaTitle}</h3>
            <p>${strings.articleCtaDesc}</p>
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp-large" aria-label="${strings.articleCtaTitle}">
              <svg viewBox="0 0 24 24"><path d="M12.031 2c-5.502 0-9.972 4.469-9.972 9.974 0 1.76.459 3.479 1.33 4.996L2 22l5.176-1.356a9.927 9.927 0 0 0 4.855 1.258h.004c5.503 0 9.973-4.47 9.973-9.974 0-2.664-1.037-5.167-2.92-7.051A9.914 9.914 0 0 0 12.031 2zm0 18.232h-.003a8.267 8.267 0 0 1-4.221-1.157l-.303-.18-3.138.823.837-3.059-.197-.315a8.243 8.243 0 0 1-1.266-4.368c0-4.57 3.719-8.288 8.291-8.288 2.215 0 4.296.863 5.861 2.43 1.565 1.567 2.427 3.65 2.426 5.865 0 4.571-3.718 8.289-8.29 8.289zm4.542-6.198c-.249-.125-1.472-.726-1.7-.809-.228-.083-.394-.125-.561.125-.166.249-.644.809-.789.975-.145.166-.291.187-.54.062s-1.05-.387-2.001-1.234c-.739-.659-1.238-1.473-1.383-1.722-.145-.249-.015-.384.11-.508.112-.112.249-.291.374-.437.125-.145.166-.249.249-.415.083-.166.042-.312-.021-.437s-.561-1.352-.769-1.851c-.203-.486-.408-.42-.561-.428l-.478-.009c-.166 0-.437.062-.665.312s-.873.852-.873 2.078 1.096 2.41 1.251 2.618c.156.208 2.157 3.294 5.226 4.62 3.069 1.326 3.069.884 3.625.828.556-.057 1.787-.728 2.037-1.433.25-.705.25-1.31.175-1.433-.075-.124-.241-.186-.49-.311z"/></svg>
              <span>${strings.articleCtaBtn}</span>
            </a>
          </div>

          <div style="margin-top: 2rem;">
            <a href="${archiveUrl}" class="blog-read-more" style="font-size: 1.05rem;">
              ${strings.backToJournal}
            </a>
          </div>
        </article>

      </div>

      ${relatedPostsHtml}

    </div>
  </main>

${getFooterHtml()}

  <!-- ScrollSpy for Table of Contents -->
  <script>
    const tocLinks = document.querySelectorAll('#tocList a');
    const sections = Array.from(tocLinks).map(link => {
      const rawHref = link.getAttribute('href');
      const id = decodeURIComponent(rawHref.replace(/^#/, ''));
      return document.getElementById(id);
    }).filter(Boolean);

    window.addEventListener('scroll', () => {
      let currentId = '';
      const scrollPos = window.scrollY + 140;
      sections.forEach(sec => {
        if (sec.offsetTop <= scrollPos) {
          currentId = sec.getAttribute('id');
        }
      });
      tocLinks.forEach(link => {
        const rawHref = link.getAttribute('href');
        const linkId = decodeURIComponent(rawHref.replace(/^#/, ''));
        if (linkId === currentId) {
          link.style.color = 'var(--color-accent-blush-dark)';
          link.style.fontWeight = '700';
        } else {
          link.style.color = '';
          link.style.fontWeight = '';
        }
      });
    });
  </script>
</body>
</html>`;
}

/**
 * Build Blog Index Page HTML for a specific language ('en', 'mr', 'hi')
 */
function buildBlogIndexPage(allPublishedPosts, lang = 'en') {
  const strings = UI_STRINGS[lang] || UI_STRINGS.en;
  const canonicalUrl = getArchiveUrl(lang);
  
  // Filter posts published for this language
  const publishedPosts = allPublishedPosts.filter(p => (p.lang || 'en') === lang);
  const featuredPost = publishedPosts[0];

  // Dynamic Categories from this language's posts
  const categories = Array.from(new Set(publishedPosts.map(p => p.category).filter(Boolean)));

  // JSON-LD BreadcrumbList for Blog Index (Home > Blog)
  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": strings.homeTitle,
        "item": `${BASE_URL}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": strings.blogTitle,
        "item": canonicalUrl
      }
    ]
  };

  const jsonLdBlog = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "The Aishwarya Beauty Journal",
    "description": strings.archiveMetaDesc,
    "url": canonicalUrl,
    "inLanguage": strings.langCode,
    "publisher": {
      "@type": "BeautySalon",
      "name": "Aishwarya Beauty Parlour",
      "telephone": "+91 95619 85045",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Shop No. B-5, Shet Ambalal Trust Complex, Near S.T. Bus Stand, Patilwada",
        "addressLocality": "Manchar",
        "addressRegion": "Maharashtra",
        "postalCode": "410503",
        "addressCountry": "IN"
      }
    },
    "blogPost": publishedPosts.map(p => ({
      "@type": "BlogPosting",
      "headline": p.title,
      "url": getArticleUrl(p),
      "datePublished": p.publishedAt,
      "description": p.excerpt,
      "image": `${BASE_URL}${p.featuredImage.src}`
    }))
  };

  return `<!DOCTYPE html>
<html lang="${strings.htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${strings.archiveMetaTitle}</title>
  <meta name="description" content="${strings.archiveMetaDesc}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta name="robots" content="index, follow">

  <!-- Reciprocal Hreflang Tags for Archives -->
  <link rel="alternate" hreflang="en-IN" href="${BASE_URL}/blog/">
  <link rel="alternate" hreflang="mr-IN" href="${BASE_URL}/mr/blog/">
  <link rel="alternate" hreflang="hi-IN" href="${BASE_URL}/hi/blog/">
  <link rel="alternate" hreflang="x-default" href="${BASE_URL}/blog/">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${strings.archiveMetaTitle}">
  <meta property="og:description" content="${strings.archiveMetaDesc}">
  <meta property="og:image" content="${BASE_URL}/images/bridal-hero.jpg">
  <meta property="og:url" content="${canonicalUrl}">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${strings.archiveMetaTitle}">
  <meta name="twitter:description" content="${strings.archiveMetaDesc}">
  <meta name="twitter:image" content="${BASE_URL}/images/bridal-hero.jpg">

  <!-- Preconnect & Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Marcellus&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- Stylesheets -->
  <link rel="stylesheet" href="/css/style.css?v=3.0">
  <link rel="stylesheet" href="/css/blog.css?v=1.4">

  <!-- Favicon -->
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2246%22 fill=%22%23FAF7F2%22 stroke=%22%23B5893B%22 stroke-width=%224%22/><text x=%2250%22 y=%2260%22 font-family=%22Georgia,serif%22 font-size=%2246%22 font-weight=%22bold%22 fill=%22%238C6521%22 text-anchor=%22middle%22>A</text></svg>">

  <!-- JSON-LD Structured Data: Blog -->
  <script type="application/ld+json">
${JSON.stringify(jsonLdBlog, null, 2)}
  </script>

  <!-- JSON-LD Structured Data: BreadcrumbList -->
  <script type="application/ld+json">
${JSON.stringify(jsonLdBreadcrumb, null, 2)}
  </script>
</head>
<body>

${getHeaderHtml('blog', lang)}

  <main id="main-content">
    <div class="blog-index-hero">
      <div class="container">
        <!-- Top Bar: Visible Breadcrumbs (Home > Blog) & Language Switcher -->
        <div class="blog-top-bar" style="padding-top: 0;">
          <nav class="blog-breadcrumbs" aria-label="Breadcrumbs">
            <ol>
              <li><a href="/index.html">${strings.homeTitle}</a></li>
              <li aria-current="page">${strings.blogTitle}</li>
            </ol>
          </nav>
          <div class="lang-switcher" role="navigation" aria-label="Language selection">
            <span class="lang-label">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              <span>Language:</span>
            </span>
            <a href="/blog/" class="lang-btn ${lang === 'en' ? 'active' : ''}" ${lang === 'en' ? 'aria-current="true"' : ''} hreflang="en-IN" lang="en">EN</a>
            <span class="lang-divider" aria-hidden="true">|</span>
            <a href="/mr/blog/" class="lang-btn ${lang === 'mr' ? 'active' : ''}" ${lang === 'mr' ? 'aria-current="true"' : ''} hreflang="mr-IN" lang="mr">मराठी</a>
            <span class="lang-divider" aria-hidden="true">|</span>
            <a href="/hi/blog/" class="lang-btn ${lang === 'hi' ? 'active' : ''}" ${lang === 'hi' ? 'aria-current="true"' : ''} hreflang="hi-IN" lang="hi">हिन्दी</a>
          </div>
        </div>

        <span class="blog-hero-eyebrow">${strings.journalEyebrow}</span>
        <h1 class="blog-hero-title">${strings.archiveHeroTitle}</h1>
        <p class="blog-hero-desc">
          ${strings.archiveHeroDesc}
        </p>

        <!-- GEO Local Catchment Banner -->
        <div class="blog-geo-catchment">
          ${strings.geoBanner}
        </div>
      </div>
    </div>

    <div class="container">
      
      <!-- AEO DIRECT ANSWERS & SALON SUMMARY (Factual, service-led, no unsupported water claims) -->
      <section class="blog-aeo-summary-card" aria-label="Direct salon advice for Manchar clients">
        <div class="direct-answer-badge">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          <span>${strings.aeoTitle}</span>
        </div>
        <div class="blog-aeo-grid">
          ${strings.aeoItems.map(item => `
            <div class="blog-aeo-item">
              <h4>${item.title}</h4>
              <p>${item.text}</p>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- Category Filter Tabs & Live Search Toolbar -->
      <div class="blog-toolbar" role="toolbar" aria-label="Filter blog posts">
        <div class="blog-categories" id="categoryFilters">
          <button type="button" class="blog-category-btn active" data-category="all">
            <span>${strings.allGuides}</span>
            <span class="cat-count">(${publishedPosts.length})</span>
          </button>
          ${categories.map(cat => {
            const count = publishedPosts.filter(p => p.category === cat).length;
            return `
              <button type="button" class="blog-category-btn" data-category="${cat}">
                <span>${cat}</span>
                <span class="cat-count">(${count})</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Live Search Input -->
        <div class="blog-search-box">
          <svg class="blog-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="search" id="blogSearchInput" class="blog-search-input" placeholder="${strings.searchPlaceholder}" aria-label="Search blog posts">
        </div>
      </div>

      ${featuredPost ? `
      <!-- Featured Post Showcase -->
      <section aria-labelledby="featured-post-heading">
        <h2 id="featured-post-heading" class="sr-only">Featured Article</h2>
        <article class="blog-featured-card" data-category="${featuredPost.category}">
          <div class="blog-featured-image-wrap">
            <picture>
              <source type="image/webp" srcset="${getWebpUrl(featuredPost.featuredImage.src)}">
              <img src="${featuredPost.featuredImage.src}" alt="${featuredPost.featuredImage.alt}" fetchpriority="high" decoding="async" width="960" height="640">
            </picture>
          </div>
          <div class="blog-featured-content">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <span class="blog-badge">${featuredPost.category}</span>
              <span style="font-size: 0.72rem; font-weight: 700; color: var(--color-accent-gold-dark); letter-spacing: 0.08em; text-transform: uppercase;">${strings.featuredGuide}</span>
            </div>
            <h3 class="blog-featured-title">
              <a href="${getRelativeArticleUrl(featuredPost)}">${featuredPost.title}</a>
            </h3>
            <p class="blog-featured-excerpt">${featuredPost.excerpt}</p>
            <div class="blog-meta-row">
              <span class="blog-meta-item">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                ${featuredPost.readingTime}
              </span>
              <span class="blog-meta-item">By ${featuredPost.author || 'Varsha Doke'}</span>
              <a href="${getRelativeArticleUrl(featuredPost)}" class="blog-read-more" style="margin-left: auto;">${strings.readCompleteGuide}</a>
            </div>
          </div>
        </article>
      </section>
      ` : ''}

      <!-- Articles Grid (Shows all 5 published articles for active language) -->
      <section aria-labelledby="all-guides-heading">
        <h2 id="all-guides-heading" class="blog-hero-title" style="font-size: 1.85rem; margin-bottom: 2rem;">${strings.latestGuides}</h2>
        
        <div class="blog-grid" id="postsGrid">
          ${publishedPosts.map(post => `
            <article class="blog-card" data-category="${post.category}">
              <div class="blog-card-media">
                <picture>
                  <source type="image/webp" srcset="${getWebpUrl(post.featuredImage.src)}">
                  <img src="${post.featuredImage.src}" alt="${post.featuredImage.alt}" loading="lazy" decoding="async" width="600" height="375">
                </picture>
              </div>
              <div class="blog-card-body">
                <span class="blog-badge">${post.category}</span>
                <h3 class="blog-card-title">
                  <a href="${getRelativeArticleUrl(post)}">${post.title}</a>
                </h3>
                <p class="blog-card-excerpt">${post.excerpt}</p>
                <div class="blog-card-footer">
                  <span>${post.readingTime}</span>
                  <a href="${getRelativeArticleUrl(post)}" class="blog-read-more">${strings.readCompleteGuide}</a>
                </div>
              </div>
            </article>
          `).join('')}
        </div>

        <!-- No Results Fallback State (Renders only when search/filter matches === 0) -->
        <div id="noPostsFound" class="blog-no-results" style="display: none;">
          <h3>${strings.noGuidesFound}</h3>
          <p>${strings.noGuidesDesc}</p>
          <button type="button" class="btn btn-secondary" id="resetBlogFilterBtn">${strings.resetFilter}</button>
        </div>
      </section>

      <!-- Key Pillar Navigation Card (Deep Internal Linking) -->
      <section style="margin: 4rem 0 2.5rem; padding: 2.25rem; background: var(--color-bg-cream); border: 1px solid var(--color-border-gold); border-radius: var(--radius-card);">
        <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--color-text-charcoal); margin-bottom: 0.5rem;">
          ${strings.exploreDepartments}
        </h3>
        <p style="font-size: var(--font-size-sm); color: var(--color-text-espresso); margin-bottom: 1.5rem;">
          ${strings.exploreDeptDesc}
        </p>
        <div class="article-services-grid">
          <a href="/services.html#haircut" class="article-service-pill">
            <span>Ladies Haircuts &amp; Hairdressing</span>
            <span style="color: var(--color-accent-gold-dark);">&rarr;</span>
          </a>
          <a href="/services.html#facial" class="article-service-pill">
            <span>Facials &amp; Skincare Care</span>
            <span style="color: var(--color-accent-gold-dark);">&rarr;</span>
          </a>
          <a href="/services.html#waxing" class="article-service-pill">
            <span>Waxing Studio (Rica, Chocolate, Soft)</span>
            <span style="color: var(--color-accent-gold-dark);">&rarr;</span>
          </a>
          <a href="/services.html#hair-treatments" class="article-service-pill">
            <span>Keratin &amp; Hair Smoothening</span>
            <span style="color: var(--color-accent-gold-dark);">&rarr;</span>
          </a>
          <a href="/bridal-makeup.html" class="article-service-pill">
            <span>Bridal Studio &amp; Nauvari Draping</span>
            <span style="color: var(--color-accent-gold-dark);">&rarr;</span>
          </a>
          <a href="/contact.html" class="article-service-pill">
            <span>Contact Studio &amp; WhatsApp Booking</span>
            <span style="color: var(--color-accent-gold-dark);">&rarr;</span>
          </a>
        </div>
      </section>

      <!-- Bottom WhatsApp CTA -->
      <div class="article-whatsapp-cta-box" style="margin: 3rem 0 4rem;">
        <h3>${strings.bottomCtaTitle}</h3>
        <p>${strings.bottomCtaDesc}</p>
        <a href="https://wa.me/919561985045?text=Hello%20Aishwarya%20Beauty%20Parlour,%20I%20would%20like%20to%20consult%20about%20your%20services." target="_blank" rel="noopener noreferrer" class="btn-whatsapp-large">
          <svg viewBox="0 0 24 24"><path d="M12.031 2c-5.502 0-9.972 4.469-9.972 9.974 0 1.76.459 3.479 1.33 4.996L2 22l5.176-1.356a9.927 9.927 0 0 0 4.855 1.258h.004c5.503 0 9.973-4.47 9.973-9.974 0-2.664-1.037-5.167-2.92-7.051A9.914 9.914 0 0 0 12.031 2zm0 18.232h-.003a8.267 8.267 0 0 1-4.221-1.157l-.303-.18-3.138.823.837-3.059-.197-.315a8.243 8.243 0 0 1-1.266-4.368c0-4.57 3.719-8.288 8.291-8.288 2.215 0 4.296.863 5.861 2.43 1.565 1.567 2.427 3.65 2.426 5.865 0 4.571-3.718 8.289-8.29 8.289zm4.542-6.198c-.249-.125-1.472-.726-1.7-.809-.228-.083-.394-.125-.561.125-.166.249-.644.809-.789.975-.145.166-.291.187-.54.062s-1.05-.387-2.001-1.234c-.739-.659-1.238-1.473-1.383-1.722-.145-.249-.015-.384.11-.508.112-.112.249-.291.374-.437.125-.145.166-.249.249-.415.083-.166.042-.312-.021-.437s-.561-1.352-.769-1.851c-.203-.486-.408-.42-.561-.428l-.478-.009c-.166 0-.437.062-.665.312s-.873.852-.873 2.078 1.096 2.41 1.251 2.618c.156.208 2.157 3.294 5.226 4.62 3.069 1.326 3.069.884 3.625.828.556-.057 1.787-.728 2.037-1.433.25-.705.25-1.31.175-1.433-.075-.124-.241-.186-.49-.311z"/></svg>
          <span>${strings.bottomCtaBtn}</span>
        </a>
      </div>

    </div>
  </main>

${getFooterHtml()}

  <script>
    // Client-side Category Filter & Live Search
    const catButtons = document.querySelectorAll('.blog-category-btn');
    const cards = document.querySelectorAll('.blog-card');
    const featured = document.querySelector('.blog-featured-card');
    const searchInput = document.getElementById('blogSearchInput');
    const noResults = document.getElementById('noPostsFound');
    const resetBtn = document.getElementById('resetBlogFilterBtn');

    function applyFilterAndSearch() {
      const activeBtn = document.querySelector('.blog-category-btn.active');
      const selectedCat = activeBtn ? activeBtn.getAttribute('data-category') : 'all';
      const query = (searchInput?.value || '').toLowerCase().trim();
      let visibleCount = 0;

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        const text = card.textContent.toLowerCase();
        const matchesCat = (selectedCat === 'all' || cat === selectedCat);
        const matchesQuery = (!query || text.includes(query));

        if (matchesCat && matchesQuery) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (featured) {
        const featCat = featured.getAttribute('data-category');
        const featText = featured.textContent.toLowerCase();
        const featMatchesCat = (selectedCat === 'all' || featCat === selectedCat);
        const featMatchesQuery = (!query || featText.includes(query));

        if (featMatchesCat && featMatchesQuery) {
          featured.style.display = 'grid';
          visibleCount++;
        } else {
          featured.style.display = 'none';
        }
      }

      if (noResults) {
        noResults.style.display = (visibleCount === 0) ? 'block' : 'none';
      }
    }

    catButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        catButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilterAndSearch();
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', applyFilterAndSearch);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        const allBtn = document.querySelector('.blog-category-btn[data-category="all"]');
        if (allBtn) {
          catButtons.forEach(b => b.classList.remove('active'));
          allBtn.classList.add('active');
        }
        applyFilterAndSearch();
      });
    }
  </script>
</body>
</html>`;
}

/**
 * Update Sitemap.xml with only canonical, published posts & multilingual routes
 */
function updateSitemap(publishedPosts) {
  const existingPages = [
    { loc: `${BASE_URL}/`, lastmod: '2026-10-13', changefreq: 'weekly', priority: '1.0' },
    { loc: `${BASE_URL}/about.html`, lastmod: '2026-10-13', changefreq: 'monthly', priority: '0.9' },
    { loc: `${BASE_URL}/services.html`, lastmod: '2026-10-13', changefreq: 'weekly', priority: '0.9' },
    { loc: `${BASE_URL}/bridal-makeup.html`, lastmod: '2026-10-13', changefreq: 'weekly', priority: '0.95' },
    { loc: `${BASE_URL}/gallery.html`, lastmod: '2026-10-13', changefreq: 'weekly', priority: '0.9' },
    { loc: `${BASE_URL}/location.html`, lastmod: '2026-10-13', changefreq: 'weekly', priority: '0.85' },
    { loc: `${BASE_URL}/contact.html`, lastmod: '2026-10-13', changefreq: 'monthly', priority: '0.9' },
    // 3 Multilingual Blog Archives
    { loc: `${BASE_URL}/blog/`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: '0.9' },
    { loc: `${BASE_URL}/mr/blog/`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: '0.85' },
    { loc: `${BASE_URL}/hi/blog/`, lastmod: new Date().toISOString().split('T')[0], changefreq: 'weekly', priority: '0.85' },
  ];

  const blogPages = publishedPosts.map(p => ({
    loc: getArticleUrl(p),
    lastmod: p.updatedAt || p.publishedAt || new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: p.lang === 'en' ? '0.8' : '0.75'
  }));

  const allUrls = [...existingPages, ...blogPages];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  allUrls.forEach(u => {
    xml += '  <url>\n';
    xml += `    <loc>${u.loc}</loc>\n`;
    xml += `    <lastmod>${u.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
    xml += `    <priority>${u.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>\n';

  fs.writeFileSync(SITEMAP_PATH, xml, 'utf8');
  console.log(`✅ sitemap.xml updated with ${allUrls.length} canonical URLs (drafts excluded)`);
}

/**
 * Main Build Function
 */
function build() {
  console.log('🚀 Building Aishwarya Beauty Parlour Blog...');

  const allPosts = loadAllPosts();
  console.log(`📝 Loaded ${allPosts.length} total post(s) from ${CONTENT_DIR}`);

  const publishedPosts = allPosts.filter(p => p.status === 'published');
  const draftPosts = allPosts.filter(p => p.status !== 'published');

  console.log(`📌 Published posts: ${publishedPosts.length}`);
  console.log(`🔒 Draft posts (excluded from public site & sitemap): ${draftPosts.length}`);

  // Build each published post in its proper language directory
  for (const post of publishedPosts) {
    const lang = post.lang || 'en';
    let baseOutDir = BLOG_OUT_DIR;
    if (lang === 'mr') baseOutDir = MR_BLOG_OUT_DIR;
    else if (lang === 'hi') baseOutDir = HI_BLOG_OUT_DIR;

    const postDir = path.join(baseOutDir, post.slug);
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }

    const html = buildArticlePage(post, allPosts);

    // Save as /{lang}/blog/{slug}/index.html
    const indexPath = path.join(postDir, 'index.html');
    fs.writeFileSync(indexPath, html, 'utf8');

    // Also save as /{lang}/blog/{slug}.html for static server compatibility
    const compatPath = path.join(baseOutDir, `${post.slug}.html`);
    fs.writeFileSync(compatPath, html, 'utf8');

    // If English peer slug differs from localized slug, generate alias in localized directory
    if (post.peerSlugs && post.peerSlugs.en && post.peerSlugs.en !== post.slug) {
      const aliasDir = path.join(baseOutDir, post.peerSlugs.en);
      if (!fs.existsSync(aliasDir)) fs.mkdirSync(aliasDir, { recursive: true });
      fs.writeFileSync(path.join(aliasDir, 'index.html'), html, 'utf8');
      fs.writeFileSync(path.join(baseOutDir, `${post.peerSlugs.en}.html`), html, 'utf8');
    }

    const displayRoute = lang === 'en' ? `/blog/${post.slug}/` : `/${lang}/blog/${post.slug}/`;
    console.log(`  ✅ Generated: ${displayRoute}`);
  }

  // 1. Build English Blog Index: /blog/index.html
  const enIndexHtml = buildBlogIndexPage(publishedPosts, 'en');
  fs.writeFileSync(path.join(BLOG_OUT_DIR, 'index.html'), enIndexHtml, 'utf8');
  console.log('  ✅ Generated: /blog/index.html');

  // 2. Build Marathi Blog Index: /mr/blog/index.html & /mr/blog.html
  const mrIndexHtml = buildBlogIndexPage(publishedPosts, 'mr');
  fs.writeFileSync(path.join(MR_BLOG_OUT_DIR, 'index.html'), mrIndexHtml, 'utf8');
  const mrParentDir = path.join(ROOT_DIR, 'mr');
  if (!fs.existsSync(mrParentDir)) fs.mkdirSync(mrParentDir, { recursive: true });
  fs.writeFileSync(path.join(mrParentDir, 'blog.html'), mrIndexHtml, 'utf8');
  console.log('  ✅ Generated: /mr/blog/index.html & /mr/blog.html');

  // 3. Build Hindi Blog Index: /hi/blog/index.html & /hi/blog.html
  const hiIndexHtml = buildBlogIndexPage(publishedPosts, 'hi');
  fs.writeFileSync(path.join(HI_BLOG_OUT_DIR, 'index.html'), hiIndexHtml, 'utf8');
  const hiParentDir = path.join(ROOT_DIR, 'hi');
  if (!fs.existsSync(hiParentDir)) fs.mkdirSync(hiParentDir, { recursive: true });
  fs.writeFileSync(path.join(hiParentDir, 'blog.html'), hiIndexHtml, 'utf8');
  console.log('  ✅ Generated: /hi/blog/index.html & /hi/blog.html');

  // Update Sitemap
  updateSitemap(publishedPosts);

  console.log('🎉 Multilingual Blog build complete!\n');
}

// Execute build if run directly
if (require.main === module) {
  build();
}

module.exports = {
  parseMarkdownFile,
  calculateReadingTime,
  renderMarkdown,
  slugify,
  extractHeadings,
  loadAllPosts,
  buildArticlePage,
  buildBlogIndexPage,
  build,
  getArticleUrl,
  getArchiveUrl
};
