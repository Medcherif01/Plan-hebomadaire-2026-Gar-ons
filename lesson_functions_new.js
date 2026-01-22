// ==================== NOUVELLES FONCTIONS PLANS DE LEÇON (AVEC CHECKBOXES) ====================

// Fonction pour peupler les checkboxes des classes
function populateLessonPlanClasses() {
    const container = document.getElementById('lessonPlanClassesList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!planData || planData.length === 0) {
        container.innerHTML = '<p style="color: #999;">Aucune donnée disponible</p>';
        updateGenerateButtonState();
        return;
    }
    
    const classKey = findHKey('Classe');
    if (!classKey) {
        container.innerHTML = '<p style="color: #999;">Erreur: colonne Classe non trouvée</p>';
        updateGenerateButtonState();
        return;
    }
    
    const uniqueClasses = [...new Set(planData.map(item => item[classKey]).filter(Boolean))];
    uniqueClasses.sort(compareClasses);
    
    if (uniqueClasses.length === 0) {
        container.innerHTML = '<p style="color: #999;">Aucune classe trouvée</p>';
        updateGenerateButtonState();
        return;
    }
    
    uniqueClasses.forEach(cls => {
        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '8px';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `class_${cls}`;
        checkbox.value = cls;
        checkbox.classList.add('class-checkbox');
        checkbox.addEventListener('change', () => {
            updateLessonPlanSubjects();
            updateGenerateButtonState();
        });
        
        const label = document.createElement('label');
        label.htmlFor = `class_${cls}`;
        label.style.marginLeft = '5px';
        label.style.cursor = 'pointer';
        
        const arTranslation = classTranslations[cls];
        label.textContent = arTranslation ? `${arTranslation} (${cls})` : cls;
        
        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);

        // 2. Ajout du bouton de téléchargement
        const downloadBtn = document.createElement('button');
        downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
        downloadBtn.style.marginLeft = '10px';
        downloadBtn.style.padding = '3px 8px';
        downloadBtn.style.fontSize = '12px';
        downloadBtn.style.cursor = 'pointer';
        downloadBtn.setAttribute('aria-label', `Télécharger le plan pour ${cls}`);

        // Vérifier si le plan est disponible
        // window.availableWeeklyPlans est rempli par la fonction loadPlanData
        if (window.availableWeeklyPlans && window.availableWeeklyPlans.includes(cls)) {
            downloadBtn.title = `Télécharger le plan hebdomadaire pour ${cls}`;
            downloadBtn.onclick = () => downloadWeeklyPlan(currentWeek, cls);
            downloadBtn.disabled = false;
            downloadBtn.style.color = '#28a745'; // Vert
            downloadBtn.style.borderColor = '#28a745';
        } else {
            downloadBtn.title = 'Le plan hebdomadaire pour cette classe n\'est pas encore généré par le coordinateur.';
            downloadBtn.disabled = true;
            downloadBtn.style.color = '#ccc';
            downloadBtn.style.borderColor = '#ccc';
        }

        wrapper.appendChild(downloadBtn);
        container.appendChild(wrapper);
    });
    
    updateLessonPlanSubjects();
    updateGenerateButtonState();
}

// Fonction pour peupler les checkboxes des matières (basé sur les classes sélectionnées)
function updateLessonPlanSubjects() {
    const container = document.getElementById('lessonPlanSubjectsList');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Récupérer les classes sélectionnées
    const selectedClasses = Array.from(document.querySelectorAll('.class-checkbox:checked'))
        .map(cb => cb.value);
    
    if (selectedClasses.length === 0) {
        container.innerHTML = '<p style="color: #999;">Sélectionnez d\'abord une ou plusieurs classes</p>';
        updateGenerateButtonState();
        return;
    }
    
    if (!planData || planData.length === 0) {
        container.innerHTML = '<p style="color: #999;">Aucune donnée disponible</p>';
        updateGenerateButtonState();
        return;
    }
    
    const classKey = findHKey('Classe');
    const matiereKey = findHKey('Matière');
    
    if (!classKey || !matiereKey) {
        container.innerHTML = '<p style="color: #999;">Erreur de configuration</p>';
        updateGenerateButtonState();
        return;
    }
    
    // Mots-clés pour exclure les matières arabes
    const arabicKeywords = [
        'عربي', 'العربية', 'اللغة العربية', 'arabe',
        'قرآن', 'القرآن', 'coran',
        'تجويد', 'التجويد', 'tajwid',
        'حديث', 'الحديث', 'hadith',
        'تربية', 'التربية', 'islamique',
        'توحيد', 'التوحيد', 'tawhid',
        'فقه', 'الفقه', 'fiqh',
        'سيرة', 'السيرة', 'sirah'
    ];
    
    // Récupérer toutes les matières des classes sélectionnées
    const subjectsFromSelectedClasses = planData
        .filter(item => selectedClasses.includes(item[classKey]) && item[matiereKey])
        .map(item => item[matiereKey]);
    
    // Filtrer pour exclure les matières arabes
    const uniqueSubjects = [...new Set(subjectsFromSelectedClasses)]
        .filter(subject => {
            return !arabicKeywords.some(keyword => 
                subject.toLowerCase().includes(keyword.toLowerCase())
            );
        })
        .sort();
    
    if (uniqueSubjects.length === 0) {
        container.innerHTML = '<p style="color: #999;">Aucune matière non-arabe trouvée pour ces classes</p>';
        updateGenerateButtonState();
        return;
    }
    
    uniqueSubjects.forEach(subject => {
        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '8px';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `subject_${subject}`;
        checkbox.value = subject;
        checkbox.classList.add('subject-checkbox');
        checkbox.addEventListener('change', updateGenerateButtonState);
        
        const label = document.createElement('label');
        label.htmlFor = `subject_${subject}`;
        label.style.marginLeft = '5px';
        label.style.cursor = 'pointer';
        label.textContent = subject;
        
        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);
        container.appendChild(wrapper);
    });
    
    updateGenerateButtonState();
}

// Fonction pour activer/désactiver le bouton de génération
function updateGenerateButtonState() {
    const btn = document.getElementById('generateAllLessonPlansBtn');
    const infoSpan = document.getElementById('lessonPlanSelectionInfo');
    
    if (!btn || !infoSpan) return;
    
    const selectedClasses = Array.from(document.querySelectorAll('.class-checkbox:checked'));
    const selectedSubjects = Array.from(document.querySelectorAll('.subject-checkbox:checked'));
    
    const classCount = selectedClasses.length;
    const subjectCount = selectedSubjects.length;
    
    if (classCount > 0 && subjectCount > 0) {
        btn.disabled = false;
        infoSpan.textContent = `${classCount} classe(s) et ${subjectCount} matière(s) sélectionnées`;
        infoSpan.style.color = '#28a745';
    } else {
        btn.disabled = true;
        if (classCount === 0) {
            infoSpan.textContent = 'Sélectionnez au moins une classe';
        } else {
            infoSpan.textContent = 'Sélectionnez au moins une matière';
        }
        infoSpan.style.color = '#999';
    }
}

// Fonctions pour sélectionner/déselectionner toutes les classes
function selectAllClasses() {
    document.querySelectorAll('.class-checkbox').forEach(cb => {
        cb.checked = true;
    });
    updateLessonPlanSubjects();
    updateGenerateButtonState();
}

function deselectAllClasses() {
    document.querySelectorAll('.class-checkbox').forEach(cb => {
        cb.checked = false;
    });
    updateLessonPlanSubjects();
    updateGenerateButtonState();
}

// Fonctions pour sélectionner/déselectionner toutes les matières
function selectAllSubjects() {
    document.querySelectorAll('.subject-checkbox').forEach(cb => {
        cb.checked = true;
    });
    updateGenerateButtonState();
}

function deselectAllSubjects() {
    document.querySelectorAll('.subject-checkbox').forEach(cb => {
        cb.checked = false;
    });
    updateGenerateButtonState();
}

// Fonction principale: Générer tous les plans de leçon sélectionnés
async function startGenerateAllLessonPlans() {
    if (!currentWeek) {
        displayAlert("Veuillez d'abord sélectionner une semaine.", true);
        return;
    }
    
    if (!planData || planData.length === 0) {
        displayAlert("Aucune donnée disponible pour cette semaine.", true);
        return;
    }
    
    // Récupérer les classes et matières sélectionnées
    const selectedClasses = Array.from(document.querySelectorAll('.class-checkbox:checked'))
        .map(cb => cb.value);
    const selectedSubjects = Array.from(document.querySelectorAll('.subject-checkbox:checked'))
        .map(cb => cb.value);
    
    if (selectedClasses.length === 0 || selectedSubjects.length === 0) {
        displayAlert("Veuillez sélectionner au moins une classe et une matière.", true);
        return;
    }
    
    // Confirmation
    const confirmation = confirm(
        `Générer les plans de leçon pour :\n\n` +
        `Classes: ${selectedClasses.join(', ')}\n` +
        `Matières: ${selectedSubjects.join(', ')}\n` +
        `Semaine: ${currentWeek}\n\n` +
        `Cela générera des plans pour toutes les combinaisons classe/matière.\n\n` +
        `Continuer ?`
    );
    
    if (!confirmation) return;
    
// Génération
	    await generateWeeklyPlansZip(selectedClasses, selectedSubjects);
	}

	// Générer les plans pour toutes les combinaisons classe/matière sélectionnées et les télécharger en ZIP
	async function generateWeeklyPlansZip(selectedClasses, selectedSubjects) {
	    const classKey = findHKey('Classe');
	    const matiereKey = findHKey('Matière');
	    
	    // Filtrer les lignes correspondantes
	    const rowsToGenerate = planData.filter(item => 
	        selectedClasses.includes(item[classKey]) && selectedSubjects.includes(item[matiereKey])
	    );
	    
	    if (rowsToGenerate.length === 0) {
	        displayAlert("Aucune ligne trouvée pour ces combinaisons classe/matière.", true);
	        return;
	    }
	    
	    // Extraire les données nécessaires pour le backend
	    const dataToSend = rowsToGenerate.map(row => {
	        const newRow = {};
	        headers.forEach(header => {
	            newRow[header] = row[header];
	        });
	        return newRow;
	    });
	    
	    // Récupérer les notes de classe
	    const notesToSend = {};
	    selectedClasses.forEach(cls => {
	        notesToSend[cls] = weeklyClassNotes[cls] || '';
	    });
	    
	    console.log(`Génération ZIP pour ${selectedClasses.length} classe(s) et ${selectedSubjects.length} matière(s)`);
	    
	    displayAlert(`Génération du fichier ZIP contenant ${selectedClasses.length} plan(s) de leçon...`, false);
	    setButtonLoading('generateAllLessonPlansBtn', true, 'fas fa-robot');
	    showProgressBar();
	    
	    try {
	        const response = await fetch('/api/generate-weekly-plans-zip', {
	            method: 'POST',
	            headers: { 'Content-Type': 'application/json' },
	            body: JSON.stringify({ 
	                week: currentWeek, 
	                classes: selectedClasses, 
	                data: dataToSend,
	                notes: notesToSend
	            })
	        });
	        
	        if (response.ok) {
	            const blob = await response.blob();
	            const contentDisposition = response.headers.get('content-disposition');
	            let filename = `Plans_Hebdomadaires_S${currentWeek}.zip`;
	            
	            if (contentDisposition) {
	                const filenameMatch = contentDisposition.match(/filename="?(.+?)"?(;|$)/i);
	                if (filenameMatch && filenameMatch[1]) {
	                    filename = filenameMatch[1];
	                }
	            }
	            
	            // Téléchargement du fichier ZIP
	            const link = document.createElement('a');
	            link.href = window.URL.createObjectURL(blob);
	            link.download = filename;
	            document.body.appendChild(link);
	            link.click();
	            document.body.removeChild(link);
	            window.URL.revokeObjectURL(link.href);
	            
	            displayAlert(`✅ Fichier ZIP '${filename}' généré et téléchargé avec succès !`, false, 5000);
	            
	            // Recharger les données pour mettre à jour l'état des boutons de téléchargement individuels
	            await loadPlanForWeek();
	            
	        } else {
	            const errorText = await response.text();
	            let errorMessage = `Erreur serveur: ${errorText}`;
	            try {
	                const errorJson = JSON.parse(errorText);
	                errorMessage = errorJson.message || errorMessage;
	            } catch (e) {
	                // Ignorer l'erreur de parsing si ce n'est pas du JSON
	            }
	            displayAlert(`❌ Échec de la génération ZIP: ${errorMessage}`, true);
	        }
	        
	    } catch (error) {
	        console.error("Erreur génération ZIP:", error);
	        displayAlert('Erreur réseau lors de la génération du fichier ZIP.', true);
	    } finally {
	        hideProgressBar();
	        setButtonLoading('generateAllLessonPlansBtn', false, 'fas fa-robot');
	    }
	}

	// Fonction de comparaison de classes (pour le tri)
function compareClasses(a, b) {
    // Logique de tri simple (peut être ajustée si nécessaire)
    return a.localeCompare(b);
}

// Fonction de téléchargement du plan hebdomadaire
async function downloadWeeklyPlan(week, classe) {
    if (!week || !classe) {
        displayAlert('Semaine ou classe non spécifiée.', true);
        return;
    }

    const url = `/api/download-weekly-plan/${week}/${classe}`;
    displayAlert(`Téléchargement du plan pour ${classe}...`);

    try {
        const response = await fetch(url);

        if (response.ok) {
            const blob = await response.blob();
            const contentDisposition = response.headers.get('content-disposition');
            let filename = `Plan_hebdomadaire_S${week}_${classe}.docx`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+?)"?(;|$)/i);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1];
                }
            }

            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);

            displayAlert(`Plan pour ${classe} téléchargé avec succès.`, false, 3000);
        } else {
            const errorData = await response.json();
            displayAlert(`Erreur: ${errorData.message || 'Impossible de télécharger le plan.'}`, true);
        }
    } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        displayAlert('Erreur réseau lors du téléchargement du plan.', true);
    }
}
