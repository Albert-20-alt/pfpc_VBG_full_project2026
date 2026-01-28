import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ConfirmDeleteDialog = ({ isOpen, onClose, onConfirm, taskTitle }) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold text-red-400">
                        Confirmer la suppression
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-300">
                        Êtes-vous sûr de vouloir supprimer cette tâche ?
                        {taskTitle && (
                            <span className="block mt-2 font-semibold text-white">
                                "{taskTitle}"
                            </span>
                        )}
                        <span className="block mt-2 text-slate-400">
                            Cette action est irréversible.
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-slate-800 hover:bg-slate-700 border-white/10">
                        Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Supprimer
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ConfirmDeleteDialog;
