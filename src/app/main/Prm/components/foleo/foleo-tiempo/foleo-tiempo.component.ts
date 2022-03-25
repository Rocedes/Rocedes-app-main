import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Workbook } from 'exceljs';
import { map, Observable, startWith } from 'rxjs';
import { ImagenLogo } from 'src/app/main/shared/Base64/logo';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { FactorFoleoService } from 'src/app/main/Prm/service/factor-foleo.service';
import { FoleoDatosService } from 'src/app/main/Prm/service/foleo-datos.service';
import * as fs from 'file-saver';
import { DatePipe } from '@angular/common';
import { IFoleoDatos } from '../../../interface/i-Foleo-Datos';
import { IFactorFoleo } from '../../../interface/i-Factor-Foleo';

let ELEMENT_DATA_FACTOR_FOLEO : IFactorFoleo[] = [];
let ELEMENT_DATA_FACTOR_FOLEO_EXCEL : IFactorFoleoExcel[] = []

export interface IFactorFoleoExcel {
  Index: number;
  Proceso : string;
  Minutos : number;
  Id: number;
}


@Component({
  selector: 'app-foleo-tiempo',
  templateUrl: './foleo-tiempo.component.html',
  styleUrls: ['./foleo-tiempo.component.css']
})
export class FoleoTiempoComponent implements OnInit {

  public val = new Validacion();

  public FechaInicio : Date | undefined;
  public FechaFinal : Date | undefined;
  public num_Minutos : number = 0;
  public num_Horas : number = 0;
  public DatosFoleo : IFoleoDatos = {} as IFoleoDatos;

  public Open : boolean = false;

  public Link : string = "";
  public str_Titulo_Tiempo : string = "";
  public str_Capa : string = "";
  public str_Estilo : string = "";



  displayedColumns: string[] = ["IdProcesoFoleo", "Proceso",  "Minutos"];
  dataSourceFactorFoleo = new MatTableDataSource(ELEMENT_DATA_FACTOR_FOLEO);
  clickedRows = new Set<IFactorFoleo>();

 
  @ViewChild(MatPaginator, {static: false})
  set paginator(value: MatPaginator) {
    if (this.dataSourceFactorFoleo){
      this.dataSourceFactorFoleo.paginator = value;
      if(this.dataSourceFactorFoleo.paginator != null)this.dataSourceFactorFoleo.paginator._intl.getRangeLabel = this.getRangeDisplayText;
    }
  }

  
  @ViewChild(MatSort, {static: false})
  set sort(sort: MatSort) {
     this.dataSourceFactorFoleo.sort = sort;
  }
  
  



  constructor(private dialog : MatDialog, private _FactorFoleoService : FactorFoleoService, private _FoleoDatosService : FoleoDatosService,
    private _liveAnnouncer: LiveAnnouncer) { 

    this.val.add("txt_foleo_Estilo", "1", "LEN>", "0");
    this.val.add("txt_Foleo_Cant_Bulto", "1", "NUM>", "0");
    this.val.add("txt_Foleo_Cant_Capas", "1", "NUM>", "0");
    this.val.add("txt_Foleo_Cant_Personas_Pieza_Pequeña", "1", "NUM>", "0");
    this.val.add("txt_Foleo_Cant_Personas_Pieza_Grande", "1", "NUM>", "0");
    this.val.add("txt_Foleo_Cant_Grande", "1", "LEN>=", "0");
    this.val.add("txt_Foleo_Cant_Pequeña", "1", "LEN>=", "0");
    this.val.add("txt_Foleo_Cant_Pieza_Doble", "1", "LEN>=", "0");
    this.val.add("txt_Foleo_Cant_Pieza", "1", "LEN>=", "0");
    this.val.add("txt_Factor_Tiempo_Fecha", "1", "LEN>=", "0");
    this.val.add("txt_Factor_TiempoFinal", "1", "LEN>=", "0");

    
    
  }

  private Limpiar() : void
  {
    this.str_Estilo = "";
    this.num_Horas = 0;
    this.num_Minutos = 0;
    this.FechaInicio = undefined;
    this.FechaFinal = undefined;
   
    this.val.ValForm.reset();



    this.val.ValForm.get("txt_foleo_Estilo")?.setValue("");
    this.val.ValForm.get("txt_Foleo_Cant_Bulto")?.setValue("");
    this.val.ValForm.get("txt_Foleo_Cant_Capas")?.setValue("");
    this.val.ValForm.get("txt_Foleo_Cant_Personas_Pieza_Pequeña")?.setValue("");
    this.val.ValForm.get("txt_Foleo_Cant_Personas_Pieza_Grande")?.setValue("");
    this.val.ValForm.get("txt_Foleo_Cant_Grande")?.setValue("");
    this.val.ValForm.get("txt_Foleo_Cant_Pequeña")?.setValue("");
    this.val.ValForm.get("txt_Foleo_Cant_Pieza_Doble")?.setValue("");
    this.val.ValForm.get("txt_Foleo_Cant_Pieza")?.setValue("");
    this.val.ValForm.get("txt_Factor_Tiempo_Fecha")?.setValue("");
    this.val.ValForm.get("txt_Factor_TiempoFinal")?.setValue("");


    this.val.ValForm.get("txt_Foleo_Cant_Grande")?.disable();
    this.val.ValForm.get("txt_Foleo_Cant_Pequeña")?.disable();
    this.val.ValForm.get("txt_Foleo_Cant_Pieza_Doble")?.disable();
    this.val.ValForm.get("txt_Foleo_Cant_Pieza")?.disable();
    this.val.ValForm.get("txt_Factor_TiempoFinal")?.disable();
    


    
    
  
  }


  public Cerrar() : void
  {
    this.Open = false;
  }




  onKeyEnter(event: any){
    

    let _input : string = event.target.id;
    

    if(event.target.value == "") {
      document?.getElementById(_input)?.focus();
      event.preventDefault();
      return;
    }


    switch(_input){

      case "txt_foleo_Estilo":
        document?.getElementById("txt_Foleo_Cant_Bulto")?.focus();
        break;

      case "txt_Foleo_Cant_Bulto":
        document?.getElementById("txt_Foleo_Cant_Capas")?.focus();
      break;

      case "txt_Foleo_Cant_Capas":
        document?.getElementById("txt_Foleo_Cant_Personas_Pieza_Pequeña")?.focus();
      break;

      case "txt_Foleo_Cant_Personas_Pieza_Pequeña":
          document?.getElementById("txt_Foleo_Cant_Personas_Pieza_Grande")?.focus();
      break;

      case "txt_Foleo_Cant_Personas_Pieza_Grande":
        document?.getElementById("txt_Factor_Tiempo_Fecha")?.focus();
      break;


       
    }
    

    this.calcularMinutos();

    event.preventDefault();

  }



  
  
  //#region AUTO COMPLETADO COMPONENTE
	
  optionSeleccion : IFoleoDatos[] = [];
  filteredOptions!: Observable<IFoleoDatos[]>;

  txt_Foleo_Estilo_onSearchChange(event : any) :void{

  this.optionSeleccion.splice(0, this.optionSeleccion.length);

  let value : string = event.target.value;


  if(value.length <= 2) return;



  this._FoleoDatosService.GetEstilo(value).subscribe( s => {
    let _json = JSON.parse(s);


    if(_json["esError"] == 0){


      if(_json["count"] > 0){
        
        _json["d"].forEach((j : IFoleoDatos) => {
          this.optionSeleccion.push(j);
        });

        this.filteredOptions = this.val.ValForm.valueChanges.pipe(
          startWith(''),
          map(value => (typeof value === 'string' ? value : value.Componente)),
          map(Componente => (Componente ? this._FiltroSeleccion(Componente) : this.optionSeleccion.slice())),
        );
       
      }
     
    }else{
      this.dialog.open(DialogoComponent, {
        data: _json["msj"]
      })



    }

  });



}





MostrarSelec(Registro: IFoleoDatos): string {
  if(Registro == null) return "";
  return Registro.Estilo;
}

private _FiltroSeleccion(Componente: string): IFoleoDatos[] {
  const filterValue = Componente.toLowerCase();
  
  return this.optionSeleccion.filter(option => option.Estilo.toLowerCase().startsWith(filterValue));
}






//#endregion AUTO COMPLETADO COMPONENTE




//#region EVENTOS TABLA




LLenarTabla() : void
{

  ELEMENT_DATA_FACTOR_FOLEO.splice(0, ELEMENT_DATA_FACTOR_FOLEO.length);
  this.dataSourceFactorFoleo.data.splice(0, this.dataSourceFactorFoleo.data.length);

  this._FactorFoleoService.Get().subscribe( s =>{

    let _json = JSON.parse(s);


    if(_json["esError"] == 0)
    {
      if(_json["count"] > 0)
      {
        _json["d"].forEach((j : IFactorFoleo) => {

          j.TotalFactor = j.Factor1 + j.Factor2 + j.Factor3;

          if(this.str_Capa == "Sencilla" && (j.Orden != 11  && j.Orden != 12 && j.Orden != 13))
          {
            ELEMENT_DATA_FACTOR_FOLEO.push(j);
          }
      
          if(this.str_Capa == "Doble" && (j.Orden != 14  && j.Orden != 15))
          {
            ELEMENT_DATA_FACTOR_FOLEO.push(j);
          }

          
        });
      }
    }
    else
    {
      this.dialog.open(DialogoComponent, {
        data : _json["msj"]
      })
    }

    this.dataSourceFactorFoleo = new MatTableDataSource(ELEMENT_DATA_FACTOR_FOLEO);


  });
}


public calcularMinutos() : number
{
  let _Opcion : any = this.val.ValForm.get("txt_foleo_Estilo")?.value;

  if( typeof(_Opcion) == 'string' ) {

    _Opcion = this.optionSeleccion.filter( f => f.Estilo == this.val.ValForm.get("txt_foleo_Estilo")?.value)[0]

    if(_Opcion == null){
      this.val.ValForm.get("txt_foleo_Estilo")?.setValue("");
      return 0;
    }
    
  }

  if(this.val.ValForm.invalid) return 0;

  this.str_Estilo = _Opcion.Estilo;
  let Cant_Bulto : number = Number(this.val.ValForm.get("txt_Foleo_Cant_Bulto")?.value);
  let Cant_Capas : number = Number(this.val.ValForm.get("txt_Foleo_Cant_Capas")?.value);
  let Cant_Personas_Partes_Grande : number = Number(this.val.ValForm.get("txt_Foleo_Cant_Personas_Pieza_Grande")?.value);
  let Cant_Personas_Partes_Pequeña : number = Number(this.val.ValForm.get("txt_Foleo_Cant_Personas_Pieza_Pequeña")?.value);




  let Partes_Grandes : number = Number(_Opcion.Pieza_grande);
  let Partes_Pequeñas : number =  Number(_Opcion.Pieza_pequena);
  let Partes_Pieza : number = Number(_Opcion.Shell);
  let Cant_Pieza_Doble : number = Number(_Opcion.Pieza_doble);





  this.val.ValForm.get("txt_Foleo_Cant_Pieza")?.setValue(Partes_Pieza);
  this.val.ValForm.get("txt_Foleo_Cant_Grande")?.setValue(Partes_Grandes);
  this.val.ValForm.get("txt_Foleo_Cant_Pequeña")?.setValue(Partes_Pequeñas);
  this.val.ValForm.get("txt_Foleo_Cant_Pieza_Doble")?.setValue(Cant_Pieza_Doble);




 let TotalMinutos : number = 0;


 this.dataSourceFactorFoleo.data.forEach((d : IFactorFoleo) => {
   d.TotalFactor = d.Factor1 + d.Factor2 + d.Factor3;
   d.Minutos = 0;

   switch(d.Orden)
   {
     case 1:
       d.Minutos = d.TotalFactor;
       break;
      
      case 2:
        d.Minutos = d.TotalFactor;
        break;

      case 3:
        d.Minutos = d.TotalFactor;
        break;

      case 4:
        d.Minutos = d.Factor1 + (d.Factor2 * Partes_Pieza);
        d.Minutos += d.Factor3;
        break;

      case 5:
        d.Minutos = (d.TotalFactor * Partes_Pieza * Cant_Bulto) / (Cant_Personas_Partes_Grande + Cant_Personas_Partes_Pequeña);
        break;

      case 6:
        d.Minutos = d.TotalFactor / (Partes_Pequeñas + Cant_Personas_Partes_Pequeña);
        break;

      case 7:
        d.Minutos = d.TotalFactor / (Cant_Personas_Partes_Grande + Cant_Personas_Partes_Pequeña);
        break;

      case 8:
        d.Minutos = (d.TotalFactor / 2500) / (Cant_Personas_Partes_Grande + Cant_Personas_Partes_Pequeña);
        break;

      case 9:
        d.Minutos = d.TotalFactor / (Cant_Personas_Partes_Grande + Cant_Personas_Partes_Pequeña);
        break;

      case 10:
        d.Minutos = (d.TotalFactor * Partes_Pieza * Cant_Bulto) / (Cant_Personas_Partes_Grande + Cant_Personas_Partes_Pequeña);
        break;


      //DOBLE
      case 11:
        if(this.str_Capa == "Doble")
        {
          d.Minutos = d.TotalFactor * Cant_Pieza_Doble;
        }
        else
        {
          d.TotalFactor = 0;
        }
        break;

      case 12:
        if(this.str_Capa == "Doble") d.Minutos = (d.TotalFactor * Partes_Grandes * Cant_Capas  * Cant_Bulto) / Cant_Personas_Partes_Grande;
        break;

      case 13:
        if(this.str_Capa == "Doble") d.Minutos = (d.TotalFactor * Partes_Pequeñas * Cant_Capas * Cant_Bulto) / Cant_Personas_Partes_Pequeña;
        break;

      //SENCILLA

      case 14:
        if(this.str_Capa == "Sencilla") d.Minutos = (d.TotalFactor * Partes_Grandes * Cant_Capas * Cant_Bulto) / Cant_Personas_Partes_Grande;
        break;

      case 15:
        if(this.str_Capa == "Sencilla") d.Minutos = (d.TotalFactor * Partes_Pequeñas * Cant_Capas * Cant_Bulto) / Cant_Personas_Partes_Pequeña;
        break;

      case 16:
        d.Minutos = (d.TotalFactor * Cant_Pieza_Doble * Cant_Bulto) / (Cant_Personas_Partes_Grande + Cant_Personas_Partes_Pequeña);
        break;

      case 17:
        d.Minutos = (d.TotalFactor * Partes_Pieza * Cant_Bulto) / (Cant_Personas_Partes_Grande + Cant_Personas_Partes_Pequeña);
        break

      case 18:
        d.Minutos = (d.Factor1 / Cant_Bulto) + ((d.Factor2 / Cant_Bulto) / 3);
        break

      case 19:
        d.Minutos = d.TotalFactor;
        break;

      case 20:
        d.Minutos = d.TotalFactor / (Cant_Personas_Partes_Grande + Cant_Personas_Partes_Pequeña);
        break;

      case 21:
        d.Minutos = (d.TotalFactor / 200) / (Cant_Personas_Partes_Grande + Cant_Personas_Partes_Pequeña);
        break;

      case 22:
        d.Minutos = (d.TotalFactor * Partes_Pieza * Cant_Bulto) / (Cant_Personas_Partes_Grande + Cant_Personas_Partes_Pequeña);
        break;

      case 23:
        d.Minutos = (d.TotalFactor * Partes_Pieza * Cant_Bulto) / (Cant_Personas_Partes_Grande + Cant_Personas_Partes_Pequeña);
        break;
        
   }


   TotalMinutos += d.Minutos;
 });

 let index = this.dataSourceFactorFoleo.data.findIndex(f => f.IdProcesoFoleo == -1);

 if(index != -1) this.dataSourceFactorFoleo.data.splice(index, this.dataSourceFactorFoleo.data.length)

 
 let RegistroTotal: IFactorFoleo = {} as IFactorFoleo;



 RegistroTotal.IdProcesoFoleo = -1;
 RegistroTotal.Proceso = "TOTAL";
 RegistroTotal.TotalFactor = 0;
 RegistroTotal.Minutos = TotalMinutos
 this.dataSourceFactorFoleo.data.push(RegistroTotal);



  let fecha : string = String(this.FechaInicio?.toString());

  var currentDate = new Date(fecha);
  this.FechaFinal = new Date(currentDate.getTime() + TotalMinutos*60000);
  this.num_Minutos = Number(TotalMinutos.toFixed(4));
  this.num_Horas = Number((this.num_Minutos/60).toFixed(4));

  return this.num_Minutos;
}



   announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  filtrar(event: Event) {
    const filtro = (event.target as HTMLInputElement).value;
    this.dataSourceFactorFoleo.filter = filtro.trim().toLowerCase();
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
  
  
      
    sTyleLine(worksheet : any, cel : string[], line : number) : void
    {
      cel.forEach((c : string) => {
        worksheet.getCell(c + line).font = {
          name: 'Arial BlackS',
          family: 2,
          size: 11,
          underline: false,
          italic: false,
          bold: true,
          color: { argb: '000000' }
        };
    
  
      });
  
      
    }
  
  
    
    exportar(): void {
  
  
      ELEMENT_DATA_FACTOR_FOLEO_EXCEL.splice(0, ELEMENT_DATA_FACTOR_FOLEO_EXCEL.length);
  
      
      let i : number = 1;
      this.dataSourceFactorFoleo.data.forEach( f =>{
  
        let excel : IFactorFoleoExcel = {} as IFactorFoleoExcel;
        excel.Index = i;
        excel.Proceso = f.Proceso;
        excel.Minutos = f.Minutos;
        excel.Id = f.IdProcesoFoleo;
  
        ELEMENT_DATA_FACTOR_FOLEO_EXCEL.push(excel);
        i+=1;
  
      });
  
  
     //create new excel work book
    let workbook = new Workbook();
  
    //add name to sheet
    let worksheet = workbook.addWorksheet(this.str_Titulo_Tiempo);
  
    //add column name
    let header=["NO",  "PROCESO", "TIEMPO"]
   
  
   
  
    var Imagen = (new ImagenLogo()).Logo();
  
    var imageId1 = workbook.addImage({ 
       base64: Imagen,
       extension: 'png',
    });
    
    worksheet.mergeCells("A2:A4")  
    worksheet.addImage(imageId1, "A2:A4");
    worksheet.getCell("A2:A4").fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor:{argb:'1C394F'},
    };

  
  
    worksheet.mergeCells("B2:C4")
    const Fila_Titulo = worksheet.getCell("B2:C4");
    Fila_Titulo!.value = this.str_Titulo_Tiempo
    Fila_Titulo.alignment = { vertical: 'middle', horizontal: 'center' };
    Fila_Titulo.font = {
      name: 'Arial BlackS',
      family: 2,
      size: 18,
      underline: false,
      italic: false,
      bold: true,
      color: { argb: 'FFFFFF' }
    };
  
    Fila_Titulo.fill = {
      type: 'pattern',
      pattern:'solid',
      fgColor:{argb:'1C394F'},
    };


    var datePipe = new DatePipe("en-GB");

    worksheet.addRow([]);
    let FILA_EXCEL = worksheet.getCell("B6");
    FILA_EXCEL!.value = "ESTILO";
    FILA_EXCEL = worksheet.getCell("C6");
    FILA_EXCEL!.value = this.str_Estilo;

    worksheet.addRow([]);
    FILA_EXCEL = worksheet.getCell("B7");
    FILA_EXCEL!.value = "CANTIIDAD DE PARTES  POR PIEZA";
    FILA_EXCEL = worksheet.getCell("C7");
    FILA_EXCEL!.value = Number(this.val.ValForm.get("txt_Foleo_Cant_Pieza")?.value);


    worksheet.addRow([]);
    FILA_EXCEL = worksheet.getCell("B8");
    FILA_EXCEL!.value = "CANTIDAD DE PARTES GRANDES";
    FILA_EXCEL = worksheet.getCell("C8");
    FILA_EXCEL!.value = Number(this.val.ValForm.get("txt_Foleo_Cant_Grande")?.value);

    worksheet.addRow([]);
    FILA_EXCEL = worksheet.getCell("B9");
    FILA_EXCEL!.value = "CANTIDAD DE PARTES PEQUEÑAS";
    FILA_EXCEL = worksheet.getCell("C9");
    FILA_EXCEL!.value = Number(this.val.ValForm.get("txt_Foleo_Cant_Pequeña")?.value);

    worksheet.addRow([]);
    FILA_EXCEL = worksheet.getCell("B10");
    FILA_EXCEL!.value = "CANTIDAD DE BULTOS";
    FILA_EXCEL = worksheet.getCell("C10");
    FILA_EXCEL!.value = Number(this.val.ValForm.get("txt_Foleo_Cant_Bulto")?.value);

    worksheet.addRow([]);
    FILA_EXCEL = worksheet.getCell("B11");
    FILA_EXCEL!.value = "CANTIDAD DE CAPAS";
    FILA_EXCEL = worksheet.getCell("C11");
    FILA_EXCEL!.value = Number(this.val.ValForm.get("txt_Foleo_Cant_Capas")?.value);

    worksheet.addRow([]);
    FILA_EXCEL = worksheet.getCell("B12");
    FILA_EXCEL!.value = "CANTIDAD DE PIEZAS DOBLES";
    FILA_EXCEL = worksheet.getCell("C12");
    FILA_EXCEL!.value = Number(this.val.ValForm.get("txt_Foleo_Cant_Pieza_Doble")?.value);

    worksheet.addRow([]);
    FILA_EXCEL = worksheet.getCell("B13");
    FILA_EXCEL!.value = "CANTIDAD DE PERSONAS EN PARTES PEQUEÑAS";
    FILA_EXCEL = worksheet.getCell("C13");
    FILA_EXCEL!.value = Number(this.val.ValForm.get("txt_Foleo_Cant_Personas_Pieza_Pequeña")?.value);

    worksheet.addRow([]);
    FILA_EXCEL = worksheet.getCell("B14");
    FILA_EXCEL!.value = "CANTIDAD DE PERSONAS EN PARTES GRANDES";
    FILA_EXCEL = worksheet.getCell("C14");
    FILA_EXCEL!.value = Number(this.val.ValForm.get("txt_Foleo_Cant_Personas_Pieza_Grande")?.value);

    FILA_EXCEL = worksheet.getCell("B15");
    FILA_EXCEL!.value = "FECHA HORA INICIO";
    FILA_EXCEL = worksheet.getCell("C15");
    if(this.val.ValForm.get("txt_Factor_Tiempo_Fecha")?.value != undefined) FILA_EXCEL!.value = String(datePipe.transform(this.val.ValForm.get("txt_Factor_Tiempo_Fecha")?.value, 'dd/MM/yyyy hh:mm:ss'));

    FILA_EXCEL = worksheet.getCell("B16");
    FILA_EXCEL!.value = "FECHA HORA FINAL";
    FILA_EXCEL = worksheet.getCell("C16");
    if(this.val.ValForm.get("txt_Factor_TiempoFinal")?.value != "Invalid Date") FILA_EXCEL!.value = String(datePipe.transform(this.val.ValForm.get("txt_Factor_TiempoFinal")?.value, 'dd/MM/yyyy hh:mm:ss'));


    console.log(this.val.ValForm.get("txt_Factor_TiempoFinal")?.value )
    let int_Linea = 18;
    worksheet.addRow([]);
    worksheet.addRow(header);
    this.sTyleHeader(worksheet, ["A", "B", "C"],  int_Linea)
  
    
    worksheet.getCell("A" + int_Linea).alignment = { vertical: 'middle', horizontal: 'center' };

  
  
    for (let i = 0; i < ELEMENT_DATA_FACTOR_FOLEO_EXCEL.length; i++)
    {
     
      let x2  = Object.values(ELEMENT_DATA_FACTOR_FOLEO_EXCEL[i]);
      let temp=[]
      for(let y = 0; y < x2.length; y++)
      {
        temp.push(x2[y])
      }
      worksheet.addRow(temp)
      int_Linea ++;
  
  
      if(ELEMENT_DATA_FACTOR_FOLEO_EXCEL[i].Id == -1)
      {
        this.sTyleLine(worksheet, ["A", "B", "C"],  int_Linea)
      }
      
    }
  
    worksheet.spliceColumns(4, 1);
    worksheet.properties.defaultColWidth = 20;
  
  
    //set downloadable file name
      let fname="foleo-tiempo"
  
      //add data and file name and download
      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fs.saveAs(blob, fname+'-'+new Date().valueOf()+'.xlsx');
      });
  
  
    }
  

  ngOnInit(): void {

    
    if(this.Link == "LinkProcesoFoleoCapaSencilla"){
      this.str_Capa = "Sencilla";
      this.str_Titulo_Tiempo = "FOLEO (CAPA SENCILLA)";
      this.Limpiar();
      this.LLenarTabla();
    }


    if(this.Link == "LinkProcesoFoleoCapaDoble"){
      this.str_Capa = "Doble";
      this.str_Titulo_Tiempo = "FOLEO (CAPA DOBLE)";
      this.Limpiar();
      this.LLenarTabla();
    }


    
  }

}
