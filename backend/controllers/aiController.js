import { GoogleGenerativeAI } from '@google/generative-ai';
import Worker from '../models/Worker.js';
import Job from '../models/Job.js';

// Initialize Gemini API client if key is present
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Helper to run Gemini or use fallbacks
const generateAIResponse = async (prompt, systemInstruction = '', fallbackFn) => {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        systemInstruction: systemInstruction 
      });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Gemini API Error, using fallback:', error.message);
      return fallbackFn();
    }
  } else {
    // Return mock response when API Key is not configured
    return fallbackFn();
  }
};

// 1. AI Chat helper
export const chatWithHelper = async (req, res) => {
  const { message, history, language } = req.body;
  const lang = language || 'en';
  let worker = null;

if (req.user) {
  worker = await Worker.findOne({ userId: req.user._id });
}

  const systemInstructions = {
    en: "You are KaamSetu AI, a helpful assistant for daily wage workers and employers in India. Help with wage info, worker rights, how to find work, ESIC, PF, and minimum wage. Keep answers SHORT (2-3 sentences), simple, and practical in English.",
    hi: "आप KaamSetu AI हैं, भारत में दैनिक मजदूरों के सहायक। मजदूरी, श्रम कानून, दस्तावेज़, न्यूनतम वेतन पर सरल सलाह दें। उत्तर बहुत छोटा (2-3 वाक्य) और व्यावहारिक हो। भाषा: हिंदी।",
    mr: "तुम्ही KaamSetu AI आहात, भारतातील दैनंदिन मजुरांसाठी सहाय्यक. मजुरी, कामगार कायदे याबद्दल साध्या भाषेत सांगा. उत्तर खूप लहान (2-3 वाक्ये) आणि सोपे असावे. भाषा: मराठी."
  };

  const currentSystemPrompt = systemInstructions[lang] || systemInstructions.en;
  
  const text = message.toLowerCase();

if (
  text.includes('find jobs') ||
  text.includes('job for me') ||
  text.includes('nearby jobs') ||
  text.includes('show jobs') ||
  text.includes('नौकरी खोजो') ||
  text.includes('मेरे लिए नौकरी') ||
  text.includes('नोकरी शोधा') ||
  text.includes('माझ्यासाठी नोकऱ्या')
) {

  const jobs = await Job.find({
    status: 'open',
    trade: worker?.trade
  }).limit(3);

  if (jobs.length === 0) {
    return res.json({
      reply:
        lang === 'hi'
          ? 'आपके कौशल के अनुसार कोई नौकरी नहीं मिली।'
          : lang === 'mr'
          ? 'तुमच्या कौशल्यानुसार कोणतीही नोकरी सापडली नाही.'
          : 'No jobs found matching your trade.'
    });
  }

  let reply = '';

if (lang === 'hi') {
  reply = `आपके लिए ${jobs.length} नौकरी मिली:\n\n`;

  jobs.forEach((job, index) => {
    reply += `${index + 1}. ${job.title}\n`;
    reply += `📍 ${job.locationName}\n`;
    reply += `💰 ₹${job.wage}/दिन\n\n`;
  });
}
else if (lang === 'mr') {
  reply = `तुमच्यासाठी ${jobs.length} नोकऱ्या सापडल्या:\n\n`;

  jobs.forEach((job, index) => {
    reply += `${index + 1}. ${job.title}\n`;
    reply += `📍 ${job.locationName}\n`;
    reply += `💰 ₹${job.wage}/दिवस\n\n`;
  });
}
else {
  reply = `I found ${jobs.length} jobs for you:\n\n`;

  jobs.forEach((job, index) => {
    reply += `${index + 1}. ${job.title}\n`;
    reply += `📍 ${job.locationName}\n`;
    reply += `💰 ₹${job.wage}/day\n\n`;
  });
}

return res.json({ reply });
}

if (
  text.includes('urgent jobs') ||
  text.includes('urgent work') ||
  text.includes('urgent job') ||
  text.includes('जरूरी नौकरी') ||
  text.includes('जरूरी नौकरियां') ||
  text.includes('तातडीच्या नोकऱ्या') ||
  text.includes('तातडीचे काम')
) {

  const jobs = await Job.find({
    status: 'open',
    urgent: true
  }).limit(5);

  if (jobs.length === 0) {
    return res.json({
      reply:
        lang === 'hi'
          ? 'कोई जरूरी नौकरी उपलब्ध नहीं है।'
          : lang === 'mr'
          ? 'सध्या कोणतीही तातडीची नोकरी उपलब्ध नाही.'
          : 'No urgent jobs available right now.'
    });
  }

  let reply = '';

  if (lang === 'hi') {
    reply = `आपके लिए ${jobs.length} जरूरी नौकरियां मिली:\n\n`;
  } else if (lang === 'mr') {
    reply = `तुमच्यासाठी ${jobs.length} तातडीच्या नोकऱ्या सापडल्या:\n\n`;
  } else {
    reply = `I found ${jobs.length} urgent jobs:\n\n`;
  }

  jobs.forEach((job, index) => {
    reply += `${index + 1}. ${job.title}\n`;
    reply += `📍 ${job.locationName}\n`;
    reply += `💰 ₹${job.wage}/day\n\n`;
  });

  return res.json({ reply });
}

if (
  text.includes('highest paying jobs') ||
  text.includes('best paying jobs') ||
  text.includes('high salary jobs') ||
  text.includes('highest wage jobs') ||
  text.includes('सबसे ज्यादा वेतन') ||
  text.includes('ज्यादा पैसे वाली नौकरी') ||
  text.includes('सर्वाधिक पगार') ||
  text.includes('जास्त मजुरी')
) {

  const jobs = await Job.find({
    status: 'open'
  })
  .sort({ wage: -1 })
  .limit(5);

  if (jobs.length === 0) {
    return res.json({
      reply:
        lang === 'hi'
          ? 'कोई नौकरी उपलब्ध नहीं है।'
          : lang === 'mr'
          ? 'सध्या कोणतीही नोकरी उपलब्ध नाही.'
          : 'No jobs available.'
    });
  }

  let reply = '';

  if (lang === 'hi') {
    reply = `सबसे ज्यादा वेतन वाली नौकरियां:\n\n`;
  } else if (lang === 'mr') {
    reply = `सर्वाधिक पगाराच्या नोकऱ्या:\n\n`;
  } else {
    reply = `Highest Paying Jobs:\n\n`;
  }

  jobs.forEach((job, index) => {
    reply += `${index + 1}. ${job.title}\n`;
    reply += `📍 ${job.locationName}\n`;
    reply += `💰 ₹${job.wage}/day\n\n`;
  });

  return res.json({ reply });
}

if (
  text.includes('nearby jobs') ||
  text.includes('jobs near me') ||
  text.includes('near jobs') ||
  text.includes('nearby work') ||
  text.includes('पास की नौकरी') ||
  text.includes('मेरे आसपास नौकरी') ||
  text.includes('जवळच्या नोकऱ्या') ||
  text.includes('माझ्या जवळ')
) {

  const jobs = await Job.find({
    status: 'open',
    locationName: worker?.locationName
  }).limit(5);

  if (jobs.length === 0) {
    return res.json({
      reply:
        lang === 'hi'
          ? 'आपके क्षेत्र में कोई नौकरी नहीं मिली।'
          : lang === 'mr'
          ? 'तुमच्या भागात कोणतीही नोकरी सापडली नाही.'
          : 'No nearby jobs found.'
    });
  }

  let reply = '';

  if (lang === 'hi') {
    reply = `आपके क्षेत्र की नौकरियां:\n\n`;
  } else if (lang === 'mr') {
    reply = `तुमच्या भागातील नोकऱ्या:\n\n`;
  } else {
    reply = `Nearby Jobs:\n\n`;
  }

  jobs.forEach((job, index) => {
    reply += `${index + 1}. ${job.title}\n`;
    reply += `📍 ${job.locationName}\n`;
    reply += `💰 ₹${job.wage}/day\n\n`;
  });

  return res.json({ reply });
}

if (
  text.includes('government scheme') ||
  text.includes('government schemes') ||
  text.includes('worker scheme') ||
  text.includes('government benefits') ||
  text.includes('सरकारी योजना') ||
  text.includes('मजदूर योजना') ||
  text.includes('कामगार योजना') ||
  text.includes('शासकीय योजना')
) {

  let reply = '';

  if (lang === 'hi') {
    reply =
`मजदूरों के लिए प्रमुख सरकारी योजनाएं:

1. E-Shram Card
• असंगठित कामगारों का पंजीकरण

2. Ayushman Bharat
• ₹5 लाख तक स्वास्थ्य बीमा

3. PM Jan Dhan Yojana
• शून्य बैलेंस बैंक खाता

4. PM-SVANidhi
• छोटे कामगारों और विक्रेताओं के लिए ऋण

5. Atal Pension Yojana
• वृद्धावस्था पेंशन सुविधा`;
  }
  else if (lang === 'mr') {
    reply =
`कामगारांसाठी महत्त्वाच्या सरकारी योजना:

1. E-Shram Card
• असंघटित कामगार नोंदणी

2. Ayushman Bharat
• ₹5 लाखांपर्यंत आरोग्य विमा

3. PM Jan Dhan Yojana
• शून्य शिल्लक बँक खाते

4. PM-SVANidhi
• लहान कामगार व विक्रेत्यांसाठी कर्ज

5. Atal Pension Yojana
• निवृत्तीवेतन सुविधा`;
  }
  else {
    reply =
`Government Schemes for Workers:

1. E-Shram Card
• Registration for unorganized workers

2. Ayushman Bharat
• Health insurance up to ₹5 lakh

3. PM Jan Dhan Yojana
• Zero balance bank account

4. PM-SVANidhi
• Loan support for small workers/vendors

5. Atal Pension Yojana
• Pension benefits after retirement`;
  }

  return res.json({ reply });
}
  const fallbackResponses = {
    en: {
      aadhaar: "To get an Aadhaar card, visit the nearest Aadhaar Enrolment Centre with identity proof (like Voter ID or Pan Card) and address proof. The registration is free, and the card will be delivered to your address in 15-30 days.",
      wage: "The minimum daily wage for skilled workers like plumbers or electricians in Maharashtra ranges between ₹800 to ₹1200 per day. For helpers, it is around ₹450 to ₹600. Always agree on the wage before starting the work.",
      nonpayment: "If your employer refuses to pay your wage, you can file a complaint with the local Labour Commissioner's office under the Payment of Wages Act. You can also seek help from local worker unions.",
      documents: "To register on KaamSetu, you need a mobile number, a photo of yourself, list of your skills/trade, and your work location. Aadhaar card is recommended to verify your profile.",
      default: "I am KaamSetu AI. I can guide you on minimum wage standards, your legal labor rights, documents required for official schemes, or general career advice. Ask me anything!"
    },
    hi: {
      aadhaar: "आधार कार्ड बनवाने के लिए, पहचान पत्र (जैसे वोटर आईडी या पैन कार्ड) और पते के प्रमाण के साथ नजदीकी आधार नामांकन केंद्र पर जाएं। पंजीकरण बिल्कुल मुफ्त है और कार्ड 15-30 दिनों में पहुंच जाएगा।",
      wage: "महाराष्ट्र में प्लंबर या इलेक्ट्रीशियन जैसे कुशल कामगारों के लिए न्यूनतम मजदूरी ₹800 से ₹1200 प्रतिदिन है। हेल्पर के लिए यह ₹450 से ₹600 के बीच है। काम शुरू करने से पहले मजदूरी तय कर लें।",
      nonpayment: "यदि नियोक्ता मजदूरी का भुगतान नहीं करता है, तो आप श्रम आयुक्त कार्यालय में शिकायत दर्ज कर सकते हैं। आप सहायता के लिए स्थानीय मजदूर यूनियन से भी संपर्क कर सकते हैं।",
      documents: "कामसेतु पर पंजीकरण के लिए आपको एक मोबाइल नंबर, अपनी फोटो, हुनर की सूची और काम की जगह की आवश्यकता होती है। प्रोफाइल सत्यापन के लिए आधार कार्ड अच्छा है।",
      default: "मैं कामसेतु AI हूँ। मैं आपको मजदूरी दरों, आपके अधिकारों, आवश्यक दस्तावेजों और रोजगार के बारे में बता सकता हूँ। कुछ भी पूछें!"
    },
    mr: {
      aadhaar: "आधार कार्ड काढण्यासाठी, ओळखीचा पुरावा आणि पत्त्याच्या पुराव्यासह जवळच्या आधार नोंदणी केंद्राला भेट द्या. नोंदणी विनामूल्य आहे आणि कार्ड 15-30 दिवसांत तुमच्या पत्त्यावर येईल.",
      wage: "महाराष्ट्रात प्लंबर किंवा इलेक्ट्रिशियन सारख्या कुशल कामगारांसाठी किमान रोजंदारी ₹८०० ते ₹१२०० आहे. मदतनीसांसाठी ती ₹४५० ते ₹६०० आहे. काम सुरू करण्यापूर्वी मजुरी नक्की करा.",
      nonpayment: "मालकाने मजुरी न दिल्यास, तुम्ही स्थानिक कामगार आयुक्त कार्यालयात तक्रार दाखल करू शकता. मदतीसाठी स्थानिक कामगार संघटनेशी संपर्क साधा.",
      documents: "कामसेतूवर नोंदणीसाठी मोबाईल नंबर, फोटो, कौशल्य आणि कामाचे ठिकाण आवश्यक आहे. पडताळणीसाठी आधार कार्ड असणे फायदेशीर आहे.",
      default: "मी कामसेतू AI आहे. मी तुम्हाला किमान वेतन, कामगार कायदे, लागणारी कागदपत्रे आणि रोजगाराबद्दल माहिती देऊ शकतो. काहीही विचारा!"
    }
  };

  const getFallback = () => {
    console.log("LANG:", lang);
console.log("MESSAGE:", message);
    const text = message.toLowerCase();
    const activeDict = fallbackResponses[lang] || fallbackResponses.en;
    const trade = worker?.trade || '';
const experience = worker?.experience || '';
const location = worker?.locationName || '';

const tradeAdvice = {
  Painter: "Learn texture painting, waterproofing and spray painting.",
  Plumber: "Learn leak detection, advanced pipe fitting and water system installation.",
  Electrician: "Learn solar panel installation, inverter setup and smart home wiring.",
  Carpenter: "Learn modular furniture and interior finishing.",
  Cook: "Learn menu planning, hygiene standards and catering services.",
  Driver: "Learn GPS route optimization and basic vehicle maintenance.",
  Mason: "Learn tile fitting and advanced concrete finishing.",
  Welder: "Learn TIG welding and industrial fabrication."
};

if (
  text.includes('find jobs') ||
  text.includes('job for me') ||
  text.includes('nearby jobs') ||
  text.includes('show jobs') ||
  text.includes('नौकरी खोजो') ||
  text.includes('मेरे लिए नौकरी') ||
  text.includes('नोकरी शोधा') ||
  text.includes('माझ्यासाठी नोकऱ्या')
) {
  return lang === 'hi'
    ? 'नौकरी खोज सुविधा जल्द आ रही है।'
    : lang === 'mr'
    ? 'नोकरी शोध सुविधा लवकरच येत आहे.'
    : 'Job search feature coming soon.';
}
if (
  text.includes('urgent jobs') ||
  text.includes('urgent work') ||
  text.includes('urgent job') ||
  text.includes('जरूरी नौकरी') ||
  text.includes('जरूरी नौकरियां') ||
  text.includes('तातडीच्या नोकऱ्या') ||
  text.includes('तातडीचे काम')
) {
  return lang === 'hi'
    ? 'जरूरी नौकरी सुविधा जल्द आ रही है।'
    : lang === 'mr'
    ? 'तातडीच्या नोकरीची सुविधा लवकरच येत आहे.'
    : 'Urgent jobs feature coming soon.';
}


    if (text.includes('aadhaar') || text.includes('आधार')) return activeDict.aadhaar;
    if (text.includes('wage') || text.includes('minimum') || text.includes('मजदूरी') || text.includes('मजुरी') || text.includes('वेतन')) return activeDict.wage;
    if (text.includes('payment') || text.includes('non-payment') || text.includes('पैसे') || text.includes('देय')) return activeDict.nonpayment;
    if (text.includes('document') || text.includes('register') || text.includes('कागज') || text.includes('नोंदणी')) return activeDict.documents;
if (
  text.includes('earn more') ||
  text.includes('increase wage') ||
  text.includes('more money') ||
  text.includes('skill') ||
  text.includes('learn') ||
  text.includes('training') ||
  text.includes('improve') ||
  text.includes('upgrade') ||
  text.includes('कमाई') ||
  text.includes('जास्त पैसे') ||
  text.includes('कौशल') ||
  text.includes('सीख') ||
  text.includes('कौशल्य')
) {

  const tradeAdvice = {
    en: {
      Painter: 'Learn texture painting, waterproofing and spray painting to increase your earnings.',
      Plumber: 'Learn leak detection, advanced pipe fitting and water system installation.',
      Electrician: 'Learn solar panel installation, inverter setup and smart home wiring.',
      Cook: 'Learn catering, menu planning and food presentation.'
    },

    hi: {
      Painter: 'अपनी आय बढ़ाने के लिए टेक्सचर पेंटिंग, वाटरप्रूफिंग और स्प्रे पेंटिंग सीखें।',
      Plumber: 'लीक डिटेक्शन, एडवांस पाइप फिटिंग और वाटर सिस्टम इंस्टॉलेशन सीखें।',
      Electrician: 'सोलर पैनल इंस्टॉलेशन, इन्वर्टर सेटअप और स्मार्ट होम वायरिंग सीखें।',
      Cook: 'कैटरिंग, मेन्यू प्लानिंग और फूड प्रेजेंटेशन सीखें।'
    },

    mr: {
      Painter: 'उत्पन्न वाढवण्यासाठी टेक्सचर पेंटिंग, वॉटरप्रूफिंग आणि स्प्रे पेंटिंग शिका.',
      Plumber: 'लीक डिटेक्शन, प्रगत पाईप फिटिंग आणि वॉटर सिस्टम इंस्टॉलेशन शिका.',
      Electrician: 'सोलर पॅनल इंस्टॉलेशन, इन्व्हर्टर सेटअप आणि स्मार्ट होम वायरिंग शिका.',
      Cook: 'केटरिंग, मेन्यू प्लॅनिंग आणि फूड प्रेझेंटेशन शिका.'
    }
  };

  return (
    tradeAdvice[lang]?.[trade] ||
    tradeAdvice.en?.[trade] ||
    'Continue improving your skills and maintaining a strong work reputation.'
  );
}

if (
  text.includes('tool') ||
  text.includes('tools') ||
  text.includes('equipment') ||
  text.includes('औजार') ||
  text.includes('उपकरण') ||
  text.includes('साधन') ||
  text.includes('साधने')
) {
  const tools = {
    en: {
      Painter: 'Brushes, rollers, spray gun, putty knife and ladder.',
      Plumber: 'Pipe wrench, pliers, pipe cutter and thread seal tape.',
      Electrician: 'Multimeter, tester, insulated screwdrivers and wire stripper.',
      Cook: 'Good knives, chopping board, measuring tools and storage containers.'
    },

    hi: {
      Painter: 'ब्रश, रोलर, स्प्रे गन, पुट्टी नाइफ और सीढ़ी।',
      Plumber: 'पाइप रिंच, प्लायर, पाइप कटर और सील टेप।',
      Electrician: 'मल्टीमीटर, टेस्टर, इंसुलेटेड स्क्रूड्राइवर और वायर स्ट्रिपर।',
      Cook: 'अच्छे चाकू, चॉपिंग बोर्ड, माप उपकरण और स्टोरेज कंटेनर।'
    },

    mr: {
      Painter: 'ब्रश, रोलर, स्प्रे गन, पुट्टी नाइफ आणि शिडी.',
      Plumber: 'पाईप रिंच, प्लायर, पाईप कटर आणि सील टेप.',
      Electrician: 'मल्टीमीटर, टेस्टर, इन्सुलेटेड स्क्रूड्रायव्हर आणि वायर स्ट्रिपर.',
      Cook: 'चांगले चाकू, चॉपिंग बोर्ड, मोजमाप साधने आणि स्टोरेज कंटेनर.'
    }
  };

  return (
    tools[lang]?.[trade] ||
    tools.en?.[trade] ||
    'Use standard tools required for your trade.'
  );
}

if (
  text.includes('safe') ||
  text.includes('safety') ||
  text.includes('danger') ||
  text.includes('accident') ||
  text.includes('protection') ||
  text.includes('helmet') ||
  text.includes('gloves') ||
  text.includes('सुरक्षा') ||
  text.includes('सुरक्षित') ||
  text.includes('हेलमेट') ||
  text.includes('दुर्घटना')
) {
  const safetyTips = {
    en: {
      Painter: 'Use masks, gloves and safety goggles while painting.',
      Plumber: 'Turn off water supply and use protective gloves.',
      Electrician: 'Always switch off power and use insulated tools.',
      Cook: 'Use clean equipment and avoid wet floors.'
    },

    hi: {
      Painter: 'पेंटिंग करते समय मास्क, दस्ताने और सुरक्षा चश्मा पहनें।',
      Plumber: 'पानी की सप्लाई बंद करें और सुरक्षा दस्ताने पहनें।',
      Electrician: 'हमेशा बिजली बंद करके इंसुलेटेड औजारों का उपयोग करें।',
      Cook: 'साफ उपकरणों का उपयोग करें और गीली फर्श से बचें।'
    },

    mr: {
      Painter: 'रंगकाम करताना मास्क, हातमोजे आणि सुरक्षा चष्मा वापरा.',
      Plumber: 'पाण्याचा पुरवठा बंद करा आणि संरक्षणात्मक हातमोजे वापरा.',
      Electrician: 'नेहमी वीज बंद करून इन्सुलेटेड साधने वापरा.',
      Cook: 'स्वच्छ उपकरणे वापरा आणि ओल्या जमिनीपासून सावध रहा.'
    }
  };

  return (
    safetyTips[lang]?.[trade] ||
    safetyTips.en?.[trade] ||
    'Always follow workplace safety guidelines.'
  );
}

if (
  text.includes('customer') ||
  text.includes('customers') ||
  text.includes('client') ||
  text.includes('clients') ||
  text.includes('more work') ||
  text.includes('more jobs') ||
  text.includes('ग्राहक') ||
  text.includes('काम कैसे मिले') ||
  text.includes('जास्त काम') ||
  text.includes('ग्राहक कसे')
) {

  const customerAdvice = {
    en: `As a ${trade}, maintain good ratings, arrive on time and keep your profile updated to get more customers.`,

    hi: `${trade} के रूप में अधिक ग्राहक पाने के लिए समय पर पहुंचें, अच्छा काम करें और अपनी प्रोफाइल अपडेट रखें।`,

    mr: `${trade} म्हणून अधिक ग्राहक मिळवण्यासाठी वेळेवर पोहोचा, चांगले काम करा आणि तुमची प्रोफाइल अद्ययावत ठेवा.`
  };

  return customerAdvice[lang] || customerAdvice.en;
}

if (
  text.includes('price') ||
  text.includes('charge') ||
  text.includes('rate') ||
  text.includes('कितना चार्ज') ||
  text.includes('किंमत') ||
  text.includes('दर') ||
  text.includes('मजुरी')
) {

  const pricingAdvice = {
    en: `For ${trade} work in ${location}, compare local market wages and charge according to your experience level.`,

    hi: `${location} में ${trade} कार्य के लिए स्थानीय मजदूरी दर देखें और अपने अनुभव के अनुसार शुल्क तय करें।`,

    mr: `${location} मधील ${trade} कामासाठी स्थानिक मजुरी दर तपासा आणि तुमच्या अनुभवाप्रमाणे दर ठरवा.`
  };

  return pricingAdvice[lang] || pricingAdvice.en;
}

if (
  text.includes('material') ||
  text.includes('materials') ||
  text.includes('सामग्री') ||
  text.includes('साहित्य')
) {
  const materials = {
    en: {
      Painter: 'Paint, primer, putty, sandpaper and brushes.',
      Plumber: 'Pipes, fittings, valves and seal tape.',
      Electrician: 'Wires, switches, sockets and circuit breakers.',
      Cook: 'Fresh ingredients, spices and cooking oil.'
    },

    hi: {
      Painter: 'पेंट, प्राइमर, पुट्टी, सैंडपेपर और ब्रश।',
      Plumber: 'पाइप, फिटिंग, वाल्व और सील टेप।',
      Electrician: 'तार, स्विच, सॉकेट और सर्किट ब्रेकर।',
      Cook: 'ताज़ी सामग्री, मसाले और खाना पकाने का तेल।'
    },

    mr: {
      Painter: 'रंग, प्रायमर, पुट्टी, सॅंडपेपर आणि ब्रश.',
      Plumber: 'पाईप, फिटिंग, व्हॉल्व्ह आणि सील टेप.',
      Electrician: 'तारा, स्विच, सॉकेट आणि सर्किट ब्रेकर.',
      Cook: 'ताजे साहित्य, मसाले आणि स्वयंपाकाचे तेल.'
    }
  };

  return (
    materials[lang]?.[trade] ||
    materials.en?.[trade] ||
    'Use quality materials suitable for your trade.'
  );
}

return activeDict.default;
};

  try {
    const reply = await generateAIResponse(
      `User asks: "${message}". Give a short answer based on system instructions.`,
      currentSystemPrompt,
      getFallback
    );
    return res.json({ reply });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 2. AI Wage Recommendation
export const getWageRecommendation = async (req, res) => {
  const { trade, locationName } = req.body;
  
  const getFallbackWage = () => {
    const defaultWages = {
      Plumber: 750,
      Electrician: 900,
      Carpenter: 800,
      Painter: 700,
      Mason: 850,
      Welder: 1000,
      Helper: 500,
      Cook: 600,
      Driver: 800,
      Gardener: 550
    };
    const baseWage = defaultWages[trade] || 600;
    
    // Add minor adjustment for location (e.g. higher in cities)
    const isCity = locationName && /nagpur|mumbai|pune|delhi|bangalore/i.test(locationName);
    const recommendation = isCity ? Math.round(baseWage * 1.15) : baseWage;
    
    return JSON.stringify({
      recommendedWage: recommendation,
      minWage: Math.round(recommendation * 0.85),
      maxWage: Math.round(recommendation * 1.2),
      reason: `Based on current market standards for ${trade} in ${locationName || 'Nagpur area'}.`
    });
  };

  try {
    const responseText = await generateAIResponse(
      `Recommend a fair daily wage in Indian Rupees (INR) for a "${trade}" in location "${locationName || 'Nagpur, Maharashtra'}". Output ONLY a JSON object containing keys: "recommendedWage" (number), "minWage" (number), "maxWage" (number), and "reason" (string). Do not output markdown code blocks.`,
      "You are an expert labor wage calculator in India.",
      getFallbackWage
    );
    
    let resultJson;
    try {
      const cleanJson = responseText.replace(/```json|```/g, '').trim();
      resultJson = JSON.parse(cleanJson);
    } catch (e) {
      resultJson = JSON.parse(getFallbackWage());
    }

    return res.json(resultJson);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 3. AI Job Matching Score
export const getJobMatchingScore = async (req, res) => {
  const { workerId, jobId } = req.body;

  try {
    const worker = await Worker.findById(workerId);
    const job = await Job.findById(jobId);

    if (!worker || !job) {
      return res.status(404).json({ message: 'Worker or Job details not found' });
    }

    const calculateFallbackScore = () => {
      let score = 20; // base score if trade doesn't match
      let reasons = [];

      if (worker.trade.toLowerCase() === job.trade.toLowerCase()) {
        score = 80;
        reasons.push('Trade / Skill matched perfectly');
      } else {
        reasons.push('Trades do not match');
      }

      // Add points for experience
      if (score === 80) {
        if (worker.experience === '10+') {
          score += 15;
          reasons.push('Excellent experience level (10+ years)');
        } else if (worker.experience === '5-10') {
          score += 10;
          reasons.push('High experience level (5-10 years)');
        } else if (worker.experience === '3-5') {
          score += 5;
          reasons.push('Good experience level (3-5 years)');
        }
      }

      score = Math.min(score, 100);

      return JSON.stringify({
        score: score,
        reasons: reasons,
        feedback: score > 75 
          ? 'Highly suitable. This worker matches the required skills and experience!' 
          : 'Low suitability due to trade mismatch.'
      });
    };

    const prompt = `Calculate matching score between Worker Profile: Trade "${worker.trade}", Experience "${worker.experience} years", Languages "${worker.languages.join(', ')}", Wage expectation "₹${worker.wage}/day" AND Job Post: Title "${job.title}", Required Trade "${job.trade}", Description "${job.description}", Wage Offered "₹${job.wage}/day".
    Output ONLY a JSON object containing keys: "score" (number out of 100), "reasons" (array of strings), and "feedback" (string). Do not write markdown blocks.`;

    const responseText = await generateAIResponse(
      prompt,
      "You are a job recruitment scoring assistant.",
      calculateFallbackScore
    );

    let resultJson;
    try {
      const cleanJson = responseText.replace(/```json|```/g, '').trim();
      resultJson = JSON.parse(cleanJson);
    } catch (e) {
      resultJson = JSON.parse(calculateFallbackScore());
    }

    return res.json(resultJson);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 4. AI Career Advice & Skill suggestions
export const getCareerAdvice = async (req, res) => {
  try {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (!worker) {
      return res.status(404).json({ message: 'Worker profile not found. Please create a profile first.' });
    }

    const getFallbackAdvice = () => {
      const skillsMap = {
        Plumber: ['Leak detection', 'PPR & PVC pipe fittings', 'Basic gas welding', 'Water meter installation'],
        Electrician: ['House wiring', 'Inverter installation', 'Appliance repairing', 'Solar panel setup'],
        Carpenter: ['Modular furniture assembly', 'Wood polishing', 'Door & lock repairs', 'Laminate installation'],
        Painter: ['Wall putty finish', 'Texture painting', 'Spray painting', 'Waterproofing coatings'],
        Mason: ['Tile laying', 'Plastering work', 'Brick masonry construction', 'Concrete mixing'],
        Welder: ['Arc welding', 'Gas cutting', 'Grinding operations', 'Metal frame structure design'],
        Helper: ['Site cleaning', 'Material handling', 'Basic tool handling', 'Safety precautions'],
        Cook: ['North Indian meals', 'South Indian meals', 'Hygiene standards', 'Menu planning'],
        Driver: ['Highway navigation', 'Heavy commercial license', 'Basic engine troubleshooting', 'GPS routes'],
        Gardener: ['Organic composting', 'Lawn mowing', 'Drip irrigation setup', 'Pruning and grafting']
      };

      const suggestions = skillsMap[worker.trade] || ['General labor safety', 'Tool maintenance', 'Punctuality', 'Client conversation'];
      
      return JSON.stringify({
        skills: suggestions,
        advice: `To earn higher wages as a ${worker.trade}, practice modern tools, keep a clean verification record, respond quickly to calls, and learn how to do specialty jobs in your field.`,
        nextSteps: `Learn ${suggestions[0]} next to raise your daily rate by ₹100-200.`
      });
    };

    const prompt = `Provide skill suggestions and career advice for a ${worker.trade} in India with ${worker.experience} years of experience.
    Output ONLY a JSON object containing keys: "skills" (array of strings of 3-4 specialized skills), "advice" (string containing 2-3 sentences of career growth advice), and "nextSteps" (string suggesting the immediate next step). Do not write markdown blocks.`;

    const responseText = await generateAIResponse(
      prompt,
      "You are a professional career counselor for vocational trades in India.",
      getFallbackAdvice
    );

    let resultJson;
    try {
      const cleanJson = responseText.replace(/```json|```/g, '').trim();
      resultJson = JSON.parse(cleanJson);
    } catch (e) {
      resultJson = JSON.parse(getFallbackAdvice());
    }

    return res.json(resultJson);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
