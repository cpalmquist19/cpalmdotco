/**
 * Pre-flight screening for chat messages. Pure functions with no server or browser
 * dependencies, so the same rules run in the chat UI (instant feedback, no request
 * at all) and in /api/chat (the authoritative check, since a client can be bypassed).
 * A blocked message never reaches the model API.
 *
 * Everything here is a heuristic: it is tuned to avoid blocking honest questions
 * about a portfolio, and it will not catch everything. `scripts/check-chat-guard.mjs`
 * holds the cases it is tested against.
 */

export const MAX_USER_CHARS = 500;
export const MAX_ASSISTANT_CHARS = 4000;

export type GuardReason =
  | "empty"
  | "too-long"
  | "gibberish"
  | "spam"
  | "abuse"
  | "illegal"
  | "injection"
  | "off-topic"
  | "self-harm";

export type GuardResult = { ok: true } | { ok: false; reason: GuardReason; message: string };

/** How much a blocked message counts toward a temporary lockout (see chat-limits.ts). 0 = never counts. */
export const STRIKE_WEIGHT: Record<GuardReason, number> = {
  empty: 0,
  "too-long": 0,
  "self-harm": 0,
  gibberish: 1,
  "off-topic": 1,
  spam: 1,
  abuse: 2,
  illegal: 2,
  injection: 2,
};

const MESSAGES: Record<GuardReason, string> = {
  empty: "Type a question about Caleb's work and I'll answer it.",
  "too-long": `Please keep your question under ${MAX_USER_CHARS} characters.`,
  gibberish:
    "I couldn't make sense of that. Try asking in plain words, like “What has Caleb built?”",
  spam: "That looks like spam, so I can't help with it. Ask me about Caleb's work instead.",
  abuse: "Let's keep this respectful. I'm happy to answer questions about Caleb's work.",
  illegal: "I can't help with that. I can answer questions about Caleb's experience and projects.",
  injection:
    "I can only answer questions about Caleb's work, and I can't change or share my instructions.",
  "off-topic": "I only answer questions about Caleb and his work.",
  "self-harm":
    "I'm sorry you're going through this, but I'm not the right place for it. If you're in danger or thinking about harming yourself, please contact your local emergency number or a crisis line (in the US, call or text 988).",
};

const LINK_MESSAGE =
  "I can't open links or pass along contact details. Ask your question in words and I'll answer it.";

function block(reason: GuardReason, message = MESSAGES[reason]): GuardResult {
  return { ok: false, reason, message };
}

// ---------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------

// Zero-width, bidi-control, and soft-hyphen characters, used to hide words from filters
const INVISIBLE = new RegExp("[\u200B-\u200F\u2028-\u202E\u2060-\u2064\uFEFF\u00AD]", "g");

/** Lower-case, strip accents, and straighten curly apostrophes. */
function fold(text: string) {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[‘’´`]/g, "'")
    .toLowerCase();
}

/** Tidy raw input: compatibility-fold, drop zero-width and control characters, collapse whitespace. */
function clean(raw: string) {
  return raw
    .normalize("NFKC")
    .replace(INVISIBLE, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Lower-cased, accent-free text with common letter swaps undone (f*ck, sh1t, @ss) and
 * stretched letters squeezed (fuuuuck), so word lists are harder to dodge.
 * Returns the plain form too: some patterns (URLs, numbers) need the original characters.
 */
function canonical(text: string) {
  const plain = fold(text);
  const leet = plain
    // a symbol or digit only counts as a swapped letter when it touches a letter: "sh1t", "@ss"
    .replace(/(?<=[a-z])[@$0134578!|*+](?=[a-z])|(?<![a-z0-9])[@$](?=[a-z])/g, (c) => LEET[c] ?? c)
    .replace(/([a-z])\1{2,}/g, "$1");
  // "f u c k", "f.u.c.k": join runs of three or more single letters
  const joined = leet.replace(/\b(?:[a-z][\s.\-_*]+){2,}[a-z]\b/g, (m) => m.replace(/[\s.\-_*]+/g, ""));
  return { plain, leet, joined };
}

const LEET: Record<string, string> = {
  "@": "a",
  $: "s",
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "8": "b",
  "!": "i",
  "|": "l",
  "*": "u",
  "+": "t",
};

// ---------------------------------------------------------------------------
// Rule tables
// ---------------------------------------------------------------------------

// Strong profanity, slurs, and directed insults. Mild words (damn, crap, hell) are deliberately allowed.
const ABUSE: RegExp[] = [
  /fuck/,
  /\w*shit\w*/,
  /\b(?:bitch|bitches|bastards?|cunts?|twats?|wankers?|sluts?|whores?|pussy|dickheads?|assholes?|asshats?|dumbass|jackass)\b/,
  /\bcocksuck/,
  /\b(?:nigg(?:er|a)s?|faggots?|fags?|kikes?|wetbacks?|gooks?|trann(?:y|ies)|retard(?:ed|s)?)\b/,
  // porn and explicit sexual content
  /\b(?:porn\w*|nsfw|nudes?|hentai|erotic\w*|xxx|blowjobs?|handjobs?|masturbat\w*|sexting|sext|horny|dirty talk|sex (?:with|chat|tape|scene)|have sex)\b/,
  // directed insults: "you are stupid", "ur such an idiot"
  /\b(?:you|u|ur|youre|you're)\s+(?:(?:are|r|so|such|a|an|really|totally|just|actually)\s+)*(?:stupid|dumb|idiot|idiotic|moron|moronic|useless|worthless|pathetic|loser|scum|imbecile|trash)\b/,
  /\bpiece of (?:shit|crap|garbage|trash)\b/,
  /\b(?:you|u|this (?:bot|site|chat|thing)|caleb|he)\s+(?:really\s+)?suck(?:s)?\b/,
  // dismissals and wishes of harm
  /\b(?:shut\s?(?:up|it)|screw (?:you|off)|go to hell|go away and die|drop dead|die in a fire|kys|kill yourself|hope you die)\b/,
  // threats and doxxing
  /\b(?:kill|murder|shoot|stab|rape|strangle|torture|hurt|beat up)\s+(?:you|u|ur|caleb|him|your family|everyone|them)\b/,
  /\b(?:i|we)\s*(?:'?ll|will|am going to|'m going to|'m gonna|gonna|going to)\s+(?:find|hunt|come for|get|ruin|destroy|dox+|swat)\s+(?:you|u|caleb|him|your)\b/,
  /\bknow where (?:you|caleb|he) (?:live|lives|work|works)\b/,
  /\b(?:bomb threat|shoot up|dox+(?:ing|ed)?)\b/,
  /\bblow up (?:the|your|caleb'?s?|his) (?:school|office|building|house|place)\b/,
];

// "<make/get/how> ... <harmful thing>". The verb has to come first so "what's a bomb calorimeter" or "I cracked the bug" pass.
const ILLEGAL: RegExp[] = [
  /\b(?:make|making|build|building|create|creating|construct|assemble|manufacture|produce|synthesi[sz]e|cook|cooking|brew|3d.?print|print)\b[^.?!\n]{0,40}\b(?:bombs?|explosives?|pipe.?bombs?|molotov\w*|grenades?|napalm|thermite|nerve agent|sarin|ricin|anthrax|bioweapons?|chemical weapons?|silencers?|ghost guns?|machine guns?|auto sear|untraceable (?:gun|firearm)s?|meth|methamphetamine|fentanyl|cocaine|heroin|lsd|mdma)\b/,
  /\b(?:write|writing|create|build|code|develop|generate|make|give me|show me|how (?:do i|to|can i))\b[^.?!\n]{0,40}\b(?:ransomware|malware|keyloggers?|keylogging|botnets?|rootkits?|trojans?|computer virus|spyware|stalkerware|infostealers?|credential stealers?|phishing (?:page|site|kit|email|campaign)s?|ddos|zero.?day exploits?|reverse shell|backdoor)\b/,
  /\b(?:hack(?:ing)?|break(?:ing)? into|steal(?:ing)?|crack(?:ing)?|brute.?forc(?:e|ing))\b[^.?!\n]{0,25}\b(?:into|someone|somebody|passwords?|accounts?|wi-?fi|credentials|instagram|facebook|gmail|phones?)\b/,
  /\b(?:fake|forge|forged|forging|counterfeit|stolen)\s+(?:ids?|passports?|licen[sc]es?|driver'?s licen[sc]es?|diplomas?|degrees?|money|cash|bills|credit cards?|documents?|checks|cheques|invoices|prescriptions?)\b/,
  /\b(?:how (?:do i|can i|to)|help me|teach me|show me how to|tell me how to|i want to|i need to|ways to)\b[^.?!\n]{0,40}\b(?:launder (?:money|cash)|evade taxes|tax evasion|commit (?:fraud|murder|arson|a crime)|shoplift|steal (?:a|from|money|credit|someone|identity|cars?)|hotwire|smuggle|traffic (?:drugs|people|humans)|stalk|poison (?:someone|my)|kill (?:someone|a person|my)|get away with|dispose of a body|buy (?:drugs|guns?|a gun|stolen)|sell (?:drugs|stolen))\b/,
  /\b(?:hire|find|pay) (?:a )?(?:hit ?man|assassin)\b/,
  // sexual content involving minors, in either word order
  /\b(?:child|children|kids?|minors?|underage|teens?|preteens?|loli\w*)\b[^.?!\n]{0,30}\b(?:porn\w*|nudes?|naked|sex|sexual|erotic\w*)\b/,
  /\b(?:porn\w*|nudes?|naked|sex|sexual|erotic\w*)\b[^.?!\n]{0,30}\b(?:child|children|kids?|minors?|underage|teens?|preteens?|loli\w*)\b/,
];

const SELF_HARM: RegExp[] = [
  /\b(?:how (?:do i|can i|to)|ways to|best way to|i want to|i'?m going to|i am going to)\b[^.?!\n]{0,20}\b(?:kill myself|commit suicide|end my life|end it all|hurt myself|harm myself|cut myself)\b/,
  /\b(?:suicide methods?|painless (?:way to die|suicide)|i (?:want|wanna) to die)\b/,
];

// Attempts to override, extract, or impersonate the system prompt
const INJECTION: RegExp[] = [
  /\b(?:ignore|disregard|forget|override|bypass|drop)\b[^.?!\n]{0,30}\b(?:previous|prior|above|earlier|all|your|system|these|the|any)\b[^.?!\n]{0,20}\b(?:instructions?|prompts?|rules?|guidelines?|directives?|constraints?|restrictions?|programming)\b/,
  /\b(?:reveal|show|print|display|repeat|output|leak|dump|copy|tell me|what(?:'s| is| are))\b[^.?!\n]{0,30}\b(?:system prompt|system message|system instructions?|initial prompt|hidden prompt|your instructions|your prompt|your rules|developer message)\b/,
  /\b(?:jailbreak|jailbroken|do anything now|(?:enable|activate|enter|switch to|you are in|go into) (?:developer|sudo|god|dan|unfiltered) mode|no restrictions|without (?:any )?(?:restrictions|filters|limits|censorship|rules))\b/,
  /\b(?:you are now (?:an? |in |dan\b)|from now on,? (?:you|ignore|act|respond|only|always)|pretend (?:to be|that you|you are|you're)|roleplay as|role-play as|act as if you (?:have|had|are|were))/,
  // chat-template and role markers pasted in to fake a system turn
  /<\|?(?:im_start|im_end|system|assistant|endoftext)\|?>|\[\/?inst\]|<<\s*sys\s*>>|<\/?system>/i,
  /(?:^|\n)\s*(?:system|assistant|developer)\s*:/i,
];

// The bot only answers questions about Caleb; asking it to write creative work or homework is free-LLM use
const OFF_TOPIC: RegExp[] = [
  /\b(?:write|compose|generate|draft|give)\s+(?:me\s+)?(?:an?|some|the|my)?\s*(?:\w+\s+){0,2}(?:poems?|essays?|stor(?:y|ies)|songs?|jokes?|limericks?|haikus?|raps?|homework|lyrics)\b/,
  /\b(?:do|solve|finish|complete)\s+my\s+(?:homework|assignment|exam|test|essay)\b/,
];

const SPAM_PHRASES: RegExp[] = [
  /\b(?:buy now|click here|limited time|act now|order now|sign up now|visit my|check out my (?:channel|page|profile|store|website|site|link)|follow me on|subscribe to my)\b/,
  /\bfree (?:money|gift|trial|bitcoin|crypto|followers|iphone|giveaway|cash)\b/,
  /\b(?:make|earn) (?:\$|usd|money|cash|passive income|extra income)/,
  /\bwork from home\b/,
  /\b(?:viagra|cialis|casino|betting|poker|slot machines?|online slots|forex|binary options)\b/,
  /\b(?:crypto|bitcoin|btc|nft)\s+(?:giveaway|airdrop|investment|trading|signals|doubl\w+|mining)\b/,
  /\bseo (?:services?|ranking|expert|packages?)|\b(?:backlinks?|guest posts?|rank (?:your|on) (?:site|website) )/,
  /\b(?:whatsapp|telegram|wechat|viber)\b/,
  /\b(?:congratulations|congrats)\b[^.?!\n]{0,30}\b(?:won|selected|chosen|winner)\b/,
  /\b(?:lottery|wire transfer|nigerian prince|inheritance fund|unclaimed funds)\b/,
  /\b100% (?:free|guaranteed|safe|legit)|\brisk.free\b|\bguaranteed (?:income|returns|results|profit)\b/,
  /\b(?:promo|coupon|discount) code\b/,
  /\bwe (?:offer|provide|specialize in|are a)\b[^.?!\n]{0,40}\b(?:services?|agency|company|solutions)\b/,
  /\b(?:web ?(?:site )?(?:design|development)|app development|digital marketing|lead generation) services?\b/,
];

const URL_PATTERN =
  /\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:com|org|xyz|ru|biz|info|click|link|shop|online|store|top)\b/i;
const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const PHONE_PATTERN = /(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;

// ---------------------------------------------------------------------------
// Gibberish / keyboard smashing
// ---------------------------------------------------------------------------

// Letter pairs that make up ~98% of English letter pairs, measured on the Next.js docs
// (technical English). Real words score high on these; random letters and key mashing score low.
const COMMON_BIGRAMS = new Set(
  (
    "ab ac ad af ag ai ak al am an ap ar as at au av ay ba be bi bl bo br bu by ca cc ce ch ci ck cl co " +
    "cr cs ct cu da dd de di dl do ds du dy ea eb ec ed ee ef eg eh ei el em en ep eq er es et ev ew " +
    "ex ey fa fe ff fi fl fo fr ft fu ga ge gh gi gl gm go gr gu ha he hi ho hr ht ia ib ic id ie if ig " +
    "ik il im in io ip ir is it iv iz je js ke ki kn ks la ld le li ll lo ls lt lu ly ma mb me mi mm mo " +
    "mp ms mu my na nc nd ne nf ng ni nk nl nn no ns nt nv ny oa ob oc od oe of og oi ok ol om on oo op " +
    "or os ot ou ov ow oy pa pe ph pi pl po pp pr ps pt pu qu ra rc rd re rg ri rk rl rm rn ro rr rs rt " +
    "ru rv ry sa sc se sh si sk sl sm sn so sp ss st su sy ta tc te th ti tl to tp tr ts tt tu tw ty ub " +
    "uc ud ue ug ui ul um un up ur us ut va ve vi wa we wh wi wn wo wr ws xa xp xt yn yo yp ys ze"
  ).split(" "),
);

// Words with unusual letters that are fine in this chat: names and tech terms the checks above would doubt
const KNOWN_TERMS = new Set([
  "caleb",
  "palmquist",
  "kubectl",
  "pytest",
  "pgsql",
  "nginx",
  "gcp",
  "graphql",
  "kubernetes",
  "pytorch",
  "distilbert",
  "onnx",
  "playwright",
  "fastapi",
  "nextjs",
  "typescript",
  "javascript",
]);

const KEYBOARD_ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
const ROW_RUNS = new Set<string>();
for (const row of KEYBOARD_ROWS) {
  for (const r of [row, [...row].reverse().join("")]) {
    for (let i = 0; i + 4 <= r.length; i++) ROW_RUNS.add(r.slice(i, i + 4));
  }
}

/** Share of a word's letters that sit inside runs of 4+ neighbouring keys ("asdf", "hjkl", "poiu"). */
function keyboardRunShare(word: string) {
  const covered = new Array<boolean>(word.length).fill(false);
  for (let i = 0; i + 4 <= word.length; i++) {
    if (ROW_RUNS.has(word.slice(i, i + 4))) for (let j = i; j < i + 4; j++) covered[j] = true;
  }
  return covered.filter(Boolean).length / word.length;
}

function bigramRatio(word: string) {
  let known = 0;
  for (let i = 0; i + 1 < word.length; i++) if (COMMON_BIGRAMS.has(word.slice(i, i + 2))) known++;
  return known / (word.length - 1);
}

function longestRun(word: string, test: (c: string) => boolean) {
  let best = 0;
  let run = 0;
  for (const c of word) {
    run = test(c) ? run + 1 : 0;
    if (run > best) best = run;
  }
  return best;
}

const isVowel = (c: string) => "aeiouy".includes(c);

/** True when a lower-case a-z word does not look like it could be a word, name, or tech term. */
function looksRandom(word: string) {
  if (word.length < 4 || KNOWN_TERMS.has(word)) return false;
  if (keyboardRunShare(word) >= 0.7) return true;
  if (word.length < 5) return false;

  const vowels = [...word].filter(isVowel).length;
  if (vowels === 0) return true;
  if (word.length >= 6 && (vowels / word.length < 0.15 || vowels / word.length > 0.8)) return true;
  if (longestRun(word, (c) => !isVowel(c)) >= 7) return true;
  return bigramRatio(word) < 0.6;
}

function isGibberish(text: string, plain: string) {
  const letters = text.match(/\p{L}/gu) ?? [];
  if (letters.length === 0) return false; // handled as "empty" before this point

  // Mostly non-Latin writing (or emoji spam) can't be judged with English letter statistics
  const latin = letters.filter((c) => /[a-z]/i.test(c.normalize("NFD")[0])).length;
  const compact = text.replace(/\s/g, "");

  // Symbol and digit spam: "!!!???", "1234 5678 !!"
  if (compact.length >= 8 && letters.length / compact.length < 0.4) return true;
  // A single character repeated ("aaaaaaa", "??????????")
  if (/(.)\1{5,}/u.test(compact)) return true;
  // A short chunk repeated back to back ("lololol", "hahahaha", "no no no no")
  if (/(.{2,6}?)\1{3,}/u.test(plain.replace(/\s/g, ""))) return true;

  if (latin / letters.length < 0.7) return false;

  // Split camelCase identifiers first so "serverComponentsHmrCache" is read as the words it is made of
  const words = fold(text.replace(/([a-z])([A-Z])/g, "$1 $2")).match(/[a-z]+/g) ?? [];
  const checkable = words.filter((w) => w.length >= 2);
  if (checkable.length >= 6 && new Set(checkable).size / checkable.length < 0.3) return true;

  const odd = words.filter(looksRandom);
  if (odd.length === 0) return false;
  if (odd.some((w) => w.length >= 15)) return true;
  // One odd word in a long, otherwise normal question is fine ("what is your experience with xkcdfoo?"),
  // but a short message with an odd word, or a message that is mostly odd words, is not.
  return checkable.length <= 2 || odd.length / checkable.length >= 0.4;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Screen one user message. `ok: true` means it may be sent to the model. */
export function checkMessage(raw: string): GuardResult {
  const text = clean(raw);
  if (!/\p{L}/u.test(text)) return block("empty");
  if (text.length > MAX_USER_CHARS) return block("too-long");

  const { plain, leet, joined } = canonical(text);
  const variants = leet === joined ? [leet] : [leet, joined];
  const matches = (rules: RegExp[]) => rules.some((rule) => variants.some((v) => rule.test(v)));

  // Most serious first, so the reply fits what was actually asked
  if (matches(SELF_HARM)) return block("self-harm");
  if (matches(ILLEGAL)) return block("illegal");
  if (matches(ABUSE)) return block("abuse");
  if (matches(INJECTION) || INJECTION.some((rule) => rule.test(text))) return block("injection");

  if (URL_PATTERN.test(plain) || EMAIL_PATTERN.test(text) || PHONE_PATTERN.test(text)) {
    return block("spam", LINK_MESSAGE);
  }
  if (matches(SPAM_PHRASES)) return block("spam");
  if (matches(OFF_TOPIC)) return block("off-topic");
  if (isGibberish(text, plain)) return block("gibberish");

  return { ok: true };
}

/**
 * Screen a whole conversation as the server receives it: every user turn, plus the same
 * question being asked over and over. Assistant turns are not screened (they are only context).
 */
export function checkConversation(messages: { role: string; content: string }[]): GuardResult {
  const userTurns = messages.filter((m) => m.role === "user").map((m) => m.content);
  for (const turn of userTurns) {
    const verdict = checkMessage(turn);
    if (!verdict.ok) return verdict;
  }

  const seen = userTurns.map((t) => clean(t).toLowerCase());
  const latest = seen[seen.length - 1];
  if (latest && seen.filter((t) => t === latest).length >= 3) return block("spam");
  return { ok: true };
}
