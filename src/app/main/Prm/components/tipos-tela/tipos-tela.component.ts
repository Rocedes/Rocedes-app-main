import { LiveAnnouncer} from '@angular/cdk/a11y';
import { MatSort, Sort} from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { ConfirmarEliminarComponent } from 'src/app/main/shared/dialogo/confirmar-eliminar/confirmar-eliminar.component';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { OperacionesService } from 'src/app/main/Prm/service/operaciones.service';
import { ITela } from '../../interface/i-Tela';


let ELEMENT_DATA_TELA : ITela[] = [];

@Component({
  selector: 'app-tipos-tela',
  templateUrl: './tipos-tela.component.html',
  styleUrls: ['./tipos-tela.component.css']
})
export class TiposTelaComponent implements OnInit {

  public val = new Validacion();
  
  public Open : boolean = false;
  public Link : string = "";


  public Editar : boolean = false;
  private Id : number = -1;
  private _RowDato !: ITela;


  displayedColumns: string[] = ["IdTela", "Nombre", "Code",  "Editar", "Eliminar"];
  dataSource = new MatTableDataSource(ELEMENT_DATA_TELA);
  clickedRows = new Set<ITela>();

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
    this.val.add("txt_operacion_tela", "1", "LEN>", "0");
    this.val.add("txt_operacion_tela_code", "1", "LEN>", "0");
    this.val.add("txt_operacion_tela_code", "2", "LEN==", "3");
  }


  Limpiar(): void
  {
    this.Id = -1;
    this.Editar = false;
    this.val.ValForm.reset();

    this.val.ValForm.get("txt_operacion_tela")?.disable();
    this.val.ValForm.get("txt_operacion_tela_code")?.disable();
    document?.getElementById("divOperacion-frm-tela-registros")?.classList.remove("disabled");
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


    this.Guardar();

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
      this.Id = row.IdTela;
      this.val.ValForm.get("txt_operacion_tela")?.setValue(row.Nombre);
      this.val.ValForm.get("txt_operacion_tela_code")?.setValue(row.Code);
      document.getElementById("divOperacion-frm-tela-registros")?.classList.add("disabled");
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
    this._OperacionesService.GuardarTela(this._RowDato).subscribe( s =>{
  
      let _json = JSON.parse(s);
            
      if(_json["esError"] == 0)
      {
        let index : number = ELEMENT_DATA_TELA.findIndex(f =>  Number(f.IdTela) == Number(_json["d"].IdTela));


        if(index >= 0) ELEMENT_DATA_TELA.splice(index, 1);
      }
     

      this.dataSource.data = ELEMENT_DATA_TELA;
      
      this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })
  
    });
  }


  LlenarTabla() :void
  {
    ELEMENT_DATA_TELA.splice(0, ELEMENT_DATA_TELA.length);

    this._OperacionesService.GetTela().subscribe(s =>{
      let _json = JSON.parse(s);

      if(_json["esError"] == 0)
      {
        _json["d"].forEach((d : ITela) => {
          ELEMENT_DATA_TELA.push(d);
        });

        this.dataSource.data = ELEMENT_DATA_TELA;

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
    this.val.ValForm.get("txt_operacion_tela")?.enable();
    this.val.ValForm.get("txt_operacion_tela_code")?.enable();

    document.getElementById("divoperacion-frm-tela-registros")?.focus();
  }

  Guardar() : void
  {
    let datos : ITela = {} as ITela;
    datos.IdTela = this.Id;
    datos.Nombre = String(this.val.ValForm.get("txt_operacion_tela")?.value).trimEnd();
    datos.Code = String(this.val.ValForm.get("txt_operacion_tela_code")?.value).trimEnd();
    datos.Evento = "Nuevo";
    if(this.Id > 0) datos.Evento = "Editar";

    this._OperacionesService.GuardarTela(datos).subscribe( s =>{
  
      let _json = JSON.parse(s);
     let _dialog =  this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })

      _dialog.afterClosed().subscribe(s =>{
        if(_json["esError"] == 0)
        {

          let index : number = ELEMENT_DATA_TELA.findIndex(f =>  Number(f.IdTela) == Number(_json["d"].IdTela));

          if(index >= 0)
          {
            ELEMENT_DATA_TELA[index].Nombre = _json["d"].Nombre;
            ELEMENT_DATA_TELA[index].Code = _json["d"].Code;
          }
          else
          {
            ELEMENT_DATA_TELA.push(_json["d"]);
          }
          this.dataSource.data = ELEMENT_DATA_TELA;
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

