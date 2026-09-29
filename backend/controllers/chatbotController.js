const Groq = require("groq-sdk");
const knowledge = require("../../data/chatbot-knowledge.json");

// =====================================================
// CONFIGURATION
// =====================================================

const MODEL = "llama-3.3-70b-versatile";
const MAX_HISTORY = 8;
const CACHE_DURATION = 10 * 60 * 1000;
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 100;

// =====================================================
// LANGUAGE CONFIGURATION
// =====================================================

const LANGUAGE_NAMES = {
  en: "English",
  hi: "Hindi",
  te: "Telugu",
  bn: "Bengali",
  or: "Odia",
  ur: "Urdu",
  bho: "Bhojpuri",
  mag: "Magahi",
  mai: "Maithili",
  sa: "Sanskrit",
  auto: "Auto-detected language",
};

// =====================================================
// CACHE + RATE LIMIT
// =====================================================

const responseCache = new Map();
const rateLimitMap = new Map();

// =====================================================
// GROQ CLIENT
// =====================================================

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error("❌ GROQ_API_KEY is missing");
    return null;
  }

  if (
    apiKey === "your_groq_api_key" ||
    apiKey === "YOUR_GROQ_API_KEY" ||
    apiKey.includes("your_")
  ) {
    console.error("❌ GROQ_API_KEY is still a placeholder");
    return null;
  }

  return new Groq({
    apiKey,
  });
}

// =====================================================
// CLEAN AI RESPONSE
// =====================================================

function cleanResponse(text = "") {
  let cleaned = String(text);

  // Remove HTML line breaks and common HTML tags
  cleaned = cleaned
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?p>/gi, "\n")
    .replace(/<\/?strong>/gi, "")
    .replace(/<\/?b>/gi, "")
    .replace(/<\/?em>/gi, "")
    .replace(/<\/?i>/gi, "")
    .replace(/<\/?div>/gi, "")
    .replace(/<[^>]*>/g, "");

  // Remove Markdown table rows
  cleaned = cleaned
    .replace(/^\s*\|.*\|\s*$/gm, "")
    .replace(/^\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+$/gm, "");

  // Remove Markdown heading symbols
  cleaned = cleaned.replace(/^\s*#{1,6}\s*/gm, "");

  // Remove bold / italic markers
  cleaned = cleaned.replace(/\*\*\*/g, "");
  cleaned = cleaned.replace(/\*\*/g, "");
  cleaned = cleaned.replace(/__/g, "");
  cleaned = cleaned.replace(/\*/g, "");

  // Remove Markdown horizontal lines
  cleaned = cleaned.replace(/^\s*[-_*]{3,}\s*$/gm, "");

  // Remove remaining table pipe characters
  cleaned = cleaned.replace(/\|/g, "");

  // Convert HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  // Clean excessive blank lines
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  return cleaned.trim();
}

// =====================================================
// LANGUAGE DETECTION
// =====================================================

function detectLanguage(text = "") {
  const value = text.trim();

  // Telugu script
  if (/[\u0C00-\u0C7F]/.test(value)) {
    return "te";
  }

  // Hindi / Devanagari
  if (/[\u0900-\u097F]/.test(value)) {
    return "hi";
  }

  // Bengali
  if (/[\u0980-\u09FF]/.test(value)) {
    return "bn";
  }

  // Odia
  if (/[\u0B00-\u0B7F]/.test(value)) {
    return "or";
  }

  // Urdu
  if (/[\u0600-\u06FF]/.test(value)) {
    return "ur";
  }

  const lower = value.toLowerCase();

  // Roman Telugu
  const teluguWords = [
    "naku",
    "naaku",
    "cheppu",
    "cheppandi",
    "ela",
    "undi",
    "unnayi",
    "entha",
    "ekkuva",
    "vellali",
    "vellacha",
    "jharkhand lo",
    "gurinchi",
    "waterfalls",
    "places",
    "ivvu",
    "kavali",
    "chudali",
  ];

  if (teluguWords.some((word) => lower.includes(word))) {
    return "te";
  }

  // Roman Hindi
  const hindiWords = [
    "mujhe",
    "batao",
    "bataye",
    "kaise",
    "kitna",
    "kitne",
    "kahan",
    "jharkhand mein",
    "kya hai",
    "khana",
    "ghoomne",
  ];

  if (hindiWords.some((word) => lower.includes(word))) {
    return "hi";
  }

  return "en";
}

// =====================================================
// RATE LIMIT
// =====================================================

function checkRateLimit(ip = "unknown") {
  const now = Date.now();
  const existing = rateLimitMap.get(ip);

  if (!existing) {
    rateLimitMap.set(ip, {
      count: 1,
      start: now,
    });

    return true;
  }

  if (now - existing.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, {
      count: 1,
      start: now,
    });

    return true;
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    return false;
  }

  existing.count += 1;

  return true;
}

// =====================================================
// CACHE
// =====================================================

function getCacheKey(message, language) {
  return `${language}:${message.trim().toLowerCase()}`;
}

function getCachedResponse(key) {
  const item = responseCache.get(key);

  if (!item) {
    return null;
  }

  if (Date.now() - item.timestamp > CACHE_DURATION) {
    responseCache.delete(key);
    return null;
  }

  return item.response;
}

function setCachedResponse(key, response) {
  responseCache.set(key, {
    response,
    timestamp: Date.now(),
  });
}

// =====================================================
// KNOWLEDGE PREPARATION
// =====================================================

function getKnowledgeText() {
  try {
    return JSON.stringify(knowledge, null, 2);
  } catch (error) {
    console.error("❌ Knowledge JSON error:", error.message);
    return "{}";
  }
}

// =====================================================
// GROQ API
// =====================================================

async function callGroqAPI(message, language, history = []) {
  const groq = getGroqClient();

  if (!groq) {
    throw new Error("Groq client not configured");
  }

  const languageName = LANGUAGE_NAMES[language] || "English";

  const recentHistory = Array.isArray(history)
    ? history.slice(-MAX_HISTORY)
    : [];

  const historyText =
    recentHistory.length > 0
      ? recentHistory
          .map((item) => {
            const role = item.role || "user";
            const content = item.content || item.message || "";
            return `${role}: ${content}`;
          })
          .join("\n")
      : "No previous conversation.";

  const systemPrompt = `
You are the official AI tourism assistant for Jharkhand Tourism.

Your job is to help users understand and explore Jharkhand's:
- tourist destinations
- waterfalls
- eco tourism
- cultural tourism
- tribal experiences
- local food
- handicrafts
- festivals
- temples
- wildlife
- travel ideas
- itineraries
- tourism-related general questions

IMPORTANT LANGUAGE RULES:

1. Answer in ${languageName}.
2. If the user writes Telugu in English letters, reply in natural Roman Telugu.
3. If the user writes Hindi in English letters, reply in natural Roman Hindi.
4. If the user writes Telugu script, reply in Telugu script.
5. If the user writes Hindi script, reply in Hindi script.
6. Keep the user's language unless they clearly ask for another language.

GENERAL CONVERSATION:

- Reply naturally to hi, hello, hey, thanks, thank you, bye, goodbye, etc.
- Do not force every conversation into a tourism answer.
- If the user says goodbye, give a short friendly goodbye.

FOLLOW-UP QUESTIONS:

- Use previous conversation to understand words such as:
  "it", "there", "that place", "this waterfall", "how far", "nearby", "what about food", etc.
- Example:
  User: Tell me about Hundru Falls.
  User: How far is it from Ranchi?
  You should understand "it" as Hundru Falls.

GROUNDING:

- Use the provided project knowledge as the primary factual source.
- Do not invent facts.
- Never invent exact:
  distances
  prices
  opening or closing timings
  facilities
  routes
  transport details
  event dates
  weather conditions
  wildlife sightings
  safety claims
- If an exact fact is not available, say briefly:
  "I do not have a verified figure for that detail."
- Do not make the entire answer a refusal just because one detail is unavailable.
- Give the verified information that is available.

BROAD QUESTIONS:

For questions such as:
- best tourist places in Jharkhand
- food to try
- things to do
- waterfalls
- places for families
- places for nature lovers
- 2/3/5 day trip

Use:
- simple plain-text headings
- short paragraphs
- bullet points using "-" only
- numbered lists when useful

Never use tables.

RESPONSE FORMATTING RULES:

- Use plain text only.
- Never use Markdown formatting.
- Never use Markdown tables.
- Never use the "|" character.
- Never use asterisks (*) for bold or italic formatting.
- Never use double asterisks (**).
- Never use underscores (_) for bold or italic formatting.
- Never use Markdown headings such as #, ##, or ###.
- Never use Markdown separator lines such as "---", "***", or "___".
- Never use horizontal separator lines.
- Never use HTML tags such as <br>, <p>, <strong>, <b>, <em>, or <div>.
- Do not use special symbols for styling.
- Use simple text headings without # or * symbols.
- Use "-" for bullet points only when a list is necessary.
- Keep the answer clean, natural, readable, and conversational.
- Do not put information inside a table.
- Do not create rows or columns using pipe characters.
- Do not add decorative symbols around headings.

TRAVEL PLANS:

- Use destinations present in the project knowledge.
- Clearly label recommendations as suggestions.
- Do not claim that a suggested route or timing is officially verified unless the knowledge says so.

STYLE:

- Natural
- Helpful
- Clear
- Concise for simple questions
- Detailed for broad questions
- Avoid unnecessary disclaimers
- Do not repeatedly say "verified data" in every sentence.

For simple questions:
2-5 sentences are enough.

For broad questions:
Use structured answers with simple headings, paragraphs, bullets or numbered lists.

PROJECT KNOWLEDGE:

${getKnowledgeText()}

CONVERSATION HISTORY:

${historyText}
`;

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...recentHistory.map((item) => ({
        role: item.role === "assistant" ? "assistant" : "user",
        content: item.content || item.message || "",
      })),
      {
        role: "user",
        content: message,
      },
    ],
    temperature: 0.2,
    max_tokens: 700,
    stream: false,
  });

  const response =
    completion?.choices?.[0]?.message?.content?.trim() || "";

  if (!response) {
    throw new Error("Groq returned an empty response");
  }

  console.log("✅ Groq API success");

  return cleanResponse(response);
}

// =====================================================
// GENERAL CONVERSATION
// =====================================================

function getGeneralConversationResponse(text, language) {
  const value = text.trim().toLowerCase();

  // -------------------------
  // BYE
  // -------------------------

  if (
    /^(bye|bye bye|goodbye|good bye|see you|see you later|see ya)[.! ]*$/.test(
      value
    )
  ) {
    if (language === "hi") {
      return "अलविदा! 👋 झारखंड की अपनी यात्रा का आनंद लें। फिर कभी भी वापस आकर पूछें!";
    }

    if (language === "te") {
      return "బై బై! 👋 మీ ఝార్ఖండ్ ప్రయాణాన్ని ఆనందించండి. మళ్లీ ఎప్పుడైనా వచ్చి నన్ను అడగండి!";
    }

    if (language === "bn") {
      return "বিদায়! 👋 আপনার ঝাড়খণ্ড ভ্রমণ আনন্দময় হোক। আবার আসবেন!";
    }

    if (language === "or") {
      return "ବିଦାୟ! 👋 ଆପଣଙ୍କ ଝାଡ଼ଖଣ୍ଡ ଯାତ୍ରା ଆନନ୍ଦମୟ ହେଉ। ପୁଣି ଆସନ୍ତୁ!";
    }

    if (language === "ur") {
      return "خدا حافظ! 👋 آپ کا جھارکھنڈ کا سفر خوشگوار ہو۔ دوبارہ تشریف لائیں!";
    }

    return "Goodbye! 👋 Have a wonderful trip to Jharkhand. Come back anytime if you need help!";
  }

  // -------------------------
  // THANKS
  // -------------------------

  if (
    /^(thanks|thank you|thankyou|thx|thank u)[.! ]*$/.test(value)
  ) {
    if (language === "hi") {
      return "आपका स्वागत है! 😊 झारखंड पर्यटन के बारे में और कुछ जानना हो तो पूछ सकते हैं।";
    }

    if (language === "te") {
      return "మీకు స్వాగతం! 😊 ఝార్ఖండ్ పర్యటన గురించి ఇంకా ఏదైనా తెలుసుకోవాలంటే అడగండి.";
    }

    if (language === "bn") {
      return "আপনাকে স্বাগতম! 😊 ঝাড়খণ্ড পর্যটন সম্পর্কে আরও কিছু জানতে চাইলে জিজ্ঞাসা করুন।";
    }

    if (language === "or") {
      return "ଆପଣଙ୍କୁ ସ୍ୱାଗତ! 😊 ଝାଡ଼ଖଣ୍ଡ ପର୍ଯ୍ୟଟନ ବିଷୟରେ ଆଉ କିଛି ଜାଣିବାକୁ ଚାହିଁଲେ ପଚାରନ୍ତୁ।";
    }

    return "You're welcome! 😊 I'm happy to help you explore Jharkhand.";
  }

  // -------------------------
  // HOW ARE YOU
  // -------------------------

  if (/^(how are you|how r u|how are u)[.! ?]*$/.test(value)) {
    if (language === "te") {
      return "నేను బాగున్నాను! 😊 ఝార్ఖండ్‌ను explore చేయడంలో మీకు help చేయడానికి readyగా ఉన్నాను.";
    }

    if (language === "hi") {
      return "मैं बहुत अच्छा हूँ! 😊 झारखंड घूमने और जानने में आपकी मदद करने के लिए तैयार हूँ।";
    }

    return "I'm doing great! 😊 I'm ready to help you explore Jharkhand.";
  }

  // -------------------------
  // GREETING
  // -------------------------

  if (
    /^(hi|hello|hey|hii|hiii|namaste|namaskar)[.! ]*$/.test(value)
  ) {
    if (language === "te") {
      return "హాయ్! 👋 నేను Jharkhand Tourism AI Assistant. ఝార్ఖండ్‌లో tourist places, waterfalls, food, culture లేదా trip plans గురించి అడగండి!";
    }

    if (language === "hi") {
      return "नमस्ते! 👋 मैं Jharkhand Tourism AI Assistant हूँ। आप झारखंड के tourist places, waterfalls, food, culture या trip plans के बारे में पूछ सकते हैं!";
    }

    if (language === "bn") {
      return "নমস্কার! 👋 আমি Jharkhand Tourism AI Assistant। ঝাড়খণ্ডের tourist places, waterfalls, food, culture বা trip plans সম্পর্কে জিজ্ঞাসা করতে পারেন!";
    }

    if (language === "or") {
      return "ନମସ୍କାର! 👋 ମୁଁ Jharkhand Tourism AI Assistant। ଝାଡ଼ଖଣ୍ଡର tourist places, waterfalls, food, culture କିମ୍ବା trip plans ବିଷୟରେ ପଚାରନ୍ତୁ!";
    }

    return "Hello! 👋 I'm the Jharkhand Tourism AI Assistant. Ask me about tourist places, waterfalls, food, culture, wildlife, or trip plans in Jharkhand!";
  }

  return null;
}

// =====================================================
// LOCAL FALLBACK
// =====================================================

function generateIntelligentFallback(message, language, history = []) {
  const text = message.trim();
  const lower = text.toLowerCase();

  const previousUserMessage =
    [...history]
      .reverse()
      .find((item) => item.role === "user")
      ?.content ||
    [...history]
      .reverse()
      .find((item) => item.role === "user")
      ?.message ||
    "";

  const contextText =
    `${previousUserMessage} ${text}`.toLowerCase();

  // ===================================================
  // GENERAL CONVERSATION
  // ===================================================

  const generalResponse = getGeneralConversationResponse(
    text,
    language
  );

  if (generalResponse) {
    return generalResponse;
  }

  // ===================================================
  // DISTANCE FOLLOW-UP
  // ===================================================

  if (
    contextText.includes("how far") ||
    contextText.includes("distance") ||
    contextText.includes("how many km") ||
    contextText.includes("entha distance") ||
    contextText.includes("entha dooram") ||
    contextText.includes("kitna door")
  ) {
    if (language === "te") {
      return "ఆ ప్రదేశం గురించి సమాచారం ఇవ్వగలను, కానీ ఈ distance కోసం నా project dataలో ఖచ్చితమైన figure లేదు. మీరు place name చెబితే available tourism information చెప్పగలను.";
    }

    if (language === "hi") {
      return "मैं उस स्थान के बारे में जानकारी दे सकता हूँ, लेकिन उस दूरी का सटीक figure मेरे project data में उपलब्ध नहीं है। आप स्थान का नाम बताएं, मैं उपलब्ध जानकारी साझा कर सकता हूँ।";
    }

    return "I can help with information about that place, but I do not have a verified figure for the exact distance. If you tell me the place name, I can share the available tourism information.";
  }

  // ===================================================
  // DASSAM FALLS
  // ===================================================

  if (
    lower.includes("dassam") ||
    lower.includes("दशम") ||
    lower.includes("దస్సం")
  ) {
    if (language === "te") {
      return "Dassam Falls ఝార్ఖండ్‌లోని ప్రసిద్ధ జలపాతాల్లో ఒకటి. ఇది సహజమైన అందమైన waterfall మరియు nature lovers కు ఆకర్షణీయమైన ప్రదేశం. చుట్టూ ఉన్న పచ్చని ప్రకృతి scenery ఈ ప్రాంతానికి ప్రత్యేక ఆకర్షణ.";
    }

    if (language === "hi") {
      return "दशम जलप्रपात झारखंड के प्रसिद्ध झरनों में से एक है। यह प्राकृतिक सुंदरता और आसपास के हरे-भरे वातावरण के लिए जाना जाता है। प्रकृति प्रेमियों के लिए यह एक आकर्षक स्थान है।";
    }

    return "Dassam Falls is one of the well-known waterfalls in Jharkhand. It is known for its natural beauty and green surroundings, making it an attractive destination for nature lovers.";
  }

  // ===================================================
  // HUNDRU FALLS
  // ===================================================

  if (
    lower.includes("hundru") ||
    lower.includes("hundroo") ||
    lower.includes("हुंडरू") ||
    lower.includes("హుండ్రు")
  ) {
    if (language === "te") {
      return "Hundru Falls ఝార్ఖండ్‌లోని ప్రసిద్ధ waterfallsలో ఒకటి. ఇది సహజమైన అందం, నీటి ప్రవాహం మరియు చుట్టూ ఉన్న పచ్చని ప్రకృతి కారణంగా tourist attractionగా ఉంది. Nature lovers మరియు photography ఇష్టపడేవారికి ఇది మంచి ప్రదేశం.";
    }

    if (language === "hi") {
      return "हुंडरू जलप्रपात झारखंड के प्रसिद्ध waterfalls में से एक है। यह अपने प्राकृतिक सौंदर्य, जलधारा और हरे-भरे आसपास के वातावरण के लिए जाना जाता है। प्रकृति और photography पसंद करने वालों के लिए यह आकर्षक स्थान है।";
    }

    return "Hundru Falls is one of the well-known waterfalls in Jharkhand. It is known for its natural beauty, flowing water and green surroundings. It is an attractive place for nature lovers and photography enthusiasts.";
  }

  // ===================================================
  // WATERFALLS
  // ===================================================

  if (
    lower.includes("waterfall") ||
    lower.includes("waterfalls") ||
    lower.includes("falls") ||
    lower.includes("జలపాతం") ||
    lower.includes("झरना")
  ) {
    if (language === "te") {
      return "Jharkhandలో చూడదగిన ప్రసిద్ధ waterfallsలో Hundru Falls మరియు Dassam Falls ఉన్నాయి. ఇవి natural scenery మరియు greenery కోసం ప్రసిద్ధి చెందాయి. Waterfalls గురించి మీరు specific place అడిగితే దాని గురించి మరింత చెప్పగలను.";
    }

    if (language === "hi") {
      return "झारखंड में कई सुंदर waterfalls हैं, जिनमें हुंडरू फॉल्स और दशम फॉल्स प्रमुख हैं। ये प्राकृतिक सुंदरता और हरियाली के लिए जाने जाते हैं। आप किसी specific waterfall के बारे में पूछ सकते हैं।";
    }

    return "Jharkhand has several beautiful waterfalls, including Hundru Falls and Dassam Falls. They are known for natural scenery and greenery. Ask me about a specific waterfall if you want more details.";
  }

  // ===================================================
  // FOOD
  // ===================================================

  if (
    lower.includes("food") ||
    lower.includes("eat") ||
    lower.includes("dish") ||
    lower.includes("cuisine") ||
    lower.includes("khana") ||
    lower.includes("food should i try")
  ) {
    if (language === "te") {
      return `Jharkhandలో try చేయగల food

- Dhuska – ప్రసిద్ధ స్థానిక dish.
- Rugra – Jharkhandలో traditional foodగా ప్రసిద్ధి.
- Thekua – traditional sweet లేదా snack.
- Pitha – స్థానికంగా popular traditional preparation.

Jharkhandలో local food ప్రాంతాన్ని బట్టి మారవచ్చు. మీకు vegetarian food లేదా street food కావాలంటే దానికి అనుగుణంగా suggestions ఇవ్వగలను.`;
    }

    if (language === "hi") {
      return `झारखंड में आज़माने लायक food

- धुस्का – झारखंड का प्रसिद्ध स्थानीय व्यंजन।
- रुगड़ा – पारंपरिक स्थानीय food।
- ठेकुआ – पारंपरिक snack या sweet।
- पीठा – लोकप्रिय पारंपरिक preparation।

स्थानीय भोजन क्षेत्र के अनुसार अलग हो सकता है। आप vegetarian food या street food के बारे में भी पूछ सकते हैं।`;
    }

    return `Food to try in Jharkhand

- Dhuska – A popular traditional local dish.
- Rugra – A traditional food associated with Jharkhand.
- Thekua – A traditional sweet or snack.
- Pitha – A popular traditional preparation.

Local food can vary by region. You can also ask me specifically about vegetarian food, tribal cuisine, or street food.`;
  }

  // ===================================================
  // BEST PLACES
  // ===================================================

  if (
    lower.includes("best tourist places") ||
    lower.includes("tourist places") ||
    lower.includes("places to visit") ||
    lower.includes("best places") ||
    lower.includes("tourist destination")
  ) {
    if (language === "te") {
      return `Jharkhandలో చూడదగిన ప్రదేశాలు

- Betla – Wildlife and Eco Tourism
- Netarhat – Nature and Hill Destination
- Dalma – Nature and Wildlife
- Hundru Falls – Waterfall
- Dassam Falls – Waterfall

మీ trip duration మరియు interests చెబితే వాటికి సరిపోయే itinerary suggestion ఇవ్వగలను.`;
    }

    if (language === "hi") {
      return `झारखंड में घूमने लायक प्रमुख स्थान

- Betla – Wildlife और Eco Tourism
- Netarhat – Nature और Hill Destination
- Dalma – Nature और Wildlife
- Hundru Falls – Waterfall
- Dassam Falls – Waterfall

आप अपनी trip duration और interests बताएं, मैं उसी के अनुसार itinerary suggestion दे सकता हूँ।`;
    }

    return `Popular tourist places in Jharkhand

- Betla – Wildlife and Eco Tourism
- Netarhat – Nature and Hill Destination
- Dalma – Nature and Wildlife
- Hundru Falls – Waterfall
- Dassam Falls – Waterfall

If you tell me your trip duration and interests, I can suggest a suitable itinerary.`;
  }

  // ===================================================
  // ITINERARY
  // ===================================================

  if (
    lower.includes("itinerary") ||
    lower.includes("3 day") ||
    lower.includes("3-day") ||
    lower.includes("trip plan") ||
    lower.includes("travel plan") ||
    lower.includes("tour plan")
  ) {
    if (language === "te") {
      return `Sample 3-day Jharkhand trip

Day 1: Ranchi area and Hundru Falls
Day 2: Dassam Falls and nearby nature attractions
Day 3: Netarhat or Betla based on your interests

ఇది ఒక sample suggestion మాత్రమే. Exact travel time మరియు route కోసం local map or navigation information check చేయడం మంచిది.`;
    }

    if (language === "hi") {
      return `Sample 3-day Jharkhand trip

Day 1: Ranchi area and Hundru Falls
Day 2: Dassam Falls and nearby nature attractions
Day 3: Netarhat or Betla आपकी रुचि के अनुसार

यह एक sample suggestion है। Exact travel time और route के लिए local map or navigation information check करना बेहतर है।`;
    }

    return `Sample 3-day Jharkhand trip

Day 1: Ranchi area and Hundru Falls
Day 2: Dassam Falls and nearby nature attractions
Day 3: Netarhat or Betla based on your interests

This is a sample suggestion. For exact travel times and routes, check current local map or navigation information.`;
  }

  // ===================================================
  // CULTURE
  // ===================================================

  if (
    lower.includes("tribal") ||
    lower.includes("culture") ||
    lower.includes("cultural") ||
    lower.includes("tribe") ||
    lower.includes("tribal experience")
  ) {
    if (language === "te") {
      return "Jharkhand తన tribal culture, traditional communities, handicrafts, festivals, music and local food కోసం ప్రసిద్ధి చెందింది. Cultural tourismలో local traditions మరియు handicrafts అనుభవించవచ్చు.";
    }

    if (language === "hi") {
      return "झारखंड अपनी tribal culture, traditional communities, handicrafts, festivals, music और local food के लिए जाना जाता है। Cultural tourism में स्थानीय परंपराओं और handicrafts को जानने का अवसर मिलता है।";
    }

    return "Jharkhand is known for its tribal culture, traditional communities, handicrafts, festivals, music and local food. Cultural tourism provides opportunities to learn about local traditions and handicrafts.";
  }

  // ===================================================
  // BEST TIME
  // ===================================================

  if (
    lower.includes("best time") ||
    lower.includes("best season") ||
    lower.includes("when should i visit") ||
    lower.includes("when to visit")
  ) {
    if (language === "te") {
      return "Jharkhand సందర్శించడానికి season మీ activitiesపై ఆధారపడి ఉంటుంది. Nature మరియు outdoor tourism కోసం comfortable weather ఉన్న కాలాన్ని ఎంచుకోవడం సాధారణంగా ఉపయోగకరం. మీరు ఏ monthలో వెళ్లాలనుకుంటున్నారో చెబితే trip planningలో help చేస్తాను.";
    }

    if (language === "hi") {
      return "झारखंड जाने का सबसे उपयुक्त समय आपकी activities पर निर्भर करता है। Nature और outdoor tourism के लिए comfortable weather वाला समय चुनना उपयोगी होता है। आप जिस month में जाना चाहते हैं वह बताएं, मैं trip planning में मदद कर सकता हूँ।";
    }

    return "The suitable time to visit Jharkhand depends on your activities and preferences. For nature and outdoor tourism, many travelers prefer periods with comfortable weather. Tell me your planned month and I can help with trip planning.";
  }

  // ===================================================
  // BETLA
  // ===================================================

  if (lower.includes("betla")) {
    if (language === "te") {
      return "Betla Jharkhandలో ముఖ్యమైన wildlife మరియు eco-tourism destinationsలో ఒకటి. ఇది natural surroundings మరియు wildlife experience కోసం ప్రసిద్ధి చెందింది.";
    }

    if (language === "hi") {
      return "Betla झारखंड के प्रमुख wildlife और eco-tourism destinations में से एक है। यह प्राकृतिक वातावरण और wildlife experience के लिए जाना जाता है।";
    }

    return "Betla is one of the important wildlife and eco-tourism destinations in Jharkhand. It is known for its natural surroundings and wildlife experience.";
  }

  // ===================================================
  // NETARHAT
  // ===================================================

  if (lower.includes("netarhat")) {
    if (language === "te") {
      return "Netarhat Jharkhandలో ప్రసిద్ధ nature మరియు hill destination. ఇది ప్రశాంతమైన వాతావరణం మరియు scenic surroundings కోసం ప్రసిద్ధి చెందింది.";
    }

    if (language === "hi") {
      return "Netarhat झारखंड का एक प्रसिद्ध nature और hill destination है। यह शांत वातावरण और scenic surroundings के लिए जाना जाता है।";
    }

    return "Netarhat is a well-known nature and hill destination in Jharkhand. It is known for its peaceful atmosphere and scenic surroundings.";
  }

  // ===================================================
  // DALMA
  // ===================================================

  if (lower.includes("dalma")) {
    if (language === "te") {
      return "Dalma Jharkhandలో ముఖ్యమైన nature మరియు wildlife destinationsలో ఒకటి. ఇది forested landscape మరియు wildlife-related tourism కోసం ప్రసిద్ధి చెందింది.";
    }

    if (language === "hi") {
      return "Dalma झारखंड के प्रमुख nature और wildlife destinations में से एक है। यह forested landscape और wildlife-related tourism के लिए जाना जाता है।";
    }

    return "Dalma is an important nature and wildlife destination in Jharkhand. It is known for its forested landscape and wildlife-related tourism.";
  }

  // ===================================================
  // RANCHI
  // ===================================================

  if (
    lower.includes("ranchi") ||
    lower.includes("रांची") ||
    lower.includes("రాంచీ")
  ) {
    if (language === "te") {
      return "Ranchi Jharkhand రాజధాని మరియు tourism కోసం ముఖ్యమైన starting point. ఇక్కడి నుంచి waterfalls, nature attractions మరియు ఇతర destinationsను explore చేయవచ్చు.";
    }

    if (language === "hi") {
      return "रांची झारखंड की राजधानी और tourism के लिए एक महत्वपूर्ण starting point है। यहां से waterfalls, nature attractions और अन्य destinations को explore किया जा सकता है।";
    }

    return "Ranchi is the capital of Jharkhand and an important starting point for tourism. From Ranchi, visitors can explore waterfalls, nature attractions and other destinations.";
  }

  // ===================================================
  // TEMPLE / DEOGHAR
  // ===================================================

  if (
    lower.includes("deoghar") ||
    lower.includes("temple") ||
    lower.includes("baidyanath")
  ) {
    if (language === "te") {
      return "Deoghar Jharkhandలో ముఖ్యమైన spiritual tourism destination. ఇది Baidyanath templeకు ప్రసిద్ధి చెందింది.";
    }

    if (language === "hi") {
      return "Deoghar झारखंड का एक महत्वपूर्ण spiritual tourism destination है। यह Baidyanath Temple के लिए प्रसिद्ध है।";
    }

    return "Deoghar is an important spiritual tourism destination in Jharkhand. It is well known for Baidyanath Temple.";
  }

  // ===================================================
  // WILDLIFE
  // ===================================================

  if (
    lower.includes("wildlife") ||
    lower.includes("animals") ||
    lower.includes("forest")
  ) {
    if (language === "te") {
      return "Jharkhandలో wildlife మరియు forest tourism కోసం Betla మరియు Dalma వంటి destinations ఉన్నాయి. Nature మరియు wildlife interests ఉంటే వీటిని tripలో include చేయవచ్చు.";
    }

    if (language === "hi") {
      return "झारखंड में wildlife और forest tourism के लिए Betla और Dalma जैसे destinations हैं। अगर आपकी रुचि nature और wildlife में है, तो इन्हें trip में शामिल किया जा सकता है।";
    }

    return "Jharkhand has destinations such as Betla and Dalma for wildlife and forest tourism. If you are interested in nature and wildlife, these can be considered for a trip.";
  }

  // ===================================================
  // GENERIC FALLBACK
  // ===================================================

  if (language === "te") {
    return "నేను Jharkhand tourism గురించి help చేయగలను. Tourist places, waterfalls, food, tribal culture, wildlife, trip plans లేదా ఏదైనా specific destination గురించి అడగండి!";
  }

  if (language === "hi") {
    return "मैं Jharkhand tourism के बारे में मदद कर सकता हूँ। Tourist places, waterfalls, food, tribal culture, wildlife, trip plans या किसी specific destination के बारे में पूछें!";
  }

  if (language === "bn") {
    return "আমি Jharkhand tourism সম্পর্কে সাহায্য করতে পারি। Tourist places, waterfalls, food, tribal culture, wildlife বা trip plans সম্পর্কে জিজ্ঞাসা করুন!";
  }

  if (language === "or") {
    return "ମୁଁ Jharkhand tourism ବିଷୟରେ ସାହାଯ୍ୟ କରିପାରିବି। Tourist places, waterfalls, food, tribal culture, wildlife କିମ୍ବା trip plans ବିଷୟରେ ପଚାରନ୍ତୁ!";
  }

  if (language === "ur") {
    return "میں Jharkhand tourism کے بارے میں مدد کر سکتا ہوں۔ Tourist places، waterfalls، food، culture، wildlife یا trip plans کے بارے میں پوچھیں!";
  }

  return "I can help you explore Jharkhand! Ask me about tourist places, waterfalls, food, culture, wildlife, destinations, or trip plans.";
}

// =====================================================
// CHECK IF LOCAL FALLBACK IS BETTER
// =====================================================

function needsGroundedFallback(message, language) {
  const lower = message.toLowerCase();

  if (getGeneralConversationResponse(message, language)) {
    return true;
  }

  const groundedTopics = [
    "waterfall",
    "waterfalls",
    "dassam",
    "hundru",
    "betla",
    "netarhat",
    "dalma",
    "ranchi",
    "deoghar",
    "baidyanath",
    "wildlife",
    "food",
    "cuisine",
    "culture",
    "tribal",
    "best time",
    "best season",
    "itinerary",
    "trip plan",
    "travel plan",
    "tourist places",
  ];

  return groundedTopics.some((topic) => lower.includes(topic));
}

// =====================================================
// SEND MESSAGE
// =====================================================

const sendMessage = async (req, res) => {
  try {
    const {
      message,
      history = [],
      language: requestedLanguage = "auto",
    } = req.body || {};

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    const text = message.trim();

    if (!text) {
      return res.status(400).json({
        success: false,
        error: "Message cannot be empty",
      });
    }

    // -----------------------------------------------
    // RATE LIMIT
    // -----------------------------------------------

    const ip =
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress ||
      "unknown";

    if (!checkRateLimit(ip)) {
      return res.status(429).json({
        success: false,
        error: "Too many requests. Please try again later.",
      });
    }

    // -----------------------------------------------
    // LANGUAGE
    // -----------------------------------------------

    const detectedLanguage = detectLanguage(text);

    const language =
      requestedLanguage &&
      requestedLanguage !== "auto" &&
      LANGUAGE_NAMES[requestedLanguage]
        ? requestedLanguage
        : detectedLanguage;

    console.log(
      `🌐 Language: ${language} | Message: ${text}`
    );

    // -----------------------------------------------
    // CACHE
    // -----------------------------------------------

    const cacheKey = getCacheKey(text, language);

    const cachedResponse = getCachedResponse(cacheKey);

    if (cachedResponse) {
      console.log("⚡ Returning cached response");

      return res.json({
        success: true,
        response: cachedResponse,
        message: cachedResponse,
        language,
        source: "cache",
      });
    }

    // -----------------------------------------------
    // NORMALIZE HISTORY
    // -----------------------------------------------

    const cleanHistory = Array.isArray(history)
      ? history
          .slice(-MAX_HISTORY)
          .map((item) => ({
            role:
              item?.role === "assistant"
                ? "assistant"
                : "user",
            content:
              item?.content ||
              item?.message ||
              "",
          }))
          .filter((item) => item.content)
      : [];

    // -----------------------------------------------
    // GROQ
    // -----------------------------------------------

    let response = null;
    let source = "groq";

    try {
      response = await callGroqAPI(
        text,
        language,
        cleanHistory
      );

      // Final safety cleaning
      response = cleanResponse(response);
    } catch (groqError) {
      console.error(
        "❌ Groq API failed:",
        groqError.message
      );

      console.log("🔄 Using local fallback...");

      response = generateIntelligentFallback(
        text,
        language,
        cleanHistory
      );

      source = "local-fallback";
    }

    // -----------------------------------------------
    // GROUNDED FALLBACK
    // -----------------------------------------------

    if (!response) {
      response = generateIntelligentFallback(
        text,
        language,
        cleanHistory
      );

      source = "local-fallback";
    }

    // -----------------------------------------------
    // FINAL RESPONSE CLEANING
    // -----------------------------------------------

    response = cleanResponse(response);

    // -----------------------------------------------
    // CACHE RESPONSE
    // -----------------------------------------------

    if (response) {
      setCachedResponse(cacheKey, response);
    }

    // -----------------------------------------------
    // RESPONSE
    // -----------------------------------------------

    return res.status(200).json({
      success: true,
      response,
      message: response,
      language,
      source,
      model: source === "groq" ? MODEL : "local-fallback",
    });
  } catch (error) {
    console.error(
      "❌ Chatbot controller error:",
      error
    );

    const language = detectLanguage(
      req.body?.message || ""
    );

    const fallback = cleanResponse(
      generateIntelligentFallback(
        req.body?.message || "",
        language,
        req.body?.history || []
      )
    );

    return res.status(200).json({
      success: true,
      response: fallback,
      message: fallback,
      language,
      source: "emergency-fallback",
    });
  }
};

// =====================================================
// HEALTH CHECK
// =====================================================

const healthCheck = async (req, res) => {
  try {
    const groq = getGroqClient();

    return res.status(200).json({
      success: true,
      chatbot: "healthy",
      groqConfigured: !!groq,
      model: MODEL,
      multilingual: true,
      supportedLanguages: Object.keys(
        LANGUAGE_NAMES
      ),
      knowledgeBase: !!knowledge,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      chatbot: "degraded",
      groqConfigured: false,
      model: MODEL,
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  sendMessage,
  healthCheck,
  detectLanguage,
};