import { LiveAnnouncer } from '@angular/cdk/a11y';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { IPlanning } from '../../interface/i-planning';
import { PlanningService } from '../../service/planning.service';


let ELEMENT_DATA_PLALING : IPlanning[] = [];
@Component({
  selector: 'app-planning',
  templateUrl: './planning.component.html',
  styleUrls: ['./planning.component.css']
})
export class PlanningComponent implements OnInit {

  public Open : boolean = false;
  public Link : string = "";


  displayedColumns: string[] = ["IdPlanningSwing", "IdCliente",   "Modulo", "Linea", "Cut_date_all_component", "Ct", "Status_cut", "Marker", "Largo", "NotasEspeciales",
"Origen_segun_wip", "Cutting_plan", "Cut", "Style", "Cut_date_body", "foleo_date_body", "In_plant", "Quant", "Status_comp", "Status_cuerpo", "Foleo",
"Status_envio", "Fabric", "Pocketing", "Fuse1", "Fuse2", "Cordura", "Quilt", "Dracon", "Linning", "Binding1", "Binding2", "Sherpa", "Rib", "Price",
"Total"];
dataSource = new MatTableDataSource(ELEMENT_DATA_PLALING);
clickedRows = new Set<IPlanning>();


  
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

  
  clickRow(row : IPlanning){

  
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
              this.dataSource.data.push(j);
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

    
    ngOnInit(): void {

      this.LlenarTabla();
    }
  
  

}
