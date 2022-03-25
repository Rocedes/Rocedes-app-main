import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { FoleoDatosService } from 'src/app/main/Prm/service/foleo-datos.service';
import { IFoleoDatos } from '../../../interface/i-Foleo-Datos';




let ELEMENT_DATA_FOLEO_DATOS : IFoleoDatos[] = [];

@Component({
  selector: 'app-foleo-datos',
  templateUrl: './foleo-datos.component.html',
  styleUrls: ['./foleo-datos.component.css']
})
export class FoleoDatosComponent implements OnInit {


  displayedColumns: string[] = ["Guardar", "Estilo",  "Pieza_grande", "Pieza_pequena",  "Shell", "Pieza_doble", "Eliminar"];
  dataSourceDatosFoleo = new MatTableDataSource(ELEMENT_DATA_FOLEO_DATOS);
  clickedRowsDatos = new Set<IFoleoDatos>();

 
  @ViewChild(MatPaginator, {static: false})
  set paginator(value: MatPaginator) {
    if (this.dataSourceDatosFoleo){
      this.dataSourceDatosFoleo.paginator = value;
      if(this.dataSourceDatosFoleo.paginator != null)this.dataSourceDatosFoleo.paginator._intl.getRangeLabel = this.getRangeDisplayText;
    }
  }
  @ViewChild(MatSort, {static: false})
  set sort(sort: MatSort) {
     this.dataSourceDatosFoleo.sort = sort;
  }
  
  
  constructor(private _liveAnnouncer: LiveAnnouncer, private dialog : MatDialog, private _FoleoDatosService : FoleoDatosService) { }




  
  LLenarTabla() : void
  {
    ELEMENT_DATA_FOLEO_DATOS.splice(0, ELEMENT_DATA_FOLEO_DATOS.length);
    this.dataSourceDatosFoleo.data.splice(0, this.dataSourceDatosFoleo.data.length);



    this._FoleoDatosService.Get().subscribe( s =>{

      let _json = JSON.parse(s);

  
      if(_json["esError"] == 0)
      {
        if(_json["count"] > 0)
        {

          _json["d"].forEach((j : IFoleoDatos) => {
            ELEMENT_DATA_FOLEO_DATOS.push(j);
          });
        }
      }
      else
      {
        this.dialog.open(DialogoComponent, {
          data : _json["msj"]
        })
      }
  
      this.dataSourceDatosFoleo = new MatTableDataSource(ELEMENT_DATA_FOLEO_DATOS);


    
    });

  }

  Limpiar() : void
  {
    
    ELEMENT_DATA_FOLEO_DATOS.splice(0, ELEMENT_DATA_FOLEO_DATOS.length);
    this.dataSourceDatosFoleo = new MatTableDataSource(ELEMENT_DATA_FOLEO_DATOS);

  }


  AgregarFila() : void
  {
    
    if(this.dataSourceDatosFoleo.data.length > 0)
    {

      let index = this.dataSourceDatosFoleo.data.findIndex( f => f.IdFoleoDato == -1)

      if(index == -1)
      {
        let Fila : IFoleoDatos = {} as IFoleoDatos;
        Fila.IdFoleoDato = -1;
        Fila.Estilo = "";
        Fila.Pieza_pequena = 0;
        Fila.Pieza_grande = 0;
        Fila.Pieza_doble = 0;
       
  
        this.dataSourceDatosFoleo.data.push(Fila);
        let cloned = this.dataSourceDatosFoleo.data.slice()
        this.dataSourceDatosFoleo.data = cloned;
        this.dataSourceDatosFoleo.filter = "";
  
        this.dataSourceDatosFoleo.paginator?.lastPage();
      }
      else
      {
  
        this.dialog.open(DialogoComponent, {
          data: "<p>Por favor guarde la nueva fila</p>"
        })

      }

    }
    else
    {
      this.dialog.open(DialogoComponent, {
        data: "<p>Factores de corte vacio.</p>"
      })
    }

    
  }


    //#region EVENTOS TABLA


  announceSortChangeDetalle(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  filtrar(event: Event) {
    const filtro = (event.target as HTMLInputElement).value;
    this.dataSourceDatosFoleo.filter = filtro.trim().toLowerCase();
  }  
 

  
  clickRow(row : any, str_Evento : string){

    if(str_Evento == "Guardar")
    {
      this._FoleoDatosService.Guardar(row).subscribe( s =>{

        let _json = JSON.parse(s);

        if(_json["count"] > 0) row.IdFoleoDato = _json["d"].IdFoleoDato;
        this.dialog.open(DialogoComponent, {
          data : _json["msj"]
        })
  
      });
    }

    else
    {
      this._FoleoDatosService.EliminarDetalle(row.IdFoleoDato).subscribe( s =>{

        let _json = JSON.parse(s);
              
        
        this.dialog.open(DialogoComponent, {
          data : _json["msj"]
        })
  
      });
    }
    
  }


  Calcular(element : IFoleoDatos) : Number{
    let total :number =  Number(element.Pieza_grande) + Number(element.Pieza_pequena);

    return total;
  }

  
  getRangeDisplayText = (page: number, pageSize: number, length: number) => {
    const initialText = `Procesos`;  // customize this line
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


        
  sTyleHeader(worksheet : any, cel : string[], line : number) : void
  {
    cel.forEach((c : string) => {
      worksheet.getCell(c + line).font = {
        name: 'Arial BlackS',
        family: 2,
        size: 11,
        underline: false,
        italic: false,
        bold: true,
        color: { argb: 'FFFFFF' }
      };
  
      worksheet.getCell(c + line).fill = {
        type: 'pattern',
        pattern:'solid',
        fgColor:{argb:'006699'},
      };
  
  
  
      worksheet.getCell(c + line).alignment = { vertical: 'middle', horizontal: 'center' };
    });

    
  }
  


  ngOnInit(): void {
   this.Limpiar();
    this.LLenarTabla();
  }
}
