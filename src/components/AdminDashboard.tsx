import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Trash2, Search, Lock, Unlock, RefreshCw, Inbox, 
  Calendar, Mail, User, ShieldAlert, CheckCircle, KeyRound, 
  HelpCircle, Check, Send, Reply, X, MailOpen, Paperclip, 
  Image as ImageIcon, Copy, FileImage, UploadCloud, CornerDownRight,
  TrendingUp, Clock, Globe, Activity, Eye, Users, Percent, ChevronRight,
  Award, Plus, Edit2, FolderGit2, AlertCircle, Sliders
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AnalyticsPanel from "./AnalyticsPanel";

import p1_col1_1 from "../assets/images/p1_col1_1.webp";
import p1_col1_2 from "../assets/images/p1_col1_2.webp";
import p1_col2 from "../assets/images/p1_col2.webp";
import p2_col1_1 from "../assets/images/p2_col1_1.webp";
import p2_col1_2 from "../assets/images/p2_col1_2.webp";
import p2_col2 from "../assets/images/p2_col2.webp";
import p3_col1_1 from "../assets/images/p3_col1_1.webp";
import p3_col1_2 from "../assets/images/p3_col1_2.webp";
import p3_col2 from "../assets/images/p3_col2.webp";

interface ProjectSlotConfig {
  key: "col1_1" | "col1_2" | "col2";
  label: string;
  defaultImg: string;
  aspectDesc: string;
}

interface PortfolioProjectBase {
  num: string;
  title: string;
  category: string;
  slots: ProjectSlotConfig[];
}

const PORTFOLIO_PROJECTS_BASE: PortfolioProjectBase[] = [
  {
    num: "01",
    title: "Village Cafe",
    category: "RESTAURANT / ONLINE ORDERING",
    slots: [
      { key: "col1_1", label: "Desktop Detail 1", defaultImg: p1_col1_1, aspectDesc: "Wide / Card Top" },
      { key: "col1_2", label: "Component Detail 2", defaultImg: p1_col1_2, aspectDesc: "Detail / Card Bottom" },
      { key: "col2", label: "Hero Showcase View", defaultImg: p1_col2, aspectDesc: "Tall / Hero Display" },
    ]
  },
  {
    num: "02",
    title: "Got U — Social Media Platform",
    category: "SOCIAL MEDIA / COMMUNITY CONNECTION",
    slots: [
      { key: "col1_1", label: "Feed Detail 1", defaultImg: p2_col1_1, aspectDesc: "Wide / Card Top" },
      { key: "col1_2", label: "Interface Detail 2", defaultImg: p2_col1_2, aspectDesc: "Detail / Card Bottom" },
      { key: "col2", label: "Hero Platform View", defaultImg: p2_col2, aspectDesc: "Tall / Hero Display" },
    ]
  },
  {
    num: "03",
    title: "EthioMerit — Public Recruitment & Anti-Corruption Platform",
    category: "PUBLIC RECRUITMENT / TRANSPARENCY",
    slots: [
      { key: "col1_1", label: "Portal Detail 1", defaultImg: p3_col1_1, aspectDesc: "Wide / Card Top" },
      { key: "col1_2", label: "Verification Detail 2", defaultImg: p3_col1_2, aspectDesc: "Detail / Card Bottom" },
      { key: "col2", label: "Hero System View", defaultImg: p3_col2, aspectDesc: "Tall / Hero Display" },
    ]
  }
];

async function compressImageForUpload(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1600;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        let dataUrl = canvas.toDataURL("image/webp", 0.85);
        if (!dataUrl.startsWith("data:image/webp")) {
          dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        }
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Failed to load selected image file."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file from disk."));
    reader.readAsDataURL(file);
  });
}

interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  replyText?: string;
  replyImage?: string; // base64 representation of attached image
  repliedAt?: string;
  replied?: boolean;
}

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // First-time configuration state
  const [isSystemSetup, setIsSystemSetup] = useState<boolean | null>(null);
  const [setupPwd, setSetupPwd] = useState("");
  const [confirmSetupPwd, setConfirmSetupPwd] = useState("");
  const [setupError, setSetupError] = useState("");
  const [setupSuccess, setSetupSuccess] = useState("");
  const [isSettingUp, setIsSettingUp] = useState(false);

  // Modals & Triggers
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [showForgotPwd, setShowForgotPwd] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  
  // Password Change Form State
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmNewPwd, setConfirmNewPwd] = useState("");
  const [pwdChangeError, setPwdChangeError] = useState("");
  const [pwdChangeSuccess, setPwdChangeSuccess] = useState("");
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  // Reply Drafts and Attachments per Submission ID
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyImages, setReplyImages] = useState<Record<string, string>>({});
  const [replyErrors, setReplyErrors] = useState<Record<string, string>>({});
  const [replySuccesses, setReplySuccesses] = useState<Record<string, string>>({});
  const [clipboardStatus, setClipboardStatus] = useState<Record<string, string>>({});
  const [textCopyStatus, setTextCopyStatus] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({});

  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Visitor Analytics State
  const [activeTab, setActiveTab] = useState<"submissions" | "analytics" | "projects">("submissions");
  const [analytics, setAnalytics] = useState<{
    totalPageViews: number;
    uniqueVisitorsCount: number;
    topPaths: { path: string; count: number }[];
    browsersMap: Record<string, number>;
    chartData: { date: string; views: number }[];
    recentVisits: { id: string; path: string; timestamp: string; language: string; userAgent: string }[];
  } | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);

  // Projects State
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({
    id: "",
    num: "",
    category: "",
    title: "",
    col1_1: "",
    col1_2: "",
    col2: "",
    order: 0
  });

  const fetchAnalytics = async (pwdToUse?: string) => {
    const pwd = pwdToUse || password;
    if (!pwd) return;
    setIsAnalyticsLoading(true);
    try {
      const res = await fetch(`/api/dashboard/analytics?password=${encodeURIComponent(pwd)}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error("Failed to load visitor analytics:", e);
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  const fetchProjects = async () => {
    setIsProjectsLoading(true);
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setDbProjects(data.projects || []);
      }
    } catch (e) {
      console.error("Failed to fetch projects:", e);
    } finally {
      setIsProjectsLoading(false);
    }
  };

  // Gallery Image State
  const [customGalleryImages, setCustomGalleryImages] = useState<Record<string, string>>({});
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState<Record<string, number>>({});
  const [galleryUploadStatus, setGalleryUploadStatus] = useState<Record<string, string>>({});
  const [galleryUploadError, setGalleryUploadError] = useState<Record<string, string>>({});
  const [galleryUploadSuccess, setGalleryUploadSuccess] = useState<Record<string, string>>({});

  const fetchGalleryImages = async () => {
    setIsGalleryLoading(true);
    try {
      const res = await fetch("/api/projects/images");
      if (res.ok) {
        const data = await res.json();
        if (data && data.images) {
          setCustomGalleryImages(data.images);
        }
      }
    } catch (e) {
      console.error("Failed to load gallery images:", e);
    } finally {
      setIsGalleryLoading(false);
    }
  };

  // Layout Adjustment State (Exclusively managed within authenticated Admin Dashboard)
  const [selectedLayoutProject, setSelectedLayoutProject] = useState<string>("01");
  const [projectLayoutsState, setProjectLayoutsState] = useState<Record<string, any>>({
    "01": { img1: { x: 0, y: 0, scale: 1.0 }, img2: { x: 0, y: 0, scale: 1.0 }, img3: { x: 0, y: 0, scale: 1.0 } },
    "02": { img1: { x: 0, y: 0, scale: 1.0 }, img2: { x: 0, y: 0, scale: 1.0 }, img3: { x: 0, y: 0, scale: 1.0 } },
    "03": { img1: { x: 0, y: -20, scale: 1.15 }, img2: { x: 0, y: -20, scale: 1.15 }, img3: { x: 0, y: -40, scale: 1.1 } }
  });
  const [isSavingLayout, setIsSavingLayout] = useState(false);
  const [layoutSaveMsg, setLayoutSaveMsg] = useState("");
  const [layoutSaveError, setLayoutSaveError] = useState("");

  const fetchLayouts = async () => {
    try {
      const res = await fetch("/api/projects/layout");
      if (res.ok) {
        const data = await res.json();
        if (data.layouts && Object.keys(data.layouts).length > 0) {
          setProjectLayoutsState(prev => ({ ...prev, ...data.layouts }));
        }
      }
    } catch (e) {
      console.warn("Could not load layouts:", e);
    }
  };

  const handleUpdateSlotLayout = (slotKey: "img1" | "img2" | "img3", prop: "x" | "y" | "scale", val: number) => {
    setProjectLayoutsState(prev => {
      const proj = prev[selectedLayoutProject] || {
        img1: { x: 0, y: 0, scale: 1.0 },
        img2: { x: 0, y: 0, scale: 1.0 },
        img3: { x: 0, y: 0, scale: 1.0 }
      };
      return {
        ...prev,
        [selectedLayoutProject]: {
          ...proj,
          [slotKey]: {
            ...proj[slotKey],
            [prop]: val
          }
        }
      };
    });
  };

  const handleSaveLayout = async () => {
    if (!password) return;
    setIsSavingLayout(true);
    setLayoutSaveMsg("");
    setLayoutSaveError("");
    try {
      const currentLayout = projectLayoutsState[selectedLayoutProject];
      const res = await fetch("/api/projects/layout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password
        },
        body: JSON.stringify({
          projectNum: selectedLayoutProject,
          layouts: currentLayout
        })
      });
      if (res.ok) {
        localStorage.setItem(`project_layouts_v2_${selectedLayoutProject}`, JSON.stringify(currentLayout));
        setLayoutSaveMsg(`Layout adjustments for Project ${selectedLayoutProject} saved successfully!`);
        setTimeout(() => setLayoutSaveMsg(""), 4000);
      } else {
        const d = await res.json().catch(() => ({}));
        setLayoutSaveError(d.error || "Failed to save layout.");
      }
    } catch (err: any) {
      setLayoutSaveError("Error saving layout: " + (err.message || err));
    } finally {
      setIsSavingLayout(false);
    }
  };

  const handleResetLayout = async () => {
    const defaultLayout = selectedLayoutProject === "03" ? {
      img1: { x: 0, y: -20, scale: 1.15 },
      img2: { x: 0, y: -20, scale: 1.15 },
      img3: { x: 0, y: -40, scale: 1.1 }
    } : {
      img1: { x: 0, y: 0, scale: 1.0 },
      img2: { x: 0, y: 0, scale: 1.0 },
      img3: { x: 0, y: 0, scale: 1.0 }
    };
    setProjectLayoutsState(prev => ({ ...prev, [selectedLayoutProject]: defaultLayout }));
    localStorage.setItem(`project_layouts_v2_${selectedLayoutProject}`, JSON.stringify(defaultLayout));
    try {
      await fetch("/api/projects/layout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password
        },
        body: JSON.stringify({
          projectNum: selectedLayoutProject,
          layouts: defaultLayout
        })
      });
      setLayoutSaveMsg(`Project ${selectedLayoutProject} layout reset to default presets!`);
      setTimeout(() => setLayoutSaveMsg(""), 4000);
    } catch (e) {
      // non-fatal
    }
  };

  const handleReplaceGalleryImage = async (
    projectNum: string,
    slot: "col1_1" | "col1_2" | "col2",
    file: File
  ) => {
    const slotKey = `${projectNum}_${slot}`;
    setGalleryUploadError((prev) => ({ ...prev, [slotKey]: "" }));
    setGalleryUploadSuccess((prev) => ({ ...prev, [slotKey]: "" }));
    setGalleryUploadProgress((prev) => ({ ...prev, [slotKey]: 15 }));
    setGalleryUploadStatus((prev) => ({ ...prev, [slotKey]: "Optimizing image for fast delivery..." }));

    try {
      const compressedData = await compressImageForUpload(file);
      setGalleryUploadProgress((prev) => ({ ...prev, [slotKey]: 60 }));
      setGalleryUploadStatus((prev) => ({ ...prev, [slotKey]: "Saving permanently to Firestore database..." }));

      const res = await fetch("/api/projects/replace-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          projectNum,
          slot,
          data: compressedData,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save image to database.");
      }

      setGalleryUploadProgress((prev) => ({ ...prev, [slotKey]: 100 }));
      setGalleryUploadStatus((prev) => ({ ...prev, [slotKey]: "" }));
      setGalleryUploadSuccess((prev) => ({
        ...prev,
        [slotKey]: "Image saved permanently in database!",
      }));
      setCustomGalleryImages((prev) => ({
        ...prev,
        [slotKey]: compressedData,
      }));

      setTimeout(() => {
        setGalleryUploadSuccess((prev) => ({ ...prev, [slotKey]: "" }));
        setGalleryUploadProgress((prev) => ({ ...prev, [slotKey]: 0 }));
      }, 5000);
    } catch (err: any) {
      console.error("Failed to replace gallery image:", err);
      setGalleryUploadProgress((prev) => ({ ...prev, [slotKey]: 0 }));
      setGalleryUploadStatus((prev) => ({ ...prev, [slotKey]: "" }));
      setGalleryUploadError((prev) => ({
        ...prev,
        [slotKey]: err.message || "Failed to replace image. Previous image preserved.",
      }));
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/projects?password=" + encodeURIComponent(password), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password
        },
        body: JSON.stringify(projectForm)
      });
      if (res.ok) {
        setShowProjectModal(false);
        fetchProjects();
      } else {
        const d = await res.json();
        alert(d.error || "Failed to save project.");
      }
    } catch (err) {
      alert("Error saving project.");
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      const res = await fetch(`/api/projects/${id}?password=${encodeURIComponent(password)}`, {
        method: "DELETE",
        headers: {
          "x-admin-password": password
        }
      });
      if (res.ok) {
        fetchProjects();
      }
    } catch (err) {
      alert("Failed to delete project.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'col1_1' | 'col1_2' | 'col2') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setProjectForm(prev => ({ ...prev, [field]: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Check initial setup status on mount (we strictly do not auto-login to ensure privacy)
  useEffect(() => {
    let active = true;
    const checkSystemStatus = async () => {
      try {
        const res = await fetch("/api/dashboard/status");
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setIsSystemSetup(data.isSetup !== false);
          }
        } else if (active) {
          setIsSystemSetup(true);
        }
      } catch (e) {
        if (active) {
          setIsSystemSetup(true);
        }
      }
    };
    checkSystemStatus();
    return () => {
      active = false;
    };
  }, []);

  const handleSetupPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError("");
    setSetupSuccess("");

    if (!setupPwd || !confirmSetupPwd) {
      setSetupError("Please fill in both fields.");
      return;
    }

    if (setupPwd !== confirmSetupPwd) {
      setSetupError("Passwords do not match.");
      return;
    }

    if (setupPwd.length < 6) {
      setSetupError("Password must be at least 6 characters long.");
      return;
    }

    setIsSettingUp(true);
    try {
      const res = await fetch("/api/dashboard/setup-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ newPassword: setupPwd })
      });

      const data = await res.json();
      if (res.ok) {
        setSetupSuccess("Secure administrator password configured successfully!");
        setPassword(setupPwd);
        setIsSystemSetup(true);
        setTimeout(() => {
          verifyPassword(setupPwd);
        }, 1500);
      } else {
        setSetupError(data.error || "Failed to save password.");
      }
    } catch (e) {
      setSetupError("Network error. Unable to set setup password.");
    } finally {
      setIsSettingUp(false);
    }
  };

  const fetchSubmissions = async (pwdToUse?: string) => {
    const pwd = pwdToUse || password;
    if (!pwd) return;
    try {
      const res = await fetch("/api/dashboard/submissions", {
        headers: { "x-admin-password": pwd }
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch (e) {
      console.error("Failed to load submissions:", e);
    }
  };

  const verifyPassword = async (pwdToVerify: string) => {
    if (!pwdToVerify || !pwdToVerify.trim()) {
      setError("Please enter your administrator password.");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const trimmedPwd = pwdToVerify.trim();
      const res = await fetch("/api/auth/verify-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": trimmedPwd,
        },
        body: JSON.stringify({ password: trimmedPwd }),
      });
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setIsAuthenticated(true);
        setPassword(trimmedPwd);
        localStorage.setItem("admin_auth_token", trimmedPwd);
        window.dispatchEvent(new Event("admin-auth-change"));
        // Load submissions, analytics, projects, and gallery images
        await fetchSubmissions(trimmedPwd);
        fetchAnalytics(trimmedPwd);
        fetchProjects();
        fetchGalleryImages();
        fetchLayouts();
      } else {
        localStorage.removeItem("admin_auth_token");
        window.dispatchEvent(new Event("admin-auth-change"));
        setIsAuthenticated(false);
        setError(data.error || "Invalid administrator password.");
      }
    } catch (err) {
      setError("Failed to connect to the backend server. Make sure the server is active.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !password.trim()) {
      setError("Please enter the administrator password.");
      return;
    }
    verifyPassword(password.trim());
  };

  const handleRefresh = async () => {
    if (!password) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dashboard/submissions?password=${encodeURIComponent(password)}`);
      const data = await res.json();
      if (res.ok) {
        setSubmissions(data.submissions || []);
        await fetchAnalytics(password);
      } else {
        setError(data.error || "Session expired. Please log in again.");
        setIsAuthenticated(false);
      }
    } catch (err) {
      setError("Failed to reload data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/dashboard/submissions/${id}?password=${encodeURIComponent(password)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setSubmissions(prev => prev.filter(sub => sub.id !== id));
        setDeleteId(null);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete submission");
      }
    } catch (err) {
      alert("Error deleting submission.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdChangeError("");
    setPwdChangeSuccess("");

    if (!currentPwd || !newPwd || !confirmNewPwd) {
      setPwdChangeError("All fields are required.");
      return;
    }

    if (newPwd !== confirmNewPwd) {
      setPwdChangeError("New passwords do not match.");
      return;
    }

    if (newPwd.length < 6) {
      setPwdChangeError("New password must be at least 6 characters long.");
      return;
    }

    setIsChangingPwd(true);
    try {
      const res = await fetch("/api/dashboard/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd })
      });

      const data = await res.json();
      if (res.ok) {
        setPwdChangeSuccess("Password successfully updated and saved securely!");
        setPassword(newPwd);
        // Clear inputs after success delay
        setTimeout(() => {
          setCurrentPwd("");
          setNewPwd("");
          setConfirmNewPwd("");
          setShowChangePwd(false);
          setPwdChangeSuccess("");
        }, 2000);
      } else {
        setPwdChangeError(data.error || "Failed to update password.");
      }
    } catch (err) {
      setPwdChangeError("Network error. Unable to change password.");
    } finally {
      setIsChangingPwd(false);
    }
  };

  const handleSaveReply = async (subId: string) => {
    const draftText = replyDrafts[subId];
    const draftImage = replyImages[subId];

    setReplyErrors(prev => ({ ...prev, [subId]: "" }));
    setReplySuccesses(prev => ({ ...prev, [subId]: "" }));

    if (!draftText || !draftText.trim()) {
      setReplyErrors(prev => ({ ...prev, [subId]: "Please write a response first." }));
      return;
    }

    setIsSubmittingReply(true);
    try {
      const res = await fetch(`/api/dashboard/submissions/${subId}/reply?password=${encodeURIComponent(password)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          replyText: draftText,
          replyImage: draftImage || null
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSubmissions(prev => prev.map(sub => {
          if (sub.id === subId) {
            return {
              ...sub,
              replyText: data.replyText,
              replyImage: data.replyImage,
              repliedAt: data.repliedAt,
              replied: true
            };
          }
          return sub;
        }));
        setReplySuccesses(prev => ({ ...prev, [subId]: "Response saved successfully to database!" }));
        setTimeout(() => {
          setReplyingToId(null);
          // clear temporary feedback messages
          setReplySuccesses(prev => ({ ...prev, [subId]: "" }));
        }, 1500);
      } else {
        setReplyErrors(prev => ({ ...prev, [subId]: data.error || "Failed to save reply." }));
      }
    } catch (err) {
      setReplyErrors(prev => ({ ...prev, [subId]: "Error connecting to backend server." }));
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, subId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setReplyErrors(prev => ({ ...prev, [subId]: "File size exceeds 2MB limit." }));
        return;
      }
      
      setReplyErrors(prev => ({ ...prev, [subId]: "" }));
      setUploadProgress(prev => ({ ...prev, [subId]: 5 }));
      setUploadStatus(prev => ({ ...prev, [subId]: "Reading image stream..." }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        
        let progress = 5;
        const interval = setInterval(() => {
          progress += Math.floor(Math.random() * 15) + 12;
          if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Set image and clear uploading states
            setReplyImages(prev => ({
              ...prev,
              [subId]: base64Data
            }));
            setUploadProgress(prev => {
              const copy = { ...prev };
              delete copy[subId];
              return copy;
            });
            setUploadStatus(prev => {
              const copy = { ...prev };
              delete copy[subId];
              return copy;
            });
          } else {
            setUploadProgress(prev => ({ ...prev, [subId]: progress }));
            let statusText = "Uploading file buffer...";
            if (progress > 25 && progress <= 55) {
              statusText = "Replicating database caches...";
            } else if (progress > 55 && progress <= 80) {
              statusText = "Compressing graphic layers...";
            } else if (progress > 80 && progress < 100) {
              statusText = "Rendering static preview...";
            }
            setUploadStatus(prev => ({ ...prev, [subId]: statusText }));
          }
        }, 120);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (subId: string) => {
    setReplyImages(prev => {
      const copy = { ...prev };
      delete copy[subId];
      return copy;
    });
  };

  const handleCopyImage = async (subId: string, base64Data: string) => {
    try {
      setClipboardStatus(prev => ({ ...prev, [subId]: "Copying..." }));
      const response = await fetch(base64Data);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      setClipboardStatus(prev => ({ ...prev, [subId]: "Copied Image!" }));
      setTimeout(() => {
        setClipboardStatus(prev => ({ ...prev, [subId]: "" }));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy image:", err);
      setClipboardStatus(prev => ({ ...prev, [subId]: "Failed" }));
      setTimeout(() => {
        setClipboardStatus(prev => ({ ...prev, [subId]: "" }));
      }, 2000);
    }
  };

  const handleCopyText = async (subId: string, text: string) => {
    try {
      setTextCopyStatus(prev => ({ ...prev, [subId]: "Copying..." }));
      await navigator.clipboard.writeText(text);
      setTextCopyStatus(prev => ({ ...prev, [subId]: "Copied!" }));
      setTimeout(() => {
        setTextCopyStatus(prev => ({ ...prev, [subId]: "" }));
      }, 2000);
    } catch (err) {
      setTextCopyStatus(prev => ({ ...prev, [subId]: "Failed" }));
      setTimeout(() => {
        setTextCopyStatus(prev => ({ ...prev, [subId]: "" }));
      }, 2000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth_token");
    localStorage.removeItem("admin_password");
    window.dispatchEvent(new Event("admin-auth-change"));
    setIsAuthenticated(false);
    setPassword("");
    setSubmissions([]);
    setError("");
    onClose(); // Automatically exit dashboard and return to main site on sign-out
  };

  // Filtered submissions based on search
  const filteredSubmissions = submissions.filter(sub => {
    const q = searchTerm.toLowerCase();
    return (
      sub.name.toLowerCase().includes(q) ||
      sub.email.toLowerCase().includes(q) ||
      sub.message.toLowerCase().includes(q)
    );
  });

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#D7E2EA] font-sans selection:bg-[#B600A8]/30 selection:text-white p-4 sm:p-10 md:p-16 relative overflow-hidden flex flex-col justify-between">
      {/* Decorative blurred backgrounds */}
      <div className="absolute -top-[10%] -left-[10%] w-[400px] h-[400px] rounded-full bg-[#B600A8]/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[350px] h-[350px] rounded-full bg-[#7621B0]/10 blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-[10%] left-[20%] w-[400px] h-[400px] rounded-full bg-[#BE4C00]/5 blur-[150px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl w-full mx-auto relative z-10 flex-1 flex flex-col">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-white/10 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all duration-300 group hover:scale-105 cursor-pointer text-white"
              title="Return to Portfolio"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B600A8] animate-pulse" />
                <span className="text-xs uppercase tracking-widest font-bold text-[#D7E2EA]/50">Secure Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1">
                Admin Dashboard
              </h1>
            </div>
          </div>

          {isAuthenticated && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowChangePwd(true)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer text-[#D7E2EA]/80 hover:text-white"
                title="Change Secure Password"
              >
                <KeyRound className="w-4 h-4" />
                <span>Password</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* AUTHENTICATION VIEW */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center py-12">
            {isSystemSetup === null ? (
              <div className="flex flex-col items-center gap-4">
                <RefreshCw className="w-8 h-8 text-[#B600A8] animate-spin" />
                <p className="text-xs text-[#D7E2EA]/40 uppercase tracking-widest font-semibold">Verifying Secure Status...</p>
              </div>
            ) : isSystemSetup === false ? (
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-[32px] p-8 md:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
              >
                <div className="flex flex-col items-center gap-4 text-center mb-8">
                  <div className="w-14 h-14 rounded-full bg-[#B600A8]/15 flex items-center justify-center text-[#B600A8] border border-[#B600A8]/30">
                    <KeyRound className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-wider text-white">Secure Admin Setup</h2>
                    <p className="text-xs text-[#D7E2EA]/50 mt-1">
                      Configure your secure administrator password.
                    </p>
                  </div>
                </div>

                {setupError && (
                  <div className="flex items-center gap-2.5 text-red-400 bg-red-400/10 border border-red-400/20 px-4 py-3 rounded-xl text-xs font-semibold mb-6">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{setupError}</span>
                  </div>
                )}

                {setupSuccess && (
                  <div className="flex items-center gap-2.5 text-green-400 bg-green-400/10 border border-green-400/20 px-4 py-3 rounded-xl text-xs font-semibold mb-6">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{setupSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleSetupPasswordSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#D7E2EA]/70 font-semibold">
                      New Password (Min 6 chars)
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={setupPwd}
                      onChange={(e) => setSetupPwd(e.target.value)}
                      disabled={isSettingUp || !!setupSuccess}
                      className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-black border border-white/10 focus:border-[#B600A8]/80 text-white rounded-xl py-3 px-4 text-xs transition-all duration-300 outline-none placeholder:text-white/20"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#D7E2EA]/70 font-semibold">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={confirmSetupPwd}
                      onChange={(e) => setConfirmSetupPwd(e.target.value)}
                      disabled={isSettingUp || !!setupSuccess}
                      className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-black border border-white/10 focus:border-[#B600A8]/80 text-white rounded-xl py-3 px-4 text-xs transition-all duration-300 outline-none placeholder:text-white/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSettingUp || !!setupSuccess}
                    className="w-full rounded-full text-white font-semibold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer py-4 text-sm flex items-center justify-center gap-2 mt-4 disabled:opacity-55 disabled:scale-100"
                    style={{
                      background: "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)",
                      boxShadow: "0px 4px 4px rgba(181, 1, 167, 0.25)",
                      outline: "2px solid white",
                      outlineOffset: "-3px",
                    }}
                  >
                    {isSettingUp ? "Setting up..." : "Configure & Initialize"}
                    <Check className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-[32px] p-8 md:p-10 shadow-[0_30px_100px_rgba(0,0,0,0.8)]"
              >
                <div className="flex flex-col items-center gap-4 text-center mb-8">
                  <div className="w-14 h-14 rounded-full bg-[#B600A8]/15 flex items-center justify-center text-[#B600A8] border border-[#B600A8]/30">
                    <Lock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-wider text-white">Unlock Admin Vault</h2>
                    <p className="text-xs text-[#D7E2EA]/50 mt-1">
                      Enter your dashboard password to view live project contact submissions.
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2.5 text-red-400 bg-red-400/10 border border-red-400/20 px-4 py-3 rounded-xl text-sm font-medium mb-6">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase tracking-wider text-[#D7E2EA]/70 font-medium">
                        Security Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPwd(true)}
                        className="text-xs text-[#B600A8] hover:text-[#B600A8]/80 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Forgot Password?</span>
                      </button>
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-black border border-white/10 focus:border-[#B600A8]/80 text-white rounded-xl py-3.5 px-4 text-sm transition-all duration-300 outline-none placeholder:text-white/20"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full rounded-full text-white font-semibold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer py-4 text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-55 disabled:scale-100"
                    style={{
                      background: "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)",
                      boxShadow: "0px 4px 4px rgba(181, 1, 167, 0.25)",
                      outline: "2px solid white",
                      outlineOffset: "-3px",
                    }}
                  >
                    {isLoading ? "Verifying..." : "Access Dashboard"}
                    <Unlock className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}
          </div>
        ) : (
          /* MAIN SUBMISSIONS LIST VIEW */
          <div className="flex-1 flex flex-col">
            {/* TABS SELECTOR */}
            <div className="flex flex-wrap border-b border-white/10 mb-8 gap-4 sm:gap-6">
              <button
                onClick={() => setActiveTab("submissions")}
                className={`pb-4 text-xs font-bold tracking-widest border-b-2 uppercase transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "submissions"
                    ? "text-[#B600A8] border-[#B600A8]"
                    : "text-white/40 border-transparent hover:text-white/70"
                }`}
              >
                <Inbox className="w-4 h-4" />
                Submissions Inbox ({submissions.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab("analytics");
                  fetchAnalytics();
                }}
                className={`pb-4 text-xs font-bold tracking-widest border-b-2 uppercase transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "analytics"
                    ? "text-[#B600A8] border-[#B600A8]"
                    : "text-white/40 border-transparent hover:text-white/70"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Visitor Analytics
              </button>
              <button
                onClick={() => {
                  setActiveTab("projects");
                  fetchProjects();
                  fetchGalleryImages();
                }}
                className={`pb-4 text-xs font-bold tracking-widest border-b-2 uppercase transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === "projects"
                    ? "text-[#B600A8] border-[#B600A8]"
                    : "text-white/40 border-transparent hover:text-white/70"
                }`}
              >
                <FolderGit2 className="w-4 h-4" />
                Projects Manager ({dbProjects.length})
              </button>
            </div>

            {activeTab === "submissions" && (
              <>
                {/* STATS ROW */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#D7E2EA]/40 uppercase tracking-wider">Total Submissions</p>
                  <h3 className="text-3xl font-black text-white mt-1">{submissions.length}</h3>
                </div>
                <div className="p-3 rounded-xl bg-[#B600A8]/10 text-[#B600A8]">
                  <Inbox className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#D7E2EA]/40 uppercase tracking-wider">Active Database</p>
                  <h3 className="text-sm font-semibold text-green-400 mt-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Database Connected
                  </h3>
                </div>
                <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#D7E2EA]/40 uppercase tracking-wider">Secure Access</p>
                  <h3 className="text-sm font-semibold text-white/90 mt-2 truncate max-w-[150px]">
                    ●●●●●●●●●●
                  </h3>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                  <Lock className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* SEARCH / FILTERS */}
            <div className="bg-white/[0.01] border border-white/10 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  placeholder="Search submissions by sender, email, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/[0.03] hover:bg-white/[0.05] focus:bg-black border border-white/5 focus:border-[#B600A8]/50 text-white rounded-xl py-3 pl-11 pr-4 text-sm transition-all outline-none"
                />
              </div>
              <div className="text-xs text-[#D7E2EA]/40 shrink-0 font-medium">
                Showing {filteredSubmissions.length} of {submissions.length} items
              </div>
            </div>

            {/* SUBMISSIONS LIST */}
            {filteredSubmissions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center border border-white/5 rounded-[32px] bg-white/[0.01]">
                <Inbox className="w-12 h-12 text-[#D7E2EA]/20 mb-4" />
                <p className="text-base text-[#D7E2EA]/60 font-medium">No contact submissions found.</p>
                <p className="text-xs text-[#D7E2EA]/30 mt-1 max-w-sm">
                  {searchTerm ? "Try adjusting your search criteria or clear the filter." : "New messages submitted via the contact form will appear here."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredSubmissions.map((sub) => {
                    const isReplying = replyingToId === sub.id;
                    const draftValue = replyDrafts[sub.id] || "";

                    return (
                      <motion.div
                        key={sub.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white/[0.02] border border-white/10 hover:border-white/20 rounded-3xl p-6 relative flex flex-col justify-between transition-all group"
                      >
                        <div className="space-y-4">
                          {/* Header info */}
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1 min-w-0">
                              <h4 className="font-bold text-white text-base tracking-wide flex items-center gap-1.5 truncate">
                                <User className="w-4 h-4 text-[#B600A8] shrink-0" />
                                {sub.name}
                              </h4>
                              <p className="text-xs text-[#D7E2EA]/50 truncate flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-white/30 shrink-0" />
                                {sub.email}
                              </p>
                            </div>

                            <button
                              onClick={() => setDeleteId(sub.id)}
                              className="p-2 text-[#D7E2EA]/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer shrink-0"
                              title="Delete Submission"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Date & Reply status badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#D7E2EA]/30 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-white/20" />
                              {formatDate(sub.createdAt)}
                            </div>
                            
                            {sub.replied ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Replied
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                Pending
                              </span>
                            )}
                          </div>

                          {/* Message body */}
                          <p className="text-sm text-[#D7E2EA]/80 font-light leading-relaxed bg-white/[0.01] p-4 rounded-2xl border border-[#D7E2EA]/5 break-words min-h-[90px] whitespace-pre-wrap">
                            {sub.message}
                          </p>

                          {/* Reply History */}
                          {sub.replied && sub.replyText && (
                            <div className="mt-2 bg-[#B600A8]/5 border border-[#B600A8]/20 rounded-2xl p-4 space-y-3">
                              <div className="flex items-center justify-between text-[11px] font-bold text-[#B600A8] uppercase tracking-wider">
                                <span className="flex items-center gap-1.5">
                                  <MailOpen className="w-3.5 h-3.5" />
                                  My Reply Status
                                </span>
                                <span className="text-white/30 text-[10px] font-medium">
                                  {formatDate(sub.repliedAt || "")}
                                </span>
                              </div>
                              <p className="text-xs text-[#D7E2EA]/80 leading-relaxed italic break-words whitespace-pre-wrap">
                                "{sub.replyText}"
                              </p>
                              {sub.replyImage && (
                                <div className="space-y-1.5 pt-1.5 border-t border-white/5">
                                  <span className="text-[10px] text-[#D7E2EA]/40 font-semibold uppercase tracking-wider block">Attached Image</span>
                                  <div className="relative rounded-lg overflow-hidden border border-white/10 max-h-[140px] bg-black">
                                    <img 
                                      src={sub.replyImage} 
                                      alt="Saved attachment preview" 
                                      className="w-full h-full object-contain max-h-[140px]"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleCopyImage(sub.id, sub.replyImage!)}
                                      className="absolute bottom-2 right-2 px-2.5 py-1.5 bg-black/80 hover:bg-black text-white rounded-lg text-[10px] font-bold flex items-center gap-1 backdrop-blur border border-white/15 transition-all cursor-pointer"
                                    >
                                      <Copy className="w-3 h-3" />
                                      <span>{clipboardStatus[sub.id] || "Copy Image"}</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Reply interface inline */}
                          {isReplying ? (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-4 pt-4 border-t border-white/5 space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase tracking-wider text-[#B600A8]">
                                  Draft Your Response
                                </label>
                                <button 
                                  onClick={() => {
                                    setReplyingToId(null);
                                    handleRemoveImage(sub.id);
                                  }}
                                  className="text-[#D7E2EA]/40 hover:text-white text-xs flex items-center gap-0.5 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Cancel</span>
                                </button>
                              </div>

                              {/* Error and Success in-context statuses */}
                              {replyErrors[sub.id] && (
                                <div className="text-[11px] font-semibold text-red-400 bg-red-400/10 border border-red-400/20 px-3 py-2 rounded-xl flex items-center gap-1.5">
                                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                                  <span>{replyErrors[sub.id]}</span>
                                </div>
                              )}
                              
                              {replySuccesses[sub.id] && (
                                <div className="text-[11px] font-semibold text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-2 rounded-xl flex items-center gap-1.5">
                                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                  <span>{replySuccesses[sub.id]}</span>
                                </div>
                              )}

                              <textarea
                                value={draftValue}
                                onChange={(e) => setReplyDrafts({ ...replyDrafts, [sub.id]: e.target.value })}
                                placeholder="Hi, thank you for your query..."
                                rows={4}
                                className="w-full bg-black border border-white/10 focus:border-[#B600A8]/80 text-white rounded-xl py-2.5 px-3.5 text-xs outline-none resize-none leading-relaxed"
                              />

                              {/* Attachment Interface */}
                              <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider text-[#D7E2EA]/40 font-semibold block">
                                  Attach Image / Screenshot
                                </label>
                                
                                {!replyImages[sub.id] ? (
                                  uploadProgress[sub.id] !== undefined ? (
                                    <div className="border border-white/10 bg-white/[0.01] rounded-xl p-4 flex flex-col items-center justify-center gap-2.5 animate-pulse">
                                      <div className="flex items-center justify-between w-full text-[10px] font-mono text-[#D7E2EA]/40">
                                        <span className="text-[#B600A8] font-bold uppercase tracking-wider">{uploadStatus[sub.id] || "UPLOADING..."}</span>
                                        <span className="font-bold">{uploadProgress[sub.id]}%</span>
                                      </div>
                                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-gradient-to-r from-[#B600A8] to-[#BE4C00] transition-all duration-150"
                                          style={{ width: `${uploadProgress[sub.id]}%` }}
                                        />
                                      </div>
                                      <span className="text-[9px] text-[#D7E2EA]/30 font-semibold tracking-wider uppercase">DO NOT CLOSE TAB</span>
                                    </div>
                                  ) : (
                                    <label 
                                      htmlFor={`reply-img-file-${sub.id}`}
                                      className="border border-dashed border-white/10 hover:border-[#B600A8]/40 bg-white/[0.01] hover:bg-white/[0.03] rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all group"
                                    >
                                      <UploadCloud className="w-5 h-5 text-[#D7E2EA]/30 group-hover:text-[#B600A8] transition-colors" />
                                      <span className="text-[10px] text-[#D7E2EA]/40 group-hover:text-[#D7E2EA]/70 transition-colors">Drag or click to attach image</span>
                                      <input 
                                        type="file"
                                        accept="image/*"
                                        id={`reply-img-file-${sub.id}`}
                                        onChange={(e) => handleImageChange(e, sub.id)}
                                        className="hidden"
                                      />
                                    </label>
                                  )
                                ) : (
                                  <div className="relative border border-white/10 bg-black/40 rounded-xl p-2.5 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="w-10 h-10 rounded bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                                        <img 
                                          src={replyImages[sub.id]} 
                                          alt="Preview" 
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs text-white font-medium truncate">Attachment loaded</p>
                                        <p className="text-[9px] text-green-400 font-semibold flex items-center gap-0.5 mt-0.5">
                                          <CheckCircle className="w-2.5 h-2.5" /> Ready
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleCopyImage(sub.id, replyImages[sub.id])}
                                        className="px-2 py-1 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all text-[10px] font-bold flex items-center gap-1"
                                        title="Copy Image to Clipboard"
                                      >
                                        <Copy className="w-3 h-3" />
                                        <span>{clipboardStatus[sub.id] || "Copy Image"}</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveImage(sub.id)}
                                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all"
                                        title="Remove Image"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col gap-2 pt-1.5">
                                <div className="flex gap-2">
                                  {/* Copy Email Body text */}
                                  <button
                                    type="button"
                                    onClick={() => handleCopyText(sub.id, draftValue)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-[#D7E2EA] hover:text-white py-2 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <Copy className="w-3 h-3" />
                                    <span>{textCopyStatus[sub.id] || "Copy Email Text"}</span>
                                  </button>

                                  {/* Email Native Draft */}
                                  <a
                                    href={`mailto:${sub.email}?subject=Reply to your Senaf 3D Portfolio inquiry&body=${encodeURIComponent(draftValue)}`}
                                    onClick={() => {
                                      if (draftValue.trim()) {
                                        handleSaveReply(sub.id);
                                      }
                                    }}
                                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-[#D7E2EA] hover:text-white py-2 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
                                  >
                                    <Send className="w-3 h-3 text-[#B600A8]" />
                                    <span>Open Email App</span>
                                  </a>
                                </div>

                                {/* Direct Save on Page */}
                                <button
                                  type="button"
                                  onClick={() => handleSaveReply(sub.id)}
                                  disabled={isSubmittingReply || !draftValue.trim()}
                                  className="w-full bg-[#B600A8] hover:bg-[#B600A8]/85 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-white/10 disabled:opacity-40 cursor-pointer animate-none"
                                >
                                  {isSubmittingReply ? "Saving..." : "Save Status on Site"}
                                </button>
                              </div>
                            </motion.div>
                          ) : (
                            <div className="pt-2 border-t border-white/5">
                              <button
                                onClick={() => {
                                  setReplyingToId(sub.id);
                                  // Seed draft text if empty
                                  if (!replyDrafts[sub.id]) {
                                    setReplyDrafts({
                                      ...replyDrafts,
                                      [sub.id]: `Hi ${sub.name},\n\nThank you for reaching out via my contact form! I would love to collaborate with you on this.\n\nBest regards,\nSenaf`
                                    });
                                  }
                                }}
                                className="w-full bg-white/[0.02] hover:bg-white/5 text-white/80 hover:text-white py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/5 transition-colors cursor-pointer"
                              >
                                <Reply className="w-3.5 h-3.5" />
                                <span>{sub.replied ? "Write Another Reply" : "Reply to Client"}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
              </>
            )}

            {activeTab === "analytics" && (
              <AnalyticsPanel 
                analytics={analytics} 
                isLoading={isAnalyticsLoading} 
                onRefresh={() => fetchAnalytics()} 
              />
            )}

            {activeTab === "projects" && (
              <div className="flex-1 flex flex-col gap-8">
                {/* 1. PORTFOLIO GALLERY IMAGE MANAGEMENT */}
                <div className="bg-white/[0.015] border border-white/10 rounded-[32px] p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-white/5">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">Portfolio Gallery Images</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#B600A8]/20 text-[#B600A8] border border-[#B600A8]/30">
                          Persistent Cloud Storage & Database
                        </span>
                      </div>
                      <p className="text-xs text-[#D7E2EA]/60 mt-1.5 max-w-2xl leading-relaxed">
                        Replace each project's gallery images. Once changed, images are permanently saved to the Firestore cloud database and remain active across page reloads, logouts, redeployments, and on all devices. Previous images remain untouched until replacement upload succeeds.
                      </p>
                    </div>
                    <button
                      onClick={fetchGalleryImages}
                      disabled={isGalleryLoading}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-full border border-white/10 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isGalleryLoading ? "animate-spin text-[#B600A8]" : ""}`} />
                      <span>Refresh Images</span>
                    </button>
                  </div>

                  {/* 3 Portfolio Projects Cards */}
                  <div className="space-y-6">
                    {PORTFOLIO_PROJECTS_BASE.map((project) => (
                      <div key={project.num} className="bg-black/40 border border-white/5 rounded-2xl p-5 sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-[#B600A8]">{project.num}</span>
                            <div>
                              <span className="text-[10px] text-white/40 uppercase tracking-widest block">
                                {project.category}
                              </span>
                              <h4 className="text-white font-bold text-base sm:text-lg">{project.title}</h4>
                            </div>
                          </div>
                        </div>

                        {/* 3 Slots */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {project.slots.map((slot) => {
                            const slotKey = `${project.num}_${slot.key}`;
                            const currentSrc = customGalleryImages[slotKey] || slot.defaultImg;
                            const isSlotUploading = !!galleryUploadProgress[slotKey] && galleryUploadProgress[slotKey] < 100;
                            const progress = galleryUploadProgress[slotKey] || 0;
                            const statusMsg = galleryUploadStatus[slotKey];
                            const errorMsg = galleryUploadError[slotKey];
                            const successMsg = galleryUploadSuccess[slotKey];

                            return (
                              <div key={slot.key} className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 flex flex-col justify-between">
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-semibold text-white/90">{slot.label}</span>
                                    <span className="text-[9px] text-[#D7E2EA]/40 font-mono">{slot.aspectDesc}</span>
                                  </div>

                                  {/* Thumbnail Preview */}
                                  <div className="w-full h-36 rounded-lg overflow-hidden relative bg-[#111113] border border-white/5 mb-3 group">
                                    <img
                                      src={currentSrc}
                                      alt={`${project.title} - ${slot.label}`}
                                      className="w-full h-full object-cover filter brightness-95 group-hover:scale-105 transition-all duration-300"
                                    />
                                    {customGalleryImages[slotKey] && (
                                      <span className="absolute top-2 left-2 bg-green-500/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                                        Custom Database Image
                                      </span>
                                    )}
                                    {isSlotUploading && (
                                      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-3 text-center">
                                        <RefreshCw className="w-5 h-5 animate-spin text-[#B600A8] mb-2" />
                                        <span className="text-[11px] font-bold text-white">{statusMsg || "Uploading..."}</span>
                                        <div className="w-full max-w-[120px] bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                                          <div
                                            className="bg-[#B600A8] h-full transition-all duration-200"
                                            style={{ width: `${progress}%` }}
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Status / Error / Success feedback */}
                                {errorMsg && (
                                  <div className="mb-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-1.5 text-[10px] text-red-300">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                                    <span className="leading-tight">{errorMsg}</span>
                                  </div>
                                )}
                                {successMsg && (
                                  <div className="mb-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-1.5 text-[10px] text-green-300">
                                    <CheckCircle className="w-3.5 h-3.5 shrink-0 text-green-400" />
                                    <span className="leading-tight">{successMsg}</span>
                                  </div>
                                )}

                                {/* Upload Action Button */}
                                <div>
                                  <label className="w-full py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer">
                                    <UploadCloud className="w-3.5 h-3.5 text-[#B600A8]" />
                                    <span>{customGalleryImages[slotKey] ? "Replace Image" : "Upload & Replace"}</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      disabled={isSlotUploading}
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleReplaceGalleryImage(project.num, slot.key, file);
                                        }
                                        e.target.value = "";
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. PROJECT CARD LAYOUT & FRAMING CONTROLS (Admin-Only) */}
                <div className="bg-white/[0.015] border border-white/10 rounded-[32px] p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-[#B600A8]" />
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">Project Image Layout & Framing</h3>
                      </div>
                      <p className="text-xs text-[#D7E2EA]/50 mt-1">
                        Fine-tune image scale, horizontal alignment (X), and vertical alignment (Y) for the portfolio cards.
                      </p>
                    </div>

                    {/* Project Selector Pills */}
                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                      {[
                        { num: "01", name: "01 Village Cafe" },
                        { num: "02", name: "02 Got U" },
                        { num: "03", name: "03 EthioMerit" }
                      ].map(p => (
                        <button
                          key={p.num}
                          type="button"
                          onClick={() => setSelectedLayoutProject(p.num)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            selectedLayoutProject === p.num
                              ? "bg-[#B600A8] text-white shadow-md"
                              : "text-[#D7E2EA]/60 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {layoutSaveMsg && (
                    <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-2 text-xs text-green-300">
                      <CheckCircle className="w-4 h-4 shrink-0 text-green-400" />
                      <span>{layoutSaveMsg}</span>
                    </div>
                  )}

                  {layoutSaveError && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs text-red-300">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{layoutSaveError}</span>
                    </div>
                  )}

                  {/* 3 Slot Sliders Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { key: "img1" as const, label: "01 / Top Detail View" },
                      { key: "img2" as const, label: "02 / Bottom Detail View" },
                      { key: "img3" as const, label: "03 / Tall Hero View" }
                    ].map(slot => {
                      const curLayout = (projectLayoutsState[selectedLayoutProject] || {})[slot.key] || { x: 0, y: 0, scale: 1.0 };
                      return (
                        <div key={slot.key} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                              <span className="text-xs font-bold uppercase tracking-wider text-white">{slot.label}</span>
                              <span className="text-[10px] text-[#B600A8] font-mono font-bold bg-[#B600A8]/10 px-2 py-0.5 rounded">
                                {curLayout.scale.toFixed(2)}x
                              </span>
                            </div>

                            {/* Scale Slider */}
                            <div className="mb-4">
                              <div className="flex justify-between text-[11px] text-[#D7E2EA]/70 mb-1">
                                <span>Zoom Scale</span>
                                <span className="font-mono text-white">{curLayout.scale.toFixed(2)}</span>
                              </div>
                              <input
                                type="range"
                                min="0.8"
                                max="2.0"
                                step="0.05"
                                value={curLayout.scale}
                                onChange={(e) => handleUpdateSlotLayout(slot.key, "scale", parseFloat(e.target.value))}
                                className="w-full accent-[#B600A8] cursor-pointer"
                              />
                            </div>

                            {/* X Offset Slider */}
                            <div className="mb-4">
                              <div className="flex justify-between text-[11px] text-[#D7E2EA]/70 mb-1">
                                <span>Horizontal Position (X)</span>
                                <span className="font-mono text-white">{curLayout.x}px</span>
                              </div>
                              <input
                                type="range"
                                min="-100"
                                max="100"
                                step="2"
                                value={curLayout.x}
                                onChange={(e) => handleUpdateSlotLayout(slot.key, "x", parseInt(e.target.value, 10))}
                                className="w-full accent-[#B600A8] cursor-pointer"
                              />
                            </div>

                            {/* Y Offset Slider */}
                            <div className="mb-2">
                              <div className="flex justify-between text-[11px] text-[#D7E2EA]/70 mb-1">
                                <span>Vertical Position (Y)</span>
                                <span className="font-mono text-white">{curLayout.y}px</span>
                              </div>
                              <input
                                type="range"
                                min="-100"
                                max="100"
                                step="2"
                                value={curLayout.y}
                                onChange={(e) => handleUpdateSlotLayout(slot.key, "y", parseInt(e.target.value, 10))}
                                className="w-full accent-[#B600A8] cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Layout Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-3 mt-6 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={handleResetLayout}
                      disabled={isSavingLayout}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[#D7E2EA] text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Reset to Defaults
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveLayout}
                      disabled={isSavingLayout}
                      className="px-5 py-2 bg-[#B600A8] hover:bg-[#B600A8]/85 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-[0_4px_16px_rgba(182,0,168,0.3)] disabled:opacity-50"
                    >
                      {isSavingLayout ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving Layout...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Save Project {selectedLayoutProject} Layout</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 3. DYNAMIC PROJECTS */}
                <div className="bg-white/[0.015] border border-white/10 rounded-[32px] p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-wider">Dynamic Showcase Projects</h3>
                      <p className="text-xs text-[#D7E2EA]/50 mt-1">Add additional custom showcase projects to the live layout.</p>
                    </div>
                  <button
                    onClick={() => {
                      setEditingProject(null);
                      setProjectForm({
                        id: "",
                        num: (dbProjects.length + 1).toString().padStart(2, "0"),
                        category: "3D/Web Application",
                        title: "",
                        col1_1: "",
                        col1_2: "",
                        col2: "",
                        order: Date.now()
                      });
                      setShowProjectModal(true);
                    }}
                    className="px-5 py-2.5 bg-[#B600A8] hover:bg-[#B600A8]/85 text-white text-xs font-bold rounded-full transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Project</span>
                  </button>
                </div>

                {isProjectsLoading ? (
                  <div className="flex-1 flex items-center justify-center py-20 text-white/50 text-sm">
                    <RefreshCw className="w-6 h-6 animate-spin mr-2 text-[#B600A8]" /> Loading projects...
                  </div>
                ) : dbProjects.length === 0 ? (
                  <div className="bg-white/[0.01] border border-white/5 rounded-[32px] py-16 px-6 text-center">
                    <FolderGit2 className="w-12 h-12 text-[#D7E2EA]/20 mx-auto mb-4" />
                    <p className="text-white/70 font-semibold">No Custom Projects Found</p>
                    <p className="text-xs text-[#D7E2EA]/40 mt-1 max-w-md mx-auto">
                      Your site is currently displaying the default pre-configured project showcase screens. Add your own project item to override and display customized dynamic projects!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dbProjects.map((proj) => (
                      <div key={proj.id} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-2xl font-black text-[#B600A8]">{proj.num}</span>
                            <span className="text-[10px] text-white/40 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-lg">
                              {proj.category}
                            </span>
                          </div>
                          <h4 className="text-white font-bold text-lg mb-4 line-clamp-1">{proj.title}</h4>
                          <div className="grid grid-cols-3 gap-2 mb-6 h-12">
                            <div className="bg-white/5 rounded-lg overflow-hidden border border-white/5">
                              {proj.col1_1 ? <img src={proj.col1_1} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/5" />}
                            </div>
                            <div className="bg-white/5 rounded-lg overflow-hidden border border-white/5">
                              {proj.col1_2 ? <img src={proj.col1_2} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/5" />}
                            </div>
                            <div className="bg-white/5 rounded-lg overflow-hidden border border-white/5">
                              {proj.col2 ? <img src={proj.col2} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/5" />}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2.5 border-t border-white/5 pt-4 mt-auto">
                          <button
                            onClick={() => {
                              setEditingProject(proj);
                              setProjectForm({
                                id: proj.id,
                                num: proj.num,
                                category: proj.category,
                                title: proj.title,
                                col1_1: proj.col1_1 || "",
                                col1_2: proj.col1_2 || "",
                                col2: proj.col2 || "",
                                order: proj.order || 0
                              });
                              setShowProjectModal(true);
                            }}
                            className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#B600A8]" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProject(proj.id)}
                            className="py-2 px-3.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 text-xs font-bold rounded-xl transition-colors flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              </div>
            )}


          </div>
        )}
      </div>

      {/* CONFIRM DELETE MODAL */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full bg-[#121212] border border-white/10 rounded-[32px] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-white">Delete Submission?</h3>
              <p className="text-sm text-[#D7E2EA]/60 font-light mt-3 leading-relaxed">
                Are you absolutely sure you want to permanently delete this submission? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end mt-8">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold rounded-full transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isDeleting ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PROJECT ADD/EDIT MODAL */}
      <AnimatePresence>
        {showProjectModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-lg w-full bg-[#121212] border border-white/10 rounded-[32px] p-6 sm:p-8 relative shadow-2xl my-8"
            >
              <button 
                onClick={() => setShowProjectModal(false)}
                className="absolute right-6 top-6 text-[#D7E2EA]/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-white mb-2">
                {editingProject ? "Edit Project Screen" : "Add New Showcase Project"}
              </h3>
              <p className="text-xs text-[#D7E2EA]/50 mb-6">
                Fill in the content fields and upload images to display this project on the site layout.
              </p>

              <form onSubmit={handleSaveProject} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#D7E2EA]/70 font-semibold">Project Number</label>
                    <input
                      type="text"
                      value={projectForm.num}
                      onChange={(e) => setProjectForm({ ...projectForm, num: e.target.value })}
                      placeholder="e.g. 01"
                      className="w-full bg-black border border-white/10 focus:border-[#B600A8]/80 text-white rounded-xl py-2.5 px-4 text-xs outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-[#D7E2EA]/70 font-semibold">Category</label>
                    <input
                      type="text"
                      value={projectForm.category}
                      onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                      placeholder="e.g. Security / Reverse Engineering"
                      className="w-full bg-black border border-white/10 focus:border-[#B600A8]/85 text-white rounded-xl py-2.5 px-4 text-xs outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#D7E2EA]/70 font-semibold">Project Title</label>
                  <input
                    type="text"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    placeholder="e.g. Sentinel Network Protection Gateway"
                    className="w-full bg-black border border-white/10 focus:border-[#B600A8]/80 text-white rounded-xl py-2.5 px-4 text-xs outline-none"
                    required
                  />
                </div>

                <div className="space-y-4 bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-bold block">Desktop & Mobile Mockup Images</span>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#D7E2EA]/60 block font-semibold">1. Col 1 Image 1 (Desktop View)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={projectForm.col1_1}
                        onChange={(e) => setProjectForm({ ...projectForm, col1_1: e.target.value })}
                        placeholder="Paste image link URL or upload below"
                        className="flex-1 bg-black border border-white/10 focus:border-[#B600A8]/80 text-white rounded-xl py-2 px-3 text-xs outline-none"
                      />
                      <label className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-bold cursor-pointer text-center flex items-center justify-center shrink-0">
                        Upload File
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'col1_1')} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#D7E2EA]/60 block font-semibold">2. Col 1 Image 2 (Detail View)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={projectForm.col1_2}
                        onChange={(e) => setProjectForm({ ...projectForm, col1_2: e.target.value })}
                        placeholder="Paste image link URL or upload below"
                        className="flex-1 bg-black border border-white/10 focus:border-[#B600A8]/80 text-white rounded-xl py-2 px-3 text-xs outline-none"
                      />
                      <label className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-bold cursor-pointer text-center flex items-center justify-center shrink-0">
                        Upload File
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'col1_2')} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#D7E2EA]/60 block font-semibold">3. Col 2 Image (Vertical Mobile View)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={projectForm.col2}
                        onChange={(e) => setProjectForm({ ...projectForm, col2: e.target.value })}
                        placeholder="Paste image link URL or upload below"
                        className="flex-1 bg-black border border-white/10 focus:border-[#B600A8]/80 text-white rounded-xl py-2 px-3 text-xs outline-none"
                      />
                      <label className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-bold cursor-pointer text-center flex items-center justify-center shrink-0">
                        Upload File
                        <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'col2')} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(false)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold rounded-full transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#B600A8] hover:bg-[#B600A8]/85 text-white text-xs font-bold rounded-full transition-all cursor-pointer"
                  >
                    Save Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* FORGOT PASSWORD MODAL */}
      <AnimatePresence>
        {showForgotPwd && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full bg-[#121212] border border-white/10 rounded-[32px] p-6 sm:p-8 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <button 
                onClick={() => setShowForgotPwd(false)}
                className="absolute right-6 top-6 text-[#D7E2EA]/40 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mb-5 border border-blue-500/20">
                <HelpCircle className="w-6 h-6 animate-pulse" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-white">Forgot Password</h3>
              
              <div className="text-sm text-[#D7E2EA]/70 font-light mt-4 space-y-4 leading-relaxed">
                <p>
                  If you have forgotten your administrator password, please contact the system administrator or use the internal password management options if available.
                </p>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setShowForgotPwd(false)}
                  className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold rounded-full transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHANGE PASSWORD MODAL */}
      <AnimatePresence>
        {showChangePwd && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full bg-[#121212] border border-white/10 rounded-[32px] p-6 sm:p-8 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <button 
                onClick={() => {
                  setShowChangePwd(false);
                  setPwdChangeError("");
                  setPwdChangeSuccess("");
                }}
                className="absolute right-6 top-6 text-[#D7E2EA]/40 hover:text-white transition-colors cursor-pointer animate-none"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-12 h-12 rounded-full bg-[#B600A8]/10 text-[#B600A8] flex items-center justify-center mb-5 border border-[#B600A8]/20">
                <KeyRound className="w-6 h-6 animate-pulse" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold uppercase tracking-wider text-white">Change Admin Password</h3>
              <p className="text-xs text-[#D7E2EA]/50 mt-1 leading-relaxed">
                Configure a secure custom password that will persist inside your active database.
              </p>
              
              {pwdChangeError && (
                <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 px-4 py-3 rounded-xl text-xs font-semibold mt-4">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{pwdChangeError}</span>
                </div>
              )}

              {pwdChangeSuccess && (
                <div className="flex items-center gap-2 text-green-400 bg-green-400/10 border border-green-400/20 px-4 py-3 rounded-xl text-xs font-semibold mt-4">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{pwdChangeSuccess}</span>
                </div>
              )}

              <form onSubmit={handleChangePasswordSubmit} className="space-y-4 mt-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#D7E2EA]/70 font-semibold">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    disabled={isChangingPwd || !!pwdChangeSuccess}
                    placeholder="••••••••••••"
                    className="w-full bg-black border border-white/10 focus:border-[#B600A8]/80 text-white rounded-xl py-3 px-4 text-xs transition-all duration-300 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#D7E2EA]/70 font-semibold">
                    New Password (Min 6 chars)
                  </label>
                  <input
                    type="password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    disabled={isChangingPwd || !!pwdChangeSuccess}
                    placeholder="••••••••••••"
                    className="w-full bg-black border border-white/10 focus:border-[#B600A8]/80 text-white rounded-xl py-3 px-4 text-xs transition-all duration-300 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#D7E2EA]/70 font-semibold">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmNewPwd}
                    onChange={(e) => setConfirmNewPwd(e.target.value)}
                    disabled={isChangingPwd || !!pwdChangeSuccess}
                    placeholder="••••••••••••"
                    className="w-full bg-black border border-white/10 focus:border-[#B600A8]/80 text-white rounded-xl py-3 px-4 text-xs transition-all duration-300 outline-none"
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowChangePwd(false);
                      setPwdChangeError("");
                      setPwdChangeSuccess("");
                    }}
                    className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold rounded-full transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPwd || !!pwdChangeSuccess}
                    className="px-5 py-2 bg-[#B600A8] hover:bg-[#B600A8]/85 text-white text-xs font-semibold rounded-full transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                  >
                    {isChangingPwd ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <div className="text-center text-xs text-[#D7E2EA]/30 mt-16 border-t border-white/5 pt-8">
        <p>© 2026 Senaf Portfolio Platform. Built with Express.js & Persistent Storage.</p>
      </div>
    </div>
  );
}
