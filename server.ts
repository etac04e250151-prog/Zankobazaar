import http from 'http';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Google GenAI client (Server-side only)
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for model language instructions
function getLanguageInstruction(lang: string = 'ku') {
  if (lang === 'ku') {
    return 'Respond primarily in Kurdish Sorani (کوردیی سۆرانی). Use natural, respectful Kurdish academic terminology commonly used in universities in Kurdistan (like EPU, Salahaddin, Sulaimani, Duhok). Ensure Kurdish Unicode characters (ڵ, ڕ, ێ, ۆ, هـ/ە) are written correctly.';
  } else if (lang === 'ar') {
    return 'Respond in clear, modern standard Arabic (العربية الفصحى) suited for academic and university marketplace contexts in Iraq and Kurdistan.';
  } else {
    return 'Respond in English with clear, friendly, student-focused academic phrasing.';
  }
}

// Fallback generators in case GEMINI_API_KEY is not set or network fails
function generateFallbackDescription(title: string, category: string, department: string, condition: string, notes: string, lang: string) {
  if (lang === 'ku') {
    return {
      title: title,
      description: `ئەم بابەتە (${title}) بە تایبەتی بۆ قوتابیان و ئەکادیمیانی بەشی ${department || 'زانکۆ'} ئامادە کراوە. بارودۆخی کەلوپەلەکە زۆر گونجاوە (${condition || 'پاک'}) و بە تەواوی ئامادەیە بۆ بەکارهێنان لە هۆڵەکانی خوێندن و تاقیگەدا. خاوەنەکەی بە وریایی پاراستوویەتی و هەموو پەڕە و بەشە سەرەکییەکانی بێ کەم و کوڕییە. ${notes ? `تێبینی زیاتر: ${notes}` : ''}`,
      highlights: [
        'گونجاوە بۆ تاقیکردنەوە و خوێندنی وەرزی',
        'پاک و بێ کێشە، لاپەڕە و پێکهاتەی تەواو',
        'تێبینی و ڕێنوێنی بەسوودی تێدایە',
        'ڕادەستکردنی ڕاستەوخۆ لەناو کەمپی زانکۆ',
      ],
      targetMajors: [department || 'ئەندازیاری و تەکنەلۆژیا', 'زانست و کۆمپیوتەر', 'قۆناغەکانی ١ تا ٤'],
      tags: ['کتێبی_زانکۆ', 'پێداویستی_کەمپ', 'ئەکادیمی', 'زانکۆکانی_هەرێم'],
    };
  } else if (lang === 'ar') {
    return {
      title: title,
      description: `هذا العنصر الأكاديمي (${title}) موجه لطلبة وأساتذة قسم ${department || 'الجامعة'}. يتميز بحالة ممتازة (${condition || 'جيد جداً'}) وهو جاهز للاستخدام الفوري في الفصول الدراسية والمختبرات. تمت المحافظة عليه بعناية فائقة. ${notes ? `ملاحظات إضافية: ${notes}` : ''}`,
      highlights: [
        'مناسب جداً للمقررات الدراسية والامتحانات الفصلية',
        'حالة ممتازة وخالٍ من العيوب الأساسية',
        'يتضمن ملاحظات إرشادية مفيدة للطلبة',
        'تسليم يدوي مباشر داخل الحرم الجامعي',
      ],
      targetMajors: [department || 'الهندسة والعلوم', 'تكنولوجيا المعلومات', 'المراحل الجامعية كافة'],
      tags: ['مستلزمات_جامعية', 'كتب_أكاديمية', 'الحرم_الجامعي', 'تبادل_طلابي'],
    };
  } else {
    return {
      title: title,
      description: `This verified academic resource (${title}) is ideal for students and professors in ${department || 'University programs'}. Maintained in ${condition || 'great'} condition, ready for coursework, assignments, and exam revision. ${notes ? `Notes: ${notes}` : ''}`,
      highlights: [
        'Aligned with current university curriculum requirements',
        'Pristine condition with complete chapters/accessories',
        'Includes helpful handwritten formula annotations',
        'Safe daylight handover at public campus meeting points',
      ],
      targetMajors: [department || 'General Engineering', 'Computer Science & Sciences', 'Freshmen & Seniors'],
      tags: ['CampusExchange', 'Textbooks', 'AcademicGear', 'UniversityDeals'],
    };
  }
}

function generateFallbackPriceAdvisor(title: string, category: string, condition: string, originalPriceStr: string, lang: string) {
  const origPriceNum = parseInt(originalPriceStr?.replace(/[^0-9]/g, '') || '35000', 10);
  const baseDiscount = condition === 'brand_new' ? 0.8 : condition === 'like_new' ? 0.65 : condition === 'good' ? 0.5 : 0.4;
  const recommendedIqd = Math.round((origPriceNum * baseDiscount) / 1000) * 1000 || 22000;
  const minIqd = Math.round((recommendedIqd * 0.85) / 1000) * 1000;
  const maxIqd = Math.round((recommendedIqd * 1.15) / 1000) * 1000;
  const recommendedUsd = Math.round(recommendedIqd / 1470);

  if (lang === 'ku') {
    return {
      recommendedPriceIqd: recommendedIqd,
      minPriceIqd: minIqd,
      maxPriceIqd: maxIqd,
      recommendedPriceUsd: recommendedUsd,
      demandRating: 'خواستێکی زۆر لە کەمپ (High Demand)',
      appraisalVerdict: 'نرخێکی دادپەروەرانە و دۆستانە بۆ قوتابیانی کەمپ',
      reasoning: `لەبەرچاوگرتنی بارودۆخی کەلوپەلەکە (${condition}) و خواستی زۆری خوێندکاران لەم وەرزەدا، ئەم نرخە (${recommendedIqd.toLocaleString()} د.ع) فرۆشتنێکی خێرا و سوودی دوولایەنە مسۆگەر دەکات.`,
      sellerTips: [
        'وێنەی ڕوون لە ژێر ڕووناکی ڕۆژ لەناو کەمپ بگرە',
        'ئاماژە بەوە بدە ئەگەر نۆتس یان پوختەی وانەی لەگەڵدایە',
        'لە کتێبخانە یان کافیتریای زانکۆ چاوپێکەوتن بکە',
      ],
      buyerInspectionTips: [
        'پێش پارەدان لاپەڕەکان و بەرگی کتێب بپشکنە',
        'ئەگەر ئامێرە پاتری و دوگمەکانی لەبەردەم فرۆشیار تاقی بکەرەوە',
        'دڵنیابەوە لە وەشان و ساڵی چاپکردنی فەرمی',
      ],
    };
  } else if (lang === 'ar') {
    return {
      recommendedPriceIqd: recommendedIqd,
      minPriceIqd: minIqd,
      maxPriceIqd: maxIqd,
      recommendedPriceUsd: recommendedUsd,
      demandRating: 'طلب مرتفع بالحرم الجامعي (High Demand)',
      appraisalVerdict: 'سعر عادل ومشجع للطلبة والأساتذة',
      reasoning: `بناءً على حالة المادة المعروضة (${condition}) وحاجة الطلبة الماسة لها هذا الفصل، فإن سعر (${recommendedIqd.toLocaleString()} د.ع) يعد نقطة توازن مثالية بين التوفير والسرعة في البيع.`,
      sellerTips: [
        'التقط صوراً واضحة تُظهر نظافة المنتج والأوراق',
        'حدد مكاناً عاماً للتسليم في باحة الكلية أو المكتبة',
        'كن مرناً قليلاً مع طلاب المراحل الأولى',
      ],
      buyerInspectionTips: [
        'عاين الغلاف وسلامة الصفحات والأدوات قبل الدفع',
        'تأكد من توافق الطبعة مع مفردات منهجك الدراسي',
        'افحص التجهيزات والأزرار إذا كانت إلكترونية',
      ],
    };
  } else {
    return {
      recommendedPriceIqd: recommendedIqd,
      minPriceIqd: minIqd,
      maxPriceIqd: maxIqd,
      recommendedPriceUsd: recommendedUsd,
      demandRating: 'High Campus Demand',
      appraisalVerdict: 'Fair & Fast-Selling Student Price',
      reasoning: `Based on current campus demand and condition (${condition}), an asking price of ${recommendedIqd.toLocaleString()} IQD ($${recommendedUsd}) provides maximum fairness to buyers and quick turnover for sellers.`,
      sellerTips: [
        'Highlight included syllabus notes or problem solutions',
        'Meet at popular daylight spots like the campus central library',
        'Offer a friendly bundle discount if paired with another book',
      ],
      buyerInspectionTips: [
        'Flip through core chapters to verify clean pages',
        'Inspect electronic ports and battery health on the spot',
        'Confirm the edition matches your course syllabus',
      ],
    };
  }
}

function generateFallbackSyllabus(itemName: string, major: string, lang: string) {
  if (lang === 'ku') {
    return {
      itemSummary: `ئەم کەرەستەیە یان سەرچاوەیە (${itemName}) یەکێکە لە کۆڵەکە سەرەکییەکانی وانەکانی بەشی ${major || 'ئەندازیاری و زانست'}. یارمەتی تێگەیشتنی قووڵ لە پرەنسیپە تیۆری و تاقیگەییەکان دەدات.`,
      relevantCourses: [
        'وانە سەرەکییەکانی قۆناغی یەکەم و دووەم',
        'تاقیکردنەوەی تاقیگەیی و کارامەیی پراکتیکی',
        'پڕۆژەی وەرزی و سیمیناری فێرخوازان',
      ],
      idealForStage: 'قۆناغی ١ و ٢ (هەروەها سەرچاوە بۆ قۆناغەکانی تر)',
      academicValueTip: 'پوختەی هاوکێشەکان و پێناسە سەرەکییەکان لە لاپەڕەی جیاواز بنووسەوە بۆ ئەوەی لە تاقیکردنەوەی فاینەڵدا بە خێرایی پێداچوونەوەیان بۆ بکەیت.',
      studyRecommendations: [
        'هەفتانە لانیکەم دوو کاژێر مەشق لەسەر نموونەکانی ناو ئەم سەرچاوەیە بکە',
        'هاوکات لەگەڵ وانەی مامۆستا هێڵ بەژێر خاڵە گرنگەکاندا بهێنە',
        'لە گرووپی خوێندنی هاوپۆلەکانت سوودی لێ وەرگرن',
      ],
    };
  } else if (lang === 'ar') {
    return {
      itemSummary: `يمثل هذا المرجع أو الأداة (${itemName}) عنصراً أساسياً لمقررات قسم ${major || 'الهندسة والعلوم'}. يوفر فهماً شاملاً للمفاهيم الأساسية والتطبيقات العملية.`,
      relevantCourses: [
        'المقررات التأسيسية للمرحلتين الأولى والثانية',
        'التجارب العملية والامتحانات المختبرية',
        'مشاريع الحلقات الدراسية وحل التمارين التخصصية',
      ],
      idealForStage: 'المرحلة الأولى والثانية (ومرجع للمراحل المتقدمة)',
      academicValueTip: 'قم بتدوين القوانين والمصطلحات الرئيسية في ملحق خارجي لتسهيل المراجعة السريعة ليلة الامتحان.',
      studyRecommendations: [
        'حل المسائل النموذجية في نهاية كل فصل دورياً',
        'المطابقة المستمرة مع خطة أستاذ المادة في المحاضرات',
        'مشاركة الملاحظات الهامة مع الزملاء في قاعة الدراسة',
      ],
    };
  } else {
    return {
      itemSummary: `This essential academic resource (${itemName}) directly supports core curricula within ${major || 'Engineering & Science departments'}. It bridges theoretical rigor with practical campus applications.`,
      relevantCourses: [
        'Core Stage 1 & Stage 2 Foundational Courses',
        'Laboratory Practicals and Midterm Evaluations',
        'Capstone Preparations & Problem Solving Seminars',
      ],
      idealForStage: 'Stages 1 & 2 (Key reference throughout graduation)',
      academicValueTip: 'Use colored adhesive flags to index recurring formulas and high-frequency exam derivations.',
      studyRecommendations: [
        'Dedicate time after each lecture to review the corresponding section',
        'Practice end-of-chapter problems under timed exam conditions',
        'Form peer review circles to quiz each other before midterms',
      ],
    };
  }
}

function generateFallbackDealAssistant(itemTitle: string, price: any, question: string, userRole: string, lang: string) {
  if (lang === 'ku') {
    return {
      suggestedReplies: [
        `سڵاو، هیوادارم باش بیت. ئایا «${itemTitle}» هێشتا بەردەستە؟ دەتوانین لە کەمپی زانکۆ چاوپێکەوتن بکەین؟`,
        `سڵاو هاوپۆلی بەڕێز، من قوتابی زانکۆم و پێویستم بەم بابەتەیە. ئایا کەمێک داشکاندن ڕێگەپێدراوە بۆم؟`,
        `سڵاو، ئایا لە بەردەم کتێبخانەی ناوەندی زانکۆ سبەی لە کاتی دەوام دەتوانیت ببینین؟ دەستخۆش.`,
      ],
      safeMeetingSpots: [
        'بەردەم کتێبخانەی ناوەندی زانکۆ (کاتی دەوامی فەرمی)',
        'کافیتریای کۆلێژ یان سەنتەری خوێندکاران لە ڕۆژدا',
        'نزیک دەروازەی سەرەکی و پاسەوانی کەمپ',
      ],
      negotiationAdvice: 'هەمیشە بە ڕێزەوە و بە گیانی خوێندکارانە قسە بکە. ئەگەر چەند کتێبێک پێکەوە دەکڕیت، داوای داشکاندنی بە کۆمەڵ بکە.',
      safetyReminder: 'هەرگیز پێش بینین و پشکنینی ڕاستەوخۆی کەلوپەلەکە هیچ بڕە پارەیەک حەواڵە مەکە.',
    };
  } else if (lang === 'ar') {
    return {
      suggestedReplies: [
        `مرحباً زميلي، هل «${itemTitle}» ما زال متوفراً؟ يسعدني اللقاء بالحرم الجامعي لمعاينته.`,
        `السلام عليكم، أنا طالب في الكلية وبحاجة لهذا المرجع. هل هناك إمكانية لخصم بسيط يناسب ميزانية الطالب؟`,
        `تحياتي، هل يناسبك اللقاء غداً أمام المكتبة المركزية بالجامعة وقت الاستراحة؟ شكراً جزيلاً.`,
      ],
      safeMeetingSpots: [
        'أمام المكتبة المركزية بالحرم الجامعي أثناء ساعات الدوام',
        'كافتيريا الكلية أو مركز الأنشطة الطلابية',
        'قرب البوابة الرئيسية وأمن الحرم الجامعي',
      ],
      negotiationAdvice: 'ابدأ بالتحية اللبقة وتحدث بروح الزمالة الجامعية. تقديم عرض محترم يزيد من قبول الطرف الآخر للتفاوض.',
      safetyReminder: 'لا تحول أي عربون أو مبالغ مسبقة أبداً، المعاملات يجب أن تكون يداً بيد داخل الحرم.',
    };
  } else {
    return {
      suggestedReplies: [
        `Hello! Is "${itemTitle}" still available? Would love to meet up on campus to inspect it.`,
        `Hi peer, I'm taking this course this semester. Would you consider a small student discount?`,
        `Hello! Can we meet near the campus Central Library tomorrow between lectures? Thanks!`,
      ],
      safeMeetingSpots: [
        'Central University Library (during daylight class hours)',
        'Student Union building or College Cafeteria',
        'Near the main campus gate or security desk',
      ],
      negotiationAdvice: 'Keep communication polite and student-friendly. Inquiring about bundled items often yields better discounts.',
      safetyReminder: 'Always inspect the physical condition before transferring any funds. Daylight exchanges only.',
    };
  }
}

// 1. AI Item Description Generator
app.post('/api/ai/describe-item', async (req, res) => {
  const { title, category, department, condition, notes, language = 'ku' } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      const fallback = generateFallbackDescription(title, category, department, condition, notes, language);
      return res.json({ success: true, data: fallback });
    }

    const langPrompt = getLanguageInstruction(language);
    const systemPrompt = `You are Zankobazaar's AI academic marketplace assistant for university students and professors.
Your goal is to turn basic item details into an attractive, honest, student-friendly listing description.
${langPrompt}`;

    const userPrompt = `Item Title: ${title}
Category: ${category || 'Academic'}
Department/Major: ${department || 'General University'}
Condition: ${condition || 'Good'}
Seller Notes / Quick Info: ${notes || 'None provided'}

Generate a structured listing with:
1. An appealing, honest description (2-3 paragraphs) highlighting its academic utility and condition.
2. 3-4 key highlight bullet points (e.g. edition, clean pages, original packaging, course fit).
3. Recommended university stages/departments that need this.
4. 4-6 search tags.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            highlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            targetMajors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['title', 'description', 'highlights', 'targetMajors', 'tags'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.warn('Gemini description generation fallback engaged:', error?.message);
    const fallback = generateFallbackDescription(title, category, department, condition, notes, language);
    return res.json({ success: true, data: fallback });
  }
});

// 2. AI Price Advisor & Fair Market Value Appraiser
app.post('/api/ai/price-advisor', async (req, res) => {
  const { title, category, condition, originalPrice, department, language = 'ku' } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      const fallback = generateFallbackPriceAdvisor(title, category, condition, originalPrice, language);
      return res.json({ success: true, data: fallback });
    }

    const langPrompt = getLanguageInstruction(language);
    const systemPrompt = `You are Zankobazaar's Fair Price Appraiser for university campus marketplaces (Iraqi Kurdistan & Iraq university context, using both Iraqi Dinar (IQD) and USD ($)).
Analyze realistic second-hand academic prices for university students (who have tight budgets).
${langPrompt}`;

    const userPrompt = `Item: ${title}
Category: ${category || 'Academic'}
Condition: ${condition || 'Used - Good'}
Original/New Price: ${originalPrice || 'Unknown'}
Target Department: ${department || 'General'}

Provide:
1. recommendedPriceIqd (number in Iraqi Dinars, e.g. 15000, 25000)
2. minPriceIqd (number)
3. maxPriceIqd (number)
4. recommendedPriceUsd (number in USD, e.g. 10, 20)
5. demandRating ("High", "Moderate", "Niche")
6. appraisalVerdict (short catchy verdict)
7. reasoning (why this price makes sense for university students)
8. sellerTips (how to sell fast on campus)
9. buyerInspectionTips (what the student buyer should verify upon campus handover)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedPriceIqd: { type: Type.NUMBER },
            minPriceIqd: { type: Type.NUMBER },
            maxPriceIqd: { type: Type.NUMBER },
            recommendedPriceUsd: { type: Type.NUMBER },
            demandRating: { type: Type.STRING },
            appraisalVerdict: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            sellerTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            buyerInspectionTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'recommendedPriceIqd',
            'minPriceIqd',
            'maxPriceIqd',
            'recommendedPriceUsd',
            'demandRating',
            'appraisalVerdict',
            'reasoning',
            'sellerTips',
            'buyerInspectionTips',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.warn('Gemini price-advisor fallback engaged:', error?.message);
    const fallback = generateFallbackPriceAdvisor(title, category, condition, originalPrice, language);
    return res.json({ success: true, data: fallback });
  }
});

// 3. AI Book & Equipment Syllabus Matcher
app.post('/api/ai/syllabus-analyzer', async (req, res) => {
  const { itemName, major, language = 'ku' } = req.body;
  if (!itemName) {
    return res.status(400).json({ error: 'Item name is required' });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      const fallback = generateFallbackSyllabus(itemName, major, language);
      return res.json({ success: true, data: fallback });
    }

    const langPrompt = getLanguageInstruction(language);
    const systemPrompt = `You are Zankobazaar's Academic Course Matcher. You understand university curriculums (Engineering, Medicine, Science, Computer Science, Law, Administration, Arts) in Iraqi Kurdistan and the wider region.
${langPrompt}`;

    const userPrompt = `Item / Textbook / Equipment: ${itemName}
Major / College: ${major || 'General'}

Analyze which university courses, semesters, and subjects rely on this textbook or tool, why it is essential, and tips for students studying with it.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itemSummary: { type: Type.STRING },
            relevantCourses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            idealForStage: { type: Type.STRING },
            academicValueTip: { type: Type.STRING },
            studyRecommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['itemSummary', 'relevantCourses', 'idealForStage', 'academicValueTip', 'studyRecommendations'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.warn('Gemini syllabus-analyzer fallback engaged:', error?.message);
    const fallback = generateFallbackSyllabus(itemName, major, language);
    return res.json({ success: true, data: fallback });
  }
});

// 4. AI Campus Safe Deal & Negotiation Assistant
app.post('/api/ai/deal-assistant', async (req, res) => {
  const { itemTitle, price, question, userRole = 'buyer', language = 'ku' } = req.body;
  if (!itemTitle) {
    return res.status(400).json({ error: 'Item title is required' });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      const fallback = generateFallbackDealAssistant(itemTitle, price, question, userRole, language);
      return res.json({ success: true, data: fallback });
    }

    const langPrompt = getLanguageInstruction(language);
    const systemPrompt = `You are Zankobazaar's Campus Deal and Negotiation Advisor.
You help university students and faculty negotiate politely, verify condition, and coordinate safe on-campus meetings (e.g. Central Library, Student Center, Department Cafeteria, Campus Gate).
${langPrompt}`;

    const userPrompt = `Item: ${itemTitle}
Price: ${price}
User is: ${userRole} (buyer or seller)
User's situation/question: ${question || 'How to politely make an offer or arrange a safe meetup?'}

Provide:
1. 3 quick student-friendly polite message templates they can copy/paste.
2. Safe on-campus meetup recommendations.
3. Polite negotiation guidance.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedReplies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            safeMeetingSpots: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            negotiationAdvice: { type: Type.STRING },
            safetyReminder: { type: Type.STRING },
          },
          required: ['suggestedReplies', 'safeMeetingSpots', 'negotiationAdvice', 'safetyReminder'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.warn('Gemini deal-assistant fallback engaged:', error?.message);
    const fallback = generateFallbackDealAssistant(itemTitle, price, question, userRole, language);
    return res.json({ success: true, data: fallback });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Zankobazaar Backend', timestamp: new Date().toISOString() });
});

// Serve frontend
async function setupVite() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Zankobazaar server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
