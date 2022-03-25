import { Directive,  ViewContainerRef } from '@angular/core';


@Directive({
  selector: '[appOpenClose]'
})
export class OpenCloseDirective {

  constructor(public viewContainerRef:ViewContainerRef) { }

}
