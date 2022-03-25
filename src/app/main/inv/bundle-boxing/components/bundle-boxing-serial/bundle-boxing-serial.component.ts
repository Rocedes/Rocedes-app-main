import { LiveAnnouncer } from '@angular/cdk/a11y';
import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ClsSerialBoxing } from 'src/app/main/inv/bundle-boxing/class/Cls-Serial-Boxing';
import { IBoginxSerial } from 'src/app/main/inv/bundle-boxing/interface/IBoxingSerial';
import { IReporte } from 'src/app/main/shared/class/Form/Reporte/i-Reporte';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { ReportViewerService } from 'src/app/main/shared/report-viewer/report-viewer.service';
import { ToastService } from 'src/app/main/shared/toast/toast.service';
import { BundleBoxingSerialService } from 'src/app/main/inv/bundle-boxing/service/bundle-boxing-serial.service';
import { InventarioService } from 'src/app/main/inv/service/inventario.service';
import { LoginService } from 'src/app/main/sis/service/login.service';
import { ConfirmarContinuarComponent } from 'src/app/main/shared/dialogo/confirmar-continuar/confirmar-continuar.component';


let ELEMENT_DATA_SERIAL : IBoginxSerial[] = [];


@Component({
  selector: 'app-bundle-boxing-serial',
  templateUrl: './bundle-boxing-serial.component.html',
  styleUrls: ['./bundle-boxing-serial.component.css']
})
export class BundleBoxingSerialComponent implements OnInit {


  str_from : string = "";
  str_Serial : string = "";
  dialogConfirmar!: MatDialogRef<BundleBoxingSerialComponent>;
  bol_OpenDialog : boolean = false;
  _Respuesta : any = null;


  displayedColumns: string[] = ['IdSerialComplemento', 'Serial',  'Pieza', 'PresentacionSerial', "Material", "Cantidad", "Capaje", "EnSaco", "Usuario", "FechaRegistro", "Corte", "Estilo", "Activo", "Imprimir", "Eliminar"];
  dataSourceSerial = new MatTableDataSource(ELEMENT_DATA_SERIAL);
  clickedRows = new Set<IBoginxSerial>();

 
  @ViewChild(MatPaginator, {static: false})
  set paginator(value: MatPaginator) {
    if (this.dataSourceSerial){
      this.dataSourceSerial.paginator = value;
      if(this.dataSourceSerial.paginator != null)this.dataSourceSerial.paginator._intl.getRangeLabel = this.getRangeDisplayText;
    }
  }
  @ViewChild(MatSort, {static: false})
  set sort(sort: MatSort) {
     this.dataSourceSerial.sort = sort;
  }


  constructor(private LoginService : LoginService, public dialog: MatDialog, private _liveAnnouncer: LiveAnnouncer
    , private BundleBoxingSerialService : BundleBoxingSerialService, public datepipe: DatePipe, public toastService: ToastService, private ReportViewerService : ReportViewerService
    ) {
      this.Limpiar();
     }




  LLenarTabla() : void
  {
    this.ReportViewerService.change.emit(["Limpiar", ""])
    this.dataSourceSerial.data.splice(0, this.dataSourceSerial.data.length);

    this.BundleBoxingSerialService.Get().subscribe( s =>{

      let _json = JSON.parse(s);

  
      if(_json["esError"] == 0)
      {
        if(_json["count"] > 0)
        {
          _json["d"].forEach((j : IBoginxSerial) => {
            this.dataSourceSerial.data.push(j);
          });
        }
      }
      else
      {
        this.dialog.open(DialogoComponent, {
          data : _json["msj"]
        })
      }

      this.dataSourceSerial.filter = "";


    });
  }

  Limpiar() : void
  {
    
    document.getElementById("divRegistrosBoginxSeriales")?.classList.remove("disabled");

    this._Respuesta = null;
    this.bol_OpenDialog = false;
    this.str_from = "";
    this.str_Serial = "";
    this.dataSourceSerial.data.splice(0, this.dataSourceSerial.data.length);
    if( this.dialogConfirmar != null)this.dialogConfirmar.close();
    if( this.dialog != null)this.dialog.closeAll();
    this.ReportViewerService.change.emit(["Limpiar", ""]);
 
  }


    //#region EVENTOS TABLA

  
  
  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  filtrar(event: Event) {
    const filtro = (event.target as HTMLInputElement).value;
    this.dataSourceSerial.filter = filtro.trim().toLowerCase();
  }  
 
  Eliminar(row : any) : void
  {
    this.BundleBoxingSerialService.Eliminar(this.str_Serial, this.LoginService.str_user).subscribe( s =>{

      
      let _json = JSON.parse(s);

  
      if(_json["esError"] == 0)
      {
        row.Activo = false;
      }
      else
      {
        this.dialog.open(DialogoComponent, {
          data : _json["msj"]
        })
      }

    });

   
  }

  clickRow(evento : string, row : any){

    if(evento == "Eliminar")
    {

      let _dialog = this.dialog.open(ConfirmarContinuarComponent, { data : "<p>Esta seguro de eliminar?</p><p>Serial: <b>" + row.Serial + "</b></p>" })
      document.getElementById("body")?.classList.add("disabled");

      _dialog.afterClosed().subscribe( s =>{
        document?.getElementById("body")?.classList.remove("disabled");
        if(_dialog.componentInstance.Retorno == "1")
        {
          this.str_Serial = row.Serial;
          this.Eliminar(row);
        }
      });
      
      
    /*this.bol_OpenDialog = true;
    if(this.dialogConfirmar != null) this.dialogConfirmar.close();

    this.dialogConfirmar = this.dialog.open(BundleBoxingSerialComponent, { id: "DialogoConfirmarSerial" });
    this.dialogConfirmar.componentInstance.str_from = "BundleBoxingSerialConfirmar",
    this.dialogConfirmar.componentInstance.str_Serial = row.Serial;

    this.dialogConfirmar.afterOpened().subscribe( s =>{
      document.getElementById("divRegistrosBoginxSeriales")?.classList.add("disabled");
    });
    
    this.dialogConfirmar.beforeClosed().subscribe( s =>{

      document.getElementById("divRegistrosBoginxSeriales")?.classList.remove("disabled");
      if(this.dialogConfirmar.componentInstance._Respuesta != null)
      {
        let _json = this.dialogConfirmar.componentInstance._Respuesta;
        this.toastService.show(_json["msj"]["Mensaje"], { classname: 'bg-Success text-light', delay: 10000 });
        
        if(_json["esError"] == 0) row.Activo = _json["d"].Activo;

      }
      
    });*/

    }


    if(evento == "Imprimir")
    {
      let Serial : ClsSerialBoxing = new ClsSerialBoxing();

      let reporte : IReporte = new IReporte();
    


      Serial.Corte = row.Corte;
      Serial.CorteCompleto = row.CorteCompleto;
      Serial.Estilo = row.Estilo;
      Serial.Pieza = row.Pieza;
      Serial.IdPresentacionSerial = row.IdPresentacionSerial;
      Serial.IdMaterial = row.IdMaterial;
      Serial.Cantidad = row.Cantidad;
      Serial.Capaje = row.Capaje;
      Serial.EnSaco = row.EnSaco;
      Serial.Serial = row.Serial;
      Serial.Login = "";


      reporte.Rdlc = "SerialComponente.rdlc"
      reporte.json = Serial;


    
      this.ReportViewerService.change.emit(["Imprimir", reporte]);
    }

  }



  
  getRangeDisplayText = (page: number, pageSize: number, length: number) => {
    const initialText = `Seriales`;  // customize this line
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
        this.str_from = "BundleBoxingSerial";
        this.LLenarTabla();
  }

}
