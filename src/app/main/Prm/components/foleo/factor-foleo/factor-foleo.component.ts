import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { FactorFoleoService } from 'src/app/main/Prm/service/factor-foleo.service';
import { IFactorFoleo } from '../../../interface/i-Factor-Foleo';

let ELEMENT_DATA_FACTOR_FOLEO : IFactorFoleo[] = [];

@Component({
  selector: 'app-factor-foleo',
  templateUrl: './factor-foleo.component.html',
  styleUrls: ['./factor-foleo.component.css']
})
export class FactorFoleoComponent implements OnInit {

  str_from : string = "";
  
  displayedColumns: string[] = ["Guardar", "IdProcesoFoleo", "Proceso", "Factor1",  "Factor2", "Factor3"];
  dataSourceFactorFoleo = new MatTableDataSource(ELEMENT_DATA_FACTOR_FOLEO);
  clickedRows = new Set<IFactorFoleo>();

 
  @ViewChild(MatPaginator, {static: false})
  set paginator(value: MatPaginator) {
    if (this.dataSourceFactorFoleo){
      this.dataSourceFactorFoleo.paginator = value;
      if(this.dataSourceFactorFoleo.paginator != null)this.dataSourceFactorFoleo.paginator._intl.getRangeLabel = this.getRangeDisplayText;
    }
  }

  
  @ViewChild(MatSort, {static: false})
  set sort(sort: MatSort) {
     this.dataSourceFactorFoleo.sort = sort;
  }
  
  
  constructor(private _liveAnnouncer: LiveAnnouncer, private dialog : MatDialog, private _FactorFoleoService : FactorFoleoService) { }




  
  LLenarTabla() : void
  {

    ELEMENT_DATA_FACTOR_FOLEO.splice(0, ELEMENT_DATA_FACTOR_FOLEO.length);
    this.dataSourceFactorFoleo.data.splice(0, this.dataSourceFactorFoleo.data.length);

    this._FactorFoleoService.Get().subscribe( s =>{

      let _json = JSON.parse(s);

  
      if(_json["esError"] == 0)
      {
        if(_json["count"] > 0)
        {
          _json["d"].forEach((j : IFactorFoleo) => {
            ELEMENT_DATA_FACTOR_FOLEO.push(j);
          });
        }
      }
      else
      {
        this.dialog.open(DialogoComponent, {
          data : _json["msj"]
        })
      }

      this.dataSourceFactorFoleo = new MatTableDataSource(ELEMENT_DATA_FACTOR_FOLEO);


    });
  }

  Limpiar() : void
  {
    
    ELEMENT_DATA_FACTOR_FOLEO.splice(0, ELEMENT_DATA_FACTOR_FOLEO.length);
    this.dataSourceFactorFoleo = new MatTableDataSource(ELEMENT_DATA_FACTOR_FOLEO);
    this.str_from = "";
  }




    //#region EVENTOS TABLA


  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  filtrar(event: Event) {
    const filtro = (event.target as HTMLInputElement).value;
    this.dataSourceFactorFoleo.filter = filtro.trim().toLowerCase();
  }  
 
  
  clickRow(row : any){
    this._FactorFoleoService.Guardar(row).subscribe( s =>{

      let _json = JSON.parse(s);
                                 
      this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })

    });
  }



  
  getRangeDisplayText = (page: number, pageSize: number, length: number) => {
    const initialText = `Procesos`;  // customize this line
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

  
    //#endregion EVENTOS TABLA


  ngOnInit(): void {
    this.Limpiar();
    this.str_from = "factores";
    this.LLenarTabla();
  }

}
