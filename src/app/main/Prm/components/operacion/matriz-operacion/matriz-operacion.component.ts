import { LiveAnnouncer } from '@angular/cdk/a11y';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { ConfirmarEliminarComponent } from 'src/app/main/shared/dialogo/confirmar-eliminar/confirmar-eliminar.component';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { OperacionesService } from 'src/app/main/Prm/service/operaciones.service';
import { LoginService } from 'src/app/main/sis/service/login.service';
import { IMethodAnalysis } from '../../../interface/i-Method-Analysis';

let ELEMENT_DATA_OPERATION_MATIX_DATA : IMethodAnalysis[] = [];

@Component({
  selector: 'app-matriz-operacion',
  templateUrl: './matriz-operacion.component.html',
  styleUrls: ['./matriz-operacion.component.css']
})
export class MatrizOperacionComponent implements OnInit {

  public val = new Validacion();
  
  public Open : boolean = false;
  public Link : string = "";

  displayedColumns: string[] = ["IdMethodAnalysis", "Codigo", "Sam", "Precio", "Manufacturing", "Producto", "Family", "Operacion",
   "Secuence", "StitchInch", "DataMachine", "Machine", "TypeStitch", "Rpm", "Tela", "Ounce", "NeedleType", "Caliber", "FeedDog",
   "Folder", "MateriaPrima_1", "MateriaPrima_2", "MateriaPrima_3", "Usuario", "FechaRegistro",
   "PresserFoot", "UsuarioModifica", "FechaModifica", "Editar", "Eliminar"];
  dataSource = new MatTableDataSource(ELEMENT_DATA_OPERATION_MATIX_DATA);
  clickedRows = new Set<IMethodAnalysis>();


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


  constructor(private _LoginService : LoginService, private _liveAnnouncer: LiveAnnouncer, private dialog : MatDialog, private _OperacionesService : OperacionesService, public datePipe: DatePipe) { 
    this.val.add("txt_Matriz_Data_Fecha_Inicio", "1", "LEN>=", "0");
    this.val.add("txt_Matriz_Data_Fecha_Final", "1", "LEN>=", "0");
  }


  

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

  
  clickRow(row : IMethodAnalysis, str_Evento : string){

    if(str_Evento == "Editar")
    {
      this._OperacionesService.change.emit(["Open", row] );
    }
    else
    {
      let _dialog = this.dialog.open(ConfirmarEliminarComponent)
      document.getElementById("body")?.classList.add("disabled");

      _dialog.afterClosed().subscribe( s =>{
        document?.getElementById("body")?.classList.remove("disabled");
        if(_dialog.componentInstance.Retorno == "1")
        {
          this.Eliminar(row.IdMethodAnalysis);
        }
      });
    }
   

  }


  Eliminar(IdMethodAnalysis : number) : void
  {
    this._OperacionesService.EliminarMatrixOperacion(IdMethodAnalysis, this._LoginService.str_user).subscribe( s =>{
  
      let _json = JSON.parse(s);
            
      if(_json["esError"] == 0)
      {
        let index : number = ELEMENT_DATA_OPERATION_MATIX_DATA.findIndex(f =>  Number(f.IdMethodAnalysis) == Number(_json["d"].IdMethodAnalysis));


        if(index >= 0) ELEMENT_DATA_OPERATION_MATIX_DATA.splice(index, 1);
      }
     

      this.dataSource.data = ELEMENT_DATA_OPERATION_MATIX_DATA;
      
      this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })
  
    });
  }


    //#endregion EVENTOS TABLA


  

    Buscar() :void
    {
      ELEMENT_DATA_OPERATION_MATIX_DATA.splice(0, ELEMENT_DATA_OPERATION_MATIX_DATA.length);

      let Fecha_Inicio : string = "";
      let Fecha_Final : string = "";
      
 
      if(this.val.ValForm.get("txt_Matriz_Data_Fecha_Inicio")?.value != "" && this.val.ValForm.get("txt_Matriz_Data_Fecha_Inicio")?.value != null)
      {
        let date = new Date(this.val.ValForm.get("txt_Matriz_Data_Fecha_Inicio")?.value);
        Fecha_Inicio = String(this.datePipe.transform(date,"yyyy-MM-dd"));
      }

      if(this.val.ValForm.get("txt_Matriz_Data_Fecha_Final")?.value != "" && this.val.ValForm.get("txt_Matriz_Data_Fecha_Final")?.value != null)
      {
        let date = new Date(this.val.ValForm.get("txt_Matriz_Data_Fecha_Final")?.value);
        Fecha_Final = String(this.datePipe.transform(date,"yyyy-MM-dd"));
      }


      this._OperacionesService.GetMethodAnalysis(Fecha_Inicio, Fecha_Final).subscribe(s =>{
        let _json = JSON.parse(s);
  
        if(_json["esError"] == 0)
        {
          _json["d"].forEach((d : IMethodAnalysis) => {
            ELEMENT_DATA_OPERATION_MATIX_DATA.push(d);
          });
  
          this.dataSource.data = ELEMENT_DATA_OPERATION_MATIX_DATA;
  
        }
        else
        {
          this.dialog.open(DialogoComponent, {
            data : _json["msj"]
          })
        }
  
      });
    }
  

  Cerrar() : void
  {
    this._OperacionesService.change.emit(["Close", null] );
  }

  Limpiar() : void
  {
    this.val.ValForm.reset();
  }


  ngOnInit(): void {
    
  }

}
