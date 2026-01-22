        console.log("Script principal démarré.");

        // Variables globales
        let loggedInUser = null;
        let currentUserLanguage = 'fr';
        let planData = [];
        let filteredAndSortedData = [];
        let uploadedPlanData = null;
        let headers = [];
        let currentWeek = null;
        let weekStartDate = null;
        let weeklyClassNotes = {};
        let alertTimeoutId = null;
        let incompleteTeachersInfo = {};

        const arabicTeachers = ['Majed', 'Jaber', 'Imad', 'Saeed'];
        const englishTeachers = ['Kamel'];
        const isArabicUser = () => currentUserLanguage === 'ar';

        // Traductions
        const translations = {
            fr: { 
                login_title: "Connexion", login_username_label: "Nom d'utilisateur (Enseignant) :", login_password_label: "Mot de passe (idem Nom) :", login_button_text: "Se connecter", remember_me: "Rester connecté", logout_button: "Déconnecter", main_page_title: "Plans Hebdomadaires", week_label: "Semaine:", select_week: "-- Sélectionnez une semaine --", please_select_week: "Veuillez sélectionner une semaine.", admin_actions_title: "Actions Administrateur", admin_excel_label: "Fichier Excel :", admin_save_button: "Charger et Enregistrer dans la DB", generate_word_button: "Générer Word par Classe", generate_excel_button: "Générer Excel (1 Fichier)", save_all_button: "Enregistrer Lignes Affichées", filter_teacher_label: "Enseignant:", filter_class_label: "Classe:", filter_material_label: "Matière:", filter_period_label: "Période:", filter_day_label: "Jour:", all: "Tous", all_f: "Toutes", day_sun: "Dimanche", day_mon: "Lundi", day_tue: "Mardi", day_wed: "Mercredi", day_thu: "Jeudi", days: ["Dim", "Lun", "Mar", "Mer", "Jeu"], fullDays: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi"], months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"], headers: { 'Leçon': 'Leçon', 'Travaux de classe': 'Travaux de classe', 'Support': 'Support', 'Devoirs': 'Devoirs', 'Enseignant': 'Enseignant', 'Classe': 'Classe', 'Matière': 'Matière', 'Période': 'Période', 'Jour': 'Jour' }, actions: "Actions", updated_at: "Mis à jour", notes_for_class: "Notes pour la classe :", select_class: "-- Sélectionnez une classe --", select_class_placeholder: "Sélectionnez une classe pour voir ou ajouter des notes...", notes_placeholder: "Notes pour {classText}...", save_notes_button: "Enregistrer Notes", saving: "Enregistrement...", saved: "Enregistré", saving_notes_for: "Enregistrement notes pour {class} S{week}", notes_saved_success: "Notes enregistrées pour {class}, S{week}.", error_saving_notes: "Erreur d'enregistrement des notes: {error}", display_incomplete: "Afficher Incomplets", hide_incomplete: "Masquer Incomplets", incomplete_teachers_title: "Enseignants Incomplets (Travaux)", loading: "Chargement...", no_data: "Aucune donnée.", all_complete: "Tout complet!", error_config_columns: "Erreur config colonnes.", welcome_user: "Bienvenue {user} ! Veuillez sélectionner une semaine.", connected_as: "Connecté: {user}", loading_data_week: "Chargement données S{week}...", data_loaded_week: "Données S{week} chargées.", no_data_found_week: "Aucune donnée trouvée pour S{week}.", error_loading_week: "Erreur chargement S{week}: {error}", select_week_to_display: "Veuillez sélectionner une semaine pour afficher les données.", error_structure: "Erreur: Structure de données non définie.", no_data_to_display_filters: "Aucune donnée à afficher avec les filtres actuels.", save_row_title: "Enregistrer cette ligne", invalid_row: "Ligne invalide.", error_saving_row: "Erreur enregistrement ligne: {error}", no_rows_to_save: "Aucune ligne affichée à enregistrer.", confirm_save_all: "Confirmer l'enregistrement des {count} lignes affichées pour la S{week}?", save_all_cancelled: "Enregistrement annulé.", saving_all_displayed: "Enregistrement des {count} lignes en cours...", save_all_success: "{count} lignes enregistrées avec succès.", save_all_partial: "Enregistrement terminé: {success} succès, {error} erreurs.", generating_word: "Génération de {count} document(s) Word...", generating_word_success: "{count} document(s) Word généré(s).", generating_word_partial: "Génération Word terminée: {ok} succès, {err} erreurs.", generating_word_failed: "Échec de la génération Word ({err} erreurs).", generating_excel: "Génération du fichier Excel S{week}...", generating_excel_success: "Fichier Excel '{filename}' généré.", error_generating_excel: "Erreur génération Excel: {error}", no_file_selected: "Aucun fichier sélectionné.", reading_file: "Lecture du fichier {fileName}...", file_read_success: "Fichier {fileName} lu ({count} lignes).", file_error: "Erreur lecture fichier: {error}", invalid_file_type: "Type de fichier invalide (.xlsx ou .xls requis).", saving_uploaded_data: "Enregistrement des données chargées pour S{week}...", uploaded_data_saved: "Données chargées enregistrées pour S{week}.", uploaded_data_error: "Erreur enregistrement données chargées: {error}", no_word_dates: "Génération Word: Dates manquantes côté serveur pour la semaine S{week}.",
                generate_ai_lesson_plan_button: "Plan de Leçon (IA)", generating_ai_lesson_plan: "Génération du plan de leçon IA...", error_generating_ai_lesson_plan: "Erreur génération plan IA: {error}", ai_lesson_plan_generated: "Plan de leçon IA généré.",
                generate_weekly_lessons_button: "Générer Plans de Leçons (Semaine)", generating_weekly_lessons: "Génération des plans de leçons pour la semaine...", weekly_lessons_generated: "Plans de leçons hebdomadaires générés.",
                admin_report_class_label: "Choisir une Classe :", generate_full_report_button: "Générer Rapport Complet par Classe", loading_classes: "-- Chargement des classes --", select_report_class: "-- Sélectionnez une classe pour le rapport --", no_classes_found: "-- Aucune classe trouvée --", generating_full_report: "Génération du rapport complet pour la classe {classe}...", generating_full_report_success: "Rapport complet pour {classe} généré.", generating_full_report_error: "Erreur génération du rapport pour {classe}: {error}", please_select_class_for_report: "Veuillez sélectionner une classe pour générer le rapport."
            },
            ar: { 
                login_title: "تسجيل الدخول", login_username_label: "اسم المستخدم (المعلم):", login_password_label: "كلمة المرور (نفس الاسم):", login_button_text: "تسجيل الدخول", remember_me: "تذكرني", logout_button: "تسجيل الخروج", main_page_title: "الخطط الأسبوعية", week_label: "الأسبوع:", select_week: "-- اختر أسبوع --", please_select_week: "يرجى اختيار أسبوع.", admin_actions_title: "إجراءات المسؤول", admin_excel_label: "ملف اكسل:", admin_save_button: "تحميل وحفظ في قاعدة البيانات", generate_word_button: "إنشاء ملف وورد حسب الفصل", generate_excel_button: "إنشاء ملف اكسل (ملف واحد)", save_all_button: "حفظ الصفوف المعروضة", filter_teacher_label: "المعلم:", filter_class_label: "الفصل:", filter_material_label: "المادة:", filter_period_label: "الحصة:", filter_day_label: "اليوم:", all: "الكل", all_f: "الكل", day_sun: "الأحد", day_mon: "الاثنين", day_tue: "الثلاثاء", day_wed: "الأربعاء", day_thu: "الخميس", days: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"], fullDays: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"], months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"], headers: { 'Leçon': 'الدرس', 'Travaux de classe': 'أعمال الفصل', 'Support': 'الدعم', 'Devoirs': 'الواجبات', 'Enseignant': 'المعلم', 'Classe': 'الفصل', 'Matière': 'المادة', 'Période': 'الحصة', 'Jour': 'اليوم' }, actions: "إجراءات", updated_at: "آخر تحديث", notes_for_class: "ملاحظات للفصل:", select_class: "-- اختر فصل --", select_class_placeholder: "اختر فصلًا لعرض أو إضافة ملاحظات...", notes_placeholder: "ملاحظات ل {classText}...", save_notes_button: "حفظ الملاحظات", saving: "جاري الحفظ...", saved: "تم الحفظ", saving_notes_for: "جاري حفظ الملاحظات ل {class} أسبوع {week}", notes_saved_success: "تم حفظ الملاحظات ل {class}، أسبوع {week}.", error_saving_notes: "خطأ في حفظ الملاحظات: {error}", display_incomplete: "إظهار غير المكتمل", hide_incomplete: "إخفاء غير المكتمل", incomplete_teachers_title: "المعلمون غير المكتملين (الأعمال)", loading: "جاري التحميل...", no_data: "لا توجد بيانات.", all_complete: "الكل مكتمل!", error_config_columns: "خطأ في إعداد الأعمدة.", welcome_user: "مرحباً {user}! يرجى اختيار أسبوع.", connected_as: "متصل: {user}", loading_data_week: "جاري تحميل بيانات الأسبوع {week}...", data_loaded_week: "تم تحميل بيانات الأسبوع {week}.", no_data_found_week: "لم يتم العثور على بيانات للأسبوع {week}.", error_loading_week: "خطأ في تحميل الأسبوع {week}: {error}", select_week_to_display: "يرجى اختيار أسبوع لعرض البيانات.", error_structure: "خطأ: هيكل البيانات غير محدد.", no_data_to_display_filters: "لا توجد بيانات لعرضها مع الفلاتر الحالية.", save_row_title: "حفظ هذا السطر", invalid_row: "سطر غير صالح.", error_saving_row: "خطأ في حفظ السطر: {error}", no_rows_to_save: "لا توجد أسطر معروضة للحفظ.", confirm_save_all: "تأكيد حفظ {count} أسطر معروضة للأسبوع {week}؟", save_all_cancelled: "تم إلغاء الحفظ.", saving_all_displayed: "جاري حفظ {count} أسطر...", save_all_success: "تم حفظ {count} أسطر بنجاح.", save_all_partial: "اكتمل الحفظ: {success} نجاح، {error} أخطاء.", generating_word: "جاري إنشاء {count} مستند (مستندات) وورد...", generating_word_success: "تم إنشاء {count} مستند (مستندات) وورد.", generating_word_partial: "اكتمل إنشاء الوورد: {ok} نجاح، {err} أخطاء.", generating_word_failed: "فشل إنشاء الوورد ({err} أخطاء).", generating_excel: "جاري إنشاء ملف اكسل للأسبوع {week}...", generating_excel_success: "تم إنشاء ملف اكسل '{filename}'.", error_generating_excel: "خطأ في إنشاء اكسل: {error}", no_file_selected: "لم يتم اختيار ملف.", reading_file: "قراءة الملف {fileName}...", file_read_success: "تمت قراءة الملف {fileName} ({count} أسطر).", file_error: "خطأ في قراءة الملف: {error}", invalid_file_type: "نوع الملف غير صالح (مطلوب .xlsx أو .xls).", saving_uploaded_data: "جاري حفظ البيانات المحملة للأسبوع {week}...", uploaded_data_saved: "تم حفظ البيانات المحملة للأسبوع {week}.", uploaded_data_error: "خطأ في حفظ البيانات المحملة: {error}", no_word_dates: "توليد وورد: التواريخ مفقودة على الخادم للأسبوع {week}.",
                generate_ai_lesson_plan_button: "خطة الدرس (AI)", generating_ai_lesson_plan: "جاري إنشاء خطة الدرس بالذكاء الاصطناعي...", error_generating_ai_lesson_plan: "خطأ في إنشاء خطة الدرس بالذكاء الاصطناعي: {error}", ai_lesson_plan_generated: "تم إنشاء خطة الدرس بالذكاء الاصطناعي.",
                generate_weekly_lessons_button: "إنشاء خطط دروس الأسبوع", generating_weekly_lessons: "جاري إنشاء خطط دروس الأسبوع...", weekly_lessons_generated: "تم إنشاء خطط دروس الأسبوع.",
                admin_report_class_label: "اختر فصل:", generate_full_report_button: "إنشاء تقرير كامل حسب الفصل", loading_classes: "-- جاري تحميل الفصول --", select_report_class: "-- اختر فصل للتقرير --", no_classes_found: "-- لم يتم العثور على فصول --", generating_full_report: "جاري إنشاء التقرير الكامل للفصل {classe}...", generating_full_report_success: "تم إنشاء التقرير الكامل للفصل {classe}.", generating_full_report_error: "خطأ في إنشاء التقرير للفصل {classe}: {error}", please_select_class_for_report: "يرجى اختيار فصل لإنشاء التقرير."
            },
            en: { 
                login_title: "Login", login_username_label: "Username (Teacher):", login_password_label: "Password (same as Name):", login_button_text: "Login", remember_me: "Remember me", logout_button: "Logout", main_page_title: "Weekly Plans", week_label: "Week:", select_week: "-- Select a week --", please_select_week: "Please select a week.", admin_actions_title: "Administrator Actions", admin_excel_label: "Excel File:", admin_save_button: "Load and Save to DB", generate_word_button: "Generate Word by Class", generate_excel_button: "Generate Excel (1 File)", save_all_button: "Save Displayed Rows", filter_teacher_label: "Teacher:", filter_class_label: "Class:", filter_material_label: "Subject:", filter_period_label: "Period:", filter_day_label: "Day:", all: "All", all_f: "All", day_sun: "Sunday", day_mon: "Monday", day_tue: "Tuesday", day_wed: "Wednesday", day_thu: "Thursday", days: ["Sun", "Mon", "Tue", "Wed", "Thu"], fullDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"], months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], headers: { 'Leçon': 'Lesson', 'Travaux de classe': 'Classwork', 'Support': 'Support', 'Devoirs': 'Homework', 'Enseignant': 'Teacher', 'Classe': 'Class', 'Matière': 'Subject', 'Période': 'Period', 'Jour': 'Day' }, actions: "Actions", updated_at: "Updated At", notes_for_class: "Notes for class:", select_class: "-- Select a class --", select_class_placeholder: "Select a class to view or add notes...", notes_placeholder: "Notes for {classText}...", save_notes_button: "Save Notes", saving: "Saving...", saved: "Saved", saving_notes_for: "Saving notes for {class} W{week}", notes_saved_success: "Notes saved for {class}, W{week}.", error_saving_notes: "Error saving notes: {error}", display_incomplete: "Show Incomplete", hide_incomplete: "Hide Incomplete", incomplete_teachers_title: "Incomplete Teachers (Classwork)", loading: "Loading...", no_data: "No data.", all_complete: "All complete!", error_config_columns: "Column config error.", welcome_user: "Welcome {user}! Please select a week.", connected_as: "Connected: {user}", loading_data_week: "Loading data W{week}...", data_loaded_week: "Data W{week} loaded.", no_data_found_week: "No data found for W{week}.", error_loading_week: "Error loading W{week}: {error}", select_week_to_display: "Please select a week to display data.", error_structure: "Error: Data structure undefined.", no_data_to_display_filters: "No data to display with current filters.", save_row_title: "Save this row", invalid_row: "Invalid row.", error_saving_row: "Error saving row: {error}", no_rows_to_save: "No displayed rows to save.", confirm_save_all: "Confirm saving the {count} displayed rows for W{week}?", save_all_cancelled: "Save cancelled.", saving_all_displayed: "Saving {count} rows...", save_all_success: "{count} rows saved successfully.", save_all_partial: "Save complete: {success} success, {error} errors.", generating_word: "Generating {count} Word document(s)...", generating_word_success: "{count} Word document(s) generated.", generating_word_partial: "Word generation complete: {ok} success, {err} errors.", generating_word_failed: "Word generation failed ({err} errors).", generating_excel: "Generating Excel file W{week}...", generating_excel_success: "Excel file '{filename}' generated.", error_generating_excel: "Error generating Excel: {error}", no_file_selected: "No file selected.", reading_file: "Reading file {fileName}...", file_read_success: "File {fileName} read ({count} rows).", file_error: "Error reading file: {error}", invalid_file_type: "Invalid file type (requires .xlsx or .xls).", saving_uploaded_data: "Saving uploaded data for W{week}...", uploaded_data_saved: "Uploaded data saved for W{week}.", uploaded_data_error: "Error saving uploaded data: {error}", no_word_dates: "Word generation: Server-side dates missing for week W{week}.",
                generate_ai_lesson_plan_button: "Lesson Plan (AI)", generating_ai_lesson_plan: "Generating AI lesson plan...", error_generating_ai_lesson_plan: "Error generating AI lesson plan: {error}", ai_lesson_plan_generated: "AI lesson plan generated.",
                generate_weekly_lessons_button: "Generate Weekly Lesson Plans", generating_weekly_lessons: "Generating weekly lesson plans...", weekly_lessons_generated: "Weekly lesson plans generated.",
                admin_report_class_label: "Choose a Class:", generate_full_report_button: "Generate Full Report by Class", loading_classes: "-- Loading classes --", select_report_class: "-- Select a class for the report --", no_classes_found: "-- No classes found --", generating_full_report: "Generating full report for class {classe}...", generating_full_report_success: "Full report for {classe} generated.", generating_full_report_error: "Error generating report for {classe}: {error}", please_select_class_for_report: "Please select a class to generate the report."
            }
        };
        const t = (key, params = {}) => { let text = translations[currentUserLanguage]?.[key] || translations.fr[key] || key; for (const p in params) { text = text.replace(`{${p}}`, params[p]); } return text; };

        // Ordre/Traductions Classes
        const classOrder = ["PEI1", "PEI2", "PEI3", "PEI4", "PEI5", "DP1", "DP2"];
        const classTranslations = { 'PEI1':'السادس', 'PEI2':'الاول متوسط', 'PEI3':'الثاني متوسط', 'PEI4':'الثالث متوسط', 'PEI5':'الأول ثانوي', 'DP1':'الثاني ثانوي', 'DP2':'الثالث ثانوي' };
        function compareClasses(a, b) { const indexA = classOrder.indexOf(a); const indexB = classOrder.indexOf(b); if (indexA !== -1 && indexB !== -1) return indexA - indexB; if (indexA !== -1) return -1; if (indexB !== -1) return 1; return String(a).localeCompare(String(b)); }

        // Dates des semaines
        const specificWeekDateRanges = {
          1:{start:'2025-08-31',end:'2025-09-04'}, 2:{start:'2025-09-07',end:'2025-09-11'},
          3:{start:'2025-09-14',end:'2025-09-18'}, 4:{start:'2025-09-21',end:'2025-09-25'},
          5:{start:'2025-09-28',end:'2025-10-02'}, 6:{start:'2025-10-05',end:'2025-10-09'},
          7:{start:'2025-10-12',end:'2025-10-16'}, 8:{start:'2025-10-19',end:'2025-10-23'},
          9:{start:'2025-10-26',end:'2025-10-30'},10:{start:'2025-11-02',end:'2025-11-06'},
         11:{start:'2025-11-09',end:'2025-11-13'},12:{start:'2025-11-16',end:'2025-11-20'},
         13:{start:'2025-11-23',end:'2025-11-27'},14:{start:'2025-11-30',end:'2025-12-04'},
         15:{start:'2025-12-07',end:'2025-12-11'},16:{start:'2025-12-14',end:'2025-12-18'},
         17:{start:'2025-12-21',end:'2025-12-25'},18:{start:'2025-12-28',end:'2026-01-01'},
         19:{start:'2026-01-04',end:'2026-01-08'},20:{start:'2026-01-11',end:'2026-01-15'},
         21:{start:'2026-01-18',end:'2026-01-22'},22:{start:'2026-01-25',end:'2026-01-29'},
         23:{start:'2026-02-01',end:'2026-02-05'},24:{start:'2026-02-08',end:'2026-02-12'},
         25:{start:'2026-02-15',end:'2026-02-19'},26:{start:'2026-02-22',end:'2026-02-26'},
         27:{start:'2026-03-01',end:'2026-03-05'},28:{start:'2026-03-08',end:'2026-03-12'},
         29:{start:'2026-03-15',end:'2026-03-19'},30:{start:'2026-03-22',end:'2026-03-26'},
         31:{start:'2026-03-29',end:'2026-04-02'},32:{start:'2026-04-05',end:'2026-04-09'},
         33:{start:'2026-04-12',end:'2026-04-16'},34:{start:'2026-04-19',end:'2026-04-23'},
         35:{start:'2026-04-26',end:'2026-04-30'},36:{start:'2026-05-03',end:'2026-05-07'},
         37:{start:'2026-05-10',end:'2026-05-14'},38:{start:'2026-05-17',end:'2026-05-21'},
         39:{start:'2026-05-24',end:'2026-05-28'},40:{start:'2026-05-31',end:'2026-06-04'},
         41:{start:'2026-06-07',end:'2026-06-11'},42:{start:'2026-06-14',end:'2026-06-18'},
         43:{start:'2026-06-21',end:'2026-06-25'},44:{start:'2026-06-28',end:'2026-07-02'},
         45:{start:'2026-07-05',end:'2026-07-09'},46:{start:'2026-07-12',end:'2026-07-16'},
         47:{start:'2026-07-19',end:'2026-07-23'},48:{start:'2026-07-26',end:'2026-07-30'}
        };

        // --- Utilitaires ---
        function showProgressBar() { document.getElementById('progress-bar-container').style.display='block'; document.getElementById('progress-bar').style.width='0%'; document.getElementById('progress-bar').textContent='0%'; }
        function updateProgressBar(p) { const clampedP = Math.min(100, Math.max(0, p)); document.getElementById('progress-bar').style.width=clampedP+'%'; document.getElementById('progress-bar').textContent=clampedP+'%'; }
        function hideProgressBar() { setTimeout(() => { document.getElementById('progress-bar-container').style.display='none'; }, 500); }
        function displayAlert(msgKey, isErr = false, params = {}) { if (!msgKey) { const div=document.getElementById('message-alerte'); div.style.display='none'; div.textContent=''; div.className=''; if(alertTimeoutId) clearTimeout(alertTimeoutId); alertTimeoutId = null; return; } const msg = t(msgKey, params); console.log(`Alert:${isErr?'ERR':'OK'}-${msg}`); const div=document.getElementById('message-alerte'); div.textContent=msg; div.className = isErr ? 'alert-error' : (msgKey.includes('warn') || msgKey.includes('partial') ? 'alert-warning' : 'alert-success'); div.classList.add('message-alert-base'); div.style.display='block'; if(alertTimeoutId) clearTimeout(alertTimeoutId); alertTimeoutId=setTimeout(()=>{ if(div.textContent===msg){div.style.display='none'; div.textContent=''; div.className='';} alertTimeoutId=null; }, isErr ? 8000 : 5000); }
        function setButtonLoading(btnId, isLoading, iconClass) { const btn=document.getElementById(btnId); if(!btn) return; btn.disabled=isLoading; const icon=btn.querySelector('i'); if(icon) icon.className=isLoading ? 'fas fa-spinner fa-spin' : iconClass; }
        function containsArabic(text) { if (typeof text !== 'string') return false; const arabicRegex = /[\u0600-\u06FF]/; return arabicRegex.test(text); }
        function applyRTLToElement(element, content) { if (containsArabic(content)) { element.classList.add('arabic-content'); } else { element.classList.remove('arabic-content'); } }
        function formatDateForDisplay(d) { if (!d || isNaN(d.getTime())) return "Invalid Date"; const dayIndex = d.getUTCDay(); if (dayIndex === 5) { console.warn(`⚠️ Vendredi détecté (${d.toISOString().split('T')[0]}), remplacement par Jeudi`); d.setUTCDate(d.getUTCDate() - 1); } else if (dayIndex === 6) { console.warn(`⚠️ Samedi détecté (${d.toISOString().split('T')[0]}), remplacement par Dimanche suivant`); d.setUTCDate(d.getUTCDate() + 1); } const days = translations[currentUserLanguage].fullDays || translations.fr.fullDays; const months = translations[currentUserLanguage].months || translations.fr.months; const correctedDayIndex = d.getUTCDay(); const dayName = days[correctedDayIndex] || `Jour ${correctedDayIndex}`; const dayOfMonth = String(d.getUTCDate()).padStart(2, '0'); const monthName = months[d.getUTCMonth()]; const year = d.getUTCFullYear(); if (currentUserLanguage === 'en') { return `${dayName}, ${monthName} ${dayOfMonth}, ${year}`; } else { return `${dayName} ${dayOfMonth} ${monthName} ${year}`; } }
        const findHKey = (targetHeader) => { if (!headers || headers.length === 0 || !targetHeader) return null; const targetLower = targetHeader.trim().toLowerCase(); return headers.find(h => h?.trim().toLowerCase() === targetLower); };
        function getDateForDayName(dayNameFrench) { if(!weekStartDate || isNaN(weekStartDate.getTime())) return null; const dayMapFr = {"Dimanche":0, "Lundi":1, "Mardi":2, "Mercredi":3, "Jeudi":4}; const offset = dayMapFr[dayNameFrench]; if(offset === undefined) return null; const dt = new Date(Date.UTC(weekStartDate.getUTCFullYear(), weekStartDate.getUTCMonth(), weekStartDate.getUTCDate())); dt.setUTCDate(dt.getUTCDate() + offset); return dt; }
        function parseDateFromJourColumn(jourValue) { if (!jourValue || typeof jourValue !== 'string') return null; const trimmed = jourValue.trim(); const dayMapFr = {"Dimanche":0, "Lundi":1, "Mardi":2, "Mercredi":3, "Jeudi":4}; if (dayMapFr.hasOwnProperty(trimmed)) { return getDateForDayName(trimmed); } const frenchDateRegex = /^(Dimanche|Lundi|Mardi|Mercredi|Jeudi)\s+(\d{1,2})\s+(Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre)\s+(\d{4})$/i; const frenchMatch = trimmed.match(frenchDateRegex); if (frenchMatch) { const day = parseInt(frenchMatch[2], 10); const monthNames = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"]; const month = monthNames.findIndex(m => m.toLowerCase() === frenchMatch[3].toLowerCase()); const year = parseInt(frenchMatch[4], 10); if (month !== -1) { return new Date(Date.UTC(year, month, day)); } } const frenchDateNoDay = /^(\d{1,2})\s+(Janvier|Février|Mars|Avril|Mai|Juin|Juillet|Août|Septembre|Octobre|Novembre|Décembre)\s+(\d{4})$/i; const noDayMatch = trimmed.match(frenchDateNoDay); if (noDayMatch) { const day = parseInt(noDayMatch[1], 10); const monthNames = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"]; const month = monthNames.findIndex(m => m.toLowerCase() === noDayMatch[2].toLowerCase()); const year = parseInt(noDayMatch[3], 10); if (month !== -1) { return new Date(Date.UTC(year, month, day)); } } const isoRegex = /^(\d{4})-(\d{2})-(\d{2})$/; const isoMatch = trimmed.match(isoRegex); if (isoMatch) { const year = parseInt(isoMatch[1], 10); const month = parseInt(isoMatch[2], 10) - 1; const day = parseInt(isoMatch[3], 10); return new Date(Date.UTC(year, month, day)); } const dmyRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/; const dmyMatch = trimmed.match(dmyRegex); if (dmyMatch) { const day = parseInt(dmyMatch[1], 10); const month = parseInt(dmyMatch[2], 10) - 1; const year = parseInt(dmyMatch[3], 10); return new Date(Date.UTC(year, month, day)); } const numValue = parseFloat(trimmed); if (!isNaN(numValue) && numValue > 0) { const excelEpoch = new Date(Date.UTC(1899, 11, 30)); const date = new Date(excelEpoch.getTime() + numValue * 86400000); if (!isNaN(date.getTime())) { return date; } } try { const attemptDate = new Date(trimmed); if (!isNaN(attemptDate.getTime())) { return attemptDate; } } catch (e) {} return null; }
        function extractDayName(jourValue) { if (!jourValue || typeof jourValue !== 'string') return null; const trimmed = jourValue.trim(); const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi"]; if (dayNames.includes(trimmed)) { return trimmed; } const frenchDateRegex = /^(Dimanche|Lundi|Mardi|Mercredi|Jeudi)\s+/i; const match = trimmed.match(frenchDateRegex); if (match) { return match[1]; } const parsed = parseDateFromJourColumn(trimmed); if (parsed) { return dayNames[parsed.getUTCDay()]; } return null; }
        function formatUpdatedAt(dS) { if(!dS) return ''; try{const d=new Date(dS); if(isNaN(d.getTime())) return ''; return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; } catch(e){return '';} }

        // --- Fonctions Admin ---
        function handleFileUpload(event) { const file = event.target.files[0]; const statusSpan = document.getElementById('file-upload-status'); const saveBtn = document.getElementById('saveUploadedDataBtn'); uploadedPlanData = null; saveBtn.disabled = true; statusSpan.textContent = ''; if (!file) { statusSpan.textContent = t('no_file_selected'); return; } console.log(`[Admin Upload] Fichier: ${file.name}`); statusSpan.textContent = t('reading_file', { fileName: file.name }); if (!/\.(xlsx|xls)$/i.test(file.name)) { displayAlert("invalid_file_type", true); statusSpan.textContent = "Type invalide."; event.target.value = ''; return; } const reader = new FileReader(); reader.onload = function(e) { try { const data = e.target.result; const workbook = XLSX.read(data, { type: 'array' }); const firstSheetName = workbook.SheetNames[0]; const worksheet = workbook.Sheets[firstSheetName]; const jsonDataRaw = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null, raw: false }); if (!jsonDataRaw || jsonDataRaw.length < 1) throw new Error("Feuille Excel vide."); const headersRaw = jsonDataRaw[0]; if (!headersRaw || !Array.isArray(headersRaw) || headersRaw.length === 0) throw new Error("En-têtes non trouvés."); const extractedHeaders = headersRaw.map(h => h ? String(h).trim().replace(/\s+/g, ' ') : null).filter(Boolean); if (extractedHeaders.length === 0) throw new Error("Aucun en-tête valide."); const dataRows = jsonDataRaw.slice(1); uploadedPlanData = dataRows.map((row) => { if (!Array.isArray(row)) return null; const obj = {}; extractedHeaders.forEach((header, index) => { obj[header] = (row && index < row.length) ? row[index] : null; }); return Object.values(obj).some(val => val != null && String(val).trim() !== '') ? obj : null; }).filter(Boolean); console.log(`[Admin Upload] ${uploadedPlanData.length} lignes extraites.`); statusSpan.textContent = t('file_read_success', { count: uploadedPlanData.length }).replace(file.name, ''); displayAlert('file_read_success', false, { fileName: file.name, count: uploadedPlanData.length }); saveBtn.disabled = false; } catch (error) { console.error("Erreur lecture Excel:", error); displayAlert('file_error', true, { error: error.message }); statusSpan.textContent = t('file_error', { error: '' }).replace(': {error}', '.'); uploadedPlanData = null; saveBtn.disabled = true; event.target.value = ''; } }; reader.onerror = function(e) { console.error("Erreur FileReader:", e); displayAlert('file_error', true, { error: "Erreur FileReader" }); statusSpan.textContent = t('file_error', { error: '' }).replace(': {error}', '.'); uploadedPlanData = null; saveBtn.disabled = true; event.target.value = ''; }; reader.readAsArrayBuffer(file); }
        async function saveUploadedData() { const weekSelect = document.getElementById('weekSelector'); const selectedWeek = weekSelect.value; const statusSpan = document.getElementById('file-upload-status'); if (!selectedWeek) { displayAlert("please_select_week", true); return; } if (!uploadedPlanData || uploadedPlanData.length === 0) { displayAlert("no_data_to_save", true); return; } console.log(`[Admin Save] Enregistrement ${uploadedPlanData.length} lignes S${selectedWeek}.`); displayAlert('saving_uploaded_data', false, { week: selectedWeek }); setButtonLoading('saveUploadedDataBtn', true, 'fas fa-database'); showProgressBar(); updateProgressBar(10); try { const response = await fetch('/api/save-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ week: selectedWeek, data: uploadedPlanData }) }); updateProgressBar(80); const result = await response.json(); if (!response.ok) throw new Error(result.message || `Erreur serveur ${response.status}`); updateProgressBar(100); displayAlert('uploaded_data_saved', false, { week: selectedWeek }); statusSpan.textContent = t('saved'); uploadedPlanData = null; document.getElementById('excelFileInput').value = ''; document.getElementById('saveUploadedDataBtn').disabled = true; if (selectedWeek === currentWeek) { console.log("[Admin Save] Rechargement..."); await loadPlanForWeek(); } else { displayAlert(`Données S${selectedWeek} OK. ${t('select_week_to_display').replace('les données', `S${selectedWeek}`)}`, false); } } catch (error) { console.error("Erreur enregistrement upload:", error); displayAlert('uploaded_data_error', true, { error: error.message }); statusSpan.textContent = t('error_saving_notes', { error: '' }).replace(': {error}', '.'); updateProgressBar(0); } finally { hideProgressBar(); setButtonLoading('saveUploadedDataBtn', false, 'fas fa-database'); } }
        async function populateAdminReportClassSelector() { const select = document.getElementById('adminReportClassSelector'); if (!select) return; select.innerHTML = `<option value="">${t('loading_classes')}</option>`; select.disabled = true; try { const response = await fetch('/api/all-classes'); if (!response.ok) throw new Error(`Erreur serveur ${response.status}`); const classes = await response.json(); if (classes && classes.length > 0) { select.innerHTML = `<option value="">${t('select_report_class')}</option>`; classes.sort(compareClasses).forEach(cls => { const opt = document.createElement('option'); opt.value = cls; const ar = classTranslations[cls]; opt.textContent = ar ? `${ar} (${cls})` : cls; select.appendChild(opt); }); select.disabled = false; } else { select.innerHTML = `<option value="">${t('no_classes_found')}</option>`; } } catch (error) { console.error("Erreur chargement des classes pour le rapport:", error); select.innerHTML = `<option value="">Erreur chargement</option>`; displayAlert('error', true, { error: 'Erreur chargement des classes.' }); } }
        async function generateFullReportByClass() { const classSelector = document.getElementById('adminReportClassSelector'); const selectedClass = classSelector.value; if (!selectedClass) { displayAlert('please_select_class_for_report', true); return; } console.log(`Demande de rapport complet pour la classe : ${selectedClass}`); displayAlert('generating_full_report', false, { classe: selectedClass }); setButtonLoading('generateFullReportBtn', true, 'fas fa-file-invoice'); showProgressBar(); updateProgressBar(10); try { const response = await fetch('/api/full-report-by-class', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ classe: selectedClass }) }); updateProgressBar(80); if (response.ok) { const blob = await response.blob(); const contentDisposition = response.headers.get('content-disposition'); let filename = `Rapport_Complet_${selectedClass}.xlsx`; if (contentDisposition) { const filenameMatch = contentDisposition.match(/filename="?(.+?)"?(;|$)/i); if (filenameMatch && filenameMatch[1]) { filename = filenameMatch[1]; } } saveAs(blob, filename); updateProgressBar(100); displayAlert('generating_full_report_success', false, { classe: selectedClass }); } else { const errorResult = await response.json().catch(() => ({ message: "Erreur inconnue du serveur." })); throw new Error(errorResult.message || `Erreur serveur ${response.status}`); } } catch (error) { console.error('Erreur lors de la génération du rapport complet:', error); displayAlert('generating_full_report_error', true, { classe: selectedClass, error: error.message }); updateProgressBar(0); } finally { hideProgressBar(); setButtonLoading('generateFullReportBtn', false, 'fas fa-file-invoice'); } }
        
        function populateNotesClassSelector() { const sel = document.getElementById('notesClassSelector'); const txt = document.getElementById('notesInput'); const btn = document.getElementById('saveNotesBtn'); sel.innerHTML = `<option value="">${t('select_class')}</option>`; const clsK = findHKey('Classe'); if (!clsK || !planData || planData.length === 0) { txt.disabled = true; btn.disabled = true; txt.placeholder = t('no_data'); return; } const uniqueCls = [...new Set(planData.map(i => i[clsK]).filter(Boolean))].sort(compareClasses); uniqueCls.forEach(cls => { const opt = document.createElement('option'); opt.value = cls; const ar = classTranslations[cls]; opt.textContent = ar ? `${ar} (${cls})` : cls; sel.appendChild(opt); }); txt.value = ''; txt.disabled = true; btn.disabled = true; txt.placeholder = t('select_class_placeholder'); }
        function displayClassNotes() { const sel=document.getElementById('notesClassSelector'); const txt=document.getElementById('notesInput'); const btn=document.getElementById('saveNotesBtn'); const selCls=sel.value; if(selCls && weeklyClassNotes) { const note=weeklyClassNotes[selCls]; txt.value=note||''; txt.disabled=false; btn.disabled=false; applyRTLToElement(txt, note||""); const selText = sel.options[sel.selectedIndex].text; txt.placeholder = t('notes_placeholder', { classText: selText }); } else { txt.value=''; txt.disabled=true; btn.disabled=true; txt.placeholder=selCls ? t('no_data') : t('select_class_placeholder'); } document.getElementById('notes-save-status').textContent=''; }
        async function saveNotes() { const statusEl=document.getElementById('notes-save-status'); const classSel=document.getElementById('notesClassSelector'); const selCls=classSel.value; if(!selCls){displayAlert("select_class",true); return;} if(!currentWeek){displayAlert("please_select_week",true); return;} statusEl.textContent = t('saving'); displayAlert(''); setButtonLoading('saveNotesBtn',true,'fas fa-save'); const notesVal=document.getElementById('notesInput').value; console.log(t('saving_notes_for', { class: selCls, week: currentWeek })); try{ const response=await fetch('/api/save-notes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({week:currentWeek,classe:selCls,notes:notesVal})}); const result=await response.json(); if(!response.ok){throw new Error(result.message||`Erreur ${response.status}`);} weeklyClassNotes[selCls]=notesVal; displayAlert('notes_saved_success', false, { class: selCls, week: currentWeek }); statusEl.textContent = t('saved'); setTimeout(()=>{statusEl.textContent='';},3000); } catch(error){ console.error('Err saveNotes:',error); displayAlert('error_saving_notes', true, { error: error.message }); statusEl.textContent=`${t('error_saving_notes',{error:''}).replace(': {error}','')}: ${error.message}`; } finally{setButtonLoading('saveNotesBtn',false,'fas fa-save');} }
        function checkAndDisplayIncompleteTeachers() { console.log("checkIncomplete"); incompleteTeachersInfo={}; const list=document.getElementById('incompleteList'); list.innerHTML=''; if(!planData||planData.length===0){list.innerHTML=`<li>${t('no_data')}</li>`; return;} const teacherKey=findHKey('Enseignant'); const classKey=findHKey('Classe'); const taskKey=findHKey('Travaux de classe'); if(!teacherKey||!classKey||!taskKey){console.warn("Manque cols Ens/Cls/Travaux"); list.innerHTML=`<li>${t('error_config_columns')}</li>`; return;} planData.forEach(item=>{const teacher=item[teacherKey]; const taskVal=item[taskKey]; const clsName=item[classKey]; if(teacher&&clsName&&(taskVal==null||String(taskVal).trim()==='')){if(!incompleteTeachersInfo[teacher]){incompleteTeachersInfo[teacher]=new Set();} incompleteTeachersInfo[teacher].add(clsName);}}); const teachers=Object.keys(incompleteTeachersInfo); if(teachers.length===0){list.innerHTML=`<li>${t('all_complete')}</li>`;} else { teachers.sort().forEach(teacher=>{ const classes=[...incompleteTeachersInfo[teacher]].sort().join(', '); const li=document.createElement('li'); li.innerHTML = `<span class="incomplete-teacher-name">${teacher}</span> (<span class="incomplete-class-list">${classes}</span>)`; list.appendChild(li); }); } }
        function toggleIncompleteList() { const listDiv=document.getElementById('incompleteTeachersDisplay'); const btn=document.getElementById('toggleIncompleteBtn'); const btnTextSpan = btn.querySelector('.btn-text'); if(listDiv.style.display==='none'||listDiv.style.display===''){ listDiv.style.display='block'; btn.querySelector('i').className = 'fas fa-xmark'; if(btnTextSpan) btnTextSpan.textContent = t('hide_incomplete'); } else { listDiv.style.display='none'; btn.querySelector('i').className = 'fas fa-list-check'; if(btnTextSpan) btnTextSpan.textContent = t('display_incomplete'); } }
        async function fetchPlanData(week) { if (!week || isNaN(parseInt(week, 10))) { console.warn("fetchPlanData sans semaine valide."); displayPlanTable([]); document.getElementById('weekDateRange').textContent = t('please_select_week'); return; } if (!loggedInUser) { console.warn("Tentative chargement non connecté."); displayAlert("login_title", true); return; } console.log(`fetchPlanData S${week} pour ${loggedInUser}`); displayAlert('loading_data_week', false, { week: week }); showProgressBar(); updateProgressBar(10); currentWeek = week; const weekNum=parseInt(week,10); const dateRangeEl=document.getElementById('weekDateRange'); weekStartDate=null; planData=[]; headers=[]; weeklyClassNotes={}; dateRangeEl.textContent=`${t('week_label')} ${week}: ${t('loading')}`; displayPlanTable([]); updateActionButtonsState(false); const dates=specificWeekDateRanges[weekNum]; if(dates?.start&&dates?.end){try{const s=new Date(dates.start+'T00:00:00Z'); const e=new Date(dates.end+'T00:00:00Z'); if(!isNaN(s.getTime())&&!isNaN(e.getTime())){ weekStartDate=s; dateRangeEl.textContent = `${t('week_label')} ${week} : ${isArabicUser() ? 'من' : (currentUserLanguage === 'en' ? 'from' : 'du')} ${formatDateForDisplay(s)} ${isArabicUser() ? 'إلى' : (currentUserLanguage === 'en' ? 'to' : 'à')} ${formatDateForDisplay(e)}`;} else throw new Error();}catch(e){dateRangeEl.textContent=`S ${week} (Err dates)`; weekStartDate=null;}} else {dateRangeEl.textContent=`${t('week_label')} ${week} (${t('no_data')}: dates non définies)`; weekStartDate=null;} updateProgressBar(30); try{const r=await fetch(`/api/plans/${week}`); updateProgressBar(70); if(!r.ok){const d=await r.json().catch(()=>null); throw new Error(d?.message || `Err ${r.status}`);} const fetched=await r.json(); if(fetched&&typeof fetched==='object'){planData=fetched.planData||[]; weeklyClassNotes=fetched.classNotes||{};} else {planData=[]; weeklyClassNotes={};} updateProgressBar(90); if(planData.length>0){headers=Object.keys(planData[0]).filter(h=>h!=='_id'&&h!=='id'); if(loggedInUser==='Imad'){const enseignantKey=findHKey('Enseignant');const originalCount=planData.length;if(enseignantKey){planData=planData.filter(row=>arabicTeachers.includes(row[enseignantKey]));console.log(`[Imad Admin] Data filtered for Arabic teachers. ${planData.length}/${originalCount} rows remain.`)}} displayAlert('data_loaded_week', false, { week: week });} else {headers=[]; displayAlert('no_data_found_week', false, { week: week });} createTableHeader(); populateFilterOptions(); populateNotesClassSelector(); sortAndDisplay(); displayClassNotes(); checkAndDisplayIncompleteTeachers(); updateActionButtonsState(planData.length > 0); updateProgressBar(100); } catch(e){ console.error("Err fetchPlanData:",e); displayAlert('error_loading_week', true, { week: week, error: e.message }); planData=[]; headers=[]; weeklyClassNotes={}; createTableHeader(); populateFilterOptions(); populateNotesClassSelector(); sortAndDisplay(); displayClassNotes(); checkAndDisplayIncompleteTeachers(); updateProgressBar(0); updateActionButtonsState(false); } finally{hideProgressBar();} }
        
        function createTableHeader() {
            const tHead = document.querySelector('#planTable thead tr');
            tHead.innerHTML = '';
            const curH = headers || [];
            const hDisp = curH.filter(h => h !== '_id' && h !== 'id' && h.toLowerCase() !== 'updatedat');
            const headerTranslations = translations[currentUserLanguage].headers || translations.fr.headers;
            
            const leconKey = findHKey('Leçon');
            const supportKey = findHKey('Support');

            if (hDisp.length > 0) {
                hDisp.forEach(h => {
                    if (arabicTeachers.includes(loggedInUser) && (h === leconKey || h === supportKey)) {
                        return;
                    }
                    
                    const th = document.createElement('th');
                    th.textContent = headerTranslations[h] || h;
                    tHead.appendChild(th);
                });
                
                const actTh = document.createElement('th');
                actTh.textContent = t('actions');
                actTh.classList.add('actions-column');
                tHead.appendChild(actTh);
                
                if (curH.some(h => h.toLowerCase() === 'updatedat')) {
                    const updTh = document.createElement('th');
                    updTh.textContent = t('updated_at');
                    updTh.classList.add('updated-at-column');
                    tHead.appendChild(updTh);
                }
            }
            const tBody = document.querySelector('#planTable tbody');
            tBody.innerHTML = '';
        }

        function updateFilterOptionDefaultTexts() { const filters = [ { selId: 'filterEnseignant', defaultKey: 'all' }, { selId: 'filterClasse', defaultKey: 'all_f' }, { selId: 'filterMatiere', defaultKey: 'all_f' }, { selId: 'filterPeriode', defaultKey: 'all_f' }, { selId: 'filterJour', defaultKey: 'all' }, { selId: 'weekSelector', defaultKey: 'select_week' }, { selId: 'notesClassSelector', defaultKey: 'select_class' } ]; filters.forEach(f => { const select = document.getElementById(f.selId); if (select) { const defaultOption = select.querySelector('option[value=""]'); if (defaultOption) { defaultOption.textContent = t(f.defaultKey); } } }); const jSel = document.getElementById('filterJour'); if (jSel) { const dayOptions = jSel.querySelectorAll('option'); const dayValues = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi"]; const dayTransKeys = ["day_sun", "day_mon", "day_tue", "day_wed", "day_thu"]; dayOptions.forEach(opt => { if (opt.value !== "") { const idx = dayValues.indexOf(opt.value); if (idx !== -1) opt.textContent = t(dayTransKeys[idx]); } }); } const weekSel = document.getElementById('weekSelector'); if (weekSel) { const weekOptions = weekSel.querySelectorAll('option'); weekOptions.forEach(opt => { if (opt.value && opt.value.match(/^\d+$/)) { const weekLabel = t('week_label'); opt.textContent = `${weekLabel.replace(':', '')} ${opt.value}`; } }); } }
        function populateFilterOptions() { const data = planData || []; const getUniq = (k) => { const uniq = new Set(); data.forEach(i => { if (i && i[k] != null && i[k] !== '') { uniq.add(i[k]); } }); if (k?.trim().toLowerCase() === 'classe') { return [...uniq].sort(compareClasses); } else { return [...uniq].sort((a, b) => String(a).localeCompare(String(b))); } }; const ensK = findHKey('Enseignant'); const clsK = findHKey('Classe'); const perK = findHKey('Période'); const matK = findHKey('Matière'); const ens = ensK ? getUniq(ensK) : []; const cls = clsK ? getUniq(clsK) : []; const per = perK ? getUniq(perK) : []; const mat = matK ? getUniq(matK) : []; const updateSel = (id, opts, isCls = false) => { const sel = document.getElementById(id); const curV = sel.value; const defaultOptHTML = sel.querySelector('option[value=""]')?.outerHTML || `<option value="">${t(isCls ? 'all_f' : 'all')}</option>`; sel.innerHTML = defaultOptHTML; opts.forEach(o => { const opt = document.createElement('option'); opt.value = o; if (isCls) { const ar = classTranslations[o]; opt.textContent = ar ? `${ar} (${o})` : o; } else { opt.textContent = o; } sel.appendChild(opt); }); if (opts.includes(curV)) { sel.value = curV; } else { sel.value = ""; } }; updateSel('filterEnseignant', ens); updateSel('filterClasse', cls, true); updateSel('filterPeriode', per); updateSel('filterMatiere', mat); updateFilterOptionDefaultTexts(); const filterEnsSelect = document.getElementById('filterEnseignant'); if(loggedInUser&&loggedInUser!=='Mohamed'&&loggedInUser!=='Zohra'&&loggedInUser!=='Imad'){ filterEnsSelect.value = loggedInUser; filterEnsSelect.disabled = true; } else { filterEnsSelect.disabled = false; } }
        function sortAndDisplay() { const filterEnsSelect = document.getElementById('filterEnseignant'); if(loggedInUser&&loggedInUser!=='Mohamed'&&loggedInUser!=='Zohra'&&loggedInUser!=='Imad'){ filterEnsSelect.value = loggedInUser; filterEnsSelect.disabled = true; } else { filterEnsSelect.disabled = false; } const ensF = filterEnsSelect.value; const clsF = document.getElementById('filterClasse').value; const matF = document.getElementById('filterMatiere').value; const perF = document.getElementById('filterPeriode').value; const jF = document.getElementById('filterJour').value; const ensK = findHKey('Enseignant'); const clsK = findHKey('Classe'); const matK = findHKey('Matière'); const perK = findHKey('Période'); const jK = findHKey('Jour'); filteredAndSortedData = planData.filter(i => { if (!i) return false; const iE = ensK && i.hasOwnProperty(ensK) ? String(i[ensK]) : null; const iC = clsK && i.hasOwnProperty(clsK) ? String(i[clsK]) : null; const iM = matK && i.hasOwnProperty(matK) ? String(i[matK]) : null; const iP = perK && i.hasOwnProperty(perK) ? String(i[perK]) : null; const iJ = jK && i.hasOwnProperty(jK) ? String(i[jK]) : null; const pE = !ensF || iE === ensF; const pC = !clsF || iC === clsF; const pM = !matF || iM === matF; const pP = !perF || iP === perF; const dayNameFromData = iJ ? extractDayName(iJ) : null; const pJ = !jF || dayNameFromData === jF; return pE && pC && pM && pP && pJ; }); const dayValuesFr = { "Dimanche": 1, "Lundi": 2, "Mardi": 3, "Mercredi": 4, "Jeudi": 5 }; filteredAndSortedData.sort((a, b) => { const classA = (clsK && a.hasOwnProperty(clsK)) ? a[clsK] : null; const classB = (clsK && b.hasOwnProperty(clsK)) ? b[clsK] : null; const classComp = compareClasses(classA, classB); if (classComp !== 0) return classComp; const jA_fr = (jK && a.hasOwnProperty(jK)) ? extractDayName(String(a[jK])) : null; const jB_fr = (jK && b.hasOwnProperty(jK)) ? extractDayName(String(b[jK])) : null; const dayOrdA = dayValuesFr[jA_fr] || 99; const dayOrdB = dayValuesFr[jB_fr] || 99; const dC = dayOrdA - dayOrdB; if (dC !== 0) return dC; const pA = (perK && a.hasOwnProperty(perK)) ? a[perK] : null; const pB = (perK && b.hasOwnProperty(perK)) ? b[perK] : null; const piA = parseInt(pA, 10); const piB = parseInt(pB, 10); if (!isNaN(piA) && !isNaN(piB)) { return piA - piB; } else { const sA = pA == null ? '' : String(pA); const sB = pB == null ? '' : String(pB); return sA.localeCompare(sB); } }); displayPlanTable(filteredAndSortedData); updateActionButtonsState(filteredAndSortedData.length > 0); }
        
        function displayPlanTable(data) {
            const tBody = document.querySelector('#planTable tbody');
            const tHead = document.querySelector('#planTable thead tr');
            tBody.innerHTML = '';
            const actualHdrCount = tHead ? tHead.querySelectorAll('th').length : 0;
            const colspanVal = actualHdrCount > 0 ? actualHdrCount : 10;
            const curH = headers || [];
            const hDisp = curH.filter(h => h !== '_id' && h.toLowerCase() !== 'updatedat' && h !== 'id');
            const jK = findHKey('Jour');
            const clsK = findHKey('Classe');
            const updK = findHKey('updatedAt');
            const editHdrKeys = ['Leçon', 'Travaux de classe', 'Support', 'Devoirs'].map(k => findHKey(k)).filter(Boolean);
            const leconKey = findHKey('Leçon');
            const supportKey = findHKey('Support');
            const initialRow = document.getElementById('initial-table-row');
            if(initialRow) initialRow.remove();
            if (!currentWeek) {
                tBody.innerHTML = `<tr id="initial-table-row"><td colspan="${colspanVal}" class="table-message">${t('select_week_to_display')}</td></tr>`;
                return;
            }
            if (curH.length === 0 && currentWeek) {
                tBody.innerHTML = `<tr id="initial-table-row"><td colspan="${colspanVal}" class="table-message">${t('error_structure')}</td></tr>`;
                return;
            }
            if (!data || data.length === 0) {
                tBody.innerHTML = `<tr id="initial-table-row"><td colspan="${colspanVal}" class="table-message">${t('no_data_to_display_filters')}</td></tr>`;
                return;
            }
            data.forEach((rowObj, rIdx) => {
                const tr = document.createElement('tr');
                tr.dataset.rowIndex = rIdx;
                hDisp.forEach(header => {
                    if (arabicTeachers.includes(loggedInUser) && (header === leconKey || header === supportKey)) {
                        return;
                    }
                    
                    const td = document.createElement('td');
                    let content = rowObj ? (rowObj[header] ?? '') : '';
                    td.setAttribute('dir', 'auto');
                    if (header === jK && content) {
                        const dt = parseDateFromJourColumn(content);
                        td.textContent = dt ? formatDateForDisplay(dt) : content;
                    } else if (header === clsK && content) {
                        const ar = classTranslations[content];
                        td.textContent = ar ? `${ar} (${content})` : content;
                    } else if (editHdrKeys.includes(header)) {
                        td.contentEditable = true;
                        td.classList.add('editable');
                        td.textContent = content; // Utiliser textContent pour préserver les sauts de ligne
                        td.spellcheck = true;
                        applyRTLToElement(td, content); // Appliquer le style RTL si nécessaire
                        
                        // Nettoyer TOUS les sauts de ligne lors du collage (copier-coller externe)
                        td.addEventListener('paste', (e) => {
                            e.preventDefault();
                            const text = (e.clipboardData || window.clipboardData).getData('text');
                            // Supprimer TOUS les sauts de ligne et espaces superflus
                            const cleanedText = text.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
                            document.execCommand('insertText', false, cleanedText);
                        });
                        
                        td.addEventListener('input', (e) => {
                            // ### CORRECTION : Utiliser innerText pour lire les sauts de ligne lors de la modification
                            if (rowObj) {
                                rowObj[header] = e.target.textContent;
                                applyRTLToElement(e.target, e.target.textContent); // Réappliquer le style RTL si nécessaire
                            }
                            const parentTR = e.target.closest('tr');
                            if (parentTR) {
                                parentTR.classList.add('modified');
                                const indicator = parentTR.querySelector('.save-indicator');
                                if (indicator) indicator.style.display = 'none';
                            }
                        });
                    } else {
                        td.textContent = content;
                    }
                    tr.appendChild(td);
                });
                const actTd = document.createElement('td');
                actTd.classList.add('actions-column');
                const saveBtn = document.createElement('button');
                saveBtn.innerHTML = '<i class="fas fa-check"></i>';
                saveBtn.title = t('save_row_title');
                saveBtn.classList.add('save-row-button');
                saveBtn.onclick = () => saveRow(rowObj, tr);
                actTd.appendChild(saveBtn);
                const indicatorSpan = document.createElement('span');
                indicatorSpan.className = 'save-indicator';
                indicatorSpan.innerHTML = '<i class="fas fa-check-circle"></i>';
                indicatorSpan.style.display = rowObj && updK && rowObj[updK] ? 'inline-block' : 'none';
                actTd.appendChild(indicatorSpan);
                
                // Ajouter bouton pour télécharger le plan de leçon
                // SEULEMENT si un plan existe ET que ce n'est PAS une matière arabe
                const matiereKey = findHKey('Matière');
                const matiere = rowObj ? (rowObj[matiereKey] || '') : '';
                const arabicKeywords = [
                    'عربي', 'العربية', 'اللغة العربية',
                    'قرآن', 'القرآن', 'coran',
                    'تجويد', 'التجويد', 'tajwid',
                    'حديث', 'الحديث', 'hadith',
                    'تربية', 'التربية', 'islamique',
                    'توحيد', 'التوحيد', 'tawhid',
                    'فقه', 'الفقه', 'fiqh',
                    'arabe'
                ];
                const isArabicSubject = matiere && arabicKeywords.some(keyword => 
                    matiere.toLowerCase().includes(keyword.toLowerCase())
                );
                
                // Afficher le bouton seulement si un plan de leçon existe ET ce n'est pas une matière arabe
                if (rowObj && rowObj.lessonPlanId && !isArabicSubject) {
                    const lessonBtn = document.createElement('button');
                    lessonBtn.innerHTML = '<i class="fas fa-file-download"></i>';
                    lessonBtn.title = 'Télécharger Plan de Leçon';
                    lessonBtn.classList.add('lesson-plan-button');
                    lessonBtn.style.marginLeft = '5px';
                    lessonBtn.onclick = () => downloadLessonPlan(rowObj);
                    actTd.appendChild(lessonBtn);
                }
                tr.appendChild(actTd);
                if (updK && tHead && tHead.querySelector('.updated-at-column')) {
                    const updTd = document.createElement('td');
                    updTd.classList.add('updated-at-column');
                    const updContent = rowObj && rowObj.hasOwnProperty(updK) ? (rowObj[updK] ?? '') : '';
                    updTd.textContent = formatUpdatedAt(updContent);
                    tr.appendChild(updTd);
                }
                tBody.appendChild(tr);
            });
        }
        
        async function generateAILessonPlan(rowData, tableRowElement) { if (!rowData || typeof rowData !== 'object') { displayAlert('invalid_row', true); return; } if (!currentWeek) { displayAlert("please_select_week", true); return; } console.log("Generating AI Lesson Plan for:", rowData); displayAlert('generating_ai_lesson_plan', false); const aiButton = tableRowElement?.querySelector('.ai-lesson-plan-button'); let originalButtonHtml = ''; let originalButtonDisabledState = false; if (aiButton) { originalButtonHtml = aiButton.innerHTML; originalButtonDisabledState = aiButton.disabled; aiButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; aiButton.disabled = true; } try { const response = await fetch('/api/generate-ai-lesson-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ week: currentWeek, rowData: rowData }) }); if (response.ok) { const blob = await response.blob(); const contentDisposition = response.headers.get('content-disposition'); let filename = `plan_lecon_S${currentWeek}_AI_genere.xlsx`; if (contentDisposition) { const filenameMatch = contentDisposition.match(/filename="?(.+?)"?(;|$)/i); if (filenameMatch && filenameMatch[1]) { filename = filenameMatch[1]; } } saveAs(blob, filename); displayAlert('ai_lesson_plan_generated', false); } else { const errorResult = await response.json().catch(() => ({ message: "Erreur inconnue du serveur." })); throw new Error(errorResult.message || `Erreur serveur ${response.status}`); } } catch (error) { console.error('Error generating AI lesson plan:', error); displayAlert('error_generating_ai_lesson_plan', true, { error: error.message }); } finally { if (aiButton) { aiButton.innerHTML = originalButtonHtml; aiButton.disabled = originalButtonDisabledState; } } }
        
        async function generateAllAILessonPlans() { 
            if (!currentWeek) { 
                displayAlert("please_select_week", true); 
                return; 
            } 
            if (!filteredAndSortedData || filteredAndSortedData.length === 0) { 
                displayAlert("no_data_to_display_filters", true); 
                return; 
            } 
            const confirmation = confirm(t("Voulez-vous générer tous les plans de leçons IA pour les données affichées de la semaine " + currentWeek + " ? Cela peut prendre plusieurs minutes.")); 
            if (!confirmation) return; 
            
            console.log("Generating All AI Lesson Plans for week:", currentWeek); 
            displayAlert("generating_weekly_lessons", false); 
            setButtonLoading("generateAllAIBtn", true, "fas fa-robot"); 
            showProgressBar(); 
            updateProgressBar(0); 
            
            let successCount = 0;
            let errorCount = 0;
            const totalRows = filteredAndSortedData.length;
            
            try { 
                for (let i = 0; i < totalRows; i++) {
                    const rowData = filteredAndSortedData[i];
                    const progress = Math.round(((i + 1) / totalRows) * 95);
                    updateProgressBar(progress);
                    
                    try {
                        const response = await fetch('/api/generate-ai-lesson-plan', { 
                            method: 'POST', 
                            headers: { 'Content-Type': 'application/json' }, 
                            body: JSON.stringify({ week: currentWeek, rowData: rowData }) 
                        });
                        
                        if (response.ok) {
                            const blob = await response.blob();
                            const contentDisposition = response.headers.get('content-disposition');
                            let filename = `plan_lecon_S${currentWeek}_${i + 1}.docx`;
                            if (contentDisposition) {
                                const filenameMatch = contentDisposition.match(/filename="?(.+?)"?(;|$)/i);
                                if (filenameMatch && filenameMatch[1]) {
                                    filename = filenameMatch[1];
                                }
                            }
                            saveAs(blob, filename);
                            successCount++;
                        } else {
                            const errorResult = await response.json().catch(() => ({ message: "Erreur inconnue du serveur." }));
                            console.error(`Erreur pour ligne ${i + 1}:`, errorResult.message);
                            errorCount++;
                        }
                    } catch (error) {
                        console.error(`Erreur génération ligne ${i + 1}:`, error);
                        errorCount++;
                    }
                    
                    // Petit délai pour ne pas surcharger le serveur
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                updateProgressBar(100);
                
                if (errorCount === 0) {
                    displayAlert("weekly_lessons_generated", false);
                } else if (successCount > 0) {
                    displayAlert(t("generating_ai_lesson_plan") + ` - ${successCount} réussis, ${errorCount} échoués`, false);
                } else {
                    displayAlert("error_generating_ai_lesson_plan", true, { error: `Tous les plans ont échoué (${errorCount} erreurs)` });
                }
            } catch (error) { 
                console.error("Error generating all AI lesson plans:", error); 
                displayAlert("error_generating_ai_lesson_plan", true, { error: error.message }); 
                updateProgressBar(0); 
            } finally { 
                hideProgressBar(); 
                setButtonLoading("generateAllAIBtn", false, "fas fa-robot"); 
            }
        }
        async function generateWeeklyLessonPlans() { if (!currentWeek) { displayAlert("please_select_week", true); return; } if (!filteredAndSortedData || filteredAndSortedData.length === 0) { displayAlert("no_data_to_display_filters", true); return; } const confirmation = confirm(t("Voulez-vous générer les plans de leçons pour toutes les données affichées de la semaine " + currentWeek + " ?")); if (!confirmation) return; console.log("Generating Weekly Lesson Plans for week:", currentWeek); displayAlert("generating_weekly_lessons", false); setButtonLoading("generateWeeklyLessonsBtn", true, "fas fa-robot"); showProgressBar(); updateProgressBar(10); try { const response = await fetch("/api/generate-weekly-lesson-plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ week: currentWeek, data: filteredAndSortedData }) }); updateProgressBar(80); if (response.ok) { const blob = await response.blob(); const contentDisposition = response.headers.get("content-disposition"); let filename = `plans_lecons_semaine_${currentWeek}.zip`; if (contentDisposition) { const filenameMatch = contentDisposition.match(/filename="?(.+?)"?(;|$)/i); if (filenameMatch && filenameMatch[1]) { filename = filenameMatch[1]; } } saveAs(blob, filename); updateProgressBar(100); displayAlert("weekly_lessons_generated", false); } else { const errorResult = await response.json().catch(() => ({ message: "Erreur inconnue du serveur." })); throw new Error(errorResult.message || `Erreur serveur ${response.status}`); } } catch (error) { console.error("Error generating weekly lesson plans:", error); displayAlert("error_generating_ai_lesson_plan", true, { error: error.message }); updateProgressBar(0); } finally { hideProgressBar(); setButtonLoading("generateWeeklyLessonsBtn", false, "fas fa-robot"); } }
        function updateActionButtonsState(isEnabled) { document.getElementById('generateWordBtn').disabled = !isEnabled; document.getElementById('generateExcelBtn').disabled = !isEnabled; const saveAllBtn = document.getElementById('saveAllDisplayedBtn'); if (saveAllBtn) { saveAllBtn.disabled = !isEnabled || !filteredAndSortedData || filteredAndSortedData.length === 0; } const generateAllAIBtn = document.getElementById('generateAllAIBtn'); if (generateAllAIBtn) { generateAllAIBtn.disabled = !isEnabled || !filteredAndSortedData || filteredAndSortedData.length === 0; } const weeklyLessonsBtn = document.getElementById('generateWeeklyLessonsBtn'); if (weeklyLessonsBtn) { weeklyLessonsBtn.disabled = !isEnabled || !filteredAndSortedData || filteredAndSortedData.length === 0; } }
        async function saveRow(rowData, tableRowElement) { if(!rowData||typeof rowData!=='object'){displayAlert('invalid_row',true); return;} console.log("saveRow:",JSON.stringify(rowData).substring(0,100)+'...'); displayAlert(''); const btn=tableRowElement?.querySelector('.save-row-button'); const indicator=tableRowElement?.querySelector('.save-indicator'); const origBtnIcon = btn ? btn.querySelector('i')?.className || 'fas fa-check' : 'fas fa-check'; if(indicator) indicator.style.display='none'; if(btn){btn.innerHTML='<i class="fas fa-spinner fa-spin"></i>'; btn.disabled=true;} try{ if(!currentWeek){throw new Error(t('please_select_week'));} const response=await fetch('/api/save-row',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({week:currentWeek,data:rowData})}); const result=await response.json(); if(!response.ok){throw new Error(result.message||`Erreur ${response.status}`);} if(tableRowElement){tableRowElement.classList.remove('modified');} if(indicator) indicator.style.display='inline-block'; if(result.updatedData?.updatedAt&&tableRowElement){ const updK=findHKey('updatedAt'); if(updK){ rowData[updK]=result.updatedData.updatedAt; const updCell=tableRowElement.querySelector('.updated-at-column'); if(updCell){updCell.textContent=formatUpdatedAt(result.updatedData.updatedAt);} } } } catch(e){ console.error('Erreur saveRow:',e); displayAlert('error_saving_row', true, { error: e.message }); if(indicator) indicator.style.display='none'; } finally{if(btn){btn.innerHTML=`<i class="${origBtnIcon}"></i>`; btn.disabled=false;} checkAndDisplayIncompleteTeachers();} }
        async function saveAllDisplayedRows() { if (!filteredAndSortedData || filteredAndSortedData.length === 0) { displayAlert('no_rows_to_save', true); return; } if (!currentWeek) { displayAlert("please_select_week", true); return; } const totalRows = filteredAndSortedData.length; const confirmation = confirm(t('confirm_save_all', { count: totalRows, week: currentWeek })); if (!confirmation) { displayAlert('save_all_cancelled', false); return; } displayAlert('saving_all_displayed', false, { count: totalRows }); setButtonLoading('saveAllDisplayedBtn', true, 'fas fa-save'); showProgressBar(); updateProgressBar(0); let successCount = 0; let errorCount = 0; const tableBody = document.querySelector('#planTable tbody'); for (let i = 0; i < totalRows; i++) { const rowData = filteredAndSortedData[i]; const rowIndex = i; updateProgressBar(Math.round(((i + 1) / totalRows) * 95)); try { const response = await fetch('/api/save-row', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ week: currentWeek, data: rowData }) }); const result = await response.json(); if (!response.ok) { throw new Error(result.message || `Erreur ${response.status} L${rowIndex + 1}`); } successCount++; const tr = tableBody?.querySelector(`tr[data-row-index="${rowIndex}"]`); if (tr) { tr.classList.remove('modified'); const indicator = tr.querySelector('.save-indicator'); if (indicator) indicator.style.display = 'inline-block'; if (result.updatedData?.updatedAt) { const updK = findHKey('updatedAt'); if (updK) { rowData[updK] = result.updatedData.updatedAt; const updCell = tr.querySelector('.updated-at-column'); if (updCell) updCell.textContent = formatUpdatedAt(result.updatedData.updatedAt); } } } } catch (error) { console.error(`Err L${rowIndex + 1}:`, error); errorCount++; const tr = tableBody?.querySelector(`tr[data-row-index="${rowIndex}"]`); if(tr) { tr.style.backgroundColor = '#f8d7da'; tr.classList.add('modified'); const indicator = tr.querySelector('.save-indicator'); if(indicator) indicator.style.display = 'none'; } } } updateProgressBar(100); hideProgressBar(); setButtonLoading('saveAllDisplayedBtn', false, 'fas fa-save'); if (errorCount === 0) { displayAlert('save_all_success', false, { count: successCount }); } else { displayAlert('save_all_partial', true, { success: successCount, error: errorCount }); } checkAndDisplayIncompleteTeachers(); }
        async function generateWordByClasse() { const dataGen = filteredAndSortedData; if(!dataGen || dataGen.length === 0){ displayAlert("no_data_to_display_filters", true); return; } if(!currentWeek){displayAlert("please_select_week",true); return;} setButtonLoading('generateWordBtn', true, 'fas fa-file-word'); const dataCls = {}; const clsK = findHKey('Classe'); if (!clsK) { displayAlert("error_config_columns", true); setButtonLoading('generateWordBtn', false, 'fas fa-file-word'); return; } dataGen.forEach(i => { if (!i || !i[clsK]) return; const cl = i[clsK]; if (!dataCls[cl]) { dataCls[cl] = []; } dataCls[cl].push(i); }); const clsGen = Object.keys(dataCls); if (clsGen.length === 0) { displayAlert("no_data", true); setButtonLoading('generateWordBtn', false, 'fas fa-file-word'); return; } displayAlert('generating_word', false, { count: clsGen.length }); showProgressBar(); updateProgressBar(0); let ok = 0, err = 0; const total = clsGen.length; for (let i = 0; i < total; i++) { const cl = clsGen[i]; const clData = dataCls[cl]; const clNote = weeklyClassNotes[cl] || ""; updateProgressBar(Math.round(((i + 1) / total) * 100)); try { const payload = { week: currentWeek, classe: cl, data: clData, notes: clNote }; const r = await fetch('/api/generate-word', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); if (r.ok) { const blob = await r.blob(); const cd = r.headers.get('content-disposition'); let filename = `plan_s${currentWeek}_${cl.replace(/[^a-z0-9]/gi, '_')}.docx`; if (cd) { const m = cd.match(/filename="?(.+?)"?(;|$)/i); if (m && m[1]) filename = m[1]; } if (typeof saveAs === 'function') { try { saveAs(blob, filename); ok++; } catch (e) { err++; console.error(`SaveAs ${cl}:`, e); displayAlert(t('error', {error: `Err sauvegarde ${cl}: ${e.message}`}), true); } } else { err++; console.error("saveAs non défini!"); displayAlert(t('error', {error: "saveAs non trouvé."}), true); break; } } else { const d = await r.json().catch(() => ({ message: `Erreur ${r.status}` })); console.error(`Err Word ${cl}:`, r.status, d); if (d.message && d.message.includes('Dates non trouvées côté serveur')) { displayAlert('no_word_dates', true, {week: currentWeek}); err++; } else { displayAlert('error_generating_word_for', true, {classe: cl, error: (d.message || 'Inconnue')}); err++; } } } catch (e) { err++; console.error(`Err Fetch Word ${cl}:`, e); displayAlert('error', true, { error: `Erreur réseau Word ${cl}: ${e.message}` }); } } hideProgressBar(); setButtonLoading('generateWordBtn', false, 'fas fa-file-word'); if (ok > 0 && err === 0) { displayAlert('generating_word_success', false, { count: ok }); } else if (ok > 0 && err > 0) { displayAlert('generating_word_partial', true, { ok: ok, err: err }); } else if (ok === 0 && err > 0) { if (err > 1) { displayAlert('generating_word_failed', true, {err: err}); } } else if (ok === 0 && err === 0) { displayAlert("no_data", true); } }
        async function generateExcelWorkbook() { if (!currentWeek) { displayAlert("please_select_week", true); return; } setButtonLoading('generateExcelBtn',true,'fas fa-file-excel'); displayAlert('generating_excel', false, { week: currentWeek }); showProgressBar(); updateProgressBar(10); let err=0; try{ const payload = { week: currentWeek }; const r = await fetch('/api/generate-excel-workbook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); updateProgressBar(70); if(r.ok){const blob=await r.blob(); const cd=r.headers.get('content-disposition'); let filename=`plan_s${currentWeek}_complet.xlsx`; if(cd){const m=cd.match(/filename="?(.+?)"?(;|$)/i); if(m&&m[1]) filename=m[1];} if(typeof saveAs==='function'){try{saveAs(blob,filename); updateProgressBar(100); displayAlert('generating_excel_success', false, { filename: filename });} catch(e){err++; console.error(`SaveAs Excel:`,e); displayAlert(t('error', { error: `Err sauvegarde Excel: ${e.message}` }), true); updateProgressBar(0);}} else {err++; console.error("saveAs non défini!"); displayAlert(t('error', { error: "saveAs non trouvé." }), true); updateProgressBar(0);}} else { const d=await r.json().catch(()=>({message:`Err ${r.status}`})); console.error(`Err Excel Wb:`,r.status,d); displayAlert('error_generating_excel', true, { error: (d.message || 'Inconnue') }); updateProgressBar(0); err++;} } catch(e){err++; console.error(`Err Fetch Excel Wb:`,e); displayAlert('error', { error: `Err réseau Excel: ${e.message}` }, true); updateProgressBar(0);} finally{hideProgressBar(); setButtonLoading('generateExcelBtn',false,'fas fa-file-excel');} }
        async function loadPlanForWeek() { const sel = document.getElementById('weekSelector'); if (sel) { const wk = sel.value; if (wk) { await fetchPlanData(wk); } else { currentWeek = null; planData = []; headers = []; weeklyClassNotes = {}; filteredAndSortedData = []; createTableHeader(); displayPlanTable([]); document.getElementById('weekDateRange').textContent = ""; updateActionButtonsState(false); populateFilterOptions(); populateNotesClassSelector(); checkAndDisplayIncompleteTeachers(); displayAlert(''); } } else { console.error("#weekSelector absent"); displayAlert("error_structure", true); } }
        function applyLanguageSettings() { console.log(`Applying language: ${currentUserLanguage}`); document.documentElement.lang = currentUserLanguage; document.body.dir = (currentUserLanguage === 'ar') ? 'rtl' : 'ltr'; updateStaticUIElements(); if (currentWeek) { updateDynamicUIElements(); } else { document.getElementById('weekDateRange').textContent = ""; const initialTableMsg = document.getElementById('initial-table-message'); if (initialTableMsg) { initialTableMsg.textContent = t('select_week_to_display'); } else { const tBody = document.querySelector('#planTable tbody'); const colspanVal = document.querySelector('#planTable thead tr')?.querySelectorAll('th').length || 10; if (tBody) { tBody.innerHTML = `<tr id="initial-table-row"><td colspan="${colspanVal}" class="table-message">${t('select_week_to_display')}</td></tr>`; } } } if (document.getElementById('login-form').style.display !== 'none') { updateLoginUIElements(); } }
        function updateStaticUIElements() { console.log("Updating static UI for lang:", currentUserLanguage); if (document.getElementById('main-content').style.display !== 'none') { document.title = t('main_page_title'); } else { document.title = t('login_title'); } updateLoginUIElements(); const mainTitle = document.getElementById('main-title'); if(mainTitle) mainTitle.textContent = t('main_page_title'); const logoutBtnText = document.querySelector('#logout-button .btn-text'); if(logoutBtnText) logoutBtnText.textContent = t('logout_button'); const toggleBtn = document.getElementById('toggleIncompleteBtn'); if (toggleBtn) { const btnTextSpan = toggleBtn.querySelector('.btn-text'); const listDiv=document.getElementById('incompleteTeachersDisplay'); if (btnTextSpan) { btnTextSpan.textContent = (listDiv && listDiv.style.display !== 'none') ? t('hide_incomplete') : t('display_incomplete'); } } const incompleteH4 = document.querySelector('#incompleteTeachersDisplay h4'); if(incompleteH4) incompleteH4.textContent = t('incomplete_teachers_title'); const incompleteLi = document.querySelector('#incompleteList li'); if(incompleteLi && incompleteLi.textContent.match(/(Chargement|Loading|جاري التحميل)/)) incompleteLi.textContent = t('loading'); const weekLabel = document.querySelector('label[for="weekSelector"]'); if(weekLabel) weekLabel.innerHTML = `<i class="fas fa-calendar-week"></i> ${t('week_label')}`; const adminTitle = document.getElementById('admin-title'); if(adminTitle) adminTitle.textContent = t('admin_actions_title'); const adminExcelLabel = document.getElementById('admin-excel-label'); if(adminExcelLabel) adminExcelLabel.innerHTML = `<i class="fas fa-file-excel"></i> ${t('admin_excel_label')}`; const saveUploadedDataBtnText = document.querySelector('#saveUploadedDataBtn .btn-text'); if(saveUploadedDataBtnText) saveUploadedDataBtnText.textContent = t('admin_save_button'); const genWordBtnText = document.querySelector('#generateWordBtn .btn-text'); if(genWordBtnText) genWordBtnText.textContent = t('generate_word_button'); const genExcelBtnText = document.querySelector('#generateExcelBtn .btn-text'); if(genExcelBtnText) genExcelBtnText.textContent = t('generate_excel_button'); const saveAllBtnText = document.querySelector('#saveAllDisplayedBtn .btn-text'); if(saveAllBtnText) saveAllBtnText.textContent = t('save_all_button'); const weeklyLessonsBtnText = document.querySelector('#generateWeeklyLessonsBtn .btn-text'); if(weeklyLessonsBtnText) weeklyLessonsBtnText.textContent = t('generate_weekly_lessons_button'); const filterEnsLabel = document.getElementById('filter-enseignant-label'); if(filterEnsLabel) filterEnsLabel.innerHTML = `<i class="fas fa-user-tie"></i> ${t('filter_teacher_label')}`; const filterClsLabel = document.getElementById('filter-classe-label'); if(filterClsLabel) filterClsLabel.innerHTML = `<i class="fas fa-chalkboard-user"></i> ${t('filter_class_label')}`; const filterMatLabel = document.getElementById('filter-matiere-label'); if(filterMatLabel) filterMatLabel.innerHTML = `<i class="fas fa-book"></i> ${t('filter_material_label')}`; const filterPerLabel = document.getElementById('filter-periode-label'); if(filterPerLabel) filterPerLabel.innerHTML = `<i class="fas fa-clock"></i> ${t('filter_period_label')}`; const filterJourLabel = document.getElementById('filter-jour-label'); if(filterJourLabel) filterJourLabel.innerHTML = `<i class="fas fa-calendar-day"></i> ${t('filter_day_label')}`; const notesClsLabel = document.getElementById('notes-class-label'); if(notesClsLabel) notesClsLabel.innerHTML = `<i class="fas fa-sticky-note"></i> ${t('notes_for_class')}`; const notesInput = document.getElementById('notesInput'); if(notesInput && notesInput.placeholder.match(/(Sélectionnez|اختر|Select)/)){ notesInput.placeholder = t('select_class_placeholder'); } const saveNotesBtnText = document.querySelector('#saveNotesBtn .btn-text'); if(saveNotesBtnText) saveNotesBtnText.textContent = t('save_notes_button'); updateFilterOptionDefaultTexts(); const adminReportLabel = document.getElementById('admin-report-class-label'); if (adminReportLabel) adminReportLabel.innerHTML = `<i class="fas fa-school"></i> ${t('admin_report_class_label')}`; const adminReportBtnText = document.querySelector('#generateFullReportBtn .btn-text'); if (adminReportBtnText) adminReportBtnText.textContent = t('generate_full_report_button'); }
        function updateLoginUIElements() { const loginH1 = document.querySelector('#login-form h1'); if(loginH1) loginH1.textContent = t('login_title'); const userLabel = document.querySelector('label[for="username"]'); if(userLabel) userLabel.textContent = t('login_username_label'); const passLabel = document.querySelector('label[for="password"]'); if(passLabel) passLabel.textContent = t('login_password_label'); const rememberLabel = document.getElementById('remember-me-label'); if(rememberLabel) rememberLabel.textContent = t('remember_me'); const loginBtnText = document.querySelector('#login-button .btn-text'); if(loginBtnText) loginBtnText.textContent = t('login_button_text'); if (document.getElementById('login-form').style.display !== 'none') { document.title = t('login_title'); } }
        function updateDynamicUIElements() { console.log("Updating dynamic UI for lang:", currentUserLanguage); const dateRangeEl=document.getElementById('weekDateRange'); const weekNum = parseInt(currentWeek, 10); const dates = specificWeekDateRanges[weekNum]; if(weekStartDate && dates?.end){ const s = weekStartDate; const e = new Date(dates.end+'T00:00:00Z'); if(!isNaN(s.getTime())&&!isNaN(e.getTime())){ dateRangeEl.textContent = `${t('week_label')} ${currentWeek} : ${isArabicUser() ? 'من' : (currentUserLanguage === 'en' ? 'From' : 'Du')} ${formatDateForDisplay(s)} ${isArabicUser() ? 'إلى' : (currentUserLanguage === 'en' ? 'to' : 'à')} ${formatDateForDisplay(e)}`; } else { dateRangeEl.textContent=`${t('week_label')} ${currentWeek} (Err dates)`; } } else { dateRangeEl.textContent=`${t('week_label')} ${currentWeek} (${t('no_data')}: dates non définies)`; } createTableHeader(); displayPlanTable(filteredAndSortedData); const notesInput = document.getElementById('notesInput'); const notesClassSel = document.getElementById('notesClassSelector'); if (notesInput && notesClassSel) { if (notesClassSel.value) { const selText = notesClassSel.options[notesClassSel.selectedIndex].text; notesInput.placeholder = t('notes_placeholder', { classText: selText }); } else { notesInput.placeholder = t('select_class_placeholder'); } } }

        function initializeApp(username) {
            loggedInUser = username;
            
            if (arabicTeachers.includes(loggedInUser)) { currentUserLanguage = 'ar'; } 
            else if (englishTeachers.includes(loggedInUser)) { currentUserLanguage = 'en'; } 
            else { currentUserLanguage = 'fr'; } 
            
            console.log(`Initialisation pour ${loggedInUser} (Lang: ${currentUserLanguage})`);
            
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
            
            applyLanguageSettings();
            
            document.getElementById('loggedInUserInfo').textContent = t('connected_as', { user: loggedInUser });
            
            if (loggedInUser === 'Mohamed') { 
                document.getElementById('admin-actions').style.display = 'flex';
                populateAdminReportClassSelector();
                document.getElementById('lesson-plan-generator').style.display = 'flex';
            } else {
                document.getElementById('admin-actions').style.display = 'none';
                document.getElementById('lesson-plan-generator').style.display = 'none';
            }
            
            currentWeek = null;
            planData = [];
            headers = [];
            weeklyClassNotes = {};
            filteredAndSortedData = [];
            document.getElementById('weekSelector').value = "";
            
            createTableHeader();
            displayPlanTable([]);
            populateFilterOptions();
            populateNotesClassSelector();
            checkAndDisplayIncompleteTeachers();
            updateActionButtonsState(false);
            
            displayAlert('welcome_user', false, { user: loggedInUser });
            
            // Initialiser les notifications push
            if (typeof window.NotificationManager !== 'undefined') {
                console.log('🔔 Initialisation des notifications push...');
                setTimeout(() => {
                    window.NotificationManager.initialize(loggedInUser).catch(err => {
                        console.error('❌ Erreur initialisation notifications:', err);
                    });
                }, 1000); // Délai pour laisser l'UI se charger
                
                // Ajouter le bouton de gestion des notifications
                const userActionsContainer = document.querySelector('.user-actions-container');
//                 if (userActionsContainer && !document.getElementById('notification-toggle-btn')) {
//                     window.NotificationManager.createToggleButton(loggedInUser, userActionsContainer);
//                 }
            }
        }
        
        async function handleLogin() {
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');
            const loginButton = document.getElementById('login-button');
            const errorDiv = document.getElementById('login-error');
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            
            if (!username || !password) {
                errorDiv.textContent = "Entrez nom d'utilisateur et mot de passe.";
                errorDiv.style.display = 'block';
                return;
            }
            
            errorDiv.style.display = 'none';
            setButtonLoading('login-button', true, 'fas fa-sign-in-alt');
            
            try {
                console.log("Tentative de connexion pour:", username);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);
                
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                const result = await response.json();
                console.log("Réponse serveur:", response.status, result);
                
                if (response.ok && result.success) {
                    localStorage.setItem('loggedInUser', result.username);
                    initializeApp(result.username);
                } else {
                    errorDiv.textContent = result.message || "Échec connexion.";
                    errorDiv.style.display = 'block';
                    localStorage.removeItem('loggedInUser');
                }
            } catch (error) {
                console.error("Erreur connexion fetch:", error);
                
                if (error.name === 'AbortError') {
                    errorDiv.textContent = "Délai d'attente dépassé. Le serveur ne répond pas. Vérifiez votre connexion Internet ou contactez l'administrateur.";
                } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                    errorDiv.textContent = "Erreur réseau. Impossible de contacter le serveur. Vérifiez votre connexion Internet ou que le serveur est déployé correctement.";
                } else {
                    errorDiv.textContent = "Erreur communication serveur: " + error.message;
                }
                errorDiv.style.display = 'block';
            } finally {
                setButtonLoading('login-button', false, 'fas fa-sign-in-alt');
            }
        }

        function handleLogout() {
            console.log("Déconnexion par:", loggedInUser);
            localStorage.removeItem('loggedInUser');
            
            loggedInUser = null;
            currentWeek = null;
            planData = [];
            headers = [];
            weeklyClassNotes = {};
            filteredAndSortedData = [];
            incompleteTeachersInfo = {};
            uploadedPlanData = null;
            
            document.getElementById('main-content').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
            
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            document.getElementById('login-error').textContent = '';
            document.getElementById('login-error').style.display = 'none';
            
            currentUserLanguage = 'fr';
            applyLanguageSettings();
            displayAlert('');
            hideProgressBar();
            
            console.log("État appli réinitialisé après logout.");
        }

        function togglePasswordVisibility() { const passwordInput = document.getElementById('password'); const toggleIcon = document.getElementById('togglePassword'); if (!passwordInput || !toggleIcon) return; const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password'; passwordInput.setAttribute('type', type); toggleIcon.className = (type === 'password') ? 'fas fa-eye password-toggle-icon' : 'fas fa-eye-slash password-toggle-icon'; }

        // --- Initialisation ---
        document.addEventListener('DOMContentLoaded', () => {
            console.log("DOM chargé.");
            const loginButton = document.getElementById('login-button');
            const passwordInput = document.getElementById('password');
            const usernameInput = document.getElementById('username');
            const logoutButton = document.getElementById('logout-button');
            const togglePasswordIcon = document.getElementById('togglePassword');
            
            if (loginButton) {
                loginButton.addEventListener('click', handleLogin);
                if (passwordInput) { passwordInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') { loginButton.click(); } }); }
                if (usernameInput) { usernameInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') { loginButton.click(); } }); }
            } else { console.error("Btn connexion absent!"); }
            
            if (logoutButton) { logoutButton.addEventListener('click', handleLogout); } else { console.error("Btn déconnexion absent!"); }
            if (togglePasswordIcon) { togglePasswordIcon.addEventListener('click', togglePasswordVisibility); } else { console.error("Icone pwd absente!"); }
            
            // Support RTL pour les notes
            const notesInput = document.getElementById("notesInput");
            if (notesInput) {
                notesInput.addEventListener("input", function(e) {
                    applyRTLToElement(e.target, e.target.value);
                });
            }
            
            const savedUser = localStorage.getItem('loggedInUser');
            if (savedUser) {
                console.log(`Utilisateur trouvé dans la session : '${savedUser}'. Connexion automatique.`);
                initializeApp(savedUser);
            } else {
                console.log("Aucun utilisateur en session, affichage du formulaire de connexion.");
                document.getElementById('login-form').style.display = 'block';
                document.getElementById('main-content').style.display = 'none';
                currentUserLanguage = 'fr';
                applyLanguageSettings();
            }

            updateActionButtonsState(false);
            const saveAllBtn = document.getElementById('saveAllDisplayedBtn');
            if (saveAllBtn) saveAllBtn.disabled = true;
            const saveAdminBtn = document.getElementById('saveUploadedDataBtn');
            if (saveAdminBtn) saveAdminBtn.disabled = true;
            const saveNotesBtn = document.getElementById('saveNotesBtn');
            if (saveNotesBtn) saveNotesBtn.disabled = true;
        });

        // ==================== FONCTIONS POUR PLANS DE LEÇON (COORDINATEUR) ====================
        
        // Download lesson plan for a specific row
        async function downloadLessonPlan(rowData) {
            if (!rowData || !rowData.lessonPlanId) {
                displayAlert('Aucun plan de leçon disponible pour cette ligne.', true);
                return;
            }
            
            console.log("Téléchargement du plan de leçon:", rowData.lessonPlanId);
            displayAlert('Téléchargement du plan de leçon...', false);
            
            try {
                // Télécharger depuis MongoDB
                const response = await fetch(`/api/download-lesson-plan/${rowData.lessonPlanId}`);
                
                if (response.ok) {
                    const blob = await response.blob();
                    const contentDisposition = response.headers.get('content-disposition');
                    let filename = `plan_lecon_S${currentWeek}.docx`;
                    if (contentDisposition) {
                        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?(;|$)/i);
                        if (filenameMatch && filenameMatch[1]) {
                            filename = filenameMatch[1];
                        }
                    }
                    
                    if (typeof saveAs === 'function') {
                        saveAs(blob, filename);
                        displayAlert('Plan de leçon téléchargé avec succès !', false);
                    }
                } else {
                    const errorResult = await response.json().catch(() => ({ message: "Erreur inconnue" }));
                    throw new Error(errorResult.message || `Erreur serveur ${response.status}`);
                }
            } catch (error) {
                console.error('Erreur téléchargement plan de leçon:', error);
                displayAlert('Erreur lors du téléchargement du plan de leçon: ' + error.message, true);
            }
        }
        
        // ==================== GÉNÉRATION PLANS DE LEÇON (COORDINATEUR) ====================
        
        // Fonction principale: Générer tous les plans de leçon
        async function startGenerateAllLessonPlans() {
            if (!currentWeek) {
                displayAlert("Veuillez d'abord sélectionner une semaine.", true);
                return;
            }
            
            if (!planData || planData.length === 0) {
                displayAlert("Aucune donnée disponible pour cette semaine.", true);
                return;
            }
            
            // Étape 1: Demander la classe
            const classKey = findHKey('Classe');
            const uniqueClasses = [...new Set(planData.map(item => item[classKey]).filter(Boolean))];
            uniqueClasses.sort(compareClasses);
            
            if (uniqueClasses.length === 0) {
                displayAlert("Aucune classe trouvée dans les données.", true);
                return;
            }
            
            let classOptions = 'Choisissez une classe :\n\n';
            uniqueClasses.forEach((cls, index) => {
                const arTranslation = classTranslations[cls];
                classOptions += `${index + 1}. ${arTranslation ? arTranslation + ' (' + cls + ')' : cls}\n`;
            });
            classOptions += '\nEntrez le numéro de la classe :';
            
            const classChoice = prompt(classOptions);
            if (!classChoice) return; // Annulé
            
            const classIndex = parseInt(classChoice) - 1;
            if (isNaN(classIndex) || classIndex < 0 || classIndex >= uniqueClasses.length) {
                displayAlert("Choix invalide.", true);
                return;
            }
            
            const selectedClass = uniqueClasses[classIndex];
            console.log('Classe sélectionnée:', selectedClass);
            
            // Étape 2: Demander la matière (exclure les matières arabes)
            const matiereKey = findHKey('Matière');
            const arabicKeywords = [
                'عربي', 'العربية', 'اللغة العربية', 'arabe',
                'قرآن', 'القرآن', 'coran',
                'تجويد', 'التجويد', 'tajwid',
                'حديث', 'الحديث', 'hadith',
                'تربية', 'التربية', 'islamique',
                'توحيد', 'التوحيد', 'tawhid',
                'فقه', 'الفقه', 'fiqh'
            ];
            
            const classSubjects = planData
                .filter(item => item[classKey] === selectedClass && item[matiereKey])
                .map(item => item[matiereKey]);
            
            const uniqueSubjects = [...new Set(classSubjects)].filter(subject => {
                return !arabicKeywords.some(keyword => 
                    subject.toLowerCase().includes(keyword.toLowerCase())
                );
            }).sort();
            
            if (uniqueSubjects.length === 0) {
                displayAlert("Aucune matière non-arabe trouvée pour cette classe.", true);
                return;
            }
            
            let subjectOptions = `Classe: ${selectedClass}\nChoisissez une matière :\n\n`;
            uniqueSubjects.forEach((subject, index) => {
                subjectOptions += `${index + 1}. ${subject}\n`;
            });
            subjectOptions += '\nEntrez le numéro de la matière :';
            
            const subjectChoice = prompt(subjectOptions);
            if (!subjectChoice) return; // Annulé
            
            const subjectIndex = parseInt(subjectChoice) - 1;
            if (isNaN(subjectIndex) || subjectIndex < 0 || subjectIndex >= uniqueSubjects.length) {
                displayAlert("Choix invalide.", true);
                return;
            }
            
            const selectedSubject = uniqueSubjects[subjectIndex];
            console.log('Matière sélectionnée:', selectedSubject);
            
            // Confirmation finale
            const confirmation = confirm(
                `Générer les plans de leçon pour :\n\n` +
                `Classe: ${selectedClass}\n` +
                `Matière: ${selectedSubject}\n` +
                `Semaine: ${currentWeek}\n\n` +
                `Continuer ?`
            );
            
            if (!confirmation) return;
            
            // Étape 3: Génération
            await generateLessonPlansForClassAndSubject(selectedClass, selectedSubject);
        }
        
        // Générer les plans de leçon pour une classe et une matière
        async function generateLessonPlansForClassAndSubject(selectedClass, selectedSubject) {
            const classKey = findHKey('Classe');
            const matiereKey = findHKey('Matière');
            
            // Filtrer les lignes correspondantes
            const rowsToGenerate = planData.filter(item => 
                item[classKey] === selectedClass && item[matiereKey] === selectedSubject
            );
            
            if (rowsToGenerate.length === 0) {
                displayAlert("Aucune ligne trouvée pour cette combinaison classe/matière.", true);
                return;
            }
            
            console.log(`${rowsToGenerate.length} ligne(s) à traiter`);
            
            displayAlert(`Génération de ${rowsToGenerate.length} plan(s) de leçon...`, false);
            setButtonLoading('generateAllLessonPlansBtn', true, 'fas fa-robot');
            showProgressBar();
            
            let successCount = 0;
            let errorCount = 0;
            
            try {
                for (let i = 0; i < rowsToGenerate.length; i++) {
                    const rowData = rowsToGenerate[i];
                    const progress = Math.round(((i + 1) / rowsToGenerate.length) * 95);
                    updateProgressBar(progress);
                    
                    try {
                        // Générer le plan avec l'IA
                        const response = await fetch('/api/generate-ai-lesson-plan', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ week: currentWeek, rowData: rowData })
                        });
                        
                        if (response.ok) {
                            const blob = await response.blob();
                            const contentDisposition = response.headers.get('content-disposition');
                            let filename = `plan_lecon_${selectedClass}_${selectedSubject}_${i + 1}.docx`;
                            if (contentDisposition) {
                                const filenameMatch = contentDisposition.match(/filename="?(.+?)"?(;|$)/i);
                                if (filenameMatch && filenameMatch[1]) {
                                    filename = filenameMatch[1];
                                }
                            }
                            
                            // Convertir en base64 pour MongoDB
                            const fileBuffer = await blob.arrayBuffer();
                            const base64Buffer = btoa(String.fromCharCode(...new Uint8Array(fileBuffer)));
                            
                            // Sauvegarder dans MongoDB
                            const saveResponse = await fetch('/api/save-lesson-plan', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ 
                                    week: currentWeek, 
                                    rowData: rowData,
                                    fileBuffer: base64Buffer,
                                    filename: filename
                                })
                            });
                            
                            if (saveResponse.ok) {
                                successCount++;
                                console.log(`✅ Plan ${i + 1}/${rowsToGenerate.length} sauvegardé`);
                            } else {
                                console.error('Erreur sauvegarde MongoDB:', await saveResponse.text());
                                errorCount++;
                            }
                        } else {
                            const errorResult = await response.json().catch(() => ({ message: "Erreur inconnue" }));
                            console.error(`Erreur génération ${i + 1}:`, errorResult.message);
                            errorCount++;
                        }
                    } catch (error) {
                        console.error(`Erreur ligne ${i + 1}:`, error);
                        errorCount++;
                    }
                    
                    // Petit délai entre chaque génération
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                
                updateProgressBar(100);
                
                if (errorCount === 0) {
                    displayAlert(`✅ ${successCount} plan(s) de leçon généré(s) et sauvegardé(s) avec succès !`, false);
                } else {
                    displayAlert(`⚠️ ${successCount} réussis, ${errorCount} échoués`, false);
                }
                
                // Recharger les données pour afficher les boutons de téléchargement
                await loadPlanForWeek();
                
            } catch (error) {
                console.error("Erreur génération plans:", error);
                displayAlert('Erreur lors de la génération des plans de leçon.', true);
                updateProgressBar(0);
            } finally {
                hideProgressBar();
                setButtonLoading('generateAllLessonPlansBtn', false, 'fas fa-robot');
            }
        }


        console.log("Script principal terminé.");
