export function generateChatHistoryWordDoc(): string {
  const date = "05 June 2026";
  const userName = "Engr. Md Masud Alam";
  const userAddress = "Aynatoli, Shahrasti, Chandpur";
  const userPhone = "01714-804392";

  const ht = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>মাসুদ আইডি কার্ড মেকার - ডেভলপমেন্ট হিস্টোরি ও ব্যবহারের গাইডলাইন</title>
  <style>
    body {
      font-family: Arial, "Vrinda", "SolaimanLipi", "Siyam Rupali", sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #333333;
      margin: 20px;
    }
    h1 {
      font-family: Arial, "Georgia", serif;
      color: #ea580c;
      font-size: 24pt;
      border-bottom: 2px solid #ea580c;
      padding-bottom: 6px;
      margin-bottom: 5px;
    }
    h2 {
      font-family: Arial, "Segoe UI", sans-serif;
      color: #1e3a8a;
      font-size: 16pt;
      margin-top: 25px;
      margin-bottom: 10px;
      border-bottom: 1px dashed #cbd5e1;
      padding-bottom: 3px;
    }
    h3 {
      font-family: Arial, sans-serif;
      color: #0f766e;
      font-size: 13pt;
      margin-top: 15px;
    }
    .meta-box {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 25px;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
    }
    .meta-table td {
      padding: 4px 8px;
      font-size: 10pt;
    }
    .meta-label {
      font-weight: bold;
      color: #475569;
      width: 150px;
    }
    .milestone {
      margin-bottom: 20px;
      padding-left: 15px;
      border-left: 3px solid #f97316;
    }
    .badge {
      background-color: #ffedd5;
      color: #ea580c;
      padding: 2px 8px;
      font-size: 9pt;
      font-weight: bold;
      border-radius: 4px;
      display: inline-block;
    }
    .tip-box {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 12px 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .success-box {
      background-color: #f0fdf4;
      border-left: 4px solid #22c55e;
      padding: 12px 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .code-snippet {
      font-family: "Courier New", Courier, monospace;
      background-color: #f1f5f9;
      padding: 8px;
      border: 1px solid #cbd5e1;
      font-size: 9pt;
      display: block;
      margin: 10px 0;
    }
    ul, ol {
      margin-top: 5px;
      margin-bottom: 15px;
      padding-left: 20px;
    }
    li {
      margin-bottom: 5px;
    }
    .footer {
      text-align: center;
      font-size: 9pt;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      margin-top: 40px;
      padding-top: 10px;
    }
  </style>
</head>
<body>

  <h1>মাসুদ আইডি কার্ড মেকার (MASUD ID CARD MAKER)</h1>
  <p style="font-size: 12pt; color: #64748b; font-style: italic; margin-top: 0;">
    অটোমেটিক বাল্ক আইডি কার্ড জেনারেটর — সম্পূর্ণ ডেভেলপমেন্ট ইতিহাস ও গাইডলাইন (ওয়ার্ড ফাইল)
  </p>

  <div class="meta-box">
    <h3 style="margin-top: 0; color: #1e293b;">প্রোজেক্ট এবং ক্লায়েন্ট ডকেট (Project & Client Metadata)</h3>
    <table class="meta-table">
      <tr>
        <td class="meta-label">অ্যাপলিকেশন নাম:</td>
        <td style="font-weight: bold; color: #ea580c;">মাসুদ আইডি কার্ড মেকার / MASUD ID CARD MAKER</td>
      </tr>
      <tr>
        <td class="meta-label">সম্মানিত ক্লায়েন্ট:</td>
        <td style="font-weight: bold;">${userName}</td>
      </tr>
      <tr>
        <td class="meta-label">ঠিকানা:</td>
        <td>${userAddress}</td>
      </tr>
      <tr>
        <td class="meta-label">মোবাইল নম্বর:</td>
        <td style="color: #2563eb; font-weight: bold;">${userPhone}</td>
      </tr>
      <tr>
        <td class="meta-label">আপডেটের তারিখ:</td>
        <td>${date}</td>
      </tr>
      <tr>
        <td class="meta-label">পরিবেশ/রানটাইম:</td>
        <td>Vite React (TypeScript) + Tailwind CSS</td>
      </tr>
    </table>
  </div>

  <h2>১. অ্যাপ্লিকেশনের মূল বৈশিষ্ট্যসমূহ (Core Application Features)</h2>
  <p>মাসুদ আইডি কার্ড মেকার একটি অত্যন্ত শক্তিশালী এবং স্বয়ংক্রিয় বাল্ক বা ব্যাচ পোর্ট্রেট আইডি কার্ড তৈরির সফটওয়্যার। এর চমৎকার ফিচারসমূহ নিচে দেওয়া হলো:</p>
  <ul>
    <li><strong>ডাইনামিক থিম সিলেক্টর (Interactive Template Presets):</strong> এক ক্লিকেই পরিবর্তনযোগ্য ৩টি দৃষ্টিনন্দন প্রিমিয়াম ডিজাইন থিম এবং ১টি ক্লাসিক থিম অ্যাড করা হয়েছে।
      <ol>
        <li><em>Classic Emerald Thm:</em> উজ্জ্বল সবুজ ও সোনালী ঢেউয়ের মনকাড়া ক্লাসিক একাডেমিক থিম।</li>
        <li><em>Royal Executive Thm:</em> রাজকীয় রয়্যাল ব্লু ও অ্যাম্বার রঙের প্রফেশনাল কর্পোরেট থিম।</li>
        <li><em>Crimson Vibrant Thm:</em> উষ্ণ আধুনিক ক্রিমসন ও উজ্জ্বল অরেঞ্জ রঙের শৈল্পিক থিম।</li>
        <li><em>Original Classic Thm:</em> আইডি কার্ড মেকারের মূল দেশীয় থিম।</li>
      </ol>
    </li>
    <li><strong>কাস্টম টেমপ্লেট মেকার (Custom Logo & Design Upload):</strong> ব্যবহারকারী চাইলে বাম প্যানেল থেকে যেকোনো নিজস্ব সোর্স SVG বা PNG ছবি আপলোড করে কাস্টম ব্যাকগ্রাউন্ড বসাতে পারবেন।</li>
    <li><strong>বাল্ক শিক্ষার্থীদের তালিকা লোড (Excel/CSV Dynamic Import):</strong> যেকোনো মাইক্রোসফট এক্সেল (.xlsx) বা সিএসভি (.csv) ফাইল ইনপুট দিয়ে একসাথে হাজার হাজার শিক্ষার্থীর তালিকা এক নিমিষে লোড করা যায়।</li>
    <li><strong>স্মার্ট ফটো ম্যাচিং ইঞ্জিন (Roll / ID Based Bulk Photo Upload):</strong> ফটো আপলোডের কলাম অনুযায়ী শিক্ষার্থীদের রোল বা আইডি ফাইলের নামে মিলিয়ে এক ক্লিকেই সম্পূর্ণ ফোল্ডারের সব ছবি অটোমেটিক রেবর্ড অনুযায়ী বসে যায়।</li>
    <li><strong>দ্বি-ভাষিক সংস্করণ (Bengali-English Bilingual Dashboard Toggle):</strong> ইন্টারফেসের ল্যাঙ্গুয়েজ সুইচ বোতামের মাধ্যমে এক ক্লিকেই সম্পূর্ণ অ্যাপ বাংলা ও ইংরেজিতে রূপান্তর করা যায়।</li>
    <li><strong>ড্র্যাগ-অ্যান্ড-ড্রপ ডিজাইন এডিটর (Drag & Position Adjustments):</strong> আইডি কার্ড ক্যানভাসের ভেতরের যেকোনো ছবি ও লেখার উপর মাউস দিয়ে টেনে নিজের ইচ্ছামতো পছন্দনীয় স্থানে নিখুঁতভাবে বসানো যায়।</li>
  </ul>

  <h2>২. চ্যাট ও ডেভলপমেন্ট ইতিহাসের মাইলস্টোন (Chat log & Milestone Milestones)</h2>
  <p>ইউজারের মূল্যবান অনুরোধ অনুযায়ী অত্যন্ত নিখুঁতভাবে এবং যত্ন সহকারে অ্যাপলেটটিতে নিম্নলিখিত পরিবর্তনগুলো রূপান্তর করা হয়েছে:</p>

  <div class="milestone">
    <span class="badge">ধাপ ১</span>
    <h3>ফটো ও লেখার অনুপাত সমন্বয় (Photo & Formatting Standardizing)</h3>
    <p>সফটওয়্যারটিতে আইডি কার্ড প্রিন্ট করার উপযুক্ত ফন্ট-সাইজ এবং ডাইনামিক লাইভ ক্যানভাসের পজিশনের কো-অর্ডিনেটগুলো রুলার অনুযায়ী ফিক্সড করা হয়েছে। এর মাধ্যমে প্রিন্টআউট অত্যন্ত ঝকঝকে ও নিখুঁত দেখায়।</p>
  </div>

  <div class="milestone">
    <span class="badge">ধাপ ২</span>
    <h3>টপ ল্যান্ডস্কেপ ব্র্যান্ডিং অপসারণ অনুরোধ (Removing Unrequested Overlays)</h3>
    <p>ইউজার চ্যাটে স্পেসিফিক নির্দেশ দিয়েছেন: <em>"Institution Branding (প্রতিষ্ঠানের তথ্য) দরকার নেই। এটি বাদ দিয়ে দাও।"</em> আমরা সাথে সাথেই ইউজার ইনটেন্টকে সর্বোচ্চ গুরুত্ব দিয়ে কার্ড ক্যানভাস এবং কুৎসিত সাইডবার সেকশন থেকে ইনস্টিটিউশন ওভারলে ও ইনপুট প্যানেলটি সম্পূর্ণ রিমুভ করে দিয়েছি। এটি কার্ডের নান্দনিকতা বৃদ্ধি করেছে।</p>
  </div>

  <div class="milestone">
    <span class="badge">ধাপ ৩</span>
    <h3>সবচেয়ে সুন্দর ডিফল্ট প্রিসেট থিম অ্যাড (Default Beautiful Templates Input)</h3>
    <p>ব্যবহারকারীর চ্যাট অনুরোধের জবাবে: <em>"তোমার পছন্দমত একটি ডিফল্ট পেমপ্লেট দাও, যা দেখতে অনেক সুন্দর লাগে।"</em> আমরা প্রফেশনালি ডিজাইন করা ৩টি ডাইনামিক SVG এবং ক্লাসিক স্বয়ংসম্পূর্ণ থিম যুক্ত করেছি যা সরাসরি সাইডবার গ্রিড প্যানেল থেকে প্রিভিউ এবং সিলেক্ট করা যায়।</p>
  </div>

  <div class="milestone">
    <span class="badge">ধাপ ৪</span>
    <h3>বাংলা অনুবাদ সংস্করণ (Bangla Native Language System)</h3>
    <p>ইউজারের চাহিদানুসারে সম্পূর্ণ অ্যাপটি যেন স্বাচ্ছন্দ্যে বাংলা ভাষায় পরিচালনা করা যায়, সেজন্য একটি রিয়েল-টাইম বাটন দিয়ে ড্যাশবোর্ডের প্রতিটি লেবেল, বাটন, ইনস্ট্রাকশন ও এডিটর অপশন উন্নত বঙ্গানুবাদে সজ্জিত করা হয়েছে।</p>
  </div>

  <div class="milestone">
    <span class="badge">ধাপ ৫</span>
    <h3>ডকুমেন্ট ও চ্যাট হিস্টোরি এক্সপোর্ট ফিচার (Word Document Exporter Implementation)</h3>
    <p>চলতি চ্যাট ও ডেভেলপমেন্ট লগ ডাটা সরাসরি মাইক্রোসফট ওয়ার্ড ফাইল (.doc) ফরম্যাটে এক ক্লিকেই ডাউনলোড করার সুবিধা সংযোজন করা হয়েছে, যাতে ইউজার যেকোনো সময় ডেক্সটপ বা মোবাইলে এটি ওপেন করতে পারেন।</p>

  <h2>৩. গুগল এআই স্টুডিওতে জিপ (ZIP) ব্যাকআপ ফাইলটি দিয়ে নতুন করে আরেকটি প্রজেক্ট/অ্যাপ চালুর নিয়Modal (How to Import/Clone/Run the downloaded ZIP Project)</h2>
  <div class="tip-box">
    <strong>অত্যন্ত গুরুত্বপূর্ণ গাইডলাইন:</strong> আপনি যখন এই প্রজেক্টের <strong>ZIP ফাইলটি ডাউনলোড করবেন</strong>, তখন পরবর্তীতে এটি দিয়ে যেকোনো জায়গায় বা নতুন আরেকটি আইডি মেকার অ্যাপ চালু করতে নিচের সহজ ধাপগুলো অনুসরণ করবেন:
  </div>
  
  <ol>
    <li><strong>জিপ ফাইল আনজিপ করুন:</strong> ডাউনলোড করা জিপ ফাইলটি আপনার কম্পিউটার বা লোকাল ড্রাইভে এক্সট্র্যাক্ট (Extract/Unzip) করুন।</li>
    <li><strong>গুগল এআই স্টুডিও বা বিল্ড পোর্টালে যান:</strong> <a href="https://ai.studio/build" target="_blank">ai.studio/build</a> লিংকে প্রবেশ করুন অথবা আপনার কোড এডিটরে প্রজেক্ট ডিরেক্টরিটি ওপেন করুন।</li>
    <li><strong>প্রজেক্ট ফাইলসমূহ ইমপোর্ট করুন:</strong>
      <ul>
        <li>গুগল এআই স্টুডিও-তে ইমপোর্ট অপশন দিয়ে সহজে এই আনজিপ করা পুরো ফোল্ডারটি ওপেন করুন।</li>
        <li>আপনার প্যাকেজ কনফিগারেশনের সব ফাইল স্বয়ংক্রিয়ভাবে লোড হয়ে রি অ্যাক্ট ও সুইফট রানটাইম হিসেবে একটিভ হবে।</li>
      </ul>
    </li>
    <li><strong>ডিপেনডেন্সি ইনস্টল ও রান করা (Running local build command):</strong>
      <p>আপনার ডেক্সটপে এই প্রজেক্টটি লোকালি রান বা ডেভেলপ করতে চাইলে নিচের তিনটি সহজ কমান্ড টার্মিনালে রান করতে হবে:</p>
      <div class="code-snippet">
        # ১. সকল ডিপেনডেন্সি ইন্সটল করতে:<br>
        npm install<br><br>
        # ২. ডেভেলপমেন্ট সার্ভার চালু করতে লোকালপোর্টে:<br>
        npm run dev<br><br>
        # ৩. প্রফেশনাল প্রোডাকশন বিল্ড তৈরি করতে:<br>
        npm run build
      </div>
    </li>
    <li><strong>পোর্ট ম্যানেজমেন্ট:</strong> প্রজেক্টটি রান করার পর সরাসরি ব্রাউজারে <a href="http://localhost:3000" target="_blank">http://localhost:3000</a> এড্রেসে গেলে আপনি ড্যাশবোর্ডটি পেয়ে যাবেন এবং নতুন যেকোনো কোড বা ফিচার এড করতে পারবেন।</li>
  </ol>

  <div class="success-box">
    <strong>ভবিষ্যতের কোড রিলোডিং ট্রিক (Restore Project State):</strong> কখনো যদি আপনার আগের কাজের ডেটা মুছে যায়, তবে ক্যানভাস সেটিংস ধরে রাখতে পূর্বের ডাউনলোড করা কনফিগারেশন settings file (.cf) টি "সেটিংস ফাইল লোড করুন" বাটনে ক্লিক করে ইমপোর্ট করলেই আগের সমস্ত কাজ ২ সেকেন্ডের মধ্যে জীবন্ত হয়ে ফিরে আসবে!
  </div>

  <div class="footer">
    <p>© ২০২৬ ইঞ্জিনিয়ার মোঃ মাসুদ আলম। সর্বস্বত্ব সংরক্ষিত।</p>
    <p>আয়নাতলী, শাহরাস্তি, চাঁদপুর। মোবাইল নাম্বার: ০১৭১৪-৮০৪৩৯২</p>
  </div>

</body>
</html>
  `;
  return ht;
}
