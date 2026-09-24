'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import te from '../locales/te.json';
import ta from '../locales/ta.json';
import kn from '../locales/kn.json';
import mr from '../locales/mr.json';
import bn from '../locales/bn.json';
import gu from '../locales/gu.json';
import pa from '../locales/pa.json';
import ur from '../locales/ur.json';
import or from '../locales/or.json';
import ml from '../locales/ml.json';

const localeMap = { en, hi, te, ta, kn, mr, bn, gu, pa, ur, or, ml };
const translationAliases = {
  cropPrices: 'marketPrices',
  transactions: 'pendingTransactions',
  logistics: 'logisticsSupport',
  offersTitle: 'offers',
  buyersTitle: 'verifiedBuyers',
  marketsTitle: 'marketPrices',
};
const dynamicTranslations = {
  hi: {
    Rice: 'चावल', Wheat: 'गेहूं', Cotton: 'कपास', Onion: 'प्याज', Tomato: 'टमाटर', Potato: 'आलू', Maize: 'मक्का', Sugarcane: 'गन्ना', Farmer: 'किसान', Buyer: 'खरीदार', Verified: 'सत्यापित', Pending: 'लंबित', 'Under Review': 'समीक्षाधीन', Suspicious: 'संदिग्ध', 'Not Verified': 'सत्यापित नहीं', Available: 'उपलब्ध', Distance: 'दूरी', Location: 'स्थान', Quantity: 'मात्रा', Price: 'कीमत', Quality: 'गुणवत्ता', Search: 'खोजें', Submit: 'जमा करें', Save: 'सहेजें', Cancel: 'रद्द करें', Contact: 'संपर्क करें', 'View Details': 'विवरण देखें', 'Request Transport': 'परिवहन का अनुरोध करें',
  },
  te: {
    Rice: 'బియ్యం', Wheat: 'గోధుమ', Cotton: 'పత్తి', Onion: 'ఉల్లిపాయ', Tomato: 'టమాటా', Potato: 'బంగాళాదుంప', Maize: 'మొక్కజొన్న', Sugarcane: 'చెరకు', Farmer: 'రైతు', Buyer: 'కొనుగోలుదారు', Verified: 'ధృవీకరించబడింది', Pending: 'పెండింగ్‌లో ఉంది', 'Under Review': 'సమీక్షలో ఉంది', Suspicious: 'అనుమానాస్పదం', 'Not Verified': 'ధృవీకరించబడలేదు', Available: 'అందుబాటులో ఉంది', Distance: 'దూరం', Location: 'స్థానం', Quantity: 'పరిమాణం', Price: 'ధర', Quality: 'నాణ్యత', Search: 'వెతకండి', Submit: 'సమర్పించండి', Save: 'సేవ్ చేయండి', Cancel: 'రద్దు చేయండి', Contact: 'సంప్రదించండి', 'View Details': 'వివరాలు చూడండి', 'Request Transport': 'రవాణాను అభ్యర్థించండి',
  },
  ta: { Rice: 'அரிசி', Wheat: 'கோதுமை', Cotton: 'பருத்தி', Farmer: 'விவசாயி', Buyer: 'வாங்குபவர்', Verified: 'சரிபார்க்கப்பட்டது', Pending: 'நிலுவையில்', Price: 'விலை', Quantity: 'அளவு', Location: 'இடம்' },
  kn: { Rice: 'ಅಕ್ಕಿ', Wheat: 'ಗೋಧಿ', Cotton: 'ಹತ್ತಿ', Farmer: 'ರೈತ', Buyer: 'ಖರೀದಿದಾರ', Verified: 'ಪರಿಶೀಲಿಸಲಾಗಿದೆ', Pending: 'ಬಾಕಿಯಿದೆ', Price: 'ಬೆಲೆ', Quantity: 'ಪ್ರಮಾಣ', Location: 'ಸ್ಥಳ' },
  mr: { Rice: 'तांदूळ', Wheat: 'गहू', Cotton: 'कापूस', Farmer: 'शेतकरी', Buyer: 'खरेदीदार', Verified: 'सत्यापित', Pending: 'प्रलंबित', Price: 'किंमत', Quantity: 'प्रमाण', Location: 'स्थान' },
  bn: { Rice: 'চাল', Wheat: 'গম', Cotton: 'তুলা', Farmer: 'কৃষক', Buyer: 'ক্রেতা', Verified: 'যাচাইকৃত', Pending: 'মুলতুবি', Price: 'দাম', Quantity: 'পরিমাণ', Location: 'অবস্থান' },
  gu: { Rice: 'ચોખા', Wheat: 'ઘઉં', Cotton: 'કપાસ', Farmer: 'ખેડૂત', Buyer: 'ખરીદદાર', Verified: 'ચકાસાયેલ', Pending: 'બાકી', Price: 'કિંમત', Quantity: 'જથ્થો', Location: 'સ્થળ' },
  pa: { Rice: 'ਚੌਲ', Wheat: 'ਕਣਕ', Cotton: 'ਕਪਾਹ', Farmer: 'ਕਿਸਾਨ', Buyer: 'ਖਰੀਦਦਾਰ', Verified: 'ਪ੍ਰਮਾਣਿਤ', Pending: 'ਬਕਾਇਆ', Price: 'ਕੀਮਤ', Quantity: 'ਮਾਤਰਾ', Location: 'ਸਥਾਨ' },
  ur: { Rice: 'چاول', Wheat: 'گندم', Cotton: 'کپاس', Farmer: 'کسان', Buyer: 'خریدار', Verified: 'تصدیق شدہ', Pending: 'زیر التوا', Price: 'قیمت', Quantity: 'مقدار', Location: 'مقام' },
  or: { Rice: 'ଚାଉଳ', Wheat: 'ଗହମ', Cotton: 'କପା', Farmer: 'ଚାଷୀ', Buyer: 'କ୍ରେତା', Verified: 'ଯାଞ୍ଚିତ', Pending: 'ବିଚାରାଧୀନ', Price: 'ମୂଲ୍ୟ', Quantity: 'ପରିମାଣ', Location: 'ସ୍ଥାନ' },
  ml: { Rice: 'അരി', Wheat: 'ഗോതമ്പ്', Cotton: 'പരുത്തി', Farmer: 'കർഷകൻ', Buyer: 'വാങ്ങുന്നയാൾ', Verified: 'പരിശോധിച്ചു', Pending: 'തീർപ്പാക്കാത്തത്', Price: 'വില', Quantity: 'അളവ്', Location: 'സ്ഥലം' },
};
const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('kisanlink-language');
    if (saved) {
      setLanguage(saved);
      return;
    }

    const browserLang = navigator.language.toLowerCase();
    const match = Object.keys(localeMap).find((key) => browserLang.startsWith(key));
    if (match) {
      setLanguage(match);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('kisanlink-language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    const sourceToTranslation = new Map();
    Object.entries(en).forEach(([key, value]) => {
      const translated = localeMap[language]?.[key];
      if (translated && translated !== value) sourceToTranslation.set(String(value), String(translated));
    });
    Object.entries(dynamicTranslations[language] || {}).forEach(([source, translated]) => sourceToTranslation.set(source, translated));
    const entries = [...sourceToTranslation.entries()].sort((left, right) => right[0].length - left[0].length);
    const translate = (value) => {
      if (!value || language === 'en') return value;
      const exact = sourceToTranslation.get(value.trim());
      if (exact) return value.replace(value.trim(), exact);
      return entries.reduce((result, [source, translated]) => result.replace(new RegExp(`\\b${source.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi'), translated), value);
    };
    const translateDom = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (!node.parentElement || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.parentElement.tagName)) continue;
        if (!node.__kisanlinkSource) node.__kisanlinkSource = node.nodeValue;
        const translatedText = translate(node.__kisanlinkSource);
        if (node.nodeValue !== translatedText) node.nodeValue = translatedText;
      }
      document.querySelectorAll('input[placeholder], textarea[placeholder], [aria-label], [title]').forEach((element) => {
        ['placeholder', 'aria-label', 'title'].forEach((attribute) => {
          if (!element.hasAttribute(attribute)) return;
          const marker = `__kisanlink${attribute}`;
          if (!element[marker]) element[marker] = element.getAttribute(attribute);
          const translatedAttribute = translate(element[marker]);
          if (element.getAttribute(attribute) !== translatedAttribute) element.setAttribute(attribute, translatedAttribute);
        });
      });
    };
    translateDom();
    const observer = new MutationObserver(translateDom);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(() => {
    const dict = localeMap[language] || en;

    return {
      language,
      setLanguage,
      t: (key) => dict[key] || dict[translationAliases[key]] || en[key] || key,
      translateText: (value) => value,
      dir: language === 'ur' ? 'rtl' : 'ltr',
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
