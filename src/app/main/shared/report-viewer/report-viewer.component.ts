import { Component, OnInit} from '@angular/core';
import { Conexion } from '../class/Cnx/conexion';
import { ReportViewerService } from './report-viewer.service';

@Component({
  selector: 'app-report-viewer',
  templateUrl: './report-viewer.component.html',
  styleUrls: ['./report-viewer.component.css']
})
export class ReportViewerComponent implements OnInit {

  private Cnx : Conexion = new Conexion();

  public serviceUrl: string = "";
  public reportPath: string = "";
  public reportData: any;
  public Remote : string = "Local"
  public isPrintMode: boolean = false;
  public parameters: any[] = [];
  public pageSettings : any;
  public toolbarSettings : any;
 


  constructor(private Servicio : ReportViewerService) { 

    this.serviceUrl = "";
    this.isPrintMode = true;
    this.pageSettings =  {
      width: 3,
      height: 2,
      margins: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    }
  };

  this.toolbarSettings = {
    showToolbar: true,
}

this.parameters = [];

    
}

    Imprimir(d : any){

      this.Limpiar();

      this.serviceUrl = this.Cnx.Url() + "Reporte/ReportViewer";
      this.reportPath =  d.Rdlc;
      this.parameters = [d];

  }


    Limpiar(){


      this.parameters.push(0, this.parameters.length)
      this.serviceUrl = "";
      this.reportPath = "";
      this.isPrintMode = false;
      this.pageSettings = [];

    }


    ngOnInit(): void {
      this.Servicio.change.subscribe(s => {
  
        if(s[0] == "Imprimir") {
          this.Imprimir(s[1] );
        }
  
        if(s[0] == "Limpiar"){
          this.Limpiar();
        }
        
      });
    }
  


}
