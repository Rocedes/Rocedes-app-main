import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { OperacionesService } from 'src/app/main/Prm/service/operaciones.service';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { ConfirmarEliminarComponent } from 'src/app/main/shared/dialogo/confirmar-eliminar/confirmar-eliminar.component';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { IManufacturing } from '../../../../interface/i-Manufacturing'

let ELEMENT_DATA_MANUFACTURING : IManufacturing[] = [];
@Component({
  selector: 'app-manufacturing',
  templateUrl: './manufacturing.component.html',
  styleUrls: ['./manufacturing.component.css']
})
export class ManufacturingComponent implements OnInit {
  public val = new Validacion();
  
  public Open : boolean = false;
  public Link : string = "";


  public Editar : boolean = false;
  private Id : number = -1;
  private _RowDato !: IManufacturing;


  displayedColumns: string[] = ["IdManufacturing", "Name", "Code",  "Editar", "Eliminar"];
  dataSource = new MatTableDataSource(ELEMENT_DATA_MANUFACTURING);
  clickedRows = new Set<IManufacturing>();

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






  constructor(private _liveAnnouncer: LiveAnnouncer, private dialog : MatDialog, private _OperacionesService : OperacionesService) { 
    this.val.add("txt_Operacion_manufacturing", "1", "LEN>", "0");
    this.val.add("txt_Operacion_manufacturing_code", "1", "LEN>", "0");
    this.val.add("txt_Operacion_manufacturing_code", "2", "LEN==", "3");
   
  }


  Limpiar(): void
  {
    this.Id = -1;
    this.Editar = false;
    this.val.ValForm.reset();

    this.val.ValForm.get("txt_Operacion_manufacturing")?.disable();
    this.val.ValForm.get("txt_Operacion_manufacturing_code")?.disable();

    document?.getElementById("divOperacion-frm-manufacturing-registros")?.classList.remove("disabled");
  }


  Cerrar() :void
  {

    this.Limpiar();
    this.Link = "";
    this.Open = false;
  }


  onKeyEnter(event: any) : void
  {
    let _input : string = event.target.id;
    

    if(event.target.value == "") {
      document?.getElementById(_input)?.focus();
      event.preventDefault();
      return;
    }


    switch(_input){

      case "txt_Operacion_manufacturing":
        document?.getElementById("txt_Operacion_manufacturing_code")?.focus();
        break;

      case "txt_Operacion_manufacturing_code":
        this.Guardar();
        break;
    }

  }




   //#region EVENTOS TABLA


   annCaliberSort(sortState: Sort) {
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

  
  clickRow(row : any, str_Evento : string){

    if(str_Evento == "Editar")
    {
      this.Nuevo();
      this.Id = row.IdManufacturing;
      this.val.ValForm.get("txt_Operacion_manufacturing")?.setValue(row.Name);
      this.val.ValForm.get("txt_Operacion_manufacturing_code")?.setValue(row.Code);
      document.getElementById("divOperacion-frm-manufacturing-registros")?.classList.add("disabled");
    }
    else
    {
      let _dialog = this.dialog.open(ConfirmarEliminarComponent)
      document.getElementById("body")?.classList.add("disabled");

      _dialog.afterClosed().subscribe( s =>{
        document?.getElementById("body")?.classList.remove("disabled");
        if(_dialog.componentInstance.Retorno == "1")
        {
          this._RowDato = row;
          this.Eliminar();
        }
      });
    }
   

  }


  Eliminar() : void
  {
    this._RowDato.Evento = "Eliminar";
    this._OperacionesService.GuardarManufacturing(this._RowDato).subscribe( s =>{
  
      let _json = JSON.parse(s);
            
      if(_json["esError"] == 0)
      {
        let index : number = ELEMENT_DATA_MANUFACTURING.findIndex(f =>  Number(f.IdManufacturing) == Number(_json["d"].IdManufacturing));


        if(index >= 0) ELEMENT_DATA_MANUFACTURING.splice(index, 1);
      }
     

      this.dataSource.data = ELEMENT_DATA_MANUFACTURING;
      
      this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })
  
    });
  }


  LlenarTabla() :void
  {
    ELEMENT_DATA_MANUFACTURING.splice(0, ELEMENT_DATA_MANUFACTURING.length);

    this._OperacionesService.GetManufacturing().subscribe(s =>{
      let _json = JSON.parse(s);

      if(_json["esError"] == 0)
      {
        _json["d"].forEach((d : IManufacturing) => {
          ELEMENT_DATA_MANUFACTURING.push(d);
        });

        this.dataSource.data = ELEMENT_DATA_MANUFACTURING;

      }
      else
      {
        this.dialog.open(DialogoComponent, {
          data : _json["msj"]
        })
      }

    });
  }

  
    //#endregion EVENTOS TABLA


  Nuevo() :void
  {
    this.Id = -1;
    this.Editar = true;
    this.val.ValForm.get("txt_Operacion_manufacturing")?.enable();
    this.val.ValForm.get("txt_Operacion_manufacturing_code")?.enable();

    document.getElementById("txt_Operacion_manufacturing")?.focus();
  }

  Guardar() : void
  {
    let datos : IManufacturing = {} as IManufacturing;
    datos.IdManufacturing = this.Id;
    datos.Name = String(this.val.ValForm.get("txt_Operacion_manufacturing")?.value).trimEnd()
    datos.Code = String(this.val.ValForm.get("txt_Operacion_manufacturing_code")?.value).trimEnd();
    datos.Evento = "Nuevo";
    if(this.Id > 0) datos.Evento = "Editar";

    this._OperacionesService.GuardarManufacturing(datos).subscribe( s =>{
  
      let _json = JSON.parse(s);
     let _dialog =  this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })

      _dialog.afterClosed().subscribe(s =>{
        if(_json["esError"] == 0)
        {

          let index : number = ELEMENT_DATA_MANUFACTURING.findIndex(f =>  Number(f.IdManufacturing) == Number(_json["d"].IdManufacturing));

          if(index >= 0)
          {
            ELEMENT_DATA_MANUFACTURING[index].IdManufacturing = _json["d"].IdManufacturing;
            ELEMENT_DATA_MANUFACTURING[index].Name = _json["d"].Name;
            ELEMENT_DATA_MANUFACTURING[index].Code = _json["d"].Code;
          }
          else
          {
            ELEMENT_DATA_MANUFACTURING.push(_json["d"]);
          }
          this.dataSource.data = ELEMENT_DATA_MANUFACTURING;
          this.Limpiar();
         
        }
      });

  
    });


  }


  ngOnInit(): void {
    this.Limpiar();
    this.LlenarTabla();
  }
}

