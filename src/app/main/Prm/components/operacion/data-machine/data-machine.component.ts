import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { ConfirmarEliminarComponent } from 'src/app/main/shared/dialogo/confirmar-eliminar/confirmar-eliminar.component';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { OperacionesService } from 'src/app/main/Prm/service/operaciones.service';
import { IDataMachine } from '../../../interface/i-data-machine';

let ELEMENT_DATA_MACHINE : IDataMachine[] = [];

@Component({
  selector: 'app-data-machine',
  templateUrl: './data-machine.component.html',
  styleUrls: ['./data-machine.component.css']
})
export class DataMachineComponent implements OnInit {

  public val = new Validacion();
  
  public Open : boolean = false;
  public Link : string = "";
  public str_machine_type : string = "";


  public Editar : boolean = false;
  private Id : number = -1;
  private _RowDato !: IDataMachine;


  displayedColumns: string[] = ["IdDataMachine", "Name", "Delay", "Personal", "Fatigue", "Nomenclature", "Machine", "Description", "Ref", "Code",  "Editar", "Eliminar"];
  dataSource = new MatTableDataSource(ELEMENT_DATA_MACHINE);
  clickedRows = new Set<IDataMachine>();

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
    this.val.add("txt_Operacion_data_name", "1", "LEN>", "0");
    this.val.add("txt_Operacion_data_nomenclature", "1", "LEN>", "0");
    this.val.add("txt_Operacion_data_machine_delay", "1", "LEN>", "0");
    this.val.add("txt_Operacion_data_machine_delay", "2", "NUM>=", "0");
    this.val.add("txt_Operacion_data_personal", "1", "LEN>", "0");
    this.val.add("txt_Operacion_data_personal", "2", "NUM>=", "0");
    this.val.add("txt_Operacion_data_fatigue", "1", "LEN>", "0");
    this.val.add("txt_Operacion_data_fatigue", "2", "NUM>=", "0");
    this.val.add("txt_Operacion_data_machine", "1", "LEN>=", "0");
    this.val.add("txt_Operacion_data_description", "1", "LEN>=", "0");
    this.val.add("txt_Operacion_data_ref", "1", "LEN>", "0");
    this.val.add("txt_Operacion_data_code", "1", "LEN>", "0");
    this.val.add("txt_Operacion_data_code", "2", "LEN==", "3");
   
    
  }


  Limpiar(): void
  {
    this.Id = -1;
    this.Editar = false;
    this.str_machine_type = "";
    this.val.ValForm.reset();

    this.val.ValForm.get("txt_Operacion_data_name")?.disable();
    this.val.ValForm.get("txt_Operacion_data_nomenclature")?.disable();
    this.val.ValForm.get("txt_Operacion_data_machine_delay")?.disable();
    this.val.ValForm.get("txt_Operacion_data_personal")?.disable();
    this.val.ValForm.get("txt_Operacion_data_fatigue")?.disable();
    this.val.ValForm.get("txt_Operacion_data_machine")?.disable();
    this.val.ValForm.get("txt_Operacion_data_description")?.disable();
    this.val.ValForm.get("txt_Operacion_data_ref")?.disable();
    this.val.ValForm.get("txt_Operacion_data_code")?.disable();
    document?.getElementById("divOperacion-frm-data-machine-registros")?.classList.remove("disabled");
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

      case "txt_Operacion_data_name":
        document?.getElementById("txt_Operacion_data_nomenclature")?.focus();
        break;


      case "txt_Operacion_data_nomenclature":
        document?.getElementById("txt_Operacion_data_machine_delay")?.focus();
        break;

      case "txt_Operacion_data_machine_delay":
        document?.getElementById("txt_Operacion_data_personal")?.focus();
        break;

      case "txt_Operacion_data_personal":
        document?.getElementById("txt_Operacion_data_fatigue")?.focus();
        break;

      case "txt_Operacion_data_fatigue":
        document?.getElementById("txt_Operacion_data_machine")?.focus();
        break;

      case "txt_Operacion_data_machine":
        document?.getElementById("txt_Operacion_data_description")?.focus();
        break;

      case "txt_Operacion_data_description":
        document?.getElementById("txt_Operacion_data_ref")?.focus();
        break;

      case "txt_Operacion_data_ref":
        document?.getElementById("txt_Operacion_data_code")?.focus();
        break;


      case "txt_Operacion_data_code":
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

  
  clickRow(row : IDataMachine, str_Evento : string){

    if(str_Evento == "Editar")
    {
      this.Nuevo();
      this.Id = row.IdDataMachine;
      this.str_machine_type = row.Machine;

      this.val.ValForm.get("txt_Operacion_data_name")?.setValue(row.Name);
      this.val.ValForm.get("txt_Operacion_data_nomenclature")?.setValue(row.Nomenclature);
      this.val.ValForm.get("txt_Operacion_data_machine_delay")?.setValue(row.Delay);
      this.val.ValForm.get("txt_Operacion_data_personal")?.setValue(row.Personal);
      this.val.ValForm.get("txt_Operacion_data_fatigue")?.setValue(row.Fatigue);
      this.val.ValForm.get("txt_Operacion_data_machine")?.setValue(row.Machine);
      this.val.ValForm.get("txt_Operacion_data_description")?.setValue(row.Description);
      this.val.ValForm.get("txt_Operacion_data_ref")?.setValue(row.Ref);
      this.val.ValForm.get("txt_Operacion_data_code")?.setValue(row.Code);
      document.getElementById("divOperacion-frm-data-machine-registros")?.classList.add("disabled");
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
    this._OperacionesService.GuardarDataMachine(this._RowDato).subscribe( s =>{
  
      let _json = JSON.parse(s);
            
      if(_json["esError"] == 0)
      {
        let index : number = ELEMENT_DATA_MACHINE.findIndex(f =>  Number(f.IdDataMachine) == Number(_json["d"].IdDataMachine));


        if(index >= 0) ELEMENT_DATA_MACHINE.splice(index, 1);
      }
     

      this.dataSource.data = ELEMENT_DATA_MACHINE;
      
      this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })
  
    });
  }


  LlenarTabla() :void
  {
    ELEMENT_DATA_MACHINE.splice(0, ELEMENT_DATA_MACHINE.length);

    this._OperacionesService.GetDataMachine().subscribe(s =>{
      let _json = JSON.parse(s);

      if(_json["esError"] == 0)
      {
        _json["d"].forEach((d : IDataMachine) => {
          ELEMENT_DATA_MACHINE.push(d);
        });

        this.dataSource.data = ELEMENT_DATA_MACHINE;

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
    this.str_machine_type = "";
    this.val.ValForm.get("txt_Operacion_data_name")?.enable();
    this.val.ValForm.get("txt_Operacion_data_nomenclature")?.enable();
    this.val.ValForm.get("txt_Operacion_data_machine_delay")?.enable();
    this.val.ValForm.get("txt_Operacion_data_personal")?.enable();
    this.val.ValForm.get("txt_Operacion_data_fatigue")?.enable();
    this.val.ValForm.get("txt_Operacion_data_machine")?.enable();
    this.val.ValForm.get("txt_Operacion_data_description")?.enable();
    this.val.ValForm.get("txt_Operacion_data_ref")?.enable();
    this.val.ValForm.get("txt_Operacion_data_code")?.enable();
 

    document.getElementById("txt_Operacion_data_name")?.focus();
  }

  Guardar() : void
  {
    let datos : IDataMachine = {} as IDataMachine;
    datos.IdDataMachine = this.Id;
    datos.Name = String(this.val.ValForm.get("txt_Operacion_data_name")?.value).trimEnd();
    datos.Nomenclature = String(this.val.ValForm.get("txt_Operacion_data_nomenclature")?.value).trimEnd();
    datos.Delay = Number(this.val.ValForm.get("txt_Operacion_data_machine_delay")?.value);
    datos.Personal = Number(this.val.ValForm.get("txt_Operacion_data_personal")?.value);
    datos.Fatigue = Number(this.val.ValForm.get("txt_Operacion_data_fatigue")?.value);
    datos.Machine = this.str_machine_type;
    datos.Description = String(this.val.ValForm.get("txt_Operacion_data_description")?.value).trimEnd();
    datos.Ref = String(this.val.ValForm.get("txt_Operacion_data_ref")?.value).trimEnd();
    datos.Code = String(this.val.ValForm.get("txt_Operacion_data_code")?.value).trimEnd();

    datos.Evento = "Nuevo";
    if(this.Id > 0) datos.Evento = "Editar";

    this._OperacionesService.GuardarDataMachine(datos).subscribe( s =>{
  
      let _json = JSON.parse(s);
     let _dialog =  this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })

      _dialog.afterClosed().subscribe(s =>{
        if(_json["esError"] == 0)
        {

          let index : number = ELEMENT_DATA_MACHINE.findIndex(f =>  Number(f.IdDataMachine) == Number(_json["d"].IdDataMachine));

          if(index >= 0)
          {
            ELEMENT_DATA_MACHINE[index].IdDataMachine = _json["d"].IdDataMachine;
            ELEMENT_DATA_MACHINE[index].Name = _json["d"].Name;
            ELEMENT_DATA_MACHINE[index].Nomenclature = _json["d"].Nomenclature;
            ELEMENT_DATA_MACHINE[index].Delay = _json["d"].Delay;
            ELEMENT_DATA_MACHINE[index].Personal = _json["d"].Personal;
            ELEMENT_DATA_MACHINE[index].Fatigue = _json["d"].Fatigue;
            ELEMENT_DATA_MACHINE[index].Machine = _json["d"].Machine;
            ELEMENT_DATA_MACHINE[index].Description = _json["d"].Description;
            ELEMENT_DATA_MACHINE[index].Ref = _json["d"].Ref;
            ELEMENT_DATA_MACHINE[index].Code = _json["d"].Code;
          }
          else
          {
            ELEMENT_DATA_MACHINE.push(_json["d"]);
          }
          this.dataSource.data = ELEMENT_DATA_MACHINE;
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

