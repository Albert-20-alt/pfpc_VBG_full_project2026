import {
	Toast,
	ToastClose,
	ToastDescription,
	ToastProvider,
	ToastTitle,
	ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import React from 'react';

export function Toaster() {
	const { toasts } = useToast();

	return (
		<ToastProvider>
			{toasts.map(({ id, title, description, action, variant, ...props }) => {
				return (
					<Toast key={id} variant={variant} {...props}>
						<div className="flex gap-4 items-start w-full">
							{variant === 'success' && <div className="mt-0.5"><CheckCircle2 className="h-6 w-6 text-emerald-400" /></div>}
							{variant === 'destructive' && <div className="mt-0.5"><AlertCircle className="h-6 w-6 text-red-400" /></div>}

							<div className="grid gap-1 flex-1">
								{title && <ToastTitle>{title}</ToastTitle>}
								{description && (
									<ToastDescription>{description}</ToastDescription>
								)}
							</div>
						</div>
						{action}
						<ToastClose />
					</Toast>
				);
			})}
			<ToastViewport />
		</ToastProvider>
	);
}
