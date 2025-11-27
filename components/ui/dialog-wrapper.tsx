import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './dialog';

interface DialogWrapperProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  hideCloseButton?: boolean;
}

/**
 * Wrapper de Dialog qui garantit l'accessibilité en s'assurant qu'il y a toujours
 * un titre et une description pour les lecteurs d'écran
 */
export function DialogWrapper({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  contentClassName,
  hideCloseButton = false,
}: DialogWrapperProps) {
  // Générer un ID unique pour la description
  const descriptionId = React.useId();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={contentClassName}
        aria-describedby={descriptionId}
        style={{
          ...(hideCloseButton && {
            '--dialog-close-display': 'none'
          } as React.CSSProperties)
        }}
      >
        <DialogHeader className={className}>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription id={descriptionId}>
            {description}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Version simplifiée pour les cas où on veut juste le contenu sans header visible
 */
interface SimpleDialogWrapperProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
  contentClassName?: string;
  hideHeader?: boolean;
}

export function SimpleDialogWrapper({
  isOpen,
  onClose,
  title,
  description,
  children,
  contentClassName,
  hideHeader = false,
}: SimpleDialogWrapperProps) {
  const descriptionId = React.useId();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={contentClassName}
        aria-describedby={descriptionId}
      >
        <DialogHeader className={hideHeader ? 'sr-only' : undefined}>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription id={descriptionId}>
            {description}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export default DialogWrapper;