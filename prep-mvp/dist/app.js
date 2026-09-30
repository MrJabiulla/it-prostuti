const icons={home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',bank:'<path d="M3 4h7l2 2 2-2h7v15h-7l-2 2-2-2H3zM12 6v15"/>',review:'<path d="M3 11a9 9 0 1 1 3 8M3 4v7h7M12 7v5l3 2"/>',progress:'<path d="M4 20V10m8 10V4m8 16v-7"/>',routine:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18m-14 4h3m4 0h3"/>'};
const icon=n=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[n]||icons.bank}</svg>`;
const subjects=[
  {
    name:'Bangla Language & Literature',
    bengali:'বাংলা ভাষা ও সাহিত্য',
    short:'Bangla',
    symbol:'অ',
    color:'#eef1e8',
    chapters:[
      {
        id:'bn-c1',
        title:'বাংলা ব্যাকরণ ও ধ্বনিতত্ত্ব',
        english:'Grammar & Phonetics',
        topics:[
          {name:'ধ্বনি ও বর্ণ',english:'Phonetics & Letters'},
          {name:'সন্ধি',english:'Sandhi (Sound joining)'},
          {name:'ণ-ত্ব ও ষ-ত্ব বিধান',english:'Natwa & Shatwa Rules'}
        ]
      },
      {
        id:'bn-c2',
        title:'শব্দ ও পদ প্রকরণ',
        english:'Morphology & Parts of Speech',
        topics:[
          {name:'শব্দের শ্রেণিবিভাগ',english:'Word Classifications'},
          {name:'পদ প্রকরণ',english:'Parts of Speech'},
          {name:'উপসর্গ ও অনুসর্গ',english:'Prefixes & Postpositions'}
        ]
      },
      {
        id:'bn-c3',
        title:'বাক্যতত্ত্ব ও সমাস',
        english:'Syntax & Compounds',
        topics:[
          {name:'সমাস',english:'Samas (Compounds)'},
          {name:'কারক ও বিভক্তি',english:'Case & Inflection'},
          {name:'বাগধারা ও বাক্য শুদ্ধি',english:'Idioms & Sentence Correction'}
        ]
      },
      {
        id:'bn-c4',
        title:'বাংলা সাহিত্য',
        english:'Bengali Literature',
        topics:[
          {name:'প্রাচীন ও মধ্যযুগ',english:'Ancient & Medieval Age'},
          {name:'আধুনিক যুগ ও কবিতা',english:'Modern Age & Poetry'},
          {name:'নাটক ও উপন্যাস',english:'Drama & Novel'}
        ]
      }
    ]
  },
  {
    name:'English Language & Literature',
    bengali:'ইংরেজি ভাষা ও সাহিত্য',
    short:'English',
    symbol:'Aa',
    color:'#f6efe4',
    chapters:[
      {
        id:'en-c1',
        title:'Grammar & Parts of Speech',
        english:'Grammar Foundations',
        topics:[
          {name:'Grammar',english:'Parts of Speech & Basics'},
          {name:'Subject-Verb Agreement',english:'Agreement Rules'},
          {name:'Tense & Verbs',english:'Tenses & Right Forms'}
        ]
      },
      {
        id:'en-c2',
        title:'Sentence & Mechanics',
        english:'Sentence Structure',
        topics:[
          {name:'Voice & Narration',english:'Voice & Speech'},
          {name:'Prepositions',english:'Appropriate Prepositions'},
          {name:'Sentence Correction',english:'Common Errors & Clauses'}
        ]
      },
      {
        id:'en-c3',
        title:'Vocabulary & Idioms',
        english:'Lexicon & Expressions',
        topics:[
          {name:'Vocabulary',english:'Synonyms & Antonyms'},
          {name:'Idioms & Phrases',english:'Idiomatic Expressions'},
          {name:'Spelling',english:'Commonly Confused Words'}
        ]
      },
      {
        id:'en-c4',
        title:'English Literature',
        english:'Literary Works & Authors',
        topics:[
          {name:'Major Writers & Dramatists',english:'Shakespeare & Classic Authors'},
          {name:'Literary History & Quotes',english:'Famous Quotes & Periods'}
        ]
      }
    ]
  },
  {
    name:'Mathematical Reasoning',
    bengali:'গাণিতিক যুক্তি ও মানসিক দক্ষতা',
    short:'Math',
    symbol:'∑',
    color:'#edf0f8',
    chapters:[
      {
        id:'ma-c1',
        title:'পাটিগণিত (Arithmetic)',
        english:'Arithmetic & Numbers',
        topics:[
          {name:'বাস্তব সংখ্যা',english:'Real Numbers & Primes'},
          {name:'শতকরা',english:'Percentage & Profit-Loss'},
          {name:'গড় ও অনুপাত',english:'Average & Ratio'}
        ]
      },
      {
        id:'ma-c2',
        title:'বীজগণিত (Algebra)',
        english:'Algebra & Equations',
        topics:[
          {name:'বীজগণিত',english:'Algebraic Equations'},
          {name:'সূচক ও লগারিদম',english:'Indices & Logarithms'}
        ]
      },
      {
        id:'ma-c3',
        title:'জ্যামিতি ও পরিমিতি',
        english:'Geometry & Mensuration',
        topics:[
          {name:'রেখা ও কোণ',english:'Lines, Angles & Triangles'},
          {name:'পরিমিতি ও বৃত্ত',english:'Perimeter, Area & Circles'}
        ]
      },
      {
        id:'ma-c4',
        title:'মানসিক দক্ষতা (Mental Ability)',
        english:'Analytical & Logical Reasoning',
        topics:[
          {name:'ধারাবাহিকতা ও সিরিজ',english:'Number & Letter Series'},
          {name:'সম্পর্ক ও দিক',english:'Blood Relations & Directions'}
        ]
      }
    ]
  },
  {
    name:'General Knowledge',
    bengali:'সাধারণ জ্ঞান (বাংলাদেশ ও বিশ্ব)',
    short:'General Knowledge',
    symbol:'◎',
    color:'#f5ece7',
    chapters:[
      {
        id:'gk-c1',
        title:'বাংলাদেশ বিষয়াবলী',
        english:'Bangladesh Affairs',
        topics:[
          {name:'বাংলাদেশ',english:'National Symbols & Geography'},
          {name:'মুক্তিযুদ্ধ ও ইতিহাস',english:'Liberation War & History'},
          {name:'সংবিধান ও প্রশাসন',english:'Constitution & Polity'}
        ]
      },
      {
        id:'gk-c2',
        title:'আন্তর্জাতিক বিষয়াবলী',
        english:'International Affairs',
        topics:[
          {name:'বিশ্ব',english:'Global Geography & Planets'},
          {name:'আন্তর্জাতিক সংস্থা',english:'UN & Treaties'}
        ]
      },
      {
        id:'gk-c3',
        title:'সাধারণ বিজ্ঞান ও তথ্যপ্রযুক্তি',
        english:'General Science & ICT',
        topics:[
          {name:'বিজ্ঞান',english:'Physical & Biological Science'},
          {name:'তথ্যপ্রযুক্তি',english:'Computer, Internet & Cyber'}
        ]
      }
    ]
  }
];
subjects.forEach(s=>{s.topics=s.chapters.flatMap(c=>c.topics.map(t=>t.name))});

const questions=[
  // Bangla
  [0,0,'সন্ধি',"‘বিদ্যালয়’ শব্দের সন্ধি বিচ্ছেদ কোনটি?",['বিদ্যা + আলয়','বিদ্যা + লয়','বিদ্য + আলয়','বিদ্যা + অলয়'],0,'বিদ্যা + আলয় = বিদ্যালয়। আ + আ মিলে আ হয়; এটি স্বরসন্ধির উদাহরণ।'],
  [0,0,'সন্ধি',"‘হিমালয়’ শব্দের সন্ধি বিচ্ছেদ কোনটি?",['হিম + আলয়','হিমা + লয়','হিম + লয়','হিমা + অলয়'],0,'হিম + আলয় = হিমালয়। অ + আ মিলে আ হয়েছে।'],
  [0,0,'ধ্বনি ও বর্ণ',"বাংলা বর্ণমালায় মোট মৌলিক স্বরধ্বনি কয়টি?",['৭টি','১১টি','৩৯টি','৫০টি'],0,'বাংলা ভাষায় মৌলিক স্বরধ্বনি ৭টি: অ, আ, ই, উ, এ, ও, অ্যা।'],
  [0,0,'ণ-ত্ব ও ষ-ত্ব বিধান',"কোন শব্দটিতে স্বভাবতই ‘ষ’ হয়েছে?",['আষাঢ়','কষ্ট','সুপ্ত','বৃষ্টি'],0,'আষাঢ়, ভাষণ, উষা প্রভৃতি শব্দে স্বভাবতই মূর্ধন্য-ষ হয়।'],
  [0,1,'শব্দের শ্রেণিবিভাগ',"‘হস্তী’ কোন ধরনের শব্দ?",['তৎসম শব্দ','তদ্ভব শব্দ','দেশি শব্দ','বিদেশি শব্দ'],0,'‘হস্তী’ একটি প্রাচীন সংস্কৃত বা তৎসম শব্দ।'],
  [0,1,'পদ প্রকরণ',"‘ধীরে ধীরে বায়ু বয়’ — এখানে ‘ধীরে ধীরে’ কোন পদ?",['ক্রিয়া বিশেষণ','বিশেষণ','ক্রিয়া পদ','অব্যয় পদ'],0,'‘ধীরে ধীরে’ পদটি বায়ু বওয়ার ভাব বা গতি প্রকাশ করছে, তাই এটি ক্রিয়া বিশেষণ।'],
  [0,2,'সমাস',"‘রাজপুত্র’ কোন সমাসের উদাহরণ?",['দ্বন্দ্ব সমাস','বহুব্রীহি সমাস','কর্মধারয় সমাস','ষষ্ঠী তৎপুরুষ সমাস'],3,'রাজার পুত্র = রাজপুত্র। এখানে ষষ্ঠী বিভক্তি ‘-র’ লোপ পেয়েছে, তাই ষষ্ঠী তৎপুরুষ সমাস।'],
  [0,2,'সমাস',"‘সিংহপুরুষ’ কোন সমাসের উদাহরণ?",['উপমিত কর্মধারয়','উপমান কর্মধারয়','রূপক কর্মধারয়','বহুব্রীহি'],0,'সিংহ সদৃশ পুরুষ = সিংহপুরুষ। এটি সাধারণ গুণের উল্লেখ ছাড়া উপমিত কর্মধারয় সমাস।'],
  [0,2,'কারক ও বিভক্তি',"‘তিলে তৈল আছে’ — এখানে ‘তিলে’ কোন কারকে কোন বিভক্তি?",['অধিকরণে ৭মী','অপাদানে ৭মী','করণে ৭মী','কর্মে ৭মী'],0,'স্থান বা আধারের সম্পূর্ণ অংশে ব্যাপ্তি বোঝালে অভিব্যপক অধিকরণ কারক হয়।'],
  [0,3,'আধুনিক যুগ ও কবিতা',"‘আমাদের ছোট নদী’ কবিতার রচয়িতা কে?",['কাজী নজরুল ইসলাম','জসীমউদ্দীন','রবীন্দ্রনাথ ঠাকুর','সুকান্ত ভট্টাচার্য'],2,'‘আমাদের ছোট নদী’ রবীন্দ্রনাথ ঠাকুরের লেখা একটি সুপরিচিত কবিতা।'],
  [0,3,'প্রাচীন ও মধ্যযুগ',"বাংলা সাহিত্যের প্রাচীনতম নিদর্শন ‘চর্যাপদ’ কত সালে আবিষ্কৃত হয়?",['১৯০৭ সালে','১৯১৬ সালে','১৯২১ সালে','১৯৫০ সালে'],0,'মহামহোপাধ্যায় হরপ্রসাদ শাস্ত্রী ১৯০৭ সালে নেপালের রয়েল লাইব্রেরি থেকে চর্যাপদ আবিষ্কার করেন।'],
  [0,3,'নাটক ও উপন্যাস',"ভাষা আন্দোলনের পটভূমিতে রচিত বিখ্যাত ‘কবর’ নাটকের রচয়িতা কে?",['মুনীর চৌধুরী','সেলিম আল দীন','নুরুল মোমেন','সৈয়দ শামসুল হক'],0,'শহীদ বুদ্ধিজীবী মুনীর চৌধুরী ১৯৫৩ সালে ঢাকা কেন্দ্রীয় কারাগারে বন্দি থাকা অবস্থায় ‘কবর’ নাটকটি রচনা করেন।'],

  // English
  [1,0,'Grammar',"Choose the correct sentence.",['He go to school.','He goes to school.','He going to school.','He gone to school.'],1,'Simple present tense-এ third person singular subject (He)-এর সঙ্গে verb-এ s/es যোগ হয়।'],
  [1,0,'Grammar',"She has lived here ___ 2020.",['for','since','from','at'],1,'নির্দিষ্ট অতীতের নির্দিষ্ট সময় বিন্দু বোঝাতে since ব্যবহৃত হয়; সময়ের ব্যাপ্তি বোঝাতে for ব্যবহৃত হয়।'],
  [1,0,'Subject-Verb Agreement',"Neither of the boys ___ present yesterday.",['was','were','are','have been'],0,'“Neither of” এর পর plural noun বসলেও verb সর্বদা singular হয়। তাই “was” সঠিক।'],
  [1,1,'Voice & Narration',"“Who wrote Hamlet?” Choose the correct passive form.",['By whom was Hamlet written?','By whom Hamlet was written?','Who was written Hamlet?','Whom wrote Hamlet?'],0,'Interrogative voice-এ “Who”-এর জায়গায় “By whom + auxiliary verb + object + V3” বসে।'],
  [1,1,'Prepositions',"He is proficient ___ English.",['in','at','with','on'],0,'দক্ষতা বোঝাতে “proficient in” উপযুক্ত preposition হিসেবে বসে।'],
  [1,2,'Vocabulary',"What is the synonym of “rapid”?",['Slow','Fast','Quiet','Weak'],1,'“Rapid” অর্থ দ্রুত। এর সমার্থক শব্দ হলো “Fast”।'],
  [1,2,'Vocabulary',"Choose the opposite of “ancient”.",['Old','Modern','Historic','Early'],1,'“Ancient” অর্থ প্রাচীন বা পুরাতন। এর বিপরীত শব্দ হলো “Modern” (আধুনিক)।'],
  [1,2,'Idioms & Phrases',"What is the meaning of the idiom “A bed of roses”?",['A life of ease and luxury','A difficult path','A flower garden','A complex problem'],0,'“A bed of roses” বাগধারাটির অর্থ নিষ্কণ্টক বা আরামদায়ক জীবন।'],
  [1,3,'Major Writers & Dramatists',"Who is the author of the tragedy “Romeo and Juliet”?",['William Shakespeare','Christopher Marlowe','John Milton','John Keats'],0,'“Romeo and Juliet” বিশ্ববিখ্যাত নাট্যকার William Shakespeare-এর অমর ট্র্যাজেডি নাটক।'],

  // Math
  [2,0,'বাস্তব সংখ্যা',"নিচের কোনটি মৌলিক সংখ্যা?",['৪৭','৫১','৮৭','৯১'],0,'৪৭ কে ১ ও ৪৭ ছাড়া অন্য কোনো সংখ্যা দিয়ে ভাগ করা যায় না। তাই ৪৭ একটি মৌলিক সংখ্যা।'],
  [2,0,'শতকরা',"২০০-এর ১৫% কত?",['১৫','২০','৩০','৪০'],2,'২০০ × ১৫ ÷ ১০০ = ৩০। শতকরা মানে প্রতি একশতে মান।'],
  [2,0,'শতকরা',"একটি বইয়ের মূল্য ৫০০ টাকা। ১০% ছাড়ে বইটির বিক্রয়মূল্য কত?",['৪০০ টাকা','৪৫০ টাকা','৪৮০ টাকা','৪৯০ টাকা'],1,'ছাড় = ৫০০ × ১০ ÷ ১০০ = ৫০ টাকা। বিক্রয়মূল্য = ৫০০ − ৫০ = ৪৫০ টাকা।'],
  [2,0,'গড় ও অনুপাত',"১০, ২০ ও ৩০-এর গড় কত?",['১৫','২০','২৫','৩০'],1,'গড় = সংখ্যাগুলোর যোগফল ÷ মোট সংখ্যা = (১০ + ২০ + ৩০) ÷ ৩ = ৬০ ÷ ৩ = ২০।'],
  [2,1,'বীজগণিত',"২x + ৬ = ১৬ হলে x-এর মান কত?",['৩','৪','৫','৬'],2,'২x = ১৬ − ৬ = ১০। সুতরাং x = ১০ ÷ ২ = ৫।'],
  [2,1,'সূচক ও লগারিদম',"log₂ 8-এর মান কত?",['২','৩','৪','৮'],1,'8 = 2³। সুতরাং log₂ (2³) = 3 log₂ 2 = 3 × 1 = 3।'],
  [2,2,'রেখা ও কোণ',"একটি ত্রিভুজের তিন কোণের সমষ্টি কত ডিগ্রি?",['৯০°','১৮০°','২৭০°','৩৬০°'],1,'ইউক্লিডীয় জ্যামিতি অনুসারে যেকোনো সমতলীয় ত্রিভুজের তিন কোণের সমষ্টি দুই সমকোণ বা ১৮০°।'],
  [2,3,'ধারাবাহিকতা ও সিরিজ',"ধারাটির পরবর্তী সংখ্যা কত: ৩, ৬, ১২, ২৪, ___?",['৪৮','৩৬','৩০','৫০'],0,'প্রতিটি পদ পূর্ববর্তী পদের দ্বিগুণ হচ্ছে (৩ × ২ = ৬, ৬ × ২ = ১২...)। সুতরাং ২৪ × ২ = ৪৮।'],

  // General Knowledge
  [3,0,'বাংলাদেশ',"বাংলাদেশের জাতীয় ফুল কোনটি?",['গোলাপ','শাপলা','বেলি','জবা'],1,'বাংলাদেশের জাতীয় ফুল সাদা শাপলা।'],
  [3,0,'বাংলাদেশ',"বাংলাদেশের জাতীয় স্মৃতিসৌধ কোথায় অবস্থিত?",['সাভার','টুঙ্গিপাড়া','কুমিল্লা','সিলেট'],0,'জাতীয় স্মৃতিসৌধ ঢাকা জেলার সাভারের নবীনগরে অবস্থিত।'],
  [3,0,'মুক্তিযুদ্ধ ও ইতিহাস',"১৯৭১ সালের ঐতিহাসিক ৭ই মার্চের ভাষণ কোথায় অনুষ্ঠিত হয়েছিল?",['রেসকোর্স ময়দান (সোহরাওয়ার্দী উদ্যান)','পল্টন ময়দান','ঢাকা বিশ্ববিদ্যালয়','কেন্দ্রীয় শহীদ মিনার'],0,'বঙ্গবন্ধু শেখ মুজিবুর রহমান ১৯৭১ সালের ৭ই মার্চ তৎকালীন রেসকোর্স ময়দানে ঐতিহাসিক ভাষণ দেন।'],
  [3,0,'সংবিধান ও প্রশাসন',"গণপ্রজাতন্ত্রী বাংলাদেশের সংবিধান কোন তারিখ থেকে কার্যকর হয়?",['১৬ ডিসেম্বর ১৯৭২','২৬ মার্চ ১৯৭২','৪ নভেম্বর ১৯৭২','১০ জানুয়ারি ১৯৭২'],0,'১৯৭২ সালের ৪ নভেম্বর গণপরিষদে সংবিধান গৃহীত হয় এবং ১৬ ডিসেম্বর ১৯৭২ থেকে কার্যকর হয়।'],
  [3,1,'বিশ্ব',"সৌরজগতের বৃহত্তম গ্রহ কোনটি?",['পৃথিবী','মঙ্গল','শনি','বৃহস্পতি'],3,'বৃহস্পতি সৌরজগতের সর্ববৃহৎ গ্রহ।'],
  [3,1,'আন্তর্জাতিক সংস্থা',"জাতিসংঘের (United Nations) সদর দপ্তর কোথায় অবস্থিত?",['নিউইয়র্ক','জেনেভা','প্যারিস','লন্ডন'],0,'জাতিসংঘের মূল সদর দপ্তর মার্কিন যুক্তরাষ্ট্রের নিউইয়র্ক সিটিতে অবস্থিত।'],
  [3,2,'বিজ্ঞান',"পানির রাসায়নিক সংকেত কোনটি?",['CO₂','O₂','H₂O','NaCl'],2,'পানির একটি অণুতে দুটি হাইড্রোজেন এবং একটি অক্সিজেন পরমাণু থাকে, তাই সংকেত H₂O।'],
  [3,2,'তথ্যপ্রযুক্তি',"কম্পিউটারের ‘মস্তিষ্ক’ (Brain) বলা হয় কোন অংশটিকে?",['CPU','RAM','Hard Disk','Monitor'],0,'CPU (Central Processing Unit) কম্পিউটারের সকল নির্দেশনা প্রক্রিয়াকরণ ও নিয়ন্ত্রণ করে।']
].map((q,id)=>({id,subject:q[0],chapter:q[1],topic:q[2],text:q[3],options:q[4],answer:q[5],explanation:q[6]}));
const KEY='prosthuti-mvp-v1';let state;try{state=JSON.parse(localStorage.getItem(KEY))}catch{}if(!state||!Array.isArray(state.attempts))state={profile:{name:'',exam:'BCS Preliminary',minutes:30,date:''},attempts:[],saved:[],reviews:{},reports:[],session:null};
let page='home',filter='all',search='',bankTab='subjects',reviewTab='due',selection=null,guess=false,storageWarning=false,settingsExpanded=true,sidebarHidden=false,selectedSubject=null,openChapters={};
const $=s=>document.querySelector(s),formatNumber=n=>String(n),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{if(!storageWarning){storageWarning=true;toast('Browser storage unavailable: progress will only last for this session.')}}}function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3000)}
const dayKey=(date=new Date())=>date.toLocaleDateString('en-CA');const todayAttempts=()=>state.attempts.filter(a=>a.day===dayKey());const due=()=>Object.keys(state.reviews).map(Number).filter(id=>state.reviews[id].due<=Date.now());const accuracy=(a=state.attempts)=>a.length?Math.round(a.filter(x=>x.correct).length/a.length*100):0;const goal=()=>Number(state.profile.dailyGoal)||(state.profile.minutes===15?5:state.profile.minutes===60?16:10);
function streak(){const days=new Set(state.attempts.map(a=>a.day));let d=new Date(),n=0;if(!days.has(dayKey(d)))d.setDate(d.getDate()-1);while(days.has(dayKey(d))){n++;d.setDate(d.getDate()-1)}return n}
function nav(){const mobileItems=[['home','⌂','Home'],['bank','☰','Study'],['review','↻','Review'],['progress','▤','Progress'],['settings','⚙','Settings']];const settingsSubItems=[['preferences','Preferences'],['plan','Study plan'],['reminders','Reminders'],['data','Data & offline'],['about','About']];const sidebarItems=[['home','⌂','Today'],['bank','📖','Question bank'],['review','↻','Revision',due().length],['progress','📊','Progress'],['routine','📅','Study routine']];const mobNav=$('#mobile-nav');if(mobNav){mobNav.innerHTML='<div>'+mobileItems.map(([id,symbol,label])=>`<button data-action="navigate" data-page="${id}" class="${page===id?'on':''}" ${page===id?'aria-current="page"':''}><span>${symbol}</span>${label}</button>`).join('')+'</div>'}const sideNav=$('#sidebar-nav');if(sideNav){sideNav.classList.toggle('collapsed-sidebar',sidebarHidden);sideNav.innerHTML=`<div><div class="brand"><div class="brand-logo">P</div><div><div class="brand-title">Prosthuti</div><div class="brand-sub">A little progress every day</div></div><button class="icon-button sidebar-collapse-btn" data-action="toggle-sidebar" aria-label="Hide sidebar" title="Hide sidebar">‹</button></div><div class="sidebar-section-label">Your study space</div><div class="sidebar-menu">${sidebarItems.map(([id,symbol,label,badge])=>`<button data-action="navigate" data-page="${id}" class="sidebar-item ${page===id?'active':''}" ${page===id?'aria-current="page"':''}><span class="sidebar-icon">${symbol}</span><span class="sidebar-label">${label}</span>${badge?`<span class="badge">${badge}</span>`:''}</button>`).join('')}<div class="sidebar-group ${settingsExpanded?'open':''}"><button class="sidebar-item sidebar-parent ${page==='settings'?'active':''}" data-action="toggle-settings-sub" ${page==='settings'?'aria-current="page"':''}><span class="sidebar-icon">⚙</span><span class="sidebar-label">Settings</span><span class="chevron ${settingsExpanded?'expanded':''}">▾</span></button><div class="sidebar-sub-menu ${settingsExpanded?'':'hide-sub'}">${settingsSubItems.map(([id,label])=>`<button data-action="settings-sub" data-id="${id}" class="sidebar-sub-item ${page==='settings'&&typeof settingsTab!=='undefined'&&settingsTab===id?'active':''}"><span class="sidebar-sub-label">${label}</span></button>`).join('')}</div></div></div></div><div class="sidebar-footer-card"><div class="sidebar-card-icon">✦</div><b>Small steps. Real progress.</b><p class="fine" style="margin:4px 0 0">A little practice today, more confidence tomorrow.</p></div>`}const deskHeader=$('#desktop-header');if(deskHeader){const titles={home:'Today',bank:'Question bank',review:'Revision',progress:'Progress',routine:'Study routine',settings:'Settings',practice:'Practice',result:'Results'};const curSub=typeof settingsTab!=='undefined'?({'preferences':'Preferences','plan':'Study plan','reminders':'Reminders','data':'Data & offline','about':'About'}[settingsTab]||''):'';deskHeader.innerHTML=`<div class="desktop-header-left">${sidebarHidden?`<button class="icon-button sidebar-unhide-btn" data-action="toggle-sidebar" aria-label="Show sidebar" title="Show sidebar">☰</button>`:''}<div class="breadcrumbs"><span>My study space</span><span class="sep">/</span><b class="active-crumb">${titles[page]||'Today'}</b>${page==='settings'&&curSub?`<span class="sep">/</span><span class="active-crumb-sub">${curSub}</span>`:''}${page==='bank'&&selectedSubject!==null?`<span class="sep">/</span><span class="active-crumb-sub">${esc(subjects[selectedSubject].short)}</span>`:''}</div></div><div class="desktop-header-right"><span class="chip">Interactive demo</span><button class="exam-pill" data-action="settings">${esc(state.profile.exam||'BCS Preliminary')}</button><div class="user-avatar" title="${esc(state.profile.name||'User')}">${esc((state.profile.name||'P')[0].toUpperCase())}</div></div>`}}
function heading(title,subtitle){return `<div class="page-heading row sp"><div><h1>${title}</h1><div class="sub">${subtitle}</div></div></div>`}
function stats(){return `<div class="card row stats"><div class="stat"><b>${formatNumber(streak())}</b><span class="sub">day streak</span></div><div class="stat"><b>${state.attempts.length?formatNumber(accuracy())+'%':'—'}</b><span class="sub">accuracy</span></div><div class="stat"><b>${formatNumber(state.attempts.length)}</b><span class="sub">solved</span></div></div>`}
function subjectCard(s,i){
  let a=state.attempts.filter(a=>questions[a.id].subject===i);
  let seen=new Set(a.map(a=>a.id)).size;
  let total=questions.filter(q=>q.subject===i).length;
  let acc=a.length?accuracy(a):0;
  return `<div class="subject-card-v2">
    <div class="subject-card-top">
      <span class="subject-symbol-box" style="background:${s.color}">${s.symbol}</span>
      <div class="subject-card-meta">
        <h3>${esc(s.name)}</h3>
        <div class="subject-stats-row">
          <span class="tag">${formatNumber(s.chapters.length)} Chapters</span>
          <span class="tag">${formatNumber(s.topics.length)} Topics</span>
          <span class="tag">${formatNumber(total)} Questions</span>
        </div>
      </div>
    </div>
    <div class="bar" style="margin:2px 0"><i style="width:${total?seen/total*100:0}%"></i></div>
    <div class="subject-meta">
      <span>${formatNumber(seen)}/${formatNumber(total)} practiced</span>
      <span>${a.length?acc+'% accuracy':'Not started'}</span>
    </div>
    <div class="subject-card-actions">
      <button class="primary" data-action="open-subject" data-id="${i}">Explore Chapters & Topics</button>
      <button class="secondary" data-action="practice-subject" data-id="${i}" ${!total?'disabled':''}>Practice All (${total})</button>
    </div>
  </div>`;
}
function subjectDetailView(sIdx){
  const s=subjects[sIdx];
  if(!s)return bank();
  const subQ=questions.filter(q=>q.subject===sIdx);
  const subAttempts=state.attempts.filter(a=>questions[a.id].subject===sIdx);
  const seen=new Set(subAttempts.map(a=>a.id)).size;
  const acc=subAttempts.length?accuracy(subAttempts):0;
  return `<div class="back-btn-row">
    <button class="back-btn" data-action="back-subjects">‹ All Subjects</button>
    <span class="tag">${formatNumber(subQ.length)} questions available</span>
  </div>
  <div class="subject-hero">
    <div class="subject-hero-top">
      <span class="subject-hero-symbol" style="background:${s.color}">${s.symbol}</span>
      <div class="subject-hero-info">
        <h1>${esc(s.name)}</h1>
      </div>
    </div>
    <div class="subject-hero-stats">
      <div class="subject-hero-stat-item"><b>${formatNumber(s.chapters.length)}</b><span>Chapters</span></div>
      <div class="subject-hero-stat-item"><b>${formatNumber(s.topics.length)}</b><span>Topics</span></div>
      <div class="subject-hero-stat-item"><b>${formatNumber(seen)}/${formatNumber(subQ.length)}</b><span>Practiced</span></div>
      <div class="subject-hero-stat-item"><b>${subAttempts.length?acc+'%':'—'}</b><span>Accuracy</span></div>
    </div>
    <div class="subject-hero-actions">
      <button class="primary full" data-action="practice-subject" data-id="${sIdx}" ${!subQ.length?'disabled':''}>
        Practice Entire Subject (${formatNumber(subQ.length)} Questions)
      </button>
    </div>
  </div>
  <div class="section-heading">
    <h2>Chapters & Topics</h2>
  </div>
  <div class="chapters-container">
    ${s.chapters.map((chap,cIdx)=>chapterRow(sIdx,chap,cIdx)).join('')}
  </div>`;
}
function chapterRow(sIdx,chap,cIdx){
  const key=`${sIdx}-${cIdx}`;
  const isExpanded=openChapters[key]!==false;
  const chapQ=questions.filter(q=>q.subject===sIdx&&q.chapter===cIdx);
  const chapAttempts=state.attempts.filter(a=>questions[a.id].subject===sIdx&&questions[a.id].chapter===cIdx);
  const chapSeen=new Set(chapAttempts.map(a=>a.id)).size;
  const acc=chapAttempts.length?accuracy(chapAttempts):0;
  const isMastered=chapQ.length>0&&chapSeen===chapQ.length&&acc>=80;
  return `<section class="chapter-panel ${isExpanded?'expanded':''}">
    <div class="chapter-header" data-action="toggle-chapter" data-key="${key}" role="button" aria-expanded="${isExpanded}">
      <div class="chapter-header-left">
        <span class="chapter-num-badge">CHAPTER ${String(cIdx+1).padStart(2,'0')}</span>
        <div class="chapter-title-wrap">
          <h3>${esc(chap.title)}</h3>
          <div class="sub-title">${formatNumber(chap.topics.length)} topics · ${formatNumber(chapQ.length)} questions</div>
        </div>
      </div>
      <div class="chapter-header-right">
        <span class="status-pill ${isMastered?'mastered':chapAttempts.length?'review':'new'}">
          ${isMastered?'✓ Mastered':chapAttempts.length?acc+'% accuracy':'Not started'}
        </span>
        <button class="secondary topic-btn" data-action="practice-chapter" data-subject="${sIdx}" data-chapter="${cIdx}" ${!chapQ.length?'disabled':''} title="Practice all questions from ${esc(chap.title)}">
          Practice Chapter
        </button>
        <span class="chapter-toggle-btn">${isExpanded?'▲':'▼'}</span>
      </div>
    </div>
    ${isExpanded?`<div class="topics-list">
      ${chap.topics.map(topic=>topicRow(sIdx,cIdx,topic)).join('')}
    </div>`:''}
  </section>`;
}
function topicRow(sIdx,cIdx,topic){
  const topQ=questions.filter(q=>q.subject===sIdx&&q.topic===topic.name);
  const topAttempts=state.attempts.filter(a=>questions[a.id].subject===sIdx&&questions[a.id].topic===topic.name);
  const topSeen=new Set(topAttempts.map(a=>a.id)).size;
  const acc=topAttempts.length?accuracy(topAttempts):0;
  const isMastered=topQ.length>0&&topSeen===topQ.length&&acc>=80;
  return `<div class="topic-row">
    <div class="topic-info">
      <span class="topic-bullet"></span>
      <div class="topic-details">
        <b>${esc(topic.name)}</b>
        <small>${formatNumber(topQ.length)} questions${topSeen?` · ${topSeen} solved`:''}</small>
      </div>
    </div>
    <div class="topic-actions">
      <span class="status-pill ${isMastered?'mastered':topAttempts.length?'review':'new'}">
        ${isMastered?'✓ Mastered':topAttempts.length?acc+'% correct':'Ready'}
      </span>
      <button class="primary topic-btn" data-action="practice-topic" data-subject="${sIdx}" data-topic="${esc(topic.name)}" ${!topQ.length?'disabled':''}>
        Practice Topic
      </button>
    </div>
  </div>`;
}
function syllabusView(){
  return `<div class="section-heading">
    <h2>Complete Exam Syllabus Breakdown</h2>
  </div>
  ${subjects.map((s,sIdx)=>`
    <div style="margin-bottom:28px">
      <div class="row sp" style="align-items:center;margin-bottom:12px;padding:8px 0;border-bottom:2px solid var(--line)">
        <div class="row">
          <span class="subject-symbol-box" style="background:${s.color};width:34px;height:34px;font-size:16px">${s.symbol}</span>
          <div>
            <h2 style="margin:0;font-size:calc(17px * var(--font-scale,1));color:var(--ink)">${esc(s.name)}</h2>
            <div class="sub">${formatNumber(s.chapters.length)} Chapters · ${formatNumber(s.topics.length)} Topics</div>
          </div>
        </div>
        <button class="secondary topic-btn" data-action="open-subject" data-id="${sIdx}">Open Subject View</button>
      </div>
      <div class="chapters-container">
        ${s.chapters.map((chap,cIdx)=>chapterRow(sIdx,chap,cIdx)).join('')}
      </div>
    </div>
  `).join('')}`;
}
function searchView(qStr){
  const term=qStr.toLowerCase().trim();
  const matchedSubjects=subjects.filter((s,i)=>s.name.toLowerCase().includes(term)||(s.bengali&&s.bengali.toLowerCase().includes(term)));
  const matchedChapters=[];
  const matchedTopics=[];
  const matchedQuestions=questions.filter(q=>q.text.toLowerCase().includes(term)||q.options.some(o=>o.toLowerCase().includes(term))||q.explanation.toLowerCase().includes(term));
  subjects.forEach((s,sIdx)=>{
    s.chapters.forEach((c,cIdx)=>{
      if(c.title.toLowerCase().includes(term)||(c.english&&c.english.toLowerCase().includes(term))){
        matchedChapters.push({sIdx,cIdx,subject:s,chapter:c});
      }
      c.topics.forEach(t=>{
        if(t.name.toLowerCase().includes(term)||(t.english&&t.english.toLowerCase().includes(term))){
          matchedTopics.push({sIdx,cIdx,subject:s,chapter:c,topic:t});
        }
      });
    });
  });
  const totalResults=matchedSubjects.length+matchedChapters.length+matchedTopics.length+matchedQuestions.length;
  if(!totalResults){
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
  ${matchedTopics.length?`
    <div class="section-heading"><h2>Matched Topics (${matchedTopics.length})</h2></div>
    <div class="panel" style="padding:0;overflow:hidden">
      ${matchedTopics.map(({sIdx,cIdx,subject,chapter,topic})=>`
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
      `).join('')}
    </div>
  `:''}
  ${matchedChapters.length?`
    <div class="section-heading"><h2>Matched Chapters (${matchedChapters.length})</h2></div>
    <div class="chapters-container">
      ${matchedChapters.map(({sIdx,cIdx,chapter})=>chapterRow(sIdx,chapter,cIdx)).join('')}
    </div>
  `:''}
  ${matchedQuestions.length?`
    <div class="section-heading"><h2>Matched Questions (${matchedQuestions.length})</h2></div>
    <div class="panel">
      ${matchedQuestions.map(q=>`
        <div class="review-row row between">
          <div>
            <span class="tag">${subjects[q.subject].short} · ${subjects[q.subject].chapters[q.chapter]?.title||''} › ${q.topic}</span>
            <h3 style="margin-top:9px">${q.text}</h3>
          </div>
          <button class="secondary" data-action="single" data-id="${q.id}">Practice</button>
        </div>
      `).join('')}
    </div>
  `:''}`;
}
function home(){const count=todayAttempts().length,target=goal(),daysLeft=state.profile.date?Math.max(0,Math.ceil((dateFromKey(state.profile.date)-dateFromKey(dayKey()))/86400000)):null;return heading(`Welcome${state.profile.name?' back, '+esc(state.profile.name):''}`,`${esc(state.profile.exam)}${daysLeft===null?'':' · '+daysLeft+' days left'}`)+`<div class="home-layout"><div class="home-main">${stats()}<div class="card daily-card"><b>Today's ${target}</b><div class="sub" style="margin:2px 0 8px">${count>=target?'Daily goal complete':'Auto-picked for you'} · ${count}/${target} done</div><div class="row daily-tags"><span class="chip w">${due().length} due for review</span><span class="chip">${target} question goal</span></div><button class="cta" data-action="${state.session?'resume':'daily'}">${state.session?'Continue':count>=target?'Practice more':'Start'} · ~${state.profile.minutes} min</button><button class="text-button" data-action="short">Short on time? Try 5 questions</button></div>${state.session?`<button class="card source-link row sp" data-action="resume"><div><b>Continue</b><div class="sub">${esc(sessionTitle(state.session.title))} · Q ${state.session.index+1} / ${state.session.ids.length}</div></div><span>›</span></button>`:''}<h2>Today's routine</h2>${dailyRoutineCard()}</div><div class="home-aside"><div class="card home-aside-card"><div class="section-heading" style="margin:0 0 10px"><h2>Quick explore</h2></div><button class="source-link row sp" data-action="navigate" data-page="bank"><div><b>Browse subjects</b><div class="sub">Bangla · English · GK · Math</div></div><span>›</span></button><button class="source-link row sp" data-action="navigate" data-page="routine"><div><b>Study routine</b><div class="sub">Daily · Weekly · Monthly plan</div></div><span>›</span></button><button class="source-link row sp" data-action="navigate" data-page="progress"><div><b>Study calendar</b><div class="sub">Your practice activity and progress</div></div><span>›</span></button></div><div class="card home-aside-card"><div class="row between"><h2>Revision focus</h2><span class="tag ${due().length?'amber':''}">${due().length} due</span></div><p class="muted" style="margin:8px 0 12px">${due().length?due().length+' questions are ready to practice and strengthen your concepts.':'No pending mistakes. Great consistency!'}</p><button class="secondary full" data-action="navigate" data-page="review">Open revision</button></div></div></div>`}
function bank(){
  if(selectedSubject!==null)return subjectDetailView(selectedSubject);
  if(search.trim()){
    return heading('Question bank','Search questions, topics and chapters.')+
      `<div class="toolbar">
        <input class="search" id="search" aria-label="Search questions and topics" placeholder="Search subjects, chapters, topics..." value="${esc(search)}">
        <select id="subject-filter" aria-label="Choose a subject">
          <option value="all">All subjects</option>
          ${subjects.map((s,i)=>`<option value="${i}" ${filter==i?'selected':''}>${s.short}</option>`).join('')}
        </select>
      </div>`+searchView(search);
  }
  let list=subjects.map((s,i)=>({s,i})).filter(({s,i})=>(filter==='all'||+filter===i));
  return heading('Question bank','Choose a subject to practice.')+
    `<div class="tabs">
      <button class="tab ${bankTab==='subjects'?'active':''}" data-action="bank-tab" data-id="subjects">By Subject</button>
      <button class="tab ${bankTab==='syllabus'?'active':''}" data-action="bank-tab" data-id="syllabus">Full Syllabus</button>
      <button class="tab ${bankTab==='papers'?'active':''}" data-action="bank-tab" data-id="papers">Mock test</button>
    </div>
    ${bankTab==='subjects'?`
      <div class="toolbar">
        <input class="search" id="search" aria-label="Search questions and topics" placeholder="Search subjects, chapters, topics..." value="${esc(search)}">
        <select id="subject-filter" aria-label="Choose a subject">
          <option value="all">All subjects</option>
          ${subjects.map((s,i)=>`<option value="${i}" ${filter==i?'selected':''}>${s.short}</option>`).join('')}
        </select>
      </div>
      <div class="bank-grid">
        ${list.length?list.map(({s,i})=>subjectCard(s,i)).join(''):'<div class="empty"><h3>No subjects found</h3></div>'}
      </div>
    `:bankTab==='syllabus'?syllabusView():`
      <div class="panel">
        <span class="chip">Demo model test</span>
        <h2 style="margin-top:16px">Put your preparation to the test</h2>
        <p class="muted">Mixed questions from all subjects & chapters · 10 minutes · 1 point per correct answer<br>No negative marking in this demo. Explanations appear after the test.</p>
        <button class="primary" data-action="exam">Start mock test</button>
      </div>
    `}
    <div class="demo-note">4 Subjects · 15 Chapters · 39 Topics</div>`;
}
function review(){let ids=reviewTab==='saved'?state.saved:reviewTab==='all'?Object.keys(state.reviews).map(Number):due();return heading('Revisit. Understand. Improve.','Build confidence with questions you missed or guessed.')+`<div class="tabs">${[['due','Due today'],['all','All mistakes'],['saved','Saved']].map(([id,label])=>`<button class="tab ${reviewTab===id?'active':''}" data-action="review-tab" data-id="${id}">${label}</button>`).join('')}</div>${ids.length?`<div class="row between" style="margin:20px 0"><p class="muted" style="margin:0">${formatNumber(ids.length)} questions</p><button class="primary" data-action="review-start">Practice all</button></div><div class="panel">${ids.map(id=>`<div class="review-row row between"><div><span class="tag">${subjects[questions[id].subject].short} · ${questions[id].topic}</span><h3 style="margin-top:9px">${questions[id].text}</h3><p>${reviewTab==='saved'?'Saved for later':state.reviews[id].due<=Date.now()?'Ready to practice':'Next review: '+new Date(state.reviews[id].due).toLocaleDateString('en-GB')}</p></div><button class="secondary" data-action="single" data-id="${id}">Practice</button></div>`).join('')}</div>`:`<div class="empty"><span style="font-size:36px;color:#89a36e">✓</span><h3>${reviewTab==='saved'?'No saved questions yet':'You are all caught up'}</h3><p>${reviewTab==='saved'?'Tap ☆ during practice to save a question.':'Questions you miss during practice will appear here.'}</p><button class="primary" data-action="daily">Start practicing</button></div>`}${state.reports.length?`<div class="section-heading"><h2>Your demo reports</h2></div><div class="panel">${state.reports.map(r=>`<div class="review-row"><b>${esc(r.type)}</b><p>${esc(r.detail||questions[r.id].text)}</p><span class="tag">Saved in this browser</span></div>`).join('')}</div>`:''}`}
function progress(){let days=[];for(let i=6;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);days.push({label:d.toLocaleDateString('en-GB',{weekday:'short'}),count:state.attempts.filter(a=>a.day===dayKey(d)).length})}let max=Math.max(5,...days.map(d=>d.count));return heading('Your progress','Your effort, reflected in your own results.')+studyCalendar()+stats()+`<div class="progress-grid"><div class="panel"><h2>Practice this week</h2><p class="fine">Questions answered each day</p><div class="chart">${days.map(d=>`<div class="chart-col"><b>${formatNumber(d.count)}</b><i style="height:${d.count/max*120}px"></i><span>${d.label}</span></div>`).join('')}</div></div><div class="panel"><h2>Accuracy by subject</h2>${subjects.map((s,i)=>{let a=state.attempts.filter(a=>questions[a.id].subject===i);return `<div class="progress-topic"><div class="row between"><span>${s.short}</span><b>${a.length?formatNumber(accuracy(a))+'%':'—'}</b></div><div class="bar" style="margin-top:8px"><i style="width:${accuracy(a)}%"></i></div><span class="fine">${formatNumber(a.length)} answers${a.length<5?' · More practice needed':''}</span></div>`}).join('')}</div></div><div class="section-heading"><h2>Recent practice</h2></div>${state.attempts.length?`<div class="panel">${state.attempts.slice(-6).reverse().map(a=>`<div class="review-row row between"><div><h3>${questions[a.id].text}</h3><span class="fine">${subjects[questions[a.id].subject].short} · ${new Date(a.at).toLocaleDateString('en-GB')}</span></div><span class="tag ${a.correct?'':'amber'}">${a.correct?'Correct':a.choice===null?'Skipped':'Review again'}</span></div>`).join('')}</div>`:'<div class="empty"><h3>Your first chapter starts here</h3><p>Complete a practice session to see your results here.</p><button class="primary" data-action="daily">Start your first session</button></div>'}`}
function start(ids,title,mode='practice'){if(state.session){toast('You have an unfinished session. Complete it before starting a new one.');navigate('practice');return}state.session={ids,title,mode,index:0,answers:[],startedAt:Date.now(),deadline:mode==='exam'?Date.now()+600000:null};selection=null;guess=false;save();navigate('practice')}
function daily(short=false){const attempted=new Set(state.attempts.map(a=>a.id));let ids=[...new Set([...due(),...questions.filter(q=>state.profile.focus?.includes(q.subject)&&!attempted.has(q.id)).map(q=>q.id),...questions.filter(q=>!attempted.has(q.id)).map(q=>q.id),...questions.map(q=>q.id)])].slice(0,short?5:goal());start(ids,short?'5-minute practice':'Today’s practice')}
const sessionTitle=title=>({"বাংলা ভাষা ও সাহিত্য": "Bangla Language & Literature", "গাণিতিক যুক্তি": "Mathematical Reasoning", "সাধারণ জ্ঞান": "General Knowledge", "রিভিশন": "Revision", "৫ মিনিটের ছোট অনুশীলন": "5-minute practice", "আজকের অনুশীলন": "Today’s practice", "নতুন কিছু শেখা": "Learn something new", "প্রস্তুতি মডেল টেস্ট": "Prosthuti mock test"})[title]||title;
function practice(){let s=state.session;if(!s)return '<div class="empty"><h3>Ready to learn something new?</h3><button class="primary" data-action="daily">Start practicing</button></div>';const q=questions[s.ids[s.index]],a=s.answers[s.index],reveal=a&&s.mode!=='exam',marked=state.saved.includes(q.id);return `<div class="practice-wrap"><div class="row between practice-header"><div><button class="text-button" data-action="pause">Save & exit</button><h2 style="margin:7px 0 0">${esc(sessionTitle(s.title))}</h2></div><div class="row"><span class="tag" id="session-time">${s.mode==='exam'?'Time left':'At your own pace'}</span><button class="icon-button" data-action="bookmark" aria-label="${marked?'Remove bookmark':'Bookmark question'}" aria-pressed="${marked}">${marked?'★':'☆'}</button></div></div><div class="row between"><span class="fine">Question ${formatNumber(s.index+1)} / ${formatNumber(s.ids.length)}</span><span class="fine">${subjects[q.subject].short} · ${q.topic}</span></div><div class="bar" style="height:6px"><i style="width:${s.index/s.ids.length*100}%"></i></div><section class="question-card"><span class="chip">${s.mode==='exam'?'Mock test':'Practice'} · Demo</span><h2>${q.text}</h2><div class="options">${q.options.map((o,i)=>`<button class="option ${selection===i?'selected':''} ${reveal&&i===q.answer?'correct':''} ${reveal&&a.choice===i&&!a.correct?'wrong':''}" data-action="select" data-id="${i}" ${a?'disabled':''}><em>${'ABCD'[i]}</em><span>${o}</span>${reveal&&i===q.answer?'<span style="margin-left:auto">✓</span>':''}</button>`).join('')}</div>${reveal?`<div class="feedback ${a.correct?'':'wrong'}" role="status"><b>${a.correct?'Correct!':a.choice===null?'Let’s work through the answer.':'Good effort. Let’s understand why.'}</b><p>${q.explanation}</p></div>`:''}${!a?`<div class="question-actions"><label class="guess"><input type="checkbox" id="guess" ${guess?'checked':''}> I am guessing</label><button class="text-button" data-action="skip">Not sure / Skip</button></div>`:''}<div class="question-actions">${a?`<button class="text-button" data-action="report">Report an issue</button><button class="primary" data-action="next">${s.index===s.ids.length-1?'View results':'Next question'}</button>`:`<span class="fine">${s.mode==='exam'?'Explanations appear after the test':'Submit to see the explanation'}</span><button class="primary" data-action="submit" ${selection===null?'disabled':''}>Submit answer</button>`}</div></section></div>`}
function submit(choice){let s=state.session;if(!s||s.answers[s.index])return;let q=questions[s.ids[s.index]],a={id:q.id,choice,correct:choice===q.answer,guess,at:Date.now(),day:dayKey()};s.answers.push(a);if(s.mode!=='exam')record(a);save();render();}
function record(a){state.attempts.push(a);if(!a.correct||a.guess)state.reviews[a.id]={due:Date.now(),level:0};else if(state.reviews[a.id]){let level=Math.min((state.reviews[a.id].level||0)+1,4);state.reviews[a.id]={due:Date.now()+[1,3,7,21,30][level-1]*86400000,level}}}
function finish(){let s=state.session;if(!s)return;if(s.mode==='exam'){while(s.answers.length<s.ids.length){s.answers.push({id:s.ids[s.answers.length],choice:null,correct:false,guess:false,at:Date.now(),day:dayKey()})}s.answers.forEach(record)}if(s.routineTask){state.completedTasks[s.routineTask]=true;}state.lastResult={...s,endedAt:Date.now()};state.session=null;save();navigate('result')}
function result(){const r=state.lastResult;if(!r)return '<div class="empty"><h3>No completed sessions yet</h3><button class="primary" data-action="daily">Start</button></div>';let correct=r.answers.filter(a=>a.correct).length,wrong=r.answers.filter(a=>!a.correct&&a.choice!==null).length,skip=r.answers.filter(a=>a.choice===null).length,p=Math.round(correct/r.ids.length*100);return `<div class="result"><span class="tag">${r.mode==='exam'?'Mock test':'Practice'} complete</span><h1 style="margin-top:16px">One more step forward!</h1><p class="muted">${esc(sessionTitle(r.title))} · ${formatNumber(r.ids.length)} questions</p><div class="panel"><div class="circle-progress" style="--angle:${p*3.6}deg"><div><b>${formatNumber(p)}%</b><small>Correct answers</small></div></div><div class="stats"><div><h2>${formatNumber(correct)}</h2><span class="muted">Correct</span></div><div><h2>${formatNumber(wrong)}</h2><span class="muted">Incorrect</span></div><div><h2>${formatNumber(skip)}</h2><span class="muted">Skipped</span></div></div><p class="muted">${wrong+skip?'Missed and skipped questions have been added to revision.':'Great work! Keep practicing regularly.'}</p><div class="result-actions"><a class="primary" href="#review">View revision</a><a class="secondary" href="#home">Back to today</a></div></div></div><div class="practice-wrap"><h2>Answers & explanations</h2>${r.answers.map(a=>{let q=questions[a.id];return `<div class="panel" style="margin-bottom:12px"><span class="tag ${a.correct?'':'amber'}">${a.correct?'Correct':a.choice===null?'Skipped':'Incorrect answer'}</span><h3 style="margin-top:13px">${q.text}</h3><p class="fine">Your answer: ${a.choice===null?'Not answered':q.options[a.choice]}</p><p style="margin-bottom:0">${q.explanation}</p></div>`}).join('')}</div>`}
function render(){nav();$('#main').innerHTML=({home,bank,review,progress,routine,practice,result,settings}[page]||home)();applyPreferences();updateTimer()}
function navigate(id){if(location.hash==='#'+id){page=id;render()}else location.hash=id;window.scrollTo({top:0,behavior:'instant'})}
window.addEventListener('hashchange',()=>{page=location.hash.slice(1)||'home';selection=null;guess=false;render();window.scrollTo(0,0)});
document.addEventListener('click',e=>{let b=e.target.closest('[data-action]');if(!b)return;let act=b.dataset.action,id=Number(b.dataset.id);if(act==='navigate'){if(b.dataset.page==='bank')selectedSubject=null;navigate(b.dataset.page)}else if(act==='daily')daily();else if(act==='short')daily(true);else if(act==='mixed')start(questions.filter(q=>q.subject!==0).map(q=>q.id).slice(0,6),'Learn something new');else if(act==='subject'||act==='open-subject'){selectedSubject=id;render();window.scrollTo(0,0)}else if(act==='back-subjects'){selectedSubject=null;render();window.scrollTo(0,0)}else if(act==='toggle-chapter'){const k=b.dataset.key;openChapters[k]=(openChapters[k]===false)?true:false;render()}else if(act==='practice-subject'){const ids=questions.filter(q=>q.subject===id).map(q=>q.id);if(ids.length)start(ids,subjects[id].name)}else if(act==='practice-chapter'){const sId=Number(b.dataset.subject),cId=Number(b.dataset.chapter);const ids=questions.filter(q=>q.subject===sId&&q.chapter===cId).map(q=>q.id);const t=subjects[sId].chapters[cId]?.title||'Chapter';if(ids.length)start(ids,`${subjects[sId].short}: ${t}`)}else if(act==='practice-topic'){const sId=Number(b.dataset.subject),topName=b.dataset.topic;const ids=questions.filter(q=>q.subject===sId&&q.topic===topName).map(q=>q.id);if(ids.length)start(ids,`${subjects[sId].short}: ${topName}`)}else if(act==='clear-search'){search='';render()}else if(act==='resume')navigate('practice');else if(act==='pause'){save();navigate('home');toast('Your place is saved. Pick up where you left off.')}else if(act==='review')navigate('review');else if(act==='single')start([id],'Revision');else if(act==='review-start'){let ids=reviewTab==='saved'?state.saved:reviewTab==='all'?Object.keys(state.reviews).map(Number):due();if(ids.length)start([...ids],'Revision')}else if(act==='bank-tab'){bankTab=b.dataset.id;selectedSubject=null;render()}else if(act==='review-tab'){reviewTab=b.dataset.id;render()}else if(act==='select'){selection=id;render()}else if(act==='submit'){if(selection!==null)submit(selection)}else if(act==='skip')submit(null);else if(act==='next'){if(state.session.index+1>=state.session.ids.length)finish();else{state.session.index++;selection=null;guess=false;save();render();window.scrollTo(0,0)}}else if(act==='bookmark'){let q=state.session.ids[state.session.index];state.saved=state.saved.includes(q)?state.saved.filter(x=>x!==q):[...state.saved,q];save();render();toast(state.saved.includes(q)?'Question bookmarked':'Bookmark removed')}else if(act==='exam')start(questions.map(q=>q.id),'Prosthuti mock test','exam');else if(act==='toggle-settings-sub'){settingsExpanded=!settingsExpanded;render();}else if(act==='settings-sub'){settingsTab=b.dataset.id;settingsExpanded=true;navigate('settings');}else if(act==='toggle-sidebar'){sidebarHidden=!sidebarHidden;render();}else if(act==='settings'){if(b.textContent.includes('target')||b.textContent.includes('Target'))settingsTab='plan';navigate('settings');}else if(act==='report')$('#report-dialog').showModal();else if(act==='close-report')$('#report-dialog').close()});
document.addEventListener('input',e=>{if(e.target.id==='search'){let pos=e.target.selectionStart;search=e.target.value;render();$('#search').focus();$('#search').setSelectionRange(pos,pos)}});document.addEventListener('change',e=>{if(e.target.id==='subject-filter'){filter=e.target.value;render()}if(e.target.id==='guess')guess=e.target.checked});
$('#report-form').addEventListener('submit',e=>{e.preventDefault();if(!state.session)return;let f=new FormData(e.target);state.reports.push({id:state.session.ids[state.session.index],type:f.get('type'),detail:f.get('detail'),at:Date.now()});save();$('#report-dialog').close();e.target.reset();toast('Demo report saved in this browser')});
function updateTimer(){let s=state.session;if(!s||s.mode!=='exam')return;let remaining=Math.max(0,Math.ceil((s.deadline-Date.now())/1000));if(!remaining){finish();toast('Time is up. Your test has been submitted.');return}let el=$('#session-time');if(el)el.textContent=`Time left ${formatNumber(Math.floor(remaining/60))}:${formatNumber(String(remaining%60).padStart(2,'0'))}`}

if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'get_study_progress',description:'Read actual browser-local study progress and revision counts.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(input){if(!input||typeof input!=='object'||Object.keys(input).length)throw new Error('Expected empty object');return {attempts:state.attempts.length,accuracy:accuracy(),due:due().length,today:todayAttempts().length}}})).catch(()=>{})}catch{}}
