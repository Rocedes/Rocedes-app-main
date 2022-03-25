import { LiveAnnouncer} from '@angular/cdk/a11y';
import { MatSort, Sort} from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ICodigoGSD } from 'src/app/main/Prm/interface/i-Codigo-GSD';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { ConfirmarEliminarComponent } from 'src/app/main/shared/dialogo/confirmar-eliminar/confirmar-eliminar.component';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { OperacionesService } from 'src/app/main/Prm/service/operaciones.service';



let ELEMENT_DATA_CODIGO_GSD : ICodigoGSD[] = [];
@Component({
  selector: 'app-codigo-gsd',
  templateUrl: './codigo-gsd.component.html',
  styleUrls: ['./codigo-gsd.component.css']
})
export class CodigoGsdComponent implements OnInit {

  public val = new Validacion();
  
  public Open : boolean = false;
  public Link : string = "";


  public Editar : boolean = false;
  private Id : number = -1;
  private _RowDato !: ICodigoGSD;


  displayedColumns: string[] = ["IdCodGSD", "CodigoGSD",   "Tmus", "Editar", "Eliminar"];
  dataSource = new MatTableDataSource(ELEMENT_DATA_CODIGO_GSD);
  clickedRows = new Set<ICodigoGSD>();

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
    this.val.add("txt_operacion_codigo_gsd", "1", "LEN>", "0");
    this.val.add("txt_operacion_tmu", "1", "LEN>", "0");
    this.val.add("txt_operacion_tmu", "2", "NUM>", "0");
  }


  Limpiar(): void
  {
    this.Id = -1;
    this.Editar = false;
    this.val.ValForm.reset();

    this.val.ValForm.get("txt_operacion_codigo_gsd")?.disable();
    this.val.ValForm.get("txt_operacion_tmu")?.disable();
    document?.getElementById("divOperacion-frm-codigo-gsd-registros")?.classList.remove("disabled");
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

      case "txt_operacion_codigo_gsd":
        document?.getElementById("txt_operacion_tmu")?.focus();
        break;

      case "txt_operacion_tmu":
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
      this.Id = row.IdCodGSD;
      this.val.ValForm.get("txt_operacion_codigo_gsd")?.setValue(row.CodigoGSD);
      this.val.ValForm.get("txt_operacion_tmu")?.setValue(row.Tmus);
      document.getElementById("divOperacion-frm-codigo-gsd-registros")?.classList.add("disabled");
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
    this._OperacionesService.GuardarCodigoGSD(this._RowDato).subscribe( s =>{
  
      let _json = JSON.parse(s);
            
      if(_json["esError"] == 0)
      {
        let index : number = ELEMENT_DATA_CODIGO_GSD.findIndex(f =>  Number(f.IdCodGSD) == Number(_json["d"].IdCodGSD));


        if(index >= 0) ELEMENT_DATA_CODIGO_GSD.splice(index, 1);
      }
     

      this.dataSource.data = ELEMENT_DATA_CODIGO_GSD;
      
      this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })
  
    });
  }


  LlenarTabla() :void
  {
    ELEMENT_DATA_CODIGO_GSD.splice(0, ELEMENT_DATA_CODIGO_GSD.length);

    this._OperacionesService.GetCodigoGSD("").subscribe(s =>{
      let _json = JSON.parse(s);

      if(_json["esError"] == 0)
      {
        _json["d"].forEach((d : ICodigoGSD) => {
          ELEMENT_DATA_CODIGO_GSD.push(d);
        });

        this.dataSource.data = ELEMENT_DATA_CODIGO_GSD;

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
    this.val.ValForm.get("txt_operacion_codigo_gsd")?.enable();
    this.val.ValForm.get("txt_operacion_tmu")?.enable();

    document.getElementById("txt_operacion_codigo_gsd")?.focus();
  }

  Guardar() : void
  {
    let datos : ICodigoGSD = {} as ICodigoGSD;
    datos.IdCodGSD = this.Id;
    datos.CodigoGSD = String(this.val.ValForm.get("txt_operacion_codigo_gsd")?.value).trimEnd();
    datos.Tmus = Number(this.val.ValForm.get("txt_operacion_tmu")?.value);
    datos.Evento = "Nuevo";
    if(this.Id > 0) datos.Evento = "Editar";

    this._OperacionesService.GuardarCodigoGSD(datos).subscribe( s =>{
  
      let _json = JSON.parse(s);
     let _dialog =  this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })

      _dialog.afterClosed().subscribe(s =>{
        if(_json["esError"] == 0)
        {

          let index : number = ELEMENT_DATA_CODIGO_GSD.findIndex(f =>  Number(f.IdCodGSD) == Number(_json["d"].IdCodGSD));

          if(index >= 0)
          {
            ELEMENT_DATA_CODIGO_GSD[index].CodigoGSD = _json["d"].CodigoGSD;
            ELEMENT_DATA_CODIGO_GSD[index].Tmus = _json["d"].Tmus;
          }
          else
          {
            ELEMENT_DATA_CODIGO_GSD.push(_json["d"]);
          }
          this.dataSource.data = ELEMENT_DATA_CODIGO_GSD;
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
