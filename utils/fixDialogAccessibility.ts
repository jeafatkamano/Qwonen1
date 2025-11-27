/**
 * Utilitaire pour corriger automatiquement les problèmes d'accessibilité des dialogs
 */

export function fixAllDialogAccessibility() {
  console.log('🔧 Correction automatique des problèmes d\'accessibilité des dialogs...');

  let fixedCount = 0;
  const issues: string[] = [];

  try {
    // 1. Corriger tous les DialogContent sans aria-describedby
    const dialogContents = document.querySelectorAll('[role="dialog"]:not([aria-describedby])');
    
    dialogContents.forEach((dialog, index) => {
      try {
        const dialogId = dialog.id || `auto-dialog-${Date.now()}-${index}`;
        if (!dialog.id) {
          dialog.id = dialogId;
        }

        // Chercher une description existante
        let description = dialog.querySelector(
          '[data-slot="dialog-description"], [id*="description"], .dialog-description'
        );

        if (!description) {
          // Créer une description cachée
          description = document.createElement('div');
          description.id = `${dialogId}-description`;
          description.setAttribute('data-slot', 'dialog-description');
          description.className = 'sr-only';
          
          // Déterminer le contenu de la description basé sur le titre
          const titleElement = dialog.querySelector('[data-slot="dialog-title"], h1, h2, h3, [role="heading"]');
          const title = titleElement?.textContent?.trim() || 'Dialog';
          description.textContent = `Boîte de dialogue: ${title}. Appuyez sur Échap pour fermer.`;
          
          // Insérer au début du dialog
          dialog.insertBefore(description, dialog.firstChild);
        }

        // S'assurer que la description a un ID
        if (!description.id) {
          description.id = `${dialogId}-description`;
        }

        // Lier le dialog à la description
        dialog.setAttribute('aria-describedby', description.id);
        
        fixedCount++;
        console.log(`✅ Dialog corrigé: ${dialogId}`);
      } catch (error) {
        issues.push(`Erreur lors de la correction du dialog ${index}: ${error}`);
      }
    });

    // 2. Corriger les dialogs Radix/ShadCN spécifiques
    const radixDialogs = document.querySelectorAll('[data-radix-dialog-content]:not([aria-describedby])');
    
    radixDialogs.forEach((dialog, index) => {
      try {
        const dialogId = dialog.id || `radix-dialog-${Date.now()}-${index}`;
        if (!dialog.id) {
          dialog.id = dialogId;
        }

        // Chercher dans le parent Dialog
        const dialogRoot = dialog.closest('[data-radix-dialog-portal]') || dialog.parentElement;
        let description = dialogRoot?.querySelector('[data-slot="dialog-description"], [id*="description"]');

        if (!description) {
          description = document.createElement('div');
          description.id = `${dialogId}-description`;
          description.setAttribute('data-slot', 'dialog-description');
          description.className = 'sr-only';
          
          const titleElement = dialog.querySelector('[data-slot="dialog-title"], [data-radix-dialog-title]');
          const title = titleElement?.textContent?.trim() || 'Dialog';
          description.textContent = `Contenu du dialog: ${title}`;
          
          dialog.insertBefore(description, dialog.firstChild);
        }

        dialog.setAttribute('aria-describedby', description.id);
        fixedCount++;
        console.log(`✅ Dialog Radix corrigé: ${dialogId}`);
      } catch (error) {
        issues.push(`Erreur lors de la correction du dialog Radix ${index}: ${error}`);
      }
    });

    // 3. Vérifier les dialogs avec aria-describedby mais sans élément correspondant
    const dialogsWithDescribedBy = document.querySelectorAll('[role="dialog"][aria-describedby], [data-radix-dialog-content][aria-describedby]');
    
    dialogsWithDescribedBy.forEach((dialog) => {
      const describedById = dialog.getAttribute('aria-describedby');
      if (describedById && !document.getElementById(describedById)) {
        try {
          // Créer l'élément de description manquant
          const description = document.createElement('div');
          description.id = describedById;
          description.setAttribute('data-slot', 'dialog-description');
          description.className = 'sr-only';
          description.textContent = 'Contenu du dialog modal';
          
          dialog.insertBefore(description, dialog.firstChild);
          fixedCount++;
          console.log(`✅ Description manquante créée: ${describedById}`);
        } catch (error) {
          issues.push(`Erreur lors de la création de la description ${describedById}: ${error}`);
        }
      }
    });

    console.log(`✅ Correction terminée: ${fixedCount} dialogs corrigés`);
    
    if (issues.length > 0) {
      console.warn('⚠️ Problèmes rencontrés:', issues);
    }

    return {
      fixed: fixedCount,
      issues: issues
    };

  } catch (error) {
    console.error('❌ Erreur lors de la correction globale:', error);
    return {
      fixed: fixedCount,
      issues: [...issues, `Erreur globale: ${error}`]
    };
  }
}

/**
 * Surveille en continu l'ajout de nouveaux dialogs et les corrige automatiquement
 */
export function setupDialogAccessibilityMonitor() {
  let timeoutId: number | null = null;

  const observer = new MutationObserver((mutations) => {
    let shouldCheck = false;

    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (
              element.matches('[role="dialog"], [data-radix-dialog-content]') ||
              element.querySelector('[role="dialog"], [data-radix-dialog-content]')
            ) {
              shouldCheck = true;
            }
          }
        });
      }
    });

    if (shouldCheck) {
      // Débouncer les vérifications
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        fixAllDialogAccessibility();
      }, 100);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Correction initiale
  fixAllDialogAccessibility();

  return {
    disconnect: () => observer.disconnect(),
    forceCheck: () => fixAllDialogAccessibility()
  };
}

// Auto-start si on est dans le navigateur
if (typeof window !== 'undefined') {
  // Démarrer après le chargement du DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupDialogAccessibilityMonitor();
    });
  } else {
    setupDialogAccessibilityMonitor();
  }
}