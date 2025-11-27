import { useEffect } from 'react';

interface UseDialogAccessibilityOptions {
  isOpen: boolean;
  title?: string;
  description?: string;
  autoGenerate?: boolean;
}

/**
 * Hook pour garantir l'accessibilité des dialogs
 * Vérifie et corrige automatiquement les problèmes d'accessibilité
 */
export function useDialogAccessibility({
  isOpen,
  title = 'Dialog',
  description,
  autoGenerate = true,
}: UseDialogAccessibilityOptions) {
  useEffect(() => {
    if (!isOpen) return;

    // Délai pour laisser le DOM se mettre à jour
    const timer = setTimeout(() => {
      // Trouver tous les DialogContent ouverts
      const dialogContents = document.querySelectorAll('[data-state="open"] [role="dialog"]');
      
      dialogContents.forEach((dialog) => {
        // Vérifier si le dialog a un aria-describedby
        if (!dialog.getAttribute('aria-describedby')) {
          // Chercher une description existante
          let descriptionElement = dialog.querySelector('[data-slot="dialog-description"]');
          
          if (!descriptionElement && autoGenerate) {
            // Créer une description cachée si elle n'existe pas
            const generatedDescription = description || `Contenu du dialog: ${title}`;
            descriptionElement = document.createElement('div');
            descriptionElement.setAttribute('data-slot', 'dialog-description');
            descriptionElement.classList.add('sr-only');
            descriptionElement.textContent = generatedDescription;
            
            // Générer un ID unique
            const descId = `dialog-desc-${Math.random().toString(36).substr(2, 9)}`;
            descriptionElement.id = descId;
            
            // Ajouter la description au dialog
            dialog.appendChild(descriptionElement);
            
            // Lier le dialog à la description
            dialog.setAttribute('aria-describedby', descId);
          } else if (descriptionElement) {
            // Lier à la description existante
            const existingId = descriptionElement.id || `dialog-desc-${Math.random().toString(36).substr(2, 9)}`;
            if (!descriptionElement.id) {
              descriptionElement.id = existingId;
            }
            dialog.setAttribute('aria-describedby', existingId);
          }
        }

        // S'assurer que le dialog a un titre accessible
        if (!dialog.getAttribute('aria-labelledby')) {
          let titleElement = dialog.querySelector('[data-slot="dialog-title"]');
          
          if (!titleElement && autoGenerate) {
            // Chercher un h1, h2, etc. dans le dialog
            titleElement = dialog.querySelector('h1, h2, h3, h4, h5, h6');
            if (titleElement) {
              titleElement.setAttribute('data-slot', 'dialog-title');
            } else {
              // Créer un titre caché
              titleElement = document.createElement('h2');
              titleElement.setAttribute('data-slot', 'dialog-title');
              titleElement.classList.add('sr-only');
              titleElement.textContent = title;
              dialog.insertBefore(titleElement, dialog.firstChild);
            }
          }
          
          if (titleElement) {
            const titleId = titleElement.id || `dialog-title-${Math.random().toString(36).substr(2, 9)}`;
            if (!titleElement.id) {
              titleElement.id = titleId;
            }
            dialog.setAttribute('aria-labelledby', titleId);
          }
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, title, description, autoGenerate]);

  return {
    ensureAccessibility: () => {
      // Fonction pour forcer la correction manuelle
      const event = new CustomEvent('dialog-accessibility-check', {
        detail: { title, description }
      });
      window.dispatchEvent(event);
    }
  };
}

/**
 * Hook simplifié pour les cas les plus courants
 */
export function useDialogA11y(isOpen: boolean, title: string, description?: string) {
  return useDialogAccessibility({
    isOpen,
    title,
    description,
    autoGenerate: true,
  });
}

export default useDialogAccessibility;