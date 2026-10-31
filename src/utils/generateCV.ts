import { jsPDF } from "jspdf";

/**
 * Generates Senaf Wondimmu's professional CV PDF with clickable links,
 * recognizable icons for GitHub and LinkedIn, and updated project entries.
 */
export function createCVDocument(): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  // ==========================================
  // 1. LEFT SIDEBAR: Deep Teal/Green Color Accent
  // ==========================================
  doc.setFillColor(0, 77, 64);
  doc.rect(0, 0, 70, 297, "F");

  // LEFT COLUMN TEXT
  doc.setTextColor(255, 255, 255);
  
  // Name in Sidebar
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("SENAF", 35, 25, { align: "center" });
  doc.text("WONDIMMU", 35, 34, { align: "center" });

  // Divider Line
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.4);
  doc.line(15, 41, 55, 41);

  // Title
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("SOFTWARE ENGINEER", 35, 48, { align: "center" });

  // Details Heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Details", 10, 66);
  doc.line(10, 69, 60, 69);

  // Details Content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Addis Ababa, Ethiopia", 10, 76);
  doc.text("+251974938979", 10, 82);
  doc.text("senafwondimu@gmail.com", 10, 88);

  // Skills Heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Skills", 10, 104);
  doc.line(10, 107, 60, 107);

  // Skills List with Proficiency Indicators
  const skillsList = [
    "React / TypeScript",
    "Tailwind CSS / HTML5",
    "Node.js / Express",
    "Python",
    "Kotlin / Android",
    "GitHub & CI/CD",
    "REST APIs & Firestore"
  ];

  let currentSkillY = 114;
  skillsList.forEach((skill) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(skill, 10, currentSkillY);
    
    // Background track
    doc.setFillColor(15, 95, 80);
    doc.rect(10, currentSkillY + 1.8, 48, 1.2, "F");
    
    // Active proficiency bar
    doc.setFillColor(255, 255, 255);
    doc.rect(10, currentSkillY + 1.8, 48 * 0.94, 1.2, "F");
    
    currentSkillY += 8.5;
  });

  // ==========================================
  // Links Heading with Clean Recognizable Icons
  // ==========================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Links", 10, 180);
  doc.line(10, 183, 60, 183);

  // 1. Portfolio Link
  const portfolioY = 191;
  // Globe/Web Icon badge
  doc.setFillColor(255, 255, 255);
  doc.circle(13, portfolioY - 1, 2.5, "F");
  doc.setFillColor(0, 77, 64);
  doc.circle(13, portfolioY - 1, 1.8, "F");
  doc.setFillColor(255, 255, 255);
  doc.circle(13, portfolioY - 1, 0.9, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("Live Portfolio", 18, portfolioY);
  doc.link(10, portfolioY - 3.5, 48, 6, { url: "https://senaf-wondimmu.vercel.app/" });

  // 2. GitHub Link with Recognizable GitHub Icon
  const githubY = 201;
  // GitHub Icon: White circular badge with silhouette cutouts
  doc.setFillColor(255, 255, 255);
  doc.circle(13, githubY - 1, 2.8, "F");
  doc.setFillColor(0, 77, 64);
  // Head / ear silhouettes
  doc.circle(13, githubY - 0.7, 1.9, "F");
  doc.setFillColor(255, 255, 255);
  doc.ellipse(13, githubY - 0.4, 1.2, 0.8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("HOLSIY", 18, githubY);
  doc.link(10, githubY - 3.5, 48, 6, { url: "https://github.com/HOLSIY" });

  // 3. LinkedIn Link with Recognizable LinkedIn "in" Badge
  const linkedinY = 211;
  // Official LinkedIn Blue rounded badge with crisp white "in"
  doc.setFillColor(10, 102, 194); // #0A66C2
  doc.roundedRect(10.5, linkedinY - 3.6, 5, 5, 1, 1, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("in", 11.6, linkedinY - 0.1);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("LinkedIn", 18, linkedinY);
  doc.link(10, linkedinY - 3.5, 48, 6, { url: "https://www.linkedin.com/in/senaf-wondimmu-a6266741b/" });

  // ==========================================
  // Languages Heading
  // ==========================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Languages", 10, 226);
  doc.line(10, 229, 60, 229);

  const languages = ["English", "Amharic", "Afaan Oromo"];
  const langProficiency = [0.90, 0.95, 0.92];
  let langY = 237;
  languages.forEach((lang, i) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(lang, 10, langY);
    
    doc.setFillColor(15, 95, 80);
    doc.rect(10, langY + 1.8, 48, 1.2, "F");
    
    doc.setFillColor(255, 255, 255);
    doc.rect(10, langY + 1.8, 48 * langProficiency[i], 1.2, "F");
    
    langY += 8.5;
  });

  // ==========================================
  // 2. RIGHT CONTENT AREA
  // ==========================================
  doc.setTextColor(30, 41, 59);

  // Professional Summary
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Professional Summary", 80, 24);
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.5);
  doc.line(80, 27, 200, 27);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const summaryText = "Software engineer and creator passionate about building modern, high-performance web applications, interactive digital experiences, and scalable software solutions. Skilled in modern JavaScript/TypeScript frameworks, full-stack systems, clean UI/UX principles, and robust API development.";
  const splitSummary = doc.splitTextToSize(summaryText, 118);
  doc.text(splitSummary, 80, 33);

  // Academic & Project Experience
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Academic & Project Experience", 80, 56);
  doc.line(80, 59, 200, 59);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Software Engineer & Creator", 80, 66);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const employmentDesc = "Experienced in developing modern responsive web applications and systems, writing clean, maintainable architecture and delivering user-centered digital products.";
  const splitEmpDesc = doc.splitTextToSize(employmentDesc, 118);
  doc.text(splitEmpDesc, 80, 72);

  // Experience Bullet Points
  const experienceBullets = [
    "Engineered interactive, responsive front-end applications using React, TypeScript, and modern CSS frameworks, achieving high responsiveness and accessibility.",
    "Architected and deployed full-stack RESTful APIs and real-time backend integrations using Node.js, Express, and cloud database storage.",
    "Integrated secure authentication, Firestore persistent database schemas, and performance optimizations including modern WebP compression and responsive image streaming.",
    "Maintained rigorous version control workflows on GitHub, adhering to clean code standards, modular design patterns, and cross-platform reliability.",
    "Passionate about combining functional engineering with 3D design and motion to create memorable digital web experiences."
  ];

  let bulletY = 86;
  experienceBullets.forEach((bullet) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("*", 82, bulletY + 1.2);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const splitBullet = doc.splitTextToSize(bullet, 112);
    doc.text(splitBullet, 86, bulletY + 1);
    bulletY += (splitBullet.length * 4.2) + 2.5;
  });

  // Education Heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Education", 80, 160);
  doc.line(80, 163, 200, 163);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text("Bachelor of Science in Software Engineering (Ongoing)", 80, 170);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.text("Bule Hora University | Expected Graduation: 2028", 80, 175);

  // Projects Heading
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Featured Projects", 80, 189);
  doc.line(80, 192, 200, 192);

  // Projects Content with Clickable Links (Exact Order: 1. Village Cafe, 2. Got U, 3. EthioMerit)
  const featuredProjects = [
    {
      name: "Village Cafe",
      desc: "A responsive restaurant website for exploring the menu, viewing items, and placing orders online.",
      url: "https://village-restaurant-delta.vercel.app/"
    },
    {
      name: "Got U — Social Media Platform",
      desc: "A modern social media platform connecting communities through engaging digital interactions, real-time messaging, and multimedia sharing.",
      url: "https://github.com/HOLSIY/got-u"
    },
    {
      name: "EthioMerit — Public Recruitment & Anti-Corruption Platform",
      desc: "A public recruitment platform designed to promote transparent hiring, fairness, and accountability in candidate evaluation.",
      url: "https://github.com/HOLSIY/EthioMerit---Public-Recruitment-Anti-Corruption-Platform"
    }
  ];

  let projectY = 199;
  featuredProjects.forEach((proj) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 77, 64); // Dark teal accent for clickable project titles
    doc.text(`- ${proj.name}`, 80, projectY);
    
    // Add clickable link on the project name line
    doc.link(80, projectY - 3.5, 118, 5, { url: proj.url });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.8);
    doc.setTextColor(51, 65, 85);
    const splitProjDesc = doc.splitTextToSize(proj.desc, 114);
    doc.text(splitProjDesc, 84, projectY + 4.2);
    
    projectY += (splitProjDesc.length * 4) + 6;
  });

  return doc;
}

/**
 * Helper to download CV as PDF in browser
 */
export function downloadCV(): void {
  const doc = createCVDocument();
  doc.save("Senaf_Wondimmu_CV.pdf");
}
