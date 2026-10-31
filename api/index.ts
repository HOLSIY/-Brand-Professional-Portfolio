import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, getDoc, setDoc } from "firebase/firestore";

dotenv.config();

// Safely resolve directory path for both ES Modules and CommonJS (Vercel)
let currentDirname = process.cwd();
try {
  if (typeof __dirname !== "undefined") {
    currentDirname = __dirname;
  } else if (typeof import.meta !== "undefined" && import.meta.url) {
    currentDirname = path.dirname(fileURLToPath(import.meta.url));
  }
} catch (e) {
  console.warn("[Server] Note: Could not dynamically resolve directory path, using process.cwd().");
}

const app = express();

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Set aggressive HTTP cache headers on static assets and images so they are cached by the browser and not repeatedly downloaded
app.use((req, res, next) => {
  if (/\.(jpg|jpeg|png|webp|gif|svg|ico|avif|mp4|webm|woff2?)$/i.test(req.path)) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  }
  next();
});

// In-memory fallback in case Firebase config is not fully available/loaded
interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  replyText?: string;
  repliedAt?: string;
  replied?: boolean;
}
let memorySubmissions: Submission[] = [];

interface Visit {
  id: string;
  visitorId: string;
  path: string;
  userAgent: string;
  language: string;
  timestamp: string;
  referrer?: string;
}
let memoryVisits: Visit[] = [];

let memoryProjects: any[] = [];
let memoryCertificates: any[] = [];
let memoryLayouts: Record<string, any> = {};
let memoryProjectImages: Record<string, string> = {};

// Initialize Firebase from generated config or robust fallback
let firebaseApp: any = null;
let db: any = null;

try {
  let config: any = null;
  let configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (!fs.existsSync(configPath)) {
    configPath = path.join(currentDirname, "../firebase-applet-config.json");
  }
  if (!fs.existsSync(configPath)) {
    configPath = path.join(currentDirname, "firebase-applet-config.json");
  }

  if (fs.existsSync(configPath)) {
    try {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      console.log("[Firebase] Successfully loaded config from firebase-applet-config.json");
    } catch (e) {
      console.error("[Firebase] Failed to parse firebase-applet-config.json, using fallback:", e);
    }
  }

  if (!config) {
    console.log("[Firebase] Using robust hardcoded config fallback.");
    config = {
      projectId: "gen-lang-client-0530460158",
      appId: "1:1043359078319:web:8f370c7eb0f48b5941015a",
      apiKey: "AIzaSyAaPYJHtQayrm6CD4BlL9rDI2CjPIsm01Q",
      authDomain: "gen-lang-client-0530460158.firebaseapp.com",
      storageBucket: "gen-lang-client-0530460158.firebasestorage.app",
      messagingSenderId: "1043359078319",
      firestoreDatabaseId: "ai-studio-senaf3dcreatorpo-f9232c8b-2112-482f-b772-a4552500dfe9"
    };
  }

  firebaseApp = initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId
  });
  
  const dbId = config.firestoreDatabaseId || "(default)";
  try {
    // In serverless environments (like Vercel), we MUST initialize Firestore with long polling enabled.
    // Otherwise, the default WebChannel stream connection will hang or crash on Vercel's ephemeral runtimes.
    db = initializeFirestore(firebaseApp, {
      experimentalForceLongPolling: true,
    }, dbId);
    console.log(`[Firebase] Successfully initialized Firestore with long polling enabled: ${dbId}`);
  } catch (dbErr: any) {
    console.warn(`[Firebase] initializeFirestore with dbId "${dbId}" failed or already initialized, trying getFirestore:`, dbErr.message);
    try {
      db = getFirestore(firebaseApp, dbId);
      console.log(`[Firebase] Successfully retrieved existing Firestore instance for dbId: ${dbId}`);
    } catch (fallbackErr: any) {
      console.error(`[Firebase] getFirestore with dbId "${dbId}" failed, trying default:`, fallbackErr.message);
      try {
        db = getFirestore(firebaseApp);
        console.log(`[Firebase] Fallback: initialized default Firestore instance`);
      } catch (lastResortErr: any) {
        console.error(`[Firebase] Last resort Firestore initialization failed:`, lastResortErr.message);
        throw lastResortErr;
      }
    }
  }
} catch (error) {
  console.error("[Firebase] Error initializing Firebase. Falling back to in-memory:", error);
}

// Helper to resolve current admin password (from Firestore setting doc or env fallback)
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: false,
      isAnonymous: false,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function getCleanErrorMessage(err: any): string {
  if (!err || !err.message) return "An unexpected error occurred.";
  try {
    const parsed = JSON.parse(err.message);
    if (parsed && typeof parsed === "object" && "error" in parsed) {
      return parsed.error;
    }
  } catch (e) {
    // Not a JSON string
  }
  return err.message;
}

// In-memory cache for verified administrator credentials
let cachedAdminPassword: string | null = null;

// Pre-load the existing admin password into memory immediately on startup
if (db) {
  getDoc(doc(db, "settings", "admin_config"))
    .then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        if (d && typeof d.password === "string" && d.password.trim()) {
          cachedAdminPassword = d.password.trim();
          console.log("[Auth] Successfully verified and cached active admin credentials.");
        }
      }
    })
    .catch((err) => {
      console.warn("[Auth] Background admin credentials pre-fetch warning:", err?.message || err);
    });
}

async function getAdminPassword(): Promise<string> {
  // If we already verified and cached the current admin password in memory, use it
  if (cachedAdminPassword && cachedAdminPassword.trim() !== "") {
    return cachedAdminPassword;
  }

  if (db) {
    try {
      const configDoc = await getDoc(doc(db, "settings", "admin_config"));
      if (configDoc.exists()) {
        const data = configDoc.data();
        if (data && typeof data.password === "string" && data.password.trim() !== "") {
          cachedAdminPassword = data.password.trim();
          return cachedAdminPassword;
        }
      }
    } catch (err) {
      console.error("[Auth] Error reading admin credentials from Firestore:", err);
      if (cachedAdminPassword) {
        return cachedAdminPassword;
      }
    }
  }

  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim() !== "") {
    cachedAdminPassword = process.env.ADMIN_PASSWORD.trim();
    return cachedAdminPassword;
  }

  // Never return a hardcoded weak fallback password! Throw if credentials cannot be resolved.
  throw new Error("Administrator credentials unavailable or unconfigured.");
}

// Check if a secure administrator password is configured
async function isPasswordConfigured(): Promise<boolean> {
  if (cachedAdminPassword && cachedAdminPassword.trim() !== "") {
    return true;
  }
  if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim() !== "") {
    return true;
  }
  if (db) {
    try {
      const configDoc = await getDoc(doc(db, "settings", "admin_config"));
      if (configDoc.exists()) {
        const data = configDoc.data();
        if (data && typeof data.password === "string" && data.password.trim() !== "") {
          cachedAdminPassword = data.password.trim();
          return true;
        }
      }
    } catch (err) {
      console.warn("[Auth] Could not read admin_config doc:", err);
    }
  }
  return false;
}

// Standardized, strict authentication middleware for all protected admin routes
async function requireAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const rawPass = req.headers["x-admin-password"] || req.query.password || req.body?.password;
    if (!rawPass || typeof rawPass !== "string" || !rawPass.trim()) {
      return res.status(401).json({ error: "Unauthorized access. Administrator password required." });
    }
    const activePassword = await getAdminPassword();
    if (!activePassword || rawPass.trim() !== activePassword.trim()) {
      return res.status(401).json({ error: "Unauthorized access. Invalid administrator password." });
    }
    next();
  } catch (err: any) {
    console.error("[Auth] Admin verification error:", err?.message || err);
    return res.status(401).json({ error: "Unauthorized access. Administrator verification failed." });
  }
}

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// POST /api/contact - Create a contact submission
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const timestamp = new Date().toISOString();

    if (db) {
      // Save directly to Firestore
      let docRef;
      try {
        docRef = await addDoc(collection(db, "submissions"), {
          name,
          email,
          message,
          createdAt: timestamp,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "submissions");
      }
      console.log(`[Firestore] Saved submission with ID: ${docRef.id}`);
      return res.json({ success: true, id: docRef.id });
    } else {
      // Memory fallback
      const mockId = "mem_" + Math.random().toString(36).substring(2, 11);
      const newSub: Submission = { id: mockId, name, email, message, createdAt: timestamp };
      memorySubmissions.push(newSub);
      console.log(`[Memory] Saved submission to memory cache: ${mockId}`);
      return res.json({ success: true, id: mockId });
    }
  } catch (err: any) {
    console.error("[API] Contact submission failed:", err);
    res.status(500).json({ error: "Failed to save submission.", details: getCleanErrorMessage(err) });
  }
});

// POST /api/visit - Track page visits for analytics
app.post("/api/visit", async (req, res) => {
  try {
    const { visitorId, path: pagePath, userAgent, language, referrer } = req.body;
    if (!visitorId || !pagePath) {
      return res.status(400).json({ error: "visitorId and path are required." });
    }

    const timestamp = new Date().toISOString();

    if (db) {
      let docRef;
      try {
        docRef = await addDoc(collection(db, "visits"), {
          visitorId,
          path: pagePath,
          userAgent: userAgent || "",
          language: language || "",
          referrer: referrer || "",
          timestamp
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "visits");
      }
      return res.json({ success: true, id: docRef.id });
    } else {
      const mockId = "v_" + Math.random().toString(36).substring(2, 11);
      const newVisit: Visit = {
        id: mockId,
        visitorId,
        path: pagePath,
        userAgent: userAgent || "",
        language: language || "",
        referrer: referrer || "",
        timestamp
      };
      memoryVisits.push(newVisit);
      if (memoryVisits.length > 2000) {
        memoryVisits.shift();
      }
      return res.json({ success: true, id: mockId });
    }
  } catch (err: any) {
    console.error("[API] Visitor logging failed:", err);
    res.status(500).json({ error: "Failed to record visit.", details: getCleanErrorMessage(err) });
  }
});

// GET /api/dashboard/analytics - Fetch aggregated analytics
app.get("/api/dashboard/analytics", requireAdminAuth, async (req, res) => {
  try {

    let visitsList: any[] = [];
    if (db) {
      try {
        const visitsCol = collection(db, "visits");
        const q = query(visitsCol, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          visitsList.push({ id: doc.id, ...doc.data() });
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "visits");
      }
    } else {
      visitsList = [...memoryVisits].reverse();
    }

    // Aggregate Analytics
    const totalPageViews = visitsList.length;
    const uniqueVisitorsSet = new Set(visitsList.map(v => v.visitorId));
    const uniqueVisitorsCount = uniqueVisitorsSet.size;

    // Path Breakdown
    const pathsMap: Record<string, number> = {};
    // Browser Breakdown
    const browsersMap: Record<string, number> = {};
    // Daily Timeline
    const timelineMap: Record<string, number> = {};

    visitsList.forEach(v => {
      const p = v.path || "/";
      pathsMap[p] = (pathsMap[p] || 0) + 1;

      const ua = (v.userAgent || "").toLowerCase();
      let browser = "Other";
      if (ua.includes("chrome") && !ua.includes("chromium") && !ua.includes("edg") && !ua.includes("opr")) {
        browser = "Chrome";
      } else if (ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium")) {
        browser = "Safari";
      } else if (ua.includes("firefox")) {
        browser = "Firefox";
      } else if (ua.includes("edg") || ua.includes("edge")) {
        browser = "Edge";
      } else if (ua.includes("opr") || ua.includes("opera")) {
        browser = "Opera";
      } else if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
        browser = "Mobile";
      }
      browsersMap[browser] = (browsersMap[browser] || 0) + 1;

      if (v.timestamp) {
        const dateStr = v.timestamp.split("T")[0];
        timelineMap[dateStr] = (timelineMap[dateStr] || 0) + 1;
      }
    });

    // Format chart data (timeline of last 7 calendar dates)
    const chartData: { date: string; views: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const displayStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      chartData.push({
        date: displayStr,
        views: timelineMap[dateStr] || 0
      });
    }

    // Sort paths by views
    const topPaths = Object.entries(pathsMap)
      .map(([pathName, count]) => ({ path: pathName, count }))
      .sort((a, b) => b.count - a.count);

    // Format recent list (max 20)
    const recentVisits = visitsList.slice(0, 20).map(v => ({
      id: v.id,
      path: v.path,
      timestamp: v.timestamp,
      language: v.language || "en",
      userAgent: v.userAgent || "",
      referrer: v.referrer || ""
    }));

    res.json({
      totalPageViews,
      uniqueVisitorsCount,
      topPaths,
      browsersMap,
      chartData,
      recentVisits
    });
  } catch (err: any) {
    console.error("[API] Failed to retrieve analytics:", err);
    res.status(500).json({ error: "Failed to load analytics data.", details: getCleanErrorMessage(err) });
  }
});

// GET /api/dashboard/submissions - Get all submissions (password-secured)
app.get("/api/dashboard/submissions", requireAdminAuth, async (req, res) => {
  try {

    if (db) {
      try {
        const submissionsCol = collection(db, "submissions");
        const q = query(submissionsCol, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const list: any[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        return res.json({ submissions: list });
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "submissions");
      }
    } else {
      // Return sorted in-memory submissions (newest first)
      const sortedMem = [...memorySubmissions].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return res.json({ submissions: sortedMem });
    }
  } catch (err: any) {
    console.error("[API] Failed to get submissions:", err);
    res.status(500).json({ error: "Failed to fetch submissions.", details: getCleanErrorMessage(err) });
  }
});

// DELETE /api/dashboard/submissions/:id - Delete a submission
app.delete("/api/dashboard/submissions/:id", requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (db && !id.startsWith("mem_")) {
      try {
        await deleteDoc(doc(db, "submissions", id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `submissions/${id}`);
      }
      console.log(`[Firestore] Deleted submission ID: ${id}`);
      return res.json({ success: true });
    } else {
      // Delete from memory fallback
      memorySubmissions = memorySubmissions.filter(sub => sub.id !== id);
      console.log(`[Memory] Deleted submission ID: ${id}`);
      return res.json({ success: true });
    }
  } catch (err: any) {
    console.error("[API] Failed to delete submission:", err);
    res.status(500).json({ error: "Failed to delete submission.", details: getCleanErrorMessage(err) });
  }
});

// POST /api/dashboard/change-password - Change admin password securely in Firestore
app.post("/api/dashboard/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required." });
    }

    const activePassword = await getAdminPassword();
    if (currentPassword !== activePassword) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    if (db) {
      // Save password update in settings collection
      try {
        await setDoc(doc(db, "settings", "admin_config"), {
          password: newPassword,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "settings/admin_config");
      }
      
      console.log("[Firestore] Password changed successfully.");
      cachedAdminPassword = newPassword.trim();
      return res.json({ success: true, message: "Password updated successfully in database." });
    } else {
      return res.status(400).json({ error: "Database not connected. Unable to save new password permanently." });
    }
  } catch (err: any) {
    console.error("[API] Failed to change password:", err);
    res.status(500).json({ error: "Failed to change password.", details: getCleanErrorMessage(err) });
  }
});

// GET /api/dashboard/status - Check if dashboard password has been configured
app.get("/api/dashboard/status", async (req, res) => {
  try {
    const isSetup = await isPasswordConfigured();
    // Admin password exists and is configured; always enforce authentication
    res.json({ isSetup: true });
  } catch (err: any) {
    console.error("[API] Failed to get dashboard status:", err);
    res.json({ isSetup: true });
  }
});

// GET & POST /api/auth/verify-admin - Strictly verify if admin token/password is valid
app.all("/api/auth/verify-admin", async (req, res) => {
  try {
    const rawPass = req.headers["x-admin-password"] || req.body?.password || req.query?.password;
    if (!rawPass || typeof rawPass !== "string" || !rawPass.trim()) {
      return res.status(401).json({ authenticated: false, error: "Password required." });
    }
    const activePassword = await getAdminPassword();
    if (activePassword && rawPass.trim() === activePassword.trim()) {
      return res.json({ authenticated: true });
    }
    return res.status(401).json({ authenticated: false, error: "Invalid administrator password." });
  } catch (err: any) {
    console.error("[API] Failed to verify admin password:", err);
    res.status(401).json({ authenticated: false, error: "Verification failed." });
  }
});

// POST /api/dashboard/setup-password - Setup initial secure password (disabled once configured)
app.post("/api/dashboard/setup-password", async (req, res) => {
  // Always reject unauthenticated setup requests to preserve existing password
  return res.status(403).json({ error: "Administrator password is already configured. Please use sign in." });
});

// POST /api/dashboard/submissions/:id/reply - Save client response/reply details on this website
app.post("/api/dashboard/submissions/:id/reply", requireAdminAuth, async (req, res) => {
  try {

    const { id } = req.params;
    const { replyText, replyImage } = req.body;

    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ error: "Reply text is required." });
    }

    const repliedAt = new Date().toISOString();

    if (db && !id.startsWith("mem_")) {
      try {
        await setDoc(doc(db, "submissions", id), {
          replyText,
          replyImage: replyImage || null,
          repliedAt,
          replied: true
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `submissions/${id}`);
      }
      console.log(`[Firestore] Client reply saved for submission: ${id}`);
      return res.json({ success: true, replyText, replyImage: replyImage || null, repliedAt });
    } else {
      // Memory fallback
      const sub = memorySubmissions.find(s => s.id === id);
      if (sub) {
        sub.replyText = replyText;
        (sub as any).replyImage = replyImage || null;
        sub.repliedAt = repliedAt;
        sub.replied = true;
        console.log(`[Memory] Client reply saved for submission: ${id}`);
        return res.json({ success: true, replyText, replyImage: replyImage || null, repliedAt });
      } else {
        return res.status(404).json({ error: "Submission not found." });
      }
    }
  } catch (err: any) {
    console.error("[API] Failed to reply:", err);
    res.status(500).json({ error: "Failed to save reply.", details: getCleanErrorMessage(err) });
  }
});

// -----------------------------------------------------------------------------
// Projects API Endpoints
// -----------------------------------------------------------------------------

// GET /api/projects/images - Retrieve all permanently saved project gallery images
app.get("/api/projects/images", async (req, res) => {
  try {
    const images: Record<string, string> = { ...memoryProjectImages };
    if (db) {
      try {
        const snap = await getDocs(collection(db, "project_images"));
        snap.forEach((d) => {
          const val = d.data();
          if (val && val.data) {
            images[d.id] = val.data;
          }
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "project_images");
      }
    }
    return res.json({ images });
  } catch (err: any) {
    console.error("[API] Failed to get project images:", err);
    res.status(500).json({ error: "Failed to load project gallery images.", details: getCleanErrorMessage(err) });
  }
});

// POST /api/projects/replace-image - Permanent replacement of gallery image in database
app.post("/api/projects/replace-image", requireAdminAuth, async (req, res) => {
  try {

    const { projectNum, slot, data } = req.body;
    if (!projectNum || !slot || !data || typeof data !== "string") {
      return res.status(400).json({ error: "Missing required fields (projectNum, slot, data)." });
    }

    const docId = `${projectNum}_${slot}`;
    const updatedAt = new Date().toISOString();

    // 1. Save permanently to Firestore
    if (db) {
      try {
        await setDoc(doc(db, "project_images", docId), {
          projectNum,
          slot,
          data,
          updatedAt
        }, { merge: true });
        console.log(`[Firestore] Successfully saved persistent image for ${docId}`);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `project_images/${docId}`);
      }
    }
    memoryProjectImages[docId] = data;

    // 2. Cache on disk if public/uploads directory is writable
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const match = data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (match) {
        const ext = match[1] === "jpeg" ? "jpg" : match[1];
        const buffer = Buffer.from(match[2], "base64");
        fs.writeFileSync(path.join(uploadsDir, `project_${docId}.${ext}`), buffer);
      }
    } catch (e) {
      // non-fatal
    }

    return res.json({
      success: true,
      message: "Image successfully updated and saved permanently in database.",
      docId,
      projectNum,
      slot,
      data
    });
  } catch (err: any) {
    console.error("[API] Failed to replace project image:", err);
    res.status(500).json({ error: "Failed to save project image.", details: getCleanErrorMessage(err) });
  }
});

// GET /api/projects - Retrieve all dynamic projects with persistent image overrides
app.get("/api/projects", async (req, res) => {
  try {
    const images: Record<string, string> = { ...memoryProjectImages };
    if (db) {
      try {
        const snap = await getDocs(collection(db, "project_images"));
        snap.forEach((d) => {
          const val = d.data();
          if (val && val.data) {
            images[d.id] = val.data;
          }
        });
      } catch (e) {
        // non-blocking
      }
    }

    if (db) {
      try {
        const projectsCol = collection(db, "projects");
        const q = query(projectsCol);
        const querySnapshot = await getDocs(q);
        const list: any[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        // Sort by order ascending
        list.sort((a, b) => (a.order || 0) - (b.order || 0));

        // Merge any custom persistent images
        list.forEach(p => {
          if (images[`${p.num}_col1_1`]) p.col1_1 = images[`${p.num}_col1_1`];
          if (images[`${p.num}_col1_2`]) p.col1_2 = images[`${p.num}_col1_2`];
          if (images[`${p.num}_col2`]) p.col2 = images[`${p.num}_col2`];
        });

        return res.json({ projects: list, images });
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "projects");
      }
    } else {
      const sortedMem = [...memoryProjects].sort((a, b) => (a.order || 0) - (b.order || 0));
      sortedMem.forEach(p => {
        if (images[`${p.num}_col1_1`]) p.col1_1 = images[`${p.num}_col1_1`];
        if (images[`${p.num}_col1_2`]) p.col1_2 = images[`${p.num}_col1_2`];
        if (images[`${p.num}_col2`]) p.col2 = images[`${p.num}_col2`];
      });
      return res.json({ projects: sortedMem, images });
    }
  } catch (err: any) {
    console.error("[API] Failed to get projects:", err);
    res.status(500).json({ error: "Failed to fetch projects.", details: getCleanErrorMessage(err) });
  }
});

// POST /api/projects - Add or update a project (password-secured)
app.post("/api/projects", requireAdminAuth, async (req, res) => {
  try {

    const { id, num, category, title, col1_1, col1_2, col2, order } = req.body;
    if (!num || !category || !title || !col1_1 || !col1_2 || !col2) {
      return res.status(400).json({ error: "Required fields are missing." });
    }

    const projectData = {
      num,
      category,
      title,
      col1_1,
      col1_2,
      col2,
      order: typeof order === "number" ? order : Date.now(),
      updatedAt: new Date().toISOString()
    };

    if (db) {
      const docId = id || doc(collection(db, "projects")).id;
      try {
        await setDoc(doc(db, "projects", docId), projectData, { merge: true });
        return res.json({ success: true, project: { id: docId, ...projectData } });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `projects/${docId}`);
      }
    } else {
      const docId = id || "mem_proj_" + Math.random().toString(36).substring(2, 9);
      if (id) {
        memoryProjects = memoryProjects.filter(p => p.id !== id);
      }
      const newProj = { id: docId, ...projectData };
      memoryProjects.push(newProj);
      return res.json({ success: true, project: newProj });
    }
  } catch (err: any) {
    console.error("[API] Failed to save project:", err);
    res.status(500).json({ error: "Failed to save project.", details: getCleanErrorMessage(err) });
  }
});

// DELETE /api/projects/:id - Delete a project (password-secured)
app.delete("/api/projects/:id", requireAdminAuth, async (req, res) => {
  try {

    const { id } = req.params;
    if (db && !id.startsWith("mem_")) {
      try {
        await deleteDoc(doc(db, "projects", id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `projects/${id}`);
      }
      return res.json({ success: true });
    } else {
      memoryProjects = memoryProjects.filter(p => p.id !== id);
      return res.json({ success: true });
    }
  } catch (err: any) {
    console.error("[API] Failed to delete project:", err);
    res.status(500).json({ error: "Failed to delete project.", details: getCleanErrorMessage(err) });
  }
});

// GET /api/projects/layout - Fetch saved layout adjustments for portfolio projects
app.get("/api/projects/layout", async (req, res) => {
  try {
    if (db) {
      try {
        const layoutDoc = await getDoc(doc(db, "settings", "project_layouts"));
        if (layoutDoc.exists()) {
          const data = layoutDoc.data();
          return res.json({ layouts: data.layouts || {} });
        }
      } catch (err) {
        console.warn("[Firestore] Failed to read project layouts, falling back to memory:", err);
      }
    }
    return res.json({ layouts: memoryLayouts });
  } catch (err: any) {
    console.error("[API] Failed to get layouts:", err);
    res.status(500).json({ error: "Failed to get project layouts", details: getCleanErrorMessage(err) });
  }
});

// POST /api/projects/layout - Save custom layout adjustments (Admin-only, STRICTLY protected on backend)
app.post("/api/projects/layout", requireAdminAuth, async (req, res) => {
  try {

    const { projectNum, layouts } = req.body;
    if (!projectNum || !layouts) {
      return res.status(400).json({ error: "projectNum and layouts are required fields." });
    }

    // Persist in memory store
    memoryLayouts[projectNum] = layouts;

    // Persist in Firestore if available
    if (db) {
      try {
        await setDoc(doc(db, "settings", "project_layouts"), {
          layouts: memoryLayouts,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (err) {
        console.warn("[Firestore] Could not persist layouts to Firestore:", err);
      }
    }

    console.log(`[API] Saved project layout for project #${projectNum} (Admin Authorized)`);
    return res.json({ success: true, projectNum, layouts });
  } catch (err: any) {
    console.error("[API] Failed to save project layout:", err);
    res.status(500).json({ error: "Failed to save project layout.", details: getCleanErrorMessage(err) });
  }
});


// -----------------------------------------------------------------------------
// Certificates API Endpoints
// -----------------------------------------------------------------------------

// GET /api/certificates - Retrieve all dynamic certificates
app.get("/api/certificates", async (req, res) => {
  try {
    if (db) {
      try {
        const certsCol = collection(db, "certificates");
        const q = query(certsCol);
        const querySnapshot = await getDocs(q);
        const list: any[] = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        return res.json({ certificates: list });
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, "certificates");
      }
    } else {
      const sortedMem = [...memoryCertificates].sort((a, b) => (a.order || 0) - (b.order || 0));
      return res.json({ certificates: sortedMem });
    }
  } catch (err: any) {
    console.error("[API] Failed to get certificates:", err);
    res.status(500).json({ error: "Failed to fetch certificates.", details: getCleanErrorMessage(err) });
  }
});

// POST /api/certificates - Add or update a certificate (password-secured)
app.post("/api/certificates", requireAdminAuth, async (req, res) => {
  try {

    const { id, title, issuer, issueDate, credentialUrl, image, order } = req.body;
    if (!title || !issuer || !issueDate) {
      return res.status(400).json({ error: "Required fields are missing." });
    }

    const certData = {
      title,
      issuer,
      issueDate,
      credentialUrl: credentialUrl || "",
      image: image || "",
      order: typeof order === "number" ? order : Date.now(),
      updatedAt: new Date().toISOString()
    };

    if (db) {
      const docId = id || doc(collection(db, "certificates")).id;
      try {
        await setDoc(doc(db, "certificates", docId), certData, { merge: true });
        return res.json({ success: true, certificate: { id: docId, ...certData } });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `certificates/${docId}`);
      }
    } else {
      const docId = id || "mem_cert_" + Math.random().toString(36).substring(2, 9);
      if (id) {
        memoryCertificates = memoryCertificates.filter(c => c.id !== id);
      }
      const newCert = { id: docId, ...certData };
      memoryCertificates.push(newCert);
      return res.json({ success: true, certificate: newCert });
    }
  } catch (err: any) {
    console.error("[API] Failed to save certificate:", err);
    res.status(500).json({ error: "Failed to save certificate.", details: getCleanErrorMessage(err) });
  }
});

// DELETE /api/certificates/:id - Delete a certificate (password-secured)
app.delete("/api/certificates/:id", requireAdminAuth, async (req, res) => {
  try {

    const { id } = req.params;
    if (db && !id.startsWith("mem_")) {
      try {
        await deleteDoc(doc(db, "certificates", id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `certificates/${id}`);
      }
      return res.json({ success: true });
    } else {
      memoryCertificates = memoryCertificates.filter(c => c.id !== id);
      return res.json({ success: true });
    }
  } catch (err: any) {
    console.error("[API] Failed to delete certificate:", err);
    res.status(500).json({ error: "Failed to delete certificate.", details: getCleanErrorMessage(err) });
  }
});

export default app;
