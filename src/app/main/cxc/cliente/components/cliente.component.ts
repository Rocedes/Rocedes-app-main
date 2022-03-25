import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { ClienteService } from 'src/app/main/cxc/cliente/service/cliente.service';
import { ICliente } from '../interface/i-Cliente';

let ELEMENT_DATA_CLIENTE : ICliente[] = [];

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent implements OnInit {
 
  public val = new Validacion();
  
  public Open : boolean = false;
  public Link : string = "";


  public Editar : boolean = false;
  public disabled : boolean = false;
  public Estado : boolean = true;
  private Id : number = -1;


  displayedColumns: string[] = ["IdCliente", "Cliente", "Estado",  "Editar"];
  dataSource = new MatTableDataSource(ELEMENT_DATA_CLIENTE);
  clickedRows = new Set<ICliente>();

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






  constructor(private _liveAnnouncer: LiveAnnouncer, private dialog : MatDialog, private _ClienteService : ClienteService) { 
    this.val.add("txt_cxc_cliente", "1", "LEN>", "0");
    this.val.add("checkBox_cxc_Cliente_Estado", "1", "LEN>", "0");
  }

  CheckChange() {
    if(this.disabled) return;
    this.Estado = !this.Estado;
  }


  Limpiar(): void
  {
    this.Id = -1;
    this.Estado = false;
    this.Editar = false;
    this.disabled = true;
    this.val.ValForm.reset();

    this.val.ValForm.get("txt_cxc_cliente")?.disable();
    document?.getElementById("divOperacion-frm-cliente-registros")?.classList.remove("disabled");
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

  
  clickRow(row : any){

    this.Nuevo();
    this.disabled = false;
    this.Id = row.IdCliente;
    this.Estado = row.Estado;
    this.val.ValForm.get("txt_cxc_cliente")?.setValue(row.Cliente);
    document.getElementById("divOperacion-frm-cliente-registros")?.classList.add("disabled");
   

  }


  LlenarTabla() :void
  {
    ELEMENT_DATA_CLIENTE.splice(0, ELEMENT_DATA_CLIENTE.length);

    this._ClienteService.Get().subscribe(s =>{
      let _json = JSON.parse(s);

      if(_json["esError"] == 0)
      {
        _json["d"].forEach((d : ICliente) => {
          ELEMENT_DATA_CLIENTE.push(d);
        });

        this.dataSource.data = ELEMENT_DATA_CLIENTE;

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
    this.Estado = true;
    this.val.ValForm.get("txt_cxc_cliente")?.enable();
    this.val.ValForm.get("checkBox_cxc_Cliente_Estado")?.enable();

    document.getElementById("txt_cxc_cliente")?.focus();
  }

  Guardar() : void
  {
    let datos : ICliente = {} as ICliente;
    datos.IdCliente = this.Id;
    datos.Cliente = String(this.val.ValForm.get("txt_cxc_cliente")?.value).trimEnd();
    datos.Estado = this.Estado;

    this._ClienteService.Guardar(datos).subscribe( s =>{
  
      let _json = JSON.parse(s);
     let _dialog =  this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })

      _dialog.afterClosed().subscribe(s =>{
        if(_json["esError"] == 0)
        {

          let index : number = ELEMENT_DATA_CLIENTE.findIndex(f =>  Number(f.IdCliente) == Number(_json["d"].IdCliente));

          if(index >= 0)
          {
            ELEMENT_DATA_CLIENTE[index].Cliente = _json["d"].Cliente;
            ELEMENT_DATA_CLIENTE[index].Estado = _json["d"].Estado;
          }
          else
          {
            ELEMENT_DATA_CLIENTE.push(_json["d"]);
          }
          this.dataSource.data = ELEMENT_DATA_CLIENTE;
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

