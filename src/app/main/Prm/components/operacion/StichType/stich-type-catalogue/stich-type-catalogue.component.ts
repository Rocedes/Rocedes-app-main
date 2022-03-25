import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IStitchType } from 'src/app/main/Prm/interface/i-Stitch-Type';
import { OperacionesService } from 'src/app/main/Prm/service/operaciones.service';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { ConfirmarEliminarComponent } from 'src/app/main/shared/dialogo/confirmar-eliminar/confirmar-eliminar.component';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';


let ELEMENT_DATA_STITCH_TYPE : IStitchType[] = [];
@Component({
  selector: 'app-stich-type-catalogue',
  templateUrl: './stich-type-catalogue.component.html',
  styleUrls: ['./stich-type-catalogue.component.css']
})
export class StichTypeCatalogueComponent implements OnInit {

  public val = new Validacion();
  
  public Open : boolean = false;
  public Link : string = "";


  public Editar : boolean = false;
  private Id : number = -1;
  private _RowDato !: IStitchType;


  displayedColumns: string[] = ["IdStitchType", "TypeStitch",  "Code", "Editar", "Eliminar"];
  dataSource = new MatTableDataSource(ELEMENT_DATA_STITCH_TYPE);
  clickedRows = new Set<IStitchType>();

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
    this.val.add("txt_operacion_stitch_type_code", "1", "LEN>", "0");
    this.val.add("txt_operacion_stitch_type_code", "2", "LEN==", "3");
    this.val.add("txt_operacion_stitch_type", "1", "LEN>", "0");
    this.val.add("txt_operacion_stitch_type", "2", "LEN<=", "10");
  }


  Limpiar(): void
  {
    this.Id = -1;
    this.Editar = false;
    this.val.ValForm.reset();

    this.val.ValForm.get("txt_operacion_stitch_type_code")?.disable();
    this.val.ValForm.get("txt_operacion_stitch_type")?.disable();
    document?.getElementById("divOperacion-frm-stitch-type-registros")?.classList.remove("disabled");
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

      case "txt_operacion_stitch_type":
        document?.getElementById("txt_operacion_stitch_type_code")?.focus();
        break;
    

      case "txt_operacion_stitch_type_code":
        this.Guardar();
        break;
    }

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

  
  clickRow(row : any, str_Evento : string){

    if(str_Evento == "Editar")
    {
      this.Nuevo();
      this.Id = row.IdStitchType;
      this.val.ValForm.get("txt_operacion_stitch_type_code")?.setValue(row.Code);
      this.val.ValForm.get("txt_operacion_stitch_type")?.setValue(row.TypeStitch);
      document.getElementById("divOperacion-frm-stitch-type-registros")?.classList.add("disabled");
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
    this._OperacionesService.GuardarStitchType(this._RowDato).subscribe( s =>{
  
      let _json = JSON.parse(s);
            
      if(_json["esError"] == 0)
      {
        let index : number = ELEMENT_DATA_STITCH_TYPE.findIndex(f =>  Number(f.IdStitchType) == Number(_json["d"].IdStitchType));


        if(index >= 0) ELEMENT_DATA_STITCH_TYPE.splice(index, 1);
      }
     

      this.dataSource.data = ELEMENT_DATA_STITCH_TYPE;
      
      this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })
  
    });
  }


  LlenarTabla() :void
  {
    ELEMENT_DATA_STITCH_TYPE.splice(0, ELEMENT_DATA_STITCH_TYPE.length);

    this._OperacionesService.GetStitchType("").subscribe(s =>{
      let _json = JSON.parse(s);

      if(_json["esError"] == 0)
      {
        _json["d"].forEach((d : IStitchType) => {
          ELEMENT_DATA_STITCH_TYPE.push(d);
        });

        this.dataSource.data = ELEMENT_DATA_STITCH_TYPE;

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
    this.val.ValForm.get("txt_operacion_stitch_type_code")?.enable();
    this.val.ValForm.get("txt_operacion_stitch_type")?.enable();

    document.getElementById("txt_operacion_stitch_type")?.focus();
  }

  Guardar() : void
  {
    let datos : IStitchType = {} as IStitchType;
    datos.IdStitchType = this.Id;
    datos.Code = String(this.val.ValForm.get("txt_operacion_stitch_type_code")?.value).trimEnd();
    datos.TypeStitch = String(this.val.ValForm.get("txt_operacion_stitch_type")?.value).trimEnd();
    datos.Evento = "Nuevo";
    if(this.Id > 0) datos.Evento = "Editar";

    this._OperacionesService.GuardarStitchType(datos).subscribe( s =>{
  
      let _json = JSON.parse(s);
     let _dialog =  this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })

      _dialog.afterClosed().subscribe(s =>{
        if(_json["esError"] == 0)
        {

          let index : number = ELEMENT_DATA_STITCH_TYPE.findIndex(f =>  Number(f.IdStitchType) == Number(_json["d"].IdStitchType));

          if(index >= 0)
          {
            ELEMENT_DATA_STITCH_TYPE[index].IdStitchType = _json["d"].IdStitchType;
            ELEMENT_DATA_STITCH_TYPE[index].TypeStitch = _json["d"].TypeStitch;
            ELEMENT_DATA_STITCH_TYPE[index].Code = _json["d"].Code;
          }
          else
          {
            ELEMENT_DATA_STITCH_TYPE.push(_json["d"]);
          }
          this.dataSource.data = ELEMENT_DATA_STITCH_TYPE;
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

