# Clean Frontend Architecture — Component & Design System Guide

> Designed from a **15+ Years Senior Software Engineer** perspective:  
> Focus on **high readability**, **zero bloat**, **strict separation of concerns**, and **long-term maintainability**.

---

## 📁 1. Directory Structure (ক্যাটাগরি ভিত্তিক ডিরেক্টরি কাঠামো)

```text
it-prostuti/
├── app/                          # Next.js App Router shell
│   ├── layout.tsx                # Metadata, existing CSS and runtime loading
│   └── page.tsx                  # Existing Student Web DOM shell
├── public/                       # Generated browser runtime and offline worker
├── package.json                  # Local development and production commands
├── examples/
│   └── ui-kit.html               # UI kit demo ও showcase
├── src/
│   ├── app/
│   │   └── style.css             # Existing application CSS, unchanged
│   ├── student/                  # TypeScript browser runtime
│   │   ├── app.ts                # Main application and screen templates
│   │   ├── demo-content.ts       # Existing local demo data
│   │   ├── learning.ts           # Reading, papers, practice and backup
│   │   ├── study.ts              # Preferences, routine and startup
│   │   └── types.d.ts            # Shared runtime types
│   │
│   ├── index.js                  # Master Barrel Export (এক জায়গা থেকে সহজে ব্যবহারের জন্য)
│   ├── styles.css                # একীভূত স্টাইলশিট বান্ডেল
│   │
│   ├── core/                     # মৌলিক ইউটিলিটি ও আর্কিটেকচার ফাউন্ডেশন
│   │   ├── dom.js                # নিরাপদ ও পরিচ্ছন্ন DOM এলিমেন্ট তৈরির হেল্পার
│   │   └── eventBus.js           # ডিকাপলড পাব-সাব ইভেন্ট বাস
│   │
│   ├── theme/                    # থিম ও ডিজাইন টোকেন
│   │   ├── colors.js             # কালার প্যালেট (Brand, Semantic, Surface, Neutrals)
│   │   ├── typography.js         # ফন্ট সাইজ স্কেল, ফন্ট ফ্যামিলি, ওয়েট ও লাইন হাইট
│   │   ├── theme.css             # সিএসএস কাস্টম ভ্যারিয়েবল (CSS Variables)
│   │   └── themeManager.js       # লাইট/ডার্ক মোড টগল, পারসিস্টেন্স এবং সিস্টেম প্রিফারেন্স
│   │
│   ├── localization/             # বহুভাষিক সাপোর্ট (Multi-language / i18n)
│   │   ├── i18n.js               # ট্রান্সলেশন ম্যানেজার (ডট-নোটেশন, ইন্টারপোলেশন, অটো ডম আপডেট)
│   │   └── languages/            # প্রতিটি ভাষার আলাদা ডিকশনারি
│   │       ├── en.js             # English translations
│   │       └── bn.js             # বাংলা অনুবাদ
│   │
│   ├── widgets/                  # রিইউজেবল ইউআই উইজেটসমূহ (UI Widgets)
│   │   ├── container/            # কার্ড, প্যানেল ও সেকশন কনটেইনার
│   │   │   ├── Container.js
│   │   │   └── container.css
│   │   ├── button/               # প্রাইমারি, সেকেন্ডারি, আউটলাইন, লোডিং বাটন
│   │   │   ├── Button.js
│   │   │   └── button.css
│   │   ├── chip/                 # ফিল্টার চিপ, স্ট্যাটাস ব্যাজ ও রিমুভেবল ট্যাগ
│   │   │   ├── Chip.js
│   │   │   └── chip.css
│   │   ├── dialog/               # মডাল ডায়ালগ, এলার্ট ও কনফার্ম প্রম্পট
│   │   │   ├── Dialog.js
│   │   │   └── dialog.css
│   │   └── snackbar/             # টোস্ট / স্ন্যাক মেসেজ কিউ ও নোটিফিকেশন
│   │       ├── Snackbar.js
│   │       └── snackbar.css
│   │
│   └── errors/                   # এরর হ্যান্ডলিং ও ডিসপ্যাচার
│       ├── AppError.js           # কাস্টম এরর ক্লাস (Network, Validation, NotFound, Auth)
│       └── errorHandler.js       # সেন্ট্রালাইজড এরর হ্যান্ডলার ও গ্লোবাল ক্যাচার
```

---

## Running locally

Use `npm ci` and `npm run dev` to run Student Web at `http://localhost:3000`.
Use `npm run build` and `npm start` for production. See [README.md](README.md)
for checks and migration details.

`app/` owns the Next.js shell. `src/student/` owns the existing browser-rendered
screens, now compiled from TypeScript in their original execution order.
`src/app/style.css` remains the application stylesheet. Browser storage and
hash navigation retain their previous formats.

The reusable UI kit remains in the other `src/` folders and is not imported by
Student Web. Its standalone example can still be served separately for local
inspection. The old `.openai/hosting.json` static-root configuration does not
build or serve the Next.js application.

## 🚀 2. Quick Usage Guide (সহজ ব্যবহারের নিয়মাবলী)

সবকিছু সরাসরি `src/index.js` থেকে ইমপোর্ট করা যাবে:

```javascript
import {
  themeManager,
  i18n,
  Button,
  Chip,
  Container,
  Dialog,
  Snackbar,
  errorHandler,
  NetworkError
} from './src/index.js';
```

---

### 🎨 ৩. থিম ম্যানেজমেন্ট (Theme)
```javascript
// লাইট ও ডার্ক মোড টগল করুন
themeManager.toggleTheme();

// নির্দিষ্ট থিম সেট করুন
themeManager.setTheme('dark'); // 'light' | 'dark' | 'system'
```

---

### 🌐 ৪. মাল্টি-ল্যাঙ্গুয়েজ (Localization / i18n)
```javascript
// ভাষা পরিবর্তন করুন
i18n.setLanguage('bn'); // অথবা 'en'

// অনুবাদ পেতে
console.log(i18n.t('common.save')); // সংরক্ষণ করুন
console.log(i18n.t('dialog.confirmTitle')); // নিশ্চিতকরণ

// অটোমেটিক HTML অনুবাদ (HTML ট্যাগগুলোতে data-i18n="key" ব্যবহার করুন):
// <h1 data-i18n="app.title"></h1>
i18n.updateDom();
```

---

### 🧩 ৫. রিইউজেবল উইজেটস (Reusable Widgets)

#### ক. Button (বাটন)
```javascript
const myButton = new Button({
  label: 'Submit Application',
  variant: 'primary', // 'primary' | 'secondary' | 'outline' | 'danger'
  size: 'md',         // 'sm' | 'md' | 'lg'
  onClick: (event, btn) => {
    btn.setLoading(true); // লোডিং স্পিনার শুরু
    setTimeout(() => btn.setLoading(false), 2000);
  }
});

document.body.appendChild(myButton.getElement());
```

#### খ. Chip (ট্যাগ ও ফিল্টার)
```javascript
const filterChip = new Chip({
  label: 'React / JS',
  variant: 'primary',
  selectable: true,
  onClick: (selected) => {
    console.log('Active status:', selected);
  }
});
```

#### গ. Container (কনটেইনার ও কার্ড)
```javascript
const card = new Container({
  title: 'প্রোফাইল সেটিংস',
  subtitle: 'আপনার অ্যাকাউন্ট তথ্য পরিবর্তন করুন',
  variant: 'surface', // 'surface' | 'elevated' | 'outlined' | 'flat'
  content: '<p>ফর্ম ফিল্ডসমূহ এখানে থাকবে</p>',
  footer: myButton.getElement()
});
```

#### ঘ. Snackbar (স্ন্যাক মেসেজ)
```javascript
// সহজ ও এক লাইনের কল
Snackbar.success('সফলভাবে সংরক্ষিত হয়েছে!');
Snackbar.error('সার্ভারে সমস্যা হয়েছে!');
Snackbar.warning('অনুগ্রহ করে সঠিক তথ্য দিন');

// অ্যাকশন বাটন সহ
Snackbar.show({
  message: 'আইটেমটি মুছে ফেলা হয়েছে',
  action: {
    label: 'পূর্বাবস্থায় নিন (Undo)',
    onClick: () => console.log('Restored')
  }
});
```

#### ঙ. Dialog (ডায়ালগ ও মডাল)
```javascript
// সহজ প্রমিজ-ভিত্তিক কনফার্মেশন ডায়ালগ
const confirmed = await Dialog.confirm({
  title: 'মুছে ফেলার নিশ্চিতকরণ',
  message: 'আপনি কি নিশ্চিত যে এই ফাইলটি মুছে ফেলতে চান?',
  variant: 'danger',
  confirmText: 'হ্যাঁ, মুছুন',
  cancelText: 'বাতিল'
});

if (confirmed) {
  Snackbar.success('মুছে ফেলা সম্পন্ন!');
}
```

---

### 🛡️ ৬. সেন্ট্রালাইজড এরর হ্যান্ডলিং (Error Handling)
```javascript
// ১. গ্লোবাল উইন্ডো এরর ক্যাপচারার চালু করুন
errorHandler.initGlobalCatchers();

// ২. কাস্টম টাইপড এরর থ্রো ও হ্যান্ডেল করুন
try {
  throw new NetworkError();
} catch (err) {
  // errorHandler স্বয়ংক্রিয়ভাবে অনুবাদ খুঁজে ইউজারকে স্ন্যাকবারে সুন্দর মেসেজ দেখাবে!
  errorHandler.handle(err);
}
```

---

## 💡 ১৫ বছরের ইঞ্জিনিয়ারিং অভিজ্ঞতা থেকে কেন এই ডিজাইন?
1. **প্রয়োজনীয় সরলতা (KISS Principle):** কোনো হেভি ফ্রেমওয়ার্কের বোঝা ছাড়াই ব্রাউজারের নেটিভ ES Modules এবং CSS Variables ব্যবহার করা হয়েছে।
2. **একক দায়িত্ব নীতি (Single Responsibility):** প্রতিটি উইজেট এবং মডিউল নিজের কাজটি একা এবং নিখুঁতভাবে করে।
3. **স্কেলেবিলিটি (Scalability):** ভবিষ্যতে নতুন যেকোনো উইজেট (যেমন DatePicker, Dropdown) ঠিক একই প্যাটার্নে `src/widgets/` ডিরেক্টরিতে ৩ মিনিটে যোগ করা যাবে।
4. **টেস্টেবল ও রিডেবল (Clean & Testable):** জটিল কোডিং ট্রিকস পরিহার করে সেলফ-ডকুমেন্টিং ফাংশন এবং প্রপার্টি তৈরি করা হয়েছে।
