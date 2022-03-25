import { Injectable, TemplateRef } from '@angular/core';
import { NgbToast, NgbToastService, NgbToastType } from 'ngb-toast';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  
  toasts: any[] = [];

  // Push new Toasts to array with content and options
  show(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    this.toasts.push({ textOrTpl, ...options });
  }

  // Callback method to remove Toast DOM element from view
  remove(toast : any) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }


  ;

  constructor(private  toastService:  NgbToastService) {}


	showSuccess(Mensaje : string, TimeSeconds : number): void {
		const toast: NgbToast = {
			toastType:  NgbToastType.Success,
      timeInSeconds : TimeSeconds,
			text:  Mensaje,
			dismissible:  true,
      
			onDismiss: () => {
				//console.log("Toast dismissed!!");
			}
		}
		this.toastService.show(toast);
	}


  showInfo(Mensaje : string, TimeSeconds : number): void {
		const toast: NgbToast = {
			toastType:  NgbToastType.Info,
      timeInSeconds : TimeSeconds,
			text:  Mensaje,
			dismissible:  true,
      
			onDismiss: () => {
				//console.log("Toast dismissed!!");
			}
		}
		this.toastService.show(toast);
	}

	
	removeToast(toast: NgbToast): void {
		this.toastService.remove(toast);
	}
	
}
