import { LiveAnnouncer } from '@angular/cdk/a11y';
import { DatePipe } from '@angular/common';
import { Component, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ClsSacoEstado } from 'src/app/main/inv/bundle-boxing/class/cls-saco-estado';
import { ISaco } from 'src/app/main/inv/bundle-boxing/interface/I-Saco';
import { IBoginxSerial } from 'src/app/main/inv/bundle-boxing/interface/IBoxingSerial';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { ToastService } from 'src/app/main/shared/toast/toast.service';
import { BundleBoxingSacoService } from 'src/app/main/inv/bundle-boxing/service/bundle-boxing-saco.service';
import { InventarioService } from 'src/app/main/inv/service/inventario.service';
import { ReportViewerService } from 'src/app/main/shared/report-viewer/report-viewer.service';
import { LoginService } from 'src/app/main/sis/service/login.service';
import { IReporte } from 'src/app/main/shared/class/Form/Reporte/i-Reporte';
import { ISacoSerial } from 'src/app/main/inv/bundle-boxing/class/i-SacoSerial';
import { ConfirmarContinuarComponent } from 'src/app/main/shared/dialogo/confirmar-continuar/confirmar-continuar.component';



let ELEMENT_DATA_SACO : ISaco[] = [];


@Component({
  selector: 'app-bundle-boxing-saco',
  templateUrl: './bundle-boxing-saco.component.html',
  styleUrls: ['./bundle-boxing-saco.component.css']
})
export class BundleBoxingSacoComponent implements OnInit {

  @Input() public href: string | undefined;
  @HostListener('click', ['$event']) public onClick(event: Event): void {
    if (
      !this.href ||
      this.href == '#' ||
      (this.href && this.href.length === 0)
    ) {
      event.preventDefault();
    }
  }
  

  str_from : string = "";
  str_Serial : string = "";
  dialogConfirmar!: MatDialogRef<BundleBoxingSacoComponent>;
  bol_OpenDialog : boolean = false;
  _Respuesta : any = null;


  displayedColumns: string[] = ['IdSaco', 'Serial',  'Saco', 'NoMesa',  "Usuario", "UsuarioAbre", "FechaRegistro", "Corte", "Activo", "Imprimir", "Eliminar"];
  dataSourceSaco = new MatTableDataSource(ELEMENT_DATA_SACO);
  clickedRows = new Set<IBoginxSerial>();

 
  @ViewChild(MatPaginator, {static: false})
  set paginator(value: MatPaginator) {
    if (this.dataSourceSaco){
      this.dataSourceSaco.paginator = value;
      if(this.dataSourceSaco.paginator != null)this.dataSourceSaco.paginator._intl.getRangeLabel = this.getRangeDisplayText;
    }
  }
  @ViewChild(MatSort, {static: false})
  set sort(sort: MatSort) {
     this.dataSourceSaco.sort = sort;
  }


  constructor(private LoginService : LoginService, public dialog: MatDialog, private _liveAnnouncer: LiveAnnouncer
    ,  public datepipe: DatePipe, public toastService: ToastService, private BundleBoxingSacoService : BundleBoxingSacoService, private ReportViewerService : ReportViewerService
    ) {
      this.Limpiar();
     }




  LLenarTabla() : void
  {
    this.BundleBoxingSacoService.change.emit(["Limpiar", ""])
    
    ELEMENT_DATA_SACO.splice(0, ELEMENT_DATA_SACO.length);
    this.dataSourceSaco.data.splice(0, this.dataSourceSaco.data.length);

    this.BundleBoxingSacoService.Get().subscribe( s =>{

      let _json = JSON.parse(s);

  
      if(_json["esError"] == 0)
      {
        if(_json["count"] > 0)
        {
          _json["d"].forEach((j : ISaco) => {
            this.dataSourceSaco.data.push(j);
          });
        }
      }
      else
      {
        this.dialog.open(DialogoComponent, {
          data : _json["msj"]
        })
      }

      this.dataSourceSaco.filter = "";


    });
  }

  Limpiar() : void
  {
    
    ELEMENT_DATA_SACO.splice(0, ELEMENT_DATA_SACO.length);
    this.dataSourceSaco.data.splice(0, this.dataSourceSaco.data.length);
    document.getElementById("divRegistrosBoginxSaco")?.classList.remove("disabled");

    this._Respuesta = null;
    this.bol_OpenDialog = false;
    this.str_from = "";
    this.str_Serial = "";
    if( this.dialogConfirmar != null)this.dialogConfirmar.close();
    if( this.dialog != null)this.dialog.closeAll();
    this.BundleBoxingSacoService.change.emit(["Limpiar", ""]);
 
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
    this.dataSourceSaco.filter = filtro.trim().toLowerCase();
  }  
 
  Eliminar(row : any) : void
  {
    this.BundleBoxingSacoService.Eliminar(this.str_Serial, this.LoginService.str_user).subscribe( s =>{

      
      let _json = JSON.parse(s);
      if(_json["esError"] == 0)
      {
        row.Activo = false;
        row.Abierto = false;
        row.IdUsuarioAbre = 0;
        row.UsuarioAbre = "";
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

      let _dialog = this.dialog.open(ConfirmarContinuarComponent, { data : "<p>Esta seguro de eliminar?</p><p>saco: <b>" + row.Saco  + "</b><br>Serial: <b>" + row.Serial + "</b></p>" })
      document.getElementById("body")?.classList.add("disabled");

      _dialog.afterClosed().subscribe( s =>{
        document?.getElementById("body")?.classList.remove("disabled");
        if(_dialog.componentInstance.Retorno == "1")
        {
          this.str_Serial = row.Serial;
          this.Eliminar(row);
        }
      });
   /*   
    this.bol_OpenDialog = true;
    if(this.dialogConfirmar != null) this.dialogConfirmar.close();

    this.dialogConfirmar = this.dialog.open(BundleBoxingSacoComponent, { id: "DialogoConfirmarSaco" });
    this.dialogConfirmar.componentInstance.str_from = "BundleBoxingSacoConfirmar",
    this.dialogConfirmar.componentInstance.str_Serial = row.Serial;

    this.dialogConfirmar.afterOpened().subscribe( s =>{
      document.getElementById("divRegistrosBoginxSaco")?.classList.add("disabled");
    });
    
    this.dialogConfirmar.beforeClosed().subscribe( s =>{

      document.getElementById("divRegistrosBoginxSaco")?.classList.remove("disabled");
      if(this.dialogConfirmar.componentInstance._Respuesta != null)
      {
        let _json = this.dialogConfirmar.componentInstance._Respuesta;
        this.toastService.show(_json["msj"]["Mensaje"], { classname: 'bg-Success text-light', delay: 10000 });
        
        if(_json["esError"] == 0)
        {
          row.Activo = _json["d"].Activo;
          row.Usuario = this.LoginService.str_user;
        } 

      }
      
    });*/

    }

    if(evento == "Cerrar")
    {
      
  

    let Saco : ClsSacoEstado = new ClsSacoEstado();

    Saco.Corte = row.Corte;
    Saco.CorteCompleto = row.CorteCompleto;
    Saco.Mesa = row.NoMesa;
    Saco.Seccion = row.Seccion;
    Saco.Saco = row.Saco;
    Saco.Estado = evento;
    Saco.Login = this.LoginService.str_user;


    this.BundleBoxingSacoService.Saco(Saco).subscribe( s => {


      let _json = JSON.parse(s)

      if(_json["esError"] == 0){

        row.Abierto = false;
        row.IdUsuarioAbre = 0;
        row.UsuarioAbre = "";

      }
      else{


        this.dialog.open(DialogoComponent, {
          data: _json["msj"],
        });

      }
      

    });


    }



    if(evento == "Imprimir")
    {
      let reporte : IReporte = new IReporte();
      let ISaco : ISacoSerial = new ISacoSerial();

      ISaco.Serial = row.Serial;
      ISaco.NoMesa = row.NoMesa;
      ISaco.Corte = row.Corte;
      ISaco.Saco = row.Saco;

      
      reporte.Rdlc = "SerialSaco.rdlc"
      reporte.json = ISaco;

      this.ReportViewerService.change.emit(["Imprimir",  reporte]);
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
    this.str_from = "BundleBoxingSaco";
    this.LLenarTabla();
  }

}
