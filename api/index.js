// api/index.js — v2, Supabase (PostgreSQL) au lieu de MongoDB

const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const XLSX = require('xlsx');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
const archiver = require('archiver');
const webpush = require('web-push');

// ========================================================================
// ====================== AIDES POUR GÉNÉRATION WORD ======================
// ========================================================================

const xmlEscape = (str) => {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
};

const containsArabic = (text) => {
  if (typeof text !== 'string') return false;
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text);
};

const formatTextForWord = (text, options = {}) => {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return '<w:p/>';
  }
  
  const cleanedText = text.trim();
  
  const { color, italic } = options;
  const runPropertiesParts = [];
  runPropertiesParts.push('<w:sz w:val="22"/><w:szCs w:val="22"/>');
  if (color) runPropertiesParts.push(`<w:color w:val="${color}"/>`);
  if (italic) runPropertiesParts.push('<w:i/><w:iCs w:val="true"/>');

  let paragraphProperties = '';
  if (containsArabic(cleanedText)) {
    paragraphProperties = '<w:pPr><w:bidi/><w:jc w:val="center"/></w:pPr>';
    runPropertiesParts.push('<w:rtl/>');
  }

  const runProperties = `<w:rPr>${runPropertiesParts.join('')}</w:rPr>`;
  
  const lines = cleanedText.split(/\r\n|\n|\r/);
  const content = lines
    .map(line => `<w:t xml:space="preserve">${xmlEscape(line)}</w:t>`)
    .join('<w:br/>');
  return `<w:p>${paragraphProperties}<w:r>${runProperties}${content}</w:r></w:p>`;
};

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(fileUpload());

const WORD_TEMPLATE_URL = process.env.WORD_TEMPLATE_URL;
const LESSON_TEMPLATE_URL = process.env.LESSON_TEMPLATE_URL;

// ========================================================================
// ======================== SUPABASE CLIENT ================================
// ========================================================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

function getSupabase() {
  if (!supabase) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Variables d\'environnement SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY manquantes.');
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });
  }
  return supabase;
}

// ========================================================================
// ====================== CONFIGURATION WEB PUSH ==========================
// ========================================================================

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BDuAoL4lagqZmYl4BPdCFYBwRhoqGMrcWUFAbF1pMBWq2e0JOV6fL_WitURlXXhXTROGB2vYpnvgSDZfAoZq0Jo';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'TVK1zF6o5s-SK3OQnGCMgu4KZCNxg3py4YA4sMqtItg';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@plan-hebdomadaire.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log('✅ Web Push VAPID configuré');
} else {
  console.warn('⚠️ Clés VAPID manquantes - notifications push désactivées');
}

// ========================================================================
// ========================= DONNÉES MÉTIER ================================
// ========================================================================

const arabicTeachers = ['Majed', 'Jaber', 'Imad', 'Saeed'];
const englishTeachers = ['Kamel'];

const specificWeekDateRangesNode = {
  1:{start:'2025-08-31',end:'2025-09-04'}, 2:{start:'2025-09-07',end:'2025-09-11'}, 3:{start:'2025-09-14',end:'2025-09-18'}, 4:{start:'2025-09-21',end:'2025-09-25'}, 5:{start:'2025-09-28',end:'2025-10-02'}, 6:{start:'2025-10-05',end:'2025-10-09'}, 7:{start:'2025-10-12',end:'2025-10-16'}, 8:{start:'2025-10-19',end:'2025-10-23'}, 9:{start:'2025-10-26',end:'2025-10-30'},10:{start:'2025-11-02',end:'2025-11-06'},
  11:{start:'2025-11-09',end:'2025-11-13'},12:{start:'2025-11-16',end:'2025-11-20'}, 13:{start:'2025-11-23',end:'2025-11-27'},14:{start:'2025-11-30',end:'2025-12-04'}, 15:{start:'2025-12-07',end:'2025-12-11'},16:{start:'2025-12-14',end:'2025-12-18'}, 17:{start:'2025-12-21',end:'2025-12-25'},18:{start:'2026-01-18',end:'2026-01-22'}, 19:{start:'2026-01-25',end:'2026-01-29'},20:{start:'2026-02-01',end:'2026-02-05'},
  21:{start:'2026-02-08',end:'2026-02-12'},22:{start:'2026-02-15',end:'2026-02-19'}, 23:{start:'2026-02-22',end:'2026-02-26'},24:{start:'2026-03-01',end:'2026-03-05'}, 25:{start:'2026-03-29',end:'2026-04-02'},26:{start:'2026-04-05',end:'2026-04-09'}, 27:{start:'2026-04-12',end:'2026-04-16'},28:{start:'2026-04-19',end:'2026-04-23'}, 29:{start:'2026-04-26',end:'2026-04-30'},30:{start:'2026-05-03',end:'2026-05-07'},
  31:{start:'2026-05-10',end:'2026-05-14'}
};

const validUsers = {
  "Mohamed": "Mohamed", "Abas": "Abas", "Jaber": "Jaber", "Imad": "Imad", "Kamel": "Kamel",
  "Majed": "Majed", "Mohamed Ali": "Mohamed Ali", "Morched": "Morched",
  "Saeed": "Saeed", "Sami": "Sami", "Sylvano": "Sylvano", "Tonga": "Tonga", "Oumarou": "Oumarou", "Zine": "Zine", "Youssouf": "Youssouf"
};

// ========================================================================
// ========================= UTILITAIRES ==================================
// ========================================================================

function formatDateFrenchNode(date) {
  if (!date || isNaN(date.getTime())) return "Date invalide";
  const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  return `${days[date.getUTCDay()]} ${String(date.getUTCDate()).padStart(2, '0')} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

function extractDayNameFromString(dayString) {
  if (!dayString || typeof dayString !== 'string') return null;
  const trimmed = dayString.trim();
  const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi"];
  if (dayNames.includes(trimmed)) return trimmed;
  for (const dayName of dayNames) {
    if (trimmed.startsWith(dayName)) return dayName;
  }
  return null;
}

function getDateForDayNameNode(weekStartDate, dayName) {
  if (!weekStartDate || isNaN(weekStartDate.getTime())) return null;
  const dayOrder = { "Dimanche": 0, "Lundi": 1, "Mardi": 2, "Mercredi": 3, "Jeudi": 4 };
  const offset = dayOrder[dayName];
  if (offset === undefined) return null;
  const specificDate = new Date(Date.UTC(weekStartDate.getUTCFullYear(), weekStartDate.getUTCMonth(), weekStartDate.getUTCDate()));
  specificDate.setUTCDate(specificDate.getUTCDate() + offset);
  return specificDate;
}

const findKey = (obj, target) => obj ? Object.keys(obj).find(k => k.trim().toLowerCase() === target.toLowerCase()) : undefined;

const sanitizeForFilename = (str) => {
  if (typeof str !== 'string') str = String(str);
  const normalized = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return normalized.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '_').replace(/__+/g, '_');
};

function getCurrentWeekNumber() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (const week in specificWeekDateRangesNode) {
    const dates = specificWeekDateRangesNode[week];
    const startDate = new Date(dates.start + 'T00:00:00Z');
    const endDate = new Date(dates.end + 'T00:00:00Z');
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    if (today >= startDate && today <= endDate) return parseInt(week, 10);
  }
  return null;
}

function getTeacherLanguage(teacher) {
  if (arabicTeachers.includes(teacher)) return 'ar';
  if (englishTeachers.includes(teacher)) return 'en';
  return 'fr';
}

// ========================================================================
// ====================== SÉLECTION MODÈLE GEMINI =========================
// ========================================================================

async function resolveGeminiModel(apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`Impossible de lister les modèles (HTTP ${resp.status}) ${body}`);
  }
  const json = await resp.json();
  const models = Array.isArray(json.models) ? json.models : [];
  const preferredNames = ["gemini-2.5-flash","gemini-2.5-pro","gemini-2.5-flash-lite","gemini-1.5-flash-001","gemini-1.5-pro-002","gemini-1.5-flash"];
  const nameSet = new Map(models.map(m => [m.name, m]));
  for (const short of preferredNames) {
    const full = `models/${short}`;
    const m = nameSet.get(full);
    if (m && Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent")) return short;
  }
  const any = models.find(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent"));
  if (any) return any.name.replace(/^models\//, "");
  throw new Error("Aucun modèle compatible v1 trouvé pour votre clé.");
}

// ========================================================================
// ====================== MESSAGES NOTIFICATIONS ==========================
// ========================================================================

const notificationMessages = {
  fr: {
    title: '⚠️ Plan Hebdomadaire Incomplet',
    body: (teacher, week, classes) => `Bonjour ${teacher}, votre plan pour la semaine ${week} est incomplet pour: ${classes}. Veuillez le compléter.`,
    reminderTitle: '📋 Rappel: Finaliser le Plan Hebdomadaire',
    reminderBody: (teacher, week) => `Bonjour ${teacher}, n'oubliez pas de finaliser votre plan pour la semaine ${week}.`
  },
  ar: {
    title: '⚠️ الخطة الأسبوعية غير مكتملة',
    body: (teacher, week, classes) => `مرحباً ${teacher}، خطتك للأسبوع ${week} غير مكتملة للفصول: ${classes}. يرجى إكمالها.`,
    reminderTitle: '📋 تذكير: أكمل الخطة الأسبوعية',
    reminderBody: (teacher, week) => `مرحباً ${teacher}، لا تنسى إكمال خطتك للأسبوع ${week}.`
  },
  en: {
    title: '⚠️ Incomplete Weekly Plan',
    body: (teacher, week, classes) => `Hello ${teacher}, your plan for week ${week} is incomplete for: ${classes}. Please complete it.`,
    reminderTitle: '📋 Reminder: Finalize Weekly Plan',
    reminderBody: (teacher, week) => `Hello ${teacher}, don't forget to finalize your plan for week ${week}.`
  }
};

// ========================================================================
// ========================= ROUTES API ===================================
// ========================================================================

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabaseConfigured: !!(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY),
    geminiConfigured: !!process.env.GEMINI_API_KEY
  });
});

// ------------------------- Auth -------------------------

app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Nom d\'utilisateur et mot de passe requis' });
    }
    if (validUsers[username] && validUsers[username] === password) {
      res.status(200).json({ success: true, username: username });
    } else {
      res.status(401).json({ success: false, message: 'Identifiants invalides' });
    }
  } catch (error) {
    console.error('[LOGIN] Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur.' });
  }
});

// ------------------------- Plans hebdomadaires -------------------------

app.get('/api/plans/:week', async (req, res) => {
  const weekNumber = parseInt(req.params.week, 10);
  if (isNaN(weekNumber)) return res.status(400).json({ message: 'Semaine invalide.' });
  try {
    const db = getSupabase();

    // Récupérer le plan
    const { data: planRow, error: planError } = await db
      .from('plans')
      .select('data, class_notes')
      .eq('week', weekNumber)
      .maybeSingle();

    if (planError) throw planError;

    if (!planRow) {
      return res.status(200).json({ planData: [], classNotes: {}, availableWeeklyPlans: [] });
    }

    // Récupérer les plans de leçon IA disponibles
    const { data: lessonPlans, error: lpError } = await db
      .from('lesson_plans')
      .select('id')
      .eq('week', weekNumber);
    if (lpError) throw lpError;

    const availableLessonPlanIds = new Set((lessonPlans || []).map(lp => lp.id));

    // Récupérer les plans hebdomadaires Word
    const { data: weeklyPlans, error: wpError } = await db
      .from('weekly_lesson_plans')
      .select('classe')
      .eq('week', weekNumber);
    if (wpError) throw wpError;

    const availableWeeklyPlans = (weeklyPlans || []).map(p => p.classe);

    const planData = planRow.data || [];
    const enrichedData = planData.map(row => {
      const enseignant = row[findKey(row, 'Enseignant')] || '';
      const classe = row[findKey(row, 'Classe')] || '';
      const matiere = row[findKey(row, 'Matière')] || '';
      const periode = row[findKey(row, 'Période')] || '';
      const jour = row[findKey(row, 'Jour')] || '';
      const potentialLessonPlanId = `${weekNumber}_${enseignant}_${classe}_${matiere}_${periode}_${jour}`.replace(/\s+/g, '_');
      if (availableLessonPlanIds.has(potentialLessonPlanId)) {
        return { ...row, lessonPlanId: potentialLessonPlanId };
      }
      return row;
    });

    res.status(200).json({
      planData: enrichedData,
      classNotes: planRow.class_notes || {},
      availableWeeklyPlans
    });
  } catch (error) {
    console.error('Erreur Supabase /plans/:week:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

app.post('/api/save-plan', async (req, res) => {
  const weekNumber = parseInt(req.body.week, 10);
  const data = req.body.data;
  if (isNaN(weekNumber) || !Array.isArray(data)) return res.status(400).json({ message: 'Données invalides.' });
  try {
    const db = getSupabase();
    const { error } = await db
      .from('plans')
      .upsert({ week: weekNumber, data: data }, { onConflict: 'week' });
    if (error) throw error;
    res.status(200).json({ message: `Plan S${weekNumber} enregistré.` });
  } catch (error) {
    console.error('Erreur Supabase /save-plan:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

app.post('/api/save-notes', async (req, res) => {
  const weekNumber = parseInt(req.body.week, 10);
  const { classe, notes } = req.body;
  if (isNaN(weekNumber) || !classe) return res.status(400).json({ message: 'Données invalides.' });
  try {
    const db = getSupabase();

    // Récupérer class_notes existantes
    const { data: existing, error: selectError } = await db
      .from('plans')
      .select('class_notes')
      .eq('week', weekNumber)
      .maybeSingle();
    if (selectError) throw selectError;

    const currentNotes = (existing && existing.class_notes) ? existing.class_notes : {};
    currentNotes[classe] = notes;

    const { error } = await db
      .from('plans')
      .upsert({ week: weekNumber, class_notes: currentNotes }, { onConflict: 'week' });
    if (error) throw error;

    res.status(200).json({ message: 'Notes enregistrées.' });
  } catch (error) {
    console.error('Erreur Supabase /save-notes:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

app.post('/api/save-row', async (req, res) => {
  const weekNumber = parseInt(req.body.week, 10);
  const rowData = req.body.data;
  if (isNaN(weekNumber) || typeof rowData !== 'object') return res.status(400).json({ message: 'Données invalides.' });
  try {
    const db = getSupabase();

    // Récupérer les données existantes
    const { data: planRow, error: selectError } = await db
      .from('plans')
      .select('data')
      .eq('week', weekNumber)
      .maybeSingle();
    if (selectError) throw selectError;

    if (!planRow) return res.status(404).json({ message: 'Plan non trouvé.' });

    const now = new Date().toISOString();
    const enseignantKey = findKey(rowData, 'Enseignant');
    const classeKey = findKey(rowData, 'Classe');
    const jourKey = findKey(rowData, 'Jour');
    const periodeKey = findKey(rowData, 'Période');
    const matiereKey = findKey(rowData, 'Matière');

    const updatedData = (planRow.data || []).map(row => {
      if (
        row['Enseignant'] === rowData[enseignantKey] &&
        row['Classe'] === rowData[classeKey] &&
        row['Jour'] === rowData[jourKey] &&
        row['Période'] === rowData[periodeKey] &&
        row['Matière'] === rowData[matiereKey]
      ) {
        return { ...row, ...rowData, updatedAt: now };
      }
      return row;
    });

    const { error } = await db
      .from('plans')
      .update({ data: updatedData })
      .eq('week', weekNumber);
    if (error) throw error;

    res.status(200).json({ message: 'Ligne enregistrée.', updatedData: { updatedAt: now } });
  } catch (error) {
    console.error('Erreur Supabase /save-row:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

app.get('/api/all-classes', async (req, res) => {
  try {
    const db = getSupabase();
    const { data: plans, error } = await db.from('plans').select('data');
    if (error) throw error;

    const classesSet = new Set();
    (plans || []).forEach(plan => {
      (plan.data || []).forEach(row => {
        const k = findKey(row, 'Classe');
        if (k && row[k]) classesSet.add(row[k]);
      });
    });

    res.status(200).json([...classesSet].sort());
  } catch (error) {
    console.error('Erreur Supabase /api/all-classes:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ------------------------- Web Push Subscriptions -------------------------

app.post('/api/subscribe', async (req, res) => {
  try {
    const subscription = req.body.subscription;
    const username = req.body.username;
    if (!subscription || !username) {
      return res.status(400).json({ message: 'Subscription et username requis.' });
    }
    const db = getSupabase();
    const { error } = await db
      .from('push_subscriptions')
      .upsert({
        id: subscription.endpoint,
        subscription: subscription,
        username: username,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    if (error) throw error;
    res.status(201).json({ message: 'Abonnement enregistré.' });
  } catch (error) {
    console.error('Erreur Supabase /subscribe:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

app.post('/api/unsubscribe', async (req, res) => {
  try {
    const endpoint = req.body.endpoint;
    if (!endpoint) return res.status(400).json({ message: 'Endpoint requis.' });
    const db = getSupabase();
    const { error } = await db.from('push_subscriptions').delete().eq('id', endpoint);
    if (error) throw error;
    res.status(200).json({ message: 'Abonnement supprimé.' });
  } catch (error) {
    console.error('Erreur Supabase /unsubscribe:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Push subscriptions (subscribe-push / unsubscribe-push)
const pushSubscriptionsCache = new Map();

app.post('/api/subscribe-push', async (req, res) => {
  try {
    const { username, subscription } = req.body;
    if (!username || !subscription) {
      return res.status(400).json({ message: 'Username et subscription requis.' });
    }
    const db = getSupabase();
    const { error } = await db
      .from('push_subscriptions')
      .upsert({
        id: username,
        username: username,
        subscription: subscription,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    if (error) throw error;
    pushSubscriptionsCache.set(username, subscription);
    console.log(`✅ Abonnement push sauvegardé pour ${username}`);
    res.status(200).json({ message: 'Abonnement enregistré avec succès.' });
  } catch (error) {
    console.error('Erreur /subscribe-push:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

app.post('/api/unsubscribe-push', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: 'Username requis.' });
    const db = getSupabase();
    const { error } = await db.from('push_subscriptions').delete().eq('username', username);
    if (error) throw error;
    pushSubscriptionsCache.delete(username);
    res.status(200).json({ message: 'Désabonnement réussi.' });
  } catch (error) {
    console.error('Erreur /unsubscribe-push:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ------------------------- Rappels Automatiques -------------------------

app.get('/api/send-reminders', async (req, res) => {
  try {
    const weekNumber = getCurrentWeekNumber();
    if (!weekNumber) {
      return res.status(200).json({ message: 'Semaine actuelle non définie.' });
    }
    const db = getSupabase();
    const { data: planRow, error } = await db
      .from('plans')
      .select('data')
      .eq('week', weekNumber)
      .maybeSingle();
    if (error) throw error;

    if (!planRow || !planRow.data || planRow.data.length === 0) {
      return res.status(200).json({ message: `Aucun plan trouvé pour la semaine ${weekNumber}.` });
    }

    const teachersToRemind = new Set();
    const leconKey = findKey(planRow.data[0] || {}, 'Leçon');
    if (leconKey) {
      planRow.data.forEach(row => {
        const enseignantKey = findKey(row, 'Enseignant');
        const enseignant = enseignantKey ? row[enseignantKey] : null;
        const lecon = row[leconKey];
        if (enseignant && (!lecon || lecon.trim() === '')) teachersToRemind.add(enseignant);
      });
    }

    if (teachersToRemind.size === 0) {
      return res.status(200).json({ message: 'Tous les plans sont complets. Aucun rappel envoyé.' });
    }

    const { data: subscriptions, error: subError } = await db
      .from('push_subscriptions')
      .select('*')
      .in('username', Array.from(teachersToRemind));
    if (subError) throw subError;

    const notificationPayload = JSON.stringify({
      title: 'Rappel Plan Hebdomadaire',
      body: `Veuillez compléter votre plan de leçon pour la semaine ${weekNumber}.`,
      icon: '/icons/icon-192x192.png',
      data: { url: '/', week: weekNumber }
    });

    const sendPromises = (subscriptions || []).map(sub => {
      return webpush.sendNotification(sub.subscription, notificationPayload)
        .then(() => console.log(`Notification envoyée à ${sub.username}`))
        .catch(async (error) => {
          console.error(`Échec envoi notification à ${sub.username}:`, error);
          if (error.statusCode === 410) {
            await db.from('push_subscriptions').delete().eq('id', sub.id);
          }
        });
    });

    await Promise.allSettled(sendPromises);
    res.status(200).json({ message: `${sendPromises.length} rappels tentés.`, teachersReminded: Array.from(teachersToRemind) });
  } catch (error) {
    console.error('❌ Erreur serveur /send-reminders:', error);
    res.status(500).json({ message: 'Erreur interne /send-reminders.' });
  }
});

// ------------------------- Génération Word (plan hebdo) -------------------------

app.post('/api/generate-word', async (req, res) => {
  try {
    const { week, classe, data, notes } = req.body;
    const weekNumber = Number(week);
    if (!Number.isInteger(weekNumber) || !classe || !Array.isArray(data)) {
      return res.status(400).json({ message: 'Données invalides.' });
    }

    let templateBuffer;
    try {
      const response = await fetch(WORD_TEMPLATE_URL);
      if (!response.ok) throw new Error(`Échec modèle Word (${response.status})`);
      templateBuffer = Buffer.from(await response.arrayBuffer());
    } catch (e) {
      return res.status(500).json({ message: `Erreur récup modèle Word.` });
    }

    const zip = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, nullGetter: () => "" });

    const groupedByDay = {};
    const dayOrder = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi"];
    const datesNode = specificWeekDateRangesNode[weekNumber];
    let weekStartDateNode = null;
    if (datesNode?.start) weekStartDateNode = new Date(datesNode.start + 'T00:00:00Z');
    if (!weekStartDateNode || isNaN(weekStartDateNode.getTime())) {
      return res.status(500).json({ message: `Dates serveur manquantes pour S${weekNumber}.` });
    }

    const sampleRow = data[0] || {};
    const jourKey = findKey(sampleRow, 'Jour'),
          periodeKey = findKey(sampleRow, 'Période'),
          matiereKey = findKey(sampleRow, 'Matière'),
          leconKey = findKey(sampleRow, 'Leçon'),
          travauxKey = findKey(sampleRow, 'Travaux de classe'),
          supportKey = findKey(sampleRow, 'Support'),
          devoirsKey = findKey(sampleRow, 'Devoirs');

    data.forEach(item => {
      const day = item[jourKey];
      if (day && dayOrder.includes(day)) {
        if (!groupedByDay[day]) groupedByDay[day] = [];
        groupedByDay[day].push(item);
      }
    });

    const joursData = dayOrder.map(dayName => {
      if (!groupedByDay[dayName]) return null;
      const dateOfDay = getDateForDayNameNode(weekStartDateNode, dayName);
      const formattedDate = dateOfDay ? formatDateFrenchNode(dateOfDay) : dayName;
      const sortedEntries = groupedByDay[dayName].sort((a, b) => (parseInt(a[periodeKey], 10) || 0) - (parseInt(b[periodeKey], 10) || 0));
      const matieres = sortedEntries.map(item => ({
        matiere: item[matiereKey] ?? "",
        Lecon: formatTextForWord(item[leconKey], { color: 'FF0000' }),
        travailDeClasse: formatTextForWord(item[travauxKey]),
        Support: formatTextForWord(item[supportKey], { color: 'FF0000', italic: true }),
        devoirs: formatTextForWord(item[devoirsKey], { color: '0000FF', italic: true })
      }));
      return { jourDateComplete: formattedDate, matieres };
    }).filter(Boolean);

    let plageSemaineText = `Semaine ${weekNumber}`;
    if (datesNode?.start && datesNode?.end) {
      const startD = new Date(datesNode.start + 'T00:00:00Z');
      const endD = new Date(datesNode.end + 'T00:00:00Z');
      if (!isNaN(startD.getTime()) && !isNaN(endD.getTime())) {
        plageSemaineText = `du ${formatDateFrenchNode(startD)} à ${formatDateFrenchNode(endD)}`;
      }
    }

    doc.render({ semaine: weekNumber, classe, jours: joursData, notes: formatTextForWord(notes), plageSemaine: plageSemaineText });
    const buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
    const filename = `Plan_hebdomadaire_S${weekNumber}_${classe.replace(/[^a-z0-9]/gi, '_')}.docx`;

    // Enregistrement dans Supabase
    try {
      const db = getSupabase();
      const lessonPlanId = `S${weekNumber}_${classe.replace(/[^a-z0-9]/gi, '_')}`;
      const { error } = await db
        .from('weekly_lesson_plans')
        .upsert({
          id: lessonPlanId,
          week: weekNumber,
          classe: classe,
          filename: filename,
          file_data: buf.toString('base64'),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      if (error) console.error('❌ Erreur Supabase save weekly_lesson_plan:', error);
      else console.log(`✅ Plan de leçon ${lessonPlanId} enregistré dans Supabase.`);
    } catch (dbError) {
      console.error('❌ Erreur sauvegarde plan hebdo:', dbError);
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buf);
  } catch (error) {
    console.error('❌ Erreur serveur /generate-word:', error);
    if (!res.headersSent) res.status(500).json({ message: 'Erreur interne /generate-word.' });
  }
});

// ------------------------- Génération ZIP (Plans de Leçon Multiples) -------------------------

app.post('/api/generate-weekly-plans-zip', async (req, res) => {
  try {
    const { week, classes, data, notes } = req.body;
    const weekNumber = Number(week);
    if (!Number.isInteger(weekNumber) || !Array.isArray(classes) || !Array.isArray(data)) {
      return res.status(400).json({ message: 'Données invalides.' });
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    const filename = `Plans_Hebdomadaires_S${weekNumber}_${classes.length}_Classes.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    archive.pipe(res);

    const dayOrder = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi"];
    const datesNode = specificWeekDateRangesNode[weekNumber];
    let weekStartDateNode = null;
    if (datesNode?.start) weekStartDateNode = new Date(datesNode.start + 'T00:00:00Z');
    if (!weekStartDateNode || isNaN(weekStartDateNode.getTime())) {
      archive.abort();
      return res.status(500).json({ message: `Dates serveur manquantes pour S${weekNumber}.` });
    }

    let templateBuffer;
    try {
      const response = await fetch(WORD_TEMPLATE_URL);
      if (!response.ok) throw new Error(`Échec modèle Word (${response.status})`);
      templateBuffer = Buffer.from(await response.arrayBuffer());
    } catch (e) {
      archive.abort();
      return res.status(500).json({ message: `Erreur récup modèle Word.` });
    }

    let plageSemaineText = `Semaine ${weekNumber}`;
    if (datesNode?.start && datesNode?.end) {
      const startD = new Date(datesNode.start + 'T00:00:00Z');
      const endD = new Date(datesNode.end + 'T00:00:00Z');
      if (!isNaN(startD.getTime()) && !isNaN(endD.getTime())) {
        plageSemaineText = `du ${formatDateFrenchNode(startD)} à ${formatDateFrenchNode(endD)}`;
      }
    }

    const sampleRow = data[0] || {};
    const jourKey = findKey(sampleRow, 'Jour'),
          periodeKey = findKey(sampleRow, 'Période'),
          matiereKey = findKey(sampleRow, 'Matière'),
          leconKey = findKey(sampleRow, 'Leçon'),
          travauxKey = findKey(sampleRow, 'Travaux de classe'),
          supportKey = findKey(sampleRow, 'Support'),
          devoirsKey = findKey(sampleRow, 'Devoirs');

    for (const classe of classes) {
      const classData = data.filter(item => item[findKey(item, 'Classe')] === classe);
      const classNotes = notes[classe] || '';
      if (classData.length === 0) { console.warn(`Aucune donnée pour la classe ${classe}. Sautée.`); continue; }

      const groupedByDay = {};
      classData.forEach(item => {
        const day = item[jourKey];
        if (day && dayOrder.includes(day)) {
          if (!groupedByDay[day]) groupedByDay[day] = [];
          groupedByDay[day].push(item);
        }
      });

      const joursData = dayOrder.map(dayName => {
        if (!groupedByDay[dayName]) return null;
        const dateOfDay = getDateForDayNameNode(weekStartDateNode, dayName);
        const formattedDate = dateOfDay ? formatDateFrenchNode(dateOfDay) : dayName;
        const sortedEntries = groupedByDay[dayName].sort((a, b) => (parseInt(a[periodeKey], 10) || 0) - (parseInt(b[periodeKey], 10) || 0));
        const matieres = sortedEntries.map(item => ({
          matiere: item[matiereKey] ?? "",
          Lecon: formatTextForWord(item[leconKey], { color: 'FF0000' }),
          travailDeClasse: formatTextForWord(item[travauxKey]),
          Support: formatTextForWord(item[supportKey], { color: 'FF0000', italic: true }),
          devoirs: formatTextForWord(item[devoirsKey], { color: '0000FF', italic: true })
        }));
        return { jourDateComplete: formattedDate, matieres };
      }).filter(Boolean);

      const zipInner = new PizZip(templateBuffer);
      const doc = new Docxtemplater(zipInner, { paragraphLoop: true, nullGetter: () => "" });
      doc.render({ semaine: weekNumber, classe, jours: joursData, notes: formatTextForWord(classNotes), plageSemaine: plageSemaineText });
      const buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
      const docxFilename = `Plan_hebdomadaire_S${weekNumber}_${classe.replace(/[^a-z0-9]/gi, '_')}.docx`;

      // Enregistrement Supabase
      try {
        const db = getSupabase();
        const lessonPlanId = `S${weekNumber}_${classe.replace(/[^a-z0-9]/gi, '_')}`;
        const { error } = await db
          .from('weekly_lesson_plans')
          .upsert({
            id: lessonPlanId,
            week: weekNumber,
            classe: classe,
            filename: docxFilename,
            file_data: buf.toString('base64'),
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });
        if (error) console.error(`❌ Erreur Supabase save weekly_lesson_plan ${lessonPlanId}:`, error);
        else console.log(`✅ Plan ${lessonPlanId} enregistré dans Supabase.`);
      } catch (dbError) {
        console.error(`❌ Erreur sauvegarde plan hebdo ${classe}:`, dbError);
      }

      archive.append(buf, { name: docxFilename });
    }

    archive.finalize();
  } catch (error) {
    console.error('❌ Erreur serveur /generate-weekly-plans-zip:', error);
    if (!res.headersSent) res.status(500).json({ message: 'Erreur interne /generate-weekly-plans-zip.' });
  }
});

// ------------------------- Téléchargement Plan de Leçon (DOCX) -------------------------

app.get('/api/download-weekly-plan/:week/:classe', async (req, res) => {
  try {
    const weekNumber = Number(req.params.week);
    const classe = req.params.classe;
    if (!Number.isInteger(weekNumber) || !classe) {
      return res.status(400).json({ message: 'Semaine ou classe invalide.' });
    }
    const lessonPlanId = `S${weekNumber}_${classe.replace(/[^a-z0-9]/gi, '_')}`;
    const db = getSupabase();
    const { data: planDoc, error } = await db
      .from('weekly_lesson_plans')
      .select('filename, file_data')
      .eq('id', lessonPlanId)
      .maybeSingle();
    if (error) throw error;

    if (!planDoc || !planDoc.file_data) {
      return res.status(404).json({ message: 'Plan de leçon non généré ou non trouvé.' });
    }

    const buf = Buffer.from(planDoc.file_data, 'base64');
    res.setHeader('Content-Disposition', `attachment; filename="${planDoc.filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buf);
  } catch (error) {
    console.error('❌ Erreur serveur /download-weekly-plan:', error);
    if (!res.headersSent) res.status(500).json({ message: 'Erreur interne /download-weekly-plan.' });
  }
});

// ------------------------- Génération Excel -------------------------

app.post('/api/generate-excel-workbook', async (req, res) => {
  try {
    const weekNumber = Number(req.body.week);
    if (!Number.isInteger(weekNumber)) return res.status(400).json({ message: 'Semaine invalide.' });

    const db = getSupabase();
    const { data: planRow, error } = await db
      .from('plans')
      .select('data')
      .eq('week', weekNumber)
      .maybeSingle();
    if (error) throw error;
    if (!planRow?.data?.length) return res.status(404).json({ message: `Aucune donnée pour S${weekNumber}.` });

    const finalHeaders = ['Enseignant', 'Jour', 'Période', 'Classe', 'Matière', 'Leçon', 'Travaux de classe', 'Support', 'Devoirs'];
    const formattedData = planRow.data.map(item => {
      const row = {};
      finalHeaders.forEach(header => {
        const itemKey = findKey(item, header);
        row[header] = itemKey ? item[itemKey] : '';
      });
      return row;
    });

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: finalHeaders });
    worksheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 12 }, { wch: 20 }, { wch: 45 }, { wch: 45 }, { wch: 25 }, { wch: 45 }];
    XLSX.utils.book_append_sheet(workbook, worksheet, `Plan S${weekNumber}`);

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    const filename = `Plan_Hebdomadaire_S${weekNumber}_Complet.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('❌ Erreur serveur /generate-excel-workbook:', error);
    if (!res.headersSent) res.status(500).json({ message: 'Erreur interne Excel.' });
  }
});

// ------------------------- Rapport Excel par classe -------------------------

app.post('/api/full-report-by-class', async (req, res) => {
  try {
    const { classe: requestedClass } = req.body;
    if (!requestedClass) return res.status(400).json({ message: 'Classe requise.' });

    const db = getSupabase();
    const { data: allPlans, error } = await db.from('plans').select('week, data').order('week', { ascending: true });
    if (error) throw error;
    if (!allPlans || allPlans.length === 0) return res.status(404).json({ message: 'Aucune donnée.' });

    const dataBySubject = {};
    const monthsFrench = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    allPlans.forEach(plan => {
      const weekNumber = plan.week;
      let monthName = 'N/A';
      const weekDates = specificWeekDateRangesNode[weekNumber];
      if (weekDates?.start) {
        try { monthName = monthsFrench[new Date(weekDates.start + 'T00:00:00Z').getUTCMonth()]; } catch (e) {}
      }
      (plan.data || []).forEach(item => {
        const itemClassKey = findKey(item, 'classe');
        const itemSubjectKey = findKey(item, 'matière');
        if (itemClassKey && item[itemClassKey] === requestedClass && itemSubjectKey && item[itemSubjectKey]) {
          const subject = item[itemSubjectKey];
          if (!dataBySubject[subject]) dataBySubject[subject] = [];
          dataBySubject[subject].push({
            'Mois': monthName,
            'Semaine': weekNumber,
            'Période': item[findKey(item, 'période')] || '',
            'Leçon': item[findKey(item, 'leçon')] || '',
            'Travaux de classe': item[findKey(item, 'travaux de classe')] || '',
            'Support': item[findKey(item, 'support')] || '',
            'Devoirs': item[findKey(item, 'devoirs')] || ''
          });
        }
      });
    });

    const subjectsFound = Object.keys(dataBySubject);
    if (subjectsFound.length === 0) return res.status(404).json({ message: `Aucune donnée pour la classe '${requestedClass}'.` });

    const workbook = XLSX.utils.book_new();
    const headers = ['Mois', 'Semaine', 'Période', 'Leçon', 'Travaux de classe', 'Support', 'Devoirs'];
    subjectsFound.sort().forEach(subject => {
      const safeSheetName = subject.substring(0, 30).replace(/[*?:/\\\[\]]/g, '_');
      const worksheet = XLSX.utils.json_to_sheet(dataBySubject[subject], { header: headers });
      worksheet['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 40 }, { wch: 40 }, { wch: 25 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(workbook, worksheet, safeSheetName);
    });

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    const filename = `Rapport_Complet_${requestedClass.replace(/[^a-z0-9]/gi, '_')}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('❌ Erreur serveur /full-report-by-class:', error);
    if (!res.headersSent) res.status(500).json({ message: 'Erreur interne du rapport.' });
  }
});

// ------------------------- Génération IA -------------------------

app.post('/api/generate-ai-lesson-plan', async (req, res) => {
  try {
    console.log('📝 [AI Lesson Plan] Nouvelle demande de génération');
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const USE_GROQ = !!GROQ_API_KEY;

    if (!GROQ_API_KEY && !GEMINI_API_KEY) {
      return res.status(503).json({ message: "Le service IA n'est pas initialisé." });
    }

    const lessonTemplateUrl = process.env.LESSON_TEMPLATE_URL || LESSON_TEMPLATE_URL;
    if (!lessonTemplateUrl) {
      return res.status(503).json({ message: "L'URL du modèle de leçon Word n'est pas configurée." });
    }

    const { week, rowData } = req.body;
    if (!rowData || typeof rowData !== 'object' || !week) {
      return res.status(400).json({ message: "Données manquantes." });
    }

    let templateBuffer;
    try {
      const response = await fetch(lessonTemplateUrl);
      if (!response.ok) throw new Error(`Échec téléchargement modèle Word (${response.status})`);
      templateBuffer = Buffer.from(await response.arrayBuffer());
    } catch (e) {
      return res.status(500).json({ message: "Impossible de récupérer le modèle." });
    }

    const enseignant = rowData[findKey(rowData, 'Enseignant')] || '';
    const classe = rowData[findKey(rowData, 'Classe')] || '';
    const matiere = rowData[findKey(rowData, 'Matière')] || '';
    const lecon = rowData[findKey(rowData, 'Leçon')] || '';
    const jour = rowData[findKey(rowData, 'Jour')] || '';
    const seance = rowData[findKey(rowData, 'Période')] || '';
    const support = rowData[findKey(rowData, 'Support')] || 'Non spécifié';
    const travaux = rowData[findKey(rowData, 'Travaux de classe')] || 'Non spécifié';
    const devoirsPrevus = rowData[findKey(rowData, 'Devoirs')] || 'Non spécifié';

    let formattedDate = "";
    const weekNumber = Number(week);
    const datesNode = specificWeekDateRangesNode[weekNumber];
    if (jour && datesNode?.start) {
      const weekStartDateNode = new Date(datesNode.start + 'T00:00:00Z');
      if (!isNaN(weekStartDateNode.getTime())) {
        const dayName = extractDayNameFromString(jour);
        if (dayName) {
          const dateOfDay = getDateForDayNameNode(weekStartDateNode, dayName);
          if (dateOfDay) formattedDate = formatDateFrenchNode(dateOfDay);
        }
      }
    }

    const jsonStructure = `{"TitreUnite":"un titre d'unité pertinent pour la leçon","Methodes":"liste des méthodes d'enseignement","Outils":"liste des outils de travail","Objectifs":"une liste concise des objectifs d'apprentissage (compétences, connaissances), séparés par des sauts de ligne (\\\\n). Commence chaque objectif par un tiret (-).","etapes":[{"phase":"Introduction","duree":"5 min","activite":"Description de l'activité d'introduction pour l'enseignant et les élèves."},{"phase":"Activité Principale","duree":"25 min","activite":"Description de l'activité principale, en intégrant les 'travaux de classe' et le 'support' si possible."},{"phase":"Synthèse","duree":"10 min","activite":"Description de l'activité de conclusion et de vérification des acquis."},{"phase":"Clôture","duree":"5 min","activite":"Résumé rapide et annonce des devoirs."}],"Ressources":"les ressources spécifiques à utiliser.","Devoirs":"une suggestion de devoirs.","DiffLents":"une suggestion pour aider les apprenants en difficulté.","DiffTresPerf":"une suggestion pour stimuler les apprenants très performants.","DiffTous":"une suggestion de différenciation pour toute la classe."}`;

    let prompt;
    if (englishTeachers.includes(enseignant)) {
      prompt = `Return ONLY valid JSON. No markdown, no code fences, no commentary.\n\nAs an expert pedagogical assistant, create a detailed 45-minute lesson plan in English. Structure the lesson into timed phases and integrate the teacher's existing notes:\n- Subject: ${matiere}, Class: ${classe}, Lesson Topic: ${lecon}\n- Planned Classwork: ${travaux}\n- Mentioned Support/Materials: ${support}\n- Planned Homework: ${devoirsPrevus}\n\nUse the following JSON structure with professional, concrete values in English (keys exactly as specified):\n${jsonStructure}`;
    } else if (arabicTeachers.includes(enseignant)) {
      prompt = `أعد فقط JSON صالحًا. بدون Markdown أو أسوار كود أو تعليقات.\n\nبصفتك مساعدًا تربويًا خبيرًا، أنشئ خطة درس مفصلة باللغة العربية مدتها 45 دقيقة. قم ببناء الدرس في مراحل محددة زمنياً وادمج ملاحظات المعلم:\n- المادة: ${matiere}، الفصل: ${classe}، الموضوع: ${lecon}\n- أعمال الصف المخطط لها: ${travaux}\n- الدعم/المواد: ${support}\n- الواجبات المخطط لها: ${devoirsPrevus}\n\nاستخدم البنية التالية بالقيم المهنية والملموسة (المفاتيح كما هي بالإنجليزية):\n${jsonStructure}`;
    } else {
      prompt = `Renvoie UNIQUEMENT du JSON valide. Pas de markdown, pas de blocs de code, pas de commentaire.\n\nEn tant qu'assistant pédagogique expert, crée un plan de leçon détaillé de 45 minutes en français. Structure en phases chronométrées et intègre les notes de l'enseignant :\n- Matière : ${matiere}, Classe : ${classe}, Thème : ${lecon}\n- Travaux de classe : ${travaux}\n- Support/Matériel : ${support}\n- Devoirs prévus : ${devoirsPrevus}\n\nUtilise la structure JSON suivante (valeurs concrètes et professionnelles ; clés strictement identiques) :\n${jsonStructure}`;
    }

    let API_URL, requestBody, aiResponse;
    if (USE_GROQ) {
      API_URL = 'https://api.groq.com/openai/v1/chat/completions';
      requestBody = { model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 2048 };
      aiResponse = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify(requestBody)
      });
    } else {
      const MODEL_NAME = await resolveGeminiModel(GEMINI_API_KEY);
      API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`;
      requestBody = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
      aiResponse = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
    }

    if (!aiResponse.ok) {
      const errorBody = await aiResponse.json().catch(() => ({}));
      if (aiResponse.status === 429) {
        throw new Error(`⚠️ QUOTA API DÉPASSÉ : Veuillez réessayer plus tard. ${errorBody.error?.message || ''}`);
      }
      throw new Error(`[${aiResponse.status}] ${errorBody.error?.message || "Erreur inconnue."}`);
    }

    const aiResult = await aiResponse.json();
    let text = "";
    try {
      if (USE_GROQ) {
        text = aiResult?.choices?.[0]?.message?.content?.trim();
      } else {
        text = aiResult?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text && Array.isArray(aiResult?.candidates?.[0]?.content?.parts)) {
          text = aiResult.candidates[0].content.parts.map(p => p.text || "").join("").trim();
        }
      }
    } catch (_) {}

    if (!text) return res.status(500).json({ message: "Réponse IA vide ou non reconnue." });

    let aiData;
    try { aiData = JSON.parse(text); }
    catch { const cleaned = text.replace(/^```json\s*|\s*```$/g, '').trim(); aiData = JSON.parse(cleaned); }

    const zipDoc = new PizZip(templateBuffer);
    const doc = new Docxtemplater(zipDoc, { paragraphLoop: true, linebreaks: true, nullGetter: () => "" });

    let minutageString = "";
    let contenuString = "";
    if (aiData.etapes && Array.isArray(aiData.etapes)) {
      minutageString = aiData.etapes.map(e => e.duree || "").join('\n');
      contenuString = aiData.etapes.map(e => `▶ ${e.phase || ""}:\n${e.activite || ""}`).join('\n\n');
    }

    doc.render({ ...aiData, Semaine: week, Lecon: lecon, Matiere: matiere, Classe: classe, Jour: jour, Seance: seance, NomEnseignant: enseignant, Date: formattedDate, Deroulement: minutageString, Contenu: contenuString });
    const buf = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
    const filename = `${sanitizeForFilename(matiere)}_${sanitizeForFilename(classe)}_S${weekNumber}_P${sanitizeForFilename(seance)}_${sanitizeForFilename(enseignant)}.docx`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buf);
  } catch (error) {
    console.error('❌ Erreur serveur /generate-ai-lesson-plan:', error);
    if (!res.headersSent) res.status(500).json({ message: `Erreur interne: ${error.message}` });
  }
});

// Sauvegarder un plan de leçon IA dans Supabase
app.post('/api/save-lesson-plan', async (req, res) => {
  try {
    const { week, rowData, fileBuffer, filename } = req.body;
    if (!week || !rowData || !fileBuffer || !filename) {
      return res.status(400).json({ message: 'Données manquantes.' });
    }
    const db = getSupabase();
    const enseignant = rowData[findKey(rowData, 'Enseignant')] || '';
    const classe = rowData[findKey(rowData, 'Classe')] || '';
    const matiere = rowData[findKey(rowData, 'Matière')] || '';
    const periode = rowData[findKey(rowData, 'Période')] || '';
    const jour = rowData[findKey(rowData, 'Jour')] || '';
    const lessonPlanId = `${week}_${enseignant}_${classe}_${matiere}_${periode}_${jour}`.replace(/\s+/g, '_');

    const { error } = await db
      .from('lesson_plans')
      .upsert({
        id: lessonPlanId,
        week: Number(week),
        enseignant,
        classe,
        matiere,
        periode,
        jour,
        filename,
        file_buffer: fileBuffer,
        row_data: rowData,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });
    if (error) throw error;

    res.status(200).json({ success: true, message: 'Plan de leçon sauvegardé.', lessonPlanId });
  } catch (error) {
    console.error('❌ Erreur sauvegarde plan de leçon:', error);
    res.status(500).json({ message: 'Erreur lors de la sauvegarde.' });
  }
});

// Génération multiple de plans IA en ZIP
app.post('/api/generate-multiple-ai-lesson-plans', async (req, res) => {
  try {
    console.log('📚 [Multiple AI Lesson Plans] Nouvelle demande');
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const USE_GROQ = !!GROQ_API_KEY;

    if (!GROQ_API_KEY && !GEMINI_API_KEY) {
      return res.status(503).json({ message: "Le service IA n'est pas initialisé." });
    }

    const lessonTemplateUrl = process.env.LESSON_TEMPLATE_URL || LESSON_TEMPLATE_URL;
    if (!lessonTemplateUrl) {
      return res.status(503).json({ message: "URL du modèle de leçon manquante." });
    }

    const { week, rowsData } = req.body;
    if (!Array.isArray(rowsData) || rowsData.length === 0 || !week) {
      return res.status(400).json({ message: "Données invalides ou vides." });
    }

    // Filtrer lignes avec leçons vides
    const validRows = [];
    const skippedRows = [];
    for (let i = 0; i < rowsData.length; i++) {
      const rowData = rowsData[i];
      const lecon = rowData[findKey(rowData, 'Leçon')] || '';
      const enseignant = rowData[findKey(rowData, 'Enseignant')] || '';
      const classe = rowData[findKey(rowData, 'Classe')] || '';
      const matiere = rowData[findKey(rowData, 'Matière')] || '';
      if (!lecon || lecon.trim() === '' || lecon.trim().length < 3) {
        skippedRows.push({ index: i+1, enseignant, classe, matiere, reason: 'Leçon vide' });
      } else {
        validRows.push({ index: i, rowData });
      }
    }

    if (validRows.length === 0) {
      return res.status(400).json({ message: "Aucune ligne avec une leçon valide.", skipped: skippedRows });
    }

    let templateBuffer;
    try {
      const response = await fetch(lessonTemplateUrl);
      if (!response.ok) throw new Error(`Échec téléchargement modèle (${response.status})`);
      templateBuffer = Buffer.from(await response.arrayBuffer());
    } catch (e) {
      return res.status(500).json({ message: "Impossible de récupérer le modèle." });
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    const zipFilename = `Plans_Lecon_IA_S${week}_${validRows.length}_fichiers.zip`;
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFilename}"`);
    archive.pipe(res);

    const weekNumber = Number(week);
    const datesNode = specificWeekDateRangesNode[weekNumber];

    let MODEL_NAME;
    if (!USE_GROQ) {
      MODEL_NAME = await resolveGeminiModel(GEMINI_API_KEY);
    }

    let successCount = 0;
    let errorCount = 0;

    if (skippedRows.length > 0) {
      const skipContent = `⏭️  LIGNES IGNORÉES (LEÇONS VIDES)\n\nTotal: ${skippedRows.length} ligne(s)\n\n` +
        skippedRows.map(r => `${r.index}. ${r.enseignant} | ${r.classe} | ${r.matiere}\n   Raison: ${r.reason}`).join('\n\n');
      archive.append(Buffer.from(skipContent, 'utf-8'), { name: '00_LIGNES_IGNOREES.txt' });
    }

    const jsonStructure = `{"TitreUnite":"un titre d'unité pertinent pour la leçon","Methodes":"liste des méthodes d'enseignement","Outils":"liste des outils de travail","Objectifs":"une liste concise des objectifs d'apprentissage (compétences, connaissances), séparés par des sauts de ligne (\\\\n). Commence chaque objectif par un tiret (-).","etapes":[{"phase":"Introduction","duree":"5 min","activite":"Description."},{"phase":"Activité Principale","duree":"25 min","activite":"Description."},{"phase":"Synthèse","duree":"10 min","activite":"Description."},{"phase":"Clôture","duree":"5 min","activite":"Résumé."}],"Ressources":"ressources.","Devoirs":"devoirs.","DiffLents":"aide apprenants en difficulté.","DiffTresPerf":"stimuler apprenants très performants.","DiffTous":"différenciation pour toute la classe."}`;

    for (let i = 0; i < validRows.length; i++) {
      const { index: originalIndex, rowData } = validRows[i];
      try {
        const enseignant = rowData[findKey(rowData, 'Enseignant')] || '';
        const classe = rowData[findKey(rowData, 'Classe')] || '';
        const matiere = rowData[findKey(rowData, 'Matière')] || '';
        const lecon = rowData[findKey(rowData, 'Leçon')] || '';
        const jour = rowData[findKey(rowData, 'Jour')] || '';
        const seance = rowData[findKey(rowData, 'Période')] || '';
        const support = rowData[findKey(rowData, 'Support')] || 'Non spécifié';
        const travaux = rowData[findKey(rowData, 'Travaux de classe')] || 'Non spécifié';
        const devoirsPrevus = rowData[findKey(rowData, 'Devoirs')] || 'Non spécifié';

        console.log(`📝 [${i+1}/${validRows.length}] ${enseignant} | ${classe} | ${matiere}`);

        let formattedDate = "";
        if (jour && datesNode?.start) {
          const weekStartDateNode = new Date(datesNode.start + 'T00:00:00Z');
          if (!isNaN(weekStartDateNode.getTime())) {
            const dayName = extractDayNameFromString(jour);
            if (dayName) {
              const dateOfDay = getDateForDayNameNode(weekStartDateNode, dayName);
              if (dateOfDay) formattedDate = formatDateFrenchNode(dateOfDay);
            }
          }
        }

        let prompt;
        if (englishTeachers.includes(enseignant)) {
          prompt = `Return ONLY valid JSON. No markdown, no code fences, no commentary.\n\nAs an expert pedagogical assistant, create a detailed 45-minute lesson plan in English.\n- Subject: ${matiere}, Class: ${classe}, Lesson Topic: ${lecon}\n- Planned Classwork: ${travaux}\n- Support/Materials: ${support}\n- Planned Homework: ${devoirsPrevus}\n\nUse this JSON structure:\n${jsonStructure}`;
        } else if (arabicTeachers.includes(enseignant)) {
          prompt = `أعد فقط JSON صالحًا. بدون Markdown.\n\nأنشئ خطة درس باللغة العربية مدتها 45 دقيقة:\n- المادة: ${matiere}، الفصل: ${classe}، الموضوع: ${lecon}\n- أعمال الصف: ${travaux}\n- الدعم: ${support}\n- الواجبات: ${devoirsPrevus}\n\nاستخدم:\n${jsonStructure}`;
        } else {
          prompt = `Renvoie UNIQUEMENT du JSON valide. Pas de markdown.\n\nCrée un plan de leçon de 45 minutes en français:\n- Matière: ${matiere}, Classe: ${classe}, Thème: ${lecon}\n- Travaux: ${travaux}\n- Support: ${support}\n- Devoirs: ${devoirsPrevus}\n\nStructure JSON:\n${jsonStructure}`;
        }

        let aiResponse, aiResult, rawContent;
        let retryCount = 0;
        const MAX_RETRIES = 3;

        while (retryCount <= MAX_RETRIES) {
          try {
            if (USE_GROQ) {
              aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
                body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], temperature: 0.7, max_tokens: 2048 })
              });
              if (!aiResponse.ok) {
                const errorBody = await aiResponse.json().catch(() => ({}));
                if (aiResponse.status === 429 && retryCount < MAX_RETRIES) {
                  const waitTime = Math.pow(2, retryCount) * 5000;
                  console.log(`⏳ Rate limit GROQ, attente ${waitTime/1000}s...`);
                  await new Promise(r => setTimeout(r, waitTime));
                  retryCount++; continue;
                }
                throw new Error(`GROQ error ${aiResponse.status}: ${errorBody.error?.message || JSON.stringify(errorBody)}`);
              }
              aiResult = await aiResponse.json();
              rawContent = aiResult?.choices?.[0]?.message?.content || "";
              if (!rawContent) throw new Error('GROQ a retourné une réponse vide');
              break;
            } else {
              aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] })
              });
              if (!aiResponse.ok) {
                const errorBody = await aiResponse.json().catch(() => ({}));
                if (aiResponse.status === 429 && retryCount < MAX_RETRIES) {
                  const waitTime = Math.pow(2, retryCount) * 5000;
                  await new Promise(r => setTimeout(r, waitTime));
                  retryCount++; continue;
                }
                throw new Error(`GEMINI error ${aiResponse.status}: ${errorBody.error?.message || ''}`);
              }
              aiResult = await aiResponse.json();
              rawContent = aiResult?.candidates?.[0]?.content?.parts?.[0]?.text || "";
              if (!rawContent) throw new Error('GEMINI a retourné une réponse vide');
              break;
            }
          } catch (fetchError) {
            if (retryCount < MAX_RETRIES) {
              const waitTime = Math.pow(2, retryCount) * 3000;
              await new Promise(r => setTimeout(r, waitTime));
              retryCount++; continue;
            }
            throw fetchError;
          }
        }

        const cleanedJson = rawContent.replace(/```json\n?|```\n?/g, '').trim();
        const jsonData = JSON.parse(cleanedJson);

        const zipDoc = new PizZip(templateBuffer);
        const doc = new Docxtemplater(zipDoc, { paragraphLoop: true, nullGetter: () => "" });
        const minutageString = (jsonData.etapes || []).map(e => `${e.phase || ""} (${e.duree || ""}):\n${e.activite || ""}`).join('\n\n');
        doc.render({
          TitreUnite: jsonData.TitreUnite || "", Methodes: jsonData.Methodes || "", Outils: jsonData.Outils || "",
          Objectifs: jsonData.Objectifs || "", Ressources: jsonData.Ressources || "", Devoirs: jsonData.Devoirs || "",
          DiffLents: jsonData.DiffLents || "", DiffTresPerf: jsonData.DiffTresPerf || "", DiffTous: jsonData.DiffTous || "",
          Classe: classe, Matiere: matiere, Lecon: lecon, Seance: seance, NomEnseignant: enseignant,
          Date: formattedDate, Deroulement: minutageString, Contenu: minutageString, Minutage: minutageString
        });
        const docBuffer = doc.getZip().generate({ type: 'nodebuffer', compression: 'DEFLATE' });
        const docFilename = `${sanitizeForFilename(matiere)}_${sanitizeForFilename(classe)}_S${weekNumber}_P${sanitizeForFilename(seance)}_${sanitizeForFilename(enseignant)}.docx`;
        archive.append(docBuffer, { name: docFilename });
        successCount++;
        console.log(`✅ [${i+1}/${validRows.length}] Généré: ${docFilename}`);

        if (i < validRows.length - 1) {
          let delay = 3000;
          if (i >= 20) delay = 8000;
          else if (i >= 10) delay = 5000;
          await new Promise(r => setTimeout(r, delay));
        }
      } catch (error) {
        const classe = rowData[findKey(rowData, 'Classe')] || 'Unknown';
        const matiere = rowData[findKey(rowData, 'Matière')] || 'Unknown';
        const enseignant = rowData[findKey(rowData, 'Enseignant')] || 'Unknown';
        console.error(`❌ Erreur pour ligne ${i+1}:`, error.message);
        errorCount++;
        const errorFilename = `ERREUR_${String(i+1).padStart(2, '0')}_${sanitizeForFilename(classe)}_${sanitizeForFilename(matiere)}.txt`;
        archive.append(Buffer.from(`❌ ERREUR: ${error.message}\n\nClasse: ${classe}\nMatière: ${matiere}\nEnseignant: ${enseignant}`, 'utf-8'), { name: errorFilename });
      }
    }

    const summaryContent = `📊 RÉCAPITULATIF\n\n📅 Date: ${new Date().toLocaleString('fr-FR')}\n📦 Semaine: ${week}\n✅ Succès: ${successCount}\n❌ Erreurs: ${errorCount}\n⏭️ Ignorées: ${skippedRows.length}`;
    archive.append(Buffer.from(summaryContent, 'utf-8'), { name: '99_RECAPITULATIF.txt' });
    archive.finalize();

  } catch (error) {
    console.error('❌ Erreur serveur /generate-multiple-ai-lesson-plans:', error);
    if (!res.headersSent) res.status(500).json({ message: `Erreur interne: ${error.message}` });
  }
});

// Télécharger un plan de leçon IA
app.get('/api/download-lesson-plan/:lessonPlanId', async (req, res) => {
  try {
    const { lessonPlanId } = req.params;
    const db = getSupabase();
    const { data: lessonPlan, error } = await db
      .from('lesson_plans')
      .select('filename, file_buffer')
      .eq('id', lessonPlanId)
      .maybeSingle();
    if (error) throw error;
    if (!lessonPlan) return res.status(404).json({ message: 'Plan de leçon introuvable.' });

    const buf = Buffer.from(lessonPlan.file_buffer, 'base64');
    res.setHeader('Content-Disposition', `attachment; filename="${lessonPlan.filename}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.send(buf);
  } catch (error) {
    console.error('❌ Erreur téléchargement plan de leçon:', error);
    res.status(500).json({ message: 'Erreur lors du téléchargement.' });
  }
});

// Liste des plans de leçon pour une semaine
app.get('/api/lesson-plans/:week', async (req, res) => {
  try {
    const week = parseInt(req.params.week, 10);
    if (isNaN(week)) return res.status(400).json({ message: 'Numéro de semaine invalide.' });
    const db = getSupabase();
    const { data: lessonPlans, error } = await db
      .from('lesson_plans')
      .select('id, week, enseignant, classe, matiere, periode, jour, filename, row_data, created_at')
      .eq('week', week);
    if (error) throw error;
    res.status(200).json(lessonPlans || []);
  } catch (error) {
    console.error('❌ Erreur récupération liste plans de leçon:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération.' });
  }
});

// ------------------------- Endpoint VAPID Public Key -------------------------

app.get('/api/vapid-public-key', (req, res) => {
  res.status(200).json({ publicKey: VAPID_PUBLIC_KEY });
});

// ------------------------- Vérification et notifications push -------------------------

async function getSubscriptionsForTeachers(db, teachersArray) {
  const { data, error } = await db
    .from('push_subscriptions')
    .select('*')
    .in('username', teachersArray);
  if (error) throw error;
  return data || [];
}

async function sendPushToTeachers(db, incompleteTeachers, week) {
  const teachersToNotify = Object.keys(incompleteTeachers);
  if (teachersToNotify.length === 0) return { notificationsSent: 0, results: [] };

  const subscriptions = await getSubscriptionsForTeachers(db, teachersToNotify);
  let notificationsSent = 0;
  const results = [];

  for (const teacher of teachersToNotify) {
    const sub = subscriptions.find(s => s.username === teacher);
    if (sub && sub.subscription) {
      const classes = Array.isArray(incompleteTeachers[teacher])
        ? incompleteTeachers[teacher].join(', ')
        : [...(incompleteTeachers[teacher] instanceof Set ? incompleteTeachers[teacher] : [incompleteTeachers[teacher]])].sort().join(', ');
      const lang = getTeacherLanguage(teacher);
      const msgs = notificationMessages[lang];
      const message = {
        title: msgs.reminderTitle,
        body: msgs.reminderBody(teacher, week),
        icon: 'https://cdn.glitch.global/1c613b14-019c-488a-a856-d55d64d174d0/al-kawthar-international-schools-jeddah-saudi-arabia-modified.png?v=1739565146299',
        badge: 'https://cdn.glitch.global/1c613b14-019c-488a-a856-d55d64d174d0/al-kawthar-international-schools-jeddah-saudi-arabia-modified.png?v=1739565146299',
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
        tag: `plan-reminder-${week}-${Date.now()}`,
        renotify: true,
        data: { url: 'https://plan-hebdomadaire-2026-boys.vercel.app', week, teacher, classes, lang, playSound: true, timestamp: new Date().toISOString() }
      };
      try {
        await webpush.sendNotification(sub.subscription, JSON.stringify(message));
        results.push({ teacher, classes, language: lang, status: 'sent' });
        notificationsSent++;
        console.log(`✅ Notification envoyée à ${teacher}`);
      } catch (error) {
        console.error(`❌ Erreur notification pour ${teacher}:`, error);
        results.push({ teacher, status: 'error', error: error.message });
        if (error.statusCode === 410) {
          await db.from('push_subscriptions').delete().eq('username', teacher);
        }
      }
    } else {
      results.push({ teacher, status: 'no_subscription' });
    }
  }

  return { notificationsSent, results };
}

app.post('/api/test-weekly-reminders', async (req, res) => {
  try {
    const { apiKey, weekNumber } = req.body;
    const targetWeek = weekNumber || 17;
    const CRON_API_KEY = process.env.CRON_API_KEY || 'default-cron-key-change-me';
    if (apiKey !== CRON_API_KEY) return res.status(401).json({ message: 'Non autorisé.' });

    const db = getSupabase();
    const { data: planRow, error } = await db.from('plans').select('data').eq('week', targetWeek).maybeSingle();
    if (error) throw error;
    if (!planRow?.data?.length) return res.status(200).json({ message: `Aucune donnée pour la semaine ${targetWeek}.`, week: targetWeek });

    const incompleteTeachers = {};
    planRow.data.forEach(item => {
      const teacher = item[findKey(item, 'Enseignant')];
      const taskVal = item[findKey(item, 'Travaux de classe')];
      const className = item[findKey(item, 'Classe')];
      if (teacher && className && (taskVal == null || String(taskVal).trim() === '')) {
        if (!incompleteTeachers[teacher]) incompleteTeachers[teacher] = new Set();
        incompleteTeachers[teacher].add(className);
      }
    });

    const teachersToNotify = Object.keys(incompleteTeachers);
    if (teachersToNotify.length === 0) return res.status(200).json({ message: 'Tous les enseignants ont complété leurs plans.', week: targetWeek });

    const { notificationsSent, results } = await sendPushToTeachers(db, incompleteTeachers, targetWeek);
    res.status(200).json({ message: `Test terminé pour S${targetWeek}.`, week: targetWeek, incompleteCount: teachersToNotify.length, notificationsSent, results });
  } catch (error) {
    console.error('❌ [Test Reminders] Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

app.post('/api/check-incomplete-and-notify', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (apiKey !== process.env.CRON_API_KEY) return res.status(401).json({ message: 'Non autorisé.' });

    const currentDate = new Date();
    let currentWeek = null;
    for (const [week, dates] of Object.entries(specificWeekDateRangesNode)) {
      if (currentDate >= new Date(dates.start + 'T00:00:00Z') && currentDate <= new Date(dates.end + 'T23:59:59Z')) {
        currentWeek = parseInt(week, 10); break;
      }
    }
    if (!currentWeek) return res.status(200).json({ message: 'Aucune semaine active.' });

    const db = getSupabase();
    const { data: planRow, error } = await db.from('plans').select('data').eq('week', currentWeek).maybeSingle();
    if (error) throw error;
    if (!planRow?.data?.length) return res.status(200).json({ message: `Aucune donnée pour S${currentWeek}.` });

    const incompleteTeachers = {};
    planRow.data.forEach(item => {
      const teacher = item[findKey(item, 'Enseignant')];
      const taskVal = item[findKey(item, 'Travaux de classe')];
      const className = item[findKey(item, 'Classe')];
      if (teacher && className && (taskVal == null || String(taskVal).trim() === '')) {
        if (!incompleteTeachers[teacher]) incompleteTeachers[teacher] = new Set();
        incompleteTeachers[teacher].add(className);
      }
    });

    const teachersToNotify = Object.keys(incompleteTeachers);
    const { notificationsSent, results } = await sendPushToTeachers(db, incompleteTeachers, currentWeek);
    res.status(200).json({ message: `Vérification terminée pour S${currentWeek}.`, week: currentWeek, incompleteCount: teachersToNotify.length, notificationsSent, results });
  } catch (error) {
    console.error('❌ Erreur /check-incomplete-and-notify:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

app.post('/api/send-weekly-reminders', async (req, res) => {
  try {
    const { apiKey } = req.body;
    const CRON_API_KEY = process.env.CRON_API_KEY || 'default-cron-key-change-me';
    if (apiKey !== CRON_API_KEY) return res.status(401).json({ message: 'Non autorisé.' });

    const now = new Date();
    const dayOfWeek = now.getDay();
    if (dayOfWeek < 1 || dayOfWeek > 4) {
      return res.status(200).json({ message: 'Alerte désactivée (hors période Lundi-Jeudi).', timestamp: now.toISOString() });
    }

    let currentWeek = null;
    for (const [week, dates] of Object.entries(specificWeekDateRangesNode)) {
      if (now >= new Date(dates.start + 'T00:00:00Z') && now <= new Date(dates.end + 'T23:59:59Z')) {
        currentWeek = parseInt(week, 10); break;
      }
    }
    if (!currentWeek) return res.status(200).json({ message: 'Aucune semaine active.' });

    const db = getSupabase();
    const { data: planRow, error } = await db.from('plans').select('data').eq('week', currentWeek).maybeSingle();
    if (error) throw error;
    if (!planRow?.data?.length) return res.status(200).json({ message: `Aucune donnée pour S${currentWeek}.`, week: currentWeek });

    const incompleteTeachers = {};
    planRow.data.forEach(item => {
      const teacher = item[findKey(item, 'Enseignant')];
      const taskVal = item[findKey(item, 'Travaux de classe')];
      const className = item[findKey(item, 'Classe')];
      if (teacher && className && (taskVal == null || String(taskVal).trim() === '')) {
        if (!incompleteTeachers[teacher]) incompleteTeachers[teacher] = new Set();
        incompleteTeachers[teacher].add(className);
      }
    });

    const teachersToNotify = Object.keys(incompleteTeachers);
    if (teachersToNotify.length === 0) return res.status(200).json({ message: 'Tous les plans sont complets.', week: currentWeek });

    const { notificationsSent, results } = await sendPushToTeachers(db, incompleteTeachers, currentWeek);
    res.status(200).json({
      message: `Rappels envoyés pour S${currentWeek}.`,
      week: currentWeek,
      incompleteCount: teachersToNotify.length,
      notificationsSent,
      timestamp: now.toISOString(),
      results
    });
  } catch (error) {
    console.error('❌ [Weekly Reminders] Erreur:', error);
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

app.post('/api/notify-incomplete-teachers', async (req, res) => {
  try {
    const { week, incompleteTeachers } = req.body;
    if (!week || !incompleteTeachers || typeof incompleteTeachers !== 'object') {
      return res.status(400).json({ message: 'Paramètres invalides.' });
    }
    const db = getSupabase();
    const { notificationsSent, results } = await sendPushToTeachers(db, incompleteTeachers, week);
    res.status(200).json({
      message: `Notifications envoyées: ${notificationsSent}/${Object.keys(incompleteTeachers).length}`,
      notificationsSent,
      totalIncomplete: Object.keys(incompleteTeachers).length,
      results
    });
  } catch (error) {
    console.error('❌ Erreur /notify-incomplete-teachers:', error);
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

app.post('/api/test-notification', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ message: 'Username requis.' });

    const db = getSupabase();
    const { data: sub, error } = await db
      .from('push_subscriptions')
      .select('*')
      .eq('username', username)
      .maybeSingle();
    if (error) throw error;
    if (!sub) return res.status(404).json({ message: `Aucun abonnement trouvé pour ${username}.` });

    const testMessage = {
      title: '🧪 Test de Notification',
      body: `Bonjour ${username}, ceci est un test de notification push.`,
      icon: 'https://cdn.glitch.global/1c613b14-019c-488a-a856-d55d64d174d0/al-kawthar-international-schools-jeddah-saudi-arabia-modified.png?v=1739565146299',
      data: { url: 'https://plan-hebdomadaire-2026-boys.vercel.app', teacher: username }
    };

    try {
      await webpush.sendNotification(sub.subscription, JSON.stringify(testMessage));
      res.status(200).json({ message: 'Notification de test envoyée.', username, hasSubscription: true });
    } catch (pushError) {
      if (pushError.statusCode === 410) {
        await db.from('push_subscriptions').delete().eq('username', username);
      }
      throw new Error(`Échec d'envoi: ${pushError.message}`);
    }
  } catch (error) {
    console.error('❌ Erreur /test-notification:', error);
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
