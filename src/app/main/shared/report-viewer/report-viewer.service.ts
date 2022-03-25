import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReportViewerService {
  @Output() change: EventEmitter<any> = new EventEmitter();


  constructor() { }



}
