import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ISecuence } from 'src/app/main/Prm/interface/i-Secuence';
import { OperacionesService } from 'src/app/main/Prm/service/operaciones.service';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { ConfirmarEliminarComponent } from 'src/app/main/shared/dialogo/confirmar-eliminar/confirmar-eliminar.component';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';


let ELEMENT_DATA_SECUENCE : ISecuence[] = [];

@Component({
  selector: 'app-secuence',
  templateUrl: './secuence.component.html',
  styleUrls: ['./secuence.component.css']
})
export class SecuenceComponent implements OnInit {
  public val = new Validacion();
  
  public Open : boolean = false;
  public Link : string = "";


  public Editar : boolean = false;
  private Id : number = -1;
  private _RowDato !: ISecuence;


  displayedColumns: string[] = ["IdSecuence", "Secuence",  "Code", "Editar", "Eliminar"];
  dataSource = new MatTableDataSource(ELEMENT_DATA_SECUENCE);
  clickedRows = new Set<ISecuence>();

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
    this.val.add("txt_operacion_secuence_code", "1", "LEN>", "0");
    this.val.add("txt_operacion_secuence_code", "2", "LEN==", "3");
    this.val.add("txt_operacion_secuence", "1", "LEN>", "0");
    this.val.add("txt_operacion_secuence", "2", "NUM>=", "0");
    
  }


  Limpiar(): void
  {
    this.Id = -1;
    this.Editar = false;
    this.val.ValForm.reset();

    this.val.ValForm.get("txt_operacion_secuence_code")?.disable();
    this.val.ValForm.get("txt_operacion_secuence")?.disable();
    document?.getElementById("divOperacion-frm-secuence-registros")?.classList.remove("disabled");
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

      case "txt_operacion_secuence":
        document?.getElementById("txt_operacion_secuence_code")?.focus();
        break;
    

      case "txt_operacion_secuence_code":
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
      this.Id = row.IdSecuence;
      this.val.ValForm.get("txt_operacion_secuence_code")?.setValue(row.Code);
      this.val.ValForm.get("txt_operacion_secuence")?.setValue(row.Secuence);
      document.getElementById("divOperacion-frm-secuence-registros")?.classList.add("disabled");
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
    this._OperacionesService.GuardarSecuence(this._RowDato).subscribe( s =>{
  
      let _json = JSON.parse(s);
            
      if(_json["esError"] == 0)
      {
        let index : number = ELEMENT_DATA_SECUENCE.findIndex(f =>  Number(f.IdSecuence) == Number(_json["d"].IdSecuence));


        if(index >= 0) ELEMENT_DATA_SECUENCE.splice(index, 1);
      }
     

      this.dataSource.data = ELEMENT_DATA_SECUENCE;
      
      this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })
  
    });
  }


  LlenarTabla() :void
  {
    ELEMENT_DATA_SECUENCE.splice(0, ELEMENT_DATA_SECUENCE.length);

    this._OperacionesService.GetSecuence(-1).subscribe(s =>{
      let _json = JSON.parse(s);

      if(_json["esError"] == 0)
      {
        _json["d"].forEach((d : ISecuence) => {
          ELEMENT_DATA_SECUENCE.push(d);
        });

        this.dataSource.data = ELEMENT_DATA_SECUENCE;

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
    this.val.ValForm.get("txt_operacion_secuence_code")?.enable();
    this.val.ValForm.get("txt_operacion_secuence")?.enable();

    document.getElementById("txt_operacion_secuence")?.focus();
  }

  Guardar() : void
  {
    let datos : ISecuence = {} as ISecuence;
    datos.IdSecuence = this.Id;
    datos.Code = String(this.val.ValForm.get("txt_operacion_secuence_code")?.value).trimEnd();
    datos.Secuence = Number(this.val.ValForm.get("txt_operacion_secuence")?.value);
    datos.Evento = "Nuevo";
    if(this.Id > 0) datos.Evento = "Editar";

    this._OperacionesService.GuardarSecuence(datos).subscribe( s =>{
  
      let _json = JSON.parse(s);
     let _dialog =  this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })

      _dialog.afterClosed().subscribe(s =>{
        if(_json["esError"] == 0)
        {

          let index : number = ELEMENT_DATA_SECUENCE.findIndex(f =>  Number(f.IdSecuence) == Number(_json["d"].IdSecuence));

          if(index >= 0)
          {
            ELEMENT_DATA_SECUENCE[index].IdSecuence = _json["d"].IdSecuence;
            ELEMENT_DATA_SECUENCE[index].Secuence = _json["d"].Secuence;
            ELEMENT_DATA_SECUENCE[index].Code = _json["d"].Code;
          }
          else
          {
            ELEMENT_DATA_SECUENCE.push(_json["d"]);
          }
          this.dataSource.data = ELEMENT_DATA_SECUENCE;
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
