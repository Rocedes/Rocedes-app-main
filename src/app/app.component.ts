import { Component } from '@angular/core';
import {Router} from "@angular/router"
  




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Rocedes-app';
   

  constructor(private router:Router) {
    this.Iniciar();
  }
  
  
  Iniciar(){


    this.router.navigate(['/login'], { skipLocationChange: false });
      
  }

  
  
}
