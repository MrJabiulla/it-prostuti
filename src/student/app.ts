const icons = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  bank: '<path d="M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3zM12 6v15"/>',
  review: '<path d="M3 11a9 9 0 1 1 3 8M3 4v7h7M12 7v5l3 2"/>',
  progress: '<path d="M4 20V10m8 10V4m8 16v-7"/>',
  routine:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-14 4h3m4 0h3"/>',
};
const icon = (n) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[n] || icons.bank}</svg>`;
const subjects: Subject[] = [
  {
    name: 'Bangla Language & Literature',
    bengali: 'বাংলা ভাষা ও সাহিত্য',
    short: 'Bangla',
    symbol: 'অ',
    color: '#eef1e8',
    chapters: [
      {
        id: 'bn-c1',
        title: 'বাংলা ব্যাকরণ ও ধ্বনিতত্ত্ব',
        english: 'Grammar & Phonetics',
        topics: [
          { name: 'ধ্বনি ও বর্ণ', english: 'Phonetics & Letters' },
          { name: 'সন্ধি', english: 'Sandhi (Sound joining)' },
          { name: 'ণ-ত্ব ও ষ-ত্ব বিধান', english: 'Natwa & Shatwa Rules' },
        ],
      },
      {
        id: 'bn-c2',
        title: 'শব্দ ও পদ প্রকরণ',
        english: 'Morphology & Parts of Speech',
        topics: [
          { name: 'শব্দের শ্রেণিবিভাগ', english: 'Word Classifications' },
          { name: 'পদ প্রকরণ', english: 'Parts of Speech' },
          { name: 'উপসর্গ ও অনুসর্গ', english: 'Prefixes & Postpositions' },
        ],
      },
      {
        id: 'bn-c3',
        title: 'বাক্যতত্ত্ব ও সমাস',
        english: 'Syntax & Compounds',
        topics: [
          { name: 'সমাস', english: 'Samas (Compounds)' },
          { name: 'কারক ও বিভক্তি', english: 'Case & Inflection' },
          {
            name: 'বাগধারা ও বাক্য শুদ্ধি',
            english: 'Idioms & Sentence Correction',
          },
        ],
      },
      {
        id: 'bn-c4',
        title: 'বাংলা সাহিত্য',
        english: 'Bengali Literature',
        topics: [
          { name: 'প্রাচীন ও মধ্যযুগ', english: 'Ancient & Medieval Age' },
          { name: 'আধুনিক যুগ ও কবিতা', english: 'Modern Age & Poetry' },
          { name: 'নাটক ও উপন্যাস', english: 'Drama & Novel' },
        ],
      },
    ],
  },
  {
    name: 'English Language & Literature',
    bengali: 'ইংরেজি ভাষা ও সাহিত্য',
    short: 'English',
    symbol: 'Aa',
    color: '#f6efe4',
    chapters: [
      {
        id: 'en-c1',
        title: 'Grammar & Parts of Speech',
        english: 'Grammar Foundations',
        topics: [
          { name: 'Grammar', english: 'Parts of Speech & Basics' },
          { name: 'Subject-Verb Agreement', english: 'Agreement Rules' },
          { name: 'Tense & Verbs', english: 'Tenses & Right Forms' },
        ],
      },
      {
        id: 'en-c2',
        title: 'Sentence & Mechanics',
        english: 'Sentence Structure',
        topics: [
          { name: 'Voice & Narration', english: 'Voice & Speech' },
          { name: 'Prepositions', english: 'Appropriate Prepositions' },
          { name: 'Sentence Correction', english: 'Common Errors & Clauses' },
        ],
      },
      {
        id: 'en-c3',
        title: 'Vocabulary & Idioms',
        english: 'Lexicon & Expressions',
        topics: [
          { name: 'Vocabulary', english: 'Synonyms & Antonyms' },
          { name: 'Idioms & Phrases', english: 'Idiomatic Expressions' },
          { name: 'Spelling', english: 'Commonly Confused Words' },
        ],
      },
      {
        id: 'en-c4',
        title: 'English Literature',
        english: 'Literary Works & Authors',
        topics: [
          {
            name: 'Major Writers & Dramatists',
            english: 'Shakespeare & Classic Authors',
          },
          {
            name: 'Literary History & Quotes',
            english: 'Famous Quotes & Periods',
          },
        ],
      },
    ],
  },
  {
    name: 'Mathematical Reasoning',
    bengali: 'গাণিতিক যুক্তি ও মানসিক দক্ষতা',
    short: 'Math',
    symbol: '∑',
    color: '#edf0f8',
    chapters: [
      {
        id: 'ma-c1',
        title: 'পাটিগণিত (Arithmetic)',
        english: 'Arithmetic & Numbers',
        topics: [
          { name: 'বাস্তব সংখ্যা', english: 'Real Numbers & Primes' },
          { name: 'শতকরা', english: 'Percentage & Profit-Loss' },
          { name: 'গড় ও অনুপাত', english: 'Average & Ratio' },
        ],
      },
      {
        id: 'ma-c2',
        title: 'বীজগণিত (Algebra)',
        english: 'Algebra & Equations',
        topics: [
          { name: 'বীজগণিত', english: 'Algebraic Equations' },
          { name: 'সূচক ও লগারিদম', english: 'Indices & Logarithms' },
        ],
      },
      {
        id: 'ma-c3',
        title: 'জ্যামিতি ও পরিমিতি',
        english: 'Geometry & Mensuration',
        topics: [
          { name: 'রেখা ও কোণ', english: 'Lines, Angles & Triangles' },
          { name: 'পরিমিতি ও বৃত্ত', english: 'Perimeter, Area & Circles' },
        ],
      },
      {
        id: 'ma-c4',
        title: 'মানসিক দক্ষতা (Mental Ability)',
        english: 'Analytical & Logical Reasoning',
        topics: [
          { name: 'ধারাবাহিকতা ও সিরিজ', english: 'Number & Letter Series' },
          { name: 'সম্পর্ক ও দিক', english: 'Blood Relations & Directions' },
        ],
      },
    ],
  },
  {
    name: 'General Knowledge',
    bengali: 'সাধারণ জ্ঞান (বাংলাদেশ ও বিশ্ব)',
    short: 'General Knowledge',
    symbol: '◎',
    color: '#f5ece7',
    chapters: [
      {
        id: 'gk-c1',
        title: 'বাংলাদেশ বিষয়াবলী',
        english: 'Bangladesh Affairs',
        topics: [
          { name: 'বাংলাদেশ', english: 'National Symbols & Geography' },
          { name: 'মুক্তিযুদ্ধ ও ইতিহাস', english: 'Liberation War & History' },
          { name: 'সংবিধান ও প্রশাসন', english: 'Constitution & Polity' },
        ],
      },
      {
        id: 'gk-c2',
        title: 'আন্তর্জাতিক বিষয়াবলী',
        english: 'International Affairs',
        topics: [
          { name: 'বিশ্ব', english: 'Global Geography & Planets' },
          { name: 'আন্তর্জাতিক সংস্থা', english: 'UN & Treaties' },
        ],
      },
      {
        id: 'gk-c3',
        title: 'সাধারণ বিজ্ঞান ও তথ্যপ্রযুক্তি',
        english: 'General Science & ICT',
        topics: [
          { name: 'বিজ্ঞান', english: 'Physical & Biological Science' },
          { name: 'তথ্যপ্রযুক্তি', english: 'Computer, Internet & Cyber' },
        ],
      },
    ],
  },
];
subjects.forEach((s) => {
  s.topics = s.chapters.flatMap((c) => c.topics.map((t) => t.name));
});

const questions: Question[] = ([
  // Bangla
  [
    0,
    0,
    'সন্ধি',
    '‘বিদ্যালয়’ শব্দের সন্ধি বিচ্ছেদ কোনটি?',
    ['বিদ্যা + আলয়', 'বিদ্যা + লয়', 'বিদ্য + আলয়', 'বিদ্যা + অলয়'],
    0,
    'বিদ্যা + আলয় = বিদ্যালয়। আ + আ মিলে আ হয়; এটি স্বরসন্ধির উদাহরণ।',
  ],
  [
    0,
    0,
    'সন্ধি',
    '‘হিমালয়’ শব্দের সন্ধি বিচ্ছেদ কোনটি?',
    ['হিম + আলয়', 'হিমা + লয়', 'হিম + লয়', 'হিমা + অলয়'],
    0,
    'হিম + আলয় = হিমালয়। অ + আ মিলে আ হয়েছে।',
  ],
  [
    0,
    0,
    'ধ্বনি ও বর্ণ',
    'বাংলা বর্ণমালায় মোট মৌলিক স্বরধ্বনি কয়টি?',
    ['৭টি', '১১টি', '৩৯টি', '৫০টি'],
    0,
    'বাংলা ভাষায় মৌলিক স্বরধ্বনি ৭টি: অ, আ, ই, উ, এ, ও, অ্যা।',
  ],
  [
    0,
    0,
    'ণ-ত্ব ও ষ-ত্ব বিধান',
    'কোন শব্দটিতে স্বভাবতই ‘ষ’ হয়েছে?',
    ['আষাঢ়', 'কষ্ট', 'সুপ্ত', 'বৃষ্টি'],
    0,
    'আষাঢ়, ভাষণ, উষা প্রভৃতি শব্দে স্বভাবতই মূর্ধন্য-ষ হয়।',
  ],
  [
    0,
    1,
    'শব্দের শ্রেণিবিভাগ',
    '‘হস্তী’ কোন ধরনের শব্দ?',
    ['তৎসম শব্দ', 'তদ্ভব শব্দ', 'দেশি শব্দ', 'বিদেশি শব্দ'],
    0,
    '‘হস্তী’ একটি প্রাচীন সংস্কৃত বা তৎসম শব্দ।',
  ],
  [
    0,
    1,
    'পদ প্রকরণ',
    '‘ধীরে ধীরে বায়ু বয়’ — এখানে ‘ধীরে ধীরে’ কোন পদ?',
    ['ক্রিয়া বিশেষণ', 'বিশেষণ', 'ক্রিয়া পদ', 'অব্যয় পদ'],
    0,
    '‘ধীরে ধীরে’ পদটি বায়ু বওয়ার ভাব বা গতি প্রকাশ করছে, তাই এটি ক্রিয়া বিশেষণ।',
  ],
  [
    0,
    2,
    'সমাস',
    '‘রাজপুত্র’ কোন সমাসের উদাহরণ?',
    ['দ্বন্দ্ব সমাস', 'বহুব্রীহি সমাস', 'কর্মধারয় সমাস', 'ষষ্ঠী তৎপুরুষ সমাস'],
    3,
    'রাজার পুত্র = রাজপুত্র। এখানে ষষ্ঠী বিভক্তি ‘-র’ লোপ পেয়েছে, তাই ষষ্ঠী তৎপুরুষ সমাস।',
  ],
  [
    0,
    2,
    'সমাস',
    '‘সিংহপুরুষ’ কোন সমাসের উদাহরণ?',
    ['উপমিত কর্মধারয়', 'উপমান কর্মধারয়', 'রূপক কর্মধারয়', 'বহুব্রীহি'],
    0,
    'সিংহ সদৃশ পুরুষ = সিংহপুরুষ। এটি সাধারণ গুণের উল্লেখ ছাড়া উপমিত কর্মধারয় সমাস।',
  ],
  [
    0,
    2,
    'কারক ও বিভক্তি',
    '‘তিলে তেল আছে’ — এখানে ‘তিলে’ কোন কারকে কোন বিভক্তি?',
    ['অধিকরণে ৭মী', 'অপাদানে ৭মী', 'করণে ৭মী', 'কর্মে ৭মী'],
    0,
    'স্থান বা আধারের সম্পূর্ণ অংশে ব্যাপ্তি বোঝালে অভিব্যপক অধিকরণ কারক হয়।',
  ],
  [
    0,
    3,
    'আধুনিক যুগ ও কবিতা',
    '‘আমাদের ছোট নদী’ কবিতার রচয়িতা কে?',
    [
      'কাজী নজরুল ইসলাম',
      'জসীমউদ্দীন',
      'রবীন্দ্রনাথ ঠাকুর',
      'সুকান্ত ভট্টাচার্য',
    ],
    2,
    '‘আমাদের ছোট নদী’ রবীন্দ্রনাথ ঠাকুরের লেখা একটি সুপরিচিত কবিতা।',
  ],
  [
    0,
    3,
    'প্রাচীন ও মধ্যযুগ',
    'বাংলা সাহিত্যের প্রাচীনতম নিদর্শন ‘চর্যাপদ’ কত সালে আবিষ্কৃত হয়?',
    ['১৯০৭ সালে', '১৯১৬ সালে', '১৯২১ সালে', '১৯৫০ সালে'],
    0,
    'মহামহোপাধ্যায় হরপ্রসাদ শাস্ত্রী ১৯০৭ সালে নেপালের রয়েল লাইব্রেরি থেকে চর্যাপদ আবিষ্কার করেন।',
  ],
  [
    0,
    3,
    'নাটক ও উপন্যাস',
    'ভাষা আন্দোলনের পটভূমিতে রচিত বিখ্যাত ‘কবর’ নাটকের রচয়িতা কে?',
    ['মুনীর চৌধুরী', 'সেলিম আল দীন', 'নুরুল মোমেন', 'সৈয়দ শামসুল হক'],
    0,
    'শহীদ বুদ্ধিজীবী মুনীর চৌধুরী ১৯৫৩ সালে ঢাকা কেন্দ্রীয় কারাগারে বন্দি থাকা অবস্থায় ‘কবর’ নাটকটি রচনা করেন।',
  ],

  // English
  [
    1,
    0,
    'Grammar',
    'Choose the correct sentence.',
    [
      'He go to school.',
      'He goes to school.',
      'He going to school.',
      'He gone to school.',
    ],
    1,
    'Simple present tense-এ third person singular subject (He)-এর সঙ্গে verb-এ s/es যোগ হয়।',
  ],
  [
    1,
    0,
    'Grammar',
    'She has lived here ___ 2020.',
    ['for', 'since', 'from', 'at'],
    1,
    'নির্দিষ্ট অতীতের নির্দিষ্ট সময় বিন্দু বোঝাতে since ব্যবহৃত হয়; সময়ের ব্যাপ্তি বোঝাতে for ব্যবহৃত হয়।',
  ],
  [
    1,
    0,
    'Subject-Verb Agreement',
    'Neither of the boys ___ present yesterday.',
    ['was', 'were', 'are', 'have been'],
    0,
    '“Neither of” এর পর plural noun বসলেও verb সর্বদা singular হয়। তাই “was” সঠিক।',
  ],
  [
    1,
    1,
    'Voice & Narration',
    '“Who wrote Hamlet?” Choose the correct passive form.',
    [
      'By whom was Hamlet written?',
      'By whom Hamlet was written?',
      'Who was written Hamlet?',
      'Whom wrote Hamlet?',
    ],
    0,
    'Interrogative voice-এ “Who”-এর জায়গায় “By whom + auxiliary verb + object + V3” বসে।',
  ],
  [
    1,
    1,
    'Prepositions',
    'He is proficient ___ English.',
    ['in', 'at', 'with', 'on'],
    0,
    'দক্ষতা বোঝাতে “proficient in” উপযুক্ত preposition হিসেবে বসে।',
  ],
  [
    1,
    2,
    'Vocabulary',
    'What is the synonym of “rapid”?',
    ['Slow', 'Fast', 'Quiet', 'Weak'],
    1,
    '“Rapid” অর্থ দ্রুত। এর সমার্থক শব্দ হলো “Fast”।',
  ],
  [
    1,
    2,
    'Vocabulary',
    'Choose the opposite of “ancient”.',
    ['Old', 'Modern', 'Historic', 'Early'],
    1,
    '“Ancient” অর্থ প্রাচীন বা পুরাতন। এর বিপরীত শব্দ হলো “Modern” (আধুনিক)।',
  ],
  [
    1,
    2,
    'Idioms & Phrases',
    'What is the meaning of the idiom “A bed of roses”?',
    [
      'A life of ease and luxury',
      'A difficult path',
      'A flower garden',
      'A complex problem',
    ],
    0,
    '“A bed of roses” বাগধারাটির অর্থ নিষ্কণ্টক বা আরামদায়ক জীবন।',
  ],
  [
    1,
    3,
    'Major Writers & Dramatists',
    'Who is the author of the tragedy “Romeo and Juliet”?',
    ['William Shakespeare', 'Christopher Marlowe', 'John Milton', 'John Keats'],
    0,
    '“Romeo and Juliet” বিশ্ববিখ্যাত নাট্যকার William Shakespeare-এর অমর ট্র্যাজেডি নাটক।',
  ],

  // Math
  [
    2,
    0,
    'বাস্তব সংখ্যা',
    'নিচের কোনটি মৌলিক সংখ্যা?',
    ['৪৭', '৫১', '৮৭', '৯১'],
    0,
    '৪৭ কে ১ ও ৪৭ ছাড়া অন্য কোনো সংখ্যা দিয়ে ভাগ করা যায় না। তাই ৪৭ একটি মৌলিক সংখ্যা।',
  ],
  [
    2,
    0,
    'শতকরা',
    '২০০-এর ১৫% কত?',
    ['১৫', '২০', '৩০', '৪০'],
    2,
    '২০০ × ১৫ ÷ ১০০ = ৩০। শতকরা মানে প্রতি একশতে মান।',
  ],
  [
    2,
    0,
    'শতকরা',
    'একটি বইয়ের মূল্য ৫০০ টাকা। ১০% ছাড়ে বইটির বিক্রয়মূল্য কত?',
    ['৪০০ টাকা', '৪৫০ টাকা', '৪৮০ টাকা', '৪৯০ টাকা'],
    1,
    'ছাড় = ৫০০ × ১০ ÷ ১০০ = ৫০ টাকা। বিক্রয়মূল্য = ৫০০ − ৫০ = ৪৫০ টাকা।',
  ],
  [
    2,
    0,
    'গড় ও অনুপাত',
    '১০, ২০ ও ৩০-এর গড় কত?',
    ['১৫', '২০', '২৫', '৩০'],
    1,
    'গড় = সংখ্যাগুলোর যোগফল ÷ মোট সংখ্যা = (১০ + ২০ + ৩০) ÷ ৩ = ৬০ ÷ ৩ = ২০।',
  ],
  [
    2,
    1,
    'বীজগণিত',
    '২x + ৬ = ১৬ হলে x-এর মান কত?',
    ['৩', '৪', '৫', '৬'],
    2,
    '২x = ১৬ − ৬ = ১০। সুতরাং x = ১০ ÷ ২ = ৫।',
  ],
  [
    2,
    1,
    'সূচক ও লগারিদম',
    'log₂ 8-এর মান কত?',
    ['২', '৩', '৪', '৮'],
    1,
    '8 = 2³। সুতরাং log₂ (2³) = 3 log₂ 2 = 3 × 1 = 3।',
  ],
  [
    2,
    2,
    'রেখা ও কোণ',
    'একটি ত্রিভুজের তিন কোণের সমষ্টি কত ডিগ্রি?',
    ['৯০°', '১৮০°', '২৭০°', '৩৬০°'],
    1,
    'ইউক্লিডীয় জ্যামিতি অনুসারে যেকোনো সমতলীয় ত্রিভুজের তিন কোণের সমষ্টি দুই সমকোণ বা ১৮০°।',
  ],
  [
    2,
    3,
    'ধারাবাহিকতা ও সিরিজ',
    'ধারাটির পরবর্তী সংখ্যা কত: ৩, ৬, ১২, ২৪, ___?',
    ['৪৮', '৩৬', '৩০', '৫০'],
    0,
    'প্রতিটি পদ পূর্ববর্তী পদের দ্বিগুণ হচ্ছে (৩ × ২ = ৬, ৬ × ২ = ১২...)। সুতরাং ২৪ × ২ = ৪৮।',
  ],

  // General Knowledge
  [
    3,
    0,
    'বাংলাদেশ',
    'বাংলাদেশের জাতীয় ফুল কোনটি?',
    ['গোলাপ', 'শাপলা', 'বেলি', 'জবা'],
    1,
    'বাংলাদেশের জাতীয় ফুল সাদা শাপলা।',
  ],
  [
    3,
    0,
    'বাংলাদেশ',
    'বাংলাদেশের জাতীয় স্মৃতিসৌধ কোথায় অবস্থিত?',
    ['সাভার', 'টুঙ্গিপাড়া', 'কুমিল্লা', 'সিলেট'],
    0,
    'জাতীয় স্মৃতিসৌধ ঢাকা জেলার সাভারের নবীনগরে অবস্থিত।',
  ],
  [
    3,
    0,
    'মুক্তিযুদ্ধ ও ইতিহাস',
    '১৯৭১ সালের ঐতিহাসিক ৭ই মার্চের ভাষণ কোথায় অনুষ্ঠিত হয়েছিল?',
    [
      'রেসকোর্স ময়দান (সোহরাওয়ার্দী উদ্যান)',
      'পল্টন ময়দান',
      'ঢাকা বিশ্ববিদ্যালয়',
      'কেন্দ্রীয় শহীদ মিনার',
    ],
    0,
    'বঙ্গবন্ধু শেখ মুজিবুর রহমান ১৯৭১ সালের ৭ই মার্চ তৎকালীন রেসকোর্স ময়দানে ঐতিহাসিক ভাষণ দেন।',
  ],
  [
    3,
    0,
    'সংবিধান ও প্রশাসন',
    'গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধান কোন তারিখ থেকে কার্যকর হয়?',
    ['১৬ ডিসেম্বর ১৯৭২', '২৬ মার্চ ১৯৭২', '৪ নভেম্বর ১৯৭২', '১০ জানুয়ারি ১৯৭২'],
    0,
    '১৯৭২ সালের ৪ নভেম্বর গণপরিষদে সংবিধান গৃহীত হয় এবং ১৬ ডিসেম্বর ১৯৭২ থেকে কার্যকর হয়।',
  ],
  [
    3,
    1,
    'বিশ্ব',
    'সৌরজগতের বৃহত্তম গ্রহ কোনটি?',
    ['পৃথিবী', 'মঙ্গল', 'শনি', 'বৃহস্পতি'],
    3,
    'বৃহস্পতি সৌরজগতের সর্ববৃহৎ গ্রহ।',
  ],
  [
    3,
    1,
    'আন্তর্জাতিক সংস্থা',
    'জাতিসংঘের (United Nations) সদর দপ্তর কোথায় অবস্থিত?',
    ['নিউইয়র্ক', 'জেনেভা', 'প্যারিস', 'লন্ডন'],
    0,
    'জাতিসংঘের মূল সদর দপ্তর মার্কিন যুক্তরাষ্ট্রের নিউইয়র্ক সিটিতে অবস্থিত।',
  ],
  [
    3,
    2,
    'বিজ্ঞান',
    'পানির রাসায়নিক সংকেত কোনটি?',
    ['CO₂', 'O₂', 'H₂O', 'NaCl'],
    2,
    'পানির একটি অণুতে দুটি হাইড্রোজেন এবং একটি অক্সিজেন পরমাণু থাকে, তাই সংকেত H₂O।',
  ],
  [
    3,
    2,
    'তথ্যপ্রযুক্তি',
    'কম্পিউটারের ‘মস্তিষ্ক’ (Brain) বলা হয় কোন অংশটিকে?',
    ['CPU', 'RAM', 'Hard Disk', 'Monitor'],
    0,
    'CPU (Central Processing Unit) কম্পিউটারের সকল নির্দেশনা প্রক্রিয়াকরণ ও নিয়ন্ত্রণ করে।',
  ],
] as QuestionRow[]).map((q, id) => ({
  id,
  subject: q[0],
  chapter: q[1],
  topic: q[2],
  text: q[3],
  options: q[4],
  answer: q[5],
  explanation: q[6],
}));
const KEY = 'prosthuti-mvp-v1';
let state: StudentState;
try {
  state = apiEnabled ? null : JSON.parse(localStorage.getItem(KEY));
} catch {}
if (!state || !Array.isArray(state.attempts))
  state = {
    profile: { name: '', exam: 'BCS Preliminary', minutes: 30, date: '' },
    attempts: [],
    saved: [],
    reviews: {},
    reports: [],
    session: null,
  };
if (
  !apiEnabled && (!state.reviews ||
  (Object.keys(state.reviews).length === 0 &&
    (!state.attempts || state.attempts.length === 0)))
) {
  state.reviews = {
    7: { due: Date.now() - 3600000, level: 0 },
    8: { due: Date.now() - 3600000, level: 0 },
  };
}
let page = 'home',
  filter = 'all',
  search = '',
  bankTab = 'subjects',
  reviewTab = 'due',
  selection = null,
  guess = false,
  storageWarning = false,
  settingsExpanded = true,
  sidebarHidden = false,
  selectedSubject = null,
  openChapters = {},
  showMoreWeak = false,
  showMoreAffairs = false,
  showMoreNotices = false,
  selectedInstSyllabus = 'bpsc',
  syllabusExamType = 'mcq';
const $ = (s) => document.querySelector(s),
  formatNumber = (n) => String(n),
  esc = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        })[c],
    );
function save() {
  if (apiEnabled) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    if (!storageWarning) {
      storageWarning = true;
      toast(
        'Browser storage unavailable: progress will only last for this session.',
      );
    }
  }
}
function toast(t) {
  $('#toast').textContent = t;
  $('#toast').classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(
    () => $('#toast').classList.remove('show'),
    3000,
  );
}
const dayKey = (date = new Date()) => date.toLocaleDateString('en-CA', apiEnabled ? { timeZone: apiTimezone } : undefined);
const todayAttempts = () => state.attempts.filter((a) => a.day === dayKey());
const due = () =>
  Object.keys(state.reviews)
    .map(Number)
    .filter((id) => state.reviews[id].due <= Date.now());
const accuracy = (a = state.attempts) =>
  a.length
    ? Math.round((a.filter((x) => x.correct).length / a.length) * 100)
    : 0;
const goal = () =>
  Number(state.profile.dailyGoal) ||
  (state.profile.minutes === 15 ? 5 : state.profile.minutes === 60 ? 16 : 10);
function streak() {
  const days = new Set(state.attempts.map((a) => a.day));
  let d = new Date(),
    n = 0;
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while (days.has(dayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}
function nav() {
  const activePage = navigationPage(page);
  const mobileItems = [
    ['home', '⌂', 'Home'],
    ['study', '☰', 'Study'],
    ['bank', '▤', 'Question Bank'],
    ['exams', '◷', 'Exam'],
    ['preparation', '↻', 'My Preparation'],
  ];
  const settingsSubItems = [
    ['preferences', 'Preferences'],
    ['plan', 'Study plan'],
    ['reminders', 'Reminders'],
    ['data', 'Data & offline'],
    ['about', 'About'],
  ];
  const sidebarItems = [
    ['home', '⌂', 'Today'],
    ['study', '📖', 'Study'],
    ['bank', '▤', 'Question Bank'],
    ['exams', '◷', 'Exam'],
    ['preparation', '↻', 'My Preparation'],
  ];
  const mobNav = $('#mobile-nav');
  if (mobNav) {
    if (page === 'practice') {
      mobNav.style.display = 'none';
    } else {
      mobNav.style.display = '';
      mobNav.innerHTML =
        '<div>' +
        mobileItems
          .map(
            ([id, symbol, label]) =>
              `<button data-action="navigate" data-page="${id}" class="${activePage === id ? 'on' : ''}" ${activePage === id ? 'aria-current="page"' : ''}><span>${symbol}</span>${label}</button>`,
          )
          .join('') +
        '</div>';
    }
  }
  const sideNav = $('#sidebar-nav');
  if (sideNav) {
    sideNav.classList.toggle('collapsed-sidebar', sidebarHidden);
    sideNav.innerHTML = `<div><div class="brand"><div class="brand-logo">P</div><div><div class="brand-title">Prosthuti</div><div class="brand-sub">A little progress every day</div></div><button class="icon-button sidebar-collapse-btn" data-action="toggle-sidebar" aria-label="Hide sidebar" title="Hide sidebar">‹</button></div><div class="sidebar-section-label">Your study space</div><div class="sidebar-menu">${sidebarItems.map(([id, symbol, label, badge]) => `<button data-action="navigate" data-page="${id}" class="sidebar-item ${activePage === id ? 'active' : ''}" ${activePage === id ? 'aria-current="page"' : ''}><span class="sidebar-icon">${symbol}</span><span class="sidebar-label">${label}</span>${badge ? `<span class="badge">${badge}</span>` : ''}</button>`).join('')}<div class="sidebar-group ${settingsExpanded ? 'open' : ''}"><button class="sidebar-item sidebar-parent ${page === 'settings' ? 'active' : ''}" data-action="toggle-settings-sub" ${page === 'settings' ? 'aria-current="page"' : ''}><span class="sidebar-icon">⚙</span><span class="sidebar-label">Settings</span><span class="chevron ${settingsExpanded ? 'expanded' : ''}">▾</span></button><div class="sidebar-sub-menu ${settingsExpanded ? '' : 'hide-sub'}">${settingsSubItems.map(([id, label]) => `<button data-action="settings-sub" data-id="${id}" class="sidebar-sub-item ${page === 'settings' && typeof settingsTab !== 'undefined' && settingsTab === id ? 'active' : ''}"><span class="sidebar-sub-label">${label}</span></button>`).join('')}</div></div></div></div><div class="sidebar-footer-card"><div class="sidebar-card-icon">✦</div><b>Small steps. Real progress.</b><p class="fine" style="margin:4px 0 0">A little practice today, more confidence tomorrow.</p></div>`;
  }
  const deskHeader = $('#desktop-header');
  if (deskHeader) {
    if (page === 'practice') {
      deskHeader.style.display = 'none';
    } else {
      deskHeader.style.display = '';
      const titles = {
        home: 'Today',
        bank: 'Question bank',
        study: 'Study',
        lesson: 'Reading',
        exams: 'Exam',
        papers: 'Previous questions',
        paper: 'Paper details',
        preparation: 'My Preparation',
        custom: 'Custom practice',
        history: 'Result history',
        affairs: 'Current affairs',
        backup: 'Offline & backup',
        'exam-preparation': 'Exam-wise preparation',
        'routine-edit': 'Edit routine',
        'restore-backup': 'Restore backup',
        review: 'Revision',
        progress: 'Progress',
        routine: 'Study routine',
        settings: 'Settings',
        practice: 'Practice',
        result: 'Results',
      };
      const curSub =
        typeof settingsTab !== 'undefined'
          ? {
              preferences: 'Preferences',
              plan: 'Study plan',
              reminders: 'Reminders',
              data: 'Data & offline',
              about: 'About',
            }[settingsTab] || ''
          : '';
      const userName = state.profile.name || 'User name';
      const streakCount = streak();
      const acc = apiEnabled && apiReady ? accuracy() : state.attempts.length ? accuracy() : 33;
      const solvedCount = apiEnabled && apiReady ? state.attempts.length : state.attempts.length || 3;
      if (page === 'home') {
        deskHeader.innerHTML = `<div class="desktop-header-inner"><div class="desktop-header-left">${sidebarHidden ? `<button class="icon-button sidebar-unhide-btn" data-action="toggle-sidebar" aria-label="Show sidebar" title="Show sidebar">☰</button>` : ''}<div class="appbar-user-wrap"><h1 class="appbar-user-name">${esc(userName)}</h1><div class="appbar-user-stats"><b>${formatNumber(apiEnabled && apiReady ? streakCount : streakCount || 1)}</b> day streak · <b>${formatNumber(acc)}%</b> accuracy · <b>${formatNumber(solvedCount)}</b> solved</div></div></div></div>`;
      } else {
        deskHeader.innerHTML = `<div class="desktop-header-inner"><div class="desktop-header-left">${sidebarHidden ? `<button class="icon-button sidebar-unhide-btn" data-action="toggle-sidebar" aria-label="Show sidebar" title="Show sidebar">☰</button>` : ''}<div class="breadcrumbs"><b class="active-crumb">${titles[page] || 'Today'}</b>${page === 'settings' && curSub ? `<span class="sep">/</span><span class="active-crumb-sub">${curSub}</span>` : ''}${page === 'bank' && selectedSubject !== null ? `<span class="sep">/</span><span class="active-crumb-sub">${esc(subjects[selectedSubject].short)}</span>` : ''}</div></div></div>`;
      }
    }
  }
}
function heading(title) {
  return `<div class="page-heading row sp"><div><h1>${esc(title)}</h1></div></div>`;
}
// Shared tab markup for routine and settings screens.
function renderTabs(items, activeTab, action, extraClass = '') {
  const className = extraClass ? `tabs ${extraClass}` : 'tabs';
  const buttons = items.map(([id, label]) => {
    const activeClass = activeTab === id ? 'active' : '';
    return `<button class="tab ${activeClass}" data-action="${action}" data-id="${id}">${label}</button>`;
  });
  return `<div class="${className}">${buttons.join('')}</div>`;
}

function stats() {
  return `<div class="card row stats"><div class="stat"><b>${formatNumber(streak())}</b><span class="sub">day streak</span></div><div class="stat"><b>${state.attempts.length ? formatNumber(accuracy()) + '%' : '—'}</b><span class="sub">accuracy</span></div><div class="stat"><b>${formatNumber(state.attempts.length)}</b><span class="sub">solved</span></div></div>`;
}
function subjectCard(s, i) {
  let total = questions.filter((q) => q.subject === i).length;
  return `<button class="subject-card-minimal" data-action="open-subject" data-id="${i}">
    <h3>${esc(s.name)}</h3>
    <p>${formatNumber(s.chapters.length)} chapters · ${formatNumber(total)} questions</p>
  </button>`;
}
function subjectDetailView(sIdx) {
  const s = subjects[sIdx];
  if (!s) return bank();
  const subQ = questions.filter((q) => q.subject === sIdx);
  return `<div class="bank-wrap">
    <div class="subject-nav-bar">
      <button class="back-link" data-action="back-subjects">‹ All Subjects</button>
    </div>
    <div class="subject-header">
      <div class="subject-header-info">
        <h1 class="subject-title">${esc(s.name)}</h1>
        <p class="subject-meta">${formatNumber(s.chapters.length)} chapters · ${formatNumber(subQ.length)} questions</p>
      </div>
      <button class="btn-practice-all" data-action="practice-subject" data-id="${sIdx}" ${!subQ.length ? 'disabled' : ''}>Practice all</button>
    </div>
    <div class="chapters-list">
      ${s.chapters.map((chap, cIdx) => chapterRow(sIdx, chap, cIdx)).join('')}
    </div>
  </div>`;
}
function chapterRow(sIdx, chap, cIdx) {
  const chapQ = questions.filter(
    (q) => q.subject === sIdx && q.chapter === cIdx,
  );
  return `<section class="chapter-card">
    <div class="chapter-card-header">
      <div class="chapter-card-left">
        <h3 class="chapter-title">${esc(chap.title)}</h3>
        <div class="chapter-meta">${formatNumber(chap.topics.length)} topics · ${formatNumber(chapQ.length)} questions</div>
      </div>
      <div class="row-actions">
        <button class="btn-link-study" data-action="study-chapter" data-subject="${sIdx}" data-chapter="${cIdx}" title="Study ${esc(chap.title)}">Study</button>
        <button class="btn-link-practice" data-action="practice-chapter" data-subject="${sIdx}" data-chapter="${cIdx}" ${!chapQ.length ? 'disabled' : ''} title="Practice ${esc(chap.title)}">Practice</button>
      </div>
    </div>
    <div class="topic-list">
      ${chap.topics.map((topic) => topicRow(sIdx, cIdx, topic)).join('')}
    </div>
  </section>`;
}
function topicRow(sIdx, cIdx, topic) {
  const topQ = questions.filter(
    (q) => q.subject === sIdx && q.chapter === cIdx && q.topic === topic.name,
  );
  const count = topQ.length;
  return `<div class="topic-item">
    <div class="topic-info">
      <h4 class="topic-title">${esc(topic.name)}</h4>
      <div class="topic-meta">${formatNumber(count)} ${count === 1 ? 'question' : 'questions'}</div>
    </div>
    <div class="row-actions">
      <button class="btn-link-study" data-action="study-topic" data-subject="${sIdx}" data-chapter="${cIdx}" data-topic="${esc(topic.name)}" title="Study ${esc(topic.name)}">Study</button>
      <button class="btn-link-practice" data-action="practice-topic" data-subject="${sIdx}" data-topic="${esc(topic.name)}" ${!count ? 'disabled' : ''} title="Practice ${esc(topic.name)}">Practice</button>
    </div>
  </div>`;
}

const topicNotes = {
  'ধ্বনি ও বর্ণ': {
    readTime: '3 min read',
    summary: 'বাংলা ধ্বনিতত্ত্ব ও বর্ণমালার মৌলিক নিয়মাবলী।',
    points: [
      {
        label: 'ধ্বনি ও বর্ণ',
        desc: 'বাগ্যন্ত্রের সাহায্যে উচ্চারিত অর্থপূর্ণ আওয়াজই হলো ‘ধ্বনি’। ধ্বনির দৃষ্টিগ্রাহ্য লিখিত রূপকে বলা হয় ‘বর্ণ’ (যেমন: অ, আ, ক)।',
      },
      {
        label: 'মৌলিক স্বরধ্বনি (৭টি)',
        desc: 'বাংলা ভাষার ৭টি মৌলিক স্বরধ্বনি: অ, আ, ই, উ, এ, ও এবং অ্যা।',
      },
      {
        label: 'যৌগিক স্বরধ্বনি',
        desc: 'বাংলায় যৌগিক স্বরধ্বনি ২৫টি, তবে বর্ণমালায় প্রতীক ২টি: ঐ (অ+ই) ও ঔ (অ+উ)।',
      },
      {
        label: 'বর্ণের সংখ্যা ও মাত্রা',
        desc: 'মোট বর্ণ ৫০টি (স্বরবর্ণ ১১টি, ব্যঞ্জনবর্ণ ৩৯টি)। পূর্ণমাত্রা ৩২টি, অর্ধমাত্রা ৮টি এবং মাত্রাহীন ১০টি।',
      },
      {
        label: 'স্পর্শ/বর্গীয় বর্ণ',
        desc: 'ক থেকে ম পর্যন্ত ২৫টি বর্ণ ৫টি বর্গে বিভক্ত (ক, চ, ট, ত, প বর্গে)।',
      },
    ],
  },
  সন্ধি: {
    readTime: '4 min read',
    summary: 'সন্ধির প্রকারভেদ, স্বরসন্ধির প্রধান সূত্র ও ব্যতিক্রমী উদাহরণ।',
    points: [
      {
        label: 'সন্ধির সংজ্ঞা',
        desc: 'সন্নিহিত দুটি ধ্বনির মিলনকে সন্ধি বলে। দ্রুত ও সহজ উচ্চারণের সুবিধার জন্য সন্ধি ঘটে।',
      },
      {
        label: 'প্রকারভেদ',
        desc: 'বাংলা সন্ধি ২ প্রকার (স্বর ও ব্যঞ্জন)। তৎসম (সংস্কৃত) সন্ধি ৩ প্রকার (স্বরসন্ধি, ব্যঞ্জনসন্ধি ও বিসর্গসন্ধি)।',
      },
      {
        label: 'স্বরসন্ধির প্রধান সূত্র',
        desc: 'অ/আ + অ/আ = আ (হিম + আলয় = হিমালয়, বিদ্যা + আলয় = বিদ্যালয়)। অ/আ + ই/ঈ = এ (শুভ + ইচ্ছা = শুভেচ্ছা)। অ/আ + উ/ঊ = ও (সূর্য + উদয় = সূর্যোদয়)।',
      },
      {
        label: 'নিপাতনে সিদ্ধ সন্ধি',
        desc: 'যেসব সন্ধি প্রচলিত ব্যাকরণগত কোনো নিয়ম মানে না: কুল + অটা = কুলটা, এক + দশ = একাদশ, পতৎ + অঞ্জলি = পতঞ্জলি, পর + পর = পরস্পর, গো + অক্ষ = গবাক্ষ।',
      },
    ],
  },
  'ণ-ত্ব ও ষ-ত্ব বিধান': {
    readTime: '3 min read',
    summary: 'তৎসম শব্দে মূর্ধন্য-ণ এবং মূর্ধন্য-ষ ব্যবহারের নির্ভুল নিয়ম।',
    points: [
      {
        label: 'প্রয়োগক্ষেত্র',
        desc: 'ণ-ত্ব ও ষ-ত্ব বিধান কেবল তৎসম (সংস্কৃত) শব্দেই প্রযোজ্য। তদ্ভব, দেশি বা বিদেশি শব্দে কখনো ণ বা ষ হয় না (যেমন: করন, পোস্ট, মাস্টার, জিনিস)।',
      },
      {
        label: 'ণ-ত্ব বিধানের নিয়ম',
        desc: 'ঋ, র, ষ-এর পর মূর্ধন্য-ণ বসে (ঋণ, বর্ণ, কারণ, ভীষণ)। ট-বর্গীয় বর্ণের পূর্বে যুক্ত ব্যঞ্জনে মূর্ধন্য-ণ হয় (ঘণ্টা, কাণ্ড, লুণ্ঠন)।',
      },
      {
        label: 'ষ-ত্ব বিধানের নিয়ম',
        desc: 'অ, আ ভিন্ন অন্য স্বরধ্বনি এবং ক ও র-এর পরে প্রত্যয়ের ‘স’ ‘ষ’ হয় (অভিষেক, বিষম, পরিষ্কার)। ট ও ঠ বর্ণের পূর্বে মূর্ধন্য-ষ হয় (কষ্ট, স্পষ্ট, বৃষ্টি)।',
      },
      {
        label: 'স্বভাবতই মূর্ধন্য-ষ',
        desc: 'কোনো নিয়ম ছাড়াই যেসব শব্দে মূর্ধন্য-ষ ব্যবহৃত হয়: আষাঢ়, ভাষণ, উষা, পাষাণ, সরিষা, ভাষা, রোষ, কোষ ইত্যাদি।',
      },
    ],
  },
  'শব্দের শ্রেণিবিভাগ': {
    readTime: '3 min read',
    summary: 'উৎস, গঠন ও অর্থ অনুসারে বাংলা শব্দের বৈচিত্র্য।',
    points: [
      {
        label: 'উৎস অনুসারে (৫ প্রকার)',
        desc: 'তৎসম (চন্দ্র, সূর্য, হস্তী), অর্ধ-তৎসম (জোছনা, গিন্নি), তদ্ভব (হাত, চাঁদ), দেশি (কুলা, ডাব, ঢেঁকি), বিদেশি (টেবিল, চেয়ার, আইন)।',
      },
      {
        label: 'গঠন অনুসারে (২ প্রকার)',
        desc: 'মৌলিক শব্দ (গোলাপ, লাল, তিন) ও সাধিত শব্দ (চাঁদমুখ, ডুবুরি, চলন্ত)।',
      },
    ],
  },
  'পদ প্রকরণ': {
    readTime: '3 min read',
    summary: 'বাক্যে ব্যবহৃত বিভক্তিযুক্ত পদ ও তাদের শ্রেণিবিভাগ।',
    points: [
      {
        label: 'পদের সংজ্ঞা',
        desc: 'বাক্যে ব্যবহৃত প্রত্যেকটি বিভক্তিযুক্ত শব্দ ও ধাতুকে পদ বলে। পদ প্রধানত ২ প্রকার: নামপদ ও ক্রিয়াপদ। মোট ৫ প্রকার।',
      },
      {
        label: 'ক্রিয়া বিশেষণ',
        desc: 'যে পদ ক্রিয়া সংঘটনের ভাব, সময় বা তীব্রতা নির্দেশ করে (যেমন: ‘ধীরে ধীরে বায়ু বয়’ — ধীরে ধীরে ক্রিয়া বিশেষণ)।',
      },
    ],
  },
  সমাস: {
    readTime: '4 min read',
    summary: 'পরস্পর সম্বন্ধযুক্ত একাধিক পদের একপদীকরণ পদ্ধতি।',
    points: [
      {
        label: 'সমাসের অর্থ',
        desc: 'সমাস অর্থ সংক্ষেপ, মিলন, একাধিক পদের একপদীকরণ।',
      },
      {
        label: 'প্রধান সমাস',
        desc: 'দ্বন্দ্ব (উভয়পদ প্রধান), কর্মধারয় (পরপদ প্রধান), তৎপুরুষ (পরপদ প্রধান, বিভক্তি লোপ), বহুব্রীহি (অন্যপদ প্রধান), দ্বিগু (সংখ্যাবাচক পূর্বপদ), অব্যয়ীভাব (পূর্বপদ প্রধান)।',
      },
      {
        label: 'উপমিত বনাম উপমান',
        desc: 'সাধারণ গুণের উল্লেখ না থাকলে উপমিত (সিংহ সদৃশ পুরুষ = সিংহপুরুষ); সাধারণ গুণের উল্লেখ থাকলে উপমান (ভ্রমরের ন্যায় কৃষ্ণ কেশ = ভ্রমরকৃষ্ণ কেশ)।',
      },
      {
        label: 'তৎপুরুষ সমাস',
        desc: 'পূর্বপদের বিভক্তি লোপ পেয়ে যে সমাস হয় (রাজার পুত্র = রাজপুত্র — ষষ্ঠী তৎপুরুষ সমাস)।',
      },
    ],
  },
};

function openStudyTopic(sIdx, cIdx, topName) {
  const lesson = lessons.find(
    (item) =>
      item.subject === sIdx && item.chapter === cIdx && item.topic === topName,
  );
  if (lesson) openLesson(lesson.id);
}

function openStudyChapter(sIdx, cIdx) {
  studySubject = sIdx;
  studyChapter = cIdx;
  navigate('study');
}
const SYLLABUS_DATA = {
  bpsc: {
    mcq: {
      stats: [
        { label: 'Total marks', value: '100' },
        { label: 'Duration', value: '60 min' },
        { label: 'Pass mark', value: '50%' },
        { label: 'Negative marking', value: '0.5' },
      ],
      rows: [
        {
          subject: 'Bangla',
          subjectId: 0,
          qCount: 20,
          marks: 20,
          share: '20%',
        },
        {
          subject: 'English',
          subjectId: 1,
          qCount: 20,
          marks: 20,
          share: '20%',
        },
        {
          subject: 'Mathematical Reasoning',
          subjectId: 3,
          qCount: 20,
          marks: 20,
          share: '20%',
        },
        {
          subject: 'General Knowledge',
          subjectId: 2,
          qCount: 30,
          marks: 30,
          share: '30%',
        },
        { subject: 'ICT', subjectId: 3, qCount: 10, marks: 10, share: '10%' },
      ],
    },
    written: {
      stats: [
        { label: 'Total marks', value: '200' },
        { label: 'Duration', value: '3 hours' },
        { label: 'Pass mark', value: '50%' },
        { label: 'Questions', value: '20' },
      ],
      rows: [
        { subject: 'Bangla', subjectId: 0, qCount: 5, marks: 50, share: '25%' },
        {
          subject: 'English',
          subjectId: 1,
          qCount: 5,
          marks: 50,
          share: '25%',
        },
        {
          subject: 'Mathematical Reasoning',
          subjectId: 3,
          qCount: 5,
          marks: 50,
          share: '25%',
        },
        {
          subject: 'General Knowledge',
          subjectId: 2,
          qCount: 5,
          marks: 50,
          share: '25%',
        },
      ],
    },
  },
  bank: {
    mcq: {
      stats: [
        { label: 'Total marks', value: '100' },
        { label: 'Duration', value: '60 min' },
        { label: 'Pass mark', value: '50%' },
        { label: 'Negative marking', value: '0.25' },
      ],
      rows: [
        {
          subject: 'Bangla',
          subjectId: 0,
          qCount: 15,
          marks: 15,
          share: '15%',
        },
        {
          subject: 'English',
          subjectId: 1,
          qCount: 20,
          marks: 20,
          share: '20%',
        },
        {
          subject: 'Mathematical Reasoning',
          subjectId: 3,
          qCount: 30,
          marks: 30,
          share: '30%',
        },
        {
          subject: 'General Knowledge',
          subjectId: 2,
          qCount: 15,
          marks: 15,
          share: '15%',
        },
        { subject: 'ICT', subjectId: 3, qCount: 20, marks: 20, share: '20%' },
      ],
    },
    written: {
      stats: [
        { label: 'Total marks', value: '200' },
        { label: 'Duration', value: '2 hours' },
        { label: 'Pass mark', value: '50%' },
        { label: 'Questions', value: '10' },
      ],
      rows: [
        {
          subject: 'Bangla (Essay & Translation)',
          subjectId: 0,
          qCount: 2,
          marks: 40,
          share: '20%',
        },
        {
          subject: 'English (Focus Writing & Comprehension)',
          subjectId: 1,
          qCount: 3,
          marks: 60,
          share: '30%',
        },
        {
          subject: 'Mathematics (Problem Solving)',
          subjectId: 3,
          qCount: 4,
          marks: 70,
          share: '35%',
        },
        {
          subject: 'General Knowledge & Banking Affairs',
          subjectId: 2,
          qCount: 1,
          marks: 30,
          share: '15%',
        },
      ],
    },
  },
  power: {
    mcq: {
      stats: [
        { label: 'Total marks', value: '100' },
        { label: 'Duration', value: '60 min' },
        { label: 'Pass mark', value: '50%' },
        { label: 'Negative marking', value: '0.25' },
      ],
      rows: [
        {
          subject: 'Basic Electrical Science',
          subjectId: 3,
          qCount: 40,
          marks: 40,
          share: '40%',
        },
        {
          subject: 'Mathematical Reasoning',
          subjectId: 3,
          qCount: 20,
          marks: 20,
          share: '20%',
        },
        {
          subject: 'English',
          subjectId: 1,
          qCount: 15,
          marks: 15,
          share: '15%',
        },
        {
          subject: 'General Knowledge',
          subjectId: 2,
          qCount: 15,
          marks: 15,
          share: '15%',
        },
        {
          subject: 'Bangla',
          subjectId: 0,
          qCount: 10,
          marks: 10,
          share: '10%',
        },
      ],
    },
    written: {
      stats: [
        { label: 'Total marks', value: '100' },
        { label: 'Duration', value: '2 hours' },
        { label: 'Pass mark', value: '50%' },
        { label: 'Questions', value: '12' },
      ],
      rows: [
        {
          subject: 'Technical & Engineering Paper',
          subjectId: 3,
          qCount: 6,
          marks: 60,
          share: '60%',
        },
        {
          subject: 'Mathematical Reasoning',
          subjectId: 3,
          qCount: 3,
          marks: 25,
          share: '25%',
        },
        {
          subject: 'English & Drafting',
          subjectId: 1,
          qCount: 3,
          marks: 15,
          share: '15%',
        },
      ],
    },
  },
  wasa: {
    mcq: {
      stats: [
        { label: 'Total marks', value: '100' },
        { label: 'Duration', value: '60 min' },
        { label: 'Pass mark', value: '50%' },
        { label: 'Negative marking', value: '0.25' },
      ],
      rows: [
        {
          subject: 'Water Utilities & Science',
          subjectId: 3,
          qCount: 30,
          marks: 30,
          share: '30%',
        },
        {
          subject: 'Mathematical Reasoning',
          subjectId: 3,
          qCount: 20,
          marks: 20,
          share: '20%',
        },
        {
          subject: 'English',
          subjectId: 1,
          qCount: 20,
          marks: 20,
          share: '20%',
        },
        {
          subject: 'General Knowledge',
          subjectId: 2,
          qCount: 15,
          marks: 15,
          share: '15%',
        },
        {
          subject: 'Bangla',
          subjectId: 0,
          qCount: 15,
          marks: 15,
          share: '15%',
        },
      ],
    },
    written: {
      stats: [
        { label: 'Total marks', value: '100' },
        { label: 'Duration', value: '2 hours' },
        { label: 'Pass mark', value: '50%' },
        { label: 'Questions', value: '10' },
      ],
      rows: [
        {
          subject: 'Utilities Science Paper',
          subjectId: 3,
          qCount: 4,
          marks: 50,
          share: '50%',
        },
        {
          subject: 'Mathematical Reasoning',
          subjectId: 3,
          qCount: 3,
          marks: 30,
          share: '30%',
        },
        {
          subject: 'Bangla & English Drafting',
          subjectId: 0,
          qCount: 3,
          marks: 20,
          share: '20%',
        },
      ],
    },
  },
  petrobangla: {
    mcq: {
      stats: [
        { label: 'Total marks', value: '100' },
        { label: 'Duration', value: '60 min' },
        { label: 'Pass mark', value: '50%' },
        { label: 'Negative marking', value: '0.25' },
      ],
      rows: [
        {
          subject: 'Hydrocarbon & Geology Science',
          subjectId: 3,
          qCount: 30,
          marks: 30,
          share: '30%',
        },
        {
          subject: 'Mathematical Reasoning',
          subjectId: 3,
          qCount: 25,
          marks: 25,
          share: '25%',
        },
        {
          subject: 'English',
          subjectId: 1,
          qCount: 20,
          marks: 20,
          share: '20%',
        },
        {
          subject: 'General Knowledge',
          subjectId: 2,
          qCount: 15,
          marks: 15,
          share: '15%',
        },
        {
          subject: 'Bangla',
          subjectId: 0,
          qCount: 10,
          marks: 10,
          share: '10%',
        },
      ],
    },
    written: {
      stats: [
        { label: 'Total marks', value: '100' },
        { label: 'Duration', value: '2 hours' },
        { label: 'Pass mark', value: '50%' },
        { label: 'Questions', value: '10' },
      ],
      rows: [
        {
          subject: 'Energy Science & Mining',
          subjectId: 3,
          qCount: 5,
          marks: 50,
          share: '50%',
        },
        {
          subject: 'Quantitative Math',
          subjectId: 3,
          qCount: 3,
          marks: 30,
          share: '30%',
        },
        {
          subject: 'English & Bangla',
          subjectId: 1,
          qCount: 2,
          marks: 20,
          share: '20%',
        },
      ],
    },
  },
  gas: {
    mcq: {
      stats: [
        { label: 'Total marks', value: '100' },
        { label: 'Duration', value: '60 min' },
        { label: 'Pass mark', value: '50%' },
        { label: 'Negative marking', value: '0.25' },
      ],
      rows: [
        {
          subject: 'Gas Science & Safety',
          subjectId: 3,
          qCount: 30,
          marks: 30,
          share: '30%',
        },
        {
          subject: 'Mathematical Reasoning',
          subjectId: 3,
          qCount: 25,
          marks: 25,
          share: '25%',
        },
        {
          subject: 'English',
          subjectId: 1,
          qCount: 20,
          marks: 20,
          share: '20%',
        },
        {
          subject: 'General Knowledge',
          subjectId: 2,
          qCount: 15,
          marks: 15,
          share: '15%',
        },
        {
          subject: 'Bangla',
          subjectId: 0,
          qCount: 10,
          marks: 10,
          share: '10%',
        },
      ],
    },
    written: {
      stats: [
        { label: 'Total marks', value: '100' },
        { label: 'Duration', value: '2 hours' },
        { label: 'Pass mark', value: '50%' },
        { label: 'Questions', value: '10' },
      ],
      rows: [
        {
          subject: 'Transmission Engineering & Safety',
          subjectId: 3,
          qCount: 5,
          marks: 50,
          share: '50%',
        },
        {
          subject: 'Applied Math & Logic',
          subjectId: 3,
          qCount: 3,
          marks: 30,
          share: '30%',
        },
        {
          subject: 'Language & GK',
          subjectId: 1,
          qCount: 2,
          marks: 20,
          share: '20%',
        },
      ],
    },
  },
  ntrc: {
    mcq: {
      stats: [
        { label: 'Total marks', value: '100' },
        { label: 'Duration', value: '60 min' },
        { label: 'Pass mark', value: '40%' },
        { label: 'Negative marking', value: '0.5' },
      ],
      rows: [
        {
          subject: 'Bangla',
          subjectId: 0,
          qCount: 25,
          marks: 25,
          share: '25%',
        },
        {
          subject: 'English',
          subjectId: 1,
          qCount: 25,
          marks: 25,
          share: '25%',
        },
        {
          subject: 'General Mathematics',
          subjectId: 3,
          qCount: 25,
          marks: 25,
          share: '25%',
        },
        {
          subject: 'General Knowledge',
          subjectId: 2,
          qCount: 25,
          marks: 25,
          share: '25%',
        },
      ],
    },
    written: {
      stats: [
        { label: 'Total marks', value: '100' },
        { label: 'Duration', value: '3 hours' },
        { label: 'Pass mark', value: '40%' },
        { label: 'Questions', value: '10' },
      ],
      rows: [
        {
          subject: 'Subject Specialized Test (School/College)',
          subjectId: 0,
          qCount: 10,
          marks: 100,
          share: '100%',
        },
      ],
    },
  },
  it: {
    mcq: {
      stats: [
        { label: 'Total marks', value: '100' },
        { label: 'Duration', value: '60 min' },
        { label: 'Pass mark', value: '50%' },
        { label: 'Negative marking', value: '0.25' },
      ],
      rows: [
        {
          subject: 'Computer Science & Programming',
          subjectId: 3,
          qCount: 50,
          marks: 50,
          share: '50%',
        },
        {
          subject: 'Mathematical Reasoning',
          subjectId: 3,
          qCount: 20,
          marks: 20,
          share: '20%',
        },
        {
          subject: 'English',
          subjectId: 1,
          qCount: 15,
          marks: 15,
          share: '15%',
        },
        {
          subject: 'General Knowledge',
          subjectId: 2,
          qCount: 15,
          marks: 15,
          share: '15%',
        },
      ],
    },
    written: {
      stats: [
        { label: 'Total marks', value: '100' },
        { label: 'Duration', value: '2 hours' },
        { label: 'Pass mark', value: '50%' },
        { label: 'Questions', value: '8' },
      ],
      rows: [
        {
          subject: 'Coding & System Architecture',
          subjectId: 3,
          qCount: 5,
          marks: 65,
          share: '65%',
        },
        {
          subject: 'Mathematical Reasoning',
          subjectId: 3,
          qCount: 3,
          marks: 35,
          share: '35%',
        },
      ],
    },
  },
};

function syllabusView() {
  const instData = SYLLABUS_DATA[selectedInstSyllabus] || SYLLABUS_DATA.bpsc;
  const currentData = instData[syllabusExamType] || instData.mcq;

  return `
    <div class="syllabus-view-wrap">
      <div class="syllabus-controls-row">
        <div class="syllabus-select-wrap">
          <select class="syllabus-inst-select" id="syllabus-inst-filter" aria-label="Select institution">
            ${INSTITUTES.map((inst) => `<option value="${inst.id}" ${selectedInstSyllabus === inst.id ? 'selected' : ''}>${esc(inst.name)}</option>`).join('')}
          </select>
          <span class="syllabus-select-arrow">⌵</span>
        </div>
        <div class="syllabus-type-toggle">
          <button class="syllabus-type-btn ${syllabusExamType === 'mcq' ? 'active' : ''}" data-action="toggle-syllabus-type" data-type="mcq">MCQ</button>
          <button class="syllabus-type-btn ${syllabusExamType === 'written' ? 'active' : ''}" data-action="toggle-syllabus-type" data-type="written">Written</button>
        </div>
      </div>

      <div class="syllabus-stats-row">
        ${currentData.stats
          .map(
            (st) => `
          <div class="syllabus-stat-col">
            <span class="syllabus-stat-label">${esc(st.label)}</span>
            <span class="syllabus-stat-val">${esc(st.value)}</span>
          </div>
        `,
          )
          .join('')}
      </div>

      <div class="syllabus-table-card">
        <div class="syllabus-table-header">
          <div class="syllabus-th th-subject">Subject</div>
          <div class="syllabus-th th-questions">Questions</div>
          <div class="syllabus-th th-marks">Marks</div>
          <div class="syllabus-th th-share">Share</div>
          <div class="syllabus-th th-action"></div>
        </div>
        <div class="syllabus-table-body">
          ${currentData.rows
            .map(
              (row) => `
            <div class="syllabus-table-row">
              <div class="syllabus-td td-subject">${esc(row.subject)}</div>
              <div class="syllabus-td td-questions">${row.qCount}</div>
              <div class="syllabus-td td-marks">${row.marks}</div>
              <div class="syllabus-td td-share">${row.share}</div>
              <div class="syllabus-td td-action">
                <button class="syllabus-practice-link" data-action="practice-subject" data-id="${row.subjectId}">Practice</button>
              </div>
            </div>
          `,
            )
            .join('')}
        </div>
      </div>

      <p class="syllabus-sample-note">Sample data. Replace with the official syllabus.</p>
    </div>
  `;
}
function searchView(qStr) {
  const term = qStr.toLowerCase().trim();
  const matchedSubjects = subjects.filter(
    (s, i) =>
      s.name.toLowerCase().includes(term) ||
      (s.bengali && s.bengali.toLowerCase().includes(term)),
  );
  const matchedChapters = [];
  const matchedTopics = [];
  const matchedQuestions = questions.filter(
    (q) =>
      q.text.toLowerCase().includes(term) ||
      q.options.some((o) => o.toLowerCase().includes(term)) ||
      q.explanation.toLowerCase().includes(term),
  );
  subjects.forEach((s, sIdx) => {
    s.chapters.forEach((c, cIdx) => {
      if (
        c.title.toLowerCase().includes(term) ||
        (c.english && c.english.toLowerCase().includes(term))
      ) {
        matchedChapters.push({ sIdx, cIdx, subject: s, chapter: c });
      }
      c.topics.forEach((t) => {
        if (
          t.name.toLowerCase().includes(term) ||
          (t.english && t.english.toLowerCase().includes(term))
        ) {
          matchedTopics.push({ sIdx, cIdx, subject: s, chapter: c, topic: t });
        }
      });
    });
  });
  const totalResults =
    matchedSubjects.length +
    matchedChapters.length +
    matchedTopics.length +
    matchedQuestions.length;
  if (!totalResults) {
    return `<div class="empty">
      <h3>No matches found for “${esc(qStr)}”</h3>
      <p>Try searching for topics like “সন্ধি”, “Grammar”, “শতকরা”, “বাংলাদেশ”, or “Literature”.</p>
      <button class="secondary" data-action="clear-search">Clear search</button>
    </div>`;
  }
  return `<div class="search-matches-header">
    <h3>Search Results for “${esc(qStr)}” (${formatNumber(totalResults)})</h3>
    <button class="text-button" data-action="clear-search">Clear filter</button>
  </div>
  ${
    matchedTopics.length
      ? `
    <div class="section-heading"><h2>Matched Topics (${matchedTopics.length})</h2></div>
    <div class="panel" style="padding:0;overflow:hidden">
      ${matchedTopics
        .map(
          ({ sIdx, cIdx, subject, chapter, topic }) => `
        <div class="topic-row">
          <div class="topic-info">
            <span class="topic-bullet"></span>
            <div class="topic-details">
              <b>${esc(topic.name)}</b>
              <small>${esc(subject.short)} › ${esc(chapter.title)}</small>
            </div>
          </div>
          <button class="primary topic-btn" data-action="practice-topic" data-subject="${sIdx}" data-topic="${esc(topic.name)}">Practice Topic</button>
        </div>
      `,
        )
        .join('')}
    </div>
  `
      : ''
  }
  ${
    matchedChapters.length
      ? `
    <div class="section-heading"><h2>Matched Chapters (${matchedChapters.length})</h2></div>
    <div class="chapters-container">
      ${matchedChapters.map(({ sIdx, cIdx, chapter }) => chapterRow(sIdx, chapter, cIdx)).join('')}
    </div>
  `
      : ''
  }
  ${
    matchedQuestions.length
      ? `
    <div class="section-heading"><h2>Matched Questions (${matchedQuestions.length})</h2></div>
    <div class="panel">
      ${matchedQuestions
        .map(
          (q) => `
        <div class="review-row row between">
          <div>
            <span class="tag">${esc(subjects[q.subject].short)} · ${esc(subjects[q.subject].chapters[q.chapter]?.title || '')} › ${esc(q.topic)}</span>
            <h3 style="margin-top:9px">${esc(q.text)}</h3>
          </div>
          <button class="secondary" data-action="single" data-id="${q.id}">Practice</button>
        </div>
      `,
        )
        .join('')}
    </div>
  `
      : ''
  }`;
}
function getWeakPoints(all = false) {
  const topicStats: Record<string, WeakPoint> = {};
  state.attempts.forEach((a) => {
    const q = questions[a.id];
    if (!q) return;
    const key = `${q.subject}-${q.topic}`;
    if (!topicStats[key]) {
      const s = subjects[q.subject];
      const chap = s?.chapters[q.chapter]?.title || 'ব্যাকরণ ও ধ্বনিতত্ত্ব';
      topicStats[key] = {
        subjectId: q.subject,
        subjectName: s?.short || 'Bangla',
        chapTitle: chap,
        topicName: q.topic,
        total: 0,
        correct: 0,
      };
    }
    topicStats[key].total++;
    if (a.correct) topicStats[key].correct++;
  });
  const weak = Object.values(topicStats).filter((t) => t.correct < t.total);
  if (weak.length) return all ? weak : weak.slice(0, 2);
  if (apiEnabled && apiReady) return [];
  const sample = [
    {
      subjectId: 0,
      subjectName: 'Bangla',
      chapTitle: 'আধুনিক ব্যাকরণ',
      topicName: 'সন্ধি',
      total: 2,
      correct: 0,
    },
    {
      subjectId: 0,
      subjectName: 'Bangla',
      chapTitle: 'ব্যাকরণ ও ধ্বনিতত্ত্ব',
      topicName: 'ধ্বনি ও বর্ণ',
      total: 1,
      correct: 0,
    },
    {
      subjectId: 1,
      subjectName: 'English',
      chapTitle: 'Grammar & Usage',
      topicName: 'Subject-Verb Agreement',
      total: 3,
      correct: 1,
    },
    {
      subjectId: 2,
      subjectName: 'GK',
      chapTitle: 'বাংলাদেশ বিষয়াবলী',
      topicName: 'সংবিধান ও প্রশাসনিক কাঠামো',
      total: 2,
      correct: 0,
    },
  ];
  return all ? sample : sample.slice(0, 2);
}

const INSTITUTES = [
  {
    id: 'bank',
    name: 'Bank',
    icon: '🏦',
    dept: 'Combined 9 Banks, BB, Sonali, Janata, Agrani',
    tag: 'Govt & Private',
    count: '1,850+',
    pattern:
      '100 Marks MCQ: Math (30), English (20), Bangla (15), GK (15), ICT (20)',
    subjects: ['Math', 'English', 'ICT', 'GK', 'Bangla'],
    bg: '#eff6ff',
    border: '#bfdbfe',
    color: '#1d4ed8',
    badgeBg: '#e0f2fe',
    badgeColor: '#0369a1',
    syllabusBreakdown: [
      {
        subject: 'Quantitative Aptitude & Math',
        marks: '30 Marks',
        topics: [
          'Arithmetic (Profit-Loss, Percentage, Ratio, Simple & Compound Interest, Work-Time)',
          'Algebra & Equation Solving (Linear & Quadratic, Surds, Indices)',
          'Number Systems & Divisibility Rules',
          'Geometry & Mensuration (Triangles, Circles, Quadrilaterals)',
          'Data Interpretation, Series & Critical Problem Solving',
        ],
      },
      {
        subject: 'English Language & Comprehension',
        marks: '20 Marks',
        topics: [
          'Vocabulary Mastery (Synonyms, Antonyms, One Word Substitution)',
          'Sentence Correction, Error Finding & Grammar Foundations',
          'Analogy, Idiomatic Expressions & Phrasal Verbs',
          'Cloze Test & Fill in the Blanks',
          'Reading Comprehension Passages & Logical Deducing',
        ],
      },
      {
        subject: 'ICT & Computer Knowledge',
        marks: '20 Marks',
        topics: [
          'Computer Hardware Architecture & Memory Hierarchy',
          'Operating Systems & File Management Basics',
          'Database Management Systems (DBMS) & SQL Syntax',
          'Data Communication, Networking Topologies & Protocols',
          'Cybersecurity Basics, Banking Tech & Office Productivity',
        ],
      },
      {
        subject: 'General Knowledge & Banking Affairs',
        marks: '15 Marks',
        topics: [
          'Bangladesh Economy, GDP, National Budget & Export-Import',
          'Central Banking, Monetary Policy & Financial Regulation',
          'Commercial Banks, Capital Markets & Non-Bank Institutions',
          'Recent Global Geopolitics & Economic Developments',
        ],
      },
      {
        subject: 'Bangla Language & Literature',
        marks: '15 Marks',
        topics: [
          'Bengali Grammar (Sandhi, Samas, Karok, Natwa-Shatwa Vidhan)',
          'Vocabulary, Bagdhara, Proverbs & Shabda Shuddhi',
          'Translation (English to Bengali)',
          'Bengali Literary Eras & Major Classical Writers',
        ],
      },
    ],
  },
  {
    id: 'bpsc',
    name: 'BPSC',
    icon: '🏛️',
    dept: 'BCS Preliminary, Non-Cadre & PSC Exams',
    tag: 'Cadre & Non-Cadre',
    count: '2,500+',
    pattern:
      '200 Marks MCQ: Bangla (35), English (35), BD Affairs (30), Int. (20), Math (15), Mental Ability (15), Science (15), ICT (15), Geography (10), Ethics (10)',
    subjects: ['Bangla', 'English', 'GK', 'Math', 'Science', 'ICT'],
    bg: '#ecfdf5',
    border: '#a7f3d0',
    color: '#065f46',
    badgeBg: '#d1fae5',
    badgeColor: '#047857',
    syllabusBreakdown: [
      {
        subject: 'Bangla Language & Literature',
        marks: '35 Marks',
        topics: [
          'Ancient & Medieval Age Literature (Charyapada, Vaishnava Padavali, Mangalkavya)',
          'Modern Era Literature (Tagore, Nazrul, 19th–20th Century Pioneers)',
          'Grammar (Phonetics, Words, Samas, Sandhi, Prefixes & Suffixes)',
          'Spelling Correction, Idioms & Linguistic Principles',
        ],
      },
      {
        subject: 'English Language & Literature',
        marks: '35 Marks',
        topics: [
          'Parts of Speech, Clauses, Subject-Verb Agreement & Tense',
          'Vocabulary, Idioms, Phrases & One Word Substitution',
          'English Literary Eras (Elizabethan, Romantic, Victorian, Modern)',
          'Famous Writers, Dramas, Poetry, Characters & Quotations',
        ],
      },
      {
        subject: 'Bangladesh Affairs',
        marks: '30 Marks',
        topics: [
          'Liberation War History, 1952 Language Movement, 1971 Milestones',
          'Constitution of Bangladesh, Judiciary, Legislature & Executive',
          'National Economy, Annual Development Programme & Megaprojects',
          'Demography, Agriculture, Society, Culture & Natural Resources',
        ],
      },
      {
        subject: 'International Affairs',
        marks: '20 Marks',
        topics: [
          'Global Geopolitics, Regional Alliances & Treaties',
          'International Organizations (UN, World Bank, IMF, SAARC, ASEAN)',
          'World Geography, Environmental Treaties & Global Climate Summits',
          'Current International News & Geostrategic Affairs',
        ],
      },
      {
        subject: 'Mathematical Reasoning & Mental Ability',
        marks: '30 Marks',
        topics: [
          'Arithmetic, Number Systems, Ratio, Profit-Loss & Percentage',
          'Algebraic Formulae, Exponents, Logarithms & Set Theory',
          'Geometry, Vectors & Mensuration',
          'Verbal Reasoning, Spatial Problem Solving & Numerical Series',
        ],
      },
      {
        subject: 'General Science & ICT',
        marks: '30 Marks',
        topics: [
          'Physical Science (Light, Sound, Electricity & Mechanics)',
          'Biological Sciences (Human Anatomy, Nutrition & Pathogens)',
          'Computer Hardware, Operating Systems & Networks',
          'Internet, Cyber Security & Modern Technologies (Cloud, AI)',
        ],
      },
    ],
  },
  {
    id: 'power',
    name: 'Power Sector',
    icon: '⚡',
    dept: 'BPDB, DESCO, DPDC, PGCB, APSCL, NWPGCL',
    tag: 'Power & Energy',
    count: '920+',
    pattern:
      '100 Marks MCQ: Technical/Science (40), Analytical & Math (20), English (15), GK & Power Sector (15), Bangla (10)',
    subjects: ['Science', 'Math', 'GK', 'English', 'ICT'],
    bg: '#fffbeb',
    border: '#fde68a',
    color: '#b45309',
    badgeBg: '#fef3c7',
    badgeColor: '#92400e',
    syllabusBreakdown: [
      {
        subject: 'Basic Electrical Science & Tech',
        marks: '40 Marks',
        topics: [
          'Electric Circuit Theory, Ohm’s Law, Kirchhoff’s Laws & AC/DC Fundamentals',
          'Electrical Power Generation, Substation Equipment & Transformers',
          'Power Transmission Lines, Distribution Networks & Grid Management',
          'Renewable Energy, Solar Power, Nuclear Power & Energy Storage',
        ],
      },
      {
        subject: 'Analytical Reasoning & Math',
        marks: '20 Marks',
        topics: [
          'Quantitative Problem Solving, Ratios, Speed-Distance & Work-Time',
          'Equations, Mensuration & Practical Trigonometry',
          'Logical Sequencing, Analytical Reasoning & Number Patterns',
        ],
      },
      {
        subject: 'Power Sector GK & National Affairs',
        marks: '15 Marks',
        topics: [
          'Bangladesh Power Sector Master Plan & Generation Capacity',
          'Rooppur Nuclear Project, Payra, Matarbari & Mega Power Projects',
          'BPDB, PGCB, DESCO, DPDC Structure & Key Mandates',
          'Recent National & Global Energy Developments',
        ],
      },
      {
        subject: 'General English',
        marks: '15 Marks',
        topics: [
          'Grammar Accuracy, Prepositions, Voice & Narration',
          'Technical & General Vocabulary, Common Idioms',
          'Sentence Completion & Error Identification',
        ],
      },
      {
        subject: 'General Bangla',
        marks: '10 Marks',
        topics: [
          'Bangla Grammar Basics, Spellings & Word Formatting',
          'Official Terminology & Sentence Construction',
        ],
      },
    ],
  },
  {
    id: 'wasa',
    name: 'WASA',
    icon: '💧',
    dept: 'Dhaka WASA, Chattogram WASA, Rajshahi WASA',
    tag: 'Water & Utilities',
    count: '540+',
    pattern:
      '100 Marks MCQ: Utilities/Science (30), Math (20), English (20), GK (15), Bangla (15)',
    subjects: ['Bangla', 'English', 'Math', 'Science', 'GK'],
    bg: '#f0f9ff',
    border: '#bae6fd',
    color: '#0284c7',
    badgeBg: '#e0f2fe',
    badgeColor: '#075985',
    syllabusBreakdown: [
      {
        subject: 'Water Utilities & Environmental Science',
        marks: '30 Marks',
        topics: [
          'Water Treatment Technologies, Filtration, Chlorination & Desalination',
          'Pipes, Valves, Pumps & Hydraulic Flow Basics',
          'Sanitation Engineering, Drainage Systems & Waste Management',
          'Environmental Science, Groundwater Depletion & Water Quality Metrics',
        ],
      },
      {
        subject: 'General Mathematics',
        marks: '20 Marks',
        topics: [
          'Elementary Arithmetic, Unitary Method, Percentage & Ratio',
          'Simple Geometry, Pipe & Cistern Problems, Work-Time Calculation',
          'Linear Equations & Measurement Calculations',
        ],
      },
      {
        subject: 'General English',
        marks: '20 Marks',
        topics: [
          'Grammar Principles, Subject-Verb Agreement & Tense',
          'Vocabulary, Synonyms, Antonyms & Spelling Corrections',
          'Reading Comprehension & Translation Exercises',
        ],
      },
      {
        subject: 'General Knowledge & Delta Plan',
        marks: '15 Marks',
        topics: [
          'Bangladesh Delta Plan 2100 & Riverine Geography',
          'SDG 6 (Clean Water and Sanitation) & Urban Development',
          'National History, Liberation War & Recent Current Affairs',
        ],
      },
      {
        subject: 'Bangla Language',
        marks: '15 Marks',
        topics: [
          'Spelling Rules (Bangla Academy), Grammar & Bagdhara',
          'Formal Drafting Vocabulary & Sentence Structure',
        ],
      },
    ],
  },
  {
    id: 'petrobangla',
    name: 'Petro Bangla',
    icon: '⛽',
    dept: 'Petrobangla, BAPEX, BPC, RPGCL, Minerals',
    tag: 'Oil, Gas & Minerals',
    count: '780+',
    pattern:
      '100 Marks MCQ: Energy Science & Geology (30), Math (25), English (20), GK (15), Bangla (10)',
    subjects: ['Science', 'GK', 'Math', 'English', 'Bangla'],
    bg: '#f0fdfa',
    border: '#99f6e4',
    color: '#0f766e',
    badgeBg: '#ccfbf1',
    badgeColor: '#115e59',
    syllabusBreakdown: [
      {
        subject: 'Hydrocarbon & Geology Science',
        marks: '30 Marks',
        topics: [
          'Natural Gas Composition, Petroleum Refining & Fractional Distillation',
          'Geological Formations of Bangladesh & Mineral Resources',
          'BAPEX Exploration Projects, Offshore Drilling & LNG Basics',
          'Safety Norms, Thermodynamics & Chemical Fundamentals',
        ],
      },
      {
        subject: 'Quantitative Aptitude & Math',
        marks: '25 Marks',
        topics: [
          'Algebra, Quadratic Equations, Logarithms & Indices',
          'Commercial Arithmetic, Percentage, Speed, Distance & Work',
          'Applied Mensuration, Volume & Surface Area Calculations',
        ],
      },
      {
        subject: 'General English',
        marks: '20 Marks',
        topics: [
          'Sentence Completion, Modifiers & Appropriate Prepositions',
          'Synonyms, Antonyms, Word Origins & Technical English',
          'Comprehension of Technical & Analytical Passages',
        ],
      },
      {
        subject: 'Energy Sector GK & BD Affairs',
        marks: '15 Marks',
        topics: [
          'History of Oil & Gas Exploration in Bangladesh',
          'Key Gas Fields (Bibiyana, Titas, Rashidpur) & Reserves',
          'Energy Security, Import Policies & National Current Affairs',
        ],
      },
      {
        subject: 'General Bangla',
        marks: '10 Marks',
        topics: ['Bangla Grammar, Vocabulary, Sandhi & Samas'],
      },
    ],
  },
  {
    id: 'gas',
    name: 'GAS Sector',
    icon: '🔥',
    dept: 'Titas, KGDCL, Bakhrabad, Jalalabad, BGDCL',
    tag: 'Gas Transmission',
    count: '620+',
    pattern:
      '100 Marks MCQ: Transmission Engineering (30), Math (25), English (20), GK (15), Bangla (10)',
    subjects: ['Science', 'Math', 'Bangla', 'English', 'GK'],
    bg: '#fff1f2',
    border: '#fecdd3',
    color: '#be123c',
    badgeBg: '#ffe4e6',
    badgeColor: '#9f1239',
    syllabusBreakdown: [
      {
        subject: 'Gas Transmission Science & Safety',
        marks: '30 Marks',
        topics: [
          'Gas Pipelines, Valves, Metering Systems & Regulators',
          'Fluid Mechanics, Pressure Dynamics & Compressors',
          'Fire Safety Standards, Leak Detection & Hazard Management',
          'Industrial vs. Domestic Gas Distribution Systems',
        ],
      },
      {
        subject: 'Mathematical Aptitude',
        marks: '25 Marks',
        topics: [
          'Arithmetic Problem Solving, Ratios & Percentages',
          'Algebra, Geometric Progressions & Coordinate Math',
          'Numerical Ability, Logic & Estimation',
        ],
      },
      {
        subject: 'General English',
        marks: '20 Marks',
        topics: [
          'English Grammar, Tense, Voice & Sentence Correction',
          'Vocabulary, Idioms & Everyday Professional Expressions',
        ],
      },
      {
        subject: 'Gas Sector GK & National Affairs',
        marks: '15 Marks',
        topics: [
          'Gas Distribution Companies (Titas, Bakhrabad, Jalalabad, Karnaphuli)',
          'Tariff Regulations, Energy Policies & Bangladesh Economy',
        ],
      },
      {
        subject: 'General Bangla',
        marks: '10 Marks',
        topics: ['Standard Bangla Spelling, Grammar & Official Terms'],
      },
    ],
  },
  {
    id: 'ntrc',
    name: 'NTRC',
    icon: '🎓',
    dept: '15th–18th School & College Teacher Registration',
    tag: 'Teacher Registration',
    count: '1,200+',
    pattern:
      '100 Marks Preliminary: Bangla (25), English (25), Math (25), General Knowledge (25)',
    subjects: ['Bangla', 'English', 'Math', 'GK'],
    bg: '#faf5ff',
    border: '#e9d5ff',
    color: '#7e22ce',
    badgeBg: '#f3e8ff',
    badgeColor: '#6b21a8',
    syllabusBreakdown: [
      {
        subject: 'Bangla Language & Literature',
        marks: '25 Marks',
        topics: [
          'Grammar (15 Marks): Bhasha, Dhoni, Shobdo, Sandhi, Karok, Samas, Natwa-Shatwa, Protyoy, Bagdhara',
          'Literature (10 Marks): Classical & Modern Poets, Novelists, Dramatists and Literary Eras',
        ],
      },
      {
        subject: 'English Language',
        marks: '25 Marks',
        topics: [
          'Grammar (15 Marks): Parts of Speech, Tense, Voice, Narration, Modifiers, Subject-Verb Agreement',
          'Vocabulary & Usage (10 Marks): Synonyms, Antonyms, Idioms, Phrases & Sentence Completion',
        ],
      },
      {
        subject: 'General Mathematics',
        marks: '25 Marks',
        topics: [
          'Arithmetic (10 Marks): Unitary Method, Percentage, Profit-Loss, Ratio, Interest',
          'Algebra (8 Marks): Formulae, Factors, Equations, Indices & Logarithms',
          'Geometry (7 Marks): Theorems, Angles, Triangles, Circles & Mensuration',
        ],
      },
      {
        subject: 'General Knowledge',
        marks: '25 Marks',
        topics: [
          'Bangladesh Affairs (10 Marks): History, Liberation War, Culture, Geography',
          'International Affairs (10 Marks): Geopolitics, UN & Global Affairs',
          'Science, ICT & Environment (5 Marks): Elementary Science, Everyday Computer & Ecology',
        ],
      },
    ],
  },
  {
    id: 'it',
    name: 'Others IT',
    icon: '💻',
    dept: 'Software Engineers, Programmers, Network & Hardware',
    tag: 'ICT & Technology',
    count: '860+',
    pattern:
      '100 Marks MCQ: Computer Science & IT (50), Analytical Math (20), English (15), General Studies (15)',
    subjects: ['ICT', 'Math', 'English', 'Science'],
    bg: '#f8fafc',
    border: '#cbd5e1',
    color: '#334155',
    badgeBg: '#e2e8f0',
    badgeColor: '#1e293b',
    syllabusBreakdown: [
      {
        subject: 'Core Computer Science & Programming',
        marks: '50 Marks',
        topics: [
          'Data Structures (Arrays, Linked Lists, Stacks, Queues, Trees, Graphs)',
          'Algorithms (Sorting, Searching, Greedy, Dynamic Programming)',
          'Object Oriented Programming Concepts (OOP, C++, Java, Python)',
          'Relational Databases, Normalization, SQL Queries & Transactions',
          'Operating Systems, Process Scheduling, Threads & Memory Management',
          'Computer Networks (OSI Model, TCP/IP, Routing, DNS, HTTP/HTTPS)',
        ],
      },
      {
        subject: 'Analytical Reasoning & Discrete Math',
        marks: '20 Marks',
        topics: [
          'Discrete Mathematics, Propositional Logic & Set Theory',
          'Permutations, Combinations & Probability',
          'Number Systems, Binary Arithmetic & Boolean Algebra',
          'Analytical & Algorithmic Problem Solving',
        ],
      },
      {
        subject: 'Technical English',
        marks: '15 Marks',
        topics: [
          'Technical Documentation Comprehension & Vocabulary',
          'Sentence Structure, Error Correction & Grammar',
          'Professional Communication & Clear Expression',
        ],
      },
      {
        subject: 'General Studies & Tech Trends',
        marks: '15 Marks',
        topics: [
          'Cloud Computing (AWS/Azure/GCP Basics), Docker & Microservices',
          'Information Security, Cryptography & Cyber Laws in Bangladesh',
          'Recent National Tech Initiatives & Digital Governance',
        ],
      },
    ],
  },
];

function openInstituteModal(instId) {
  if (apiEnabled) {
    toast("This institution card is not linked to the API catalogue yet. Use Previous Questions filters.");
    return;
  }
  paperInstitute = instId;
  paperPost = '';
  paperYear = '';
  navigate('papers');
}

function home() {
  const count = todayAttempts().length;
  const target = goal();
  const weakList = getWeakPoints(showMoreWeak);
  const dueCount = due().length;

  const affairsList = apiEnabled && apiReady ? apiAffairHeadlines : [
    {
      title: 'Sample headline: national budget highlights',
      meta: 'Today · Economy',
    },
    {
      title: 'Sample headline: new international agreement signed',
      meta: 'Yesterday · World',
    },
    {
      title: 'Sample headline: national sports achievement',
      meta: '2 days ago · Sports',
    },
    {
      title: 'Sample headline: renewable energy infrastructure milestone',
      meta: '3 days ago · Environment',
    },
    {
      title: 'Sample headline: literary award recipients announced',
      meta: '4 days ago · Culture',
    },
    {
      title: 'Sample headline: central bank updates inflation policy',
      meta: '5 days ago · Economy',
    },
  ];
  const displayAffairs = showMoreAffairs
    ? affairsList
    : affairsList.slice(0, 3);

  const noticesList = apiEnabled && apiReady ? apiNotices : [
    { title: 'Mock test this Friday', meta: 'Bangla & English · 10:00 AM' },
    { title: 'New questions added', meta: 'General Knowledge · 8 questions' },
    { title: 'Revision reminder', meta: '2 questions are due today' },
    { title: 'Routine updated', meta: 'Check your weekly plan' },
    { title: 'Community study session', meta: 'Saturday · 8:00 PM' },
    { title: 'Monthly leaderboard announced', meta: 'Top streak performers' },
  ];
  const displayNotices = showMoreNotices
    ? noticesList
    : noticesList.slice(0, 4);

  return `
    <div class="home-layout">
      <div class="home-main">
        <div class="home-section-title" style="margin-top:0">Today's ${target}</div>
        <div class="card home-task-card">
          <div class="home-task-left">
            <h3>${formatNumber(count)} of ${formatNumber(target)} done</h3>
            <p class="muted" style="margin:2px 0 0">About ${state.profile.minutes || 30} min · <button class="link-btn" data-action="short">Short on time? Try 5 questions</button></p>
          </div>
          <button class="green-btn" data-action="${state.session ? 'resume' : 'daily'}">${state.session ? 'Continue' : count >= target ? 'Practice more' : 'Continue'}</button>
        </div>

        <div class="home-section-title">Weak points</div>
        <div class="card home-list-card">
          ${weakList
            .map(
              (w) => `
            <div class="home-list-row row sp">
              <div>
                <h4>${esc(w.topicName)}</h4>
                <div class="muted">${esc(w.subjectName)} · ${esc(w.chapTitle)}</div>
              </div>
              <div class="row" style="gap:14px">
                <span class="weak-stat">${w.correct} of ${w.total} correct</span>
                <button class="link-action-btn" data-action="practice-topic" data-subject="${w.subjectId}" data-topic="${esc(w.topicName)}">Practice</button>
              </div>
            </div>
          `,
            )
            .join('')}
          <button class="card-see-more-row" data-action="toggle-weak">${showMoreWeak ? 'Show less' : 'See more'}</button>
        </div>

        <div class="home-section-title">Revision and routine</div>
        <div class="card home-task-card">
          <div>
            <h3>${formatNumber(apiEnabled && apiReady ? dueCount : dueCount || 2)} questions due for review</h3>
            <p class="muted" style="margin:2px 0 0">Strengthen your concepts</p>
          </div>
          <button class="link-action-btn" data-action="navigate" data-page="review">Open revision</button>
        </div>

        <div class="home-section-title">Current affairs</div>
        <div class="card home-list-card">
          ${displayAffairs
            .map(
              (a) => `
            <div class="home-list-row">
              <h4>${esc(a.title)}</h4>
              <div class="muted">${esc(a.meta)}</div>
            </div>
          `,
            )
            .join('')}
          <button class="card-see-more-row" data-action="toggle-affairs">${showMoreAffairs ? 'Show less' : 'See more'}</button>
        </div>

        <div class="home-section-title">Explore by institution</div>
        <div class="institute-grid">
          ${INSTITUTES.map(
            (inst) => `
            <button class="inst-minimal-card" data-action="institute-select" data-inst="${inst.id}">
              <div class="inst-minimal-content">
                <div class="inst-minimal-title">${esc(inst.name)}</div>
                <div class="inst-minimal-dept">${esc(inst.dept)}</div>
              </div>
              <div class="inst-minimal-divider"></div>
              <div class="inst-minimal-meta">${esc(inst.tag)} · ${inst.count} questions</div>
            </button>
          `,
          ).join('')}
        </div>
      </div>

      <div class="home-aside">
        <div class="home-section-title" style="margin-top:0">Notices</div>
        <div class="card home-list-card">
          ${displayNotices
            .map(
              (n) => `
            <div class="home-list-row">
              <h4>${esc(n.title)}</h4>
              <div class="muted">${esc(n.meta)}</div>
            </div>
          `,
            )
            .join('')}
          <button class="card-see-more-row" data-action="toggle-notices">${showMoreNotices ? 'Show less' : 'See more'}</button>
        </div>

        <div class="card ad-card">
          <span class="ad-tag">Sponsored</span>
          <h3>Ad space</h3>
          <p class="muted">Your ad or partner offer appears here</p>
        </div>
      </div>
    </div>
  `;
}
function bank() {
  if (selectedSubject !== null) return subjectDetailView(selectedSubject);
  if (search.trim()) {
    return (
      `<div class="bank-wrap">
      <div class="bank-header">
        <h1 class="bank-title">Question bank</h1>
        <p class="bank-subtitle">Search questions, topics and chapters.</p>
      </div>
      <div class="bank-toolbar">
        <input class="bank-search-input" id="search" aria-label="Search questions and topics" placeholder="Search subjects, chapters, topics" value="${esc(search)}">
        <div class="bank-select-wrap">
          <select class="bank-select" id="subject-filter" aria-label="Choose a subject">
            <option value="all">All subjects</option>
            ${subjects.map((s, i) => `<option value="${i}" ${Number(filter) === i ? 'selected' : ''}>${esc(s.short)}</option>`).join('')}
          </select>
          <span class="bank-select-arrow">⌵</span>
        </div>
      </div>` +
      searchView(search) +
      `</div>`
    );
  }
  let list = subjects
    .map((s, i) => ({ s, i }))
    .filter(({ s, i }) => filter === 'all' || +filter === i);
  return `<div class="bank-wrap">
    <div class="bank-header">
      <h1 class="bank-title">Question bank</h1>
      <p class="bank-subtitle">Choose a subject to practice.</p>
    </div>
    <div class="bank-tabs">
      <a class="bank-tab" href="#exam-preparation">Exam-wise</a>
      <a class="bank-tab" href="#papers">Previous Questions</a>
      <button class="bank-tab ${bankTab === 'subjects' ? 'active' : ''}" data-action="bank-tab" data-id="subjects">By subject</button>
      <button class="bank-tab ${bankTab === 'syllabus' ? 'active' : ''}" data-action="bank-tab" data-id="syllabus">Full syllabus</button>
      <button class="bank-tab ${bankTab === 'papers' ? 'active' : ''}" data-action="bank-tab" data-id="papers">Mock test</button>
    </div>
    ${
      bankTab === 'subjects'
        ? `
      <div class="bank-toolbar">
        <input class="bank-search-input" id="search" aria-label="Search questions and topics" placeholder="Search subjects, chapters, topics" value="${esc(search)}">
        <div class="bank-select-wrap">
          <select class="bank-select" id="subject-filter" aria-label="Choose a subject">
            <option value="all">All subjects</option>
            ${subjects.map((s, i) => `<option value="${i}" ${Number(filter) === i ? 'selected' : ''}>${esc(s.short)}</option>`).join('')}
          </select>
          <span class="bank-select-arrow">⌵</span>
        </div>
      </div>
      <div class="bank-grid">
        ${list.length ? list.map(({ s, i }) => subjectCard(s, i)).join('') : '<div class="empty"><h3>No subjects found</h3></div>'}
      </div>
    `
        : bankTab === 'syllabus'
          ? syllabusView()
          : `
      <div class="panel">
        <span class="chip">Demo model test</span>
        <h2 style="margin-top:16px">Put your preparation to the test</h2>
        <p class="muted">Mixed questions from all subjects & chapters · 10 minutes · 1 point per correct answer<br>No negative marking in this demo. Explanations appear after the test.</p>
        <button class="primary" data-action="exam">Start mock test</button>
      </div>
    `
    }</div>`;
}
function review() {
  const dueIds = due();
  const allMistakeIds = Object.keys(state.reviews).map(Number);
  const savedIds = state.saved;
  let ids =
    reviewTab === 'saved'
      ? savedIds
      : reviewTab === 'all'
        ? allMistakeIds
        : dueIds;

  const tabs = [
    { id: 'due', label: `Due today · ${formatNumber(dueIds.length)}` },
    {
      id: 'all',
      label: `All mistakes · ${formatNumber(allMistakeIds.length)}`,
    },
    { id: 'saved', label: `Saved · ${formatNumber(savedIds.length)}` },
  ];

  return `
    <div class="revision-wrap">
      <div class="revision-header">
        <div>
          <h1 class="revision-title">Revision</h1>
        </div>
        ${ids.length ? `<button class="green-btn" data-action="review-start">Practice all</button>` : ''}
      </div>

      <div class="revision-tabs" role="tablist">
        ${tabs
          .map(
            (t) => `
          <button class="revision-tab ${reviewTab === t.id ? 'active' : ''}" data-action="review-tab" data-id="${t.id}" role="tab" aria-selected="${reviewTab === t.id}">
            ${t.label}
          </button>
        `,
          )
          .join('')}
      </div>

      ${
        ids.length
          ? `
        <div class="card revision-card">
          ${ids
            .map((id) => {
              const q = questions[id];
              if (!q) return '';
              const s = subjects[q.subject];
              return `
              <div class="revision-row">
                <div class="revision-row-content">
                  <div class="revision-row-tag">${esc(s ? s.short : 'Bangla')} · ${esc(q.topic)}</div>
                  <div class="revision-row-text">${esc(q.text)}</div>
                </div>
                <button class="revision-practice-btn" data-action="single" data-id="${id}">Practice</button>
              </div>
            `;
            })
            .join('')}
        </div>
      `
          : `
        <div class="card empty" style="border-radius:12px;padding:36px 20px;text-align:center">
          <div style="font-size:32px;color:var(--acc);margin-bottom:8px">✓</div>
          <h3 style="font-size:17px;font-weight:700;margin-bottom:6px">${reviewTab === 'saved' ? 'No saved questions yet' : reviewTab === 'due' ? 'All caught up for today' : 'No mistakes recorded yet'}</h3>
          <p class="muted" style="font-size:14px;max-width:380px;margin:0 auto 16px">${reviewTab === 'saved' ? 'Tap the bookmark icon during practice to save questions for later revision.' : reviewTab === 'due' ? 'Questions you miss during practice will appear here when due for review.' : 'Questions you get wrong or mark as guessed will be collected here.'}</p>
          <button class="green-btn" data-action="daily">Start practicing</button>
        </div>
      `
      }

      ${
        state.reports && state.reports.length
          ? `
        <div class="section-heading" style="margin-top:28px"><h2>Your demo reports</h2></div>
        <div class="card revision-card">
          ${state.reports
            .map(
              (r) => `
            <div class="revision-row">
              <div class="revision-row-content">
                <b style="font-size:15px;color:var(--ink)">${esc(r.type)}</b>
                <p class="muted" style="margin:4px 0 0;font-size:13.5px">${esc(r.detail || questions[r.id]?.text || '')}</p>
              </div>
              <span class="tag">Saved in this browser</span>
            </div>
          `,
            )
            .join('')}
        </div>
      `
          : ''
      }
    </div>
  `;
}
function progress() {
  let days = [];
  for (let i = 6; i >= 0; i--) {
    let d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      count: state.attempts.filter((a) => a.day === dayKey(d)).length,
    });
  }
  let max = Math.max(5, ...days.map((d) => d.count));
  return (
    heading('Your progress') +
    studyCalendar() +
    stats() +
    `<div class="progress-grid"><div class="panel"><h2>Practice this week</h2><p class="fine">Questions answered each day</p><div class="chart">${days.map((d) => `<div class="chart-col"><b>${formatNumber(d.count)}</b><i style="height:${(d.count / max) * 120}px"></i><span>${d.label}</span></div>`).join('')}</div></div><div class="panel"><h2>Accuracy by subject</h2>${subjects
      .map((s, i) => {
        let a = state.attempts.filter((a) => questions[a.id].subject === i);
        return `<div class="progress-topic"><div class="row between"><span>${esc(s.short)}</span><b>${a.length ? formatNumber(accuracy(a)) + '%' : '—'}</b></div><div class="bar" style="margin-top:8px"><i style="width:${accuracy(a)}%"></i></div><span class="fine">${formatNumber(a.length)} answers${a.length < 5 ? ' · More practice needed' : ''}</span></div>`;
      })
      .join(
        '',
      )}</div></div><div class="section-heading"><h2>Recent practice</h2></div>${
      state.attempts.length
        ? `<div class="panel">${state.attempts
            .slice(-6)
            .reverse()
            .map(
              (a) =>
                `<div class="review-row row between"><div><h3>${esc(questions[a.id].text)}</h3><span class="fine">${esc(subjects[questions[a.id].subject].short)} · ${new Date(a.at).toLocaleDateString('en-GB')}</span></div><span class="tag ${a.correct ? '' : 'amber'}">${a.correct ? 'Correct' : a.choice === null ? 'Skipped' : 'Review again'}</span></div>`,
            )
            .join('')}</div>`
        : '<div class="empty"><h3>Your first chapter starts here</h3><p>Complete a practice session to see your results here.</p><button class="primary" data-action="daily">Start your first session</button></div>'
    }`
  );
}
function getAnswer(qId) {
  if (!state.session || !state.session.answers) return null;
  const ans = state.session.answers;
  if (Array.isArray(ans)) return ans.find((a) => a.id === qId) || null;
  return ans[qId] || null;
}
function answerQuestion(qId, choice) {
  if (apiEnabled) return answerApiQuestion(qId, choice);
  const s = state.session;
  if (!s) return;
  if (!s.answers || Array.isArray(s.answers)) {
    s.answers = Array.isArray(s.answers)
      ? Object.fromEntries(s.answers.map((x) => [x.id, x]))
      : {};
  }
  if (s.mode !== 'exam' && s.answers[qId]) return;
  const q = questions[qId];
  if (!q) return;
  const a = {
    id: qId,
    choice,
    correct: choice === q.answer,
    guess: false,
    at: Date.now(),
    day: dayKey(),
  };
  s.answers[qId] = a;
  if (s.mode !== 'exam') record(a);
  save();
  render();
}
function start(ids, title, mode = 'practice', options: ApiStartOptions = {}): void | Promise<boolean> {
  if (apiEnabled) return startApiSession(ids, title, mode, options);
  if (!ids.length) return toast('No questions available.');
  if (state.session) {
    toast(
      'You have an unfinished session. Complete it before starting a new one.',
    );
    navigate('practice');
    return;
  }
  state.session = {
    ids,
    title,
    mode,
    index: 0,
    page: 0,
    answers: {},
    startedAt: Date.now(),
    deadline: mode === 'exam' ? Date.now() + 600000 : null,
  };
  selection = null;
  guess = false;
  save();
  navigate('practice');
}
function daily(short = false) {
  const attempted = new Set(state.attempts.map((a) => a.id));
  let ids = [
    ...new Set([
      ...due(),
      ...questions
        .filter(
          (q) =>
            state.profile.focus?.includes(q.subject) && !attempted.has(q.id),
        )
        .map((q) => q.id),
      ...questions.filter((q) => !attempted.has(q.id)).map((q) => q.id),
      ...questions.map((q) => q.id),
    ]),
  ].slice(0, short ? 5 : goal());
  start(ids, short ? '5-minute practice' : 'Today’s practice');
}
const sessionTitle = (title) =>
  ({
    'বাংলা ভাষা ও সাহিত্য': 'Bangla Language & Literature',
    'গাণিতিক যুক্তি': 'Mathematical Reasoning',
    'সাধারণ জ্ঞান': 'General Knowledge',
    রিভিশন: 'Revision',
    '৫ মিনিটের ছোট অনুশীলন': '5-minute practice',
    'আজকের অনুশীলন': 'Today’s practice',
    'নতুন কিছু শেখা': 'Learn something new',
    'প্রস্তুতি মডেল টেস্ট': 'Prosthuti mock test',
  })[title] || title;
function practice() {
  const s = state.session;
  if (!s)
    return '<div class="empty"><h3>Ready to learn something new?</h3><button class="primary" data-action="daily">Start practicing</button></div>';

  const PAGE_SIZE = 20;
  const totalQuestions = s.ids.length;
  const totalPages = Math.ceil(totalQuestions / PAGE_SIZE) || 1;
  const currentPage = Math.min(
    Math.max(0, Number(s.page) || 0),
    totalPages - 1,
  );
  s.page = currentPage;

  const startIdx = currentPage * PAGE_SIZE;
  const endIdx = Math.min(startIdx + PAGE_SIZE, totalQuestions);
  const pageIds = s.ids.slice(startIdx, endIdx);

  const answeredCount = s.ids.filter((id) => getAnswer(id) !== null).length;
  const remainingCount = totalQuestions - answeredCount;

  return `<div class="practice-wrap minimalist-practice-wrap">
    <div class="practice-header-top">
      <div class="row between" style="align-items:center">
        <div>
          <button class="back-link" data-action="pause">‹ Back</button>
          <h2 style="margin:4px 0 0;font-size:calc(18px * var(--font-scale,1))">${esc(sessionTitle(s.title))}</h2>
        </div>
        ${s.mode === 'exam' ? '<span class="tag" id="session-time">Time left</span>' : ''}
      </div>
      ${
        totalPages > 1
          ? `
        <div class="row sp pagination-top-row" style="margin-top:10px">
          <span class="fine">Showing questions <b>${startIdx + 1}–${endIdx}</b> of ${totalQuestions}</span>
          <span class="fine">Page ${currentPage + 1} of ${totalPages}</span>
        </div>
      `
          : ''
      }
    </div>

    <div class="multi-questions-list">
      ${pageIds
        .map((qId, localIdx) => {
          const q = s.snapshots?.[qId] || questions[qId];
          const a = getAnswer(qId);
          const reveal = a && s.mode !== 'exam';

          return `<section class="card question-card-v3" id="q-card-${q.id}">
          <h2 class="question-title-v3">${esc(q.text)}</h2>${questionIdentity(q)}

          <div class="options-v3">
            ${q.options
              .map((opt, optIdx) => {
                const isSelected = a && a.choice === optIdx;
                const isCorrect = optIdx === q.answer;
                let stateClass = '';
                if (a) {
                  if (s.mode !== 'exam') {
                    if (isCorrect) stateClass = 'is-correct';
                    else if (isSelected) stateClass = 'is-incorrect';
                  } else {
                    if (isSelected) stateClass = 'is-selected';
                  }
                }
                return `<button class="opt-card-v3 ${stateClass}" data-action="answer-q" data-qid="${q.id}" data-opt="${optIdx}" ${a && s.mode !== 'exam' ? 'disabled' : ''}>
                <span class="opt-letter-v3">${'ABCD'[optIdx]}</span>
                <span class="opt-text-v3">${esc(opt)}</span>
              </button>`;
              })
              .join('')}
          </div>

          ${
            reveal
              ? `
            <div class="question-divider-v3"></div>
            <div class="feedback-v3">
              <div class="feedback-status-v3 ${a.correct ? 'status-correct' : 'status-incorrect'}">
                ${a.correct ? 'Correct' : 'Incorrect'}
              </div>
              <p class="feedback-text-v3">${esc(q.explanation)}</p>
            </div>
          `
              : ''
          }
        </section>`;
        })
        .join('')}
    </div>

    ${
      totalPages > 1
        ? `
      <div class="pagination-bar">
        <button class="pagination-nav-btn" data-action="practice-page" data-page="${currentPage - 1}" ${currentPage === 0 ? 'disabled' : ''}>‹ Previous 20</button>
        <div class="pagination-pages-group">
          ${Array.from(
            { length: totalPages },
            (_, i) => `
            <button class="pagination-page-btn ${currentPage === i ? 'active' : ''}" data-action="practice-page" data-page="${i}">${i + 1}</button>
          `,
          ).join('')}
        </div>
        <button class="pagination-nav-btn" data-action="practice-page" data-page="${currentPage + 1}" ${currentPage === totalPages - 1 ? 'disabled' : ''}>Next 20 ›</button>
      </div>
    `
        : ''
    }

    <div class="practice-footer-v3">
      <div class="practice-footer-left">
        <span class="answered-count-text"><b>${answeredCount} of ${totalQuestions} answered</b></span>
        <span class="remaining-count-text"> · ${remainingCount} left</span>
      </div>
      <div class="practice-footer-right">
        <button class="btn-save-exit" data-action="pause">Save & exit</button>
        <button class="btn-finish-v3" data-action="finish-practice">Finish</button>
      </div>
    </div>
  </div>`;
}
function submit(choice) {
  // Legacy single question submit compatibility
  if (state.session && state.session.ids[state.session.index] !== undefined) {
    answerQuestion(state.session.ids[state.session.index], choice);
  }
}
function record(a) {
  state.attempts.push(a);
  if (!a.correct || a.guess)
    state.reviews[a.id] = { due: Date.now(), level: 0 };
  else if (state.reviews[a.id]) {
    let level = Math.min((state.reviews[a.id].level || 0) + 1, 4);
    state.reviews[a.id] = {
      due: Date.now() + [1, 3, 7, 21, 30][level - 1] * 86400000,
      level,
    };
  }
}
function finish() {
  if (apiEnabled) return finishApiSession();
  let s = state.session;
  if (!s) return;
  const finalAnswers = s.ids.map((id) => {
    const a = getAnswer(id);
    return (
      a || {
        id,
        choice: null,
        correct: false,
        guess: false,
        at: Date.now(),
        day: dayKey(),
      }
    );
  });
  if (s.mode === 'exam') {
    finalAnswers.forEach(record);
  } else {
    finalAnswers.filter((answer) => answer.choice === null).forEach(record);
  }
  if (s.routineTask) {
    state.completedTasks[s.routineTask] = true;
  }
  state.lastResult = { ...s, answers: finalAnswers, endedAt: Date.now() };
  state.history.push(state.lastResult);
  state.session = null;
  save();
  navigate('result');
}
function result() {
  const r = state.lastResult;
  if (!r)
    return '<div class="empty"><h3>No completed sessions yet</h3><button class="primary" data-action="daily">Start</button></div>';
  let correct = r.answers.filter((a) => a.correct).length,
    wrong = r.answers.filter((a) => !a.correct && a.choice !== null).length,
    skip = r.answers.filter((a) => a.choice === null).length,
    p = Math.round((correct / r.ids.length) * 100);
  return `<div class="result"><p>${sessionScore(r)} marks · ${Math.round((r.endedAt - r.startedAt) / 1000)} seconds</p><a href="#history">Result history</a><span class="tag">${r.mode === 'exam' ? 'Mock test' : 'Practice'} complete</span><h1 style="margin-top:16px">One more step forward!</h1><p class="muted">${esc(sessionTitle(r.title))} · ${formatNumber(r.ids.length)} questions</p><div class="panel"><div class="circle-progress" style="--angle:${p * 3.6}deg"><div><b>${formatNumber(p)}%</b><small>Correct answers</small></div></div><div class="stats"><div><h2>${formatNumber(correct)}</h2><span class="muted">Correct</span></div><div><h2>${formatNumber(wrong)}</h2><span class="muted">Incorrect</span></div><div><h2>${formatNumber(skip)}</h2><span class="muted">Skipped</span></div></div><p class="muted">${wrong + skip ? 'Missed and skipped questions have been added to revision.' : 'Great work! Keep practicing regularly.'}</p><div class="result-actions"><a class="primary" href="#review">View revision</a><a class="secondary" href="#home">Back to today</a></div></div></div><div class="practice-wrap"><h2>Answers & explanations</h2>${r.answers
    .map((a) => {
      let q = r.snapshots?.[a.id] || questions[a.id];
      return `<div class="panel" style="margin-bottom:12px"><span class="tag ${a.correct ? '' : 'amber'}">${a.correct ? 'Correct' : a.choice === null ? 'Skipped' : 'Incorrect answer'}</span><h3 style="margin-top:13px">${esc(q.text)}</h3><p class="fine">Your answer: ${a.choice === null ? 'Not answered' : esc(q.options[a.choice])}</p><p style="margin-bottom:0">${esc(q.explanation)}</p></div>`;
    })
    .join('')}</div>`;
}
function render() {
  nav();
  const main = $('#main');
  main.classList.toggle(
    'study-screen',
    [
      'review',
      'progress',
      'routine',
      'settings',
      'practice',
      'result',
      'study',
      'lesson',
      'custom',
      'exams',
      'papers',
      'paper',
      'preparation',
      'history',
      'affairs',
      'backup',
      'exam-preparation',
      'routine-edit',
      'restore-backup',
    ].includes(page),
  );
  main.innerHTML = (
    {
      home,
      bank,
      review,
      progress,
      routine,
      practice,
      result,
      settings,
      study,
      lesson: lessonScreen,
      custom: customPractice,
      exams,
      papers,
      paper: paperScreen,
      preparation,
      history: historyScreen,
      affairs,
      backup: backupScreen,
      'exam-preparation': examPreparation,
      'routine-edit': routineEditorScreen,
      'restore-backup': restoreScreen,
    }[page] || home
  )();
  if (page === 'lesson')
    requestAnimationFrame(() => {
      if (page === 'lesson')
        window.scrollTo(0, state.reading[activeLesson]?.position || 0);
    });
  applyPreferences();
  updateTimer();
}
function navigate(id) {
  if (location.hash === '#' + id) {
    page = id;
    render();
  } else location.hash = id;
  window.scrollTo({ top: 0, behavior: 'instant' });
}
window.addEventListener('hashchange', () => {
  page = location.hash.slice(1) || 'home';
  selection = null;
  guess = false;
  render();
  window.scrollTo(0, 0);
});
document.addEventListener('click', async (e) => {
  const target = e.target as Element;
  let b = target.closest<HTMLElement>('[data-action]');
  if (!b) return;
  if (apiEnabled && b.closest('.syllabus-view-wrap') && b.dataset.action === 'practice-subject') {
    toast('This sample syllabus has no matching API subject mapping yet.');
    return;
  }
  let act = b.dataset.action,
    id = Number(b.dataset.id);
  if (act === 'navigate') {
    if (b.dataset.page === 'bank') selectedSubject = null;
    navigate(b.dataset.page);
  } else if (act === 'daily') daily();
  else if (act === 'short') daily(true);
  else if (act === 'mixed')
    start(
      questions
        .filter((q) => q.subject !== 0)
        .map((q) => q.id)
        .slice(0, 6),
      'Learn something new',
    );
  else if (act === 'subject' || act === 'open-subject') {
    selectedSubject = id;
    render();
    window.scrollTo(0, 0);
  } else if (act === 'back-subjects') {
    selectedSubject = null;
    render();
    window.scrollTo(0, 0);
  } else if (act === 'toggle-chapter') {
    const k = b.dataset.key;
    openChapters[k] = openChapters[k] === false ? true : false;
    render();
  } else if (act === 'practice-subject') {
    const ids = questions.filter((q) => q.subject === id).map((q) => q.id);
    if (ids.length) start(ids, subjects[id].name);
  } else if (act === 'practice-chapter') {
    const sId = Number(b.dataset.subject),
      cId = Number(b.dataset.chapter);
    const ids = questions
      .filter((q) => q.subject === sId && q.chapter === cId)
      .map((q) => q.id);
    const t = subjects[sId].chapters[cId]?.title || 'Chapter';
    if (ids.length) start(ids, `${subjects[sId].short}: ${t}`);
  } else if (act === 'practice-topic') {
    const sId = Number(b.dataset.subject),
      topName = b.dataset.topic;
    const ids = questions
      .filter((q) => q.subject === sId && q.topic === topName)
      .map((q) => q.id);
    if (ids.length) start(ids, `${subjects[sId].short}: ${topName}`);
  } else if (act === 'answer-q') {
    answerQuestion(Number(b.dataset.qid), Number(b.dataset.opt));
  } else if (act === 'practice-page') {
    if (state.session) {
      if (apiEnabled && !await saveApiPosition(Number(b.dataset.page))) return;
      state.session.page = Number(b.dataset.page);
      save();
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } else if (act === 'finish-practice') {
    finish();
  } else if (act === 'toggle-q-bookmark') {
    const qId = Number(b.dataset.id);
    if (apiEnabled) return bookmarkApiQuestion(qId);
    state.saved = state.saved.includes(qId)
      ? state.saved.filter((x) => x !== qId)
      : [...state.saved, qId];
    save();
    render();
    toast(
      state.saved.includes(qId) ? 'Question bookmarked' : 'Bookmark removed',
    );
  } else if (act === 'study-topic') {
    openStudyTopic(
      Number(b.dataset.subject),
      Number(b.dataset.chapter),
      b.dataset.topic,
    );
  } else if (act === 'study-chapter') {
    openStudyChapter(Number(b.dataset.subject), Number(b.dataset.chapter));
  } else if (act === 'close-study') {
    $('#study-dialog').close();
  } else if (act === 'practice-topic-direct') {
    $('#study-dialog').close();
    const sId = Number(b.dataset.subject),
      topName = b.dataset.topic;
    const ids = questions
      .filter((q) => q.subject === sId && q.topic === topName)
      .map((q) => q.id);
    if (ids.length) start(ids, `${subjects[sId].short}: ${topName}`);
  } else if (act === 'practice-chapter-direct') {
    $('#study-dialog').close();
    const sId = Number(b.dataset.subject),
      cId = Number(b.dataset.chapter);
    const ids = questions
      .filter((q) => q.subject === sId && q.chapter === cId)
      .map((q) => q.id);
    const t = subjects[sId].chapters[cId]?.title || 'Chapter';
    if (ids.length) start(ids, `${subjects[sId].short}: ${t}`);
  } else if (act === 'clear-search') {
    search = '';
    render();
  } else if (act === 'resume') navigate('practice');
  else if (act === 'pause') {
    if (apiEnabled && !await saveApiPosition()) return;
    save();
    navigate('home');
    toast('Your place is saved. Pick up where you left off.');
  } else if (act === 'review') navigate('review');
  else if (act === 'single') start([id], 'Revision');
  else if (act === 'review-start') {
    let ids =
      reviewTab === 'saved'
        ? state.saved
        : reviewTab === 'all'
          ? Object.keys(state.reviews).map(Number)
          : due();
    if (ids.length) start([...ids], 'Revision');
  } else if (act === 'bank-tab') {
    bankTab = b.dataset.id;
    selectedSubject = null;
    render();
  } else if (act === 'review-tab') {
    reviewTab = b.dataset.id;
    render();
  } else if (act === 'select') {
    selection = id;
    render();
  } else if (act === 'submit') {
    if (selection !== null) submit(selection);
  } else if (act === 'skip') submit(null);
  else if (act === 'next') {
    if (state.session.index + 1 >= state.session.ids.length) finish();
    else {
      if (apiEnabled && !await saveApiPosition(state.session.page || 0, state.session.index + 1)) return;
      state.session.index++;
      selection = null;
      guess = false;
      save();
      render();
      window.scrollTo(0, 0);
    }
  } else if (act === 'bookmark') {
    let q = state.session.ids[state.session.index];
    if (apiEnabled) return bookmarkApiQuestion(q);
    state.saved = state.saved.includes(q)
      ? state.saved.filter((x) => x !== q)
      : [...state.saved, q];
    save();
    render();
    toast(state.saved.includes(q) ? 'Question bookmarked' : 'Bookmark removed');
  } else if (act === 'exam')
    start(
      questions.map((q) => q.id),
      'Prosthuti mock test',
      'exam',
    );
  else if (act === 'toggle-settings-sub') {
    settingsExpanded = !settingsExpanded;
    render();
  } else if (act === 'settings-sub') {
    settingsTab = b.dataset.id;
    settingsExpanded = true;
    navigate('settings');
  } else if (act === 'toggle-sidebar') {
    sidebarHidden = !sidebarHidden;
    render();
  } else if (act === 'toggle-weak') {
    showMoreWeak = !showMoreWeak;
    render();
  } else if (act === 'toggle-affairs') {
    showMoreAffairs = !showMoreAffairs;
    render();
  } else if (act === 'toggle-notices') {
    showMoreNotices = !showMoreNotices;
    render();
  } else if (act === 'institute-select') {
    openInstituteModal(b.dataset.inst);
  } else if (act === 'select-inst-syllabus') {
    selectedInstSyllabus = b.dataset.id;
    render();
  } else if (act === 'toggle-syllabus-type') {
    syllabusExamType = b.dataset.type;
    render();
  } else if (act === 'practice-institute-direct') {
    openInstituteModal(b.dataset.id);
  } else if (act === 'settings') {
    if (b.textContent.includes('target') || b.textContent.includes('Target'))
      settingsTab = 'plan';
    navigate('settings');
  } else if (act === 'report') $('#report-dialog').showModal();
  else if (act === 'close-report') $('#report-dialog').close();
});
document.addEventListener('input', (e) => {
  const target = e.target as HTMLInputElement;
  if (target.id === 'search') {
    let pos = target.selectionStart;
    search = target.value;
    render();
    $('#search').focus();
    $('#search').setSelectionRange(pos, pos);
  }
});
document.addEventListener('change', (e) => {
  const target = e.target as HTMLInputElement;
  if (target.id === 'subject-filter') {
    filter = target.value;
    render();
  }
  if (target.id === 'syllabus-inst-filter') {
    selectedInstSyllabus = target.value;
    render();
  }
  if (target.id === 'guess') guess = target.checked;
});
$('#report-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!state.session) return;
  let f = new FormData(e.target);
  if (apiEnabled) {
    const id = state.session.ids[state.session.index || 0];
    const saved = await apiWrite(async () => {
      const response = await apiRequest<{ data: { created_at: string } }>(`/questions/${questions[id].serverId}/reports`, 'POST', { type: f.get('type'), detail: f.get('detail') });
      state.reports.push({ id, type: f.get('type'), detail: f.get('detail'), at: apiTime(response.data.created_at) });
    });
    if (!saved) return;
    $('#report-dialog').close();
    e.target.reset();
    toast('Report saved.');
    return;
  }
  state.reports.push({
    id: state.session.ids[state.session.index],
    type: f.get('type'),
    detail: f.get('detail'),
    at: Date.now(),
  });
  save();
  $('#report-dialog').close();
  e.target.reset();
  toast('Demo report saved in this browser');
});
let expiredApiAttempt: string | null = null;
function updateTimer() {
  let s = state.session;
  if (!s || s.mode !== 'exam') return;
  let remaining = Math.max(0, Math.ceil((s.deadline - Date.now()) / 1000));
  if (!remaining) {
    if (apiEnabled) {
      if (apiMutationPending || expiredApiAttempt === s.serverId) return;
      expiredApiAttempt = s.serverId;
    }
    finish();
    if (!apiEnabled) toast('Time is up. Your test has been submitted.');
    return;
  }
  let el = $('#session-time');
  if (el)
    el.textContent = `Time left ${formatNumber(Math.floor(remaining / 60))}:${formatNumber(String(remaining % 60).padStart(2, '0'))}`;
}

if (document.modelContext?.registerTool) {
  try {
    Promise.resolve(
      document.modelContext.registerTool({
        name: 'get_study_progress',
        description:
          'Read loaded study progress and revision counts.',
        inputSchema: {
          type: 'object',
          properties: {},
          additionalProperties: false,
        },
        annotations: { readOnlyHint: true },
        execute(input) {
          if (!input || typeof input !== 'object' || Object.keys(input).length)
            throw new Error('Expected empty object');
          return {
            attempts: state.attempts.length,
            accuracy: accuracy(),
            due: due().length,
            today: todayAttempts().length,
          };
        },
      }),
    ).catch(() => {});
  } catch {}
}
