const Groq = require('groq-sdk');

// ===============================
// CACHE
// ===============================
const API_CALL_CACHE = new Map();
const API_CALL_TIMES = [];

const MAX_CALLS_PER_MINUTE = 100;
const CACHE_DURATION = 10 * 60 * 1000;

// ===============================
// GROQ CLIENT
// ===============================
let groqClient = null;

function getGroqClient() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;

    console.log(
      '🔑 Groq API Key:',
      apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT FOUND'
    );

    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      throw new Error('GROQ_API_KEY is not configured');
    }

    groqClient = new Groq({
      apiKey: apiKey
    });

    console.log('✅ Groq client initialized');
  }

  return groqClient;
}

// ===============================
// LANGUAGES
// ===============================
const LANGUAGE_MAPPINGS = {
  en: 'English',
  hi: 'Hindi',
  bn: 'Bengali',
  or: 'Odia',
  ur: 'Urdu',
  bho: 'Bhojpuri',
  mag: 'Magahi',
  mai: 'Maithili',
  sa: 'Sanskrit',
  auto: 'Auto-detect'
};

// ===============================
// LANGUAGE DETECTION
// ===============================
function detectLanguage(text) {
  const hindiPattern = /[\u0900-\u097F]/;
  const bengaliPattern = /[\u0980-\u09FF]/;
  const odiaPattern = /[\u0B00-\u0B7F]/;

  if (hindiPattern.test(text)) {
    return 'hi';
  }

  if (bengaliPattern.test(text)) {
    return 'bn';
  }

  if (odiaPattern.test(text)) {
    return 'or';
  }

  return 'en';
}

// ===============================
// RATE LIMIT
// ===============================
function canMakeAPICall() {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  while (
    API_CALL_TIMES.length > 0 &&
    API_CALL_TIMES[0] < oneMinuteAgo
  ) {
    API_CALL_TIMES.shift();
  }

  return API_CALL_TIMES.length < MAX_CALLS_PER_MINUTE;
}

// ===============================
// CACHE
// ===============================
function getCachedResponse(message, language) {
  const key =
    `${message.toLowerCase().trim()}_${language}`;

  const cached = API_CALL_CACHE.get(key);

  if (
    cached &&
    Date.now() - cached.timestamp < CACHE_DURATION
  ) {
    console.log('📦 Using cached response');
    return cached.response;
  }

  return null;
}

function cacheResponse(message, language, response) {
  const key =
    `${message.toLowerCase().trim()}_${language}`;

  API_CALL_CACHE.set(key, {
    response,
    timestamp: Date.now()
  });

  if (API_CALL_CACHE.size > 100) {
    const oldestKey =
      API_CALL_CACHE.keys().next().value;

    API_CALL_CACHE.delete(oldestKey);
  }
}

// ===============================
// GROQ API
// ===============================
const callGroqAPI = async (message, language) => {

  const client = getGroqClient();

  // Check cache
  const cachedResponse =
    getCachedResponse(message, language);

  if (cachedResponse) {
    return cachedResponse;
  }

  // Rate limit
  if (!canMakeAPICall()) {
    throw new Error('Groq rate limit exceeded');
  }

  API_CALL_TIMES.push(Date.now());

  const languageName =
    LANGUAGE_MAPPINGS[language] || 'English';

  const systemPrompt = `
You are an AI tourism assistant for Jharkhand, India.

You help users with:

- Tourist destinations
- Waterfalls
- Wildlife
- Temples
- Tribal culture
- Festivals
- Local food
- Transportation
- Accommodation
- Travel plans
- Best time to visit

IMPORTANT:
- Answer in ${languageName}.
- Keep answers simple and useful.
- Give 2 to 5 sentences.
- Focus on Jharkhand tourism.
- If the question is unrelated, politely bring the conversation back to Jharkhand tourism.
`;

  try {

    console.log('🤖 Calling Groq...');

    const completion =
      await client.chat.completions.create({

        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: message
          }
        ],

        model: 'llama-3.1-8b-instant',

        temperature: 0.7,

        max_tokens: 512,

        stream: false
      });

    const response =
      completion?.choices?.[0]?.message?.content;

    if (!response) {
      throw new Error(
        'Empty response from Groq'
      );
    }

    const finalResponse =
      response.trim();

    cacheResponse(
      message,
      language,
      finalResponse
    );

    console.log('✅ Groq response received');

    return finalResponse;

  } catch (error) {

    console.error(
      '❌ Groq API error:',
      error.message
    );

    throw error;
  }
};

// ===============================
// LOCAL FALLBACK
// ===============================
const generateIntelligentFallback =
  async (message, language) => {

    const text =
      message.toLowerCase();

    // =========================
    // HINDI
    // =========================
    if (language === 'hi') {

      if (
        text.includes('waterfall') ||
        text.includes('झरना')
      ) {
        return 'झारखंड में हुंडरू फॉल्स, दशम फॉल्स और जोन्हा फॉल्स प्रसिद्ध जलप्रपात हैं। हुंडरू फॉल्स रांची के पास स्थित है और पर्यटकों के बीच बहुत लोकप्रिय है।';
      }

      if (text.includes('ranchi')) {
        return 'रांची झारखंड की राजधानी है। यहाँ हुंडरू फॉल्स, दशम फॉल्स और रांची झील जैसे लोकप्रिय पर्यटन स्थल हैं।';
      }

      if (
        text.includes('temple') ||
        text.includes('मंदिर') ||
        text.includes('deoghar')
      ) {
        return 'देवघर का बैद्यनाथ मंदिर और रजरप्पा का छिन्नमस्तिका मंदिर झारखंड के प्रसिद्ध धार्मिक स्थल हैं।';
      }

      return 'मैं झारखंड पर्यटन के बारे में आपकी मदद कर सकता हूँ। आप पर्यटन स्थल, झरने, मंदिर, वन्यजीव, जनजातीय संस्कृति, भोजन या यात्रा योजना के बारे में पूछ सकते हैं।';
    }

    // =========================
    // BENGALI
    // =========================
    if (language === 'bn') {

      if (text.includes('waterfall')) {
        return 'ঝাড়খণ্ডের বিখ্যাত জলপ্রপাতগুলির মধ্যে হুন্ডরু ফলস, দশম ফলস এবং জোনা ফলস উল্লেখযোগ্য।';
      }

      if (text.includes('ranchi')) {
        return 'রাঁচি ঝাড়খণ্ডের রাজধানী এবং হুন্ডরু ফলস, দশম ফলস ও রাঁচি লেকের জন্য বিখ্যাত।';
      }

      return 'আমি ঝাড়খণ্ড পর্যটন সম্পর্কে আপনাকে সাহায্য করতে পারি। পর্যটন স্থান, জলপ্রপাত, মন্দির, সংস্কৃতি বা ভ্রমণ পরিকল্পনা সম্পর্কে জিজ্ঞাসা করুন।';
    }

    // =========================
    // ODIA
    // =========================
    if (language === 'or') {

      if (text.includes('waterfall')) {
        return 'ଝାଡ଼ଖଣ୍ଡର ପ୍ରସିଦ୍ଧ ଜଳପ୍ରପାତ ମଧ୍ୟରେ ହୁଣ୍ଡ୍ରୁ ଫଲ୍ସ, ଦଶମ ଫଲ୍ସ ଏବଂ ଜୋନ୍ହା ଫଲ୍ସ ରହିଛି।';
      }

      if (text.includes('ranchi')) {
        return 'ରାଞ୍ଚି ଝାଡ଼ଖଣ୍ଡର ରାଜଧାନୀ ଏବଂ ହୁଣ୍ଡ୍ରୁ ଫଲ୍ସ, ଦଶମ ଫଲ୍ସ ଓ ରାଞ୍ଚି ଲେକ୍ ପାଇଁ ପ୍ରସିଦ୍ଧ।';
      }

      return 'ମୁଁ ଝାଡ଼ଖଣ୍ଡ ପର୍ଯ୍ୟଟନ ବିଷୟରେ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିପାରିବି। ପର୍ଯ୍ୟଟନ ସ୍ଥାନ, ଜଳପ୍ରପାତ, ମନ୍ଦିର, ସଂସ୍କୃତି କିମ୍ବା ଭ୍ରମଣ ଯୋଜନା ବିଷୟରେ ପଚାରନ୍ତୁ।';
    }

    // =========================
    // ENGLISH
    // =========================

    if (
      text.includes('waterfall') ||
      text.includes('falls')
    ) {
      return 'Jharkhand has several beautiful waterfalls, including Hundru Falls, Dassam Falls and Jonha Falls. Hundru Falls is one of the most popular attractions near Ranchi.';
    }

    if (text.includes('ranchi')) {
      return 'Ranchi is the capital of Jharkhand. Popular attractions include Hundru Falls, Dassam Falls and Ranchi Lake.';
    }

    if (
      text.includes('temple') ||
      text.includes('deoghar')
    ) {
      return 'Jharkhand has important religious destinations such as Baidyanath Temple in Deoghar and Chhinnamasta Temple at Rajrappa.';
    }

    if (
      text.includes('food') ||
      text.includes('cuisine') ||
      text.includes('eat')
    ) {
      return 'Jharkhand is known for traditional foods such as Dhuska, Litti Chokha, Rugra and Chilka Roti.';
    }

    if (
      text.includes('culture') ||
      text.includes('tribal') ||
      text.includes('festival')
    ) {
      return 'Jharkhand is rich in tribal culture and traditions. Popular festivals include Sarhul, Karma and Sohrai.';
    }

    if (
      text.includes('wildlife') ||
      text.includes('forest') ||
      text.includes('national park')
    ) {
      return 'Betla National Park and Dalma Wildlife Sanctuary are popular wildlife destinations in Jharkhand.';
    }

    return 'I can help you explore Jharkhand! Ask me about tourist destinations, waterfalls, temples, wildlife, tribal culture, local food, festivals or travel plans.';
};

// ===============================
// SEND MESSAGE
// ===============================
const sendMessage = async (req, res) => {

  try {

    const {
      message,
      language
    } = req.body;

    // Validate
    if (
      !message ||
      typeof message !== 'string' ||
      message.trim().length === 0
    ) {

      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });

    }

    // Detect language
    const detectedLanguage =
      language === 'auto'
        ? detectLanguage(message)
        : (language || 'en');

    let response;

    // =========================
    // TRY GROQ
    // =========================

    console.log(
      '🤖 Using Groq AI for:',
      message
    );

    try {

      response =
        await callGroqAPI(
          message,
          detectedLanguage
        );

      console.log(
        '✅ Groq API success'
      );

    } catch (groqError) {

      console.error(
        '❌ Groq failed:',
        groqError.message
      );

      // =========================
      // LOCAL FALLBACK
      // =========================

      console.log(
        '🔄 Using local fallback...'
      );

      response =
        await generateIntelligentFallback(
          message,
          detectedLanguage
        );

      console.log(
        '✅ Local fallback success'
      );
    }

    // =========================
    // SEND RESPONSE
    // =========================

    return res.json({

      success: true,

      response: response,

      detectedLanguage:
        detectedLanguage,

      supportedLanguages:
        Object.keys(LANGUAGE_MAPPINGS)

    });

  } catch (error) {

    console.error(
      '❌ Chatbot error:',
      error.message
    );

    return res.status(500).json({

      success: false,

      error:
        'Sorry, I encountered an error. Please try again.',

      detectedLanguage:
        detectLanguage(
          req.body?.message || ''
        )

    });
  }
};

// ===============================
// HEALTH CHECK
// ===============================
const healthCheck = async (req, res) => {

  try {

    getGroqClient();

    return res.json({

      success: true,

      chatbotService:
        'available',

      features: {

        groqAPI:
          'configured',

        model:
          'llama-3.1-8b-instant',

        multilingualSupport:
          true,

        supportedLanguages:
          Object.keys(
            LANGUAGE_MAPPINGS
          ),

        tourismContext:
          'Jharkhand focused',

        rateLimit:
          `${MAX_CALLS_PER_MINUTE} calls per minute`

      }

    });

  } catch (error) {

    return res.status(503).json({

      success: false,

      chatbotService:
        'unavailable',

      error:
        error.message

    });

  }
};

// ===============================
// EXPORT
// ===============================
module.exports = {
  sendMessage,
  healthCheck
};