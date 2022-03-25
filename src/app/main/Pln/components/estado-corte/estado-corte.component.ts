import { LiveAnnouncer } from '@angular/cdk/a11y';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmarContinuarComponent } from 'src/app/main/shared/dialogo/confirmar-continuar/confirmar-continuar.component';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { IPlanning } from '../../interface/i-planning';
import { PlanningService } from '../../service/planning.service';

export interface IPlanningEstatus {
  IdPlanningSwing : number;
  IdCliente : number;
  Cliente : string;
  Modulo : string;
  Linea : string;
  Ct : string;
  NotasEspeciales : string;
  Cut : string;
  Style : string;
  Quant : number;
  Status_cut : string;
  Accepted : boolean;
  Rejected : boolean;
}



let ELEMENT_DATA_PLALING : IPlanningEstatus[] = [];
@Component({
  selector: 'app-estado-corte',
  templateUrl: './estado-corte.component.html',
  styleUrls: ['./estado-corte.component.css']
})
export class EstadoCorteComponent implements OnInit {

  public Open : boolean = false;
  public Link : string = "";


  displayedColumns: string[] = ["IdPlanningSwing", "IdCliente",   "Modulo", "Linea", "Ct", "NotasEspeciales", "Cut", "Style",  "Quant", "Accepted", "Rejected"];
dataSource = new MatTableDataSource(ELEMENT_DATA_PLALING);
clickedRows = new Set<IPlanningEstatus>();


  
  @ViewChild(MatPaginator, {static: false})
  set paginator(value: MatPaginator) {
    if (this.dataSource){
      this.dataSource.paginator = value;
      if(this.dataSource.paginator != null)this.dataSource.paginator._intl.getRangeLabel = this.getRangeDisplayText;
    }
  }
  @ViewChild(MatSort, {static: false})
  set sort(sort: MatSort) {
     this.dataSource.sort = sort;
  }


  
  constructor( private _liveAnnouncer: LiveAnnouncer, private dialog : MatDialog, public datePipe: DatePipe,
    private _PlaningService : PlanningService) { }



  
   //#region EVENTOS TABLA


   announceSort(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  filtrar(event: Event) {
    const filtro = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filtro.trim().toLowerCase();
  }  
 

  getRangeDisplayText = (page: number, pageSize: number, length: number) => {
    const initialText = `Registros`;  // customize this line
    if (length == 0 || pageSize == 0) {
      return `${initialText} 0 of ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length 
      ? Math.min(startIndex + pageSize, length) 
      : startIndex + pageSize;
    return `${initialText} ${startIndex + 1} de ${endIndex} Total: ${length}`; // customize this line
  };

  
  clickRow(row : IPlanningEstatus){

  
  }



    //#endregion EVENTOS TABLA

    LlenarTabla() : void
    {
      this.dataSource.data.splice(0, this.dataSource.data.length);
  
  
  
      this._PlaningService.Get().subscribe( s =>{
  
        let _json = JSON.parse(s);
  
    
        if(_json["esError"] == 0)
        {
          if(_json["count"] > 0)
          {
  
            _json["d"].forEach((j : IPlanning) => {
              
                let datos : IPlanningEstatus = {} as IPlanningEstatus;
                datos.IdPlanningSwing = j.IdPlanningSwing;
                datos.IdCliente = j.IdCliente;
                datos.Cliente = j.Cliente;
                datos.Modulo = j.Modulo;
                datos.Linea = j.Linea;
                datos.Ct = j.Ct;
                datos.NotasEspeciales = j.NotasEspeciales;
                datos.Cut = j.Cut;
                datos.Style = j.Style;
                datos.Quant = j.Quant;
                datos.Accepted = false;
                datos.Rejected = false;

                if(j.Status_cut == "ACCEPTED") datos.Accepted = true;
                if(j.Status_cut == "REJECTED") datos.Rejected = true;
              
                this.dataSource.data.push(datos);
            });
          }
        }
        else
        {
          this.dialog.open(DialogoComponent, {
            data : _json["msj"]
          })
        }
    
        this.dataSource.filter = "";

      
      });
    }


    Guardar(element : IPlanningEstatus, e : string)
    {

      if(element.Ct != "READY" && element.Ct != "ON HOLD")
      {
        this.dialog.open(DialogoComponent, {
          data : "Sole se permite modificar en estado <b style='color:blue;'>READY</b> Y/O <b style='color:blue;'>ON HOLD</b>"
        })
        return;
      }

      
      let _dialog = this.dialog.open(ConfirmarContinuarComponent)
      document.getElementById("body")?.classList.add("disabled");

      _dialog.afterClosed().subscribe( s =>{
        document?.getElementById("body")?.classList.remove("disabled");
        if(_dialog.componentInstance.Retorno == "1")
        {
          if(e == "1")
          {
            element.Accepted = !element.Accepted;
            if(element.Accepted && element.Rejected)element.Rejected = false;
          }
          else
          {
            element.Rejected = !element.Rejected;
            if(element.Rejected) element.Accepted  = false;
          }
    
          let estado : string = "NONE";
    
          if(element.Accepted) estado = "ACCEPTED";
          if(element.Rejected) estado = "REJECTED";
    
          this._PlaningService.GuardarEstadoCorte(element.IdPlanningSwing, estado).subscribe( s =>{
    
            let _json = JSON.parse(s);
      
            if(_json["esError"] != 0)
            {
              this.dialog.open(DialogoComponent, {
                data : _json["msj"]
              })
            }
                                       

          });
        }
      });


    }
    
    ngOnInit(): void {

      this.LlenarTabla();
    }
  
}