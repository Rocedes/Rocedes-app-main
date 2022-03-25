import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, Sort } from '@angular/material/sort';
import { map, Observable, startWith } from 'rxjs';
import { Validacion } from 'src/app/main/shared/class/Validacion/validacion';
import { DialogoComponent } from 'src/app/main/shared/dialogo/dialogo.component';
import { LoginService } from 'src/app/main/sis/service/login.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatPaginator } from '@angular/material/paginator';
import { IUsuarioPerfil } from 'src/app/main/sis/interface/i-UsuarioPerfil';
import { MatTableDataSource } from '@angular/material/table';

export interface IUsuario {
  Login: string;
  Nombre : string;
}

let ELEMENT_DATA_PERFIL : IUsuarioPerfil[] = []

@Component({
  selector: 'app-acceso-link',
  templateUrl: './acceso-link.component.html',
  styleUrls: ['./acceso-link.component.css']
})
export class AccesoLinkComponent implements OnInit {


  public val = new Validacion();
  public str_frm : string = "";
  public str_Nombre : string = "";
  public str_Login : string = "";

  

  optionUsuario : IUsuario[] = [];
  filteredOptions!: Observable<IUsuario[]>;


    
  @ViewChild(MatPaginator, {static: false})
  set paginator(value: MatPaginator) {
    if (this.dataSourceLink){
      this.dataSourceLink.paginator = value;
      if(this.dataSourceLink.paginator != null)this.dataSourceLink.paginator._intl.getRangeLabel = this.getRangeDisplayText;
    }
  }

  @ViewChild(MatSort, {static: false})
  set sort(sort: MatSort) {
     this.dataSourceLink.sort = sort;
  }

  
  displayedColumns: string[] = ["EsMenu", "NombreEsquema", "NombreLink", "Activo"];
  dataSourceLink = new MatTableDataSource(ELEMENT_DATA_PERFIL);
  clickedRows = new Set<IUsuarioPerfil>();

  constructor(private dialog : MatDialog, private _LoginService : LoginService,
    private _liveAnnouncer: LiveAnnouncer) {

    this.val.add("txt_SIS_AccesoUsuario", "1", "LEN>", "0");
    this.Limpiar();
   }



   public Limpiar() : void
   {
     this.str_frm = "";
     this.str_Nombre = "";
     this.str_Login = "";
     this.val.ValForm.get("txt_SIS_AccesoUsuario")?.setValue("");
   }

   private LlenarPerfil() : void
   {

    ELEMENT_DATA_PERFIL.splice(0, ELEMENT_DATA_PERFIL.length);

    ELEMENT_DATA_PERFIL = this._LoginService.Perfiles();

    this.dataSourceLink = new MatTableDataSource(ELEMENT_DATA_PERFIL);

   }

//#region FORMULARIO SELECCION

txt_SIS_AccesoUsuario_onKeyEnter(event: any){
    

  let _input : string = event.target.id;
  

  if(event.target.value == "") {
    document?.getElementById(_input)?.focus();
    event.preventDefault();
    return;
  }



  
  let _Opcion : any = this.val.ValForm.get("txt_SIS_AccesoUsuario")?.value;

  if( typeof(_Opcion) == 'string' ) {

    _Opcion = this.optionUsuario.filter( f => f.Login == this.val.ValForm.get("txt_SIS_AccesoUsuario")?.value)[0]

    if(_Opcion == null){
      this.val.ValForm.get("txt_SIS_AccesoUsuario")?.setValue("");
      return;
    }
    
  }



  this.str_Login = _Opcion.Login;
  this.str_Nombre = _Opcion.Nombre;
  this.LlenarTabla();


  event.preventDefault();

}


	
txt_SIS_AccesoUsuario_onSearchChange(event : any) :void{

  this.optionUsuario.splice(0, this.optionUsuario.length);

  if(event.target.value == null) return;

  let value : string = event.target.value;

  if(value.length <= 2) return;



  
  this._LoginService.BuscarUsuario(value).subscribe( s => {
    let _json = JSON.parse(s);

    this.dialog.closeAll();

    if(_json["esError"] == 0){


      if(_json["count"] > 0){
        
        _json["d"].forEach(( f : IUsuario) => {
          this.optionUsuario.push(f);
        });

        this.filteredOptions = this.val.ValForm.valueChanges.pipe(
          startWith(''),
          map(value => (typeof value === 'string' ? value : value.Corte)),
          map(Corte => (Corte ? this._FiltroSeleccion(Corte) : this.optionUsuario.slice())),
        );
       
      }
     
    }else{
      this.dialog.open(DialogoComponent, {
        data: _json["msj"]
      })

    }

  });



}

MostrarUsuarioSelec(Registro: IUsuario): string {
  if(Registro == null) return "";
  return Registro.Login;
}

private _FiltroSeleccion(Login: string): IUsuario[] {
  const filterValue = Login.toLowerCase();
  return this.optionUsuario.filter(option => option.Login.toLowerCase().startsWith(filterValue));
}




//#endregion FORMULARIO SELECCION




    //#region EVENTOS TABLA

  LlenarTabla() : void
  {
      this.LlenarPerfil();
      
  
      this._LoginService.BuscarPerfiles(this.str_Login).subscribe( s =>{
  
        let _json = JSON.parse(s);
  
    
        if(_json["esError"] == 0)
        {
          if(_json["count"] > 0)
          {
          
    
            _json["d"].forEach((j : IUsuarioPerfil) => {
              let index = ELEMENT_DATA_PERFIL.findIndex( f => f.Esquema == j.Esquema && f.Link == j.Link)
              if(index > -1 && j.Activo) ELEMENT_DATA_PERFIL[index].Activo = true;
            });

            

          }
        }
        else
        {
          this.dialog.open(DialogoComponent, {
            data : _json["msj"]
          })
        }
  
        this.dataSourceLink.filter = "";
  
  
      });
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
    this.dataSourceLink.filter = filtro.trim().toLowerCase();
  }  
 

  Guardar(element : IUsuarioPerfil)
  {
    element.Activo = !element.Activo;

    this._LoginService.GuardarPerfil(element, this.str_Login).subscribe( s =>{

      let _json = JSON.parse(s);

      if(_json["esError"] != 0)
      {
        this.dialog.open(DialogoComponent, {
          data : _json["msj"]
        })
      }
                                 
    

    });

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

  

  ngOnInit(): void {

  }


}
